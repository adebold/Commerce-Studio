# Apple-Inspired UI Design System - Part 6: Email Design & Templates

## 11. Email Design System

### 11.1 Email Design Principles

**Apple-Inspired Email Design Philosophy:**
- **Clean & Minimal**: Generous white space with focused content
- **Clear Hierarchy**: Typography and spacing create obvious information flow
- **Mobile-First**: Optimized for mobile email clients
- **Dark Mode Ready**: Support for both light and dark mode preferences
- **Accessible**: High contrast and screen reader friendly

### 11.2 Email Color Palette

```css
/* Email-Safe Colors */
--email-primary: #0ea5e9;
--email-primary-dark: #0284c7;
--email-secondary: #64748b;
--email-success: #22c55e;
--email-warning: #f59e0b;
--email-error: #ef4444;

/* Email Backgrounds */
--email-bg-light: #ffffff;
--email-bg-gray: #f8fafc;
--email-bg-dark: #1e293b;
--email-border: #e2e8f0;

/* Email Text Colors */
--email-text-primary: #1e293b;
--email-text-secondary: #64748b;
--email-text-muted: #94a3b8;
--email-text-inverse: #ffffff;
```

### 11.3 Email Typography

```css
/* Email Typography Stack - Widely supported fonts */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Helvetica Neue', Arial, sans-serif;

/* Email Text Styles */
.email-heading-1 { 
  font-size: 28px; 
  font-weight: 600; 
  line-height: 1.2; 
  color: #1e293b;
  margin: 0 0 16px;
}

.email-heading-2 { 
  font-size: 24px; 
  font-weight: 600; 
  line-height: 1.3; 
  color: #1e293b;
  margin: 0 0 12px;
}

.email-heading-3 { 
  font-size: 20px; 
  font-weight: 600; 
  line-height: 1.4; 
  color: #1e293b;
  margin: 0 0 8px;
}

.email-body { 
  font-size: 16px; 
  font-weight: 400; 
  line-height: 1.6; 
  color: #1e293b;
  margin: 0 0 16px;
}

.email-body-large { 
  font-size: 18px; 
  font-weight: 400; 
  line-height: 1.6; 
  color: #1e293b;
  margin: 0 0 20px;
}

.email-caption { 
  font-size: 14px; 
  font-weight: 400; 
  line-height: 1.5; 
  color: #64748b;
  margin: 0 0 12px;
}

.email-small { 
  font-size: 12px; 
  font-weight: 400; 
  line-height: 1.4; 
  color: #94a3b8;
  margin: 0;
}
```

### 11.4 Email Button Styles

```html
<!-- Primary Button -->
<table cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="background: #0ea5e9; border-radius: 8px; padding: 16px 32px;">
      <a href="#" style="color: #ffffff; text-decoration: none; font-weight: 600; 
                         font-size: 16px; line-height: 1; display: block;">
        Get Started
      </a>
    </td>
  </tr>
</table>

<!-- Secondary Button -->
<table cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; 
               padding: 16px 32px;">
      <a href="#" style="color: #1e293b; text-decoration: none; font-weight: 500; 
                         font-size: 16px; line-height: 1; display: block;">
        Learn More
      </a>
    </td>
  </tr>
</table>

<!-- Ghost Button -->
<table cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding: 16px 32px;">
      <a href="#" style="color: #0ea5e9; text-decoration: none; font-weight: 500; 
                         font-size: 16px; line-height: 1; display: block;
                         border-bottom: 1px solid #0ea5e9;">
        View Details
      </a>
    </td>
  </tr>
</table>
```

### 11.5 Email Layout Foundation

```html
<!-- Email Container (600px max width) -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" 
       style="background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <tr>
    <td align="center" style="padding: 40px 20px;">
      
      <!-- Main Content Container -->
      <table width="600" cellpadding="0" cellspacing="0" border="0" 
             style="background: #ffffff; border-radius: 12px; overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        
        <!-- Email Header -->
        <tr>
          <td style="padding: 40px 40px 20px; text-align: center; background: #ffffff;">
            <img src="logo.png" alt="Platform Logo" width="120" 
                 style="display: block; margin: 0 auto;">
          </td>
        </tr>
        
        <!-- Email Body -->
        <tr>
          <td style="padding: 20px 40px 40px;">
            <!-- Content goes here -->
          </td>
        </tr>
        
        <!-- Email Footer -->
        <tr>
          <td style="padding: 20px 40px; background: #f8fafc; 
                     border-top: 1px solid #e2e8f0;">
            <!-- Footer content -->
          </td>
        </tr>
        
      </table>
      
    </td>
  </tr>
</table>
```

