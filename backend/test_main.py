
import uuid
import pytest
from fastapi.testclient import TestClient # type: ignore
from main import app

client = TestClient(app)


def test_root_endpoint():
    """API should return running message"""
    response = client.get("/")
    assert response.status_code == 200
    assert "running" in response.json()["message"].lower()

def test_get_all_articles():
    """Should return paginated published articles."""
    response = client.get("/api/v1/articles")

    assert response.status_code == 200

    data = response.json()

    assert "results" in data
    assert "pagination" in data
    assert isinstance(data["results"], list)
    assert len(data["results"]) > 0

    pagination = data["pagination"]

    assert pagination["page"] == 1
    assert pagination["page_size"] == 20
    assert pagination["total_count"] > 0
    assert pagination["total_pages"] >= 1

def test_get_article_by_slug():
    """Should return one article by slug"""
    response = client.get("/api/v1/articles/how-to-register-a-patient")
    assert response.status_code == 200
    assert response.json()["slug"] == "how-to-register-a-patient"
    assert "body_markdown" in response.json()

def test_get_article_not_found():
    """Should return 404 for non-existent article"""
    response = client.get("/api/v1/articles/this-does-not-exist")
    assert response.status_code == 404

def test_search_articles():
    """Should return results for valid search query"""
    response = client.get("/api/v1/articles/search?q=patient")
    assert response.status_code == 200
    assert "results" in response.json()
    assert response.json()["total_results"] > 0

def test_search_too_short():
    """Should return 400 for search query less than 2 characters"""
    response = client.get("/api/v1/articles/search?q=a")
    assert response.status_code == 400
def test_submit_feedback():
    """Should successfully submit article feedback"""
    response = client.post(
        "/api/v1/articles/how-to-register-a-patient/feedback",
        json={
            "rating": 5,
            "comment": "Very helpful article"
        }
    )

    assert response.status_code == 201
    assert response.json()["message"] == "Feedback submitted successfully"


def test_submit_feedback_invalid_rating():
    """Should reject ratings outside the 1-5 range"""
    response = client.post(
        "/api/v1/articles/how-to-register-a-patient/feedback",
        json={
            "rating": 6,
            "comment": "Invalid rating"
        }
    )

    assert response.status_code == 400
    assert "Rating must be between 1 and 5" in response.json()["detail"]


def test_submit_feedback_article_not_found():
    """Should return 404 for a non-existent article"""
    response = client.post(
        "/api/v1/articles/this-article-does-not-exist/feedback",
        json={
            "rating": 5,
            "comment": "Test"
        }
    )

    assert response.status_code == 404


def test_get_feedback_summary():
    """Should return article feedback summary"""
    response = client.get(
        "/api/v1/articles/how-to-register-a-patient/feedback/summary"
    )

    assert response.status_code == 200
    assert "average_rating" in response.json()
    assert "total_ratings" in response.json()

def test_get_categories():
    """Should return list of categories"""
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0


def test_login_success():
    """Should return JWT token for valid credentials"""
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@healthtech.co.ke",
        "password": "Admin@1234"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["role"] == "admin"

def test_login_wrong_password():
    """Should return 401 for wrong password"""
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@healthtech.co.ke",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_login_wrong_email():
    """Should return 401 for non-existent email"""
    response = client.post("/api/v1/auth/login", json={
        "email": "nobody@fake.com",
        "password": "Admin@1234"
    })
    assert response.status_code == 401


