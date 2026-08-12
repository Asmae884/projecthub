import json
import logging
from openai import AzureOpenAI, BadRequestError
from app.config import Config
import httpx

logger = logging.getLogger(__name__)


class TaskGenerator:
    _client = None

    @classmethod
    def get_client(cls) -> AzureOpenAI:
        if cls._client is None:
            http_client = httpx.Client()
            cls._client = AzureOpenAI(
                azure_endpoint=Config.AZURE_OPENAI_ENDPOINT,
                api_key=Config.AZURE_OPENAI_KEY,
                api_version=Config.AZURE_OPENAI_API_VERSION,
                http_client=http_client
            )
        return cls._client

    @classmethod
    def generate_tasks(cls, document_text: str, context_chunks: list[str] = None) -> list[dict]:
        """
        Génère des tâches à partir du document en utilisant Azure OpenAI.
        Retourne une liste de dictionnaires. Lève une exception si l'appel
        échoue, au lieu de l'avaler silencieusement, pour que l'appelant
        (et les logs Azure) voient la vraie cause.
        """
        context = "\n\n".join(context_chunks) if context_chunks else document_text

        prompt = f"""
Tu es un expert en gestion de projet. Analyse le document suivant et extrait toutes les tâches qui y sont mentionnées ou implicitement suggérées.

Document:
{context}

**Instructions strictes :**
1. Ne génère que des tâches **explicitement mentionnées** ou clairement suggérées par le document.
2. Pour chaque tâche, fournis :
   - Un titre court et précis
   - Une description détaillée
   - Une priorité (low/medium/high) basée sur l'urgence et l'importance mentionnée
   - Une estimation en heures (si indiquée, sinon laisse vide)
   - Une date d'échéance (si indiquée, sinon laisse vide)
3. Si une tâche n'a pas de date ou d'estimation, laisse le champ null.
4. Ne génère **pas** de tâches déjà listées (évite les doublons).
5. Retourne **uniquement** une liste JSON valide. Pas de texte autour.

Format attendu pour chaque tâche (JSON strict) :
{{
    "title": "titre",
    "description": "description",
    "priority": "low|medium|high",
    "estimated_hours": 8,
    "due_date": "2026-08-15"
}}

Retourne UNIQUEMENT une liste JSON.
"""

        client = cls.get_client()
        messages = [
            {"role": "system", "content": "Tu es un expert en gestion de projet. Tu retournes toujours des réponses en JSON valide."},
            {"role": "user", "content": prompt}
        ]

        try:
            response = client.chat.completions.create(
                model=Config.AZURE_OPENAI_DEPLOYMENT,
                messages=messages,
                temperature=0.3,
                max_tokens=4096,
                response_format={"type": "json_object"}
            )
        except BadRequestError as e:
            logger.warning(
                "Appel initial rejeté par Azure OpenAI (%s), nouvelle tentative avec max_completion_tokens",
                e
            )
            try:
                response = client.chat.completions.create(
                    model=Config.AZURE_OPENAI_DEPLOYMENT,
                    messages=messages,
                    max_completion_tokens=16000,
                    response_format={"type": "json_object"}
                )
            except Exception:
                logger.exception("Échec de l'appel Azure OpenAI (2e tentative) pour la génération de tâches")
                raise
        except Exception:
            logger.exception("Échec de l'appel Azure OpenAI pour la génération de tâches")
            raise

        choice = response.choices[0]
        content = choice.message.content

        if not content:
            logger.warning(
                "Réponse Azure OpenAI vide, aucune tâche générée (finish_reason=%s, usage=%s)",
                getattr(choice, "finish_reason", None),
                getattr(response, "usage", None),
            )
            return []
        start = content.find('[')
        end = content.rfind(']')
        if start != -1 and end != -1:
            json_str = content[start:end + 1]
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                logger.exception("Réponse Azure OpenAI non parsable en JSON : %s", content[:500])
                return []
        else:
            logger.warning("Aucun tableau JSON trouvé dans la réponse : %s", content[:500])
            return []