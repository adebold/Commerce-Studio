import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';

interface Language {
  value: string;
  label: string;
}

interface LanguageSelectorProps {
  languages: Language[];
  currentLanguage: string;
  onChange: (language: string) => void;
}

const SelectorContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const LanguageButton = styled.button`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.spacing[8]} ${theme.spacing.spacing[12]}`};
  background-color: ${({ theme }) => theme.colors.primary[50]};
  border: 1px solid ${({ theme }) => theme.colors.primary[200]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.primary[700]};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[100]};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary[200]};
  }
`;

const LanguageLabel = styled(Typography)`
  margin-right: ${({ theme }) => theme.spacing.spacing[8]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ChevronIcon = styled.span<{ isOpen: boolean }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-left: ${({ theme }) => theme.spacing.spacing[8]};
  
  &::before {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-right: 2px solid ${({ theme }) => theme.colors.primary[500]};
    border-bottom: 2px solid ${({ theme }) => theme.colors.primary[500]};
    transform: ${({ isOpen }) => isOpen ? 'rotate(-135deg)' : 'rotate(45deg)'};
    transition: transform 0.2s ease;
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 100%;
  background-color: ${({ theme }) => theme.colors.common.white};
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.elevation[1]};
  z-index: 10;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  overflow: hidden;
`;

const LanguageOption = styled.button<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.spacing[8]} ${theme.spacing.spacing[12]}`};
  text-align: left;
  background-color: ${({ theme, isSelected }) => 
    isSelected ? theme.colors.primary[50] : theme.colors.common.white
  };
  border: none;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme, isSelected }) => 
    isSelected ? theme.colors.primary[700] : theme.colors.neutral[800]
  };
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[50]};
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[100]};
  }
`;

/**
 * LanguageSelector Component
 * 
 * A dropdown selector for choosing between different SDK languages.
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  currentLanguage,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLanguageObj = languages.find(l => l.value === currentLanguage) || languages[0];
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleLanguageSelect = (language: string) => {
    onChange(language);
    setIsOpen(false);
  };
  
  return (
    <SelectorContainer>
      <LanguageButton onClick={toggleDropdown}>
        <LanguageLabel variant="body2">
          {currentLanguageObj.label}
        </LanguageLabel>
        <ChevronIcon isOpen={isOpen} />
      </LanguageButton>
      
      <DropdownMenu isOpen={isOpen}>
        {languages.map((language) => (
          <LanguageOption
            key={language.value}
            isSelected={language.value === currentLanguage}
            onClick={() => handleLanguageSelect(language.value)}
          >
            {language.label}
          </LanguageOption>
        ))}
      </DropdownMenu>
    </SelectorContainer>
  );
};

export default LanguageSelector;