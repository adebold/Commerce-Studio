# Data Pipeline Documentation

This document describes the data pipeline for importing eyewear data from Apify and preparing it for machine learning models.

## Overview

The data pipeline consists of three main components:

1. **Data Import**: Fetches eyewear data from Apify and processes it into a standardized format
2. **Image Processing**: Handles image downloading, preprocessing, and quality validation
3. **ML Data Preparation**: Prepares data for both TensorFlow and DeepSeek models

## Prerequisites

- Python 3.8 or higher
- Required Python packages (install via `pip install -r requirements.txt`)
- Apify API token (set in environment variable `APIFY_API_TOKEN`)
- Sufficient disk space for image storage and processing

## Directory Structure

```
data/
├── images/              # Downloaded original images
├── processed/           # Processed images and data
├── tfrecords/          # TensorFlow training data
└── deepseek/           # DeepSeek training data
```

## Usage

### Using the Import Script

The `scripts/import_data.py` script provides a command-line interface for running the data pipeline:

```bash
# Basic usage (only downloads and processes data)
python scripts/import_data.py

# Prepare data for TensorFlow model
python scripts/import_data.py --prepare-tensorflow

# Prepare data for DeepSeek model
python scripts/import_data.py --prepare-deepseek

# Prepare for both models with custom output directory
python scripts/import_data.py --prepare-tensorflow --prepare-deepseek --output-dir /path/to/data
```

### Using the API

The data pipeline can also be triggered via the FastAPI endpoint:

```bash
# Start import job
curl -X POST http://localhost:8000/data/import

# Check import status
curl http://localhost:8000/data/import/status/{job_id}

# Get import errors
curl http://localhost:8000/data/import/errors
```

## Data Processing Steps

1. **Data Import**
   - Fetch data from Apify dataset
   - Validate required fields
   - Process measurements and metadata

2. **Image Processing**
   - Download images from source URLs
   - Remove backgrounds
   - Apply noise reduction
   - Perform color correction
   - Standardize image sizes
   - Validate image quality

3. **ML Data Preparation**
   - Split data into train/validation/test sets
   - Create TFRecord files for TensorFlow
   - Organize images for DeepSeek
   - Generate metadata files

## Data Formats

### Processed Item Format

```json
{
    "id": "unique_id",
    "brand": "Brand Name",
    "model": "Model Name",
    "measurements": {
        "frame_width": 136.0,
        "temple_length": 145.0,
        "bridge_width": 18.0,
        "lens_width": 52.0
    },
    "features": {
        "frame_shape": "Square",
        "frame_material": "Plastic",
        "frame_style": "Full Rim",
        "frame_color": "Black",
        "gender": "Unisex"
    },
    "images": [
        {
            "original_url": "https://example.com/image.jpg",
            "processed_path": "/path/to/processed/image.jpg",
            "metadata": {
                "quality_metrics": {...},
                "processing_steps": [...]
            }
        }
    ],
    "metadata": {
        "manufacturer": "Manufacturer Name",
        "year": "2024",
        "processed_timestamp": "2024-02-15T12:00:00Z"
    }
}
```

### Quality Standards

Images must meet the following quality standards:

- Minimum resolution: 800x600 pixels
- Minimum sharpness score: 100
- Maximum noise ratio: 0.1
- Minimum contrast: 0.5

## Error Handling

The pipeline includes comprehensive error handling:

- Validation errors for missing or invalid data
- Image processing errors
- Network errors during downloads
- Storage and I/O errors

Errors are logged and can be retrieved via the API endpoint `/data/import/errors`.

## Monitoring

The import process can be monitored through:

1. Logging output (configured in `logging.conf`)
2. API status endpoint
3. Import summary JSON file

The import summary includes:
- Total items processed
- Error count
- Output file locations
- Processing timestamps

## Best Practices

1. **Regular Imports**
   - Schedule imports during off-peak hours
   - Monitor disk space usage
   - Archive old data periodically

2. **Error Handling**
   - Review error logs after each import
   - Retry failed items selectively
   - Monitor error patterns

3. **Data Quality**
   - Validate processed data
   - Check image quality metrics
   - Verify ML data format

## Troubleshooting

Common issues and solutions:

1. **Network Errors**
   - Check API token validity
   - Verify network connectivity
   - Check for rate limiting

2. **Image Processing Errors**
   - Verify image URLs
   - Check disk space
   - Monitor memory usage

3. **ML Data Preparation**
   - Verify data format
   - Check for corrupted images
   - Validate TFRecord files

## Contributing

When contributing to the data pipeline:

1. Add tests for new functionality
2. Update documentation
3. Follow code style guidelines
4. Add error handling
5. Update requirements.txt if needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.
