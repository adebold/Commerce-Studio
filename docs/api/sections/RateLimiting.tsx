import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import { Card } from '../../../frontend/src/design-system/components/Card/Card';
import { CodeSnippet } from '../components';

const SectionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[48]};
`;

const SubSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const RateLimitTable = styled.table`
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

const InfoCard = styled(Card)`
  margin: ${({ theme }) => `${theme.spacing.spacing[24]} 0`};
  background-color: ${({ theme }) => theme.colors.semantic.info.light};
  border-left: 4px solid ${({ theme }) => theme.colors.semantic.info.main};
`;

/**
 * RateLimiting Component
 * 
 * Documentation for rate limiting in the VARAi API.
 */
const RateLimiting: React.FC = () => {
  return (
    <SectionContainer id="rate-limiting">
      <Typography variant="h2" gutterBottom>
        Rate Limiting
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        The VARAi API implements rate limiting to ensure fair usage and system stability.
        Rate limits are applied on a per-API key basis, and different endpoints may have
        different rate limits.
      </Typography>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Rate Limit Headers
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          All API responses include headers that provide information about your current rate limit status:
        </Typography>
        
        <RateLimitTable>
          <TableHead>
            <TableRow>
              <TableHeader>Header</TableHeader>
              <TableHeader>Description</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><code>X-RateLimit-Limit</code></TableCell>
              <TableCell>The maximum number of requests allowed in the current time window</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>X-RateLimit-Remaining</code></TableCell>
              <TableCell>The number of requests remaining in the current time window</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>X-RateLimit-Reset</code></TableCell>
              <TableCell>The time at which the current rate limit window resets, in Unix epoch seconds</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>Retry-After</code></TableCell>
              <TableCell>Only present when rate limited. The number of seconds to wait before retrying</TableCell>
            </TableRow>
          </TableBody>
        </RateLimitTable>
        
        <Typography variant="body1" gutterBottom>
          Example rate limit headers:
        </Typography>
        
        <CodeSnippet
          language="http"
          code={`HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1619194742`}
        />
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Rate Limit Tiers
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Rate limits vary based on your subscription tier:
        </Typography>
        
        <RateLimitTable>
          <TableHead>
            <TableRow>
              <TableHeader>Plan</TableHeader>
              <TableHeader>Rate Limit</TableHeader>
              <TableHeader>Burst Limit</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Developer</TableCell>
              <TableCell>100 requests/minute</TableCell>
              <TableCell>120 requests/minute</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Business</TableCell>
              <TableCell>500 requests/minute</TableCell>
              <TableCell>600 requests/minute</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Enterprise</TableCell>
              <TableCell>1,000+ requests/minute</TableCell>
              <TableCell>1,200+ requests/minute</TableCell>
            </TableRow>
          </TableBody>
        </RateLimitTable>
        
        <InfoCard variant="outlined">
          <Card.Content>
            <Typography variant="body2">
              <strong>Note:</strong> Enterprise customers can request custom rate limits based on their specific needs.
              Contact your account manager for more information.
            </Typography>
          </Card.Content>
        </InfoCard>
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Endpoint-Specific Rate Limits
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Some endpoints have specific rate limits that differ from the default limits:
        </Typography>
        
        <RateLimitTable>
          <TableHead>
            <TableRow>
              <TableHeader>Endpoint</TableHeader>
              <TableHeader>Rate Limit</TableHeader>
              <TableHeader>Reason</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><code>POST /v1/recommendations</code></TableCell>
              <TableCell>30 requests/minute</TableCell>
              <TableCell>Computationally intensive</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>POST /v1/virtual-try-on</code></TableCell>
              <TableCell>20 requests/minute</TableCell>
              <TableCell>Computationally intensive</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>GET /v1/frames</code></TableCell>
              <TableCell>200 requests/minute</TableCell>
              <TableCell>Higher limit for catalog browsing</TableCell>
            </TableRow>
          </TableBody>
        </RateLimitTable>
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Handling Rate Limiting
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          When you exceed the rate limit, the API will return a <code>429 Too Many Requests</code> response
          with a <code>Retry-After</code> header indicating how many seconds to wait before retrying.
        </Typography>
        
        <CodeSnippet
          language="http"
          code={`HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1619194742

{
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
        
        <Typography variant="h5" gutterBottom style={{ marginTop: '24px' }}>
          Best Practices for Handling Rate Limits
        </Typography>
        
        <ul>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Monitor rate limit headers</strong> - Keep track of the <code>X-RateLimit-Remaining</code>
              header to know how many requests you have left.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Implement backoff strategies</strong> - When rate limited, use the <code>Retry-After</code>
              header to determine how long to wait before retrying.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Use exponential backoff</strong> - If you continue to be rate limited, implement
              exponential backoff to gradually increase the wait time between retries.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Batch requests when possible</strong> - Instead of making many small requests,
              batch them together to reduce the number of API calls.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Cache responses</strong> - Cache API responses when appropriate to reduce the
              number of requests you need to make.
            </Typography>
          </li>
        </ul>
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Example: Implementing Retry Logic
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Here's an example of how to implement retry logic with exponential backoff in JavaScript:
        </Typography>
        
        <CodeSnippet
          language="javascript"
          code={`async function fetchWithRetry(url, options, maxRetries = 3) {
  let retries = 0;
  
  while (true) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY',
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      
      // Check if rate limited
      if (response.status === 429) {
        // Get retry-after header or default to 1 second
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10);
        
        // If we've reached max retries, throw an error
        if (retries >= maxRetries) {
          throw new Error(\`Rate limited: Max retries exceeded. Try again in \${retryAfter} seconds.\`);
        }
        
        // Calculate backoff time with exponential increase and jitter
        const backoffTime = retryAfter * Math.pow(2, retries) * (0.8 + Math.random() * 0.4);
        
        console.log(\`Rate limited. Retrying in \${backoffTime.toFixed(1)} seconds...\`);
        
        // Wait for the backoff time
        await new Promise(resolve => setTimeout(resolve, backoffTime * 1000));
        
        // Increment retry counter
        retries++;
        continue;
      }
      
      // If not rate limited, return the response
      return response;
    } catch (error) {
      // If we've reached max retries, throw the error
      if (retries >= maxRetries) {
        throw error;
      }
      
      // Increment retry counter
      retries++;
      
      // Calculate backoff time with exponential increase and jitter
      const backoffTime = Math.pow(2, retries) * (0.8 + Math.random() * 0.4);
      
      console.log(\`Error: \${error.message}. Retrying in \${backoffTime.toFixed(1)} seconds...\`);
      
      // Wait for the backoff time
      await new Promise(resolve => setTimeout(resolve, backoffTime * 1000));
    }
  }
}`}
        />
      </SubSection>
    </SectionContainer>
  );
};

export default RateLimiting;