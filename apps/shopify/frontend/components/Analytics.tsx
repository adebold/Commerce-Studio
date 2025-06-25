import React from 'react';
import {
  Card,
  Tabs,
  Layout,
  DataTable,
  Select,
  Stack,
  Button,
  ButtonGroup,
  Heading,
  TextStyle,
  DatePicker,
  RangeSlider,
} from '@shopify/polaris';
import { useState, useCallback } from 'react';
import { LineChart, BarChart } from './charts';

export function Analytics() {
  const [selected, setSelected] = useState(0);
  const [dateRange, setDateRange] = useState('last_7_days');
  const [selectedMetrics, setSelectedMetrics] = useState(['views', 'try_ons', 'purchases']);

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );

  const tabs = [
    {
      id: 'overview',
      content: 'Overview',
      accessibilityLabel: 'Overview',
      panelID: 'overview-panel',
    },
    {
      id: 'recommendations',
      content: 'Recommendations',
      accessibilityLabel: 'Recommendations',
      panelID: 'recommendations-panel',
    },
    {
      id: 'try-ons',
      content: 'Virtual Try-Ons',
      accessibilityLabel: 'Virtual Try-Ons',
      panelID: 'try-ons-panel',
    },
  ];

  // Sample data for demonstration
  const overviewData = [
    ['Today', '150', '45', '30%', '$2,450'],
    ['Yesterday', '145', '42', '29%', '$2,380'],
    ['Last 7 Days', '980', '285', '29%', '$16,750'],
  ];

  const recommendationData = [
    ['Style Based', '450', '135', '30%', '$7,250'],
    ['Collaborative', '380', '114', '30%', '$6,120'],
    ['Hybrid', '150', '36', '24%', '$3,380'],
  ];

  const tryOnData = [
    ['Mobile', '580', '174', '30%', '$9,350'],
    ['Desktop', '320', '96', '30%', '$5,160'],
    ['Tablet', '80', '15', '19%', '$2,240'],
  ];

  return (
    <Card>
      <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
        <Card.Section>
          {/* Controls */}
          <Stack distribution="equalSpacing" alignment="center">
            <Select
              label="Date Range"
              options={[
                {label: 'Last 7 Days', value: 'last_7_days'},
                {label: 'Last 30 Days', value: 'last_30_days'},
                {label: 'Last 90 Days', value: 'last_90_days'},
                {label: 'Custom', value: 'custom'},
              ]}
              value={dateRange}
              onChange={(value) => setDateRange(value)}
            />
            <ButtonGroup>
              <Button>Export Data</Button>
              <Button primary>Generate Report</Button>
            </ButtonGroup>
          </Stack>

          {/* Overview Tab */}
          {selected === 0 && (
            <Layout>
              <Layout.Section>
                <Card sectioned>
                  <Stack vertical spacing="tight">
                    <Heading>Performance Overview</Heading>
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
                      rows={overviewData}
                    />
                  </Stack>
                </Card>
                <Card sectioned>
                  <LineChart
                    data={[/* Time series data */]}
                    metrics={selectedMetrics}
                  />
                </Card>
              </Layout.Section>
            </Layout>
          )}

          {/* Recommendations Tab */}
          {selected === 1 && (
            <Layout>
              <Layout.Section>
                <Card sectioned>
                  <Stack vertical spacing="tight">
                    <Heading>Recommendation Performance</Heading>
                    <DataTable
                      columnContentTypes={[
                        'text',
                        'numeric',
                        'numeric',
                        'numeric',
                        'numeric',
                      ]}
                      headings={[
                        'Algorithm',
                        'Impressions',
                        'Clicks',
                        'CTR',
                        'Revenue',
                      ]}
                      rows={recommendationData}
                    />
                  </Stack>
                </Card>
                <Card sectioned>
                  <BarChart
                    data={[/* Algorithm comparison data */]}
                    metrics={['impressions', 'clicks', 'revenue']}
                  />
                </Card>
              </Layout.Section>
            </Layout>
          )}

          {/* Virtual Try-Ons Tab */}
          {selected === 2 && (
            <Layout>
              <Layout.Section>
                <Card sectioned>
                  <Stack vertical spacing="tight">
                    <Heading>Try-On Performance by Platform</Heading>
                    <DataTable
                      columnContentTypes={[
                        'text',
                        'numeric',
                        'numeric',
                        'numeric',
                        'numeric',
                      ]}
                      headings={[
                        'Platform',
                        'Attempts',
                        'Completions',
                        'Success Rate',
                        'Revenue',
                      ]}
                      rows={tryOnData}
                    />
                  </Stack>
                </Card>
                <Card sectioned>
                  <Stack vertical spacing="tight">
                    <Heading>Success Rate Distribution</Heading>
                    <RangeSlider
                      output
                      label="Success Rate Threshold"
                      value={80}
                      min={0}
                      max={100}
                      onChange={() => {}}
                    />
                  </Stack>
                </Card>
              </Layout.Section>
            </Layout>
          )}
        </Card.Section>
      </Tabs>
    </Card>
  );
}
