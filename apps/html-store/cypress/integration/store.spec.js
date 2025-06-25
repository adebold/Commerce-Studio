/// <reference types="cypress" />

describe('Store Functionality', () => {
  beforeEach(() => {
    // Visit the store before each test
    cy.visitStore();
  });

  it('should display products correctly', () => {
    // Check that products are displayed
    cy.shouldHaveProductCount(6);
    
    // Check that product cards have all required elements
    cy.get('.card').first().within(() => {
      cy.get('.card-img-top').should('be.visible');
      cy.get('.card-title').should('be.visible');
      cy.get('.brand-name').should('be.visible');
      cy.get('.price').should('be.visible');
      cy.get('.view-product').should('be.visible');
    });
  });

  it('should filter products by face shape', () => {
    // Filter by oval face shape
    cy.filterByFaceShape('oval');
    
    // Check that filtered products are displayed
    cy.shouldHaveProductCount(4);
    
    // Reset filters
    cy.resetFilters();
    
    // Check that all products are displayed again
    cy.shouldHaveProductCount(6);
  });

  it('should filter products by brand', () => {
    // Filter by Ray-Ban brand
    cy.filterByBrand('Ray-Ban');
    
    // Check that filtered products are displayed
    cy.shouldHaveProductCount(2);
    
    // Reset filters
    cy.resetFilters();
    
    // Check that all products are displayed again
    cy.shouldHaveProductCount(6);
  });

  it('should open product details modal', () => {
    // Open product details for the first product
    cy.contains('.card-title', 'Classic Rectangle Frame').parents('.card').find('.view-product').click();
    
    // Check that modal is displayed
    cy.get('#productModal').should('be.visible');
    
    // Check that modal has all required elements
    cy.get('#modalProductName').should('contain', 'Classic Rectangle Frame');
    cy.get('#modalProductImage').should('be.visible');
    cy.get('#modalProductBrand').should('contain', 'Ray-Ban');
    cy.get('#modalProductPrice').should('contain', '149.99');
    cy.get('#modalProductDescription').should('be.visible');
    cy.get('#modalFeatureSummary').should('be.visible');
    cy.get('#modalStyleDescription').should('be.visible');
    cy.get('#modalStyleKeywords').should('be.visible');
    cy.get('#modalFaceShapeCompat').should('be.visible');
    
    // Close modal
    cy.get('#productModal .btn-close').click();
    cy.get('#productModal').should('not.be.visible');
  });

  it('should show face shape compatibility in product details', () => {
    // Open product details for the first product
    cy.openProductDetails('Classic Rectangle Frame');
    
    // Check face shape compatibility section
    cy.get('#modalFaceShapeCompat').within(() => {
      // Check that oval face shape has highest compatibility
      cy.contains('Oval').parent().find('.compatibility-fill').should('have.attr', 'style').and('include', 'width: 90%');
      
      // Check that square face shape has lowest compatibility
      cy.contains('Square').parent().find('.compatibility-fill').should('have.attr', 'style').and('include', 'width: 50%');
    });
    
    // Close modal
    cy.get('#productModal .btn-close').click();
  });

  it('should open face shape guide modal', () => {
    // Click on face shape guide link
    cy.get('#faceshapeGuideLink').click();
    
    // Check that modal is displayed
    cy.get('#faceshapeModal').should('be.visible');
    
    // Check that modal has all required elements
    cy.get('#faceshapeModal .modal-title').should('contain', 'Face Shape Guide');
    cy.get('#faceshapeModal .face-shape-guide').should('have.length', 6);
    
    // Check specific face shape
    cy.contains('#faceshapeModal h6', 'Oval Face').should('be.visible');
    cy.contains('#faceshapeModal h6', 'Oval Face').parent().find('img').should('be.visible');
    
    // Close modal
    cy.get('#faceshapeModal .btn-close').click();
    cy.get('#faceshapeModal').should('not.be.visible');
  });

  it('should add product to cart', () => {
    // Open product details
    cy.openProductDetails('Classic Rectangle Frame');
    
    // Click add to cart button
    cy.get('#productModal .btn-dark').click();
    
    // Check for confirmation (in this case, an alert)
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Added Classic Rectangle Frame to cart');
    });
  });
});

describe('Store API Integration', () => {
  beforeEach(() => {
    // Mock API responses
    cy.fixture('products.json').then((products) => {
      cy.mockProducts(products);
    });
    
    // Visit the store
    cy.visitStore();
  });

  it('should load products from API', () => {
    // Wait for API request to complete
    cy.wait('@getProducts');
    
    // Check that products are displayed
    cy.shouldHaveProductCount(3);
    
    // Check specific product from fixture
    cy.contains('.card-title', 'Premium Cat-Eye Frame').should('be.visible');
  });

  it('should handle API errors gracefully', () => {
    // Mock API error
    cy.intercept('GET', '**/products*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('getProductsError');
    
    // Reload page
    cy.reload();
    
    // Wait for API request to complete
    cy.wait('@getProductsError');
    
    // Check that fallback products are displayed
    cy.shouldHaveProductCount(6);
  });
});