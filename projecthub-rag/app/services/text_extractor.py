import io
from pypdf import PdfReader
from docx import Document

class TextExtractor:
    @staticmethod
    def extract_from_pdf(file_content: bytes) -> str:
        """Extrait le texte d'un fichier PDF"""
        pdf = PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
        return text
    
    @staticmethod
    def extract_from_docx(file_content: bytes) -> str:
        """Extrait le texte d'un fichier DOCX"""
        doc = Document(io.BytesIO(file_content))
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    
    @staticmethod
    def extract(file_content: bytes, filename: str) -> str:
        """Détecte automatiquement le type de fichier"""
        if filename.lower().endswith('.pdf'):
            return TextExtractor.extract_from_pdf(file_content)
        elif filename.lower().endswith('.docx'):
            return TextExtractor.extract_from_docx(file_content)
        else:
            raise ValueError(f"Format non supporté : {filename}")