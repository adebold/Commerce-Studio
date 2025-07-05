# React MUI Theme System Migration - Test Specifications

## Overview

This directory contains comprehensive test specifications for validating the React MUI theme system migration. The goal is to reduce TypeScript errors from 186 to <50 and ensure successful production build while maintaining UI functionality.

## Test Structure

### 📋 Test Specifications Document
- **[`mui-migration.test.spec.md`](./mui-migration.test.spec.md)** - Complete test specifications and requirements

### 🧪 Test Implementations

#### 1. Card Subcomponent Migration Tests
- **File**: [`CardSubcomponentMigration.test.tsx`](./CardSubcomponentMigration.test.tsx)
- **Purpose**: Validate replacement of `Card.Header`/`Card.Content` with MUI `CardHeader`/`CardContent`
- **Coverage**: Frame finder, virtual try-on, and page-level components
- **Key Tests**:
  - MUI CardHeader/CardContent rendering
  - Component functionality preservation
  - Import statement validation
  - Accessibility compliance

#### 2. Theme Structure Migration Tests
- **File**: [`ThemeStructureMigration.test.tsx`](./ThemeStructureMigration.test.tsx)
- **Purpose**: Validate migration from custom theme properties to MUI theme structure
- **Coverage**: Color palette, spacing system, shadows, typography
- **Key Tests**:
  - `theme.colors.*` → `theme.palette.*`
  - `theme.spacing.spacing[*]` → `theme.spacing(*)`
  - `theme.shadows.effects.*` → `theme.shadows[*]`
  - Typography weight migrations

#### 3. Auth Context Migration Tests
- **File**: [`AuthContextMigration.test.tsx`](./AuthContextMigration.test.tsx)
- **Purpose**: Validate UserContext.userId integration in dashboard components
- **Coverage**: All dashboard component types, auth provider integration
- **Key Tests**:
  - userId property access
  - Role-based access control
  - Authentication state management
  - Error handling and fallbacks

#### 4. Build Compilation Tests
- **File**: [`BuildCompilation.test.tsx`](./BuildCompilation.test.tsx)
- **Purpose**: Validate TypeScript compilation and production build success
- **Coverage**: Compilation errors, build optimization, import resolution
- **Key Tests**:
  - TypeScript error count (<50 target)
  - Production build success
  - Bundle optimization
  - Migration completion validation

### ⚙️ Configuration Files

#### Jest Configuration
- **File**: [`jest.config.js`](../jest.config.js)
- **Purpose**: Jest test runner configuration optimized for MUI migration testing
- **Features**:
  - TypeScript support with ts-jest
  - JSDOM environment for React testing
  - Coverage thresholds (80% minimum)
  - MUI-specific test timeout settings

#### Test Setup
- **File**: [`setupTests.ts`](../setupTests.ts)
- **Purpose**: Global test setup and mocks
- **Includes**:
  - Jest DOM matchers
  - Window API mocks (matchMedia, ResizeObserver, IntersectionObserver)
  - Console warning suppression

### 🚀 Test Runner
- **File**: [`run-migration-tests.js`](./run-migration-tests.js)
- **Purpose**: Comprehensive test runner with migration status reporting
- **Features**:
  - Executes all migration test suites
  - TypeScript compilation validation
  - Production build testing
  - Detailed migration status report
  - Color-coded output with progress tracking

## Migration Test Categories

### 1. Card Subcomponents (High Priority)
**Target**: 101 instances of Card.Header/Card.Content usage

**Test Coverage**:
- ✅ Frame finder components (FrameComparison, FilterSortControls, etc.)
- ✅ Virtual try-on components (PhotoCapture, FrameSelector, etc.)
- ✅ Page-level components (DashboardPage, SettingsPage, etc.)
- ✅ Import statement validation
- ✅ Component functionality preservation

### 2. Theme Structure (Medium Priority)
**Target**: 300+ instances of custom theme properties

**Test Coverage**:
- ✅ Color palette migration (`theme.colors.*` → `theme.palette.*`)
- ✅ Spacing system migration (`theme.spacing.spacing[*]` → `theme.spacing(*)`)
- ✅ Shadow system migration (`theme.shadows.effects.*` → `theme.shadows[*]`)
- ✅ Typography migration (`theme.typography.fontWeight.*`)
- ✅ Visual consistency validation

### 3. Auth Context (Medium Priority)
**Target**: Missing userId properties in dashboard components

**Test Coverage**:
- ✅ UserContext interface updates
- ✅ Dashboard component userId access
- ✅ Authentication state management
- ✅ Role-based access control
- ✅ Error handling and fallbacks

### 4. Build Compilation (High Priority)
**Target**: Reduce TypeScript errors from 186 to <50

