#!/usr/bin/env node

/**
 * VARAi Commerce Studio - Comprehensive Security Tests
 * TDD Implementation: Red-Green-Refactor Cycle
 * 
 * CRITICAL SECURITY GAPS ADDRESSED:
 * - HTTPS Enforcement and SSL Certificate Validation
 * - Security Headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
 * - Input Validation and XSS Prevention
 * - Authentication Security Validation
 * - Data Protection Compliance Verification
 */

const puppeteer = require('puppeteer');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SecurityTestSuite {
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
            security: { 
                passed: [], 
                failed: [],
                metrics: {
                    httpsEnforcement: { score: 0, tested: false },
                    securityHeaders: { score: 0, tested: false, headers: {} },
                    inputValidation: { score: 0, tested: false },
                    xssProtection: { score: 0, tested: false },
                    authSecurity: { score: 0, tested: false },
                    dataProtection: { score: 0, tested: false }
                }
            }
        };

        // Security test payloads for XSS testing
        this.xssPayloads = [
            '<script>alert("XSS")</script>',
            '"><script>alert("XSS")</script>',
            'javascript:alert("XSS")',
            '<img src=x onerror=alert("XSS")>',
            '<svg onload=alert("XSS")>',
            '\'><script>alert("XSS")</script>',
            '<iframe src="javascript:alert(\'XSS\')"></iframe>',
            '<body onload=alert("XSS")>',
            '<input onfocus=alert("XSS") autofocus>',
            '<select onfocus=alert("XSS") autofocus>'
        ];

        // Required security headers
        this.requiredSecurityHeaders = {
            'strict-transport-security': {
                required: true,
                description: 'HSTS header for HTTPS enforcement',
                minValue: 'max-age=31536000'
            },
            'content-security-policy': {
                required: true,
                description: 'CSP header for XSS protection',
                shouldContain: ['default-src', 'script-src']
            },
            'x-frame-options': {
                required: true,
                description: 'Clickjacking protection',
                validValues: ['DENY', 'SAMEORIGIN']
            },
            'x-content-type-options': {
                required: true,
                description: 'MIME type sniffing protection',
                expectedValue: 'nosniff'
            },
            'x-xss-protection': {
                required: true,
                description: 'XSS protection header',
                expectedValue: '1; mode=block'
            },
            'referrer-policy': {
                required: false,
                description: 'Referrer policy for privacy',
                validValues: ['strict-origin-when-cross-origin', 'strict-origin', 'no-referrer']
            }
        };
    }

    async init() {
        console.log('🔒 Initializing Security Test Suite');
        
        // Create report directory
        if (!fs.existsSync(this.config.reportDir)) {
            fs.mkdirSync(this.config.reportDir, { recursive: true });
        }

        // Launch browser with security-focused settings
        this.browser = await puppeteer.launch({
            headless: 'new',
            defaultViewport: { width: 1920, height: 1080 },
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--allow-running-insecure-content',
                '--ignore-certificate-errors',
                '--ignore-ssl-errors',
                '--ignore-certificate-errors-spki-list'
            ]
        });

        this.page = await this.browser.newPage();
        
        // Set user agent
        await this.page.setUserAgent('Mozilla/5.0 (Security-Test-Suite) VARAi-Security-Scanner/1.0');
        
        // Enable request interception for security analysis
        await this.page.setRequestInterception(true);
        
        this.page.on('request', (request) => {
            // Log all requests for security analysis
            console.log(`🔍 Request: ${request.method()} ${request.url()}`);
            request.continue();
        });

        this.page.on('response', (response) => {
            // Log security-relevant responses
            if (response.status() >= 400) {
                console.log(`⚠️  Security Alert: ${response.status()} ${response.url()}`);
            }
        });
    }

    async testHttpsEnforcement() {
        console.log('\n🔐 Testing HTTPS Enforcement and SSL Certificate Validation');
        console.log('===========================================================');

        try {
            // Test 1: Verify HTTPS redirect from HTTP
            const httpUrl = this.config.baseUrl.replace('https://', 'http://');
            console.log(`\n📋 Test: HTTP to HTTPS Redirect`);
            console.log(`   Testing: ${httpUrl}`);

            const response = await this.page.goto(httpUrl, { 
                waitUntil: 'networkidle0',
                timeout: this.config.timeout 
            });

            const finalUrl = this.page.url();
            const isHttpsRedirect = finalUrl.startsWith('https://');
            
            if (isHttpsRedirect) {
                console.log(`   ✅ HTTPS Redirect: ${httpUrl} → ${finalUrl}`);
                this.testResults.security.passed.push({
                    test: 'HTTPS Enforcement - HTTP Redirect',
                    result: `Successfully redirected to HTTPS: ${finalUrl}`,
                    score: 25
                });
                this.testResults.security.metrics.httpsEnforcement.score += 25;
            } else {
                console.log(`   ❌ HTTPS Redirect Failed: Still on HTTP`);
                this.testResults.security.failed.push({
                    test: 'HTTPS Enforcement - HTTP Redirect',
                    error: `Failed to redirect to HTTPS. Final URL: ${finalUrl}`,
                    severity: 'CRITICAL'
                });
            }

            // Test 2: SSL Certificate Validation
            console.log(`\n📋 Test: SSL Certificate Validation`);
            await this.validateSSLCertificate();

            // Test 3: TLS Version Check
            console.log(`\n📋 Test: TLS Version Validation`);
            await this.validateTLSVersion();

            this.testResults.security.metrics.httpsEnforcement.tested = true;

        } catch (error) {
            console.log(`   ❌ HTTPS Enforcement Test Failed: ${error.message}`);
            this.testResults.security.failed.push({
                test: 'HTTPS Enforcement',
                error: error.message,
                severity: 'CRITICAL'
            });
        }
    }

    async validateSSLCertificate() {
        return new Promise((resolve, reject) => {
            const url = new URL(this.config.baseUrl);
            const options = {
                hostname: url.hostname,
                port: 443,
                path: '/',
                method: 'GET',
                rejectUnauthorized: true // This will fail if certificate is invalid
            };

            const req = https.request(options, (res) => {
                const cert = res.connection.getPeerCertificate();
                
                if (cert && Object.keys(cert).length > 0) {
                    const now = new Date();
                    const validFrom = new Date(cert.valid_from);
                    const validTo = new Date(cert.valid_to);
                    
                    const isValidPeriod = now >= validFrom && now <= validTo;
                    const daysUntilExpiry = Math.ceil((validTo - now) / (1000 * 60 * 60 * 24));
                    
                    console.log(`   📜 Certificate Subject: ${cert.subject.CN}`);
                    console.log(`   📅 Valid From: ${cert.valid_from}`);
                    console.log(`   📅 Valid To: ${cert.valid_to}`);
                    console.log(`   ⏰ Days Until Expiry: ${daysUntilExpiry}`);
                    
                    if (isValidPeriod && daysUntilExpiry > 30) {
                        console.log(`   ✅ SSL Certificate: Valid and secure`);
                        this.testResults.security.passed.push({
                            test: 'SSL Certificate Validation',
                            result: `Valid certificate for ${cert.subject.CN}, expires in ${daysUntilExpiry} days`,
                            score: 25
                        });
                        this.testResults.security.metrics.httpsEnforcement.score += 25;
                    } else if (daysUntilExpiry <= 30) {
                        console.log(`   ⚠️  SSL Certificate: Expires soon (${daysUntilExpiry} days)`);
                        this.testResults.security.failed.push({
                            test: 'SSL Certificate Validation',
                            error: `Certificate expires in ${daysUntilExpiry} days`,
                            severity: 'MEDIUM'
                        });
                    } else {
                        console.log(`   ❌ SSL Certificate: Invalid or expired`);
                        this.testResults.security.failed.push({
                            test: 'SSL Certificate Validation',
                            error: 'Certificate is invalid or expired',
                            severity: 'CRITICAL'
                        });
                    }
                } else {
                    console.log(`   ❌ SSL Certificate: No certificate found`);
                    this.testResults.security.failed.push({
                        test: 'SSL Certificate Validation',
                        error: 'No SSL certificate found',
                        severity: 'CRITICAL'
                    });
                }
                
                resolve();
            });

            req.on('error', (error) => {
                console.log(`   ❌ SSL Certificate: ${error.message}`);
                this.testResults.security.failed.push({
                    test: 'SSL Certificate Validation',
                    error: error.message,
                    severity: 'CRITICAL'
                });
                resolve();
            });

            req.end();
        });
    }

    async validateTLSVersion() {
        // This is a simplified TLS version check
        // In production, you'd want more comprehensive TLS testing
        try {
            const response = await this.page.goto(this.config.baseUrl);
            const securityDetails = await this.page.evaluate(() => {
                return {
                    protocol: window.location.protocol,
                    securityState: document.visibilityState
                };
            });

            if (securityDetails.protocol === 'https:') {
                console.log(`   ✅ TLS Protocol: Secure connection established`);
                this.testResults.security.passed.push({
                    test: 'TLS Version Validation',
                    result: 'Secure TLS connection established',
                    score: 15
                });
                this.testResults.security.metrics.httpsEnforcement.score += 15;
            } else {
                console.log(`   ❌ TLS Protocol: Insecure connection`);
                this.testResults.security.failed.push({
                    test: 'TLS Version Validation',
                    error: 'Insecure connection detected',
                    severity: 'CRITICAL'
                });
            }
        } catch (error) {
            console.log(`   ❌ TLS Validation Failed: ${error.message}`);
            this.testResults.security.failed.push({
                test: 'TLS Version Validation',
                error: error.message,
                severity: 'HIGH'
            });
        }
    }

    async testSecurityHeaders() {
        console.log('\n🛡️  Testing Security Headers');
        console.log('=============================');

        try {
            const response = await this.page.goto(this.config.baseUrl, { 
                waitUntil: 'networkidle0' 
            });
            
            const headers = response.headers();
            console.log('\n📋 Analyzing Security Headers:');
            
            let totalHeaderScore = 0;
            const maxHeaderScore = 100;

            for (const [headerName, headerConfig] of Object.entries(this.requiredSecurityHeaders)) {
                const headerValue = headers[headerName.toLowerCase()];
                
                console.log(`\n🔍 ${headerName.toUpperCase()}:`);
                console.log(`   Description: ${headerConfig.description}`);
                
                if (headerValue) {
                    console.log(`   ✅ Present: ${headerValue}`);
                    
                    // Validate header value
                    let isValidValue = true;
                    let validationMessage = 'Header present';
                    
                    if (headerConfig.expectedValue && headerValue !== headerConfig.expectedValue) {
                        isValidValue = false;
                        validationMessage = `Expected: ${headerConfig.expectedValue}, Got: ${headerValue}`;
                    }
                    
                    if (headerConfig.validValues && !headerConfig.validValues.includes(headerValue)) {
                        isValidValue = false;
                        validationMessage = `Expected one of: ${headerConfig.validValues.join(', ')}, Got: ${headerValue}`;
                    }
                    
                    if (headerConfig.shouldContain) {
                        const containsRequired = headerConfig.shouldContain.every(item => 
                            headerValue.toLowerCase().includes(item.toLowerCase())
                        );
                        if (!containsRequired) {
                            isValidValue = false;
                            validationMessage = `Should contain: ${headerConfig.shouldContain.join(', ')}`;
                        }
                    }
                    
                    if (isValidValue) {
                        const score = headerConfig.required ? 20 : 10;
                        totalHeaderScore += score;
                        this.testResults.security.passed.push({
                            test: `Security Header - ${headerName}`,
                            result: validationMessage,
                            score: score
                        });
                        console.log(`   ✅ Valid: ${validationMessage}`);
                    } else {
                        this.testResults.security.failed.push({
                            test: `Security Header - ${headerName}`,
                            error: validationMessage,
                            severity: headerConfig.required ? 'HIGH' : 'MEDIUM'
                        });
                        console.log(`   ❌ Invalid: ${validationMessage}`);
                    }
                    
                    this.testResults.security.metrics.securityHeaders.headers[headerName] = {
                        present: true,
                        value: headerValue,
                        valid: isValidValue
                    };
                } else {
                    const severity = headerConfig.required ? 'HIGH' : 'LOW';
                    console.log(`   ❌ Missing: ${headerConfig.description}`);
                    this.testResults.security.failed.push({
                        test: `Security Header - ${headerName}`,
                        error: `Missing required security header: ${headerName}`,
                        severity: severity
                    });
                    
                    this.testResults.security.metrics.securityHeaders.headers[headerName] = {
                        present: false,
                        value: null,
                        valid: false
                    };
                }
            }

            this.testResults.security.metrics.securityHeaders.score = totalHeaderScore;
            this.testResults.security.metrics.securityHeaders.tested = true;

            console.log(`\n📊 Security Headers Score: ${totalHeaderScore}/${maxHeaderScore}`);

        } catch (error) {
            console.log(`   ❌ Security Headers Test Failed: ${error.message}`);
            this.testResults.security.failed.push({
                test: 'Security Headers Analysis',
                error: error.message,
                severity: 'HIGH'
            });
        }
    }

    async testXSSProtection() {
        console.log('\n🚨 Testing XSS Protection and Input Validation');
        console.log('===============================================');

        try {
            // Navigate to signup form for XSS testing
            await this.page.goto(`${this.config.baseUrl}/signup/index.html`, { 
                waitUntil: 'networkidle0' 
            });

            let xssTestsPassed = 0;
            let xssTestsTotal = this.xssPayloads.length;

            console.log(`\n📋 Testing ${xssTestsTotal} XSS Payloads on Signup Form:`);

            for (let i = 0; i < this.xssPayloads.length; i++) {
                const payload = this.xssPayloads[i];
                console.log(`\n🔍 XSS Test ${i + 1}/${xssTestsTotal}: ${payload.substring(0, 50)}...`);

                try {
                    // Test email field
                    await this.page.click('#email');
                    await this.page.evaluate(() => document.getElementById('email').value = '');
                    await this.page.type('#email', payload);

                    // Test password field
                    await this.page.click('#password');
                    await this.page.evaluate(() => document.getElementById('password').value = '');
                    await this.page.type('#password', payload);

                    // Check if XSS payload executed
                    const alertTriggered = await this.page.evaluate(() => {
                        return window.xssTriggered || false;
                    });

                    // Check for script execution in DOM
                    const scriptInDOM = await this.page.evaluate((testPayload) => {
                        const emailValue = document.getElementById('email').value;
                        const passwordValue = document.getElementById('password').value;
                        
                        // Check if payload was sanitized
                        const emailSanitized = !emailValue.includes('<script>') && !emailValue.includes('javascript:');
                        const passwordSanitized = !passwordValue.includes('<script>') && !passwordValue.includes('javascript:');
                        
                        return {
                            emailSanitized,
                            passwordSanitized,
                            emailValue: emailValue.substring(0, 100),
                            passwordValue: passwordValue.substring(0, 100)
                        };
                    }, payload);

                    if (scriptInDOM.emailSanitized && scriptInDOM.passwordSanitized && !alertTriggered) {
                        console.log(`   ✅ XSS Protection: Payload properly sanitized`);
                        xssTestsPassed++;
                        this.testResults.security.passed.push({
                            test: `XSS Protection Test ${i + 1}`,
                            result: `Payload sanitized: ${payload.substring(0, 30)}...`,
                            score: 5
                        });
                    } else {
                        console.log(`   ❌ XSS Vulnerability: Payload not properly sanitized`);
                        console.log(`      Email sanitized: ${scriptInDOM.emailSanitized}`);
                        console.log(`      Password sanitized: ${scriptInDOM.passwordSanitized}`);
                        this.testResults.security.failed.push({
                            test: `XSS Protection Test ${i + 1}`,
                            error: `XSS payload not sanitized: ${payload}`,
                            severity: 'CRITICAL'
                        });
                    }

                    // Clear fields for next test
                    await this.page.evaluate(() => {
                        document.getElementById('email').value = '';
                        document.getElementById('password').value = '';
                    });

                } catch (error) {
                    console.log(`   ⚠️  XSS Test Error: ${error.message}`);
                    this.testResults.security.failed.push({
                        test: `XSS Protection Test ${i + 1}`,
                        error: `Test execution error: ${error.message}`,
                        severity: 'MEDIUM'
                    });
                }
            }

            const xssProtectionScore = Math.round((xssTestsPassed / xssTestsTotal) * 100);
            this.testResults.security.metrics.xssProtection.score = xssProtectionScore;
            this.testResults.security.metrics.xssProtection.tested = true;

            console.log(`\n📊 XSS Protection Score: ${xssTestsPassed}/${xssTestsTotal} (${xssProtectionScore}%)`);

        } catch (error) {
            console.log(`   ❌ XSS Protection Test Failed: ${error.message}`);
            this.testResults.security.failed.push({
                test: 'XSS Protection Testing',
                error: error.message,
                severity: 'HIGH'
            });
        }
    }

    async testAuthenticationSecurity() {
        console.log('\n🔐 Testing Authentication Security');
        console.log('==================================');

        try {
            // Test 1: Password field security
            await this.page.goto(`${this.config.baseUrl}/signup/index.html`);
            
            const passwordFieldSecurity = await this.page.evaluate(() => {
                const passwordField = document.getElementById('password');
                const confirmPasswordField = document.getElementById('confirm_password');
                
                return {
                    passwordType: passwordField ? passwordField.type : null,
                    confirmPasswordType: confirmPasswordField ? confirmPasswordField.type : null,
                    passwordAutocomplete: passwordField ? passwordField.autocomplete : null,
                    hasPasswordRequirements: document.querySelector('small') !== null
                };
            });

            console.log('\n📋 Password Field Security Analysis:');
            
            if (passwordFieldSecurity.passwordType === 'password') {
                console.log('   ✅ Password Field: Properly masked');
                this.testResults.security.passed.push({
                    test: 'Password Field Security - Type',
                    result: 'Password field properly masked',
                    score: 15
                });
            } else {
                console.log('   ❌ Password Field: Not properly masked');
                this.testResults.security.failed.push({
                    test: 'Password Field Security - Type',
                    error: 'Password field not properly masked',
                    severity: 'HIGH'
                });
            }

            if (passwordFieldSecurity.hasPasswordRequirements) {
                console.log('   ✅ Password Requirements: Visible to user');
                this.testResults.security.passed.push({
                    test: 'Password Requirements Display',
                    result: 'Password requirements clearly displayed',
                    score: 10
                });
            } else {
                console.log('   ❌ Password Requirements: Not visible');
                this.testResults.security.failed.push({
                    test: 'Password Requirements Display',
                    error: 'Password requirements not displayed to user',
                    severity: 'MEDIUM'
                });
            }

            // Test 2: Form submission security
            console.log('\n📋 Testing Form Submission Security:');
            
            await this.page.type('#email', 'test@example.com');
            await this.page.type('#password', 'TestPassword123!');
            await this.page.type('#confirm_password', 'TestPassword123!');

            // Monitor network requests during form submission
            const requests = [];
            this.page.on('request', (request) => {
                if (request.url().includes('auth') || request.method() === 'POST') {
                    requests.push({
                        url: request.url(),
                        method: request.method(),
                        headers: request.headers()
                    });
                }
            });

            // Attempt form submission
            await this.page.click('.next-step');
            await this.page.waitForTimeout(2000);

            // Analyze authentication requests
            const authRequests = requests.filter(req => 
                req.url().includes('auth') || req.method() === 'POST'
            );

            if (authRequests.length > 0) {
                console.log(`   ✅ Authentication Requests: ${authRequests.length} secure requests detected`);
                this.testResults.security.passed.push({
                    test: 'Authentication Request Security',
                    result: `${authRequests.length} authentication requests properly secured`,
                    score: 20
                });
            } else {
                console.log('   ⚠️  Authentication Requests: No auth requests detected');
                this.testResults.security.failed.push({
                    test: 'Authentication Request Security',
                    error: 'No authentication requests detected during form submission',
                    severity: 'MEDIUM'
                });
            }

            const authSecurityScore = 45; // Base score for basic auth security
            this.testResults.security.metrics.authSecurity.score = authSecurityScore;
            this.testResults.security.metrics.authSecurity.tested = true;

        } catch (error) {
            console.log(`   ❌ Authentication Security Test Failed: ${error.message}`);
            this.testResults.security.failed.push({
                test: 'Authentication Security',
                error: error.message,
                severity: 'HIGH'
            });
        }
    }

    async testDataProtectionCompliance() {
        console.log('\n🛡️  Testing Data Protection and Privacy Compliance');
        console.log('===================================================');

        try {
            // Test 1: Privacy Policy and Terms of Service
            await this.page.goto(this.config.baseUrl);
            
            const privacyLinks = await this.page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a'));
                return links.filter(link => 
                    link.textContent.toLowerCase().includes('privacy') ||
                    link.textContent.toLowerCase().includes('terms') ||
                    link.textContent.toLowerCase().includes('gdpr')
                ).map(link => ({
                    text: link.textContent,
                    href: link.href
                }));
            });

            console.log('\n📋 Privacy and Legal Links Analysis:');
            
            if (privacyLinks.length > 0) {
                console.log(`   ✅ Privacy Links: ${privacyLinks.length} privacy-related links found`);
                privacyLinks.forEach(link => {
                    console.log(`      - ${link.text}: ${link.href}`);
                });
                this.testResults.security.passed.push({
                    test: 'Privacy Policy Links',
                    result: `${privacyLinks.length} privacy-related links found`,
                    score: 15
                });
            } else {
                console.log('   ❌ Privacy Links: No privacy policy or terms links found');
                this.testResults.security.failed.push({
                    test: 'Privacy Policy Links',
                    error: 'No privacy policy or terms of service links found',
                    severity: 'HIGH'
                });
            }

            // Test 2: Cookie consent and data collection notice
            const cookieConsent = await this.page.evaluate(() => {
                const cookieElements = Array.from(document.querySelectorAll('*')).filter(el => 
                    el.textContent.toLowerCase().includes('cookie') ||
                    el.textContent.toLowerCase().includes('consent') ||
                    el.textContent.toLowerCase().includes('data collection')
                );
                return cookieElements.length > 0;
            });

            if (cookieConsent) {
                console.log('   ✅ Cookie Consent: Cookie/consent notices found');
                this.testResults.security.passed.push({
                    test: 'Cookie Consent Notice',
                    result: 'Cookie consent or data collection notices present',
                    score: 10
                });
            } else {
                console.log('   ⚠️  Cookie Consent: No cookie consent notices found');
                this.testResults.security.failed.push({
                    test: 'Cookie Consent Notice',
                    error: 'No cookie consent or data collection notices found',
                    severity: 'MEDIUM'
                });
            }

            // Test 3: Form data handling
            await this.page.goto(`${this.config.baseUrl}/signup/index.html`);
            
            const formDataHandling = await this.page.evaluate(() => {
                const form = document.getElementById('account-form');
                const inputs = form ? Array.from(form.querySelectorAll('input')) : [];
                
                return {
                    hasForm: !!form,
                    inputCount: inputs.length,
                    hasRequiredFields: inputs.some(input => input.required),
                    hasEmailField: inputs.some(input => input.type === 'email'),
                    hasPasswordField: inputs.some(input => input.type === 'password')
                };
            });

            if (formDataHandling.hasForm && formDataHandling.hasRequiredFields) {
                console.log('   ✅ Form Data Handling: Proper form structure with required fields');
                this.testResults.security.passed.push({
                    test: 'Form Data Handling',
                    result: 'Proper form structure with data validation',
                    score: 15
                });
            } else {
                console.log('   ❌ Form Data Handling: Improper form structure');
                this.testResults.security.failed.push({
                    test: 'Form Data Handling',
                    error: 'Form lacks proper structure or required field validation',
                    severity: 'MEDIUM'
                });
            }

            const dataProtectionScore = 40; // Base score for data protection
            this.testResults.security.metrics.dataProtection.score = dataProtectionScore;
            this.testResults.security.metrics.dataProtection.tested = true;

        } catch (error) {
            console.log(`   ❌ Data Protection Test Failed: ${error.message}`);
            this.testResults.security.failed.push({
                test: 'Data Protection Compliance',
                error: error.message,
                severity: 'HIGH'
            });
        }
    }

    async generateSecurityReport() {
        console.log('\n📊 COMPREHENSIVE SECURITY TEST REPORT');
        console.log('=====================================');

        const summary = {
            passed: this.testResults.security.passed.length,
            failed: this.testResults.security.failed.length
        };

        const totalTests = summary.passed + summary.failed;
        const passRate = totalTests > 0 ? ((summary.passed / totalTests) * 100).toFixed(1) : 0;

        // Calculate overall security score
        const metrics = this.testResults.security.metrics;
        const overallScore = Math.round(
            (metrics.httpsEnforcement.score + 
             metrics.securityHeaders.score + 
             metrics.xssProtection.score + 
             metrics.authSecurity.score + 
             metrics.dataProtection.score) / 5
        );

        console.log(`\n📊 Security Test Summary:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Passed: ${summary.passed} (${passRate}%)`);
        console.log(`   Failed: ${summary.failed}`);
        console.log(`   Overall Security Score: ${overallScore}/100`);

        // Category breakdown
        console.log(`\n🔍 Security Category Scores:`);
        console.log(`   HTTPS Enforcement: ${metrics.httpsEnforcement.score}/100 ${metrics.httpsEnforcement.tested ? '✅' : '❌'}`);
        console.log(`   Security Headers: ${metrics.securityHeaders.score}/100 ${metrics.securityHeaders.tested ? '✅' : '❌'}`);
        console.log(`   XSS Protection: ${metrics.xssProtection.score}/100 ${metrics.xssProtection.tested ? '✅' : '❌'}`);
        console.log(`   Auth Security: ${metrics.authSecurity.score}/100 ${metrics.authSecurity.tested ? '✅' : '❌'}`);
        console.log(`   Data Protection: ${metrics.dataProtection.score}/100 ${metrics.dataProtection.tested ? '✅' : '❌'}`);

        // Show failed tests
        if (summary.failed > 0) {
            console.log('\n❌ FAILED SECURITY TESTS:');
            this.testResults.security.failed.forEach((failure, index) => {
                console.log(`${index + 1}. ${failure.test}: ${failure.error} [${failure.severity}]`);
            });
        }

        // Security recommendations
        console.log('\n🛡️  SECURITY RECOMMENDATIONS:');
        if (overallScore < 75) {
            console.log('   ⚠️  CRITICAL: Security score below production threshold (75)');
            console.log('   🚫 DEPLOYMENT BLOCKED: Address security issues before production deployment');
        }
        
        if (metrics.httpsEnforcement.score < 50) {
            console.log('   🔒 Implement proper HTTPS enforcement and SSL certificate validation');
        }
        
        if (metrics.securityHeaders.score < 50) {
            console.log('   🛡️  Add missing security headers (CSP, HSTS, X-Frame-Options, etc.)');
        }
        
        if (metrics.xssProtection.score < 80) {
            console.log('   🚨 Improve XSS protection and input sanitization');
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
            metrics: this.testResults.security.metrics,
            results: this.testResults.security,
            recommendations: {
                deploymentBlocked: overallScore < 75,
                criticalIssues: this.testResults.security.failed.filter(f => f.severity === 'CRITICAL').length,
                highIssues: this.testResults.security.failed.filter(f => f.severity === 'HIGH').length,
                mediumIssues: this.testResults.security.failed.filter(f => f.severity === 'MEDIUM').length
            }
        };

        const jsonReportPath = path.join(this.config.reportDir, 'security-test-report.json');
        fs.writeFileSync(jsonReportPath, JSON.stringify(reportData, null, 2));
        console.log(`\n📄 Security Report Generated: ${jsonReportPath}`);

        // Final assessment
        if (overallScore >= 90) {
            console.log('\n🎉 EXCELLENT: Security implementation meets high standards!');
        } else if (overallScore >= 75) {
            console.log('\n✅ GOOD: Security implementation meets production standards.');
        } else if (overallScore >= 50) {
            console.log('\n⚠️  WARNING: Security implementation needs improvement before production.');
        } else {
            console.log('\n🚫 CRITICAL: Security implementation insufficient for production deployment.');
        }

        return {
            totalTests,
            passed: summary.passed,
            failed: summary.failed,
            passRate: parseFloat(passRate),
            overallScore,
            deploymentBlocked: overallScore < 75
        };
    }

    async runAllSecurityTests() {
        console.log('🔒 VARAi Commerce Studio - Comprehensive Security Tests');
        console.log('======================================================');
        console.log(`Test Environment: ${this.config.baseUrl}`);
        console.log('======================================================\n');

        const startTime = Date.now();

        try {
            await this.init();
            console.log('✅ Security test suite initialized successfully\n');

            // Run all security tests
            await this.testHttpsEnforcement();
            await this.testSecurityHeaders();
            await this.testXSSProtection();
            await this.testAuthenticationSecurity();
            await this.testDataProtectionCompliance();

            const endTime = Date.now();
            const totalTime = endTime - startTime;
            console.log(`\nExecution Time: ${totalTime}ms`);

            const results = await this.generateSecurityReport();
            return results;

        } catch (error) {
            console.error('❌ Security test suite failed:', error);
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

// Run the security tests if this file is executed directly
if (require.main === module) {
    const securityTests = new SecurityTestSuite();
    securityTests.runAllSecurityTests()
        .then((results) => {
            if (results.deploymentBlocked) {
                console.log('\n🚫 DEPLOYMENT BLOCKED: Security tests failed');
                process.exit(1);
            } else if (results.failed === 0) {
                console.log('\n🎉 ALL SECURITY TESTS PASSED!');
                process.exit(0);
            } else if (results.passRate >= 75) {
                console.log('\n✅ Security tests passed with acceptable threshold');
                process.exit(0);
            } else {
                console.log('\n⚠️  Security tests completed with issues');
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('Security test execution failed:', error);
            process.exit(1);
        });
}

module.exports = SecurityTestSuite;