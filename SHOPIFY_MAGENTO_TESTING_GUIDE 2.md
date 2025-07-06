# 🧪 Shopify & Magento Implementation Testing Guide

## 🎯 Overview

This guide provides comprehensive testing procedures for the Shopify and Magento UI enhancements in the VARAi Commerce Studio customer portal. It includes both automated testing scripts and manual testing procedures to validate all implemented features.

## 🚀 Quick Start Testing

### **Option 1: Automated Testing (Recommended)**

```bash
# Navigate to test framework
cd website/test-framework

# Install dependencies (if not already done)
npm install

# Run the enhanced verification script
node enhanced-customer-portal-verification.js
```

### **Option 2: Manual Testing**

1. **Open Demo Login**: Visit `https://commerce-studio-website-353252826752.us-central1.run.app/demo-login.html`
2. **Check Platform Cards**: Verify Shopify and Magento demo accounts are visible
3. **Open Dashboard**: Visit `https://commerce-studio-website-353252826752.us-central1.run.app/dashboard/`
4. **Test Store Connections**: Verify store connection interface is present

## 🔧 Automated Testing Scripts

### **1. Enhanced Customer Portal Verification**

**File**: `website/test-framework/enhanced-customer-portal-verification.js`

**What it tests**:
- Demo login Shopify/Magento card presence
- Platform-specific styling and credentials
- Dashboard store connection interface
- Connection buttons and modal functionality
- Platform-specific navigation

**Usage**:
```bash
cd website/test-framework
node enhanced-customer-portal-verification.js
```

**Expected Output**:
```
🚀 Starting Enhanced Customer Portal Verification...
🎯 Focus: Shopify & Magento UI Enhancements

🔐 Testing Demo Login Enhancements...
✅ Shopify demo card: true
✅ Magento demo card: true
📋 Shopify credentials: true
📋 Magento credentials: true
🎨 Demo Login Score: 90/100

🏪 Testing Dashboard Store Connections...
🏪 Store Connections section: true
✅ VisionCraft card: true (Connected: true)
🛍️ Shopify card: true (Ready: true)
🏬 Magento card: true (Ready: true)
🔗 Shopify connect button: true
🔗 Magento connect button: true
🎯 Dashboard Score: 95/100

📊 ENHANCED VERIFICATION SUMMARY
🎯 Overall Score: 90/100
📈 Status: ✅ FULLY OPERATIONAL
```

### **2. Individual Platform Testing**

**Shopify-Specific Test**:
```bash
cd website/test-framework
node -e "
const { runEnhancedVerification } = require('./enhanced-customer-portal-verification.js');
// Focus on Shopify testing
console.log('🛍️ Testing Shopify Implementation...');
// Run verification and filter Shopify results
"
```

**Magento-Specific Test**:
```bash
cd website/test-framework
node -e "
const { runEnhancedVerification } = require('./enhanced-customer-portal-verification.js');
// Focus on Magento testing
console.log('🏬 Testing Magento Implementation...');
// Run verification and filter Magento results
"
```

## 🖱️ Manual Testing Procedures

### **Test 1: Demo Login Page Enhancement**

**URL**: `https://commerce-studio-website-353252826752.us-central1.run.app/demo-login.html`

