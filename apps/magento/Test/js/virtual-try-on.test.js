/**
 * @jest-environment jsdom
 */

const $ = require('jquery');
global.$ = $;

// Mock dependencies
jest.mock('jquery', () => {
    return {
        ajax: jest.fn().mockImplementation(() => {
            return {
                done: jest.fn().mockReturnThis(),
                fail: jest.fn().mockReturnThis()
            };
        })
    };
});

jest.mock('ko', () => {
    return {
        observable: jest.fn(val => {
            let value = val;
            const obs = function(newVal) {
                if (arguments.length > 0) {
                    value = newVal;
                    return this;
                }
                return value;
            };
            obs.subscribe = jest.fn().mockReturnThis();
            return obs;
        }),
        observableArray: jest.fn(arr => {
            let value = arr || [];
            const obs = function(newVal) {
                if (arguments.length > 0) {
                    value = newVal;
                    return this;
                }
                return value;
            };
            obs.subscribe = jest.fn().mockReturnThis();
            return obs;
        }),
        computed: jest.fn(fn => {
            const obs = function() {
                return fn.call(this);
            };
            obs.subscribe = jest.fn().mockReturnThis();
            return obs;
        })
    };
});

jest.mock('mage/url', () => {
    return {
        build: jest.fn().mockImplementation(url => `https://example.com/${url}`)
    };
});

jest.mock('uiComponent', () => {
    return {
        extend: jest.fn(config => config)
    };
});

// Mock require function
global.require = jest.fn((deps, callback) => {
    if (deps.includes('varai-viewer')) {
        callback({
            constructor: jest.fn()
        });
    } else {
        callback();
    }
});

// Mock document functions
document.getElementById = jest.fn().mockImplementation(() => {
    return { id: 'virtual-try-on-viewer' };
});

// Load the module
const virtualTryOnFactory = require('../../view/frontend/web/js/virtual-try-on');

describe('VARAi Virtual Try-On Component', () => {
    let component;
    
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Initialize component
        component = virtualTryOnFactory();
        component.productId = 123;
        component.initialize();
    });
    
    test('should initialize with correct default values', () => {
        expect(component.defaults.template).toBe('VARAi_Core/virtual-try-on');
        expect(component.defaults.buttonText).toBe('Try On Virtually');
        expect(component.defaults.isEnabled).toBe(false);
        expect(component.defaults.isLoading).toBe(false);
        expect(component.defaults.styleScore).toBe(null);
    });
    
    test('should initialize observables', () => {
        expect(typeof component.isEnabled).toBe('function');
        expect(typeof component.isLoading).toBe('function');
        expect(typeof component.modelUrl).toBe('function');
        expect(typeof component.styleScore).toBe('function');
    });
    
    test('should load model on initialization', () => {
        expect($.ajax).toHaveBeenCalledWith({
            url: 'https://example.com/varai/virtual-try-on/model',
            data: {
                product_id: 123
            },
            method: 'GET',
            success: expect.any(Function),
            error: expect.any(Function),
            complete: expect.any(Function)
        });
    });
    
    test('should handle successful model loading', () => {
        // Get the success callback from the ajax call
        const successCallback = $.ajax.mock.calls[0][0].success;
        
        // Call the success callback with mock data
        successCallback.call(component, {
            success: true,
            model_url: 'https://example.com/model.glb',
            style_score: 85
        });
        
        // Check if the component state was updated correctly
        expect(component.modelUrl()).toBe('https://example.com/model.glb');
        expect(component.isEnabled()).toBe(true);
        expect(component.styleScore()).toBe(85);
    });
    
    test('should handle error in model loading', () => {
        // Mock console.error
        console.error = jest.fn();
        
        // Get the error callback from the ajax call
        const errorCallback = $.ajax.mock.calls[0][0].error;
        
        // Call the error callback
        errorCallback({ responseText: 'Error loading model' });
        
        // Check if error was logged
        expect(console.error).toHaveBeenCalledWith(
            'Failed to load virtual try-on model:',
            'Error loading model'
        );
    });
    
    test('should initialize try-on viewer', () => {
        // Set model URL
        component.modelUrl('https://example.com/model.glb');
        component.styleScore(85);
        
        // Call initTryOn
        component.initTryOn();
        
        // Check if tracking event was called
        expect($.ajax).toHaveBeenCalledWith({
            url: 'https://example.com/varai/analytics/track',
            data: {
                event: 'try_on',
                product_id: 123,
                style_score: 85
            },
            method: 'POST'
        });
        
        // Check if viewer was initialized
        expect(global.require).toHaveBeenCalledWith(
            ['varai-viewer'],
            expect.any(Function)
        );
    });
    
    test('should return correct style score class', () => {
        // Test high score
        component.styleScore(85);
        expect(component.getStyleScoreClass()).toBe('style-score-high');
        
        // Test medium score
        component.styleScore(65);
        expect(component.getStyleScoreClass()).toBe('style-score-medium');
        
        // Test low score
        component.styleScore(45);
        expect(component.getStyleScoreClass()).toBe('style-score-low');
        
        // Test null score
        component.styleScore(null);
        expect(component.getStyleScoreClass()).toBe('');
    });
});