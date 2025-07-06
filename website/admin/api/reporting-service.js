/**
 * Admin Panel Reporting Service
 * Comprehensive reporting and quality management for super admin and client roles
 */

const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

// Database connection
let db;
MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/commerce-studio', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(client => {
  db = client.db();
  console.log('Connected to MongoDB for reporting service');
}).catch(error => {
  console.error('MongoDB connection error:', error);
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Super Admin Dashboard Analytics
router.get('/super-admin/dashboard', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { timeRange = '7d', platform } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case '1d': startDate.setDate(endDate.getDate() - 1); break;
      case '7d': startDate.setDate(endDate.getDate() - 7); break;
      case '30d': startDate.setDate(endDate.getDate() - 30); break;
      case '90d': startDate.setDate(endDate.getDate() - 90); break;
      default: startDate.setDate(endDate.getDate() - 7);
    }

    // Build platform filter
    const platformFilter = platform ? { platform } : {};
    const dateFilter = { timestamp: { $gte: startDate, $lte: endDate } };
    const combinedFilter = { ...platformFilter, ...dateFilter };

    // Aggregate cross-platform analytics
    const [
      totalSessions,
      totalConversions,
      aiPerformanceMetrics,
      platformBreakdown,
      userJourneyMetrics,
      qualityMetrics
    ] = await Promise.all([
      // Total sessions across all platforms
      db.collection('analytics_user_sessions').countDocuments(combinedFilter),
      
      // Total conversions
      db.collection('analytics_conversions').countDocuments(combinedFilter),
      
      // AI performance metrics
      db.collection('analytics_face_analysis').aggregate([
        { $match: combinedFilter },
        {
          $group: {
            _id: null,
            avgProcessingTime: { $avg: '$performanceMetrics.totalProcessingTime' },
            successRate: { $avg: { $cond: ['$qualityMetrics.processingSuccess.successful', 1, 0] } },
            avgAccuracy: { $avg: '$qualityMetrics.measurementAccuracy.overallAccuracy' },
            totalAnalyses: { $sum: 1 }
          }
        }
      ]).toArray(),
      
      // Platform breakdown
      db.collection('analytics_user_sessions').aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$platform',
            sessions: { $sum: 1 },
            conversions: { $sum: { $cond: ['$sessionOutcome.completed', 1, 0] } },
            avgDuration: { $avg: '$sessionOutcome.totalDuration' },
            bounceRate: { $avg: { $cond: ['$sessionOutcome.bounceRate', 1, 0] } }
          }
        }
      ]).toArray(),
      
      // User journey metrics
      db.collection('analytics_user_sessions').aggregate([
        { $match: combinedFilter },
        { $unwind: '$journeyStages' },
        {
          $group: {
            _id: '$journeyStages.stageName',
            avgDuration: { $avg: '$journeyStages.duration' },
            exitRate: { $avg: { $cond: ['$journeyStages.exitPoint', 1, 0] } },
            totalSessions: { $sum: 1 }
          }
        }
      ]).toArray(),
      
      // Quality metrics
      db.collection('analytics_conversations').aggregate([
        { $match: combinedFilter },
        {
          $group: {
            _id: null,
            avgSatisfaction: { $avg: '$conversationOutcomes.userSatisfaction' },
            avgCoherence: { $avg: '$conversationOutcomes.conversationQuality.coherenceScore' },
            avgHelpfulness: { $avg: '$conversationOutcomes.conversationQuality.helpfulnessScore' },
            completionRate: { $avg: { $cond: ['$conversationOutcomes.completed', 1, 0] } }
          }
        }
      ]).toArray()
    ]);

    // Calculate conversion rate
    const conversionRate = totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalSessions,
          totalConversions,
          conversionRate: Math.round(conversionRate * 100) / 100,
          timeRange,
          platform: platform || 'all'
        },
        aiPerformance: aiPerformanceMetrics[0] || {
          avgProcessingTime: 0,
          successRate: 0,
          avgAccuracy: 0,
          totalAnalyses: 0
        },
        platformBreakdown,
        userJourney: userJourneyMetrics,
        qualityMetrics: qualityMetrics[0] || {
          avgSatisfaction: 0,
          avgCoherence: 0,
          avgHelpfulness: 0,
          completionRate: 0
        }
      }
    });
  } catch (error) {
    console.error('Super admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Client-specific reporting
router.get('/client/dashboard', authenticateToken, requireRole(['client', 'super_admin']), async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const clientId = req.user.role === 'super_admin' ? req.query.clientId : req.user.clientId;
    
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID required' });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case '1d': startDate.setDate(endDate.getDate() - 1); break;
      case '7d': startDate.setDate(endDate.getDate() - 7); break;
      case '30d': startDate.setDate(endDate.getDate() - 30); break;
      default: startDate.setDate(endDate.getDate() - 7);
    }

    const filter = {
      storeId: clientId,
      timestamp: { $gte: startDate, $lte: endDate }
    };

    // Client-specific analytics
    const [
      sessionMetrics,
      conversionMetrics,
      aiMetrics,
      topProducts,
      userEngagement
    ] = await Promise.all([
      // Session metrics
      db.collection('analytics_user_sessions').aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            avgDuration: { $avg: '$sessionOutcome.totalDuration' },
            bounceRate: { $avg: { $cond: ['$sessionOutcome.bounceRate', 1, 0] } },
            uniqueUsers: { $addToSet: '$userId' }
          }
        }
      ]).toArray(),
      
      // Conversion metrics
      db.collection('analytics_conversions').aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$conversionDetails.conversionType',
            count: { $sum: 1 },
            totalValue: { $sum: '$conversionDetails.conversionValue' }
          }
        }
      ]).toArray(),
      
      // AI-specific metrics
      db.collection('analytics_face_analysis').aggregate([
        { $match: { ...filter, sessionId: { $exists: true } } },
        {
          $group: {
            _id: null,
            totalAnalyses: { $sum: 1 },
            avgProcessingTime: { $avg: '$performanceMetrics.totalProcessingTime' },
            successRate: { $avg: { $cond: ['$qualityMetrics.processingSuccess.successful', 1, 0] } }
          }
        }
      ]).toArray(),
      
      // Top performing products
      db.collection('analytics_recommendations').aggregate([
        { $match: filter },
        { $unwind: '$recommendationResults' },
        {
          $group: {
            _id: '$recommendationResults.productId',
            views: { $sum: '$engagementMetrics.viewedRecommendations' },
            clicks: { $sum: '$engagementMetrics.clickedRecommendations' },
            purchases: { $sum: '$engagementMetrics.purchased' }
          }
        },
        { $sort: { clicks: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // User engagement patterns
      db.collection('analytics_interaction_events').aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              hour: { $hour: '$timestamp' },
              dayOfWeek: { $dayOfWeek: '$timestamp' }
            },
            interactions: { $sum: 1 }
          }
        }
      ]).toArray()
    ]);

    res.json({
      success: true,
      data: {
        clientId,
        timeRange,
        sessionMetrics: sessionMetrics[0] || {},
        conversionMetrics,
        aiMetrics: aiMetrics[0] || {},
        topProducts,
        userEngagement
      }
    });
  } catch (error) {
    console.error('Client dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch client dashboard data' });
  }
});

