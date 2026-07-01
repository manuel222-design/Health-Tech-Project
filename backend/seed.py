
from database import SessionLocal
from models import User, UserRole, Category, Article, ArticleStatus
import uuid
import hashlib

def seed():
    db = SessionLocal()

    try:
        print(" Starting seed...")

        existing_user = db.query(User).filter(User.email == "admin@healthtech.co.ke").first()

        if existing_user:
            print("Admin user already exists — skipping")
            admin = existing_user
        else:
            admin = User(
                id=uuid.uuid4(),
                username="Dr. Emmanuel Rotich",
                email="admin@healthtech.co.ke",
                password_hash=hashlib.sha256("Admin@1234".encode()).hexdigest(),
                role=UserRole.admin,
                is_active=True
            )
            db.add(admin)
            db.flush()
            print("Admin user created — admin@healthtech.co.ke / Admin@1234")

        existing_cat = db.query(Category).filter(Category.slug == "hmis-guides").first()

        if existing_cat:
            print(" Category already exists — skipping")
            category = existing_cat
        else:
            category = Category(
                id=uuid.uuid4(),
                name="HMIS Guides",
                slug="hmis-guides",
                description="Step-by-step guides for using the Health Management Information System",
                sort_order=1
            )
            db.add(category)
            db.flush()
            print(" Category created — HMIS Guides")

        existing_article = db.query(Article).filter(Article.slug == "how-to-register-a-patient").first()

        if existing_article:
            print(" Article already exists — skipping")
        else:
            article = Article(
                id=uuid.uuid4(),
                title="How to Register a New Patient in HMIS",
                slug="how-to-register-a-patient",
                body_markdown="""
                Overview
                This guide walks healthcare workers through the step-by-step process of registering a new patient in the Health Management Information System (HMIS).
                
                Prerequisites
                - You must be logged in with at least **Viewer** access
                - The patient must have a valid national ID or birth certificate
                
                Steps
                
                Step 1 — Open the Patient Registration Module
                Navigate to **Patients > New Registration** from the main dashboard.
                
                Step 2 — Fill in Patient Demographics
                Enter the following mandatory fields:
                - Full name
                - Date of birth
                - Gender
                - National ID number
                - Next of kin contact
                
                Step 3 — Assign a Facility Number
                The system will automatically generate a unique facility patient number.
                Record this number on the patient's physical file.
                
                Step 4 — Save and Confirm
                Click **Save Patient** and confirm the details are correct.
                A confirmation SMS will be sent to the patient's registered phone number.
                
                Notes
                If the patient has been registered at another facility, use the **Patient Transfer** module instead of creating a new registration.
                """,
                body_html="<h2>Overview</h2><p>This guide walks healthcare workers through patient registration.</p>",
                status=ArticleStatus.published,
                category_id=category.id,
                author_id=admin.id,
                view_count=0
            )
            db.add(article)
            print("Sample article created — How to Register a New Patient in HMIS")

        db.commit()
        print("")
        print("Seed complete! Your database now has real data.")
        print("")
        print("   Open Swagger UI and test these endpoints:")
        print("   GET  http://127.0.0.1:8000/api/v1/articles")
        print("   POST http://127.0.0.1:8000/api/v1/auth/login")

    except Exception as e:
        db.rollback()
        print(f" Error during seed: {e}")
        raise

    finally:
        db.close()

if __name__ == "__main__":
    seed()