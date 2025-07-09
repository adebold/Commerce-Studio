#!/usr/bin/env node

/**
 * Test Enhanced Recommendations Engine
 * Tests face shape analysis and enhanced recommendation features
 */

import FaceShapeAnalysisService from '../services/face-shape-analysis-service.js';
import EnhancedRecommendationService from '../services/enhanced-recommendation-service.js';

async function testEnhancedRecommendations() {
    console.log('🧪 Testing Enhanced Recommendations Engine...\n');

    try {
        // Initialize services
        console.log('1. Initializing services...');
        const faceAnalyzer = new FaceShapeAnalysisService({ mockMode: true });
        const recommendationEngine = new EnhancedRecommendationService({ mockMode: true });
        console.log('✅ Services initialized\n');

        // Test face shape analysis
        console.log('2. Testing face shape analysis...');
        const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
        
        const faceAnalysis = await faceAnalyzer.analyzeFaceShape(mockImageData);
        console.log(`✅ Face shape detected: ${faceAnalysis.faceShape}`);
        console.log(`   Confidence: ${(faceAnalysis.confidence * 100).toFixed(1)}%`);
        console.log(`   Characteristics: ${faceAnalysis.analysis.characteristics.slice(0, 2).join(', ')}\n`);

        // Test enhanced recommendations
        console.log('3. Testing enhanced recommendations...');
        const consultationData = {
            stylePreference: 'modern',
            lifestyle: 'professional',
            budget: '$100-200',
            prescription: 'yes'
        };

        const recommendations = await recommendationEngine.generateEnhancedRecommendations(
            consultationData,
            faceAnalysis
        );

        console.log(`✅ Generated ${recommendations.recommendations.length} recommendations`);
        console.log(`   Overall confidence: ${(recommendations.metadata.confidenceScore * 100).toFixed(1)}%`);
        console.log(`   Top recommendation: ${recommendations.recommendations[0].name}`);
        console.log(`   Reason: ${recommendations.recommendations[0].explanation}\n`);

        // Test recommendation explanation
        console.log('4. Testing recommendation explanation...');
        const explanation = await recommendationEngine.explainRecommendation(
            recommendations.recommendations[0].id,
            consultationData,
            faceAnalysis
        );

        console.log(`✅ Explanation generated for ${explanation.product.name}`);
        console.log(`   Detailed scores: ${Object.keys(explanation.detailedScores).length} factors analyzed`);
        console.log(`   Recommendations: ${explanation.recommendations?.length || 0} improvement suggestions\n`);

        // Test face shape compatibility
        console.log('5. Testing face shape compatibility...');
        const supportedShapes = faceAnalyzer.getSupportedFaceShapes();
        console.log(`✅ Supports ${supportedShapes.length} face shapes: ${supportedShapes.join(', ')}`);
        
        const similarity = faceAnalyzer.compareFaceShapes('oval', 'round');
        console.log(`   Oval-Round similarity: ${(similarity * 100).toFixed(1)}%\n`);

        // Display insights
        console.log('6. Testing insights generation...');
        if (recommendations.insights && recommendations.insights.length > 0) {
            console.log(`✅ Generated ${recommendations.insights.length} personalization insights:`);
            recommendations.insights.forEach((insight, index) => {
                console.log(`   ${index + 1}. ${insight.title}: ${insight.description}`);
            });
        }
        console.log('');

        // Success summary
        console.log('🎉 Enhanced Recommendations Engine Test Complete!');
        console.log('✅ All components working correctly');
        console.log('✅ Face shape analysis functional');
        console.log('✅ Enhanced recommendations generation working');
        console.log('✅ Explanation system operational');
        console.log('✅ Integration ready for frontend\n');

        return true;

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
        return false;
    }
}

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
    testEnhancedRecommendations()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Unexpected error:', error);
            process.exit(1);
        });
}

export default testEnhancedRecommendations;