// AI Conversation Quality Analysis
router.get('/quality/conversations', authenticateToken, requireRole(['super_admin', 'client']), async (req, res) => {
  try {
    const { timeRange = '7d', clientId, minSatisfaction, maxResponseTime } = req.query;
    
    // Build filter based on user role
    let filter = {};
    if (req.user.role === 'client') {
      filter.storeId = req.user.clientId;
    } else if (clientId) {
      filter.storeId = clientId;
    }

    // Add time range filter
    const endDate = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case '1d': startDate.setDate(endDate.getDate() - 1); break;
      case '7d': startDate.setDate(endDate.getDate() - 7); break;
      case '30d': startDate.setDate(endDate.getDate() - 30); break;
      default: startDate.setDate(endDate.getDate() - 7);
    }
    filter.timestamp = { $gte: startDate, $lte: endDate };

    // Add quality filters
    if (minSatisfaction) {
      filter['conversationOutcomes.userSatisfaction'] = { $gte: parseFloat(minSatisfaction) };
    }
    if (maxResponseTime) {
      filter['performanceMetrics.averageResponseTime'] = { $lte: parseFloat(maxResponseTime) };
    }

    const qualityAnalysis = await db.collection('analytics_conversations').aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalConversations: { $sum: 1 },
          avgSatisfaction: { $avg: '$conversationOutcomes.userSatisfaction' },
          avgResponseTime: { $avg: '$performanceMetrics.averageResponseTime' },
          avgCoherence: { $avg: '$conversationOutcomes.conversationQuality.coherenceScore' },
          avgHelpfulness: { $avg: '$conversationOutcomes.conversationQuality.helpfulnessScore' },
          avgNaturalness: { $avg: '$conversationOutcomes.conversationQuality.naturalnessScore' },
          completionRate: { $avg: { $cond: ['$conversationOutcomes.completed', 1, 0] } },
          goalAchievementRate: { $avg: { $cond: ['$conversationOutcomes.goalAchieved', 1, 0] } }
        }
      }
    ]).toArray();

    // Get conversation quality distribution
    const qualityDistribution = await db.collection('analytics_conversations').aggregate([
      { $match: filter },
      {
        $bucket: {
          groupBy: '$conversationOutcomes.userSatisfaction',
          boundaries: [1, 2, 3, 4, 5, 6],
          default: 'unrated',
          output: {
            count: { $sum: 1 },
            avgResponseTime: { $avg: '$performanceMetrics.averageResponseTime' }
          }
        }
      }
    ]).toArray();

    // Get common issues and errors
    const commonIssues = await db.collection('analytics_conversations').aggregate([
      { $match: filter },
      { $unwind: '$errorTracking.errors' },
      {
        $group: {
          _id: '$errorTracking.errors.errorType',
          count: { $sum: 1 },
          recoveryRate: { $avg: { $cond: ['$errorTracking.errors.recovered', 1, 0] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    res.json({
      success: true,
      data: {
        overview: qualityAnalysis[0] || {},
        qualityDistribution,
        commonIssues,
        filters: { timeRange, clientId, minSatisfaction, maxResponseTime }
      }
    });
  } catch (error) {
    console.error('Quality analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch quality analysis' });
  }
});

// Performance monitoring and optimization recommendations
router.get('/performance/analysis', authenticateToken, requireRole(['super_admin', 'client']), async (req, res) => {
  try {
    const { timeRange = '7d', clientId } = req.query;
    
    // Build filter
    let filter = {};
    if (req.user.role === 'client') {
      filter.storeId = req.user.clientId;
    } else if (clientId) {
      filter.storeId = clientId;
    }

    // Add time range
    const endDate = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case '1d': startDate.setDate(endDate.getDate() - 1); break;
      case '7d': startDate.setDate(endDate.getDate() - 7); break;
      case '30d': startDate.setDate(endDate.getDate() - 30); break;
      default: startDate.setDate(endDate.getDate() - 7);
    }
    filter.timestamp = { $gte: startDate, $lte: endDate };

    // Performance analysis
    const [
      faceAnalysisPerformance,
      recommendationPerformance,
      systemPerformance,
      userExperienceMetrics
    ] = await Promise.all([
      // Face analysis performance
      db.collection('analytics_face_analysis').aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            avgTotalTime: { $avg: '$performanceMetrics.totalProcessingTime' },
            avgClientTime: { $avg: '$performanceMetrics.clientProcessingTime' },
            avgServerTime: { $avg: '$performanceMetrics.serverProcessingTime' },
            avgNetworkLatency: { $avg: '$performanceMetrics.networkLatency' },
            successRate: { $avg: { $cond: ['$qualityMetrics.processingSuccess.successful', 1, 0] } },
            avgRetries: { $avg: '$qualityMetrics.processingSuccess.retryCount' }
          }
        }
      ]).toArray(),
      
      // Recommendation performance
      db.collection('analytics_recommendations').aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            avgGenerationTime: { $avg: '$generationMetrics.totalGenerationTime' },
            cacheHitRate: { $avg: { $cond: ['$generationMetrics.cachePerformance.cacheHit', 1, 0] } },
            avgRecommendations: { $avg: '$recommendationResults.totalRecommendations' },
            avgEngagementRate: { $avg: { $divide: ['$engagementMetrics.clickedRecommendations', '$engagementMetrics.viewedRecommendations'] } }
          }
        }
      ]).toArray(),
      
      // System performance trends
      db.collection('analytics_user_sessions').aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
            },
            avgSessionDuration: { $avg: '$sessionOutcome.totalDuration' },
            bounceRate: { $avg: { $cond: ['$sessionOutcome.bounceRate', 1, 0] } },
            conversionRate: { $avg: { $cond: ['$sessionOutcome.completed', 1, 0] } }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]).toArray(),
      
      // User experience metrics
      db.collection('analytics_interaction_events').aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$eventCategory',
            avgResponseTime: { $avg: '$contextData.timeInStage' },
            totalInteractions: { $sum: 1 },
            uniqueSessions: { $addToSet: '$sessionId' }
          }
        }
      ]).toArray()
    ]);

    // Generate optimization recommendations
    const recommendations = [];
    
    const faceAnalysis = faceAnalysisPerformance[0];
    if (faceAnalysis) {
      if (faceAnalysis.avgTotalTime > 3000) {
        recommendations.push({
          type: 'performance',
          priority: 'high',
          category: 'face_analysis',
          title: 'Optimize Face Analysis Processing Time',
          description: `Average processing time is ${Math.round(faceAnalysis.avgTotalTime)}ms, which exceeds the 3-second threshold.`,
          suggestions: [
            'Consider implementing client-side processing for faster results',
            'Optimize image preprocessing pipeline',
            'Implement progressive loading for better user experience'
          ]
        });
      }
      
      if (faceAnalysis.successRate < 0.95) {
        recommendations.push({
          type: 'quality',
          priority: 'high',
          category: 'face_analysis',
          title: 'Improve Face Analysis Success Rate',
          description: `Success rate is ${Math.round(faceAnalysis.successRate * 100)}%, below the 95% target.`,
          suggestions: [
            'Enhance image quality validation',
            'Improve lighting condition detection',
            'Add user guidance for better photo capture'
          ]
        });
      }
    }

    const recommendation = recommendationPerformance[0];
    if (recommendation) {
      if (recommendation.cacheHitRate < 0.8) {
        recommendations.push({
          type: 'performance',
          priority: 'medium',
          category: 'recommendations',
          title: 'Improve Recommendation Caching',
          description: `Cache hit rate is ${Math.round(recommendation.cacheHitRate * 100)}%, below optimal 80%.`,
          suggestions: [
            'Optimize cache key generation strategy',
            'Implement predictive caching for popular queries',
            'Increase cache TTL for stable recommendations'
          ]
        });
      }
      
      if (recommendation.avgEngagementRate < 0.3) {
        recommendations.push({
          type: 'engagement',
          priority: 'high',
          category: 'recommendations',
          title: 'Improve Recommendation Relevance',
          description: `Engagement rate is ${Math.round(recommendation.avgEngagementRate * 100)}%, below 30% target.`,
          suggestions: [
            'Enhance personalization algorithms',
            'Improve product diversity in recommendations',
            'A/B test different recommendation layouts'
          ]
        });
      }
    }

    res.json({
      success: true,
      data: {
        faceAnalysisPerformance: faceAnalysis || {},
        recommendationPerformance: recommendation || {},
        systemPerformance,
        userExperienceMetrics,
        recommendations,
        timeRange,
        clientId
      }
    });
  } catch (error) {
    console.error('Performance analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch performance analysis' });
  }
});

