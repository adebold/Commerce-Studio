import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { GridContainer, GridItem } from '../../frontend/src/design-system/components/Layout/ResponsiveGrid';
import { Typography } from '../../frontend/src/design-system/components/Typography/Typography';
import { Card } from '../../frontend/src/design-system/components/Card/Card';
import { Button } from '../../frontend/src/design-system/components/Button/Button';
import { 
  SearchBar, 
  TableOfContents, 
  SdkVersionSelector,
  LanguageSelector,
  InstallationInstructions,
  CodeExample,
  MethodReference,
  ClassReference,
  TypeDefinition
} from './components';

import {
  JavaScriptSDK,
  PythonSDK,
  RubySDK,
  PhpSDK,
  JavaSDK,
  DotNetSDK
} from './sections';

// Define the available SDK versions
const SDK_VERSIONS = [
  { value: 'v1', label: 'SDK v1.0.0', isLatest: true },
  { value: 'v0.9', label: 'SDK v0.9.0' },
  { value: 'v0.8', label: 'SDK v0.8.0 (Legacy)' },
];

// Define the available SDK languages
const SDK_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript/TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'java', label: 'Java' },
  { value: 'dotnet', label: '.NET' },
];

// Define the table of contents items
const TOC_ITEMS = {
  javascript: [
    {
      id: 'js-installation',
      title: 'Installation',
      level: 1,
      children: [
        { id: 'js-npm-install', title: 'NPM' },
        { id: 'js-yarn-install', title: 'Yarn' },
        { id: 'js-cdn-install', title: 'CDN' },
      ],
    },
    {
      id: 'js-quickstart',
      title: 'Quick Start',
      level: 1,
      children: [
        { id: 'js-authentication', title: 'Authentication' },
        { id: 'js-first-request', title: 'Making Your First Request' },
      ],
    },
    {
      id: 'js-core-concepts',
      title: 'Core Concepts',
      level: 1,
      children: [
        { id: 'js-client', title: 'Client' },
        { id: 'js-frames', title: 'Frames' },
        { id: 'js-recommendations', title: 'Recommendations' },
        { id: 'js-users', title: 'Users' },
      ],
    },
    {
      id: 'js-api-reference',
      title: 'API Reference',
      level: 1,
      children: [
        { id: 'js-client-class', title: 'VaraiClient' },
        { id: 'js-frames-class', title: 'Frames' },
        { id: 'js-recommendations-class', title: 'Recommendations' },
        { id: 'js-users-class', title: 'Users' },
      ],
    },
    {
      id: 'js-examples',
      title: 'Code Examples',
      level: 1,
      children: [
        { id: 'js-example-frames', title: 'Working with Frames' },
        { id: 'js-example-recommendations', title: 'Getting Recommendations' },
        { id: 'js-example-users', title: 'Managing Users' },
      ],
    },
    {
      id: 'js-error-handling',
      title: 'Error Handling',
      level: 1,
      children: [
        { id: 'js-error-types', title: 'Error Types' },
        { id: 'js-error-handling', title: 'Handling Errors' },
      ],
    },
    {
      id: 'js-advanced',
      title: 'Advanced Usage',
      level: 1,
      children: [
        { id: 'js-advanced-config', title: 'Advanced Configuration' },
        { id: 'js-webhooks', title: 'Working with Webhooks' },
        { id: 'js-pagination', title: 'Pagination' },
      ],
    },
    {
      id: 'js-migration',
      title: 'Migration Guides',
      level: 1,
      children: [
        { id: 'js-migrate-v0-to-v1', title: 'Migrating from v0.x to v1.0' },
      ],
    },
    {
      id: 'js-changelog',
      title: 'Changelog',
      level: 1,
    },
  ],
  python: [
    {
      id: 'py-installation',
      title: 'Installation',
      level: 1,
      children: [
        { id: 'py-pip-install', title: 'Pip' },
        { id: 'py-poetry-install', title: 'Poetry' },
      ],
    },
    {
      id: 'py-quickstart',
      title: 'Quick Start',
      level: 1,
      children: [
        { id: 'py-authentication', title: 'Authentication' },
        { id: 'py-first-request', title: 'Making Your First Request' },
      ],
    },
    {
      id: 'py-core-concepts',
      title: 'Core Concepts',
      level: 1,
      children: [
        { id: 'py-client', title: 'Client' },
        { id: 'py-frames', title: 'Frames' },
        { id: 'py-recommendations', title: 'Recommendations' },
        { id: 'py-users', title: 'Users' },
      ],
    },
    {
      id: 'py-api-reference',
      title: 'API Reference',
      level: 1,
      children: [
        { id: 'py-client-class', title: 'VaraiClient' },
        { id: 'py-frames-class', title: 'Frames' },
        { id: 'py-recommendations-class', title: 'Recommendations' },
        { id: 'py-users-class', title: 'Users' },
      ],
    },
    {
      id: 'py-examples',
      title: 'Code Examples',
      level: 1,
      children: [
        { id: 'py-example-frames', title: 'Working with Frames' },
        { id: 'py-example-recommendations', title: 'Getting Recommendations' },
        { id: 'py-example-users', title: 'Managing Users' },
      ],
    },
    {
      id: 'py-error-handling',
      title: 'Error Handling',
      level: 1,
      children: [
        { id: 'py-error-types', title: 'Error Types' },
        { id: 'py-error-handling', title: 'Handling Errors' },
      ],
    },
    {
      id: 'py-advanced',
      title: 'Advanced Usage',
      level: 1,
      children: [
        { id: 'py-advanced-config', title: 'Advanced Configuration' },
        { id: 'py-webhooks', title: 'Working with Webhooks' },
        { id: 'py-pagination', title: 'Pagination' },
      ],
    },
    {
      id: 'py-migration',
      title: 'Migration Guides',
      level: 1,
      children: [
        { id: 'py-migrate-v0-to-v1', title: 'Migrating from v0.x to v1.0' },
      ],
    },
    {
      id: 'py-changelog',
      title: 'Changelog',
      level: 1,
    },
  ],
  ruby: [
    {
      id: 'rb-installation',
      title: 'Installation',
      level: 1,
      children: [
        { id: 'rb-gem-install', title: 'Gem' },
        { id: 'rb-bundler-install', title: 'Bundler' },
      ],
    },
    // Similar structure as JavaScript and Python
  ],
  php: [
    {
      id: 'php-installation',
      title: 'Installation',
      level: 1,
      children: [
        { id: 'php-composer-install', title: 'Composer' },
      ],
    },
    // Similar structure as JavaScript and Python
  ],
  java: [
    {
      id: 'java-installation',
      title: 'Installation',
      level: 1,
      children: [
        { id: 'java-maven-install', title: 'Maven' },
        { id: 'java-gradle-install', title: 'Gradle' },
      ],
    },
    // Similar structure as JavaScript and Python
  ],
  dotnet: [
    {
      id: 'dotnet-installation',
      title: 'Installation',
      level: 1,
      children: [
        { id: 'dotnet-nuget-install', title: 'NuGet' },
        { id: 'dotnet-cli-install', title: '.NET CLI' },
      ],
    },
    // Similar structure as JavaScript and Python
  ],
};

