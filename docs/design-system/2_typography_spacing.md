# Apple-Inspired UI Design System - Part 2: Typography & Spacing

## 3. Typography System

### 3.1 Font Families

**Primary Font Stack:**
```css
/* Apple-inspired system font stack */
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                'Helvetica Neue', Arial, sans-serif;

/* Monospace for code */
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 
             Consolas, 'Courier New', monospace;

/* Optional premium font for headings */
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### 3.2 Typography Scale

**Type Scale (1.25 ratio - Perfect Fourth):**
```css
/* Typography Scale */
--text-xs: 0.75rem;    /* 12px - Small UI text */
--text-sm: 0.875rem;   /* 14px - UI text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Large body */
--text-xl: 1.25rem;    /* 20px - Small headings */
--text-2xl: 1.5rem;    /* 24px - Section headings */
--text-3xl: 1.875rem;  /* 30px - Page headings */
--text-4xl: 2.25rem;   /* 36px - Display headings */
--text-5xl: 3rem;      /* 48px - Hero headings */
--text-6xl: 3.75rem;   /* 60px - Marketing headings */
```

### 3.3 Typography Styles

**Predefined Text Styles:**
```css
/* Display Styles */
.text-display-1 {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
}

.text-display-2 {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Heading Styles */
.text-heading-1 {
  font-family: var(--font-primary);
  font-size: var(--text-3xl);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.015em;
}

.text-heading-2 {
  font-family: var(--font-primary);
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: 1.3;
}

.text-heading-3 {
  font-family: var(--font-primary);
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.4;
}

/* Body Styles */
.text-body-large {
  font-family: var(--font-primary);
  font-size: var(--text-lg);
  font-weight: 400;
  line-height: 1.6;
}

.text-body {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.6;
}

.text-body-small {
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: 400;
  line-height: 1.5;
}

/* UI Text Styles */
.text-ui-large {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: 500;
  line-height: 1.4;
}

.text-ui {
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.4;
}

.text-ui-small {
  font-family: var(--font-primary);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1.3;
}
```

### 3.4 Typography Usage Guidelines

**Hierarchy Rules:**
- Use only one h1 per page
- Maintain consistent heading levels (don't skip from h1 to h3)
- Apply proper semantic markup for accessibility

**Reading Experience:**
- Optimal line length: 45-75 characters
- Sufficient line spacing: 1.4-1.6 for body text
- Adequate contrast ratios per WCAG guidelines

## 4. Spacing & Layout System

### 4.1 Spacing Scale

**8-Point Grid System:**
```css
/* Spacing Scale (8px base unit) */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### 4.2 Grid System

**12-Column Responsive Grid:**
```css
/* Container Sizes */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* Grid Configuration */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Responsive Grid */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    padding: 0 var(--space-4);
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(8, 1fr);
    gap: var(--space-5);
  }
}
```

### 4.3 Component Spacing

**Internal Component Spacing:**
- Card padding: `24px` (space-6)
- Button padding: `12px 20px` (space-3, space-5)
- Form field spacing: `16px` (space-4)
- Section spacing: `48px` (space-12)
- Page margins: `32px` (space-8)

**Spacing Usage Guidelines:**
- Use consistent spacing throughout the interface
- Apply the 8-point grid for all measurements
- Maintain proportional relationships between elements
- Consider touch targets on mobile (minimum 44px)

### 4.4 Layout Patterns

**Content Width Guidelines:**
```css
/* Reading Width */
.content-width {
  max-width: 65ch; /* Optimal reading width */
  margin: 0 auto;
}

/* Form Width */
.form-width {
  max-width: 400px;
  margin: 0 auto;
}

/* Dashboard Width */
.dashboard-width {
  max-width: var(--container-2xl);
  margin: 0 auto;
}
```

**Spacing Relationships:**
- Related elements: `space-2` to `space-4`
- Component groups: `space-6` to `space-8`
- Page sections: `space-12` to `space-16`
- Major layout areas: `space-20` to `space-32`