**Steps**:
1. **Load the page** and verify it displays properly
2. **Check for Shopify card**:
   - ✅ Card has green border (#95BF47)
   - ✅ Shows "Shopify Store Manager" title
   - ✅ Displays demo credentials (demo-shopify@varai.com)
   - ✅ Lists Shopify-specific features
   - ✅ Has "Access Shopify Dashboard" button

3. **Check for Magento card**:
   - ✅ Card has orange border (#EE672F)
   - ✅ Shows "Magento Store Administrator" title
   - ✅ Displays demo credentials (demo-magento@varai.com)
   - ✅ Lists Magento-specific features
   - ✅ Has "Access Magento Dashboard" button

4. **Test platform navigation**:
   - ✅ Visit `?platform=shopify` - Shopify card should be highlighted
   - ✅ Visit `?platform=magento` - Magento card should be highlighted

### **Test 2: Dashboard Store Connections**

**URL**: `https://commerce-studio-website-353252826752.us-central1.run.app/dashboard/`

**Steps**:
1. **Load the dashboard** and scroll to Store Connections section
2. **Verify section structure**:
   - ✅ "Store Connections" heading is visible
   - ✅ Description text is present
   - ✅ Three main platform cards are displayed

3. **Check VisionCraft card**:
   - ✅ Green border indicating connected status
   - ✅ "Connected" badge
   - ✅ "View Store" and "Manage Settings" buttons

4. **Check Shopify card**:
   - ✅ Green border (#95BF47)
   - ✅ "Ready to Connect" badge
   - ✅ Platform description mentions AI recommendations
   - ✅ "Connect Store" button present
   - ✅ "Try Demo" link present

5. **Check Magento card**:
   - ✅ Orange border (#EE672F)
   - ✅ "Ready to Connect" badge
   - ✅ Platform description mentions enterprise features
   - ✅ "Connect Store" button present
   - ✅ "Try Demo" link present

6. **Check Additional Platforms section**:
   - ✅ "Additional Platforms" heading
   - ✅ BigCommerce card with "Coming Soon" badge
   - ✅ WooCommerce card with "Coming Soon" badge

### **Test 3: Connection Modal Functionality**

**Prerequisites**: Dashboard page loaded

**Shopify Modal Test**:
1. **Click "Connect Store" button** on Shopify card
2. **Verify modal opens** with:
   - ✅ "Connect Your Shopify Store" title
   - ✅ Store URL input field
   - ✅ API Key input field
   - ✅ API Secret input field (password type)
   - ✅ Features list (5 items)
   - ✅ "Connect Store" and "Cancel" buttons

3. **Test form validation**:
   - ✅ Try submitting empty form - should show validation errors
   - ✅ Fill required fields - borders should turn normal
   - ✅ Submit valid form - should show loading state

4. **Test modal interactions**:
   - ✅ Click outside modal - should close
   - ✅ Press Escape key - should close
   - ✅ Click X button - should close

**Magento Modal Test**:
1. **Click "Connect Store" button** on Magento card
2. **Verify modal opens** with:
   - ✅ "Connect Your Magento Store" title
   - ✅ Store URL input field
   - ✅ Admin Token input field (password type)
   - ✅ Store Code input field (optional)
   - ✅ Enterprise features list (5 items)
   - ✅ "Connect Store" and "Cancel" buttons

3. **Test same validation and interactions** as Shopify modal

### **Test 4: Platform-Specific Navigation Flow**

**Complete User Journey Test**:

1. **Start at Dashboard**:
   - Visit dashboard
   - Click "Try Demo" on Shopify card
   - Should redirect to `demo-login.html?platform=shopify`

2. **Demo Login with Platform Parameter**:
   - Verify Shopify card is highlighted/emphasized
   - Click "Access Shopify Dashboard" button
   - Should return to dashboard with Shopify focus

3. **Repeat for Magento**:
   - Click "Try Demo" on Magento card
   - Should redirect to `demo-login.html?platform=magento`
   - Verify Magento card is highlighted
   - Test return navigation

## 🔍 API Integration Testing

### **Test Store Integration Endpoints**

**Shopify API Test**:
```bash
# Test Shopify connection endpoint
curl -X POST https://commerce-studio-website-353252826752.us-central1.run.app/api/store-integrations/shopify/connect \
  -H "Content-Type: application/json" \
  -d '{
    "store_url": "demo-store.myshopify.com",
    "api_key": "test_key",
    "api_secret": "test_secret"
  }'
```

**Magento API Test**:
```bash
# Test Magento connection endpoint
curl -X POST https://commerce-studio-website-353252826752.us-central1.run.app/api/store-integrations/magento/connect \
  -H "Content-Type: application/json" \
  -d '{
    "store_url": "https://demo-store.com",
    "admin_token": "test_token",
    "store_code": "default"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Store connected successfully",
  "store_id": "generated_id",
  "features_enabled": ["ai_recommendations", "inventory_sync", "analytics"]
}
```

## 📱 Responsive Design Testing

### **Mobile Testing Checklist**

**Viewport Sizes to Test**:
- 📱 Mobile: 375x667 (iPhone SE)
- 📱 Mobile Large: 414x896 (iPhone 11)
- 📟 Tablet: 768x1024 (iPad)
- 💻 Desktop: 1920x1080

**Test Each Viewport**:
1. **Demo Login Page**:
   - ✅ Cards stack vertically on mobile
   - ✅ Text remains readable
   - ✅ Buttons are touch-friendly (44px minimum)
   - ✅ Platform borders remain visible

2. **Dashboard Store Connections**:
   - ✅ Grid adapts to screen size
   - ✅ Cards maintain proper spacing
   - ✅ Buttons remain accessible
   - ✅ Modal is responsive

3. **Connection Modals**:
   - ✅ Modal fits screen width
   - ✅ Form fields are properly sized
   - ✅ Buttons are touch-friendly
   - ✅ Content doesn't overflow

## 🎨 Visual Regression Testing

### **Screenshot Comparison Test**

```bash
# Take screenshots for comparison
cd website/test-framework
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Demo login screenshots
  await page.goto('https://commerce-studio-website-353252826752.us-central1.run.app/demo-login.html');
  await page.screenshot({ path: 'demo-login-full.png', fullPage: true });
  
  // Dashboard screenshots
  await page.goto('https://commerce-studio-website-353252826752.us-central1.run.app/dashboard/');
  await page.screenshot({ path: 'dashboard-full.png', fullPage: true });
  
  await browser.close();
})();
"
```

### **Visual Elements to Verify**

**Color Accuracy**:
- ✅ Shopify green: #95BF47
- ✅ Magento orange: #EE672F
- ✅ VisionCraft success green: var(--varai-success)

**Typography**:
- ✅ Consistent font families
- ✅ Proper heading hierarchy
- ✅ Readable font sizes

**Spacing & Layout**:
- ✅ Consistent card spacing
- ✅ Proper grid alignment
- ✅ Adequate white space

## 🚨 Error Handling Testing

### **Test Error Scenarios**

**Network Errors**:
1. **Disconnect internet** during modal submission
2. **Verify error message** displays properly
3. **Check retry functionality**

**Invalid Credentials**:
1. **Submit invalid store URL** (e.g., "invalid-url")
2. **Verify validation error** shows
3. **Check field highlighting**

**Server Errors**:
1. **Mock 500 server error** response
2. **Verify user-friendly error** message
3. **Check error recovery** options

## 📊 Performance Testing

### **Load Time Testing**

```bash
# Test page load performance
cd website/test-framework
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Measure demo login load time
  const start = Date.now();
  await page.goto('https://commerce-studio-website-353252826752.us-central1.run.app/demo-login.html', { waitUntil: 'networkidle0' });
  const demoLoadTime = Date.now() - start;
  
  // Measure dashboard load time
  const start2 = Date.now();
  await page.goto('https://commerce-studio-website-353252826752.us-central1.run.app/dashboard/', { waitUntil: 'networkidle0' });
  const dashboardLoadTime = Date.now() - start2;
  
  console.log('Demo Login Load Time:', demoLoadTime + 'ms');
  console.log('Dashboard Load Time:', dashboardLoadTime + 'ms');
  
  await browser.close();
})();
"
```

**Performance Targets**:
- ✅ Demo login: < 3 seconds
- ✅ Dashboard: < 4 seconds
- ✅ Modal open: < 500ms
- ✅ Form submission: < 2 seconds

## 🔧 Debugging & Troubleshooting

### **Common Issues & Solutions**

**Issue**: Shopify/Magento cards not visible
- **Check**: Browser cache - try hard refresh (Ctrl+F5)
- **Check**: Network tab for failed CSS/JS loads
- **Solution**: Clear cache and reload

**Issue**: Modal not opening
- **Check**: Console for JavaScript errors
- **Check**: dashboard.js file loaded properly
- **Solution**: Verify script inclusion in HTML

**Issue**: Platform navigation not working
- **Check**: URL parameters are being passed correctly
- **Check**: JavaScript URL parsing logic
- **Solution**: Verify parameter handling code

**Issue**: Styling not applied correctly
- **Check**: CSS specificity conflicts
- **Check**: VARAi design system classes
- **Solution**: Inspect element and verify class application

### **Debug Mode Testing**

```bash
# Run tests with debug output
cd website/test-framework
DEBUG=true node enhanced-customer-portal-verification.js
```

## 📋 Test Results Documentation

### **Test Report Template**

```markdown
# Shopify & Magento Testing Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Production/Staging]

## Test Results Summary
- Demo Login Enhancements: ✅/❌ [Score]/100
- Dashboard Store Connections: ✅/❌ [Score]/100
- Modal Functionality: ✅/❌ [Score]/100
- Platform Navigation: ✅/❌ [Score]/100

## Issues Found
1. [Issue description]
   - Severity: High/Medium/Low
   - Steps to reproduce: [Steps]
   - Expected: [Expected behavior]
   - Actual: [Actual behavior]

## Recommendations
- [Recommendation 1]
- [Recommendation 2]
```

## 🎯 Success Criteria

### **Acceptance Criteria**

**Demo Login Page**:
- ✅ Shopify and Magento cards visible and properly styled
- ✅ Platform-specific credentials and features displayed
- ✅ Navigation buttons functional

**Dashboard**:
- ✅ Store Connections section prominent and complete
- ✅ All platform cards present with correct status
- ✅ Connection buttons and demo links functional

**Modals**:
- ✅ Both Shopify and Magento modals open and function
- ✅ Form validation works correctly
- ✅ Error handling displays appropriate messages

**Overall Score**: 90+ points = ✅ FULLY OPERATIONAL

---

**Next Steps**: After testing, deploy changes to production and run verification to confirm all enhancements are live and functional.