def test_login_then_create_article():
    """Full flow: login as admin then create an article"""
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@healthtech.co.ke",
        "password": "Admin@1234"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    slug = f"test-article-pytest-{uuid.uuid4().hex[:8]}"

    article_res = client.post(
        "/api/v1/articles",
        json={
            "title": "Test Article from Pytest",
            "slug": slug,
            "body_markdown": "## Test\nThis is a test article.",
            "status": "draft"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert article_res.status_code == 201
    assert article_res.json()["slug"] == slug

def test_create_article_without_token():
    """Should return 401 when no token is provided"""
    response = client.post("/api/v1/articles", json={
        "title": "Unauthorized Article",
        "slug": "unauthorized-article",
        "body_markdown": "## Test",
        "status": "draft"
    })
    assert response.status_code == 401

def test_login_then_delete_article():
    """Full flow: login as admin then delete the test article"""
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@healthtech.co.ke",
        "password": "Admin@1234"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    slug = f"test-delete-article-{uuid.uuid4().hex[:8]}"

    create_res = client.post(
        "/api/v1/articles",
        json={
            "title": "Test Article for Delete",
            "slug": slug,
            "body_markdown": "## Test\nThis article will be archived.",
            "status": "draft"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    assert create_res.status_code == 201

    delete_res = client.delete(
        f"/api/v1/articles/{slug}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert delete_res.status_code == 200
    assert "archived" in delete_res.json()["message"].lower()
def test_migrated_editor_login_success():
    """Migrated former SME account should now authenticate as Editor."""
    response = client.post("/api/v1/auth/login", json={
        "email": "sme@healthtech.co.ke",
        "password": "SME@1234"
    })

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["role"] == "editor"


def test_editor_cannot_approve_pending_article():
    """Editor must not be allowed to approve an article pending review."""

    admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin@healthtech.co.ke",
        "password": "Admin@1234"
    })

    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]

    slug = f"test-editor-approve-{uuid.uuid4().hex[:8]}"

    create_response = client.post(
        "/api/v1/articles",
        json={
            "title": "Test Editor Approval Article",
            "slug": slug,
            "body_markdown": "## Editor Approval Test",
            "status": "pending_review"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert create_response.status_code == 201
    assert create_response.json()["status"] == "pending_review"

    editor_login = client.post("/api/v1/auth/login", json={
        "email": "sme@healthtech.co.ke",
        "password": "SME@1234"
    })

    assert editor_login.status_code == 200
    editor_token = editor_login.json()["access_token"]

    approve_response = client.post(
        f"/api/v1/articles/{slug}/approve",
        headers={"Authorization": f"Bearer {editor_token}"}
    )

    assert approve_response.status_code == 403
    assert "admin role" in approve_response.json()["detail"].lower()


def test_editor_cannot_reject_pending_article():
    """Editor must not be allowed to reject an article pending review."""

    admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin@healthtech.co.ke",
        "password": "Admin@1234"
    })

    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]

    slug = f"test-editor-reject-{uuid.uuid4().hex[:8]}"

    create_response = client.post(
        "/api/v1/articles",
        json={
            "title": "Test Editor Rejection Article",
            "slug": slug,
            "body_markdown": "## Editor Rejection Test",
            "status": "pending_review"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert create_response.status_code == 201
    assert create_response.json()["status"] == "pending_review"

    editor_login = client.post("/api/v1/auth/login", json={
        "email": "sme@healthtech.co.ke",
        "password": "SME@1234"
    })

    assert editor_login.status_code == 200
    editor_token = editor_login.json()["access_token"]

    reject_response = client.post(
        f"/api/v1/articles/{slug}/reject",
        json={
            "reason": "Please verify the clinical information."
        },
        headers={"Authorization": f"Bearer {editor_token}"}
    )

    assert reject_response.status_code == 403
    assert "admin role" in reject_response.json()["detail"].lower()


def test_viewer_cannot_approve_article():
    """Viewer should not be allowed to approve an article."""

    admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin@healthtech.co.ke",
        "password": "Admin@1234"
    })

    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]

    slug = f"test-editor-denied-{uuid.uuid4().hex[:8]}"

    create_response = client.post(
        "/api/v1/articles",
        json={
            "title": "Test Editor Permission",
            "slug": slug,
            "body_markdown": "## Permission Test",
            "status": "pending_review"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert create_response.status_code == 201

