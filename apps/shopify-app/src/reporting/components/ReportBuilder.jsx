import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
  LineChart as LineChartIcon
} from '@mui/icons-material';
import axios from 'axios';

// Chart components
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Report Builder Component
 * This component allows users to create and customize reports
 */
function ReportBuilder() {
  // State for report templates
  const [reportTemplates, setReportTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  // State for report configurations
  const [reportConfigurations, setReportConfigurations] = useState([]);
  const [selectedConfiguration, setSelectedConfiguration] = useState(null);
  
  // State for report data
  const [reportData, setReportData] = useState(null);
  
  // State for report customization
  const [filters, setFilters] = useState([]);
  const [grouping, setGrouping] = useState(null);
  const [sorting, setSorting] = useState(null);
  const [visualization, setVisualization] = useState('table');
  
  // State for UI
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  
  // Fetch report templates on component mount
  useEffect(() => {
    fetchReportTemplates();
    fetchReportConfigurations();
  }, []);
  
  // Fetch report templates
  const fetchReportTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/report-templates');
      setReportTemplates(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching report templates:', err);
      setError('Error fetching report templates');
      setIsLoading(false);
    }
  };
  
  // Fetch report configurations
  const fetchReportConfigurations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/report-configurations');
      setReportConfigurations(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching report configurations:', err);
      setError('Error fetching report configurations');
      setIsLoading(false);
    }
  };
  
  // Handle template selection
  const handleTemplateChange = (event) => {
    const templateId = event.target.value;
    setSelectedTemplate(templateId);
    
    // Find the selected template
    const template = reportTemplates.find(t => t._id === templateId);
    
    // Reset customization options
    setFilters([]);
    setGrouping(null);
    setSorting(null);
    setVisualization('table');
    
    // Set default customization options based on template
    if (template && template.customizationOptions) {
      if (template.customizationOptions.defaultFilters) {
        setFilters(template.customizationOptions.defaultFilters);
      }
      
      if (template.customizationOptions.defaultGrouping) {
        setGrouping(template.customizationOptions.defaultGrouping);
      }
      
      if (template.customizationOptions.defaultSorting) {
        setSorting(template.customizationOptions.defaultSorting);
      }
      
      if (template.customizationOptions.defaultVisualization) {
        setVisualization(template.customizationOptions.defaultVisualization);
      }
    }
  };
  
  // Handle configuration selection
  const handleConfigurationChange = (event) => {
    const configId = event.target.value;
    
    if (configId === '') {
      setSelectedConfiguration(null);
      return;
    }
    
    // Find the selected configuration
    const config = reportConfigurations.find(c => c._id === configId);
    setSelectedConfiguration(config);
    
    // Set customization options based on configuration
    if (config) {
      setSelectedTemplate(config.reportTemplateId);
      
      if (config.filters) {
        setFilters(config.filters);
      }
      
      if (config.grouping) {
        setGrouping(config.grouping);
      }
      
      if (config.sorting) {
        setSorting(config.sorting);
      }
      
      if (config.visualization) {
        setVisualization(config.visualization);
      }
    }
  };
  
  // Handle adding a filter
  const handleAddFilter = () => {
    setFilters([...filters, { field: '', operator: '=', value: '' }]);
  };
  
  // Handle removing a filter
  const handleRemoveFilter = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };
  
  // Handle filter change
  const handleFilterChange = (index, field, value) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };
  
  // Handle grouping change
  const handleGroupingChange = (event) => {
    setGrouping(event.target.value);
  };
  
  // Handle sorting change
  const handleSortingChange = (field, value) => {
    setSorting({ ...sorting, [field]: value });
  };
  
  // Handle visualization change
  const handleVisualizationChange = (event, newValue) => {
    setVisualization(newValue);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle generate report
  const handleGenerateReport = async () => {
    try {
      setIsLoading(true);
      
      // Create report configuration
      const reportConfig = {
        reportTemplateId: selectedTemplate,
        filters,
        grouping,
        sorting,
        visualization
      };
      
      // Generate report
      const response = await axios.post('/api/reports', reportConfig);
      setReportData(response.data);
      
      setIsLoading(false);
      setActiveTab(1); // Switch to Results tab
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Error generating report');
      setIsLoading(false);
    }
  };
  
  // Handle save configuration
  const handleSaveConfiguration = async () => {
    try {
      setIsLoading(true);
      
      // Create report configuration
      const reportConfig = {
        name: reportName,
        description: reportDescription,
        reportTemplateId: selectedTemplate,
        filters,
        grouping,
        sorting,
        visualization
      };
      
      // Save configuration
      if (selectedConfiguration) {
        // Update existing configuration
        await axios.put(`/api/report-configurations/${selectedConfiguration._id}`, reportConfig);
      } else {
        // Create new configuration
        const response = await axios.post('/api/report-configurations', reportConfig);
        setSelectedConfiguration(response.data);
      }
      
      // Refresh configurations
      fetchReportConfigurations();
      
      setSaveDialogOpen(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Error saving report configuration:', err);
      setError('Error saving report configuration');
      setIsLoading(false);
    }
  };
  
  // Render visualization
  const renderVisualization = () => {
    if (!reportData) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No report data available. Generate a report to see results.
          </Typography>
        </Box>
      );
    }
    
    // Sample data for demonstration
    const chartData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [
        {
          label: 'Sales',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
    
    switch (visualization) {
      case 'bar':
        return <Bar data={chartData} />;
      case 'line':
        return <Line data={chartData} />;
      case 'pie':
        return <Pie data={chartData} />;
      case 'table':
      default:
        return (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Month</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Sales</th>
                </tr>
              </thead>
              <tbody>
                {chartData.labels.map((month, index) => (
                  <tr key={month}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{month}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{chartData.datasets[0].data[index]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        );
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Report Builder
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Builder" />
        <Tab label="Results" />
      </Tabs>
      
      {activeTab === 0 ? (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Report Configuration
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Report Template</InputLabel>
                  <Select
                    value={selectedTemplate}
                    onChange={handleTemplateChange}
                    label="Report Template"
                  >
                    <MenuItem value="">
                      <em>Select a template</em>
                    </MenuItem>
                    {reportTemplates.map((template) => (
                      <MenuItem key={template._id} value={template._id}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Saved Configurations</InputLabel>
                  <Select
                    value={selectedConfiguration ? selectedConfiguration._id : ''}
                    onChange={handleConfigurationChange}
                    label="Saved Configurations"
                  >
                    <MenuItem value="">
                      <em>Select a configuration</em>
                    </MenuItem>
                    {reportConfigurations.map((config) => (
                      <MenuItem key={config._id} value={config._id}>
                        {config.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
          
          {selectedTemplate && (
            <>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Filters
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddFilter}
                  >
                    Add Filter
                  </Button>
                </Box>
                
                {filters.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No filters applied. Click "Add Filter" to add a filter.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {filters.map((filter, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <TextField
                            label="Field"
                            value={filter.field}
                            onChange={(e) => handleFilterChange(index, 'field', e.target.value)}
                            sx={{ flexGrow: 1 }}
                          />
                          <TextField
                            select
                            label="Operator"
                            value={filter.operator}
                            onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                            sx={{ width: '120px' }}
                          >
                            <MenuItem value="=">=</MenuItem>
                            <MenuItem value="!=">!=</MenuItem>
                            <MenuItem value=">">&gt;</MenuItem>
                            <MenuItem value="<">&lt;</MenuItem>
                            <MenuItem value=">=">&gt;=</MenuItem>
                            <MenuItem value="<=">&lt;=</MenuItem>
                          </TextField>
                          <TextField
                            label="Value"
                            value={filter.value}
                            onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                            sx={{ flexGrow: 1 }}
                          />
                          <IconButton onClick={() => handleRemoveFilter(index)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
              
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Grouping & Sorting
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Group By</InputLabel>
                      <Select
                        value={grouping || ''}
                        onChange={handleGroupingChange}
                        label="Group By"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value="month">Month</MenuItem>
                        <MenuItem value="category">Category</MenuItem>
                        <MenuItem value="customer">Customer</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={sorting ? sorting.field : ''}
                        onChange={(e) => handleSortingChange('field', e.target.value)}
                        label="Sort By"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value="date">Date</MenuItem>
                        <MenuItem value="amount">Amount</MenuItem>
                        <MenuItem value="name">Name</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {sorting && sorting.field && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Sort Order</InputLabel>
                        <Select
                          value={sorting.order || 'asc'}
                          onChange={(e) => handleSortingChange('order', e.target.value)}
                          label="Sort Order"
                        >
                          <MenuItem value="asc">Ascending</MenuItem>
                          <MenuItem value="desc">Descending</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </Paper>
              
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Visualization
                </Typography>
                
                <Tabs
                  value={visualization}
                  onChange={handleVisualizationChange}
                  variant="fullWidth"
                  sx={{ mb: 2 }}
                >
                  <Tab icon={<TableChartIcon />} label="Table" value="table" />
                  <Tab icon={<BarChartIcon />} label="Bar Chart" value="bar" />
                  <Tab icon={<LineChartIcon />} label="Line Chart" value="line" />
                  <Tab icon={<PieChartIcon />} label="Pie Chart" value="pie" />
                </Tabs>
              </Paper>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={() => setSaveDialogOpen(true)}
                >
                  Save Configuration
                </Button>
                
                <Button
                  variant="contained"
                  onClick={handleGenerateReport}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Generate Report'}
                </Button>
              </Box>
            </>
          )}
          
          {/* Save Configuration Dialog */}
          <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
            <DialogTitle>Save Report Configuration</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Report Name"
                fullWidth
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveConfiguration} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
        </Box>
      ) : (
        <Box>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Report Results
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleGenerateReport}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </Box>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            ) : (
              renderVisualization()
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default ReportBuilder;