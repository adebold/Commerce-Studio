# VARAi Step-by-Step Walkthroughs

This guide provides step-by-step walkthroughs for common tasks in the VARAi platform. These walkthroughs are designed to help users learn how to use the platform effectively.

## Table of Contents

1. [Merchant Tutorials](#merchant-tutorials)
   - [Setting Up Your First Product](#setting-up-your-first-product)
   - [Analyzing Customer Engagement](#analyzing-customer-engagement)
   - [Customizing the Try-On Widget](#customizing-the-try-on-widget)
2. [End-User Tutorials](#end-user-tutorials)
   - [Creating Your User Profile](#creating-your-user-profile)
   - [Using Virtual Try-On](#using-virtual-try-on)
   - [Finding Your Perfect Frames](#finding-your-perfect-frames)
3. [Administrator Tutorials](#administrator-tutorials)
   - [Setting Up a New Tenant](#setting-up-a-new-tenant)
   - [Managing User Roles](#managing-user-roles)
   - [Monitoring System Performance](#monitoring-system-performance)

## Merchant Tutorials

### Setting Up Your First Product

This walkthrough guides merchants through the process of adding their first product to the VARAi platform.

#### Prerequisites

- A VARAi merchant account
- Product information (name, description, price, etc.)
- Product images (front, side, and 45-degree angles)
- Frame dimensions and specifications

#### Step 1: Access the Product Management Section

1. Log in to your VARAi merchant dashboard at [https://merchant.varai.ai/login](https://merchant.varai.ai/login)
2. Navigate to "Products" in the left sidebar
3. Click on "Add New Product"

![Product Management Navigation](../../images/tutorials/product-management-nav.png)

#### Step 2: Enter Basic Product Information

1. Fill in the following fields:
   - Product Name: Enter a descriptive name for your eyewear product
   - SKU/Product ID: Enter a unique identifier for the product
   - Price: Enter the retail price
   - Sale Price (optional): Enter a discounted price if applicable
   - Description: Enter a detailed description of the product
   - Short Description: Enter a brief summary for product listings

![Basic Product Information Form](../../images/tutorials/product-basic-info.png)

#### Step 3: Add Product Categories and Tags

1. Select the appropriate categories for your product:
   - Product Type (e.g., Eyeglasses, Sunglasses)
   - Frame Style (e.g., Full-Rim, Semi-Rimless, Rimless)
   - Frame Shape (e.g., Rectangle, Round, Cat-Eye)
   - Gender (e.g., Men, Women, Unisex)

2. Add relevant tags to improve searchability:
   - Material tags (e.g., Acetate, Metal, Titanium)
   - Style tags (e.g., Vintage, Modern, Classic)
   - Feature tags (e.g., Lightweight, Adjustable, Hypoallergenic)

![Categories and Tags Form](../../images/tutorials/product-categories.png)

#### Step 4: Enter Frame Specifications

1. Fill in the frame dimensions:
   - Lens Width (mm)
   - Lens Height (mm)
   - Bridge Width (mm)
   - Temple Length (mm)
   - Total Width (mm)

2. Enter frame materials and features:
   - Frame Material
   - Temple Material
   - Hinge Type
   - Nose Pad Type
   - Weight (g)

![Frame Specifications Form](../../images/tutorials/product-specifications.png)

#### Step 5: Upload Product Images

1. Click on "Upload Images"
2. Upload high-quality images of your product:
   - Front View (required)
   - Side View (required)
   - 45-Degree Angle View (required)
   - Detail Shots (optional)
   - Lifestyle Images (optional)

3. For each image, you can:
   - Crop the image
   - Adjust brightness and contrast
   - Set as the primary image
   - Add alt text for accessibility

![Image Upload Interface](../../images/tutorials/product-images.png)

#### Step 6: Upload 3D Model (Optional)

If you have a 3D model of your frame:

1. Click on "Upload 3D Model"
2. Select the 3D model file (supported formats: GLB, GLTF)
3. Preview the 3D model in the viewer
4. Adjust positioning and scaling if needed

If you don't have a 3D model, VARAi can generate one based on your product images:

1. Click on "Generate 3D Model"
2. Review the generated model
3. Approve or request adjustments

![3D Model Upload Interface](../../images/tutorials/product-3d-model.png)

#### Step 7: Configure Virtual Try-On Settings

1. Enable or disable virtual try-on for this product
2. Select which face shapes this frame is recommended for
3. Configure frame positioning parameters:
   - Default position on face
   - Adjustment limits
   - Scaling factors

![Virtual Try-On Settings](../../images/tutorials/product-try-on-settings.png)

#### Step 8: Set Inventory and Availability

1. Enter inventory information:
   - Stock quantity
   - Low stock threshold
   - Backorder allowance

2. Set availability options:
   - In stock / Out of stock
   - Available for pre-order
   - Expected availability date (if out of stock)

![Inventory Settings](../../images/tutorials/product-inventory.png)

#### Step 9: Preview and Publish

1. Click "Preview" to see how your product will appear to customers
2. Review all information for accuracy
3. Click "Save as Draft" to save without publishing
4. Click "Publish" to make the product live on your store

![Preview and Publish Interface](../../images/tutorials/product-preview-publish.png)

#### Step 10: Verify Publication

1. Navigate to "Products" > "All Products"
2. Find your newly published product in the list
3. Click "View" to see the product as customers will see it

![Product Verification](../../images/tutorials/product-verification.png)

#### Congratulations!

You have successfully added your first product to the VARAi platform. Your customers can now view this product and use the virtual try-on feature to see how it looks on their face.

### Analyzing Customer Engagement

This walkthrough guides merchants through the process of analyzing customer engagement with their products using the VARAi analytics dashboard.

#### Prerequisites

- A VARAi merchant account
- At least one week of customer data
- Products published on the platform

#### Step 1: Access the Analytics Dashboard

1. Log in to your VARAi merchant dashboard at [https://merchant.varai.ai/login](https://merchant.varai.ai/login)
2. Navigate to "Analytics" in the left sidebar
3. The main analytics dashboard will display an overview of your store's performance

![Analytics Dashboard Navigation](../../images/tutorials/analytics-nav.png)

#### Step 2: Review Key Performance Metrics

The dashboard displays several key performance metrics:

1. **Engagement Metrics**:
   - Total virtual try-ons
   - Average try-on duration
   - Try-on to purchase conversion rate
   - Product view to try-on conversion rate

2. **Sales Metrics**:
   - Total sales
   - Average order value
   - Revenue from try-on users vs. non-try-on users
   - Return rate comparison

![Key Performance Metrics](../../images/tutorials/analytics-kpi.png)

#### Step 3: Analyze Product Performance

1. Navigate to the "Products" tab in the analytics dashboard
2. Review the product performance table:
   - Most tried-on products
   - Highest converting products
   - Products with longest try-on duration
   - Products with highest return rate

3. Click on a specific product to view detailed analytics:
   - Try-on trends over time
   - Demographic breakdown of users
   - Face shape distribution of purchasers
   - Comparison with similar products

![Product Performance Analytics](../../images/tutorials/analytics-products.png)

#### Step 4: Understand Customer Behavior

1. Navigate to the "Customer Journey" tab
2. Review the customer journey funnel:
   - Product view
   - Virtual try-on
   - Add to cart
   - Checkout
   - Purchase

3. Identify drop-off points in the funnel
4. Compare conversion rates for different customer segments

![Customer Journey Analytics](../../images/tutorials/analytics-journey.png)

#### Step 5: Analyze Demographic Data

1. Navigate to the "Demographics" tab
2. Review customer demographics:
   - Age distribution
   - Gender distribution
   - Geographic distribution
   - Face shape distribution

3. Compare purchase behavior across different demographics
4. Identify high-value customer segments

![Demographic Analytics](../../images/tutorials/analytics-demographics.png)

#### Step 6: Generate and Export Reports

1. Navigate to the "Reports" tab
2. Select the type of report you want to generate:
   - Performance summary
   - Product analysis
   - Customer behavior
   - Conversion analysis
   - Return rate analysis

3. Set the date range for the report
4. Click "Generate Report"
5. Download the report in your preferred format (PDF, CSV, Excel)

![Report Generation](../../images/tutorials/analytics-reports.png)

#### Step 7: Set Up Automated Reports

1. Navigate to the "Report Settings" tab
2. Click "Create Scheduled Report"
3. Configure the report settings:
   - Report type
   - Frequency (daily, weekly, monthly)
   - Recipients
   - Delivery method (email, dashboard)

4. Click "Save Schedule"

![Automated Reports Setup](../../images/tutorials/analytics-automated.png)

#### Step 8: Take Action Based on Insights

Based on the analytics insights, consider taking these actions:

1. **For high-performing products**:
   - Increase inventory
   - Feature prominently in marketing
   - Consider similar styles

2. **For underperforming products**:
   - Improve product images
   - Adjust pricing
   - Update descriptions
   - Consider discontinuing

3. **For customer journey optimization**:
   - Address drop-off points
   - Improve user experience
   - Add incentives at critical stages

![Action Recommendations](../../images/tutorials/analytics-actions.png)

#### Congratulations!

You now know how to analyze customer engagement with your products using the VARAi analytics dashboard. Regular analysis will help you optimize your product offerings and improve the customer experience.

### Customizing the Try-On Widget

This walkthrough guides merchants through the process of customizing the VARAi virtual try-on widget to match their brand and website design.

#### Prerequisites

- A VARAi merchant account
- Integration with your e-commerce platform
- Basic understanding of CSS and HTML

#### Step 1: Access the Widget Customization Settings

1. Log in to your VARAi merchant dashboard at [https://merchant.varai.ai/login](https://merchant.varai.ai/login)
2. Navigate to "Integration" > "Widget Settings" in the left sidebar
3. The widget customization interface will be displayed

![Widget Customization Navigation](../../images/tutorials/widget-nav.png)

#### Step 2: Customize the Widget Appearance

1. **Basic Styling**:
   - Primary Color: Set the main color for buttons and accents
   - Secondary Color: Set the color for secondary elements
   - Text Color: Set the color for text elements
   - Background Color: Set the widget background color
   - Border Radius: Adjust the roundness of corners
   - Font Family: Select from available fonts or enter a custom font

2. **Button Styling**:
   - Button Text: Customize the "Try On" button text
   - Button Style: Choose from predefined styles (filled, outlined, text)
   - Button Size: Adjust the button size
   - Button Position: Set the button position on product pages

![Widget Appearance Settings](../../images/tutorials/widget-appearance.png)

#### Step 3: Configure Widget Behavior

1. **Launch Options**:
   - Launch Mode: Choose between inline, popup, or fullscreen
   - Auto Launch: Enable/disable automatic launch on product page
   - Launch Delay: Set delay time before auto launch (if enabled)

2. **Feature Options**:
   - Enable/disable face shape detection
   - Enable/disable frame recommendations
   - Enable/disable comparison feature
   - Enable/disable social sharing
   - Enable/disable screenshot capture

![Widget Behavior Settings](../../images/tutorials/widget-behavior.png)

#### Step 4: Customize the User Interface

1. **Layout Options**:
   - Widget Size: Set the widget dimensions
   - Control Panel Position: Choose left, right, top, or bottom
   - Camera Preview Size: Adjust the size of the camera preview
   - Product Thumbnail Size: Set the size of product thumbnails

2. **Content Customization**:
   - Welcome Message: Customize the initial message
   - Instructions Text: Edit the user instructions
   - Privacy Notice: Customize the privacy message
   - Call-to-Action Text: Edit the purchase CTA text

![User Interface Customization](../../images/tutorials/widget-ui.png)

#### Step 5: Add Custom CSS (Advanced)

For advanced customization:

1. Navigate to the "Advanced" tab
2. Enter custom CSS in the editor
3. Use the provided CSS selectors to target specific widget elements
4. Preview changes in real-time
5. Save your custom CSS

```css
/* Example custom CSS */
.varai-widget-container {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.varai-try-on-button {
  text-transform: uppercase;
  letter-spacing: 1px;
}

.varai-product-thumbnail:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}
```

![Custom CSS Editor](../../images/tutorials/widget-custom-css.png)

#### Step 6: Configure Mobile Experience

1. Navigate to the "Mobile" tab
2. Customize mobile-specific settings:
   - Mobile Layout: Choose between standard or simplified
   - Mobile Button Size: Adjust button size for mobile
   - Touch Interaction: Configure touch gestures
   - Performance Settings: Optimize for mobile devices

![Mobile Configuration](../../images/tutorials/widget-mobile.png)

#### Step 7: Set Up A/B Testing (Optional)

To optimize your widget configuration:

1. Navigate to the "A/B Testing" tab
2. Click "Create New Test"
3. Configure test parameters:
   - Test Name: Give your test a descriptive name
   - Variant A: Your current configuration
   - Variant B: Create an alternative configuration
   - Traffic Split: Set the percentage of users for each variant
   - Test Duration: Set how long the test should run
   - Success Metric: Choose conversion metric (try-ons, purchases)

4. Click "Start Test"

![A/B Testing Setup](../../images/tutorials/widget-ab-testing.png)

#### Step 8: Preview and Save Changes

1. Click "Preview" to see how your widget will appear
2. Test the widget functionality in the preview mode
3. Make any final adjustments
4. Click "Save Changes" to apply your customizations
5. Choose to apply changes immediately or schedule for later

![Preview and Save](../../images/tutorials/widget-preview-save.png)

#### Step 9: Verify Implementation

1. Navigate to your e-commerce store
2. Go to a product page with virtual try-on enabled
3. Verify that the widget appears with your customizations
4. Test the widget functionality
5. Check the mobile experience on a smartphone or tablet

![Implementation Verification](../../images/tutorials/widget-verification.png)

#### Congratulations!

You have successfully customized the VARAi virtual try-on widget to match your brand and website design. Your customers will now enjoy a seamless and branded virtual try-on experience.

## End-User Tutorials

### Creating Your User Profile

This walkthrough guides end-users through the process of creating and setting up their VARAi user profile for personalized eyewear recommendations.

#### Prerequisites

- A device with a camera (smartphone, tablet, or computer with webcam)
- A supported web browser
- Good lighting conditions

#### Step 1: Create an Account

1. Visit the eyewear retailer's website
2. Click on "Sign Up" or "Create Account"
3. Fill in your information:
   - Email address
   - Password
   - Name (optional)
4. Agree to the terms of service and privacy policy
5. Click "Create Account"
6. Verify your email address by clicking the link sent to your email

![Account Creation Form](../../images/tutorials/user-account-creation.png)

#### Step 2: Complete Your Basic Profile

1. After verifying your email, log in to your account
2. Navigate to "My Profile" or "Account Settings"
3. Fill in your basic information:
   - Name
   - Gender (optional)
   - Date of birth (optional)
   - Contact information

![Basic Profile Form](../../images/tutorials/user-basic-profile.png)

#### Step 3: Set Up Face Analysis

1. Navigate to "Face Analysis" in your profile settings
2. Read the privacy information about face data collection
3. Click "Start Face Analysis"
4. Grant camera permission when prompted
5. Follow the on-screen instructions:
   - Position your face in the center of the frame
   - Remove glasses, sunglasses, or face masks
   - Maintain neutral expression
   - Ensure good lighting
6. Hold still while the system analyzes your face
7. The system will determine your face shape and measurements

![Face Analysis Setup](../../images/tutorials/user-face-analysis.png)

#### Step 4: Review Your Face Measurements

After the face analysis is complete, you'll see your face measurements:

1. Review the measurements:
   - Face shape (oval, round, square, heart, etc.)
   - Face width
   - Face height
   - Temple-to-temple distance
   - Pupillary distance (PD)
   - Bridge width
2. These measurements will be used to recommend frames that fit your face

![Face Measurements Review](../../images/tutorials/user-face-measurements.png)

#### Step 5: Set Your Style Preferences

1. Navigate to "Style Preferences" in your profile settings
2. Complete the style quiz:
   - Select frame shapes you prefer
   - Choose frame colors you like
   - Select frame materials you prefer
   - Choose frame styles (classic, trendy, minimalist, bold, etc.)
   - Indicate any specific features you want (lightweight, flexible, etc.)
3. Rate example frames to refine your preferences
4. Click "Save Preferences"

![Style Preferences Quiz](../../images/tutorials/user-style-preferences.png)

#### Step 6: Enter Prescription Information (Optional)

If you have a prescription:

1. Navigate to "My Prescription" in your profile settings
2. Enter your prescription details:
   - Sphere (SPH) for right and left eyes
   - Cylinder (CYL) for right and left eyes
   - Axis for right and left eyes
   - Add power (for bifocals or progressives)
   - Pupillary distance (PD)
3. Indicate the prescription date
4. Upload a photo of your prescription (optional)
5. Click "Save Prescription"

![Prescription Entry Form](../../images/tutorials/user-prescription.png)

#### Step 7: Set Up Notifications and Preferences

1. Navigate to "Notifications" in your profile settings
2. Configure your notification preferences:
   - Email notifications
   - Browser notifications
   - Mobile app notifications (if applicable)
   - Types of notifications (new recommendations, sales, etc.)
3. Set your privacy preferences:
   - Data sharing options
   - Face data storage preferences
   - Marketing communication preferences
4. Click "Save Preferences"

![Notification Preferences](../../images/tutorials/user-notifications.png)

#### Step 8: Connect Social Accounts (Optional)

1. Navigate to "Connected Accounts" in your profile settings
2. Choose which social accounts to connect:
   - Facebook
   - Google
   - Apple
   - Instagram
3. Click "Connect" next to each account you want to link
4. Follow the authentication process for each platform
5. Set sharing permissions for each connected account

![Social Account Connection](../../images/tutorials/user-social-accounts.png)

#### Step 9: Review Your Complete Profile

1. Navigate to "Profile Overview"
2. Review all the information you've provided
3. Make any necessary adjustments
4. Ensure your face analysis and style preferences are complete
5. Click "Complete Profile Setup"

![Profile Review](../../images/tutorials/user-profile-review.png)

#### Congratulations!

You have successfully created and set up your VARAi user profile. The system will now provide personalized eyewear recommendations based on your face shape, measurements, and style preferences. You can update your profile information at any time to refine your recommendations.

### Using Virtual Try-On

This walkthrough guides end-users through the process of using the VARAi virtual try-on feature to see how eyewear frames look on their face.

#### Prerequisites

- A device with a camera (smartphone, tablet, or computer with webcam)
- A supported web browser
- Good lighting conditions
- VARAi user account (recommended but not required)

#### Step 1: Access the Virtual Try-On Feature

There are two ways to access the virtual try-on feature:

1. **From a Product Page**:
   - Navigate to any eyewear product page
   - Look for the "Try On" button near the product images
   - Click the button to launch the virtual try-on experience

2. **From the Virtual Try-On Hub**:
   - Navigate to the "Virtual Try-On" section of the website
   - Browse the available frames
   - Select a frame to try on

![Virtual Try-On Access Points](../../images/tutorials/tryon-access.png)

#### Step 2: Grant Camera Permission

1. When the virtual try-on feature launches, you'll be prompted to allow camera access
2. Click "Allow" to grant permission for the website to use your camera
3. If you accidentally denied permission, you can update it in your browser settings

![Camera Permission Request](../../images/tutorials/tryon-camera-permission.png)

#### Step 3: Position Your Face

1. Once the camera is active, you'll see yourself on the screen
2. Follow the on-screen guidance to position your face:
   - Center your face in the frame
   - Ensure your entire face is visible
   - Maintain a neutral expression
   - Remove any glasses or sunglasses
3. Hold still for a moment while the system analyzes your face

![Face Positioning Guide](../../images/tutorials/tryon-face-position.png)

#### Step 4: Try On Frames

1. After your face is detected, the selected frames will appear on your face
2. The frames will automatically adjust to fit your face
3. You can move your head to see how the frames look from different angles:
   - Turn left and right to see side views
   - Tilt up and down to see from different vertical angles
   - Move closer or further from the camera to see details

![Virtual Try-On in Action](../../images/tutorials/tryon-in-action.png)

#### Step 5: Adjust Frame Position (If Needed)

If the frames don't appear correctly positioned:

1. Click the "Adjust" button in the control panel
2. Use the adjustment controls:
   - Horizontal slider: Move frames left or right
   - Vertical slider: Move frames up or down
   - Rotation slider: Adjust the angle of the frames
   - Width slider: Adjust the width of the frames
3. Click "Save Adjustments" when you're satisfied with the positioning

![Frame Position Adjustment](../../images/tutorials/tryon-adjust-position.png)

#### Step 6: Change Frame Color or Variant

1. Look for the "Color Options" or "Variants" section in the control panel
2. Click on different color options to see the frames in various colors
3. The frames on your face will update in real-time to show the selected color
4. Some frames may have different style variants you can try as well

![Frame Color Selection](../../images/tutorials/tryon-color-options.png)

#### Step 7: Compare Multiple Frames

To compare different frames:

1. Click the "Add to Comparison" or "Save" button while trying on a frame
2. Browse and try on other frames
3. Add them to your comparison as well
4. Click the "Compare" button to see all saved frames
5. The comparison view will show you wearing each frame side by side
6. Select your favorite frames from the comparison

![Frame Comparison View](../../images/tutorials/tryon-comparison.png)

#### Step 8: Take a Screenshot

To save an image of yourself wearing the frames:

1. Find a position and angle you like
2. Click the "Take Photo" or "Screenshot" button
3. The system will capture an image
4. You can choose to:
   - Download the image to your device
   - Share it on social media
   - Email it to yourself or others
   - Save it to your account

![Screenshot Capture](../../images/tutorials/tryon-screenshot.png)

#### Step 9: Get Recommendations

Based on your face shape and the frames you've tried:

1. Click the "Recommendations" button
2. The system will suggest other frames that might look good on you
3. These recommendations consider:
   - Your face shape
   - Your style preferences (if you have an account)
   - Frames similar to ones you've liked
4. Try on the recommended frames using the same process

![Frame Recommendations](../../images/tutorials/tryon-recommendations.png)

#### Step 10: Add to Cart or Wishlist

When you find frames you like:

1. Click the "Add to Cart" button to purchase the frames
2. Or click "Add to Wishlist" to save them for later
3. You can continue shopping or proceed to checkout
4. If you have an account, your tried-on frames will be saved in your history

![Add to Cart or Wishlist](../../images/tutorials/tryon-add-to-cart.png)

#### Troubleshooting Tips

If you encounter issues:

1. **Camera not working**:
   - Check that you've granted camera permissions
   - Make sure no other applications are using your camera
   - Try refreshing the page

2. **Frames not displaying correctly**:
   - Ensure you have good lighting
   - Position your face properly in the frame
   - Try adjusting the frame position manually
   - Try a different browser or device

3. **Performance issues**:
   - Close other browser tabs and applications
   - Check your internet connection
   - Try reducing the video quality in the settings

![Troubleshooting Tips](../../images/tutorials/tryon-troubleshooting.png)

#### Congratulations!

You now know how to use the VARAi virtual try-on feature to see how eyewear frames look on your face. This tool helps you make more confident purchasing decisions by allowing you to virtually try on frames before buying them.

## Administrator Tutorials

### Setting Up a New Tenant

This walkthrough guides system administrators through the process of setting up a new tenant (merchant organization) in the VARAi platform.

#### Prerequisites

- Administrator access to the VARAi platform
- Merchant organization information
- Subscription plan details

#### Step 1: Access the Tenant Management Console

1. Log in to the VARAi admin portal at [https://admin.varai.ai/login](https://admin.varai.ai/login)
2. Navigate to "Tenants" > "Tenant Management" in the left sidebar
3. Click "Create New Tenant"

![Tenant Management Console](../../images/tutorials/admin-tenant-console.png)

#### Step 2: Enter Tenant Information

1. Fill in the basic tenant information:
   - Tenant Name: The organization's name
   - Tenant ID: A unique identifier (automatically generated)
   - Industry: Select the industry type
   - Subscription Plan: Select the appropriate plan
   - Billing Cycle: Monthly or Annual

2. Enter business details:
   - Business Legal Name
   - Business Registration Number
   - Tax ID / VAT Number
   - Year Established
   - Business Website URL

![Tenant Information Form](../../images/tutorials/admin-tenant-info.png)

#### Step 3: Configure Tenant Settings

1. Set the tenant's regional settings:
   - Primary Region: Main operating region
   - Language: Default language
   - Currency: Default currency
   - Time Zone: Default time zone

2. Configure tenant limits based on the subscription plan:
   - Maximum Users
   - Maximum Products
   - Storage Allocation
   - API Request Limits
   - Feature Access Levels

![Tenant Settings Configuration](../../images/tutorials/admin-tenant-settings.png)

#### Step 4: Set Up Tenant Administrator

1. Create the primary tenant administrator account:
   - First Name
   - Last Name
   - Email Address
   - Phone Number
   - Job Title

2. Set initial password options:
   - Generate temporary password
   - Send welcome email with password reset link
   - Require password change on first login

![Tenant Administrator Setup](../../images/tutorials/admin-tenant-admin.png)

#### Step 5: Configure Authentication Settings

1. Set authentication policies for the tenant:
   - Password complexity requirements
   - Multi-factor authentication requirements
   - Session timeout settings
   - Failed login attempt limits
   - Password expiration policy

2. Configure authentication providers (optional):
   - Enable/disable username/password authentication
   - Configure OAuth providers (Google, Microsoft, etc.)
   - Set up SAML for enterprise SSO
   - Configure API key authentication

![Authentication Settings](../../images/tutorials/admin-tenant-auth.png)

#### Step 6: Set Up Tenant Domains

1. Configure the tenant's domains:
   - Primary Domain: The main domain for the tenant (e.g., merchant.example.com)
   - API Domain: Domain for API access (e.g., api.example.com)
   - Custom Domains: Additional domains for the tenant

2. Set up DNS verification:
   - Generate DNS verification records
   - Provide instructions for the tenant to update DNS
   - Verify domain ownership

![Domain Configuration](../../images/tutorials/admin-tenant-domains.png)

#### Step 7: Configure Integration Settings

1. Set up e-commerce platform integrations:
   - Enable/disable supported platforms (Shopify, WooCommerce, etc.)
   - Set integration limits
   - Configure default integration settings

2. Configure API access:
   - Generate initial API keys
   - Set API rate limits
   - Configure webhook endpoints
   - Set up API monitoring

![Integration Configuration](../../images/tutorials/admin-tenant-integrations.png)

#### Step 8: Set Up Billing Information

1. Enter billing contact information:
   - Billing Contact Name
   - Billing Email Address
   - Billing Phone Number

2. Enter billing address:
   - Street Address
   - City
   - State/Province
   - Postal/ZIP Code
   - Country

3. Set up payment method:
   - Credit Card
   - Direct Debit
   - Invoice Payment

![Billing Information Setup](../../images/tutorials/admin-tenant-billing.png)

#### Step 9: Review and Create Tenant

1. Review all tenant information and settings
2. Make any necessary adjustments
3. Click "Create Tenant" to finalize the setup
4. Confirm the creation in the confirmation dialog

![Tenant Review and Creation](../../images/tutorials/admin-tenant-review.png)

#### Step 10: Post-Creation Tasks

After creating the tenant, complete these additional tasks:

1. Send welcome email to the tenant administrator
2. Schedule onboarding call or training session
3. Provide documentation and resources
4. Set up monitoring for the new tenant
5. Configure backup and disaster recovery

![Post-Creation Tasks](../../images/tutorials/admin-tenant-post-creation.png)

#### Congratulations!

You have successfully set up a new tenant in the VARAi platform. The tenant administrator can now log in and begin configuring their organization's settings, users, and products.