## 12. Email Template Library

### 12.1 Welcome Email Template

```html
<!-- Welcome Email -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" 
       style="background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
  <tr>
    <td align="center" style="padding: 40px 20px;">
      
      <table width="600" cellpadding="0" cellspacing="0" border="0" 
             style="background: #ffffff; border-radius: 12px;">
        
        <!-- Header -->
        <tr>
          <td style="padding: 40px 40px 20px; text-align: center;">
            <img src="logo.png" alt="Platform Logo" width="120" 
                 style="display: block; margin: 0 auto;">
          </td>
        </tr>
        
        <!-- Hero Section -->
        <tr>
          <td style="padding: 20px 40px; text-align: center;">
            <h1 style="font-size: 28px; font-weight: 600; color: #1e293b; 
                       margin: 0 0 16px; line-height: 1.2;">
              Welcome to the Platform
            </h1>
            <p style="font-size: 18px; color: #64748b; margin: 0 0 32px; 
                      line-height: 1.6;">
              You're all set to start creating amazing user experiences. 
              Let's get you up and running with your first project.
            </p>
          </td>
        </tr>
        
        <!-- CTA Button -->
        <tr>
          <td style="padding: 0 40px 40px; text-align: center;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
              <tr>
                <td style="background: #0ea5e9; border-radius: 8px; padding: 16px 32px;">
                  <a href="#" style="color: #ffffff; text-decoration: none; 
                                    font-weight: 600; font-size: 16px; display: block;">
                    Create Your First Project
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Quick Start Guide -->
        <tr>
          <td style="padding: 40px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
            <h3 style="font-size: 20px; font-weight: 600; color: #1e293b; 
                       margin: 0 0 20px;">
              Quick Start Guide
            </h3>
            
            <!-- Step 1 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
              <tr>
                <td width="40" style="vertical-align: top; padding-right: 16px;">
                  <div style="width: 24px; height: 24px; background: #0ea5e9; 
                              border-radius: 50%; color: white; text-align: center; 
                              font-size: 14px; font-weight: 600; line-height: 24px;">
                    1
                  </div>
                </td>
                <td>
                  <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; 
                             margin: 0 0 4px;">
                    Create a Project
                  </h4>
                  <p style="font-size: 14px; color: #64748b; margin: 0; line-height: 1.5;">
                    Set up your first usability testing project and define your goals.
                  </p>
                </td>
              </tr>
            </table>
            
            <!-- Step 2 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
              <tr>
                <td width="40" style="vertical-align: top; padding-right: 16px;">
                  <div style="width: 24px; height: 24px; background: #0ea5e9; 
                              border-radius: 50%; color: white; text-align: center; 
                              font-size: 14px; font-weight: 600; line-height: 24px;">
                    2
                  </div>
                </td>
                <td>
                  <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; 
                             margin: 0 0 4px;">
                    Upload Designs
                  </h4>
                  <p style="font-size: 14px; color: #64748b; margin: 0; line-height: 1.5;">
                    Add your design files and prototypes for testing.
                  </p>
                </td>
              </tr>
            </table>
            
            <!-- Step 3 -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="40" style="vertical-align: top; padding-right: 16px;">
                  <div style="width: 24px; height: 24px; background: #0ea5e9; 
                              border-radius: 50%; color: white; text-align: center; 
                              font-size: 14px; font-weight: 600; line-height: 24px;">
                    3
                  </div>
                </td>
                <td>
                  <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; 
                             margin: 0 0 4px;">
                    Run Your First Test
                  </h4>
                  <p style="font-size: 14px; color: #64748b; margin: 0; line-height: 1.5;">
                    Recruit participants and start gathering valuable insights.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="padding: 20px 40px; text-align: center; 
                     border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">
              Need help? <a href="#" style="color: #0ea5e9;">Contact our support team</a>
            </p>
          </td>
        </tr>
        
      </table>
      
    </td>
  </tr>
</table>
```

### 12.2 Test Results Email Template

