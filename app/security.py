import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Union
from jose import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURATION ---
ACCESS_SECRET = os.getenv("ACCESS_TOKEN_SECRET")
REFRESH_SECRET = os.getenv("REFRESH_TOKEN_SECRET")
ALGORITHM = "HS256"
ACCESS_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 15))
REFRESH_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- PASSWORD HASHING ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# --- JWT TOKEN MANAGEMENT ---

def create_jwt_token(
    data: dict, 
    token_type: str = "access", 
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
    
    # Structural attributes identifying usage (Spec 2.2)
    to_encode.update({"type": token_type})
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        if token_type == "access":
            expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_EXPIRE_MINUTES)
        else:
            expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire})
    
    # Use different secrets based on token type (Spec 2.2)
    secret = ACCESS_SECRET if token_type == "access" else REFRESH_SECRET
    
    encoded_jwt = jwt.encode(to_encode, secret, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str, token_type: str = "access") -> dict:
    secret = ACCESS_SECRET if token_type == "access" else REFRESH_SECRET
    payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
    
    # Validate structural usage
    if payload.get("type") != token_type:
        raise ValueError(f"Invalid token type: expected {token_type}")
        
    return payload
