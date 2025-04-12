# main.py

from fastapi import FastAPI
from app.routes import reflection  # ← この行がエラーになる場合は一旦消してOK

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello from FastAPI!"}
