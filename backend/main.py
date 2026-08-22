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
from models import Article, ArticleStatus, ContentType, User, SearchLog, Category, Product, ChatSession, ChatMessage, ChatFeedback, MessageRole, UserRole, AuditLog, Media, ArticleSMEReview
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
from repositories.product_repository import ProductRepository
from services.product_service import ProductService

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
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:5174,http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500,https://healthtech-kb-frontend.onrender.com"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Session-Token"],
)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not JWT_SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY must be configured before starting the application."
    )

SECRET_KEY = JWT_SECRET_KEY
ALGORITHM = "HS256"
TOKEN_TTL = 8
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

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Health-Tech Knowledge Base API"
    }

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    production_origin = os.getenv("FRONTEND_ORIGIN", "").strip()

    connect_sources = "'self'"
    if production_origin:
        connect_sources += f" {production_origin}"

    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "img-src 'self' data: https://res.cloudinary.com; "
        f"connect-src {connect_sources};"
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

REFRESH_TOKEN_TTL_DAYS = 30

def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_TTL_DAYS)
    return jwt.encode(
        {"sub": user_id, "type": "refresh", "exp": expire},
        SECRET_KEY, algorithm=ALGORITHM
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

optional_bearer_scheme = HTTPBearer(auto_error=False)

def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_bearer_scheme),
):
    if credentials is None:
        return None

    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")
        role = payload.get("role")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {
            "user_id": user_id,
            "role": role,
        }

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token invalid or expired"
        )

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

def require_reviewer(user: dict = Depends(get_current_user)):
    if user["role"] not in ["editor", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="You need Editor or Admin role to review articles"
        )
    return user

class LoginRequest(BaseModel):
    email: str
    password: str

class AdminCreateUserRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str
    department: Optional[str] = None

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    department: Optional[str] = None

class TagCreateRequest(BaseModel):
    name: str

class FeedbackRequest(BaseModel):
    rating: int
    comment: Optional[str] = None

@app.get("/")
def root():
    return {"message": "Healthtech KB API is running"}

@app.get("/api/v1/homepage")
def get_homepage(db: Session = Depends(get_db)):
    repository = HomepageRepository(db)
    service = HomepageService(repository)
    return service.get_homepage()


