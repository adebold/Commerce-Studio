import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import { Card } from '../../../frontend/src/design-system/components/Card/Card';
import { CodeSnippet, ApiEndpoint } from '../components';

const SectionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[48]};
`;

const SubSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const InfoCard = styled(Card)`
  margin: ${({ theme }) => `${theme.spacing.spacing[24]} 0`};
  background-color: ${({ theme }) => theme.colors.semantic.info.light};
  border-left: 4px solid ${({ theme }) => theme.colors.semantic.info.main};
`;

const SecurityCard = styled(Card)`
  margin: ${({ theme }) => `${theme.spacing.spacing[24]} 0`};
  background-color: ${({ theme }) => theme.colors.semantic.warning.light};
  border-left: 4px solid ${({ theme }) => theme.colors.semantic.warning.main};
`;

const WebhookTable = styled.table`
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
 * Webhooks Component
 * 
 * Documentation for using webhooks with the VARAi API.
 */
const Webhooks: React.FC = () => {
  return (
    <SectionContainer id="webhooks">
      <Typography variant="h2" gutterBottom>
        Webhooks
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        Webhooks allow you to receive real-time notifications when specific events occur in your
        VARAi account. Instead of polling the API for changes, you can configure webhooks to
        notify your application when events happen.
      </Typography>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          How Webhooks Work
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          When you register a webhook, you provide a URL where VARAi will send HTTP POST requests
          when specific events occur. Each webhook request contains information about the event
          that triggered it, allowing your application to take appropriate action.
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The basic flow of a webhook is:
        </Typography>
        
        <ol>
          <li>
            <Typography variant="body1" gutterBottom>
              You register a webhook URL for specific events in your VARAi account.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              When one of those events occurs, VARAi sends an HTTP POST request to your URL.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              Your server processes the webhook payload and responds with a 2xx status code.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              If your server fails to respond with a 2xx status code, VARAi will retry the webhook
              delivery according to the retry schedule.
            </Typography>
          </li>
        </ol>
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Webhook Events
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          VARAi supports the following webhook events:
        </Typography>
        
        <WebhookTable>
          <TableHead>
            <TableRow>
              <TableHeader>Event</TableHeader>
              <TableHeader>Description</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><code>frame.created</code></TableCell>
              <TableCell>Triggered when a new frame is added to the catalog</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>frame.updated</code></TableCell>
              <TableCell>Triggered when a frame's information is updated</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>frame.deleted</code></TableCell>
              <TableCell>Triggered when a frame is removed from the catalog</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>recommendation.created</code></TableCell>
              <TableCell>Triggered when a new recommendation is generated</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>user.created</code></TableCell>
              <TableCell>Triggered when a new user is created</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>user.updated</code></TableCell>
              <TableCell>Triggered when a user's information is updated</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>try_on.completed</code></TableCell>
              <TableCell>Triggered when a virtual try-on is completed</TableCell>
            </TableRow>
          </TableBody>
        </WebhookTable>
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Webhook Payload
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Webhook payloads are sent as JSON in the body of the HTTP POST request. Each payload
          includes information about the event that triggered the webhook.
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Here's an example of a webhook payload for a <code>frame.created</code> event:
        </Typography>
        
        <CodeSnippet
          language="json"
          code={`{
  "id": "evt_123456789",
  "created_at": "2025-04-29T12:34:56Z",
  "type": "frame.created",
  "data": {
    "frame": {
      "id": "f12345",
      "name": "Classic Wayframe",
      "brand": "RayBender",
      "style": "rectangle",
      "material": "acetate",
      "color": "tortoise",
      "price": 129.99,
      "created_at": "2025-04-29T12:34:56Z"
    }
  }
}`}
        />
        
        <Typography variant="h5" gutterBottom style={{ marginTop: '24px' }}>
          Webhook Headers
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Each webhook request includes the following HTTP headers:
        </Typography>
        
        <WebhookTable>
          <TableHead>
            <TableRow>
              <TableHeader>Header</TableHeader>
              <TableHeader>Description</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><code>X-VARAi-Webhook-Id</code></TableCell>
              <TableCell>A unique identifier for the webhook request</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>X-VARAi-Event</code></TableCell>
              <TableCell>The type of event that triggered the webhook</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>X-VARAi-Signature</code></TableCell>
              <TableCell>A signature to verify the webhook came from VARAi</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>X-VARAi-Timestamp</code></TableCell>
              <TableCell>The timestamp when the webhook was sent</TableCell>
            </TableRow>
          </TableBody>
        </WebhookTable>
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Webhook Security
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          To ensure that webhook requests are coming from VARAi and not a malicious third party,
          each webhook request includes a signature in the <code>X-VARAi-Signature</code> header.
          You should verify this signature before processing the webhook.
        </Typography>
        
        <SecurityCard variant="outlined">
          <Card.Content>
            <Typography variant="body2">
              <strong>Security Best Practice:</strong> Always verify webhook signatures to ensure
              the requests are coming from VARAi and not a malicious third party.
            </Typography>
          </Card.Content>
        </SecurityCard>
        
        <Typography variant="body1" gutterBottom>
          Here's how to verify a webhook signature:
        </Typography>
        
        <ol>
          <li>
            <Typography variant="body1" gutterBottom>
              Retrieve your webhook secret from your VARAi developer dashboard.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              Get the signature from the <code>X-VARAi-Signature</code> header.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              Get the timestamp from the <code>X-VARAi-Timestamp</code> header.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              Concatenate the timestamp, a period (.), and the raw request body.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              Compute an HMAC with the SHA-256 hash function using your webhook secret as the key.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              Compare the computed signature with the signature in the header.
            </Typography>
          </li>
        </ol>
        
        <Typography variant="body1" gutterBottom>
          Here's an example of how to verify a webhook signature in Node.js:
        </Typography>
        
        <CodeSnippet
          language="javascript"
          code={`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, timestamp, secret) {
  // Create the string to sign
  const signatureString = \`\${timestamp}.\${payload}\`;
  
  // Compute the HMAC
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(signatureString)
    .digest('hex');
  
  // Compare signatures using a constant-time comparison function
  // to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(computedSignature),
    Buffer.from(signature)
  );
}

// Example usage in an Express.js route
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-varai-signature'];
  const timestamp = req.headers['x-varai-timestamp'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.VARAI_WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(payload, signature, timestamp, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook
  const event = req.body;
  
  // Handle different event types
  switch (event.type) {
    case 'frame.created':
      // Handle frame created event
      break;
    case 'recommendation.created':
      // Handle recommendation created event
      break;
    // Handle other event types...
  }
  
  // Respond with a 200 OK to acknowledge receipt
  res.status(200).send('Webhook received');
});`}
        />
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Managing Webhooks
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          You can manage your webhooks through the VARAi API or the developer dashboard.
        </Typography>
        
        <ApiEndpoint
          method="POST"
          path="/v1/webhooks"
          description="Create a new webhook endpoint."
          requestParams={[
            { name: "url", type: "string", required: true, description: "The URL where webhook events will be sent" },
            { name: "events", type: "array", required: true, description: "Array of event types to subscribe to" },
            { name: "description", type: "string", required: false, description: "A description of the webhook" },
            { name: "active", type: "boolean", required: false, description: "Whether the webhook is active (default: true)" }
          ]}
          requestExample={`{
  "url": "https://example.com/varai-webhooks",
  "events": ["frame.created", "frame.updated", "recommendation.created"],
  "description": "Production webhook for frame updates"
}`}
          responseExample={`{
  "success": true,
  "data": {
    "id": "wh_123456789",
    "url": "https://example.com/varai-webhooks",
    "events": ["frame.created", "frame.updated", "recommendation.created"],
    "description": "Production webhook for frame updates",
    "active": true,
    "created_at": "2025-04-29T12:34:56Z"
  }
}`}
        />
        
        <InfoCard variant="outlined">
          <Card.Content>
            <Typography variant="body2">
              <strong>Testing Tip:</strong> For development and testing, you can use services like
              <a href="https://webhook.site" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '4px' }}>
                webhook.site
              </a> or
              <a href="https://requestbin.com" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '4px' }}>
                RequestBin
              </a> to quickly set up a temporary webhook endpoint and inspect the payloads.
            </Typography>
          </Card.Content>
        </InfoCard>
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Webhook Best Practices
        </Typography>
        
        <ul>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Verify signatures</strong> - Always verify webhook signatures to ensure the
              requests are coming from VARAi.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Respond quickly</strong> - Your webhook endpoint should respond with a 2xx
              status code as quickly as possible. Process the webhook asynchronously if needed.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Handle retries</strong> - VARAi will retry failed webhook deliveries. Make
              sure your endpoint can handle duplicate events by making your webhook processing
              idempotent.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Monitor webhook activity</strong> - Keep track of webhook deliveries and
              failures in your VARAi dashboard.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Use HTTPS</strong> - Always use HTTPS for your webhook endpoints to ensure
              the security of the data being transmitted.
            </Typography>
          </li>
        </ul>
      </SubSection>
    </SectionContainer>
  );
};

export default Webhooks;