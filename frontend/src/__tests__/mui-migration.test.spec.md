# React MUI Theme System Migration - Test Specifications

## Overview

Comprehensive test specifications for validating the React MUI theme system migration targeting reduction of 186 TypeScript errors to <50 for successful production build.

## Test Categories

### 1. Card Subcomponents Migration Tests
### 2. Theme Structure Migration Tests  
### 3. Auth Context Integration Tests
### 4. Design System Import Migration Tests
### 5. Build Compilation Tests
### 6. UI Regression Tests

---

## 1. Card Subcomponents Migration Tests

### Test Suite: `CardSubcomponentMigration.test.tsx`

#### Test Group 1.1: Frame Finder Components
**Target Files:**
- [`FrameComparison.tsx`](../components/frame-finder/FrameComparison.tsx)
- [`FilterSortControls.tsx`](../components/frame-finder/FilterSortControls.tsx)
- [`FaceShapeSelector.tsx`](../components/frame-finder/FaceShapeSelector.tsx)
- [`FeatureTagSelector.tsx`](../components/frame-finder/FeatureTagSelector.tsx)

**Test Cases:**

```typescript
describe('Frame Finder Card Migration', () => {
  test('should render FrameComparison with MUI CardHeader instead of Card.Header', () => {
    // Arrange: Mock frame data
    // Act: Render FrameComparison component
    // Assert: Verify CardHeader is rendered with correct props
    // Assert: Verify no Card.Header elements exist
  });

  test('should render FrameComparison with MUI CardContent instead of Card.Content', () => {
    // Arrange: Mock frame data
    // Act: Render FrameComparison component
    // Assert: Verify CardContent is rendered with correct content
    // Assert: Verify no Card.Content elements exist
  });

  test('should maintain visual layout after Card subcomponent migration', () => {
    // Arrange: Mock frame data
    // Act: Render FrameComparison component
    // Assert: Verify component structure matches expected layout
    // Assert: Verify styling is preserved
  });

  test('should preserve functionality after Card migration in FilterSortControls', () => {
    // Arrange: Mock filter options
    // Act: Render FilterSortControls and interact with filters
    // Assert: Verify filter functionality works correctly
    // Assert: Verify CardHeader/CardContent render properly
  });
});
```

#### Test Group 1.2: Virtual Try-On Components
**Target Files:**
- [`PhotoCapture.tsx`](../components/virtual-try-on/PhotoCapture.tsx)
- [`FrameSelector.tsx`](../components/virtual-try-on/FrameSelector.tsx)
- [`ComparisonView.tsx`](../components/virtual-try-on/ComparisonView.tsx)
- [`TryOnVisualization.tsx`](../components/virtual-try-on/TryOnVisualization.tsx)

**Test Cases:**

```typescript
describe('Virtual Try-On Card Migration', () => {
  test('should render PhotoCapture with proper MUI Card components', () => {
    // Arrange: Mock camera permissions and photo data
    // Act: Render PhotoCapture component
    // Assert: Verify CardHeader displays correct title
    // Assert: Verify CardContent contains photo capture interface
  });

  test('should maintain photo capture functionality after migration', () => {
    // Arrange: Mock camera API
    // Act: Render PhotoCapture and trigger photo capture
    // Assert: Verify photo capture works correctly
    // Assert: Verify UI updates properly
  });

  test('should render FrameSelector with migrated Card components', () => {
    // Arrange: Mock frame selection data
    // Act: Render FrameSelector component
    // Assert: Verify CardHeader shows frame selection title
    // Assert: Verify CardContent displays frame options
  });
});
```

#### Test Group 1.3: Page-Level Components
**Target Files:**
- [`DashboardPage.tsx`](../pages/commerce-studio/DashboardPage.tsx)
- [`SettingsPage.tsx`](../pages/commerce-studio/SettingsPage.tsx)
- [`AccountSettingsPage.tsx`](../pages/commerce-studio/settings/AccountSettingsPage.tsx)

**Test Cases:**

