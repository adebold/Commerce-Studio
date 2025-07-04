import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { GridContainer, GridItem } from '../../frontend/src/design-system/components/Layout/ResponsiveGrid';
import { Typography } from '../../frontend/src/design-system/components/Typography/Typography';
import { Card } from '../../frontend/src/design-system/components/Card/Card';
import { Button } from '../../frontend/src/design-system/components/Button/Button';
import { 
  SearchBar, 
  TableOfContents, 
  VersionSelector 
} from './components';
import {
  GettingStarted,
  Authentication,
  ApiReference,
  ErrorHandling,
  RateLimiting,
  Webhooks
} from './sections';

// Define the available API versions
const API_VERSIONS = [
  { value: 'v1', label: 'API v1', isLatest: true },
  { value: 'v0', label: 'API v0 (Legacy)' },
];

// Define the table of contents items
const TOC_ITEMS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    level: 1,
    children: [
      { id: 'create-account', title: 'Create a VARAi Account' },
      { id: 'generate-api-key', title: 'Generate an API Key' },
      { id: 'first-request', title: 'Make Your First API Request' },
      { id: 'explore-api', title: 'Explore the API' },
    ],
  },
  {
    id: 'authentication',
    title: 'Authentication',
    level: 1,
    children: [
      { id: 'api-key-auth', title: 'API Key Authentication' },
      { id: 'auth-errors', title: 'Authentication Errors' },
      { id: 'api-key-management', title: 'API Key Management' },
      { id: 'oauth-auth', title: 'OAuth Authentication' },
      { id: 'api-key-permissions', title: 'API Key Permissions' },
    ],
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    level: 1,
    children: [
      { id: 'frames-api', title: 'Frames API' },
      { id: 'recommendations-api', title: 'Recommendations API' },
      { id: 'users-api', title: 'Users API' },
    ],
  },
  {
    id: 'error-handling',
    title: 'Error Handling',
    level: 1,
    children: [
      { id: 'error-format', title: 'Error Response Format' },
      { id: 'http-status-codes', title: 'HTTP Status Codes' },
      { id: 'common-errors', title: 'Common Error Codes' },
      { id: 'error-examples', title: 'Error Handling Examples' },
      { id: 'error-best-practices', title: 'Best Practices' },
    ],
  },
  {
    id: 'rate-limiting',
    title: 'Rate Limiting',
    level: 1,
    children: [
      { id: 'rate-limit-headers', title: 'Rate Limit Headers' },
      { id: 'rate-limit-tiers', title: 'Rate Limit Tiers' },
      { id: 'endpoint-limits', title: 'Endpoint-Specific Limits' },
      { id: 'handling-rate-limits', title: 'Handling Rate Limiting' },
    ],
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    level: 1,
    children: [
      { id: 'webhook-events', title: 'Webhook Events' },
      { id: 'webhook-payload', title: 'Webhook Payload' },
      { id: 'webhook-security', title: 'Webhook Security' },
      { id: 'managing-webhooks', title: 'Managing Webhooks' },
      { id: 'webhook-best-practices', title: 'Best Practices' },
    ],
  },
];

// Mock search index for the SearchBar component
const SEARCH_INDEX = [
  { id: 'api-key-auth', title: 'API Key Authentication', section: 'Authentication', url: '#api-key-auth' },
  { id: 'frames-api', title: 'Frames API', section: 'API Reference', url: '#frames-api' },
  { id: 'recommendations-api', title: 'Recommendations API', section: 'API Reference', url: '#recommendations-api' },
  { id: 'users-api', title: 'Users API', section: 'API Reference', url: '#users-api' },
  { id: 'error-format', title: 'Error Response Format', section: 'Error Handling', url: '#error-format' },
  { id: 'rate-limit-headers', title: 'Rate Limit Headers', section: 'Rate Limiting', url: '#rate-limit-headers' },
  { id: 'webhook-events', title: 'Webhook Events', section: 'Webhooks', url: '#webhook-events' },
];

// Styled components
const PageContainer = styled.div`
  padding: ${({ theme }) => `${theme.spacing.spacing[32]} 0`};
  max-width: 1440px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[48]};
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const MainContent = styled.main`
  margin-top: ${({ theme }) => theme.spacing.spacing[32]};
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 20px;
  height: calc(100vh - 40px);
  overflow-y: auto;
`;

const ContentArea = styled.div`
  min-height: 800px;
`;

/**
 * ApiDocumentation Component
 * 
 * The main component for the VARAi API documentation site.
 */
const ApiDocumentation: React.FC = () => {
  const [activeVersion, setActiveVersion] = useState(API_VERSIONS[0].value);
  const [activeSection, setActiveSection] = useState('getting-started');
  
  // Handle version change
  const handleVersionChange = (version: string) => {
    setActiveVersion(version);
  };
  
  // Handle TOC item click
  const handleTocItemClick = (id: string) => {
    setActiveSection(id);
    // Scroll to the section
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[id]');
      let currentSection = '';
      
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        
        if (sectionTop < 100) {
          currentSection = section.id;
        }
      });
      
      if (currentSection !== activeSection && currentSection) {
        setActiveSection(currentSection);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeSection]);
  
  return (
    <PageContainer>
      <Header>
        <Typography variant="h1" gutterBottom>
          VARAi API Documentation
        </Typography>
        
        <Typography variant="h5" gutterBottom color="neutral.600">
          Integrate VARAi's powerful eyewear AI with your applications
        </Typography>
        
        <HeaderActions>
          <SearchBar
            placeholder="Search API documentation..."
            searchIndex={SEARCH_INDEX}
          />
          
          <VersionSelector
            versions={API_VERSIONS}
            currentVersion={activeVersion}
            onChange={handleVersionChange}
          />
          
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/docs/sdk'}
            style={{ marginRight: '8px' }}
          >
            View SDK Docs
          </Button>
          
          <Button
            variant="primary"
            onClick={() => window.location.href = '/docs/explorer'}
          >
            Try API Explorer
          </Button>
        </HeaderActions>
      </Header>
      
      <MainContent>
        <GridContainer spacing="large">
          <GridItem xs={12} md={3}>
            <Sidebar>
              <TableOfContents
                items={TOC_ITEMS}
                activeId={activeSection}
                onItemClick={handleTocItemClick}
              />
            </Sidebar>
          </GridItem>
          
          <GridItem xs={12} md={9}>
            <ContentArea>
              <Card variant="outlined">
                <Card.Content>
                  <GettingStarted />
                  <Authentication />
                  <ApiReference />
                  <ErrorHandling />
                  <RateLimiting />
                  <Webhooks />
                </Card.Content>
              </Card>
            </ContentArea>
          </GridItem>
        </GridContainer>
      </MainContent>
    </PageContainer>
  );
};

export default ApiDocumentation;