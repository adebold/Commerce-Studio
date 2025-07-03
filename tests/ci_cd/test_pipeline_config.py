import pytest
import os
import yaml
import json
import re
import logging
from pathlib import Path
from unittest import mock

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestCIPipeline:
    """
    Tests for CI/CD pipeline configuration and execution.
    
    These tests validate that CI/CD pipeline configurations are correct and effective.
    They follow TDD principles to guide proper pipeline setup.
    """
    
    @pytest.fixture
    def ci_files(self):
        """Find all CI/CD configuration files in the project."""
        ci_patterns = [
            '.github/workflows/*.yml',
            '.github/workflows/*.yaml',
            '.gitlab-ci.yml',
            'azure-pipelines.yml',
            'Jenkinsfile',
            '.circleci/config.yml',
            '.travis.yml',
            '.drone.yml',
            'bitbucket-pipelines.yml'
        ]
        
        # Find all CI files
        ci_files = []
        for pattern in ci_patterns:
            for path in Path('.').glob(pattern):
                ci_files.append(str(path))
        
        return ci_files
    
    @pytest.fixture
    def parsed_ci_configs(self, ci_files):
        """Parse CI/CD configuration files into Python objects."""
        configs = {}
        
        for file_path in ci_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Parse based on file extension
                    if file_path.endswith('.yml') or file_path.endswith('.yaml'):
                        config = yaml.safe_load(content)
                    elif file_path.endswith('Jenkinsfile'):
                        # Just store raw content for Jenkinsfile
                        config = {'raw_content': content}
                    else:
                        # Try YAML as default
                        try:
                            config = yaml.safe_load(content)
                        except:
                            # Fall back to raw content
                            config = {'raw_content': content}
                    
                    configs[file_path] = config
            except Exception as e:
                logger.warning(f"Could not parse CI file {file_path}: {str(e)}")
        
        return configs
    
    def test_ci_files_exist(self, ci_files):
        """
        Test that CI/CD configuration files exist.
        
        RED: This test will fail if no CI/CD configuration files are found.
        """
        assert ci_files, "No CI/CD configuration files found. Create at least one CI/CD configuration file."
        
        # Log found CI files
        for file_path in ci_files:
            logger.info(f"Found CI/CD configuration file: {file_path}")
    
    def test_ci_files_valid_syntax(self, ci_files):
        """
        Test that CI/CD configuration files have valid syntax.
        
        RED: This test will fail if CI/CD configuration files have syntax errors.
        """
        for file_path in ci_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Check syntax based on file extension
                    if file_path.endswith('.yml') or file_path.endswith('.yaml'):
                        yaml.safe_load(content)
                    elif file_path.endswith('Jenkinsfile'):
                        # Basic Jenkinsfile syntax check
                        assert 'pipeline' in content.lower(), f"Jenkinsfile {file_path} missing 'pipeline' declaration"
                    
                logger.info(f"CI/CD configuration file {file_path} has valid syntax")
            except Exception as e:
                pytest.fail(f"CI/CD configuration file {file_path} has invalid syntax: {str(e)}")
    
    def test_ci_includes_tests(self, parsed_ci_configs):
        """
        Test that CI/CD pipelines include test execution steps.
        
        RED: This test will fail if CI/CD pipelines don't run tests.
        """
        if not parsed_ci_configs:
            pytest.skip("No parsed CI/CD configurations available")
            
        test_patterns = [
            'pytest',
            'test',
            'unittest',
            'jest',
            'mocha',
            'npm test',
            'yarn test',
            'coverage',
            'tox'
        ]
        
        missing_tests = []
        
        for file_path, config in parsed_ci_configs.items():
            has_tests = False
            
            # Convert config to string for pattern matching
            config_str = str(config)
            
            # Check if any test pattern is in the config
            for pattern in test_patterns:
                if pattern.lower() in config_str.lower():
                    has_tests = True
                    break
            
            if not has_tests:
                missing_tests.append(file_path)
        
        # Assert no missing tests
        assert not missing_tests, f"CI/CD configuration files missing test execution: {', '.join(missing_tests)}"
    
    def test_ci_includes_security_checks(self, parsed_ci_configs):
        """
        Test that CI/CD pipelines include security checks.
        
        RED: This test will fail if CI/CD pipelines don't include security scanning.
        """
        if not parsed_ci_configs:
            pytest.skip("No parsed CI/CD configurations available")
            
        security_patterns = [
            'secur',
            'scan',
            'bandit',
            'snyk',
            'dependabot',
            'audit',
            'safety',
            'owasp',
            'sast',
            'dast',
            'sonarqube',
            'codeclimate',
            'lgtm',
            'codeql'
        ]
        
        missing_security = []
        
        for file_path, config in parsed_ci_configs.items():
            has_security = False
            
            # Convert config to string for pattern matching
            config_str = str(config)
            
            # Check if any security pattern is in the config
            for pattern in security_patterns:
                if pattern.lower() in config_str.lower():
                    has_security = True
                    break
            
            if not has_security:
                missing_security.append(file_path)
        
        # Assert no missing security checks
        assert not missing_security, f"CI/CD configuration files missing security checks: {', '.join(missing_security)}"
    
    def test_ci_includes_deployment(self, parsed_ci_configs):
        """
        Test that CI/CD pipelines include deployment steps.
        
        RED: This test will fail if CI/CD pipelines don't include deployment.
        """
        if not parsed_ci_configs:
            pytest.skip("No parsed CI/CD configurations available")
            
        deployment_patterns = [
            'deploy',
            'publish',
            'release',
            'heroku',
            'aws',
            'azure',
            'gcp',
            'kubernetes',
            'k8s',
            'docker',
            'container',
            'artifact'
        ]
        
        missing_deployment = []
        
        for file_path, config in parsed_ci_configs.items():
            has_deployment = False
            
            # Convert config to string for pattern matching
            config_str = str(config)
            
            # Check if any deployment pattern is in the config
            for pattern in deployment_patterns:
                if pattern.lower() in config_str.lower():
                    has_deployment = True
                    break
            
            if not has_deployment:
                missing_deployment.append(file_path)
        
        # Assert no missing deployment
        assert not missing_deployment, f"CI/CD configuration files missing deployment steps: {', '.join(missing_deployment)}"
    
    def test_ci_branches_configuration(self, parsed_ci_configs):
        """
        Test that CI/CD pipelines have proper branch configurations.
        
        RED: This test will fail if CI/CD pipelines don't have proper branch configurations.
        """
        if not parsed_ci_configs:
            pytest.skip("No parsed CI/CD configurations available")
            
        # GitHub Actions specific check
        github_workflows = {path: config for path, config in parsed_ci_configs.items() if 'github/workflows' in path.lower()}
        
        for file_path, config in github_workflows.items():
            # Check if workflow has branch triggers
            on_section = config.get('on', {})
            
            # If 'on' is a string, it's a simple trigger like 'push'
            if isinstance(on_section, str):
                logger.info(f"GitHub workflow {file_path} has simple trigger: {on_section}")
                continue
                
            # Check if 'push' or 'pull_request' sections exist with branch filters
            push_section = on_section.get('push', {})
            pr_section = on_section.get('pull_request', {})
            
            has_branch_filter = False
            
            # Check push section
            if isinstance(push_section, dict) and ('branches' in push_section or 'tags' in push_section):
                has_branch_filter = True
            
            # Check pull_request section
            if isinstance(pr_section, dict) and ('branches' in pr_section or 'types' in pr_section):
                has_branch_filter = True
            
            # Assert branch filter exists
            assert has_branch_filter, f"GitHub workflow {file_path} missing branch filters in 'on' section"
        
        # GitLab CI specific check
        gitlab_ci_files = {path: config for path, config in parsed_ci_configs.items() if '.gitlab-ci.yml' in path.lower()}
        
        for file_path, config in gitlab_ci_files.items():
            # Check if workflow has branch rules
            has_branch_rules = False
            
            # Check for workflow or job level branch rules
            if isinstance(config, dict):
                # Check workflow level
                if 'workflow' in config and 'rules' in config['workflow']:
                    has_branch_rules = True
                
                # Check job level
                for job_name, job_config in config.items():
                    if isinstance(job_config, dict) and ('rules' in job_config or 'only' in job_config or 'except' in job_config):
                        has_branch_rules = True
                        break
            
            # Assert branch rules exist
            assert has_branch_rules, f"GitLab CI file {file_path} missing branch rules (workflow/rules, only, except)"
    
    def test_ci_environment_variables(self, parsed_ci_configs):
        """
        Test that CI/CD pipelines properly handle environment variables.
        
        RED: This test will fail if CI/CD pipelines don't properly handle environment variables.
        """
        if not parsed_ci_configs:
            pytest.skip("No parsed CI/CD configurations available")
        
        missing_env_vars = []
        
        for file_path, config in parsed_ci_configs.items():
            has_env_vars = False
            
            # Convert config to string for simple pattern matching
            config_str = str(config)
            
            # Check common patterns for environment variables
            env_patterns = ['env:', 'environment:', 'ENV', '${{', '$(', '${']
            for pattern in env_patterns:
                if pattern in config_str:
                    has_env_vars = True
                    break
            
            # GitHub Actions specific check
            if 'github/workflows' in file_path.lower() and isinstance(config, dict):
                # Check for env section at workflow level
                if 'env' in config:
                    has_env_vars = True
                
                # Check for env in jobs
                if 'jobs' in config and isinstance(config['jobs'], dict):
                    for job_name, job_config in config['jobs'].items():
                        if isinstance(job_config, dict) and 'env' in job_config:
                            has_env_vars = True
                            break
                
                # Check for environment in jobs
                if 'jobs' in config and isinstance(config['jobs'], dict):
                    for job_name, job_config in config['jobs'].items():
                        if isinstance(job_config, dict) and 'environment' in job_config:
                            has_env_vars = True
                            break
            
            # GitLab CI specific check
            if '.gitlab-ci.yml' in file_path.lower() and isinstance(config, dict):
                # Check for variables section
                if 'variables' in config:
                    has_env_vars = True
                
                # Check for variables in jobs
                for job_name, job_config in config.items():
                    if isinstance(job_config, dict) and 'variables' in job_config:
                        has_env_vars = True
                        break
            
            if not has_env_vars:
                missing_env_vars.append(file_path)
        
        # Assert no missing environment variables
        assert not missing_env_vars, f"CI/CD configuration files missing environment variable handling: {', '.join(missing_env_vars)}"
    
    def test_ci_cache_configuration(self, parsed_ci_configs):
        """
        Test that CI/CD pipelines properly configure caching.
        
        RED: This test will fail if CI/CD pipelines don't configure caching.
        """
        if not parsed_ci_configs:
            pytest.skip("No parsed CI/CD configurations available")
        
        missing_cache = []
        
        for file_path, config in parsed_ci_configs.items():
            has_cache = False
            
            # Convert config to string for simple pattern matching
            config_str = str(config)
            
            # Check common patterns for caching
            if 'cache:' in config_str or 'Cache' in config_str:
                has_cache = True
            
            # GitHub Actions specific check
            if 'github/workflows' in file_path.lower() and isinstance(config, dict):
                if 'jobs' in config and isinstance(config['jobs'], dict):
                    for job_name, job_config in config['jobs'].items():
                        if isinstance(job_config, dict) and 'steps' in job_config:
                            for step in job_config['steps']:
                                if isinstance(step, dict) and 'uses' in step and ('actions/cache' in step['uses'] or 'cache' in step['uses']):
                                    has_cache = True
                                    break
            
            # GitLab CI specific check
            if '.gitlab-ci.yml' in file_path.lower() and isinstance(config, dict):
                # Check for cache section
                if 'cache' in config:
                    has_cache = True
                
                # Check for cache in jobs
                for job_name, job_config in config.items():
                    if isinstance(job_config, dict) and 'cache' in job_config:
                        has_cache = True
                        break
            
            if not has_cache:
                missing_cache.append(file_path)
        
        # Assert no missing cache configuration
        assert not missing_cache, f"CI/CD configuration files missing cache configuration: {', '.join(missing_cache)}"
    
    def test_generate_basic_github_workflow(self):
        """
        Test utility function to generate a basic GitHub workflow file.
        
        This test generates a sample GitHub workflow file to run tests.
        """
        # Define the basic workflow content
        workflow_content = """name: Python Tests

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main, dev ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        python-version: [3.8, 3.9]

    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v2
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Cache pip packages
      uses: actions/cache@v2
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
        restore-keys: |
          ${{ runner.os }}-pip-
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
        pip install pytest pytest-cov
    
    - name: Run tests
      run: |
        pytest --cov=./ --cov-report=xml
    
    - name: Upload coverage report
      uses: codecov/codecov-action@v1
"""
        
        # Write to a file
        workflow_dir = '.github/workflows'
        workflow_path = f'{workflow_dir}/python-tests.yml'
        
        os.makedirs(workflow_dir, exist_ok=True)
        
        with open(workflow_path, 'w') as f:
            f.write(workflow_content)
        
        # Verify file was created
        assert os.path.exists(workflow_path), f"Failed to create workflow file at {workflow_path}"
        
        # Log that the workflow was created
        logger.info(f"Created GitHub workflow file: {workflow_path}")
        logger.info("This workflow will run Python tests on push to main and dev branches")
        
        # Return the path to the created file
        return workflow_path
    
    def test_generate_gitlab_ci_file(self):
        """
        Test utility function to generate a basic GitLab CI file.
        
        This test generates a sample GitLab CI file to run tests and deployments.
        """
        # Define the basic GitLab CI content
        gitlab_ci_content = """stages:
  - test
  - build
  - deploy

variables:
  PYTHON_VERSION: "3.9"

cache:
  paths:
    - .pip/

test:
  stage: test
  image: python:${PYTHON_VERSION}
  script:
    - pip install --cache-dir=.pip -r requirements.txt
    - pip install pytest pytest-cov
    - pytest --cov=./ --cov-report=term
  rules:
    - if: '$CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "dev"'
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  rules:
    - if: '$CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "dev"'

deploy:staging:
  stage: deploy
  script:
    - echo "Deploying to staging environment"
  environment:
    name: staging
  rules:
    - if: '$CI_COMMIT_BRANCH == "dev"'

deploy:production:
  stage: deploy
  script:
    - echo "Deploying to production environment"
  environment:
    name: production
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
"""
        
        # Write to a file
        gitlab_ci_path = '.gitlab-ci.yml'
        
        with open(gitlab_ci_path, 'w') as f:
            f.write(gitlab_ci_content)
        
        # Verify file was created
        assert os.path.exists(gitlab_ci_path), f"Failed to create GitLab CI file at {gitlab_ci_path}"
        
        # Log that the file was created
        logger.info(f"Created GitLab CI file: {gitlab_ci_path}")
        logger.info("This CI configuration will run tests, build Docker images, and deploy to staging/production")
        
        # Return the path to the created file
        return gitlab_ci_path
    
    def test_generate_sample_dockerfile(self):
        """
        Test utility function to generate a sample Dockerfile.
        
        This test generates a sample Dockerfile for the application.
        """
        # Define the basic Dockerfile content
        dockerfile_content = """FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run tests to verify the build
RUN pytest

# Expose port for API
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1

# Run the application
CMD ["python", "api/main.py"]
"""
        
        # Write to a file
        dockerfile_path = 'Dockerfile'
        
        with open(dockerfile_path, 'w') as f:
            f.write(dockerfile_content)
        
        # Verify file was created
        assert os.path.exists(dockerfile_path), f"Failed to create Dockerfile at {dockerfile_path}"
        
        # Log that the file was created
        logger.info(f"Created Dockerfile: {dockerfile_path}")
        logger.info("This Dockerfile builds a Python application image with tests")
        
        # Return the path to the created file
        return dockerfile_path