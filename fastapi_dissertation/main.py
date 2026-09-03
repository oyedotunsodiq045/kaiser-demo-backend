from __future__ import annotations

from datetime import datetime, timedelta
from typing import Literal

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field
from sklearn.linear_model import LogisticRegression

app = FastAPI(
    title="HealthOS-AI Dissertation Prototype",
    version="0.1.0",
    description=(
        "Research prototype for a privacy-conscious, human-centered multi-agent "
        "healthcare navigation system using synthetic patient data."
    ),
)


class PatientContext(BaseModel):
    patient_id: str = "synthetic-001"
    age: int = 52
    chronic_conditions: list[str] = Field(default_factory=lambda: ["hypertension"])
    medications: list[str] = Field(default_factory=lambda: ["lisinopril"])
    recent_labs: dict[str, float] = Field(default_factory=lambda: {"a1c": 6.1, "ldl": 126})
    last_primary_care_days_ago: int = 210


class AgentRequest(BaseModel):
    message: str
    context: PatientContext = Field(default_factory=PatientContext)


class AgentResponse(BaseModel):
    route: str
    answer: str
    evidence: list[str]
    confidence: float
    requires_human_review: bool
    safety_note: str


class AppointmentRiskRequest(BaseModel):
    lead_days: int = 14
    prior_no_shows: int = 0
    reminder_confirmed: bool = True
    distance_miles: float = 8.0
    appointment_hour: int = 10


# Tiny synthetic training set for a transparent proof-of-concept no-show model.
_X = np.array(
    [
        [2, 0, 1, 3, 9], [30, 2, 0, 25, 8], [7, 0, 1, 6, 14],
        [45, 3, 0, 40, 16], [14, 1, 1, 12, 11], [21, 2, 0, 18, 15],
        [3, 0, 1, 2, 13], [60, 4, 0, 35, 8], [10, 1, 1, 7, 10],
        [35, 2, 0, 30, 17], [5, 0, 1, 5, 9], [28, 1, 0, 22, 16],
    ]
)
_y = np.array([0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1])
_NO_SHOW_MODEL = LogisticRegression(random_state=42).fit(_X, _y)


def retrieve_evidence(message: str, context: PatientContext) -> list[str]:
    """Simple deterministic retrieval layer standing in for a vector/FHIR RAG store."""
    msg = message.lower()
    evidence: list[str] = []

    if "med" in msg or "refill" in msg or "lisinopril" in msg:
        evidence.append(f"Active medications in synthetic record: {', '.join(context.medications)}")
    if "lab" in msg or "a1c" in msg or "ldl" in msg or "result" in msg:
        evidence.extend([f"{k.upper()}: {v}" for k, v in context.recent_labs.items()])
    if "appointment" in msg or "visit" in msg or "primary" in msg:
        evidence.append(f"Last primary-care encounter was {context.last_primary_care_days_ago} days ago")
    if context.chronic_conditions:
        evidence.append(f"Documented synthetic conditions: {', '.join(context.chronic_conditions)}")

    return evidence[:4] or ["No matching structured evidence found in the synthetic patient context"]


def orchestrate(message: str) -> Literal[
    "medical_record_agent", "medication_agent", "appointment_agent", "care_navigation_agent"
]:
    msg = message.lower()
    if any(token in msg for token in ["lab", "result", "record", "a1c", "ldl"]):
        return "medical_record_agent"
    if any(token in msg for token in ["medication", "medicine", "refill", "prescription"]):
        return "medication_agent"
    if any(token in msg for token in ["appointment", "schedule", "visit", "book"]):
        return "appointment_agent"
    return "care_navigation_agent"


def compose_answer(route: str, evidence: list[str]) -> tuple[str, float, bool]:
    joined = "; ".join(evidence)
    if route == "medical_record_agent":
        return (
            f"I found these items in the synthetic record: {joined}. "
            "This prototype explains stored information but does not diagnose or replace clinical review.",
            0.89,
            False,
        )
    if route == "medication_agent":
        return (
            f"Medication context retrieved: {joined}. A production system would verify refill eligibility, "
            "pharmacy status, interactions, and route exceptions to a pharmacist or clinician.",
            0.87,
            True,
        )
    if route == "appointment_agent":
        return (
            f"Scheduling context retrieved: {joined}. A production appointment agent would rank available "
            "slots by urgency, specialty fit, continuity, distance, and patient preference before requesting confirmation.",
            0.84,
            False,
        )
    return (
        f"Care-navigation context retrieved: {joined}. The prototype can suggest the next workflow, but any "
        "urgent or clinically ambiguous request should be escalated to a human care team.",
        0.78,
        True,
    )


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "healthos-ai-fastapi", "time": datetime.utcnow().isoformat()}


@app.post("/v1/agent/query", response_model=AgentResponse)
def agent_query(request: AgentRequest) -> AgentResponse:
    route = orchestrate(request.message)
    evidence = retrieve_evidence(request.message, request.context)
    answer, confidence, review = compose_answer(route, evidence)
    return AgentResponse(
        route=route,
        answer=answer,
        evidence=evidence,
        confidence=confidence,
        requires_human_review=review,
        safety_note="Research/demo use only. Synthetic data only. Not medical advice or a diagnostic system.",
    )


@app.post("/v1/models/no-show-risk")
def no_show_risk(request: AppointmentRiskRequest) -> dict:
    features = np.array([[
        request.lead_days,
        request.prior_no_shows,
        int(request.reminder_confirmed),
        request.distance_miles,
        request.appointment_hour,
    ]])
    probability = float(_NO_SHOW_MODEL.predict_proba(features)[0, 1])
    return {
        "no_show_probability": round(probability, 4),
        "risk_band": "high" if probability >= 0.65 else "medium" if probability >= 0.35 else "low",
        "recommended_intervention": (
            "Offer confirmation/rescheduling and human outreach" if probability >= 0.65
            else "Send adaptive reminder" if probability >= 0.35
            else "Standard reminder"
        ),
        "model_note": "Logistic-regression proof of concept trained on tiny synthetic data; not clinically validated.",
    }


@app.get("/v1/research/evaluation-plan")
def evaluation_plan() -> dict:
    return {
        "comparators": ["single-agent LLM", "RAG single agent", "multi-agent RAG with safety gates"],
        "metrics": {
            "task": ["task completion", "routing accuracy", "retrieval precision"],
            "safety": ["unsupported-claim rate", "escalation accuracy", "harmful-action rate"],
            "human_centered": ["trust calibration", "usability", "explanation usefulness"],
            "fairness": ["performance gap across demographic strata"],
            "operations": ["latency", "tool-call success", "cost per completed task"],
        },
        "study_phases": [
            "synthetic benchmark",
            "retrospective de-identified dataset evaluation when approved",
            "human-subject usability study after IRB approval",
        ],
    }
