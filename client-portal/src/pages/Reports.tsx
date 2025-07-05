import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
  status: string;
}

// Mock data for reports
const mockReports: Report[] = [
  { id: '1', title: 'Monthly Analysis', date: '2025-03-01', type: 'Monthly', status: 'Completed' },
  { id: '2', title: 'Weekly Metrics', date: '2025-03-10', type: 'Weekly', status: 'Completed' },
  { id: '3', title: 'Performance Review', date: '2025-03-15', type: 'Quarterly', status: 'Pending' },
];

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewReport = (id: string) => {
    navigate(`/reports/${id}`);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table aria-label="reports table">
            <TableHead>
              <TableRow>
                <TableCell>Report Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockReports
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((report) => (
                  <TableRow key={report.id}>
                    <TableCell component="th" scope="row">
                      {report.title}
                    </TableCell>
                    <TableCell>
                      {new Date(report.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.status}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleViewReport(report.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {mockReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No reports found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={mockReports.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default Reports;
