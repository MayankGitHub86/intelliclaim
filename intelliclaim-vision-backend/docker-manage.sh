#!/bin/bash

# IntelliClaim Docker Management Script
# Usage: ./docker-manage.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if docker and docker-compose are installed
check_dependencies() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Create necessary directories
setup_directories() {
    print_status "Creating storage directories..."
    mkdir -p storage/{uploads,models,temp,exports}
    mkdir -p logs
    touch storage/uploads/.gitkeep
    touch storage/models/.gitkeep
    touch storage/temp/.gitkeep
    touch storage/exports/.gitkeep
    touch logs/.gitkeep
    print_success "Directories created successfully"
}

# Setup environment file
setup_env() {
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please update .env file with your actual configuration values"
    else
        print_status ".env file already exists"
    fi
}

# Build services
build() {
    print_status "Building Docker images..."
    docker-compose build --no-cache
    print_success "Docker images built successfully"
}

# Start services
start() {
    print_status "Starting IntelliClaim services..."
    docker-compose up -d
    print_success "Services started successfully"
    
    print_status "Service URLs:"
    echo "  - API: http://localhost:8000"
    echo "  - API Docs: http://localhost:8000/docs"
    echo "  - Flower (Celery monitoring): http://localhost:5555"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
}

# Stop services
stop() {
    print_status "Stopping IntelliClaim services..."
    docker-compose down
    print_success "Services stopped successfully"
}

# Restart services
restart() {
    print_status "Restarting IntelliClaim services..."
    docker-compose restart
    print_success "Services restarted successfully"
}

# View logs
logs() {
    if [ -n "$2" ]; then
        print_status "Showing logs for service: $2"
        docker-compose logs -f "$2"
    else
        print_status "Showing logs for all services"
        docker-compose logs -f
    fi
}

# Show service status
status() {
    print_status "Service status:"
    docker-compose ps
}

# Clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Database operations
db_migrate() {
    print_status "Running database migrations..."
    docker-compose exec api alembic upgrade head
    print_success "Database migrations completed"
}

db_reset() {
    print_warning "This will delete all data in the database!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Resetting database..."
        docker-compose down -v
        docker-compose up -d postgres redis
        sleep 10
        docker-compose up -d
        print_success "Database reset completed"
    else
        print_status "Database reset cancelled"
    fi
}

# Development mode
dev() {
    print_status "Starting development environment..."
    setup_directories
    setup_env
    docker-compose up --build
}

# Production mode
prod() {
    print_status "Starting production environment..."
    setup_directories
    setup_env
    docker-compose --profile production up -d --build
    print_success "Production environment started"
}

# Show help
show_help() {
    echo "IntelliClaim Docker Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup       - Setup directories and environment file"
    echo "  build       - Build Docker images"
    echo "  start       - Start all services"
    echo "  stop        - Stop all services"
    echo "  restart     - Restart all services"
    echo "  logs [svc]  - Show logs (optionally for specific service)"
    echo "  status      - Show service status"
    echo "  cleanup     - Clean up Docker resources"
    echo "  db:migrate  - Run database migrations"
    echo "  db:reset    - Reset database (WARNING: deletes all data)"
    echo "  dev         - Start development environment"
    echo "  prod        - Start production environment"
    echo "  help        - Show this help message"
    echo ""
    echo "Services: api, postgres, redis, celery_worker, flower, nginx"
}

# Main script logic
main() {
    check_dependencies

    case "${1:-help}" in
        setup)
            setup_directories
            setup_env
            ;;
        build)
            build
            ;;
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        logs)
            logs "$@"
            ;;
        status)
            status
            ;;
        cleanup)
            cleanup
            ;;
        db:migrate)
            db_migrate
            ;;
        db:reset)
            db_reset
            ;;
        dev)
            dev
            ;;
        prod)
            prod
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