@app.get("/api/v1/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()

    results = []

    for category in categories:
        article_count = (
            db.query(Article)
            .filter(
                Article.category_id == category.id,
                Article.status == ArticleStatus.published
            )
            .count()
        )

        results.append({
            "id": str(category.id),
            "name": category.name,
            "description": category.description,
            "article_count": article_count
        })

    return results


@app.get("/api/v1/articles")
def get_articles(
    page: int = 1,
    page_size: int = 20,
    category_id: Optional[str] = None,
    content_type: Optional[str] = None,
    tag_id: Optional[str] = None,
    product_id: Optional[str] = None,
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
    
    if product_id:
        query = query.filter(Article.product_id == product_id)

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
                "category_name": a.category.name if a.category else None,
                "content_type": a.content_type.value if a.content_type else "how_to",
                "view_count":   a.view_count,
                "product_id":   str(a.product_id) if a.product_id else None,
                "product_name": a.product.name if a.product else None,
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
            "category_name": a.category.name if a.category else None,
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
    product_id: str = None,
    log_search: bool = True,
    db: Session = Depends(get_db)
):
    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Search query too short")

    # Normalize common product-name variants so that user queries
    # such as "TaifaCare" and "Taifa Care" retrieve the same content.
    q = re.sub(r"\btaifacare\b", "Taifa Care", q, flags=re.IGNORECASE)

    filters = ["status = 'published'"]
    params = {"q": q}

    if category_id:
        filters.append("category_id = :category_id")
        params["category_id"] = category_id

    if content_type:
        filters.append("content_type = :content_type")
        params["content_type"] = content_type

    if product_id:
        filters.append("product_id = :product_id")
        params["product_id"] = product_id

    tag_join = ""
    if tag_id:
        tag_join = "JOIN article_tags at ON at.article_id = articles.id AND at.tag_id = :tag_id"
        params["tag_id"] = tag_id

    filter_clause = " AND ".join(filters)

    search_query = text(f"""
        SELECT
            articles.id,
            articles.title,
            articles.slug,
            articles.status,
            articles.category_id,
            categories.name AS category_name,
            articles.content_type,
            articles.product_id,
            products.name AS product_name,
            articles.product_version,
            (
                CASE
                    WHEN lower(articles.title) = lower(:q)
                        THEN 1000

                    WHEN articles.title ILIKE '%' || :q || '%'
                        THEN 500

                    WHEN coalesce(
                        string_agg(DISTINCT tags.name, ' '),
                        ''
                    ) ILIKE '%' || :q || '%'
                        THEN 250

                    ELSE 0
                END
                +
                (
                    ts_rank(
                        setweight(
                            to_tsvector(
                                'english',
                                coalesce(articles.title, '')
                            ),
                            'A'
                        )
                        ||
                        setweight(
                            to_tsvector(
                                'english',
                                coalesce(
                                    string_agg(
                                        DISTINCT tags.name,
                                        ' '
                                    ),
                                    ''
                                )
                            ),
                            'B'
                        )
                        ||
                        setweight(
                            to_tsvector(
                                'english',
                                coalesce(
                                    articles.body_markdown,
                                    ''
                                )
                            ),
                            'C'
                        ),
                        plainto_tsquery('english', :q)
                    ) * 100
                )
            ) AS rank
        FROM articles
        {tag_join}
        LEFT JOIN categories
            ON categories.id = articles.category_id
        LEFT JOIN products
            ON products.id = articles.product_id
        LEFT JOIN article_tags article_tag_search
            ON article_tag_search.article_id = articles.id
        LEFT JOIN tags
            ON tags.id = article_tag_search.tag_id
        WHERE {filter_clause}
        GROUP BY
            articles.id,
            articles.title,
            articles.slug,
            articles.status,
            articles.category_id,
            categories.name,
            articles.content_type,
            articles.product_id,
            products.name,
            articles.product_version,
            articles.body_markdown
        HAVING (
            setweight(
                to_tsvector(
                    'english',
                    coalesce(articles.title, '')
                ),
                'A'
            )
            ||
            setweight(
                to_tsvector(
                    'english',
                    coalesce(string_agg(DISTINCT tags.name, ' '), '')
                ),
                'B'
            )
            ||
            setweight(
                to_tsvector(
                    'english',
                    coalesce(articles.body_markdown, '')
                ),
                'C'
            )
        ) @@ plainto_tsquery('english', :q)
        ORDER BY rank DESC
        LIMIT 20
    """)

    rows = db.execute(search_query, params).fetchall()

    if log_search:
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
                "category_name": row.category_name,
                "content_type": row.content_type,
                "product_id": str(row.product_id) if row.product_id else None,
                "product_name": row.product_name,
                "product_version": row.product_version,
            }
            for row in rows
        ]
    }

@app.get("/api/v1/products")
def get_products(db: Session = Depends(get_db)):
    repository = ProductRepository(db)
    service = ProductService(repository)

    return service.get_products()


class ProductCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    version: Optional[str] = None
    icon: Optional[str] = None

@app.get("/api/v1/products/{slug}")
def get_product_details(
    slug: str,
    db: Session = Depends(get_db)
):
    repository = ProductRepository(db)
    service = ProductService(repository)

    result = service.get_product_details(slug)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return result

@app.post("/api/v1/products", status_code=201)
def create_product(
    payload: ProductCreateRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(require_editor)
):
    repository = ProductRepository(db)
    service = ProductService(repository)

    try:
        return service.create_product(
            payload.name,
            payload.description,
            payload.version,
            payload.icon
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

@app.get("/api/v1/admin/feedback")
def get_admin_feedback(
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin)
):
    repository = FeedbackRepository(db)
    service = FeedbackService(repository)

    return service.list_feedback()


