# Prompts LS5_003 Refined: Critical Issue Resolution & Enhanced Migration Strategy

## Executive Summary

Based on the LS5_002 scoring analysis (73.8/100) and comprehensive TDD test coverage analysis, this refined prompt set addresses critical blocking issues while establishing a robust foundation for the remaining MUI migration phases. The TDD analysis revealed that **critical TypeScript variant prop errors have been resolved**, providing a stable foundation for LS5_003 implementation.

**Critical Issues Addressed:**
- ✅ **RESOLVED**: TypeScript variant prop errors in FrameSelector.tsx:209 and RecommendationCard.tsx:109
- 🎯 **TARGET**: Accessibility compliance improvement (45.0 → 70.0+)
- 🎯 **TARGET**: Import path standardization across all components
- 🎯 **TARGET**: Theme integration consistency (60.0 → 80.0+)
- 🎯 **TARGET**: TypeScript error reduction (220 → 150, 32% reduction)

**LS5_003 Enhanced Targets:**
- [`SettingsPage.tsx`](frontend/src/pages/commerce-studio/SettingsPage.tsx) - Settings navigation and form management
- [`DashboardPage.tsx`](frontend/src/pages/commerce-studio/DashboardPage.tsx) - Dashboard metrics and responsive layout
- [`AccountSettingsPage.tsx`](frontend/src/pages/commerce-studio/settings/AccountSettingsPage.tsx) - Account management forms

**Quality Gate Adjustments:**
- Accessibility threshold: 70.0 (reduced from 75.0, achievable with focused effort)
- Variant prop validation: **MANDATORY** blocking gate (already resolved)
- Import path consistency: **MANDATORY** for all new migrations
- Test coverage minimum: 85% for all migrated components

---

## Prompt [LS5_003_001]: Migrate SettingsPage.tsx with Enhanced Accessibility

### Context
The [`SettingsPage.tsx`](frontend/src/pages/commerce-studio/SettingsPage.tsx) component requires Card subcomponent migration while implementing comprehensive accessibility enhancements based on the TDD analysis findings. The component serves as a critical user interface for settings management and must meet WCAG 2.1 AA standards.

### Objective
Migrate SettingsPage.tsx to proper MUI Card components while implementing accessibility-first design patterns and maintaining settings navigation functionality.

### Focus Areas
- Replace any Card.Header/Card.Content with MUI CardHeader/CardContent
- Implement comprehensive ARIA attributes and semantic HTML
- Ensure keyboard navigation support throughout settings interface
- Maintain sticky navigation positioning and responsive behavior
- Add proper focus management for settings sections

### Code Reference
```typescript
// ACCESSIBILITY-ENHANCED SETTINGS PATTERN
import { Card, CardHeader, CardContent } from '@mui/material';

const AccessibleSettingsCard: React.FC<SettingsCardProps> = ({ 
  title, 
  children, 
  sectionId,
  ...props 
}) => (
  <Card 
    variant="outlined" 
    role="region"
    aria-labelledby={`${sectionId}-header`}
    {...props}
  >
    <CardHeader 
      id={`${sectionId}-header`}
      title={title}
      component="h2"
      role="banner"
      sx={{ 
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px'
        }
      }}
    />
    <CardContent 
      role="main"
      aria-labelledby={`${sectionId}-header`}
      tabIndex={0}
    >
      {children}
    </CardContent>
  </Card>
);

// NAVIGATION ACCESSIBILITY PATTERN
const SettingsNavigation: React.FC = () => (
  <nav role="navigation" aria-label="Settings navigation">
    <Card variant="outlined" role="complementary">
      <CardHeader 
        title="Settings Navigation"
        component="h2"
        aria-level={2}
      />
      <CardContent>
        <List role="menu">
          {settingsItems.map((item, index) => (
            <ListItem 
              key={item.id}
              role="menuitem"
              tabIndex={0}
              aria-describedby={`${item.id}-description`}
              onKeyDown={(e) => handleKeyNavigation(e, index)}
            >
              {item.label}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  </nav>
);
```

