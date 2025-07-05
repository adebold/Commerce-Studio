import React from 'react';
import { renderWithEmotion, screen, fireEvent } from '../../../test-utils';
import SettingsCard from '../SettingsCard';

describe('SettingsCard', () => {
  const renderWithTheme = renderWithEmotion;

  test('renders with title and description', () => {
    renderWithTheme(
      <SettingsCard
        title="Test Title"
        description="Test Description"
      >
        <div>Test Content</div>
      </SettingsCard>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders without actions when onSave and onReset are not provided', () => {
    renderWithTheme(
      <SettingsCard
        title="Test Title"
      >
        <div>Test Content</div>
      </SettingsCard>
    );

    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
    expect(screen.queryByText('Reset')).not.toBeInTheDocument();
  });

  test('renders save button when onSave is provided', () => {
    const handleSave = jest.fn();
    
    renderWithTheme(
      <SettingsCard
        title="Test Title"
        onSave={handleSave}
      >
        <div>Test Content</div>
      </SettingsCard>
    );

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Save Changes'));
    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  test('renders reset button when onReset is provided', () => {
    const handleReset = jest.fn();
    
    renderWithTheme(
      <SettingsCard
        title="Test Title"
        onReset={handleReset}
      >
        <div>Test Content</div>
      </SettingsCard>
    );

    expect(screen.getByText('Reset')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Reset'));
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  test('disables buttons when saving is true', () => {
    const handleSave = jest.fn();
    const handleReset = jest.fn();
    
    renderWithTheme(
      <SettingsCard
        title="Test Title"
        onSave={handleSave}
        onReset={handleReset}
        saving={true}
      >
        <div>Test Content</div>
      </SettingsCard>
    );

    const saveButton = screen.getByText('Save Changes');
    const resetButton = screen.getByText('Reset');
    
    expect(saveButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
    
    fireEvent.click(saveButton);
    fireEvent.click(resetButton);
    
    expect(handleSave).not.toHaveBeenCalled();
    expect(handleReset).not.toHaveBeenCalled();
  });

  test('renders with icon', () => {
    renderWithTheme(
      <SettingsCard
        title="Test Title"
        icon={<span data-testid="test-icon">Icon</span>}
      >
        <div>Test Content</div>
      </SettingsCard>
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});