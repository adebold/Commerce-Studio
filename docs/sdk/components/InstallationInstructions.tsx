import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import { Card } from '../../../frontend/src/design-system/components/Card/Card';
import CodeSnippet from '../../api/components/CodeSnippet';

interface PackageManager {
  id: string;
  name: string;
  command: string;
  language: string;
}

interface InstallationInstructionsProps {
  packageManagers: PackageManager[];
  language: string;
  sdkName: string;
  version?: string;
}

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const Tab = styled.button<{ isActive: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.spacing[8]} ${theme.spacing.spacing[16]}`};
  background-color: transparent;
  border: none;
  border-bottom: 2px solid ${({ theme, isActive }) => 
    isActive ? theme.colors.primary[500] : 'transparent'
  };
  color: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary[700] : theme.colors.neutral[600]
  };
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary[700]};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary[200]};
  }
`;

const InstructionsContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const AdditionalInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
`;

/**
 * InstallationInstructions Component
 * 
 * Displays installation instructions for different package managers.
 */
const InstallationInstructions: React.FC<InstallationInstructionsProps> = ({
  packageManagers,
  language,
  sdkName,
  version = 'latest'
}) => {
  const [activeTab, setActiveTab] = useState(packageManagers[0]?.id || '');
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };
  
  const activePackageManager = packageManagers.find(pm => pm.id === activeTab);
  
  return (
    <InstructionsContainer>
      <Typography variant="h4" gutterBottom>
        Installation
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        Install the {sdkName} SDK using your preferred package manager:
      </Typography>
      
      <TabsContainer>
        {packageManagers.map((pm) => (
          <Tab
            key={pm.id}
            isActive={pm.id === activeTab}
            onClick={() => handleTabChange(pm.id)}
          >
            {pm.name}
          </Tab>
        ))}
      </TabsContainer>
      
      {activePackageManager && (
        <CodeSnippet
          code={activePackageManager.command}
          language={activePackageManager.language}
          showLineNumbers={false}
        />
      )}
      
      <AdditionalInfo>
        <Typography variant="body2" gutterBottom>
          <strong>Requirements:</strong>
        </Typography>
        
        {language === 'javascript' && (
          <>
            <Typography variant="body2" gutterBottom>
              • Node.js 14.x or later
            </Typography>
            <Typography variant="body2">
              • npm 6.x or later (or equivalent package manager)
            </Typography>
          </>
        )}
        
        {language === 'python' && (
          <>
            <Typography variant="body2" gutterBottom>
              • Python 3.7 or later
            </Typography>
            <Typography variant="body2">
              • pip 20.0 or later
            </Typography>
          </>
        )}
        
        {language === 'ruby' && (
          <>
            <Typography variant="body2" gutterBottom>
              • Ruby 2.6 or later
            </Typography>
            <Typography variant="body2">
              • RubyGems 3.0 or later
            </Typography>
          </>
        )}
        
        {language === 'php' && (
          <>
            <Typography variant="body2" gutterBottom>
              • PHP 7.4 or later
            </Typography>
            <Typography variant="body2">
              • Composer 2.0 or later
            </Typography>
          </>
        )}
        
        {language === 'java' && (
          <>
            <Typography variant="body2" gutterBottom>
              • Java 11 or later
            </Typography>
            <Typography variant="body2">
              • Maven 3.6 or later / Gradle 6.0 or later
            </Typography>
          </>
        )}
        
        {language === 'dotnet' && (
          <>
            <Typography variant="body2" gutterBottom>
              • .NET 6.0 or later
            </Typography>
            <Typography variant="body2">
              • NuGet 5.0 or later
            </Typography>
          </>
        )}
      </AdditionalInfo>
    </InstructionsContainer>
  );
};

export default InstallationInstructions;