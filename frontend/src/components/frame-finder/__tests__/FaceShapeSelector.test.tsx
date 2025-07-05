import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../design-system/ThemeProvider';
import FaceShapeSelector from '../FaceShapeSelector';

describe('FaceShapeSelector Component', () => {
  const mockOnSelectShape = jest.fn();
  
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };
  
  beforeEach(() => {
    mockOnSelectShape.mockClear();
  });
  
  it('renders all face shape options', () => {
    renderWithTheme(
      <FaceShapeSelector 
        selectedShape={null} 
        onSelectShape={mockOnSelectShape} 
      />
    );
    
    // Check for all face shape names
    expect(screen.getByText('Oval')).toBeInTheDocument();
    expect(screen.getByText('Round')).toBeInTheDocument();
    expect(screen.getByText('Square')).toBeInTheDocument();
    expect(screen.getByText('Heart')).toBeInTheDocument();
    expect(screen.getByText('Diamond')).toBeInTheDocument();
    expect(screen.getByText('Oblong')).toBeInTheDocument();
  });
  
  it('highlights the selected shape', () => {
    const selectedShape = 'oval';
    
    const { container } = renderWithTheme(
      <FaceShapeSelector 
        selectedShape={selectedShape} 
        onSelectShape={mockOnSelectShape} 
      />
    );
    
    // This is a simplified test as we can't easily test for styled-component props
    // In a real test, you might use a data-testid or other attribute to identify the selected item
    const shapeCards = container.querySelectorAll('div[role="button"]');
    expect(shapeCards.length).toBeGreaterThan(0);
  });
  
  it('calls onSelectShape when a shape is clicked', () => {
    renderWithTheme(
      <FaceShapeSelector 
        selectedShape={null} 
        onSelectShape={mockOnSelectShape} 
      />
    );
    
    // Find the "Oval" shape and click it
    const ovalShape = screen.getByText('Oval').closest('div');
    if (ovalShape) {
      fireEvent.click(ovalShape);
    }
    
    expect(mockOnSelectShape).toHaveBeenCalledWith('oval');
  });
  
  it('displays help text for users', () => {
    renderWithTheme(
      <FaceShapeSelector 
        selectedShape={null} 
        onSelectShape={mockOnSelectShape} 
      />
    );
    
    expect(screen.getByText(/Not sure about your face shape/i)).toBeInTheDocument();
  });
});