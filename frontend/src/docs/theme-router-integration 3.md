# Theme and Router Integration Guide

## Overview

This guide explains how the theme system integrates with the React Router in our Vite/React application, ensuring seamless theming across all routes and components.

## Architecture

### Theme System

Our theme system is built on top of Material-UI (MUI) with custom extensions:

```typescript
// Creating a theme
import { createVaraiTheme } from '../design-system/mui-integration';

const theme = createVaraiTheme('light'); // or 'dark'
```

### Theme Structure

The theme includes:
- **Palette**: Colors for primary, secondary, error, warning, info, and success states
- **Typography**: Font families, sizes, and weights
- **Spacing**: Consistent spacing function
- **Breakpoints**: Responsive design breakpoints
- **Custom Extensions**: `varai` object with additional design tokens

### Router Integration

The router is wrapped with theme providers to ensure all routes have access to the theme:

```typescript
<ThemeProvider theme={theme}>
  <AuthProvider>
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  </AuthProvider>
</ThemeProvider>
```

## Best Practices

### 1. Theme Provider Hierarchy

Always ensure the theme provider is at the appropriate level in your component tree:

```typescript
// App.tsx
function App() {
  const theme = createVaraiTheme('light');
  
  return (
    <ThemeProvider theme={theme}>
      <Router />
    </ThemeProvider>
  );
}
```

### 2. Using Theme in Components

#### With MUI Components
```typescript
import { Box, Typography } from '@mui/material';

function MyComponent() {
  return (
    <Box sx={{ bgcolor: 'primary.main', p: 2 }}>
      <Typography variant="h1">Themed Content</Typography>
    </Box>
  );
}
```

#### With Emotion Styled Components
```typescript
import styled from '@emotion/styled';

const StyledDiv = styled.div`
  background-color: ${props => props.theme.palette.primary.main};
  padding: ${props => props.theme.spacing(2)};
`;
```

#### With useTheme Hook
```typescript
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <div style={{ color: theme.palette.text.primary }}>
      Content
    </div>
  );
}
```

### 3. Theme Switching

To implement theme switching:

```typescript
const [mode, setMode] = useState<'light' | 'dark'>('light');
const theme = useMemo(() => createVaraiTheme(mode), [mode]);

const toggleTheme = () => {
  setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
};
```

### 4. Route-Specific Theming

For route-specific theme adjustments:

```typescript
function RouteWrapper({ children }) {
  const theme = useTheme();
  const location = useLocation();
  
  // Apply route-specific theme modifications
  const routeTheme = useMemo(() => {
    if (location.pathname.startsWith('/admin')) {
      return createTheme(theme, {
        // Admin-specific overrides
      });
    }
    return theme;
  }, [theme, location]);
  
  return (
    <ThemeProvider theme={routeTheme}>
      {children}
    </ThemeProvider>
  );
}
```

### 5. Testing Theme Integration

When testing components with theme:

```typescript
import { renderWithTheme } from '../test-utils/test-utils';

test('component renders with theme', () => {
  const { getByText } = renderWithTheme(<MyComponent />);
  expect(getByText('Content')).toBeInTheDocument();
});
```

## Common Issues and Solutions

### Issue 1: Theme Not Applied to Lazy-Loaded Routes

**Problem**: Components loaded with React.lazy() don't receive theme.

**Solution**: Ensure the Suspense boundary is inside the ThemeProvider:

```typescript
<ThemeProvider theme={theme}>
  <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/lazy" element={<LazyComponent />} />
    </Routes>
  </Suspense>
</ThemeProvider>
```

### Issue 2: Theme Context Lost During Navigation

**Problem**: Theme resets when navigating between routes.

**Solution**: Lift theme state to a stable parent component:

```typescript
// App.tsx - Stable theme provider
function App() {
  const [theme, setTheme] = useState(() => createVaraiTheme('light'));
  
  return (
    <ThemeProvider theme={theme}>
      <Router />
    </ThemeProvider>
  );
}
```

### Issue 3: TypeScript Theme Type Errors

**Problem**: TypeScript doesn't recognize custom theme properties.

**Solution**: Extend the theme type definition:

```typescript
declare module '@mui/material/styles' {
  interface Theme {
    varai: {
      borderRadius: {
        small: string;
        medium: string;
        large: string;
      };
      shadows: {
        card: string;
        modal: string;
      };
    };
  }
}
```

### Issue 4: Performance Issues with Theme Changes

**Problem**: Entire app re-renders on theme change.

**Solution**: Use React.memo and useMemo strategically:

```typescript
const ThemedComponent = React.memo(({ children }) => {
  const theme = useTheme();
  
  const styles = useMemo(() => ({
    container: {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
    }
  }), [theme.palette.background.default, theme.palette.text.primary]);
  
  return <div style={styles.container}>{children}</div>;
});
```

## Migration Guide

If migrating from a different theme system:

1. **Audit Current Theme Usage**
   - Identify all theme-dependent components
   - List custom theme properties
   - Document theme switching logic

2. **Create Theme Mapping**
   ```typescript
   const mapOldThemeToNew = (oldTheme) => {
     return createVaraiTheme('light', {
       palette: {
         primary: {
           main: oldTheme.colors.primary,
         },
       },
     });
   };
   ```

3. **Update Components Gradually**
   - Start with leaf components
   - Test each component after migration
   - Update parent components last

4. **Validate Theme Consistency**
   - Run visual regression tests
   - Check responsive behavior
   - Verify dark mode support

## Performance Optimization

### 1. Memoize Theme Creation
```typescript
const theme = useMemo(() => createVaraiTheme(mode), [mode]);
```

### 2. Split Theme Providers
For large apps, consider splitting theme providers:

```typescript
<GlobalThemeProvider>
  <Router>
    <Routes>
      <Route path="/admin/*" element={
        <AdminThemeProvider>
          <AdminRoutes />
        </AdminThemeProvider>
      } />
      <Route path="/*" element={<PublicRoutes />} />
    </Routes>
  </Router>
</GlobalThemeProvider>
```

### 3. Lazy Load Theme Variants
```typescript
const themes = {
  light: lazy(() => import('./themes/light')),
  dark: lazy(() => import('./themes/dark')),
};
```

## Debugging

### Enable Theme Debugging
```typescript
if (process.env.NODE_ENV === 'development') {
  window.__THEME__ = theme;
  console.log('Theme loaded:', theme);
}
```

### Theme Inspector Component
```typescript
function ThemeInspector() {
  const theme = useTheme();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <pre style={{ position: 'fixed', bottom: 0, right: 0, fontSize: '10px' }}>
      {JSON.stringify(theme.palette.mode, null, 2)}
    </pre>
  );
}
```

## Resources

- [MUI Theming Documentation](https://mui.com/material-ui/customization/theming/)
- [React Router Documentation](https://reactrouter.com/)
- [Emotion Documentation](https://emotion.sh/docs/introduction)
- [Our Design System Guidelines](./design-system-guidelines.md)