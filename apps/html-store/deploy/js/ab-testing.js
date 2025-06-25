/**
 * SKU-Genie A/B Testing Framework
 * 
 * This module provides A/B testing functionality to measure the impact
 * of enhanced product data on conversion rates and other metrics.
 */

// Configuration
const AB_TESTING_CONFIG = {
    // Whether A/B testing is enabled
    enabled: true,
    
    // Test variants
    variants: {
        // Control group (no enhanced data)
        control: {
            id: 'control',
            name: 'Control',
            description: 'Standard product display without enhanced data',
            weight: 50, // Percentage of users who see this variant
        },
        
        // Treatment group (with enhanced data)
        treatment: {
            id: 'treatment',
            name: 'Enhanced Data',
            description: 'Product display with enhanced SKU-Genie data',
            weight: 50, // Percentage of users who see this variant
        }
    },
    
    // Active tests
    activeTests: [
        {
            id: 'face-shape-compatibility',
            name: 'Face Shape Compatibility',
            description: 'Test the impact of showing face shape compatibility scores',
            variants: ['control', 'treatment'],
            startDate: new Date('2025-04-01'),
            endDate: new Date('2025-05-01'),
        },
        {
            id: 'product-recommendations',
            name: 'Product Recommendations',
            description: 'Test the impact of personalized product recommendations',
            variants: ['control', 'treatment'],
            startDate: new Date('2025-04-01'),
            endDate: new Date('2025-05-01'),
        },
        {
            id: 'virtual-try-on',
            name: 'Virtual Try-On',
            description: 'Test the impact of virtual try-on feature',
            variants: ['control', 'treatment'],
            startDate: new Date('2025-04-01'),
            endDate: new Date('2025-05-01'),
        }
    ],
    
    // Metrics to track
    metrics: [
        {
            id: 'product-views',
            name: 'Product Views',
            description: 'Number of product detail views',
        },
        {
            id: 'add-to-cart',
            name: 'Add to Cart',
            description: 'Number of add to cart actions',
        },
        {
            id: 'checkout-starts',
            name: 'Checkout Starts',
            description: 'Number of checkout starts',
        },
        {
            id: 'purchases',
            name: 'Purchases',
            description: 'Number of completed purchases',
        },
        {
            id: 'time-on-page',
            name: 'Time on Page',
            description: 'Average time spent on product pages',
        },
        {
            id: 'recommendation-clicks',
            name: 'Recommendation Clicks',
            description: 'Number of clicks on recommended products',
        }
    ],
    
    // Analytics endpoint
    analyticsEndpoint: 'https://api.skugenie.com/analytics/ab-testing',
    
    // Local storage keys
    storageKeys: {
        userId: 'skugenie_user_id',
        testAssignments: 'skugenie_test_assignments',
        eventQueue: 'skugenie_event_queue'
    }
};

// User data
let userId = null;
let testAssignments = {};
let eventQueue = [];

/**
 * Initialize A/B testing
 */
