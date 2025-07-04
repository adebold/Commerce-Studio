import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import CodeSnippet from '../../api/components/CodeSnippet';

interface CodeExampleProps {
  title: string;
  description?: string;
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

const ExampleContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const ExampleHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const ExampleDescription = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

/**
 * CodeExample Component
 * 
 * Displays a code example with a title, description, and syntax-highlighted code.
 */
const CodeExample: React.FC<CodeExampleProps> = ({
  title,
  description,
  code,
  language,
  showLineNumbers = true
}) => {
  return (
    <ExampleContainer>
      <ExampleHeader>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
      </ExampleHeader>
      
      {description && (
        <ExampleDescription>
          <Typography variant="body1">
            {description}
          </Typography>
        </ExampleDescription>
      )}
      
      <CodeSnippet
        code={code}
        language={language}
        showLineNumbers={showLineNumbers}
      />
    </ExampleContainer>
  );
};

export default CodeExample;