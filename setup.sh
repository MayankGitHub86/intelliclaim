#!/bin/bash

# IntelliClaim Setup Script
# This script helps you set up the IntelliClaim development environment quickly

set -e

echo "🚀 IntelliClaim Development Setup"
echo "================================="

# Check if running on macOS or Linux
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "📋 Detected OS: $MACHINE"

# Check prerequisites
echo ""
echo "🔍 Checking prerequisites..."

# Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check Python
if command -v python3 >/dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python found: $PYTHON_VERSION"
else
    echo "❌ Python 3.11+ not found. Please install Python from https://python.org"
    exit 1
fi

# Check Git
if command -v git >/dev/null 2>&1; then
    echo "✅ Git found"
else
    echo "❌ Git not found. Please install Git"
    exit 1
fi

echo ""
echo "📦 Setting up project dependencies..."

# Frontend setup
echo "🎨 Setting up frontend..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"

# Backend setup  
echo "🐍 Setting up backend..."
cd ../intelliclaim-vision-backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Backend dependencies installed"

cd ..

# Environment setup
echo ""
echo "⚙️  Setting up environment configuration..."

# Backend .env
if [ ! -f "intelliclaim-vision-backend/.env" ]; then
    echo "Creating backend .env file..."
    cat > intelliclaim-vision-backend/.env << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/intelliclaim
REDIS_URL=redis://localhost:6379

# AI Services  
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Security
SECRET_KEY=your_secret_key_here_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Configuration
MAX_FILE_SIZE=52428800
ALLOWED_EXTENSIONS=pdf,jpg,jpeg,png,txt

# Server Configuration
DEBUG=True
HOST=0.0.0.0
PORT=8000

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
EOF
    echo "✅ Backend .env created"
else
    echo "✅ Backend .env already exists"
fi

# Frontend .env (if needed)
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=IntelliClaim
VITE_APP_VERSION=1.0.0
EOF
    echo "✅ Frontend .env created"
fi

# Docker setup
echo ""
echo "🐳 Docker setup..."

if command -v docker >/dev/null 2>&1; then
    echo "✅ Docker found"
    if command -v docker-compose >/dev/null 2>&1 || docker compose version >/dev/null 2>&1; then
        echo "✅ Docker Compose found"
        echo "🚀 You can use Docker for database setup:"
        echo "   docker-compose up -d postgres redis"
    else
        echo "⚠️  Docker Compose not found (optional)"
    fi
else
    echo "⚠️  Docker not found (optional for local database)"
fi

echo ""
echo "🎉 Setup Complete!"
echo "==================="
echo ""
echo "📋 Next steps:"
echo "1. 🔑 Add your Gemini API key to intelliclaim-vision-backend/.env"
echo "2. 🗄️  Start database (Docker): docker-compose up -d postgres redis"
echo "3. 🐍 Start backend: cd intelliclaim-vision-backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "4. 🎨 Start frontend: cd frontend && npm run dev"
echo "5. 🌐 Open http://localhost:5173 in your browser"
echo ""
echo "📚 Helpful commands:"
echo "   npm run dev          # Start frontend development server"
echo "   npm run build        # Build frontend for production"
echo "   python -m pytest     # Run backend tests"
echo "   npm test            # Run frontend tests"
echo ""
echo "🆘 Need help?"
echo "   📖 Read README.md"
echo "   💬 Check GitHub Discussions"
echo "   🐛 Report issues on GitHub"
echo ""
echo "Happy coding! 🚀"
