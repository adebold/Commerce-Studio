/**
 * VARAi Design System - Sidebar Component
 * 
 * A responsive sidebar component for navigation.
 */

import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

// Sidebar variants
export type SidebarVariant = 'light' | 'dark';

// Sidebar positions
export type SidebarPosition = 'left' | 'right';

// Sidebar props interface
export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** The variant of the sidebar */
  variant?: SidebarVariant;
  /** The position of the sidebar */
  position?: SidebarPosition;
  /** Whether the sidebar is open */
  open?: boolean;
  /** Whether the sidebar is fixed to the side of the page */
  fixed?: boolean;
  /** Whether the sidebar has a shadow */
  elevated?: boolean;
  /** The width of the sidebar */
  width?: string;
  /** The header content to display at the top */
  header?: React.ReactNode;
  /** The footer content to display at the bottom */
  footer?: React.ReactNode;
  /** The children of the sidebar */
  children: React.ReactNode;
}

// Variant styles
const variantStyles = {
  light: (theme: any) => css`
    background-color: ${theme.colors.common.white};
    color: ${theme.colors.neutral[900]};
    border-right: 1px solid ${theme.colors.neutral[200]};
  `,
  
  dark: (theme: any) => css`
    background-color: ${theme.colors.neutral[900]};
    color: ${theme.colors.common.white};
  `,
};

// Styled sidebar component
const StyledSidebar = styled.aside<SidebarProps>`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: ${({ width = '250px' }) => width};
  box-sizing: border-box;
  overflow-y: auto;
  z-index: 90;
  transition: transform 0.3s ease-in-out;
  
  /* Apply variant styles */
  ${({ theme, variant = 'light' }) => variantStyles[variant](theme)}
  
  /* Apply position styles */
  ${({ position = 'left' }) => position === 'right' && css`
    border-right: none;
    border-left: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  `}
  
  /* Apply fixed positioning */
  ${({ fixed, position = 'left' }) => fixed && css`
    position: fixed;
    top: 0;
    ${position}: 0;
    bottom: 0;
  `}
  
  /* Apply elevation */
  ${({ theme, elevated }) => elevated && css`
    box-shadow: ${theme.shadows.elevation[2]};
  `}
  
  /* Apply open/closed state */
  ${({ open = true, position = 'left' }) => !open && css`
    transform: translateX(${position === 'left' ? '-100%' : '100%'});
  `}
  
  /* Responsive styles */
  ${({ theme }) => css`
    ${theme.breakpoints.down('md')} {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
    }
  `}
`;

// Styled header container
const SidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
`;

// Styled content container
const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.spacing[16]};
`;

// Styled footer container
const SidebarFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral[200]};
`;

/**
 * Sidebar Component
 * 
 * A responsive sidebar component for navigation.
 */
export const Sidebar: React.FC<SidebarProps> = ({
  variant = 'light',
  position = 'left',
  open = true,
  fixed = false,
  elevated = false,
  width = '250px',
  header,
  footer,
  children,
  ...props
}) => {
  return (
    <StyledSidebar
      variant={variant}
      position={position}
      open={open}
      fixed={fixed}
      elevated={elevated}
      width={width}
      {...props}
    >
      {header && <SidebarHeader>{header}</SidebarHeader>}
      <SidebarContent>{children}</SidebarContent>
      {footer && <SidebarFooter>{footer}</SidebarFooter>}
    </StyledSidebar>
  );
};

export default Sidebar;