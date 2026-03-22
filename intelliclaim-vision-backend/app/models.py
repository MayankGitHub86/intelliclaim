from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    company = Column(String, nullable=True)
    role = Column(String, default="user")
    picture = Column(String, nullable=True) # for Google Auth
    auth_provider = Column(String, default="local")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    claims = relationship("Claim", back_populates="owner")
    documents = relationship("Document", back_populates="owner")
    workflows = relationship("Workflow", back_populates="owner")

class Claim(Base):
    __tablename__ = "claims"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, default="pending")
    amount = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    ai_decision = Column(String, nullable=True)
    user_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="claims")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    unique_filename = Column(String, unique=True, index=True, nullable=False)
    file_path = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    size = Column(Integer, nullable=False)
    analysis_results = Column(JSON, nullable=True)
    user_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    analyzed_at = Column(DateTime, nullable=True)

    # Relationships
    owner = relationship("User", back_populates="documents")

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    nodes = Column(JSON, nullable=False)
    connections = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    user_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="workflows")
