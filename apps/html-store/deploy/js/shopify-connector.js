/**
 * SKU-Genie Shopify Connector
 * 
 * This script connects Shopify stores with SKU-Genie data,
 * enhancing product pages with additional information.
 * 
 * Usage:
 * 1. Include this script in your Shopify theme
 * 2. Add the data-skugenie-product-id attribute to product elements
 * 3. Add elements with data-skugenie-* attributes to display enhanced data
 */

// Configuration
const SKU_GENIE_CONFIG = {
    apiUrl: 'https://api.skugenie.com', // Replace with your SKU-Genie API URL
    apiKey: '', // Will be set via Shopify app
    clientId: '', // Will be set via Shopify app
    useMockData: true, // Set to false in production
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a product page
    const productElements = document.querySelectorAll('[data-skugenie-product-id]');
    if (productElements.length > 0) {
        productElements.forEach(element => {
            const productId = element.getAttribute('data-skugenie-product-id');
            if (productId) {
                enhanceProductElement(element, productId);
            }
        });
    }
    
    // Initialize face shape compatibility visualizer
    initFaceShapeVisualizer();
    
    // Initialize collection enhancement
    enhanceCollections();
    
    // Initialize inventory display
    updateInventoryDisplay();
});

/**
 * Enhance a product element with SKU-Genie data
 * @param {HTMLElement} element - The product element
 * @param {string} productId - The SKU-Genie product ID
 */
async function enhanceProductElement(element, productId) {
    try {
        // Fetch product data from SKU-Genie
        const productData = await fetchProductData(productId);
        if (!productData) {
            console.warn(`No SKU-Genie data found for product ${productId}`);
            return;
        }
        
        // Update face shape compatibility
        updateFaceShapeCompatibility(element, productData);
        
        // Update style keywords
        updateStyleKeywords(element, productData);
        
        // Update feature summary
        updateFeatureSummary(element, productData);
        
        // Update style description
        updateStyleDescription(element, productData);
        
        // Update inventory information
        updateInventoryInfo(element, productData);
        
        // Add enhanced class to indicate the element has been enhanced
        element.classList.add('skugenie-enhanced');
    } catch (error) {
        console.error(`Error enhancing product ${productId}:`, error);
    }
}

/**
 * Fetch product data from SKU-Genie
 * @param {string} productId - The SKU-Genie product ID
 * @returns {Promise<Object>} - The product data
 */
