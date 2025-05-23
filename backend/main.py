from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from fastapi.middleware.cors import CORSMiddleware
import boto3
import os
from uuid import uuid4

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

S3_BUCKET = os.environ.get("S3_BUCKET", "learn-materials")
S3_ENDPOINT_URL = os.environ.get("S3_ENDPOINT_URL")

s3_client = boto3.client("s3", endpoint_url=S3_ENDPOINT_URL)

# In-memory store for uploaded materials metadata
# {course_id: [info, ...]}
materials = {}

# --- Question Review Queue ---

class Question(BaseModel):
    id: str
    content: str
    type: str
    difficulty: str
    source: str
    status: str = "pending"
    edits: List[str] = []

questions: Dict[str, Question] = {}

# Example pending questions for demonstration
questions["q1"] = Question(
    id="q1",
    content="What is the capital of France?",
    type="multiple_choice",
    difficulty="easy",
    source="geography.pdf",
)
questions["q2"] = Question(
    id="q2",
    content="Explain Newton's second law of motion.",
    type="short_answer",
    difficulty="medium",
    source="physics.txt",
)


ALLOWED_TYPES = {
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/markdown",
}
MAX_SIZE = 100 * 1024 * 1024  # 100MB

@app.post("/api/materials/upload")
async def upload_material(course_id: str, file: UploadFile = File(...)):
    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 100MB)")
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    material_id = str(uuid4())
    key = f"{course_id}/{material_id}/{file.filename}"
    s3_client.put_object(Bucket=S3_BUCKET, Key=key, Body=data)

    info = {
        "id": material_id,
        "course_id": course_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(data),
        "s3_key": key,
    }
    materials.setdefault(course_id, []).append(info)
    return info

@app.get("/api/materials/{course_id}")
def list_materials(course_id: str):
    return materials.get(course_id, [])

@app.delete("/api/materials/{material_id}")
def delete_material(material_id: str):
    for course, items in materials.items():
        for item in items:
            if item["id"] == material_id:
                s3_client.delete_object(Bucket=S3_BUCKET, Key=item["s3_key"])
                items.remove(item)
                return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Material not found")


# ---------------- Question Review Endpoints ----------------

@app.get("/api/questions/review")
def review_queue(
    status: str = "pending",
    type: Optional[str] = None,
    difficulty: Optional[str] = None,
    source: Optional[str] = None,
):
    result = [q for q in questions.values() if q.status == status]
    if type:
        result = [q for q in result if q.type == type]
    if difficulty:
        result = [q for q in result if q.difficulty == difficulty]
    if source:
        result = [q for q in result if q.source == source]
    return result


@app.post("/api/questions/{question_id}/approve")
def approve_question(question_id: str):
    q = questions.get(question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.status = "approved"
    return q


@app.post("/api/questions/{question_id}/reject")
def reject_question(question_id: str):
    q = questions.get(question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.status = "rejected"
    return q


@app.put("/api/questions/{question_id}")
def edit_question(question_id: str, content: str):
    q = questions.get(question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.edits.append(q.content)
    q.content = content
    return q


@app.post("/api/questions/bulk_approve")
def bulk_approve(ids: List[str]):
    updated = []
    for id_ in ids:
        q = questions.get(id_)
        if q:
            q.status = "approved"
            updated.append(id_)
    return {"approved": updated}


@app.post("/api/questions/bulk_reject")
def bulk_reject(ids: List[str]):
    updated = []
    for id_ in ids:
        q = questions.get(id_)
        if q:
            q.status = "rejected"
            updated.append(id_)
    return {"rejected": updated}
