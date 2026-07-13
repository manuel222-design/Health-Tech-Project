

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root_endpoint():
    """API should return running message"""
    response = client.get("/")
    assert response.status_code == 200
    assert "running" in response.json()["message"].lower()

def test_get_all_articles():
    """Should return list of published articles"""
    response = client.get("/api/v1/articles")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

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

    article_res = client.post(
        "/api/v1/articles",
        json={
            "title": "Test Article from Pytest",
            "slug": "test-article-pytest",
            "body_markdown": "## Test\nThis is a test article.",
            "status": "draft"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert article_res.status_code == 201
    assert article_res.json()["slug"] == "test-article-pytest"

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
    token = login_res.json()["access_token"]

    delete_res = client.delete(
        "/api/v1/articles/test-article-pytest",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert delete_res.status_code == 200
    assert "deleted" in delete_res.json()["message"].lower()