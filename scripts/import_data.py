#!/usr/bin/env python3
"""Script to demonstrate data import and ML preparation pipeline."""

import asyncio
import logging
import argparse
from pathlib import Path
from datetime import datetime

from src.api.services.data_pipeline import DataPipeline
from src.api.services.ml_data_service import MLDataService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

async def main(args):
    """Run the data import and preparation pipeline."""
    try:
        logger.info("Initializing data pipeline...")
        data_pipeline = DataPipeline()
        ml_data_service = MLDataService()
        
        # Create output directory
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        output_dir = Path(args.output_dir) / timestamp
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Update data paths
        data_pipeline.data_config.update({
            'image_download_path': str(output_dir / "images"),
            'processed_data_path': str(output_dir / "processed")
        })
        
        ml_data_service.data_config['tensorflow']['tfrecord_path'] = str(output_dir / "tfrecords")
        ml_data_service.data_config['deepseek']['data_path'] = str(output_dir / "deepseek")
        
        # Fetch and process data
        logger.info("Fetching data from Apify...")
        processed_items, errors = await data_pipeline.fetch_and_process_data()
        
        if errors:
            logger.warning(f"Encountered {len(errors)} errors during processing:")
            for error in errors[:5]:  # Show first 5 errors
                logger.warning(f"  - {error}")
        
        if not processed_items:
            logger.error("No items were successfully processed")
            return
        
        logger.info(f"Successfully processed {len(processed_items)} items")
        
        # Prepare data for ML models
        if args.prepare_tensorflow:
            logger.info("Preparing data for TensorFlow...")
            tf_path = ml_data_service.prepare_tensorflow_data(processed_items)
            logger.info(f"TensorFlow data saved to: {tf_path}")
        
        if args.prepare_deepseek:
            logger.info("Preparing data for DeepSeek...")
            deepseek_path = ml_data_service.prepare_deepseek_data(processed_items)
            logger.info(f"DeepSeek data saved to: {deepseek_path}")
        
        # Save summary
        summary = {
            'timestamp': timestamp,
            'total_items': len(processed_items),
            'error_count': len(errors),
            'output_directory': str(output_dir),
            'data_paths': {
                'images': str(output_dir / "images"),
                'processed': str(output_dir / "processed"),
                'tfrecords': str(output_dir / "tfrecords") if args.prepare_tensorflow else None,
                'deepseek': str(output_dir / "deepseek") if args.prepare_deepseek else None
            }
        }
        
        import json
        with open(output_dir / "import_summary.json", 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"Import complete. Summary saved to: {output_dir}/import_summary.json")
        
    except Exception as e:
        logger.error(f"Error during import: {str(e)}")
        raise

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Import and process eyewear data")
    
    parser.add_argument(
        '--output-dir',
        type=str,
        default='data',
        help='Directory to store output data (default: data)'
    )
    
    parser.add_argument(
        '--prepare-tensorflow',
        action='store_true',
        help='Prepare data for TensorFlow model'
    )
    
    parser.add_argument(
        '--prepare-deepseek',
        action='store_true',
        help='Prepare data for DeepSeek model'
    )
    
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    asyncio.run(main(args))
