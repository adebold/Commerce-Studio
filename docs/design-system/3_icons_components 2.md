# Apple-Inspired UI Design System - Part 3: Icons & Components

## 5. Iconography System

### 5.1 Icon Library

**Primary Icon Set: SF Symbols inspired**
- Style: Outline-first with filled variants
- Weight: Regular (default), Medium (emphasis), Semibold (headers)
- Size: 16px, 20px, 24px, 32px, 48px

**Icon Categories:**
```css
/* Navigation Icons */
.icon-home, .icon-projects, .icon-testing, .icon-research,
.icon-analytics, .icon-quality, .icon-settings

/* Action Icons */
.icon-add, .icon-edit, .icon-delete, .icon-save, .icon-cancel,
.icon-upload, .icon-download, .icon-share, .icon-copy

/* Status Icons */
.icon-success, .icon-warning, .icon-error, .icon-info,
.icon-pending, .icon-complete, .icon-in-progress

/* Interface Icons */
.icon-menu, .icon-close, .icon-search, .icon-filter,
.icon-sort, .icon-view-grid, .icon-view-list, .icon-expand
```

### 5.2 Icon Usage Guidelines

**Sizing Standards:**
- Small UI elements: 16px
- Standard buttons/UI: 20px
- Section headers: 24px
- Feature highlights: 32px
- Hero sections: 48px

**Color Application:**
- Primary icons: `gray-600` (light), `gray-300` (dark)
- Interactive icons: `primary-500` with hover `primary-600`
- Status icons: Use corresponding semantic colors

**Accessibility:**
- Always provide alternative text for decorative icons
- Use aria-hidden="true" for purely decorative icons
- Ensure sufficient contrast for icon colors

## 6. Component Design System

### 6.1 Button Components

#### Primary Button
```css
.button-primary {
  background: var(--color-primary-500);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600;
  font-size: var(--text-sm);
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-primary:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.button-primary:active {
  transform: translateY(0);
}

.button-primary:disabled {
  background: var(--color-gray-300);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

#### Secondary Button
```css
.button-secondary {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 500;
  font-size: var(--text-sm);
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-secondary:hover {
  background: var(--color-gray-200);
  border-color: var(--color-gray-300);
}
```

#### Ghost Button
```css
.button-ghost {
  background: transparent;
  color: var(--color-primary-600);
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 500;
  font-size: var(--text-sm);
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-ghost:hover {
  background: var(--color-primary-50);
}
```

#### Button Sizes
```css
.button-small {
  padding: 8px 16px;
  font-size: var(--text-xs);
}

.button-large {
  padding: 16px 24px;
  font-size: var(--text-base);
}

.button-icon-only {
  padding: 12px;
  width: 44px;
  height: 44px;
}
```

### 6.2 Form Components

#### Input Field
```css
.input {
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: var(--text-base);
  transition: all 0.2s ease;
  width: 100%;
  font-family: var(--font-primary);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  background: white;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.input::placeholder {
  color: var(--color-gray-400);
}

.input:disabled {
  background: var(--color-gray-100);
  color: var(--color-gray-400);
  cursor: not-allowed;
}

.input.error {
  border-color: var(--color-error-500);
  background: var(--color-error-50);
}
```

#### Select Component
```css
.select {
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: var(--text-base);
  cursor: pointer;
  position: relative;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='m2 4-2-2h4z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
}

.select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}
```

#### Textarea
```css
.textarea {
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: var(--text-base);
  font-family: var(--font-primary);
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease;
}

.textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
  background: white;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}
```

#### Form Label
```css
.label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-gray-700);
  margin-bottom: 6px;
}

.label.required:after {
  content: " *";
  color: var(--color-error-500);
}
```

### 6.3 Card Components

#### Standard Card
```css
.card {
  background: white;
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border: 1px solid var(--color-gray-100);
}

.card:hover {
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 10px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  border-bottom: 1px solid var(--color-gray-200);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-4);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: 600;
  margin: 0;
  color: var(--color-gray-900);
}

.card-description {
  font-size: var(--text-sm);
  color: var(--color-gray-600);
  margin: 4px 0 0;
}
```

#### Feature Card
```css
.card-feature {
  background: linear-gradient(135deg, white 0%, var(--color-gray-50) 100%);
  border: 1px solid var(--color-gray-200);
  border-radius: 16px;
  padding: var(--space-8);
  text-align: center;
  transition: all 0.3s ease;
}

.card-feature:hover {
  border-color: var(--color-primary-200);
  box-shadow: 0 8px 25px rgba(14, 165, 233, 0.15);
  transform: translateY(-4px);
}

.card-feature-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-100);
  border-radius: 12px;
  color: var(--color-primary-600);
}
```

#### Stats Card
```css
.card-stats {
  background: white;
  border-radius: 12px;
  padding: var(--space-6);
  border: 1px solid var(--color-gray-200);
  text-align: center;
}

.card-stats-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-primary-600);
  margin: 0;
}

.card-stats-label {
  font-size: var(--text-sm);
  color: var(--color-gray-600);
  margin: 4px 0 0;
}

.card-stats-change {
  font-size: var(--text-xs);
  font-weight: 500;
  margin-top: 8px;
}

.card-stats-change.positive {
  color: var(--color-success-600);
}

.card-stats-change.negative {
  color: var(--color-error-600);
}