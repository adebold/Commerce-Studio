import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';

interface FAQItem {
  question: string;
  answer: string;
  code?: string;
}

interface TroubleshootingFAQProps {
  title: string;
  description?: string;
  items: FAQItem[];
}

const FAQContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const FAQItemContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  border-radius: 4px;
  overflow: hidden;
`;

const QuestionButton = styled.button<{ isOpen: boolean }>`
  width: 100%;
  text-align: left;
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme, isOpen }) => 
    isOpen ? theme.colors.primary[50] : theme.colors.neutral[50]};
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme, isOpen }) => 
      isOpen ? theme.colors.primary[100] : theme.colors.neutral[100]};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main};
  }
`;

const ExpandIcon = styled.span<{ isOpen: boolean }>`
  display: inline-block;
  width: 24px;
  height: 24px;
  position: relative;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    background-color: ${({ theme }) => theme.colors.neutral[700]};
    transition: transform 0.3s ease;
  }
  
  &::before {
    top: 11px;
    left: 6px;
    width: 12px;
    height: 2px;
  }
  
  &::after {
    top: 6px;
    left: 11px;
    width: 2px;
    height: 12px;
    transform: ${({ isOpen }) => isOpen ? 'scaleY(0)' : 'scaleY(1)'};
  }
`;

const AnswerContainer = styled.div<{ isOpen: boolean }>`
  padding: ${({ theme, isOpen }) => 
    isOpen ? theme.spacing.spacing[16] : '0 16px'};
  max-height: ${({ isOpen }) => isOpen ? '1000px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: white;
`;

const CodeBlock = styled.pre`
  background-color: ${({ theme }) => theme.colors.neutral[800]};
  color: ${({ theme }) => theme.colors.neutral[100]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  border-radius: 4px;
  overflow-x: auto;
  margin: ${({ theme }) => theme.spacing.spacing[16]} 0;
  font-family: 'Courier New', Courier, monospace;
`;

/**
 * TroubleshootingFAQ Component
 * 
 * A component for displaying troubleshooting FAQs with expandable answers.
 */
const TroubleshootingFAQ: React.FC<TroubleshootingFAQProps> = ({ title, description, items }) => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  
  const toggleItem = (index: number) => {
    if (openItems.includes(index)) {
      setOpenItems(openItems.filter(item => item !== index));
    } else {
      setOpenItems([...openItems, index]);
    }
  };
  
  return (
    <FAQContainer>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body1" gutterBottom>
          {description}
        </Typography>
      )}
      
      {items.map((item, index) => {
        const isOpen = openItems.includes(index);
        
        return (
          <FAQItemContainer key={index}>
            <QuestionButton 
              isOpen={isOpen} 
              onClick={() => toggleItem(index)}
              aria-expanded={isOpen}
            >
              <Typography variant="h6" style={{ margin: 0 }}>
                {item.question}
              </Typography>
              <ExpandIcon isOpen={isOpen} />
            </QuestionButton>
            
            <AnswerContainer isOpen={isOpen}>
              <Typography variant="body1">
                {item.answer}
              </Typography>
              
              {item.code && (
                <CodeBlock>
                  {item.code}
                </CodeBlock>
              )}
            </AnswerContainer>
          </FAQItemContainer>
        );
      })}
    </FAQContainer>
  );
};

export default TroubleshootingFAQ;