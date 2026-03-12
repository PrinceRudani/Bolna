from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy import text
from app.database import SessionLocal

SECRET_KEY = "secret123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return token

def get_user_by_email(email: str):
    db = SessionLocal()
    try:
        query = text("SELECT id, email, password FROM users WHERE email = :email")
        result = db.execute(query, {"email": email}).fetchone()

        if result:
            return dict(result._mapping)

        return None
    finally:
        db.close()