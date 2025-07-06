/**
 * Quality Management Service
 * AI conversation quality analysis, scoring, and optimization recommendations
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
  console.log('Connected to MongoDB for quality management service');
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

// AI Conversation Quality Scoring
router.post('/score-conversation', authenticateToken, requireRole(['super_admin', 'client']), async (req, res) => {
  try {
    const { conversationId, manualScore } = req.body;
    
    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID required' });
    }

    // Fetch conversation data
    const conversation = await db.collection('analytics_conversations').findOne({ conversationId });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Calculate automated quality scores
    const qualityScore = calculateQualityScore(conversation);
    
    // If manual score provided, combine with automated score
    const finalScore = manualScore ? {
      ...qualityScore,
      manualScore,
      combinedScore: (qualityScore.overallScore + manualScore) / 2,
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    } : qualityScore;

    // Update conversation with quality score
    await db.collection('analytics_conversations').updateOne(
      { conversationId },
      { 
        $set: { 
          qualityScore: finalScore,
          lastScoredAt: new Date()
        }
      }
    );

    // Check if score triggers any alerts
    await checkQualityAlerts(conversation, finalScore);

    res.json({
      success: true,
      data: {
        conversationId,
        qualityScore: finalScore
      }
    });
  } catch (error) {
    console.error('Conversation scoring error:', error);
    res.status(500).json({ error: 'Failed to score conversation' });
  }
});

// Batch quality analysis
router.post('/analyze-batch', authenticateToken, requireRole(['super_admin', 'client']), async (req, res) => {
  try {
    const { timeRange = '7d', clientId, minConversations = 10 } = req.body;
    
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

    // Get conversations for analysis
    const conversations = await db.collection('analytics_conversations')
      .find(filter)
      .limit(1000)
      .toArray();

    if (conversations.length < minConversations) {
      return res.status(400).json({ 
        error: `Insufficient data: ${conversations.length} conversations found, minimum ${minConversations} required` 
      });
    }

    // Analyze conversations in batches
    const batchSize = 50;
    const results = [];
    
    for (let i = 0; i < conversations.length; i += batchSize) {
      const batch = conversations.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (conversation) => {
          const qualityScore = calculateQualityScore(conversation);
          
          // Update conversation with quality score
          await db.collection('analytics_conversations').updateOne(
            { conversationId: conversation.conversationId },
            { 
              $set: { 
                qualityScore,
                lastScoredAt: new Date()
              }
            }
          );

          return {
            conversationId: conversation.conversationId,
            qualityScore
          };
        })
      );
      
      results.push(...batchResults);
    }

    // Generate batch analysis summary
    const summary = generateBatchSummary(results);
    
    // Store batch analysis results
    const batchAnalysis = {
      batchId: `batch_${Date.now()}`,
      timeRange,
      clientId: clientId || req.user.clientId,
      analyzedAt: new Date(),
      conversationCount: results.length,
      summary,
      results
    };

    await db.collection('quality_batch_analyses').insertOne(batchAnalysis);

    res.json({
      success: true,
      data: batchAnalysis
    });
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({ error: 'Failed to perform batch analysis' });
  }
});

// Quality trends analysis
router.get('/trends', authenticateToken, requireRole(['super_admin', 'client']), async (req, res) => {
  try {
    const { timeRange = '30d', clientId, granularity = 'daily' } = req.query;
    
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
      case '7d': startDate.setDate(endDate.getDate() - 7); break;
      case '30d': startDate.setDate(endDate.getDate() - 30); break;
      case '90d': startDate.setDate(endDate.getDate() - 90); break;
      default: startDate.setDate(endDate.getDate() - 30);
    }
    filter.timestamp = { $gte: startDate, $lte: endDate };

    // Define grouping based on granularity
    let dateGrouping;
    switch (granularity) {
      case 'hourly':
        dateGrouping = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' }
        };
        break;
      case 'daily':
        dateGrouping = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        };
        break;
      case 'weekly':
        dateGrouping = {
          year: { $year: '$timestamp' },
          week: { $week: '$timestamp' }
        };
        break;
      default:
        dateGrouping = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        };
    }

    // Aggregate quality trends
    const trends = await db.collection('analytics_conversations').aggregate([
      { $match: filter },
      {
        $group: {
          _id: dateGrouping,
          avgSatisfaction: { $avg: '$conversationOutcomes.userSatisfaction' },
          avgCoherence: { $avg: '$conversationOutcomes.conversationQuality.coherenceScore' },
          avgHelpfulness: { $avg: '$conversationOutcomes.conversationQuality.helpfulnessScore' },
          avgNaturalness: { $avg: '$conversationOutcomes.conversationQuality.naturalnessScore' },
          avgResponseTime: { $avg: '$performanceMetrics.averageResponseTime' },
          completionRate: { $avg: { $cond: ['$conversationOutcomes.completed', 1, 0] } },
          goalAchievementRate: { $avg: { $cond: ['$conversationOutcomes.goalAchieved', 1, 0] } },
          totalConversations: { $sum: 1 },
          errorRate: { $avg: { $cond: [{ $gt: [{ $size: '$errorTracking.errors' }, 0] }, 1, 0] } }
        }
      },
      { $sort: { '_id': 1 } }
    ]).toArray();

    // Calculate trend indicators
    const trendAnalysis = calculateTrendIndicators(trends);

    res.json({
      success: true,
      data: {
        trends,
        trendAnalysis,
        timeRange,
        granularity,
        clientId
      }
    });
  } catch (error) {
    console.error('Trends analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch quality trends' });
  }
});

// Quality alerts management
router.get('/alerts', authenticateToken, requireRole(['super_admin', 'client']), async (req, res) => {
  try {
    const { status = 'active', severity, limit = 50 } = req.query;
    
    // Build filter
    let filter = { status };
    if (req.user.role === 'client') {
      filter.clientId = req.user.clientId;
    } else if (req.query.clientId) {
      filter.clientId = req.query.clientId;
    }
    if (severity) {
      filter.severity = severity;
    }

    const alerts = await db.collection('quality_alerts')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
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

// Create quality alert
router.post('/alerts', authenticateToken, requireRole(['super_admin', 'client']), async (req, res) => {
  try {
    const { type, severity, title, description, threshold, clientId } = req.body;
    
    const alert = {
      alertId: `alert_${Date.now()}`,
      type,
      severity,
      title,
      description,
      threshold,
      clientId: clientId || req.user.clientId,
      createdBy: req.user.id,
      createdAt: new Date(),
      status: 'active',
      triggeredCount: 0,
      lastTriggered: null
    };

    await db.collection('quality_alerts').insertOne(alert);

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Alert creation error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Update alert status
router.patch('/alerts/:alertId', authenticateToken, requireRole(['super_admin', 'client']), async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status, notes } = req.body;
    
    const updateData = {
      status,
      updatedBy: req.user.id,
      updatedAt: new Date()
    };
    
    if (notes) {
      updateData.notes = notes;
    }

    const result = await db.collection('quality_alerts').updateOne(
      { alertId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({
      success: true,
      message: 'Alert updated successfully'
    });
  } catch (error) {
    console.error('Alert update error:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Quality improvement recommendations
router.get('/recommendations', authenticateToken, requireRole(['super_admin', 'client']), async (req, res) => {
  try {
    const { clientId, timeRange = '30d' } = req.query;
    
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
      case '7d': startDate.setDate(endDate.getDate() - 7); break;
      case '30d': startDate.setDate(endDate.getDate() - 30); break;
      case '90d': startDate.setDate(endDate.getDate() - 90); break;
      default: startDate.setDate(endDate.getDate() - 30);
    }
    filter.timestamp = { $gte: startDate, $lte: endDate };

    // Analyze conversation patterns for recommendations
    const [
      qualityMetrics,
      commonIssues,
      performanceMetrics,
      userFeedback
    ] = await Promise.all([
      // Quality metrics analysis
      db.collection('analytics_conversations').aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            avgSatisfaction: { $avg: '$conversationOutcomes.userSatisfaction' },
            avgCoherence: { $avg: '$conversationOutcomes.conversationQuality.coherenceScore' },
            avgHelpfulness: { $avg: '$conversationOutcomes.conversationQuality.helpfulnessScore' },
            completionRate: { $avg: { $cond: ['$conversationOutcomes.completed', 1, 0] } },
            goalAchievementRate: { $avg: { $cond: ['$conversationOutcomes.goalAchieved', 1, 0] } }
          }
        }
      ]).toArray(),
      
      // Common issues analysis
      db.collection('analytics_conversations').aggregate([
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
      ]).toArray(),
      
      // Performance metrics
      db.collection('analytics_conversations').aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$performanceMetrics.averageResponseTime' },
            maxResponseTime: { $max: '$performanceMetrics.maxResponseTime' },
            avgTurns: { $avg: '$conversationFlow.totalTurns' }
          }
        }
      ]).toArray(),
      
      // User feedback patterns
      db.collection('analytics_conversations').aggregate([
        { $match: { ...filter, 'conversationOutcomes.userSatisfaction': { $exists: true } } },
        {
          $bucket: {
            groupBy: '$conversationOutcomes.userSatisfaction',
            boundaries: [1, 2, 3, 4, 5, 6],
            default: 'unrated',
            output: {
              count: { $sum: 1 },
              avgResponseTime: { $avg: '$performanceMetrics.averageResponseTime' },
              avgTurns: { $avg: '$conversationFlow.totalTurns' }
            }
          }
        }
      ]).toArray()
    ]);

    // Generate recommendations based on analysis
    const recommendations = generateQualityRecommendations(
      qualityMetrics[0],
      commonIssues,
      performanceMetrics[0],
      userFeedback
    );

    res.json({
      success: true,
      data: {
        recommendations,
        analysis: {
          qualityMetrics: qualityMetrics[0] || {},
          commonIssues,
          performanceMetrics: performanceMetrics[0] || {},
          userFeedback
        },
        timeRange,
        clientId
      }
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Helper Functions

function calculateQualityScore(conversation) {
  const scores = {
    coherenceScore: conversation.conversationOutcomes?.conversationQuality?.coherenceScore || 0,
    helpfulnessScore: conversation.conversationOutcomes?.conversationQuality?.helpfulnessScore || 0,
    naturalnessScore: conversation.conversationOutcomes?.conversationQuality?.naturalnessScore || 0,
    completionScore: conversation.conversationOutcomes?.completed ? 1 : 0,
    goalAchievementScore: conversation.conversationOutcomes?.goalAchieved ? 1 : 0,
    responseTimeScore: calculateResponseTimeScore(conversation.performanceMetrics?.averageResponseTime || 0),
    errorScore: calculateErrorScore(conversation.errorTracking?.errors || [])
  };

  // Calculate weighted overall score
  const weights = {
    coherenceScore: 0.2,
    helpfulnessScore: 0.25,
    naturalnessScore: 0.15,
    completionScore: 0.15,
    goalAchievementScore: 0.15,
    responseTimeScore: 0.05,
    errorScore: 0.05
  };

  const overallScore = Object.keys(scores).reduce((total, key) => {
    return total + (scores[key] * weights[key]);
  }, 0);

  return {
    ...scores,
    overallScore: Math.round(overallScore * 100) / 100,
    calculatedAt: new Date()
  };
}

function calculateResponseTimeScore(responseTime) {
  // Score based on response time (lower is better)
  if (responseTime <= 1000) return 1.0;
  if (responseTime <= 2000) return 0.8;
  if (responseTime <= 3000) return 0.6;
  if (responseTime <= 5000) return 0.4;
  return 0.2;
}

function calculateErrorScore(errors) {
  // Score based on error count and recovery rate
  if (errors.length === 0) return 1.0;
  
  const recoveredErrors = errors.filter(error => error.recovered).length;
  const recoveryRate = recoveredErrors / errors.length;
  
  // Penalize based on error count and reward recovery
  const errorPenalty = Math.min(errors.length * 0.1, 0.5);
  const recoveryBonus = recoveryRate * 0.3;
  
  return Math.max(1.0 - errorPenalty + recoveryBonus, 0);
}

function generateBatchSummary(results) {
  const scores = results.map(r => r.qualityScore.overallScore);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  const distribution = {
    excellent: scores.filter(s => s >= 0.9).length,
    good: scores.filter(s => s >= 0.7 && s < 0.9).length,
    fair: scores.filter(s => s >= 0.5 && s < 0.7).length,
    poor: scores.filter(s => s < 0.5).length
  };

  return {
    averageScore: Math.round(avgScore * 100) / 100,
    distribution,
    totalAnalyzed: results.length,
    qualityGrade: avgScore >= 0.9 ? 'A' : avgScore >= 0.7 ? 'B' : avgScore >= 0.5 ? 'C' : 'D'
  };
}

function calculateTrendIndicators(trends) {
  if (trends.length < 2) return { trend: 'insufficient_data' };
  
  const recent = trends.slice(-7); // Last 7 data points
  const previous = trends.slice(-14, -7); // Previous 7 data points
  
  if (previous.length === 0) return { trend: 'insufficient_data' };
  
  const recentAvg = recent.reduce((sum, t) => sum + (t.avgSatisfaction || 0), 0) / recent.length;
  const previousAvg = previous.reduce((sum, t) => sum + (t.avgSatisfaction || 0), 0) / previous.length;
  
  const change = ((recentAvg - previousAvg) / previousAvg) * 100;
  
  return {
    trend: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
    changePercent: Math.round(change * 100) / 100,
    recentAverage: Math.round(recentAvg * 100) / 100,
    previousAverage: Math.round(previousAvg * 100) / 100
  };
}

function generateQualityRecommendations(qualityMetrics, commonIssues, performanceMetrics, userFeedback) {
  const recommendations = [];
  
  // Quality-based recommendations
  if (qualityMetrics) {
    if (qualityMetrics.avgSatisfaction < 3.5) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        title: 'Improve User Satisfaction',
        description: `Average satisfaction is ${qualityMetrics.avgSatisfaction.toFixed(1)}/5, below acceptable threshold.`,
        actions: [
          'Review conversation flows for common pain points',
          'Enhance AI training with better response patterns',
          'Implement proactive user guidance'
        ]
      });
    }
    
    if (qualityMetrics.completionRate < 0.7) {
      recommendations.push({
        type: 'engagement',
        priority: 'high',
        title: 'Increase Conversation Completion Rate',
        description: `Only ${(qualityMetrics.completionRate * 100).toFixed(1)}% of conversations are completed.`,
        actions: [
          'Analyze drop-off points in conversation flow',
          'Simplify complex interaction patterns',
          'Add progress indicators for longer conversations'
        ]
      });
    }
  }
  
  // Performance-based recommendations
  if (performanceMetrics && performanceMetrics.avgResponseTime > 2000) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      title: 'Optimize Response Time',
      description: `Average response time is ${performanceMetrics.avgResponseTime}ms, exceeding 2-second target.`,
      actions: [
        'Optimize AI model inference speed',
        'Implement response caching for common queries',
        'Consider edge deployment for faster responses'
      ]
    });
  }
  
  // Issue-based recommendations
  if (commonIssues.length > 0) {
    const topIssue = commonIssues[0];
    recommendations.push({
      type: 'reliability',
      priority: 'medium',
      title: `Address Common Issue: ${topIssue._id}`,
      description: `${topIssue._id} occurs in ${topIssue.count} conversations with ${(topIssue.recoveryRate * 100).toFixed(1)}% recovery rate.`,
      actions: [
        'Implement better error handling for this issue type',
        'Add fallback responses for common failure scenarios',
        'Improve error recovery mechanisms'
      ]
    });
  }
  
  return recommendations;
}

async function checkQualityAlerts(conversation, qualityScore) {
  try {
    // Get active alerts for this client
    const alerts = await db.collection('quality_alerts').find({
      clientId: conversation.storeId,
      status: 'active'
    }).toArray();

    for (const alert of alerts) {
      let shouldTrigger = false;
      
      switch (alert.type) {
        case 'low_satisfaction':
          shouldTrigger = qualityScore.overallScore < alert.threshold;
          break;
        case 'high_response_time':
          shouldTrigger = conversation.performanceMetrics?.averageResponseTime > alert.threshold;
          break;
        case 'completion_rate':
          shouldTrigger = !conversation.conversationOutcomes?.completed;
          break;
      }
      
      if (shouldTrigger) {
        await db.collection('quality_alerts').updateOne(
          { alertId: alert.alertId },
          {
            $inc: { triggeredCount: 1 },
            $set: { lastTriggered: new Date() }
          }
        );
        
        // Create alert instance
        await db.collection('quality_alert_instances').insertOne({
          alertId: alert.alertId,
          conversationId: conversation.conversationId,
          triggeredAt: new Date(),
          qualityScore: qualityScore.overallScore,
          details: {
            type: alert.type,
            threshold: alert.threshold,
            actualValue: getAlertValue(alert.type, conversation, qualityScore)
          }
        });
      }
    }
  } catch (error) {
    console.error('Alert checking error:', error);
  }
}

function getAlertValue(alertType, conversation, qualityScore) {
  switch (alertType) {
    case 'low_satisfaction':
      return qualityScore.overallScore;
    case 'high_response_time':
      return conversation.performanceMetrics?.averageResponseTime || 0;
    case 'completion_rate':
      return conversation.conversationOutcomes?.completed ? 1 : 0;
    default:
      return 0;
  }
}

module.exports = router;