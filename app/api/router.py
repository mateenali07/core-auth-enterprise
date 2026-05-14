from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
import time

from ..database import get_db
from ..models import User
from ..schemas import (
    UserCreate, 
    UserRegistrationResponse, 
    TokenExchangeResponse, 
    UserLogin, 
    StandardActionResponse,
    TokenRefreshRequest
)
from ..security import (
    get_password_hash, 
    verify_password, 
    create_jwt_token, 
    decode_token,
    ACCESS_EXPIRE_MINUTES
)
from ..blacklist import add_to_blacklist
from ..deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# 1. Registration Step
@router.post("/register", response_model=UserRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

# 2. Authentication Step
@router.post("/login", response_model=TokenExchangeResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Generate Dual Tokens
    access_token = create_jwt_token({"sub": user.email}, token_type="access")
    refresh_token = create_jwt_token({"sub": user.email}, token_type="refresh")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

# 3. Rotation Step
@router.post("/refresh", response_model=TokenExchangeResponse)
async def refresh_token(request: TokenRefreshRequest):
    try:
        payload = decode_token(request.refresh_token, token_type="refresh")
        email = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    access_token = create_jwt_token({"sub": email}, token_type="access")
    # In a real rotation, we might also issue a new refresh token (refresh token rotation)
    # but for this spec, we just need to return a TokenExchangeResponse
    return {
        "access_token": access_token,
        "refresh_token": request.refresh_token,
        "token_type": "bearer"
    }

# 4. Session Revocation Step
@router.post("/logout", response_model=StandardActionResponse)
async def logout(current_user: User = Depends(get_current_user), authorization: str = Header(None)):
    # Extract token from header
    token = authorization.split(" ")[1]
    
    # Instant Blacklisting (Spec 2.2)
    # For safety, blacklist for the maximum possible lifespan of an access token
    expires_at = time.time() + (ACCESS_EXPIRE_MINUTES * 60)
    await add_to_blacklist(token, expires_at)
    
    return {"detail": "Revocation complete"}

# 5. Profile Metrics (Verification Step)
@router.get("/me", response_model=UserRegistrationResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
