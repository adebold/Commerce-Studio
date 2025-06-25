import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  ButtonGroup,
  Heading,
  TextStyle,
  Stack,
  Badge,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useState, useCallback } from 'react';
import { Analytics } from '../components/Analytics';
import { RecommendationSettings } from '../components/RecommendationSettings';
import { VirtualTryOn } from '../components/VirtualTryOn';

export default function HomePage() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const handleTabChange = useCallback(
    (tab: string) => setSelectedTab(tab),
    []
  );

  // Performance metrics
  const recentPerformance = [
    ['Today', '150', '45', '30%', '$2,450'],
    ['Yesterday', '145', '42', '29%', '$2,380'],
    ['Last 7 Days', '980', '285', '29%', '$16,750'],
  ];

  return (
    <Page>
      <TitleBar title="EyewearML Dashboard" />
      
      <Layout>
        {/* Overview Section */}
        <Layout.Section>
          <Card sectioned>
            <Stack distribution="equalSpacing" alignment="center">
              <Stack vertical spacing="tight">
                <Heading>Welcome to EyewearML</Heading>
                <TextStyle variation="subdued">
                  Manage your AI-powered eyewear recommendations
                </TextStyle>
              </Stack>
              <ButtonGroup>
                <Button primary onClick={() => handleTabChange('settings')}>
                  Configure
                </Button>
                <Button onClick={() => handleTabChange('analytics')}>
                  View Analytics
                </Button>
              </ButtonGroup>
            </Stack>
          </Card>
        </Layout.Section>

        {/* Performance Metrics */}
        <Layout.Section>
          <Card sectioned>
            <Stack vertical spacing="tight">
              <Heading>Recent Performance</Heading>
              <DataTable
                columnContentTypes={[
                  'text',
                  'numeric',
                  'numeric',
                  'numeric',
                  'numeric',
                ]}
                headings={[
                  'Period',
                  'Views',
                  'Try-Ons',
                  'Conversion Rate',
                  'Revenue',
                ]}
                rows={recentPerformance}
              />
            </Stack>
          </Card>
        </Layout.Section>

        {/* Quick Actions */}
        <Layout.Section secondary>
          <Card sectioned>
            <Stack vertical spacing="tight">
              <Heading>Quick Actions</Heading>
              <ButtonGroup vertical>
                <Button onClick={() => handleTabChange('virtual-try-on')}>
                  Configure Virtual Try-On
                </Button>
                <Button onClick={() => handleTabChange('recommendations')}>
                  Manage Recommendations
                </Button>
                <Button onClick={() => handleTabChange('analytics')}>
                  View Reports
                </Button>
              </ButtonGroup>
            </Stack>
          </Card>

          {/* Status Card */}
          <Card sectioned>
            <Stack vertical spacing="tight">
              <Heading>System Status</Heading>
              <Stack vertical spacing="extraTight">
                <Stack distribution="equalSpacing">
                  <TextStyle>API Status</TextStyle>
                  <Badge status="success">Operational</Badge>
                </Stack>
                <Stack distribution="equalSpacing">
                  <TextStyle>ML Models</TextStyle>
                  <Badge status="success">Up to Date</Badge>
                </Stack>
                <Stack distribution="equalSpacing">
                  <TextStyle>Product Sync</TextStyle>
                  <Badge status="success">Synced</Badge>
                </Stack>
              </Stack>
            </Stack>
          </Card>
        </Layout.Section>

        {/* Feature Tabs */}
        {selectedTab === 'analytics' && (
          <Layout.Section>
            <Analytics />
          </Layout.Section>
        )}

        {selectedTab === 'settings' && (
          <Layout.Section>
            <RecommendationSettings />
          </Layout.Section>
        )}

        {selectedTab === 'virtual-try-on' && (
          <Layout.Section>
            <VirtualTryOn />
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
