from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, index=True, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    output_dir = Column(String)
    json_archive_filename = Column(String)
