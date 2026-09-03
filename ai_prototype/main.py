from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

app = FastAPI(
    title="HealthOS-AI Prototype",
    version="0.1.0",
    description=(
        "Research prototype for an agentic healthcare navigation layer. "
        "Uses synthetic/demo data only and is not a clinical decision system."
    ),
)


class Patient(BaseModel):
    patient_id: str
    name: str
    conditions: List[str] = []
    medications: List[str] = []
    allergies: List[str] = []


class Appointment(BaseModel):
    appointment_id: str
    patient_id: str
    specialty: str
    provider: str
    location: str
    start_time: datetime
    status: str = "available"


class ChatRequest(BaseModel):
    patient_id: str
    message: str = Field(min_length=1, max_length=2000)


PATIENTS = {
    "KP-DEMO-1001": Patient(
        patient_id="KP-DEMO-1001",
        name="Ava Member",
        conditions=["hypertension"],
        medications=["lisinopril"],
        allergies=["penicillin"],
    )
}

APPOINTMENTS = [
    Appointment(
        appointment_id="A-1001",
        patient_id="KP-DEMO-1001",
        specialty="Primary Care",
        provider="Dr. Jordan Lee",
        location="Demo Medical Center",
        start_time=datetime(2026, 9, 8, 9, 30),
    ),
    Appointment(
        appointment_id="A-1002",
        patient_id="KP-DEMO-1001",
        specialty="Primary Care",
        provider="Dr. Taylor Morgan",
        location="Demo Medical Center",
        start_time=datetime(2026, 9, 9, 11, 0),
    ),
]


def route_intent(message: str) -> str:
    text = message.lower()
    if any(x in text for x in ["appointment", "doctor", "schedule", "visit"]):
        return "appointment"
    if any(x in text for x in ["medication", "medicine", "prescription", "refill"]):
        return "medication"
    if any(x in text for x in ["record", "lab", "test result", "history"]):
        return "medical_record"
    if any(x in text for x in ["screening", "vaccine", "preventive", "prevention"]):
        return "preventive_care"
    return "general_navigation"


def appointment_agent(patient_id: str) -> dict:
    options = sorted(
        [a for a in APPOINTMENTS if a.patient_id == patient_id and a.status == "available"],
        key=lambda a: a.start_time,
    )
    return {
        "agent": "appointment_agent",
        "options": [a.model_dump() for a in options],
        "message": "These are demo appointment options. Booking requires explicit confirmation."
        if options else "No demo appointments are currently available.",
    }


def medication_agent(patient: Patient) -> dict:
    return {
        "agent": "medication_agent",
        "medications": patient.medications,
        "message": "This prototype can summarize medications; medication changes must be handled through appropriate clinical/pharmacy workflows.",
    }


def record_agent(patient: Patient) -> dict:
    return {
        "agent": "medical_record_agent",
        "summary": {
            "conditions": patient.conditions,
            "medications": patient.medications,
            "allergies": patient.allergies,
        },
        "message": "This is a synthetic-record summary for demonstration only.",
    }


def preventive_agent(patient: Patient) -> dict:
    return {
        "agent": "preventive_care_agent",
        "recommendations": [
            "Review preventive-care eligibility with the care team.",
            "Use approved clinical guidelines and member-specific records before presenting personalized recommendations.",
        ],
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "healthos-ai-prototype"}


@app.get("/patients/{patient_id}")
def get_patient(patient_id: str):
    patient = PATIENTS.get(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@app.get("/agents/appointments/{patient_id}")
def appointments(patient_id: str):
    if patient_id not in PATIENTS:
        raise HTTPException(status_code=404, detail="Patient not found")
    return appointment_agent(patient_id)


@app.post("/ai/chat")
def ai_chat(request: ChatRequest):
    patient = PATIENTS.get(request.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    intent = route_intent(request.message)
    if intent == "appointment":
        result = appointment_agent(request.patient_id)
    elif intent == "medication":
        result = medication_agent(patient)
    elif intent == "medical_record":
        result = record_agent(patient)
    elif intent == "preventive_care":
        result = preventive_agent(patient)
    else:
        result = {
            "agent": "care_navigation_agent",
            "message": "I can help route appointment, medication, medical-record, and preventive-care requests in this prototype.",
        }

    return {
        "patient_id": request.patient_id,
        "intent": intent,
        "orchestrator": "healthos_ai_orchestrator",
        "result": result,
        "safety": {
            "synthetic_data_only": True,
            "clinical_decision_support": False,
            "human_oversight": True,
        },
    }