async function fetchProductData(productId) {
    if (SKU_GENIE_CONFIG.useMockData) {
        // Return mock data for testing
        return getMockProductData(productId);
    }
    
    try {
        const url = `${SKU_GENIE_CONFIG.apiUrl}/products/${productId}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${SKU_GENIE_CONFIG.apiKey}`,
                'Content-Type': 'application/json',
            },
            params: {
                client_id: SKU_GENIE_CONFIG.clientId,
            },
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching product data for ${productId}:`, error);
        return null;
    }
}

/**
 * Update face shape compatibility display
 * @param {HTMLElement} element - The product element
 * @param {Object} productData - The product data
 */
function updateFaceShapeCompatibility(element, productData) {
    const compatElement = element.querySelector('[data-skugenie-face-shape-compatibility]');
    if (!compatElement || !productData.faceShapeCompatibility) {
        return;
    }
    
    // Clear existing content
    compatElement.innerHTML = '';
    
    // Create heading
    const heading = document.createElement('h4');
    heading.className = 'skugenie-heading';
    heading.textContent = 'Face Shape Compatibility';
    compatElement.appendChild(heading);
    
    // Create compatibility display
    const compatDisplay = document.createElement('div');
    compatDisplay.className = 'skugenie-face-shape-compatibility';
    
    // Sort face shapes by compatibility score
    const faceShapes = Object.entries(productData.faceShapeCompatibility)
        .sort((a, b) => b[1] - a[1]);
    
    // Create compatibility bars
    faceShapes.forEach(([shape, score]) => {
        const scorePercent = Math.round(score * 100);
        
        const compatRow = document.createElement('div');
        compatRow.className = 'skugenie-compat-row';
        compatRow.innerHTML = `
            <div class="skugenie-compat-label">
                <span>${shape.charAt(0).toUpperCase() + shape.slice(1)}</span>
                <span>${scorePercent}%</span>
            </div>
            <div class="skugenie-compat-bar">
                <div class="skugenie-compat-fill" style="width: ${scorePercent}%"></div>
            </div>
        `;
        
        compatDisplay.appendChild(compatRow);
    });
    
    compatElement.appendChild(compatDisplay);
}

/**
 * Update style keywords display
 * @param {HTMLElement} element - The product element
 * @param {Object} productData - The product data
 */
function updateStyleKeywords(element, productData) {
    const keywordsElement = element.querySelector('[data-skugenie-style-keywords]');
    if (!keywordsElement || !productData.styleKeywords) {
        return;
    }
    
    // Clear existing content
    keywordsElement.innerHTML = '';
    
    // Create heading
    const heading = document.createElement('h4');
    heading.className = 'skugenie-heading';
    heading.textContent = 'Style Keywords';
    keywordsElement.appendChild(heading);
    
    // Create keywords display
    const keywordsDisplay = document.createElement('div');
    keywordsDisplay.className = 'skugenie-style-keywords';
    
    // Create keyword badges
    productData.styleKeywords.forEach(keyword => {
        const badge = document.createElement('span');
        badge.className = 'skugenie-keyword-badge';
        badge.textContent = keyword;
        keywordsDisplay.appendChild(badge);
    });
    
    keywordsElement.appendChild(keywordsDisplay);
}

/**
 * Update feature summary display
 * @param {HTMLElement} element - The product element
 * @param {Object} productData - The product data
 */
function updateFeatureSummary(element, productData) {
    const summaryElement = element.querySelector('[data-skugenie-feature-summary]');
    if (!summaryElement || !productData.featureSummary) {
        return;
    }
    
    // Clear existing content
    summaryElement.innerHTML = '';
    
    // Create heading
    const heading = document.createElement('h4');
    heading.className = 'skugenie-heading';
    heading.textContent = 'Feature Summary';
    summaryElement.appendChild(heading);
    
    // Create summary paragraph
    const summaryParagraph = document.createElement('p');
    summaryParagraph.className = 'skugenie-feature-summary';
    summaryParagraph.textContent = productData.featureSummary;
    summaryElement.appendChild(summaryParagraph);
}

/**
 * Update style description display
 * @param {HTMLElement} element - The product element
 * @param {Object} productData - The product data
 */
function updateStyleDescription(element, productData) {
    const descriptionElement = element.querySelector('[data-skugenie-style-description]');
    if (!descriptionElement || !productData.styleDescription) {
        return;
    }
    
    // Clear existing content
    descriptionElement.innerHTML = '';
    
    // Create heading
    const heading = document.createElement('h4');
    heading.className = 'skugenie-heading';
    heading.textContent = 'Style Description';
    descriptionElement.appendChild(heading);
    
    // Create description paragraph
    const descriptionParagraph = document.createElement('p');
    descriptionParagraph.className = 'skugenie-style-description';
    descriptionParagraph.textContent = productData.styleDescription;
    descriptionElement.appendChild(descriptionParagraph);
}

/**
 * Update inventory information display
 * @param {HTMLElement} element - The product element
 * @param {Object} productData - The product data
 */
function updateInventoryInfo(element, productData) {
    const inventoryElement = element.querySelector('[data-skugenie-inventory]');
    if (!inventoryElement || !productData.inventory) {
        return;
    }
    
    // Clear existing content
    inventoryElement.innerHTML = '';
    
    // Create heading
    const heading = document.createElement('h4');
    heading.className = 'skugenie-heading';
    heading.textContent = 'Availability';
    inventoryElement.appendChild(heading);
    
    // Create inventory display
    const inventoryDisplay = document.createElement('div');
    inventoryDisplay.className = 'skugenie-inventory';
    
    // Add availability status
    const availabilityStatus = document.createElement('p');
    availabilityStatus.className = `skugenie-availability ${productData.inventory.available > 0 ? 'in-stock' : 'out-of-stock'}`;
    availabilityStatus.textContent = productData.inventory.available > 0 
        ? `In Stock (${productData.inventory.available} available)` 
        : 'Out of Stock';
    inventoryDisplay.appendChild(availabilityStatus);
    
    // Add location-specific inventory if available
    if (productData.inventory.locations && productData.inventory.locations.length > 0) {
        const locationsList = document.createElement('div');
        locationsList.className = 'skugenie-inventory-locations';
        
        productData.inventory.locations.forEach(location => {
            const locationItem = document.createElement('div');
            locationItem.className = 'skugenie-inventory-location';
            locationItem.innerHTML = `
                <span class="location-name">${location.location_name || 'Location'}: </span>
                <span class="location-quantity ${location.quantity > 0 ? 'in-stock' : 'out-of-stock'}">
                    ${location.quantity} available
                </span>
            `;
            locationsList.appendChild(locationItem);
        });
        
        inventoryDisplay.appendChild(locationsList);
    }
    
    inventoryElement.appendChild(inventoryDisplay);
}

/**
 * Initialize face shape compatibility visualizer
 */
function initFaceShapeVisualizer() {
    const visualizerElement = document.querySelector('[data-skugenie-face-shape-visualizer]');
    if (!visualizerElement) {
        return;
    }
    
    // Create visualizer container
    visualizerElement.innerHTML = `
        <div class="skugenie-visualizer-container">
            <h4 class="skugenie-heading">Virtual Try On</h4>
            
            <div class="skugenie-face-shape-visualizer">
                <img src="" alt="Face shape" class="skugenie-face" id="skugenieTryOnFace">
                <img src="" alt="Glasses" class="skugenie-glasses" id="skugenieTryOnGlasses">
            </div>
            
            <div class="skugenie-visualizer-controls">
                <label for="skugenieFaceShapeSelect">Select Face Shape:</label>
                <select id="skugenieFaceShapeSelect" class="skugenie-face-shape-select">
                    <option value="oval">Oval</option>
                    <option value="round">Round</option>
                    <option value="square">Square</option>
                    <option value="heart">Heart</option>
                    <option value="diamond">Diamond</option>
                    <option value="oblong">Oblong</option>
                </select>
            </div>
        </div>
    `;
    
    // Get the product ID
    const productId = visualizerElement.getAttribute('data-skugenie-product-id');
    if (!productId) {
        console.warn('No product ID provided for face shape visualizer');
        return;
    }
    
    // Fetch product data
    fetchProductData(productId).then(productData => {
        if (!productData) {
            return;
        }
        
        // Set up the visualizer
        setupVisualizer(productData);
    });
    
    // Set up event listeners
    const faceShapeSelect = document.getElementById('skugenieFaceShapeSelect');
    if (faceShapeSelect) {
        faceShapeSelect.addEventListener('change', function() {
            updateVisualizerFaceShape(this.value);
        });
    }
}

/**
 * Set up the face shape visualizer
 * @param {Object} productData - The product data
 */
function setupVisualizer(productData) {
    // Set the product image
    const glassesImage = document.getElementById('skugenieTryOnGlasses');
    if (glassesImage) {
        glassesImage.src = productData.image || productData.imageUrl;
        glassesImage.alt = productData.title || productData.name;
    }
    
    // Set the initial face shape based on best compatibility
    let initialFaceShape = 'oval';
    if (productData.faceShapeCompatibility) {
        const bestFaceShape = Object.entries(productData.faceShapeCompatibility)
            .sort((a, b) => b[1] - a[1])[0];
        
        initialFaceShape = bestFaceShape[0];
    }
    
    // Update the face shape select
    const faceShapeSelect = document.getElementById('skugenieFaceShapeSelect');
    if (faceShapeSelect) {
        faceShapeSelect.value = initialFaceShape;
    }
    
    // Update the visualizer
    updateVisualizerFaceShape(initialFaceShape);
}

/**
 * Update the visualizer face shape
 * @param {string} faceShape - The face shape
 */
function updateVisualizerFaceShape(faceShape) {
    // Face shape image URLs
    const faceShapeImages = {
        oval: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Oval-1.png',
        round: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Round-1.png',
        square: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Square-1.png',
        heart: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Heart-1.png',
        diamond: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Diamond-1.png',
        oblong: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Oblong-1.png'
    };
    
    // Set the face image
    const faceImage = document.getElementById('skugenieTryOnFace');
    if (faceImage) {
        faceImage.src = faceShapeImages[faceShape] || faceShapeImages.oval;
        faceImage.alt = `${faceShape} face shape`;
    }
}

/**
 * Enhance collection displays with SKU-Genie data
 */
function enhanceCollections() {
    const collectionElements = document.querySelectorAll('[data-skugenie-collection-id]');
    if (collectionElements.length === 0) {
        return;
    }
    
    collectionElements.forEach(element => {
        const collectionId = element.getAttribute('data-skugenie-collection-id');
        if (collectionId) {
            enhanceCollectionElement(element, collectionId);
        }
    });
}

/**
 * Enhance a collection element with SKU-Genie data
 * @param {HTMLElement} element - The collection element
 * @param {string} collectionId - The SKU-Genie collection ID
 */
async function enhanceCollectionElement(element, collectionId) {
    try {
        // Fetch collection data from SKU-Genie
        const collectionData = await fetchCollectionData(collectionId);
        if (!collectionData) {
            console.warn(`No SKU-Genie data found for collection ${collectionId}`);
            return;
        }
        
        // Update collection description
        updateCollectionDescription(element, collectionData);
        
        // Add enhanced class to indicate the element has been enhanced
        element.classList.add('skugenie-enhanced');
    } catch (error) {
        console.error(`Error enhancing collection ${collectionId}:`, error);
    }
}

/**
 * Fetch collection data from SKU-Genie
 * @param {string} collectionId - The SKU-Genie collection ID
 * @returns {Promise<Object>} - The collection data
 */
async function fetchCollectionData(collectionId) {
    if (SKU_GENIE_CONFIG.useMockData) {
        // Return mock data for testing
        return getMockCollectionData(collectionId);
    }
    
    try {
        const url = `${SKU_GENIE_CONFIG.apiUrl}/collections/${collectionId}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${SKU_GENIE_CONFIG.apiKey}`,
                'Content-Type': 'application/json',
            },
            params: {
                client_id: SKU_GENIE_CONFIG.clientId,
            },
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching collection data for ${collectionId}:`, error);
        return null;
    }
}

