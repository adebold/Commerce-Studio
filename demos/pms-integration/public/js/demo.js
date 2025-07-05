/**
 * PMS Integration Demo - Client-side JavaScript
 * 
 * This script handles the interaction with the Apollo API integration demo
 * and displays the results in the web interface.
 */

// Base URL for API requests
const API_BASE_URL = '/api';

// DOM Elements
const connectionStatus = document.getElementById('connection-status');
const patientsResponse = document.getElementById('patients-response');
const patientSelect = document.getElementById('patient-select');
const patientDetails = document.getElementById('patient-details');
const prescriptionsResponse = document.getElementById('prescriptions-response');
const productsResponse = document.getElementById('products-response');
const originalPrescription = document.getElementById('original-prescription');
const transformedPrescription = document.getElementById('transformed-prescription');

// Check API health on page load
document.addEventListener('DOMContentLoaded', checkApiHealth);

// Button event listeners
document.getElementById('search-patients').addEventListener('click', searchPatients);
document.getElementById('get-patient-details').addEventListener('click', getPatientDetails);
document.getElementById('get-patient-prescriptions').addEventListener('click', getPatientPrescriptions);
document.getElementById('search-products').addEventListener('click', searchProducts);
document.getElementById('transform-prescription').addEventListener('click', transformPrescription);

// Patient select change event
patientSelect.addEventListener('change', function() {
  const selectedPatientId = patientSelect.value;
  if (selectedPatientId && selectedPatientId !== 'Select a patient from search results first') {
    document.getElementById('get-patient-details').disabled = false;
    
    // Auto-fill the prescription patient ID field
    document.getElementById('prescription-patient-id').value = selectedPatientId;
  } else {
    document.getElementById('get-patient-details').disabled = true;
  }
});

/**
 * Check API health status
 */
async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    if (data.status === 'ok') {
      connectionStatus.textContent = 'Connected';
      connectionStatus.className = 'badge bg-success';
    } else {
      connectionStatus.textContent = 'API Error';
      connectionStatus.className = 'badge bg-danger';
    }
  } catch (error) {
    connectionStatus.textContent = 'Not Connected';
    connectionStatus.className = 'badge bg-danger';
    console.error('API Health check failed:', error);
  }
}

/**
 * Search patients based on form input
 */
async function searchPatients() {
  const name = document.getElementById('patient-name').value;
  const dateOfBirth = document.getElementById('patient-dob').value;
  
  // Build query parameters
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  if (dateOfBirth) params.append('dateOfBirth', dateOfBirth);
  
  try {
    const response = await fetch(`${API_BASE_URL}/patients?${params.toString()}`);
    const patients = await response.json();
    
    // Display the raw response
    patientsResponse.textContent = JSON.stringify(patients, null, 2);
    
    // Update the patient select dropdown
    populatePatientSelect(patients);
  } catch (error) {
    patientsResponse.textContent = `Error fetching patients: ${error.message}`;
    console.error('Search patients error:', error);
  }
}

/**
 * Populate the patient select dropdown with search results
 */
function populatePatientSelect(patients) {
  // Clear previous options
  patientSelect.innerHTML = '';
  
  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.textContent = 'Select a patient...';
  defaultOption.value = '';
  patientSelect.appendChild(defaultOption);
  
  // Add patients to dropdown
  if (patients && patients.length > 0) {
    patients.forEach(patient => {
      const option = document.createElement('option');
      option.value = patient.id;
      option.textContent = `${patient.firstName} ${patient.lastName} (${patient.id})`;
      patientSelect.appendChild(option);
    });
    
    // Enable the select
    patientSelect.disabled = false;
  } else {
    // No patients found
    const noResultsOption = document.createElement('option');
    noResultsOption.textContent = 'No patients found';
    noResultsOption.disabled = true;
    patientSelect.appendChild(noResultsOption);
    patientSelect.disabled = true;
    document.getElementById('get-patient-details').disabled = true;
  }
}

/**
 * Get details for a selected patient
 */
async function getPatientDetails() {
  const patientId = patientSelect.value;
  
  if (!patientId) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`);
    const patient = await response.json();
    
    // Display the patient details
    patientDetails.textContent = JSON.stringify(patient, null, 2);
  } catch (error) {
    patientDetails.textContent = `Error fetching patient details: ${error.message}`;
    console.error('Get patient details error:', error);
  }
}

/**
 * Get prescriptions for a patient
 */
async function getPatientPrescriptions() {
  const patientId = document.getElementById('prescription-patient-id').value;
  
  if (!patientId) {
    prescriptionsResponse.textContent = 'Please enter a patient ID';
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/prescriptions`);
    const prescriptions = await response.json();
    
    // Display the prescriptions
    prescriptionsResponse.textContent = JSON.stringify(prescriptions, null, 2);
    
    // If prescriptions were found, automatically fill the transform prescription ID field
    // with the first prescription ID
    if (prescriptions && prescriptions.length > 0) {
      document.getElementById('transform-prescription-id').value = prescriptions[0].id;
    }
  } catch (error) {
    prescriptionsResponse.textContent = `Error fetching prescriptions: ${error.message}`;
    console.error('Get prescriptions error:', error);
  }
}

/**
 * Search products based on form input
 */
async function searchProducts() {
  const brand = document.getElementById('product-brand').value;
  const category = document.getElementById('product-category').value;
  
  // Build query parameters
  const params = new URLSearchParams();
  if (brand) params.append('brand', brand);
  if (category) params.append('category', category);
  
  try {
    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    const products = await response.json();
    
    // Display the products
    productsResponse.textContent = JSON.stringify(products, null, 2);
  } catch (error) {
    productsResponse.textContent = `Error fetching products: ${error.message}`;
    console.error('Search products error:', error);
  }
}

/**
 * Get a prescription and display original and transformed versions
 */
async function transformPrescription() {
  const prescriptionId = document.getElementById('transform-prescription-id').value;
  
  if (!prescriptionId) {
    alert('Please enter a prescription ID');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}`);
    const data = await response.json();
    
    // Display original and transformed prescription
    originalPrescription.textContent = JSON.stringify(data.original, null, 2);
    transformedPrescription.textContent = JSON.stringify(data.transformed, null, 2);
    
    // Highlight the transformation differences
    highlightPrescriptionDifferences();
  } catch (error) {
    originalPrescription.textContent = `Error fetching prescription: ${error.message}`;
    transformedPrescription.textContent = 'No data available';
    console.error('Transform prescription error:', error);
  }
}

/**
 * Compare and highlight the key differences between original and transformed prescriptions
 */
function highlightPrescriptionDifferences() {
  // This function could be enhanced to highlight specific differences in notation
  // between original and transformed prescriptions, but for now we'll keep it simple
  
  // Add a highlight class to the transformedPrescription element
  transformedPrescription.classList.add('highlight');
  
  // Remove the highlight after a short delay
  setTimeout(() => {
    transformedPrescription.classList.remove('highlight');
  }, 2000);
}
