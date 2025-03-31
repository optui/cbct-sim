from sqlalchemy import JSON, Column, ForeignKey, Integer, String, DateTime, Float, UniqueConstraint, func
from sqlalchemy.orm import DeclarativeBase, relationship

class Base(DeclarativeBase):
    pass

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, index=True, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    output_dir = Column(String)
    json_archive_filename = Column(String)

    sources = relationship("Source", back_populates="simulation", cascade="all, delete-orphan")

class Source(Base):
    __tablename__ = "sources"
    __table_args__ = (UniqueConstraint("simulation_id", "name"),)
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    simulation_id = Column(Integer, ForeignKey("simulations.id"), nullable=False)

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
