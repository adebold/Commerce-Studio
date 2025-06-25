import React, { useState, useEffect } from 'react';
import { QAAnalytics } from '../../api/types';

interface AnalyticsDashboardProps {
  merchantId: string;
  apiBaseUrl: string;
  startDate?: string;
  endDate?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  merchantId,
  apiBaseUrl,
  startDate,
  endDate,
}) => {
  const [analytics, setAnalytics] = useState<QAAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would be an actual API call
        // const response = await fetch(`${apiBaseUrl}/analytics?startDate=${startDate}&endDate=${endDate}`);
        // const data = await response.json();
        
        // For this placeholder, we'll use mock data
        const mockAnalytics: QAAnalytics = {
          totalQuestions: 156,
          totalAnswers: 142,
          averageResponseTime: 5.2, // in hours
          topProducts: [
            {
              productId: 'p1',
              productTitle: 'Classic Aviator Sunglasses',
              questionCount: 32,
            },
            {
              productId: 'p2',
              productTitle: 'Round Metal Eyeglasses',
              questionCount: 28,
            },
            {
              productId: 'p3',
              productTitle: 'Wayfarer Prescription Glasses',
              questionCount: 24,
            },
            {
              productId: 'p4',
              productTitle: 'Cat Eye Sunglasses',
              questionCount: 19,
            },
            {
              productId: 'p5',
              productTitle: 'Rectangular Reading Glasses',
              questionCount: 15,
            },
          ],
          questionsByDate: generateDateData(30, 0, 8),
          answersByDate: generateDateData(30, 0, 7),
          conversionImpact: {
            withQA: 4.2, // 4.2% conversion rate for products with Q&A
            withoutQA: 2.8, // 2.8% conversion rate for products without Q&A
          },
        };
        
        setAnalytics(mockAnalytics);
        setLoading(false);
      } catch (err) {
        setError('Failed to load analytics data');
        setLoading(false);
        console.error('Error fetching analytics:', err);
      }
    };

    fetchAnalytics();
  }, [apiBaseUrl, merchantId, startDate, endDate, dateRange]);

  // Helper function to generate mock date-based data
  function generateDateData(days: number, min: number, max: number) {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * (max - min + 1)) + min,
      });
    }
    
    return data;
  }

  // Calculate conversion lift
  const conversionLift = analytics ? 
    ((analytics.conversionImpact.withQA - analytics.conversionImpact.withoutQA) / 
    analytics.conversionImpact.withoutQA * 100).toFixed(1) : 
    '0';

  // Calculate answer rate
  const answerRate = analytics ? 
    ((analytics.totalAnswers / analytics.totalQuestions) * 100).toFixed(1) : 
    '0';

  // Inline styles for the dashboard
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0,
    },
    dateControls: {
      display: 'flex',
      gap: '10px',
    },
    dateButton: {
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'normal',
      backgroundColor: '#f5f7fa',
      border: 'none',
    },
    activeDateButton: {
      backgroundColor: '#4A90E2',
      color: 'white',
      fontWeight: 'bold',
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px',
      marginBottom: '30px',
    },
    statCard: {
      backgroundColor: '#f5f7fa',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '5px',
      color: '#4A90E2',
    },
    statLabel: {
      fontSize: '14px',
      color: '#666',
    },
    chartContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '30px',
    },
    chart: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    chartTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
    },
    barChart: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '300px',
      gap: '10px',
    },
    barContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    barLabel: {
      width: '200px',
      fontSize: '14px',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden' as const,
      textOverflow: 'ellipsis' as const,
    },
    bar: {
      height: '30px',
      backgroundColor: '#4A90E2',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    },
    barValue: {
      fontSize: '14px',
      fontWeight: 'bold',
    },
    lineChart: {
      height: '300px',
      position: 'relative' as const,
      marginTop: '20px',
    },
    lineChartGrid: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      height: '100%',
      borderLeft: '1px solid #eee',
      borderBottom: '1px solid #eee',
      position: 'relative' as const,
    },
    lineChartLine: {
      position: 'absolute' as const,
      bottom: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: 1,
    },
    lineChartDot: {
      position: 'absolute' as const,
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#4A90E2',
      transform: 'translate(-50%, 50%)',
      zIndex: 2,
    },
    lineChartLabel: {
      position: 'absolute' as const,
      bottom: '-25px',
      fontSize: '12px',
      transform: 'translateX(-50%)',
      color: '#666',
    },
    lineChartLegend: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginTop: '40px',
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '14px',
    },
    legendColor: {
      width: '12px',
      height: '12px',
      borderRadius: '2px',
    },
    conversionChart: {
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      height: '300px',
      padding: '20px 0',
    },
    conversionBar: {
      width: '100px',
      backgroundColor: '#4A90E2',
      borderRadius: '4px 4px 0 0',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '10px 0',
    },
    conversionValue: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '18px',
    },
    conversionLabel: {
      marginTop: '10px',
      fontSize: '14px',
      textAlign: 'center' as const,
    },
    loading: {
      textAlign: 'center' as const,
      padding: '50px',
      fontSize: '18px',
      color: '#666',
    },
    error: {
      color: 'red',
      marginBottom: '15px',
    },
  };

  // Render loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Q&A Analytics Dashboard</h1>
        </div>
        <div style={styles.loading}>Loading analytics data...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Q&A Analytics Dashboard</h1>
        </div>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  // Render dashboard
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Q&A Analytics Dashboard</h1>
        
        <div style={styles.dateControls}>
          <button
            style={{
              ...styles.dateButton,
              ...(dateRange === '7d' ? styles.activeDateButton : {}),
            }}
            onClick={() => setDateRange('7d')}
          >
            Last 7 Days
          </button>
          
          <button
            style={{
              ...styles.dateButton,
              ...(dateRange === '30d' ? styles.activeDateButton : {}),
            }}
            onClick={() => setDateRange('30d')}
          >
            Last 30 Days
          </button>
          
          <button
            style={{
              ...styles.dateButton,
              ...(dateRange === '90d' ? styles.activeDateButton : {}),
            }}
            onClick={() => setDateRange('90d')}
          >
            Last 90 Days
          </button>
          
          <button
            style={{
              ...styles.dateButton,
              ...(dateRange === 'all' ? styles.activeDateButton : {}),
            }}
            onClick={() => setDateRange('all')}
          >
            All Time
          </button>
        </div>
      </div>
      
      {analytics && (
        <>
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{analytics.totalQuestions}</div>
              <div style={styles.statLabel}>Total Questions</div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statValue}>{analytics.totalAnswers}</div>
              <div style={styles.statLabel}>Total Answers</div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statValue}>{answerRate}%</div>
              <div style={styles.statLabel}>Answer Rate</div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statValue}>{analytics.averageResponseTime}h</div>
              <div style={styles.statLabel}>Avg. Response Time</div>
            </div>
          </div>
          
          <div style={styles.chartContainer}>
            <div style={styles.chart}>
              <h3 style={styles.chartTitle}>Top Products by Questions</h3>
              <div style={styles.barChart}>
                {analytics.topProducts.map((product, index) => {
                  const maxCount = Math.max(...analytics.topProducts.map(p => p.questionCount));
                  const percentage = (product.questionCount / maxCount) * 100;
                  
                  return (
                    <div key={index} style={styles.barContainer}>
                      <div style={styles.barLabel} title={product.productTitle}>
                        {product.productTitle}
                      </div>
                      <div
                        style={{
                          ...styles.bar,
                          width: `${percentage}%`,
                        }}
                      />
                      <div style={styles.barValue}>{product.questionCount}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div style={styles.chart}>
              <h3 style={styles.chartTitle}>Conversion Rate Impact</h3>
              <div style={styles.conversionChart}>
                <div>
                  <div
                    style={{
                      ...styles.conversionBar,
                      height: `${(analytics.conversionImpact.withoutQA / 5) * 100}%`,
                    }}
                  >
                    <div style={styles.conversionValue}>{analytics.conversionImpact.withoutQA}%</div>
                  </div>
                  <div style={styles.conversionLabel}>Products Without Q&A</div>
                </div>
                
                <div>
                  <div
                    style={{
                      ...styles.conversionBar,
                      height: `${(analytics.conversionImpact.withQA / 5) * 100}%`,
                    }}
                  >
                    <div style={styles.conversionValue}>{analytics.conversionImpact.withQA}%</div>
                  </div>
                  <div style={styles.conversionLabel}>Products With Q&A</div>
                </div>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '20px', fontWeight: 'bold' }}>
                {conversionLift}% Conversion Rate Lift with Q&A
              </div>
            </div>
          </div>
          
          <div style={styles.chart}>
            <h3 style={styles.chartTitle}>Questions & Answers Over Time</h3>
            <div style={styles.lineChart}>
              <div style={styles.lineChartGrid}>
                {/* Render line chart for questions */}
                {analytics.questionsByDate.map((item, index) => {
                  const maxCount = Math.max(
                    ...analytics.questionsByDate.map(d => d.count),
                    ...analytics.answersByDate.map(d => d.count)
                  );
                  const percentage = (item.count / maxCount) * 100;
                  const position = (index / (analytics.questionsByDate.length - 1)) * 100;
                  
                  return (
                    <div
                      key={`q-${index}`}
                      style={{
                        ...styles.lineChartDot,
                        bottom: `${percentage}%`,
                        left: `${position}%`,
                        backgroundColor: '#4A90E2',
                      }}
                    />
                  );
                })}
                
                {/* Render line chart for answers */}
                {analytics.answersByDate.map((item, index) => {
                  const maxCount = Math.max(
                    ...analytics.questionsByDate.map(d => d.count),
                    ...analytics.answersByDate.map(d => d.count)
                  );
                  const percentage = (item.count / maxCount) * 100;
                  const position = (index / (analytics.answersByDate.length - 1)) * 100;
                  
                  return (
                    <div
                      key={`a-${index}`}
                      style={{
                        ...styles.lineChartDot,
                        bottom: `${percentage}%`,
                        left: `${position}%`,
                        backgroundColor: '#FF9500',
                      }}
                    />
                  );
                })}
                
                {/* X-axis labels (dates) */}
                {analytics.questionsByDate.map((item, index) => {
                  // Only show every 5th label to avoid overcrowding
                  if (index % 5 === 0 || index === analytics.questionsByDate.length - 1) {
                    const position = (index / (analytics.questionsByDate.length - 1)) * 100;
                    const date = new Date(item.date);
                    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
                    
                    return (
                      <div
                        key={`label-${index}`}
                        style={{
                          ...styles.lineChartLabel,
                          left: `${position}%`,
                        }}
                      >
                        {formattedDate}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            
            <div style={styles.lineChartLegend}>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendColor,
                    backgroundColor: '#4A90E2',
                  }}
                />
                <span>Questions</span>
              </div>
              
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendColor,
                    backgroundColor: '#FF9500',
                  }}
                />
                <span>Answers</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;