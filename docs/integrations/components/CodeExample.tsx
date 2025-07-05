import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import { Button } from '../../../frontend/src/design-system/components/Button/Button';

interface CodeTab {
  label: string;
  language: string;
  code: string;
}

interface CodeExampleProps {
  title: string;
  description?: string;
  tabs: CodeTab[];
  defaultTab?: number;
}

const ExampleContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  overflow-x: auto;
`;

const TabButton = styled(Button)<{ isActive: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.spacing[8]} ${theme.spacing.spacing[16]}`};
  border-radius: 0;
  border-bottom: 3px solid ${({ theme, isActive }) => 
    isActive ? theme.colors.primary.main : 'transparent'};
  background-color: transparent;
  color: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary.main : theme.colors.neutral[700]};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
  }
`;

const CodeBlock = styled.pre<{ language: string }>`
  background-color: ${({ theme }) => theme.colors.neutral[800]};
  color: ${({ theme }) => theme.colors.neutral[100]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  position: relative;
  
  &::before {
    content: "${props => props.language}";
    position: absolute;
    top: 0;
    right: 0;
    background-color: ${({ theme }) => theme.colors.neutral[700]};
    color: ${({ theme }) => theme.colors.neutral[100]};
    padding: ${({ theme }) => `${theme.spacing.spacing[4]} ${theme.spacing.spacing[8]}`};
    font-size: 12px;
    border-bottom-left-radius: 4px;
  }
`;

const CopyButton = styled(Button)`
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  font-size: 12px;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

/**
 * CodeExample Component
 * 
 * A component for displaying code examples with tabs for different languages or implementations.
 */
const CodeExample: React.FC<CodeExampleProps> = ({ title, description, tabs, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(tabs[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <ExampleContainer>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body1" gutterBottom>
          {description}
        </Typography>
      )}
      
      <TabsContainer>
        {tabs.map((tab, index) => (
          <TabButton
            key={index}
            isActive={activeTab === index}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsContainer>
      
      <div style={{ position: 'relative' }}>
        <CodeBlock language={tabs[activeTab].language}>
          {tabs[activeTab].code}
        </CodeBlock>
        
        <CopyButton variant="secondary" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </CopyButton>
      </div>
    </ExampleContainer>
  );
};

export default CodeExample;