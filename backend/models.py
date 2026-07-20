
import uuid
from sqlalchemy import Column, String, Text, Boolean, Integer, SmallInteger
from sqlalchemy import ForeignKey, Enum, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base
import enum

class UserRole(str, enum.Enum):
    viewer = "viewer"
    editor = "editor"
    admin  = "admin"

class ArticleStatus(str, enum.Enum):
    draft     = "draft"
    pending_review   = "pending_review"
    published = "published"
    archived  = "archived"

class MessageRole(str, enum.Enum):
    user      = "user"
    assistant = "assistant"
    system    = "system"

class User(Base):
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username      = Column(String(80), nullable=False, unique=True)
    email         = Column(String(255), nullable=False, unique=True)
    password_hash = Column(Text, nullable=False)
    role          = Column(Enum(UserRole), nullable=False, default=UserRole.viewer)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    articles      = relationship("Article", back_populates="author")
    chat_sessions = relationship("ChatSession", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name        = Column(String(120), nullable=False, unique=True)
    slug        = Column(String(120), nullable=False, unique=True)
    description = Column(Text)
    parent_id   = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    sort_order  = Column(Integer, default=0)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    articles    = relationship("Article", back_populates="category")

class Article(Base):
    __tablename__ = "articles"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title         = Column(String(300), nullable=False)
    slug          = Column(String(300), nullable=False, unique=True)
    body_markdown = Column(Text, nullable=False)
    body_html     = Column(Text)
    status        = Column(Enum(ArticleStatus), default=ArticleStatus.draft)
    category_id   = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    author_id     = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    view_count    = Column(Integer, default=0)
    published_at  = Column(DateTime(timezone=True), nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    author        = relationship("User", back_populates="articles")
    category      = relationship("Category", back_populates="articles")
    feedback      = relationship("ArticleFeedback", back_populates="article")
    tags          = relationship("ArticleTag", back_populates="article")

class ArticleFeedback(Base):
    __tablename__ = "article_feedback"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"), nullable=False)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    rating     = Column(SmallInteger, nullable=False)   
    comment    = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    article    = relationship("Article", back_populates="feedback")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id       = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    session_token = Column(Text, nullable=False, unique=True)
    source_url    = Column(Text)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    user          = relationship("User", back_populates="chat_sessions")
    messages      = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id  = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"), nullable=False)
    role        = Column(Enum(MessageRole), nullable=False)
    content     = Column(Text, nullable=False)
    token_count = Column(Integer)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    session     = relationship("ChatSession", back_populates="messages")

class Tag(Base):
    __tablename__ = "tags"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name       = Column(String(60), nullable=False, unique=True)
    slug       = Column(String(60), nullable=False, unique=True)
    color_hex  = Column(String(7), default="#0B1A36")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    articles   = relationship("ArticleTag", back_populates="tag")

class ArticleTag(Base):
    __tablename__ = "article_tags"

    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"), primary_key=True)
    tag_id     = Column(UUID(as_uuid=True), ForeignKey("tags.id"), primary_key=True)

    article    = relationship("Article", back_populates="tags")
    tag        = relationship("Tag", back_populates="articles")

class SearchLog(Base):
    __tablename__ = "search_logs"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id       = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    query         = Column(Text, nullable=False)
    results_count = Column(Integer, default=0)
    searched_at   = Column(DateTime(timezone=True), server_default=func.now())