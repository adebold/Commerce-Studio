import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import { Card } from '../../../frontend/src/design-system/components/Card/Card';
import CodeSnippet from '../../api/components/CodeSnippet';
import MethodReference from './MethodReference';

interface Property {
  name: string;
  type: string;
  description: string;
  defaultValue?: string;
  readonly?: boolean;
}

interface Method {
  name: string;
  signature: string;
  description: string;
  parameters?: {
    name: string;
    type: string;
    description: string;
    required?: boolean;
    defaultValue?: string;
  }[];
  returnType?: {
    type: string;
    description: string;
  };
  examples?: {
    code: string;
    language: string;
    description?: string;
  }[];
  throws?: string[];
  notes?: string[];
  deprecated?: boolean;
  deprecationMessage?: string;
}

interface ClassReferenceProps {
  name: string;
  description: string;
  properties?: Property[];
  methods?: Method[];
  examples?: {
    code: string;
    language: string;
    description?: string;
  }[];
  notes?: string[];
  deprecated?: boolean;
  deprecationMessage?: string;
}

const ClassContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[48]};
`;

const ClassHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const ClassName = styled(Typography)`
  margin-right: ${({ theme }) => theme.spacing.spacing[12]};
`;

const DeprecatedBadge = styled.span`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[2]} ${theme.spacing.spacing[6]}`};
  background-color: ${({ theme }) => theme.colors.semantic.error.light};
  color: ${({ theme }) => theme.colors.semantic.error.dark};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: 4px;
`;

const ClassDescription = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const SectionTitle = styled(Typography)`
  margin-top: ${({ theme }) => theme.spacing.spacing[32]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  padding-bottom: ${({ theme }) => theme.spacing.spacing[8]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
`;

const PropertiesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
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

const ReadonlyBadge = styled.span`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[1]} ${theme.spacing.spacing[4]}`};
  margin-left: ${({ theme }) => theme.spacing.spacing[8]};
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  color: ${({ theme }) => theme.colors.neutral[700]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  border-radius: 4px;
`;

const DefaultValue = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral[600]};
`;

const MethodsContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const ExamplesContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
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

const DeprecationWarning = styled.div`
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
  background-color: ${({ theme }) => theme.colors.semantic.error.light};
  border-left: 4px solid ${({ theme }) => theme.colors.semantic.error.main};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
`;

/**
 * ClassReference Component
 * 
 * Displays documentation for a class in the SDK.
 */
const ClassReference: React.FC<ClassReferenceProps> = ({
  name,
  description,
  properties = [],
  methods = [],
  examples = [],
  notes = [],
  deprecated = false,
  deprecationMessage
}) => {
  return (
    <ClassContainer id={`class-${name}`}>
      <ClassHeader>
        <ClassName variant="h3">
          {name}
        </ClassName>
        
        {deprecated && (
          <DeprecatedBadge>Deprecated</DeprecatedBadge>
        )}
      </ClassHeader>
      
      {deprecated && deprecationMessage && (
        <DeprecationWarning>
          <Typography variant="body2">
            <strong>Deprecation Notice:</strong> {deprecationMessage}
          </Typography>
        </DeprecationWarning>
      )}
      
      <ClassDescription>
        <Typography variant="body1">
          {description}
        </Typography>
      </ClassDescription>
      
      {properties.length > 0 && (
        <>
          <SectionTitle variant="h4">
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
                    {property.readonly && (
                      <ReadonlyBadge>readonly</ReadonlyBadge>
                    )}
                  </TableCell>
                  <TableCell>
                    <PropertyType>{property.type}</PropertyType>
                    {property.defaultValue && (
                      <div>
                        <DefaultValue>Default: {property.defaultValue}</DefaultValue>
                      </div>
                    )}
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
      
      {methods.length > 0 && (
        <MethodsContainer>
          <SectionTitle variant="h4">
            Methods
          </SectionTitle>
          
          {methods.map((method) => (
            <MethodReference
              key={method.name}
              name={method.name}
              signature={method.signature}
              description={method.description}
              parameters={method.parameters}
              returnType={method.returnType}
              examples={method.examples}
              throws={method.throws}
              notes={method.notes}
              deprecated={method.deprecated}
              deprecationMessage={method.deprecationMessage}
            />
          ))}
        </MethodsContainer>
      )}
      
      {examples.length > 0 && (
        <ExamplesContainer>
          <SectionTitle variant="h4">
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
          <SectionTitle variant="h4">
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
    </ClassContainer>
  );
};

export default ClassReference;