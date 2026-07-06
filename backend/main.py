
from fastapi import FastAPI, Depends, HTTPException # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from sqlalchemy.orm import Session
from jose import jwt                                    # type: ignore 
from passlib.context import CryptContext               # type: ignore 
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel                         # type: ignore 
from database import get_db
from models import Article, ArticleStatus, User
import os, uuid

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

SECRET_KEY  = os.getenv("JWT_SECRET_KEY", "changethisinproduction")
ALGORITHM   = "HS256"
TOKEN_TTL   = 8
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_token(user_id: str, role: str) -> str:
    """Creates a JWT token that expires in 8 hours"""
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

class LoginRequest(BaseModel):
    email: str
    password: str

@app.get("/")
def root():
    return {"message": "Healthtech KB API is running"}

@app.get("/api/v1/articles")
def get_articles(db: Session = Depends(get_db)):
    articles = db.query(Article).filter(
        Article.status == ArticleStatus.published
    ).all()
    return [
        {
            "id":           str(a.id),
            "title":        a.title,
            "slug":         a.slug,
            "status":       a.status.value,
            "category_id":  str(a.category_id) if a.category_id else None,
            "view_count":   a.view_count,
            "published_at": str(a.published_at) if a.published_at else None,
            "created_at":   str(a.created_at),
        }
        for a in articles
    ]

@app.get("/api/v1/articles/{slug}")
def get_article_by_slug(slug: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(
        Article.slug == slug,
        Article.status == ArticleStatus.published
    ).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    return {
        "id":            str(article.id),
        "title":         article.title,
        "slug":          article.slug,
        "body_markdown": article.body_markdown,
        "status":        article.status.value,
        "view_count":    article.view_count,
        "created_at":    str(article.created_at),
    }

@app.post("/api/v1/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    if not pwd_context.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(str(user.id), user.role.value)

    return {
        "access_token": token,
        "token_type":   "bearer",
        "expires_in":   TOKEN_TTL * 3600,
        "role":         user.role.value,
        "username":     user.username,
    }


class ArticleCreateRequest(BaseModel):
    title:       str
    slug:        str
    body_markdown: str
    category_id: str = None
    status:      str = "draft"

class ArticleUpdateRequest(BaseModel):
    title:        str = None
    body_markdown: str = None
    status:       str = None

@app.post("/api/v1/articles")
def create_article(payload: ArticleCreateRequest, db: Session = Depends(get_db)):
    existing = db.query(Article).filter(Article.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    admin = db.query(User).filter(User.email == "admin@healthtech.co.ke").first()
    
    article = Article(
        id=uuid.uuid4(),
        title=payload.title,
        slug=payload.slug,
        body_markdown=payload.body_markdown,
        body_html="",
        status=ArticleStatus.draft,
        author_id=admin.id,
        view_count=0
    )
    db.add(article)
    db.commit()
    db.refresh(article)

    return {
        "message": "Article created successfully",
        "id":      str(article.id),
        "slug":    article.slug,
        "status":  article.status.value,
    }

@app.put("/api/v1/articles/{slug}")
def update_article(slug: str, payload: ArticleUpdateRequest, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.slug == slug).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if payload.title:
        article.title = payload.title
    if payload.body_markdown:
        article.body_markdown = payload.body_markdown
    if payload.status:
        article.status = ArticleStatus(payload.status)

    db.commit()
    db.refresh(article)

    return {
        "message": "Article updated successfully",
        "slug":    article.slug,
        "status":  article.status.value,
    }

@app.delete("/api/v1/articles/{slug}")
def delete_article(slug: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.slug == slug).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    db.delete(article)
    db.commit()

    return {"message": f"Article '{slug}' deleted successfully"}

@app.post("/api/v1/chat")
def chat():
    return {"message": "Chat endpoint — Week 3"}

@app.get("/api/v1/admin/users")
def get_users():
    return {"message": "Admin endpoint — coming next"}