```typescript
describe('Page-Level Card Migration', () => {
  test('should render DashboardPage with migrated Card components', () => {
    // Arrange: Mock dashboard data and user context
    // Act: Render DashboardPage
    // Assert: Verify all Card components use CardHeader/CardContent
    // Assert: Verify page layout is preserved
  });

  test('should render SettingsPage with proper Card structure', () => {
    // Arrange: Mock settings data
    // Act: Render SettingsPage
    // Assert: Verify settings cards use MUI components
    // Assert: Verify form functionality is preserved
  });
});
```

---

## 2. Theme Structure Migration Tests

### Test Suite: `ThemeStructureMigration.test.tsx`

#### Test Group 2.1: Color Palette Migration
**Target:** Replace `theme.colors.*` with `theme.palette.*`

**Test Cases:**

```typescript
describe('Theme Color Palette Migration', () => {
  test('should use theme.palette.primary instead of theme.colors.primary', () => {
    // Arrange: Create test component with styled components
    // Act: Render component with theme
    // Assert: Verify computed styles use MUI palette colors
    // Assert: Verify no theme.colors references exist
  });

  test('should maintain visual consistency after color migration', () => {
    // Arrange: Create component with multiple color references
    // Act: Render component and capture styles
    // Assert: Verify colors match expected MUI palette values
    // Assert: Verify visual appearance is preserved
  });

  test('should handle color variants correctly (main, light, dark)', () => {
    // Arrange: Component using color variants
    // Act: Render with different theme modes
    // Assert: Verify correct color variants are applied
  });
});
```

#### Test Group 2.2: Spacing System Migration
**Target:** Replace `theme.spacing.spacing[*]` with `theme.spacing(*)`

**Test Cases:**

```typescript
describe('Theme Spacing Migration', () => {
  test('should use theme.spacing() function instead of spacing array', () => {
    // Arrange: Component with spacing references
    // Act: Render component
    // Assert: Verify spacing values are calculated correctly
    // Assert: Verify no theme.spacing.spacing references exist
  });

  test('should maintain layout spacing after migration', () => {
    // Arrange: Complex layout component
    // Act: Render and measure spacing
    // Assert: Verify spacing matches expected values
    // Assert: Verify responsive spacing works correctly
  });
});
```

#### Test Group 2.3: Shadow System Migration
**Target:** Replace `theme.shadows.effects.*` with `theme.shadows[*]`

**Test Cases:**

```typescript
describe('Theme Shadow Migration', () => {
  test('should use MUI shadow array instead of custom shadow effects', () => {
    // Arrange: Component with shadow styling
    // Act: Render component
    // Assert: Verify shadows use MUI shadow values
    // Assert: Verify shadow effects are visually consistent
  });

  test('should handle hover and focus shadow states correctly', () => {
    // Arrange: Interactive component with shadow states
    // Act: Simulate hover and focus interactions
    // Assert: Verify shadow transitions work correctly
  });
});
```

#### Test Group 2.4: Typography Migration
**Target:** Replace `theme.typography.fontWeight.*` with MUI equivalents

**Test Cases:**

```typescript
describe('Theme Typography Migration', () => {
  test('should use MUI typography fontWeight values', () => {
    // Arrange: Component with typography styling
    // Act: Render component
    // Assert: Verify font weights use MUI values
    // Assert: Verify typography hierarchy is preserved
  });

  test('should maintain text styling consistency', () => {
    // Arrange: Multiple text components
    // Act: Render components
    // Assert: Verify consistent typography across components
  });
});
```

---

## 3. Auth Context Integration Tests

### Test Suite: `AuthContextMigration.test.tsx`

#### Test Group 3.1: UserContext Interface Updates
**Target Files:**
- [`BrandManagerDashboard.tsx`](../components/dashboard/BrandManagerDashboard.tsx)
- [`ClientAdminDashboard.tsx`](../components/dashboard/ClientAdminDashboard.tsx)
- [`SuperAdminDashboard.tsx`](../components/dashboard/SuperAdminDashboard.tsx)
- [`ViewerDashboard.tsx`](../components/dashboard/ViewerDashboard.tsx)

**Test Cases:**

