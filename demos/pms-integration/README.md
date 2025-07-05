# eyewear-ML Apollo PMS Integration Demo

This demo showcases integration between eyewear-ML and Apollo optical management system (Oogwereld), with special emphasis on prescription data transformation from European to US notation standards.

## Features

- Patient search and retrieval
- Prescription data fetching with automatic transformation
- Product (frames) catalog search
- Prescription transformation visualization (European positive cylinder to US negative cylinder notation)
- Web interface for interactive testing

## Prerequisites

- Node.js 14.x or higher
- npm or yarn
- Apollo API credentials (for production use)

## Installation

1. Clone the repository and navigate to the demo directory:

```bash
cd demos/pms-integration
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file by copying the example:

```bash
cp .env.example .env
```

4. Edit the `.env` file to add your Apollo API credentials:

```
# Apollo API Configuration
APOLLO_API_ENDPOINT=https://apolloapics.oogwereld.nl
APOLLO_API_KEY=your_api_key_here
APOLLO_API_SECRET=your_api_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Mock Mode (for Testing Without API Access)

If you don't have Apollo API credentials, the demo includes a mock data mode that can be used for demonstration purposes. 

To enable mock mode, set the following in your `.env` file:

```
USE_MOCK_DATA=true
```

## Running the Demo

Start the server:

```bash
npm start
```

For development with auto-reloading:

```bash
npm run dev
```

Once running, open your browser and navigate to:

```
http://localhost:3000
```

## Usage

### Patient Search

1. Enter patient search criteria (name and/or date of birth)
2. Click "Search Patients" to retrieve matching patients
3. Select a patient from the dropdown to see detailed information
4. Click "Get Patient Details" to fetch and display complete patient data

### Prescriptions

1. Enter a patient ID (or use the patient selector which will auto-fill this)
2. Click "Get Prescriptions" to retrieve all prescriptions for the patient
3. View transformed prescription data in eyewear-ML format

### Products

1. Enter search criteria for frames (brand and/or category)
2. Click "Search Products" to retrieve matching products

### Prescription Transformation

1. Enter a prescription ID (this is auto-filled when viewing prescriptions)
2. Click "Transform Prescription" to visualize both:
   - Original Apollo format (positive cylinder notation)
   - Transformed eyewear-ML format (negative cylinder notation)

## API Reference

The demo server exposes the following API endpoints:

- `GET /api/health` - Health check endpoint
- `GET /api/patients` - Search patients
- `GET /api/patients/:patientId` - Get a single patient
- `GET /api/patients/:patientId/prescriptions` - Get prescriptions for a patient
- `GET /api/prescriptions/:prescriptionId` - Get a single prescription (original and transformed)
- `GET /api/products` - Search products (frames)

## Technical Details

### Prescription Transformation

The core of this demo is the transformation of prescription data from Apollo's European format (positive cylinder notation) to eyewear-ML's US format (negative cylinder notation).

Key transformation points:

1. **Notation Conversion**: Converting from positive cylinder (European) to negative cylinder (US) notation
   ```
   European (Apollo):   SPH: +2.00, CYL: +1.00, AXIS: 90
   US (eyewear-ML):     SPH: +3.00, CYL: -1.00, AXIS: 90
   ```

2. **Data Extraction**: Parsing additional measurements often stored in comments fields
   - Pupillary Distance (PD)
   - Vertex Distance (VD)
   - Pantoscopic Angle
   - Wrap Angle

3. **Format Standardization**: Converting string values with plus signs to numeric values
   ```
   Apollo: addPower: "+2.50"
   eyewear-ML: addPower: 2.5
   ```

## Architecture

The demo follows a simple architecture:

- `server.js` - Express server with API routes
- `src/services/apolloApiClient.js` - Client for Apollo API communication
- `src/transformers/prescriptionTransformer.js` - Prescription transformation logic
- `src/utils/logger.js` - Logging utility
- `public/` - Web interface for interactive demo
