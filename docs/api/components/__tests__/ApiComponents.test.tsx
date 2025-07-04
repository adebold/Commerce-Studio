import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../../frontend/src/design-system/ThemeProvider';
import { 
  ApiEndpoint, 
  CodeSnippet, 
  CollapsibleSection, 
  HttpStatusCode, 
  ParameterTable, 
  SearchBar, 
  TableOfContents, 
  VersionSelector 
} from '../';

// Mock theme for styled components
jest.mock('../../../../frontend/src/design-system/theme', () => ({
  colors: {
    primary: {
      50: '#E6F7FF',
      100: '#BAE7FF',
      200: '#91D5FF',
      300: '#69C0FF',
      400: '#40A9FF',
      500: '#1890FF',
      600: '#096DD9',
      700: '#0050B3',
      800: '#003A8C',
      900: '#002766',
    },
    secondary: {
      500: '#52C41A',
    },
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    semantic: {
      success: {
        light: '#F6FFED',
        main: '#52C41A',
        dark: '#389E0D',
      },
      warning: {
        light: '#FFFBE6',
        main: '#FAAD14',
        dark: '#D48806',
      },
      error: {
        light: '#FFF1F0',
        main: '#FF4D4F',
        dark: '#CF1322',
      },
      info: {
        light: '#E6F7FF',
        main: '#1890FF',
        dark: '#096DD9',
      },
    },
    common: {
      white: '#FFFFFF',
      black: '#000000',
    },
  },
  spacing: {
    spacing: {
      2: '2px',
      4: '4px',
      8: '8px',
      12: '12px',
      16: '16px',
      24: '24px',
      32: '32px',
      48: '48px',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", sans-serif',
      secondary: '"Poppins", sans-serif',
      mono: '"Roboto Mono", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
    textStyles: {
      h1: {},
      h2: {},
      h3: {},
      h4: {},
      h5: {},
      h6: {},
      body1: {},
      body2: {},
      caption: {},
      overline: {},
      button: {},
    },
  },
  components: {
    card: {
      borderRadius: '8px',
      padding: '16px',
    },
    button: {
      borderRadius: '4px',
      transition: 'all 0.2s ease-in-out',
    },
  },
  shadows: {
    elevation: {
      0: 'none',
      1: '0 2px 4px rgba(0, 0, 0, 0.1)',
      2: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    effects: {
      focus: '0 0 0 3px rgba(24, 144, 255, 0.4)',
      hover: '0 6px 16px rgba(0, 0, 0, 0.12)',
    },
  },
  breakpoints: {
    up: () => '',
    down: () => '',
  },
}));

// Wrap components with ThemeProvider for testing
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('API Documentation Components', () => {
  describe('CodeSnippet', () => {
    it('renders code with the correct language', () => {
      renderWithTheme(
        <CodeSnippet
          code="console.log('Hello, world!');"
          language="javascript"
        />
      );
      
      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText("console.log('Hello, world!');")).toBeInTheDocument();
    });
    
    it('shows line numbers when enabled', () => {
      renderWithTheme(
        <CodeSnippet
          code="line 1\nline 2"
          language="text"
          showLineNumbers={true}
        />
      );
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
  
  describe('ApiEndpoint', () => {
    it('renders endpoint information correctly', () => {
      renderWithTheme(
        <ApiEndpoint
          method="GET"
          path="/v1/test"
          description="Test endpoint"
          requestParams={[
            { name: "param1", type: "string", required: true, description: "Test parameter" }
          ]}
          responseExample="{}"
        />
      );
      
      expect(screen.getByText('GET')).toBeInTheDocument();
      expect(screen.getByText('/v1/test')).toBeInTheDocument();
      expect(screen.getByText('Test endpoint')).toBeInTheDocument();
      expect(screen.getByText('param1')).toBeInTheDocument();
    });
  });
  
  describe('CollapsibleSection', () => {
    it('toggles content visibility when clicked', () => {
      renderWithTheme(
        <CollapsibleSection title="Test Section">
          <p>Test content</p>
        </CollapsibleSection>
      );
      
      // Content should be hidden initially
      const content = screen.getByText('Test content');
      expect(content).not.toBeVisible();
      
      // Click to expand
      fireEvent.click(screen.getByText('Test Section'));
      expect(content).toBeVisible();
      
      // Click to collapse
      fireEvent.click(screen.getByText('Test Section'));
      expect(content).not.toBeVisible();
    });
  });
  
  describe('HttpStatusCode', () => {
    it('renders status code information correctly', () => {
      renderWithTheme(
        <HttpStatusCode
          code={404}
          name="Not Found"
          description="The requested resource was not found."
        />
      );
      
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Not Found')).toBeInTheDocument();
      expect(screen.getByText('The requested resource was not found.')).toBeInTheDocument();
    });
  });
  
  describe('ParameterTable', () => {
    it('renders parameter information correctly', () => {
      renderWithTheme(
        <ParameterTable
          parameters={[
            { name: "param1", type: "string", required: true, description: "Test parameter" },
            { name: "param2", type: "number", required: false, description: "Optional parameter" }
          ]}
        />
      );
      
      expect(screen.getByText('param1')).toBeInTheDocument();
      expect(screen.getByText('string')).toBeInTheDocument();
      expect(screen.getByText('Required')).toBeInTheDocument();
      expect(screen.getByText('Test parameter')).toBeInTheDocument();
      
      expect(screen.getByText('param2')).toBeInTheDocument();
      expect(screen.getByText('number')).toBeInTheDocument();
      expect(screen.getByText('Optional')).toBeInTheDocument();
      expect(screen.getByText('Optional parameter')).toBeInTheDocument();
    });
  });
  
  describe('SearchBar', () => {
    it('filters search results based on input', () => {
      const mockSearchIndex = [
        { id: '1', title: 'Apple', section: 'Fruits', url: '#apple' },
        { id: '2', title: 'Banana', section: 'Fruits', url: '#banana' },
        { id: '3', title: 'Carrot', section: 'Vegetables', url: '#carrot' }
      ];
      
      renderWithTheme(
        <SearchBar searchIndex={mockSearchIndex} />
      );
      
      const input = screen.getByPlaceholderText('Search API documentation...');
      
      // Type 'app' to filter results
      fireEvent.change(input, { target: { value: 'app' } });
      
      // Results dropdown should be visible with Apple
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
      expect(screen.queryByText('Carrot')).not.toBeInTheDocument();
    });
  });
  
  describe('TableOfContents', () => {
    it('highlights the active item', () => {
      const mockItems = [
        {
          id: 'section1',
          title: 'Section 1',
          level: 1,
          children: [
            { id: 'subsection1', title: 'Subsection 1' }
          ]
        },
        {
          id: 'section2',
          title: 'Section 2',
          level: 1
        }
      ];
      
      renderWithTheme(
        <TableOfContents
          items={mockItems}
          activeId="section1"
          onItemClick={() => {}}
        />
      );
      
      const section1Link = screen.getByText('Section 1').closest('a');
      const section2Link = screen.getByText('Section 2').closest('a');
      
      // Section 1 should be highlighted
      expect(section1Link).toHaveStyle('color: #0050B3');
      expect(section2Link).not.toHaveStyle('color: #0050B3');
    });
  });
  
  describe('VersionSelector', () => {
    it('displays the current version and allows selection', () => {
      const mockVersions = [
        { value: 'v1', label: 'Version 1', isLatest: true },
        { value: 'v2', label: 'Version 2' }
      ];
      
      const handleChange = jest.fn();
      
      renderWithTheme(
        <VersionSelector
          versions={mockVersions}
          currentVersion="v1"
          onChange={handleChange}
        />
      );
      
      // Current version should be displayed
      expect(screen.getByText('Version 1')).toBeInTheDocument();
      expect(screen.getByText('Latest')).toBeInTheDocument();
      
      // Click to open dropdown
      fireEvent.click(screen.getByText('Version 1'));
      
      // Select Version 2
      fireEvent.click(screen.getByText('Version 2'));
      
      // onChange should be called with 'v2'
      expect(handleChange).toHaveBeenCalledWith('v2');
    });
  });
});