import numpy as np
from scipy.spatial.distance import cosine
from app.services.embedding import EmbeddingService

class VectorStore:
    _documents = []  
    
    @classmethod
    def add_document(cls, doc_id: str, chunks: list[str], metadata: dict = None):
        embeddings = EmbeddingService.embed(chunks)
        for i, chunk in enumerate(chunks):
            cls._documents.append({
                'id': f"{doc_id}_{i}",
                'text': chunk,
                'embedding': embeddings[i],
                'metadata': metadata or {}
            })
        return len(chunks)
    
    @classmethod
    def search(cls, query: str, top_k: int = 5) -> list[dict]:
        query_embedding = EmbeddingService.embed_single(query)
        results = []
        for doc in cls._documents:
            sim = 1 - cosine(query_embedding, doc['embedding'])
            results.append({
                'text': doc['text'],
                'metadata': doc['metadata'],
                'distance': 1 - sim
            })
        results.sort(key=lambda x: x['distance'])
        return results[:top_k]