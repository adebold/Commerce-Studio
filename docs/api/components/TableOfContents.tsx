import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';

interface TableOfContentsProps {
  items: Array<{
    id: string;
    title: string;
    level: number;
    children?: Array<{
      id: string;
      title: string;
    }>;
  }>;
  activeId?: string;
  onItemClick?: (id: string) => void;
}

const TOCContainer = styled.div`
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
`;

const TOCTitle = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
`;

const TOCList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TOCItem = styled.li<{ level: number; isActive: boolean }>`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
  padding-left: ${({ level, theme }) => (level - 1) * parseInt(theme.spacing.spacing[16]) + 'px'};
`;

const TOCLink = styled.a<{ isActive: boolean }>`
  display: block;
  padding: ${({ theme }) => `${theme.spacing.spacing[8]} ${theme.spacing.spacing[12]}`};
  color: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary[700] : theme.colors.neutral[800]
  };
  font-weight: ${({ theme, isActive }) => 
    isActive ? theme.typography.fontWeight.semiBold : theme.typography.fontWeight.regular
  };
  text-decoration: none;
  border-left: 3px solid ${({ theme, isActive }) => 
    isActive ? theme.colors.primary[500] : 'transparent'
  };
  background-color: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary[50] : 'transparent'
  };
  border-radius: 0 4px 4px 0;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary[600]};
    background-color: ${({ theme }) => theme.colors.primary[50]};
    border-left-color: ${({ theme, isActive }) => 
      isActive ? theme.colors.primary[500] : theme.colors.primary[300]
    };
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  border-radius: 4px;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[400]};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary[100]};
  }
`;

/**
 * TableOfContents Component
 * 
 * Displays a table of contents for navigating through documentation sections.
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  activeId,
  onItemClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(items);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = items.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const childrenMatch = item.children?.some(child => 
        child.title.toLowerCase().includes(query)
      );
      return titleMatch || childrenMatch;
    });

    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const handleItemClick = (id: string) => {
    if (onItemClick) {
      onItemClick(id);
    }
  };

  return (
    <TOCContainer>
      <TOCTitle variant="h6">Contents</TOCTitle>
      
      <SearchInput
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      <TOCList>
        {filteredItems.map(item => (
          <React.Fragment key={item.id}>
            <TOCItem level={item.level} isActive={activeId === item.id}>
              <TOCLink
                href={`#${item.id}`}
                isActive={activeId === item.id}
                onClick={(e) => {
                  e.preventDefault();
                  handleItemClick(item.id);
                }}
              >
                {item.title}
              </TOCLink>
            </TOCItem>
            
            {item.children && item.children.map(child => (
              <TOCItem key={child.id} level={item.level + 1} isActive={activeId === child.id}>
                <TOCLink
                  href={`#${child.id}`}
                  isActive={activeId === child.id}
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick(child.id);
                  }}
                >
                  {child.title}
                </TOCLink>
              </TOCItem>
            ))}
          </React.Fragment>
        ))}
      </TOCList>
    </TOCContainer>
  );
};

export default TableOfContents;