import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import MainDashboard from '../dashboard/MainDashboard';
import RecommendationManagement from './RecommendationManagement';

export type AdminSection = 'dashboard' | 'stores' | 'analytics' | 'orders' | 'customers' | 'recommendations' | 'settings';

interface AdminRouterProps {
  initialSection?: AdminSection;
}

const AdminRouter: React.FC<AdminRouterProps> = ({ initialSection = 'dashboard' }) => {
  const [currentSection, setCurrentSection] = useState<AdminSection>(initialSection);

  const handleSectionChange = useCallback((section: AdminSection) => {
    setCurrentSection(section);
  }, []);

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <MainDashboard onNavigate={handleSectionChange} />;
      case 'recommendations':
        return <RecommendationManagement />;
      case 'stores':
        return <div>Stores Management - Coming Soon</div>;
      case 'analytics':
        return <div>Analytics Dashboard - Coming Soon</div>;
      case 'orders':
        return <div>Orders Management - Coming Soon</div>;
      case 'customers':
        return <div>Customer Management - Coming Soon</div>;
      case 'settings':
        return <div>Settings - Coming Soon</div>;
      default:
        return <MainDashboard onNavigate={handleSectionChange} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {renderCurrentSection()}
    </Box>
  );
};

export default AdminRouter;