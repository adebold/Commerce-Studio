import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Divider, 
  FormControl, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Paper, 
  Select, 
  SelectChangeEvent, 
  TextField, 
  Typography 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { ReportConfig } from '../../../services/analytics';

interface CustomReportBuilderProps {
  onSave: (config: Omit<ReportConfig, 'id' | 'createdAt' | 'lastModified'>) => void;
  initialConfig?: Partial<ReportConfig>;
}

type MetricOption = {
  id: string;
  name: string;
  category: string;
};

type DimensionOption = {
  id: string;
  name: string;
  category: string;
};

type VisualizationType = 'line' | 'bar' | 'pie' | 'funnel' | 'heatmap' | 'table';

const CustomReportBuilder: React.FC<CustomReportBuilderProps> = ({
  onSave,
  initialConfig
}) => {
  // Report configuration state
  const [reportName, setReportName] = useState(initialConfig?.name || '');
  const [reportDescription, setReportDescription] = useState(initialConfig?.description || '');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [visualizationType, setVisualizationType] = useState<VisualizationType>(
    initialConfig?.visualizationType || 'bar'
  );
  
  // Dialog state
  const [metricDialogOpen, setMetricDialogOpen] = useState(false);
  const [dimensionDialogOpen, setDimensionDialogOpen] = useState(false);
  
  // Mock data for metrics and dimensions
  const availableMetrics: MetricOption[] = [
    { id: 'revenue', name: 'Revenue', category: 'Sales' },
    { id: 'orders', name: 'Orders', category: 'Sales' },
    { id: 'aov', name: 'Average Order Value', category: 'Sales' },
    { id: 'conversion_rate', name: 'Conversion Rate', category: 'Engagement' },
    { id: 'bounce_rate', name: 'Bounce Rate', category: 'Engagement' },
    { id: 'page_views', name: 'Page Views', category: 'Engagement' },
    { id: 'time_on_site', name: 'Time on Site', category: 'Engagement' },
    { id: 'new_users', name: 'New Users', category: 'Users' },
    { id: 'returning_users', name: 'Returning Users', category: 'Users' },
    { id: 'active_users', name: 'Active Users', category: 'Users' }
  ];
  
  const availableDimensions: DimensionOption[] = [
    { id: 'date', name: 'Date', category: 'Time' },
    { id: 'week', name: 'Week', category: 'Time' },
    { id: 'month', name: 'Month', category: 'Time' },
    { id: 'quarter', name: 'Quarter', category: 'Time' },
    { id: 'year', name: 'Year', category: 'Time' },
    { id: 'product', name: 'Product', category: 'Product' },
    { id: 'category', name: 'Category', category: 'Product' },
    { id: 'brand', name: 'Brand', category: 'Product' },
    { id: 'device', name: 'Device', category: 'User' },
    { id: 'country', name: 'Country', category: 'User' },
    { id: 'region', name: 'Region', category: 'User' },
    { id: 'channel', name: 'Channel', category: 'Marketing' },
    { id: 'campaign', name: 'Campaign', category: 'Marketing' },
    { id: 'source', name: 'Source', category: 'Marketing' }
  ];
  
  // Handle metric selection
  const handleMetricSelect = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedMetrics(typeof value === 'string' ? [value] : value);
    setMetricDialogOpen(false);
  };
  
  // Handle dimension selection
  const handleDimensionSelect = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedDimensions(typeof value === 'string' ? [value] : value);
    setDimensionDialogOpen(false);
  };
  
  // Handle visualization type change
  const handleVisualizationTypeChange = (event: SelectChangeEvent<VisualizationType>) => {
    setVisualizationType(event.target.value as VisualizationType);
  };
  
  // Handle metric removal
  const handleRemoveMetric = (metricId: string) => {
    setSelectedMetrics(selectedMetrics.filter(id => id !== metricId));
  };
  
  // Handle dimension removal
  const handleRemoveDimension = (dimensionId: string) => {
    setSelectedDimensions(selectedDimensions.filter(id => id !== dimensionId));
  };
  
  // Handle report save
  const handleSave = () => {
    // Create date range for the last 30 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    onSave({
      name: reportName,
      description: reportDescription,
      type: 'custom',
      filters: {
        dateRange: {
          startDate: startDate.toISOString().split('T')[0],
          endDate
        }
      },
      visualizationType,
      // In a real implementation, we would also save the selected metrics and dimensions
    });
  };
  
  // Get metric name by ID
  const getMetricName = (id: string) => {
    const metric = availableMetrics.find(m => m.id === id);
    return metric ? metric.name : id;
  };
  
  // Get dimension name by ID
  const getDimensionName = (id: string) => {
    const dimension = availableDimensions.find(d => d.id === id);
    return dimension ? dimension.name : id;
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Custom Report Builder</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Create a custom report by selecting metrics, dimensions, and visualization type
      </Typography>
      
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Report Name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="visualization-type-label">Visualization Type</InputLabel>
              <Select
                labelId="visualization-type-label"
                id="visualization-type"
                value={visualizationType}
                label="Visualization Type"
                onChange={handleVisualizationTypeChange}
              >
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
                <MenuItem value="funnel">Funnel Chart</MenuItem>
                <MenuItem value="heatmap">Heatmap</MenuItem>
                <MenuItem value="table">Table</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Report Description"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Metrics</Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={() => setMetricDialogOpen(true)}
                  size="small"
                >
                  Add Metric
                </Button>
              </Box>
              
              {selectedMetrics.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No metrics selected
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedMetrics.map((metricId) => (
                    <Chip
                      key={metricId}
                      label={getMetricName(metricId)}
                      onDelete={() => handleRemoveMetric(metricId)}
                      deleteIcon={<DeleteIcon />}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Dimensions</Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={() => setDimensionDialogOpen(true)}
                  size="small"
                >
                  Add Dimension
                </Button>
              </Box>
              
              {selectedDimensions.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No dimensions selected
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedDimensions.map((dimensionId) => (
                    <Chip
                      key={dimensionId}
                      label={getDimensionName(dimensionId)}
                      onDelete={() => handleRemoveDimension(dimensionId)}
                      deleteIcon={<DeleteIcon />}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!reportName || selectedMetrics.length === 0}
        >
          Save Report
        </Button>
      </Box>
      
      {/* Metric Selection Dialog */}
      <Dialog 
        open={metricDialogOpen} 
        onClose={() => setMetricDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Metrics</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="metrics-select-label">Metrics</InputLabel>
            <Select
              labelId="metrics-select-label"
              id="metrics-select"
              multiple
              value={selectedMetrics}
              onChange={handleMetricSelect}
              label="Metrics"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={getMetricName(value)} size="small" />
                  ))}
                </Box>
              )}
            >
              {availableMetrics.map((metric) => (
                <MenuItem key={metric.id} value={metric.id}>
                  {metric.name} ({metric.category})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMetricDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setMetricDialogOpen(false)} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dimension Selection Dialog */}
      <Dialog 
        open={dimensionDialogOpen} 
        onClose={() => setDimensionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Dimensions</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="dimensions-select-label">Dimensions</InputLabel>
            <Select
              labelId="dimensions-select-label"
              id="dimensions-select"
              multiple
              value={selectedDimensions}
              onChange={handleDimensionSelect}
              label="Dimensions"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={getDimensionName(value)} size="small" />
                  ))}
                </Box>
              )}
            >
              {availableDimensions.map((dimension) => (
                <MenuItem key={dimension.id} value={dimension.id}>
                  {dimension.name} ({dimension.category})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDimensionDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setDimensionDialogOpen(false)} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CustomReportBuilder;