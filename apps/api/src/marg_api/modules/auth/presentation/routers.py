from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from marg_api.core.dependencies import get_auth_service
from marg_api.core.security import TokenData, get_current_user
from marg_api.modules.auth.application.services import AuthService
from marg_api.modules.auth.domain.models import Token, UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
async def register(
    user_in: UserCreate,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
):
    """Register a new user."""
    return await auth_service.register_user(user_in)


@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
):
    """OAuth2 compatible token login, get an access token for future requests."""
    return await auth_service.authenticate_user(form_data.username, form_data.password)


@router.get("/me", response_model=TokenData)
async def read_users_me(
    current_user: Annotated[TokenData, Depends(get_current_user)],
):
    """Get current user context."""
    return current_user
