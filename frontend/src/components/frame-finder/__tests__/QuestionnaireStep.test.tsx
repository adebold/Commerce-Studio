import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../../design-system/ThemeProvider';
import QuestionnaireStep from '../QuestionnaireStep';

describe('QuestionnaireStep Component', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  it('renders title and description correctly', () => {
    const title = 'Test Title';
    const description = 'Test Description';
    
    renderWithTheme(
      <QuestionnaireStep title={title} description={description}>
        <div data-testid="test-content">Test Content</div>
      </QuestionnaireStep>
    );
    
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
  });
  
  it('renders children content', () => {
    renderWithTheme(
      <QuestionnaireStep title="Title" description="Description">
        <div data-testid="test-content">Test Content</div>
      </QuestionnaireStep>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});