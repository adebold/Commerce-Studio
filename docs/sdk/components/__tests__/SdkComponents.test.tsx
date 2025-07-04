import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../../frontend/src/design-system/ThemeProvider';
import SdkVersionSelector from '../SdkVersionSelector';
import LanguageSelector from '../LanguageSelector';
import InstallationInstructions from '../InstallationInstructions';
import CodeExample from '../CodeExample';
import MethodReference from '../MethodReference';
import ClassReference from '../ClassReference';
import TypeDefinition from '../TypeDefinition';

// Mock data for testing
const mockVersions = [
  { value: 'v1', label: 'SDK v1.0.0', isLatest: true },
  { value: 'v0.9', label: 'SDK v0.9.0' },
];

const mockLanguages = [
  { value: 'javascript', label: 'JavaScript/TypeScript' },
  { value: 'python', label: 'Python' },
];

const mockPackageManagers = [
  { id: 'npm', name: 'NPM', command: 'npm install @varai/sdk', language: 'bash' },
  { id: 'yarn', name: 'Yarn', command: 'yarn add @varai/sdk', language: 'bash' },
];

// Wrap components with ThemeProvider for testing
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('SDK Documentation Components', () => {
  describe('SdkVersionSelector', () => {
    test('renders with current version selected', () => {
      const handleChange = jest.fn();
      renderWithTheme(
        <SdkVersionSelector
          versions={mockVersions}
          currentVersion="v1"
          onChange={handleChange}
        />
      );
      
      expect(screen.getByText('SDK v1.0.0')).toBeInTheDocument();
      expect(screen.getByText('Latest')).toBeInTheDocument();
    });
    
    test('opens dropdown when clicked', () => {
      const handleChange = jest.fn();
      renderWithTheme(
        <SdkVersionSelector
          versions={mockVersions}
          currentVersion="v1"
          onChange={handleChange}
        />
      );
      
      // Dropdown should be closed initially
      expect(screen.queryByText('SDK v0.9.0')).not.toBeVisible();
      
      // Click to open dropdown
      fireEvent.click(screen.getByText('SDK v1.0.0'));
      
      // Dropdown should be open
      expect(screen.getByText('SDK v0.9.0')).toBeVisible();
    });
    
    test('calls onChange when a version is selected', () => {
      const handleChange = jest.fn();
      renderWithTheme(
        <SdkVersionSelector
          versions={mockVersions}
          currentVersion="v1"
          onChange={handleChange}
        />
      );
      
      // Open dropdown
      fireEvent.click(screen.getByText('SDK v1.0.0'));
      
      // Select a different version
      fireEvent.click(screen.getByText('SDK v0.9.0'));
      
      // onChange should be called with the selected version
      expect(handleChange).toHaveBeenCalledWith('v0.9');
    });
  });
  
  describe('LanguageSelector', () => {
    test('renders with current language selected', () => {
      const handleChange = jest.fn();
      renderWithTheme(
        <LanguageSelector
          languages={mockLanguages}
          currentLanguage="javascript"
          onChange={handleChange}
        />
      );
      
      expect(screen.getByText('JavaScript/TypeScript')).toBeInTheDocument();
    });
    
    test('opens dropdown when clicked', () => {
      const handleChange = jest.fn();
      renderWithTheme(
        <LanguageSelector
          languages={mockLanguages}
          currentLanguage="javascript"
          onChange={handleChange}
        />
      );
      
      // Dropdown should be closed initially
      expect(screen.queryByText('Python')).not.toBeVisible();
      
      // Click to open dropdown
      fireEvent.click(screen.getByText('JavaScript/TypeScript'));
      
      // Dropdown should be open
      expect(screen.getByText('Python')).toBeVisible();
    });
    
    test('calls onChange when a language is selected', () => {
      const handleChange = jest.fn();
      renderWithTheme(
        <LanguageSelector
          languages={mockLanguages}
          currentLanguage="javascript"
          onChange={handleChange}
        />
      );
      
      // Open dropdown
      fireEvent.click(screen.getByText('JavaScript/TypeScript'));
      
      // Select a different language
      fireEvent.click(screen.getByText('Python'));
      
      // onChange should be called with the selected language
      expect(handleChange).toHaveBeenCalledWith('python');
    });
  });
  
  describe('InstallationInstructions', () => {
    test('renders installation instructions with tabs', () => {
      renderWithTheme(
        <InstallationInstructions
          packageManagers={mockPackageManagers}
          language="javascript"
          sdkName="VARAi JavaScript"
        />
      );
      
      expect(screen.getByText('Installation')).toBeInTheDocument();
      expect(screen.getByText('Install the VARAi JavaScript SDK using your preferred package manager:')).toBeInTheDocument();
      expect(screen.getByText('NPM')).toBeInTheDocument();
      expect(screen.getByText('Yarn')).toBeInTheDocument();
      expect(screen.getByText('npm install @varai/sdk')).toBeInTheDocument();
    });
    
    test('switches between package managers when tabs are clicked', () => {
      renderWithTheme(
        <InstallationInstructions
          packageManagers={mockPackageManagers}
          language="javascript"
          sdkName="VARAi JavaScript"
        />
      );
      
      // NPM should be selected by default
      expect(screen.getByText('npm install @varai/sdk')).toBeInTheDocument();
      
      // Click Yarn tab
      fireEvent.click(screen.getByText('Yarn'));
      
      // Yarn command should be shown
      expect(screen.getByText('yarn add @varai/sdk')).toBeInTheDocument();
    });
  });
  
  describe('CodeExample', () => {
    test('renders code example with title and description', () => {
      renderWithTheme(
        <CodeExample
          title="Example Title"
          description="Example description"
          code="const client = new VaraiClient('api-key');"
          language="javascript"
        />
      );
      
      expect(screen.getByText('Example Title')).toBeInTheDocument();
      expect(screen.getByText('Example description')).toBeInTheDocument();
      expect(screen.getByText('const client = new VaraiClient(\'api-key\');')).toBeInTheDocument();
    });
  });
  
  // Additional tests for MethodReference, ClassReference, and TypeDefinition components
  // would follow a similar pattern, but are omitted for brevity
});