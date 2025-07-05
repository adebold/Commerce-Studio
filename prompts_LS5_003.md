# Prompts LS5_003: Pages/Settings Components Migration with Critical Issue Resolution

## Executive Summary

Based on the LS5_002 scoring analysis, this layer focuses on migrating Pages/Settings components while addressing critical TypeScript errors and quality gaps identified in the previous phase. The scoring revealed an overall score of 73.8/100 with specific issues requiring immediate attention before proceeding with the next phase migration.

**Critical Issues Requiring Immediate Resolution:**
- **URGENT**: TypeScript variant prop errors (`variant="elevated"` is invalid)
- Import path inconsistencies across components  
- Missing accessibility attributes (ARIA labels, semantic HTML)
- Theme integration gaps between MUI and custom styled components
- Bundle size optimization needed due to dual import sources

**LS5_003 Targets:**
- [`SettingsPage.tsx`](frontend/src/pages/commerce-studio/SettingsPage.tsx)
- [`DashboardPage.tsx`](frontend/src/pages/commerce-studio/DashboardPage.tsx) 
- [`AccountSettingsPage.tsx`](frontend/src/pages/commerce-studio/settings/AccountSettingsPage.tsx)

**Expected Outcomes:**
- TypeScript errors: 220 → 150 (32% reduction)
- Resolution of critical variant prop errors
- Improved accessibility compliance
- Enhanced theme integration consistency

---

## Prompt [LS5_003_001]: URGENT - Fix Critical TypeScript Variant Prop Errors

### Context
The LS5_002 analysis revealed critical TypeScript compilation errors in [`FrameSelector.tsx:209`](frontend/src/components/virtual-try-on/FrameSelector.tsx:209) and [`RecommendationCard.tsx:109`](frontend/src/components/recommendations/RecommendationCard.tsx:109) where `variant="elevated"` is used, but this is not a valid MUI Card variant.

### Objective
Immediately fix the TypeScript variant prop errors to prevent build failures and ensure type safety compliance before proceeding with LS5_003 migration.

### Focus Areas
- Fix invalid `variant="elevated"` props in Card components
- Ensure proper MUI Card variant usage (`"elevation"` or `"outlined"`)
- Maintain visual appearance while correcting TypeScript errors
- Verify build compilation success after fixes

### Code Reference
```typescript
// CURRENT ERROR - FrameSelector.tsx:209
<FrameCard 
  key={frame.id}
  variant="elevated"  // ❌ INVALID - causes TypeScript error
  elevation={1}
  isSelected={selectedFrame?.id === frame.id}
  onClick={() => handleFrameSelect(frame)}
>

// CURRENT ERROR - RecommendationCard.tsx:109  
<StyledCard variant="elevated" elevation={1}> // ❌ INVALID - causes TypeScript error
```

### Requirements
- Replace `variant="elevated"` with valid MUI Card variants
- Use `variant="outlined"` with `elevation={1}` for elevated appearance
- Maintain existing visual styling and component behavior
- Ensure TypeScript compilation passes without errors
- Test component rendering to verify no visual regressions

### Expected Improvements
- Eliminate 2 critical TypeScript compilation errors
- Achieve 100% TypeScript type safety compliance for Card variants
- Maintain consistent visual appearance across components
- Enable successful build compilation for affected components

---

## Prompt [LS5_003_002]: Migrate SettingsPage.tsx Card Subcomponents

### Context
The [`SettingsPage.tsx`](frontend/src/pages/commerce-studio/SettingsPage.tsx) component needs migration from custom Card subcomponents to proper MUI CardHeader/CardContent components. The current implementation uses basic Card components but may have Card.Header/Card.Content usage that needs updating.

### Objective
Migrate SettingsPage.tsx to use proper MUI Card subcomponents while maintaining the settings navigation functionality and form management capabilities.

### Focus Areas
- Replace any Card.Header/Card.Content with MUI CardHeader/CardContent
- Maintain settings navigation sidebar functionality
- Preserve form validation and state management
- Ensure responsive layout behavior
- Add proper accessibility attributes

