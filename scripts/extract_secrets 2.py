#!/usr/bin/env python3
"""
Script to identify and extract hardcoded secrets from the codebase.
This script will scan the codebase for potential hardcoded secrets and
provide options to replace them with environment variable references.
"""

import os
import re
import argparse
import json
from pathlib import Path
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"secret_extraction_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)

logger = logging.getLogger("secret_extractor")

# Patterns to identify potential secrets
SECRET_PATTERNS = [
    # API keys - exclude localhost, example, and environment variable placeholders
    r'(?i)(?:api|access|secret|private)_?key(?:s)?[\s]*[=:][\s]*["\'](?!.*(?:localhost|example|127\.0\.0\.1|\$\{|\bprocess\.env\b|\bos\.getenv\b))([a-zA-Z0-9_\-\.]{16,64})["\']',
    # JWT tokens - exclude common non-secret indicators
    r'(?i)(?:jwt|token|auth)[\s]*[=:][\s]*["\'](?!.*(?:localhost|example|127\.0\.0\.1|\$\{|\bprocess\.env\b|\bos\.getenv\b|test-|mock-))([a-zA-Z0-9_\-\.]{32,})["\']',
    # Database credentials - exclude common test/example values
    r'(?i)(?:password|passwd|pwd)[\s]*[=:][\s]*["\'](?!.*(?:localhost|example|127\.0\.0\.1|\$\{|\bprocess\.env\b|\bos\.getenv\b|test|mock|placeholder|template))([^"\']{8,64})["\']',
    # Connection strings - exclude localhost, example domains, and placeholders
    r'(?i)(?:mongodb|redis|mysql|postgresql|database)(?:_uri|_url|_connection)[\s]*[=:][\s]*["\'](?!.*(?:localhost|127\.0\.0\.1|example\.com|\$\{|\bprocess\.env\b|\bos\.getenv\b))([^"\']{8,})["\']',
    # Generic secrets - exclude common non-secret indicators
    r'(?i)(?:secret|key|credential)[\s]*[=:][\s]*["\'](?!.*(?:localhost|example|127\.0\.0\.1|\$\{|\bprocess\.env\b|\bos\.getenv\b|test|mock|placeholder|template))([^"\']{8,64})["\']',
]

# Files and directories to exclude
EXCLUDE_PATTERNS = [
    r'\.git',
    r'\.venv',
    r'venv',
    r'node_modules',
    r'docs',
    r'examples',
    r'README\..*',
    r'\.env\.example',
    r'\.env\.template',
    r'__pycache__',
    r'\.pytest_cache',
    r'\.mypy_cache',
    r'\.ruff_cache',
    r'\.vscode',
    r'\.idea',
    r'\.DS_Store',
    r'\.env',
    r'\.env\.',
    r'extract_secrets\.py',  # Exclude this script
]

# Context keywords that indicate non-secret values
SKIP_CONTEXTS = [
    'localhost',
    '127.0.0.1',
    'example.com',
    'test-',
    'mock-',
    '${',
    'process.env',
    'os.getenv',
    'TODO',
    'FIXME',
    'documentation',
    'example',
    'placeholder',
    'template'
]

# File extensions to scan
INCLUDE_EXTENSIONS = [
    '.py', '.js', '.ts', '.tsx', '.jsx', '.json', '.yml', '.yaml', '.xml', 
    '.html', '.md', '.txt', '.sh', '.bash', '.ps1', '.dockerfile', '.Dockerfile'
]

def should_exclude(path):
    """Check if a path should be excluded from scanning."""
    for pattern in EXCLUDE_PATTERNS:
        if re.search(pattern, str(path)):
            return True
    return False

def get_file_extension(path):
    """Get the file extension from a path."""
    return os.path.splitext(path)[1].lower()

def find_hardcoded_secrets(directory, output_file=None):
    """
    Find hardcoded secrets in the codebase.
    
    Args:
        directory: The directory to scan
        output_file: Optional file to write results to
    
    Returns:
        A dictionary of found secrets
    """
    logger.info(f"Scanning directory: {directory}")
    
    found_secrets = {}
    total_files = 0
    scanned_files = 0
    
    for root, dirs, files in os.walk(directory):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if not should_exclude(os.path.join(root, d))]
        
        for file in files:
            total_files += 1
            file_path = os.path.join(root, file)
            
            # Skip excluded files and non-included extensions
            if should_exclude(file_path) or get_file_extension(file_path) not in INCLUDE_EXTENSIONS:
                continue
            
            scanned_files += 1
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                file_secrets = []
                for pattern in SECRET_PATTERNS:
                    matches = re.finditer(pattern, content)
                    for match in matches:
                        secret_value = match.group(1)
                        line_number = content[:match.start()].count('\n') + 1
                        context_start = max(0, match.start() - 50)
                        context_end = min(len(content), match.end() + 50)
                        context = content[context_start:context_end].replace('\n', ' ')
                        
                        # Check if context contains any skip indicators
                        should_skip = False
                        for skip_context in SKIP_CONTEXTS:
                            if skip_context.lower() in context.lower():
                                should_skip = True
                                break
                        
                        # Skip this match if it contains non-secret indicators
                        if should_skip:
                            continue
                        
                        file_secrets.append({
                            'pattern': pattern,
                            'value': secret_value,
                            'line': line_number,
                            'context': context
                        })
                
                if file_secrets:
                    found_secrets[file_path] = file_secrets
                    logger.info(f"Found {len(file_secrets)} potential secrets in {file_path}")
            
            except Exception as e:
                logger.error(f"Error processing file {file_path}: {str(e)}")
    
    logger.info(f"Scan complete. Scanned {scanned_files} of {total_files} files.")
    logger.info(f"Found potential secrets in {len(found_secrets)} files.")
    
    if output_file:
        with open(output_file, 'w') as f:
            json.dump(found_secrets, f, indent=2)
        logger.info(f"Results written to {output_file}")
    
    return found_secrets