@app.get("/api/v1/my-notifications")
def get_my_notifications(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    repository = NotificationRepository(db)
    service = NotificationService(repository)

    return service.get_my_notifications(user["user_id"])

@app.get("/api/v1/content-notifications")
def get_content_notifications(
    db: Session = Depends(get_db),
    user: dict = Depends(require_reviewer)
):
    pending_articles = (
        db.query(Article)
        .filter(
            Article.status == ArticleStatus.pending_review
        )
        .order_by(Article.created_at.desc())
        .all()
    )

    return [
        {
            "id": f"review-{article.id}",
            "type": "article_review",
            "title": "Article awaiting review",
            "message": article.title,
            "slug": article.slug,
            "article_title": article.title,
            "created_at": str(article.created_at),
        }
        for article in pending_articles
    ]

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
@limiter.limit("5/10minute")
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
        create_refresh_token,
        TOKEN_TTL
    )

    return service.login(
        payload.email,
        payload.password
    )

class RefreshRequest(BaseModel):
    refresh_token: str


@app.post("/api/v1/auth/refresh")
def refresh_access_token(
    payload: RefreshRequest,
    db: Session = Depends(get_db)
):
    try:
        decoded = jwt.decode(
            payload.refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token"
        )

    if decoded.get("type") != "refresh":
        raise HTTPException(
            status_code=401,
            detail="Not a valid refresh token"
        )

    user = db.query(User).filter(
        User.id == decoded.get("sub")
    ).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="User not found or inactive"
        )

    new_access_token = create_token(
        str(user.id),
        user.role.value
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": TOKEN_TTL * 3600,
    }


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
        create_refresh_token,
        TOKEN_TTL
    )

    return service.register(
        payload.username,
        payload.email,
        payload.password,
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
    product_id:    Optional[str] = None
    product_version: Optional[str] = None
class ArticleUpdateRequest(BaseModel):
    title:         Optional[str] = None
    body_markdown: Optional[str] = None
    category_id:   Optional[str] = None
    tag_ids:       Optional[list[str]] = None
    status:        Optional[str] = None
    content_type:  Optional[str] = None
    product_id:    Optional[str] = None
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
        product_id=payload.product_id if payload.product_id else None,
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

    if payload.product_id is not None:
        article.product_id = payload.product_id if payload.product_id else None

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
def approve_article(slug: str, db: Session = Depends(get_db), user: dict = Depends(require_admin)):

    print("APPROVE USER:", user)
    article = db.query(Article).filter(Article.slug == slug).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if article.status != ArticleStatus.pending_review:
        raise HTTPException(status_code=400, detail="Article is not pending review")

    now = datetime.now(timezone.utc)

    article.status = ArticleStatus.published
    article.published_at = now
    article.last_reviewed_at = now

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
def reject_article(slug: str, payload: RejectRequest, db: Session = Depends(get_db), user: dict = Depends(require_admin)):
    article = db.query(Article).filter(Article.slug == slug).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if article.status != ArticleStatus.pending_review:
        raise HTTPException(status_code=400, detail="Article is not pending review")

    article.status = ArticleStatus.draft
    article.last_reviewed_at = datetime.now(timezone.utc)

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

@app.post("/api/v1/chat", status_code=200)
@limiter.limit("20/minute")
def chat(
    request: Request,
    payload: ChatRequest,
    db: Session = Depends(get_db),
    user: Optional[dict] = Depends(get_optional_user),
):

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
    
    search_text = payload.message.strip()

    # Normalize common product-name variants before knowledge retrieval.
    # This keeps "TaifaCare" consistent with articles written as
    # "Taifa Care".
    search_text = re.sub(
        r"\btaifacare\b",
        "Taifa Care",
        search_text,
        flags=re.IGNORECASE
    )

    relevant_articles = []
    prior_messages = []

    # --------------------------------------------------------
    # Determine product context.
    # The current embedded assistant is Taifa Care-first.
    # Explicit KenyaEMR questions are routed to KenyaEMR.
    # --------------------------------------------------------
    product_slug = "taifa-care"

    if re.search(
        r"\bkenya\s*emr\b|\bkenyaemr\b",
        search_text,
        flags=re.IGNORECASE
    ):
        product_slug = "kenyaemr"

    if payload.screen_context:
        context_lower = payload.screen_context.lower()

        if "kenyaemr" in context_lower or "kenya emr" in context_lower:
            product_slug = "kenyaemr"
        elif "taifa" in context_lower:
            product_slug = "taifa-care"

    if payload.session_token:
        existing_session = db.query(ChatSession).filter(
            ChatSession.session_token == payload.session_token
        ).first()

        if existing_session:
            prior_msgs = (
                db.query(ChatMessage)
                .filter(ChatMessage.session_id == existing_session.id)
                .order_by(ChatMessage.created_at)
                .limit(10)
                .all()
            )

            prior_messages = [
                {"role": m.role.value, "content": m.content}
                for m in prior_msgs
            ]

    # Search the entire question as one PostgreSQL full-text query.
    # This prevents unrelated articles from being selected because of
    # individual generic words such as "hospital", "patient", or "system".
    chat_search = text("""
        SELECT
            a.id,
            a.title,
            a.slug,
            a.body_markdown,
            a.content_type,
            ts_rank(
                setweight(
                    to_tsvector('english', coalesce(a.title, '')),
                    'A'
                )
                ||
                setweight(
                    to_tsvector(
                        'english',
                        coalesce(string_agg(DISTINCT t.name, ' '), '')
                    ),
                    'B'
                )
                ||
                setweight(
                    to_tsvector('english', coalesce(a.body_markdown, '')),
                    'C'
                ),
                plainto_tsquery('english', :q)
            ) AS rank
        FROM articles a
        JOIN products p
            ON p.id = a.product_id
        LEFT JOIN article_tags at
            ON at.article_id = a.id
        LEFT JOIN tags t
            ON t.id = at.tag_id
        WHERE a.status = 'published'
          AND p.slug = :product_slug
        GROUP BY
            a.id,
            a.title,
            a.slug,
            a.body_markdown,
            a.content_type
        HAVING (
            setweight(
                to_tsvector('english', coalesce(a.title, '')),
                'A'
            )
            ||
            setweight(
                to_tsvector(
                    'english',
                    coalesce(string_agg(DISTINCT t.name, ' '), '')
                ),
                'B'
            )
            ||
            setweight(
                to_tsvector('english', coalesce(a.body_markdown, '')),
                'C'
            )
        ) @@ plainto_tsquery('english', :q)
        ORDER BY rank DESC
        LIMIT 3
    """)

    chat_rows = db.execute(
        chat_search,
        {
            "q": search_text,
            "product_slug": product_slug,
        }
    ).fetchall()

    relevant_articles = [
        db.query(Article)
        .filter(Article.id == row.id)
        .first()
        for row in chat_rows
    ]

    relevant_articles = [
        article for article in relevant_articles
        if article is not None
    ]

    # ------------------------------------------------------------
    # Keyword fallback for natural-language questions
    # ------------------------------------------------------------
    # The strict PostgreSQL full-text query may return zero results
    # when a natural-language question contains too many words.
    # In that case, search meaningful words across article title,
    # body, and tags before giving the final no-results response.
    if not relevant_articles:
        stop_words = {
            "a", "an", "and", "are", "can", "could", "do", "does",
            "for", "how", "i", "in", "is", "it", "me", "my", "of",
            "on", "please", "the", "to", "what", "where", "which",
            "who", "with", "would", "you", "your"
        }

        raw_words = (
            search_text
            .replace("?", " ")
            .replace(",", " ")
            .replace(".", " ")
            .replace(":", " ")
            .replace(";", " ")
            .split()
        )

        keywords = []
        for word in raw_words:
            clean = word.strip().lower()
            if len(clean) >= 3 and clean not in stop_words:
                if clean not in keywords:
                    keywords.append(clean)

        fallback_candidates = []

        if keywords:
            for article in (
                db.query(Article)
                .join(Product, Product.id == Article.product_id)
                .filter(
                    Article.status == ArticleStatus.published,
                    Product.slug == product_slug,
                )
                .all()
            ):
                title_text = (article.title or "").lower()
                body_text = (article.body_markdown or "").lower()

                tag_text = " ".join(
                    tag.name.lower()
                    for link in article.tags
                    if getattr(link, "tag", None) is not None
                    for tag in [link.tag]
                )

                searchable = " ".join([
                    title_text,
                    body_text,
                    tag_text,
                ])

                matched = [
                    keyword
                    for keyword in keywords
                    if keyword in searchable
                ]

                if matched:
                    title_matches = sum(
                        1
                        for keyword in matched
                        if keyword in title_text
                    )

                    body_matches = sum(
                        1
                        for keyword in matched
                        if keyword in body_text
                    )

                    tag_matches = sum(
                        1
                        for keyword in matched
                        if keyword in tag_text
                    )

                    score = (
                        title_matches * 40
                        + tag_matches * 20
                        + body_matches * 10
                        + len(matched) * 5
                    )

                    # Do not treat a single weak body match as
                    # sufficient evidence for a grounded answer.
                    if (
                        len(matched) >= 2
                        or title_matches >= 1
                        or tag_matches >= 1
                    ):
                        fallback_candidates.append(
                            (score, article)
                        )

            fallback_candidates.sort(
                key=lambda item: (
                    item[0],
                    item[1].view_count or 0
                ),
                reverse=True
            )

            relevant_articles = [
                article
                for _, article in fallback_candidates[:3]
            ]

    if not relevant_articles:
        return {
            "message_id": None,
            "session_token": payload.session_token,
            "question": payload.message,
            "answer": (
                "I couldn't find an approved knowledge-base article that answers "
                "that question yet. I don't want to guess or provide unverified "
                "guidance. Please try a more specific question or contact your "
                "system administrator for assistance."
            ),
            "sources_used": 0,
            "articles_found": []
        }

    context = "\n\n".join([
        f"Article: {a.title}\n{a.body_markdown}"
        for a in relevant_articles
    ])

    context_note = (
        "Use ONLY the following published knowledge-base articles to answer. "
        "Do not use outside knowledge. If the articles do not contain enough "
        "information to answer the question, say that the approved knowledge "
        "base does not contain the answer.\n\n"
        f"{context}"
    )

    prompt = f"""You are the Taifa Care Knowledge Base Assistant.

You must operate as a STRICT DOCUMENTATION RETRIEVAL ASSISTANT.

CRITICAL RULES:
- Use ONLY the supplied published knowledge-base articles.
- Do NOT use general knowledge, memory, assumptions, common practice, or information from the question itself as facts.
- Do NOT invent button names, modules, fields, notifications, identifiers, SMS behaviour, clinical instructions, or workflow steps.
- Do NOT infer a missing step.
- Do NOT paraphrase a step into a more specific instruction than the source provides.
- Prefer copying the wording of the supplied article when describing workflow steps.
- You may shorten or reorder supported sentences for clarity, but every factual statement must be traceable to the supplied text.
- If the supplied articles do not directly answer the question, respond exactly:
  "The approved knowledge base does not contain enough information to answer that question."
- Never provide an answer from outside the supplied knowledge base.
- Keep answers concise.

PRODUCT CONTEXT:
{product_slug}

SOURCE ARTICLES:
{context}

USER QUESTION:
{payload.message}

Return only an answer grounded in the source articles."""

    conversation_messages = prior_messages + [{"role": "user", "content": prompt}]

    response = groq_client.chat.completions.create(
        model=os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
        messages=conversation_messages
    )

    session = None
    if payload.session_token:
        existing_session = db.query(ChatSession).filter(
            ChatSession.session_token == payload.session_token
        ).first()

        if existing_session:
            if (
                existing_session.user_id is not None
                and user is not None
                and str(existing_session.user_id) != str(user["user_id"])
            ):
                raise HTTPException(
                    status_code=403,
                    detail="Chat session does not belong to the authenticated user"
                )

            if existing_session.user_id is None and user is not None:
                existing_session.user_id = user["user_id"]
                db.commit()
            
            session = existing_session

    if not session:
        session = ChatSession(
            id=uuid.uuid4(),
            user_id=user["user_id"] if user else None,
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
def submit_chat_feedback(
    message_id: str,
    payload: ChatFeedbackRequest,
    db: Session = Depends(get_db),
    user: Optional[dict] = Depends(get_optional_user),
):
    message = (
        db.query(ChatMessage)
        .filter(ChatMessage.id == message_id)
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    if message.role != MessageRole.assistant:
        raise HTTPException(
            status_code=400,
            detail="Feedback can only be submitted for assistant responses"
        )

    user_id = user["user_id"] if user else None

    existing = (
        db.query(ChatFeedback)
        .filter(
            ChatFeedback.message_id == message.id,
            ChatFeedback.user_id == user_id
        )
        .first()
    )

    if existing:
        existing.helpful = payload.helpful
    else:
        db.add(
            ChatFeedback(
                id=uuid.uuid4(),
                message_id=message.id,
                user_id=user_id,
                helpful=payload.helpful,
            )
        )

    db.commit()

    return {
        "message": "Feedback recorded",
        "message_id": message_id,
        "helpful": payload.helpful,
    }

@app.post("/api/v1/admin/users", status_code=201)
def create_admin_user(
    payload: AdminCreateUserRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin)
):
    if payload.role not in ["viewer", "editor"]:
        raise HTTPException(
            status_code=400,
            detail="Admin can only create Viewer or Editor accounts"
        )

    existing = db.query(User).filter(
        (User.email == payload.email) |
        (User.username == payload.username)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Username or email already exists"
        )

    new_user = User(
        id=uuid.uuid4(),
        username=payload.username,
        email=payload.email,
        password_hash=pwd_context.hash(payload.password),
        role=UserRole(payload.role),
        department=payload.department,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_audit(
        db,
        user["user_id"],
        "create_user",
        "user",
        str(new_user.id),
        f"role={payload.role}"
    )

    return {
        "id": str(new_user.id),
        "username": new_user.username,
        "email": new_user.email,
        "role": new_user.role.value,
        "department": new_user.department,
        "is_active": new_user.is_active,
        "message": "User created successfully"
    }

@app.get("/api/v1/admin/users")
def list_users(
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin)
):
    users = db.query(User).order_by(User.created_at.desc()).all()

    return [
        {
            "id": str(u.id),
            "username": u.username,
            "email": u.email,
            "role": u.role.value,
            "department": u.department,
            "is_active": u.is_active,
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

    if payload.role not in ["viewer", "editor", "admin"]:
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

    search_trend_rows = db.execute(
        text("""
            SELECT
                days.day::date AS search_date,
                COUNT(sl.id)::int AS searches
            FROM generate_series(
                CURRENT_DATE - INTERVAL '29 days',
                CURRENT_DATE,
                INTERVAL '1 day'
            ) AS days(day)
            LEFT JOIN search_logs sl
                ON DATE(sl.searched_at) = days.day::date
            GROUP BY days.day
            ORDER BY days.day
        """)
    ).fetchall()

    search_trend = [
        {
            "date": str(row.search_date),
            "searches": row.searches,
        }
        for row in search_trend_rows
    ]

    from datetime import datetime, timedelta, timezone
    cutoff = datetime.now(timezone.utc) - timedelta(days=180)

    stale_articles = db.query(
        Article.title,
        Article.slug,
        Article.last_reviewed_at
    ).filter(
        Article.status == ArticleStatus.published,
        Article.last_reviewed_at.isnot(None),
        Article.last_reviewed_at < cutoff
    ).order_by(
        Article.last_reviewed_at
    ).limit(20).all()

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
        "search_trend": search_trend,
        "stale_articles": [
            {
                "title": t,
                "slug": s,
                "last_reviewed_at": str(r)
            }
            for t, s, r in stale_articles
        ],
    }

@app.get("/api/v1/admin/search-trend")
def get_search_trend(db: Session = Depends(get_db), user: dict = Depends(require_admin)):
    from sqlalchemy import func, cast, Date
    from datetime import datetime, timedelta, timezone

    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    results = db.query(
            cast(SearchLog.searched_at, Date).label("day"),
            func.count(SearchLog.id).label("count")
        ) \
        .filter(SearchLog.searched_at >= cutoff) \
        .group_by("day").order_by("day").all()

    return [{"date": str(day), "count": count} for day, count in results]

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
def get_unanswered_questions(
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin),
):
    """
    Return genuine chatbot knowledge gaps.

    A question is considered an unanswered knowledge gap only when the
    corresponding assistant response is the application's explicit
    no-approved-content response.

    Generic greetings and conversational prompts are excluded.
    Repeated identical questions are grouped together.
    """

    generic_phrases = {
        "hi",
        "hello",
        "hey",
        "hallo",
        "how are you",
        "who are you",
        "what can you do",
        "what can you help me with",
        "help",
        "thanks",
        "thank you",
        "good morning",
        "good afternoon",
        "good evening",
    }

    no_answer_markers = (
        "i couldn't find an approved knowledge-base article",
        "the approved knowledge base does not contain",
        "the approved knowledge base does not contain enough information",
        "i couldn't find an approved knowledge-base article that answers",
    )

    user_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.role == MessageRole.user)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    grouped = {}

    for user_message in user_messages:
        question = (user_message.content or "").strip()

        if not question:
            continue

        normalized = re.sub(r"\s+", " ", question.lower()).strip()
        normalized = normalized.strip(" ?!.,")

        # Ignore ordinary conversation/greetings.
        if normalized in generic_phrases:
            continue

        # Avoid treating tiny fragments as documentation gaps.
        if len(normalized) < 5:
            continue

        session_messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == user_message.session_id)
            .filter(ChatMessage.created_at >= user_message.created_at)
            .order_by(ChatMessage.created_at.asc())
            .limit(2)
            .all()
        )

        assistant_response = None

        for message in session_messages:
            if message.id != user_message.id and message.role == MessageRole.assistant:
                assistant_response = message
                break

        if not assistant_response:
            continue

        answer = (assistant_response.content or "").strip().lower()

        if not any(marker in answer for marker in no_answer_markers):
            continue

        key = normalized

        if key not in grouped:
            grouped[key] = {
                "question": question,
                "count": 0,
                "asked_count": 0,
                "created_at": user_message.created_at,
                "latest_at": user_message.created_at,
            }

        grouped[key]["count"] += 1
        grouped[key]["asked_count"] = grouped[key]["count"]

        if user_message.created_at > grouped[key]["latest_at"]:
            grouped[key]["latest_at"] = user_message.created_at

    results = sorted(
        grouped.values(),
        key=lambda item: (
            item["count"],
            item["latest_at"],
        ),
        reverse=True,
    )[:20]

    return {
        "results": results,
        "total": len(results),
    }

