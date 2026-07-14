 Healthtech KB & HMIS Chatbot — Architecture

 System Architecture

```mermaid
graph TD
    A[External HMIS Site\nTiberbu / Taifa Care] -->|loads widget.iife.js\nvia script tag| B[React Widget\nEmbeddable Chatbot Bubble]
    C[React Frontend\nKnowledge Base Portal] -->|HTTP API calls| D[FastAPI Backend\nOrchestrator]
    B -->|POST /api/v1/chat\nCORS protected| D
    D -->|1 Query articles\nSQLAlchemy ORM| E[(PostgreSQL\nhealthtech_kb\n9 tables)]
    E -->|2 Return matching articles| D
    D -->|3 Build prompt\narticles + question| D
    D -->|4 Send prompt to LLM| F[Groq API\nLLaMA 3.1 Model]
    F -->|5 Return concise answer| D
    D -->|6 Log conversation| E
    D -->|7 Return answer| B
    D -->|7 Return answer| C
```

 How the RAG Pipeline Works

The FastAPI backend is the orchestrator — it controls everything:

```mermaid
sequenceDiagram
    actor User
    participant Widget as React Widget
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant LLM as Groq LLaMA 3.1

    User->>Widget: Types question
    Widget->>API: POST /api/v1/chat
    Note over API: Step 1 - Retrieve
    API->>DB: Search articles by keywords
    DB-->>API: Return matching articles
    Note over API: Step 2 - Augment
    API->>API: Build prompt with\nquestion + articles as context
    Note over API: Step 3 - Generate
    API->>LLM: Send augmented prompt
    LLM-->>API: Return concise 3-5 sentence answer
    Note over API: Step 4 - Log & Return
    API->>DB: Save chat session and messages
    API-->>Widget: Return answer + sources
    Widget-->>User: Display answer
```

 Why Widget and Frontend are Separate

```mermaid
graph LR
    A[Our Users\nhealthcare admins\neditors] -->|login to| B[React Frontend\nfull knowledge base portal\narticle management\nsearch interface]
    C[Hospital Staff\nnurses lab techs\npharmacists] -->|use daily| D[Tiberbu HMIS\nexternal system\nnot our site]
    D -->|loads via\nscript tag| E[React Widget\nwidget.iife.js\nembeddable chatbot]
    B -->|integrated chat| F[FastAPI Backend]
    E -->|chat API calls| F
```

 Database Schema

```mermaid
erDiagram
    USERS ||--o{ ARTICLES : writes
    USERS ||--o{ CHAT_SESSIONS : owns
    USERS ||--o{ ARTICLE_FEEDBACK : gives
    CATEGORIES ||--o{ ARTICLES : contains
    ARTICLES ||--o{ ARTICLE_TAGS : tagged
    TAGS ||--o{ ARTICLE_TAGS : applied
    ARTICLES ||--o{ ARTICLE_FEEDBACK : receives
    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : contains
    USERS ||--o{ SEARCH_LOGS : performs
```