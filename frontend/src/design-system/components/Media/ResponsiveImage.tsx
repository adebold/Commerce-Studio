/**
 * VARAi Design System - Responsive Image Component
 * 
 * An image component that adapts to different screen sizes and provides
 * lazy loading, aspect ratio preservation, and fallback handling.
 */

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

// Responsive image props
export interface ResponsiveImageProps {
  /** The source URL of the image */
  src: string;
  /** Alternative text for the image */
  alt: string;
  /** Optional array of srcset entries for responsive images */
  srcSet?: string[];
  /** Optional sizes attribute for responsive images */
  sizes?: string;
  /** Whether to lazy load the image */
  lazy?: boolean;
  /** Aspect ratio to maintain (width/height) */
  aspectRatio?: number;
  /** Object fit property */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Object position property */
  objectPosition?: string;
  /** Optional CSS class name */
  className?: string;
  /** Optional inline style */
  style?: React.CSSProperties;
  /** Optional fallback image to display on error */
  fallbackSrc?: string;
  /** Whether to use a blur-up loading effect */
  blurUp?: boolean;
  /** Low quality image placeholder for blur-up effect */
  placeholderSrc?: string;
  /** Optional width */
  width?: string | number;
  /** Optional height */
  height?: string | number;
  /** Optional border radius */
  borderRadius?: string | number;
  /** Optional onClick handler */
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
}

// Styled image container
const ImageContainer = styled.div<{
  aspectRatio?: number;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}>`
  position: relative;
  overflow: hidden;
  width: ${({ width }) => width ? (typeof width === 'number' ? `${width}px` : width) : '100%'};
  height: ${({ height }) => height ? (typeof height === 'number' ? `${height}px` : height) : 'auto'};
  border-radius: ${({ borderRadius }) => 
    borderRadius ? (typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius) : '0'
  };
  
  ${({ aspectRatio }) => aspectRatio && css`
    &::before {
      content: '';
      display: block;
      padding-top: ${(1 / aspectRatio) * 100}%;
    }
  `}
`;

// Styled image
const StyledImage = styled.img<{
  isLoaded: boolean;
  objectFit?: ResponsiveImageProps['objectFit'];
  objectPosition?: string;
  blurUp?: boolean;
}>`
  position: ${({ blurUp }) => blurUp ? 'absolute' : 'static'};
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: ${({ objectFit }) => objectFit || 'cover'};
  object-position: ${({ objectPosition }) => objectPosition || 'center'};
  transition: opacity 0.3s ease;
  opacity: ${({ isLoaded }) => isLoaded ? 1 : 0};
  
  ${({ blurUp, isLoaded }) => blurUp && !isLoaded && css`
    filter: blur(10px);
    transform: scale(1.05);
  `}
`;

// Styled placeholder
const Placeholder = styled.div<{
  placeholderSrc?: string;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${({ placeholderSrc }) => placeholderSrc ? `url(${placeholderSrc})` : 'none'};
  background-size: cover;
  background-position: center;
  filter: blur(10px);
  transform: scale(1.05);
`;

/**
 * ResponsiveImage Component
 * 
 * An image component that adapts to different screen sizes and provides
 * lazy loading, aspect ratio preservation, and fallback handling.
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  srcSet,
  sizes,
  lazy = true,
  aspectRatio,
  objectFit = 'cover',
  objectPosition = 'center',
  className,
  style,
  fallbackSrc,
  blurUp = false,
  placeholderSrc,
  width,
  height,
  borderRadius,
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  // Handle image error
  const handleError = () => {
    if (fallbackSrc && !hasError) {
      setHasError(true);
    }
  };
  
  return (
    <ImageContainer 
      aspectRatio={aspectRatio}
      width={width}
      height={height}
      borderRadius={borderRadius}
      className={className}
      style={style}
      onClick={onClick}
    >
      {blurUp && placeholderSrc && !isLoaded && (
        <Placeholder placeholderSrc={placeholderSrc} />
      )}
      
      <StyledImage
        src={hasError ? fallbackSrc : src}
        alt={alt}
        srcSet={!hasError ? srcSet?.join(', ') : undefined}
        sizes={!hasError ? sizes : undefined}
        loading={lazy ? 'lazy' : undefined}
        onLoad={handleLoad}
        onError={handleError}
        isLoaded={isLoaded}
        objectFit={objectFit}
        objectPosition={objectPosition}
        blurUp={blurUp}
      />
    </ImageContainer>
  );
};

export default ResponsiveImage;