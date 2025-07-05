/**
 * VARAi Design System - Header Component
 * 
 * A responsive header component for navigation.
 */

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import MobileMenu from './MobileMenu';

// Header variants
export type HeaderVariant = 'primary' | 'secondary';

// Header props interface
export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** The variant of the header */
  variant?: HeaderVariant;
  /** Whether the header is fixed to the top of the page */
  fixed?: boolean;
  /** Whether the header has a shadow */
  elevated?: boolean;
  /** The logo or brand component to display */
  logo?: React.ReactNode;
  /** The navigation items to display */
  navigation?: React.ReactNode;
  /** The actions to display on the right side */
  actions?: React.ReactNode;
  /** The children of the header */
  children?: React.ReactNode;
  /** Whether to show the mobile menu toggle button */
  showMobileMenuToggle?: boolean;
  /** Custom mobile navigation items */
  mobileNavigation?: React.ReactNode;
  /** Custom mobile actions */
  mobileActions?: React.ReactNode;
}

// Import theme type
import { Theme } from '../../theme';

// Variant styles
const variantStyles = {
  primary: (theme: Theme) => css`
    background-color: ${theme.colors.primary[500]};
    color: ${theme.colors.common.white};
  `,
  
  secondary: (theme: Theme) => css`
    background-color: ${theme.colors.common.white};
    color: ${theme.colors.neutral[900]};
    border-bottom: 1px solid ${theme.colors.neutral[200]};
  `,
};

// Styled header component
const StyledHeader = styled.header<HeaderProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.spacing[16]} ${theme.spacing.spacing[24]}`};
  width: 100%;
  box-sizing: border-box;
  z-index: 100;
  
  /* Apply variant styles */
  ${({ theme, variant = 'primary' }) => variantStyles[variant](theme)}
  
  /* Apply fixed positioning */
  ${({ fixed }) => fixed && css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  `}
  
  /* Apply elevation */
  ${({ theme, elevated }) => elevated && css`
    box-shadow: ${theme.shadows.elevation[2]};
  `}
  
  /* Responsive styles */
  ${({ theme }) => css`
    ${theme.breakpoints.down('sm')} {
      padding: ${theme.spacing.spacing[12]} ${theme.spacing.spacing[16]};
    }
  `}
`;

// Styled logo container
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing.spacing[24]};
  
  /* Responsive styles */
  ${({ theme }) => css`
    ${theme.breakpoints.down('sm')} {
      margin-right: ${theme.spacing.spacing[16]};
    }
  `}
`;

// Styled navigation container
const NavigationContainer = styled.nav`
  display: flex;
  align-items: center;
  flex: 1;
  
  /* Responsive styles */
  ${({ theme }) => css`
    ${theme.breakpoints.down('sm')} {
      display: none;
    }
  `}
`;

// Styled actions container
const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: ${({ theme }) => theme.spacing.spacing[16]};
  
  & > * + * {
    margin-left: ${({ theme }) => theme.spacing.spacing[8]};
  }
  
  /* Responsive styles */
  ${({ theme }) => css`
    ${theme.breakpoints.down('sm')} {
      display: none;
    }
  `}
`;

// Styled mobile menu toggle button
const MobileMenuToggle = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  padding: 8px;
  color: inherit;
  
  /* Responsive styles */
  ${({ theme }) => css`
    ${theme.breakpoints.down('sm')} {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `}
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary[200]};
    border-radius: 4px;
  }
`;

/**
 * Header Component
 * 
 * A responsive header component for navigation.
 */
export const Header: React.FC<HeaderProps> = ({
  variant = 'primary',
  fixed = false,
  elevated = true,
  logo,
  navigation,
  actions,
  children,
  showMobileMenuToggle = true,
  mobileNavigation,
  mobileActions,
  ...props
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleOpenMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };
  
  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  // Hamburger menu icon
  const hamburgerIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  
  return (
    <>
      <StyledHeader
        variant={variant}
        fixed={fixed}
        elevated={elevated}
        {...props}
      >
        {children || (
          <>
            {logo && <LogoContainer>{logo}</LogoContainer>}
            {navigation && <NavigationContainer>{navigation}</NavigationContainer>}
            {actions && <ActionsContainer>{actions}</ActionsContainer>}
            
            {showMobileMenuToggle && (
              <MobileMenuToggle
                onClick={handleOpenMobileMenu}
                aria-label="Open menu"
                data-testid="mobile-menu-toggle"
              >
                {hamburgerIcon}
              </MobileMenuToggle>
            )}
          </>
        )}
      </StyledHeader>
      
      {showMobileMenuToggle && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={handleCloseMobileMenu}
          navigation={mobileNavigation || navigation}
          actions={mobileActions || actions}
        />
      )}
    </>
  );
};

export default Header;