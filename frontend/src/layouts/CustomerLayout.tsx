import React, { Suspense } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

/**
 * Loading component for Suspense fallback
 */
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.colors.neutral[200]};
  border-top-color: ${({ theme }) => theme.colors.primary[500]};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingComponent = () => (
  <LoadingContainer>
    <LoadingSpinner />
    <div>Loading...</div>
  </LoadingContainer>
);

/**
 * Styled components for layout
 */
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.spacing[24]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
`;

const FooterContainer = styled.footer`
  padding: ${({ theme }) => theme.spacing.spacing[24]};
  background-color: ${({ theme }) => theme.colors.neutral[900]};
  color: ${({ theme }) => theme.colors.common.white};
  text-align: center;
`;

const NavLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  margin: 0 ${({ theme }) => theme.spacing.spacing[16]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary[300]};
  }
`;

// Mobile navigation styles
const MobileNavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.neutral[900]};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  padding: ${({ theme }) => `${theme.spacing.spacing[12]} ${theme.spacing.spacing[16]}`};
  border-radius: 8px;
  display: block;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const MobileActionButton = styled.button`
  width: 100%;
  margin-bottom: 8px;
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
`;

/**
 * Layout component for customer-facing pages
 * This includes header, footer, navigation, etc.
 */
const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();

  // Navigation links
  const navigationLinks = (
    <>
      <NavLink to="/">Home</NavLink>
      <NavLink to="/frames">Frames</NavLink>
      <NavLink to="/virtual-try-on">Virtual Try-On</NavLink>
      <NavLink to="/recommendations">Recommendations</NavLink>
    </>
  );

  // Mobile navigation links
  const mobileNavigationLinks = (
    <>
      <MobileNavLink to="/">Home</MobileNavLink>
      <MobileNavLink to="/frames">Frames</MobileNavLink>
      <MobileNavLink to="/virtual-try-on">Virtual Try-On</MobileNavLink>
      <MobileNavLink to="/recommendations">Recommendations</MobileNavLink>
      <MobileNavLink to="/cart">Cart</MobileNavLink>
    </>
  );

  // Header actions
  const headerActions = (
    <>
      <button style={{ padding: '8px 16px', margin: '0 4px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Sign In</button>
      <button style={{ padding: '8px 16px', margin: '0 4px', border: '1px solid #007bff', borderRadius: '4px', background: '#007bff', color: 'white', cursor: 'pointer' }}>Sign Up</button>
    </>
  );

  // Mobile header actions
  const mobileHeaderActions = (
    <>
      <MobileActionButton onClick={() => navigate('/signup')}>
        Sign Up
      </MobileActionButton>
      <MobileActionButton onClick={() => navigate('/login')}>
        Sign In
      </MobileActionButton>
    </>
  );

  return (
    <Suspense fallback={<LoadingComponent />}>
      <LayoutContainer>
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#007bff',
          color: 'white',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>VARAi</h1>
          <nav style={{ display: 'flex', gap: '16px' }}>
            {navigationLinks}
          </nav>
          <div style={{ display: 'flex', gap: '8px' }}>
            {headerActions}
          </div>
        </header>
        
        {/* Add spacing to account for fixed header */}
        <div style={{ height: '64px' }} />
        
        <MainContent>
          {/* Main content - rendered by nested routes */}
          <Outlet />
        </MainContent>
        
        <FooterContainer>
          <div>
            &copy; {new Date().getFullYear()} VARAi. All rights reserved.
          </div>
        </FooterContainer>
      </LayoutContainer>
    </Suspense>
  );
};

export default CustomerLayout;