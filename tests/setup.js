/**
 * Test Setup - Testing Agent Implementation
 * SPARC Phase 4 - Days 18-19
 * 
 * Global test setup and configuration
 */

// Import required testing utilities
import 'jest-dom/extend-expect';
import { TextEncoder, TextDecoder } from 'util';

// Global polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock performance API
global.performance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn()
};

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock geolocation
global.navigator.geolocation = {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
};

// Mock console methods for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
});

afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
});

// Global test utilities
global.testUtils = {
    // Create mock cart manager
    createMockCartManager: () => ({
        items: [],
        getItems: jest.fn(() => []),
        addItem: jest.fn(),
        updateQuantity: jest.fn(),
        removeItem: jest.fn(),
        clearCart: jest.fn(),
        getTotal: jest.fn(() => 0),
        getItemCount: jest.fn(() => 0)
    }),
    
    // Create mock store locator
    createMockStoreLocator: () => ({
        searchStores: jest.fn(() => Promise.resolve([])),
        getStoreById: jest.fn(() => Promise.resolve(null)),
        calculateDistance: jest.fn(() => 0),
        getStoreHours: jest.fn(() => ({}))
    }),
    
    // Create mock VTO integration
    createMockVTOIntegration: () => ({
        startSession: jest.fn(() => Promise.resolve({})),
        getSession: jest.fn(() => Promise.resolve({})),
        displaySession: jest.fn(),
        submitFeedback: jest.fn(() => Promise.resolve())
    }),
    
    // Create mock BOPIS manager
    createMockBOPISManager: () => ({
        createReservation: jest.fn(() => Promise.resolve({})),
        getReservation: jest.fn(() => Promise.resolve({})),
        updateReservation: jest.fn(() => Promise.resolve({})),
        cancelReservation: jest.fn(() => Promise.resolve())
    }),
    
    // Create sample data
    createSampleStore: () => ({
        id: 'store-1',
        name: 'Test Store',
        address: '123 Test St, Test City, TS 12345',
        latitude: 40.7128,
        longitude: -74.0060,
        phone: '555-0123',
        services: ['bopis', 'eye-exam'],
        hours: {
            monday: '09:00-18:00',
            tuesday: '09:00-18:00',
            wednesday: '09:00-18:00',
            thursday: '09:00-18:00',
            friday: '09:00-19:00',
            saturday: '10:00-17:00',
            sunday: '12:00-16:00'
        },
        isOpen: true,
        distance: 1.5
    }),
    
    createSampleCartItem: () => ({
        id: 'item-1',
        name: 'Test Frame',
        sku: 'TF-001',
        price: 99.99,
        quantity: 1,
        image: 'test-frame.jpg',
        category: 'eyeglasses',
        brand: 'TestBrand'
    }),
    
    createSampleVTOSession: () => ({
        sessionId: 'vto-123',
        productId: 'item-1',
        frameName: 'Test Frame',
        frameImage: 'test-frame.jpg',
        confidence: 85,
        faceAnalysis: {
            faceShape: 'oval',
            measurements: {
                faceWidth: 140,
                faceHeight: 180
            }
        },
        createdAt: new Date().toISOString()
    }),
    
    createSampleReservation: () => ({
        id: 'res-123',
        confirmationNumber: 'VAR12345',
        storeId: 'store-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
        pickupTime: '2024-01-15T14:00:00Z',
        status: 'confirmed',
        items: [
            {
                productId: 'item-1',
                quantity: 1,
                price: 99.99
            }
        ],
        createdAt: new Date().toISOString()
    }),
    
    // DOM utilities
    createCartContainer: () => {
        const container = document.createElement('div');
        container.className = 'cart-container';
        document.body.appendChild(container);
        return container;
    },
    
    cleanupDOM: () => {
        document.body.innerHTML = '';
    },
    
    // Event utilities
    fireEvent: (element, eventType, eventData = {}) => {
        const event = new Event(eventType, { bubbles: true });
        Object.assign(event, eventData);
        element.dispatchEvent(event);
        return event;
    },
    
    fireCustomEvent: (element, eventType, detail = {}) => {
        const event = new CustomEvent(eventType, { detail, bubbles: true });
        element.dispatchEvent(event);
        return event;
    },
    
    // Async utilities
    waitFor: (condition, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const check = () => {
                if (condition()) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout waiting for condition'));
                } else {
                    setTimeout(check, 10);
                }
            };
            check();
        });
    },
    
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    // Mock API responses
    mockAPIResponse: (data, status = 200) => ({
        ok: status >= 200 && status < 300,
        status,
        json: jest.fn(() => Promise.resolve(data)),
        text: jest.fn(() => Promise.resolve(JSON.stringify(data)))
    }),
    
    mockAPIError: (message, status = 500) => ({
        ok: false,
        status,
        json: jest.fn(() => Promise.resolve({ error: message })),
        text: jest.fn(() => Promise.resolve(JSON.stringify({ error: message })))
    })
};

// Setup and teardown hooks
beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset localStorage and sessionStorage
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    
    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    sessionStorageMock.clear.mockClear();
    
    // Reset fetch mock
    global.fetch.mockClear();
    
    // Clean up DOM
    global.testUtils.cleanupDOM();
    
    // Reset performance mocks
    global.performance.now.mockClear();
    global.performance.mark.mockClear();
    global.performance.measure.mockClear();
});

afterEach(() => {
    // Clean up any remaining timers
    jest.clearAllTimers();
    
    // Clean up DOM
    global.testUtils.cleanupDOM();
    
    // Reset any global state
    delete global.window.cartManager;
    delete global.window.storeLocator;
    delete global.window.vtoCartIntegration;
    delete global.window.bopisManager;
    delete global.window.enhancedCartUI;
});

// Custom matchers
expect.extend({
    toBeWithinRange(received, floor, ceiling) {
        const pass = received >= floor && received <= ceiling;
        if (pass) {
            return {
                message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
                pass: false,
            };
        }
    },
    
    toHaveValidConfirmationNumber(received) {
        const pass = /^VAR[A-Z0-9]{8}$/.test(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be a valid confirmation number`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be a valid confirmation number (format: VAR + 8 alphanumeric characters)`,
                pass: false,
            };
        }
    },
    
    toBeValidEmail(received) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const pass = emailRegex.test(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be a valid email`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be a valid email address`,
                pass: false,
            };
        }
    },
    
    toBeValidPhoneNumber(received) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        const pass = phoneRegex.test(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be a valid phone number`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be a valid phone number`,
                pass: false,
            };
        }
    }
});

// Error boundary for catching React errors in tests
global.ErrorBoundary = class ErrorBoundary extends Error {
    constructor(error, errorInfo) {
        super(error.message);
        this.name = 'ErrorBoundary';
        this.originalError = error;
        this.errorInfo = errorInfo;
    }
};

// Console output suppression for specific tests
global.suppressConsole = (callback) => {
    const originalConsole = { ...console };
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.info = jest.fn();
    
    try {
        return callback();
    } finally {
        Object.assign(console, originalConsole);
    }
};

// Test data factories
global.factories = {
    store: (overrides = {}) => ({
        ...global.testUtils.createSampleStore(),
        ...overrides
    }),
    
    cartItem: (overrides = {}) => ({
        ...global.testUtils.createSampleCartItem(),
        ...overrides
    }),
    
    vtoSession: (overrides = {}) => ({
        ...global.testUtils.createSampleVTOSession(),
        ...overrides
    }),
    
    reservation: (overrides = {}) => ({
        ...global.testUtils.createSampleReservation(),
        ...overrides
    })
};

console.log('🧪 SPARC Test Environment Initialized');