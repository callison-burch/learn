from fastapi import FastAPI, UploadFile, File, HTTPException
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
