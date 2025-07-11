import React, { useEffect, useState } from 'react';
import { Box, Card, Flex, Grid, Heading, Loader, Text } from '@bigcommerce/big-design';
import { LineChart, BarChart, PieChart } from '@bigcommerce/big-design-charts';
import { ApiClient } from '../../lib/api-client';

interface DashboardProps {
  apiClient: ApiClient;
}

interface DashboardData {
  metrics: {
    views: number;
    try_ons: number;
    recommendations_viewed: number;
    recommendations_clicked: number;
    face_shape_detections: number;
    product_comparisons: number;
  };
  top_products: Array<{
    id: number;
    name: string;
    views: number;
    try_ons: number;
    conversion_rate: number;
  }>;
  face_shape_distribution: {
    oval: number;
    round: number;
    square: number;
    heart: number;
    oblong: number;
    diamond: number;
  };
  engagement_over_time: Array<{
    date: string;
    views: number;
    try_ons: number;
    recommendations_clicked: number;
  }>;
}

const Dashboard: React.FC<DashboardProps> = ({ apiClient }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getAnalyticsDashboard();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [apiClient, dateRange]);

  if (loading) {
    return (
      <Box marginY="xxLarge" marginX="auto" textAlign="center">
        <Loader />
        <Text marginTop="medium">Loading dashboard data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box marginY="xxLarge" marginX="auto" textAlign="center">
        <Text color="danger">{error}</Text>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box marginY="xxLarge" marginX="auto" textAlign="center">
        <Text>No data available. Please check your configuration.</Text>
      </Box>
    );
  }

  const { metrics, top_products, face_shape_distribution, engagement_over_time } = dashboardData;

  // Prepare data for charts
  const engagementChartData = engagement_over_time.map(item => ({
    date: new Date(item.date),
    Views: item.views,
    'Try-Ons': item.try_ons,
    'process.env.DASHBOARD_SECRET': item.recommendations_clicked,
  }));

  const topProductsChartData = top_products.map(product => ({
    name: product.name,
    Views: product.views,
    'Try-Ons': product.try_ons,
  }));

  const faceShapeChartData = [
    { name: 'Oval', value: face_shape_distribution.oval },
    { name: 'Round', value: face_shape_distribution.round },
    { name: 'Square', value: face_shape_distribution.square },
    { name: 'Heart', value: face_shape_distribution.heart },
    { name: 'Oblong', value: face_shape_distribution.oblong },
    { name: 'Diamond', value: face_shape_distribution.diamond },
  ];

  return (
    <Box>
      <Heading>VARAi Analytics Dashboard</Heading>
      
      {/* Key Metrics */}
      <Grid gridColumns="repeat(3, 1fr)" gridGap="medium" marginY="large">
        <MetricCard title="Product Views" value={metrics.views} />
        <MetricCard title="Virtual Try-Ons" value={metrics.try_ons} />
        <MetricCard title="Recommendations Viewed" value={metrics.recommendations_viewed} />
        <MetricCard title="Recommendations Clicked" value={metrics.recommendations_clicked} />
        <MetricCard title="Face Shape Detections" value={metrics.face_shape_detections} />
        <MetricCard title="Product Comparisons" value={metrics.product_comparisons} />
      </Grid>

      {/* Engagement Over Time */}
      <Card
        header="Engagement Over Time"
        marginY="large"
        action={{
          content: dateRange,
          onItemClick: item => setDateRange(item.value as '7d' | '30d' | '90d'),
          items: [
            { content: 'Last 7 Days', value: '7d' },
            { content: 'Last 30 Days', value: '30d' },
            { content: 'Last 90 Days', value: '90d' },
          ],
        }}
      >
        <Box height="400px">
          <LineChart
            data={engagementChartData}
            xAxisDataKey="date"
            series={[
              { dataKey: 'Views', name: 'Views', color: '#3C64F4' },
              { dataKey: 'Try-Ons', name: 'Try-Ons', color: '#FF5C35' },
              { dataKey: 'process.env.DASHBOARD_SECRET', name: 'process.env.DASHBOARD_SECRET', color: '#00A656' },
            ]}
          />
        </Box>
      </Card>

      <Flex flexDirection={['column', 'column', 'row']} marginY="large">
        {/* Top Products */}
        <Card header="Top Products" marginRight={['none', 'none', 'medium']} marginBottom={['medium', 'medium', 'none']} flex={1}>
          <Box height="400px">
            <BarChart
              data={topProductsChartData}
              xAxisDataKey="name"
              series={[
                { dataKey: 'Views', name: 'Views', color: '#3C64F4' },
                { dataKey: 'Try-Ons', name: 'Try-Ons', color: '#FF5C35' },
              ]}
            />
          </Box>
        </Card>

        {/* Face Shape Distribution */}
        <Card header="Face Shape Distribution" flex={1}>
          <Box height="400px">
            <PieChart
              data={faceShapeChartData}
              dataKey="value"
              nameKey="name"
              colors={['#3C64F4', '#FF5C35', '#00A656', '#FFBF00', '#9B51E0', '#FF8888']}
            />
          </Box>
        </Card>
      </Flex>

      {/* Top Products Table */}
      <Card header="Top Products Details" marginY="large">
        <Box overflowX="auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Product</th>
                <th style={tableHeaderStyle}>Views</th>
                <th style={tableHeaderStyle}>Try-Ons</th>
                <th style={tableHeaderStyle}>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {top_products.map(product => (
                <tr key={product.id}>
                  <td style={tableCellStyle}>{product.name}</td>
                  <td style={tableCellStyle}>{product.views}</td>
                  <td style={tableCellStyle}>{product.try_ons}</td>
                  <td style={tableCellStyle}>{(product.conversion_rate * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Card>
    </Box>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value }) => (
  <Card>
    <Flex flexDirection="column" alignItems="center" justifyContent="center" padding="medium">
      <Text color="secondary" marginBottom="small">{title}</Text>
      <Heading marginBottom="none">{value.toLocaleString()}</Heading>
    </Flex>
  </Card>
);

const tableHeaderStyle = {
  textAlign: 'left' as const,
  padding: '12px',
  borderBottom: '1px solid #E3E6EF',
  backgroundColor: '#F6F7F9',
};

const tableCellStyle = {
  padding: '12px',
  borderBottom: '1px solid #E3E6EF',
};

export default Dashboard;