/**
 * Mock Data Service for Apollo PMS Integration Demo
 * 
 * Provides sample data for demonstration purposes when real Apollo API credentials
 * are not available. This allows the demo to be run in a self-contained way.
 */
const logger = require('../utils/logger');

class MockDataService {
  constructor() {
    this.patients = this.generateMockPatients();
    this.prescriptions = this.generateMockPrescriptions();
    this.products = this.generateMockProducts();
    
    logger.info('Mock Data Service initialized with sample data');
  }
  
  /**
   * Generate mock patient data
   * @returns {Array} Array of patient objects
   */
  generateMockPatients() {
    return [
      {
        id: 'P1001',
        firstName: 'Emma',
        lastName: 'De Vries',
        dateOfBirth: '1985-04-12',
        gender: 'female',
        email: 'emma.devries@example.com',
        phone: '+31612345678',
        address: {
          street: 'Herengracht 123',
          city: 'Amsterdam',
          postalCode: '1017 BN',
          country: 'Netherlands'
        },
        lastVisit: '2024-12-15'
      },
      {
        id: 'P1002',
        firstName: 'Lars',
        lastName: 'Jansen',
        dateOfBirth: '1979-08-23',
        gender: 'male',
        email: 'lars.jansen@example.com',
        phone: '+31687654321',
        address: {
          street: 'Prinsengracht 456',
          city: 'Amsterdam',
          postalCode: '1016 HZ',
          country: 'Netherlands'
        },
        lastVisit: '2025-01-20'
      },
      {
        id: 'P1003',
        firstName: 'Sophie',
        lastName: 'Bakker',
        dateOfBirth: '1992-11-05',
        gender: 'female',
        email: 'sophie.bakker@example.com',
        phone: '+31698765432',
        address: {
          street: 'Keizersgracht 789',
          city: 'Amsterdam',
          postalCode: '1015 CJ',
          country: 'Netherlands'
        },
        lastVisit: '2025-02-10'
      }
    ];
  }
  
  /**
   * Generate mock prescription data
   * @returns {Array} Array of prescription objects
   */
  generateMockPrescriptions() {
    return [
      {
        id: 'RX1001',
        patientId: 'P1001',
        doctorId: 'D101',
        date: '2024-12-15',
        expirationDate: '2026-12-15',
        rightEye: {
          sphere: 1.50,
          cylinder: 0.75,
          axis: 90
        },
        leftEye: {
          sphere: 1.25,
          cylinder: 0.50,
          axis: 85
        },
        addPower: '+2.00',
        pd: '63',
        notes: 'PD:63; VD:12; Patient prefers lightweight frames',
        type: 'Progressive'
      },
      {
        id: 'RX1002',
        patientId: 'P1002',
        doctorId: 'D102',
        date: '2025-01-20',
        expirationDate: '2027-01-20',
        rightEye: {
          sphere: -2.25,
          cylinder: 1.00,
          axis: 175
        },
        leftEye: {
          sphere: -2.50,
          cylinder: 0.75,
          axis: 5
        },
        pd: '65',
        notes: 'Panto:5; Wrap:8; Patient is sensitive to blue light',
        type: 'Single Vision'
      },
      {
        id: 'RX1003',
        patientId: 'P1003',
        doctorId: 'D103',
        date: '2025-02-10',
        expirationDate: '2027-02-10',
        rightEye: {
          sphere: -4.00,
          cylinder: 1.25,
          axis: 10
        },
        leftEye: {
          sphere: -3.75,
          cylinder: 1.00,
          axis: 170
        },
        pd: '62',
        notes: 'PD:31/31; VD:14; Recommend high-index lenses',
        type: 'Single Vision'
      },
      {
        id: 'RX1004',
        patientId: 'P1001',
        doctorId: 'D101',
        date: '2023-06-30',
        expirationDate: '2025-06-30',
        rightEye: {
          sphere: 1.25,
          cylinder: 0.50,
          axis: 85
        },
        leftEye: {
          sphere: 1.00,
          cylinder: 0.25,
          axis: 80
        },
        addPower: '+1.75',
        pd: '63',
        notes: 'Previous prescription',
        type: 'Progressive'
      }
    ];
  }
  
