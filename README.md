# Compliance RAG Backend

Enterprise Multi-Source Legal/Compliance RAG Assistant.

## Setup

1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

2. Start Docker containers for PostgreSQL and Qdrant:
   ```bash
   docker-compose up -d
   ```

3. Copy `.env.example` to `.env` and configure your API keys.

4. Run the application:
   ```bash
   python -m uvicorn backend.main:app --reload
   ```

## Ingestion
Run scripts to ingest open source datasets:
```bash
python -m backend.scripts.ingest_cuad
python -m backend.scripts.ingest_gdpr
```
