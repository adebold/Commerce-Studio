/**
 * VARAi Design System - Mobile Menu Component
 * 
 * A responsive mobile menu component for navigation on smaller screens.
 */

import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

// Mobile menu props interface
export interface MobileMenuProps {
  /** Whether the menu is open */
  isOpen: boolean;
  /** Function to close the menu */
  onClose: () => void;
  /** The navigation items to display */
  navigation?: React.ReactNode;
  /** The actions to display */
  actions?: React.ReactNode;
}

// Styled overlay
const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 150;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  ${({ isOpen }) => isOpen && css`
    opacity: 1;
    visibility: visible;
  `}
`;

// Styled menu container
const MenuContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 80%;
  max-width: 320px;
  background-color: ${({ theme }) => theme.colors.common.white};
  z-index: 200;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.elevation[4]};
  
  ${({ isOpen }) => isOpen && css`
    transform: translateX(0);
  `}
`;

// Styled menu header
const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
`;

// Styled close button
const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.neutral[700]};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary[200]};
    border-radius: 4px;
  }
`;

// Styled navigation container
const NavigationContainer = styled.nav`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  overflow-y: auto;
  
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
`;

// Styled actions container
const ActionsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
`;

/**
 * MobileMenu Component
 * 
 * A responsive mobile menu component for navigation on smaller screens.
 */
export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navigation,
  actions
}) => {
  // Close menu when clicking outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <>
      <Overlay isOpen={isOpen} onClick={handleOverlayClick} data-testid="mobile-menu-overlay" />
      <MenuContainer isOpen={isOpen} data-testid="mobile-menu">
        <MenuHeader>
          <CloseButton onClick={onClose} aria-label="Close menu" data-testid="mobile-menu-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </CloseButton>
        </MenuHeader>
        
        {navigation && (
          <NavigationContainer data-testid="mobile-menu-navigation">
            {navigation}
          </NavigationContainer>
        )}
        
        {actions && (
          <ActionsContainer data-testid="mobile-menu-actions">
            {actions}
          </ActionsContainer>
        )}
      </MenuContainer>
    </>
  );
};

export default MobileMenu;