import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { GridContainer, GridItem } from '../../frontend/src/design-system/components/Layout/ResponsiveGrid';
import { Typography, Button, Card } from '../../frontend/src/design-system/components';

// Import components
import Authentication from './components/Authentication';
import RequestMethod from './components/RequestMethod';
import UrlParameter from './components/UrlParameter';
import QueryParameter from './components/QueryParameter';
import RequestBody from './components/RequestBody';
import RequestHeader from './components/RequestHeader';
import ResponseViewer from './components/ResponseViewer';
import History from './components/History';

// Import types
import { AuthConfig, AuthMethod } from './components/Authentication';
import { HttpMethod } from './components/RequestMethod';
import { UrlParam } from './components/UrlParameter';
import { QueryParam } from './components/QueryParameter';
import { RequestBodyConfig, ContentType } from './components/RequestBody';
import { RequestHeaderItem } from './components/RequestHeader';
import { ApiResponse } from './components/ResponseViewer';
import { HistoryItem } from './components/History';

// Styled components
const PageContainer = styled.div`
  padding: ${({ theme }) => `${theme.spacing.spacing[32]} 0`};
  max-width: 1440px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[48]};
`;

const MainContent = styled.main`
  margin-top: ${({ theme }) => theme.spacing.spacing[32]};
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
  gap: ${({ theme }) => theme.spacing.spacing[16]};
`;

const SectionDivider = styled.div`
  margin: ${({ theme }) => `${theme.spacing.spacing[32]} 0`};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral[200]};
`;

// Mock API endpoints for the explorer
const MOCK_ENDPOINTS = [
  {
    name: 'Get Frames',
    method: HttpMethod.GET,
    url: '/api/frames',
    description: 'Get a list of all available frames'
  },
  {
    name: 'Get Frame by ID',
    method: HttpMethod.GET,
    url: '/api/frames/{id}',
    description: 'Get details of a specific frame by ID'
  },
  {
    name: 'Create Frame',
    method: HttpMethod.POST,
    url: '/api/frames',
    description: 'Create a new frame'
  },
  {
    name: 'Update Frame',
    method: HttpMethod.PUT,
    url: '/api/frames/{id}',
    description: 'Update an existing frame'
  },
  {
    name: 'Delete Frame',
    method: HttpMethod.DELETE,
    url: '/api/frames/{id}',
    description: 'Delete a frame'
  },
  {
    name: 'Get Recommendations',
    method: HttpMethod.GET,
    url: '/api/recommendations',
    description: 'Get frame recommendations'
  },
  {
    name: 'Get User',
    method: HttpMethod.GET,
    url: '/api/users/{id}',
    description: 'Get user details'
  }
];

