# Image Quality Thresholds

This document describes the image quality thresholds used in the data pipeline for processing eyewear product images.

## Overview

The data pipeline uses several quality metrics to ensure that processed images meet our standards for ML training:

```python
quality_thresholds = {
    'min_resolution': (450, 450),  # Accept 450x900 images
    'min_sharpness': 100,         # Base sharpness threshold
    'max_noise_ratio': 0.5,       # Noise ratio threshold
    'min_contrast': 0.5           # Minimum contrast level
}
```

## Quality Metrics

### Resolution
- **Threshold**: 450x450 minimum
- **Purpose**: Ensures images have sufficient detail for ML processing
- **Implementation**: Checks both height and width independently
- **Note**: Optimized for common product image format (450x900)

### Sharpness
- **Threshold**: 100 (Laplacian variance)
- **Purpose**: Ensures images are sufficiently clear and well-focused
- **Implementation**: Uses OpenCV's Laplacian variance calculation
- **Note**: Value determined through analysis of product image dataset

### Noise Ratio
- **Threshold**: 0.5 maximum
- **Purpose**: Controls image noise levels while allowing typical product photography
- **Implementation**: Calculated as Laplacian variance / signal variance
- **Note**: Higher threshold accommodates various lighting conditions in product photos

### Contrast
- **Threshold**: 0.5 minimum
- **Purpose**: Ensures sufficient distinction between image elements
- **Implementation**: Calculated as (max - min) / 255.0 in grayscale
- **Note**: Works well for product images against clean backgrounds

## Validation Process

The pipeline validates images through the `_meets_quality_standards` method:

```python
def _meets_quality_standards(self, metrics: Dict) -> bool:
    height, width = metrics['resolution']
    min_height, min_width = self.quality_thresholds['min_resolution']
    
    # Check each metric individually
    size_ok = height >= min_height and width >= min_width
    sharpness_ok = metrics['sharpness'] >= self.quality_thresholds['min_sharpness']
    noise_ok = metrics['noise_ratio'] <= self.quality_thresholds['max_noise_ratio']
    contrast_ok = metrics['contrast'] >= self.quality_thresholds['min_contrast']
    
    return size_ok and sharpness_ok and noise_ok and contrast_ok
```

## Logging and Debugging

The pipeline includes detailed logging of quality metrics:
- Each metric is logged individually
- Pass/fail results for each check are recorded
- Helps identify specific reasons for image rejection

Example log output:
```
Quality metrics: {'resolution': (450, 900), 'sharpness': 430.48, 'noise_ratio': 0.106, 'contrast': 1.0}
Quality checks - Size: True, Sharpness: True, Noise: True, Contrast: True
```

## Common Rejection Cases

1. **Placeholder Images**
   - Usually fail on sharpness and contrast
   - Example: "missing_image" placeholders

2. **Extremely Noisy Images**
   - Fail when noise_ratio > 0.5
   - Often indicates poor lighting or compression artifacts

3. **Low Resolution Images**
   - Fail if below 450x450
   - Ensures sufficient detail for ML processing

## Implementation Notes

1. **Resolution Check**
   - Implemented first as it's the most basic requirement
   - Prevents unnecessary processing of unsuitable images

2. **Sharpness Calculation**
   ```python
   gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
   sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
   ```

3. **Noise Estimation**
   ```python
   noise = cv2.Laplacian(gray_image, cv2.CV_64F).var()
   signal = gray_image.var()
   noise_ratio = noise / signal if signal > 0 else float('inf')
   ```

4. **Contrast Calculation**
   ```python
   contrast = (gray_image.max() - gray_image.min()) / 255.0
   ```

## Usage

To process images through the pipeline:

```python
python -m scripts.import_data --prepare-deepseek
```

The script will:
1. Load images from the data source
2. Apply quality checks
3. Process valid images
4. Save results to the specified output directory

## Future Considerations

1. **Dynamic Thresholds**
   - Consider implementing adaptive thresholds based on image characteristics
   - Could improve handling of different product categories

2. **Performance Optimization**
   - Current implementation prioritizes accuracy over speed
   - Future versions might include faster preliminary checks

3. **Additional Metrics**
   - May add checks for color balance, symmetry, or other relevant features
   - Would require careful tuning to maintain acceptance rates
