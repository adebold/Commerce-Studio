#!/usr/bin/env node

/**
 * SEO and Accessibility Audit Script
 * Comprehensive analysis and optimization for VARAi Commerce Studio
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SEOAccessibilityAuditor {
    constructor() {
        this.browser = null;
        this.page = null;
        this.config = {
            baseUrl: 'https://commerce-studio-website-353252826752.us-central1.run.app',
            timeout: 30000,
            reportDir: './audit-reports'
        };
        
        this.testPages = [
            { path: '/', name: 'Home', priority: 'critical' },
            { path: '/products.html', name: 'Products', priority: 'high' },
            { path: '/solutions.html', name: 'Solutions', priority: 'high' },
            { path: '/pricing.html', name: 'Pricing', priority: 'high' },
            { path: '/contact.html', name: 'Contact', priority: 'medium' },
            { path: '/signup/index.html', name: 'Signup', priority: 'critical' },
            { path: '/demo-login.html', name: 'Demo Login', priority: 'medium' }
        ];
        
        this.auditResults = {
            seo: { passed: [], failed: [], score: 0 },
            accessibility: { passed: [], failed: [], score: 0 },
            performance: { passed: [], failed: [], score: 0 },
            bestPractices: { passed: [], failed: [], score: 0 }
        };
    }

    async init() {
        console.log('🔍 Initializing SEO & Accessibility Audit');
        
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
        await this.page.setUserAgent('Mozilla/5.0 (SEO-Accessibility-Auditor) VARAi-Audit/1.0');
    }

    async auditSEO() {
        console.log('\n📊 Conducting SEO Audit');
        console.log('======================');

        for (const testPage of this.testPages) {
            console.log(`\n🔍 SEO Audit: ${testPage.name}`);
            
            try {
                await this.page.goto(`${this.config.baseUrl}${testPage.path}`, { 
                    waitUntil: 'networkidle0',
                    timeout: this.config.timeout
                });

                const seoData = await this.page.evaluate(() => {
                    const data = {
                        title: document.title,
                        metaDescription: '',
                        metaKeywords: '',
                        h1Tags: [],
                        h2Tags: [],
                        images: [],
                        links: [],
                        canonicalUrl: '',
                        ogTags: {},
                        twitterTags: {},
                        structuredData: [],
                        lang: document.documentElement.lang,
                        viewport: ''
                    };

                    // Meta tags
                    const metaTags = document.querySelectorAll('meta');
                    metaTags.forEach(meta => {
                        const name = meta.getAttribute('name') || meta.getAttribute('property');
                        const content = meta.getAttribute('content');
                        
                        if (name === 'description') data.metaDescription = content;
                        if (name === 'keywords') data.metaKeywords = content;
                        if (name === 'viewport') data.viewport = content;
                        if (name && name.startsWith('og:')) data.ogTags[name] = content;
                        if (name && name.startsWith('twitter:')) data.twitterTags[name] = content;
                    });

                    // Canonical URL
                    const canonical = document.querySelector('link[rel="canonical"]');
                    if (canonical) data.canonicalUrl = canonical.href;

                    // Headings
                    data.h1Tags = Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim());
                    data.h2Tags = Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim());

                    // Images
                    data.images = Array.from(document.querySelectorAll('img')).map(img => ({
                        src: img.src,
                        alt: img.alt,
                        title: img.title,
                        hasAlt: !!img.alt,
                        hasTitle: !!img.title
                    }));

                    // Links
                    data.links = Array.from(document.querySelectorAll('a')).map(link => ({
                        href: link.href,
                        text: link.textContent.trim(),
                        title: link.title,
                        hasTitle: !!link.title,
                        isExternal: link.hostname !== window.location.hostname,
                        hasNofollow: link.rel.includes('nofollow')
                    }));

                    // Structured data
                    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
                    scripts.forEach(script => {
                        try {
                            data.structuredData.push(JSON.parse(script.textContent));
                        } catch (e) {
                            // Invalid JSON
                        }
                    });

                    return data;
                });

                // Evaluate SEO criteria
                let seoScore = 0;
                let maxScore = 0;

                // Title tag (10 points)
                maxScore += 10;
                if (seoData.title && seoData.title.length >= 30 && seoData.title.length <= 60) {
                    seoScore += 10;
                    this.auditResults.seo.passed.push({
                        page: testPage.name,
                        test: 'Title Tag',
                        result: `Good title length: ${seoData.title.length} characters`,
                        score: 10
                    });
                } else {
                    this.auditResults.seo.failed.push({
                        page: testPage.name,
                        test: 'Title Tag',
                        error: `Title length ${seoData.title ? seoData.title.length : 0} characters (should be 30-60)`,
                        severity: 'HIGH'
                    });
                }

                // Meta description (10 points)
                maxScore += 10;
                if (seoData.metaDescription && seoData.metaDescription.length >= 120 && seoData.metaDescription.length <= 160) {
                    seoScore += 10;
                    this.auditResults.seo.passed.push({
                        page: testPage.name,
                        test: 'Meta Description',
                        result: `Good description length: ${seoData.metaDescription.length} characters`,
                        score: 10
                    });
                } else {
                    this.auditResults.seo.failed.push({
                        page: testPage.name,
                        test: 'Meta Description',
                        error: `Description length ${seoData.metaDescription ? seoData.metaDescription.length : 0} characters (should be 120-160)`,
                        severity: 'HIGH'
                    });
                }

                // H1 tag (8 points)
                maxScore += 8;
                if (seoData.h1Tags.length === 1) {
                    seoScore += 8;
                    this.auditResults.seo.passed.push({
                        page: testPage.name,
                        test: 'H1 Tag',
                        result: `Single H1 tag found: "${seoData.h1Tags[0]}"`,
                        score: 8
                    });
                } else {
                    this.auditResults.seo.failed.push({
                        page: testPage.name,
                        test: 'H1 Tag',
                        error: `Found ${seoData.h1Tags.length} H1 tags (should be exactly 1)`,
                        severity: 'MEDIUM'
                    });
                }

                // Image alt attributes (8 points)
                maxScore += 8;
                const imagesWithoutAlt = seoData.images.filter(img => !img.hasAlt);
                if (imagesWithoutAlt.length === 0 && seoData.images.length > 0) {
                    seoScore += 8;
                    this.auditResults.seo.passed.push({
                        page: testPage.name,
                        test: 'Image Alt Attributes',
                        result: `All ${seoData.images.length} images have alt attributes`,
                        score: 8
                    });
                } else {
                    this.auditResults.seo.failed.push({
                        page: testPage.name,
                        test: 'Image Alt Attributes',
                        error: `${imagesWithoutAlt.length} images missing alt attributes`,
                        severity: 'MEDIUM'
                    });
                }

                // Open Graph tags (6 points)
                maxScore += 6;
                const requiredOgTags = ['og:title', 'og:description', 'og:image', 'og:url'];
                const missingOgTags = requiredOgTags.filter(tag => !seoData.ogTags[tag]);
                if (missingOgTags.length === 0) {
                    seoScore += 6;
                    this.auditResults.seo.passed.push({
                        page: testPage.name,
                        test: 'Open Graph Tags',
                        result: 'All required OG tags present',
                        score: 6
                    });
                } else {
                    this.auditResults.seo.failed.push({
                        page: testPage.name,
                        test: 'Open Graph Tags',
                        error: `Missing OG tags: ${missingOgTags.join(', ')}`,
                        severity: 'MEDIUM'
                    });
                }

                // Structured data (6 points)
                maxScore += 6;
                if (seoData.structuredData.length > 0) {
                    seoScore += 6;
                    this.auditResults.seo.passed.push({
                        page: testPage.name,
                        test: 'Structured Data',
                        result: `Found ${seoData.structuredData.length} structured data blocks`,
                        score: 6
                    });
                } else {
                    this.auditResults.seo.failed.push({
                        page: testPage.name,
                        test: 'Structured Data',
                        error: 'No structured data found',
                        severity: 'LOW'
                    });
                }

                // Language attribute (4 points)
                maxScore += 4;
                if (seoData.lang) {
                    seoScore += 4;
                    this.auditResults.seo.passed.push({
                        page: testPage.name,
                        test: 'Language Attribute',
                        result: `Language set to: ${seoData.lang}`,
                        score: 4
                    });
                } else {
                    this.auditResults.seo.failed.push({
                        page: testPage.name,
                        test: 'Language Attribute',
                        error: 'No lang attribute on html element',
                        severity: 'LOW'
                    });
                }

                // Viewport meta tag (4 points)
                maxScore += 4;
                if (seoData.viewport) {
                    seoScore += 4;
                    this.auditResults.seo.passed.push({
                        page: testPage.name,
                        test: 'Viewport Meta Tag',
                        result: `Viewport configured: ${seoData.viewport}`,
                        score: 4
                    });
                } else {
                    this.auditResults.seo.failed.push({
                        page: testPage.name,
                        test: 'Viewport Meta Tag',
                        error: 'No viewport meta tag found',
                        severity: 'HIGH'
                    });
                }

                const pageScore = Math.round((seoScore / maxScore) * 100);
                console.log(`   📊 SEO Score: ${pageScore}% (${seoScore}/${maxScore})`);

            } catch (error) {
                console.log(`   ❌ SEO Audit Error: ${error.message}`);
                this.auditResults.seo.failed.push({
                    page: testPage.name,
                    test: 'Page Load',
                    error: `Failed to load page: ${error.message}`,
                    severity: 'HIGH'
                });
            }
        }
    }

    async auditAccessibility() {
        console.log('\n♿ Conducting Accessibility Audit');
        console.log('=================================');

        for (const testPage of this.testPages) {
            console.log(`\n🔍 Accessibility Audit: ${testPage.name}`);
            
            try {
                await this.page.goto(`${this.config.baseUrl}${testPage.path}`, { 
                    waitUntil: 'networkidle0',
                    timeout: this.config.timeout
                });

                const accessibilityData = await this.page.evaluate(() => {
                    const data = {
                        focusableElements: [],
                        images: [],
                        forms: [],
                        headingStructure: [],
                        colorContrast: [],
                        ariaLabels: [],
                        landmarks: []
                    };

                    // Focusable elements
                    const focusableSelectors = 'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
                    data.focusableElements = Array.from(document.querySelectorAll(focusableSelectors)).map(el => ({
                        tagName: el.tagName,
                        hasTabIndex: el.hasAttribute('tabindex'),
                        tabIndex: el.tabIndex,
                        hasAriaLabel: el.hasAttribute('aria-label'),
                        hasAriaLabelledBy: el.hasAttribute('aria-labelledby'),
                        text: el.textContent.trim().substring(0, 50)
                    }));

                    // Images accessibility
                    data.images = Array.from(document.querySelectorAll('img')).map(img => ({
                        src: img.src,
                        alt: img.alt,
                        hasAlt: !!img.alt,
                        isDecorative: img.alt === '',
                        hasAriaLabel: img.hasAttribute('aria-label'),
                        role: img.getAttribute('role')
                    }));

                    // Form accessibility
                    data.forms = Array.from(document.querySelectorAll('form')).map(form => {
                        const inputs = Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
                            type: input.type,
                            hasLabel: !!form.querySelector(`label[for="${input.id}"]`) || input.hasAttribute('aria-label'),
                            hasAriaDescribedBy: input.hasAttribute('aria-describedby'),
                            required: input.required,
                            hasAriaRequired: input.hasAttribute('aria-required')
                        }));
                        
                        return {
                            action: form.action,
                            method: form.method,
                            inputs: inputs
                        };
                    });

                    // Heading structure
                    for (let i = 1; i <= 6; i++) {
                        const headings = Array.from(document.querySelectorAll(`h${i}`));
                        headings.forEach(heading => {
                            data.headingStructure.push({
                                level: i,
                                text: heading.textContent.trim(),
                                hasId: !!heading.id
                            });
                        });
                    }

                    // ARIA landmarks
                    const landmarkSelectors = '[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"], header, nav, main, aside, footer';
                    data.landmarks = Array.from(document.querySelectorAll(landmarkSelectors)).map(el => ({
                        tagName: el.tagName,
                        role: el.getAttribute('role') || el.tagName.toLowerCase(),
                        hasAriaLabel: el.hasAttribute('aria-label'),
                        hasAriaLabelledBy: el.hasAttribute('aria-labelledby')
                    }));

                    return data;
                });

                // Evaluate accessibility criteria
                let a11yScore = 0;
                let maxScore = 0;

                // Focusable elements have proper focus indicators (15 points)
                maxScore += 15;
                const focusableCount = accessibilityData.focusableElements.length;
                if (focusableCount > 0) {
                    a11yScore += 15;
                    this.auditResults.accessibility.passed.push({
                        page: testPage.name,
                        test: 'Focusable Elements',
                        result: `Found ${focusableCount} focusable elements`,
                        score: 15
                    });
                } else {
                    this.auditResults.accessibility.failed.push({
                        page: testPage.name,
                        test: 'Focusable Elements',
                        error: 'No focusable elements found',
                        severity: 'HIGH'
                    });
                }

                // Images have alt text (15 points)
                maxScore += 15;
                const imagesWithoutAlt = accessibilityData.images.filter(img => !img.hasAlt && !img.isDecorative);
                if (imagesWithoutAlt.length === 0) {
                    a11yScore += 15;
                    this.auditResults.accessibility.passed.push({
                        page: testPage.name,
                        test: 'Image Alt Text',
                        result: `All images have appropriate alt text`,
                        score: 15
                    });
                } else {
                    this.auditResults.accessibility.failed.push({
                        page: testPage.name,
                        test: 'Image Alt Text',
                        error: `${imagesWithoutAlt.length} images missing alt text`,
                        severity: 'HIGH'
                    });
                }

                // Form labels (15 points)
                maxScore += 15;
                let formScore = 0;
                let totalInputs = 0;
                accessibilityData.forms.forEach(form => {
                    form.inputs.forEach(input => {
                        totalInputs++;
                        if (input.hasLabel) formScore++;
                    });
                });

                if (totalInputs === 0 || formScore === totalInputs) {
                    a11yScore += 15;
                    this.auditResults.accessibility.passed.push({
                        page: testPage.name,
                        test: 'Form Labels',
                        result: totalInputs === 0 ? 'No forms found' : `All ${totalInputs} form inputs have labels`,
                        score: 15
                    });
                } else {
                    this.auditResults.accessibility.failed.push({
                        page: testPage.name,
                        test: 'Form Labels',
                        error: `${totalInputs - formScore} form inputs missing labels`,
                        severity: 'HIGH'
                    });
                }

                // Heading structure (10 points)
                maxScore += 10;
                const headings = accessibilityData.headingStructure.sort((a, b) => a.level - b.level);
                let headingStructureValid = true;
                let previousLevel = 0;

                for (const heading of headings) {
                    if (heading.level > previousLevel + 1) {
                        headingStructureValid = false;
                        break;
                    }
                    previousLevel = heading.level;
                }

                if (headingStructureValid && headings.length > 0) {
                    a11yScore += 10;
                    this.auditResults.accessibility.passed.push({
                        page: testPage.name,
                        test: 'Heading Structure',
                        result: `Proper heading hierarchy with ${headings.length} headings`,
                        score: 10
                    });
                } else {
                    this.auditResults.accessibility.failed.push({
                        page: testPage.name,
                        test: 'Heading Structure',
                        error: headings.length === 0 ? 'No headings found' : 'Invalid heading hierarchy',
                        severity: 'MEDIUM'
                    });
                }

                // ARIA landmarks (10 points)
                maxScore += 10;
                const requiredLandmarks = ['main'];
                const foundLandmarks = accessibilityData.landmarks.map(l => l.role);
                const missingLandmarks = requiredLandmarks.filter(role => !foundLandmarks.includes(role));

                if (missingLandmarks.length === 0) {
                    a11yScore += 10;
                    this.auditResults.accessibility.passed.push({
                        page: testPage.name,
                        test: 'ARIA Landmarks',
                        result: `Found required landmarks: ${foundLandmarks.join(', ')}`,
                        score: 10
                    });
                } else {
                    this.auditResults.accessibility.failed.push({
                        page: testPage.name,
                        test: 'ARIA Landmarks',
                        error: `Missing landmarks: ${missingLandmarks.join(', ')}`,
                        severity: 'MEDIUM'
                    });
                }

                const pageScore = Math.round((a11yScore / maxScore) * 100);
                console.log(`   ♿ Accessibility Score: ${pageScore}% (${a11yScore}/${maxScore})`);

            } catch (error) {
                console.log(`   ❌ Accessibility Audit Error: ${error.message}`);
                this.auditResults.accessibility.failed.push({
                    page: testPage.name,
                    test: 'Page Load',
                    error: `Failed to load page: ${error.message}`,
                    severity: 'HIGH'
                });
            }
        }
    }

    async generateReport() {
        console.log('\n📋 Generating Comprehensive Report');
        console.log('==================================');

        // Calculate overall scores
        const seoPassedScore = this.auditResults.seo.passed.reduce((sum, test) => sum + test.score, 0);
        const seoTotalScore = seoPassedScore + (this.auditResults.seo.failed.length * 10); // Estimate max score
        this.auditResults.seo.score = Math.round((seoPassedScore / Math.max(seoTotalScore, 1)) * 100);

        const a11yPassedScore = this.auditResults.accessibility.passed.reduce((sum, test) => sum + test.score, 0);
        const a11yTotalScore = a11yPassedScore + (this.auditResults.accessibility.failed.length * 15); // Estimate max score
        this.auditResults.accessibility.score = Math.round((a11yPassedScore / Math.max(a11yTotalScore, 1)) * 100);

        const overallScore = Math.round((this.auditResults.seo.score + this.auditResults.accessibility.score) / 2);

        const report = {
            timestamp: new Date().toISOString(),
            baseUrl: this.config.baseUrl,
            pagesAudited: this.testPages.length,
            overallScore: overallScore,
            scores: {
                seo: this.auditResults.seo.score,
                accessibility: this.auditResults.accessibility.score
            },
            summary: {
                seo: {
                    passed: this.auditResults.seo.passed.length,
                    failed: this.auditResults.seo.failed.length,
                    score: this.auditResults.seo.score
                },
                accessibility: {
                    passed: this.auditResults.accessibility.passed.length,
                    failed: this.auditResults.accessibility.failed.length,
                    score: this.auditResults.accessibility.score
                }
            },
            details: this.auditResults,
            recommendations: this.generateRecommendations()
        };

        // Save detailed report
        const reportPath = path.join(this.config.reportDir, 'seo-accessibility-audit.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Generate HTML report
        const htmlReport = this.generateHTMLReport(report);
        const htmlReportPath = path.join(this.config.reportDir, 'seo-accessibility-audit.html');
        fs.writeFileSync(htmlReportPath, htmlReport);

        console.log(`\n📊 Audit Results:`);
        console.log(`   Overall Score: ${overallScore}%`);
        console.log(`   SEO Score: ${this.auditResults.seo.score}%`);
        console.log(`   Accessibility Score: ${this.auditResults.accessibility.score}%`);
        console.log(`\n📄 Reports saved:`);
        console.log(`   JSON: ${reportPath}`);
        console.log(`   HTML: ${htmlReportPath}`);

        return report;
    }

    generateRecommendations() {
        const recommendations = [];

        // SEO recommendations
        if (this.auditResults.seo.score < 90) {
            recommendations.push({
                category: 'SEO',
                priority: 'HIGH',
                title: 'Improve SEO Score',
                description: 'Address failed SEO tests to improve search engine visibility',
                actions: this.auditResults.seo.failed.map(f => f.error)
            });
        }

        // Accessibility recommendations
        if (this.auditResults.accessibility.score < 90) {
            recommendations.push({
                category: 'Accessibility',
                priority: 'HIGH',
                title: 'Improve Accessibility',
                description: 'Address accessibility issues to ensure WCAG compliance',
                actions: this.auditResults.accessibility.failed.map(f => f.error)
            });
        }

        return recommendations;
    }

    generateHTMLReport(report) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO & Accessibility Audit Report - VARAi Commerce Studio</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .score { font-size: 48px; font-weight: bold; margin: 10px 0; }
        .score.excellent { color: #10b981; }
        .score.good { color: #f59e0b; }
        .score.poor { color: #ef4444; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #1e293b; }
        .metric .value { font-size: 32px; font-weight: bold; margin: 10px 0; }
        .section { margin: 30px 0; }
        .section h2 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        .test-result { margin: 10px 0; padding: 15px; border-radius: 6px; }
        .test-result.passed { background: #dcfce7; border-left: 4px solid #10b981; }
        .test-result.failed { background: #fef2f2; border-left: 4px solid #ef4444; }
        .test-result h4 { margin: 0 0 5px 0; }
        .test-result p { margin: 5px 0; color: #64748b; }
        .recommendations { background: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; }
        .timestamp { text-align: center; color: #64748b; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SEO & Accessibility Audit Report</h1>
            <p>VARAi Commerce Studio</p>
            <div class="score ${report.overallScore >= 90 ? 'excellent' : report.overallScore >= 70 ? 'good' : 'poor'}">${report.overallScore}%</div>
            <p>Overall Score</p>
        </div>

        <div class="metrics">
            <div class="metric">
                <h3>SEO Score</h3>
                <div class="value ${report.scores.seo >= 90 ? 'excellent' : report.scores.seo >= 70 ? 'good' : 'poor'}">${report.scores.seo}%</div>
                <p>${report.summary.seo.passed} passed, ${report.summary.seo.failed} failed</p>
            </div>
            <div class="metric">
                <h3>Accessibility Score</h3>
                <div class="value ${report.scores.accessibility >= 90 ? 'excellent' : report.scores.accessibility >= 70 ? 'good' : 'poor'}">${report.scores.accessibility}%</div>
                <p>${report.summary.accessibility.passed} passed, ${report.summary.accessibility.failed} failed</p>
            </div>
            <div class="metric">
                <h3>Pages Audited</h3>
                <div class="value">${report.pagesAudited}</div>
                <p>Total pages tested</p>
            </div>
        </div>

        <div class="section">
            <h2>SEO Results</h2>
            ${report.details.seo.passed.map(test => `
                <div class="test-result passed">
                    <h4>✅ ${test.test} - ${test.page}</h4>
                    <p>${test.result}</p>
                </div>
            `).join('')}
            ${report.details.seo.failed.map(test => `
                <div class="test-result failed">
                    <h4>❌ ${test.test} - ${test.page}</h4>
                    <p>${test.error}</p>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>Accessibility Results</h2>
            ${report.details.accessibility.passed.map(test => `
                <div class="test-result passed">
                    <h4>✅ ${test.test} - ${test.page}</h4>
                    <p>${test.result}</p>
                </div>
            `).join('')}
            ${report.details.accessibility.failed.map(test => `
                <div class="test-result failed">
                    <h4>❌ ${test.test} - ${test.page}</h4>
                    <p>${test.error}</p>
                </div>
            `).join('')}
        </div>

        ${report.recommendations.length > 0 ? `
        <div class="section">
            <h2>Recommendations</h2>
            <div class="recommendations">
                ${report.recommendations.map(rec => `
                    <h3>${rec.title}</h3>
                    <p><strong>Priority:</strong> ${rec.priority}</p>
                    <p>${rec.description}</p>
                    <ul>
                        ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <div class="timestamp">
            <p>Report generated on ${new Date(report.timestamp).toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async runFullAudit() {
        try {
            await this.init();
            await this.auditSEO();
            await this.auditAccessibility();
            const report = await this.generateReport();
            await this.close();
            return report;
        } catch (error) {
            console.error('Audit failed:', error);
            await this.close();
            throw error;
        }
    }
}

// Main execution
async function main() {
    const auditor = new SEOAccessibilityAuditor();
    
    try {
        console.log('🚀 Starting SEO & Accessibility Audit for VARAi Commerce Studio');
        const report = await auditor.runFullAudit();
        
        console.log('\n✅ Audit completed successfully!');
        console.log(`📊 Overall Score: ${report.overallScore}%`);
        
        if (report.overallScore >= 90) {
            console.log('🎉 Excellent! Your site meets enterprise-grade standards.');
        } else if (report.overallScore >= 70) {
            console.log('👍 Good performance, but there\'s room for improvement.');
        } else {
            console.log('⚠️  Significant improvements needed to meet enterprise standards.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Audit failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { SEOAccessibilityAuditor };