#!/usr/bin/env python3
"""Setup script for the data pipeline environment."""

import subprocess
import sys
import os
from pathlib import Path
import shutil
import argparse
import venv
import json

def run_command(command, check=True):
    """Run a shell command and handle errors."""
    try:
        subprocess.run(command, shell=True, check=check)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command '{command}': {e}")
        return False

def create_virtual_environment(venv_path):
    """Create a Python virtual environment."""
    print(f"Creating virtual environment in {venv_path}...")
    venv.create(venv_path, with_pip=True)
    
    # Get the pip path
    if sys.platform == 'win32':
        pip_path = venv_path / 'Scripts' / 'pip'
    else:
        pip_path = venv_path / 'bin' / 'pip'
    
    return str(pip_path)

def install_dependencies(pip_path):
    """Install Python dependencies."""
    print("Installing Python dependencies...")
    
    # Upgrade pip first
    run_command(f'"{pip_path}" install --upgrade pip')
    
    # Install requirements
    run_command(f'"{pip_path}" install -r requirements.txt')
    
    # Install development requirements if they exist
    if Path('requirements-dev.txt').exists():
        run_command(f'"{pip_path}" install -r requirements-dev.txt')

def setup_data_directories():
    """Create necessary data directories."""
    directories = [
        'data/images',
        'data/processed',
        'data/tfrecords',
        'data/deepseek',
        'logs'
    ]
    
    print("Creating data directories...")
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)

def create_env_file():
    """Create .env file from template if it doesn't exist."""
    if not Path('.env').exists() and Path('.env.example').exists():
        print("Creating .env file from template...")
        shutil.copy('.env.example', '.env')
        print("Please update .env with your configuration values")

def verify_system_dependencies():
    """Verify system dependencies are installed."""
    dependencies = {
        'python': 'python --version',
        'pip': 'pip --version',
        'git': 'git --version'
    }
    
    missing = []
    for dep, command in dependencies.items():
        if not run_command(command, check=False):
            missing.append(dep)
    
    return missing

def setup_git_hooks():
    """Set up Git hooks for development."""
    hooks_dir = Path('.git/hooks')
    if hooks_dir.exists():
        print("Setting up Git hooks...")
        
        # Pre-commit hook
        pre_commit = hooks_dir / 'pre-commit'
        with open(pre_commit, 'w') as f:
            f.write("""#!/bin/sh
# Run tests before commit
python -m pytest
if [ $? -ne 0 ]; then
    echo "Tests failed. Please fix before committing."
    exit 1
fi
""")
        
        # Make hook executable
        if sys.platform != 'win32':
            pre_commit.chmod(0o755)

def create_vs_code_settings():
    """Create VSCode settings for the project."""
    vscode_dir = Path('.vscode')
    vscode_dir.mkdir(exist_ok=True)
    
    # settings.json
    settings = {
        "python.linting.enabled": True,
        "python.linting.pylintEnabled": True,
        "python.formatting.provider": "black",
        "python.testing.pytestEnabled": True,
        "python.testing.unittestEnabled": False,
        "python.testing.nosetestsEnabled": False,
        "python.testing.pytestArgs": [
            "src/tests"
        ]
    }
    
    with open(vscode_dir / 'settings.json', 'w') as f:
        json.dump(settings, f, indent=4)
    
    # launch.json
    launch = {
        "version": "0.2.0",
        "configurations": [
            {
                "name": "Python: Run Pipeline",
                "type": "python",
                "request": "launch",
                "program": "scripts/run_pipeline.py",
                "args": ["--debug"],
                "console": "integratedTerminal"
            },
            {
                "name": "Python: Current File",
                "type": "python",
                "request": "launch",
                "program": "${file}",
                "console": "integratedTerminal"
            }
        ]
    }
    
    with open(vscode_dir / 'launch.json', 'w') as f:
        json.dump(launch, f, indent=4)

def main():
    """Main setup function."""
    parser = argparse.ArgumentParser(description="Set up the data pipeline environment")
    parser.add_argument('--venv-path', default='.venv', help='Path for virtual environment')
    parser.add_argument('--skip-venv', action='store_true', help='Skip virtual environment creation')
    parser.add_argument('--skip-deps', action='store_true', help='Skip dependency installation')
    args = parser.parse_args()
    
    print("Starting setup...")
    
    # Check system dependencies
    missing_deps = verify_system_dependencies()
    if missing_deps:
        print(f"Missing system dependencies: {', '.join(missing_deps)}")
        print("Please install them and try again")
        return 1
    
    # Create virtual environment
    if not args.skip_venv:
        venv_path = Path(args.venv_path)
        pip_path = create_virtual_environment(venv_path)
        
        # Install dependencies
        if not args.skip_deps:
            install_dependencies(pip_path)
    
    # Setup project structure
    setup_data_directories()
    create_env_file()
    setup_git_hooks()
    create_vs_code_settings()
    
    print("\nSetup completed successfully!")
    print("\nNext steps:")
    print("1. Update .env file with your configuration")
    print("2. Activate virtual environment:")
    if sys.platform == 'win32':
        print(f"   .\\{args.venv_path}\\Scripts\\activate")
    else:
        print(f"   source {args.venv_path}/bin/activate")
    print("3. Run tests: python -m pytest")
    print("4. Start pipeline: python scripts/run_pipeline.py --help")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
