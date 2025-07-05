import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';

interface SearchResult {
  id: string;
  title: string;
  section: string;
  url: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (results: SearchResult[]) => void;
  searchIndex?: SearchResult[];
}

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.spacing[12]} ${theme.spacing.spacing[16]}`};
  padding-left: ${({ theme }) => theme.spacing.spacing[40]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[400]};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[100]};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing.spacing[16]};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.neutral[500]};
  
  /* Simple search icon using ::before and ::after */
  width: 14px;
  height: 14px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 10px;
    height: 10px;
    border: 2px solid currentColor;
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 10px;
    left: 10px;
    width: 2px;
    height: 6px;
    background-color: currentColor;
    transform: rotate(45deg);
    transform-origin: 0 0;
  }
`;

const ResultsDropdown = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 400px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.common.white};
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.elevation[2]};
  z-index: 10;
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
`;

const ResultItem = styled.a`
  display: block;
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  text-decoration: none;
  color: ${({ theme }) => theme.colors.neutral[900]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[100]};
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[50]};
  }
`;

const ResultTitle = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[4]};
`;

const ResultSection = styled(Typography)`
  color: ${({ theme }) => theme.colors.neutral[600]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const NoResults = styled.div`
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  text-align: center;
  color: ${({ theme }) => theme.colors.neutral[600]};
`;

/**
 * SearchBar Component
 * 
 * A search bar for finding content within the API documentation.
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search API documentation...',
  onSearch,
  searchIndex = []
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setIsDropdownVisible(false);
      return;
    }

    const searchResults = searchIndex.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.section.toLowerCase().includes(query.toLowerCase())
    );

    setResults(searchResults);
    setIsDropdownVisible(true);

    if (onSearch) {
      onSearch(searchResults);
    }
  }, [query, searchIndex, onSearch]);

  return (
    <SearchContainer ref={searchContainerRef}>
      <SearchInputWrapper>
        <SearchIcon />
        <SearchInput
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() !== '' && setIsDropdownVisible(true)}
        />
      </SearchInputWrapper>
      
      <ResultsDropdown isVisible={isDropdownVisible}>
        {results.length > 0 ? (
          results.map((result, index) => (
            <ResultItem key={index} href={result.url}>
              <ResultTitle variant="body1">{result.title}</ResultTitle>
              <ResultSection variant="caption">{result.section}</ResultSection>
            </ResultItem>
          ))
        ) : (
          query.trim() !== '' && (
            <NoResults>
              <Typography variant="body2">No results found</Typography>
            </NoResults>
          )
        )}
      </ResultsDropdown>
    </SearchContainer>
  );
};

export default SearchBar;