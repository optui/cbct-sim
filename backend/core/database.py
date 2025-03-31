from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from backend.core.config import get_settings

settings = get_settings()

engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, echo=False)

AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
