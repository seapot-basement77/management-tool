from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ReflectionInput(BaseModel):
    content: str

@router.post("/")
def create_reflection(reflection: ReflectionInput):
    return {"message": "Reflection received", "content": reflection.content}

@router.get("/")
def get_reflections():
    return [{"id": 1, "content": "今日は集中できた"}]