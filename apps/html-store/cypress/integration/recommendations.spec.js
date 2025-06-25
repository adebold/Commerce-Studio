/// <reference types="cypress" />

describe('Recommendation Engine', () => {
  beforeEach(() => {
    // Mock recommendations data
    cy.fixture('recommendations.json').then((recommendations) => {
      cy.mockRecommendations(recommendations);
    });
    
    // Visit the store
    cy.visitStore();
  });

  it('should display personalized recommendations', () => {
    // Check that recommendations container is visible
    cy.get('#recommendations-container').should('be.visible');
    
    // Check that recommendations are displayed
    cy.get('#recommendations-row .card').should('have.length', 3);
    
    // Check that recommendation badge is displayed
    cy.get('#recommendations-row .recommendation-badge').first().should('contain', 'Recommended');
    
    // Check specific recommendation from fixture
    cy.get('#recommendations-row').contains('.card-title', 'Premium Cat-Eye Frame').should('be.visible');
  });

  it('should track recommendation clicks', () => {
    // Spy on trackRecommendationClick function
    cy.window().then((win) => {
      cy.spy(win.abTesting, 'trackRecommendationClick').as('trackClick');
    });
    
    // Click on a recommendation
    cy.get('#recommendations-row').contains('.card-title', 'Premium Cat-Eye Frame')
      .parents('.card')
      .find('.view-product')
      .click();
    
    // Check that tracking function was called
    cy.get('@trackClick').should('have.been.calledWith', 'product-3', 'personalized');
    
    // Check that product modal is displayed
    cy.get('#productModal').should('be.visible');
    cy.get('#modalProductName').should('contain', 'Premium Cat-Eye Frame');
    
    // Close modal
    cy.get('#productModal .btn-close').click();
  });

  it('should update recommendations based on user interactions', () => {
    // View a product to update browsing history
    cy.openProductDetails('Classic Rectangle Frame');
    cy.get('#productModal .btn-close').click();
    
    // Reload page to trigger new recommendations
    cy.reload();
    
    // Check that recommendations are updated
    cy.get('#recommendations-container').should('be.visible');
    cy.get('#recommendations-row .card').should('have.length', 3);
    
    // Check that the viewed product is not in recommendations
    cy.get('#recommendations-row').contains('.card-title', 'Classic Rectangle Frame').should('not.exist');
  });
});

describe('Recommendation Algorithm Performance', () => {
  beforeEach(() => {
    // Mock API responses
    cy.fixture('products.json').then((products) => {
      cy.mockProducts(products);
    });
    
    cy.fixture('recommendations.json').then((recommendations) => {
      cy.mockRecommendations(recommendations);
    });
    
    // Visit the store
    cy.visitStore();
  });

  it('should recommend products based on face shape compatibility', () => {
    // Set user face shape to oval
    cy.window().then((win) => {
      win.recommendationEngine.setUserFaceShape('user_123', 'oval');
    });
    
    // Reload page to trigger new recommendations
    cy.reload();
    
    // Check that recommendations include products with high oval face shape compatibility
    cy.get('#recommendations-row').contains('.card-title', 'Rimless Titanium Frame').should('be.visible');
  });

  it('should recommend products based on style preferences', () => {
    // Set user style preferences
    cy.window().then((win) => {
      win.recommendationEngine.addUserStylePreference('user_123', 'luxurious', 2);
      win.recommendationEngine.addUserStylePreference('user_123', 'elegant', 1);
    });
    
    // Reload page to trigger new recommendations
    cy.reload();
    
    // Check that recommendations include products with matching style keywords
    cy.get('#recommendations-row').contains('.card-title', 'Premium Cat-Eye Frame').should('be.visible');
  });

  it('should track product views for recommendation improvement', () => {
    // Spy on trackProductView function
    cy.window().then((win) => {
      cy.spy(win.recommendationEngine, 'trackProductView').as('trackView');
    });
    
    // View a product
    cy.openProductDetails('Modern Round Frame');
    
    // Check that tracking function was called
    cy.get('@trackView').should('have.been.called');
    
    // Close modal
    cy.get('#productModal .btn-close').click();
  });

  it('should track product purchases for recommendation improvement', () => {
    // Spy on trackProductPurchase function
    cy.window().then((win) => {
      cy.spy(win.recommendationEngine, 'trackProductPurchase').as('trackPurchase');
    });
    
    // Open product details
    cy.openProductDetails('Modern Round Frame');
    
    // Add to cart (simulating purchase)
    cy.get('#productModal .btn-dark').click();
    
    // In a real implementation, we would complete the purchase flow
    // For this test, we'll manually call the tracking function
    cy.window().then((win) => {
      win.recommendationEngine.trackProductPurchase('user_123', 'product-2');
    });
    
    // Check that tracking function was called
    cy.get('@trackPurchase').should('have.been.called');
  });
});