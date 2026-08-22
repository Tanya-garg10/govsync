import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "postgresql://govsync:govsync@localhost:5432/govsync")
    jwt_secret: str = os.getenv("JWT_SECRET", "change-this-demo-secret")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

    class Config:
        env_file = ".env"

settings = Settings()
