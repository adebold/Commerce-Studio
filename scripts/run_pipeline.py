#!/usr/bin/env python3
"""Script to run the complete data pipeline end-to-end."""

import asyncio
import argparse
import sys
from pathlib import Path
from datetime import datetime
import json

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from api.config.data_pipeline_config import load_config
from api.config.logging_config import setup_logging, DataPipelineLogger
from api.services.data_pipeline import DataPipeline
from api.services.ml_data_service import MLDataService

async def run_pipeline(args):
    """Run the complete data pipeline."""
    # Initialize logging
    setup_logging()
    logger = DataPipelineLogger("pipeline_runner")
    
    try:
        # Load configuration
        config = load_config()
        logger.log_pipeline_start(config.__dict__)
        
        # Initialize services
        data_pipeline = DataPipeline()
        ml_data_service = MLDataService()
        
        # Create output directory with timestamp
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        output_dir = Path(args.output_dir) / timestamp
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Update service configurations with output paths
        data_pipeline.data_config.update({
            'image_download_path': str(output_dir / "images"),
            'processed_data_path': str(output_dir / "processed")
        })
        
        ml_data_service.data_config.update({
            'tensorflow': {
                **ml_data_service.data_config['tensorflow'],
                'tfrecord_path': str(output_dir / "tfrecords")
            },
            'deepseek': {
                **ml_data_service.data_config['deepseek'],
                'data_path': str(output_dir / "deepseek")
            }
        })
        
        # Step 1: Fetch and process data
        logger.log_pipeline_progress(0, 100)
        processed_items, errors = await data_pipeline.fetch_and_process_data()
        
        if not processed_items:
            raise ValueError("No items were successfully processed")
        
        logger.log_pipeline_progress(50, 100)
        
        # Step 2: Prepare ML data
        if args.prepare_tensorflow:
            tf_path = ml_data_service.prepare_tensorflow_data(processed_items)
            logger.log_ml_preparation(
                'tensorflow',
                tf_path,
                {
                    'items': len(processed_items),
                    'output_path': tf_path
                }
            )
        
        if args.prepare_deepseek:
            deepseek_path = ml_data_service.prepare_deepseek_data(processed_items)
            logger.log_ml_preparation(
                'deepseek',
                deepseek_path,
                {
                    'items': len(processed_items),
                    'output_path': deepseek_path
                }
            )
        
        logger.log_pipeline_progress(100, 100)
        
        # Save pipeline summary
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
            },
            'errors': errors[:10] if errors else []  # Include first 10 errors in summary
        }
        
        summary_path = output_dir / "pipeline_summary.json"
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.log_pipeline_complete(summary)
        
        print("\nPipeline completed successfully!")
        print(f"Output directory: {output_dir}")
        print(f"Summary file: {summary_path}")
        
        if errors:
            print(f"\nWarning: Encountered {len(errors)} errors during processing")
            print("Check the error.log file for details")
        
        return 0
        
    except Exception as e:
        logger.log_pipeline_error(e)
        print(f"\nError: Pipeline failed - {str(e)}")
        print("Check the error.log file for details")
        return 1

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Run the complete data pipeline end-to-end"
    )
    
    parser.add_argument(
        '--output-dir',
        type=str,
        default='data',
        help='Base directory for output data (default: data)'
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
    
    parser.add_argument(
        '--debug',
        action='store_true',
        help='Enable debug logging'
    )
    
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    
    if args.debug:
        import logging
        logging.getLogger().setLevel(logging.DEBUG)
    
    sys.exit(asyncio.run(run_pipeline(args)))
