import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import { CodeSnippet, HttpStatusCode } from '../components';

const SectionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[48]};
`;

const SubSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const ErrorTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: ${({ theme }) => `${theme.spacing.spacing[24]} 0`};
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.neutral[100]};
`;

const TableBody = styled.tbody`
  & tr:nth-of-type(even) {
    background-color: ${({ theme }) => theme.colors.neutral[50]};
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  text-align: left;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  color: ${({ theme }) => theme.colors.neutral[800]};
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  vertical-align: top;
`;

/**
 * ErrorHandling Component
 * 
 * Documentation for handling errors in the VARAi API.
 */
const ErrorHandling: React.FC = () => {
  return (
    <SectionContainer id="error-handling">
      <Typography variant="h2" gutterBottom>
        Error Handling
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        The VARAi API uses conventional HTTP response codes to indicate the success or failure of
        an API request. In general, codes in the 2xx range indicate success, codes in the 4xx range
        indicate an error that resulted from the provided information (e.g., a required parameter
        was missing), and codes in the 5xx range indicate an error with VARAi's servers.
      </Typography>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Error Response Format
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          All error responses have a consistent format:
        </Typography>
        
        <CodeSnippet
          language="json"
          code={`{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {
      // Additional error details (optional)
    }
  }
}`}
        />
        
        <Typography variant="body1" gutterBottom style={{ marginTop: '16px' }}>
          The <code>error.code</code> field contains a machine-readable error code that can be used
          to handle specific error cases programmatically. The <code>error.message</code> field
          provides a human-readable description of the error. The <code>error.details</code> object
          may contain additional information about the error, such as which field caused the error.
        </Typography>
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          HTTP Status Codes
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The VARAi API uses the following HTTP status codes:
        </Typography>
        
        <HttpStatusCode
          code={200}
          name="OK"
          description="The request was successful."
        />
        
        <HttpStatusCode
          code={201}
          name="Created"
          description="The request was successful and a resource was created."
        />
        
        <HttpStatusCode
          code={400}
          name="Bad Request"
          description="The request was invalid or cannot be otherwise served. An accompanying error message will explain further."
        />
        
        <HttpStatusCode
          code={401}
          name="Unauthorized"
          description="Authentication credentials were missing or incorrect."
        />
        
        <HttpStatusCode
          code={403}
          name="Forbidden"
          description="The request is understood, but it has been refused or access is not allowed."
        />
        
        <HttpStatusCode
          code={404}
          name="Not Found"
          description="The requested resource does not exist."
        />
        
        <HttpStatusCode
          code={422}
          name="Unprocessable Entity"
          description="The request was well-formed but was unable to be followed due to semantic errors."
        />
        
        <HttpStatusCode
          code={429}
          name="Too Many Requests"
          description="The request was rejected due to rate limiting."
        />
        
        <HttpStatusCode
          code={500}
          name="Internal Server Error"
          description="Something went wrong on our end. Please try again later."
        />
        
        <HttpStatusCode
          code={503}
          name="Service Unavailable"
          description="The service is temporarily unavailable. Please try again later."
        />
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Common Error Codes
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Here are some common error codes you might encounter when using the VARAi API:
        </Typography>
        
        <ErrorTable>
          <TableHead>
            <TableRow>
              <TableHeader>Error Code</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader>HTTP Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><code>invalid_request</code></TableCell>
              <TableCell>The request was malformed or missing required parameters.</TableCell>
              <TableCell>400</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>invalid_param</code></TableCell>
              <TableCell>One or more of the provided parameters is invalid.</TableCell>
              <TableCell>400</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>unauthorized</code></TableCell>
              <TableCell>Authentication credentials were missing or invalid.</TableCell>
              <TableCell>401</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>forbidden</code></TableCell>
              <TableCell>The authenticated user doesn't have permission to access the requested resource.</TableCell>
              <TableCell>403</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>not_found</code></TableCell>
              <TableCell>The requested resource doesn't exist.</TableCell>
              <TableCell>404</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>rate_limited</code></TableCell>
              <TableCell>The request was rejected due to rate limiting.</TableCell>
              <TableCell>429</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>server_error</code></TableCell>
              <TableCell>An error occurred on the server.</TableCell>
              <TableCell>500</TableCell>
            </TableRow>
          </TableBody>
        </ErrorTable>
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Error Handling Examples
        </Typography>
        
        <Typography variant="h5" gutterBottom>
          Example: Invalid Parameter
        </Typography>
        
        <CodeSnippet
          language="json"
          code={`{
  "success": false,
  "error": {
    "code": "invalid_param",
    "message": "The 'limit' parameter must be an integer between 1 and 100",
    "details": {
      "param": "limit",
      "value": "200",
      "constraint": "1-100"
    }
  }
}`}
        />
        
        <Typography variant="h5" gutterBottom style={{ marginTop: '24px' }}>
          Example: Resource Not Found
        </Typography>
        
        <CodeSnippet
          language="json"
          code={`{
  "success": false,
  "error": {
    "code": "not_found",
    "message": "The requested frame could not be found",
    "details": {
      "resource_type": "frame",
      "resource_id": "f99999"
    }
  }
}`}
        />
        
        <Typography variant="h5" gutterBottom style={{ marginTop: '24px' }}>
          Example: Rate Limiting
        </Typography>
        
        <CodeSnippet
          language="json"
          code={`{
  "success": false,
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded. Please try again in 30 seconds.",
    "details": {
      "rate_limit": 100,
      "rate_limit_window": "1 minute",
      "retry_after": 30
    }
  }
}`}
        />
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Best Practices for Error Handling
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Here are some best practices for handling errors in your applications:
        </Typography>
        
        <ul>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Check the HTTP status code</strong> - Always check the HTTP status code of the response
              to determine if the request was successful or not.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Parse the error response</strong> - Parse the error response to get detailed information
              about what went wrong.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Handle specific error codes</strong> - Implement specific handling for common error codes
              that your application might encounter.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Implement retry logic</strong> - For transient errors (e.g., rate limiting, server errors),
              implement retry logic with exponential backoff.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Log errors</strong> - Log errors for debugging and monitoring purposes.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Display user-friendly error messages</strong> - Translate API error messages into
              user-friendly messages that make sense in the context of your application.
            </Typography>
          </li>
        </ul>
      </SubSection>
    </SectionContainer>
  );
};

export default ErrorHandling;