/**
 * Update collection description display
 * @param {HTMLElement} element - The collection element
 * @param {Object} collectionData - The collection data
 */
function updateCollectionDescription(element, collectionData) {
    const descriptionElement = element.querySelector('[data-skugenie-collection-description]');
    if (!descriptionElement || !collectionData.description) {
        return;
    }
    
    // Update the description
    descriptionElement.textContent = collectionData.description;
}

/**
 * Update inventory display
 */
function updateInventoryDisplay() {
    const inventoryElements = document.querySelectorAll('[data-skugenie-inventory-product-id]');
    if (inventoryElements.length === 0) {
        return;
    }
    
    inventoryElements.forEach(element => {
        const productId = element.getAttribute('data-skugenie-inventory-product-id');
        if (productId) {
            updateInventoryElement(element, productId);
        }
    });
}

/**
 * Update an inventory element with SKU-Genie data
 * @param {HTMLElement} element - The inventory element
 * @param {string} productId - The SKU-Genie product ID
 */
async function updateInventoryElement(element, productId) {
    try {
        // Fetch inventory data from SKU-Genie
        const inventoryData = await fetchInventoryData(productId);
        if (!inventoryData) {
            console.warn(`No SKU-Genie inventory data found for product ${productId}`);
            return;
        }
        
        // Update the inventory display
        element.innerHTML = '';
        
        // Create availability status
        const availabilityStatus = document.createElement('div');
        availabilityStatus.className = `skugenie-availability ${inventoryData.available > 0 ? 'in-stock' : 'out-of-stock'}`;
        availabilityStatus.textContent = inventoryData.available > 0 
            ? `In Stock (${inventoryData.available} available)` 
            : 'Out of Stock';
        element.appendChild(availabilityStatus);
        
        // Add enhanced class to indicate the element has been enhanced
        element.classList.add('skugenie-enhanced');
    } catch (error) {
        console.error(`Error updating inventory for product ${productId}:`, error);
    }
}

