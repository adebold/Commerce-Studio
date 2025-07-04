/**
 * PMS Integration Demo Server
 * Demonstrates the integration between eyewear-ML and Apollo optical management system
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./src/utils/logger');
const ApolloApiClient = require('./src/services/apolloApiClient');
const MockDataService = require('./src/services/mockDataService');
const PrescriptionTransformer = require('./src/transformers/prescriptionTransformer');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Check if we should use mock data
const useMockData = process.env.USE_MOCK_DATA === 'true';

// Initialize the appropriate data service
let dataService;
if (useMockData) {
  logger.info('Using mock data service');
  dataService = new MockDataService();
} else {
  logger.info('Using Apollo API client');
  dataService = new ApolloApiClient({
    apiEndpoint: process.env.APOLLO_API_ENDPOINT,
    apiKey: process.env.APOLLO_API_KEY,
    apiSecret: process.env.APOLLO_API_SECRET
  });
}

/**
 * API Routes
 */

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PMS Integration service is running' });
});

// Get patients
app.get('/api/patients', async (req, res) => {
  try {
    const { name, dateOfBirth, limit = 10, page = 1 } = req.query;
    
    // Transform query parameters to match API format
    const queryParams = {
      page,
      pageSize: limit
    };
    
    if (name) queryParams.name = name;
    if (dateOfBirth) queryParams.dob = dateOfBirth;
    
    logger.info('Fetching patients', { params: queryParams });
    const patients = await dataService.getPatients(queryParams);
    
    res.status(200).json(patients);
  } catch (error) {
    logger.error('Error fetching patients:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single patient
app.get('/api/patients/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    logger.info(`Fetching patient ${patientId}`);
    
    const patient = await dataService.getPatientById(patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.status(200).json(patient);
  } catch (error) {
    logger.error(`Error fetching patient ${req.params.patientId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get prescriptions for a patient
app.get('/api/patients/:patientId/prescriptions', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    logger.info(`Fetching prescriptions for patient ${patientId}`);
    
    const prescriptions = await dataService.getPatientPrescriptions(patientId, {
      page,
      pageSize: limit
    });
    
    // Transform prescriptions to eyewear-ML format with standardized notation
    const transformedPrescriptions = prescriptions.map(
      prescription => PrescriptionTransformer.transform(prescription)
    );
    
    res.status(200).json(transformedPrescriptions);
  } catch (error) {
    logger.error(`Error fetching prescriptions for patient ${req.params.patientId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single prescription and transform it
app.get('/api/prescriptions/:prescriptionId', async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    logger.info(`Fetching prescription ${prescriptionId}`);
    
    const prescription = await dataService.getPrescriptionById(prescriptionId);
    
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    // Transform prescription to eyewear-ML format
    const transformedPrescription = PrescriptionTransformer.transform(prescription);
    
    res.status(200).json({
      original: prescription,
      transformed: transformedPrescription
    });
  } catch (error) {
    logger.error(`Error fetching prescription ${req.params.prescriptionId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get products (frames)
app.get('/api/products', async (req, res) => {
  try {
    const { brand, category, limit = 10, page = 1 } = req.query;
    
    // Transform query parameters to match API format
    const queryParams = {
      page,
      pageSize: limit,
      type: 'FRAME' // Explicitly filter for frames
    };
    
    if (brand) queryParams.brand = brand;
    if (category) queryParams.category = category;
    
    logger.info('Fetching products', { params: queryParams });
    const products = await dataService.getProducts(queryParams);
    
    res.status(200).json(products);
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`PMS Integration demo server running on port ${PORT}`);
  logger.info(`API base URL: http://localhost:${PORT}/api`);
  logger.info(`Web interface: http://localhost:${PORT}`);
});
