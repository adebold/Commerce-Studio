import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ApiUsageData {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  requestsByDay: Record<string, number>;
  requestsByEndpoint: Record<string, number>;
  requestsByStatusCode: Record<string, number>;
  requestsByApiKey: Record<string, number>;
}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
}

interface OAuthClient {
  id: string;
  name: string;
  clientId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57', '#FFC658', '#8DD1E1'];

const UsageAnalytics: React.FC = () => {
  const { getAuthenticatedRequest } = useAuth();
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<ApiUsageData | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [oauthClients, setOauthClients] = useState<OAuthClient[]>([]);
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [selectedApiKey, setSelectedApiKey] = useState<string>('all');
  const [selectedOAuthClient, setSelectedOAuthClient] = useState<string>('all');

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const request = getAuthenticatedRequest();
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);
      if (selectedApiKey !== 'all') {
        params.append('apiKeyId', selectedApiKey);
      }
      if (selectedOAuthClient !== 'all') {
        params.append('clientId', selectedOAuthClient);
      }
      
      const response = await request.get(`/api/developer/analytics/usage?${params.toString()}`);
      setUsageData(response.data);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const request = getAuthenticatedRequest();
      const response = await request.get('/api/developer/api-keys');
      setApiKeys(response.data);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const fetchOAuthClients = async () => {
    try {
      const request = getAuthenticatedRequest();
      const response = await request.get('/api/developer/oauth/clients');
      setOauthClients(response.data);
    } catch (error) {
      console.error('Error fetching OAuth clients:', error);
    }
  };

  useEffect(() => {
    fetchApiKeys();
    fetchOAuthClients();
  }, []);

  useEffect(() => {
    fetchUsageData();
  }, [timeRange, selectedApiKey, selectedOAuthClient]);

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  const handleApiKeyChange = (event: SelectChangeEvent) => {
    setSelectedApiKey(event.target.value);
  };

  const handleOAuthClientChange = (event: SelectChangeEvent) => {
    setSelectedOAuthClient(event.target.value);
  };

  // Transform data for charts
  const prepareRequestsByDayData = () => {
    if (!usageData) return [];
    
    return Object.entries(usageData.requestsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const prepareEndpointData = () => {
    if (!usageData) return [];
    
    return Object.entries(usageData.requestsByEndpoint)
      .map(([endpoint, count]) => ({
        endpoint: endpoint.length > 30 ? endpoint.substring(0, 27) + '...' : endpoint,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 endpoints
  };

  const prepareStatusCodeData = () => {
    if (!usageData) return [];
    
    return Object.entries(usageData.requestsByStatusCode)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);
  };

  const prepareApiKeyData = () => {
    if (!usageData) return [];
    
    return Object.entries(usageData.requestsByApiKey)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 API keys
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">API Usage Analytics</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
              size="small"
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="api-key-label">API Key</InputLabel>
            <Select
              labelId="api-key-label"
              value={selectedApiKey}
              label="API Key"
              onChange={handleApiKeyChange}
              size="small"
            >
              <MenuItem value="all">All API Keys</MenuItem>
              {apiKeys.map(key => (
                <MenuItem key={key.id} value={key.id}>{key.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="oauth-client-label">OAuth Client</InputLabel>
            <Select
              labelId="oauth-client-label"
              value={selectedOAuthClient}
              label="OAuth Client"
              onChange={handleOAuthClientChange}
              size="small"
            >
              <MenuItem value="all">All OAuth Clients</MenuItem>
              {oauthClients.map(client => (
                <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading analytics data...</Typography>
        </Box>
      ) : !usageData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>No data available</Typography>
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant="h4">
                    {usageData.totalRequests.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h4">
                    {usageData.successRate.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4">
                    {usageData.avgResponseTime.toFixed(0)} ms
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Unique Endpoints
                  </Typography>
                  <Typography variant="h4">
                    {Object.keys(usageData.requestsByEndpoint).length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            {/* Requests Over Time */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Requests Over Time
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={prepareRequestsByDayData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" name="Requests" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Top Endpoints */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Top Endpoints
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareEndpointData()}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="process.env.USAGEANALYTICS_SECRET_2" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Requests" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Status Codes */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Status Codes
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareStatusCodeData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ code, percent }) => `${code}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="code"
                      >
                        {prepareStatusCodeData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* API Key Usage */}
            {Object.keys(usageData.requestsByApiKey).length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Top API Keys by Usage
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={prepareApiKeyData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Requests" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default UsageAnalytics;