/**
 * Fetch inventory data from SKU-Genie
 * @param {string} productId - The SKU-Genie product ID
 * @returns {Promise<Object>} - The inventory data
 */
async function fetchInventoryData(productId) {
    if (SKU_GENIE_CONFIG.useMockData) {
        // Return mock data for testing
        return getMockInventoryData(productId);
    }
    
    try {
        const url = `${SKU_GENIE_CONFIG.apiUrl}/inventory`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${SKU_GENIE_CONFIG.apiKey}`,
                'Content-Type': 'application/json',
            },
            params: {
                client_id: SKU_GENIE_CONFIG.clientId,
                product_id: productId,
            },
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching inventory data for ${productId}:`, error);
        return null;
    }
}

/**
 * Get mock product data for testing
 * @param {string} productId - The product ID
 * @returns {Object} - Mock product data
 */
function getMockProductData(productId) {
    return {
        id: productId,
        title: 'Sample Product',
        description: 'This is a sample product description.',
        price: 149.99,
        image: 'https://images.unsplash.com/photo-1577803645773-f96470509666',
        faceShapeCompatibility: {
            oval: 0.9,
            round: 0.8,
            square: 0.5,
            heart: 0.7,
            diamond: 0.6,
            oblong: 0.8
        },
        styleKeywords: ['classic', 'professional', 'versatile', 'timeless', 'refined'],
        featureSummary: 'These full-rim rectangular frames are crafted from high-quality acetate in sleek black. The balanced proportions provide comfort and style for everyday wear.',
        styleDescription: 'With a classic rectangular silhouette, these frames offer a sophisticated look suitable for both professional and casual settings.',
        inventory: {
            available: 15,
            locations: [
                { location_name: 'Warehouse A', quantity: 10 },
                { location_name: 'Store B', quantity: 5 }
            ]
        }
    };
}

/**
 * Get mock collection data for testing
 * @param {string} collectionId - The collection ID
 * @returns {Object} - Mock collection data
 */
function getMockCollectionData(collectionId) {
    return {
        id: collectionId,
        name: 'Sample Collection',
        description: 'This collection features our most popular frames, carefully selected for their versatility and timeless appeal.',
        products: [
            { id: 'product-1', title: 'Product 1' },
            { id: 'product-2', title: 'Product 2' },
            { id: 'product-3', title: 'Product 3' }
        ]
    };
}

/**
 * Get mock inventory data for testing
 * @param {string} productId - The product ID
 * @returns {Object} - Mock inventory data
 */
function getMockInventoryData(productId) {
    return {
        product_id: productId,
        available: 15,
        locations: [
            { location_name: 'Warehouse A', quantity: 10 },
            { location_name: 'Store B', quantity: 5 }
        ]
    };
}