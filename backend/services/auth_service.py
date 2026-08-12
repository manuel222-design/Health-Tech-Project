import uuid

from fastapi import HTTPException # type: ignore

from models import User, UserRole
from repositories.user_repository import UserRepository


class AuthService:
    """Business logic for authentication and registration."""

    def __init__(self, repository: UserRepository, pwd_context, create_token, create_refresh_token, token_ttl):
        self.repository = repository
        self.pwd_context = pwd_context
        self.create_token = create_token
        self.create_refresh_token = create_refresh_token
        self.token_ttl = token_ttl

    def login(self, email: str, password: str):
        user = self.repository.get_by_email(email)

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=403,
                detail="Account is deactivated"
            )

        if not self.pwd_context.verify(password, user.password_hash):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        token = self.create_token(str(user.id), user.role.value)
        refresh_token = self.create_refresh_token(str(user.id))

        return {
            "access_token": token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": self.token_ttl * 3600,
            "role": user.role.value,
            "username": user.username,
        }

    def register(
        self,
        username: str,
        email: str,
        password: str,
        requested_role: str,
        department: str | None = None
    ):
        existing = self.repository.get_by_email(email)

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        allowed_roles = ["viewer", "editor", "sme"]
        role = (
            requested_role
            if requested_role in allowed_roles
            else "viewer"
        )

        new_user = User(
            id=uuid.uuid4(),
            username=username,
            email=email,
            password_hash=self.pwd_context.hash(password),
            role=UserRole(role),
            department=department,
            is_active=True
        )

        new_user = self.repository.save(new_user)

        token = self.create_token(
            str(new_user.id),
            new_user.role.value
        )

        refresh_token = self.create_refresh_token(str(new_user.id))
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": self.token_ttl * 3600,
            "role": new_user.role.value,
            "username": new_user.username,
        }
