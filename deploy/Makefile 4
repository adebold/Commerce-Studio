# EyewearML Deployment Makefile
# Standardized deployment entry point

.PHONY: help build push deploy deploy-blue-green rollback health-check clean

# Default environment
ENV ?= staging

# Configuration
PROJECT_ID ?= ml-datadriven-recos
REGION ?= us-central1
REGISTRY ?= gcr.io/$(PROJECT_ID)
SERVICES := auth-service frontend api-gateway ml-service

# Colors for output
RED := \033[31m
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
RESET := \033[0m

help: ## Show this help message
	@echo "$(BLUE)EyewearML Deployment Commands$(RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(GREEN)%-20s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

check-env: ## Check required environment variables
	@echo "$(BLUE)Checking environment variables...$(RESET)"
	@if [ -z "$(GCP_PROJECT_ID)" ]; then echo "$(RED)Error: GCP_PROJECT_ID not set$(RESET)"; exit 1; fi
	@if [ -z "$(GCP_REGION)" ]; then echo "$(RED)Error: GCP_REGION not set$(RESET)"; exit 1; fi
	@echo "$(GREEN)Environment check passed$(RESET)"

build: check-env ## Build all Docker images
	@echo "$(BLUE)Building Docker images for $(ENV)...$(RESET)"
	@./docker/build.sh $(ENV)

push: ## Push Docker images to registry
	@echo "$(BLUE)Pushing images to $(REGISTRY)...$(RESET)"
	@./docker/push.sh $(REGISTRY)

deploy: check-env ## Deploy to specified environment
	@echo "$(BLUE)Deploying to $(ENV)...$(RESET)"
	@./scripts/deploy.sh $(ENV)

deploy-blue-green: check-env ## Deploy using blue-green strategy
	@echo "$(BLUE)Starting blue-green deployment to $(ENV)...$(RESET)"
	@if [ "$(ENV)" != "prod" ] && [ "$(ENV)" != "staging" ]; then \
		echo "$(RED)Error: Blue-green deployment only available for staging and prod$(RESET)"; \
		exit 1; \
	fi
	@./blue-green/deploy.sh $(ENV)

switch-traffic: ## Switch traffic in blue-green deployment
	@echo "$(BLUE)Switching traffic for $(ENV)...$(RESET)"
	@./blue-green/switch.sh $(ENV)

rollback: ## Rollback to previous deployment
	@echo "$(YELLOW)Rolling back $(ENV)...$(RESET)"
	@./scripts/rollback.sh $(ENV)

rollback-blue-green: ## Rollback blue-green deployment
	@echo "$(YELLOW)Rolling back blue-green deployment for $(ENV)...$(RESET)"
	@./blue-green/rollback.sh $(ENV)

health-check: ## Run health checks on deployed services
	@echo "$(BLUE)Running health checks for $(ENV)...$(RESET)"
	@./scripts/health-check.sh $(ENV)

logs: ## View logs for services
	@echo "$(BLUE)Viewing logs for $(ENV)...$(RESET)"
	@./scripts/logs.sh $(ENV)

status: ## Check deployment status
	@echo "$(BLUE)Checking deployment status for $(ENV)...$(RESET)"
	@./scripts/status.sh $(ENV)

clean: ## Clean up old deployments and images
	@echo "$(YELLOW)Cleaning up old deployments...$(RESET)"
	@./scripts/clean.sh

# Environment-specific shortcuts
deploy-dev: ## Deploy to development
	@$(MAKE) deploy ENV=dev

deploy-staging: ## Deploy to staging
	@$(MAKE) deploy ENV=staging

deploy-prod: ## Deploy to production (blue-green)
	@$(MAKE) deploy-blue-green ENV=prod

# Service-specific deployments
deploy-auth: check-env ## Deploy only auth service
	@echo "$(BLUE)Deploying auth service to $(ENV)...$(RESET)"
	@./scripts/deploy-service.sh auth-service $(ENV)

deploy-frontend: check-env ## Deploy only frontend
	@echo "$(BLUE)Deploying frontend to $(ENV)...$(RESET)"
	@./scripts/deploy-service.sh frontend $(ENV)

deploy-api: check-env ## Deploy only API gateway
	@echo "$(BLUE)Deploying API gateway to $(ENV)...$(RESET)"
	@./scripts/deploy-service.sh api-gateway $(ENV)

# Monitoring and maintenance
monitor: ## Start deployment monitoring
	@echo "$(BLUE)Starting deployment monitoring...$(RESET)"
	@./monitoring/monitor.sh $(ENV)

backup: ## Backup current deployment state
	@echo "$(BLUE)Backing up deployment state for $(ENV)...$(RESET)"
	@./scripts/backup.sh $(ENV)

# Development helpers
local-build: ## Build images locally for testing
	@echo "$(BLUE)Building images locally...$(RESET)"
	@docker-compose -f docker-compose.dev.yml build

local-up: ## Start local development environment
	@echo "$(BLUE)Starting local development environment...$(RESET)"
	@docker-compose -f docker-compose.dev.yml up -d

local-down: ## Stop local development environment
	@echo "$(BLUE)Stopping local development environment...$(RESET)"
	@docker-compose -f docker-compose.dev.yml down