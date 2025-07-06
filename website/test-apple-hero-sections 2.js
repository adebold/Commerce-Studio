/**
 * Apple.com-Style Hero Sections Implementation Test
 * Verifies all pages have been updated with Apple-style hero sections
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const testConfig = {
    pages: [
        // Main website pages
        { file: 'index.html', name: 'Homepage', expectedHero: 'apple-hero-fullscreen apple-hero-gradient-blue' },
        { file: 'pricing.html', name: 'Pricing', expectedHero: 'apple-hero-medium apple-hero-gradient-light' },
        { file: 'products.html', name: 'Products', expectedHero: 'apple-hero-medium apple-hero-gradient-teal' },
        { file: 'solutions.html', name: 'Solutions', expectedHero: 'apple-hero-medium apple-hero-gradient-dark' },
        { file: 'company.html', name: 'Company', expectedCss: 'apple-hero-sections.css' },
        
        // Customer portal pages
        { file: 'customer/index.html', name: 'Customer Portal', expectedCss: 'apple-hero-sections.css' },
        { file: 'customer/dashboard.html', name: 'Customer Dashboard', expectedCss: 'apple-hero-sections.css' },
        { file: 'customer/settings.html', name: 'Customer Settings', expectedCss: 'apple-hero-sections.css' },
        
        // Additional pages
        { file: 'api-docs.html', name: 'API Documentation', expectedCss: 'apple-hero-sections.css' },
        { file: 'store-locator.html', name: 'Store Locator', expectedCss: 'apple-hero-sections.css' },
        { file: 'demo-login.html', name: 'Demo Login', expectedCss: 'apple-hero-sections.css' }
    ],
    
    requiredCssClasses: [
        'apple-hero',
        'apple-hero-content',
        'apple-hero-title',
        'apple-hero-subtitle',
        'apple-hero-cta',
        'apple-btn',
        'apple-btn-primary',
        'apple-btn-secondary'
    ],
    
    requiredAnimations: [
        'apple-hero-animate',
        'apple-hero-animate-delay-1',
        'apple-hero-animate-delay-2',
        'apple-hero-animate-delay-3'
    ]
};

// Test results
let testResults = {
    passed: 0,
    failed: 0,
    details: []
};

/**
 * Test if a file exists
 */
function testFileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        return false;
    }
}

/**
 * Read file content
 */
function readFileContent(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        return null;
    }
}

/**
 * Test CSS inclusion
 */
function testCssInclusion(content, pageName) {
    const hasCssInclude = content.includes('apple-hero-sections.css');
    
    if (hasCssInclude) {
        testResults.passed++;
        testResults.details.push(`✅ ${pageName}: Apple hero CSS included`);
        return true;
    } else {
        testResults.failed++;
        testResults.details.push(`❌ ${pageName}: Apple hero CSS NOT included`);
        return false;
    }
}

/**
 * Test hero section structure
 */
function testHeroStructure(content, pageName, expectedHero) {
    const hasAppleHero = content.includes('apple-hero');
    const hasHeroContent = content.includes('apple-hero-content');
    const hasHeroTitle = content.includes('apple-hero-title');
    const hasHeroSubtitle = content.includes('apple-hero-subtitle');
    const hasHeroCta = content.includes('apple-hero-cta');
    
    if (expectedHero && content.includes(expectedHero)) {
        testResults.passed++;
        testResults.details.push(`✅ ${pageName}: Correct hero variant (${expectedHero})`);
    } else if (expectedHero) {
        testResults.failed++;
        testResults.details.push(`❌ ${pageName}: Expected hero variant (${expectedHero}) not found`);
    }
    
    if (hasAppleHero && hasHeroContent && hasHeroTitle && hasHeroSubtitle && hasHeroCta) {
        testResults.passed++;
        testResults.details.push(`✅ ${pageName}: Complete Apple hero structure`);
        return true;
    } else {
        testResults.failed++;
        testResults.details.push(`❌ ${pageName}: Incomplete Apple hero structure`);
        return false;
    }
}

/**
 * Test Apple button implementation
 */
function testAppleButtons(content, pageName) {
    const hasAppleBtn = content.includes('apple-btn');
    const hasPrimaryBtn = content.includes('apple-btn-primary');
    const hasSecondaryBtn = content.includes('apple-btn-secondary');
    
    if (hasAppleBtn && (hasPrimaryBtn || hasSecondaryBtn)) {
        testResults.passed++;
        testResults.details.push(`✅ ${pageName}: Apple-style buttons implemented`);
        return true;
    } else {
        testResults.failed++;
        testResults.details.push(`❌ ${pageName}: Apple-style buttons missing`);
        return false;
    }
}