function initialize() {
    if (!AB_TESTING_CONFIG.enabled) {
        console.log('A/B testing is disabled');
        return;
    }
    
    // Load user ID from local storage or create a new one
    userId = localStorage.getItem(AB_TESTING_CONFIG.storageKeys.userId);
    
    if (!userId) {
        userId = generateUserId();
        localStorage.setItem(AB_TESTING_CONFIG.storageKeys.userId, userId);
    }
    
    // Load test assignments from local storage or create new ones
    const storedAssignments = localStorage.getItem(AB_TESTING_CONFIG.storageKeys.testAssignments);
    
    if (storedAssignments) {
        try {
            testAssignments = JSON.parse(storedAssignments);
        } catch (error) {
            console.error('Error parsing test assignments:', error);
            testAssignments = {};
        }
    }
    
    // Assign variants for active tests
    for (const test of AB_TESTING_CONFIG.activeTests) {
        if (!testAssignments[test.id]) {
            testAssignments[test.id] = assignVariant(test);
            
            // Track test assignment
            trackEvent('test-assignment', {
                testId: test.id,
                variantId: testAssignments[test.id]
            });
        }
    }
    
    // Save test assignments to local storage
    localStorage.setItem(
        AB_TESTING_CONFIG.storageKeys.testAssignments,
        JSON.stringify(testAssignments)
    );
    
    // Load event queue from local storage
    const storedEventQueue = localStorage.getItem(AB_TESTING_CONFIG.storageKeys.eventQueue);
    
    if (storedEventQueue) {
        try {
            eventQueue = JSON.parse(storedEventQueue);
            
            // Process queued events
            processEventQueue();
        } catch (error) {
            console.error('Error parsing event queue:', error);
            eventQueue = [];
        }
    }
    
    // Apply test variants to the page
    applyTestVariants();
    
    console.log('A/B testing initialized', { userId, testAssignments });
}

/**
 * Generate a unique user ID
 * @returns {string} - User ID
 */
