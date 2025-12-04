# IntelliClaim Vision Backend - Complete Docker Setup

A comprehensive Docker setup for the IntelliClaim Vision backend application with FastAPI, PostgreSQL, Redis, Celery, and monitoring.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Python 3.13+ (for local development)

### Setup and Run

1. **Setup environment:**
   ```bash
   ./docker-manage.sh setup
   ```

2. **Start development environment:**
   ```bash
   ./docker-manage.sh dev
   ```

3. **Or start production environment:**
   ```bash
   ./docker-manage.sh prod
   ```

## 📋 Available Services

| Service | Port | Description |
|---------|------|-------------|
| FastAPI API | 8000 | Main application API |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache and message broker |
| Flower | 5555 | Celery task monitoring |
| Nginx | 80/443 | Reverse proxy (production) |

## 🔧 Management Commands

```bash
# Setup
./docker-manage.sh setup          # Create directories and .env file
./docker-manage.sh build          # Build Docker images

# Service Control
./docker-manage.sh start          # Start all services
./docker-manage.sh stop           # Stop all services
./docker-manage.sh restart        # Restart all services
./docker-manage.sh status         # Show service status

# Logs and Monitoring
./docker-manage.sh logs           # Show all logs
./docker-manage.sh logs api       # Show specific service logs

# Database Operations
./docker-manage.sh db:migrate     # Run database migrations
./docker-manage.sh db:reset       # Reset database (WARNING: deletes data)

# Environment Management
./docker-manage.sh dev            # Development environment
./docker-manage.sh prod           # Production environment

# Cleanup
./docker-manage.sh cleanup        # Remove containers and clean up
```

## 📁 Project Structure

```
intelliclaim-vision-backend/
├── app/                          # FastAPI application
│   ├── main.py                   # Main application entry point
│   ├── core/                     # Core configuration
│   ├── api/                      # API routes
│   ├── models/                   # Database models
│   ├── schemas/                  # Pydantic schemas
│   ├── services/                 # Business logic
│   └── workers/                  # Celery workers
├── storage/                      # File storage
│   ├── uploads/                  # File uploads
│   ├── models/                   # ML models
│   ├── temp/                     # Temporary files
│   └── exports/                  # Export files
├── logs/                         # Application logs
├── Dockerfile                    # Docker image configuration
├── docker-compose.yml           # Multi-container setup
├── docker-manage.sh             # Management script
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment template
├── nginx.conf                   # Nginx configuration
└── init.sql                     # Database initialization
```

## 🔐 Environment Configuration

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Key configurations:
- **Database**: PostgreSQL connection settings
- **Redis**: Cache and Celery broker settings
- **OpenAI**: API keys for AI features
- **Security**: JWT secrets and tokens
- **Storage**: File upload directories
- **Monitoring**: Sentry DSN for error tracking

## 🏥 Health Checks

All services include health checks:
- **API**: `GET /health`
- **PostgreSQL**: Connection test
- **Redis**: Ping test
- **Celery**: Worker inspection

## 📊 Monitoring

- **Flower**: Celery task monitoring at http://localhost:5555
- **Logs**: Centralized logging with structured output
- **Health endpoints**: Service status monitoring

## 🔒 Security Features

- Non-root user in containers
- Security headers in Nginx
- Environment variable management
- JWT authentication ready
- File upload restrictions

## 🚀 Production Deployment

For production deployment:

1. Update `.env` with production values
2. Configure SSL certificates for Nginx
3. Set up external PostgreSQL and Redis if needed
4. Enable monitoring and alerting
5. Configure backup strategies

```bash
./docker-manage.sh prod
```

## 🛠️ Development Workflow

1. **Start development environment:**
   ```bash
   ./docker-manage.sh dev
   ```

2. **View logs:**
   ```bash
   ./docker-manage.sh logs api
   ```

3. **Run database migrations:**
   ```bash
   ./docker-manage.sh db:migrate
   ```

4. **Access services:**
   - API Docs: http://localhost:8000/docs
   - API: http://localhost:8000
   - Flower: http://localhost:5555

## 📝 API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation
- `GET /api/v1/test` - Test endpoint

## 🔄 Background Tasks

Celery workers handle:
- Document processing
- Computer vision analysis
- AI model inference
- File operations
- Email notifications

## 💾 Data Persistence

- **PostgreSQL data**: Persisted in Docker volume `postgres_data`
- **Redis data**: Persisted in Docker volume `redis_data`
- **File uploads**: Mounted to `./storage` directory
- **Logs**: Mounted to `./logs` directory

## 🐛 Troubleshooting

1. **Port conflicts**: Ensure ports 8000, 5432, 6379, 5555 are available
2. **Permission issues**: Check file permissions in storage directories
3. **Memory issues**: Ensure sufficient Docker memory allocation
4. **Environment variables**: Verify .env file configuration

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Celery Documentation](https://docs.celeryproject.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
