from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    create_user,
    decode_token,
    get_user_by_email,
    get_user_by_username,
)

router = APIRouter(prefix="/auth", tags=["auth"])
_bearer = HTTPBearer()
_optional_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_token(credentials.credentials)
    email: str = payload.get("sub", "")
    user = await get_user_by_email(db, email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account deactivated")
    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_optional_bearer),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None
    try:
        payload = decode_token(credentials.credentials)
        email: str = payload.get("sub", "")
        return await get_user_by_email(db, email)
    except Exception:
        return None


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    if await get_user_by_email(db, body.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    if await get_user_by_username(db, body.username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
    user = await create_user(db, body.email, body.username, body.password)
    return TokenResponse(
        access_token=create_access_token(user.email),
        refresh_token=create_refresh_token(user.email),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, body.email, body.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenResponse(
        access_token=create_access_token(user.email),
        refresh_token=create_refresh_token(user.email),
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
