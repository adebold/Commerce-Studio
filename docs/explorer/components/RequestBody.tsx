import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Card, Typography, Button } from '../../../frontend/src/design-system/components';
import { GridContainer, GridItem } from '../../../frontend/src/design-system/components/Layout/ResponsiveGrid';

// Content types
export enum ContentType {
  JSON = 'application/json',
  FORM_DATA = 'multipart/form-data',
  URL_ENCODED = 'application/x-www-form-urlencoded',
  TEXT = 'text/plain',
  XML = 'application/xml',
  NONE = 'none'
}

// Body interface
export interface RequestBodyConfig {
  contentType: ContentType;
  content: string;
  formData?: Array<{ key: string; value: string; type: 'text' | 'file' }>;
}

interface RequestBodyProps {
  body: RequestBodyConfig;
  onChange: (body: RequestBodyConfig) => void;
  httpMethod: string;
}

const EditorContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

const ContentTypeSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const TypeButton = styled(Button)<{ $isActive: boolean }>`
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0.7)};
`;

const CodeEditor = styled.textarea`
  width: 100%;
  min-height: 200px;
  font-family: monospace;
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: ${({ theme }) => theme.shadows.effects.focus};
  }
`;

const FormDataRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
  gap: ${({ theme }) => theme.spacing.spacing[8]};
`;

const FormInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.spacing[8]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: ${({ theme }) => theme.shadows.effects.focus};
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.spacing[8]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  background-color: ${({ theme }) => theme.colors.neutral.white};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: ${({ theme }) => theme.shadows.effects.focus};
  }
`;

