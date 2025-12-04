# Use Python 3.13 slim image as base
FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set work directory
WORKDIR /app

# Install essential system dependencies
RUN apt-get update && apt-get install -y \
    # Build essentials
    build-essential \
    gcc \
    g++ \
    # Basic libraries
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    # Image processing basics
    libjpeg-dev \
    libpng-dev \
    # PDF processing
    poppler-utils \
    # PostgreSQL client
    libpq-dev \
    # Basic utilities
    git \
    curl \
    wget \
    # Clean up
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy project files
COPY . .

# Create directories for storage
RUN mkdir -p /app/storage/uploads \
    /app/storage/models \
    /app/storage/temp \
    /app/storage/exports \
    /app/logs

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
