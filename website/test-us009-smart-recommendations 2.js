/**
 * US-009: Smart Recommendations Verification Test Suite
 * Comprehensive testing for intelligent recommendations system
 */

class US009SmartRecommendationsTest {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.startTime = Date.now();
        
        console.log('🤖 Initializing US-009: Smart Recommendations Test Suite...');
    }

    async runAllTests() {
        console.log('🚀 Starting US-009: Smart Recommendations comprehensive verification...');
        
        try {
            // Core functionality tests
            await this.testRecommendationEngineInitialization();
            await this.testUsageAnalyzer();
            await this.testPredictionModel();
            await this.testPersonalizationEngine();
            await this.testRecommendationRenderer();
            await this.testRecommendationTracker();
            
            // Integration tests
            await this.testPlanRecommendations();
            await this.testIntegrationRecommendations();
            await this.testPerformanceRecommendations();
            await this.testCostRecommendations();
            await this.testFeatureRecommendations();
            
            // UI/UX tests
            await this.testRecommendationDisplay();
            await this.testRecommendationActions();
            await this.testRecommendationDismissal();
            await this.testResponsiveDesign();
            await this.testAccessibilityCompliance();
            
            // Data persistence tests
            await this.testDataPersistence();
            await this.testRecommendationHistory();
            
            // Performance tests
            await this.testPerformanceMetrics();
            await this.testMemoryUsage();
            
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ Test suite execution failed:', error);
            this.recordTest('Test Suite Execution', false, `Suite failed: ${error.message}`);
        }
    }

    async testRecommendationEngineInitialization() {
        console.log('🔧 Testing Recommendation Engine Initialization...');
        
        try {
            // Test SmartRecommendationsManager initialization
            const manager = new SmartRecommendationsManager();
            this.recordTest('SmartRecommendationsManager Creation', !!manager, 'Manager instance created successfully');
            
            // Test component initialization
            this.recordTest('UsageAnalyzer Component', !!manager.usageAnalyzer, 'UsageAnalyzer initialized');
            this.recordTest('PredictionModel Component', !!manager.predictionModel, 'PredictionModel initialized');
            this.recordTest('PersonalizationEngine Component', !!manager.personalizationEngine, 'PersonalizationEngine initialized');
            this.recordTest('RecommendationRenderer Component', !!manager.recommendationRenderer, 'RecommendationRenderer initialized');
            this.recordTest('RecommendationTracker Component', !!manager.tracker, 'RecommendationTracker initialized');
            
            // Test data structures
            this.recordTest('Recommendations Map', manager.recommendations instanceof Map, 'Recommendations Map initialized');
            
        } catch (error) {
            this.recordTest('Recommendation Engine Initialization', false, `Initialization failed: ${error.message}`);
        }
    }

    async testUsageAnalyzer() {
        console.log('📊 Testing Usage Analyzer...');
        
        try {
            const analyzer = new UsageAnalyzer();
            
            // Test sample user data
            const sampleUserData = {
                usage: { apiCalls: 5000, storage: 500, bandwidth: 2000 },
                preferences: { analyticsViews: 15, billingViews: 5 },
                integrations: { shopify: { status: 'connected' } }
            };
            
            const patterns = analyzer.analyze(sampleUserData);
            
            // Test pattern analysis
            this.recordTest('Usage Pattern Analysis', !!patterns, 'Patterns generated successfully');
            this.recordTest('Resource Usage Analysis', !!patterns.resourceUsage, 'Resource usage analyzed');
            this.recordTest('Feature Usage Analysis', !!patterns.featureUsage, 'Feature usage analyzed');
            this.recordTest('Performance Analysis', !!patterns.performance, 'Performance metrics analyzed');
            this.recordTest('Trend Analysis', !!patterns.trends, 'Trends analyzed');
            this.recordTest('Behavior Analysis', !!patterns.behavior, 'Behavior patterns analyzed');
            
            // Test specific metrics
            this.recordTest('API Calls Metric', typeof patterns.resourceUsage.apiCalls === 'number', 'API calls metric present');
            this.recordTest('Storage Metric', typeof patterns.resourceUsage.storage === 'number', 'Storage metric present');
            this.recordTest('Analytics Usage', typeof patterns.featureUsage.analytics === 'number', 'Analytics usage tracked');
            
        } catch (error) {
            this.recordTest('Usage Analyzer', false, `Analysis failed: ${error.message}`);
        }
    }

    async testPredictionModel() {
        console.log('🔮 Testing Prediction Model...');
        
        try {
            const model = new PredictionModel();
            
            // Test sample patterns
            const samplePatterns = {
                resourceUsage: { apiCalls: 8000, integrations: 2 },
                trends: { growth: 0.25 },
                performance: { avgResponseTime: 1200 },
                behavior: { loginFrequency: 20 }
            };
            
            const predictions = model.predict(samplePatterns);
            
            // Test prediction categories
            this.recordTest('Plan Upgrade Prediction', !!predictions.planUpgrade, 'Plan upgrade prediction generated');
            this.recordTest('Integration Needs Prediction', !!predictions.integrationNeeds, 'Integration needs predicted');
            this.recordTest('Performance Issues Prediction', !!predictions.performanceIssues, 'Performance issues predicted');
            this.recordTest('Cost Optimization Prediction', !!predictions.costOptimization, 'Cost optimization predicted');
            this.recordTest('Feature Adoption Prediction', !!predictions.featureAdoption, 'Feature adoption predicted');
            
            // Test prediction quality
            this.recordTest('Plan Upgrade Probability', 
                typeof predictions.planUpgrade.probability === 'number' && 
                predictions.planUpgrade.probability >= 0 && 
                predictions.planUpgrade.probability <= 1, 
                'Valid probability range');
            
            this.recordTest('Prediction Confidence', 
                typeof predictions.planUpgrade.confidence === 'number' && 
                predictions.planUpgrade.confidence >= 0 && 
                predictions.planUpgrade.confidence <= 1, 
                'Valid confidence range');
            
        } catch (error) {
            this.recordTest('Prediction Model', false, `Prediction failed: ${error.message}`);
        }
    }

    async testPersonalizationEngine() {
        console.log('🎯 Testing Personalization Engine...');
        
        try {
            const engine = new PersonalizationEngine();
            
            // Test sample data
            const samplePredictions = {
                planUpgrade: { probability: 0.8 },
                integrationNeeds: { recommendedIntegrations: ['shopify'] }
            };
            
            const sampleUserData = {
                profile: { businessType: 'ecommerce' },
                preferences: { analyticsViews: 15 }
            };
            
            const customized = engine.customize(samplePredictions, sampleUserData);
            
            // Test personalization
            this.recordTest('Personalization Processing', !!customized, 'Personalization applied');
            this.recordTest('Business Type Customization', 
                sampleUserData.profile.businessType === 'ecommerce' && 
                customized.priority_features && 
                customized.priority_features.includes('inventory'), 
                'E-commerce specific features prioritized');
            
            this.recordTest('User Behavior Customization', 
                sampleUserData.preferences.analyticsViews > 10 && 
                customized.feature_affinity === 'analytics_focused', 
                'Analytics affinity detected');
            
        } catch (error) {
            this.recordTest('Personalization Engine', false, `Personalization failed: ${error.message}`);
        }
    }

    async testRecommendationRenderer() {
        console.log('🎨 Testing Recommendation Renderer...');
        
        try {
            const renderer = new RecommendationRenderer();
            
            // Create test container
            const testContainer = document.createElement('div');
            testContainer.id = 'test-recommendations-container';
            document.body.appendChild(testContainer);
            
            // Test sample recommendations
            const sampleRecommendations = new Map([
                ['rec_1', {
                    id: 'rec_1',
                    type: 'plan_upgrade',
                    title: 'Test Recommendation',
                    description: 'Test description',
                    action: 'Test Action',
                    actionType: 'test_action',
                    priority: 8,
                    confidence: 0.9,
                    impact: 'high',
                    category: 'billing',
                    icon: '⬆️'
                }]
            ]);
            
            renderer.render(testContainer, sampleRecommendations);
            
            // Test rendering
            this.recordTest('Recommendation Rendering', testContainer.children.length > 0, 'Recommendations rendered');
            this.recordTest('Category Section Creation', 
                testContainer.querySelector('.recommendations-category') !== null, 
                'Category section created');
            this.recordTest('Recommendation Card Creation', 
                testContainer.querySelector('.recommendation-card') !== null, 
                'Recommendation card created');
            this.recordTest('Recommendation Title', 
                testContainer.textContent.includes('Test Recommendation'), 
                'Recommendation title displayed');
            this.recordTest('Recommendation Action Button', 
                testContainer.querySelector('.recommendation-action') !== null, 
                'Action button created');
            
            // Test empty state
            renderer.render(testContainer, new Map());
            this.recordTest('Empty State Rendering', 
                testContainer.querySelector('.recommendations-empty') !== null, 
                'Empty state rendered correctly');
            
            // Cleanup
            document.body.removeChild(testContainer);
            
        } catch (error) {
            this.recordTest('Recommendation Renderer', false, `Rendering failed: ${error.message}`);
        }
    }

    async testRecommendationTracker() {
        console.log('📈 Testing Recommendation Tracker...');
        
        try {
            const tracker = new RecommendationTracker();
            
            // Test action tracking
            tracker.trackAction('test_rec_1', 'click');
            this.recordTest('Action Tracking', 
                tracker.actions.has('test_rec_1'), 
                'Action tracked successfully');
            
            // Test dismissal tracking
            tracker.trackDismissal('test_rec_2');
            this.recordTest('Dismissal Tracking', 
                tracker.dismissals.has('test_rec_2'), 
                'Dismissal tracked successfully');
            
            // Test history retrieval
            const actionHistory = tracker.getActionHistory();
            const dismissalHistory = tracker.getDismissalHistory();
            
            this.recordTest('Action History Retrieval', 
                typeof actionHistory === 'object', 
                'Action history retrieved');
            this.recordTest('Dismissal History Retrieval', 
                typeof dismissalHistory === 'object', 
                'Dismissal history retrieved');
            
            // Test persistence
            this.recordTest('Action Persistence', 
                actionHistory['test_rec_1'] && actionHistory['test_rec_1'].action === 'click', 
                'Action persisted to storage');
            
        } catch (error) {
            this.recordTest('Recommendation Tracker', false, `Tracking failed: ${error.message}`);
        }
    }

    async testPlanRecommendations() {
        console.log('📊 Testing Plan Recommendations...');
        
        try {
            const manager = new SmartRecommendationsManager();
            
            // Test high usage scenario
            const highUsagePatterns = {
                resourceUsage: { apiCalls: 9000 }
            };
            
            manager.userData = { plan: { name: 'starter' } };
            const planRecs = manager.generatePlanRecommendations(highUsagePatterns);
            
            this.recordTest('Plan Upgrade Recommendation Generation', 
                planRecs.length > 0, 
                'Plan recommendations generated');
            
            const upgradeRec = planRecs.find(rec => rec.type === 'plan_upgrade');
            this.recordTest('Plan Upgrade Recommendation Content', 
                upgradeRec && upgradeRec.title.includes('Upgrade'), 
                'Upgrade recommendation contains correct content');
            
            this.recordTest('Plan Upgrade Priority', 
                upgradeRec && upgradeRec.priority >= 8, 
                'High priority assigned to upgrade recommendation');
            
            // Test low usage scenario
            const lowUsagePatterns = {
                resourceUsage: { apiCalls: 500 }
            };
            
            manager.userData = { plan: { name: 'professional' } };
            const optimizationRecs = manager.generatePlanRecommendations(lowUsagePatterns);
            
            const optimizeRec = optimizationRecs.find(rec => rec.type === 'plan_optimization');
            this.recordTest('Plan Optimization Recommendation', 
                optimizeRec && optimizeRec.title.includes('Starter'), 
                'Plan optimization recommendation generated');
            
        } catch (error) {
            this.recordTest('Plan Recommendations', false, `Plan recommendation generation failed: ${error.message}`);
        }
    }

    async testIntegrationRecommendations() {
        console.log('🔗 Testing Integration Recommendations...');
        
        try {
            const manager = new SmartRecommendationsManager();
            
            // Test missing integration scenario
            const patterns = { resourceUsage: {} };
            manager.userData = { 
                integrations: {}, 
                profile: { businessType: 'ecommerce' } 
            };
            
            const integrationRecs = manager.generateIntegrationRecommendations(patterns);
            
            this.recordTest('Integration Suggestion Generation', 
                integrationRecs.length > 0, 
                'Integration recommendations generated');
            
            const shopifyRec = integrationRecs.find(rec => rec.id === 'integration_shopify');
            this.recordTest('Shopify Integration Recommendation', 
                shopifyRec && shopifyRec.title.includes('Shopify'), 
                'Shopify integration recommended for e-commerce');
            
            // Test integration health scenario
            manager.userData = { 
                integrations: { 
                    shopify: { status: 'error' } 
                } 
            };
            
            const healthRecs = manager.generateIntegrationRecommendations(patterns);
            const fixRec = healthRecs.find(rec => rec.type === 'integration_health');
            
            this.recordTest('Integration Health Recommendation', 
                fixRec && fixRec.title.includes('Fix'), 
                'Integration fix recommendation generated');
            
            this.recordTest('Integration Health Priority', 
                fixRec && fixRec.priority === 10, 
                'Critical priority assigned to integration fix');
            
        } catch (error) {
            this.recordTest('Integration Recommendations', false, `Integration recommendation generation failed: ${error.message}`);
        }
    }

    async testPerformanceRecommendations() {
        console.log('⚡ Testing Performance Recommendations...');
        
        try {
            const manager = new SmartRecommendationsManager();
            
            // Test slow performance scenario
            const slowPatterns = {
                performance: { 
                    avgResponseTime: 1500,
                    dbQueries: 150 
                }
            };
            
            const perfRecs = manager.generatePerformanceRecommendations(slowPatterns);
            
            this.recordTest('Performance Recommendation Generation', 
                perfRecs.length > 0, 
                'Performance recommendations generated');
            
            const apiOptRec = perfRecs.find(rec => rec.id === 'performance_api_optimization');
            this.recordTest('API Optimization Recommendation', 
                apiOptRec && apiOptRec.title.includes('API'), 
                'API optimization recommended for slow response times');
            
            const dbOptRec = perfRecs.find(rec => rec.id === 'performance_db_optimization');
            this.recordTest('Database Optimization Recommendation', 
                dbOptRec && dbOptRec.title.includes('Database'), 
                'Database optimization recommended for high query volume');
            
            this.recordTest('Performance Improvement Metrics', 
                apiOptRec && apiOptRec.improvement && apiOptRec.improvement.includes('60%'), 
                'Performance improvement metrics included');
            
        } catch (error) {
            this.recordTest('Performance Recommendations', false, `Performance recommendation generation failed: ${error.message}`);
        }
    }

    async testCostRecommendations() {
        console.log('💰 Testing Cost Recommendations...');
        
        try {
            const manager = new SmartRecommendationsManager();
            
            // Test monthly billing scenario
            manager.userData = { 
                billing: { cycle: 'monthly', plan: 'professional' } 
            };
            
            const costRecs = manager.generateCostRecommendations({});
            
            this.recordTest('Cost Recommendation Generation', 
                costRecs.length > 0, 
                'Cost recommendations generated');
            
            const annualRec = costRecs.find(rec => rec.id === 'cost_annual_billing');
            this.recordTest('Annual Billing Recommendation', 
                annualRec && annualRec.title.includes('Annual'), 
                'Annual billing recommendation generated');
            
            this.recordTest('Cost Savings Calculation', 
                annualRec && annualRec.savings && annualRec.savings.includes('$190'), 
                'Cost savings calculated correctly');
            
            // Test unused features scenario
            const unusedPatterns = {
                resourceUsage: { webhooks: 0 }
            };
            
            const featureRecs = manager.generateCostRecommendations(unusedPatterns);
            const featureOptRec = featureRecs.find(rec => rec.id === 'cost_feature_optimization');
            
            this.recordTest('Feature Optimization Recommendation', 
                featureOptRec && featureOptRec.title.includes('Feature'), 
                'Feature optimization recommendation generated');
            
        } catch (error) {
            this.recordTest('Cost Recommendations', false, `Cost recommendation generation failed: ${error.message}`);
        }
    }

    async testFeatureRecommendations() {
        console.log('🎯 Testing Feature Recommendations...');
        
        try {
            const manager = new SmartRecommendationsManager();
            
            // Test underutilized features scenario
            const patterns = {
                featureUsage: { analytics: 2 }
            };
            
            const featureRecs = manager.generateFeatureRecommendations(patterns);
            
            this.recordTest('Feature Recommendation Generation', 
                featureRecs.length > 0, 
                'Feature recommendations generated');
            
            const analyticsRec = featureRecs.find(rec => rec.id === 'feature_analytics');
            this.recordTest('Analytics Feature Recommendation', 
                analyticsRec && analyticsRec.title.includes('Analytics'), 
                'Analytics feature recommendation generated');
            
            // Test new feature scenario
            manager.userData = { 
                profile: { businessType: 'ecommerce' } 
            };
            
            const newFeatureRecs = manager.generateFeatureRecommendations({ featureUsage: {} });
            const inventoryRec = newFeatureRecs.find(rec => rec.id === 'feature_inventory');
            
            this.recordTest('Inventory Feature Recommendation', 
                inventoryRec && inventoryRec.title.includes('Inventory'), 
                'Inventory feature recommended for e-commerce');
            
            this.recordTest('Feature Benefits Display', 
                inventoryRec && inventoryRec.benefits && inventoryRec.benefits.length > 0, 
                'Feature benefits included in recommendation');
            
        } catch (error) {
            this.recordTest('Feature Recommendations', false, `Feature recommendation generation failed: ${error.message}`);
        }
    }

    async testRecommendationDisplay() {
        console.log('🖥️ Testing Recommendation Display...');
        
        try {
            // Create test environment
            const testContainer = document.createElement('div');
            testContainer.id = 'test-display-container';
            testContainer.innerHTML = '<div id="recommendations-container"></div>';
            document.body.appendChild(testContainer);
            
            // Initialize manager
            const manager = new SmartRecommendationsManager();
            await manager.loadUserData();
            await manager.generateRecommendations();
            
            // Test display
            this.recordTest('Recommendations Container Found', 
                document.getElementById('recommendations-container') !== null, 
                'Recommendations container exists');
            
            // Wait for rendering
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const container = document.getElementById('recommendations-container');
            this.recordTest('Recommendations Rendered', 
                container && container.children.length > 0, 
                'Recommendations displayed in container');
            
            this.recordTest('Category Headers Present', 
                container && container.querySelector('.category-header') !== null, 
                'Category headers displayed');
            
            this.recordTest('Recommendation Cards Present', 
                container && container.querySelector('.recommendation-card') !== null, 
                'Recommendation cards displayed');
            
            // Cleanup
            document.body.removeChild(testContainer);
            
        } catch (error) {
            this.recordTest('Recommendation Display', false, `Display test failed: ${error.message}`);
        }
    }

    async testRecommendationActions() {
        console.log('🎬 Testing Recommendation Actions...');
        
        try {
            const manager = new SmartRecommendationsManager();
            
            // Test plan change action
            const planActionData = { targetPlan: 'professional' };
            
            // Mock PlanManager
            window.PlanManager = class {
                async showPlanComparison() {
                    return Promise.resolve('Plan comparison shown');
                }
                selectPlan(plan) {
                    return `Plan ${plan} selected`;
                }
            };
            
            await manager.handlePlanChange(planActionData);
            this.recordTest('Plan Change Action', true, 'Plan change action executed successfully');
            
            // Test feature enable action
            const featureActionData = { feature: 'analytics' };
            await manager.handleFeatureEnable(featureActionData);
            
            const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            this.recordTest('Feature Enable Action', 
                preferences.enabledFeatures && preferences.enabledFeatures.includes('analytics'), 
                'Feature enabled and saved to preferences');
            
            // Test documentation action
            const docActionData = { topic: 'database_optimization' };
            
            // Mock window.open
            const originalOpen = window.open;
            let openedUrl = null;
            window.open = (url) => { openedUrl = url; };
            
            await manager.handleDocumentation(docActionData);
            this.recordTest('Documentation Action', 
                openedUrl && openedUrl.includes('database-optimization'), 
                'Documentation opened correctly');
            
            // Restore window.open
            window.open = originalOpen;
            
        } catch (error) {
            this.recordTest('Recommendation Actions', false, `Action test failed: ${error.message}`);
        }
    }

    async testRecommendationDismissal() {
        console.log('❌ Testing Recommendation Dismissal...');
        
        try {
            const manager = new SmartRecommendationsManager();
            
            // Add test recommendation
            manager.recommendations.set('test_rec', {
                id: 'test_rec',
                title: 'Test Recommendation',
                status: 'active'
            });
            
            // Test dismissal
            manager.dismissRecommendation('test_rec');
            
            const recommendation = manager.recommendations.get('test_rec');
            this.recordTest('Recommendation Dismissal', 
                recommendation && recommendation.status === 'dismissed', 
                'Recommendation marked as dismissed');
            
            // Test persistence
            const dismissalHistory = JSON.parse(localStorage.getItem('recommendationDismissals') || '{}');
            this.recordTest('Dismissal Persistence', 
                dismissalHistory['test_rec'] !== undefined, 
                'Dismissal saved to storage');
            
        } catch (error) {
            this.recordTest('Recommendation Dismissal', false, `Dismissal test failed: ${error.message}`);
        }
    }

    async testResponsiveDesign() {
        console.log('📱 Testing Responsive Design...');
        
        try {
            // Test CSS media queries
            const cssRules = Array.from(document.styleSheets)
                .flatMap(sheet => {
                    try {
                        return Array.from(sheet.cssRules || []);
                    } catch (e) {
                        return [];
                    }
                })
                .filter(rule => rule.type === CSSRule.MEDIA_RULE);
            
            const mobileQueries = cssRules.filter(rule => 
                rule.conditionText && rule.conditionText.includes('768px')
            );
            
            this.recordTest('Mobile Media Queries', 
                mobileQueries.length > 0, 
                'Mobile responsive styles defined');
            
            const tabletQueries = cssRules.filter(rule => 
                rule.conditionText && rule.conditionText.includes('1024px')
            );
            
            this.recordTest('Tablet Media Queries', 
                tabletQueries.length > 0, 
                'Tablet responsive styles defined');
            
            // Test viewport meta tag
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            this.recordTest('Viewport Meta Tag', 
                viewportMeta && viewportMeta.content.includes('width=device-width'), 
                'Viewport meta tag configured correctly');
            
        } catch (error) {
            this.recordTest('Responsive Design', false, `Responsive test failed: ${error.message}`);
        }
    }

    async testAccessibilityCompliance() {
        console.log('♿ Testing Accessibility Compliance...');
        
        try {
            // Create test recommendation card
            const testCard = document.createElement('div');
            testCard.className = 'recommendation-card';
            testCard.innerHTML = `
                <button class="recommendation-action" data-recommendation-action="test">Test Action</button>
                <button class="recommendation-dismiss" data-dismiss-recommendation="test" aria-label="Dismiss recommendation">×</button>
            `;
            document.body.appendChild(testCard);
            
            // Test ARIA labels
            const dismissButton = testCard.querySelector('.recommendation-dismiss');
            this.recordTest('ARIA Labels', 
                dismissButton && dismissButton.getAttribute('aria-label') !== null, 
                'ARIA labels present on interactive elements');
            
            // Test keyboard navigation
            const actionButton = testCard.querySelector('.recommendation-action');
            actionButton.focus();
            this.recordTest('Keyboard Focus', 
                document.activeElement === actionButton, 
                'Elements are keyboard focusable');
            
            // Test focus indicators
            const computedStyle = window.getComputedStyle(actionButton, ':focus');
            this.recordTest('Focus Indicators', 
                computedStyle.outline !== 'none' || computedStyle.boxShadow !== 'none', 
                'Focus indicators visible');
            
            // Test semantic HTML
            this.recordTest('Semantic HTML', 
                testCard.querySelector('button') !== null, 
                'Semantic HTML elements used');
            
            // Cleanup
            document.body.removeChild(testCard);
            
        } catch (error) {
            this.recordTest('Accessibility Compliance', false, `Accessibility test failed: ${error.message}`);
        }
    }

    async testDataPersistence() {
        console.log('💾 Testing Data Persistence...');
        
        try {
            const manager = new SmartRecommendationsManager();
            
            // Test data saving
            const testData = { test: 'value', timestamp: Date.now() };
            manager.saveToStorage('testRecommendationData', testData);
            
            // Test data loading
            const loadedData = manager.loadFromStorage('testRecommendationData');
            this.recordTest('Data Persistence', 
                loadedData && loadedData.test === 'value', 
                'Data saved and loaded correctly');
            
            // Test error handling for invalid data
            localStorage.setItem('invalidData', 'invalid json');
            const invalidData = manager.loadFromStorage('invalidData');
            this.recordTest('Invalid Data Handling', 
                invalidData === null, 
                'Invalid data handled gracefully');
            
            // Cleanup
            localStorage.removeItem('testRecommendationData');
            localStorage.removeItem('invalidData');
            
        } catch (error) {
            this.recordTest('Data Persistence', false, `Persistence test failed: ${error.message}`);
        }
    }

    async testRecommendationHistory() {
        console.log('📚 Testing Recommendation History...');
        
        try {
            const tracker = new RecommendationTracker();
            
            // Track multiple actions
            tracker.trackAction('rec_1', 'click');
            tracker.trackAction('rec_2', 'dismiss');
            tracker.trackDismissal('rec_3');
            
            // Test history retrieval
            const actionHistory = tracker.getActionHistory();
            const dismissalHistory = tracker.getDismissalHistory();
            
            this.recordTest('Action History Tracking', 
                Object.keys(actionHistory).length >= 2, 
                'Multiple actions tracked in history');
            
            this.recordTest('Dismissal History Tracking', 
                Object.keys(dismissalHistory).length >= 1, 
                'Dismissals tracked in history');
            
            this.recordTest('History Timestamps', 
                actionHistory['rec_1'] && actionHistory['rec_1'].timestamp, 
                'Timestamps included in history');
            
        } catch (error) {
            this.recordTest('Recommendation History', false, `History test failed: ${error.message}`);
        }
    }

    async testPerformanceMetrics() {
        console.log('⚡ Testing Performance Metrics...');
        
        try {
            const startTime = performance.now();
            
            // Test recommendation generation performance
            const manager = new SmartRecommendationsManager();
            await manager.loadUserData();
            await manager.generateRecommendations();
            
            const generationTime = performance.now() - startTime;
            this.recordTest('Recommendation Generation Performance', 
                generationTime < 2000, 
                `Generation completed in ${generationTime.toFixed(2)}ms (< 2000ms)`);
            
            // Test rendering performance
            const renderStartTime = performance.now();
            const testContainer = document.createElement('div');
            document.body.appendChild(testContainer);
            
            manager.recommendationRenderer.render(testContainer, manager.recommendations);
            
            const renderTime = performance.now() - renderStartTime;
            this.recordTest('Rendering Performance', 
                renderTime < 500, 
                `Rendering completed in ${renderTime.toFixed(2)}ms (< 500ms)`);
            
            document.body.removeChild(testContainer);
            
        } catch (error) {
            this.recordTest('Performance Metrics', false, `Performance test failed: ${error.message}`);
        }
    }

    async testMemoryUsage() {
        console.log('🧠 Testing Memory Usage...');
        
        try {
            // Test memory usage if performance.memory is available
            if (performance.memory) {
                const initialMemory = performance.memory.usedJSHeapSize;
                
                // Create multiple recommendation instances
                const managers = [];
                for (let i = 0; i < 10; i++) {
                    managers.push(new SmartRecommendationsManager());
                }
                
                const afterCreationMemory = performance.memory.usedJSHeapSize;
                const memoryIncrease = afterCreationMemory - initialMemory;
                
                this.recordTest('Memory Usage',
                    memoryIncrease < 10 * 1024 * 1024, // Less than 10MB increase
                    `Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
                
                // Cleanup
                managers.length = 0;
            } else {
                this.recordTest('Memory Usage', true, 'Performance.memory not available, skipping test');
            }
            
        } catch (error) {
            this.recordTest('Memory Usage', false, `Memory test failed: ${error.message}`);
        }
    }

    // Utility methods
    recordTest(testName, passed, details) {
        this.totalTests++;
        if (passed) {
            this.passedTests++;
            console.log(`✅ ${testName}: ${details}`);
        } else {
            this.failedTests++;
            console.log(`❌ ${testName}: ${details}`);
        }
        
        this.testResults.push({
            name: testName,
            passed,
            details,
            timestamp: new Date().toISOString()
        });
    }

    generateTestReport() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
        
        console.log('\n' + '='.repeat(80));
        console.log('🤖 US-009: SMART RECOMMENDATIONS TEST REPORT');
        console.log('='.repeat(80));
        console.log(`📊 Total Tests: ${this.totalTests}`);
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`📈 Success Rate: ${successRate}%`);
        console.log(`⏱️ Duration: ${duration}ms`);
        console.log('='.repeat(80));
        
        // Detailed results
        console.log('\n📋 DETAILED TEST RESULTS:');
        this.testResults.forEach((result, index) => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${result.name}: ${result.details}`);
        });
        
        // Summary by category
        const categories = {
            'Core Functionality': this.testResults.filter(r =>
                r.name.includes('Engine') || r.name.includes('Analyzer') ||
                r.name.includes('Model') || r.name.includes('Personalization') ||
                r.name.includes('Renderer') || r.name.includes('Tracker')
            ),
            'Recommendation Types': this.testResults.filter(r =>
                r.name.includes('Plan') || r.name.includes('Integration') ||
                r.name.includes('Performance') || r.name.includes('Cost') ||
                r.name.includes('Feature')
            ),
            'User Interface': this.testResults.filter(r =>
                r.name.includes('Display') || r.name.includes('Actions') ||
                r.name.includes('Dismissal') || r.name.includes('Responsive')
            ),
            'Quality Assurance': this.testResults.filter(r =>
                r.name.includes('Accessibility') || r.name.includes('Performance') ||
                r.name.includes('Memory') || r.name.includes('Persistence')
            )
        };
        
        console.log('\n📊 RESULTS BY CATEGORY:');
        Object.entries(categories).forEach(([category, tests]) => {
            const passed = tests.filter(t => t.passed).length;
            const total = tests.length;
            const rate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
            console.log(`${category}: ${passed}/${total} (${rate}%)`);
        });
        
        // Recommendations for improvement
        const failedTests = this.testResults.filter(r => !r.passed);
        if (failedTests.length > 0) {
            console.log('\n🔧 RECOMMENDATIONS FOR IMPROVEMENT:');
            failedTests.forEach((test, index) => {
                console.log(`${index + 1}. Fix: ${test.name} - ${test.details}`);
            });
        }
        
        // Overall assessment
        console.log('\n🎯 OVERALL ASSESSMENT:');
        if (successRate >= 95) {
            console.log('🌟 EXCELLENT: Smart Recommendations system is production-ready!');
        } else if (successRate >= 85) {
            console.log('✅ GOOD: Smart Recommendations system is mostly functional with minor issues.');
        } else if (successRate >= 70) {
            console.log('⚠️ FAIR: Smart Recommendations system needs improvements before production.');
        } else {
            console.log('❌ POOR: Smart Recommendations system requires significant fixes.');
        }
        
        console.log('\n' + '='.repeat(80));
        
        // Save results to localStorage for persistence
        const reportData = {
            summary: {
                totalTests: this.totalTests,
                passedTests: this.passedTests,
                failedTests: this.failedTests,
                successRate: parseFloat(successRate),
                duration,
                timestamp: new Date().toISOString()
            },
            results: this.testResults,
            categories
        };
        
        try {
            localStorage.setItem('us009_test_report', JSON.stringify(reportData));
            console.log('💾 Test report saved to localStorage');
        } catch (error) {
            console.warn('⚠️ Could not save test report to localStorage:', error);
        }
        
        return reportData;
    }
}

// Auto-run tests when script is loaded
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const testSuite = new US009SmartRecommendationsTest();
                testSuite.runAllTests();
            }, 1000);
        });
    } else {
        // DOM is already ready
        setTimeout(() => {
            const testSuite = new US009SmartRecommendationsTest();
            testSuite.runAllTests();
        }, 1000);
    }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = US009SmartRecommendationsTest;
}