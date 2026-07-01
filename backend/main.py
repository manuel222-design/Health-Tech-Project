
from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
import os

app = FastAPI(
    title="Healthtech KB & HMIS Chatbot API",
    description="Knowledge base and chatbot system for healthcare workers",
    version="1.0.0"
)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",   
    "http://localhost:3000",   
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Session-Token"],
)

# ROUTES — dummy endpoints for now, real logic comes in Week 2

@app.get("/")
def root():
    return {"message": "Healthtech KB API is running"}

@app.post("/api/v1/auth/login")
def login():
    return {"message": "Login endpoint — Week 2"}

@app.get("/api/v1/articles")
def get_articles():
    return {"message": "Articles endpoint — Week 2"}

@app.post("/api/v1/chat")
def chat():
    return {"message": "Chat endpoint — Week 2"}

@app.get("/api/v1/admin/users")
def get_users():
    return {"message": "Admin users endpoint — Week 2"}