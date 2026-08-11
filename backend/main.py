import logging
from sqlalchemy import text
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Request, UploadFile, File # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from sqlalchemy.orm import Session
from jose import jwt, JWTError                                 # type: ignore 
from passlib.context import CryptContext               # type: ignore 
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel                         # type: ignore 
from database import get_db
from models import Article, ArticleStatus, ContentType, User, SearchLog, Category, ChatSession, ChatMessage, MessageRole, UserRole, AuditLog, Media, ArticleSMEReview
import os, uuid
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials # type: ignore
from groq import Groq # type: ignore
import cloudinary # type: ignore
import cloudinary.uploader # type: ignore
from fastapi.responses import JSONResponse # type: ignore
from fastapi.exceptions import RequestValidationError # type: ignore
from slowapi import Limiter, _rate_limit_exceeded_handler # type: ignore
from slowapi.util import get_remote_address # type: ignore
from slowapi.errors import RateLimitExceeded # type: ignore
from repositories.category_repository import CategoryRepository
from repositories.tag_repository import TagRepository
from services.category_service import CategoryService
from services.tag_service import TagService
from repositories.feedback_repository import FeedbackRepository
from services.feedback_service import FeedbackService
from repositories.notification_repository import NotificationRepository
from services.notification_service import NotificationService
from repositories.user_repository import UserRepository
from services.auth_service import AuthService
from repositories.dashboard_repository import DashboardRepository
from services.dashboard_service import DashboardService
from repositories.homepage_repository import HomepageRepository
from services.homepage_service import HomepageService

def log_audit(db: Session, user_id: str, action: str, target_type: str, target_id: str = None, details: str = None):
    from models import AuditLog
    entry = AuditLog(
        id=uuid.uuid4(),
        user_id=user_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details
    )
    db.add(entry)
    db.commit()

app = FastAPI(
    title="Healthtech KB & HMIS Chatbot API",
    description="Knowledge base and chatbot system for healthcare workers",
    version="1.0.0"
)

limiter = Limiter(
    key_func=get_remote_address,
    enabled=os.getenv("TESTING") != "1"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


ALLOWED_ORIGINS = [
    "http://localhost:5173",    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://healthtech-kb-frontend.onrender.com",
    "https://healthtech-kb-widget.onrender.com",
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
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)
logger = logging.getLogger("healthtech")

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "img-src 'self' data: https://fastapi.tiangolo.com; "
        "connect-src 'self' https://healthtech-kb-backend-2uo3.onrender.com;"
    )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={
            "status": "error",
            "code": 400,
            "message": "Invalid request data",
            "details": str(exc)
        }
    )

@app.exception_handler(Exception)
async def general_error_handler(request, exc):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "code": 500,
            "message": "An unexpected error occurred. Please try again or contact support.",
        }
    )
    
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

def require_sme_or_admin(user: dict = Depends(get_current_user)):
    if user["role"] not in ["sme", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="You need SME or Admin role to review articles"
        )
    return user

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "viewer"
    department: Optional[str] = None

class TagCreateRequest(BaseModel):
    name: str

class FeedbackRequest(BaseModel):
    rating: int
    comment: Optional[str] = None

@app.get("/")
def root():
    return {"message": "Healthtech KB API is running"}

@app.get("/api/v1/articles")
def get_articles(
    page: int = 1,
    page_size: int = 20,
    category_id: Optional[str] = None,
    content_type: Optional[str] = None,
    tag_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Article).filter(Article.status == ArticleStatus.published)

    if category_id:
        query = query.filter(Article.category_id == category_id)
    if content_type:
        query = query.filter(Article.content_type == ContentType(content_type))
    if tag_id:
        from models import ArticleTag
        query = query.join(ArticleTag, ArticleTag.article_id == Article.id) \
                      .filter(ArticleTag.tag_id == tag_id)

    total_count = query.count()

    offset = (page - 1) * page_size
    articles = query.order_by(Article.created_at.desc()) \
                     .offset(offset).limit(page_size).all()
    return {
        "results": [
            {
                "id":           str(a.id),
                "title":        a.title,
                "slug":         a.slug,
                "status":       a.status.value,
                "category_id":  str(a.category_id) if a.category_id else None,
                "content_type": a.content_type.value if a.content_type else "how_to",
                "view_count":   a.view_count,
                "published_at": str(a.published_at) if a.published_at else None,
                "created_at":   str(a.created_at),
            }
            for a in articles
        ],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_pages": (total_count + page_size - 1) // page_size,
        }
    }