// Generate a mock response based on the request
const generateMockResponse = (
  method: HttpMethod,
  url: string,
  headers: Record<string, string>,
  body?: string
): ApiResponse => {
  // Simulate network delay
  const responseTime = Math.floor(Math.random() * 500) + 100;
  
  // Default success response
  let status = 200;
  let statusText = 'OK';
  let responseBody = '';
  let contentType = 'application/json';
  
  // Generate response based on URL and method
  if (url.includes('/api/frames')) {
    if (method === HttpMethod.GET) {
      if (url.match(/\/api\/frames\/\d+/)) {
        // Get frame by ID
        responseBody = JSON.stringify({
          id: url.split('/').pop(),
          name: 'Classic Aviator',
          brand: 'VARAi',
          price: 129.99,
          color: 'Gold',
          material: 'Metal',
          inStock: true
        }, null, 2);
      } else {
        // Get all frames
        responseBody = JSON.stringify({
          frames: [
            {
              id: '1',
              name: 'Classic Aviator',
              brand: 'VARAi',
              price: 129.99,
              color: 'Gold',
              material: 'Metal'
            },
            {
              id: '2',
              name: 'Modern Rectangle',
              brand: 'VARAi',
              price: 149.99,
              color: 'Black',
              material: 'Acetate'
            },
            {
              id: '3',
              name: 'Round Vintage',
              brand: 'VARAi',
              price: 139.99,
              color: 'Tortoise',
              material: 'Acetate'
            }
          ],
          total: 3,
          page: 1,
          limit: 10
        }, null, 2);
      }
    } else if (method === HttpMethod.POST) {
      // Create frame
      status = 201;
      statusText = 'Created';
      responseBody = JSON.stringify({
        id: '4',
        ...JSON.parse(body || '{}'),
        createdAt: new Date().toISOString()
      }, null, 2);
    } else if (method === HttpMethod.PUT) {
      // Update frame
      responseBody = JSON.stringify({
        id: url.split('/').pop(),
        ...JSON.parse(body || '{}'),
        updatedAt: new Date().toISOString()
      }, null, 2);
    } else if (method === HttpMethod.DELETE) {
      // Delete frame
      status = 204;
      statusText = 'No Content';
      responseBody = '';
    }
  } else if (url.includes('/api/recommendations')) {
    // Get recommendations
    responseBody = JSON.stringify({
      recommendations: [
        {
          id: '2',
          name: 'Modern Rectangle',
          brand: 'VARAi',
          price: 149.99,
          matchScore: 0.95
        },
        {
          id: '5',
          name: 'Slim Oval',
          brand: 'VARAi',
          price: 159.99,
          matchScore: 0.87
        },
        {
          id: '8',
          name: 'Bold Square',
          brand: 'VARAi',
          price: 169.99,
          matchScore: 0.82
        }
      ]
    }, null, 2);
  } else if (url.includes('/api/users')) {
    // Get user
    responseBody = JSON.stringify({
      id: url.split('/').pop(),
      name: 'John Doe',
      email: 'john.doe@example.com',
      preferences: {
        frameStyle: 'Rectangle',
        frameColor: 'Black',
        facialFeatures: {
          faceShape: 'Oval',
          eyeDistance: 'Medium'
        }
      }
    }, null, 2);
  } else {
    // Unknown endpoint
    status = 404;
    statusText = 'Not Found';
    responseBody = JSON.stringify({
      error: 'Endpoint not found',
      message: `The requested endpoint ${method} ${url} does not exist`
    }, null, 2);
  }
  
  // Simulate errors based on headers or other conditions
  if (headers['X-Simulate-Error'] === 'true') {
    status = 500;
    statusText = 'Internal Server Error';
    responseBody = JSON.stringify({
      error: 'Internal Server Error',
      message: 'An error occurred while processing your request'
    }, null, 2);
  } else if (headers['Authorization'] === undefined && !url.includes('/public')) {
    status = 401;
    statusText = 'Unauthorized';
    responseBody = JSON.stringify({
      error: 'Unauthorized',
      message: 'Authentication is required to access this resource'
    }, null, 2);
  }
  
  // Generate response headers
  const responseHeaders: Record<string, string> = {
    'Content-Type': contentType,
    'X-Request-ID': `req-${Date.now()}`,
    'X-Response-Time': `${responseTime}ms`,
    'Cache-Control': 'no-cache',
    'X-API-Version': 'v1'
  };
  
  return {
    status,
    statusText,
    headers: responseHeaders,
    body: responseBody,
    contentType,
    time: responseTime,
    size: new Blob([responseBody]).size
  };
};

/**
 * ApiExplorer Component
 * 
 * The main component for the VARAi API Explorer.
 */