```typescript
describe('Auth Context Migration', () => {
  test('should access userId from UserContext correctly', () => {
    // Arrange: Mock UserContext with userId
    // Act: Render BrandManagerDashboard
    // Assert: Verify userId is displayed correctly
    // Assert: Verify no TypeScript errors for userId access
  });

  test('should handle missing userId gracefully', () => {
    // Arrange: Mock UserContext without userId
    // Act: Render dashboard component
    // Assert: Verify fallback display works
    // Assert: Verify no runtime errors occur
  });

  test('should maintain authentication functionality', () => {
    // Arrange: Mock complete auth context
    // Act: Render dashboard and test auth-dependent features
    // Assert: Verify auth-protected content renders correctly
    // Assert: Verify user role-based access works
  });
});
```

#### Test Group 3.2: Auth Provider Integration
**Target Files:**
- [`AuthProvider.tsx`](../components/auth/AuthProvider.tsx)

**Test Cases:**

```typescript
describe('Auth Provider Integration', () => {
  test('should provide userId in context value', () => {
    // Arrange: Mock auth service with user data
    // Act: Render AuthProvider with child components
    // Assert: Verify userId is available in context
    // Assert: Verify context type definitions are correct
  });

  test('should handle auth state changes correctly', () => {
    // Arrange: Mock auth state transitions
    // Act: Trigger login/logout actions
    // Assert: Verify context updates correctly
    // Assert: Verify dependent components re-render
  });
});
```

---

## 4. Design System Import Migration Tests

### Test Suite: `DesignSystemImportMigration.test.tsx`

#### Test Group 4.1: Import Statement Validation

**Test Cases:**

```typescript
describe('Design System Import Migration', () => {
  test('should import components from @mui/material instead of design-system', () => {
    // Arrange: Scan component files for import statements
    // Act: Parse import statements
    // Assert: Verify no imports from deleted design-system paths
    // Assert: Verify MUI imports are correctly structured
  });

  test('should maintain component functionality after import migration', () => {
    // Arrange: Components using migrated imports
    // Act: Render components
    // Assert: Verify components render without errors
    // Assert: Verify component props and behavior are preserved
  });

  test('should handle component prop compatibility', () => {
    // Arrange: Components with complex prop usage
    // Act: Render with various prop combinations
    // Assert: Verify MUI components accept expected props
    // Assert: Verify prop types are compatible
  });
});
```

---

## 5. Build Compilation Tests

### Test Suite: `BuildCompilation.test.tsx`

#### Test Group 5.1: TypeScript Compilation

**Test Cases:**

```typescript
describe('Build Compilation Validation', () => {
  test('should compile TypeScript without Card subcomponent errors', () => {
    // Arrange: Run TypeScript compiler
    // Act: Compile project
    // Assert: Verify no Card.Header/Card.Content errors
    // Assert: Verify error count is reduced
  });

  test('should compile with theme property migrations', () => {
    // Arrange: Run TypeScript compiler
    // Act: Compile project
    // Assert: Verify no theme.colors.* errors
    // Assert: Verify no theme.spacing.spacing errors
    // Assert: Verify no theme.shadows.effects errors
  });

  test('should achieve target error count (<50)', () => {
    // Arrange: Run full TypeScript compilation
    // Act: Count compilation errors
    // Assert: Verify total errors < 50
    // Assert: Verify no critical build-blocking errors
  });
});
```

#### Test Group 5.2: Production Build Validation

**Test Cases:**

```typescript
describe('Production Build Validation', () => {
  test('should build successfully for production', () => {
    // Arrange: Clean build environment
    // Act: Run production build command
    // Assert: Verify build completes successfully
    // Assert: Verify no build errors or warnings
  });

  test('should generate optimized bundle', () => {
    // Arrange: Run production build
    // Act: Analyze build output
    // Assert: Verify bundle size is reasonable
    // Assert: Verify code splitting works correctly
  });
});
```

---

## 6. UI Regression Tests

### Test Suite: `UIRegressionTests.test.tsx`

#### Test Group 6.1: Visual Consistency

**Test Cases:**

