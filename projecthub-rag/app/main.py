from fastapi import FastAPI
from app.api.routes import router
from app.config import Config
import os

app = FastAPI(
    title="ProjectHub RAG Microservice",
    description="Analyse de documents et génération de tâches pour ProjectHub",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    print("=== Azure OpenAI Configuration ===")
    print(f"ENDPOINT: {os.getenv('AZURE_OPENAI_ENDPOINT')}")
    print(f"DEPLOYMENT: {os.getenv('AZURE_OPENAI_DEPLOYMENT')}")
    print(f"EMBEDDING: {os.getenv('AZURE_OPENAI_EMBEDDING_DEPLOYMENT')}")

app.include_router(router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "ProjectHub RAG Microservice", "status": "running"}