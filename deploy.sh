#!/bin/bash

# Symbio-NLM Deployment Helper Script
# This script helps prepare and deploy the application

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Symbio-NLM Deployment Helper Script    ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo ""

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 18 or higher."
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm not found. Please install npm."
        exit 1
    fi
    
    echo ""
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Backend dependencies
    print_info "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
    
    # Frontend dependencies
    print_info "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
    
    echo ""
}

# Build frontend
build_frontend() {
    print_info "Building frontend..."
    cd frontend
    npm run build
    cd ..
    print_success "Frontend built successfully"
    echo ""
}

# Check environment files
check_environment() {
    print_info "Checking environment files..."
    
    # Check backend .env
    if [ -f "backend/.env" ]; then
        print_success "Backend .env file found"
    else
        print_warning "Backend .env file not found"
        print_info "Creating from .env.example..."
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            print_warning "Please edit backend/.env with your configuration"
        fi
    fi
    
    # Check frontend .env
    if [ -f "frontend/.env" ] || [ -f "frontend/.env.production" ]; then
        print_success "Frontend .env file found"
    else
        print_warning "Frontend .env file not found"
        if [ -f "frontend/.env.example" ]; then
            cp frontend/.env.example frontend/.env
            print_warning "Please edit frontend/.env with your configuration"
        fi
    fi
    
    echo ""
}

# Docker deployment
deploy_docker() {
    print_info "Deploying with Docker..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Please install Docker."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose not found. Please install Docker Compose."
        exit 1
    fi
    
    print_success "Docker found"
    
    # Build and start containers
    print_info "Building Docker images..."
    docker-compose build
    
    print_info "Starting containers..."
    docker-compose up -d
    
    print_success "Docker containers started"
    print_info "Frontend: http://localhost"
    print_info "Backend: http://localhost:3002"
    print_info "Health check: http://localhost:3002/api/health"
    
    echo ""
    print_info "Use 'docker-compose logs -f' to view logs"
    print_info "Use 'docker-compose down' to stop containers"
    
    echo ""
}

# Vercel deployment
deploy_vercel() {
    print_info "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_success "Vercel CLI found"
    
    # Deploy
    print_info "Starting Vercel deployment..."
    vercel --prod
    
    print_success "Deployment initiated"
    echo ""
}

# Local development
start_local() {
    print_info "Starting local development servers..."
    
    # Check environment
    check_environment
    
    print_info "Starting backend on port 3002..."
    print_info "Starting frontend on port 3000..."
    
    # Start backend in background
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
    
    # Wait a bit for backend to start
    sleep 3
    
    # Start frontend
    cd frontend
    npm run dev
    
    # This line will only be reached if frontend stops
    kill $BACKEND_PID
}

# Health check
health_check() {
    print_info "Performing health check..."
    
    if command -v curl &> /dev/null; then
        RESPONSE=$(curl -s http://localhost:3002/api/health || echo "failed")
        
        if [ "$RESPONSE" = "failed" ]; then
            print_error "Health check failed - backend may not be running"
        else
            print_success "Backend is healthy"
            echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
        fi
    else
        print_warning "curl not found - skipping health check"
    fi
    
    echo ""
}

# Show menu
show_menu() {
    echo -e "${BLUE}Select deployment option:${NC}"
    echo "1) Install dependencies"
    echo "2) Build frontend"
    echo "3) Check environment files"
    echo "4) Deploy with Docker"
    echo "5) Deploy to Vercel"
    echo "6) Start local development"
    echo "7) Run health check"
    echo "8) Full setup (install + build)"
    echo "9) Exit"
    echo ""
    read -p "Enter your choice [1-9]: " choice
    
    case $choice in
        1)
            check_prerequisites
            install_dependencies
            ;;
        2)
            build_frontend
            ;;
        3)
            check_environment
            ;;
        4)
            deploy_docker
            ;;
        5)
            deploy_vercel
            ;;
        6)
            start_local
            ;;
        7)
            health_check
            ;;
        8)
            check_prerequisites
            install_dependencies
            check_environment
            build_frontend
            print_success "Setup complete!"
            ;;
        9)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option"
            show_menu
            ;;
    esac
}

# Main script
main() {
    # If no arguments, show menu
    if [ $# -eq 0 ]; then
        show_menu
    else
        # Process command line arguments
        case $1 in
            install)
                check_prerequisites
                install_dependencies
                ;;
            build)
                build_frontend
                ;;
            check)
                check_environment
                ;;
            docker)
                deploy_docker
                ;;
            vercel)
                deploy_vercel
                ;;
            dev)
                start_local
                ;;
            health)
                health_check
                ;;
            setup)
                check_prerequisites
                install_dependencies
                check_environment
                build_frontend
                print_success "Setup complete!"
                ;;
            *)
                echo "Usage: $0 {install|build|check|docker|vercel|dev|health|setup}"
                echo ""
                echo "Options:"
                echo "  install - Install dependencies"
                echo "  build   - Build frontend"
                echo "  check   - Check environment files"
                echo "  docker  - Deploy with Docker"
                echo "  vercel  - Deploy to Vercel"
                echo "  dev     - Start local development"
                echo "  health  - Run health check"
                echo "  setup   - Full setup (install + build)"
                exit 1
                ;;
        esac
    fi
}

# Run main function
main "$@"
