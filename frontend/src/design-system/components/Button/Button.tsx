/**
 * VARAi Design System - Button Component
 * 
 * A customizable button component with different variants and sizes.
 */

import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

// Button sizes
export type ButtonSize = 'small' | 'medium' | 'large';

// Button props interface
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The variant of the button */
  variant?: ButtonVariant;
  /** The size of the button */
  size?: ButtonSize;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Whether the button takes up the full width of its container */
  fullWidth?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** The icon to display before the button text */
  startIcon?: React.ReactNode;
  /** The icon to display after the button text */
  endIcon?: React.ReactNode;
  /** The children of the button */
  children: React.ReactNode;
}

// Variant styles
const variantStyles = {
  primary: (theme: any) => css`
    background-color: ${theme.colors.primary[500]};
    color: ${theme.colors.common.white};
    border: 1px solid ${theme.colors.primary[500]};
    
    &:hover:not(:disabled) {
      background-color: ${theme.colors.primary[600]};
      border-color: ${theme.colors.primary[600]};
    }
    
    &:active:not(:disabled) {
      background-color: ${theme.colors.primary[700]};
      border-color: ${theme.colors.primary[700]};
    }
    
    &:focus-visible {
      box-shadow: ${theme.shadows.effects.focus};
      outline: none;
    }
  `,
  
  secondary: (theme: any) => css`
    background-color: transparent;
    color: ${theme.colors.primary[500]};
    border: 1px solid ${theme.colors.primary[500]};
    
    &:hover:not(:disabled) {
      background-color: ${theme.colors.primary[50]};
      border-color: ${theme.colors.primary[600]};
      color: ${theme.colors.primary[600]};
    }
    
    &:active:not(:disabled) {
      background-color: ${theme.colors.primary[100]};
      border-color: ${theme.colors.primary[700]};
      color: ${theme.colors.primary[700]};
    }
    
    &:focus-visible {
      box-shadow: ${theme.shadows.effects.focus};
      outline: none;
    }
  `,
  
  tertiary: (theme: any) => css`
    background-color: transparent;
    color: ${theme.colors.primary[500]};
    border: 1px solid transparent;
    
    &:hover:not(:disabled) {
      background-color: ${theme.colors.primary[50]};
      color: ${theme.colors.primary[600]};
    }
    
    &:active:not(:disabled) {
      background-color: ${theme.colors.primary[100]};
      color: ${theme.colors.primary[700]};
    }
    
    &:focus-visible {
      box-shadow: ${theme.shadows.effects.focus};
      outline: none;
    }
  `,
};

// Size styles
const sizeStyles = {
  small: (theme: any) => css`
    padding: ${theme.spacing.spacing[8]} ${theme.spacing.spacing[12]};
    font-size: ${theme.typography.fontSize.sm};
    height: 32px;
  `,
  
  medium: (theme: any) => css`
    padding: ${theme.spacing.spacing[12]} ${theme.spacing.spacing[16]};
    font-size: ${theme.typography.fontSize.md};
    height: 40px;
  `,
  
  large: (theme: any) => css`
    padding: ${theme.spacing.spacing[16]} ${theme.spacing.spacing[24]};
    font-size: ${theme.typography.fontSize.lg};
    height: 48px;
  `,
};

// Styled button component
const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.components.button.borderRadius};
  transition: ${({ theme }) => theme.components.button.transition};
  margin: 0;
  outline: none;
  text-decoration: none;
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;
  
  /* Apply variant styles */
  ${({ theme, variant = 'primary' }) => variantStyles[variant](theme)}
  
  /* Apply size styles */
  ${({ theme, size = 'medium' }) => sizeStyles[size](theme)}
  
  /* Full width style */
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Loading state */
  ${({ loading }) => loading && css`
    cursor: wait;
    
    /* Hide content when loading */
    & > *:not(.loading-indicator) {
      opacity: 0;
    }
  `}
  
  /* Gap between icon and text */
  & > *:not(:first-child) {
    margin-left: 8px;
  }
`;

// Loading indicator component
const LoadingIndicator = styled.span`
  position: absolute;
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/**
 * Button Component
 * 
 * A customizable button component with different variants and sizes.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled = false,
  startIcon,
  endIcon,
  children,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      loading={loading}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingIndicator className="loading-indicator" />}
      {startIcon && <span className="start-icon">{startIcon}</span>}
      <span>{children}</span>
      {endIcon && <span className="end-icon">{endIcon}</span>}
    </StyledButton>
  );
};

export default Button;