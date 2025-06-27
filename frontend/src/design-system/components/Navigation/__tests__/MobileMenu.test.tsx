import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import MobileMenu from '../MobileMenu';

describe('MobileMenu Component', () => {
  const mockOnClose = jest.fn();
  const mockNavigation = <div data-testid="mock-navigation">Navigation</div>;
  const mockActions = <div data-testid="mock-actions">Actions</div>;

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should not be visible when isOpen is false', () => {
    renderWithTheme(
      <MobileMenu
        isOpen={false}
        onClose={mockOnClose}
        navigation={mockNavigation}
        actions={mockActions}
      />
    );

    // The menu should be rendered but not visible
    const menu = screen.getByTestId('mobile-menu');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveStyle('transform: translateX(100%)');

    // The overlay should not be visible
    const overlay = screen.getByTestId('mobile-menu-overlay');
    expect(overlay).toHaveStyle('opacity: 0');
    expect(overlay).toHaveStyle('visibility: hidden');
  });

  it('should be visible when isOpen is true', () => {
    renderWithTheme(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        navigation={mockNavigation}
        actions={mockActions}
      />
    );

    // The menu should be rendered and visible
    const menu = screen.getByTestId('mobile-menu');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveStyle('transform: translateX(0)');

    // The overlay should be visible
    const overlay = screen.getByTestId('mobile-menu-overlay');
    expect(overlay).toHaveStyle('opacity: 1');
    expect(overlay).toHaveStyle('visibility: visible');
  });

  it('should render navigation and actions', () => {
    renderWithTheme(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        navigation={mockNavigation}
        actions={mockActions}
      />
    );

    // Navigation should be rendered
    const navigation = screen.getByTestId('mock-navigation');
    expect(navigation).toBeInTheDocument();

    // Actions should be rendered
    const actions = screen.getByTestId('mock-actions');
    expect(actions).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    renderWithTheme(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        navigation={mockNavigation}
        actions={mockActions}
      />
    );

    // Click the close button
    const closeButton = screen.getByTestId('mobile-menu-close');
    fireEvent.click(closeButton);

    // onClose should be called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    renderWithTheme(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        navigation={mockNavigation}
        actions={mockActions}
      />
    );

    // Click the overlay
    const overlay = screen.getByTestId('mobile-menu-overlay');
    fireEvent.click(overlay);

    // onClose should be called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not render navigation if not provided', () => {
    renderWithTheme(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        actions={mockActions}
      />
    );

    // Navigation container should not be rendered
    const navigationContainer = screen.queryByTestId('mobile-menu-navigation');
    expect(navigationContainer).not.toBeInTheDocument();

    // Actions should still be rendered
    const actions = screen.getByTestId('mock-actions');
    expect(actions).toBeInTheDocument();
  });

  it('should not render actions if not provided', () => {
    renderWithTheme(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        navigation={mockNavigation}
      />
    );

    // Navigation should be rendered
    const navigation = screen.getByTestId('mock-navigation');
    expect(navigation).toBeInTheDocument();

    // Actions container should not be rendered
    const actionsContainer = screen.queryByTestId('mobile-menu-actions');
    expect(actionsContainer).not.toBeInTheDocument();
  });
});