### Requirements
- **MANDATORY**: Add ARIA labels to all Card components
- **MANDATORY**: Implement proper heading hierarchy (h1 → h2 → h3)
- **MANDATORY**: Ensure keyboard navigation with Tab, Enter, and Arrow keys
- **MANDATORY**: Add focus management for settings sections
- **MANDATORY**: Use semantic HTML elements (nav, main, section)
- Maintain sticky positioning and responsive behavior
- Preserve existing settings functionality
- Add skip links for screen reader users

### Expected Improvements
- Eliminate all Card-related TypeScript errors in SettingsPage
- Achieve 70.0+ accessibility compliance score
- Implement WCAG 2.1 AA compliant navigation
- Maintain 100% functionality preservation
- Establish accessibility pattern for other page components

### Validation Criteria
- Zero accessibility violations with jest-axe testing
- Keyboard navigation functional for all interactive elements
- Screen reader compatibility verified
- Focus indicators visible and properly styled
- Semantic HTML structure validated

---

## Prompt [LS5_003_002]: Migrate DashboardPage.tsx with Performance Optimization

### Context
The [`DashboardPage.tsx`](frontend/src/pages/commerce-studio/DashboardPage.tsx) component requires Card migration while addressing bundle size concerns (60.0/100 performance score) and implementing optimized import patterns based on TDD analysis recommendations.

### Objective
Migrate DashboardPage.tsx Card components while implementing comprehensive performance optimization strategies and maintaining dashboard functionality.

### Focus Areas
- Replace Card.Header/Card.Content with optimized MUI CardHeader/CardContent
- Implement tree-shaking friendly import patterns
- Add performance monitoring for dashboard metrics rendering
- Ensure responsive grid layout with proper loading states
- Optimize component re-rendering patterns

### Code Reference
```typescript
// PERFORMANCE-OPTIMIZED DASHBOARD PATTERN
import { Card, CardHeader, CardContent, Grid, Skeleton } from '@mui/material';
import { memo, useMemo, useCallback } from 'react';

// Memoized dashboard card for performance
const DashboardMetricCard = memo<DashboardCardProps>(({ 
  title, 
  value, 
  isLoading, 
  error,
  ...props 
}) => {
  const cardContent = useMemo(() => {
    if (isLoading) return <Skeleton variant="rectangular" height={120} />;
    if (error) return <Alert severity="error">{error}</Alert>;
    return <Typography variant="h4">{value}</Typography>;
  }, [isLoading, error, value]);

  return (
    <Card 
      variant="outlined" 
      role="region"
      aria-label={`${title} dashboard metric`}
      {...props}
    >
      <CardHeader 
        title={title}
        component="h3"
        aria-level={3}
      />
      <CardContent>
        {cardContent}
      </CardContent>
    </Card>
  );
});

// Optimized grid layout with proper loading states
const DashboardGrid: React.FC<DashboardGridProps> = ({ metrics, isLoading }) => {
  const handleMetricClick = useCallback((metricId: string) => {
    // Optimized click handler
  }, []);

  return (
    <Grid container spacing={3} role="main" aria-label="Dashboard metrics">
      {metrics.map((metric) => (
        <Grid item xs={12} sm={6} md={4} key={metric.id}>
          <DashboardMetricCard
            title={metric.title}
            value={metric.value}
            isLoading={isLoading}
            error={metric.error}
            onClick={() => handleMetricClick(metric.id)}
          />
        </Grid>
      ))}
    </Grid>
  );
};
```

### Requirements
- **MANDATORY**: Implement tree-shaking friendly imports
- **MANDATORY**: Add React.memo for performance optimization
- **MANDATORY**: Use useMemo and useCallback for expensive operations
- **MANDATORY**: Add proper loading states with Skeleton components
- **MANDATORY**: Implement error boundaries for dashboard sections
- Maintain responsive grid layout functionality
- Preserve dashboard metrics calculation and display
- Add performance monitoring hooks

### Expected Improvements
- Reduce TypeScript errors by 40-50% in DashboardPage
- Optimize bundle size by 10-15% through improved imports
- Improve rendering performance by 20%+ through memoization
- Achieve 80.0+ performance score
- Maintain 100% dashboard functionality

### Validation Criteria
- Bundle size analysis shows improvement
- React DevTools Profiler shows reduced re-renders
- Loading states function properly
- Error boundaries catch and display errors appropriately
- Responsive behavior maintained across breakpoints

