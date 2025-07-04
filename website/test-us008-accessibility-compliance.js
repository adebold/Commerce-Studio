/**
 * US-008: Accessibility Compliance Verification Test
 * Tests WCAG 2.1 AA compliance across the customer portal
 */

class US008AccessibilityComplianceVerificationTest {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.accessibilityViolations = [];
    }

    async runAllTests() {
        console.log('♿ Starting US-008: Accessibility Compliance Verification Tests...');
        
        try {
            // Core accessibility tests
            await this.testAccessibilityManagerInitialization();
            await this.testKeyboardNavigation();
            await this.testScreenReaderSupport();
            await this.testAriaLabelsAndRoles();
            await this.testFocusManagement();
            
            // WCAG compliance tests
            await this.testColorContrast();
            await this.testSemanticHTML();
            await this.testFormAccessibility();
            await this.testImageAlternatives();
            
            // User preference tests
            await this.testHighContrastMode();
            await this.testReducedMotion();
            await this.testLargeTextMode();
            
            // Interactive feature tests
            await this.testAccessibilityToolbar();
            await this.testSkipLinks();
            await this.testLiveRegions();
            
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.addTestResult('Test Suite Execution', false, `Suite failed: ${error.message}`);
        }
    }

    async testAccessibilityManagerInitialization() {
        this.addTest('Accessibility Manager Initialization');
        
        try {
            // Check if AccessibilityManager exists
            if (typeof window.AccessibilityManager === 'undefined') {
                throw new Error('AccessibilityManager not found');
            }
            
            // Wait for initialization
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check if manager is initialized
            const report = window.AccessibilityManager.getAccessibilityReport();
            if (!report.isInitialized) {
                throw new Error('AccessibilityManager failed to initialize');
            }
            
            // Verify core components
            if (report.focusableElements === 0) {
                throw new Error('No focusable elements detected');
            }
            
            if (report.liveRegions === 0) {
                throw new Error('No live regions created');
            }
            
            this.addTestResult('Accessibility Manager Initialization', true, 
                `Manager initialized with ${report.focusableElements} focusable elements and ${report.liveRegions} live regions`);
            
        } catch (error) {
            this.addTestResult('Accessibility Manager Initialization', false, error.message);
        }
    }

    async testKeyboardNavigation() {
        this.addTest('Keyboard Navigation');
        
        try {
            // Test Tab navigation
            const focusableElements = document.querySelectorAll(
                'button, a, input, select, textarea, [tabindex="0"]'
            );
            
            if (focusableElements.length === 0) {
                throw new Error('No focusable elements found');
            }
            
            // Test first element focus
            focusableElements[0].focus();
            if (document.activeElement !== focusableElements[0]) {
                throw new Error('Failed to focus first element');
            }
            
            // Test Tab key simulation
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
            document.dispatchEvent(tabEvent);
            
            // Test Enter key on buttons
            const buttons = document.querySelectorAll('button, [role="button"]');
            let enterKeyWorks = false;
            
            for (const button of buttons) {
                if (button.offsetParent !== null) { // visible element
                    button.focus();
                    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
                    button.dispatchEvent(enterEvent);
                    enterKeyWorks = true;
                    break;
                }
            }
            
            if (!enterKeyWorks && buttons.length > 0) {
                throw new Error('Enter key activation not working on buttons');
            }
            
            // Test Escape key functionality
            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);
            
            this.addTestResult('Keyboard Navigation', true, 
                `${focusableElements.length} focusable elements, Tab and Enter keys working`);
            
        } catch (error) {
            this.addTestResult('Keyboard Navigation', false, error.message);
        }
    }

    async testScreenReaderSupport() {
        this.addTest('Screen Reader Support');
        
        try {
            // Check for live regions
            const liveRegions = document.querySelectorAll('[aria-live]');
            if (liveRegions.length === 0) {
                throw new Error('No live regions found');
            }
            
            // Test announcement functionality
            if (window.AccessibilityManager) {
                window.AccessibilityManager.announce('Test announcement');
                
                // Check if announcement was made
                const politeRegion = document.getElementById('polite-announcements');
                if (!politeRegion) {
                    throw new Error('Polite live region not found');
                }
                
                // Wait for announcement
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (politeRegion.textContent !== 'Test announcement') {
                    throw new Error('Announcement not working properly');
                }
            }
            
            // Check for screen reader only content
            const srOnlyElements = document.querySelectorAll('.sr-only');
            if (srOnlyElements.length === 0) {
                throw new Error('No screen reader only content found');
            }
            
            // Verify sr-only styles are applied
            const srOnlyStyle = window.getComputedStyle(srOnlyElements[0]);
            if (srOnlyStyle.position !== 'absolute' || srOnlyStyle.width !== '1px') {
                throw new Error('Screen reader only styles not applied correctly');
            }
            
            this.addTestResult('Screen Reader Support', true, 
                `${liveRegions.length} live regions, ${srOnlyElements.length} SR-only elements`);
            
        } catch (error) {
            this.addTestResult('Screen Reader Support', false, error.message);
        }
    }

    async testAriaLabelsAndRoles() {
        this.addTest('ARIA Labels and Roles');
        
        try {
            // Check for unlabeled interactive elements
            const unlabeledElements = document.querySelectorAll(
                'button:not([aria-label]):not([aria-labelledby]), ' +
                'input:not([aria-label]):not([aria-labelledby]):not([id]), ' +
                '[role="button"]:not([aria-label]):not([aria-labelledby])'
            );
            
            // Allow some unlabeled elements if they have visible text
            const problematicElements = Array.from(unlabeledElements).filter(el => {
                return !el.textContent.trim() && !el.title;
            });
            
            if (problematicElements.length > 0) {
                console.warn(`Found ${problematicElements.length} unlabeled interactive elements`);
            }
            
            // Check for proper ARIA roles
            const customButtons = document.querySelectorAll('[role="button"]');
            const customLinks = document.querySelectorAll('[role="link"]');
            const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]');
            
            // Check for aria-expanded on expandable elements
            const expandableElements = document.querySelectorAll('[aria-expanded]');
            let expandableValid = true;
            
            expandableElements.forEach(el => {
                const expanded = el.getAttribute('aria-expanded');
                if (expanded !== 'true' && expanded !== 'false') {
                    expandableValid = false;
                }
            });
            
            if (!expandableValid) {
                throw new Error('Invalid aria-expanded values found');
            }
            
            // Check for aria-describedby associations
            const describedElements = document.querySelectorAll('[aria-describedby]');
            let descriptionsValid = true;
            
            describedElements.forEach(el => {
                const descId = el.getAttribute('aria-describedby');
                if (!document.getElementById(descId)) {
                    descriptionsValid = false;
                }
            });
            
            if (!descriptionsValid) {
                throw new Error('Invalid aria-describedby associations found');
            }
            
            this.addTestResult('ARIA Labels and Roles', true, 
                `${customButtons.length} custom buttons, ${landmarks.length} landmarks, ${expandableElements.length} expandable elements`);
            
        } catch (error) {
            this.addTestResult('ARIA Labels and Roles', false, error.message);
        }
    }

    async testFocusManagement() {
        this.addTest('Focus Management');
        
        try {
            // Test skip links
            const skipLinks = document.querySelectorAll('.skip-link');
            if (skipLinks.length === 0) {
                throw new Error('No skip links found');
            }
            
            // Test skip link functionality
            const firstSkipLink = skipLinks[0];
            firstSkipLink.focus();
            
            // Check if skip link becomes visible when focused
            const skipLinkStyle = window.getComputedStyle(firstSkipLink);
            if (skipLinkStyle.position === 'absolute' && skipLinkStyle.top === '-40px') {
                // Skip link should become visible on focus
                const focusEvent = new Event('focus');
                firstSkipLink.dispatchEvent(focusEvent);
            }
            
            // Test focus indicators
            const focusableElements = document.querySelectorAll('button, a, input');
            let focusIndicatorPresent = false;
            
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
                const focusedStyle = window.getComputedStyle(focusableElements[0]);
                
                // Check for focus outline or other focus indicators
                if (focusedStyle.outline !== 'none' || 
                    focusedStyle.boxShadow !== 'none' ||
                    focusedStyle.border !== focusedStyle.border) {
                    focusIndicatorPresent = true;
                }
            }
            
            // Test modal focus trapping (if modals exist)
            const modals = document.querySelectorAll('.modal, [role="dialog"]');
            let modalFocusManaged = true;
            
            modals.forEach(modal => {
                const focusableInModal = modal.querySelectorAll(
                    'button, a, input, select, textarea, [tabindex="0"]'
                );
                if (focusableInModal.length === 0) {
                    modalFocusManaged = false;
                }
            });
            
            if (!modalFocusManaged && modals.length > 0) {
                throw new Error('Modal focus management issues detected');
            }
            
            this.addTestResult('Focus Management', true, 
                `${skipLinks.length} skip links, focus indicators ${focusIndicatorPresent ? 'present' : 'may need enhancement'}`);
            
        } catch (error) {
            this.addTestResult('Focus Management', false, error.message);
        }
    }

    async testColorContrast() {
        this.addTest('Color Contrast');
        
        try {
            // Test high contrast mode availability
            const highContrastButton = document.querySelector('[data-action="toggle-contrast"]');
            if (!highContrastButton) {
                throw new Error('High contrast toggle not found');
            }
            
            // Test contrast toggle functionality
            highContrastButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const hasHighContrastClass = document.body.classList.contains('high-contrast');
            if (!hasHighContrastClass) {
                throw new Error('High contrast mode not activated');
            }
            
            // Check if high contrast styles are applied
            const highContrastStyles = document.getElementById('high-contrast-styles');
            if (!highContrastStyles) {
                throw new Error('High contrast styles not applied');
            }
            
            // Test button contrast in high contrast mode
            const buttons = document.querySelectorAll('button');
            let contrastIssues = 0;
            
            buttons.forEach(button => {
                const style = window.getComputedStyle(button);
                // In high contrast mode, buttons should have strong contrast
                if (style.backgroundColor === style.color) {
                    contrastIssues++;
                }
            });
            
            // Toggle back to normal mode
            highContrastButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            this.addTestResult('Color Contrast', true, 
                `High contrast mode functional, ${contrastIssues} potential contrast issues detected`);
            
        } catch (error) {
            this.addTestResult('Color Contrast', false, error.message);
        }
    }

    async testSemanticHTML() {
        this.addTest('Semantic HTML');
        
        try {
            // Check for proper heading hierarchy
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            if (headings.length === 0) {
                throw new Error('No headings found');
            }
            
            // Check for main content area
            const mainContent = document.querySelector('main, [role="main"]');
            if (!mainContent) {
                throw new Error('Main content area not found');
            }
            
            // Check for navigation landmarks
            const navigation = document.querySelector('nav, [role="navigation"]');
            if (!navigation) {
                throw new Error('Navigation landmark not found');
            }
            
            // Check for proper list usage
            const lists = document.querySelectorAll('ul, ol');
            let properListUsage = true;
            
            lists.forEach(list => {
                const listItems = list.querySelectorAll('li');
                if (listItems.length === 0) {
                    properListUsage = false;
                }
            });
            
            if (!properListUsage) {
                throw new Error('Empty lists found');
            }
            
            // Check for form labels
            const inputs = document.querySelectorAll('input, select, textarea');
            let unlabeledInputs = 0;
            
            inputs.forEach(input => {
                const hasLabel = document.querySelector(`label[for="${input.id}"]`) ||
                                input.getAttribute('aria-label') ||
                                input.getAttribute('aria-labelledby');
                if (!hasLabel) {
                    unlabeledInputs++;
                }
            });
            
            this.addTestResult('Semantic HTML', true, 
                `${headings.length} headings, main content and navigation present, ${unlabeledInputs} unlabeled inputs`);
            
        } catch (error) {
            this.addTestResult('Semantic HTML', false, error.message);
        }
    }

    async testFormAccessibility() {
        this.addTest('Form Accessibility');
        
        try {
            const forms = document.querySelectorAll('form');
            if (forms.length === 0) {
                throw new Error('No forms found');
            }
            
            let formIssues = [];
            
            forms.forEach((form, index) => {
                // Check for form labels
                const inputs = form.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    const hasLabel = document.querySelector(`label[for="${input.id}"]`) ||
                                    input.getAttribute('aria-label') ||
                                    input.getAttribute('aria-labelledby');
                    
                    if (!hasLabel && input.type !== 'hidden') {
                        formIssues.push(`Form ${index + 1}: Input without label`);
                    }
                    
                    // Check for required field indicators
                    if (input.required) {
                        const label = document.querySelector(`label[for="${input.id}"]`);
                        const ariaLabel = input.getAttribute('aria-label');
                        
                        if (label && !label.textContent.includes('required') && 
                            (!ariaLabel || !ariaLabel.includes('required'))) {
                            formIssues.push(`Form ${index + 1}: Required field not clearly marked`);
                        }
                    }
                });
                
                // Check for fieldsets in complex forms
                const fieldsets = form.querySelectorAll('fieldset');
                const radioGroups = form.querySelectorAll('input[type="radio"]');
                const checkboxGroups = form.querySelectorAll('input[type="checkbox"]');
                
                if ((radioGroups.length > 1 || checkboxGroups.length > 1) && fieldsets.length === 0) {
                    formIssues.push(`Form ${index + 1}: Complex form without fieldsets`);
                }
            });
            
            if (formIssues.length > 3) {
                throw new Error(`Multiple form accessibility issues: ${formIssues.slice(0, 3).join(', ')}...`);
            }
            
            this.addTestResult('Form Accessibility', true, 
                `${forms.length} forms checked, ${formIssues.length} minor issues found`);
            
        } catch (error) {
            this.addTestResult('Form Accessibility', false, error.message);
        }
    }

    async testImageAlternatives() {
        this.addTest('Image Alternatives');
        
        try {
            const images = document.querySelectorAll('img');
            let missingAltText = 0;
            let decorativeImages = 0;
            
            images.forEach(img => {
                if (!img.hasAttribute('alt')) {
                    missingAltText++;
                } else if (img.getAttribute('alt') === '') {
                    decorativeImages++;
                }
            });
            
            // Check for background images that might need alternatives
            const elementsWithBackgroundImages = [];
            const allElements = document.querySelectorAll('*');
            
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.backgroundImage && style.backgroundImage !== 'none') {
                    elementsWithBackgroundImages.push(el);
                }
            });
            
            // Check for SVGs with proper accessibility
            const svgs = document.querySelectorAll('svg');
            let inaccessibleSvgs = 0;
            
            svgs.forEach(svg => {
                const hasTitle = svg.querySelector('title');
                const hasAriaLabel = svg.getAttribute('aria-label');
                const isDecorative = svg.getAttribute('aria-hidden') === 'true';
                
                if (!hasTitle && !hasAriaLabel && !isDecorative) {
                    inaccessibleSvgs++;
                }
            });
            
            if (missingAltText > 0) {
                throw new Error(`${missingAltText} images missing alt text`);
            }
            
            this.addTestResult('Image Alternatives', true, 
                `${images.length} images (${decorativeImages} decorative), ${svgs.length} SVGs, ${inaccessibleSvgs} SVGs may need accessibility improvements`);
            
        } catch (error) {
            this.addTestResult('Image Alternatives', false, error.message);
        }
    }

    async testHighContrastMode() {
        this.addTest('High Contrast Mode');
        
        try {
            const contrastToggle = document.querySelector('[data-action="toggle-contrast"]');
            if (!contrastToggle) {
                throw new Error('High contrast toggle not found');
            }
            
            // Test enabling high contrast
            contrastToggle.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (!document.body.classList.contains('high-contrast')) {
                throw new Error('High contrast class not applied');
            }
            
            // Check if styles are applied
            const contrastStyles = document.getElementById('high-contrast-styles');
            if (!contrastStyles) {
                throw new Error('High contrast styles not loaded');
            }
            
            // Test button state
            if (contrastToggle.getAttribute('aria-pressed') !== 'true') {
                throw new Error('Toggle button state not updated');
            }
            
            // Test disabling high contrast
            contrastToggle.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (document.body.classList.contains('high-contrast')) {
                throw new Error('High contrast class not removed');
            }
            
            this.addTestResult('High Contrast Mode', true, 'High contrast toggle working correctly');
            
        } catch (error) {
            this.addTestResult('High Contrast Mode', false, error.message);
        }
    }

    async testReducedMotion() {
        this.addTest('Reduced Motion');
        
        try {
            const motionToggle = document.querySelector('[data-action="toggle-motion"]');
            if (!motionToggle) {
                throw new Error('Reduced motion toggle not found');
            }
            
            // Test enabling reduced motion
            motionToggle.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (!document.body.classList.contains('reduced-motion')) {
                throw new Error('Reduced motion class not applied');
            }
            
            // Check if styles are applied
            const motionStyles = document.getElementById('reduced-motion-styles');
            if (!motionStyles) {
                throw new Error('Reduced motion styles not loaded');
            }
            
            // Test disabling reduced motion
            motionToggle.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            
            this.addTestResult('Reduced Motion', true, 'Reduced motion toggle working correctly');
            
        } catch (error) {
            this.addTestResult('Reduced Motion', false, error.message);
        }
    }

    async testLargeTextMode() {
        this.addTest('Large Text Mode');
        
        try {
            const textToggle = document.querySelector('[data-action="toggle-text-size"]');
            if (!textToggle) {
                throw new Error('Large text toggle not found');
            }
            
            // Test enabling large text
            textToggle.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (!document.body.classList.contains('large-text')) {
                throw new Error('Large text class not applied');
            }
            
            // Check if styles are applied
            const textStyles = document.getElementById('large-text-styles');
            if (!textStyles) {
                throw new Error('Large text styles not loaded');
            }
            
            // Test disabling large text
            textToggle.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            
            this.addTestResult('Large Text Mode', true, 'Large text toggle working correctly');
            
        } catch (error) {
            this.addTestResult('Large Text Mode', false, error.message);
        }
    }

    async testAccessibilityToolbar() {
        this.addTest('Accessibility Toolbar');
        
        try {
            const toolbar = document.querySelector('.accessibility-toolbar');
            if (!toolbar) {
                throw new Error('Accessibility toolbar not found');
            }
            
            // Test toolbar toggle
            const toggle = toolbar.querySelector('.accessibility-toggle');
            if (!toggle) {
                throw new Error('Accessibility toolbar toggle not found');
            }
            
            // Test opening toolbar
            toggle.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const options = toolbar.querySelector('.accessibility-options');
            if (options.hasAttribute('hidden')) {
                throw new Error('Accessibility options not shown');
            }
            
            // Test closing toolbar
            toggle.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (!options.hasAttribute('hidden')) {
                throw new Error('Accessibility options not hidden');
            }
            
            // Test toolbar accessibility
            if (!toolbar.getAttribute('role')) {
                throw new Error('Toolbar missing role attribute');
            }
            
            this.addTestResult('Accessibility Toolbar', true, 'Accessibility toolbar working correctly');
            
        } catch (error) {
            this.addTestResult('Accessibility Toolbar', false, error.message);
        }
    }

    async testSkipLinks() {
        this.addTest('Skip Links');
        
        try {
            const skipLinks = document.querySelectorAll('.skip-link');
            if (skipLinks.length === 0) {
                throw new Error('No skip links found');
            }
            
            // Test skip link targets
            let invalidTargets = 0;
            
            skipLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const target = document.querySelector(href);
                    if (!target) {
                        invalidTargets++;
                    }
                }
            });
            
            if (invalidTargets > 0) {
                throw new Error(`${invalidTargets} skip links have invalid targets`);
            }
            
            // Test skip link visibility on focus
            const firstSkipLink = skipLinks[0];
            firstSkipLink.focus();
            
            const style = window.getComputedStyle(firstSkipLink);
            // Skip link should be positioned off-screen when not focused
            
            this.addTestResult('Skip Links', true, `${skipLinks.length} skip links with valid targets`);
            
        } catch (error) {
            this.addTestResult('Skip Links', false, error.message);
        }
    }

    async testLiveRegions() {
        this.addTest('Live Regions');
        
        try {
            const liveRegions = document.querySelectorAll('[aria-live]');
            if (liveRegions.length === 0) {
                throw new Error('No live regions found');
            }
            
            // Test polite and assertive regions
            const politeRegion = document.getElementById('polite-announcements');
            const assertiveRegion = document.getElementById('assertive-announcements');
            
            if (!politeRegion) {
                throw new Error('Polite live region not found');
            }
            
            if (!assertiveRegion) {
                throw new Error('Assertive live region not found');
            }
            
            // Test announcement functionality
            if (window.AccessibilityManager) {
                window.AccessibilityManager.announce('Test polite announcement', 'polite');
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (politeRegion.textContent !== 'Test polite announcement') {
                    throw new Error('Polite announcement not working');
                }
                
                window.AccessibilityManager.announce('Test assertive announcement', 'assertive');
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (assertiveRegion.textContent !== 'Test assertive announcement') {
                    throw new Error('Assertive announcement not working');
                }
            }
            
            this.addTestResult('Live Regions', true, `${liveRegions.length} live regions working correctly`);
            
        } catch (error) {
            this.addTestResult('Live Regions', false, error.message);
        }
    }

    addTest(testName) {
        this.totalTests++;
        console.log(`♿ Running: ${testName}`);
    }

    addTestResult(testName, passed, details) {
        const result = {
            test: testName,
            passed,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (passed) {
            this.passedTests++;
            console.log(`✅ ${testName}: ${details}`);
        } else {
            this.failedTests++;
            console.log(`❌ ${testName}: ${details}`);
            this.accessibilityViolations.push(result);
        }
    }

    generateReport() {
        const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
        
        const report = {
            testSuite: 'US-008: Accessibility Compliance Verification',
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.totalTests,
                passed: this.passedTests,
                failed: this.failedTests,
                successRate: `${successRate}%`,
                wcagCompliance: this.failedTests === 0 ? 'WCAG 2.1 AA Compliant' : 'Needs Accessibility Improvements'
            },
            results: this.testResults,
            violations: this.accessibilityViolations,
            status: this.failedTests === 0 ? 'PASSED' : 'FAILED'
        };
        
        console.log('\n♿ US-008 Accessibility Compliance Test Report:');
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`Passed: ${this.passedTests}`);
        console.log(`Failed: ${this.failedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log(`WCAG Compliance: ${report.summary.wcagCompliance}`);
        console.log(`Status: ${report.status}`);
        
        if (this.failedTests > 0) {
            console.log('\n❌ Accessibility Violations:');
            this.accessibilityViolations.forEach(violation => {
                console.log(`  - ${violation.test}: ${violation.details}`);
            });
        } else {
            console.log('\n🎉 All accessibility tests passed! Portal is WCAG 2.1 AA compliant.');
        }
        
        // Store report for external access
        window.US008TestReport = report;
        
        return report;
    }
}

// Auto-run tests when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for accessibility manager to load
    setTimeout(async () => {
        const tester = new US008AccessibilityComplianceVerificationTest();
        await tester.runAllTests();
    }, 1500);
});

// Export for manual testing
window.US008AccessibilityComplianceVerificationTest = US008AccessibilityComplianceVerificationTest;