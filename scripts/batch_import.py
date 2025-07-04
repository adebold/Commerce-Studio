#!/usr/bin/env python
"""Script to import Apify datasets in batches."""

import asyncio
import json
from pathlib import Path
from datetime import datetime
import logging
from typing import List, Dict

from src.api.services.data_pipeline import DataPipeline
from config.dataset_urls import DATASET_URLS

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'import_log_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

async def process_batch(urls: List[str], batch_num: int) -> Dict:
    """Process a batch of dataset URLs."""
    pipeline = DataPipeline()
    pipeline.dataset_urls = urls
    
    logger.info(f"Starting batch {batch_num} with {len(urls)} datasets")
    start_time = datetime.now()
    
    try:
        processed_items, errors = await pipeline.fetch_and_process_data()
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        result = {
            'batch_number': batch_num,
            'start_time': start_time.isoformat(),
            'end_time': end_time.isoformat(),
            'duration_seconds': duration,
            'datasets_processed': len(urls),
            'items_processed': len(processed_items),
            'error_count': len(errors),
            'errors': errors
        }
        
        # Save batch results
        batch_dir = Path('data/batch_results')
        batch_dir.mkdir(parents=True, exist_ok=True)
        
        with open(batch_dir / f'batch_{batch_num}_results.json', 'w') as f:
            json.dump(result, f, indent=2)
            
        logger.info(f"Completed batch {batch_num}: {len(processed_items)} items processed in {duration:.2f} seconds")
        return result
        
    except Exception as e:
        logger.error(f"Error processing batch {batch_num}: {str(e)}")
        return {
            'batch_number': batch_num,
            'error': str(e),
            'status': 'failed'
        }

async def main():
    """Main function to process all datasets in batches."""
    batch_size = 50
    total_datasets = len(DATASET_URLS)
    total_batches = (total_datasets + batch_size - 1) // batch_size
    
    logger.info(f"Starting import of {total_datasets} datasets in {total_batches} batches")
    
    summary = {
        'start_time': datetime.now().isoformat(),
        'total_datasets': total_datasets,
        'total_batches': total_batches,
        'batch_size': batch_size,
        'batches': []
    }
    
    try:
        for i in range(0, total_datasets, batch_size):
            batch_num = i // batch_size + 1
            batch_urls = DATASET_URLS[i:i + batch_size]
            
            logger.info(f"Processing batch {batch_num}/{total_batches}")
            result = await process_batch(batch_urls, batch_num)
            summary['batches'].append(result)
            
            # Save updated summary after each batch
            summary['end_time'] = datetime.now().isoformat()
            with open('data/import_summary.json', 'w') as f:
                json.dump(summary, f, indent=2)
            
        logger.info("All batches completed successfully")
        
    except Exception as e:
        logger.error(f"Error in batch processing: {str(e)}")
        summary['error'] = str(e)
        summary['status'] = 'failed'
    finally:
        summary['end_time'] = datetime.now().isoformat()
        with open('data/import_summary.json', 'w') as f:
            json.dump(summary, f, indent=2)

if __name__ == '__main__':
    asyncio.run(main())
