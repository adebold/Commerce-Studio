/// <reference types="cypress" />

describe('Dashboard Functionality', () => {
  beforeEach(() => {
    // Mock A/B testing data
    cy.fixture('ab-testing.json').then((testData) => {
      cy.mockABTestData(testData);
    });
    
    // Visit the dashboard
    cy.visitDashboard();
  });

  it('should display dashboard header and navigation', () => {
    // Check that header is displayed
    cy.get('.navbar-brand').should('contain', 'SKU-Genie Analytics Dashboard');
    
    // Check that navigation links are displayed
    cy.get('.navbar-nav').contains('Store').should('be.visible');
    cy.get('.navbar-nav').contains('Dashboard').should('be.visible');
    
    // Check that date range selector is displayed
    cy.get('#date-range').should('be.visible');
  });

  it('should display key metrics with trends', () => {
    // Check conversion rate metric
    cy.get('.metric-card').contains('.metric-label', 'Conversion Rate').should('be.visible');
    cy.get('#conversion-rate').should('contain', '3.2%');
    cy.get('#conversion-change').should('contain', '0.5%').and('have.class', 'positive');
    
    // Check average order value metric
    cy.get('.metric-card').contains('.metric-label', 'Avg. Order Value').should('be.visible');
    cy.get('#avg-order-value').should('contain', '$142');
    cy.get('#aov-change').should('contain', '$12').and('have.class', 'positive');
    
    // Check recommendation CTR metric
    cy.get('.metric-card').contains('.metric-label', 'Recommendation CTR').should('be.visible');
    cy.get('#recommendation-ctr').should('contain', '8.7%');
    cy.get('#ctr-change').should('contain', '1.2%').and('have.class', 'positive');
    
    // Check active tests metric
    cy.get('.metric-card').contains('.metric-label', 'Active A/B Tests').should('be.visible');
    cy.get('#active-tests').should('contain', '3');
  });

  it('should switch between dashboard tabs', () => {
    // Check that A/B testing tab is active by default
    cy.get('#ab-testing-tab').should('have.class', 'active');
    cy.get('#ab-testing').should('be.visible');
    
    // Switch to recommendations tab
    cy.switchDashboardTab('Recommendations');
    cy.get('#recommendations-tab').should('have.class', 'active');
    cy.get('#recommendations').should('be.visible');
    cy.get('#ab-testing').should('not.be.visible');
    
    // Switch to face shape tab
    cy.switchDashboardTab('Face Shape Analytics');
    cy.get('#face-shape-tab').should('have.class', 'active');
    cy.get('#face-shape').should('be.visible');
    cy.get('#recommendations').should('not.be.visible');
    
    // Switch back to A/B testing tab
    cy.switchDashboardTab('A/B Testing');
    cy.get('#ab-testing-tab').should('have.class', 'active');
    cy.get('#ab-testing').should('be.visible');
    cy.get('#face-shape').should('not.be.visible');
  });

  it('should change date range', () => {
    // Check default date range
    cy.get('#date-range').should('have.value', '30');
    
    // Change date range to 7 days
    cy.changeDateRange('7');
    cy.get('#date-range').should('have.value', '7');
    
    // Change date range to 90 days
    cy.changeDateRange('90');
    cy.get('#date-range').should('have.value', '90');
    
    // Change date range to custom
    cy.changeDateRange('custom');
    cy.get('#date-range').should('have.value', 'custom');
  });
});

describe('A/B Testing Dashboard', () => {
  beforeEach(() => {
    // Mock A/B testing data
    cy.fixture('ab-testing.json').then((testData) => {
      cy.mockABTestData(testData);
    });
    
    // Visit the dashboard
    cy.visitDashboard();
    
    // Ensure A/B testing tab is active
    cy.switchDashboardTab('A/B Testing');
  });

  it('should display test results cards', () => {
    // Check that test result cards are displayed
    cy.get('.test-result-card').should('have.length', 3);
    
    // Check face shape compatibility test card
    cy.contains('.test-result-card', 'Face Shape Compatibility').within(() => {
      cy.get('.badge').should('contain', '+24% Conversion').and('have.class', 'bg-success');
      cy.contains('Confidence: 98%').should('be.visible');
    });
    
    // Check product recommendations test card
    cy.contains('.test-result-card', 'Product Recommendations').within(() => {
      cy.get('.badge').should('contain', '+18% AOV').and('have.class', 'bg-success');
      cy.contains('Confidence: 95%').should('be.visible');
    });
    
    // Check virtual try-on test card
    cy.contains('.test-result-card', 'Virtual Try-On').within(() => {
      cy.get('.badge').should('contain', '+5% Engagement').and('have.class', 'bg-secondary');
      cy.contains('Confidence: 72%').should('be.visible');
    });
  });

  it('should render A/B testing charts', () => {
    // Check that charts are rendered
    cy.shouldRenderChart('face-shape-test-chart');
    cy.shouldRenderChart('recommendations-test-chart');
    cy.shouldRenderChart('try-on-test-chart');
    cy.shouldRenderChart('conversion-funnel-chart');
  });
});

