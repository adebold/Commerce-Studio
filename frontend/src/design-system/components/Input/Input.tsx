/**
 * VARAi Design System - Input Component
 * 
 * A customizable input component for form controls.
 */

import React, { forwardRef } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

// Input sizes
export type InputSize = 'small' | 'medium' | 'large';

// Input variants
export type InputVariant = 'outlined' | 'filled' | 'standard';

// Input props interface
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** The size of the input */
  size?: InputSize;
  /** The variant of the input */
  variant?: InputVariant;
  /** The label for the input */
  label?: string;
  /** Helper text to display below the input */
  helperText?: string;
  /** Whether the input is in an error state */
  error?: boolean;
  /** Whether the input is required */
  required?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is read-only */
  readOnly?: boolean;
  /** Whether the input takes up the full width of its container */
  fullWidth?: boolean;
  /** The icon to display at the start of the input */
  startIcon?: React.ReactNode;
  /** The icon to display at the end of the input */
  endIcon?: React.ReactNode;
}

// Size styles
const sizeStyles = {
  small: (theme: any) => css`
    height: 32px;
    padding: ${theme.spacing.spacing[8]} ${theme.spacing.spacing[12]};
    font-size: ${theme.typography.fontSize.sm};
  `,
  
  medium: (theme: any) => css`
    height: 40px;
    padding: ${theme.spacing.spacing[12]} ${theme.spacing.spacing[16]};
    font-size: ${theme.typography.fontSize.md};
  `,
  
  large: (theme: any) => css`
    height: 48px;
    padding: ${theme.spacing.spacing[16]} ${theme.spacing.spacing[20]};
    font-size: ${theme.typography.fontSize.lg};
  `,
};

// Variant styles
const variantStyles = {
  outlined: (theme: any, error: boolean) => css`
    border: 1px solid ${error ? theme.colors.semantic.error.main : theme.colors.neutral[300]};
    background-color: ${theme.colors.common.white};
    
    &:hover:not(:disabled):not(:read-only) {
      border-color: ${error ? theme.colors.semantic.error.dark : theme.colors.primary[400]};
    }
    
    &:focus {
      border-color: ${error ? theme.colors.semantic.error.main : theme.colors.primary[500]};
      box-shadow: ${error 
        ? `0 0 0 2px ${theme.colors.semantic.error.light}` 
        : theme.shadows.effects.focus};
    }
  `,
  
  filled: (theme: any, error: boolean) => css`
    border: 1px solid transparent;
    background-color: ${error ? theme.colors.semantic.error.light : theme.colors.neutral[100]};
    
    &:hover:not(:disabled):not(:read-only) {
      background-color: ${error ? theme.colors.semantic.error.light : theme.colors.neutral[200]};
    }
    
    &:focus {
      border-color: ${error ? theme.colors.semantic.error.main : theme.colors.primary[500]};
      background-color: ${theme.colors.common.white};
      box-shadow: ${error 
        ? `0 0 0 2px ${theme.colors.semantic.error.light}` 
        : theme.shadows.effects.focus};
    }
  `,
  
  standard: (theme: any, error: boolean) => css`
    border: none;
    border-bottom: 1px solid ${error ? theme.colors.semantic.error.main : theme.colors.neutral[300]};
    border-radius: 0;
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
    
    &:hover:not(:disabled):not(:read-only) {
      border-bottom-color: ${error ? theme.colors.semantic.error.dark : theme.colors.primary[400]};
    }
    
    &:focus {
      border-bottom-color: ${error ? theme.colors.semantic.error.main : theme.colors.primary[500]};
      box-shadow: none;
    }
  `,
};

// Styled container component
const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: inline-flex;
  flex-direction: column;
  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

// Styled label component
const InputLabel = styled.label<{ error?: boolean; required?: boolean; disabled?: boolean }>`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[4]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, error, disabled }) => {
    if (disabled) return theme.colors.neutral[500];
    if (error) return theme.colors.semantic.error.main;
    return theme.colors.neutral[800];
  }};
  
  ${({ required }) => required && css`
    &::after {
      content: " *";
      color: ${({ theme }) => theme.colors.semantic.error.main};
    }
  `}
`;

// Styled input wrapper component
const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

// Styled input component
const StyledInput = styled.input<Omit<InputProps, 'label' | 'helperText'>>`
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  outline: none;
  border-radius: ${({ theme }) => theme.components.input.borderRadius};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  transition: all 0.2s ease-in-out;
  
  /* Apply size styles */
  ${({ theme, size = 'medium' }) => sizeStyles[size](theme)}
  
  /* Apply variant styles */
  ${({ theme, variant = 'outlined', error }) => variantStyles[variant](theme, !!error)}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.neutral[100]};
    border-color: ${({ theme }) => theme.colors.neutral[300]};
  }
  
  /* Read-only state */
  &:read-only {
    background-color: ${({ theme }) => theme.colors.neutral[50]};
    cursor: default;
  }
  
  /* Adjust padding when icons are present */
  ${({ startIcon }) => startIcon && css`
    padding-left: 36px;
  `}
  
  ${({ endIcon }) => endIcon && css`
    padding-right: 36px;
  `}
`;

// Styled icon container
const IconContainer = styled.div<{ position: 'start' | 'end' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: ${({ theme }) => theme.colors.neutral[500]};
  
  ${({ position }) => position === 'start' && css`
    left: 12px;
  `}
  
  ${({ position }) => position === 'end' && css`
    right: 12px;
  `}
`;

// Styled helper text component
const HelperText = styled.div<{ error?: boolean }>`
  margin-top: ${({ theme }) => theme.spacing.spacing[4]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme, error }) => 
    error ? theme.colors.semantic.error.main : theme.colors.neutral[600]};
`;

/**
 * Input Component
 * 
 * A customizable input component for form controls.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'medium',
      variant = 'outlined',
      label,
      helperText,
      error = false,
      required = false,
      disabled = false,
      readOnly = false,
      fullWidth = false,
      startIcon,
      endIcon,
      id,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <InputContainer fullWidth={fullWidth}>
        {label && (
          <InputLabel 
            htmlFor={inputId} 
            error={error} 
            required={required} 
            disabled={disabled}
          >
            {label}
          </InputLabel>
        )}
        
        <InputWrapper>
          {startIcon && (
            <IconContainer position="start">
              {startIcon}
            </IconContainer>
          )}
          
          <StyledInput
            id={inputId}
            ref={ref}
            size={size}
            variant={variant}
            error={error}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-invalid={error}
            aria-required={required}
            startIcon={startIcon}
            endIcon={endIcon}
            {...props}
          />
          
          {endIcon && (
            <IconContainer position="end">
              {endIcon}
            </IconContainer>
          )}
        </InputWrapper>
        
        {helperText && (
          <HelperText error={error}>
            {helperText}
          </HelperText>
        )}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

export default Input;