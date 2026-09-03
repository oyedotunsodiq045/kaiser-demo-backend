# HealthOS-AI FastAPI Prototype

This prototype adds a research-oriented Python/FastAPI AI orchestration layer to the existing Kaiser Permanente-style demo backend. The existing application is an Express/Mongoose demo and explicitly states that it is not affiliated with Kaiser Permanente and uses demo data. The new prototype is likewise synthetic/demo only.

## Run locally

```bash
cd ai_prototype
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open `http://localhost:8000/docs` for Swagger UI.

## Endpoints

- `GET /health`
- `GET /patients/{patient_id}`
- `GET /agents/appointments/{patient_id}`
- `POST /ai/chat`

Example request:

```json
{
  "patient_id": "KP-DEMO-1001",
  "message": "Find me an appointment with my doctor"
}
```

## Architecture

The prototype demonstrates an intent router/orchestrator with specialized agents for appointments, medications, medical records, and preventive care. It is intentionally deterministic and does not call an external LLM or clinical system. This makes it suitable as a safe foundation for adding RAG, ML models, FHIR data, and evaluation components later.

## Safety

- Synthetic data only.
- No diagnosis or treatment recommendations.
- Consequential actions require confirmation in a production design.
- Human oversight is required for clinical workflows.
