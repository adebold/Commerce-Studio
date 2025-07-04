import { http, HttpResponse } from 'msw';

// Sample mock report data
const mockReports = [
  {
    id: '1',
    title: 'Eye Examination Report',
    patientName: 'John Smith',
    date: '2025-02-15T14:30:00.000Z',
    doctor: 'Dr. Jane Wilson',
    status: 'completed',
    type: 'comprehensive',
    measurements: {
      pupillaryDistance: 63.5,
      leftEye: {
        sphere: -1.75,
        cylinder: -0.5,
        axis: 180,
        add: 0,
        pd: 31.5
      },
      rightEye: {
        sphere: -2.0,
        cylinder: -0.75,
        axis: 175,
        add: 0,
        pd: 32.0
      }
    },
    recommendations: [
      'Anti-reflective coating recommended',
      'UV protection recommended for outdoor activities'
    ],
    images: [
      {
        id: 'img1',
        url: '/mock-images/eye-scan-1.jpg',
        type: 'retinal-scan',
        date: '2025-02-15T14:35:00.000Z',
      }
    ]
  },
  {
    id: '2',
    title: 'Prescription Update',
    patientName: 'John Smith',
    date: '2025-03-10T11:15:00.000Z',
    doctor: 'Dr. Jane Wilson',
    status: 'pending',
    type: 'follow-up',
    measurements: {
      pupillaryDistance: 63.5,
      leftEye: {
        sphere: -1.75,
        cylinder: -0.75,
        axis: 178,
        add: 0,
        pd: 31.5
      },
      rightEye: {
        sphere: -2.0,
        cylinder: -0.75,
        axis: 175,
        add: 0,
        pd: 32.0
      }
    },
    recommendations: [
      'Consider progressive lenses for computer work'
    ],
    images: []
  }
];

export const reportsHandlers = [
  // Get all reports
  http.get('/api/reports', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const period = url.searchParams.get('period');
    const status = url.searchParams.get('status');
    
    let filteredReports = [...mockReports];
    
    // Apply search filter
    if (search) {
      filteredReports = filteredReports.filter(report => 
        report.title.toLowerCase().includes(search) || 
        report.patientName.toLowerCase().includes(search) ||
        report.doctor.toLowerCase().includes(search)
      );
    }
    
    // Apply period filter
    if (period) {
      const days = parseInt(period);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filteredReports = filteredReports.filter(report => 
        new Date(report.date) >= cutoffDate
      );
    }
    
    // Apply status filter
    if (status) {
      filteredReports = filteredReports.filter(report => 
        report.status === status
      );
    }
    
    return HttpResponse.json(filteredReports);
  }),
  
  // Get single report
  http.get('/api/reports/:id', ({ params }) => {
    const reportId = params.id as string;
    
    const report = mockReports.find(r => r.id === reportId);
    
    if (!report) {
      return new HttpResponse(
        JSON.stringify({ message: 'Report not found' }),
        { status: 404 }
      );
    }
    
    return HttpResponse.json(report);
  }),
  
  // Download report
  http.get('/api/reports/:id/download', ({ params }) => {
    const reportId = params.id as string;
    
    const report = mockReports.find(r => r.id === reportId);
    
    if (!report) {
      return new HttpResponse(
        JSON.stringify({ message: 'Report not found' }),
        { status: 404 }
      );
    }
    
    // Mock PDF content (in real world, this would be a binary PDF)
    const pdfContent = `Mock PDF content for ${report.title}`;
    
    return new HttpResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${reportId}.pdf"`
      }
    });
  }),
  
  // Get report image
  http.get('/api/reports/:reportId/images/:imageId', ({ params }) => {
    const reportId = params.reportId as string;
    const imageId = params.imageId as string;
    
    const report = mockReports.find(r => r.id === reportId);
    
    if (!report) {
      return new HttpResponse(
        JSON.stringify({ message: 'Report not found' }),
        { status: 404 }
      );
    }
    
    const image = report.images.find(img => img.id === imageId);
    
    if (!image) {
      return new HttpResponse(
        JSON.stringify({ message: 'Image not found' }),
        { status: 404 }
      );
    }
    
    // In a real handler, we would return the actual image
    // For testing, we're returning a mock image object
    return HttpResponse.json(image);
  })
];
