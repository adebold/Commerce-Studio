/**
 * VARAi Design System - Card Component
 * 
 * A customizable card component for content containers.
 */

import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

// Card variants
export type CardVariant = 'outlined' | 'elevated' | 'filled';

// Card props interface
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The variant of the card */
  variant?: CardVariant;
  /** Whether the card has a hover effect */
  hoverable?: boolean;
  /** Whether the card is clickable */
  clickable?: boolean;
  /** The elevation level of the card (1-5) */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Whether the card takes up the full width of its container */
  fullWidth?: boolean;
  /** The children of the card */
  children: React.ReactNode;
}

// Variant styles
const variantStyles = {
  outlined: (theme: any) => css`
    background-color: ${theme.colors.common.white};
    border: 1px solid ${theme.colors.neutral[200]};
    box-shadow: none;
  `,
  
  elevated: (theme: any, elevation: number = 1) => css`
    background-color: ${theme.colors.common.white};
    border: none;
    box-shadow: ${theme.shadows.elevation[elevation]};
  `,
  
  filled: (theme: any) => css`
    background-color: ${theme.colors.neutral[50]};
    border: none;
    box-shadow: none;
  `,
};

// Styled card component
const StyledCard = styled.div<CardProps>`
  display: block;
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  padding: ${({ theme }) => theme.components.card.padding};
  transition: all 0.2s ease-in-out;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  
  /* Apply variant styles */
  ${({ theme, variant = 'elevated', elevation = 1 }) => 
    variant === 'elevated' 
      ? variantStyles.elevated(theme, elevation) 
      : variantStyles[variant](theme)
  }
  
  /* Hoverable style */
  ${({ theme, hoverable, variant }) => hoverable && css`
    &:hover {
      ${variant === 'elevated' 
        ? css`box-shadow: ${theme.shadows.effects.hover};` 
        : css`border-color: ${theme.colors.primary[300]};`
      }
      transform: translateY(-2px);
    }
  `}
  
  /* Clickable style */
  ${({ clickable }) => clickable && css`
    cursor: pointer;
  `}
`;

/**
 * Card Header Component
 */
const StyledCardHeader = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[100]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The title of the card */
  title?: React.ReactNode;
  /** The subtitle of the card */
  subtitle?: React.ReactNode;
  /** The action component to display in the header */
  action?: React.ReactNode;
  /** The icon to display in the header */
  icon?: React.ReactNode;
  /** The children of the card header */
  children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  icon,
  children,
  ...props
}) => {
  return (
    <StyledCardHeader {...props}>
      {children || (
        <>
          {icon && <div className="card-header-icon">{icon}</div>}
          <div className="card-header-content" style={{ flex: 1 }}>
            {title && <div className="card-header-title">{title}</div>}
            {subtitle && <div className="card-header-subtitle">{subtitle}</div>}
          </div>
          {action && <div className="card-header-action">{action}</div>}
        </>
      )}
    </StyledCardHeader>
  );
};

/**
 * Card Content Component
 */
const StyledCardContent = styled.div`
  padding: ${({ theme }) => theme.spacing.spacing[8]} 0;
`;

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ children, ...props }) => {
  return <StyledCardContent {...props}>{children}</StyledCardContent>;
};

/**
 * Card Footer Component
 */
const StyledCardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing.spacing[16]};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral[100]};
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
  
  & > * + * {
    margin-left: ${({ theme }) => theme.spacing.spacing[8]};
  }
`;

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, ...props }) => {
  return <StyledCardFooter {...props}>{children}</StyledCardFooter>;
};

/**
 * Card Component
 * 
 * A customizable card component for content containers.
 */
export const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
} = ({ children, ...props }) => {
  return <StyledCard {...props}>{children}</StyledCard>;
};

// Attach subcomponents
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;