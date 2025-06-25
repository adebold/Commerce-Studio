// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- Store Navigation Commands --

/**
 * Navigate to the store homepage
 */
Cypress.Commands.add('visitStore', () => {
  cy.visit('/index.html');
  cy.get('.navbar-brand').should('be.visible');
  cy.log('Successfully navigated to store homepage');
});

/**
 * Navigate to the dashboard
 */
Cypress.Commands.add('visitDashboard', () => {
  cy.visit('/dashboard.html');
  cy.get('.navbar-brand').should('be.visible');
  cy.log('Successfully navigated to dashboard');
});

/**
 * Open product details for a specific product
 * @param {string} productName - The name of the product to open
 */
Cypress.Commands.add('openProductDetails', (productName) => {
  cy.contains('.card-title', productName)
    .parents('.card')
    .find('.view-product')
    .click();
  
  cy.get('#productModal').should('be.visible');
  cy.get('#modalProductName').should('contain', productName);
  cy.log(`Opened product details for: ${productName}`);
});

/**
 * Filter products by face shape
 * @param {string} faceShape - The face shape to filter by
 */
Cypress.Commands.add('filterByFaceShape', (faceShape) => {
  cy.get('#face-shape-filter').select(faceShape);
  cy.log(`Filtered products by face shape: ${faceShape}`);
});

/**
 * Filter products by brand
 * @param {string} brand - The brand to filter by
 */
Cypress.Commands.add('filterByBrand', (brand) => {
  cy.get('#brand-filter').select(brand);
  cy.log(`Filtered products by brand: ${brand}`);
});

/**
 * Reset all filters
 */
Cypress.Commands.add('resetFilters', () => {
  cy.get('#reset-filters').click();
  cy.log('Reset all filters');
});

// -- Virtual Try-On Commands --

/**
 * Open the virtual try-on modal
 * @param {string} productName - The name of the product to try on
 */
Cypress.Commands.add('openVirtualTryOn', (productName) => {
  cy.openProductDetails(productName);
  cy.get('#tryOnButton').click();
  cy.get('#tryOnModal').should('be.visible');
  cy.log(`Opened virtual try-on for: ${productName}`);
});

/**
 * Change face shape in virtual try-on
 * @param {string} faceShape - The face shape to select
 */
Cypress.Commands.add('changeTryOnFaceShape', (faceShape) => {
  cy.get('#tryOnFaceSelect').select(faceShape);
  cy.log(`Changed try-on face shape to: ${faceShape}`);
});

/**
 * Navigate to next product in try-on
 */
Cypress.Commands.add('tryOnNextProduct', () => {
  cy.get('#tryOnNext').click();
  cy.log('Navigated to next product in try-on');
});

/**
 * Navigate to previous product in try-on
 */
Cypress.Commands.add('tryOnPreviousProduct', () => {
  cy.get('#tryOnPrevious').click();
  cy.log('Navigated to previous product in try-on');
});

// -- Dashboard Commands --

/**
 * Change date range in dashboard
 * @param {string} range - The date range to select
 */
Cypress.Commands.add('changeDateRange', (range) => {
  cy.get('#date-range').select(range);
  cy.log(`Changed dashboard date range to: ${range}`);
});

/**
 * Switch to a specific dashboard tab
 * @param {string} tabName - The name of the tab to switch to
 */
Cypress.Commands.add('switchDashboardTab', (tabName) => {
  cy.contains('#dashboardTabs button', tabName).click();
  cy.log(`Switched to dashboard tab: ${tabName}`);
});

// -- Mock Data Commands --

/**
 * Mock API response for products
 * @param {Array} products - The products data to mock
 */
Cypress.Commands.add('mockProducts', (products) => {
  cy.intercept('GET', '**/products*', {
    statusCode: 200,
    body: products
  }).as('getProducts');
  cy.log('Mocked products API response');
});

/**
 * Mock API response for recommendations
 * @param {Array} recommendations - The recommendations data to mock
 */
Cypress.Commands.add('mockRecommendations', (recommendations) => {
  cy.intercept('GET', '**/recommendations*', {
    statusCode: 200,
    body: recommendations
  }).as('getRecommendations');
  cy.log('Mocked recommendations API response');
});

/**
 * Mock API response for A/B testing data
 * @param {Object} testData - The A/B testing data to mock
 */
Cypress.Commands.add('mockABTestData', (testData) => {
  cy.intercept('GET', '**/ab-testing*', {
    statusCode: 200,
    body: testData
  }).as('getABTestData');
  cy.log('Mocked A/B testing API response');
});

// -- Assertion Commands --

/**
 * Assert that a specific number of products are displayed
 * @param {number} count - The expected number of products
 */
Cypress.Commands.add('shouldHaveProductCount', (count) => {
  cy.get('#products-container .card').should('have.length', count);
  cy.log(`Verified ${count} products are displayed`);
});

/**
 * Assert that recommendations are displayed
 */
Cypress.Commands.add('shouldShowRecommendations', () => {
  cy.get('#recommendations-container').should('be.visible');
  cy.get('#recommendations-row .card').should('have.length.at.least', 1);
  cy.log('Verified recommendations are displayed');
});

/**
 * Assert that a chart is properly rendered
 * @param {string} chartId - The ID of the chart element
 */
Cypress.Commands.add('shouldRenderChart', (chartId) => {
  cy.get(`#${chartId}`).should('be.visible');
  cy.get(`#${chartId} canvas`).should('be.visible');
  cy.log(`Verified chart ${chartId} is rendered`);
});