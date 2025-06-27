import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../../../design-system/test-utils';
import ToggleSwitch from '../ToggleSwitch';

describe('ToggleSwitch', () => {

  test('renders with label and description', () => {
    renderWithTheme(
      <ToggleSwitch
        id="test-toggle"
        label="Test Label"
        description="Test Description"
        checked={false}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('renders checked state correctly', () => {
    renderWithTheme(
      <ToggleSwitch
        id="test-toggle"
        label="Test Label"
        checked={true}
        onChange={() => {}}
      />
    );

    const input = screen.getByRole('checkbox');
    expect(input).toBeChecked();
  });

  test('renders unchecked state correctly', () => {
    renderWithTheme(
      <ToggleSwitch
        id="test-toggle"
        label="Test Label"
        checked={false}
        onChange={() => {}}
      />
    );

    const input = screen.getByRole('checkbox');
    expect(input).not.toBeChecked();
  });

  test('calls onChange when clicked', () => {
    const handleChange = jest.fn();
    
    renderWithTheme(
      <ToggleSwitch
        id="test-toggle"
        label="Test Label"
        checked={false}
        onChange={handleChange}
      />
    );

    const track = screen.getByText('Test Label').closest('div')?.previousSibling;
    fireEvent.click(track as Element);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  test('calls onChange with opposite value when clicked', () => {
    const handleChange = jest.fn();
    
    renderWithTheme(
      <ToggleSwitch
        id="test-toggle"
        label="Test Label"
        checked={true}
        onChange={handleChange}
      />
    );

    const track = screen.getByText('Test Label').closest('div')?.previousSibling;
    fireEvent.click(track as Element);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  test('does not call onChange when disabled', () => {
    const handleChange = jest.fn();
    
    renderWithTheme(
      <ToggleSwitch
        id="test-toggle"
        label="Test Label"
        checked={false}
        onChange={handleChange}
        disabled={true}
      />
    );

    const track = screen.getByText('Test Label').closest('div')?.previousSibling;
    fireEvent.click(track as Element);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  test('renders disabled state correctly', () => {
    renderWithTheme(
      <ToggleSwitch
        id="test-toggle"
        label="Test Label"
        checked={false}
        onChange={() => {}}
        disabled={true}
      />
    );

    const input = screen.getByRole('checkbox');
    expect(input).toBeDisabled();
  });
});