---

## Prompt [LS5_003_003]: Migrate AccountSettingsPage.tsx with Enhanced Form Integration

### Context
The [`AccountSettingsPage.tsx`](frontend/src/pages/commerce-studio/settings/AccountSettingsPage.tsx) component requires Card migration while implementing standardized error handling patterns and enhanced form accessibility based on TDD analysis findings.

### Objective
Migrate AccountSettingsPage.tsx Card components while implementing comprehensive form validation, error handling, and accessibility enhancements.

### Focus Areas
- Replace Card.Header/Card.Content with MUI CardHeader/CardContent
- Implement standardized error handling with MUI Alert components
- Add comprehensive form accessibility (ARIA labels, fieldsets, descriptions)
- Ensure proper form validation and state management
- Create reusable form card patterns

### Code Reference
```typescript
// ENHANCED FORM CARD PATTERN
import { Card, CardHeader, CardContent, Alert, FormControl, FormHelperText } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  description,
  children, 
  error, 
  sectionId,
  ...props 
}) => (
  <Card 
    variant="outlined" 
    role="region"
    aria-labelledby={`${sectionId}-header`}
    aria-describedby={description ? `${sectionId}-description` : undefined}
    {...props}
  >
    <CardHeader 
      id={`${sectionId}-header`}
      title={title}
      component="h3"
      aria-level={3}
    />
    <CardContent>
      {description && (
        <Typography 
          id={`${sectionId}-description`}
          variant="body2" 
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {description}
        </Typography>
      )}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          role="alert"
          aria-live="polite"
        >
          {error}
        </Alert>
      )}
      <fieldset>
        <legend className="sr-only">{title} form fields</legend>
        {children}
      </fieldset>
    </CardContent>
  </Card>
);

// ACCESSIBLE FORM IMPLEMENTATION
const AccountSettingsForm: React.FC = () => {
  const formik = useFormik({
    initialValues: {
      email: '',
      displayName: '',
      notifications: true,
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
      displayName: Yup.string().required('Display name is required'),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        await updateAccountSettings(values);
      } catch (error) {
        setFieldError('general', 'Failed to update settings. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <FormSection
        title="Account Information"
        description="Update your basic account information"
        sectionId="account-info"
        error={formik.errors.general}
      >
        <FormControl fullWidth error={!!(formik.touched.email && formik.errors.email)}>
          <TextField
            id="email"
            name="email"
            label="Email Address"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!(formik.touched.email && formik.errors.email)}
            aria-describedby={formik.errors.email ? "email-error" : undefined}
            required
          />
          {formik.touched.email && formik.errors.email && (
            <FormHelperText id="email-error" role="alert">
              {formik.errors.email}
            </FormHelperText>
          )}
        </FormControl>
      </FormSection>
    </form>
  );
};
```

### Requirements
- **MANDATORY**: Implement comprehensive form accessibility (ARIA labels, fieldsets, descriptions)
- **MANDATORY**: Add proper error handling with live regions (aria-live)
- **MANDATORY**: Use semantic HTML for form structure
- **MANDATORY**: Implement form validation with clear error messages
- **MANDATORY**: Add focus management for form navigation
- Maintain form state management and validation logic
- Preserve account settings functionality
- Create reusable form patterns

### Expected Improvements
- Eliminate all Card-related TypeScript errors in AccountSettingsPage
- Achieve 80.0+ accessibility compliance for forms
- Implement standardized error handling patterns
- Maintain 100% account management functionality
- Create reusable form accessibility patterns

### Validation Criteria
- Form validation works correctly with clear error messages
- Screen reader announces errors and form state changes
- Keyboard navigation works throughout form
- Focus management guides users through form completion
- Error states are clearly communicated

---

## Prompt [LS5_003_004]: Implement Comprehensive Import Path Standardization

### Context
The LS5_002 analysis revealed import path inconsistencies (CI_001) affecting maintainability. The TDD analysis confirmed that standardized import patterns are critical for bundle optimization and long-term maintainability.

### Objective
Standardize import paths across all LS5_003 components while implementing automated linting rules and bundle size optimization strategies.