```html
<!-- Test Results Email -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" 
       style="background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
  <tr>
    <td align="center" style="padding: 40px 20px;">
      
      <table width="600" cellpadding="0" cellspacing="0" border="0" 
             style="background: #ffffff; border-radius: 12px;">
        
        <!-- Header with Project Info -->
        <tr>
          <td style="padding: 40px 40px 20px; background: #f8fafc; 
                     border-radius: 12px 12px 0 0;">
            <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; 
                       margin: 0 0 8px;">
              Test Results Ready
            </h2>
            <p style="font-size: 16px; color: #64748b; margin: 0;">
              Project: Mobile App Redesign • Completed: March 15, 2024
            </p>
          </td>
        </tr>
        
        <!-- Key Metrics Section -->
        <tr>
          <td style="padding: 40px;">
            <h3 style="font-size: 20px; font-weight: 600; color: #1e293b; 
                       margin: 0 0 24px;">
              Key Results
            </h3>
            
            <!-- Metrics Grid -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <!-- User Satisfaction -->
                <td width="48%" style="text-align: center; padding: 20px; 
                                    background: #f0f9ff; border-radius: 8px;">
                  <div style="font-size: 32px; font-weight: 700; color: #0ea5e9;">
                    4.2/5
                  </div>
                  <div style="font-size: 14px; color: #64748b; margin-top: 4px;">
                    User Satisfaction
                  </div>
                </td>
                
                <td width="4%"></td>
                
                <!-- Task Completion -->
                <td width="48%" style="text-align: center; padding: 20px; 
                                    background: #f0fdf4; border-radius: 8px;">
                  <div style="font-size: 32px; font-weight: 700; color: #22c55e;">
                    87%
                  </div>
                  <div style="font-size: 14px; color: #64748b; margin-top: 4px;">
                    Task Completion
                  </div>
                </td>
              </tr>
            </table>
            
            <!-- Additional Metrics -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
              <tr>
                <!-- Time on Task -->
                <td width="48%" style="text-align: center; padding: 20px; 
                                    background: #fffbeb; border-radius: 8px;">
                  <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">
                    3:42
                  </div>
                  <div style="font-size: 14px; color: #64748b; margin-top: 4px;">
                    Avg. Time on Task
                  </div>
                </td>
                
                <td width="4%"></td>
                
                <!-- Participants -->
                <td width="48%" style="text-align: center; padding: 20px; 
                                    background: #f8fafc; border-radius: 8px;">
                  <div style="font-size: 32px; font-weight: 700; color: #64748b;">
                    12
                  </div>
                  <div style="font-size: 14px; color: #64748b; margin-top: 4px;">
                    Participants
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Key Insights -->
        <tr>
          <td style="padding: 0 40px 40px;">
            <h3 style="font-size: 20px; font-weight: 600; color: #1e293b; 
                       margin: 0 0 16px;">
              Key Insights
            </h3>
            
            <ul style="margin: 0; padding-left: 20px; color: #1e293b;">
              <li style="margin-bottom: 8px; line-height: 1.5;">
                Navigation improvements increased task success by 23%
              </li>
              <li style="margin-bottom: 8px; line-height: 1.5;">
                Users struggled with the checkout flow on mobile devices
              </li>
              <li style="margin-bottom: 8px; line-height: 1.5;">
                Search functionality exceeded user expectations
              </li>
            </ul>
          </td>
        </tr>
        
        <!-- CTA Section -->
        <tr>
          <td style="padding: 0 40px 40px; text-align: center;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
              <tr>
                <td style="background: #0ea5e9; border-radius: 8px; padding: 16px 32px;">
                  <a href="#" style="color: #ffffff; text-decoration: none; 
                                    font-weight: 600; font-size: 16px; display: block;">
                    View Full Report
                  </a>
                </td>
              </tr>
            </table>
            
            <p style="font-size: 14px; color: #64748b; margin: 16px 0 0;">
              Or <a href="#" style="color: #0ea5e9; text-decoration: none;">
              download the PDF report</a>
            </p>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="padding: 20px 40px; text-align: center; 
                     border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">
              Questions about your results? 
              <a href="#" style="color: #0ea5e9;">Contact your research team</a>
            </p>
          </td>
        </tr>
        
      </table>
      
    </td>
  </tr>
</table>
```

### 12.3 Dark Mode Email Support

```html
<!-- Dark Mode Styles -->
<style>
  @media (prefers-color-scheme: dark) {
    .email-container { background: #1e293b !important; }
    .email-card { background: #334155 !important; }
    .email-text-primary { color: #ffffff !important; }
    .email-text-secondary { color: #cbd5e1 !important; }
    .email-border { border-color: #475569 !important; }
  }
</style>

<!-- Dark Mode Email Structure -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" 
       class="email-container" style="background: #f8fafc;">
  <!-- Content with dark mode classes -->
</table>