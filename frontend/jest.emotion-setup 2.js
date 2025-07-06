// This file sets up Emotion for Jest tests

// Create a more robust mock for styled components
const createComponent = (tag) => {
  const component = jest.fn().mockImplementation(({ children, ...props }) => {
    return {
      $$typeof: Symbol.for('react.element'),
      type: typeof tag === 'string' ? tag : (tag && tag.displayName) || 'Component',
      props: { ...props, children },
      _owner: null,
      _store: {}
    };
  });
  
  component.displayName = `Styled(${typeof tag === 'string' ? tag : (tag && tag.displayName) || 'Component'})`;
  component.withComponent = jest.fn().mockImplementation(createComponent);
  component.attrs = jest.fn().mockReturnThis();
  
  return component;
};

// Create a more robust styled mock
const styledMock = new Proxy(createComponent, {
  get: (target, prop) => {
    if (prop === 'default') return styledMock;
    if (prop === '__esModule') return true;
    if (typeof prop === 'string') {
      return createComponent(prop);
    }
    return target[prop];
  },
  apply: (target, thisArg, args) => {
    return createComponent(args[0]);
  }
});

// Mock the Emotion styled function
jest.mock('@emotion/styled', () => styledMock);

// Mock the Emotion css function
jest.mock('@emotion/react', () => ({
  css: jest.fn(() => 'mocked-css-class'),
  Global: jest.fn(({ children }) => children),
  keyframes: jest.fn(() => 'animation-name'),
  ThemeProvider: jest.fn(({ children, theme }) => children),
  CacheProvider: jest.fn(({ children }) => children),
  ClassNames: jest.fn(({ children }) => children ? children({}) : null),
  jsx: jest.fn((type, props) => ({ type, props })),
}));

// Mock MUI styled engine
jest.mock('@mui/styled-engine', () => styledMock);

// Create a React component mock
const createReactComponent = (displayName) => {
  const component = jest.fn().mockImplementation(({ children, ...props }) => {
    return {
      $$typeof: Symbol.for('react.element'),
      type: displayName,
      props: { ...props, children },
      _owner: null,
      _store: {}
    };
  });
  component.displayName = displayName;
  return component;
};

// Mock MUI material components
jest.mock('@mui/material', () => {
  const mockTheme = {
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
      error: { main: '#f44336' },
      warning: { main: '#ff9800' },
      info: { main: '#2196f3' },
      success: { main: '#4caf50' },
      text: { primary: '#000000', secondary: '#666666' }
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14
    },
    spacing: (factor) => `${factor * 8}px`,
    breakpoints: {
      up: jest.fn(() => ''),
      down: jest.fn(() => ''),
      between: jest.fn(() => '')
    },
    shape: { borderRadius: 4 },
    transitions: { create: jest.fn(() => '') },
    zIndex: { appBar: 1100, drawer: 1200 }
  };

  // Create a mock for createTheme that returns our mockTheme
  const createTheme = jest.fn(() => mockTheme);

  // Create a ThemeProvider component that actually passes the theme to children
  const ThemeProvider = jest.fn().mockImplementation(({ children, theme }) => {
    return {
      $$typeof: Symbol.for('react.element'),
      type: 'ThemeProvider',
      props: { theme: theme || mockTheme, children },
      _owner: null,
      _store: {}
    };
  });

  return {
    __esModule: true,
    Box: createReactComponent('Box'),
    Card: createReactComponent('Card'),
    CardContent: createReactComponent('CardContent'),
    CardHeader: createReactComponent('CardHeader'),
    CardActions: createReactComponent('CardActions'),
    Paper: createReactComponent('Paper'),
    Typography: createReactComponent('Typography'),
    Button: createReactComponent('Button'),
    TextField: createReactComponent('TextField'),
    CircularProgress: createReactComponent('CircularProgress'),
    Chip: createReactComponent('Chip'),
    Avatar: createReactComponent('Avatar'),
    Container: createReactComponent('Container'),
    Grid: createReactComponent('Grid'),
    Link: createReactComponent('Link'),
    Divider: createReactComponent('Divider'),
    Alert: createReactComponent('Alert'),
    Tab: createReactComponent('Tab'),
    Tabs: createReactComponent('Tabs'),
    AppBar: createReactComponent('AppBar'),
    Toolbar: createReactComponent('Toolbar'),
    IconButton: createReactComponent('IconButton'),
    Menu: createReactComponent('Menu'),
    MenuItem: createReactComponent('MenuItem'),
    Select: createReactComponent('Select'),
    FormControl: createReactComponent('FormControl'),
    InputLabel: createReactComponent('InputLabel'),
    FormHelperText: createReactComponent('FormHelperText'),
    Checkbox: createReactComponent('Checkbox'),
    Radio: createReactComponent('Radio'),
    RadioGroup: createReactComponent('RadioGroup'),
    FormControlLabel: createReactComponent('FormControlLabel'),
    FormGroup: createReactComponent('FormGroup'),
    FormLabel: createReactComponent('FormLabel'),
    Switch: createReactComponent('Switch'),
    Drawer: createReactComponent('Drawer'),
    List: createReactComponent('List'),
    ListItem: createReactComponent('ListItem'),
    ListItemText: createReactComponent('ListItemText'),
    ListItemIcon: createReactComponent('ListItemIcon'),
    Dialog: createReactComponent('Dialog'),
    DialogTitle: createReactComponent('DialogTitle'),
    DialogContent: createReactComponent('DialogContent'),
    DialogActions: createReactComponent('DialogActions'),
    Snackbar: createReactComponent('Snackbar'),
    Tooltip: createReactComponent('Tooltip'),
    Backdrop: createReactComponent('Backdrop'),
    Modal: createReactComponent('Modal'),
    Popover: createReactComponent('Popover'),
    Skeleton: createReactComponent('Skeleton'),
    styled: styledMock,
    createTheme,
    ThemeProvider,
    useTheme: jest.fn(() => mockTheme),
    styles: {
      createTheme,
      ThemeProvider,
      useTheme: jest.fn(() => mockTheme)
    }
  };
});

// Mock @mui/material/styles
jest.mock('@mui/material/styles', () => {
  const mockTheme = {
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' }
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    },
    spacing: (factor) => `${factor * 8}px`,
    breakpoints: {
      up: jest.fn(() => ''),
      down: jest.fn(() => ''),
      between: jest.fn(() => '')
    }
  };

  return {
    createTheme: jest.fn(() => mockTheme),
    ThemeProvider: jest.fn().mockImplementation(({ children, theme }) => {
      return {
        $$typeof: Symbol.for('react.element'),
        type: 'ThemeProvider',
        props: { theme: theme || mockTheme, children },
        _owner: null,
        _store: {}
      };
    }),
    useTheme: jest.fn(() => mockTheme),
    styled: styledMock
  };
});

// Mock extractCritical function
global.extractCritical = jest.fn((html) => ({
  html,
  css: '',
  ids: [],
}));