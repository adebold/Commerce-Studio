# Apple-Inspired UI Design System - Part 7: Accessibility & Responsive Design

## 13. Accessibility Guidelines

### 13.1 WCAG 2.1 Compliance Standards

**Level AA Compliance Requirements:**
- Color contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Keyboard navigation support for all interactive elements
- Screen reader compatibility with semantic HTML
- Focus indicators visible and consistent
- Alternative text for all images and icons

**Apple-Inspired Accessibility Features:**
- Reduced motion support with `prefers-reduced-motion`
- High contrast mode compatibility
- Voice control optimization
- Touch target minimum size: 44px x 44px
- Consistent navigation patterns

### 13.2 Color Accessibility

```css
/* High Contrast Color Overrides */
@media (prefers-contrast: high) {
  :root {
    --color-primary-500: #0066cc;
    --color-gray-600: #000000;
    --color-gray-400: #333333;
    --color-border: #000000;
  }
  
  .button-secondary {
    border-width: 2px;
    border-color: #000000;
  }
  
  .input:focus {
    border-width: 3px;
    border-color: #0066cc;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .parallax {
    transform: none !important;
  }
}

/* Focus Management */
.focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-primary-500);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

### 13.3 Semantic HTML Guidelines

**Required Semantic Structure:**
```html
<!-- Page Structure -->
<header role="banner">
  <nav aria-label="Main navigation">
    <!-- Navigation content -->
  </nav>
</header>

<main role="main">
  <article>
    <header>
      <h1>Page Title</h1>
      <p>Page description</p>
    </header>
    
    <section aria-labelledby="section-heading">
      <h2 id="section-heading">Section Title</h2>
      <!-- Section content -->
    </section>
  </article>
</main>

<aside role="complementary" aria-label="Additional information">
  <!-- Sidebar content -->
</aside>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>

<!-- Interactive Elements -->
<button type="button" aria-expanded="false" aria-controls="dropdown-menu">
  Menu
  <span aria-hidden="true">▼</span>
</button>

<div id="dropdown-menu" role="menu" aria-hidden="true">
  <a href="#" role="menuitem">Option 1</a>
  <a href="#" role="menuitem">Option 2</a>
</div>

<!-- Form Elements -->
<form>
  <fieldset>
    <legend>Contact Information</legend>
    
    <label for="email">
      Email Address
      <span aria-label="required" class="required">*</span>
    </label>
    <input type="email" id="email" required aria-describedby="email-error">
    <div id="email-error" role="alert" aria-live="polite"></div>
  </fieldset>
</form>
```

### 13.4 Screen Reader Optimization

```css
/* Screen Reader Only Text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only-focusable:active,
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* Live Regions */
.live-region {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

[aria-live="polite"] {
  /* Announced after current speech */
}

[aria-live="assertive"] {
  /* Interrupts current speech */
}
```

### 13.5 Keyboard Navigation

```css
/* Focus Styles */
:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Tab Order Management */
.modal {
  /* Trap focus within modals */
}

.modal-overlay {
  /* Prevent background interaction */
  inert: true;
}

/* Custom Focus Indicators */
.button:focus-visible {
  box-shadow: 
    0 0 0 2px white,
    0 0 0 4px var(--color-primary-500);
}

.input:focus-visible {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
}
```

## 14. Responsive Design System

### 14.1 Breakpoint Strategy

```css
/* Mobile-First Breakpoints */
:root {
  --breakpoint-sm: 640px;   /* Small devices */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Laptops */
  --breakpoint-xl: 1280px;  /* Desktops */
  --breakpoint-2xl: 1536px; /* Large screens */
}

/* Media Query Mixins */
@media (min-width: 640px) {
  /* Small and up */
}

@media (min-width: 768px) {
  /* Medium and up */
}

@media (min-width: 1024px) {
  /* Large and up */
}

@media (min-width: 1280px) {
  /* Extra large and up */
}

/* Container Queries (when supported) */
@container (min-width: 320px) {
  .card {
    padding: var(--space-6);
  }
}

@container (min-width: 600px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--space-6);
  }
}
```

### 14.2 Responsive Typography

```css
/* Fluid Typography */
.text-display-1 {
  font-size: clamp(2.25rem, 4vw, 3rem);
  line-height: clamp(1.1, 1.2, 1.3);
}

