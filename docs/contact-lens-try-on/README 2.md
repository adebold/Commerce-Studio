# Contact Lens Virtual Try-On

This document provides an overview of the Contact Lens Virtual Try-On feature for the VARAi platform.

## Overview

The Contact Lens Virtual Try-On feature allows users to visualize how different contact lenses would look on their eyes. This feature complements the existing eyewear virtual try-on capabilities, providing a comprehensive solution for eyewear retailers.

## Architecture

The Contact Lens Virtual Try-On feature consists of the following components:

### Backend Services

1. **Iris Analysis Service** (`src/api/services/iris_analysis_service.py`)
   - Detects and isolates the iris in eye images
   - Analyzes iris color and patterns
   - Extracts iris measurements
   - Provides data for realistic contact lens overlay

2. **Contact Lens Overlay Service** (`src/api/services/contact_lens_overlay_service.py`)
   - Renders contact lenses on eyes
   - Adjusts lens appearance based on lighting conditions
   - Creates realistic blending with the eye
   - Simulates different lens types and properties

3. **API Endpoints** (`src/api/routers/contact_lens_try_on.py`)
   - `/api/contact-lens-try-on/upload` - Upload an image for try-on
   - `/api/contact-lens-try-on/apply` - Apply contact lens to an image
   - `/api/contact-lens-try-on/options` - Get available lens options
   - `/api/contact-lens-try-on/analyze/{image_id}` - Analyze iris in an image
   - `/api/contact-lens-try-on/image/{image_id}` - Get an uploaded or processed image

### Frontend Components

1. **Contact Lens Try-On Page** (`frontend/src/pages/ContactLensTryOnPage.tsx`)
   - Main page for the contact lens try-on experience
   - Manages the try-on workflow and state

2. **Photo Capture Component** (`frontend/src/components/contact-lens-try-on/PhotoCapture.tsx`)
   - Allows users to capture a photo using their camera or upload from files
   - Provides image preview and controls

3. **Lens Selector Component** (`frontend/src/components/contact-lens-try-on/LensSelector.tsx`)
   - Displays available lens colors and types
   - Allows users to select lens properties
   - Shows iris analysis information

4. **Lens Visualization Component** (`frontend/src/components/contact-lens-try-on/LensVisualization.tsx`)
   - Displays the try-on result
   - Shows lens details
   - Provides options to try different lenses or add to comparison

5. **Comparison View Component** (`frontend/src/components/contact-lens-try-on/ComparisonView.tsx`)
   - Allows users to compare different lens options side by side
   - Provides details for each lens option
   - Lets users select a preferred lens

## Features

The Contact Lens Virtual Try-On feature includes the following capabilities:

- **Iris Detection and Analysis**
  - Automatic detection of iris in uploaded photos
  - Analysis of natural eye color and patterns
  - Measurement of iris dimensions

- **Realistic Lens Rendering**
  - Natural blending with the eye
  - Preservation of eye reflections and highlights
  - Simulation of lens transparency and opacity
  - Adjustment for different lighting conditions

- **Multiple Lens Options**
  - Natural colors (blue, green, hazel, gray, brown)
  - Fashion colors (violet, turquoise, sapphire, amethyst, honey)
  - Different lens types (natural, vivid, opaque)
  - Adjustable opacity

- **Comparison and Selection**
  - Side-by-side comparison of different lenses
  - Detailed information about each lens option
  - Easy selection of preferred lens

## User Flow

1. **Upload Photo**
   - User uploads a photo or takes a picture using their camera
   - System analyzes the iris in the photo

2. **Select Lens**
   - User browses available lens colors and types
   - User adjusts lens properties (opacity, lighting condition)
   - System shows a preview of the selected lens

3. **Try On**
   - System applies the selected lens to the user's photo
   - User sees a realistic visualization of how the lens would look

4. **Compare**
   - User can add multiple lens options to comparison
   - User can view all selected options side by side
   - User can select their preferred lens

## Technical Implementation

### Iris Detection and Analysis

The iris detection and analysis process involves the following steps:

1. **Face Detection**
   - Detect facial landmarks to locate the eyes
   - Extract eye regions from the image

2. **Iris Detection**
   - Use Hough Circle Transform to detect the iris in each eye
   - Create masks for the iris regions

3. **Color Analysis**
   - Sample colors from the iris regions
   - Determine the dominant iris color
   - Detect heterochromia (different colored eyes)

4. **Pattern Analysis**
   - Analyze iris texture and patterns
   - Determine iris structure and density

### Lens Rendering

The lens rendering process involves the following steps:

1. **Lens Texture Generation**
   - Generate or load lens textures based on color and type
   - Apply patterns based on lens type

2. **Lens Application**
   - Resize lens texture to match iris size
   - Apply lens with alpha blending
   - Preserve eye reflections and highlights

3. **Color Adjustment**
   - Adjust saturation and lightness based on lens type
   - Apply color boost for vivid and opaque lenses

4. **Moisture Simulation**
   - Add specular highlights to simulate eye moisture
   - Create realistic wet appearance

## Testing

The Contact Lens Virtual Try-On feature includes comprehensive tests:

- **Backend Service Tests** (`src/api/services/tests/test_contact_lens_services.py`)
  - Tests for iris analysis service
  - Tests for contact lens overlay service

- **API Endpoint Tests** (`src/api/routers/tests/test_contact_lens_try_on.py`)
  - Tests for all API endpoints
  - Tests for error handling

- **Frontend Component Tests** (`frontend/src/components/contact-lens-try-on/__tests__/ContactLensTryOn.test.tsx`)
  - Tests for all frontend components
  - Tests for user interactions

## Future Enhancements

Potential future enhancements for the Contact Lens Virtual Try-On feature:

1. **Advanced Iris Analysis**
   - More detailed iris pattern analysis
   - Better detection of iris color variations

2. **Enhanced Lens Rendering**
   - More realistic lens textures
   - Better simulation of different lighting conditions
   - Improved handling of eye reflections

3. **Additional Lens Options**
   - Special effect lenses (Halloween, cosplay, etc.)
   - Prescription lens visualization
   - Toric lens visualization for astigmatism

4. **Integration with E-commerce**
   - Direct purchase of selected lenses
   - Integration with inventory and pricing
   - Personalized lens recommendations

5. **Mobile App Integration**
   - Native mobile app experience
   - Real-time lens try-on using device camera
   - Sharing options for social media

## Conclusion

The Contact Lens Virtual Try-On feature enhances the VARAi platform by providing a comprehensive solution for eyewear retailers. By allowing users to visualize how different contact lenses would look on their eyes, this feature helps users make more informed purchasing decisions and increases customer satisfaction.