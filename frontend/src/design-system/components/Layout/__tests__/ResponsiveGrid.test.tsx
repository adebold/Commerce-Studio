import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import { GridContainer, GridItem } from '../ResponsiveGrid';

describe('ResponsiveGrid Components', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    );
  };

  describe('GridContainer Component', () => {
    it('should render children correctly', () => {
      renderWithTheme(
        <GridContainer data-testid="grid-container">
          <div data-testid="grid-child">Child content</div>
        </GridContainer>
      );

      const container = screen.getByTestId('grid-container');
      expect(container).toBeInTheDocument();

      const child = screen.getByTestId('grid-child');
      expect(child).toBeInTheDocument();
      expect(child).toHaveTextContent('Child content');
    });

    it('should apply different spacing values', () => {
      const { rerender } = renderWithTheme(
        <GridContainer spacing="none" data-testid="grid-container">
          <div>Child content</div>
        </GridContainer>
      );

      let container = screen.getByTestId('grid-container');
      expect(container).toHaveStyle('margin: -0px');

      rerender(
        <ThemeProvider>
          <GridContainer spacing="small" data-testid="grid-container">
            <div>Child content</div>
          </GridContainer>
        </ThemeProvider>
      );

      container = screen.getByTestId('grid-container');
      expect(container).toHaveStyle('margin: -4px');

      rerender(
        <ThemeProvider>
          <GridContainer spacing="large" data-testid="grid-container">
            <div>Child content</div>
          </GridContainer>
        </ThemeProvider>
      );

      container = screen.getByTestId('grid-container');
      expect(container).toHaveStyle('margin: -16px');
    });

    it('should apply different max width values', () => {
      const { rerender } = renderWithTheme(
        <GridContainer maxWidth="xs" data-testid="grid-container">
          <div>Child content</div>
        </GridContainer>
      );

      let container = screen.getByTestId('grid-container');
      expect(container).toHaveStyle('max-width: 600px');

      rerender(
        <ThemeProvider>
          <GridContainer maxWidth="lg" data-testid="grid-container">
            <div>Child content</div>
          </GridContainer>
        </ThemeProvider>
      );

      container = screen.getByTestId('grid-container');
      expect(container).toHaveStyle('max-width: 1440px');

      rerender(
        <ThemeProvider>
          <GridContainer maxWidth="full" data-testid="grid-container">
            <div>Child content</div>
          </GridContainer>
        </ThemeProvider>
      );

      container = screen.getByTestId('grid-container');
      expect(container).toHaveStyle('max-width: 100%');
    });

    it('should center the container when centered is true', () => {
      renderWithTheme(
        <GridContainer centered data-testid="grid-container">
          <div>Child content</div>
        </GridContainer>
      );

      const container = screen.getByTestId('grid-container');
      expect(container).toHaveStyle('margin-left: auto');
      expect(container).toHaveStyle('margin-right: auto');
    });

    it('should not center the container when centered is false', () => {
      renderWithTheme(
        <GridContainer centered={false} data-testid="grid-container">
          <div>Child content</div>
        </GridContainer>
      );

      const container = screen.getByTestId('grid-container');
      expect(container).not.toHaveStyle('margin-left: auto');
      expect(container).not.toHaveStyle('margin-right: auto');
    });
  });

  describe('GridItem Component', () => {
    it('should render children correctly', () => {
      renderWithTheme(
        <GridItem data-testid="grid-item">
          <div data-testid="grid-item-child">Child content</div>
        </GridItem>
      );

      const item = screen.getByTestId('grid-item');
      expect(item).toBeInTheDocument();

      const child = screen.getByTestId('grid-item-child');
      expect(child).toBeInTheDocument();
      expect(child).toHaveTextContent('Child content');
    });

    it('should apply correct column widths based on xs prop', () => {
      const { rerender } = renderWithTheme(
        <GridItem xs={6} data-testid="grid-item">
          <div>Child content</div>
        </GridItem>
      );

      let item = screen.getByTestId('grid-item');
      expect(item).toHaveStyle('flex-basis: 50%');
      expect(item).toHaveStyle('max-width: 50%');

      rerender(
        <ThemeProvider>
          <GridItem xs={12} data-testid="grid-item">
            <div>Child content</div>
          </GridItem>
        </ThemeProvider>
      );

      item = screen.getByTestId('grid-item');
      expect(item).toHaveStyle('flex-basis: 100%');
      expect(item).toHaveStyle('max-width: 100%');

      rerender(
        <ThemeProvider>
          <GridItem xs={3} data-testid="grid-item">
            <div>Child content</div>
          </GridItem>
        </ThemeProvider>
      );

      item = screen.getByTestId('grid-item');
      expect(item).toHaveStyle('flex-basis: 25%');
      expect(item).toHaveStyle('max-width: 25%');
    });

    it('should default to full width when no xs prop is provided', () => {
      renderWithTheme(
        <GridItem data-testid="grid-item">
          <div>Child content</div>
        </GridItem>
      );

      const item = screen.getByTestId('grid-item');
      expect(item).toHaveStyle('flex-basis: 100%');
      expect(item).toHaveStyle('max-width: 100%');
    });
  });
});