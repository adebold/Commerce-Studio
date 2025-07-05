import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import { Form, FormItem, FormActions } from '../ResponsiveForm';

describe('ResponsiveForm Components', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    );
  };

  describe('Form Component', () => {
    it('should render children correctly', () => {
      renderWithTheme(
        <Form data-testid="form">
          <div data-testid="form-child">Form content</div>
        </Form>
      );

      const form = screen.getByTestId('form');
      expect(form).toBeInTheDocument();

      const child = screen.getByTestId('form-child');
      expect(child).toBeInTheDocument();
      expect(child).toHaveTextContent('Form content');
    });

    it('should apply vertical layout by default', () => {
      renderWithTheme(
        <Form data-testid="form">
          <div>Form content</div>
        </Form>
      );

      const form = screen.getByTestId('form');
      expect(form).toHaveStyle('flex-direction: column');
    });

    it('should apply horizontal layout when specified', () => {
      renderWithTheme(
        <Form layout="horizontal" data-testid="form">
          <div>Form content</div>
        </Form>
      );

      const form = screen.getByTestId('form');
      expect(form).toHaveStyle('flex-direction: column');
    });

    it('should apply inline layout when specified', () => {
      renderWithTheme(
        <Form layout="inline" data-testid="form">
          <div>Form content</div>
        </Form>
      );

      const form = screen.getByTestId('form');
      expect(form).toHaveStyle('flex-direction: row');
      expect(form).toHaveStyle('flex-wrap: wrap');
    });

    it('should apply disabled styles when disabled', () => {
      renderWithTheme(
        <Form disabled data-testid="form">
          <div>Form content</div>
        </Form>
      );

      const form = screen.getByTestId('form');
      expect(form).toHaveStyle('opacity: 0.6');
      expect(form).toHaveStyle('pointer-events: none');
    });

    it('should apply disabled styles when loading', () => {
      renderWithTheme(
        <Form loading data-testid="form">
          <div>Form content</div>
        </Form>
      );

      const form = screen.getByTestId('form');
      expect(form).toHaveStyle('opacity: 0.6');
      expect(form).toHaveStyle('pointer-events: none');
    });
  });

  describe('FormItem Component', () => {
    it('should render children correctly', () => {
      renderWithTheme(
        <Form>
          <FormItem data-testid="form-item">
            <input
              data-testid="form-input"
              type="text"
              aria-label="Test input"
              placeholder="Enter text"
            />
          </FormItem>
        </Form>
      );

      const formItem = screen.getByTestId('form-item');
      expect(formItem).toBeInTheDocument();

      const input = screen.getByTestId('form-input');
      expect(input).toBeInTheDocument();
    });

    it('should render label when provided', () => {
      renderWithTheme(
        <Form>
          <FormItem label="Test Label" data-testid="form-item">
            <input
              type="text"
              aria-label="Test input"
              placeholder="Enter text"
            />
          </FormItem>
        </Form>
      );

      const formItem = screen.getByTestId('form-item');
      expect(formItem).toBeInTheDocument();

      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
    });

    it('should show required indicator when required', () => {
      renderWithTheme(
        <Form>
          <FormItem label="Test Label" required data-testid="form-item">
            <input
              type="text"
              aria-label="Test input"
              placeholder="Enter text"
            />
          </FormItem>
        </Form>
      );

      const label = screen.getByText('Test Label');
      // We can't directly test the ::after pseudo-element, but we can check
      // if the label has the required attribute
      expect(label.parentElement).toHaveAttribute('required', 'true');
    });

    it('should show error message when provided', () => {
      renderWithTheme(
        <Form>
          <FormItem 
            label="Test Label" 
            error="This field is required" 
            data-testid="form-item"
          >
            <input
              type="text"
              aria-label="Test input"
              placeholder="Enter text"
            />
          </FormItem>
        </Form>
      );

      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveStyle('color: #f44336');
    });

    it('should show help text when provided', () => {
      renderWithTheme(
        <Form>
          <FormItem 
            label="Test Label" 
            helpText="Enter your username" 
            data-testid="form-item"
          >
            <input
              type="text"
              aria-label="Test input"
              placeholder="Enter text"
            />
          </FormItem>
        </Form>
      );

      const helpText = screen.getByText('Enter your username');
      expect(helpText).toBeInTheDocument();
    });

    it('should not show help text when error is present', () => {
      renderWithTheme(
        <Form>
          <FormItem 
            label="Test Label" 
            helpText="Enter your username" 
            error="This field is required"
            data-testid="form-item"
          >
            <input
              type="text"
              aria-label="Test input"
              placeholder="Enter text"
            />
          </FormItem>
        </Form>
      );

      const helpText = screen.queryByText('Enter your username');
      expect(helpText).not.toBeInTheDocument();

      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('FormActions Component', () => {
    it('should render children correctly', () => {
      renderWithTheme(
        <Form>
          <FormActions data-testid="form-actions">
            <button data-testid="submit-button">Submit</button>
            <button data-testid="cancel-button">Cancel</button>
          </FormActions>
        </Form>
      );

      const formActions = screen.getByTestId('form-actions');
      expect(formActions).toBeInTheDocument();

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Submit');

      const cancelButton = screen.getByTestId('cancel-button');
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toHaveTextContent('Cancel');
    });

    it('should align buttons to the right by default', () => {
      renderWithTheme(
        <Form>
          <FormActions data-testid="form-actions">
            <button>Submit</button>
            <button>Cancel</button>
          </FormActions>
        </Form>
      );

      const formActions = screen.getByTestId('form-actions');
      expect(formActions).toHaveStyle('justify-content: flex-end');
    });

    it('should align buttons to the left when specified', () => {
      renderWithTheme(
        <Form>
          <FormActions align="left" data-testid="form-actions">
            <button>Submit</button>
            <button>Cancel</button>
          </FormActions>
        </Form>
      );

      const formActions = screen.getByTestId('form-actions');
      expect(formActions).toHaveStyle('justify-content: flex-start');
    });

    it('should align buttons to the center when specified', () => {
      renderWithTheme(
        <Form>
          <FormActions align="center" data-testid="form-actions">
            <button>Submit</button>
            <button>Cancel</button>
          </FormActions>
        </Form>
      );

      const formActions = screen.getByTestId('form-actions');
      expect(formActions).toHaveStyle('justify-content: center');
    });
  });
});