const ValidationMessage = styled.div<{ $isError: boolean }>`
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
  color: ${({ $isError, theme }) => 
    $isError ? theme.colors.error.main : theme.colors.success.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

/**
 * RequestBody Component
 * 
 * Allows users to configure the request body for API requests.
 */
export const RequestBody: React.FC<RequestBodyProps> = ({
  body,
  onChange,
  httpMethod
}) => {
  const [validationMessage, setValidationMessage] = useState<{ text: string; isError: boolean } | null>(null);
  
  // Check if the HTTP method supports a request body
  const supportsBody = !['GET', 'HEAD'].includes(httpMethod);
  
  // Handle content type change
  const handleContentTypeChange = (contentType: ContentType) => {
    let newContent = body.content;
    
    // Initialize content based on type
    if (contentType === ContentType.JSON && (!body.content || body.contentType !== ContentType.JSON)) {
      newContent = '{\n  \n}';
    } else if (contentType === ContentType.XML && (!body.content || body.contentType !== ContentType.XML)) {
      newContent = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  \n</root>';
    }
    
    onChange({
      ...body,
      contentType,
      content: newContent,
      formData: contentType === ContentType.FORM_DATA ? (body.formData || []) : undefined
    });
    
    setValidationMessage(null);
  };
  
  // Handle content change
  const handleContentChange = (content: string) => {
    onChange({
      ...body,
      content
    });
    
    // Validate JSON if applicable
    if (body.contentType === ContentType.JSON) {
      try {
        JSON.parse(content);
        setValidationMessage({ text: 'Valid JSON', isError: false });
      } catch (error) {
        setValidationMessage({ text: 'Invalid JSON: ' + (error as Error).message, isError: true });
      }
    } else {
      setValidationMessage(null);
    }
  };
  
  // Handle form data changes
  const handleFormDataChange = (index: number, field: 'key' | 'value' | 'type', value: string) => {
    if (!body.formData) return;
    
    const newFormData = [...body.formData];
    newFormData[index] = {
      ...newFormData[index],
      [field]: value
    };
    
    onChange({
      ...body,
      formData: newFormData
    });
  };
  
  // Add new form data field
  const handleAddFormField = () => {
    const newFormData = [
      ...(body.formData || []),
      { key: '', value: '', type: 'text' as const }
    ];
    
    onChange({
      ...body,
      formData: newFormData
    });
  };
  
  // Remove form data field
  const handleRemoveFormField = (index: number) => {
    if (!body.formData) return;
    
    const newFormData = body.formData.filter((_, i) => i !== index);
    
    onChange({
      ...body,
      formData: newFormData
    });
  };
  
  // Format JSON button handler
  const handleFormatJson = () => {
    if (body.contentType !== ContentType.JSON) return;
    
    try {
      const formatted = JSON.stringify(JSON.parse(body.content), null, 2);
      onChange({
        ...body,
        content: formatted
      });
      setValidationMessage({ text: 'JSON formatted successfully', isError: false });
    } catch (error) {
      setValidationMessage({ text: 'Cannot format: Invalid JSON', isError: true });
    }
  };

  return (
    <Card>
      <Card.Content>
        <Typography variant="h5" gutterBottom>Request Body</Typography>
        
        {!supportsBody ? (
          <Typography variant="body2" color="error.main">
            {httpMethod} requests do not support request bodies.
          </Typography>
        ) : (
          <>
            <Typography variant="body2" gutterBottom>
              Configure the request body and content type.
            </Typography>
            
            <ContentTypeSelector>
              <TypeButton
                size="small"
                $isActive={body.contentType === ContentType.NONE}
                onClick={() => handleContentTypeChange(ContentType.NONE)}
              >
                None
              </TypeButton>
              <TypeButton
                size="small"
                $isActive={body.contentType === ContentType.JSON}
                onClick={() => handleContentTypeChange(ContentType.JSON)}
              >
                JSON
              </TypeButton>
              <TypeButton
                size="small"
                $isActive={body.contentType === ContentType.FORM_DATA}
                onClick={() => handleContentTypeChange(ContentType.FORM_DATA)}
              >
                Form Data
              </TypeButton>
              <TypeButton
                size="small"
                $isActive={body.contentType === ContentType.URL_ENCODED}
                onClick={() => handleContentTypeChange(ContentType.URL_ENCODED)}
              >
                URL Encoded
              </TypeButton>
              <TypeButton
                size="small"
                $isActive={body.contentType === ContentType.TEXT}
                onClick={() => handleContentTypeChange(ContentType.TEXT)}
              >
                Plain Text
              </TypeButton>
              <TypeButton
                size="small"
                $isActive={body.contentType === ContentType.XML}
                onClick={() => handleContentTypeChange(ContentType.XML)}
              >
                XML
              </TypeButton>
            </ContentTypeSelector>
            
            <EditorContainer>
              {body.contentType === ContentType.FORM_DATA ? (
                <div>
                  {(body.formData || []).map((field, index) => (
                    <FormDataRow key={index}>
                      <FormInput
                        placeholder="Key"
                        value={field.key}
                        onChange={(e) => handleFormDataChange(index, 'key', e.target.value)}
                      />
                      <FormInput
                        placeholder="Value"
                        value={field.value}
                        onChange={(e) => handleFormDataChange(index, 'value', e.target.value)}
                      />
                      <Select
                        value={field.type}
                        onChange={(e) => handleFormDataChange(index, 'type', e.target.value as 'text' | 'file')}
                      >
                        <option value="text">Text</option>
                        <option value="file">File</option>
                      </Select>
                      <Button
                        variant="tertiary"
                        onClick={() => handleRemoveFormField(index)}
                        aria-label="Remove field"
                      >
                        Remove
                      </Button>
                    </FormDataRow>
                  ))}
                  
                  <Button
                    variant="secondary"
                    onClick={handleAddFormField}
                    style={{ marginTop: '8px' }}
                  >
                    Add Field
                  </Button>
                </div>
              ) : body.contentType !== ContentType.NONE ? (
                <div>
                  <CodeEditor
                    value={body.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder={
                      body.contentType === ContentType.JSON ? 'Enter JSON data...' :
                      body.contentType === ContentType.XML ? 'Enter XML data...' :
                      'Enter request body...'
                    }
                  />
                  
                  {body.contentType === ContentType.JSON && (
                    <Button
                      variant="secondary"
                      onClick={handleFormatJson}
                      style={{ marginTop: '8px' }}
                    >
                      Format JSON
                    </Button>
                  )}
                  
                  {validationMessage && (
                    <ValidationMessage $isError={validationMessage.isError}>
                      {validationMessage.text}
                    </ValidationMessage>
                  )}
                </div>
              ) : null}
            </EditorContainer>
          </>
        )}
      </Card.Content>
    </Card>
  );
};

export default RequestBody;