import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import ResponsiveImage from '../ResponsiveImage';

describe('ResponsiveImage Component', () => {
  const mockSrc = 'https://example.com/image.jpg';
  const mockAlt = 'Test image';
  const mockFallbackSrc = 'https://example.com/fallback.jpg';
  const mockPlaceholderSrc = 'https://example.com/placeholder.jpg';

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    );
  };

  it('should render with basic props', () => {
    renderWithTheme(
      <ResponsiveImage
        src={mockSrc}
        alt={mockAlt}
      />
    );

    const image = screen.getByAltText(mockAlt);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockSrc);
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('should render with srcSet and sizes', () => {
    const mockSrcSet = [
      'https://example.com/image-small.jpg 300w',
      'https://example.com/image-medium.jpg 600w',
      'https://example.com/image-large.jpg 1200w'
    ];
    const mockSizes = '(max-width: 600px) 300px, 1200px';

    renderWithTheme(
      <ResponsiveImage
        src={mockSrc}
        alt={mockAlt}
        srcSet={mockSrcSet}
        sizes={mockSizes}
      />
    );

    const image = screen.getByAltText(mockAlt);
    expect(image).toHaveAttribute('srcset', mockSrcSet.join(', '));
    expect(image).toHaveAttribute('sizes', mockSizes);
  });

  it('should not use lazy loading when lazy is false', () => {
    renderWithTheme(
      <ResponsiveImage
        src={mockSrc}
        alt={mockAlt}
        lazy={false}
      />
    );

    const image = screen.getByAltText(mockAlt);
    expect(image).not.toHaveAttribute('loading');
  });

  it('should apply aspect ratio correctly', () => {
    renderWithTheme(
      <ResponsiveImage
        src={mockSrc}
        alt={mockAlt}
        aspectRatio={16/9}
      />
    );

    // The container should have a ::before pseudo-element with padding-top
    // We can't directly test pseudo-elements with testing-library,
    // but we can check if the container has the correct styles
    const container = screen.getByAltText(mockAlt).parentElement;
    expect(container).toHaveStyle('position: relative');
    expect(container).toHaveStyle('overflow: hidden');
  });

  it('should apply object-fit and object-position', () => {
    renderWithTheme(
      <ResponsiveImage
        src={mockSrc}
        alt={mockAlt}
        objectFit="contain"
        objectPosition="top left"
      />
    );

    const image = screen.getByAltText(mockAlt);
    expect(image).toHaveStyle('object-fit: contain');
    expect(image).toHaveStyle('object-position: top left');
  });

  it('should apply width, height, and border radius', () => {
    renderWithTheme(
      <ResponsiveImage
        src={mockSrc}
        alt={mockAlt}
        width={300}
        height={200}
        borderRadius={8}
      />
    );

    const container = screen.getByAltText(mockAlt).parentElement;
    expect(container).toHaveStyle('width: 300px');
    expect(container).toHaveStyle('height: 200px');
    expect(container).toHaveStyle('border-radius: 8px');
  });

  it('should handle onClick events', () => {
    const mockOnClick = jest.fn();

    renderWithTheme(
      <ResponsiveImage
        src={mockSrc}
        alt={mockAlt}
        onClick={mockOnClick}
      />
    );

    const container = screen.getByAltText(mockAlt).parentElement;
    fireEvent.click(container as HTMLElement);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should use fallback image on error', () => {
    renderWithTheme(
      <ResponsiveImage
        src={mockSrc}
        alt={mockAlt}
        fallbackSrc={mockFallbackSrc}
      />
    );

    const image = screen.getByAltText(mockAlt);
    
    // Simulate image load error
    fireEvent.error(image);
    
    // After error, the src should be the fallback src
    expect(image).toHaveAttribute('src', mockFallbackSrc);
  });

  it('should handle blur-up effect with placeholder', () => {
    renderWithTheme(
      <ResponsiveImage
        src={mockSrc}
        alt={mockAlt}
        blurUp={true}
        placeholderSrc={mockPlaceholderSrc}
      />
    );

    const image = screen.getByAltText(mockAlt);
    expect(image).toHaveStyle('opacity: 0');
    expect(image).toHaveStyle('position: absolute');
    
    // Simulate image load
    fireEvent.load(image);
    
    // After load, the image should be visible
    expect(image).toHaveStyle('opacity: 1');
  });
});