@app.get("/api/v1/articles/admin/all")
def get_all_articles_admin(db: Session = Depends(get_db), user: dict = Depends(require_editor)):
    articles = db.query(Article).order_by(Article.created_at.desc()).all()
    return [
        {
            "id":           str(a.id),
            "title":        a.title,
            "slug":         a.slug,
            "status":       a.status.value,
            "category_id":  str(a.category_id) if a.category_id else None,
            "view_count":   a.view_count,
            "created_at":   str(a.created_at),
        }
        for a in articles
    ]

@app.get("/api/v1/articles/admin/{slug}")
def get_article_admin(slug: str, db: Session = Depends(get_db), user: dict = Depends(require_editor)):
    article = db.query(Article).filter(Article.slug == slug).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    from models import ArticleTag
    tag_links = db.query(ArticleTag).filter(ArticleTag.article_id == article.id).all()
    tag_ids = [str(link.tag_id) for link in tag_links]

    return {
        "id":            str(article.id),
        "title":         article.title,
        "slug":          article.slug,
        "body_markdown": article.body_markdown,
        "status":        article.status.value,
        "category_id":   str(article.category_id) if article.category_id else None,
        "content_type":  article.content_type.value if article.content_type else "how_to",
        "product_version": article.product_version,
        "tag_ids":       tag_ids,
        "has_previous_version": bool(article.previous_body_markdown),
        "created_at":    str(article.created_at),
    }

@app.post("/api/v1/media/upload")
async def upload_media(
    file: UploadFile = File(...),
    article_id: Optional[str] = None,
    db: Session = Depends(get_db),
    user: dict = Depends(require_editor)
):
    allowed_types = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PNG, JPEG, and WEBP images are allowed")

    result = cloudinary.uploader.upload(file.file, folder="healthtech_kb")

    from models import Media
    media = Media(
        id=uuid.uuid4(),
        article_id=article_id if article_id else None,
        filename=file.filename,
        url=result["secure_url"],
        type="image",
        uploaded_by=user["user_id"]
    )
    db.add(media)
    db.commit()

    return {
        "id":  str(media.id),
        "url": media.url,
        "filename": media.filename
    }
    
@app.get("/api/v1/articles/search")
def search_articles(
    q: str,
    category_id: str = None,
    content_type: str = None,
    tag_id: str = None,
    db: Session = Depends(get_db)
):
    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Search query too short")

    filters = ["status = 'published'"]
    params = {"q": q}

    if category_id:
        filters.append("category_id = :category_id")
        params["category_id"] = category_id

    if content_type:
        filters.append("content_type = :content_type")
        params["content_type"] = content_type

    tag_join = ""
    if tag_id:
        tag_join = "JOIN article_tags at ON at.article_id = articles.id AND at.tag_id = :tag_id"
        params["tag_id"] = tag_id

    filter_clause = " AND ".join(filters)

    search_query = text(f"""
        SELECT DISTINCT articles.id, articles.title, articles.slug, articles.status,
               articles.category_id, articles.content_type,
               ts_rank(
                   setweight(to_tsvector('english', articles.title), 'A') ||
                   setweight(to_tsvector('english', articles.body_markdown), 'B'),
                   plainto_tsquery('english', :q)
               ) AS rank
        FROM articles
        {tag_join}
        WHERE {filter_clause}
          AND (
                setweight(to_tsvector('english', articles.title), 'A') ||
                setweight(to_tsvector('english', articles.body_markdown), 'B')
              ) @@ plainto_tsquery('english', :q)
        ORDER BY rank DESC
        LIMIT 20
    """)

    rows = db.execute(search_query, params).fetchall()

    log = SearchLog(
        id=uuid.uuid4(),
        query=q,
        results_count=len(rows)
    )
    db.add(log)
    db.commit()

    return {
        "query":        q,
        "total_results": len(rows),
        "results": [
            {
                "id":           str(row.id),
                "title":        row.title,
                "slug":         row.slug,
                "category_id":  str(row.category_id) if row.category_id else None,
                "content_type": row.content_type,
            }
            for row in rows
        ]
    }

    log = SearchLog(
        id=uuid.uuid4(),
        query=q,
        results_count=len(rows)
    )
    db.add(log)
    db.commit()

    return {
        "query":        q,
        "total_results": len(rows),
        "results": [
            {
                "id":    str(row.id),
                "title": row.title,
                "slug":  row.slug,
            }
            for row in rows
        ]
    }