const ApiExplorer: React.FC = () => {
  // Base URL for API requests
  const [baseUrl, setBaseUrl] = useState('https://api.varai.com');
  
  // Request configuration state
  const [authConfig, setAuthConfig] = useState<AuthConfig>({ method: AuthMethod.NONE });
  const [httpMethod, setHttpMethod] = useState<HttpMethod>(HttpMethod.GET);
  const [endpoint, setEndpoint] = useState('/api/frames');
  const [urlParams, setUrlParams] = useState<UrlParam[]>([]);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  const [requestBody, setRequestBody] = useState<RequestBodyConfig>({
    contentType: ContentType.JSON,
    content: '{\n  \n}'
  });
  const [requestHeaders, setRequestHeaders] = useState<RequestHeaderItem[]>([
    {
      id: 'header-1',
      name: 'Content-Type',
      value: 'application/json',
      enabled: true
    }
  ]);
  
  // Response state
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  
  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Update Content-Type header when request body content type changes
  useEffect(() => {
    if (requestBody.contentType === ContentType.NONE) {
      // Remove Content-Type header if no body
      setRequestHeaders(headers => 
        headers.filter(h => h.name.toLowerCase() !== 'content-type')
      );
    } else {
      // Update or add Content-Type header
      const contentTypeHeader = requestHeaders.find(
        h => h.name.toLowerCase() === 'content-type'
      );
      
      if (contentTypeHeader) {
        setRequestHeaders(headers =>
          headers.map(h => 
            h.id === contentTypeHeader.id 
              ? { ...h, value: requestBody.contentType, enabled: true } 
              : h
          )
        );
      } else {
        setRequestHeaders(headers => [
          ...headers,
          {
            id: `header-${Date.now()}`,
            name: 'Content-Type',
            value: requestBody.contentType,
            enabled: true
          }
        ]);
      }
    }
  }, [requestBody.contentType]);
  
  // Update URL parameters when endpoint changes
  useEffect(() => {
    // Extract URL parameters from the endpoint
    const paramRegex = /{([^}]+)}/g;
    const matches = [...endpoint.matchAll(paramRegex)];
    
    if (matches.length > 0) {
      const newParams = matches.map(match => ({
        id: `param-${match[1]}-${Date.now()}`,
        name: match[1],
        value: ''
      }));
      
      // Keep existing values for parameters that still exist
      const updatedParams = newParams.map(newParam => {
        const existingParam = urlParams.find(p => p.name === newParam.name);
        return existingParam 
          ? { ...newParam, value: existingParam.value } 
          : newParam;
      });
      
      setUrlParams(updatedParams);
    } else {
      setUrlParams([]);
    }
  }, [endpoint]);
  
  // Generate the full URL with path and query parameters
  const generateFullUrl = (): string => {
    let url = `${baseUrl}${endpoint}`;
    
    // Replace path parameters
    urlParams.forEach(param => {
      const placeholder = `{${param.name}}`;
      if (url.includes(placeholder)) {
        url = url.replace(placeholder, param.value || placeholder);
      }
    });
    
    // Add query parameters
    const enabledQueryParams = queryParams.filter(param => param.enabled && param.name);
    if (enabledQueryParams.length > 0) {
      const queryString = enabledQueryParams
        .map(param => `${encodeURIComponent(param.name)}=${encodeURIComponent(param.value || '')}`)
        .join('&');
      
      url += `?${queryString}`;
    }
    
    return url;
  };
  
  // Generate headers for the request
  const generateHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    
    // Add enabled headers
    requestHeaders
      .filter(header => header.enabled && header.name)
      .forEach(header => {
        headers[header.name] = header.value;
      });
    
    // Add authentication headers
    if (authConfig.method === AuthMethod.API_KEY && authConfig.apiKey) {
      headers['X-API-Key'] = authConfig.apiKey;
    } else if (authConfig.method === AuthMethod.JWT && authConfig.token) {
      headers['Authorization'] = `Bearer ${authConfig.token}`;
    }
    
    return headers;
  };
  
  // Send the API request
  const sendRequest = async () => {
    setLoading(true);
    
    try {
      // Generate the full URL and headers
      const url = generateFullUrl();
      const headers = generateHeaders();
      
      // Get request body if applicable
      let body: string | undefined;
      if (!['GET', 'HEAD'].includes(httpMethod) && requestBody.contentType !== ContentType.NONE) {
        body = requestBody.content;
      }
      
      // In a real implementation, this would make an actual API call
      // For this demo, we'll generate a mock response
      setTimeout(() => {
        const mockResponse = generateMockResponse(httpMethod, url, headers, body);
        setResponse(mockResponse);
        
        // Add to history
        const historyItem: HistoryItem = {
          id: `history-${Date.now()}`,
          timestamp: Date.now(),
          method: httpMethod,
          url,
          status: mockResponse.status,
          responseTime: mockResponse.time,
          successful: mockResponse.status >= 200 && mockResponse.status < 300
        };
        
        setHistory(prev => [historyItem, ...prev].slice(0, 10));
        setLoading(false);
      }, 1000); // Simulate network delay
    } catch (error) {
      console.error('Error sending request:', error);
      setLoading(false);
    }
  };
  
  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };
  
  // Load a request from history
  const loadFromHistory = (item: HistoryItem) => {
    // Set HTTP method
    setHttpMethod(item.method);
    
    // Parse URL to extract endpoint, path params, and query params
    const url = new URL(item.url);
    const path = url.pathname;
    setEndpoint(path);
    
    // Extract query parameters
    const newQueryParams: QueryParam[] = [];
    url.searchParams.forEach((value, key) => {
      newQueryParams.push({
        id: `query-${key}-${Date.now()}`,
        name: key,
        value,
        enabled: true
      });
    });
    setQueryParams(newQueryParams);
  };
  
  // Reset the form
  const resetForm = () => {
    setHttpMethod(HttpMethod.GET);
    setEndpoint('/api/frames');
    setUrlParams([]);
    setQueryParams([]);
    setRequestBody({
      contentType: ContentType.JSON,
      content: '{\n  \n}'
    });
    setRequestHeaders([
      {
        id: 'header-1',
        name: 'Content-Type',
        value: 'application/json',
        enabled: true
      }
    ]);
    setResponse(null);
  };

  return (
    <PageContainer>
      <Header>
        <Typography variant="h1" gutterBottom>
          VARAi API Explorer
        </Typography>
        
        <Typography variant="h5" gutterBottom color="neutral.600">
          Interactively test and explore the VARAi API
        </Typography>
        
        <div style={{ marginTop: '16px' }}>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/docs'}
          >
            Back to Documentation
          </Button>
        </div>
      </Header>
      
      <MainContent>
        <GridContainer spacing="large">
          <GridItem xs={12} md={8}>
            <Card>
              <Card.Content>
                <Typography variant="h4" gutterBottom>
                  Request Builder
                </Typography>
                
                <Authentication 
                  onChange={setAuthConfig} 
                  initialConfig={authConfig} 
                />
                
                <RequestMethod 
                  selectedMethod={httpMethod} 
                  onChange={setHttpMethod} 
                />
                
                <UrlParameter 
                  parameters={urlParams}
                  onChange={setUrlParams}
                  baseUrl={baseUrl}
                  endpoint={endpoint}
                  onEndpointChange={setEndpoint}
                />
                
                <QueryParameter 
                  parameters={queryParams}
                  onChange={setQueryParams}
                  baseUrl={baseUrl}
                  endpoint={endpoint}
                />
                
                <RequestHeader 
                  headers={requestHeaders}
                  onChange={setRequestHeaders}
                />
                
                <RequestBody 
                  body={requestBody}
                  onChange={setRequestBody}
                  httpMethod={httpMethod}
                />
                
                <ActionBar>
                  <Button 
                    variant="tertiary"
                    onClick={resetForm}
                  >
                    Reset
                  </Button>
                  
                  <Button 
                    variant="primary"
                    onClick={sendRequest}
                    loading={loading}
                  >
                    Send Request
                  </Button>
                </ActionBar>
              </Card.Content>
            </Card>
            
            <SectionDivider />
            
            <ResponseViewer 
              response={response}
              loading={loading}
            />
          </GridItem>
          
          <GridItem xs={12} md={4}>
            <History 
              items={history}
              onSelect={loadFromHistory}
              onClear={clearHistory}
            />
            
            <Card style={{ marginTop: '24px' }}>
              <Card.Content>
                <Typography variant="h5" gutterBottom>
                  Example Endpoints
                </Typography>
                
                <div>
                  {MOCK_ENDPOINTS.map((endpoint, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        padding: '12px', 
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setHttpMethod(endpoint.method);
                        setEndpoint(endpoint.url);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span 
                          style={{ 
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            marginRight: '8px',
                            minWidth: '50px',
                            textAlign: 'center',
                            backgroundColor: 
                              endpoint.method === HttpMethod.GET ? '#61affe' :
                              endpoint.method === HttpMethod.POST ? '#49cc90' :
                              endpoint.method === HttpMethod.PUT ? '#fca130' :
                              endpoint.method === HttpMethod.DELETE ? '#f93e3e' :
                              '#eeeeee',
                            color: 'white'
                          }}
                        >
                          {endpoint.method}
                        </span>
                        <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                          {endpoint.name}
                        </Typography>
                      </div>
                      <Typography variant="body2" style={{ marginTop: '4px' }}>
                        {endpoint.url}
                      </Typography>
                      <Typography variant="body2" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {endpoint.description}
                      </Typography>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </GridItem>
        </GridContainer>
      </MainContent>
    </PageContainer>
  );
};

export default ApiExplorer;