describe('Recommendations Dashboard', () => {
  beforeEach(() => {
    // Mock A/B testing data
    cy.fixture('ab-testing.json').then((testData) => {
      cy.mockABTestData(testData);
    });
    
    // Visit the dashboard
    cy.visitDashboard();
    
    // Switch to recommendations tab
    cy.switchDashboardTab('Recommendations');
  });

  it('should display recommendation performance charts', () => {
    // Check that charts are rendered
    cy.shouldRenderChart('recommendation-ctr-chart');
    cy.shouldRenderChart('recommendation-cvr-chart');
    cy.shouldRenderChart('algorithm-performance-chart');
  });

  it('should display top recommended products', () => {
    // Check that top recommended products are displayed
    cy.contains('.card-header', 'Most Recommended').should('be.visible');
    cy.contains('.recommendation-title', 'Classic Rectangle Frame').should('be.visible');
    
    // Check that highest conversion products are displayed
    cy.contains('.card-header', 'Highest Conversion').should('be.visible');
    cy.contains('.recommendation-title', 'Premium Cat-Eye Frame').should('be.visible');
  });
});

describe('Face Shape Analytics Dashboard', () => {
  beforeEach(() => {
    // Mock A/B testing data
    cy.fixture('ab-testing.json').then((testData) => {
      cy.mockABTestData(testData);
    });
    
    // Visit the dashboard
    cy.visitDashboard();
    
    // Switch to face shape analytics tab
    cy.switchDashboardTab('Face Shape Analytics');
  });

  it('should display face shape distribution chart', () => {
    // Check that chart is rendered
    cy.shouldRenderChart('face-shape-distribution-chart');
    
    // Check that chart title is displayed
    cy.contains('.card-header', 'User Face Shapes').should('be.visible');
  });

  it('should display face shape conversion chart', () => {
    // Check that chart is rendered
    cy.shouldRenderChart('face-shape-conversion-chart');
    
    // Check that chart title is displayed
    cy.contains('.card-header', 'Face Shape Conversion Rates').should('be.visible');
  });

  it('should display compatibility impact charts', () => {
    // Check that charts are rendered
    cy.shouldRenderChart('compatibility-conversion-chart');
    cy.shouldRenderChart('top-products-face-shape-chart');
    
    // Check that chart titles are displayed
    cy.contains('.card-header', 'Conversion by Compatibility Score').should('be.visible');
    cy.contains('.card-header', 'Top Products by Face Shape').should('be.visible');
  });
});

describe('Dashboard API Integration', () => {
  beforeEach(() => {
    // Visit the dashboard
    cy.visitDashboard();
  });

  it('should handle API errors gracefully', () => {
    // Mock API error
    cy.intercept('GET', '**/ab-testing*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('getABTestingError');
    
    // Reload page
    cy.reload();
    
    // Wait for API request to complete
    cy.wait('@getABTestingError');
    
    // Check that dashboard still renders with fallback data
    cy.get('.metric-card').should('have.length', 4);
    cy.get('#conversion-rate').should('be.visible');
  });

  it('should update data when date range changes', () => {
    // Spy on API request
    cy.intercept('GET', '**/ab-testing*').as('getABTestingData');
    
    // Change date range
    cy.changeDateRange('7');
    
    // Wait for API request to complete
    cy.wait('@getABTestingData');
    
    // Check that request includes date range parameter
    cy.get('@getABTestingData.all').should('have.length.at.least', 1);
  });
});