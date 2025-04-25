from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    JSON,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .base import Base


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

    name = Column(String, index=True)
    attached_to = Column(String, default="world")
    particle = Column(String, default="gamma")

    position = Column(JSON)
    direction = Column(JSON)
    energy = Column(JSON)

    n = Column(Integer, nullable=True)
    activity = Column(Float, nullable=True)
    activity_unit = Column(String, default="Bq")

    simulation = relationship("Simulation", back_populates="sources")
