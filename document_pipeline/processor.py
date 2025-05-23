import sqlite3
from dataclasses import dataclass
from typing import List

# NOTE: Requires pdfminer.six for PDF text extraction.
try:
    from pdfminer.high_level import extract_text
    from pdfminer.pdfparser import PDFParser
    from pdfminer.pdfdocument import PDFDocument
    from pdfminer.pdfpage import PDFPage
except ImportError:  # pragma: no cover - pdfminer may not be available
    extract_text = None


@dataclass
class DocumentMetadata:
    title: str
    author: str
    pages: int


class DocumentProcessor:
    """Process PDF documents into text chunks for LLM consumption."""

    def __init__(self, db_path: str = "documents.db") -> None:
        self.db_path = db_path
        self._init_db()

    def _init_db(self) -> None:
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                path TEXT UNIQUE,
                title TEXT,
                author TEXT,
                pages INTEGER
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS chunks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER,
                chunk_index INTEGER,
                text TEXT,
                FOREIGN KEY(document_id) REFERENCES documents(id)
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chunk_id INTEGER,
                question_index INTEGER,
                question TEXT,
                choices TEXT,
                answer TEXT,
                status TEXT DEFAULT 'pending',
                cost REAL DEFAULT 0,
                FOREIGN KEY(chunk_id) REFERENCES chunks(id)
            )
            """
        )
        conn.commit()
        conn.close()

    def extract_text(self, file_path: str) -> str:
        if extract_text is None:
            raise RuntimeError("pdfminer.six is required for PDF processing")
        return extract_text(file_path)

    def extract_metadata(self, file_path: str) -> DocumentMetadata:
        if extract_text is None:
            raise RuntimeError("pdfminer.six is required for PDF processing")
        with open(file_path, "rb") as fp:
            parser = PDFParser(fp)
            doc = PDFDocument(parser)
            info = doc.info[0] if doc.info else {}
            title = info.get("Title", b"" ).decode("utf-8", errors="ignore")
            author = info.get("Author", b"" ).decode("utf-8", errors="ignore")
            pages = sum(1 for _ in PDFPage.create_pages(doc))
        return DocumentMetadata(title=title, author=author, pages=pages)

    def chunk_text(self, text: str, tokens_per_chunk: int = 1500) -> List[str]:
        words = text.split()
        chunks = []
        for i in range(0, len(words), tokens_per_chunk):
            chunk = " ".join(words[i:i + tokens_per_chunk])
            chunks.append(chunk)
        return chunks

    def save_document(self, path: str, metadata: DocumentMetadata, chunks: List[str]) -> int:
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute(
            "INSERT OR IGNORE INTO documents(path, title, author, pages) VALUES(?,?,?,?)",
            (path, metadata.title, metadata.author, metadata.pages),
        )
        conn.commit()
        cur.execute("SELECT id FROM documents WHERE path=?", (path,))
        doc_id = cur.fetchone()[0]
        for idx, chunk in enumerate(chunks):
            cur.execute(
                "INSERT INTO chunks(document_id, chunk_index, text) VALUES(?,?,?)",
                (doc_id, idx, chunk),
            )
        conn.commit()
        conn.close()
        return doc_id

    def process_pdf(self, path: str) -> int:
        text = self.extract_text(path)
        metadata = self.extract_metadata(path)
        chunks = self.chunk_text(text)
        doc_id = self.save_document(path, metadata, chunks)
        return doc_id
