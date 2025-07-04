import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import { Card } from '../../../frontend/src/design-system/components/Card/Card';
import CodeSnippet from '../../api/components/CodeSnippet';

interface Parameter {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  defaultValue?: string;
}

interface ReturnType {
  type: string;
  description: string;
}

interface Example {
  code: string;
  language: string;
  description?: string;
}

interface MethodReferenceProps {
  name: string;
  signature: string;
  description: string;
  parameters?: Parameter[];
  returnType?: ReturnType;
  examples?: Example[];
  throws?: string[];
  notes?: string[];
  deprecated?: boolean;
  deprecationMessage?: string;
}

const MethodContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[40]};
`;

const MethodHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const MethodName = styled(Typography)`
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

const MethodSignature = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const MethodDescription = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const SectionTitle = styled(Typography)`
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[12]};
`;

const ParametersTable = styled.table`
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

const ParameterName = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ParameterType = styled.span`
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

const DefaultValue = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral[600]};
`;

const ReturnTypeContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
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

const ThrowsList = styled.ul`
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
  padding-left: ${({ theme }) => theme.spacing.spacing[24]};
`;

const ThrowItem = styled.li`
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
 * MethodReference Component
 * 
 * Displays documentation for a method in the SDK.
 */
const MethodReference: React.FC<MethodReferenceProps> = ({
  name,
  signature,
  description,
  parameters = [],
  returnType,
  examples = [],
  throws = [],
  notes = [],
  deprecated = false,
  deprecationMessage
}) => {
  return (
    <MethodContainer id={`method-${name}`}>
      <MethodHeader>
        <MethodName variant="h4">
          {name}
        </MethodName>
        
        {deprecated && (
          <DeprecatedBadge>Deprecated</DeprecatedBadge>
        )}
      </MethodHeader>
      
      {deprecated && deprecationMessage && (
        <DeprecationWarning>
          <Typography variant="body2">
            <strong>Deprecation Notice:</strong> {deprecationMessage}
          </Typography>
        </DeprecationWarning>
      )}
      
      <MethodSignature>
        <CodeSnippet
          code={signature}
          language="typescript"
          showLineNumbers={false}
        />
      </MethodSignature>
      
      <MethodDescription>
        <Typography variant="body1">
          {description}
        </Typography>
      </MethodDescription>
      
      {parameters.length > 0 && (
        <>
          <SectionTitle variant="h5">
            Parameters
          </SectionTitle>
          
          <ParametersTable>
            <thead>
              <tr>
                <TableHeader>Name</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Description</TableHeader>
              </tr>
            </thead>
            <tbody>
              {parameters.map((param) => (
                <tr key={param.name}>
                  <TableCell>
                    <ParameterName>{param.name}</ParameterName>
                    {param.required && (
                      <RequiredBadge>Required</RequiredBadge>
                    )}
                  </TableCell>
                  <TableCell>
                    <ParameterType>{param.type}</ParameterType>
                    {param.defaultValue && (
                      <div>
                        <DefaultValue>Default: {param.defaultValue}</DefaultValue>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {param.description}
                    </Typography>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </ParametersTable>
        </>
      )}
      
      {returnType && (
        <ReturnTypeContainer>
          <SectionTitle variant="h5">
            Returns
          </SectionTitle>
          
          <Typography variant="body2">
            <ParameterType>{returnType.type}</ParameterType>: {returnType.description}
          </Typography>
        </ReturnTypeContainer>
      )}
      
      {throws.length > 0 && (
        <>
          <SectionTitle variant="h5">
            Throws
          </SectionTitle>
          
          <ThrowsList>
            {throws.map((throwItem, index) => (
              <ThrowItem key={index}>
                <Typography variant="body2">
                  {throwItem}
                </Typography>
              </ThrowItem>
            ))}
          </ThrowsList>
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
    </MethodContainer>
  );
};

export default MethodReference;