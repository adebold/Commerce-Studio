/**
 * VARAi Design System - Responsive Grid Component
 * 
 * A flexible grid system that adapts to different screen sizes.
 */

import React from 'react';
import styled from '@emotion/styled';
import { css, SerializedStyles } from '@emotion/react';

// Grid container props
export interface GridContainerProps {
  /** Spacing between grid items */
  spacing?: 'none' | 'small' | 'medium' | 'large';
  /** Maximum width of the grid container */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'none';
  /** Whether to center the grid container */
  centered?: boolean;
  /** Custom CSS */
  css?: SerializedStyles;
  /** Children elements */
  children: React.ReactNode;
}

// Grid item props
export interface GridItemProps {
  /** Number of columns to span on extra small screens */
  xs?: number;
  /** Number of columns to span on small screens */
  sm?: number;
  /** Number of columns to span on medium screens */
  md?: number;
  /** Number of columns to span on large screens */
  lg?: number;
  /** Number of columns to span on extra large screens */
  xl?: number;
  /** Custom CSS */
  css?: SerializedStyles;
  /** Children elements */
  children: React.ReactNode;
}

// Spacing values in pixels
const spacingValues = {
  none: 0,
  small: 8,
  medium: 16,
  large: 32
};

// Max width values in pixels
const maxWidthValues = {
  xs: 600,
  sm: 960,
  md: 1280,
  lg: 1440,
  xl: 1920,
  full: '100%',
  none: 'none'
};

// Total number of columns in the grid
const GRID_COLUMNS = 12;

// Styled grid container
const StyledGridContainer = styled.div<GridContainerProps>`
  display: flex;
  flex-wrap: wrap;
  box-sizing: border-box;
  width: 100%;
  
  /* Apply spacing */
  ${({ spacing = 'medium' }) => {
    const spacingValue = spacingValues[spacing];
    return css`
      margin: -${spacingValue / 2}px;
      
      & > * {
        padding: ${spacingValue / 2}px;
      }
    `;
  }}
  
  /* Apply max width */
  ${({ maxWidth = 'lg', centered = true }) => {
    if (maxWidth === 'none') return '';
    
    const width = maxWidthValues[maxWidth];
    return css`
      max-width: ${width}${typeof width === 'number' ? 'px' : ''};
      ${centered ? 'margin-left: auto; margin-right: auto;' : ''}
    `;
  }}
`;

// Styled grid item
const StyledGridItem = styled.div<GridItemProps>`
  box-sizing: border-box;
  
  /* Default to full width on mobile */
  flex-basis: 100%;
  max-width: 100%;
  
  /* Responsive column widths */
  ${({ xs }) => xs !== undefined && css`
    flex-basis: ${(xs / GRID_COLUMNS) * 100}%;
    max-width: ${(xs / GRID_COLUMNS) * 100}%;
  `}
  
  ${({ sm, theme }) => sm !== undefined && theme && css`
    ${theme.breakpoints.up('sm')} {
      flex-basis: ${(sm / GRID_COLUMNS) * 100}%;
      max-width: ${(sm / GRID_COLUMNS) * 100}%;
    }
  `}
  
  ${({ md, theme }) => md !== undefined && theme && css`
    ${theme.breakpoints.up('md')} {
      flex-basis: ${(md / GRID_COLUMNS) * 100}%;
      max-width: ${(md / GRID_COLUMNS) * 100}%;
    }
  `}
  
  ${({ lg, theme }) => lg !== undefined && theme && css`
    ${theme.breakpoints.up('lg')} {
      flex-basis: ${(lg / GRID_COLUMNS) * 100}%;
      max-width: ${(lg / GRID_COLUMNS) * 100}%;
    }
  `}
  
  ${({ xl, theme }) => xl !== undefined && theme && css`
    ${theme.breakpoints.up('xl')} {
      flex-basis: ${(xl / GRID_COLUMNS) * 100}%;
      max-width: ${(xl / GRID_COLUMNS) * 100}%;
    }
  `}
`;

/**
 * GridContainer Component
 * 
 * A container for grid items that provides spacing and width control.
 */
export const GridContainer: React.FC<GridContainerProps> = ({
  spacing = 'medium',
  maxWidth = 'lg',
  centered = true,
  children,
  ...props
}) => {
  return (
    <StyledGridContainer
      spacing={spacing}
      maxWidth={maxWidth}
      centered={centered}
      {...props}
    >
      {children}
    </StyledGridContainer>
  );
};

/**
 * GridItem Component
 * 
 * A grid item that can span a specified number of columns at different breakpoints.
 */
export const GridItem: React.FC<GridItemProps> = ({
  xs = 12, // Default to full width on mobile
  sm,
  md,
  lg,
  xl,
  children,
  ...props
}) => {
  return (
    <StyledGridItem
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      {...props}
    >
      {children}
    </StyledGridItem>
  );
};

export default {
  Container: GridContainer,
  Item: GridItem
};