@app.get("/api/v1/homepage")
def get_homepage(db: Session = Depends(get_db)):
    repository = HomepageRepository(db)
    service = HomepageService(repository)

    return service.get_homepage()

@app.get("/api/v1/categories")
def get_categories(db: Session = Depends(get_db)):
    repository = CategoryRepository(db)
    service = CategoryService(repository)

    return service.get_categories()


class CategoryCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None


@app.post("/api/v1/categories", status_code=201)
def create_category(
    payload: CategoryCreateRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(require_editor)
):
    repository = CategoryRepository(db)
    service = CategoryService(repository)

    try:
        return service.create_category(
            payload.name,
            payload.description
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.get("/api/v1/tags")
def get_tags(db: Session = Depends(get_db)):
    repository = TagRepository(db)
    service = TagService(repository)

    return service.get_tags()


@app.post("/api/v1/tags", status_code=201)
def create_tag(
    payload: TagCreateRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(require_editor)
):
    repository = TagRepository(db)
    service = TagService(repository)

    try:
        return service.create_tag(payload.name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/v1/articles/{slug}/feedback", status_code=201)
def submit_feedback(
    slug: str,
    payload: FeedbackRequest,
    db: Session = Depends(get_db)
):
    repository = FeedbackRepository(db)
    service = FeedbackService(repository)

    try:
        return service.submit_feedback(
            slug,
            payload.rating,
            payload.comment
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get("/api/v1/articles/{slug}/feedback/summary")
def get_feedback_summary(
    slug: str,
    db: Session = Depends(get_db)
):
    repository = FeedbackRepository(db)
    service = FeedbackService(repository)

    try:
        return service.get_feedback_summary(slug)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

@app.get("/api/v1/my-notifications")
def get_my_notifications(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    repository = NotificationRepository(db)
    service = NotificationService(repository)

    return service.get_my_notifications(user["user_id"])

@app.get("/api/v1/articles/{slug}")
def get_article_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    from repositories.article_repository import ArticleRepository
    from services.article_service import ArticleService

    repository = ArticleRepository(db)
    service = ArticleService(repository)

    return service.get_published_article(slug)


@app.get("/api/v1/articles/{slug}/pdf")
def export_article_pdf(slug: str, db: Session = Depends(get_db)):
    import markdown as md_lib # type: ignore
    from xhtml2pdf import pisa # type: ignore
    from fastapi.responses import Response # type: ignore
    import io

    article = db.query(Article).filter(
        Article.slug == slug,
        Article.status == ArticleStatus.published
    ).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    body_html = md_lib.markdown(article.body_markdown, extensions=["tables", "fenced_code"])

    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; }}
            h1 {{ color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 8px; }}
            h2 {{ color: #0f766e; margin-top: 20px; }}
            .meta {{ color: #64748b; font-size: 10px; margin-bottom: 16px; }}
            table {{ border-collapse: collapse; width: 100%; margin: 12px 0; }}
            th, td {{ border: 1px solid #cbd5e1; padding: 6px; text-align: left; font-size: 11px; }}
            th {{ background-color: #f0fdfa; }}
            code {{ background-color: #f1f5f9; padding: 2px 4px; }}
            .footer {{ margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; }}
        </style>
    </head>
    <body>
        <h1>{article.title}</h1>
        <div class="meta">Last updated: {article.created_at.strftime('%d %B %Y')} - Taifa Care HMIS Knowledge Base</div>
        {body_html}
        <div class="footer">Generated from Healthtech Knowledge Base</div>
    </body>
    </html>
    """

    pdf_buffer = io.BytesIO()
    pisa.CreatePDF(html_content, dest=pdf_buffer)
    pdf_bytes = pdf_buffer.getvalue()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{article.slug}.pdf"'}
    )

@app.post("/api/v1/auth/login", status_code=200)
@limiter.limit("5/10minutes")
def login(
    request: Request,
    payload: LoginRequest,
    db: Session = Depends(get_db)
):
    repository = UserRepository(db)
    service = AuthService(
        repository,
        pwd_context,
        create_token,
        TOKEN_TTL
    )

    return service.login(
        payload.email,
        payload.password
    )

@app.post("/api/v1/auth/register", status_code=201)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db)
):
    repository = UserRepository(db)
    service = AuthService(
        repository,
        pwd_context,
        create_token,
        TOKEN_TTL
    )

    return service.register(
        payload.username,
        payload.email,
        payload.password,
        payload.role,
        payload.department
    )

class ArticleCreateRequest(BaseModel):
    title:         str
    slug:          str
    body_markdown: str
    category_id:   Optional[str] = None
    tag_ids:       list[str] = []
    status:        str = "draft"
    content_type:  str = "how_to"
    product_version: Optional[str] = None
class ArticleUpdateRequest(BaseModel):
    title:         Optional[str] = None
    body_markdown: Optional[str] = None
    category_id:   Optional[str] = None
    tag_ids:       Optional[list[str]] = None
    status:        Optional[str] = None
    content_type:  Optional[str] = None
    product_version: Optional[str] = None

@app.post("/api/v1/articles", status_code=201)
def create_article(payload: ArticleCreateRequest, db: Session = Depends(get_db), user: dict = Depends(require_editor)):
    existing = db.query(Article).filter(Article.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    admin = db.query(User).filter(User.email == "admin@healthtech.co.ke").first()
    requested_status = payload.status or "draft"

    if user["role"] == "editor" and requested_status == "published":
        requested_status = "pending_review"
    
    article = Article(
        id=uuid.uuid4(),
        title=payload.title,
        slug=payload.slug,
        body_markdown=payload.body_markdown,
        body_html="",
        status=ArticleStatus(requested_status),
        category_id=payload.category_id if payload.category_id else None,
        content_type=ContentType(payload.content_type),
        product_version=payload.product_version,
        author_id=admin.id,
        view_count=0
    )
    db.add(article)
    db.flush()

    from models import ArticleTag
    for tag_id in payload.tag_ids:
        db.add(ArticleTag(article_id=article.id, tag_id=tag_id))

    db.commit()
    db.refresh(article)

    log_audit(db, user["user_id"], "create_article", "article", str(article.id), f"title={article.title}")
    log_audit(db, user["user_id"], "update_article", "article", str(article.id), f"status={article.status.value}")

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
        article.previous_body_markdown = article.body_markdown
        article.body_markdown = payload.body_markdown
    if payload.status:
        if user["role"] == "editor" and payload.status == "published":
            article.status = ArticleStatus.pending_review
        else:
            article.status = ArticleStatus(payload.status)

    if payload.category_id is not None:
        article.category_id = payload.category_id if payload.category_id else None

    if payload.content_type is not None:
        article.content_type = ContentType(payload.content_type)

    if payload.product_version is not None:
        article.product_version = payload.product_version

    if payload.tag_ids is not None:
        from models import ArticleTag
        db.query(ArticleTag).filter(ArticleTag.article_id == article.id).delete()
        for tag_id in payload.tag_ids:
            db.add(ArticleTag(article_id=article.id, tag_id=tag_id))

    db.commit()
    db.refresh(article)

    return {
        "message": "Article updated successfully",
        "slug":    article.slug,
        "status":  article.status.value,
    }

@app.post("/api/v1/articles/{slug}/revert")
def revert_article(slug: str, db: Session = Depends(get_db), user: dict = Depends(require_editor)):
    article = db.query(Article).filter(Article.slug == slug).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if not article.previous_body_markdown:
        raise HTTPException(status_code=400, detail="No previous version available to revert to")

    current = article.body_markdown
    article.body_markdown = article.previous_body_markdown
    article.previous_body_markdown = current

    db.commit()
    log_audit(db, user["user_id"], "revert_article", "article", str(article.id))

    return {"message": f"Article '{slug}' reverted to previous version"}

@app.post("/api/v1/articles/{slug}/approve")
def approve_article(slug: str, db: Session = Depends(get_db), user: dict = Depends(require_sme_or_admin)):
    article = db.query(Article).filter(Article.slug == slug).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if article.status != ArticleStatus.pending_review:
        raise HTTPException(status_code=400, detail="Article is not pending review")

    article.status = ArticleStatus.published

    review = ArticleSMEReview(
        id=uuid.uuid4(),
        article_id=article.id,
        reviewer_id=user["user_id"],
        decision="approved",
        comments="Article approved for publication"
    )
    db.add(review)

    db.commit()
    log_audit(db, user["user_id"], "approve_article", "article", str(article.id))

    return {"message": f"Article '{slug}' approved and published"}

class RejectRequest(BaseModel):
    reason: Optional[str] = None

@app.post("/api/v1/articles/{slug}/reject")
def reject_article(slug: str, payload: RejectRequest, db: Session = Depends(get_db), user: dict = Depends(require_sme_or_admin)):
    article = db.query(Article).filter(Article.slug == slug).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if article.status != ArticleStatus.pending_review:
        raise HTTPException(status_code=400, detail="Article is not pending review")

    article.status = ArticleStatus.draft

    review = ArticleSMEReview(
        id=uuid.uuid4(),
        article_id=article.id,
        reviewer_id=user["user_id"],
        decision="changes_requested",
        comments=payload.reason or "Changes requested by reviewer"
    )
    db.add(review)

    db.commit()
    log_audit(db, user["user_id"], "reject_article", "article", str(article.id), payload.reason or "No reason given")

    return {"message": f"Article '{slug}' sent back to draft"}

@app.delete("/api/v1/articles/{slug}")
def delete_article(
    slug: str,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin)
):
    article = db.query(Article).filter(Article.slug == slug).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    article.status = ArticleStatus.archived
    db.commit()
    log_audit(db, user["user_id"], "archive_article", "article", str(article.id))

    return {"message": f"Article '{slug}' archived successfully"}


    


class ChatRequest(BaseModel):
    message: str
    session_token: Optional[str] = None
    screen_context: Optional[str] = None

@app.options("/api/v1/chat")
def chat_preflight():
    from fastapi.responses import Response # type: ignore
    return Response(
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    )
    
@app.post("/api/v1/chat", status_code=200)
@limiter.limit("20/minute")
def chat(request: Request, payload: ChatRequest, db: Session = Depends(get_db)):

    generic_phrases = ["help", "what can you do", "what can you help",
                        "hi", "hello", "hey", "who are you"]
    if payload.message.strip().lower() in generic_phrases or \
       any(p in payload.message.lower() for p in ["what can you help", "what can you do"]):
        return {
            "question": payload.message,
            "answer": (
                "I can help you with Taifa Care HMIS workflows including: "
                "patient registration, booking appointments, capturing patient vitals, "
                "conducting consultations, and TB screening. "
                "Ask me something specific like 'How do I register a patient?'"
            ),
            "sources_used": 0,
            "articles_found": []
        }
    
    search_text = payload.message
    if payload.screen_context:
        search_text = f"{payload.message} {payload.screen_context}"

    keywords = [word for word in search_text.split() 
                if len(word) > 3]
                
    relevant_articles = []
    prior_messages = []
    if payload.session_token:
        existing_session = db.query(ChatSession).filter(
            ChatSession.session_token == payload.session_token
        ).first()
        if existing_session:
            prior_msgs = db.query(ChatMessage).filter(
                ChatMessage.session_id == existing_session.id
            ).order_by(ChatMessage.created_at).limit(10).all()
            prior_messages = [
                {"role": m.role.value, "content": m.content} for m in prior_msgs
            ]
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

    prompt = f"""You are a concise support assistant for healthcare workers using the Taifa Care HMIS system.
    
    STRICT RULES:
    - Answer in 3 to 5 sentences MAXIMUM
    - Use ONLY information from the knowledge base articles provided below
    - If the answer is not in the articles, respond with exactly: "I don't have information about that in the knowledge base yet. Please contact your system administrator."
    - Never add extra information from your own knowledge
    - Use simple, clear language suitable for clinical staff
    - If steps are needed, give maximum 4 bullet points
    
    {context_note}
    
    User question: {payload.message}
    
    Respond in 3 to 5 sentences maximum:"""

    conversation_messages = prior_messages + [{"role": "user", "content": prompt}]

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=conversation_messages
    )

    session = None
    if payload.session_token:
        session = db.query(ChatSession).filter(
            ChatSession.session_token == payload.session_token,
            ChatSession.is_active == True
        ).first()

    if not session:
        session = ChatSession(
            id=uuid.uuid4(),
            session_token=str(uuid.uuid4()),
            source_url="widget"
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
    db.refresh(ai_msg)

    return JSONResponse(
        content={
            "message_id":     str(ai_msg.id),
            "session_token":  session.session_token,
            "question":       payload.message,
            "answer":         response.choices[0].message.content,
            "sources_used":   len(relevant_articles),
            "articles_found": [
                {"title": a.title, "slug": a.slug} for a in relevant_articles
            ],
        },
        headers={"Access-Control-Allow-Origin": "*"}
    )

class ChatFeedbackRequest(BaseModel):
    helpful: bool

@app.post("/api/v1/chat/{message_id}/feedback")
def submit_chat_feedback(message_id: str, payload: ChatFeedbackRequest, db: Session = Depends(get_db)):
    from models import ChatMessage
    import json

    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    message.metadata = {"helpful": payload.helpful}
    db.commit()

    return {"message": "Feedback recorded"}

@app.get("/api/v1/admin/users")
def list_users(db: Session = Depends(get_db), user: dict = Depends(require_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id":         str(u.id),
            "username":   u.username,
            "email":      u.email,
            "role":       u.role.value,
            "is_active":  u.is_active,
            "created_at": str(u.created_at),
        }
        for u in users
    ]

class UpdateRoleRequest(BaseModel):
    role: str

@app.put("/api/v1/admin/users/{user_id}/role")
def update_user_role(user_id: str, payload: UpdateRoleRequest, db: Session = Depends(get_db), user: dict = Depends(require_admin)):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.role not in ["viewer", "editor", "sme", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    target.role = UserRole(payload.role)
    db.commit()
    log_audit(db, user["user_id"], "change_role", "user", user_id, f"new_role={payload.role}")

    return {"message": f"Role updated to {payload.role}"}

@app.put("/api/v1/admin/users/{user_id}/toggle-active")
def toggle_user_active(user_id: str, db: Session = Depends(get_db), user: dict = Depends(require_admin)):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    if str(target.id) == user["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")

    target.is_active = not target.is_active
    db.commit()
    log_audit(db, user["user_id"], "toggle_active", "user", user_id, f"is_active={target.is_active}")

    return {"message": "Active" if target.is_active else "Deactivated", "is_active": target.is_active}

@app.get("/api/v1/admin/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin),
):
    repository = DashboardRepository(db)
    service = DashboardService(repository)

    return service.get_dashboard_stats()

@app.get("/api/v1/admin/analytics")
def get_analytics(db: Session = Depends(get_db), user: dict = Depends(require_admin)):
    from sqlalchemy import func, desc
    from models import ArticleFeedback

    top_viewed = db.query(Article.title, Article.slug, Article.view_count) \
        .filter(Article.status == ArticleStatus.published) \
        .order_by(desc(Article.view_count)) \
        .limit(5).all()

    low_rated = db.query(
            Article.title, Article.slug,
            func.avg(ArticleFeedback.rating).label("avg_rating"),
            func.count(ArticleFeedback.id).label("rating_count")
        ) \
        .join(ArticleFeedback, ArticleFeedback.article_id == Article.id) \
        .group_by(Article.id) \
        .having(func.avg(ArticleFeedback.rating) <= 3) \
        .order_by("avg_rating") \
        .limit(5).all()

    top_searches = db.query(
            SearchLog.query,
            func.count(SearchLog.id).label("count")
        ) \
        .group_by(SearchLog.query) \
        .order_by(desc("count")) \
        .limit(10).all()

    zero_results = db.query(SearchLog.query, func.count(SearchLog.id).label("count")) \
        .filter(SearchLog.results_count == 0) \
        .group_by(SearchLog.query) \
        .order_by(desc("count")) \
        .limit(10).all()

    total_articles = db.query(Article).filter(Article.status == ArticleStatus.published).count()
    total_users = db.query(User).count()
    total_searches = db.query(SearchLog).count()

    from datetime import datetime, timedelta, timezone
    cutoff = datetime.now(timezone.utc) - timedelta(days=180)

    stale_articles = db.query(Article.title, Article.slug, Article.created_at) \
        .filter(
            Article.status == ArticleStatus.published,
            Article.created_at < cutoff
        ) \
        .order_by(Article.created_at) \
        .limit(20).all()

    return {
        "totals": {
            "published_articles": total_articles,
            "users": total_users,
            "searches": total_searches,
        },
        "top_viewed": [
            {"title": t, "slug": s, "views": v} for t, s, v in top_viewed
        ],
        "low_rated": [
            {"title": t, "slug": s, "avg_rating": round(float(r), 1), "rating_count": c}
            for t, s, r, c in low_rated
        ],
        "top_searches": [
            {"query": q, "count": c} for q, c in top_searches
        ],
        "zero_result_searches": [
            {"query": q, "count": c} for q, c in zero_results
        ],
        "stale_articles": [
            {"title": t, "slug": s, "created_at": str(c)} for t, s, c in stale_articles
        ],
    }

@app.get("/api/v1/admin/audit-logs")
def get_audit_logs(db: Session = Depends(get_db), user: dict = Depends(require_admin)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()

    result = []
    for log in logs:
        actor = db.query(User).filter(User.id == log.user_id).first()
        result.append({
            "id":          str(log.id),
            "actor_name":  actor.username if actor else "Unknown",
            "action":      log.action,
            "target_type": log.target_type,
            "target_id":   log.target_id,
            "details":     log.details,
            "created_at":  str(log.created_at),
        })

    return result

@app.get("/api/v1/admin/unanswered-questions")
def get_unanswered_questions(db: Session = Depends(get_db), user: dict = Depends(require_admin)):
    FALLBACK_TEXT = "I don't have information about that in the knowledge base yet"

    unanswered = db.query(ChatMessage).filter(
        ChatMessage.role == MessageRole.assistant,
        ChatMessage.content.ilike(f"%{FALLBACK_TEXT}%")
    ).order_by(ChatMessage.created_at.desc()).limit(50).all()

    results = []
    for msg in unanswered:
        prev_user_msg = db.query(ChatMessage).filter(
            ChatMessage.session_id == msg.session_id,
            ChatMessage.role == MessageRole.user,
            ChatMessage.created_at <= msg.created_at,
            ChatMessage.id != msg.id
        ).order_by(ChatMessage.created_at.desc()).first()

        results.append({
            "question": prev_user_msg.content if prev_user_msg else "(unknown)",
            "asked_at": str(msg.created_at),
        })

    return results
