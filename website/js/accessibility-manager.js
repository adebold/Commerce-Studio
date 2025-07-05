/**
 * US-008: Accessibility Compliance Manager
 * Ensures WCAG 2.1 AA compliance across the customer portal
 */

class AccessibilityManager {
    constructor() {
        this.isInitialized = false;
        this.focusTracker = new FocusTracker();
        this.screenReaderAnnouncer = new ScreenReaderAnnouncer();
        this.keyboardNavigator = new KeyboardNavigator();
        this.contrastChecker = new ContrastChecker();
        this.ariaManager = new AriaManager();
        
        // Accessibility preferences
        this.preferences = {
            highContrast: false,
            reducedMotion: false,
            largeText: false,
            screenReader: false
        };
        
        this.init();
    }

    async init() {
        try {
            console.log('🔍 Initializing Accessibility Manager...');
            
            // Load user preferences
            await this.loadPreferences();
            
            // Initialize core accessibility features
            this.setupKeyboardNavigation();
            this.setupFocusManagement();
            this.setupAriaLabels();
            this.setupScreenReaderSupport();
            this.setupContrastMode();
            this.setupMotionPreferences();
            
            // Monitor for dynamic content changes
            this.setupMutationObserver();
            
            // Add accessibility toolbar
            this.createAccessibilityToolbar();
            
            this.isInitialized = true;
            console.log('✅ Accessibility Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Accessibility Manager:', error);
        }
    }

    async loadPreferences() {
        try {
            // Load from localStorage
            const stored = localStorage.getItem('accessibility-preferences');
            if (stored) {
                this.preferences = { ...this.preferences, ...JSON.parse(stored) };
            }
            
            // Detect system preferences
            this.detectSystemPreferences();
            
            // Apply loaded preferences
            this.applyPreferences();
            
        } catch (error) {
            console.error('Failed to load accessibility preferences:', error);
        }
    }

    detectSystemPreferences() {
        // Detect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.preferences.reducedMotion = true;
        }
        
