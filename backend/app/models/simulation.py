from sqlalchemy import (
    CheckConstraint,
    Column,
    Integer,
    String,
    Float,
    DateTime,
    func,
)
from sqlalchemy.orm import relationship

from .base import Base

class Simulation(Base):
    __tablename__ = "simulations"
    __table_args__ = (
        CheckConstraint('num_runs > 0', name='ck_simulation_num_runs_positive'),
        CheckConstraint('run_len > 0', name='ck_simulation_run_len_positive')
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, index=True, unique=True)
    num_runs = Column(Integer, default=1, nullable=False)
    run_len = Column(Float, default=1.0, nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    output_dir = Column(String, nullable=False)
    json_archive_filename = Column(String, nullable=False)

    sources = relationship(
        "Source",
        back_populates="simulation",
        cascade="all, delete-orphan",
    )