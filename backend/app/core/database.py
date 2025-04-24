from sqlalchemy import AsyncAdaptedQueuePool
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    echo=False,
    poolclass=AsyncAdaptedQueuePool,
    pool_size=5,               # Number of connections to keep open
    max_overflow=10,           # Maximum additional connections to create
    pool_timeout=30,           # Seconds to wait before timeout
    pool_recycle=1800,         # Recycle connections after 30 minutes
    pool_pre_ping=True,        # Verify connection health before use
    connect_args={
        "timeout": 15          # SQLite-specific connection timeout in seconds
    }
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession,
    autocommit=False
)