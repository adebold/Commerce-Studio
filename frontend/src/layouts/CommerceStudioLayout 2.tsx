import React, { Suspense } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAuth } from '../components/auth/AuthProvider';
import { 
  Sidebar, 
  Header, 
  Typography, 
  Button 
} from '../design-system';

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
    <Typography variant="body1">Loading...</Typography>
  </LoadingContainer>
);

/**
 * Styled components for layout
 */
const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 250px; /* Match sidebar width */
  
  @media (max-width: 960px) {
    margin-left: 0;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.spacing[24]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
`;

const FooterContainer = styled.footer`
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  text-align: center;
  border-top: 1px solid ${({ theme }) => theme.colors.neutral[200]};
`;

const NavItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
`;

const NavLink = styled(Link)`
  display: block;
  padding: ${({ theme }) => `${theme.spacing.spacing[12]} ${theme.spacing.spacing[16]}`};
  color: ${({ theme }) => theme.colors.neutral[800]};
  text-decoration: none;
  border-radius: 4px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[50]};
    color: ${({ theme }) => theme.colors.primary[700]};
  }
  
  &.active {
    background-color: ${({ theme }) => theme.colors.primary[100]};
    color: ${({ theme }) => theme.colors.primary[700]};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.spacing[12]};
`;

const RoleBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.primary[100]};
  color: ${({ theme }) => theme.colors.primary[700]};
  padding: ${({ theme }) => `${theme.spacing.spacing[4]} ${theme.spacing.spacing[8]}`};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

/**
 * Layout component for Commerce Studio (admin) pages
 * This includes the admin sidebar, header, and content area
 */
const CommerceStudioLayout: React.FC = () => {
  const { userContext, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/auth');
  };

  // Sidebar navigation items
  const renderNavigation = () => (
    <nav>
      <NavItem>
        <NavLink to="/admin/dashboard">Dashboard</NavLink>
      </NavItem>
      <NavItem>
        <NavLink to="/admin/analytics">Analytics</NavLink>
      </NavItem>
      <NavItem>
        <NavLink to="/admin/home">Home</NavLink>
      </NavItem>
      <NavItem>
        <NavLink to="/admin/products">Products</NavLink>
      </NavItem>
      <NavItem>
        <NavLink to="/admin/sku-genie">SKU Genie</NavLink>
      </NavItem>
      <NavItem>
        <NavLink to="/admin/integrations">Integrations</NavLink>
      </NavItem>
      <NavItem>
        <NavLink to="/admin/solutions">Solutions</NavLink>
      </NavItem>
      <NavItem>
        <NavLink to="/admin/ai-technology">AI Technology</NavLink>
      </NavItem>
      <NavItem>
        <NavLink to="/admin/api-documentation">API Documentation</NavLink>
      </NavItem>
      <NavItem>
        <NavLink to="/admin/settings">Settings</NavLink>
      </NavItem>
    </nav>
  );

  // User information and logout button
  const renderUserInfo = () => (
    userContext && (
      <UserInfo>
        <Typography variant="body2">{userContext.email}</Typography>
        <RoleBadge>{userContext.role}</RoleBadge>
        <Button 
          variant="tertiary" 
          size="small" 
          onClick={handleLogout}
        >
          Logout
        </Button>
      </UserInfo>
    )
  );

  return (
    <Suspense fallback={<LoadingComponent />}>
      <LayoutContainer>
        <Sidebar
          variant="light"
          position="left"
          fixed
          elevated
          header={
            <Typography variant="h5" gutterBottom>
              Commerce Studio
            </Typography>
          }
        >
          {renderNavigation()}
        </Sidebar>
        
        <ContentContainer>
          <Header 
            variant="secondary"
            elevated
            actions={renderUserInfo()}
          />
          
          <MainContent>
            {/* Main content - rendered by nested routes */}
            <Outlet />
          </MainContent>
          
          <FooterContainer>
            <Typography variant="body2">
              &copy; {new Date().getFullYear()} VARAi Commerce Studio. All rights reserved.
            </Typography>
          </FooterContainer>
        </ContentContainer>
      </LayoutContainer>
    </Suspense>
  );
};

export default CommerceStudioLayout;