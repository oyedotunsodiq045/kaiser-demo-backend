# HealthOS-AI FastAPI Dissertation Prototype

This folder adds a Python/FastAPI research prototype alongside the existing Express/Mongoose demo backend. It uses only synthetic/demo data and is not a clinical system.

## Research purpose

The prototype operationalizes a dissertation direction centered on a privacy-conscious, human-centered multi-agent AI framework for personalized healthcare navigation and decision support.

Current proof-of-concept components:

- Agent orchestrator that routes patient requests to medical-record, medication, appointment, or care-navigation agents.
- Deterministic evidence retrieval layer representing a future FHIR/vector-store RAG component.
- Human-review and safety flags in every agent response.
- Synthetic logistic-regression model for appointment no-show risk.
- Research evaluation-plan endpoint defining task, safety, human-centered, fairness, and operational metrics.

## Run locally

```bash
cd fastapi_dissertation
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open Swagger UI at `http://localhost:8000/docs`.

## Example request

```bash
curl -X POST http://localhost:8000/v1/agent/query \
  -H "Content-Type: application/json" \
  -d '{"message":"Explain my latest A1C and LDL results"}'
```

## Proposed next research increments

1. Replace inline synthetic context with generated Synthea FHIR R4 bundles.
2. Add PostgreSQL/pgvector or a dedicated vector store and implement traceable RAG citations.
3. Add an explicit agent-state graph with tool permissions, confirmation gates, and audit logs.
4. Train/evaluate appointment and preventive-care models using larger synthetic cohorts.
5. Add benchmark harnesses comparing single-agent, RAG, and multi-agent RAG architectures.
6. Add demographic-stratified fairness analysis and calibration evaluation.
7. Add MIMIC-IV experiments only after credentialing/data-use requirements are satisfied.

## Safety boundary

This software is a research demonstration. It must not diagnose, prescribe, triage emergencies, or make consequential clinical decisions. Any future human-subject or real-data study should follow applicable institutional review, privacy, security, and data-use requirements.
