#!/usr/bin/env python3
"""Script to process multiple Apify datasets."""

import os
import json
import logging
from datetime import datetime
from typing import List, Dict
from pathlib import Path
import asyncio
import aiohttp
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
APIFY_API_TOKEN = os.getenv('APIFY_API_TOKEN')

ACTOR_TYPES = {
    'tDNebBVgJAYY9eisk': 'product_scraper',
    'YJCnS9qogi9XxDgLB': 'frame_details',
    'lYfkqb3xkUoyibSNS': 'image_quality',
    'ivsh3CkGx77YttMI2': 'metadata_validator'
}

class ApifyDatasetProcessor:
    def __init__(self):
        self.session = None
        self.timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        self.base_dir = Path(f'data/{self.timestamp}')
        self.base_dir.mkdir(parents=True, exist_ok=True)
        
    async def init_session(self):
        """Initialize aiohttp session."""
        if not self.session:
            self.session = aiohttp.ClientSession(headers={
                'Authorization': f'Bearer {APIFY_API_TOKEN}'
            })

    async def close_session(self):
        """Close aiohttp session."""
        if self.session:
            await self.session.close()
            self.session = None

    def load_dataset_urls(self) -> List[Dict]:
        """Load dataset URLs and metadata from configuration."""
        try:
            from config.dataset_urls import DATASET_URLS
            datasets = []
            for url in DATASET_URLS:
                if not self._validate_dataset_url(url):
                    logger.warning(f"Invalid URL format: {url}")
                    continue
                    
                actor_id = url.split("/actors/")[1].split("/")[0]
                run_id = url.split("/runs/")[1].split("#")[0]
                
                datasets.append({
                    'url': url,
                    'actor_id': actor_id,
                    'run_id': run_id,
                    'actor_type': ACTOR_TYPES.get(actor_id, 'unknown'),
                    'status': 'pending'
                })
            return datasets
        except ImportError:
            logger.error("Failed to import dataset URLs from config. Please ensure config/dataset_urls.py exists.")
            return []


    def _validate_dataset_url(self, url: str) -> bool:
        """Validate Apify dataset URL format."""
        return (
            url.startswith(("https://console.apify.com/", "http://console.apify.com/")) and
            "actors" in url and
            "#output" in url
        )

    async def process_dataset(self, dataset: Dict) -> Dict:
        """Process a single dataset."""
        try:
            # Convert console URL to API URL
            api_url = f"https://api.apify.com/v2/actor-runs/{dataset['run_id']}/dataset/items"
            
            async with self.session.get(api_url) as response:
                if response.status != 200:
                    raise Exception(f"API request failed: {response.status}")
                    
                data = await response.json()
                
                # Save raw data
                output_dir = self.base_dir / 'raw' / dataset['actor_type']
                output_dir.mkdir(parents=True, exist_ok=True)
                
                output_file = output_dir / f"{dataset['run_id']}.json"
                with open(output_file, 'w') as f:
                    json.dump(data, f, indent=2)
                
                dataset['status'] = 'completed'
                dataset['items_count'] = len(data)
                dataset['processed_at'] = datetime.utcnow().isoformat()
                
                return dataset
                
        except Exception as e:
            logger.error(f"Error processing dataset {dataset['run_id']}: {str(e)}")
            dataset['status'] = 'failed'
            dataset['error'] = str(e)
            return dataset

    async def process_all_datasets(self):
        """Process all datasets in parallel."""
        try:
            await self.init_session()
            
            datasets = self.load_dataset_urls()
            logger.info(f"Processing {len(datasets)} datasets")
            
            # Process in parallel with limit
            tasks = []
            for dataset in datasets:
                if dataset['status'] != 'completed':
                    task = asyncio.create_task(self.process_dataset(dataset))
                    tasks.append(task)
                    
                    if len(tasks) >= 5:  # Process 5 at a time
                        await asyncio.gather(*tasks)
                        tasks = []
            
            if tasks:
                await asyncio.gather(*tasks)
                
            # Update configuration with results
            with open('config/apify_datasets.json', 'w') as f:
                json.dump(datasets, f, indent=2)
                
            # Generate summary
            summary = {
                'timestamp': self.timestamp,
                'total_datasets': len(datasets),
                'completed': len([d for d in datasets if d['status'] == 'completed']),
                'failed': len([d for d in datasets if d['status'] == 'failed']),
                'datasets': datasets
            }
            
            with open(self.base_dir / 'import_summary.json', 'w') as f:
                json.dump(summary, f, indent=2)
                
        finally:
            await self.close_session()

async def main():
    """Main entry point."""
    processor = ApifyDatasetProcessor()
    await processor.process_all_datasets()

if __name__ == "__main__":
    asyncio.run(main())
