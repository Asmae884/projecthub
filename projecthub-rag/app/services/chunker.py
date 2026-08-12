import re
from app.config import Config

class DocumentChunker:
    @staticmethod
    def chunk_text(text: str, chunk_size: int = Config.CHUNK_SIZE, overlap: int = Config.CHUNK_OVERLAP) -> list[str]:

        text = re.sub(r'\s+', ' ', text).strip()
        
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = start + chunk_size
            if end >= text_len:
                chunks.append(text[start:end].strip())
                break
            
            end = min(end, text_len)
            while end < text_len and text[end] not in ['.', '!', '?', '\n']:
                end += 1
            
            if end < text_len:
                chunks.append(text[start:end+1].strip())
            else:
                chunks.append(text[start:end].strip())
            
            start = end - overlap
        
        return [chunk for chunk in chunks if chunk]