### Code Reference
```typescript
// CURRENT STRUCTURE - SettingsPage.tsx
import { Typography, Card, CardContent } from '@mui/material';

const SettingsNavCard = styled(Card)`
  position: sticky;
  top: ${({ theme }) => theme.spacing.spacing[24]};
`;

// EXPECTED MIGRATION PATTERN
import { Card, CardHeader, CardContent } from '@mui/material';

<Card variant="outlined">
  <CardHeader 
    title="Settings Navigation"
    aria-label="Settings navigation section"
  />
  <CardContent>
    {/* navigation content */}
  </CardContent>
</Card>
```

### Requirements
- Import CardHeader from @mui/material if needed
- Replace any Card.Header/Card.Content patterns with proper MUI components
- Maintain sticky positioning and responsive behavior
- Add ARIA labels for accessibility compliance
- Preserve existing theme integration with styled components
- Ensure settings navigation functionality remains intact

### Expected Improvements
- Eliminate Card-related TypeScript errors in SettingsPage
- Improve accessibility with proper ARIA attributes
- Maintain 100% functionality preservation
- Establish consistent MUI Card usage pattern

---

## Prompt [LS5_003_003]: Migrate DashboardPage.tsx with Performance Optimization

### Context
The [`DashboardPage.tsx`](frontend/src/pages/commerce-studio/DashboardPage.tsx) component requires Card subcomponent migration while addressing bundle size concerns identified in LS5_002 analysis. The component likely contains multiple Card instances for dashboard metrics display.

### Objective
Migrate DashboardPage.tsx Card components while implementing bundle size optimization strategies and maintaining dashboard functionality.

### Focus Areas
- Replace Card.Header/Card.Content with MUI CardHeader/CardContent
- Optimize import statements to reduce bundle size
- Maintain dashboard metrics display functionality
- Ensure responsive grid layout behavior
- Implement proper loading states and error handling

### Code Reference
```typescript
// EXPECTED MIGRATION PATTERN
import { Card, CardHeader, CardContent, Grid } from '@mui/material';

// Optimize imports to reduce bundle size
const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, ...props }) => (
  <Card variant="outlined" {...props}>
    <CardHeader 
      title={title}
      aria-label={`${title} dashboard section`}
    />
    <CardContent>
      {children}
    </CardContent>
  </Card>
);
```

### Requirements
- Migrate all Card subcomponents to proper MUI components
- Implement tree-shaking friendly import patterns
- Add accessibility attributes for dashboard sections
- Maintain responsive grid layout functionality
- Preserve dashboard metrics calculation and display
- Ensure proper loading states for async data

### Expected Improvements
- Reduce TypeScript errors by 40-50% in DashboardPage
- Optimize bundle size through improved import patterns
- Enhance accessibility compliance for dashboard components
- Maintain 100% dashboard functionality

---

## Prompt [LS5_003_004]: Migrate AccountSettingsPage.tsx with Form Integration

### Context
The [`AccountSettingsPage.tsx`](frontend/src/pages/commerce-studio/settings/AccountSettingsPage.tsx) component requires Card migration while maintaining complex form state management and validation logic.

### Objective
Migrate AccountSettingsPage.tsx Card components while preserving form functionality and implementing enhanced error handling patterns.

### Focus Areas
- Replace Card.Header/Card.Content with MUI CardHeader/CardContent
- Maintain form validation and state management
- Implement standardized error handling patterns
- Ensure form accessibility compliance
- Preserve account management functionality

### Code Reference
```typescript
// EXPECTED FORM CARD PATTERN
import { Card, CardHeader, CardContent, Alert } from '@mui/material';

const FormCard: React.FC<FormCardProps> = ({ title, error, children }) => (
  <Card variant="outlined">
    <CardHeader 
      title={title}
      aria-label={`${title} form section`}
    />
    <CardContent>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {children}
    </CardContent>
  </Card>
);
```