/**
 * Test animations
 */
function testAnimations(content, pageName) {
    const hasAnimations = testConfig.requiredAnimations.some(animation => 
        content.includes(animation)
    );
    
    if (hasAnimations) {
        testResults.passed++;
        testResults.details.push(`✅ ${pageName}: Apple-style animations present`);
        return true;
    } else {
        testResults.failed++;
        testResults.details.push(`❌ ${pageName}: Apple-style animations missing`);
        return false;
    }
}

/**
 * Test responsive design classes
 */
function testResponsiveDesign(content, pageName) {
    const hasResponsiveClasses = content.includes('apple-hero-title-xl') || 
                                content.includes('apple-hero-title-lg') ||
                                content.includes('apple-hero-subtitle-lg');
    
    if (hasResponsiveClasses) {
        testResults.passed++;
        testResults.details.push(`✅ ${pageName}: Responsive typography classes`);
        return true;
    } else {
        testResults.failed++;
        testResults.details.push(`❌ ${pageName}: Responsive typography classes missing`);
        return false;
    }
}

/**
 * Test Apple CSS file
 */
function testAppleCssFile() {
    const cssPath = path.join(__dirname, 'css', 'apple-hero-sections.css');
    
    if (!testFileExists(cssPath)) {
        testResults.failed++;
        testResults.details.push('❌ Apple hero sections CSS file missing');
        return false;
    }
    
    const cssContent = readFileContent(cssPath);
    if (!cssContent) {
        testResults.failed++;
        testResults.details.push('❌ Apple hero sections CSS file unreadable');
        return false;
    }
    
    // Test for required CSS classes
    const missingClasses = testConfig.requiredCssClasses.filter(className => 
        !cssContent.includes(`.${className}`)
    );
    
    if (missingClasses.length === 0) {
        testResults.passed++;
        testResults.details.push('✅ Apple hero sections CSS: All required classes present');
    } else {
        testResults.failed++;
        testResults.details.push(`❌ Apple hero sections CSS: Missing classes: ${missingClasses.join(', ')}`);
    }
    
    // Test for responsive design
    if (cssContent.includes('@media (max-width: 768px)')) {
        testResults.passed++;
        testResults.details.push('✅ Apple hero sections CSS: Responsive design included');
    } else {
        testResults.failed++;
        testResults.details.push('❌ Apple hero sections CSS: Responsive design missing');
    }
    
    // Test for animations
    if (cssContent.includes('@keyframes appleHeroFadeIn')) {
        testResults.passed++;
        testResults.details.push('✅ Apple hero sections CSS: Animations included');
    } else {
        testResults.failed++;
        testResults.details.push('❌ Apple hero sections CSS: Animations missing');
    }
    
    // Test for accessibility
    if (cssContent.includes('@media (prefers-reduced-motion: reduce)')) {
        testResults.passed++;
        testResults.details.push('✅ Apple hero sections CSS: Accessibility support included');
    } else {
        testResults.failed++;
        testResults.details.push('❌ Apple hero sections CSS: Accessibility support missing');
    }
    
    return true;
}

/**
 * Run all tests
 */
function runTests() {
    console.log('🍎 Apple.com-Style Hero Sections Implementation Test');
    console.log('=' .repeat(60));
    
    // Test CSS file first
    testAppleCssFile();
    
    // Test each page
    testConfig.pages.forEach(page => {
        const filePath = path.join(__dirname, page.file);
        
        if (!testFileExists(filePath)) {
            testResults.failed++;
            testResults.details.push(`❌ ${page.name}: File not found (${page.file})`);
            return;
        }
        
        const content = readFileContent(filePath);
        if (!content) {
            testResults.failed++;
            testResults.details.push(`❌ ${page.name}: File unreadable`);
            return;
        }
        
        // Test CSS inclusion
        testCssInclusion(content, page.name);
        
        // Test hero structure if expected
        if (page.expectedHero) {
            testHeroStructure(content, page.name, page.expectedHero);
            testAppleButtons(content, page.name);
            testAnimations(content, page.name);
            testResponsiveDesign(content, page.name);
        }
    });
    
    // Print results
    console.log('\n📊 Test Results:');
    console.log('-'.repeat(40));
    testResults.details.forEach(detail => console.log(detail));
    
    console.log('\n📈 Summary:');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📊 Total: ${testResults.passed + testResults.failed}`);
    console.log(`🎯 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    if (testResults.failed === 0) {
        console.log('\n🎉 All tests passed! Apple.com-style hero sections successfully implemented.');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the implementation.');
    }
    
    return testResults.failed === 0;
}

// Run tests if called directly
if (require.main === module) {
    runTests();
}

module.exports = { runTests, testConfig, testResults };