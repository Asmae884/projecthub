from sentence_transformers import SentenceTransformer
from app.config import Config
from openai import AzureOpenAI

class EmbeddingService:

    _client = None

    @classmethod
    def get_client(cls):
        if cls._client is None:
            cls._client = AzureOpenAI(
                azure_endpoint=Config.AZURE_OPENAI_ENDPOINT,
                api_key=Config.AZURE_OPENAI_KEY,
                api_version=Config.AZURE_OPENAI_API_VERSION
            )
        return cls._client
    @classmethod
    def embed(cls, texts: list[str]) -> list[list[float]]:
        client = cls.get_client()
        response = client.embeddings.create(
            model=Config.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
            input=texts
        )
        return [item.embedding for item in response.data]