```typescript
describe('UI Regression Tests', () => {
  test('should maintain visual consistency after Card migration', () => {
    // Arrange: Render components before and after migration
    // Act: Compare visual output
    // Assert: Verify layout is preserved
    // Assert: Verify styling matches expected appearance
  });

  test('should preserve responsive behavior', () => {
    // Arrange: Components with responsive design
    // Act: Test at different viewport sizes
    // Assert: Verify responsive behavior is maintained
    // Assert: Verify mobile layouts work correctly
  });

  test('should maintain accessibility features', () => {
    // Arrange: Components with accessibility features
    // Act: Run accessibility tests
    // Assert: Verify ARIA attributes are preserved
    // Assert: Verify keyboard navigation works
  });
});
```

#### Test Group 6.2: Functional Regression

**Test Cases:**

```typescript
describe('Functional Regression Tests', () => {
  test('should preserve component interactions', () => {
    // Arrange: Interactive components
    // Act: Simulate user interactions
    // Assert: Verify interactions work as expected
    // Assert: Verify event handlers function correctly
  });

  test('should maintain form functionality', () => {
    // Arrange: Form components with validation
    // Act: Submit forms with various inputs
    // Assert: Verify form validation works
    // Assert: Verify form submission succeeds
  });

  test('should preserve data flow and state management', () => {
    // Arrange: Components with complex state
    // Act: Trigger state changes
    // Assert: Verify state updates correctly
    // Assert: Verify data flow is maintained
  });
});
```

---

## Test Execution Strategy

### Phase 1: Pre-Migration Baseline Tests
1. Run all existing tests to establish baseline
2. Document current test coverage
3. Identify critical functionality to preserve

### Phase 2: Migration Validation Tests
1. **Card Subcomponents** (LS5_001-003)
   - Test each component after Card migration
   - Verify imports and rendering
   - Validate functionality preservation

2. **Theme Structure** (LS5_004-006)
   - Test theme property access
   - Verify visual consistency
   - Validate responsive behavior

3. **Auth Context** (LS5_007)
   - Test userId access in dashboard components
   - Verify auth provider functionality
   - Validate type definitions

4. **Design System Imports** (LS5_008)
   - Test import statement migrations
   - Verify component functionality
   - Validate prop compatibility

### Phase 3: Integration and Build Tests
1. **Build Compilation** (LS5_009)
   - Run TypeScript compilation
   - Verify error count reduction
   - Test production build

2. **UI Regression Testing**
   - Visual consistency checks
   - Functional regression tests
   - Performance validation

### Phase 4: Continuous Validation
1. Run full test suite after each migration step
2. Monitor error count reduction progress
3. Validate no new regressions introduced

---

## Success Criteria

### Primary Objectives
- [ ] TypeScript errors reduced from 186 to <50
- [ ] Successful production build compilation
- [ ] All Card.Header/Card.Content replaced with MUI components
- [ ] Theme properties use MUI structure
- [ ] Auth context provides userId correctly
- [ ] Design system imports migrated to MUI

### Quality Assurance
- [ ] All tests pass after migration
- [ ] No visual regressions detected
- [ ] Component functionality preserved
- [ ] Performance maintained or improved
- [ ] Accessibility features preserved
- [ ] Responsive design maintained

### Technical Validation
- [ ] No runtime errors in development
- [ ] Clean console output (no warnings/errors)
- [ ] Proper TypeScript type checking
- [ ] Optimized production bundle
- [ ] Consistent code style and patterns

---

## Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/setupTests.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Test Utilities
```typescript
// src/__tests__/utils/test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../theme/ThemeProvider';

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

---

## Monitoring and Reporting

### Error Tracking
- Monitor TypeScript error count after each migration step
- Track specific error categories and resolution progress
- Document any new errors introduced during migration

### Test Coverage
- Maintain minimum 80% test coverage
- Focus on critical migration paths
- Ensure new MUI component usage is tested

### Performance Monitoring
- Track bundle size changes
- Monitor component render performance
- Validate memory usage patterns

### Quality Metrics
- Zero runtime errors in development
- Clean console output
- Successful production builds
- Preserved accessibility scores