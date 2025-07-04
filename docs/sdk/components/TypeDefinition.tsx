import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import CodeSnippet from '../../api/components/CodeSnippet';

interface TypeProperty {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

interface TypeDefinitionProps {
  name: string;
  description: string;
  typeDefinition: string;
  properties?: TypeProperty[];
  examples?: {
    code: string;
    language: string;
    description?: string;
  }[];
  notes?: string[];
}

const TypeContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[40]};
`;

const TypeHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const TypeDescription = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const TypeCode = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const SectionTitle = styled(Typography)`
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[12]};
`;

const PropertiesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const TableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  text-align: left;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral[700]};
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[100]};
  vertical-align: top;
`;

const PropertyName = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const PropertyType = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.primary[600]};
`;

const RequiredBadge = styled.span`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[1]} ${theme.spacing.spacing[4]}`};
  margin-left: ${({ theme }) => theme.spacing.spacing[8]};
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  color: ${({ theme }) => theme.colors.neutral[700]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  border-radius: 4px;
`;

const ExamplesContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const Example = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const ExampleDescription = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
`;

const NotesList = styled.ul`
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
  padding-left: ${({ theme }) => theme.spacing.spacing[24]};
`;

const NoteItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
`;

/**
 * TypeDefinition Component
 * 
 * Displays documentation for a type definition in the SDK.
 */
const TypeDefinition: React.FC<TypeDefinitionProps> = ({
  name,
  description,
  typeDefinition,
  properties = [],
  examples = [],
  notes = []
}) => {
  return (
    <TypeContainer id={`type-${name}`}>
      <TypeHeader>
        <Typography variant="h4">
          {name}
        </Typography>
      </TypeHeader>
      
      <TypeDescription>
        <Typography variant="body1">
          {description}
        </Typography>
      </TypeDescription>
      
      <TypeCode>
        <CodeSnippet
          code={typeDefinition}
          language="typescript"
          showLineNumbers={true}
        />
      </TypeCode>
      
      {properties.length > 0 && (
        <>
          <SectionTitle variant="h5">
            Properties
          </SectionTitle>
          
          <PropertiesTable>
            <thead>
              <tr>
                <TableHeader>Name</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Description</TableHeader>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.name}>
                  <TableCell>
                    <PropertyName>{property.name}</PropertyName>
                    {property.required && (
                      <RequiredBadge>Required</RequiredBadge>
                    )}
                  </TableCell>
                  <TableCell>
                    <PropertyType>{property.type}</PropertyType>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {property.description}
                    </Typography>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </PropertiesTable>
        </>
      )}
      
      {examples.length > 0 && (
        <ExamplesContainer>
          <SectionTitle variant="h5">
            Examples
          </SectionTitle>
          
          {examples.map((example, index) => (
            <Example key={index}>
              {example.description && (
                <ExampleDescription>
                  <Typography variant="body2">
                    {example.description}
                  </Typography>
                </ExampleDescription>
              )}
              
              <CodeSnippet
                code={example.code}
                language={example.language}
                showLineNumbers={true}
              />
            </Example>
          ))}
        </ExamplesContainer>
      )}
      
      {notes.length > 0 && (
        <>
          <SectionTitle variant="h5">
            Notes
          </SectionTitle>
          
          <NotesList>
            {notes.map((note, index) => (
              <NoteItem key={index}>
                <Typography variant="body2">
                  {note}
                </Typography>
              </NoteItem>
            ))}
          </NotesList>
        </>
      )}
    </TypeContainer>
  );
};

export default TypeDefinition;