import os
import secrets
import hashlib
import hmac
import smtplib
import uuid as _password_reset_uuid

from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from sqlalchemy import text as _sql_text
from passlib.context import CryptContext as _ResetCryptContext
import re

_password_reset_pwd_context = _ResetCryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str


def _ensure_password_reset_table(db: Session):
    db.execute(
        _sql_text(
            """
            CREATE TABLE IF NOT EXISTS password_reset_otps (
                id UUID PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp_hash VARCHAR(64) NOT NULL,
                expires_at TIMESTAMPTZ NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                used_at TIMESTAMPTZ NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
    )
    db.commit()


def _hash_reset_otp(otp: str) -> str:
    secret = os.getenv(
        "JWT_SECRET_KEY",
        "development-reset-secret"
    )

    raw = f"{secret}:{otp}".encode()

    return hashlib.sha256(raw).hexdigest()


def _send_password_reset_otp(email: str, otp: str):
    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    smtp_from = (
        os.getenv("SMTP_FROM", "").strip()
        or smtp_username
        or "no-reply@healthtech.local"
    )

    dev_mode = (
        os.getenv("OTP_DEV_MODE", "true").lower()
        == "true"
    )

    if not smtp_host or not smtp_username or not smtp_password:
        if dev_mode:
            print(
                f"[PASSWORD RESET][DEV MODE] "
                f"OTP for {email}: {otp}"
            )
            return

        raise RuntimeError(
            "SMTP is not configured for password reset emails."
        )

    message = EmailMessage()

    message["Subject"] = "Taifa Care password reset code"
    message["From"] = smtp_from
    message["To"] = email

    message.set_content(
        f"""Hello,

We received a request to reset your Taifa Care HMIS password.

Your verification code is:

{otp}

This code expires in 10 minutes.

If you did not request a password reset, you can safely ignore this message.

Taifa Care HMIS
"""
    )

    use_tls = (
        os.getenv("SMTP_USE_TLS", "true").lower()
        == "true"
    )

    with smtplib.SMTP(
        smtp_host,
        smtp_port,
        timeout=20
    ) as server:

        if use_tls:
            server.starttls()

        server.login(
            smtp_username,
            smtp_password
        )

        server.send_message(message)



@app.post("/api/v1/auth/forgot-password")
@limiter.limit("5/minute")
def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    _ensure_password_reset_table(db)

    email = payload.email.strip().lower()

    generic_response = {
        "message":
            "If an account exists for this email, "
            "a verification code has been sent."
    }

    user = db.query(User).filter(
        User.email.ilike(email)
    ).first()

    if not user or not user.is_active:
        return generic_response

    latest = db.execute(
        _sql_text(
            """
            SELECT created_at
            FROM password_reset_otps
            WHERE email = :email
            ORDER BY created_at DESC
            LIMIT 1
            """
        ),
        {"email": email}
    ).fetchone()

    if latest and latest[0]:
        created_at = latest[0]

        if created_at.tzinfo is None:
            created_at = created_at.replace(
                tzinfo=timezone.utc
            )

        elapsed = (
            datetime.now(timezone.utc)
            - created_at
        ).total_seconds()

        if elapsed < 60:
            return generic_response

    db.execute(
        _sql_text(
            """
            UPDATE password_reset_otps
            SET used_at = NOW()
            WHERE email = :email
              AND used_at IS NULL
            """
        ),
        {"email": email}
    )

    otp = f"{secrets.randbelow(1_000_000):06d}"
    otp_hash = _hash_reset_otp(otp)

    db.execute(
        _sql_text(
            """
            INSERT INTO password_reset_otps (
                id,
                email,
                otp_hash,
                expires_at,
                attempts
            )
            VALUES (
                :id,
                :email,
                :otp_hash,
                :expires_at,
                0
            )
            """
        ),
        {
            "id":
                str(_password_reset_uuid.uuid4()),
            "email": email,
            "otp_hash": otp_hash,
            "expires_at":
                datetime.now(timezone.utc)
                + timedelta(minutes=10),
        }
    )

    db.commit()

    try:
        _send_password_reset_otp(
            email,
            otp
        )
    except Exception as exc:
        print(
            "[PASSWORD RESET] "
            f"Email delivery failed: {exc}"
        )

    return generic_response


@app.post("/api/v1/auth/reset-password")
@limiter.limit("10/minute")
def reset_password(
    request: Request,
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    _ensure_password_reset_table(db)

    email = payload.email.strip().lower()
    otp = payload.otp.strip()
    new_password = payload.new_password

    if not otp.isdigit() or len(otp) != 6:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification code"
        )

    if len(new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail=
                "New password must be at least 8 characters"
        )

    user = db.query(User).filter(
        User.email.ilike(email)
    ).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=400,
            detail="Unable to reset password"
        )

    record = db.execute(
        _sql_text(
            """
            SELECT
                id,
                otp_hash,
                expires_at,
                attempts,
                used_at
            FROM password_reset_otps
            WHERE email = :email
            ORDER BY created_at DESC
            LIMIT 1
            """
        ),
        {"email": email}
    ).fetchone()

    if not record:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification code"
        )

    record_id = record[0]
    stored_hash = record[1]
    expires_at = record[2]
    attempts = int(record[3] or 0)
    used_at = record[4]

    if used_at is not None:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification code"
        )

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(
            tzinfo=timezone.utc
        )

    if datetime.now(timezone.utc) >= expires_at:
        raise HTTPException(
            status_code=400,
            detail="Verification code has expired"
        )

    if attempts >= 5:
        raise HTTPException(
            status_code=400,
            detail="Too many incorrect attempts"
        )

    submitted_hash = _hash_reset_otp(otp)

    if not hmac.compare_digest(
        stored_hash,
        submitted_hash
    ):
        db.execute(
            _sql_text(
                """
                UPDATE password_reset_otps
                SET attempts = attempts + 1
                WHERE id = :id
                """
            ),
            {"id": str(record_id)}
        )

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Invalid verification code"
        )

    user.password_hash = (
        _password_reset_pwd_context.hash(
            new_password
        )
    )

    user.updated_at = datetime.now(timezone.utc)

    db.execute(
        _sql_text(
            """
            UPDATE password_reset_otps
            SET used_at = NOW()
            WHERE id = :id
            """
        ),
        {"id": str(record_id)}
    )

    db.commit()

    return {
        "message":
            "Password reset successfully. "
            "You can now sign in."
    }

