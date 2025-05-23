from celery import Celery
from .processor import DocumentProcessor

app = Celery('document_pipeline', broker='redis://localhost:6379/0')

processor = DocumentProcessor()

@app.task
def process_document(path: str) -> int:
    """Background task to process a PDF file."""
    return processor.process_pdf(path)