// Mock search index for the SearchBar component
const SEARCH_INDEX = [
  { id: 'js-installation', title: 'JavaScript Installation', section: 'JavaScript', url: '#js-installation' },
  { id: 'js-client-class', title: 'JavaScript VaraiClient', section: 'JavaScript API Reference', url: '#js-client-class' },
  { id: 'py-installation', title: 'Python Installation', section: 'Python', url: '#py-installation' },
  { id: 'py-client-class', title: 'Python VaraiClient', section: 'Python API Reference', url: '#py-client-class' },
  // Add more search items for each SDK
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
 * SdkDocumentation Component
 * 
 * The main component for the VARAi SDK documentation site.
 */
const SdkDocumentation: React.FC = () => {
  const [activeVersion, setActiveVersion] = useState(SDK_VERSIONS[0].value);
  const [activeLanguage, setActiveLanguage] = useState(SDK_LANGUAGES[0].value);
  const [activeSection, setActiveSection] = useState(`${activeLanguage}-installation`);
  
  // Handle version change
  const handleVersionChange = (version: string) => {
    setActiveVersion(version);
  };
  
  // Handle language change
  const handleLanguageChange = (language: string) => {
    setActiveLanguage(language);
    setActiveSection(`${language}-installation`);
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
  
  // Render the active SDK documentation based on the selected language
  const renderSdkContent = () => {
    switch (activeLanguage) {
      case 'javascript':
        return <JavaScriptSDK version={activeVersion} />;
      case 'python':
        return <PythonSDK version={activeVersion} />;
      case 'ruby':
        return <RubySDK version={activeVersion} />;
      case 'php':
        return <PhpSDK version={activeVersion} />;
      case 'java':
        return <JavaSDK version={activeVersion} />;
      case 'dotnet':
        return <DotNetSDK version={activeVersion} />;
      default:
        return <JavaScriptSDK version={activeVersion} />;
    }
  };
  
  return (
    <PageContainer>
      <Header>
        <Typography variant="h1" gutterBottom>
          VARAi SDK Documentation
        </Typography>
        
        <Typography variant="h5" gutterBottom color="neutral.600">
          Integrate VARAi's powerful eyewear AI with your applications using our client libraries
        </Typography>
        
        <HeaderActions>
          <SearchBar
            placeholder="Search SDK documentation..."
            searchIndex={SEARCH_INDEX}
          />
          
          <LanguageSelector
            languages={SDK_LANGUAGES}
            currentLanguage={activeLanguage}
            onChange={handleLanguageChange}
          />
          
          <SdkVersionSelector
            versions={SDK_VERSIONS}
            currentVersion={activeVersion}
            onChange={handleVersionChange}
          />
          
          <Button
            variant="primary"
            onClick={() => window.location.href = '/docs/api'}
          >
            View API Docs
          </Button>
        </HeaderActions>
      </Header>
      
      <MainContent>
        <GridContainer spacing="large">
          <GridItem xs={12} md={3}>
            <Sidebar>
              <TableOfContents
                items={TOC_ITEMS[activeLanguage]}
                activeId={activeSection}
                onItemClick={handleTocItemClick}
              />
            </Sidebar>
          </GridItem>
          
          <GridItem xs={12} md={9}>
            <ContentArea>
              <Card variant="outlined">
                <Card.Content>
                  {renderSdkContent()}
                </Card.Content>
              </Card>
            </ContentArea>
          </GridItem>
        </GridContainer>
      </MainContent>
    </PageContainer>
  );
};

export default SdkDocumentation;