### Requirements
- Migrate all Card subcomponents to MUI components
- Implement standardized error handling with MUI Alert components
- Add proper form accessibility attributes (ARIA labels, fieldsets)
- Maintain form validation logic and state management
- Preserve account settings functionality
- Ensure proper form submission and error display

### Expected Improvements
- Eliminate Card-related TypeScript errors in AccountSettingsPage
- Standardize error handling patterns across forms
- Improve form accessibility compliance
- Maintain 100% account management functionality

---

## Prompt [LS5_003_005]: Implement Accessibility Enhancement Framework

### Context
The LS5_002 analysis revealed poor accessibility compliance (45.0/100) with missing ARIA attributes and semantic HTML elements across migrated components. This prompt addresses systematic accessibility improvements.

### Objective
Implement comprehensive accessibility enhancements across all LS5_003 target components while establishing reusable accessibility patterns.

### Focus Areas
- Add proper ARIA labels and roles to Card components
- Implement semantic HTML structure
- Ensure keyboard navigation support
- Add screen reader compatibility
- Create reusable accessibility utilities

### Code Reference
```typescript
// ACCESSIBILITY-ENHANCED CARD PATTERN
import { Card, CardHeader, CardContent } from '@mui/material';

const AccessibleCard: React.FC<AccessibleCardProps> = ({ 
  title, 
  children, 
  role = "region",
  ariaLabel,
  ...props 
}) => (
  <Card 
    variant="outlined" 
    role={role}
    aria-label={ariaLabel || title}
    {...props}
  >
    <CardHeader 
      title={title}
      component="h2"
      role="banner"
      aria-level={2}
    />
    <CardContent role="main">
      {children}
    </CardContent>
  </Card>
);
```

### Requirements
- Add ARIA labels to all Card components
- Implement proper heading hierarchy (h1, h2, h3)
- Ensure keyboard navigation support
- Add focus management for interactive elements
- Create accessibility testing utilities
- Document accessibility patterns for future use

### Expected Improvements
- Increase accessibility compliance score from 45.0 to 70.0+
- Establish reusable accessibility patterns
- Ensure WCAG 2.1 AA compliance for Card components
- Create foundation for comprehensive accessibility testing

---

## Prompt [LS5_003_006]: Optimize Import Paths and Bundle Size

### Context
The LS5_002 analysis identified import path inconsistencies and bundle size concerns due to dual import sources (MUI + custom design system). This prompt addresses systematic import optimization.

### Objective
Standardize import paths across all LS5_003 components while implementing bundle size optimization strategies.

### Focus Areas
- Standardize import path patterns across components
- Implement tree-shaking friendly imports
- Reduce bundle size through selective imports
- Create import linting rules
- Document import conventions

### Code Reference
```typescript
// STANDARDIZED IMPORT PATTERN
// ✅ PREFERRED - Tree-shaking friendly
import { Card, CardHeader, CardContent } from '@mui/material';
import { Typography, Button } from '@mui/material';

// ✅ DESIGN SYSTEM IMPORTS - Consistent path
import { CustomComponent } from '../../design-system/components';

// ❌ AVOID - Inconsistent paths
import { Typography, Button } from '../../../src/design-system';
```

### Requirements
- Standardize all import paths to use consistent patterns
- Implement selective imports to reduce bundle size
- Create ESLint rules for import path consistency
- Document approved import patterns
- Audit and remove unused imports
- Establish import aliases for frequently used components

### Expected Improvements
- Reduce bundle size by 10-15% through optimized imports
- Achieve 100% import path consistency across components
- Establish maintainable import conventions
- Create foundation for automated import optimization

---

## Prompt [LS5_003_007]: Integrate TDD Testing Framework for Migration Validation

### Context
Based on the existing test infrastructure in [`CardSubcomponentMigration.test.tsx`](frontend/src/__tests__/CardSubcomponentMigration.test.tsx), implement comprehensive TDD testing for LS5_003 migration validation.

### Objective
Create comprehensive test coverage for LS5_003 migration components using TDD principles to ensure functionality preservation and quality assurance.

