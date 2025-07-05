import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  FormControl, 
  FormControlLabel, 
  Radio, 
  RadioGroup, 
  TextField, 
  Typography,
  MenuItem,
  Select,
  InputLabel,
  SelectChangeEvent,
  Snackbar,
  Alert
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

interface ReportExportProps {
  reportName?: string;
  disabled?: boolean;
}

const ReportExport: React.FC<ReportExportProps> = ({
  reportName = 'Analytics Report',
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [fileName, setFileName] = useState(reportName.replace(/\s+/g, '-').toLowerCase());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleFormatChange = (event: SelectChangeEvent<ExportFormat>) => {
    setFormat(event.target.value as ExportFormat);
  };
  
  const handleIncludeChartsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeCharts(event.target.value === 'true');
  };
  
  const handleExport = () => {
    // In a real implementation, this would trigger an API call to generate the export
    console.log('Exporting report:', {
      fileName,
      format,
      includeCharts
    });
    
    // Close the dialog
    setOpen(false);
    
    // Show success message
    setSnackbarOpen(true);
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FileDownloadIcon />}
        onClick={handleOpen}
        disabled={disabled}
      >
        Export Report
      </Button>
      
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Export your report data in various formats for further analysis or presentation.
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <TextField
              label="File Name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              fullWidth
              margin="normal"
              helperText="The name of the exported file (without extension)"
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="export-format-label">Export Format</InputLabel>
              <Select
                labelId="export-format-label"
                id="export-format"
                value={format}
                label="Export Format"
                onChange={handleFormatChange}
              >
                <MenuItem value="csv">CSV (.csv)</MenuItem>
                <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                <MenuItem value="pdf">PDF (.pdf)</MenuItem>
                <MenuItem value="json">JSON (.json)</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Include Visualizations
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={includeCharts.toString()}
                onChange={handleIncludeChartsChange}
              >
                <FormControlLabel 
                  value="true" 
                  control={<Radio />} 
                  label="Include charts and visualizations (PDF only)" 
                />
                <FormControlLabel 
                  value="false" 
                  control={<Radio />} 
                  label="Data only" 
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleExport} 
            variant="contained"
            disabled={!fileName.trim()}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Report exported successfully as {fileName}.{format}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ReportExport;