// Data export functionality
router.post('/export', authenticateToken, requireRole(['super_admin', 'client']), async (req, res) => {
  try {
    const { reportType, format, timeRange, filters } = req.body;
    
    // Validate export request
    if (!reportType || !format) {
      return res.status(400).json({ error: 'Report type and format required' });
    }

    // Build filter based on user role and request
    let filter = {};
    if (req.user.role === 'client') {
      filter.storeId = req.user.clientId;
    } else if (filters.clientId) {
      filter.storeId = filters.clientId;
    }

    // Add time range filter
    if (timeRange) {
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '1d': startDate.setDate(endDate.getDate() - 1); break;
        case '7d': startDate.setDate(endDate.getDate() - 7); break;
        case '30d': startDate.setDate(endDate.getDate() - 30); break;
        case '90d': startDate.setDate(endDate.getDate() - 90); break;
      }
      filter.timestamp = { $gte: startDate, $lte: endDate };
    }

    // Generate export data based on report type
    let exportData = [];
    let filename = '';

    switch (reportType) {
      case 'user_sessions':
        exportData = await db.collection('analytics_user_sessions').find(filter).toArray();
        filename = `user_sessions_${timeRange || 'all'}.${format}`;
        break;
      
      case 'ai_performance':
        exportData = await db.collection('analytics_face_analysis').find(filter).toArray();
        filename = `ai_performance_${timeRange || 'all'}.${format}`;
        break;
      
      case 'conversation_quality':
        exportData = await db.collection('analytics_conversations').find(filter).toArray();
        filename = `conversation_quality_${timeRange || 'all'}.${format}`;
        break;
      
      case 'conversions':
        exportData = await db.collection('analytics_conversions').find(filter).toArray();
        filename = `conversions_${timeRange || 'all'}.${format}`;
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    // Format data based on export format
    if (format === 'csv') {
      const csv = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json(exportData);
    } else {
      return res.status(400).json({ error: 'Unsupported export format' });
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Quality management alerts
router.get('/alerts', authenticateToken, requireRole(['super_admin', 'client']), async (req, res) => {
  try {
    const { status = 'active', severity, clientId } = req.query;
    
    // Build filter
    let filter = { status };
    if (req.user.role === 'client') {
      filter.clientId = req.user.clientId;
    } else if (clientId) {
      filter.clientId = clientId;
    }
    if (severity) {
      filter.severity = severity;
    }

    const alerts = await db.collection('quality_alerts').find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

module.exports = router;