from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal

import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(
    title="HealthOS-AI Research Prototype",
    version="0.1.0",
    description=(
        "A dissertation-oriented FastAPI prototype for trustworthy multi-agent "
        "healthcare navigation using synthetic patient data and grounded retrieval."
    ),
)


class PatientRecord(BaseModel):
    patient_id: str
    age: int = Field(ge=0, le=120)
    conditions: list[str] = []
    medications: list[str] = []
    allergies: list[str] = []
    recent_labs: dict[str, str] = {}
    preventive_care_due: list[str] = []
    upcoming_appointments: list[str] = []


class AgentRequest(BaseModel):
    patient_id: str
    query: str = Field(min_length=3, max_length=2000)


class AgentResponse(BaseModel):
    patient_id: str
    selected_agent: str
    answer: str
    evidence: list[str]
    confidence: float
    needs_human_review: bool
    safety_note: str
    generated_at: str


class NoShowRequest(BaseModel):
    lead_days: int = Field(ge=0, le=365)
    prior_no_shows: int = Field(ge=0, le=20)
    distance_miles: float = Field(ge=0, le=500)
    reminder_confirmed: bool


PATIENTS: dict[str, PatientRecord] = {
    "SYN-1001": PatientRecord(
        patient_id="SYN-1001",
        age=52,
        conditions=["hypertension", "type 2 diabetes"],
        medications=["metformin 500 mg twice daily", "lisinopril 10 mg daily"],
        allergies=["penicillin"],
        recent_labs={"A1C": "7.4%", "LDL": "118 mg/dL", "BP": "138/86 mmHg"},
        preventive_care_due=["annual eye exam", "influenza vaccine"],
        upcoming_appointments=["primary care follow-up in 21 days"],
    ),
    "SYN-1002": PatientRecord(
        patient_id="SYN-1002",
        age=34,
        conditions=["asthma"],
        medications=["albuterol inhaler as needed"],
        allergies=[],
        recent_labs={},
        preventive_care_due=["annual wellness visit"],
        upcoming_appointments=[],
    ),
}


KNOWLEDGE_BASE = [
    "A1C is a laboratory measure that estimates average blood glucose over roughly two to three months.",
    "Medication refill assistance should verify the medication, remaining supply, prescribing clinician, and pharmacy before a request is submitted.",
    "Patient-facing AI should not diagnose emergencies. Concerning or urgent symptoms should be escalated to an appropriate human or emergency pathway.",
    "Preventive-care recommendations should be generated from approved rules and patient context, then clearly distinguished from diagnosis or treatment advice.",
    "Appointment navigation can rank options using availability, specialty, location, continuity with prior providers, referral requirements, and patient preferences.",
    "Grounded retrieval can reduce unsupported generation by restricting responses to trusted patient records, clinical policies, and approved educational material.",
]

VECTORIZER = TfidfVectorizer(stop_words="english")
KB_MATRIX = VECTORIZER.fit_transform(KNOWLEDGE_BASE)


def retrieve(query: str, top_k: int = 3) -> tuple[list[str], float]:
    q = VECTORIZER.transform([query])
    scores = cosine_similarity(q, KB_MATRIX)[0]
    ranked = np.argsort(scores)[::-1][:top_k]
    evidence = [KNOWLEDGE_BASE[i] for i in ranked if scores[i] > 0]
    best = float(scores[ranked[0]]) if len(ranked) else 0.0
    return evidence, best


def route_agent(query: str) -> Literal[
    "medical_record_agent",
    "medication_agent",
    "appointment_agent",
    "preventive_care_agent",
    "care_navigation_agent",
]:
    q = query.lower()
    if any(k in q for k in ["lab", "a1c", "record", "result", "history"]):
        return "medical_record_agent"
    if any(k in q for k in ["medication", "medicine", "refill", "prescription"]):
        return "medication_agent"
    if any(k in q for k in ["appointment", "schedule", "provider", "visit"]):
        return "appointment_agent"
    if any(k in q for k in ["prevent", "vaccine", "screening", "wellness", "due"]):
        return "preventive_care_agent"
    return "care_navigation_agent"


def answer_for(agent: str, patient: PatientRecord, query: str, evidence: list[str]) -> str:
    if agent == "medical_record_agent":
        labs = ", ".join(f"{k}: {v}" for k, v in patient.recent_labs.items()) or "no recent labs in the demo record"
        return (
            f"For patient {patient.patient_id}, the demo record shows {labs}. "
            "I can explain what these terms generally mean using grounded educational evidence, "
            "but this prototype does not diagnose or determine treatment."
        )
    if agent == "medication_agent":
        meds = ", ".join(patient.medications) or "no medications listed"
        return (
            f"The synthetic record lists: {meds}. A medication workflow should confirm the exact medication, "
            "remaining supply, prescriber, and pharmacy before creating a refill task."
        )
    if agent == "appointment_agent":
        appts = ", ".join(patient.upcoming_appointments) or "no upcoming appointment"
        return (
            f"The demo record currently shows {appts}. A production appointment agent would rank available options "
            "using specialty fit, availability, location, continuity, referrals, and user preferences."
        )
    if agent == "preventive_care_agent":
        due = ", ".join(patient.preventive_care_due) or "nothing currently flagged"
        return (
            f"The synthetic rule-based demo flags: {due}. These are prototype reminders, not individualized medical advice."
        )
    return (
        "The care-navigation agent can route a request to the most appropriate workflow while preserving a human-escalation path. "
        f"Retrieved supporting items: {len(evidence)}."
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "healthos-ai-fastapi"}


@app.get("/patients/{patient_id}", response_model=PatientRecord)
def get_patient(patient_id: str) -> PatientRecord:
    patient = PATIENTS.get(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Synthetic patient not found")
    return patient


@app.post("/agent/query", response_model=AgentResponse)
def agent_query(request: AgentRequest) -> AgentResponse:
    patient = PATIENTS.get(request.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Synthetic patient not found")

    agent = route_agent(request.query)
    evidence, retrieval_score = retrieve(request.query)
    confidence = round(min(0.95, 0.55 + retrieval_score * 0.4), 3)
    human_review = confidence < 0.65 or any(
        word in request.query.lower()
        for word in ["chest pain", "suicide", "overdose", "can't breathe", "cannot breathe", "emergency"]
    )

    return AgentResponse(
        patient_id=request.patient_id,
        selected_agent=agent,
        answer=answer_for(agent, patient, request.query, evidence),
        evidence=evidence,
        confidence=confidence,
        needs_human_review=human_review,
        safety_note=(
            "Research prototype only. Uses synthetic/demo data and is not a diagnostic or treatment system. "
            "Urgent or consequential decisions require human review."
        ),
        generated_at=datetime.now(timezone.utc).isoformat(),
    )


@app.post("/models/no-show-risk")
def no_show_risk(request: NoShowRequest) -> dict[str, float | str]:
    # Transparent heuristic baseline for dissertation experimentation.
    score = 0.08
    score += min(request.prior_no_shows * 0.12, 0.48)
    score += min(request.lead_days / 365 * 0.18, 0.18)
    score += min(request.distance_miles / 500 * 0.12, 0.12)
    if request.reminder_confirmed:
        score -= 0.16
    probability = round(float(np.clip(score, 0.02, 0.95)), 3)
    band = "high" if probability >= 0.6 else "medium" if probability >= 0.3 else "low"
    return {
        "probability": probability,
        "risk_band": band,
        "model_type": "transparent heuristic baseline",
        "research_note": "Replace with trained and fairness-audited model during dissertation experiments.",
    }
