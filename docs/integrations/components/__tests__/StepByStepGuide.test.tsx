import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../../../frontend/src/design-system/ThemeProvider';
import StepByStepGuide from '../StepByStepGuide';

describe('StepByStepGuide Component', () => {
  const mockSteps = [
    {
      title: 'Step 1',
      description: 'This is step 1 description'
    },
    {
      title: 'Step 2',
      description: 'This is step 2 description',
      code: 'console.log("Hello World");'
    },
    {
      title: 'Step 3',
      description: 'This is step 3 description',
      image: '/path/to/image.png'
    }
  ];

  const renderWithTheme = (component) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  test('renders the guide title and description', () => {
    renderWithTheme(
      <StepByStepGuide
        title="Test Guide"
        description="This is a test guide description"
        steps={mockSteps}
      />
    );
    
    expect(screen.getByText('Test Guide')).toBeInTheDocument();
    expect(screen.getByText('This is a test guide description')).toBeInTheDocument();
  });

  test('renders all steps with their titles and descriptions', () => {
    renderWithTheme(
      <StepByStepGuide
        title="Test Guide"
        steps={mockSteps}
      />
    );
    
    // Check if all step titles are rendered
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
    
    // Check if all step descriptions are rendered
    expect(screen.getByText('This is step 1 description')).toBeInTheDocument();
    expect(screen.getByText('This is step 2 description')).toBeInTheDocument();
    expect(screen.getByText('This is step 3 description')).toBeInTheDocument();
  });

  test('renders code block when provided', () => {
    renderWithTheme(
      <StepByStepGuide
        title="Test Guide"
        steps={mockSteps}
      />
    );
    
    // Check if the code block is rendered
    expect(screen.getByText('console.log("Hello World");')).toBeInTheDocument();
  });

  test('renders image when provided', () => {
    renderWithTheme(
      <StepByStepGuide
        title="Test Guide"
        steps={mockSteps}
      />
    );
    
    // Check if the image is rendered
    const image = screen.getByAltText('Step 3 - Step 3');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/path/to/image.png');
  });

  test('renders without description when not provided', () => {
    renderWithTheme(
      <StepByStepGuide
        title="Test Guide"
        steps={mockSteps}
      />
    );
    
    // The component should render without errors even if description is not provided
    expect(screen.getByText('Test Guide')).toBeInTheDocument();
  });

  test('renders step numbers correctly', () => {
    renderWithTheme(
      <StepByStepGuide
        title="Test Guide"
        steps={mockSteps}
      />
    );
    
    // Check if step numbers are rendered
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});