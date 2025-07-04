import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Card } from '../../../frontend/src/design-system/components/Card/Card';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import { Button } from '../../../frontend/src/design-system/components/Button/Button';

interface CodeSnippetProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

const CodeContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const LanguageLabel = styled.div`
  position: absolute;
  top: 12px;
  right: 60px;
  z-index: 5;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.neutral[800]};
  color: ${({ theme }) => theme.colors.common.white};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
`;

const CopyButton = styled(Button)`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
  min-width: 0;
  padding: 4px;
`;

const Pre = styled.pre`
  margin: 0;
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  overflow-x: auto;
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.5;
  background-color: ${({ theme }) => theme.colors.neutral[900]};
  color: ${({ theme }) => theme.colors.neutral[100]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
`;

const Code = styled.code`
  font-family: inherit;
`;

const LineNumber = styled.span`
  display: inline-block;
  width: 2em;
  padding-right: ${({ theme }) => theme.spacing.spacing[8]};
  text-align: right;
  color: ${({ theme }) => theme.colors.neutral[500]};
  user-select: none;
`;

/**
 * CodeSnippet Component
 * 
 * Displays code with syntax highlighting and a copy button.
 */
export const CodeSnippet: React.FC<CodeSnippetProps> = ({ 
  code, 
  language, 
  showLineNumbers = false 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderCode = () => {
    if (!showLineNumbers) {
      return <Code>{code}</Code>;
    }

    return code.split('\n').map((line, index) => (
      <div key={index}>
        <LineNumber>{index + 1}</LineNumber>
        <Code>{line}</Code>
      </div>
    ));
  };

  return (
    <CodeContainer>
      <LanguageLabel>{language}</LanguageLabel>
      <CopyButton 
        variant="tertiary" 
        size="small" 
        onClick={handleCopy}
      >
        {copied ? 'Copied!' : 'Copy'}
      </CopyButton>
      <Pre>
        {renderCode()}
      </Pre>
    </CodeContainer>
  );
};

export default CodeSnippet;