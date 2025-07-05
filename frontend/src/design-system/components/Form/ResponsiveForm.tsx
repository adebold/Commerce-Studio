/**
 * VARAi Design System - Responsive Form Component
 * 
 * A form component that adapts to different screen sizes and provides
 * consistent styling and layout for form elements.
 */

import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

// Form layout types
export type FormLayout = 'vertical' | 'horizontal' | 'inline';

// Form field size
export type FieldSize = 'small' | 'medium' | 'large';

// Form props
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** The layout of the form */
  layout?: FormLayout;
  /** The size of the form fields */
  fieldSize?: FieldSize;
  /** Whether the form is loading */
  loading?: boolean;
  /** Whether the form is disabled */
  disabled?: boolean;
  /** The children of the form */
  children: React.ReactNode;
}

// Form item props
export interface FormItemProps {
  /** The label of the form item */
  label?: React.ReactNode;
  /** Whether the form item is required */
  required?: boolean;
  /** The error message of the form item */
  error?: React.ReactNode;
  /** The help text of the form item */
  helpText?: React.ReactNode;
  /** The children of the form item */
  children: React.ReactNode;
  /** The layout of the form item (overrides the form layout) */
  layout?: FormLayout;
  /** The size of the form item (overrides the form size) */
  fieldSize?: FieldSize;
}

// Styled form
const StyledForm = styled.form<{
  layout: FormLayout;
  fieldSize: FieldSize;
  disabled: boolean;
}>`
  display: flex;
  flex-direction: ${({ layout }) => layout === 'inline' ? 'row' : 'column'};
  flex-wrap: ${({ layout }) => layout === 'inline' ? 'wrap' : 'nowrap'};
  gap: ${({ theme, layout }) => 
    layout === 'inline' 
      ? theme.spacing.spacing[16] 
      : theme.spacing.spacing[24]
  };
  width: 100%;
  
  ${({ disabled }) => disabled && css`
    opacity: 0.6;
    pointer-events: none;
  `}
  
  /* Responsive styles */
  ${({ theme, layout }) => layout === 'inline' && css`
    ${theme.breakpoints.down('sm')} {
      flex-direction: column;
    }
  `}
`;

// Styled form item
const StyledFormItem = styled.div<{
  layout: FormLayout;
  fieldSize: FieldSize;
}>`
  display: flex;
  flex-direction: ${({ layout }) => layout === 'horizontal' ? 'row' : 'column'};
  align-items: ${({ layout }) => layout === 'horizontal' ? 'flex-start' : 'stretch'};
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  width: 100%;
  
  /* Responsive styles */
  ${({ theme, layout }) => layout === 'horizontal' && css`
    ${theme.breakpoints.down('sm')} {
      flex-direction: column;
    }
  `}
`;

// Styled label
const StyledLabel = styled.label<{
  layout: FormLayout;
  fieldSize: FieldSize;
  required: boolean;
}>`
  display: flex;
  align-items: center;
  
  ${({ layout }) => layout === 'horizontal' && css`
    width: 30%;
    min-width: 120px;
  `}
  
  ${({ required }) => required && css`
    &::after {
      content: '*';
      color: #f44336;
      margin-left: 4px;
    }
  `}
  
  /* Field size styles */
  ${({ fieldSize, theme }) => {
    switch (fieldSize) {
      case 'small':
        return css`
          font-size: ${theme.typography.fontSize.sm};
        `;
      case 'large':
        return css`
          font-size: ${theme.typography.fontSize.lg};
        `;
      default:
        return css`
          font-size: ${theme.typography.fontSize.md};
        `;
    }
  }}
`;

// Styled field container
const StyledFieldContainer = styled.div<{
  layout: FormLayout;
}>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[4]};
  width: ${({ layout }) => layout === 'horizontal' ? '70%' : '100%'};
  
  /* Responsive styles */
  ${({ theme, layout }) => layout === 'horizontal' && css`
    ${theme.breakpoints.down('sm')} {
      width: 100%;
    }
  `}
`;

// Styled error message
const StyledError = styled.div`
  color: #f44336;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

// Styled help text
const StyledHelpText = styled.div`
  color: ${({ theme }) => theme.colors.neutral[600]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

// Form context
export const FormContext = React.createContext<{
  layout: FormLayout;
  fieldSize: FieldSize;
  disabled: boolean;
}>({
  layout: 'vertical',
  fieldSize: 'medium',
  disabled: false,
});

/**
 * Form Component
 * 
 * A form component that adapts to different screen sizes and provides
 * consistent styling and layout for form elements.
 */
export const Form: React.FC<FormProps> = ({
  layout = 'vertical',
  fieldSize = 'medium',
  loading = false,
  disabled = false,
  children,
  ...props
}) => {
  return (
    <FormContext.Provider value={{ layout, fieldSize, disabled: disabled || loading }}>
      <StyledForm
        layout={layout}
        fieldSize={fieldSize}
        disabled={disabled || loading}
        {...props}
      >
        {children}
      </StyledForm>
    </FormContext.Provider>
  );
};

/**
 * FormItem Component
 * 
 * A form item component that provides consistent styling and layout for form elements.
 */
export const FormItem: React.FC<FormItemProps> = ({
  label,
  required = false,
  error,
  helpText,
  children,
  layout: itemLayout,
  fieldSize: itemFieldSize,
}) => {
  // Get form context
  const formContext = React.useContext(FormContext);
  
  // Use item layout or form layout
  const layout = itemLayout || formContext.layout;
  
  // Use item field size or form field size
  const fieldSize = itemFieldSize || formContext.fieldSize;
  
  return (
    <StyledFormItem layout={layout} fieldSize={fieldSize}>
      {label && (
        <StyledLabel layout={layout} fieldSize={fieldSize} required={required}>
          {label}
        </StyledLabel>
      )}
      
      <StyledFieldContainer layout={layout}>
        {children}
        
        {error && (
          <StyledError>{error}</StyledError>
        )}
        
        {helpText && !error && (
          <StyledHelpText>{helpText}</StyledHelpText>
        )}
      </StyledFieldContainer>
    </StyledFormItem>
  );
};

/**
 * FormActions Component
 * 
 * A component for form action buttons with consistent styling and layout.
 */
export const FormActions = styled.div<{
  align?: 'left' | 'center' | 'right';
}>`
  display: flex;
  flex-direction: row;
  justify-content: ${({ align }) => {
    switch (align) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      default:
        return 'flex-end';
    }
  }};
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
  
  /* Responsive styles */
  ${({ theme }) => css`
    ${theme.breakpoints.down('sm')} {
      flex-direction: column;
      width: 100%;
      
      & > button {
        width: 100%;
      }
    }
  `}
`;

// Export form components
export default {
  Form,
  FormItem,
  FormActions,
};