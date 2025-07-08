/**
 * @fileoverview Automated report generation system for stakeholders and administrators,
 * supporting multiple output formats (JSON, CSV, PDF).
 *
 * @version 1.0.0
 * @author Roo Code <Roo@users.noreply.github.com>
 * @copyright 2025 Commerce Studio
 */

import fs from 'fs';
import { EOL } from 'os';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Extends jsPDF with table support
import ConversationAnalyticsEngine from '../analytics/conversation-analytics-engine.js';
import BusinessIntelligenceService from '../analytics/business-intelligence-service.js';
import AvatarPerformanceMonitor from '../monitoring/avatar-performance-monitor.js';

/**
 * @class AnalyticsReportGenerator
 * @description Generates comprehensive analytics reports in various formats.
 */
class AnalyticsReportGenerator {
    /**
     * Gathers all necessary data for a report.
     * @param {string[]} sessionIds - The session IDs to include in the report.
     * @param {object} costData - Cost data for ROI calculations.
     * @returns {Promise<object>} An object containing all the data for the report.
     */
    async gatherReportData(sessionIds, costData) {
        const conversationAnalytics = ConversationAnalyticsEngine.processBatch(sessionIds);
        const biReport = await BusinessIntelligenceService.generateBusinessImpactReport(sessionIds, costData);
        const performanceMetrics = AvatarPerformanceMonitor.getBatchMetrics(sessionIds);

        return {
            generationDate: new Date().toISOString(),
            period: biReport.period,
            data: {
                conversationAnalytics,
                biReport,
                performanceMetrics,
            },
        };
    }

    /**
     * Generates a report in JSON format.
     * @param {object} reportData - The data to include in the report.
     * @returns {string} The report as a JSON string.
     */
    generateJsonReport(reportData) {
        return JSON.stringify(reportData, null, 2);
    }

    /**
     * Generates a report in CSV format.
     * @param {object} reportData - The data to include in the report.
     * @returns {string} The report as a CSV string.
     */
    generateCsvReport(reportData) {
        const { biReport, performanceMetrics } = reportData.data;
        let csv = `Metric,Value${EOL}`;
        csv += `Total Sessions,${biReport.conversionData.totalSessions}${EOL}`;
        csv += `Converted Sessions,${biReport.conversionData.convertedSessions}${EOL}`;
        csv += `Conversion Rate,${biReport.conversionData.conversionRate}${EOL}`;
        csv += `Attributed Revenue,${biReport.salesAttribution.totalAttributedRevenue}${EOL}`;
        csv += `ROI,${biReport.roi.roi}${EOL}`;
        csv += `Average Response Time (ms),${performanceMetrics.summary.avgResponseTime}${EOL}`;
        csv += `Error Rate,${performanceMetrics.summary.avgErrorRate}${EOL}`;
        return csv;
    }

    /**
     * Generates a report in PDF format.
     * @param {object} reportData - The data to include in the report.
     * @returns {Promise<Buffer>} The PDF report as a buffer.
     */
    async generatePdfReport(reportData) {
        const doc = new jsPDF();
        const { biReport, performanceMetrics, conversationAnalytics } = reportData.data;

        doc.text('AI Avatar Analytics Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date(reportData.generationDate).toLocaleString()}`, 14, 26);

        doc.setFontSize(12);
        doc.text('Business Impact Summary', 14, 40);
        doc.autoTable({
            startY: 45,
            head: [['Metric', 'Value']],
            body: [
                ['Total Sessions', biReport.conversionData.totalSessions],
                ['Conversion Rate', `${(biReport.conversionData.conversionRate * 100).toFixed(2)}%`],
                ['Attributed Revenue', `$${biReport.salesAttribution.totalAttributedRevenue.toFixed(2)}`],
                ['ROI', `${(biReport.roi.roi * 100).toFixed(2)}%`],
            ],
        });

        doc.text('Avatar Performance', 14, doc.autoTable.previous.finalY + 15);
        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 20,
            head: [['Metric', 'Value']],
            body: [
                ['Avg. Response Time', `${performanceMetrics.summary.avgResponseTime.toFixed(2)} ms`],
                ['Error Rate', `${(performanceMetrics.summary.avgErrorRate * 100).toFixed(2)}%`],
                ['Avg. Quality Score', `${(conversationAnalytics.reduce((s, c) => s + (c.qualityScore || 0), 0) / conversationAnalytics.length).toFixed(2)}`],
            ],
        });

        return doc.output('arraybuffer');
    }

    /**
     * Generates a report and saves it to a file.
     * @param {string[]} sessionIds - The session IDs to report on.
     * @param {object} costData - Cost data for ROI.
     * @param {string} format - The desired output format ('json', 'csv', 'pdf').
     * @param {string} outputPath - The path to save the file to.
     * @returns {Promise<void>}
     */
    async generateAndSaveReport(sessionIds, costData, format, outputPath) {
        try {
            const reportData = await this.gatherReportData(sessionIds, costData);
            let output;

            switch (format.toLowerCase()) {
                case 'json':
                    output = this.generateJsonReport(reportData);
                    break;
                case 'csv':
                    output = this.generateCsvReport(reportData);
                    break;
                case 'pdf':
                    output = Buffer.from(await this.generatePdfReport(reportData));
                    break;
                default:
                    throw new Error(`Unsupported report format: ${format}`);
            }

            fs.writeFileSync(outputPath, output);
            console.log(`Report generated and saved to ${outputPath}`);
        } catch (error) {
            console.error(`Failed to generate report: ${error.message}`);
            throw error;
        }
    }

    /**
     * Schedules regular report generation.
     * @param {string} cronExpression - The cron expression for scheduling.
     * @param {Function} task - The reporting task to run.
     */
    scheduleReport(cronExpression, task) {
        // In a real application, use a library like node-cron.
        console.log(`Report scheduled with expression: "${cronExpression}".`);
        // setInterval(() => task(), 60 * 60 * 1000); // Simplified example: run hourly
    }

    /**
     * Health check for the report generator.
     * @returns {object} Health status.
     */
    healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            dependencies: ['BusinessIntelligenceService', 'ConversationAnalyticsEngine', 'AvatarPerformanceMonitor'],
        };
    }
}

export default new AnalyticsReportGenerator();