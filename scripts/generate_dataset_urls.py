"""Script to generate the dataset_urls.py file."""
from pathlib import Path

def generate_urls_file():
    """Generate the dataset_urls.py file with all Apify URLs."""
    # Create a list to store all URLs
    urls = []
    
    # Read URLs from a text file
    urls_file = Path('apify_urls.txt')
    if urls_file.exists():
        with open(urls_file) as f:
            urls = [line.strip() for line in f if line.strip()]
    else:
        # Default to a smaller set of URLs for testing
        urls = [
            "https://console.apify.com/organization/pJ1MLTcjXaRzgnxAp/actors/tDNebBVgJAYY9eisk/runs/P1PMg8vaUaExKoW7h#output",
            "https://console.apify.com/organization/pJ1MLTcjXaRzgnxAp/actors/YJCnS9qogi9XxDgLB/runs/wnP4aqEptgmYBW46s#output",
            "https://console.apify.com/organization/pJ1MLTcjXaRzgnxAp/actors/lYfkqb3xkUoyibSNS/runs/IfIeuZCfBbvwR65Qv#output",
            "https://console.apify.com/organization/pJ1MLTcjXaRzgnxAp/actors/ivsh3CkGx77YttMI2/runs/EVwsibh50dlPUGCNh#output"
        ]

    # Generate the Python file content
    content = '"""Configuration file containing all Apify dataset URLs."""\n\n'
    content += 'DATASET_URLS = [\n'

    # Add each URL with proper indentation
    for url in urls:
        content += f'    "{url}",\n'

    content += ']\n'

    # Write to file
    with open('config/dataset_urls.py', 'w') as f:
        f.write(content)

    print(f"Generated config/dataset_urls.py with {len(urls)} URLs")

if __name__ == "__main__":
    generate_urls_file()