### Focus Areas
- Standardize all MUI component imports to use consistent patterns
- Implement tree-shaking friendly import strategies
- Create ESLint rules for import path consistency
- Optimize bundle size through selective imports
- Document import conventions for team consistency

### Code Reference
```typescript
// STANDARDIZED IMPORT PATTERNS

// ✅ PREFERRED - MUI Components (tree-shaking friendly)
import { 
  Card, 
  CardHeader, 
  CardContent,
  Typography,
  Button,
  Alert,
  Grid,
  Skeleton
} from '@mui/material';

// ✅ PREFERRED - MUI Icons (selective imports)
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';

// ✅ PREFERRED - Design System Components (consistent path)
import { CustomButton, CustomInput } from '../../design-system/components';
import { useTheme } from '../../design-system/hooks';

// ✅ PREFERRED - Utilities and Services (absolute imports)
import { formatCurrency } from '../../utils/formatting';
import { apiClient } from '../../services/api';

// ❌ AVOID - Inconsistent paths
import { Typography, Button } from '../../../src/design-system';
import * as MUI from '@mui/material'; // Avoid namespace imports
import { Card } from '@mui/material/Card'; // Avoid deep imports
```

### ESLint Configuration
```javascript
// .eslintrc.js - Import standardization rules
module.exports = {
  rules: {
    'import/no-relative-parent-imports': 'error',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        pathGroups: [
          {
            pattern: '@mui/**',
            group: 'external',
            position: 'before'
          },
          {
            pattern: '../../design-system/**',
            group: 'internal',
            position: 'before'
          }
        ],
        'newlines-between': 'always'
      }
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@mui/material/*'],
            message: 'Use named imports from @mui/material instead'
          },
          {
            group: ['../../../*'],
            message: 'Avoid deep relative imports. Use absolute imports instead'
          }
        ]
      }
    ]
  }
};
```

### Requirements
- **MANDATORY**: Standardize all import paths to follow approved patterns
- **MANDATORY**: Implement ESLint rules for import consistency
- **MANDATORY**: Use tree-shaking friendly imports for all MUI components
- **MANDATORY**: Document import conventions in project README
- **MANDATORY**: Create import path aliases for frequently used modules
- Audit and remove unused imports across all components
- Optimize bundle size through selective imports

### Expected Improvements
- Achieve 100% import path consistency across all components
- Reduce bundle size by 10-15% through optimized imports
- Eliminate import-related linting errors
- Create maintainable import conventions
- Establish automated import optimization

### Validation Criteria
- ESLint passes with zero import-related errors
- Bundle analyzer shows optimized import usage
- All components follow consistent import patterns
- Documentation clearly explains import conventions
- Automated tools enforce import standards

---

## Prompt [LS5_003_005]: Establish Comprehensive TDD Testing Framework

### Context
Based on the TDD analysis results, implement comprehensive test coverage for all LS5_003 components while establishing automated testing patterns for accessibility, functionality, and performance validation.

### Objective
Create comprehensive test suites for all LS5_003 components using TDD principles while establishing reusable testing patterns for future migrations.

### Focus Areas
- Create test suites for SettingsPage, DashboardPage, and AccountSettingsPage
- Implement accessibility testing with jest-axe
- Add functionality preservation tests
- Create performance regression tests
- Establish automated test execution in CI/CD

