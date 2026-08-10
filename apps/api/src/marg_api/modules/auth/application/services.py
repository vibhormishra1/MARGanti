import uuid

from fastapi import HTTPException, status

from marg_api.core.security import create_access_token, get_password_hash, verify_password
from marg_api.infrastructure.database.models import UserModel
from marg_api.modules.auth.domain.models import Token, UserCreate, UserResponse
from marg_api.modules.auth.infrastructure.repositories import AuthRepository


class AuthService:
    def __init__(self, repo: AuthRepository):
        self.repo = repo

    async def register_user(self, user_in: UserCreate) -> UserResponse:
        existing_user = await self.repo.get_user_by_email(user_in.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = get_password_hash(user_in.password)
        db_user = UserModel(
            id=str(uuid.uuid4()),
            email=user_in.email,
            hashed_password=hashed_password,
            organization_id=user_in.organization_id,
            role=user_in.role
        )
        created = await self.repo.create_user(db_user)
        return UserResponse(
            id=created.id,
            email=created.email,
            organization_id=created.organization_id,
            role=created.role,
            is_active=created.is_active
        )

    async def authenticate_user(self, email: str, password: str) -> Token:
        user = await self.repo.get_user_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(
            data={"sub": user.id, "org_id": user.organization_id, "role": user.role}
        )
        return Token(access_token=access_token, token_type="bearer")
