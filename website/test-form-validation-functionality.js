/**
 * Form Validation Functionality Test Suite
 * Tests the enhanced form validation implementation in customer portal
 */

const puppeteer = require('puppeteer');

class FormValidationTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
    }

    async initialize() {
        console.log('🚀 Initializing Form Validation Test Suite...');
        
        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1200, height: 800 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        this.page = await this.browser.newPage();
        
        // Enable console logging
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Browser Error:', msg.text());
            }
        });
    }

    async testFormValidationSetup() {
        console.log('\n📋 Testing Form Validation Setup...');
        
        try {
            await this.page.goto('http://localhost:8080/customer/settings.html', {
                waitUntil: 'networkidle0',
                timeout: 10000
            });

            // Check if Form Validation Manager is loaded
            const validationManagerExists = await this.page.evaluate(() => {
                return typeof window.FormValidationManager !== 'undefined';
            });

            // Check if validation manager is initialized
            const validationInitialized = await this.page.evaluate(() => {
                return window.formValidationManager instanceof window.FormValidationManager;
            });

            this.testResults.push({
                test: 'Form Validation Manager Setup',
                passed: validationManagerExists && validationInitialized,
                details: `Manager exists: ${validationManagerExists}, Initialized: ${validationInitialized}`
            });

            return validationManagerExists && validationInitialized;

        } catch (error) {
            console.log('❌ Form validation setup test failed:', error.message);
            this.testResults.push({
                test: 'Form Validation Manager Setup',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testEmailValidation() {
        console.log('\n📧 Testing Email Validation...');
        
        try {
            // Test invalid email
            await this.page.focus('#contactEmail');
            await this.page.evaluate(() => document.getElementById('contactEmail').value = '');
            await this.page.type('#contactEmail', 'invalid-email');
            await this.page.click('body'); // Trigger blur event

            // Wait for validation
            await this.page.waitForTimeout(500);

            const hasError = await this.page.evaluate(() => {
                const field = document.getElementById('contactEmail');
                return field.classList.contains('error') || 
                       field.parentElement.querySelector('.error-message') !== null;
            });

            // Test valid email
            await this.page.focus('#contactEmail');
            await this.page.evaluate(() => document.getElementById('contactEmail').value = '');
            await this.page.type('#contactEmail', 'valid@example.com');
            await this.page.click('body');

            await this.page.waitForTimeout(500);

            const noError = await this.page.evaluate(() => {
                const field = document.getElementById('contactEmail');
                return !field.classList.contains('error') && 
                       field.parentElement.querySelector('.error-message') === null;
            });

            const passed = hasError && noError;
            this.testResults.push({
                test: 'Email Validation',
                passed: passed,
                details: `Invalid email shows error: ${hasError}, Valid email clears error: ${noError}`
            });

            return passed;

        } catch (error) {
            console.log('❌ Email validation test failed:', error.message);
            this.testResults.push({
                test: 'Email Validation',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testRequiredFieldValidation() {
        console.log('\n✅ Testing Required Field Validation...');
        
        try {
            // Test company name required validation
            await this.page.focus('#companyName');
            await this.page.evaluate(() => document.getElementById('companyName').value = '');
            await this.page.click('body');

            await this.page.waitForTimeout(500);

            const hasRequiredError = await this.page.evaluate(() => {
                const field = document.getElementById('companyName');
                return field.classList.contains('error') || 
                       field.parentElement.querySelector('.error-message') !== null;
            });

            // Fill in required field
            await this.page.focus('#companyName');
            await this.page.type('#companyName', 'Test Company');
            await this.page.click('body');

            await this.page.waitForTimeout(500);

            const errorCleared = await this.page.evaluate(() => {
                const field = document.getElementById('companyName');
                return !field.classList.contains('error');
            });

            const passed = hasRequiredError && errorCleared;
            this.testResults.push({
                test: 'Required Field Validation',
                passed: passed,
                details: `Empty field shows error: ${hasRequiredError}, Filled field clears error: ${errorCleared}`
            });

            return passed;

        } catch (error) {
            console.log('❌ Required field validation test failed:', error.message);
            this.testResults.push({
                test: 'Required Field Validation',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testPhoneValidation() {
        console.log('\n📞 Testing Phone Validation...');
        
        try {
            // Test invalid phone
            await this.page.focus('#businessPhone');
            await this.page.evaluate(() => document.getElementById('businessPhone').value = '');
            await this.page.type('#businessPhone', '123');
            await this.page.click('body');

            await this.page.waitForTimeout(500);

            const hasPhoneError = await this.page.evaluate(() => {
                const field = document.getElementById('businessPhone');
                return field.classList.contains('error') || 
                       field.parentElement.querySelector('.error-message') !== null;
            });

            // Test valid phone
            await this.page.focus('#businessPhone');
            await this.page.evaluate(() => document.getElementById('businessPhone').value = '');
            await this.page.type('#businessPhone', '+1 (555) 123-4567');
            await this.page.click('body');

            await this.page.waitForTimeout(500);

            const phoneErrorCleared = await this.page.evaluate(() => {
                const field = document.getElementById('businessPhone');
                return !field.classList.contains('error');
            });

            const passed = hasPhoneError && phoneErrorCleared;
            this.testResults.push({
                test: 'Phone Validation',
                passed: passed,
                details: `Invalid phone shows error: ${hasPhoneError}, Valid phone clears error: ${phoneErrorCleared}`
            });

            return passed;

        } catch (error) {
            console.log('❌ Phone validation test failed:', error.message);
            this.testResults.push({
                test: 'Phone Validation',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testPasswordValidation() {
        console.log('\n🔒 Testing Password Validation...');
        
        try {
            // Test weak password
            await this.page.focus('#newPassword');
            await this.page.evaluate(() => document.getElementById('newPassword').value = '');
            await this.page.type('#newPassword', '123');
            await this.page.click('body');

            await this.page.waitForTimeout(500);

            const hasPasswordError = await this.page.evaluate(() => {
                const field = document.getElementById('newPassword');
                return field.classList.contains('error') || 
                       field.parentElement.querySelector('.error-message') !== null;
            });

            // Test strong password
            await this.page.focus('#newPassword');
            await this.page.evaluate(() => document.getElementById('newPassword').value = '');
            await this.page.type('#newPassword', 'StrongPass123!');
            await this.page.click('body');

            await this.page.waitForTimeout(500);

            const passwordErrorCleared = await this.page.evaluate(() => {
                const field = document.getElementById('newPassword');
                return !field.classList.contains('error');
            });

            const passed = hasPasswordError && passwordErrorCleared;
            this.testResults.push({
                test: 'Password Strength Validation',
                passed: passed,
                details: `Weak password shows error: ${hasPasswordError}, Strong password clears error: ${passwordErrorCleared}`
            });

            return passed;

        } catch (error) {
            console.log('❌ Password validation test failed:', error.message);
            this.testResults.push({
                test: 'Password Strength Validation',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testZipCodeValidation() {
        console.log('\n📮 Testing ZIP Code Validation...');
        
        try {
            // Test invalid ZIP
            await this.page.focus('#billingZip');
            await this.page.evaluate(() => document.getElementById('billingZip').value = '');
            await this.page.type('#billingZip', '123');
            await this.page.click('body');

            await this.page.waitForTimeout(500);

            const hasZipError = await this.page.evaluate(() => {
                const field = document.getElementById('billingZip');
                return field.classList.contains('error') || 
                       field.parentElement.querySelector('.error-message') !== null;
            });

            // Test valid ZIP
            await this.page.focus('#billingZip');
            await this.page.evaluate(() => document.getElementById('billingZip').value = '');
            await this.page.type('#billingZip', '12345');
            await this.page.click('body');

            await this.page.waitForTimeout(500);

            const zipErrorCleared = await this.page.evaluate(() => {
                const field = document.getElementById('billingZip');
                return !field.classList.contains('error');
            });

            const passed = hasZipError && zipErrorCleared;
            this.testResults.push({
                test: 'ZIP Code Validation',
                passed: passed,
                details: `Invalid ZIP shows error: ${hasZipError}, Valid ZIP clears error: ${zipErrorCleared}`
            });

            return passed;

        } catch (error) {
            console.log('❌ ZIP code validation test failed:', error.message);
            this.testResults.push({
                test: 'ZIP Code Validation',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testRealTimeValidation() {
        console.log('\n⚡ Testing Real-time Validation...');
        
        try {
            // Test real-time validation on email field
            await this.page.focus('#contactEmail');
            await this.page.evaluate(() => document.getElementById('contactEmail').value = '');
            
            // Type invalid email character by character
            await this.page.type('#contactEmail', 'test@', { delay: 100 });
            
            // Wait for debounced validation
            await this.page.waitForTimeout(600);

            const realtimeValidation = await this.page.evaluate(() => {
                const field = document.getElementById('contactEmail');
                return field.classList.contains('error') || 
                       field.parentElement.querySelector('.error-message') !== null;
            });

            this.testResults.push({
                test: 'Real-time Validation',
                passed: realtimeValidation,
                details: `Real-time validation triggered: ${realtimeValidation}`
            });

            return realtimeValidation;

        } catch (error) {
            console.log('❌ Real-time validation test failed:', error.message);
            this.testResults.push({
                test: 'Real-time Validation',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testAccessibilityFeatures() {
        console.log('\n♿ Testing Accessibility Features...');
        
        try {
            // Test ARIA attributes
            const ariaAttributes = await this.page.evaluate(() => {
                const field = document.getElementById('contactEmail');
                return {
                    hasAriaInvalid: field.hasAttribute('aria-invalid'),
                    hasAriaDescribedBy: field.hasAttribute('aria-describedby')
                };
            });

            // Test keyboard navigation
            await this.page.keyboard.press('Tab');
            const focusedElement = await this.page.evaluate(() => document.activeElement.id);

            const accessibilityPassed = ariaAttributes.hasAriaInvalid || focusedElement !== '';
            
            this.testResults.push({
                test: 'Accessibility Features',
                passed: accessibilityPassed,
                details: `ARIA attributes: ${JSON.stringify(ariaAttributes)}, Keyboard navigation: ${focusedElement}`
            });

            return accessibilityPassed;

        } catch (error) {
            console.log('❌ Accessibility test failed:', error.message);
            this.testResults.push({
                test: 'Accessibility Features',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async generateReport() {
        console.log('\n📊 Generating Form Validation Test Report...');
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(result => result.passed).length;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);

        console.log('\n' + '='.repeat(60));
        console.log('📋 FORM VALIDATION TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`📊 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
        console.log('');

        this.testResults.forEach((result, index) => {
            const status = result.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${index + 1}. ${result.test}: ${status}`);
            console.log(`   Details: ${result.details}`);
            console.log('');
        });

        // Generate recommendations
        console.log('💡 RECOMMENDATIONS:');
        const failedTests = this.testResults.filter(result => !result.passed);
        
        if (failedTests.length === 0) {
            console.log('✅ All form validation tests passed! The implementation is working correctly.');
        } else {
            failedTests.forEach(test => {
                console.log(`❌ Fix: ${test.test} - ${test.details}`);
            });
        }

        console.log('='.repeat(60));
        
        return {
            totalTests,
            passedTests,
            successRate: parseFloat(successRate),
            results: this.testResults
        };
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async runAllTests() {
        try {
            await this.initialize();
            
            console.log('🧪 Running Form Validation Test Suite...');
            console.log('Testing URL: http://localhost:8080/customer/settings.html');
            
            // Run all tests
            await this.testFormValidationSetup();
            await this.testEmailValidation();
            await this.testRequiredFieldValidation();
            await this.testPhoneValidation();
            await this.testPasswordValidation();
            await this.testZipCodeValidation();
            await this.testRealTimeValidation();
            await this.testAccessibilityFeatures();
            
            // Generate final report
            const report = await this.generateReport();
            
            return report;
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            return {
                totalTests: 0,
                passedTests: 0,
                successRate: 0,
                error: error.message
            };
        } finally {
            await this.cleanup();
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new FormValidationTester();
    tester.runAllTests().then(report => {
        console.log('\n🏁 Form Validation Test Suite Complete!');
        process.exit(report.successRate === 100 ? 0 : 1);
    }).catch(error => {
        console.error('❌ Test suite error:', error);
        process.exit(1);
    });
}

module.exports = FormValidationTester;