**Test Coverage**:
- ✅ TypeScript compilation validation
- ✅ Production build success
- ✅ Import resolution testing
- ✅ Bundle optimization validation
- ✅ Migration completion verification

## Running the Tests

### Quick Start
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Run all migration tests
npm run test:migration
```

### Individual Test Suites
```bash
# Card subcomponent migration tests
npm test -- --testPathPattern="CardSubcomponentMigration.test.tsx"

# Theme structure migration tests
npm test -- --testPathPattern="ThemeStructureMigration.test.tsx"

# Auth context migration tests
npm test -- --testPathPattern="AuthContextMigration.test.tsx"

# Build compilation tests
npm test -- --testPathPattern="BuildCompilation.test.tsx"
```

### Comprehensive Migration Test Runner
```bash
# Run the comprehensive migration test suite
node src/__tests__/run-migration-tests.js
```

### Watch Mode for Development
```bash
# Run tests in watch mode during migration work
npm test -- --watch --testPathPattern="__tests__"
```

## Test Execution Strategy

### Phase 1: Pre-Migration Baseline
1. Run existing tests to establish baseline
2. Document current test coverage
3. Identify critical functionality to preserve

### Phase 2: Migration Validation (Per LS5 Prompts)
1. **LS5_001-003**: Card subcomponent migration
   - Test each component after Card migration
   - Verify imports and rendering
   - Validate functionality preservation

2. **LS5_004-006**: Theme structure migration
   - Test theme property access
   - Verify visual consistency
   - Validate responsive behavior

3. **LS5_007**: Auth context fixes
   - Test userId access in dashboard components
   - Verify auth provider functionality
   - Validate type definitions

4. **LS5_008**: Design system import fixes
   - Test import statement migrations
   - Verify component functionality
   - Validate prop compatibility

### Phase 3: Integration and Build Tests
1. **LS5_009**: Final cleanup and validation
   - Run TypeScript compilation
   - Verify error count reduction
   - Test production build

2. **UI Regression Testing**
   - Visual consistency checks
   - Functional regression tests
   - Performance validation

## Success Criteria

### Primary Objectives ✅
- [ ] TypeScript errors reduced from 186 to <50
- [ ] Successful production build compilation
- [ ] All Card.Header/Card.Content replaced with MUI components
- [ ] Theme properties use MUI structure
- [ ] Auth context provides userId correctly
- [ ] Design system imports migrated to MUI

### Quality Assurance ✅
- [ ] All tests pass after migration
- [ ] No visual regressions detected
- [ ] Component functionality preserved
- [ ] Performance maintained or improved
- [ ] Accessibility features preserved
- [ ] Responsive design maintained

### Technical Validation ✅
- [ ] No runtime errors in development
- [ ] Clean console output (no warnings/errors)
- [ ] Proper TypeScript type checking
- [ ] Optimized production bundle
- [ ] Consistent code style and patterns

## Test Reports and Monitoring

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

### Migration Progress Tracking
The test runner provides detailed progress tracking:
- ✅ **Green**: Migration step completed successfully
- ⚠️ **Yellow**: Migration step completed with warnings
- ❌ **Red**: Migration step incomplete or failed

### Continuous Integration
Tests are configured to run in CI/CD pipelines:
- Pre-commit hooks for test validation
- Pull request checks for migration progress
- Deployment gates based on test results

## Troubleshooting

### Common Issues

#### TypeScript Compilation Errors
```bash
# Check specific TypeScript errors
npx tsc --noEmit --skipLibCheck

# Focus on migration-related errors
npx tsc --noEmit | grep -E "(Card\.|theme\.colors|theme\.spacing\.spacing|userId)"
```

#### Test Failures
```bash
# Run tests with verbose output
npm test -- --verbose --no-cache

# Debug specific test file
npm test -- --testPathPattern="CardSubcomponentMigration.test.tsx" --verbose
```

#### Build Issues
```bash
# Clean build and retry
rm -rf build node_modules/.cache
npm run build
```

### Getting Help
1. Check the test specifications document for detailed requirements
2. Review individual test files for specific validation logic
3. Run the migration test runner for comprehensive status
4. Check Jest configuration for test environment setup

## Contributing

When adding new migration tests:
1. Follow the existing test structure and naming conventions
2. Include comprehensive test coverage for the migration area
3. Add appropriate mocks and test utilities
4. Update this README with new test information
5. Ensure tests integrate with the migration test runner

## Related Documentation
- [Migration Prompts](../../../prompts_LS5.md) - Detailed migration requirements
- [MUI Documentation](https://mui.com/) - MUI component and theming guides
- [Jest Documentation](https://jestjs.io/) - Testing framework documentation
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - React testing utilities