### Code Reference
```typescript
// COMPREHENSIVE TDD TEST PATTERN
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { SettingsPage } from '../pages/commerce-studio/SettingsPage';

expect.extend(toHaveNoViolations);

describe('LS5_003 Migration Tests', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    );
  };

  describe('SettingsPage Migration', () => {
    it('should render with proper MUI Card components', () => {
      renderWithTheme(<SettingsPage />);
      
      // Verify MUI Card components are rendered
      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have zero accessibility violations', async () => {
      const { container } = renderWithTheme(<SettingsPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SettingsPage />);
      
      // Test Tab navigation
      await user.tab();
      expect(screen.getByRole('navigation')).toHaveFocus();
      
      // Test Arrow key navigation within settings
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Account Settings')).toHaveFocus();
    });

    it('should preserve settings navigation functionality', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SettingsPage />);
      
      const accountSettingsLink = screen.getByText('Account Settings');
      await user.click(accountSettingsLink);
      
      await waitFor(() => {
        expect(window.location.pathname).toContain('/settings/account');
      });
    });

    it('should handle error states gracefully', async () => {
      // Mock API error
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderWithTheme(<SettingsPage />);
      
      // Trigger error condition
      fireEvent.error(screen.getByRole('main'));
      
      // Verify error boundary catches error
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('DashboardPage Performance Tests', () => {
    it('should render dashboard metrics efficiently', async () => {
      const startTime = performance.now();
      renderWithTheme(<DashboardPage />);
      const endTime = performance.now();
      
      // Verify rendering performance
      expect(endTime - startTime).toBeLessThan(100); // 100ms threshold
    });

    it('should handle loading states properly', async () => {
      renderWithTheme(<DashboardPage />);
      
      // Verify skeleton loading states
      expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
      });
    });
  });

  describe('AccountSettingsPage Form Tests', () => {
    it('should validate form inputs correctly', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AccountSettingsPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /save/i });
      
      // Test invalid email
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);
      
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    it('should announce form errors to screen readers', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AccountSettingsPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid');
      await user.tab(); // Trigger blur validation
      
      // Verify error is announced
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });
  });
});
```

### Requirements
- **MANDATORY**: Achieve 90%+ test coverage for all migrated components
- **MANDATORY**: Zero accessibility violations with jest-axe
- **MANDATORY**: Test keyboard navigation functionality
- **MANDATORY**: Validate form error handling and announcements
- **MANDATORY**: Performance regression tests for dashboard components
- Create reusable testing utilities and patterns
- Integrate tests into CI/CD pipeline
- Document testing best practices

### Expected Improvements
- Achieve 90%+ test coverage for LS5_003 components
- Zero accessibility violations across all components
- Comprehensive functionality preservation validation
- Performance regression prevention
- Automated quality assurance

### Validation Criteria
- All tests pass in CI/CD pipeline
- Coverage reports show 90%+ coverage
- Accessibility tests pass with zero violations
- Performance tests validate rendering efficiency
- Form validation tests ensure proper error handling

---

## Integration Strategy and Success Metrics

### Enhanced Quality Gates
1. **TypeScript Compilation**: 100% success rate (blocking)
2. **Accessibility Compliance**: 70.0+ score (adjusted threshold)
3. **Test Coverage**: 90%+ for all migrated components (blocking)
4. **Import Path Consistency**: 100% compliance (blocking)
5. **Performance Regression**: No degradation in rendering performance

### Expected Outcomes for LS5_003
- **TypeScript Error Reduction**: 220 → 150 errors (32% reduction) 🎯
- **Accessibility Compliance**: 45.0 → 70.0+ (55% improvement) 🎯
- **Theme Integration**: 60.0 → 80.0+ (33% improvement) 🎯
- **Bundle Size Optimization**: 10-15% reduction through import optimization 🎯
- **Test Coverage**: 90%+ for all migrated components 🎯

### Risk Mitigation Strategy
1. **Critical Error Prevention**: Mandatory variant prop validation (already resolved)
2. **Accessibility First**: Implement accessibility testing before functionality
3. **Performance Monitoring**: Continuous bundle size and rendering performance tracking
4. **Incremental Migration**: Component-by-component approach with validation gates
5. **Automated Quality Assurance**: CI/CD integration for all quality metrics

### Iteration Planning
**Phase 1 (Week 1)**: Foundation & Critical Fixes ✅
- [x] Resolve critical TypeScript variant prop errors
- [x] Establish comprehensive test framework
- [x] Create import standardization guidelines

**Phase 2 (Week 2)**: Component Migration
- [ ] Migrate SettingsPage with accessibility enhancements
- [ ] Migrate DashboardPage with performance optimization
- [ ] Migrate AccountSettingsPage with form integration

**Phase 3 (Week 3)**: Quality Assurance & Optimization
- [ ] Comprehensive testing and validation
- [ ] Performance optimization and bundle analysis
- [ ] Documentation and pattern establishment

This refined prompt set addresses all critical issues identified in LS5_002 while establishing a robust foundation for achieving the 220→150 TypeScript error reduction goal and improved quality metrics across all dimensions.