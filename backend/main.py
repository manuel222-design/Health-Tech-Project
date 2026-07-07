
from fastapi import FastAPI, Depends, HTTPException # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from sqlalchemy.orm import Session
from jose import jwt, JWTError                                 # type: ignore 
from passlib.context import CryptContext               # type: ignore 
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel                         # type: ignore 
from database import get_db
from models import Article, ArticleStatus, User, SearchLog, Category, ChatSession, ChatMessage, MessageRole
import os, uuid
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials # type: ignore
from groq import Groq # type: ignore

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
bearer_scheme = HTTPBearer()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def create_token(user_id: str, role: str) -> str:
    """Creates a JWT token that expires in 8 hours"""
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM
    )



def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        user_id = payload.get("sub")
        role    = payload.get("role")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {"user_id": user_id, "role": role}

    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalid or expired")

def require_editor(user: dict = Depends(get_current_user)):
    if user["role"] not in ["editor", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="You need Editor or Admin role to do this"
        )
    return user

def require_admin(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="You need Admin role to do this"
        )
    return user

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

@app.get("/api/v1/articles/search")
def search_articles(q: str, db: Session = Depends(get_db)):

    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Search query too short")

    results = db.query(Article).filter(
        Article.status == ArticleStatus.published,
        Article.title.ilike(f"%{q}%") |
        Article.body_markdown.ilike(f"%{q}%")
    ).all()

    log = SearchLog(
        id=uuid.uuid4(),
        query=q,
        results_count=len(results)
    )
    db.add(log)
    db.commit()

    return {
        "query":        q,
        "total_results": len(results),
        "results": [
            {
                "id":    str(a.id),
                "title": a.title,
                "slug":  a.slug,
            }
            for a in results
        ]
    }


@app.get("/api/v1/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.sort_order).all()
    return [
        {
            "id":          str(c.id),
            "name":        c.name,
            "slug":        c.slug,
            "description": c.description,
        }
        for c in categories
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
def create_article(payload: ArticleCreateRequest, db: Session = Depends(get_db), user: dict = Depends(require_editor)):
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
def update_article(slug: str, payload: ArticleUpdateRequest, db: Session = Depends(get_db), user: dict = Depends(require_editor)):
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
def delete_article(slug: str, db: Session = Depends(get_db), user: dict = Depends(require_admin)):
    article = db.query(Article).filter(Article.slug == slug).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    db.delete(article)
    db.commit()

    return {"message": f"Article '{slug}' deleted successfully"}


    


class ChatRequest(BaseModel):
    message: str
    session_token: str = None

@app.post("/api/v1/chat")
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    
    keywords = [word for word in payload.message.split() 
                if len(word) > 3]
                
    relevant_articles = []
    for keyword in keywords:
        results = db.query(Article).filter(
            Article.status == ArticleStatus.published,
            Article.title.ilike(f"%{keyword}%") |
            Article.body_markdown.ilike(f"%{keyword}%")
        ).all()
        for r in results:
            if r not in relevant_articles:
                relevant_articles.append(r)
                
    relevant_articles = relevant_articles[:3]

    if relevant_articles:
        context = "\n\n".join([
            f"Article: {a.title}\n{a.body_markdown}"
            for a in relevant_articles
        ])
        context_note = f"Use ONLY the following knowledge base articles to answer:\n\n{context}"
    else:
        context_note = "No relevant articles found in the knowledge base."

    prompt = f"""You are a helpful assistant for healthcare workers using the Taifa Care HMIS system.
    Your job is to answer questions based ONLY on the provided knowledge base articles.
    If the answer is not in the articles, say "I don't have information about that in the knowledge base yet."
    Keep answers clear, concise and practical for clinical staff.
    
    {context_note}
    
    User question: {payload.message}"""

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )

    session = ChatSession(
        id=uuid.uuid4(),
        session_token=str(uuid.uuid4()),
        source_url="swagger-test"
    )
    db.add(session)
    db.flush()

    user_msg = ChatMessage(
        id=uuid.uuid4(),
        session_id=session.id,
        role=MessageRole.user,
        content=payload.message
    )
    ai_msg = ChatMessage(
        id=uuid.uuid4(),
        session_id=session.id,
        role=MessageRole.assistant,
        content=response.choices[0].message.content
    )
    db.add(user_msg)
    db.add(ai_msg)
    db.commit()

    return {
        "question":        payload.message,
        "answer": response.choices[0].message.content,
        "sources_used":    len(relevant_articles),
        "articles_found":  [a.title for a in relevant_articles],
    }

@app.get("/api/v1/admin/users")
def get_users():
    return {"message": "Admin endpoint — coming next"}