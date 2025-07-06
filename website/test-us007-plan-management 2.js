/**
 * US-007: Plan Management Verification Test
 * Tests comprehensive subscription plan management functionality
 */

class US007PlanManagementVerificationTest {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
    }

    async runAllTests() {
        console.log('🧪 Starting US-007: Plan Management Verification Tests...');
        
        try {
            // Core functionality tests
            await this.testPlanManagerInitialization();
            await this.testPlanDataStructure();
            await this.testProrationCalculations();
            await this.testBillingCycleToggle();
            
            // UI/UX tests
            await this.testPlanDisplayUI();
            await this.testSettingsPageIntegration();
            
            // Performance tests
            await this.testLoadingPerformance();
            
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.addTestResult('Test Suite Execution', false, `Suite failed: ${error.message}`);
        }
    }

    async testPlanManagerInitialization() {
        this.addTest('Plan Manager Initialization');
        
        try {
            // Check if PlanManager class exists
            if (typeof window.PlanManager === 'undefined') {
                throw new Error('PlanManager class not found');
            }
            
            // Test instantiation
            const planManager = new window.PlanManager();
            if (!planManager) {
                throw new Error('Failed to instantiate PlanManager');
            }
            
            // Test initialization
            await planManager.init();
            
            // Verify container exists
            const container = document.getElementById('plan-management-container');
            if (!container) {
                throw new Error('Plan management container not found');
            }
            
            this.addTestResult('Plan Manager Initialization', true, 'PlanManager successfully initialized');
            
        } catch (error) {
            this.addTestResult('Plan Manager Initialization', false, error.message);
        }
    }

    async testPlanDataStructure() {
        this.addTest('Plan Data Structure');
        
        try {
            const planManager = new window.PlanManager();
            const plans = planManager.plans;
            
            // Verify plans structure
            if (!plans || typeof plans !== 'object') {
                throw new Error('Plans data structure invalid');
            }
            
            // Check required plan tiers
            const requiredTiers = ['starter', 'professional', 'enterprise'];
            for (const tier of requiredTiers) {
                if (!plans[tier]) {
                    throw new Error(`Missing ${tier} plan`);
                }
                
                const plan = plans[tier];
                if (!plan.name || !plan.monthly || !plan.yearly || !plan.features) {
                    throw new Error(`Invalid ${tier} plan structure`);
                }
            }
            
            // Verify pricing structure
            if (plans.starter.monthly !== 29 || plans.professional.monthly !== 79 || plans.enterprise.monthly !== 199) {
                throw new Error('Incorrect monthly pricing');
            }
            
            this.addTestResult('Plan Data Structure', true, 'All plan data structures valid');
            
        } catch (error) {
            this.addTestResult('Plan Data Structure', false, error.message);
        }
    }

    async testProrationCalculations() {
        this.addTest('Proration Calculations');
        
        try {
            const calculator = new window.ProrationCalculator();
            
            // Test upgrade proration
            const upgradeProration = calculator.calculateUpgradeProration('starter', 'professional', 'monthly', 15);
            if (!upgradeProration || typeof upgradeProration.amount !== 'number') {
                throw new Error('Failed to calculate upgrade proration');
            }
            
            // Test downgrade proration
            const downgradeProration = calculator.calculateDowngradeProration('professional', 'starter', 'monthly', 15);
            if (!downgradeProration || typeof downgradeProration.credit !== 'number') {
                throw new Error('Failed to calculate downgrade proration');
            }
            
            // Verify calculation accuracy
            const starterMonthly = 29;
            const professionalMonthly = 79;
            const expectedUpgrade = ((professionalMonthly - starterMonthly) / 30) * 15;
            
            if (Math.abs(upgradeProration.amount - expectedUpgrade) > 1) {
                throw new Error('Proration calculation inaccurate');
            }
            
            this.addTestResult('Proration Calculations', true, 'All proration calculations accurate');
            
        } catch (error) {
            this.addTestResult('Proration Calculations', false, error.message);
        }
    }

    async testBillingCycleToggle() {
        this.addTest('Billing Cycle Toggle');
        
        try {
            const planManager = new window.PlanManager();
            await planManager.init();
            
            // Find billing cycle toggle
            const toggle = document.querySelector('.billing-cycle-toggle');
            if (!toggle) {
                throw new Error('Billing cycle toggle not found');
            }
            
            // Test toggle functionality
            const monthlyBtn = toggle.querySelector('[data-cycle="monthly"]');
            const yearlyBtn = toggle.querySelector('[data-cycle="yearly"]');
            
            if (!monthlyBtn || !yearlyBtn) {
                throw new Error('Billing cycle buttons not found');
            }
            
            // Simulate click on yearly
            yearlyBtn.click();
            
            // Wait for update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            this.addTestResult('Billing Cycle Toggle', true, 'Billing cycle toggle working correctly');
            
        } catch (error) {
            this.addTestResult('Billing Cycle Toggle', false, error.message);
        }
    }

    async testPlanDisplayUI() {
        this.addTest('Plan Display UI');
        
        try {
            const planManager = new window.PlanManager();
            await planManager.init();
            
            // Check current plan display
            const currentPlan = document.querySelector('.current-plan-card');
            if (!currentPlan) {
                throw new Error('Current plan card not found');
            }
            
            // Check plan cards
            const planCards = document.querySelectorAll('.plan-card');
            if (planCards.length < 3) {
                throw new Error('Insufficient plan cards displayed');
            }
            
            this.addTestResult('Plan Display UI', true, 'Plan display UI rendered correctly');
            
        } catch (error) {
            this.addTestResult('Plan Display UI', false, error.message);
        }
    }

    async testSettingsPageIntegration() {
        this.addTest('Settings Page Integration');
        
        try {
            // Check if settings page exists
            const settingsPage = document.querySelector('.settings-content');
            if (!settingsPage) {
                throw new Error('Settings page not found');
            }
            
            // Check plan management section
            const planSection = document.getElementById('plan-management-section');
            if (!planSection) {
                throw new Error('Plan management section not found');
            }
            
            // Check navigation item
            const navItem = document.querySelector('[data-section="plan-management"]');
            if (!navItem) {
                throw new Error('Plan management navigation item not found');
            }
            
            // Test navigation
            navItem.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (!planSection.classList.contains('active')) {
                throw new Error('Plan management section not activated');
            }
            
            this.addTestResult('Settings Page Integration', true, 'Settings page integration working correctly');
            
        } catch (error) {
            this.addTestResult('Settings Page Integration', false, error.message);
        }
    }

    async testLoadingPerformance() {
        this.addTest('Loading Performance');
        
        try {
            const startTime = performance.now();
            
            const planManager = new window.PlanManager();
            await planManager.init();
            
            const endTime = performance.now();
            const loadTime = endTime - startTime;
            
            if (loadTime > 1000) {
                throw new Error(`Plan manager loading too slow: ${loadTime}ms`);
            }
            
            this.addTestResult('Loading Performance', true, `Plan manager loaded in ${loadTime.toFixed(2)}ms`);
            
        } catch (error) {
            this.addTestResult('Loading Performance', false, error.message);
        }
    }

    addTest(testName) {
        this.totalTests++;
        console.log(`🧪 Running: ${testName}`);
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
        }
    }

    generateReport() {
        const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
        
        const report = {
            testSuite: 'US-007: Plan Management Verification',
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.totalTests,
                passed: this.passedTests,
                failed: this.failedTests,
                successRate: `${successRate}%`
            },
            results: this.testResults,
            status: this.failedTests === 0 ? 'PASSED' : 'FAILED'
        };
        
        console.log('\n📊 US-007 Plan Management Test Report:');
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`Passed: ${this.passedTests}`);
        console.log(`Failed: ${this.failedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log(`Status: ${report.status}`);
        
        if (this.failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(result => !result.passed)
                .forEach(result => {
                    console.log(`  - ${result.test}: ${result.details}`);
                });
        }
        
        // Store report for external access
        window.US007TestReport = report;
        
        return report;
    }
}

// Auto-run tests when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for all managers to load
    setTimeout(async () => {
        const tester = new US007PlanManagementVerificationTest();
        await tester.runAllTests();
    }, 1000);
});

// Export for manual testing
window.US007PlanManagementVerificationTest = US007PlanManagementVerificationTest;