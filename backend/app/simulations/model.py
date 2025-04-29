from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    func,
)
from sqlalchemy.orm import relationship
from app.core import Base


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, index=True, unique=True, nullable=False)
    num_runs = Column(Integer, default=1, nullable=False)
    run_len = Column(Float, default=1.0, nullable=False)
    output_dir = Column(String, nullable=False)
    json_archive_filename = Column(String, nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    sources = relationship(
        "Source",
        back_populates="simulation",
        cascade="all, delete-orphan",
    )
