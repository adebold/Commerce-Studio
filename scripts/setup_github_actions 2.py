#!/usr/bin/env python3
"""
Script to set up GitHub Actions for deployment.
This script creates or updates the GitHub Actions workflow file for deployment.
"""

import os
import argparse
import logging
import yaml
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"github_actions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)

logger = logging.getLogger("github_actions")

def create_deployment_workflow(output_file, project_id, cluster_name, zone, environments=None):
    """
    Create a GitHub Actions workflow file for deployment.
    
    Args:
        output_file: Path to the output workflow file
        project_id: Google Cloud project ID
        cluster_name: Google Kubernetes Engine cluster name
        zone: Google Cloud zone
        environments: List of environments to deploy to (default: ['dev', 'staging', 'prod'])
        
    Returns:
        True if successful, False otherwise
    """
    try:
        if environments is None:
            environments = ['dev', 'staging', 'prod']
        
        # Create the workflow configuration
        workflow = {
            'name': 'Deploy Application',
            'on': {
                'push': {
                    'branches': ['main', 'staging']
                },
                'pull_request': {
                    'branches': ['main', 'staging']
                },
                'workflow_dispatch': {
                    'inputs': {
                        'environment': {
                            'description': 'Environment to deploy to',
                            'required': True,
                            'default': 'staging',
                            'type': 'choice',
                            'options': environments
                        },
                        'deployment_type': {
                            'description': 'Deployment type',
                            'required': True,
                            'default': 'rolling',
                            'type': 'choice',
                            'options': ['rolling', 'canary', 'blue-green']
                        },
                        'component': {
                            'description': 'Component to deploy (required for canary deployments)',
                            'required': False,
                            'type': 'string'
                        },
                        'percentage': {
                            'description': 'Percentage of traffic for canary deployment',
                            'required': False,
                            'default': '10',
                            'type': 'string'
                        },
                        'promote_canary': {
                            'description': 'Promote canary deployment to full deployment',
                            'required': False,
                            'default': False,
                            'type': 'boolean'
                        }
                    }
                }
            },
            'env': {
                'PROJECT_ID': '${{ secrets.GCP_PROJECT_ID }}',
                'GKE_CLUSTER': '${{ secrets.GKE_CLUSTER }}',
                'GKE_ZONE': '${{ secrets.GKE_ZONE }}'
            },
            'jobs': {}
        }
        
        # Add validate job
        workflow['jobs']['validate'] = {
            'name': 'Validate',
            'runs-on': 'ubuntu-latest',
            'steps': [
                {
                    'name': 'Checkout code',
                    'uses': 'actions/checkout@v3'
                },
                {
                    'name': 'Set up Python',
                    'uses': 'actions/setup-python@v4',
                    'with': {
                        'python-version': '3.10'
                    }
                },
                {
                    'name': 'Install dependencies',
                    'run': '\n'.join([
                        'python -m pip install --upgrade pip',
                        'pip install -r requirements.txt',
                        'pip install pytest pytest-cov flake8'
                    ])
                },
                {
                    'name': 'Lint with flake8',
                    'run': '\n'.join([
                        'flake8 src/ tests/ --count --select=E9,F63,F7,F82 --show-source --statistics'
                    ])
                },
                {
                    'name': 'Run unit tests',
                    'run': '\n'.join([
                        'pytest tests/unit/ --cov=src'
                    ])
                }
            ]
        }
        
        # Add build job
        workflow['jobs']['build'] = {
            'name': 'Build and Push',
            'needs': 'validate',
            'runs-on': 'ubuntu-latest',
            'outputs': {
                'image_tag': '${{ steps.set-image-tag.outputs.image_tag }}'
            },
            'steps': [
                {
                    'name': 'Checkout code',
                    'uses': 'actions/checkout@v3'
                },
                {
                    'name': 'Set up Docker Buildx',
                    'uses': 'docker/setup-buildx-action@v2'
                },
                {
                    'name': 'Login to Google Container Registry',
                    'uses': 'docker/login-action@v2',
                    'with': {
                        'registry': 'gcr.io',
                        'username': '_json_key',
                        'password': '${{ secrets.GCP_SA_KEY }}'
                    }
                },
                {
                    'name': 'Set image tag',
                    'id': 'set-image-tag',
                    'run': '\n'.join([
                        'BRANCH=${GITHUB_REF#refs/heads/}',
                        'SHA=${GITHUB_SHA::8}',
                        'TIMESTAMP=$(date +%Y%m%d%H%M%S)',
                        'IMAGE_TAG="${BRANCH}-${SHA}-${TIMESTAMP}"',
                        'echo "image_tag=${IMAGE_TAG}" >> $GITHUB_OUTPUT',
                        'echo "Image tag: ${IMAGE_TAG}"'
                    ])
                },
                {
                    'name': 'Build and push API image',
                    'uses': 'docker/build-push-action@v4',
                    'with': {
                        'context': '.',
                        'file': './Dockerfile.api',
                        'push': True,
                        'tags': '\n'.join([
                            'gcr.io/${{ env.PROJECT_ID }}/api:${{ steps.set-image-tag.outputs.image_tag }}',
                            'gcr.io/${{ env.PROJECT_ID }}/api:latest'
                        ])
                    }
                },
                {
                    'name': 'Build and push Frontend image',
                    'uses': 'docker/build-push-action@v4',
                    'with': {
                        'context': '.',
                        'file': './Dockerfile.frontend',
                        'push': True,
                        'tags': '\n'.join([
                            'gcr.io/${{ env.PROJECT_ID }}/frontend:${{ steps.set-image-tag.outputs.image_tag }}',
                            'gcr.io/${{ env.PROJECT_ID }}/frontend:latest'
                        ])
                    }
                }
            ]
        }
        
        # Add deployment jobs for each environment
        for i, env in enumerate(environments):
            job_name = f'deploy-{env}'
            job_needs = ['build']
            
            # Add dependencies between environments
            if i > 0:
                job_needs.append(f'deploy-{environments[i-1]}')
            
            # Set conditions for when to run this job
            if env == 'dev':
                condition = "github.ref == 'refs/heads/staging' || github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'dev'"
            elif env == 'staging':
                condition = "github.ref == 'refs/heads/main' || github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'staging'"
            else:  # prod
                condition = "github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'prod'"
            
            workflow['jobs'][job_name] = {
                'name': f'Deploy to {env.capitalize()}',
                'needs': job_needs,
                'if': condition,
                'runs-on': 'ubuntu-latest',
                'steps': [
                    {
                        'name': 'Checkout code',
                        'uses': 'actions/checkout@v3'
                    },
                    {
                        'name': 'Set up Python',
                        'uses': 'actions/setup-python@v4',
                        'with': {
                            'python-version': '3.10'
                        }
                    },
                    {
                        'name': 'Install dependencies',
                        'run': '\n'.join([
                            'python -m pip install --upgrade pip',
                            'pip install -r requirements.txt'
                        ])
                    },
                    {
                        'name': 'Authenticate to Google Cloud',
                        'uses': 'google-github-actions/auth@v1',
                        'with': {
                            'credentials_json': '${{ secrets.GCP_SA_KEY }}'
                        }
                    },
                    {
                        'name': 'Set up Cloud SDK',
                        'uses': 'google-github-actions/setup-gcloud@v1'
                    },
                    {
                        'name': 'Get GKE credentials',
                        'run': '\n'.join([
                            'gcloud container clusters get-credentials ${{ env.GKE_CLUSTER }} --zone ${{ env.GKE_ZONE }} --project ${{ env.PROJECT_ID }}'
                        ])
                    },
                    {
                        'name': 'Update Kubernetes manifests',
                        'run': '\n'.join([
                            '# Update image tags in Kubernetes manifests',
                            f'sed -i "s|gcr.io/${{{{ env.PROJECT_ID }}}}/api:.*|gcr.io/${{{{ env.PROJECT_ID }}}}/api:${{{{ needs.build.outputs.image_tag }}}}|g" kubernetes/overlays/{env}/kustomization.yaml',
                            f'sed -i "s|gcr.io/${{{{ env.PROJECT_ID }}}}/frontend:.*|gcr.io/${{{{ env.PROJECT_ID }}}}/frontend:${{{{ needs.build.outputs.image_tag }}}}|g" kubernetes/overlays/{env}/kustomization.yaml'
                        ])
                    },
                    {
                        'name': f'Deploy to {env}',
                        'if': "${{ github.event.inputs.deployment_type != 'canary' || github.event.inputs.deployment_type == '' }}",
                        'run': '\n'.join([
                            f'python deploy_with_rollback.py --environment {env}'
                        ])
                    },
                    {
                        'name': f'Deploy canary to {env}',
                        'if': "${{ github.event.inputs.deployment_type == 'canary' && github.event.inputs.component != '' }}",
                        'run': '\n'.join([
                            f'python deploy_with_rollback.py --environment {env} --type canary --component ${{{{ github.event.inputs.component }}}} --percentage ${{{{ github.event.inputs.percentage }}}}'
                        ])
                    },
                    {
                        'name': 'Promote canary to full deployment',
                        'if': "${{ github.event.inputs.promote_canary == 'true' && github.event.inputs.component != '' }}",
                        'run': '\n'.join([
                            f'python deploy_with_rollback.py --environment {env} --promote --component ${{{{ github.event.inputs.component }}}}'
                        ])
                    },
                    {
                        'name': 'Run smoke tests',
                        'run': '\n'.join([
                            f'python -m tests.e2e.smoke_tests --env {env}'
                        ])
                    }
                ]
            }
            
            # Add integration tests for staging and prod
            if env in ['staging', 'prod']:
                workflow['jobs'][job_name]['steps'].append({
                    'name': 'Run integration tests',
                    'run': '\n'.join([
                        f'python -m tests.integration --env {env}'
                    ])
                })
        
        # Add notify job
        workflow['jobs']['notify'] = {
            'name': 'Notify',
            'needs': [f'deploy-{env}' for env in environments],
            'if': 'always()',
            'runs-on': 'ubuntu-latest',
            'steps': [
                {
                    'name': 'Notify Slack',
                    'uses': '8398a7/action-slack@v3',
                    'with': {
                        'status': '${{ job.status }}',
                        'fields': 'repo,message,commit,author,action,eventName,ref,workflow,job,took'
                    },
                    'env': {
                        'SLACK_WEBHOOK_URL': '${{ secrets.SLACK_WEBHOOK_URL }}'
                    }
                }
            ]
        }
        
        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        # Write the workflow file
        with open(output_file, 'w') as f:
            yaml.dump(workflow, f, default_flow_style=False, sort_keys=False)
        
        logger.info(f"Successfully created GitHub Actions workflow file: {output_file}")
        return True
        
    except Exception as e:
        logger.error(f"Error creating GitHub Actions workflow file: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Set up GitHub Actions for deployment')
    parser.add_argument('--output', default='.github/workflows/deploy.yml', help='Path to the output workflow file')
    parser.add_argument('--project-id', required=True, help='Google Cloud project ID')
    parser.add_argument('--cluster-name', required=True, help='Google Kubernetes Engine cluster name')
    parser.add_argument('--zone', required=True, help='Google Cloud zone')
    parser.add_argument('--environments', nargs='+', default=['dev', 'staging', 'prod'], help='Environments to deploy to')
    
    args = parser.parse_args()
    
    if create_deployment_workflow(args.output, args.project_id, args.cluster_name, args.zone, args.environments):
        logger.info("GitHub Actions setup completed successfully")
    else:
        logger.error("GitHub Actions setup failed")
        exit(1)

if __name__ == "__main__":
    main()