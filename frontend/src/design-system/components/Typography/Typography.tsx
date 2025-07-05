/**
 * VARAi Design System - Typography Component
 * 
 * A set of typography components for consistent text styling.
 */

import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

// Typography variants
export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'h6' 
  | 'body1' 
  | 'body2' 
  | 'caption' 
  | 'overline' 
  | 'button';

// Typography alignments
export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';

// Typography props interface
export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  /** The variant of the typography */
  variant?: TypographyVariant;
  /** The component to render the typography as */
  component?: React.ElementType;
  /** The alignment of the text */
  align?: TypographyAlign;
  /** Whether the text should be displayed as a block element */
  block?: boolean;
  /** Whether the text should be truncated with an ellipsis */
  truncate?: boolean;
  /** The number of lines to truncate at (requires truncate to be true) */
  lines?: number;
  /** Whether the text should be displayed with a gutterBottom margin */
  gutterBottom?: boolean;
  /** Whether the text should be displayed in a muted color */
  muted?: boolean;
  /** The color of the text (from the theme) */
  color?: string;
  /** The children of the typography */
  children: React.ReactNode;
}

// Default component mapping for variants
const defaultComponentMapping: Record<TypographyVariant, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  overline: 'span',
  button: 'span',
};

// Styled typography component
const StyledTypography = styled.span<TypographyProps>`
  margin: 0;
  padding: 0;
  
  /* Apply variant styles */
  ${({ theme, variant = 'body1' }) => {
    const variantStyle = theme.typography.textStyles[variant];
    return css`
      font-family: ${variantStyle.fontFamily};
      font-size: ${variantStyle.fontSize};
      font-weight: ${variantStyle.fontWeight};
      line-height: ${variantStyle.lineHeight};
      letter-spacing: ${variantStyle.letterSpacing};
    `;
  }}
  
  /* Apply alignment */
  ${({ align }) => align && css`
    text-align: ${align};
  `}
  
  /* Apply block display */
  ${({ block }) => block && css`
    display: block;
  `}
  
  /* Apply truncation */
  ${({ truncate, lines = 1 }) => truncate && css`
    overflow: hidden;
    text-overflow: ellipsis;
    ${lines === 1 
      ? css`
          white-space: nowrap;
        ` 
      : css`
          display: -webkit-box;
          -webkit-line-clamp: ${lines};
          -webkit-box-orient: vertical;
          white-space: normal;
        `
    }
  `}
  
  /* Apply gutter bottom */
  ${({ gutterBottom, theme }) => gutterBottom && css`
    margin-bottom: ${theme.spacing.spacing[16]};
  `}
  
  /* Apply muted color */
  ${({ muted, theme }) => muted && css`
    color: ${theme.colors.neutral[600]};
  `}
  
  /* Apply custom color */
  ${({ color }) => color && css`
    color: ${color};
  `}
`;

/**
 * Typography Component
 * 
 * A component for displaying text with consistent styling.
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  component,
  align,
  block = false,
  truncate = false,
  lines = 1,
  gutterBottom = false,
  muted = false,
  color,
  children,
  ...props
}) => {
  // Determine the component to render
  const Component = component || defaultComponentMapping[variant];
  
  return (
    <StyledTypography
      as={Component}
      variant={variant}
      align={align}
      block={block}
      truncate={truncate}
      lines={lines}
      gutterBottom={gutterBottom}
      muted={muted}
      color={color}
      {...props}
    >
      {children}
    </StyledTypography>
  );
};

// Create convenience components for each variant
export const H1 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h1" {...props} />
);

export const H2 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h2" {...props} />
);

export const H3 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h3" {...props} />
);

export const H4 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h4" {...props} />
);

export const H5 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h5" {...props} />
);

export const H6 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h6" {...props} />
);

export const Body1 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body1" {...props} />
);

export const Body2 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body2" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="caption" {...props} />
);

export const Overline = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="overline" {...props} />
);

export const ButtonText = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="button" {...props} />
);

export default Typography;