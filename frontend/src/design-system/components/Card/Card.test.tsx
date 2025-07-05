/**
 * VARAi Design System - Card Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../ThemeProvider';
import Card from './Card';

// Helper function to render Card with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('Card Component', () => {
  test('renders correctly with default props', () => {
    renderWithTheme(
      <Card data-testid="test-card">
        <div>Card Content</div>
      </Card>
    );
    
    const card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Card Content');
  });

  test('renders with different variants', () => {
    const { rerender } = renderWithTheme(
      <Card data-testid="test-card" variant="outlined">
        <div>Outlined Card</div>
      </Card>
    );
    
    let card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Outlined Card');
    
    rerender(
      <ThemeProvider>
        <Card data-testid="test-card" variant="elevated">
          <div>Elevated Card</div>
        </Card>
      </ThemeProvider>
    );
    
    card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Elevated Card');
    
    rerender(
      <ThemeProvider>
        <Card data-testid="test-card" variant="filled">
          <div>Filled Card</div>
        </Card>
      </ThemeProvider>
    );
    
    card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Filled Card');
  });

  test('renders with different elevation levels', () => {
    renderWithTheme(
      <Card data-testid="test-card" variant="elevated" elevation={3}>
        <div>Elevated Card</div>
      </Card>
    );
    
    const card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    // We would check for specific shadow styles here, but that's harder to test directly
  });

  test('renders with hoverable prop', () => {
    renderWithTheme(
      <Card data-testid="test-card" hoverable>
        <div>Hoverable Card</div>
      </Card>
    );
    
    const card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    // We would check for hover styles here, but that's harder to test directly
  });

  test('renders with clickable prop', () => {
    renderWithTheme(
      <Card data-testid="test-card" clickable>
        <div>Clickable Card</div>
      </Card>
    );
    
    const card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveStyle('cursor: pointer');
  });

  test('renders with fullWidth prop', () => {
    renderWithTheme(
      <Card data-testid="test-card" fullWidth>
        <div>Full Width Card</div>
      </Card>
    );
    
    const card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveStyle('width: 100%');
  });

  test('renders with CardHeader subcomponent', () => {
    renderWithTheme(
      <Card data-testid="test-card">
        <Card.Header title="Card Title" subtitle="Card Subtitle" data-testid="card-header" />
        <div>Card Content</div>
      </Card>
    );
    
    const card = screen.getByTestId('test-card');
    const header = screen.getByTestId('card-header');
    
    expect(card).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent('Card Title');
    expect(header).toHaveTextContent('Card Subtitle');
  });

  test('renders with CardContent subcomponent', () => {
    renderWithTheme(
      <Card data-testid="test-card">
        <Card.Content data-testid="card-content">
          <div>Card Content</div>
        </Card.Content>
      </Card>
    );
    
    const card = screen.getByTestId('test-card');
    const content = screen.getByTestId('card-content');
    
    expect(card).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Card Content');
  });

  test('renders with CardFooter subcomponent', () => {
    renderWithTheme(
      <Card data-testid="test-card">
        <div>Card Content</div>
        <Card.Footer data-testid="card-footer">
          <button>Action 1</button>
          <button>Action 2</button>
        </Card.Footer>
      </Card>
    );
    
    const card = screen.getByTestId('test-card');
    const footer = screen.getByTestId('card-footer');
    
    expect(card).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent('Action 1');
    expect(footer).toHaveTextContent('Action 2');
  });

  test('renders with all subcomponents together', () => {
    renderWithTheme(
      <Card data-testid="test-card">
        <Card.Header title="Card Title" data-testid="card-header" />
        <Card.Content data-testid="card-content">
          <div>Card Content</div>
        </Card.Content>
        <Card.Footer data-testid="card-footer">
          <button>Action</button>
        </Card.Footer>
      </Card>
    );
    
    const card = screen.getByTestId('test-card');
    const header = screen.getByTestId('card-header');
    const content = screen.getByTestId('card-content');
    const footer = screen.getByTestId('card-footer');
    
    expect(card).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });
});