### Focus Areas
- Create test cases for each migrated component
- Implement accessibility testing
- Add regression testing for functionality preservation
- Create performance testing for bundle size impact
- Establish continuous testing framework

### Code Reference
```typescript
// TDD TEST PATTERN FOR LS5_003
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

describe('LS5_003 Migration Tests', () => {
  describe('SettingsPage Migration', () => {
    it('should render with proper MUI Card components', () => {
      render(<SettingsPage />);
      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<SettingsPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should preserve settings navigation functionality', () => {
      render(<SettingsPage />);
      const navItem = screen.getByText('Account Settings');
      fireEvent.click(navItem);
      expect(window.location.pathname).toContain('/settings/account');
    });
  });
});
```

### Requirements
- Create test suites for SettingsPage, DashboardPage, and AccountSettingsPage
- Implement accessibility testing with jest-axe
- Add functionality preservation tests
- Create performance regression tests
- Establish automated test execution
- Document testing patterns and best practices

### Expected Improvements
- Achieve 90%+ test coverage for migrated components
- Ensure zero accessibility violations
- Validate 100% functionality preservation
- Create reusable testing patterns for future migrations

---

## Prompt [LS5_003_008]: Establish Theme Integration Consistency

### Context
The LS5_002 analysis revealed theme integration gaps (60.0/100) with mixed usage of MUI theme and custom styled components. This prompt addresses systematic theme integration.

### Objective
Create consistent theme integration patterns across LS5_003 components while maintaining design system compatibility.

### Focus Areas
- Unify MUI theme and custom theme usage
- Create theme integration utilities
- Standardize spacing and color usage
- Implement responsive design patterns
- Document theme integration best practices

### Code Reference
```typescript
// UNIFIED THEME INTEGRATION PATTERN
import { useTheme } from '@mui/material/styles';
import styled from '@emotion/styled';

const ThemedCard = styled(Card)(({ theme }) => ({
  // Use MUI theme values consistently
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  
  // Responsive design with MUI breakpoints
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1),
  },
}));
```

### Requirements
- Migrate custom theme properties to MUI theme structure
- Create theme integration utilities and hooks
- Standardize spacing system usage
- Implement consistent color palette usage
- Create responsive design patterns
- Document theme integration guidelines

### Expected Improvements
- Increase theme integration consistency score from 60.0 to 80.0+
- Establish unified theme system across components
- Create maintainable theme integration patterns
- Reduce theme-related technical debt

---

## Integration Strategy and Success Metrics

### TDD Integration Approach
1. **Test-First Development**: Write tests before implementing migrations
2. **Accessibility Testing**: Integrate jest-axe for automated accessibility validation
3. **Regression Testing**: Ensure functionality preservation through comprehensive test coverage
4. **Performance Testing**: Monitor bundle size and rendering performance

### Expected Outcomes for LS5_003
- **TypeScript Error Reduction**: 220 → 150 errors (32% reduction)
- **Accessibility Compliance**: 45.0 → 70.0+ (55% improvement)
- **Theme Integration**: 60.0 → 80.0+ (33% improvement)
- **Bundle Size Optimization**: 10-15% reduction through import optimization
- **Test Coverage**: 90%+ for all migrated components

### Quality Gates
1. **Functionality Preservation**: 100% (no breaking changes)
2. **Build Compilation**: 100% success rate
3. **Accessibility Compliance**: 70.0+ score
4. **TypeScript Error Reduction**: Minimum 30% reduction
5. **Test Coverage**: Minimum 85% for migrated components

### Risk Mitigation
1. **Critical Error Resolution**: Address variant prop errors before migration
2. **Incremental Migration**: Migrate components one at a time
3. **Comprehensive Testing**: Implement TDD approach for validation
4. **Performance Monitoring**: Track bundle size impact continuously
5. **Accessibility Validation**: Automated testing with jest-axe

This comprehensive prompt set addresses the critical issues identified in LS5_002 while establishing a robust foundation for the remaining MUI migration phases.