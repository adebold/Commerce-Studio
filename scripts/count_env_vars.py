#!/usr/bin/env python3

def count_env_vars(file_path):
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()
            # Count non-empty, non-comment lines
            count = sum(1 for line in lines if line.strip() and not line.strip().startswith('#'))
            return count
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    count = count_env_vars(".env")
    print(f"Number of environment variables in .env: {count}")