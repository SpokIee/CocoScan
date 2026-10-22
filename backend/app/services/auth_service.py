from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models import User


class AuthError(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower().strip()))


def register_user(db: Session, email: str, password: str, name: str | None) -> tuple[User, str]:
    email = email.lower().strip()
    if get_user_by_email(db, email):
        raise AuthError("An account with this email already exists.", status_code=409)
    user = User(email=email, password_hash=hash_password(password), name=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user, create_access_token(str(user.id))


def authenticate(db: Session, email: str, password: str) -> tuple[User, str]:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise AuthError("Incorrect email or password.", status_code=401)
    return user, create_access_token(str(user.id))