        // Detect high contrast preference
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.preferences.highContrast = true;
        }
        
        // Detect screen reader usage
        if (navigator.userAgent.includes('NVDA') || 
            navigator.userAgent.includes('JAWS') || 
            navigator.userAgent.includes('VoiceOver')) {
            this.preferences.screenReader = true;
        }
    }

    setupKeyboardNavigation() {
        // Ensure all interactive elements are keyboard accessible
        const interactiveElements = document.querySelectorAll(
            'button, a, input, select, textarea, [tabindex], [role="button"], [role="link"]'
        );
        
        interactiveElements.forEach(element => {
            // Ensure tabindex is set appropriately
            if (!element.hasAttribute('tabindex') && !this.isNaturallyFocusable(element)) {
                element.setAttribute('tabindex', '0');
            }
            
            // Add keyboard event handlers
            this.addKeyboardHandlers(element);
        });
        
        // Setup skip links
        this.createSkipLinks();
        
        // Setup focus trap for modals
        this.setupFocusTraps();
    }

    isNaturallyFocusable(element) {
        const naturallyFocusable = [
            'button', 'input', 'select', 'textarea', 'a'
        ];
        return naturallyFocusable.includes(element.tagName.toLowerCase()) &&
               !element.disabled && !element.hasAttribute('aria-hidden');
    }

    addKeyboardHandlers(element) {
        element.addEventListener('keydown', (event) => {
            // Handle Enter and Space for custom buttons
            if ((event.key === 'Enter' || event.key === ' ') && 
                element.getAttribute('role') === 'button') {
                event.preventDefault();
                element.click();
            }
            
            // Handle Escape for modals and dropdowns
            if (event.key === 'Escape') {
                this.handleEscapeKey(element);
            }
            
            // Handle Arrow keys for navigation
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                this.handleArrowNavigation(element, event);
            }
        });
    }

    createSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
            <a href="#footer" class="skip-link">Skip to footer</a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
        
        // Add CSS for skip links
        this.addSkipLinkStyles();
    }

    addSkipLinkStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .skip-links {
                position: absolute;
                top: -40px;
                left: 6px;
                z-index: 1000;
            }
            
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                transition: top 0.3s;
            }
            
            .skip-link:focus {
                top: 6px;
            }
            
            .high-contrast .skip-link {
                background: #ffff00;
                color: #000;
                border: 2px solid #000;
            }
        `;
        document.head.appendChild(style);
    }

    setupFocusManagement() {
        // Track focus for better UX
        this.focusTracker.init();
        
        // Manage focus for dynamic content
        document.addEventListener('DOMNodeInserted', (event) => {
            if (event.target.nodeType === Node.ELEMENT_NODE) {
                this.manageFocusForNewContent(event.target);
            }
        });
        
        // Focus management for modals
        this.setupModalFocusManagement();
    }

    manageFocusForNewContent(element) {
        // If new content contains focusable elements, manage focus appropriately
        const focusableElements = element.querySelectorAll(
            'button, a, input, select, textarea, [tabindex="0"]'
        );
        
        if (focusableElements.length > 0) {
            // Announce new content to screen readers
            this.screenReaderAnnouncer.announce(
                `New content loaded with ${focusableElements.length} interactive elements`
            );
        }
    }

    setupAriaLabels() {
        // Ensure all interactive elements have proper labels
        const unlabeledElements = document.querySelectorAll(
            'button:not([aria-label]):not([aria-labelledby]), ' +
            'input:not([aria-label]):not([aria-labelledby]):not([id]), ' +
            '[role="button"]:not([aria-label]):not([aria-labelledby])'
        );
        
        unlabeledElements.forEach(element => {
            this.addAriaLabel(element);
        });
        
        // Setup live regions for dynamic content
        this.setupLiveRegions();
    }

    addAriaLabel(element) {
        // Generate appropriate aria-label based on element context
        let label = '';
        
        if (element.textContent.trim()) {
            label = element.textContent.trim();
        } else if (element.title) {
            label = element.title;
        } else if (element.dataset.action) {
            label = this.generateLabelFromAction(element.dataset.action);
        } else {
            label = this.generateGenericLabel(element);
        }
        
        if (label) {
            element.setAttribute('aria-label', label);
        }
    }

    generateLabelFromAction(action) {
        const actionLabels = {
            'change-plan': 'Change subscription plan',
            'add-payment': 'Add payment method',
            'edit-profile': 'Edit profile information',
            'save-settings': 'Save settings',
            'cancel': 'Cancel action',
            'close': 'Close dialog'
        };
        
        return actionLabels[action] || `Perform ${action} action`;
    }

    setupLiveRegions() {
        // Create polite live region for non-urgent announcements
        const politeRegion = document.createElement('div');
        politeRegion.setAttribute('aria-live', 'polite');
        politeRegion.setAttribute('aria-atomic', 'true');
        politeRegion.className = 'sr-only';
        politeRegion.id = 'polite-announcements';
        document.body.appendChild(politeRegion);
        
        // Create assertive live region for urgent announcements
        const assertiveRegion = document.createElement('div');
        assertiveRegion.setAttribute('aria-live', 'assertive');
        assertiveRegion.setAttribute('aria-atomic', 'true');
        assertiveRegion.className = 'sr-only';
        assertiveRegion.id = 'assertive-announcements';
        document.body.appendChild(assertiveRegion);
    }

    setupScreenReaderSupport() {
        // Add screen reader only styles
        this.addScreenReaderStyles();
        
        // Enhance form labels and descriptions
        this.enhanceFormAccessibility();
        
        // Add descriptive text for complex UI elements
        this.addDescriptiveText();
    }

    addScreenReaderStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
            
            .sr-only-focusable:focus {
                position: static;
                width: auto;
                height: auto;
                padding: inherit;
                margin: inherit;
                overflow: visible;
                clip: auto;
                white-space: normal;
            }
        `;
        document.head.appendChild(style);
    }

    enhanceFormAccessibility() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Ensure all inputs have labels
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                this.ensureInputLabel(input);
                this.addInputValidation(input);
            });
            
            // Add form submission feedback
            this.addFormSubmissionFeedback(form);
        });
    }

    ensureInputLabel(input) {
        const existingLabel = document.querySelector(`label[for="${input.id}"]`);
        
        if (!existingLabel && !input.getAttribute('aria-label')) {
            // Create label based on input context
            const label = this.generateInputLabel(input);
            if (label) {
                input.setAttribute('aria-label', label);
            }
        }
        
        // Add required indicator for screen readers
        if (input.required) {
            const currentLabel = input.getAttribute('aria-label') || 
                               existingLabel?.textContent || '';
            input.setAttribute('aria-label', `${currentLabel} (required)`);
        }
    }

    setupContrastMode() {
        if (this.preferences.highContrast) {
            this.enableHighContrast();
        }
        
        // Add contrast toggle functionality
        this.addContrastToggle();
    }

    enableHighContrast() {
        document.body.classList.add('high-contrast');
        
        // Add high contrast styles
        const style = document.createElement('style');
        style.id = 'high-contrast-styles';
        style.textContent = `
            .high-contrast {
                filter: contrast(150%);
            }
            
            .high-contrast button,
            .high-contrast .btn {
                background: #000 !important;
                color: #fff !important;
                border: 2px solid #fff !important;
            }
            
            .high-contrast button:hover,
            .high-contrast .btn:hover {
                background: #fff !important;
                color: #000 !important;
                border: 2px solid #000 !important;
            }
            
            .high-contrast input,
            .high-contrast select,
            .high-contrast textarea {
                background: #fff !important;
                color: #000 !important;
                border: 2px solid #000 !important;
            }
            
            .high-contrast a {
                color: #0066cc !important;
                text-decoration: underline !important;
            }
            
            .high-contrast .modal {
                background: #fff !important;
                border: 3px solid #000 !important;
            }
        `;
        document.head.appendChild(style);
    }

    setupMotionPreferences() {
        if (this.preferences.reducedMotion) {
            this.enableReducedMotion();
        }
    }

    enableReducedMotion() {
        document.body.classList.add('reduced-motion');
        
        const style = document.createElement('style');
        style.id = 'reduced-motion-styles';
        style.textContent = `
            .reduced-motion *,
            .reduced-motion *::before,
            .reduced-motion *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }

    createAccessibilityToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'accessibility-toolbar';
        toolbar.setAttribute('role', 'toolbar');
        toolbar.setAttribute('aria-label', 'Accessibility options');
        
        toolbar.innerHTML = `
            <button class="accessibility-toggle" aria-label="Toggle accessibility toolbar">
                <span class="sr-only">Accessibility Options</span>
                ♿
            </button>
            <div class="accessibility-options" hidden>
                <button data-action="toggle-contrast" aria-pressed="${this.preferences.highContrast}">
                    High Contrast
                </button>
                <button data-action="toggle-motion" aria-pressed="${this.preferences.reducedMotion}">
                    Reduce Motion
                </button>
                <button data-action="toggle-text-size" aria-pressed="${this.preferences.largeText}">
                    Large Text
                </button>
                <button data-action="focus-outline">
                    Show Focus Outline
                </button>
            </div>
        `;
        
        document.body.appendChild(toolbar);
        this.addToolbarStyles();
        this.addToolbarEventListeners(toolbar);
    }

    addToolbarStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .accessibility-toolbar {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                background: #fff;
                border: 2px solid #007bff;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .accessibility-toggle {
                background: #007bff;
                color: #fff;
                border: none;
                padding: 12px;
                font-size: 18px;
                border-radius: 6px;
                cursor: pointer;
            }
            
            .accessibility-options {
                position: absolute;
                top: 100%;
                right: 0;
                background: #fff;
                border: 2px solid #007bff;
                border-radius: 6px;
                margin-top: 4px;
                min-width: 200px;
            }
            
            .accessibility-options button {
                display: block;
                width: 100%;
                padding: 12px 16px;
                border: none;
                background: none;
                text-align: left;
                cursor: pointer;
                border-bottom: 1px solid #eee;
            }
            
            .accessibility-options button:hover {
                background: #f8f9fa;
            }
            
            .accessibility-options button[aria-pressed="true"] {
                background: #007bff;
                color: #fff;
            }
            
            .high-contrast .accessibility-toolbar {
                background: #000;
                border-color: #fff;
            }
            
            .high-contrast .accessibility-toggle {
                background: #fff;
                color: #000;
            }
        `;
        document.head.appendChild(style);
    }

    addToolbarEventListeners(toolbar) {
        const toggle = toolbar.querySelector('.accessibility-toggle');
        const options = toolbar.querySelector('.accessibility-options');
        
        toggle.addEventListener('click', () => {
            const isHidden = options.hasAttribute('hidden');
            if (isHidden) {
                options.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
            } else {
                options.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Handle option clicks
        options.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                this.handleToolbarAction(event.target);
            }
        });
    }

    handleToolbarAction(button) {
        const action = button.dataset.action;
        
        switch (action) {
            case 'toggle-contrast':
                this.toggleHighContrast();
                break;
            case 'toggle-motion':
                this.toggleReducedMotion();
                break;
            case 'toggle-text-size':
                this.toggleLargeText();
                break;
            case 'focus-outline':
                this.showFocusOutlines();
                break;
        }
        
        // Update button state
        const isPressed = button.getAttribute('aria-pressed') === 'true';
        button.setAttribute('aria-pressed', !isPressed);
        
        // Save preferences
        this.savePreferences();
    }

    toggleHighContrast() {
        this.preferences.highContrast = !this.preferences.highContrast;
        
        if (this.preferences.highContrast) {
            this.enableHighContrast();
        } else {
            document.body.classList.remove('high-contrast');
            const style = document.getElementById('high-contrast-styles');
            if (style) style.remove();
        }
        
        this.screenReaderAnnouncer.announce(
            `High contrast ${this.preferences.highContrast ? 'enabled' : 'disabled'}`
        );
    }

    toggleReducedMotion() {
        this.preferences.reducedMotion = !this.preferences.reducedMotion;
        
        if (this.preferences.reducedMotion) {
            this.enableReducedMotion();
        } else {
            document.body.classList.remove('reduced-motion');
            const style = document.getElementById('reduced-motion-styles');
            if (style) style.remove();
        }
        
        this.screenReaderAnnouncer.announce(
            `Reduced motion ${this.preferences.reducedMotion ? 'enabled' : 'disabled'}`
        );
    }

    toggleLargeText() {
        this.preferences.largeText = !this.preferences.largeText;
        
        if (this.preferences.largeText) {
            document.body.classList.add('large-text');
            this.addLargeTextStyles();
        } else {
            document.body.classList.remove('large-text');
            const style = document.getElementById('large-text-styles');
            if (style) style.remove();
        }
        
        this.screenReaderAnnouncer.announce(
            `Large text ${this.preferences.largeText ? 'enabled' : 'disabled'}`
        );
    }

    addLargeTextStyles() {
        const style = document.createElement('style');
        style.id = 'large-text-styles';
        style.textContent = `
            .large-text {
                font-size: 120% !important;
            }
            
            .large-text button,
            .large-text .btn {
                font-size: 120% !important;
                padding: 12px 20px !important;
            }
            
            .large-text input,
            .large-text select,
            .large-text textarea {
                font-size: 120% !important;
                padding: 12px !important;
            }
        `;
        document.head.appendChild(style);
    }

    showFocusOutlines() {
        const style = document.createElement('style');
        style.id = 'focus-outline-styles';
        style.textContent = `
            *:focus {
                outline: 3px solid #007bff !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
        
        this.screenReaderAnnouncer.announce('Focus outlines are now visible');
        
        // Remove after 10 seconds
        setTimeout(() => {
            const focusStyle = document.getElementById('focus-outline-styles');
            if (focusStyle) focusStyle.remove();
        }, 10000);
    }

    savePreferences() {
        try {
            localStorage.setItem('accessibility-preferences', JSON.stringify(this.preferences));
        } catch (error) {
            console.error('Failed to save accessibility preferences:', error);
        }
    }

    applyPreferences() {
        if (this.preferences.highContrast) {
            this.enableHighContrast();
        }
        
        if (this.preferences.reducedMotion) {
            this.enableReducedMotion();
        }
        
        if (this.preferences.largeText) {
            this.toggleLargeText();
        }
    }

    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.processNewElement(node);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    processNewElement(element) {
        // Add accessibility features to new elements
        const interactiveElements = element.querySelectorAll(
            'button, a, input, select, textarea, [role="button"]'
        );
        
        interactiveElements.forEach(el => {
            this.addKeyboardHandlers(el);
            this.addAriaLabel(el);
        });
    }

    // Public API methods
    announce(message, priority = 'polite') {
        this.screenReaderAnnouncer.announce(message, priority);
    }

    focusElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.focus();
            this.announce(`Focused on ${element.getAttribute('aria-label') || element.textContent}`);
        }
    }

    getAccessibilityReport() {
        return {
            isInitialized: this.isInitialized,
            preferences: this.preferences,
            focusableElements: document.querySelectorAll('[tabindex], button, a, input, select, textarea').length,
            ariaLabels: document.querySelectorAll('[aria-label]').length,
            liveRegions: document.querySelectorAll('[aria-live]').length
        };
    }
}

// Supporting classes
class FocusTracker {
    constructor() {
        this.focusHistory = [];
        this.currentFocus = null;
    }

    init() {
        document.addEventListener('focusin', (event) => {
            this.currentFocus = event.target;
            this.focusHistory.push({
                element: event.target,
                timestamp: Date.now()
            });
            
            // Keep only last 10 focus events
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }
        });
    }

    getPreviousFocus() {
        return this.focusHistory[this.focusHistory.length - 2]?.element;
    }
}

class ScreenReaderAnnouncer {
    announce(message, priority = 'polite') {
        const regionId = priority === 'assertive' ? 'assertive-announcements' : 'polite-announcements';
        const region = document.getElementById(regionId);
        
        if (region) {
            region.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                region.textContent = '';
            }, 1000);
        }
    }
}

class KeyboardNavigator {
    constructor() {
        this.trapStack = [];
    }

    trapFocus(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        const trapHandler = (event) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };
        
        container.addEventListener('keydown', trapHandler);
        this.trapStack.push({ container, handler: trapHandler });
        
        // Focus first element
        firstElement.focus();
    }

    releaseFocusTrap() {
        const trap = this.trapStack.pop();
        if (trap) {
            trap.container.removeEventListener('keydown', trap.handler);
        }
    }
}

class ContrastChecker {
    checkContrast(foreground, background) {
        // Simplified contrast checking
        const fgLuminance = this.getLuminance(foreground);
        const bgLuminance = this.getLuminance(background);
        
        const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                        (Math.min(fgLuminance, bgLuminance) + 0.05);
        
        return {
            ratio: contrast,
            passesAA: contrast >= 4.5,
            passesAAA: contrast >= 7
        };
    }

    getLuminance(color) {
        // Simplified luminance calculation
        const rgb = this.hexToRgb(color);
        if (!rgb) return 0;
        
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}

class AriaManager {
    constructor() {
        this.labelCounter = 0;
    }

    generateUniqueId() {
        return `aria-label-${++this.labelCounter}`;
    }

    associateLabel(input, label) {
        const labelId = this.generateUniqueId();
        label.id = labelId;
        input.setAttribute('aria-labelledby', labelId);
    }

    addDescription(element, description) {
        const descId = this.generateUniqueId();
        const descElement = document.createElement('div');
        descElement.id = descId;
        descElement.className = 'sr-only';
        descElement.textContent = description;
        
        element.parentNode.insertBefore(descElement, element.nextSibling);
        element.setAttribute('aria-describedby', descId);
    }
}

// Initialize accessibility manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.AccessibilityManager = new AccessibilityManager();
});

// Export for testing and external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}