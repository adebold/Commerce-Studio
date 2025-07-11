#!/usr/bin/env node

/**
 * Comprehensive testing suite for multi-language implementation
 * European expansion - Commerce Studio
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  services: {
    i18n: process.env.I18N_SERVICE_URL || 'http://localhost:3008',
    consultation: process.env.CONSULTATION_SERVICE_URL || 'http://localhost:3010',
    faceAnalysis: process.env.FACE_ANALYSIS_SERVICE_URL || 'http://localhost:3007'
  },
  supportedLanguages: [
    'en-US', 'nl-NL', 'de-DE', 'es-ES', 'pt-PT', 'fr-FR', 'en-IE'
  ],
  testTenant: 'test-tenant-multi-lang',
  testUser: 'test-user-multi-lang'
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`✅ ${testName}`, colors.green);
  } else {
    testResults.failed++;
    log(`❌ ${testName}`, colors.red);
    if (details) log(`   ${details}`, colors.yellow);
  }
  
  testResults.details.push({
    test: testName,
    passed,
    details
  });
}

// Test suite functions
class MultiLanguageTestSuite {
  
  async runAllTests() {
    log('🌍 Starting Multi-Language Implementation Tests', colors.cyan);
    log('=' * 60, colors.cyan);
    
    try {
      // 1. Service Health Tests
      await this.testServiceHealth();
      
      // 2. Language Detection Tests
      await this.testLanguageDetection();
      
      // 3. Translation Tests
      await this.testTranslations();
      
      // 4. Consultation Service Tests
      await this.testConsultationService();
      
      // 5. UI Component Tests
      await this.testUIComponents();
      
      // 6. Integration Tests
      await this.testServiceIntegration();
      
      // 7. Performance Tests
      await this.testPerformance();
      
      // 8. Error Handling Tests
      await this.testErrorHandling();
      
      // Generate final report
      this.generateReport();
      
    } catch (error) {
      log(`Fatal error during testing: ${error.message}`, colors.red);
      process.exit(1);
    }
  }
  
  async testServiceHealth() {
    log('\n🏥 Testing Service Health', colors.blue);
    
    const services = [
      { name: 'Internationalization Service', url: CONFIG.services.i18n },
      { name: 'Consultation Service', url: CONFIG.services.consultation },
      { name: 'Face Analysis Service', url: CONFIG.services.faceAnalysis }
    ];
    
    for (const service of services) {
      try {
        const response = await axios.get(`${service.url}/health`, {
          timeout: 5000
        });
        
        const isHealthy = response.status === 200 && response.data.status === 'healthy';
        logTest(`${service.name} Health Check`, isHealthy, 
          isHealthy ? `Status: ${response.data.status}` : `Status: ${response.status}`);
      } catch (error) {
        logTest(`${service.name} Health Check`, false, error.message);
      }
    }
  }
  
  async testLanguageDetection() {
    log('\n🔍 Testing Language Detection', colors.blue);
    
    // Test browser language detection
    const testCases = [
      { acceptLanguage: 'nl-NL,nl;q=0.9,en;q=0.8', expected: 'nl-NL' },
      { acceptLanguage: 'de-DE,de;q=0.9,en;q=0.8', expected: 'de-DE' },
      { acceptLanguage: 'es-ES,es;q=0.9,en;q=0.8', expected: 'es-ES' },
      { acceptLanguage: 'pt-PT,pt;q=0.9,en;q=0.8', expected: 'pt-PT' },
      { acceptLanguage: 'fr-FR,fr;q=0.9,en;q=0.8', expected: 'fr-FR' },
      { acceptLanguage: 'en-IE,en;q=0.9', expected: 'en-IE' },
      { acceptLanguage: 'en-US,en;q=0.9', expected: 'en-US' }
    ];
    
    for (const testCase of testCases) {
      try {
        const response = await axios.post(`${CONFIG.services.i18n}/api/languages/detect`, {
          acceptLanguage: testCase.acceptLanguage,
          tenantId: CONFIG.testTenant
        });
        
        const detected = response.data.detectedLanguage;
        const passed = detected === testCase.expected;
        
        logTest(`Language Detection: ${testCase.acceptLanguage}`, passed,
          `Expected: ${testCase.expected}, Got: ${detected}`);
      } catch (error) {
        logTest(`Language Detection: ${testCase.acceptLanguage}`, false, error.message);
      }
    }
  }
  
  async testTranslations() {
    log('\n📝 Testing Translations', colors.blue);
    
    // Test key translation phrases for each language
    const testKeys = [
      'consultation.welcome',
      'consultation.placeholder',
      'consultation.upload',
      'consultation.send',
      'consultation.error'
    ];
    
    for (const language of CONFIG.supportedLanguages) {
      for (const key of testKeys) {
        try {
          const response = await axios.get(`${CONFIG.services.i18n}/api/translations`, {
            params: {
              key,
              language,
              tenantId: CONFIG.testTenant
            }
          });
          
          const hasTranslation = response.data.success && response.data.translation;
          const isNotDefault = response.data.translation !== key;
          
          logTest(`Translation ${language}: ${key}`, hasTranslation && isNotDefault,
            hasTranslation ? `Got: ${response.data.translation.substring(0, 50)}...` : 'No translation');
        } catch (error) {
          logTest(`Translation ${language}: ${key}`, false, error.message);
        }
      }
    }
  }
  
  async testConsultationService() {
    log('\n💬 Testing Consultation Service', colors.blue);
    
    for (const language of CONFIG.supportedLanguages) {
      try {
        // Start consultation
        const startResponse = await axios.post(`${CONFIG.services.consultation}/api/consultation/start`, {
          tenantId: CONFIG.testTenant,
          userId: CONFIG.testUser,
          language
        }, {
          headers: {
            'X-Tenant-ID': CONFIG.testTenant,
            'X-User-ID': CONFIG.testUser
          }
        });
        
        const consultationStarted = startResponse.data.success && startResponse.data.consultationId;
        logTest(`Consultation Start (${language})`, consultationStarted,
          consultationStarted ? `ID: ${startResponse.data.consultationId}` : 'Failed to start');
        
        if (consultationStarted) {
          const consultationId = startResponse.data.consultationId;
          
          // Test message processing
          const messageResponse = await axios.post(
            `${CONFIG.services.consultation}/api/consultation/${consultationId}/message`,
            {
              message: {
                type: 'text',
                text: 'Hello, can you help me?'
              }
            },
            {
              headers: {
                'X-Tenant-ID': CONFIG.testTenant,
                'X-User-ID': CONFIG.testUser
              }
            }
          );
          
          const messageProcessed = messageResponse.data.success;
          logTest(`Message Processing (${language})`, messageProcessed,
            messageProcessed ? 'Message processed successfully' : 'Failed to process message');
          
          // Test language switch
          const switchResponse = await axios.put(
            `${CONFIG.services.consultation}/api/consultation/${consultationId}/language`,
            { language: 'en-US' },
            {
              headers: {
                'X-Tenant-ID': CONFIG.testTenant,
                'X-User-ID': CONFIG.testUser
              }
            }
          );
          
          const languageSwitched = switchResponse.data.success;
          logTest(`Language Switch (${language} → en-US)`, languageSwitched,
            languageSwitched ? 'Language switched successfully' : 'Failed to switch language');
          
          // Clean up - end consultation
          await axios.delete(`${CONFIG.services.consultation}/api/consultation/${consultationId}`, {
            headers: {
              'X-Tenant-ID': CONFIG.testTenant,
              'X-User-ID': CONFIG.testUser
            }
          });
        }
      } catch (error) {
        logTest(`Consultation Test (${language})`, false, error.message);
      }
    }
  }
  
  async testUIComponents() {
    log('\n🎨 Testing UI Components', colors.blue);
    
    // Test that required UI files exist
    const requiredFiles = [
      'apps/html-store/js/multi-language-consultation.js',
      'apps/html-store/css/multi-language-consultation.css',
      'apps/html-store/multi-language-consultation-demo.html'
    ];
    
    for (const file of requiredFiles) {
      try {
        const exists = fs.existsSync(file);
        logTest(`UI File Exists: ${file}`, exists, exists ? 'File found' : 'File missing');
        
        if (exists) {
          const stats = fs.statSync(file);
          const hasContent = stats.size > 0;
          logTest(`UI File Has Content: ${file}`, hasContent, `Size: ${stats.size} bytes`);
        }
      } catch (error) {
        logTest(`UI File Check: ${file}`, false, error.message);
      }
    }
    
    // Test language-specific CSS classes
    const cssFile = 'apps/html-store/css/multi-language-consultation.css';
    if (fs.existsSync(cssFile)) {
      const cssContent = fs.readFileSync(cssFile, 'utf8');
      
      for (const language of CONFIG.supportedLanguages) {
        const hasLanguageCSS = cssContent.includes(`[data-language="${language}"]`);
        logTest(`Language-specific CSS: ${language}`, hasLanguageCSS,
          hasLanguageCSS ? 'CSS rules found' : 'CSS rules missing');
      }
    }
  }
  
  async testServiceIntegration() {
    log('\n🔗 Testing Service Integration', colors.blue);
    
    // Test that services can communicate with each other
    try {
      // Test consultation service calling i18n service
      const consultationResponse = await axios.post(`${CONFIG.services.consultation}/api/consultation/start`, {
        tenantId: CONFIG.testTenant,
        userId: CONFIG.testUser,
        language: 'nl-NL'
      }, {
        headers: {
          'X-Tenant-ID': CONFIG.testTenant,
          'X-User-ID': CONFIG.testUser
        }
      });
      
      const integrationWorking = consultationResponse.data.success && 
                               consultationResponse.data.language === 'nl-NL';
      
      logTest('Service Integration: Consultation ↔ I18N', integrationWorking,
        integrationWorking ? 'Services communicating successfully' : 'Integration failed');
      
      // Clean up
      if (consultationResponse.data.consultationId) {
        await axios.delete(`${CONFIG.services.consultation}/api/consultation/${consultationResponse.data.consultationId}`, {
          headers: {
            'X-Tenant-ID': CONFIG.testTenant,
            'X-User-ID': CONFIG.testUser
          }
        });
      }
    } catch (error) {
      logTest('Service Integration: Consultation ↔ I18N', false, error.message);
    }
  }
  
  async testPerformance() {
    log('\n⚡ Testing Performance', colors.blue);
    
    // Test response times for different languages
    for (const language of CONFIG.supportedLanguages) {
      const startTime = Date.now();
      
      try {
        await axios.get(`${CONFIG.services.i18n}/api/translations`, {
          params: {
            key: 'consultation.welcome',
            language,
            tenantId: CONFIG.testTenant
          }
        });
        
        const responseTime = Date.now() - startTime;
        const isAcceptable = responseTime < 1000; // Less than 1 second
        
        logTest(`Performance ${language}: Translation Response Time`, isAcceptable,
          `${responseTime}ms ${isAcceptable ? '(Good)' : '(Slow)'}`);
      } catch (error) {
        logTest(`Performance ${language}: Translation Response Time`, false, error.message);
      }
    }
    
    // Test concurrent requests
    const concurrentRequests = CONFIG.supportedLanguages.map(language => 
      axios.get(`${CONFIG.services.i18n}/api/translations`, {
        params: {
          key: 'consultation.welcome',
          language,
          tenantId: CONFIG.testTenant
        }
      })
    );
    
    const concurrentStartTime = Date.now();
    
    try {
      await Promise.all(concurrentRequests);
      const concurrentTime = Date.now() - concurrentStartTime;
      const isAcceptable = concurrentTime < 2000; // Less than 2 seconds for all
      
      logTest('Performance: Concurrent Translations', isAcceptable,
        `${concurrentTime}ms for ${CONFIG.supportedLanguages.length} languages`);
    } catch (error) {
      logTest('Performance: Concurrent Translations', false, error.message);
    }
  }
  
  async testErrorHandling() {
    log('\n🛠️ Testing Error Handling', colors.blue);
    
    // Test unsupported language
    try {
      const response = await axios.get(`${CONFIG.services.i18n}/api/translations`, {
        params: {
          key: 'consultation.welcome',
          language: 'unsupported-lang',
          tenantId: CONFIG.testTenant
        }
      });
      
      // Should fallback to default language
      const hasGracefulFallback = response.data.success || response.data.translation;
      logTest('Error Handling: Unsupported Language', hasGracefulFallback,
        hasGracefulFallback ? 'Graceful fallback working' : 'No fallback mechanism');
    } catch (error) {
      logTest('Error Handling: Unsupported Language', false, error.message);
    }
    
    // Test missing translation key
    try {
      const response = await axios.get(`${CONFIG.services.i18n}/api/translations`, {
        params: {
          key: 'nonexistent.key',
          language: 'nl-NL',
          tenantId: CONFIG.testTenant
        }
      });
      
      const hasGracefulFallback = response.data.success || response.data.translation;
      logTest('Error Handling: Missing Translation Key', hasGracefulFallback,
        hasGracefulFallback ? 'Graceful fallback working' : 'No fallback mechanism');
    } catch (error) {
      logTest('Error Handling: Missing Translation Key', false, error.message);
    }
    
    // Test invalid consultation ID
    try {
      const response = await axios.get(`${CONFIG.services.consultation}/api/consultation/invalid-id/status`, {
        headers: {
          'X-Tenant-ID': CONFIG.testTenant,
          'X-User-ID': CONFIG.testUser
        }
      });
      
      const hasProperError = response.status === 404 || response.data.error;
      logTest('Error Handling: Invalid Consultation ID', hasProperError,
        hasProperError ? 'Proper error response' : 'No error handling');
    } catch (error) {
      const hasProperError = error.response && error.response.status === 404;
      logTest('Error Handling: Invalid Consultation ID', hasProperError,
        hasProperError ? 'Proper 404 error' : error.message);
    }
  }
  
  generateReport() {
    log('\n📊 Test Summary', colors.magenta);
    log('=' * 60, colors.magenta);
    
    const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    
    log(`Total Tests: ${testResults.total}`, colors.cyan);
    log(`Passed: ${testResults.passed}`, colors.green);
    log(`Failed: ${testResults.failed}`, colors.red);
    log(`Pass Rate: ${passRate}%`, passRate >= 90 ? colors.green : colors.yellow);
    
    // Generate detailed report file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: testResults.total,
        passed: testResults.passed,
        failed: testResults.failed,
        passRate: parseFloat(passRate)
      },
      config: CONFIG,
      details: testResults.details
    };
    
    const reportFile = `test-reports/multi-language-test-report-${Date.now()}.json`;
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(reportFile);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    log(`\n📄 Detailed report saved to: ${reportFile}`, colors.blue);
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new MultiLanguageTestSuite();
  testSuite.runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = MultiLanguageTestSuite;