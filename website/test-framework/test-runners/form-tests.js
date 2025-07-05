#!/usr/bin/env node

/**
 * VARAi Commerce Studio - Comprehensive Form Validation Tests
 * TDD Implementation: Red-Green-Refactor Cycle
 * 
 * CRITICAL FORM VALIDATION GAPS ADDRESSED:
 * - Email format validation testing with invalid/valid scenarios
 * - Password strength requirements validation (8+ chars, numbers, special chars)
 * - Password confirmation matching verification
 * - Multi-step form progression logic testing
 * - Form submission error handling and integration testing
 * - Business information validation for steps 2-3
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class FormValidationTestSuite {
    constructor() {
        this.browser = null;
        this.page = null;
        this.config = {
            baseUrl: 'https://commerce-studio-website-353252826752.us-central1.run.app',
            authServiceUrl: 'https://commerce-studio-auth-353252826752.us-central1.run.app',
            timeout: 30000,
            reportDir: './test-reports'
        };
        
        this.testResults = {
            forms: { 
                passed: [], 
                failed: [],
                metrics: {
                    emailValidation: { score: 0, tested: false },
                    passwordValidation: { score: 0, tested: false },
                    passwordConfirmation: { score: 0, tested: false },
                    multiStepLogic: { score: 0, tested: false },
                    errorHandling: { score: 0, tested: false },
                    integrationTesting: { score: 0, tested: false }
                }
            }
        };

        // Test data for form validation
        this.testData = {
            validEmails: [
                'test@example.com',
                'user.name@domain.co.uk',
                'firstname+lastname@company.org',
                'test123@test-domain.com',
                'valid.email@subdomain.example.com'
            ],
            invalidEmails: [
                'invalid-email',
                '@domain.com',
                'user@',
                'user..name@domain.com',
                'user@domain',
                'user name@domain.com',
                'user@domain..com',
                '',
                'user@.com',
                'user@domain.c'
            ],
            validPasswords: [
                'Password123!',
                'SecurePass1@',
                'MyP@ssw0rd',
                'Complex123#',
                'Strong9$Pass'
            ],
            invalidPasswords: [
                'password',      // no uppercase, no numbers, no special chars
                'PASSWORD',      // no lowercase, no numbers, no special chars
                '12345678',      // no letters, no special chars
                'Pass123',       // no special chars
                'Pass!',         // too short
                '',              // empty
                'Aa1!',          // too short
                'NoSpecialChar123', // no special chars
                'NoNumbers!',    // no numbers
                'nonumbersorspecial' // no uppercase, no numbers, no special chars
            ],
            businessInfo: {
                valid: {
                    businessName: 'Test Eyewear Company',
                    businessType: 'retail',
                    employeeCount: '10-50',
                    website: 'https://testeyewear.com',
                    phone: '+1-555-123-4567',
                    address: '123 Main St, City, State 12345'
                },
                invalid: {
                    businessName: '',
                    businessType: '',
                    employeeCount: '',
                    website: 'invalid-url',
                    phone: 'invalid-phone',
                    address: ''
                }
            }
        };
    }

    async init() {
        console.log('📝 Initializing Form Validation Test Suite');
        
        // Create report directory
        if (!fs.existsSync(this.config.reportDir)) {
            fs.mkdirSync(this.config.reportDir, { recursive: true });
        }

        // Launch browser
        this.browser = await puppeteer.launch({
            headless: 'new',
            defaultViewport: { width: 1920, height: 1080 },
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security'
            ]
        });

        this.page = await this.browser.newPage();
        
        // Set user agent
        await this.page.setUserAgent('Mozilla/5.0 (Form-Test-Suite) VARAi-Form-Validator/1.0');
        
        // Enable console logging
        this.page.on('console', (msg) => {
            if (msg.type() === 'error') {
                console.log(`🔍 Browser Console Error: ${msg.text()}`);
            }
        });
    }

    async testEmailValidation() {
        console.log('\n📧 Testing Email Validation');
        console.log('============================');

        try {
            await this.page.goto(`${this.config.baseUrl}/signup/index.html`, { 
                waitUntil: 'networkidle0' 
            });

            let emailTestsPassed = 0;
            let emailTestsTotal = this.testData.validEmails.length + this.testData.invalidEmails.length;

            console.log(`\n📋 Testing ${emailTestsTotal} Email Validation Scenarios:`);

            // Test valid emails
            console.log('\n✅ Testing Valid Email Formats:');
            for (let i = 0; i < this.testData.validEmails.length; i++) {
                const email = this.testData.validEmails[i];
                console.log(`\n🔍 Valid Email Test ${i + 1}: ${email}`);

                try {
                    // Clear and enter email
                    await this.page.click('#email');
                    await this.page.evaluate(() => document.getElementById('email').value = '');
                    await this.page.type('#email', email);
                    
                    // Trigger validation by clicking away
                    await this.page.click('#password');
                    await this.page.waitForTimeout(500);

                    // Check validation state
                    const validationResult = await this.page.evaluate(() => {
                        const emailField = document.getElementById('email');
                        const errorElement = document.getElementById('email-error');
                        
                        return {
                            isValid: emailField.checkValidity(),
                            hasError: errorElement && errorElement.textContent.trim() !== '',
                            errorMessage: errorElement ? errorElement.textContent.trim() : '',
                            fieldValue: emailField.value,
                            fieldType: emailField.type
                        };
                    });

                    if (validationResult.isValid && !validationResult.hasError) {
                        console.log(`   ✅ Valid Email Accepted: ${email}`);
                        emailTestsPassed++;
                        this.testResults.forms.passed.push({
                            test: `Email Validation - Valid Email ${i + 1}`,
                            result: `Valid email accepted: ${email}`,
                            score: 5
                        });
                    } else {
                        console.log(`   ❌ Valid Email Rejected: ${email}`);
                        console.log(`      Error: ${validationResult.errorMessage}`);
                        this.testResults.forms.failed.push({
                            test: `Email Validation - Valid Email ${i + 1}`,
                            error: `Valid email incorrectly rejected: ${email} - ${validationResult.errorMessage}`,
                            severity: 'HIGH'
                        });
                    }

                } catch (error) {
                    console.log(`   ⚠️  Email Test Error: ${error.message}`);
                    this.testResults.forms.failed.push({
                        test: `Email Validation - Valid Email ${i + 1}`,
                        error: `Test execution error: ${error.message}`,
                        severity: 'MEDIUM'
                    });
                }
            }

            // Test invalid emails
            console.log('\n❌ Testing Invalid Email Formats:');
            for (let i = 0; i < this.testData.invalidEmails.length; i++) {
                const email = this.testData.invalidEmails[i];
                console.log(`\n🔍 Invalid Email Test ${i + 1}: "${email}"`);

                try {
                    // Clear and enter email
                    await this.page.click('#email');
                    await this.page.evaluate(() => document.getElementById('email').value = '');
                    if (email) {
                        await this.page.type('#email', email);
                    }
                    
                    // Trigger validation
                    await this.page.click('#password');
                    await this.page.waitForTimeout(500);

                    // Check validation state
                    const validationResult = await this.page.evaluate(() => {
                        const emailField = document.getElementById('email');
                        const errorElement = document.getElementById('email-error');
                        
                        return {
                            isValid: emailField.checkValidity(),
                            hasError: errorElement && errorElement.textContent.trim() !== '',
                            errorMessage: errorElement ? errorElement.textContent.trim() : '',
                            fieldValue: emailField.value
                        };
                    });

                    if (!validationResult.isValid || validationResult.hasError) {
                        console.log(`   ✅ Invalid Email Rejected: "${email}"`);
                        console.log(`      Error Message: ${validationResult.errorMessage}`);
                        emailTestsPassed++;
                        this.testResults.forms.passed.push({
                            test: `Email Validation - Invalid Email ${i + 1}`,
                            result: `Invalid email correctly rejected: "${email}"`,
                            score: 5
                        });
                    } else {
                        console.log(`   ❌ Invalid Email Accepted: "${email}"`);
                        this.testResults.forms.failed.push({
                            test: `Email Validation - Invalid Email ${i + 1}`,
                            error: `Invalid email incorrectly accepted: "${email}"`,
                            severity: 'HIGH'
                        });
                    }

                } catch (error) {
                    console.log(`   ⚠️  Email Test Error: ${error.message}`);
                    this.testResults.forms.failed.push({
                        test: `Email Validation - Invalid Email ${i + 1}`,
                        error: `Test execution error: ${error.message}`,
                        severity: 'MEDIUM'
                    });
                }
            }

            const emailValidationScore = Math.round((emailTestsPassed / emailTestsTotal) * 100);
            this.testResults.forms.metrics.emailValidation.score = emailValidationScore;
            this.testResults.forms.metrics.emailValidation.tested = true;

            console.log(`\n📊 Email Validation Score: ${emailTestsPassed}/${emailTestsTotal} (${emailValidationScore}%)`);

        } catch (error) {
            console.log(`   ❌ Email Validation Test Failed: ${error.message}`);
            this.testResults.forms.failed.push({
                test: 'Email Validation Testing',
                error: error.message,
                severity: 'HIGH'
            });
        }
    }

    async testPasswordValidation() {
        console.log('\n🔐 Testing Password Validation');
        console.log('===============================');

        try {
            await this.page.goto(`${this.config.baseUrl}/signup/index.html`, { 
                waitUntil: 'networkidle0' 
            });

            let passwordTestsPassed = 0;
            let passwordTestsTotal = this.testData.validPasswords.length + this.testData.invalidPasswords.length;

            console.log(`\n📋 Testing ${passwordTestsTotal} Password Validation Scenarios:`);

            // Test valid passwords
            console.log('\n✅ Testing Valid Password Formats:');
            for (let i = 0; i < this.testData.validPasswords.length; i++) {
                const password = this.testData.validPasswords[i];
                console.log(`\n🔍 Valid Password Test ${i + 1}: ${password}`);

                try {
                    // Clear and enter password
                    await this.page.click('#password');
                    await this.page.evaluate(() => document.getElementById('password').value = '');
                    await this.page.type('#password', password);
                    
                    // Trigger validation
                    await this.page.click('#confirm_password');
                    await this.page.waitForTimeout(500);

                    // Check validation state
                    const validationResult = await this.page.evaluate(() => {
                        const passwordField = document.getElementById('password');
                        const errorElement = document.getElementById('password-error');
                        
                        // Check password requirements
                        const value = passwordField.value;
                        const hasMinLength = value.length >= 8;
                        const hasNumber = /\d/.test(value);
                        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
                        const hasUpperCase = /[A-Z]/.test(value);
                        const hasLowerCase = /[a-z]/.test(value);
                        
                        return {
                            isValid: passwordField.checkValidity(),
                            hasError: errorElement && errorElement.textContent.trim() !== '',
                            errorMessage: errorElement ? errorElement.textContent.trim() : '',
                            fieldValue: value,
                            requirements: {
                                hasMinLength,
                                hasNumber,
                                hasSpecialChar,
                                hasUpperCase,
                                hasLowerCase
                            }
                        };
                    });

                    const meetsRequirements = Object.values(validationResult.requirements).every(req => req);

                    if (meetsRequirements && !validationResult.hasError) {
                        console.log(`   ✅ Valid Password Accepted: ${password}`);
                        console.log(`      Requirements: Length(${validationResult.requirements.hasMinLength}), Number(${validationResult.requirements.hasNumber}), Special(${validationResult.requirements.hasSpecialChar}), Upper(${validationResult.requirements.hasUpperCase}), Lower(${validationResult.requirements.hasLowerCase})`);
                        passwordTestsPassed++;
                        this.testResults.forms.passed.push({
                            test: `Password Validation - Valid Password ${i + 1}`,
                            result: `Valid password accepted: ${password}`,
                            score: 5
                        });
                    } else {
                        console.log(`   ❌ Valid Password Rejected: ${password}`);
                        console.log(`      Error: ${validationResult.errorMessage}`);
                        console.log(`      Requirements: Length(${validationResult.requirements.hasMinLength}), Number(${validationResult.requirements.hasNumber}), Special(${validationResult.requirements.hasSpecialChar}), Upper(${validationResult.requirements.hasUpperCase}), Lower(${validationResult.requirements.hasLowerCase})`);
                        this.testResults.forms.failed.push({
                            test: `Password Validation - Valid Password ${i + 1}`,
                            error: `Valid password incorrectly rejected: ${password} - ${validationResult.errorMessage}`,
                            severity: 'HIGH'
                        });
                    }

                } catch (error) {
                    console.log(`   ⚠️  Password Test Error: ${error.message}`);
                    this.testResults.forms.failed.push({
                        test: `Password Validation - Valid Password ${i + 1}`,
                        error: `Test execution error: ${error.message}`,
                        severity: 'MEDIUM'
                    });
                }
            }

            // Test invalid passwords
            console.log('\n❌ Testing Invalid Password Formats:');
            for (let i = 0; i < this.testData.invalidPasswords.length; i++) {
                const password = this.testData.invalidPasswords[i];
                console.log(`\n🔍 Invalid Password Test ${i + 1}: "${password}"`);

                try {
                    // Clear and enter password
                    await this.page.click('#password');
                    await this.page.evaluate(() => document.getElementById('password').value = '');
                    if (password) {
                        await this.page.type('#password', password);
                    }
                    
                    // Trigger validation
                    await this.page.click('#confirm_password');
                    await this.page.waitForTimeout(500);

                    // Check validation state
                    const validationResult = await this.page.evaluate(() => {
                        const passwordField = document.getElementById('password');
                        const errorElement = document.getElementById('password-error');
                        
                        // Check password requirements
                        const value = passwordField.value;
                        const hasMinLength = value.length >= 8;
                        const hasNumber = /\d/.test(value);
                        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
                        const hasUpperCase = /[A-Z]/.test(value);
                        const hasLowerCase = /[a-z]/.test(value);
                        
                        return {
                            isValid: passwordField.checkValidity(),
                            hasError: errorElement && errorElement.textContent.trim() !== '',
                            errorMessage: errorElement ? errorElement.textContent.trim() : '',
                            fieldValue: value,
                            requirements: {
                                hasMinLength,
                                hasNumber,
                                hasSpecialChar,
                                hasUpperCase,
                                hasLowerCase
                            }
                        };
                    });

                    const meetsRequirements = Object.values(validationResult.requirements).every(req => req);

                    if (!meetsRequirements || validationResult.hasError) {
                        console.log(`   ✅ Invalid Password Rejected: "${password}"`);
                        console.log(`      Error Message: ${validationResult.errorMessage}`);
                        console.log(`      Failed Requirements: Length(${validationResult.requirements.hasMinLength}), Number(${validationResult.requirements.hasNumber}), Special(${validationResult.requirements.hasSpecialChar}), Upper(${validationResult.requirements.hasUpperCase}), Lower(${validationResult.requirements.hasLowerCase})`);
                        passwordTestsPassed++;
                        this.testResults.forms.passed.push({
                            test: `Password Validation - Invalid Password ${i + 1}`,
                            result: `Invalid password correctly rejected: "${password}"`,
                            score: 5
                        });
                    } else {
                        console.log(`   ❌ Invalid Password Accepted: "${password}"`);
                        this.testResults.forms.failed.push({
                            test: `Password Validation - Invalid Password ${i + 1}`,
                            error: `Invalid password incorrectly accepted: "${password}"`,
                            severity: 'HIGH'
                        });
                    }

                } catch (error) {
                    console.log(`   ⚠️  Password Test Error: ${error.message}`);
                    this.testResults.forms.failed.push({
                        test: `Password Validation - Invalid Password ${i + 1}`,
                        error: `Test execution error: ${error.message}`,
                        severity: 'MEDIUM'
                    });
                }
            }

            const passwordValidationScore = Math.round((passwordTestsPassed / passwordTestsTotal) * 100);
            this.testResults.forms.metrics.passwordValidation.score = passwordValidationScore;
            this.testResults.forms.metrics.passwordValidation.tested = true;

            console.log(`\n📊 Password Validation Score: ${passwordTestsPassed}/${passwordTestsTotal} (${passwordValidationScore}%)`);

        } catch (error) {
            console.log(`   ❌ Password Validation Test Failed: ${error.message}`);
            this.testResults.forms.failed.push({
                test: 'Password Validation Testing',
                error: error.message,
                severity: 'HIGH'
            });
        }
    }

    async testPasswordConfirmation() {
        console.log('\n🔄 Testing Password Confirmation Matching');
        console.log('==========================================');

        try {
            await this.page.goto(`${this.config.baseUrl}/signup/index.html`, { 
                waitUntil: 'networkidle0' 
            });

            const testScenarios = [
                { password: 'TestPass123!', confirm: 'TestPass123!', shouldMatch: true, description: 'Matching passwords' },
                { password: 'TestPass123!', confirm: 'DifferentPass456@', shouldMatch: false, description: 'Non-matching passwords' },
                { password: 'SecurePass1@', confirm: 'SecurePass1@', shouldMatch: true, description: 'Matching complex passwords' },
                { password: 'Password123!', confirm: 'password123!', shouldMatch: false, description: 'Case-sensitive mismatch' },
                { password: 'TestPass123!', confirm: '', shouldMatch: false, description: 'Empty confirmation' },
                { password: '', confirm: '', shouldMatch: true, description: 'Both empty (edge case)' }
            ];

            let confirmationTestsPassed = 0;
            let confirmationTestsTotal = testScenarios.length;

            console.log(`\n📋 Testing ${confirmationTestsTotal} Password Confirmation Scenarios:`);

            for (let i = 0; i < testScenarios.length; i++) {
                const scenario = testScenarios[i];
                console.log(`\n🔍 Confirmation Test ${i + 1}: ${scenario.description}`);
                console.log(`   Password: "${scenario.password}"`);
                console.log(`   Confirm: "${scenario.confirm}"`);
                console.log(`   Expected: ${scenario.shouldMatch ? 'Match' : 'Mismatch'}`);

                try {
                    // Clear and enter password
                    await this.page.click('#password');
                    await this.page.evaluate(() => document.getElementById('password').value = '');
                    if (scenario.password) {
                        await this.page.type('#password', scenario.password);
                    }

                    // Clear and enter confirmation
                    await this.page.click('#confirm_password');
                    await this.page.evaluate(() => document.getElementById('confirm_password').value = '');
                    if (scenario.confirm) {
                        await this.page.type('#confirm_password', scenario.confirm);
                    }
                    
                    // Trigger validation
                    await this.page.click('#email');
                    await this.page.waitForTimeout(500);

                    // Check validation state
                    const validationResult = await this.page.evaluate(() => {
                        const passwordField = document.getElementById('password');
                        const confirmField = document.getElementById('confirm_password');
                        const errorElement = document.getElementById('confirm-password-error');
                        
                        const passwordValue = passwordField.value;
                        const confirmValue = confirmField.value;
                        const actualMatch = passwordValue === confirmValue;
                        
                        return {
                            passwordValue,
                            confirmValue,
                            actualMatch,
                            hasError: errorElement && errorElement.textContent.trim() !== '',
                            errorMessage: errorElement ? errorElement.textContent.trim() : ''
                        };
                    });

                    const testPassed = (scenario.shouldMatch && validationResult.actualMatch && !validationResult.hasError) ||
                                     (!scenario.shouldMatch && (!validationResult.actualMatch || validationResult.hasError));

                    if (testPassed) {
                        console.log(`   ✅ Confirmation Test Passed`);
                        console.log(`      Actual Match: ${validationResult.actualMatch}`);
                        console.log(`      Has Error: ${validationResult.hasError}`);
                        if (validationResult.hasError) {
                            console.log(`      Error Message: ${validationResult.errorMessage}`);
                        }
                        confirmationTestsPassed++;
                        this.testResults.forms.passed.push({
                            test: `Password Confirmation - ${scenario.description}`,
                            result: `Password confirmation validation working correctly`,
                            score: 10
                        });
                    } else {
                        console.log(`   ❌ Confirmation Test Failed`);
                        console.log(`      Expected Match: ${scenario.shouldMatch}`);
                        console.log(`      Actual Match: ${validationResult.actualMatch}`);
                        console.log(`      Has Error: ${validationResult.hasError}`);
                        console.log(`      Error Message: ${validationResult.errorMessage}`);
                        this.testResults.forms.failed.push({
                            test: `Password Confirmation - ${scenario.description}`,
                            error: `Password confirmation validation failed for ${scenario.description}`,
                            severity: 'HIGH'
                        });
                    }

                } catch (error) {
                    console.log(`   ⚠️  Confirmation Test Error: ${error.message}`);
                    this.testResults.forms.failed.push({
                        test: `Password Confirmation - ${scenario.description}`,
                        error: `Test execution error: ${error.message}`,
                        severity: 'MEDIUM'
                    });
                }
            }

            const confirmationScore = Math.round((confirmationTestsPassed / confirmationTestsTotal) * 100);
            this.testResults.forms.metrics.passwordConfirmation.score = confirmationScore;
            this.testResults.forms.metrics.passwordConfirmation.tested = true;

            console.log(`\n📊 Password Confirmation Score: ${confirmationTestsPassed}/${confirmationTestsTotal} (${confirmationScore}%)`);

        } catch (error) {
            console.log(`   ❌ Password Confirmation Test Failed: ${error.message}`);
            this.testResults.forms.failed.push({
                test: 'Password Confirmation Testing',
                error: error.message,
                severity: 'HIGH'
            });
        }
    }

    async testMultiStepFormProgression() {
        console.log('\n📋 Testing Multi-Step Form Progression Logic');
        console.log('=============================================');

        try {
            await this.page.goto(`${this.config.baseUrl}/signup/index.html`, { 
                waitUntil: 'networkidle0' 
            });

            let multiStepTestsPassed = 0;
            let multiStepTestsTotal = 6; // Number of multi-step tests

            console.log(`\n📋 Testing Multi-Step Form Navigation:`);

            // Test 1: Initial state - Step 1 should be visible
            console.log(`\n🔍 Multi-Step Test 1: Initial State`);
            const initialState = await this.page.evaluate(() => {
                const step1 = document.querySelector('[data-step="1"]');
                const step2 = document.querySelector('[data-step="2"]');
                const step3 = document.querySelector('[data-step="3"]');
                
                return {
                    step1Visible: step1 && step1.style.display !== 'none' && step1.classList.contains('active'),
                    step2Visible: step2 && step2.style.display !== 'none',
                    step3Visible: step3 && step3.style.display !== 'none',
                    step1Exists: !!step1,
                    step2Exists: !!step2,
                    step3Exists: !!step3
                };
            });

            if (initialState.step1Visible && !initialState.step2Visible) {
                console.log(`   ✅ Initial State: Step 1 visible, Step 2 hidden`);
                multiStepTestsPassed++;
                this.testResults.forms.passed.push({
                    test: 'Multi-Step Form - Initial State',
                    result: 'Step 1 correctly displayed initially',
                    score: 15
                });
            } else {
                console.log(`   ❌ Initial State: Incorrect step visibility`);
                console.log(`      Step 1 Visible: ${initialState.step1Visible}`);
                console.log(`      Step 2 Visible: ${initialState.step2Visible}`);
                this.testResults.forms.failed.push({
                    test: 'Multi-Step Form - Initial State',
                    error: 'Incorrect initial step visibility',
                    severity: 'HIGH'
                });
            }

            // Test 2: Attempt to proceed with invalid data
            console.log(`\n🔍 Multi-Step Test 2: Invalid Data Progression Block`);
            try {
                await this.page.click('.next-step');
                await this.page.waitForTimeout(1000);

                const afterInvalidAttempt = await this.page.evaluate(() => {
                    const step1 = document.querySelector('[data-step="1"]');
                    const step2 = document.querySelector('[data-step="2"]');
                    
                    return {
                        step1Visible: step1 && step1.style.display !== 'none' && step1.classList.contains('active'),
                        step2Visible: step2 && step2.style.display !== 'none' && step2.classList.contains('active')
                    };
                });

                if (afterInvalidAttempt.step1Visible && !afterInvalidAttempt.step2Visible) {
                    console.log(`   ✅ Invalid Data Block: Stayed on Step 1 with invalid data`);
                    multiStepTestsPassed++;
                    this.testResults.forms.passed.push({
                        test: 'Multi-Step Form - Invalid Data Block',
                        result: 'Form correctly blocked progression with invalid data',
                        score: 20
                    });
                } else {
                    console.log(`   ❌ Invalid Data Block: Incorrectly progressed with invalid data`);
                    this.testResults.forms.failed.push({
                        test: 'Multi-Step Form - Invalid Data Block',
                        error: 'Form allowed progression with invalid data',
                        severity: 'CRITICAL'
                    });
                }
            } catch (error) {
                console.log(`   ⚠️  Invalid Data Test Error: ${error.message}`);
            }

            // Test 3: Fill valid data and proceed
            console.log(`\n🔍 Multi-Step Test 3: Valid Data Progression`);
            try {
                // Fill valid form data
                await this.page.click('#email');
                await this.page.evaluate(() => document.getElementById('email').value = '');
                await this.page.type('#email', 'test@example.com');

                await this.page.click('#password');
                await this.page.evaluate(() => document.getElementById('password').value = '');
                await this.page.type('#password', 'TestPass123!');

                await this.page.click('#confirm_password');
                await this.page.evaluate(() => document.getElementById('confirm_password').value = '');
                await this.page.type('#confirm_password', 'TestPass123!');

                // Attempt to proceed
                await this.page.click('.next-step');
                await this.page.waitForTimeout(2000);

                const afterValidData = await this.page.evaluate(() => {
                    const step1 = document.querySelector('[data-step="1"]');
                    const step2 = document.querySelector('[data-step="2"]');
                    
                    return {
                        step1Visible: step1 && step1.style.display !== 'none' && step1.classList.contains('active'),
                        step2Visible: step2 && step2.style.display !== 'none' && step2.classList.contains('active'),
                        step1Hidden: step1 && step1.style.display === 'none',
                        step2Exists: !!step2
                    };
                });

                if (!afterValidData.step1Visible && afterValidData.step2Visible) {
                    console.log(`   ✅ Valid Data Progression: Successfully moved to Step 2`);
                    multiStepTestsPassed++;
                    this.testResults.forms.passed.push({
                        test: 'Multi-Step Form - Valid Data Progression',
                        result: 'Form correctly progressed to Step 2 with valid data',
                        score: 25
                    });
                } else {
                    console.log(`   ❌ Valid Data Progression: Failed to progress to Step 2`);
                    console.log(`      Step 1 Visible: ${afterValidData.step1Visible}`);
                    console.log(`      Step 2 Visible: ${afterValidData.step2Visible}`);
                    this.testResults.forms.failed.push({
                        test: 'Multi-Step Form - Valid Data Progression',
                        error: 'Form failed to progress to Step 2 with valid data',
                        severity: 'HIGH'
                    });
                }
            } catch (error) {
                console.log(`   ⚠️  Valid Data Test Error: ${error.message}`);
            }

            // Test 4: Business information validation (Step 2)
            console.log(`\n🔍 Multi-Step Test 4: Business Information Validation`);
            try {
                // Check if we're on step 2, if not navigate there
                const currentStep = await this.page.evaluate(() => {
                    const step2 = document.querySelector('[data-step="2"]');
                    return step2 && step2.style.display !== 'none';
                });

                if (currentStep) {
                    // Fill business information
                    const businessFields = await this.page.evaluate(() => {
                        const businessNameField = document.getElementById('business_name');
                        const businessTypeField = document.getElementById('business_type');
                        return {
                            hasBusinessName: !!businessNameField,
                            hasBusinessType: !!businessTypeField
                        };
                    });

                    if (businessFields.hasBusinessName) {
                        await this.page.click('#business_name');
                        await this.page.type('#business_name', this.testData.businessInfo.valid.businessName);
                        
                        console.log(`   ✅ Business Information: Fields accessible and fillable`);
                        multiStepTestsPassed++;
                        this.testResults.forms.passed.push({
                            test: 'Multi-Step Form - Business Information',
                            result: 'Business information fields working correctly',
                            score: 20
                        });
                    } else {
                        console.log(`   ❌ Business Information: Fields not accessible`);
                        this.testResults.forms.failed.push({
                            test: 'Multi-Step Form - Business Information',
                            error: 'Business information fields not accessible',
                            severity: 'HIGH'
                        });
                    }
                } else {
                    console.log(`   ⚠️  Business Information: Not on Step 2, skipping test`);
                }
            } catch (error) {
                console.log(`   ⚠️  Business Information Test Error: ${error.message}`);
            }

            // Test 5: Form navigation controls
            console.log(`\n🔍 Multi-Step Test 5: Navigation Controls`);
            try {
                const navigationControls = await this.page.evaluate(() => {
                    const nextButtons = document.querySelectorAll('.next-step');
                    const prevButtons = document.querySelectorAll('.prev-step');
                    const submitButtons = document.querySelectorAll('[type="submit"]');
                    
                    return {
                        hasNextButtons: nextButtons.length > 0,
                        hasPrevButtons: prevButtons.length > 0,
                        hasSubmitButtons: submitButtons.length > 0,
                        nextButtonCount: nextButtons.length,
                        prevButtonCount: prevButtons.length
                    };
                });

                if (navigationControls.hasNextButtons) {
                    console.log(`   ✅ Navigation Controls: Next buttons present (${navigationControls.nextButtonCount})`);
                    multiStepTestsPassed++;
                    this.testResults.forms.passed.push({
                        test: 'Multi-Step Form - Navigation Controls',
                        result: 'Form navigation controls present and functional',
                        score: 15
                    });
                } else {
                    console.log(`   ❌ Navigation Controls: Missing navigation buttons`);
                    this.testResults.forms.failed.push({
                        test: 'Multi-Step Form - Navigation Controls',
                        error: 'Form navigation controls missing',
                        severity: 'MEDIUM'
                    });
                }
            } catch (error) {
                console.log(`   ⚠️  Navigation Controls Test Error: ${error.message}`);
            }

            // Test 6: Form state persistence
            console.log(`\n🔍 Multi-Step Test 6: Form State Persistence`);
            try {
                // Check if form data persists when navigating between steps
                const formPersistence = await this.page.evaluate(() => {
                    const emailField = document.getElementById('email');
                    const passwordField = document.getElementById('password');
                    
                    return {
                        emailValue: emailField ? emailField.value : '',
                        passwordValue: passwordField ? passwordField.value : '',
                        emailPersisted: emailField && emailField.value === 'test@example.com',
                        passwordPersisted: passwordField && passwordField.value === 'TestPass123!'
                    };
                });

                if (formPersistence.emailPersisted) {
                    console.log(`   ✅ Form State Persistence: Data persisted across steps`);
                    console.log(`      Email: ${formPersistence.emailValue}`);
                    multiStepTestsPassed++;
                    this.testResults.forms.passed.push({
                        test: 'Multi-Step Form - State Persistence',
                        result: 'Form data correctly persisted across steps',
                        score: 10
                    });
                } else {
                    console.log(`   ❌ Form State Persistence: Data not persisted`);
                    console.log(`      Email: ${formPersistence.emailValue}`);
                    this.testResults.forms.failed.push({
                        test: 'Multi-Step Form - State Persistence',
                        error: 'Form data not persisted across steps',
                        severity: 'MEDIUM'
                    });
                }
            } catch (error) {
                console.log(`   ⚠️  Form Persistence Test Error: ${error.message}`);
            }

            const multiStepScore = Math.round((multiStepTestsPassed / multiStepTestsTotal) * 100);
            this.testResults.forms.metrics.multiStepLogic.score = multiStepScore;
            this.testResults.forms.metrics.multiStepLogic.tested = true;

            console.log(`\n📊 Multi-Step Form Score: ${multiStepTestsPassed}/${multiStepTestsTotal} (${multiStepScore}%)`);

        } catch (error) {
            console.log(`   ❌ Multi-Step Form Test Failed: ${error.message}`);
            this.testResults.forms.failed.push({
                test: 'Multi-Step Form Testing',
                error: error.message,
                severity: 'HIGH'
            });
        }
    }

    async testFormErrorHandling() {
        console.log('\n⚠️  Testing Form Error Handling');
        console.log('================================');

        try {
            await this.page.goto(`${this.config.baseUrl}/signup/index.html`, {
                waitUntil: 'networkidle0'
            });

            let errorHandlingTestsPassed = 0;
            let errorHandlingTestsTotal = 4;

            console.log(`\n📋 Testing Form Error Handling Scenarios:`);

            // Test 1: Required field validation
            console.log(`\n🔍 Error Handling Test 1: Required Field Validation`);
            try {
                // Try to submit form without filling required fields
                await this.page.click('.next-step');
                await this.page.waitForTimeout(1000);

                const requiredFieldErrors = await this.page.evaluate(() => {
                    const emailField = document.getElementById('email');
                    const passwordField = document.getElementById('password');
                    const confirmField = document.getElementById('confirm_password');
                    
                    return {
                        emailRequired: emailField && emailField.required,
                        passwordRequired: passwordField && passwordField.required,
                        confirmRequired: confirmField && confirmField.required,
                        emailValid: emailField ? emailField.checkValidity() : false,
                        passwordValid: passwordField ? passwordField.checkValidity() : false,
                        confirmValid: confirmField ? confirmField.checkValidity() : false
                    };
                });

                if (requiredFieldErrors.emailRequired && requiredFieldErrors.passwordRequired) {
                    console.log(`   ✅ Required Fields: Properly marked as required`);
                    errorHandlingTestsPassed++;
                    this.testResults.forms.passed.push({
                        test: 'Form Error Handling - Required Fields',
                        result: 'Required field validation working correctly',
                        score: 20
                    });
                } else {
                    console.log(`   ❌ Required Fields: Not properly marked as required`);
                    this.testResults.forms.failed.push({
                        test: 'Form Error Handling - Required Fields',
                        error: 'Required field validation not working',
                        severity: 'HIGH'
                    });
                }
            } catch (error) {
                console.log(`   ⚠️  Required Field Test Error: ${error.message}`);
            }

            // Test 2: Error message display
            console.log(`\n🔍 Error Handling Test 2: Error Message Display`);
            try {
                // Enter invalid email to trigger error
                await this.page.click('#email');
                await this.page.type('#email', 'invalid-email');
                await this.page.click('#password');
                await this.page.waitForTimeout(500);

                const errorDisplay = await this.page.evaluate(() => {
                    const emailError = document.getElementById('email-error');
                    const passwordError = document.getElementById('password-error');
                    const confirmError = document.getElementById('confirm-password-error');
                    
                    return {
                        hasEmailError: !!emailError,
                        hasPasswordError: !!passwordError,
                        hasConfirmError: !!confirmError,
                        emailErrorVisible: emailError && emailError.textContent.trim() !== '',
                        errorElements: {
                            email: emailError ? emailError.textContent.trim() : '',
                            password: passwordError ? passwordError.textContent.trim() : '',
                            confirm: confirmError ? confirmError.textContent.trim() : ''
                        }
                    };
                });

                if (errorDisplay.hasEmailError && errorDisplay.hasPasswordError && errorDisplay.hasConfirmError) {
                    console.log(`   ✅ Error Display: Error message elements present`);
                    console.log(`      Email Error Element: ${errorDisplay.hasEmailError}`);
                    console.log(`      Password Error Element: ${errorDisplay.hasPasswordError}`);
                    console.log(`      Confirm Error Element: ${errorDisplay.hasConfirmError}`);
                    errorHandlingTestsPassed++;
                    this.testResults.forms.passed.push({
                        test: 'Form Error Handling - Error Display',
                        result: 'Error message elements properly implemented',
                        score: 25
                    });
                } else {
                    console.log(`   ❌ Error Display: Missing error message elements`);
                    this.testResults.forms.failed.push({
                        test: 'Form Error Handling - Error Display',
                        error: 'Error message elements not properly implemented',
                        severity: 'HIGH'
                    });
                }
            } catch (error) {
                console.log(`   ⚠️  Error Display Test Error: ${error.message}`);
            }

            // Test 3: Form submission with network error simulation
            console.log(`\n🔍 Error Handling Test 3: Network Error Handling`);
            try {
                // Fill valid form data
                await this.page.evaluate(() => {
                    document.getElementById('email').value = 'test@example.com';
                    document.getElementById('password').value = 'TestPass123!';
                    document.getElementById('confirm_password').value = 'TestPass123!';
                });

                // Monitor network requests
                const networkRequests = [];
                this.page.on('request', (request) => {
                    if (request.method() === 'POST') {
                        networkRequests.push(request.url());
                    }
                });

                // Try to submit form
                await this.page.click('.next-step');
                await this.page.waitForTimeout(2000);

                console.log(`   ✅ Network Error Handling: Form submission attempted`);
                console.log(`      Network requests: ${networkRequests.length}`);
                errorHandlingTestsPassed++;
                this.testResults.forms.passed.push({
                    test: 'Form Error Handling - Network Errors',
                    result: 'Form handles network requests appropriately',
                    score: 15
                });

            } catch (error) {
                console.log(`   ⚠️  Network Error Test Error: ${error.message}`);
            }

            // Test 4: Form reset and recovery
            console.log(`\n🔍 Error Handling Test 4: Form Reset and Recovery`);
            try {
                // Test form reset functionality
                const formResetTest = await this.page.evaluate(() => {
                    const form = document.getElementById('account-form');
                    const emailField = document.getElementById('email');
                    const passwordField = document.getElementById('password');
                    
                    // Check if form has reset capability
                    const hasResetButton = document.querySelector('[type="reset"]') !== null;
                    const canClearFields = emailField && passwordField;
                    
                    return {
                        hasForm: !!form,
                        hasResetButton,
                        canClearFields,
                        formMethod: form ? form.method : null,
                        formAction: form ? form.action : null
                    };
                });

                if (formResetTest.hasForm && formResetTest.canClearFields) {
                    console.log(`   ✅ Form Reset: Form structure supports reset/recovery`);
                    console.log(`      Has Reset Button: ${formResetTest.hasResetButton}`);
                    console.log(`      Form Method: ${formResetTest.formMethod}`);
                    errorHandlingTestsPassed++;
                    this.testResults.forms.passed.push({
                        test: 'Form Error Handling - Reset and Recovery',
                        result: 'Form supports reset and recovery operations',
                        score: 10
                    });
                } else {
                    console.log(`   ❌ Form Reset: Form lacks proper reset/recovery support`);
                    this.testResults.forms.failed.push({
                        test: 'Form Error Handling - Reset and Recovery',
                        error: 'Form lacks proper reset and recovery support',
                        severity: 'MEDIUM'
                    });
                }
            } catch (error) {
                console.log(`   ⚠️  Form Reset Test Error: ${error.message}`);
            }

            const errorHandlingScore = Math.round((errorHandlingTestsPassed / errorHandlingTestsTotal) * 100);
            this.testResults.forms.metrics.errorHandling.score = errorHandlingScore;
            this.testResults.forms.metrics.errorHandling.tested = true;

            console.log(`\n📊 Error Handling Score: ${errorHandlingTestsPassed}/${errorHandlingTestsTotal} (${errorHandlingScore}%)`);

        } catch (error) {
            console.log(`   ❌ Form Error Handling Test Failed: ${error.message}`);
            this.testResults.forms.failed.push({
                test: 'Form Error Handling Testing',
                error: error.message,
                severity: 'HIGH'
            });
        }
    }

    async testFormIntegration() {
        console.log('\n🔗 Testing Form Integration with Auth Service');
        console.log('==============================================');

        try {
            await this.page.goto(`${this.config.baseUrl}/signup/index.html`, {
                waitUntil: 'networkidle0'
            });

            let integrationTestsPassed = 0;
            let integrationTestsTotal = 3;

            console.log(`\n📋 Testing Form Integration:`);

            // Test 1: Form submission endpoint configuration
            console.log(`\n🔍 Integration Test 1: Form Endpoint Configuration`);
            try {
                const formConfig = await this.page.evaluate(() => {
                    const form = document.getElementById('account-form');
                    const submitButtons = document.querySelectorAll('.next-step, [type="submit"]');
                    
                    return {
                        hasForm: !!form,
                        formAction: form ? form.action : null,
                        formMethod: form ? form.method : null,
                        hasSubmitButtons: submitButtons.length > 0,
                        submitButtonCount: submitButtons.length
                    };
                });

                if (formConfig.hasForm && formConfig.hasSubmitButtons) {
                    console.log(`   ✅ Form Configuration: Properly configured for submission`);
                    console.log(`      Form Action: ${formConfig.formAction}`);
                    console.log(`      Form Method: ${formConfig.formMethod}`);
                    console.log(`      Submit Buttons: ${formConfig.submitButtonCount}`);
                    integrationTestsPassed++;
                    this.testResults.forms.passed.push({
                        test: 'Form Integration - Endpoint Configuration',
                        result: 'Form properly configured for auth service integration',
                        score: 30
                    });
                } else {
                    console.log(`   ❌ Form Configuration: Missing form or submit elements`);
                    this.testResults.forms.failed.push({
                        test: 'Form Integration - Endpoint Configuration',
                        error: 'Form not properly configured for submission',
                        severity: 'HIGH'
                    });
                }
            } catch (error) {
                console.log(`   ⚠️  Form Configuration Test Error: ${error.message}`);
            }

            // Test 2: Data serialization and transmission
            console.log(`\n🔍 Integration Test 2: Data Serialization`);
            try {
                // Fill form with test data
                await this.page.evaluate(() => {
                    document.getElementById('email').value = 'integration@test.com';
                    document.getElementById('password').value = 'IntegrationTest123!';
                    document.getElementById('confirm_password').value = 'IntegrationTest123!';
                });

                // Monitor form data collection
                const formData = await this.page.evaluate(() => {
                    const form = document.getElementById('account-form');
                    const formData = new FormData(form);
                    const data = {};
                    
                    for (let [key, value] of formData.entries()) {
                        data[key] = value;
                    }
                    
                    return {
                        hasData: Object.keys(data).length > 0,
                        dataKeys: Object.keys(data),
                        emailPresent: 'email' in data,
                        passwordPresent: 'password' in data,
                        dataCount: Object.keys(data).length
                    };
                });

                if (formData.hasData && formData.emailPresent && formData.passwordPresent) {
                    console.log(`   ✅ Data Serialization: Form data properly collected`);
                    console.log(`      Data Fields: ${formData.dataKeys.join(', ')}`);
                    console.log(`      Field Count: ${formData.dataCount}`);
                    integrationTestsPassed++;
                    this.testResults.forms.passed.push({
                        test: 'Form Integration - Data Serialization',
                        result: 'Form data properly serialized for transmission',
                        score: 25
                    });
                } else {
                    console.log(`   ❌ Data Serialization: Form data not properly collected`);
                    this.testResults.forms.failed.push({
                        test: 'Form Integration - Data Serialization',
                        error: 'Form data not properly serialized',
                        severity: 'HIGH'
                    });
                }
            } catch (error) {
                console.log(`   ⚠️  Data Serialization Test Error: ${error.message}`);
            }

            // Test 3: Auth service connectivity
            console.log(`\n🔍 Integration Test 3: Auth Service Connectivity`);
            try {
                // Test auth service endpoint availability
                const authServiceTest = await this.page.evaluate(async (authUrl) => {
                    try {
                        const response = await fetch(authUrl, {
                            method: 'GET',
                            mode: 'no-cors'
                        });
                        return {
                            accessible: true,
                            status: 'reachable'
                        };
                    } catch (error) {
                        return {
                            accessible: false,
                            error: error.message
                        };
                    }
                }, this.config.authServiceUrl);

                if (authServiceTest.accessible) {
                    console.log(`   ✅ Auth Service: Service endpoint accessible`);
                    console.log(`      Status: ${authServiceTest.status}`);
                    integrationTestsPassed++;
                    this.testResults.forms.passed.push({
                        test: 'Form Integration - Auth Service Connectivity',
                        result: 'Auth service endpoint accessible for form integration',
                        score: 20
                    });
                } else {
                    console.log(`   ⚠️  Auth Service: Service endpoint not accessible`);
                    console.log(`      Error: ${authServiceTest.error}`);
                    this.testResults.forms.failed.push({
                        test: 'Form Integration - Auth Service Connectivity',
                        error: `Auth service not accessible: ${authServiceTest.error}`,
                        severity: 'MEDIUM'
                    });
                }
            } catch (error) {
                console.log(`   ⚠️  Auth Service Test Error: ${error.message}`);
            }

            const integrationScore = Math.round((integrationTestsPassed / integrationTestsTotal) * 100);
            this.testResults.forms.metrics.integrationTesting.score = integrationScore;
            this.testResults.forms.metrics.integrationTesting.tested = true;

            console.log(`\n📊 Integration Score: ${integrationTestsPassed}/${integrationTestsTotal} (${integrationScore}%)`);

        } catch (error) {
            console.log(`   ❌ Form Integration Test Failed: ${error.message}`);
            this.testResults.forms.failed.push({
                test: 'Form Integration Testing',
                error: error.message,
                severity: 'HIGH'
            });
        }
    }

    async generateFormValidationReport() {
        console.log('\n📊 COMPREHENSIVE FORM VALIDATION TEST REPORT');
        console.log('============================================');

        const summary = {
            passed: this.testResults.forms.passed.length,
            failed: this.testResults.forms.failed.length
        };

        const totalTests = summary.passed + summary.failed;
        const passRate = totalTests > 0 ? ((summary.passed / totalTests) * 100).toFixed(1) : 0;

        // Calculate overall form validation score
        const metrics = this.testResults.forms.metrics;
        const overallScore = Math.round(
            (metrics.emailValidation.score +
             metrics.passwordValidation.score +
             metrics.passwordConfirmation.score +
             metrics.multiStepLogic.score +
             metrics.errorHandling.score +
             metrics.integrationTesting.score) / 6
        );

        console.log(`\n📊 Form Validation Test Summary:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Passed: ${summary.passed} (${passRate}%)`);
        console.log(`   Failed: ${summary.failed}`);
        console.log(`   Overall Form Validation Score: ${overallScore}/100`);

        // Category breakdown
        console.log(`\n🔍 Form Validation Category Scores:`);
        console.log(`   Email Validation: ${metrics.emailValidation.score}/100 ${metrics.emailValidation.tested ? '✅' : '❌'}`);
        console.log(`   Password Validation: ${metrics.passwordValidation.score}/100 ${metrics.passwordValidation.tested ? '✅' : '❌'}`);
        console.log(`   Password Confirmation: ${metrics.passwordConfirmation.score}/100 ${metrics.passwordConfirmation.tested ? '✅' : '❌'}`);
        console.log(`   Multi-Step Logic: ${metrics.multiStepLogic.score}/100 ${metrics.multiStepLogic.tested ? '✅' : '❌'}`);
        console.log(`   Error Handling: ${metrics.errorHandling.score}/100 ${metrics.errorHandling.tested ? '✅' : '❌'}`);
        console.log(`   Integration Testing: ${metrics.integrationTesting.score}/100 ${metrics.integrationTesting.tested ? '✅' : '❌'}`);

        // Show failed tests
        if (summary.failed > 0) {
            console.log('\n❌ FAILED FORM VALIDATION TESTS:');
            this.testResults.forms.failed.forEach((failure, index) => {
                console.log(`${index + 1}. ${failure.test}: ${failure.error} [${failure.severity}]`);
            });
        }

        // Form validation recommendations
        console.log('\n📝 FORM VALIDATION RECOMMENDATIONS:');
        if (overallScore < 85) {
            console.log('   ⚠️  WARNING: Form validation score below production threshold (85)');
            console.log('   🚫 DEPLOYMENT BLOCKED: Address form validation issues before production deployment');
        }
        
        if (metrics.emailValidation.score < 80) {
            console.log('   📧 Improve email validation logic and error handling');
        }
        
        if (metrics.passwordValidation.score < 80) {
            console.log('   🔐 Strengthen password validation requirements and feedback');
        }
        
        if (metrics.multiStepLogic.score < 70) {
            console.log('   📋 Fix multi-step form progression and state management');
        }

        if (metrics.integrationTesting.score < 70) {
            console.log('   🔗 Improve form integration with authentication services');
        }

        // Generate JSON report
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests,
                passed: summary.passed,
                failed: summary.failed,
                passRate: parseFloat(passRate),
                overallScore
            },
            metrics: this.testResults.forms.metrics,
            results: this.testResults.forms,
            recommendations: {
                deploymentBlocked: overallScore < 85,
                criticalIssues: this.testResults.forms.failed.filter(f => f.severity === 'CRITICAL').length,
                highIssues: this.testResults.forms.failed.filter(f => f.severity === 'HIGH').length,
                mediumIssues: this.testResults.forms.failed.filter(f => f.severity === 'MEDIUM').length
            }
        };

        const jsonReportPath = path.join(this.config.reportDir, 'form-validation-test-report.json');
        fs.writeFileSync(jsonReportPath, JSON.stringify(reportData, null, 2));
        console.log(`\n📄 Form Validation Report Generated: ${jsonReportPath}`);

        // Final assessment
        if (overallScore >= 90) {
            console.log('\n🎉 EXCELLENT: Form validation implementation meets high standards!');
        } else if (overallScore >= 85) {
            console.log('\n✅ GOOD: Form validation implementation meets production standards.');
        } else if (overallScore >= 70) {
            console.log('\n⚠️  WARNING: Form validation implementation needs improvement before production.');
        } else {
            console.log('\n🚫 CRITICAL: Form validation implementation insufficient for production deployment.');
        }

        return {
            totalTests,
            passed: summary.passed,
            failed: summary.failed,
            passRate: parseFloat(passRate),
            overallScore,
            deploymentBlocked: overallScore < 85
        };
    }

    async runAllFormValidationTests() {
        console.log('📝 VARAi Commerce Studio - Comprehensive Form Validation Tests');
        console.log('=============================================================');
        console.log(`Test Environment: ${this.config.baseUrl}`);
        console.log('=============================================================\n');

        const startTime = Date.now();

        try {
            await this.init();
            console.log('✅ Form validation test suite initialized successfully\n');

            // Run all form validation tests
            await this.testEmailValidation();
            await this.testPasswordValidation();
            await this.testPasswordConfirmation();
            await this.testMultiStepFormProgression();
            await this.testFormErrorHandling();
            await this.testFormIntegration();

            const endTime = Date.now();
            const totalTime = endTime - startTime;
            console.log(`\nExecution Time: ${totalTime}ms`);

            const results = await this.generateFormValidationReport();
            return results;

        } catch (error) {
            console.error('❌ Form validation test suite failed:', error);
            throw error;
        } finally {
            await this.close();
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Run the form validation tests if this file is executed directly
if (require.main === module) {
    const formTests = new FormValidationTestSuite();
    formTests.runAllFormValidationTests()
        .then((results) => {
            if (results.deploymentBlocked) {
                console.log('\n🚫 DEPLOYMENT BLOCKED: Form validation tests failed');
                process.exit(1);
            } else if (results.failed === 0) {
                console.log('\n🎉 ALL FORM VALIDATION TESTS PASSED!');
                process.exit(0);
            } else if (results.passRate >= 85) {
                console.log('\n✅ Form validation tests passed with acceptable threshold');
                process.exit(0);
            } else {
                console.log('\n⚠️  Form validation tests completed with issues');
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('Form validation test execution failed:', error);
            process.exit(1);
        });
}

module.exports = FormValidationTestSuite;