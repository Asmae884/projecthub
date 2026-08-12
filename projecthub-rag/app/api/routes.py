import base64
import io
import logging
from fastapi import APIRouter, HTTPException
from app.models import IngestRequest, IngestResponse, TaskResponse
from app.services.text_extractor import TextExtractor
from app.services.chunker import DocumentChunker
from app.services.vector_store import VectorStore
from app.services.task_generator import TaskGenerator
 
router = APIRouter()
logger = logging.getLogger(__name__)
 
 
@router.post("/ingest", response_model=IngestResponse)
async def ingest_document(request: IngestRequest):
    try:
        try:
            file_bytes = base64.b64decode(request.file_content)
        except Exception:
            raise HTTPException(status_code=400, detail="file_content n'est pas du base64 valide")

        text = TextExtractor.extract(file_bytes, request.filename)
 
        if not text or len(text) < 50:
            raise HTTPException(status_code=400, detail="Le document est vide ou trop court")

        chunks = DocumentChunker.chunk_text(text)
 
        if not chunks:
            raise HTTPException(status_code=400, detail="Impossible de découper le document")

        doc_id = f"doc_{request.document_id}"
        metadata = {
            "document_id": request.document_id,
            "project_id": request.project_id,
            "user_id": request.user_id,
            "filename": request.filename
        }
 
        chunks_count = VectorStore.add_document(doc_id, chunks, metadata)

        tasks = TaskGenerator.generate_tasks(text, chunks[:5])
 
        if not tasks:

            logger.warning(
                "Aucune tâche générée pour document_id=%s (voir logs TaskGenerator ci-dessus pour la cause)",
                request.document_id
            )

        task_responses = [
            TaskResponse(**task) for task in tasks
        ]
 
        return IngestResponse(
            status="success",
            document_id=request.document_id,
            chunks_count=chunks_count,
            tasks_generated=len(task_responses),
            tasks=task_responses
        )
 
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Erreur inattendue lors de l'ingestion du document %s", request.filename)
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.get("/health")
async def health_check():
    return {"status": "healthy"}