#!/bin/bash

# Jenkins Deployment Script
# This script handles the deployment process for different environments

set -e  # Exit on any error

ENVIRONMENT=${1:-development}
SERVICE=${2:-all}

echo "🚀 Starting deployment for environment: $ENVIRONMENT"
echo "📦 Service: $SERVICE"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_status "Docker is running"
}

# Check if docker-compose file exists
check_compose_file() {
    local compose_file="docker-compose.${ENVIRONMENT}.yml"
    
    if [[ "$ENVIRONMENT" == "development" ]]; then
        compose_file="docker-compose.yml"
    fi
    
    if [[ ! -f "$compose_file" ]]; then
        print_error "Docker compose file not found: $compose_file"
        exit 1
    fi
    
    print_status "Using compose file: $compose_file"
    echo "$compose_file"
}

# Pull latest images
pull_images() {
    local compose_file=$1
    print_status "Pulling latest images..."
    
    if [[ "$ENVIRONMENT" == "development" ]]; then
        docker-compose -f "$compose_file" pull || print_warning "Some images couldn't be pulled (might be locally built)"
    else
        docker-compose -f "$compose_file" pull
    fi
}

# Stop existing services
stop_services() {
    local compose_file=$1
    print_status "Stopping existing services..."
    docker-compose -f "$compose_file" down --remove-orphans
}

# Start services
start_services() {
    local compose_file=$1
    print_status "Starting services..."
    
    if [[ "$SERVICE" == "all" ]]; then
        docker-compose -f "$compose_file" up -d
    else
        docker-compose -f "$compose_file" up -d "$SERVICE"
    fi
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    if [[ "$SERVICE" == "all" ]] || [[ "$SERVICE" == "backend" ]]; then
        local backend_port
        case "$ENVIRONMENT" in
            ("development") backend_port=4000 ;;
            ("staging") backend_port=4001 ;;
            ("production") backend_port=4000 ;;
        esac
        
        if curl -f "http://localhost:$backend_port/api/workouts" > /dev/null 2>&1; then
            print_status "Backend health check passed"
        else
            print_warning "Backend health check failed"
        fi
    fi
    
    # Check frontend health
    if [[ "$SERVICE" == "all" ]] || [[ "$SERVICE" == "frontend" ]]; then
        local frontend_port
        case "$ENVIRONMENT" in
            ("development") frontend_port=3000 ;;
            ("staging") frontend_port=3001 ;;
            ("production") frontend_port=80 ;;
        esac
        
        if curl -f "http://localhost:$frontend_port" > /dev/null 2>&1; then
            print_status "Frontend health check passed"
        else
            print_warning "Frontend health check failed"
        fi
    fi
}

# Show running services
show_status() {
    local compose_file=$1
    print_status "Current service status:"
    docker-compose -f "$compose_file" ps
}

# Cleanup old images and containers
cleanup() {
    print_status "Cleaning up unused Docker resources..."
    docker system prune -f --volumes
    print_status "Cleanup completed"
}

# Main deployment function
deploy() {
    check_docker
    
    local compose_file
    compose_file=$(check_compose_file)
    
    pull_images "$compose_file"
    stop_services "$compose_file"
    start_services "$compose_file"
    health_check
    show_status "$compose_file"
    
    if [[ "$ENVIRONMENT" != "development" ]]; then
        cleanup
    fi
    
    print_status "Deployment completed successfully! 🎉"
    
    # Show access URLs
    echo ""
    echo "Access URLs:"
    case "$ENVIRONMENT" in
        ("development")
            echo "   Frontend: http://localhost:3000"
            echo "   Backend:  http://localhost:4000"
            echo "   MongoDB:  mongodb://localhost:27017"
            ;;
        ("staging")
            echo "   Frontend: http://localhost:3001"
            echo "   Backend:  http://localhost:4001"
            echo "   MongoDB:  mongodb://localhost:27018"
            ;;
        ("production")
            echo "   Frontend: http://localhost"
            echo "   Backend:  http://localhost:4000"
            echo "   Nginx:    http://localhost:8080"
            ;;
    esac
}

# Handle script arguments
case "${1:-deploy}" in
    ("deploy")
        deploy
        ;;
    ("stop")
        compose_file=$(check_compose_file)
        stop_services "$compose_file"
        ;;
    ("status")
        compose_file=$(check_compose_file)
        show_status "$compose_file"
        ;;
    ("logs")
        compose_file=$(check_compose_file)
        docker-compose -f "$compose_file" logs -f "${2:-}"
        ;;
    ("cleanup")
        cleanup
        ;;
    (*)
        echo "Usage: $0 {deploy|stop|status|logs|cleanup} [environment] [service]"
        echo ""
        echo "Commands:"
        echo "  deploy   - Deploy services (default)"
        echo "  stop     - Stop all services"
        echo "  status   - Show service status"
        echo "  logs     - Show service logs"
        echo "  cleanup  - Clean up Docker resources"
        echo ""
        echo "Environments: development (default), staging, production"
        echo "Services: all (default), frontend, backend, mongodb"
        echo ""
        echo "Examples:"
        echo "  $0 deploy development all"
        echo "  $0 deploy staging backend"
        echo "  $0 logs production frontend"
        exit 1
        ;;
esac