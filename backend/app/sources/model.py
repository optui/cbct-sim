from sqlalchemy import (
    JSON,
    Float,
    Column,
    String,
    Integer,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.core import Base


class Source(Base):
    __tablename__ = "sources"
    __table_args__ = (UniqueConstraint("simulation_id", "name"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    simulation_id = Column(
        Integer,
        ForeignKey("simulations.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    name = Column(String, index=True, nullable=False)
    attached_to = Column(String, default="world", nullable=False)
    particle = Column(String, default="gamma", nullable=False)

    position = Column(JSON, nullable=False)
    focus_point = Column(JSON, nullable=False)
    energy = Column(JSON, nullable=False)

    activity = Column(Float, default=60.0, nullable=False)
    unit = Column(String, default="Bq", nullable=False)

    simulation = relationship("Simulation", back_populates="sources")
