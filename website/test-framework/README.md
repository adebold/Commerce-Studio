# VARAi Commerce Studio - Comprehensive Test Framework

This test framework implements the comprehensive test specifications defined in [`test_specs_LS1.md`](../test_specs_LS1.md) for the VARAi Commerce Studio website verification.

## 🎯 Overview

The test framework provides automated testing for:

- **Navigation Link Testing** - All internal/external links and mobile navigation
- **VisionCraft Demo Store Integration** - Complete customer journey testing
- **Design System Testing** - VARAi design consistency verification
- **Form & Interactive Testing** - User interaction validation
- **Performance Testing** - Page load and optimization verification
- **Accessibility Testing** - WCAG compliance validation
- **Cross-Browser Testing** - Multi-browser compatibility
- **Security Testing** - Security measures and error handling

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
cd website/test-framework
npm install
```

### Running Tests

```bash
# Run all comprehensive tests
npm test

# Run specific test categories
npm run test:navigation     # Navigation link testing
npm run test:visioncraft    # VisionCraft demo integration
npm run test:design         # Design system testing
npm run test:forms          # Form and interactive elements
npm run test:performance    # Performance testing
npm run test:accessibility  # Accessibility testing
npm run test:security       # Security testing

# Generate reports only
npm run report

# Clean test artifacts
npm run clean
```

## 📊 Test Reports

The framework generates comprehensive reports in multiple formats:

### JSON Report
- **Location**: `./test-reports/comprehensive-test-report.json`
- **Content**: Detailed test results, metrics, and raw data
- **Usage**: Programmatic analysis and CI/CD integration

### HTML Report
- **Location**: `./test-reports/comprehensive-test-report.html`
- **Content**: Visual dashboard with test results and screenshots
- **Usage**: Human-readable test results and debugging

### Screenshots
- **Location**: `./test-screenshots/`
- **Content**: Visual evidence of test execution
- **Types**: Responsive design, functionality verification, error states

## 🧪 Test Categories

### 1. Navigation Link Testing (NAV-001)

Tests all navigation functionality across the website:

```javascript
// Example test execution
const testSuite = new ComprehensiveTestSuite();
await testSuite.testNavigationLinks();
```

**Coverage:**
- Internal navigation links from every page
- Mobile hamburger menu functionality
- CTA button navigation
- Navigation consistency across pages

### 2. VisionCraft Demo Store Integration (DEMO-001)

Verifies the complete customer journey from website to demo store:

```javascript
await testSuite.testVisionCraftIntegration();
```

**Coverage:**
- Demo store link navigation
- Demo store functionality verification
- Cross-platform integration consistency
- Demo store performance testing

### 3. Design System Testing (DESIGN-001)

Validates VARAi design system implementation:

```javascript
await testSuite.testDesignSystem();
```

**Coverage:**
- CSS framework loading
- Color palette consistency
- Typography system
- Responsive design verification
- Asset loading optimization

### 4. Form & Interactive Testing (FORM-001)

Tests user interaction elements:

```javascript
await testSuite.testFormsAndInteractivity();
```

**Coverage:**
- Signup form validation
- Interactive element functionality
- Dashboard interactivity
- Mobile touch interactions

### 5. Performance Testing (PERF-001)

Measures website performance metrics:

```javascript
await testSuite.testPerformance();
```

**Coverage:**
- Page load performance
- Asset optimization
- Core Web Vitals
- Performance thresholds

## 🔧 Configuration

### Test Environment URLs

```javascript
const config = {
    baseUrl: 'https://commerce-studio-website-353252826752.us-central1.run.app',
    visioncraftUrl: 'https://visioncraft-store-353252826752.us-central1.run.app',
    authServiceUrl: 'https://commerce-studio-auth-353252826752.us-central1.run.app'
};
```

### Viewport Testing

The framework tests across multiple viewports:

- **Mobile Small**: 320x568 (iPhone SE)
- **Mobile Standard**: 375x667 (iPhone 8)
- **Mobile Large**: 414x896 (iPhone 11)
- **Tablet Portrait**: 768x1024 (iPad)
- **Tablet Landscape**: 1024x768 (iPad Landscape)
- **Desktop Small**: 1366x768 (Laptop)
- **Desktop Standard**: 1920x1080 (Desktop)
- **Desktop Large**: 2560x1440 (Large Desktop)

### Performance Thresholds

```javascript
const thresholds = {
    firstContentfulPaint: 1500,      // ms
    largestContentfulPaint: 2500,    // ms
    cumulativeLayoutShift: 0.1,      // score
    firstInputDelay: 100,            // ms
    totalBlockingTime: 300           // ms
};
```

## 📈 Test Results Interpretation

### Pass Rate Categories

- **🎉 100%**: All tests passed - Ready for production
- **✅ 90-99%**: Most tests passed - Minor issues to address
- **⚠️ 75-89%**: Some tests failed - Review and fix issues
- **❌ <75%**: Many tests failed - Significant issues need attention

### Common Test Failures

1. **Navigation Issues**
   - Broken internal links
   - Mobile menu not functioning
   - Inconsistent navigation structure

2. **VisionCraft Integration**
   - Demo store not loading
   - Missing external link targets
   - Performance issues

3. **Design System**
   - Missing VARAi CSS framework
   - Responsive design problems
   - Asset loading failures

4. **Performance**
   - Slow page load times
   - Large unoptimized assets
   - Poor Core Web Vitals scores

## 🛠️ Development

### Adding New Tests

1. **Create test method** in `ComprehensiveTestSuite` class
2. **Add to test runner** in `runAllTests()` method
3. **Update test specifications** in `test_specs_LS1.md`
4. **Add npm script** in `package.json`

### Example Test Method

```javascript
async testNewFeature() {
    console.log('\n🔧 Testing New Feature');
    
    try {
        await this.page.goto(`${this.config.baseUrl}/new-feature`);
        
        const featureTest = await this.page.evaluate(() => {
            return {
                hasFeature: !!document.querySelector('.new-feature'),
                isWorking: document.querySelector('.new-feature').textContent.includes('working')
            };
        });

        if (featureTest.hasFeature && featureTest.isWorking) {
            this.testResults.newCategory.passed.push({
                test: 'New Feature',
                result: 'Feature working correctly'
            });
        } else {
            this.testResults.newCategory.failed.push({
                test: 'New Feature',
                error: 'Feature not working'
            });
        }

    } catch (error) {
        this.testResults.newCategory.failed.push({
            test: 'New Feature',
            error: error.message
        });
    }
}
```

## 🔍 Debugging

### Common Issues

1. **Puppeteer Launch Failures**
   ```bash
   # Install dependencies
   sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2
   ```

2. **Timeout Issues**
   ```javascript
   // Increase timeout in config
   timeout: 60000  // 60 seconds
   ```

3. **Screenshot Failures**
   ```bash
   # Ensure directory permissions
   chmod 755 test-screenshots
   ```

### Debug Mode

Run tests with additional logging:

```javascript
// Enable debug mode
const testSuite = new ComprehensiveTestSuite();
testSuite.config.debug = true;
```

## 📋 Test Checklist

Before deploying the website, ensure:

- [ ] All navigation links functional
- [ ] VisionCraft demo integration working
- [ ] VARAi design system properly implemented
- [ ] Forms and interactive elements functional
- [ ] Performance benchmarks met
- [ ] Accessibility compliance verified
- [ ] Cross-browser compatibility confirmed
- [ ] Security measures validated
- [ ] Error handling tested
- [ ] Mobile experience optimized

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests following TDD principles
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**VARAi Commerce Studio Test Framework v1.0.0**  
*Ensuring flawless website functionality through comprehensive automated testing*