.text-display-2 {
  font-size: clamp(1.875rem, 3vw, 2.25rem);
  line-height: clamp(1.2, 1.3, 1.4);
}

.text-heading-1 {
  font-size: clamp(1.5rem, 2.5vw, 1.875rem);
  line-height: 1.3;
}

.text-body {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  line-height: 1.6;
}

/* Responsive Text Adjustments */
@media (max-width: 768px) {
  .text-display-1 {
    font-size: 2.25rem;
    letter-spacing: -0.02em;
  }
  
  .text-body {
    font-size: 0.875rem;
    line-height: 1.7;
  }
}

@media (min-width: 1280px) {
  .text-display-1 {
    font-size: 3.75rem;
    letter-spacing: -0.03em;
  }
}
```

### 14.3 Responsive Grid System

```css
/* Responsive Grid Classes */
.grid-responsive {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-5);
  }
}

@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }
}

@media (min-width: 1280px) {
  .grid-responsive {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-8);
  }
}

/* Responsive Cards */
.card-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-6);
  }
}

/* Dashboard Responsive Layout */
.dashboard-responsive {
  display: grid;
  grid-template-areas: 
    "header"
    "sidebar"
    "main";
  grid-template-rows: auto auto 1fr;
}

@media (min-width: 768px) {
  .dashboard-responsive {
    grid-template-areas: 
      "header header"
      "sidebar main";
    grid-template-columns: 240px 1fr;
    grid-template-rows: auto 1fr;
  }
}

@media (min-width: 1024px) {
  .dashboard-responsive {
    grid-template-columns: 280px 1fr;
  }
}
```

### 14.4 Touch-Friendly Design

```css
/* Touch Target Sizes */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Touch Gestures */
.swipeable {
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
}

.scrollable {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* Mobile-Specific Interactions */
@media (hover: none) and (pointer: coarse) {
  /* Touch devices */
  .hover-only {
    display: none;
  }
  
  .button {
    padding: 16px 24px; /* Larger touch targets */
  }
  
  .input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

@media (hover: hover) and (pointer: fine) {
  /* Mouse/trackpad devices */
  .button:hover {
    transform: translateY(-1px);
  }
}
```

### 14.5 Device-Specific Optimizations

```css
/* iOS Safari Optimizations */
@supports (-webkit-touch-callout: none) {
  .ios-safe-area {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
  
  .fixed-header {
    top: env(safe-area-inset-top);
  }
  
  .fixed-footer {
    bottom: env(safe-area-inset-bottom);
  }
}

/* Android Chrome Optimizations */
@media screen and (max-width: 768px) {
  .viewport-height {
    /* Account for URL bar on mobile */
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height */
  }
}

/* High DPI Display Support */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .icon {
    /* Use high-resolution icons */
  }
  
  .logo {
    /* High-resolution logo assets */
  }
}

/* Foldable Device Support */
@media (spanning: single-fold-vertical) {
  .main-content {
    grid-template-columns: 1fr 1fr;
  }
}

@media (spanning: single-fold-horizontal) {
  .main-content {
    grid-template-rows: 1fr 1fr;
  }
}
```

### 14.6 Performance Considerations

```css
/* Critical CSS Loading */
.above-fold {
  /* Inline critical styles */
}

/* Progressive Enhancement */
.js .enhanced-feature {
  /* JavaScript-dependent styles */
}

.no-js .fallback {
  /* Fallback for no JavaScript */
}

/* Reduced Data Usage */
@media (prefers-reduced-data: reduce) {
  .background-image {
    background-image: none;
  }
  
  .video {
    display: none;
  }
  
  .high-quality-image {
    display: none;
  }
  
  .low-quality-fallback {
    display: block;
  }
}

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-only {
    display: block !important;
  }
  
  body {
    font-size: 12pt;
    line-height: 1.4;
    color: black;
    background: white;
  }
  
  a {
    text-decoration: underline;
    color: black;
  }
  
  a[href]:after {
    content: " (" attr(href) ")";
  }
}