  /**
   * Generate mock product data
   * @returns {Array} Array of product objects
   */
  generateMockProducts() {
    return [
      {
        id: 'F1001',
        brand: 'Ray-Ban',
        model: 'Wayfarer',
        category: 'Sunglasses',
        price: 149.99,
        color: 'Black',
        material: 'Acetate',
        gender: 'Unisex',
        size: {
          lensWidth: 50,
          bridgeWidth: 18,
          templeLength: 140
        },
        inStock: true,
        images: ['rayban_wayfarer_black.jpg']
      },
      {
        id: 'F1002',
        brand: 'Oakley',
        model: 'Holbrook',
        category: 'Sunglasses',
        price: 179.99,
        color: 'Matte Black',
        material: 'O Matter',
        gender: 'Men',
        size: {
          lensWidth: 55,
          bridgeWidth: 18,
          templeLength: 137
        },
        inStock: true,
        images: ['oakley_holbrook_matte_black.jpg']
      },
      {
        id: 'F1003',
        brand: 'Persol',
        model: 'PO3019S',
        category: 'Sunglasses',
        price: 259.99,
        color: 'Havana',
        material: 'Acetate',
        gender: 'Men',
        size: {
          lensWidth: 52,
          bridgeWidth: 18,
          templeLength: 140
        },
        inStock: true,
        images: ['persol_po3019s_havana.jpg']
      },
      {
        id: 'F1004',
        brand: 'Tom Ford',
        model: 'TF5401',
        category: 'Optical',
        price: 299.99,
        color: 'Dark Havana',
        material: 'Acetate',
        gender: 'Men',
        size: {
          lensWidth: 54,
          bridgeWidth: 20,
          templeLength: 145
        },
        inStock: true,
        images: ['tomford_tf5401_darkhavana.jpg']
      },
      {
        id: 'F1005',
        brand: 'Prada',
        model: 'PR 53VS',
        category: 'Sunglasses',
        price: 329.99,
        color: 'Black',
        material: 'Metal',
        gender: 'Women',
        size: {
          lensWidth: 51,
          bridgeWidth: 17,
          templeLength: 140
        },
        inStock: true,
        images: ['prada_pr53vs_black.jpg']
      }
    ];
  }
  
  /**
   * Get patients based on filter criteria
   * @param {Object} params Query parameters
   * @returns {Array} Filtered patients
   */
  getPatients(params = {}) {
    logger.debug('Mock: Getting patients with params', params);
    
    let filteredPatients = [...this.patients];
    
    // Apply filters
    if (params.name) {
      const name = params.name.toLowerCase();
      filteredPatients = filteredPatients.filter(
        patient => patient.firstName.toLowerCase().includes(name) || 
                   patient.lastName.toLowerCase().includes(name)
      );
    }
    
    if (params.dateOfBirth) {
      filteredPatients = filteredPatients.filter(
        patient => patient.dateOfBirth === params.dateOfBirth
      );
    }
    
    // Apply pagination
    const page = parseInt(params.page, 10) || 1;
    const pageSize = parseInt(params.pageSize, 10) || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return filteredPatients.slice(start, end);
  }
  
  /**
   * Get a single patient by ID
   * @param {string} patientId Patient ID
   * @returns {Object|null} Patient object or null
   */
  getPatientById(patientId) {
    logger.debug('Mock: Getting patient by ID', { patientId });
    return this.patients.find(patient => patient.id === patientId) || null;
  }
  
  /**
   * Get prescriptions for a patient
   * @param {string} patientId Patient ID
   * @param {Object} params Query parameters
   * @returns {Array} Patient prescriptions
   */
  getPatientPrescriptions(patientId, params = {}) {
    logger.debug('Mock: Getting prescriptions for patient', { patientId, params });
    
    let filteredPrescriptions = this.prescriptions.filter(
      prescription => prescription.patientId === patientId
    );
    
    // Apply pagination
    const page = parseInt(params.page, 10) || 1;
    const pageSize = parseInt(params.pageSize, 10) || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return filteredPrescriptions.slice(start, end);
  }
  
  /**
   * Get a single prescription by ID
   * @param {string} prescriptionId Prescription ID
   * @returns {Object|null} Prescription object or null
   */
  getPrescriptionById(prescriptionId) {
    logger.debug('Mock: Getting prescription by ID', { prescriptionId });
    return this.prescriptions.find(prescription => prescription.id === prescriptionId) || null;
  }
  
  /**
   * Get products based on filter criteria
   * @param {Object} params Query parameters
   * @returns {Array} Filtered products
   */
  getProducts(params = {}) {
    logger.debug('Mock: Getting products with params', params);
    
    let filteredProducts = [...this.products];
    
    // Apply filters
    if (params.brand) {
      const brand = params.brand.toLowerCase();
      filteredProducts = filteredProducts.filter(
        product => product.brand.toLowerCase().includes(brand)
      );
    }
    
    if (params.category) {
      const category = params.category.toLowerCase();
      filteredProducts = filteredProducts.filter(
        product => product.category.toLowerCase().includes(category)
      );
    }
    
    // Type filter (always filter for frames)
    const type = params.type ? params.type.toLowerCase() : 'frame';
    if (type === 'frame') {
      // All products in this mock are frames, so no additional filtering needed
    }
    
    // Apply pagination
    const page = parseInt(params.page, 10) || 1;
    const pageSize = parseInt(params.pageSize, 10) || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return filteredProducts.slice(start, end);
  }
  
  /**
   * Get a single product by ID
   * @param {string} productId Product ID
   * @returns {Object|null} Product object or null
   */
  getProductById(productId) {
    logger.debug('Mock: Getting product by ID', { productId });
    return this.products.find(product => product.id === productId) || null;
  }
}

module.exports = MockDataService;
