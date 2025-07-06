# Makefile for Eyewear ML project

# Variables
PYTHON := python3
PIP := pip3
PYTEST := pytest
FLASK := flask
DOCKER := docker
DOCKER_COMPOSE := docker-compose
VENV := venv
COVERAGE := coverage
BLACK := black
ISORT := isort
FLAKE8 := flake8
MYPY := mypy

# Paths
SRC_DIR := src
FRONTEND_DIR := frontend
TEST_DIR := src/tests
DOCS_DIR := docs
BUILD_DIR := build

.PHONY: all clean install install-dev test lint format check coverage docs run docker-build docker-run help

# Default target
all: install test lint

# Clean build artifacts and temporary files
clean:
	@echo "Cleaning project..."
	rm -rf $(BUILD_DIR)
	rm -rf *.egg-info
	rm -rf .coverage
	rm -rf .pytest_cache
	rm -rf .mypy_cache
	rm -rf htmlcov
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type f -name ".DS_Store" -delete

# Set up virtual environment
venv:
	@echo "Creating virtual environment..."
	$(PYTHON) -m venv $(VENV)
	@echo "Run 'source venv/bin/activate' to activate the virtual environment"

# Install production dependencies
install:
	@echo "Installing production dependencies..."
	$(PIP) install -r requirements.txt

# Install development dependencies
install-dev: install
	@echo "Installing development dependencies..."
	$(PIP) install -r requirements-dev.txt

# Run tests
test:
	@echo "Running tests..."
	$(PYTEST) $(TEST_DIR) -v

# Run tests with coverage
coverage:
	@echo "Running tests with coverage..."
	$(COVERAGE) run -m pytest $(TEST_DIR)
	$(COVERAGE) report
	$(COVERAGE) html
	@echo "Open htmlcov/index.html to view the coverage report"

# Run linting
lint:
	@echo "Running linters..."
	$(FLAKE8) $(SRC_DIR)
	$(MYPY) $(SRC_DIR)
	$(BLACK) --check $(SRC_DIR)
	$(ISORT) --check-only $(SRC_DIR)

# Format code
format:
	@echo "Formatting code..."
	$(BLACK) $(SRC_DIR)
	$(ISORT) $(SRC_DIR)

# Type checking
typecheck:
	@echo "Running type checker..."
	$(MYPY) $(SRC_DIR)

# Build documentation
docs:
	@echo "Building documentation..."
	cd $(DOCS_DIR) && make html
	@echo "Documentation built in $(DOCS_DIR)/_build/html"

# Run development server
run:
	@echo "Starting development server..."
	$(FLASK) run --debug

# Frontend development
.PHONY: frontend-install frontend-build frontend-start frontend-test frontend-lint

frontend-install:
	@echo "Installing frontend dependencies..."
	cd $(FRONTEND_DIR) && npm install

frontend-build:
	@echo "Building frontend..."
	cd $(FRONTEND_DIR) && npm run build

frontend-start:
	@echo "Starting frontend development server..."
	cd $(FRONTEND_DIR) && npm start

frontend-test:
	@echo "Running frontend tests..."
	cd $(FRONTEND_DIR) && npm test

frontend-lint:
	@echo "Linting frontend code..."
	cd $(FRONTEND_DIR) && npm run lint

# Docker commands
docker-build:
	@echo "Building Docker images..."
	$(DOCKER_COMPOSE) build

docker-run:
	@echo "Running Docker containers..."
	$(DOCKER_COMPOSE) up

docker-stop:
	@echo "Stopping Docker containers..."
	$(DOCKER_COMPOSE) down

# Development environment setup
.PHONY: setup-dev setup-hooks setup-pre-commit

setup-dev: venv install-dev setup-hooks
	@echo "Development environment setup complete"

setup-hooks:
	@echo "Setting up git hooks..."
	pre-commit install

setup-pre-commit:
	@echo "Setting up pre-commit..."
	pre-commit install
	pre-commit install --hook-type commit-msg

# Database commands
.PHONY: db-migrate db-upgrade db-downgrade

db-migrate:
	@echo "Creating database migration..."
	alembic revision --autogenerate -m "$(message)"

db-upgrade:
	@echo "Upgrading database..."
	alembic upgrade head

db-downgrade:
	@echo "Downgrading database..."
	alembic downgrade -1

# ML model commands
.PHONY: train-model evaluate-model deploy-model

train-model:
	@echo "Training ML model..."
	$(PYTHON) $(SRC_DIR)/ml/train.py

evaluate-model:
	@echo "Evaluating ML model..."
	$(PYTHON) $(SRC_DIR)/ml/evaluate.py

deploy-model:
	@echo "Deploying ML model..."
	$(PYTHON) $(SRC_DIR)/ml/deploy.py

# Help command
help:
	@echo "Available commands:"
	@echo "  make install         - Install production dependencies"
	@echo "  make install-dev     - Install development dependencies"
	@echo "  make test           - Run tests"
	@echo "  make coverage       - Run tests with coverage report"
	@echo "  make lint           - Run linters"
	@echo "  make format         - Format code"
	@echo "  make docs           - Build documentation"
	@echo "  make run            - Start development server"
	@echo "  make clean          - Clean build artifacts"
	@echo "  make docker-build   - Build Docker images"
	@echo "  make docker-run     - Run Docker containers"
	@echo "  make setup-dev      - Set up development environment"
	@echo "  make frontend-*     - Frontend development commands"
	@echo "  make train-model    - Train ML model"
	@echo "  make help           - Show this help message"
