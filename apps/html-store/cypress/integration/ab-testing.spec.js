/// <reference types="cypress" />

describe('A/B Testing Framework', () => {
  beforeEach(() => {
    // Clear local storage to reset test assignments
    cy.clearLocalStorage();
    
    // Visit the store
    cy.visitStore();
  });

  it('should assign user to test variants', () => {
    // Check that user ID is generated and stored
    cy.window().then((win) => {
      const userId = win.localStorage.getItem('skugenie_user_id');
      expect(userId).to.match(/^user_/);
    });
    
    // Check that test assignments are generated and stored
    cy.window().then((win) => {
      const assignments = JSON.parse(win.localStorage.getItem('skugenie_test_assignments'));
      expect(assignments).to.have.property('face-shape-compatibility');
      expect(assignments).to.have.property('product-recommendations');
      expect(assignments).to.have.property('virtual-try-on');
    });
  });

  it('should apply face shape compatibility test variant', () => {
    // Force treatment variant
    cy.window().then((win) => {
      const assignments = {
        'face-shape-compatibility': 'treatment'
      };
      win.localStorage.setItem('skugenie_test_assignments', JSON.stringify(assignments));
    });
    
    // Reload page to apply variant
    cy.reload();
    
    // Check that face shape compatibility elements are visible
    cy.get('.face-shape-compat').should('be.visible');
  });

  it('should apply product recommendations test variant', () => {
    // Force treatment variant
    cy.window().then((win) => {
      const assignments = {
        'product-recommendations': 'treatment'
      };
      win.localStorage.setItem('skugenie_test_assignments', JSON.stringify(assignments));
      
      // Set flag to use enhanced recommendations
      win.useEnhancedRecommendations = true;
    });
    
    // Reload page to apply variant
    cy.reload();
    
    // Check that recommendations are displayed
    cy.get('#recommendations-container').should('be.visible');
  });

  it('should apply virtual try-on test variant', () => {
    // Force treatment variant
    cy.window().then((win) => {
      const assignments = {
        'virtual-try-on': 'treatment'
      };
      win.localStorage.setItem('skugenie_test_assignments', JSON.stringify(assignments));
    });
    
    // Reload page to apply variant
    cy.reload();
    
    // Check that try-on elements are visible
    cy.get('#visualizerLink').should('be.visible');
    
    // Open product details
    cy.openProductDetails('Classic Rectangle Frame');
    
    // Check that try-on button is visible
    cy.get('#tryOnButton').should('be.visible');
  });

  it('should track events for A/B testing analysis', () => {
    // Spy on trackEvent function
    cy.window().then((win) => {
      cy.spy(win.abTesting, 'trackEvent').as('trackEvent');
    });
    
    // Perform actions that should be tracked
    
    // View a product
    cy.openProductDetails('Classic Rectangle Frame');
    cy.get('@trackEvent').should('have.been.calledWith', 'product-view');
    
    // Add to cart
    cy.get('#productModal .btn-dark').click();
    cy.get('@trackEvent').should('have.been.calledWith', 'add-to-cart');
    
    // Close modal
    cy.get('#productModal .btn-close').click();
  });

  it('should maintain consistent test assignment across sessions', () => {
    // Get initial test assignments
    let initialAssignments;
    cy.window().then((win) => {
      initialAssignments = JSON.parse(win.localStorage.getItem('skugenie_test_assignments'));
    });
    
    // Reload page to simulate new session
    cy.reload();
    
    // Check that assignments are the same
    cy.window().then((win) => {
      const newAssignments = JSON.parse(win.localStorage.getItem('skugenie_test_assignments'));
      expect(newAssignments).to.deep.equal(initialAssignments);
    });
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
  });

  it('should display key metrics', () => {
    // Check that key metrics are displayed
    cy.get('#conversion-rate').should('contain', '3.2%');
    cy.get('#avg-order-value').should('contain', '$142');
    cy.get('#recommendation-ctr').should('contain', '8.7%');
    cy.get('#active-tests').should('contain', '3');
    
    // Check metric trends
    cy.get('#conversion-change').should('contain', '0.5%').and('have.class', 'positive');
    cy.get('#aov-change').should('contain', '$12').and('have.class', 'positive');
  });

  it('should display A/B test results', () => {
    // Switch to A/B testing tab
    cy.switchDashboardTab('A/B Testing');
    
    // Check that test results are displayed
    cy.contains('.test-result-card', 'Face Shape Compatibility').should('be.visible');
    cy.contains('.test-result-card', 'Product Recommendations').should('be.visible');
    cy.contains('.test-result-card', 'Virtual Try-On').should('be.visible');
    
    // Check specific test result
    cy.contains('.test-result-card', 'Face Shape Compatibility').within(() => {
      cy.get('.badge').should('contain', '+24% Conversion');
    });
  });

  it('should render charts correctly', () => {
    // Switch to A/B testing tab
    cy.switchDashboardTab('A/B Testing');
    
    // Check that charts are rendered
    cy.shouldRenderChart('face-shape-test-chart');
    cy.shouldRenderChart('recommendations-test-chart');
    cy.shouldRenderChart('try-on-test-chart');
    cy.shouldRenderChart('conversion-funnel-chart');
  });

  it('should display face shape analytics', () => {
    // Switch to face shape analytics tab
    cy.switchDashboardTab('Face Shape Analytics');
    
    // Check that face shape distribution chart is rendered
    cy.shouldRenderChart('face-shape-distribution-chart');
    
    // Check that face shape conversion chart is rendered
    cy.shouldRenderChart('face-shape-conversion-chart');
    
    // Check that compatibility conversion chart is rendered
    cy.shouldRenderChart('compatibility-conversion-chart');
  });

  it('should change date range', () => {
    // Change date range
    cy.changeDateRange('90');
    
    // Check that date range is changed
    cy.get('#date-range').should('have.value', '90');
    
    // In a real implementation, this would trigger an API request
    // and update the charts with new data
  });
});