function generateUserId() {
    return 'user_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Assign a variant for a test
 * @param {Object} test - The test
 * @returns {string} - Variant ID
 */
function assignVariant(test) {
    // Get available variants
    const availableVariants = test.variants.map(variantId => AB_TESTING_CONFIG.variants[variantId]);
    
    // Calculate total weight
    const totalWeight = availableVariants.reduce((sum, variant) => sum + variant.weight, 0);
    
    // Generate a random number between 0 and totalWeight
    const random = Math.random() * totalWeight;
    
    // Find the variant based on weight
    let cumulativeWeight = 0;
    
    for (const variant of availableVariants) {
        cumulativeWeight += variant.weight;
        
        if (random <= cumulativeWeight) {
            return variant.id;
        }
    }
    
    // Default to first variant
    return availableVariants[0].id;
}

/**
 * Apply test variants to the page
 */
function applyTestVariants() {
    // Get the variant for the face shape compatibility test
    const faceShapeVariant = testAssignments['face-shape-compatibility'];
    
    // Apply face shape compatibility variant
    if (faceShapeVariant === 'treatment') {
        // Show face shape compatibility elements
        document.querySelectorAll('.face-shape-compat').forEach(el => {
            el.style.display = 'block';
        });
    } else {
        // Hide face shape compatibility elements
        document.querySelectorAll('.face-shape-compat').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    // Get the variant for the product recommendations test
    const recommendationsVariant = testAssignments['product-recommendations'];
    
    // Apply product recommendations variant
    if (recommendationsVariant === 'treatment') {
        // Use enhanced recommendation engine
        window.useEnhancedRecommendations = true;
    } else {
        // Use basic recommendation engine
        window.useEnhancedRecommendations = false;
    }
    
    // Get the variant for the virtual try-on test
    const tryOnVariant = testAssignments['virtual-try-on'];
    
    // Apply virtual try-on variant
    if (tryOnVariant === 'treatment') {
        // Show virtual try-on elements
        document.querySelectorAll('#visualizerLink, #tryOnButton').forEach(el => {
            el.style.display = 'block';
        });
    } else {
        // Hide virtual try-on elements
        document.querySelectorAll('#visualizerLink, #tryOnButton').forEach(el => {
            el.style.display = 'none';
        });
    }
}

/**
 * Track an event
 * @param {string} eventType - The event type
 * @param {Object} eventData - The event data
 */
function trackEvent(eventType, eventData = {}) {
    if (!AB_TESTING_CONFIG.enabled || !userId) {
        return;
    }
    
    // Create event object
    const event = {
        userId,
        eventType,
        timestamp: Date.now(),
        testAssignments: { ...testAssignments },
        data: eventData
    };
    
    // Add to queue
    eventQueue.push(event);
    
    // Save queue to local storage
    localStorage.setItem(
        AB_TESTING_CONFIG.storageKeys.eventQueue,
        JSON.stringify(eventQueue)
    );
    
    // Process queue
    processEventQueue();
    
    console.log('Tracked event', event);
}

/**
 * Process the event queue
 */
function processEventQueue() {
    if (!AB_TESTING_CONFIG.enabled || eventQueue.length === 0) {
        return;
    }
    
    // Clone the queue
    const eventsToProcess = [...eventQueue];
    
    // Send events to analytics endpoint
    sendEvents(eventsToProcess)
        .then(() => {
            // Remove processed events from queue
            eventQueue = eventQueue.filter(event => !eventsToProcess.includes(event));
            
            // Save updated queue to local storage
            localStorage.setItem(
                AB_TESTING_CONFIG.storageKeys.eventQueue,
                JSON.stringify(eventQueue)
            );
        })
        .catch(error => {
            console.error('Error sending events:', error);
        });
}

/**
 * Send events to analytics endpoint
 * @param {Array} events - The events to send
 * @returns {Promise} - Promise that resolves when events are sent
 */
async function sendEvents(events) {
    if (!AB_TESTING_CONFIG.analyticsEndpoint) {
        // If no endpoint is configured, just resolve
        return Promise.resolve();
    }
    
    try {
        const response = await fetch(AB_TESTING_CONFIG.analyticsEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ events })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
    } catch (error) {
        console.error('Error sending events:', error);
        throw error;
    }
}

/**
 * Track a product view
 * @param {string} productId - The product ID
 */
function trackProductView(productId) {
    trackEvent('product-view', { productId });
}

/**
 * Track an add to cart action
 * @param {string} productId - The product ID
 * @param {number} quantity - The quantity
 */
function trackAddToCart(productId, quantity = 1) {
    trackEvent('add-to-cart', { productId, quantity });
}

/**
 * Track a checkout start
 * @param {Array} products - The products in the cart
 */
function trackCheckoutStart(products) {
    trackEvent('checkout-start', { products });
}

/**
 * Track a purchase
 * @param {string} orderId - The order ID
 * @param {Array} products - The purchased products
 * @param {number} total - The order total
 */
function trackPurchase(orderId, products, total) {
    trackEvent('purchase', { orderId, products, total });
}

/**
 * Track time on page
 * @param {string} pageType - The page type
 * @param {number} timeInSeconds - The time spent on the page
 */
function trackTimeOnPage(pageType, timeInSeconds) {
    trackEvent('time-on-page', { pageType, timeInSeconds });
}

/**
 * Track a recommendation click
 * @param {string} productId - The product ID
 * @param {string} recommendationType - The recommendation type
 */
function trackRecommendationClick(productId, recommendationType) {
    trackEvent('recommendation-click', { productId, recommendationType });
}

/**
 * Get the variant for a test
 * @param {string} testId - The test ID
 * @returns {string} - The variant ID
 */
function getTestVariant(testId) {
    return testAssignments[testId] || null;
}

/**
 * Check if a feature is enabled for the user
 * @param {string} testId - The test ID
 * @returns {boolean} - Whether the feature is enabled
 */
function isFeatureEnabled(testId) {
    return getTestVariant(testId) === 'treatment';
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initialize);

// Track page view when window loads
window.addEventListener('load', () => {
    trackEvent('page-view', {
        page: window.location.pathname,
        referrer: document.referrer
    });
    
    // Start tracking time on page
    const startTime = Date.now();
    
    // Track time on page when user leaves
    window.addEventListener('beforeunload', () => {
        const timeInSeconds = Math.round((Date.now() - startTime) / 1000);
        trackTimeOnPage('product', timeInSeconds);
    });
});

// Export functions
window.abTesting = {
    trackProductView,
    trackAddToCart,
    trackCheckoutStart,
    trackPurchase,
    trackTimeOnPage,
    trackRecommendationClick,
    getTestVariant,
    isFeatureEnabled
};