def generate_env_var_name(secret_context, file_path):
    """Generate a suitable environment variable name based on the context."""
    # Extract key name from context if possible
    key_match = re.search(r'(?:api|access|secret|private|jwt|token|auth|password|passwd|pwd)_?key', secret_context, re.IGNORECASE)
    if key_match:
        base_name = key_match.group(0).upper().replace(' ', '_')
    else:
        # Use filename as base
        base_name = os.path.basename(file_path).split('.')[0].upper() + "_SECRET"
    
    # Clean up the name
    env_var_name = re.sub(r'[^A-Z0-9_]', '_', base_name)
    return env_var_name

def create_env_file(secrets, output_file='.env.example'):
    """Create an environment file with placeholders for the found secrets."""
    logger.info(f"Creating environment file: {output_file}")
    
    env_vars = {}
    
    for file_path, file_secrets in secrets.items():
        for secret in file_secrets:
            env_var_name = generate_env_var_name(secret['context'], file_path)
            
            # Ensure uniqueness by adding a counter if needed
            base_name = env_var_name
            counter = 1
            while env_var_name in env_vars:
                env_var_name = f"{base_name}_{counter}"
                counter += 1
            
            env_vars[env_var_name] = {
                'file': file_path,
                'line': secret['line'],
                'value': secret['value']
            }
    
    with open(output_file, 'w') as f:
        f.write("# Environment variables for the EyewearML application\n")
        f.write("# Generated by extract_secrets.py\n\n")
        
        for env_var, details in env_vars.items():
            f.write(f"# From {details['file']}:{details['line']}\n")
            f.write(f"{env_var}=your_{env_var.lower()}_here\n\n")
    
    logger.info(f"Created environment file with {len(env_vars)} variables")
    return env_vars

def replace_secrets_in_file(file_path, secrets, env_vars, dry_run=True):
    """Replace hardcoded secrets with environment variable references."""
    if not secrets:
        return
    
    logger.info(f"Processing file: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        modified_content = content
        for secret in secrets:
            secret_value = secret['value']
            
            # Find the corresponding environment variable
            env_var_name = None
            for name, details in env_vars.items():
                if details['file'] == file_path and details['line'] == secret['line']:
                    env_var_name = name
                    break
            
            if not env_var_name:
                logger.warning(f"Could not find environment variable for secret at {file_path}:{secret['line']}")
                continue
            
            # Determine the replacement pattern based on file type
            file_ext = get_file_extension(file_path)
            if file_ext in ['.py']:
                replacement = f"os.environ.get('{env_var_name}')"
            elif file_ext in ['.js', '.ts', '.jsx', '.tsx']:
                replacement = f"process.env.{env_var_name}"
            elif file_ext in ['.yml', '.yaml']:
                replacement = f"${{{env_var_name}}}"
            else:
                # Default replacement
                replacement = f"${{{env_var_name}}}"
            
            # Replace the secret with the environment variable reference
            pattern = re.escape(secret_value)
            modified_content = re.sub(pattern, replacement, modified_content)
        
        if modified_content != content:
            if dry_run:
                logger.info(f"Would replace secrets in {file_path} (dry run)")
            else:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(modified_content)
                logger.info(f"Replaced secrets in {file_path}")
        else:
            logger.info(f"No changes made to {file_path}")
    
    except Exception as e:
        logger.error(f"Error processing file {file_path}: {str(e)}")

def main():
    parser = argparse.ArgumentParser(description='Find and extract hardcoded secrets from the codebase')
    parser.add_argument('--directory', '-d', default='.', help='Directory to scan')
    parser.add_argument('--output', '-o', default='secrets_report.json', help='Output file for the secrets report')
    parser.add_argument('--env-file', '-e', default='.env.example', help='Output file for the environment variables')
    parser.add_argument('--replace', '-r', action='store_true', help='Replace hardcoded secrets with environment variable references')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be replaced without making changes')
    
    args = parser.parse_args()
    
    # Find hardcoded secrets
    secrets = find_hardcoded_secrets(args.directory, args.output)
    
    # Create environment file
    env_vars = create_env_file(secrets, args.env_file)
    
    # Replace secrets if requested
    if args.replace or args.dry_run:
        for file_path, file_secrets in secrets.items():
            replace_secrets_in_file(file_path, file_secrets, env_vars, args.dry_run)

if __name__ == "__main__":
    main()