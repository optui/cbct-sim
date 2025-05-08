from sqlalchemy import Column, Integer, String, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core import Base
from app.volumes.schema import DynamicParams, VolumeRead, VolumeShape
from app.shared.primitives import Rotation, Unit


class Volume(Base):
    __tablename__ = "volumes"
    __table_args__ = (UniqueConstraint("simulation_id", "name"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    simulation_id = Column(
        Integer,
        ForeignKey("simulations.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    name = Column(String, nullable=False)
    mother = Column(String, default="world", nullable=True)
    material = Column(String, default="G4_AIR", nullable=False)

    translation      = Column(JSON, nullable=False)
    translation_unit = Column(String, nullable=False)

    rotation         = Column(JSON, nullable=False)

    shape            = Column(JSON, nullable=False)

    dynamic_params   = Column(JSON, nullable=False)

    simulation = relationship("Simulation", back_populates="volumes")
