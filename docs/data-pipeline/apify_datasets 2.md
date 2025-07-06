# Apify Dataset Import Guide

## Overview
This document provides instructions for importing data from multiple Apify dataset scrapes into our eyewear ML pipeline.

## Dataset URLs
We maintain a collection of Apify dataset scrapes that need to be processed. These are organized by actor type:

- tDNebBVgJAYY9eisk (Eyewear Product Scraper)
- YJCnS9qogi9XxDgLB (Frame Details Extractor)
- lYfkqb3xkUoyibSNS (Image Quality Analyzer)
- ivsh3CkGx77YttMI2 (Metadata Validator)

## Import Process

### 1. Configuration
Update `.env` file with your Apify API token:
```
APIFY_API_TOKEN=your_token_here
```

### 2. Running Imports
Use the import script with the `--prepare-deepseek` flag to process all datasets:

```bash
python -m scripts.import_data --prepare-deepseek
```

The script will:
1. Fetch data from each dataset
2. Apply quality checks (see image_quality_thresholds.md)
3. Process images and metadata
4. Prepare data for DeepSeek training

### 3. Monitoring Progress
- Check logs in `data/{timestamp}/import_summary.json`
- Monitor image processing in `data/{timestamp}/processed/`
- Review prepared data in `data/{timestamp}/deepseek/`

## Dataset Management

### Adding New Datasets
1. Add dataset URL to the configuration
2. Update dataset type mapping if needed
3. Run import process

### Error Handling
- Failed imports are logged
- Retry mechanism for network issues
- Quality check failures are tracked

## Quality Standards
See `image_quality_thresholds.md` for detailed information about:
- Resolution requirements
- Sharpness thresholds
- Noise ratio limits
- Contrast standards

## Batch Processing
For large numbers of datasets:
1. Use parallel processing
2. Monitor memory usage
3. Check disk space requirements

## Future Improvements
- Automated dataset validation
- Progress tracking
- Error recovery
- Performance optimization

## Support
For issues with dataset imports:
1. Check logs in data directory
2. Verify Apify API access
3. Validate dataset URLs
4. Review quality metrics
