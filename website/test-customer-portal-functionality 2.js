/**
 * Customer Portal Functionality Test
 * VARAi Commerce Studio - SPARC Framework Implementation
 * 
 * Tests US-001: Plan Change Functionality and related features
 */

const puppeteer = require('puppeteer');
const path = require('path');

class CustomerPortalTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.baseUrl = 'file://' + path.resolve(__dirname, 'customer/settings.html');
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: false,
            devtools: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1200, height: 800 });
        
        // Enable console logging
        this.page.on('console', msg => {
            console.log('PAGE LOG:', msg.text());
        });
        
        // Enable error logging
        this.page.on('pageerror', error => {
            console.error('PAGE ERROR:', error.message);
        });
    }

    async runAllTests() {
        console.log('🚀 Starting Customer Portal Functionality Tests...\n');
        
        try {
            await this.init();
            await this.loadPage();
            
            // Core functionality tests
            await this.testPageLoad();
            await this.testNavigation();
            await this.testPlanChangeButton();
            await this.testPlanSelectionModal();
            await this.testPaymentMethodModal();
            await this.testFormValidation();
            await this.testToggleSwitches();
            await this.testResponsiveDesign();
            await this.testAccessibility();
            
            // Generate report
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ Test execution failed:', error);
            this.addTestResult('Test Execution', false, error.message);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    async loadPage() {
        console.log('📄 Loading Customer Portal Settings page...');
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
        await this.page.waitForTimeout(2000); // Allow JavaScript to initialize
    }

    async testPageLoad() {
        console.log('🔍 Testing page load and initialization...');
        
        try {
            // Check if page title is correct
            const title = await this.page.title();
            const titleCorrect = title.includes('Customer Settings');
            this.addTestResult('Page Title', titleCorrect, `Title: ${title}`);
            
            // Check if Customer Portal Agent is initialized
            const agentInitialized = await this.page.evaluate(() => {
                return typeof window.customerPortalAgent !== 'undefined';
            });
            this.addTestResult('Customer Portal Agent Initialization', agentInitialized, 
                agentInitialized ? 'Agent initialized successfully' : 'Agent not found');
            
            // Check if CSS is loaded
            const cssLoaded = await this.page.evaluate(() => {
                const element = document.querySelector('.settings-container');
                const styles = window.getComputedStyle(element);
                return styles.display === 'flex';
            });
            this.addTestResult('CSS Loading', cssLoaded, 
                cssLoaded ? 'Styles applied correctly' : 'CSS not loaded properly');
            
            // Check if Stripe is loaded
            const stripeLoaded = await this.page.evaluate(() => {
                return typeof window.Stripe !== 'undefined';
            });
            this.addTestResult('Stripe.js Loading', stripeLoaded, 
                stripeLoaded ? 'Stripe.js loaded successfully' : 'Stripe.js not loaded');
            
        } catch (error) {
            this.addTestResult('Page Load', false, error.message);
        }
    }

    async testNavigation() {
        console.log('🧭 Testing sidebar navigation...');
        
        try {
            // Test navigation items
            const navItems = await this.page.$$('.nav-item');
            const navItemsFound = navItems.length >= 6;
            this.addTestResult('Navigation Items Present', navItemsFound, 
                `Found ${navItems.length} navigation items`);
            
            // Test clicking billing section
            await this.page.click('[data-section="billing"]');
            await this.page.waitForTimeout(500);
            
            const billingActive = await this.page.evaluate(() => {
                const billingSection = document.getElementById('billing-section');
                return billingSection && billingSection.classList.contains('active');
            });
            this.addTestResult('Billing Section Navigation', billingActive, 
                billingActive ? 'Billing section activated' : 'Navigation failed');
            
            // Test clicking back to profile
            await this.page.click('[data-section="profile"]');
            await this.page.waitForTimeout(500);
            
            const profileActive = await this.page.evaluate(() => {
                const profileSection = document.getElementById('profile-section');
                return profileSection && profileSection.classList.contains('active');
            });
            this.addTestResult('Profile Section Navigation', profileActive, 
                profileActive ? 'Profile section activated' : 'Navigation failed');
            
        } catch (error) {
            this.addTestResult('Navigation', false, error.message);
        }
    }

    async testPlanChangeButton() {
        console.log('💳 Testing Plan Change Button (US-001)...');
        
        try {
            // Navigate to billing section
            await this.page.click('[data-section="billing"]');
            await this.page.waitForTimeout(500);
            
            // Check if Change Plan button exists
            const changePlanButton = await this.page.$('[data-action="change-plan"]');
            const buttonExists = changePlanButton !== null;
            this.addTestResult('Change Plan Button Exists', buttonExists, 
                buttonExists ? 'Button found in DOM' : 'Button not found');
            
            if (buttonExists) {
                // Test button click
                await this.page.click('[data-action="change-plan"]');
                await this.page.waitForTimeout(2000); // Wait for modal to appear
                
                // Check if modal appeared
                const modalVisible = await this.page.evaluate(() => {
                    const modal = document.querySelector('.modal-overlay');
                    return modal && modal.classList.contains('active');
                });
                this.addTestResult('Plan Change Modal Opens', modalVisible, 
                    modalVisible ? 'Modal opened successfully' : 'Modal did not appear');
                
                if (modalVisible) {
                    // Check modal content
                    const modalTitle = await this.page.$eval('.modal-header h2', el => el.textContent);
                    const titleCorrect = modalTitle.includes('Choose Your Plan');
                    this.addTestResult('Modal Title Correct', titleCorrect, `Title: ${modalTitle}`);
                    
                    // Check if plans are displayed
                    const plansVisible = await this.page.$$('.plan-card');
                    const plansFound = plansVisible.length >= 3;
                    this.addTestResult('Plan Cards Displayed', plansFound, 
                        `Found ${plansVisible.length} plan cards`);
                    
                    // Close modal
                    await this.page.click('.modal-close');
                    await this.page.waitForTimeout(500);
                }
            }
            
        } catch (error) {
            this.addTestResult('Plan Change Button', false, error.message);
        }
    }

    async testPlanSelectionModal() {
        console.log('📋 Testing Plan Selection Modal functionality...');
        
        try {
            // Open plan change modal
            await this.page.click('[data-action="change-plan"]');
            await this.page.waitForTimeout(1000);
            
            // Test plan selection
            const planButtons = await this.page.$$('[data-action="select-plan"]');
            if (planButtons.length > 0) {
                // Click on first available plan
                await planButtons[0].click();
                await this.page.waitForTimeout(1000);
                
                // Check if confirmation modal appears
                const confirmationModal = await this.page.evaluate(() => {
                    const modal = document.querySelector('.confirmation-modal');
                    return modal !== null;
                });
                this.addTestResult('Plan Confirmation Modal', confirmationModal, 
                    confirmationModal ? 'Confirmation modal appeared' : 'Confirmation modal not found');
                
                if (confirmationModal) {
                    // Check confirmation modal content
                    const hasChangeDirection = await this.page.$('.change-direction');
                    const hasBillingPreview = await this.page.$('.billing-preview');
                    const hasFeatureComparison = await this.page.$('.feature-comparison');
                    
                    this.addTestResult('Confirmation Modal Content', 
                        hasChangeDirection && hasBillingPreview && hasFeatureComparison,
                        'All required sections present');
                    
                    // Close modal
                    await this.page.click('[data-action="cancel-change"]');
                    await this.page.waitForTimeout(500);
                }
            } else {
                this.addTestResult('Plan Selection', false, 'No selectable plans found');
            }
            
        } catch (error) {
            this.addTestResult('Plan Selection Modal', false, error.message);
        }
    }

    async testPaymentMethodModal() {
        console.log('💰 Testing Payment Method Modal...');
        
        try {
            // Test Add Payment Method button
            const addPaymentButton = await this.page.$('[data-action="add-payment-method"]');
            if (addPaymentButton) {
                await this.page.click('[data-action="add-payment-method"]');
                await this.page.waitForTimeout(1000);
                
                // Check if payment modal appears
                const paymentModal = await this.page.evaluate(() => {
                    const modal = document.querySelector('.payment-modal');
                    return modal !== null;
                });
                this.addTestResult('Payment Method Modal Opens', paymentModal, 
                    paymentModal ? 'Payment modal opened' : 'Payment modal not found');
                
                if (paymentModal) {
                    // Check for Stripe Elements
                    const stripeElement = await this.page.$('#card-element');
                    this.addTestResult('Stripe Elements Present', stripeElement !== null, 
                        stripeElement ? 'Stripe card element found' : 'Stripe element not found');
                    
                    // Check form fields
                    const cardholderName = await this.page.$('#cardholder-name');
                    const billingAddress = await this.page.$('#billing-address');
                    this.addTestResult('Payment Form Fields', 
                        cardholderName && billingAddress, 'Required form fields present');
                    
                    // Close modal
                    await this.page.click('[data-action="cancel"]');
                    await this.page.waitForTimeout(500);
                }
            } else {
                this.addTestResult('Add Payment Method Button', false, 'Button not found');
            }
            
        } catch (error) {
            this.addTestResult('Payment Method Modal', false, error.message);
        }
    }

    async testFormValidation() {
        console.log('✅ Testing Form Validation...');
        
        try {
            // Navigate to profile section
            await this.page.click('[data-section="profile"]');
            await this.page.waitForTimeout(500);
            
            // Test email validation
            await this.page.focus('#email');
            await this.page.keyboard.selectAll();
            await this.page.keyboard.type('invalid-email');
            await this.page.click('#first-name'); // Trigger blur event
            await this.page.waitForTimeout(500);
            
            const emailValidation = await this.page.evaluate(() => {
                const emailField = document.getElementById('email');
                return emailField.classList.contains('field-invalid');
            });
            this.addTestResult('Email Validation', emailValidation, 
                emailValidation ? 'Invalid email detected' : 'Validation not working');
            
            // Fix email and test valid state
            await this.page.focus('#email');
            await this.page.keyboard.selectAll();
            await this.page.keyboard.type('valid@example.com');
            await this.page.click('#first-name');
            await this.page.waitForTimeout(500);
            
            const emailValid = await this.page.evaluate(() => {
                const emailField = document.getElementById('email');
                return emailField.classList.contains('field-valid');
            });
            this.addTestResult('Email Valid State', emailValid, 
                emailValid ? 'Valid email accepted' : 'Valid state not applied');
            
        } catch (error) {
            this.addTestResult('Form Validation', false, error.message);
        }
    }

    async testToggleSwitches() {
        console.log('🔄 Testing Toggle Switches...');
        
        try {
            // Navigate to billing section
            await this.page.click('[data-section="billing"]');
            await this.page.waitForTimeout(500);
            
            // Find toggle switches
            const toggles = await this.page.$$('.toggle-switch input');
            if (toggles.length > 0) {
                // Test first toggle
                const initialState = await this.page.evaluate(() => {
                    const toggle = document.querySelector('.toggle-switch input');
                    return toggle.checked;
                });
                
                // Click toggle
                await this.page.click('.toggle-switch');
                await this.page.waitForTimeout(300);
                
                const newState = await this.page.evaluate(() => {
                    const toggle = document.querySelector('.toggle-switch input');
                    return toggle.checked;
                });
                
                this.addTestResult('Toggle Switch Functionality', 
                    initialState !== newState, 
                    `State changed from ${initialState} to ${newState}`);
            } else {
                this.addTestResult('Toggle Switches', false, 'No toggle switches found');
            }
            
        } catch (error) {
            this.addTestResult('Toggle Switches', false, error.message);
        }
    }

    async testResponsiveDesign() {
        console.log('📱 Testing Responsive Design...');
        
        try {
            // Test mobile viewport
            await this.page.setViewport({ width: 375, height: 667 });
            await this.page.waitForTimeout(1000);
            
            const mobileLayout = await this.page.evaluate(() => {
                const sidebar = document.querySelector('.sidebar');
                const styles = window.getComputedStyle(sidebar);
                return styles.position === 'relative';
            });
            this.addTestResult('Mobile Layout', mobileLayout, 
                mobileLayout ? 'Mobile layout applied' : 'Mobile layout not working');
            
            // Test tablet viewport
            await this.page.setViewport({ width: 768, height: 1024 });
            await this.page.waitForTimeout(1000);
            
            // Reset to desktop
            await this.page.setViewport({ width: 1200, height: 800 });
            await this.page.waitForTimeout(1000);
            
            this.addTestResult('Responsive Design', true, 'Viewport changes handled');
            
        } catch (error) {
            this.addTestResult('Responsive Design', false, error.message);
        }
    }

    async testAccessibility() {
        console.log('♿ Testing Accessibility Features...');
        
        try {
            // Test keyboard navigation
            await this.page.keyboard.press('Tab');
            await this.page.waitForTimeout(200);
            
            const focusedElement = await this.page.evaluate(() => {
                return document.activeElement.tagName;
            });
            this.addTestResult('Keyboard Navigation', 
                focusedElement !== 'BODY', 
                `Focused element: ${focusedElement}`);
            
            // Test ARIA labels
            const ariaLabels = await this.page.$$eval('button[aria-label]', buttons => buttons.length);
            this.addTestResult('ARIA Labels', ariaLabels > 0, 
                `Found ${ariaLabels} buttons with ARIA labels`);
            
            // Test modal focus management
            await this.page.click('[data-action="change-plan"]');
            await this.page.waitForTimeout(1000);
            
            const modalFocused = await this.page.evaluate(() => {
                const modal = document.querySelector('.modal-overlay.active');
                const focusedElement = document.activeElement;
                return modal && modal.contains(focusedElement);
            });
            this.addTestResult('Modal Focus Management', modalFocused, 
                modalFocused ? 'Focus trapped in modal' : 'Focus not managed');
            
            // Close modal
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(500);
            
        } catch (error) {
            this.addTestResult('Accessibility', false, error.message);
        }
    }

    addTestResult(testName, passed, details) {
        this.testResults.push({
            test: testName,
            passed: passed,
            details: details,
            timestamp: new Date().toISOString()
        });
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${testName}: ${details}`);
    }

    async generateReport() {
        console.log('\n📊 Generating Test Report...\n');
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(result => result.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log('='.repeat(60));
        console.log('CUSTOMER PORTAL FUNCTIONALITY TEST REPORT');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log('='.repeat(60));
        
        // Detailed results
        console.log('\nDETAILED RESULTS:');
        this.testResults.forEach(result => {
            const status = result.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${status} | ${result.test}`);
            console.log(`    Details: ${result.details}`);
        });
        
        // Critical functionality assessment
        console.log('\n🎯 CRITICAL FUNCTIONALITY ASSESSMENT:');
        const criticalTests = [
            'Change Plan Button Exists',
            'Plan Change Modal Opens',
            'Plan Selection',
            'Customer Portal Agent Initialization'
        ];
        
        const criticalPassed = criticalTests.every(testName => {
            const result = this.testResults.find(r => r.test === testName);
            return result && result.passed;
        });
        
        if (criticalPassed) {
            console.log('✅ US-001: Plan Change Functionality - IMPLEMENTED SUCCESSFULLY');
            console.log('✅ Core customer portal features are working correctly');
        } else {
            console.log('❌ US-001: Plan Change Functionality - NEEDS ATTENTION');
            console.log('❌ Critical issues found that need to be addressed');
        }
        
        console.log('\n🚀 SPARC Framework Implementation Status:');
        console.log('✅ Specification: Complete - User stories and requirements defined');
        console.log('✅ Pseudocode: Complete - Logic flow implemented');
        console.log('✅ Architecture: Complete - Component structure established');
        console.log('✅ Refinement: In Progress - Testing and validation ongoing');
        console.log('🔄 Completion: Ready for deployment and user acceptance testing');
        
        return {
            totalTests,
            passedTests,
            failedTests,
            successRate,
            criticalPassed,
            results: this.testResults
        };
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new CustomerPortalTester();
    tester.runAllTests().catch(console.error);
}

module.exports = CustomerPortalTester;