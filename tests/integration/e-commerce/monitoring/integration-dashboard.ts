/**
 * Integration Monitoring Dashboard
 * 
 * This module provides a dashboard for monitoring the health and performance
 * of e-commerce platform integrations. It collects metrics from integration
 * tests and provides visualizations for monitoring.
 */

import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

// Define metric types
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary'
}

// Define metric categories
export enum MetricCategory {
  PERFORMANCE = 'performance',
  ERROR = 'error',
  HEALTH = 'health',
  DATA = 'data'
}

// Define platform types
export enum PlatformType {
  SHOPIFY = 'shopify',
  MAGENTO = 'magento',
  WOOCOMMERCE = 'woocommerce',
  BIGCOMMERCE = 'bigcommerce',
  ALL = 'all'
}

// Define integration operation types
export enum OperationType {
  AUTHENTICATION = 'authentication',
  PRODUCT_SYNC = 'product_sync',
  ORDER_PROCESSING = 'order_processing',
  CUSTOMER_SYNC = 'customer_sync',
  WEBHOOK_HANDLING = 'webhook_handling',
  ERROR_HANDLING = 'error_handling'
}

// Define metric interface
export interface Metric {
  name: string;
  type: MetricType;
  category: MetricCategory;
  platform: PlatformType;
  operation: OperationType;
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

// Define alert interface
export interface Alert {
  id: string;
  name: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  metric: Metric;
  threshold: number;
  triggered: boolean;
  timestamp: number;
  resolved?: boolean;
  resolvedTimestamp?: number;
}

// Define dashboard interface
export interface Dashboard {
  metrics: Metric[];
  alerts: Alert[];
  addMetric(metric: Metric): void;
  getMetrics(options?: MetricFilterOptions): Metric[];
  createAlert(options: AlertOptions): Alert;
  resolveAlert(alertId: string): void;
  getAlerts(options?: AlertFilterOptions): Alert[];
  exportMetrics(format: 'json' | 'csv'): string;
  importMetrics(data: string, format: 'json' | 'csv'): void;
  on(event: string, listener: (...args: any[]) => void): void;
}

// Define metric filter options
export interface MetricFilterOptions {
  category?: MetricCategory;
  platform?: PlatformType;
  operation?: OperationType;
  startTime?: number;
  endTime?: number;
  name?: string;
}

// Define alert options
export interface AlertOptions {
  name: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  metric: Metric;
  threshold: number;
  comparisonOperator: '>' | '<' | '>=' | '<=' | '==' | '!=';
}

/**
 * Integration Dashboard implementation
 */
export class IntegrationDashboard extends EventEmitter implements Dashboard {
  metrics: Metric[] = [];
  alerts: Alert[] = [];
  private storageDir: string;

  constructor(storageDir?: string) {
    super();
    this.storageDir = storageDir || path.join(process.cwd(), 'metrics');
    
    // Create storage directory if it doesn't exist
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Add a metric to the dashboard
   * @param metric Metric to add
   */
  addMetric(metric: Metric): void {
    // Set timestamp if not provided
    if (!metric.timestamp) {
      metric.timestamp = Date.now();
    }
    
    this.metrics.push(metric);
    
    // Check if any alerts should be triggered
    this.checkAlerts(metric);
    
    // Emit metric event
    this.emit('metric', metric);
    
    // Persist metrics periodically
    if (this.metrics.length % 100 === 0) {
      this.persistMetrics();
    }
  }

  /**
   * Get metrics based on filter options
   * @param options Filter options
   * @returns Filtered metrics
   */
  getMetrics(options?: MetricFilterOptions): Metric[] {
    if (!options) {
      return [...this.metrics];
    }
    
    return this.metrics.filter(metric => {
      let match = true;
      
      if (options.category && metric.category !== options.category) {
        match = false;
      }
      
      if (options.platform && metric.platform !== options.platform && metric.platform !== PlatformType.ALL) {
        match = false;
      }
      
      if (options.operation && metric.operation !== options.operation) {
        match = false;
      }
      
      if (options.startTime && metric.timestamp < options.startTime) {
        match = false;
      }
      
      if (options.endTime && metric.timestamp > options.endTime) {
        match = false;
      }
      
      if (options.name && metric.name !== options.name) {
        match = false;
      }
      
      return match;
    });
  }

  /**
   * Create an alert
   * @param options Alert options
   * @returns Created alert
   */
  createAlert(options: AlertOptions): Alert {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: options.name,
      description: options.description,
      severity: options.severity,
      metric: options.metric,
      threshold: options.threshold,
      triggered: false,
      timestamp: Date.now()
    };
    
    this.alerts.push(alert);
    
    // Emit alert created event
    this.emit('alertCreated', alert);
    
    return alert;
  }

  /**
   * Resolve an alert
   * @param alertId Alert ID to resolve
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    
    if (alert && alert.triggered) {
      alert.resolved = true;
      alert.resolvedTimestamp = Date.now();
      
      // Emit alert resolved event
      this.emit('alertResolved', alert);
    }
  }

  /**
   * Get alerts based on filter options
   * @param options Filter options
   * @returns Filtered alerts
   */
  getAlerts(options?: AlertFilterOptions): Alert[] {
    if (!options) {
      return [...this.alerts];
    }
    
    return this.alerts.filter(alert => {
      let match = true;
      
      if (options.severity && alert.severity !== options.severity) {
        match = false;
      }
      
      if (options.triggered !== undefined && alert.triggered !== options.triggered) {
        match = false;
      }
      
      if (options.resolved !== undefined && alert.resolved !== options.resolved) {
        match = false;
      }
      
      if (options.platform && alert.metric.platform !== options.platform) {
        match = false;
      }
      
      if (options.operation && alert.metric.operation !== options.operation) {
        match = false;
      }
      
      return match;
    });
  }

  /**
   * Export metrics to a file
   * @param format Export format (json or csv)
   * @returns Exported data
   */
  exportMetrics(format: 'json' | 'csv'): string {
    if (format === 'json') {
      return JSON.stringify(this.metrics, null, 2);
    } else if (format === 'csv') {
      const header = 'name,type,category,platform,operation,value,timestamp\n';
      const rows = this.metrics.map(metric => {
        return `${metric.name},${metric.type},${metric.category},${metric.platform},${metric.operation},${metric.value},${metric.timestamp}`;
      }).join('\n');
      
      return header + rows;
    }
    
    throw new Error(`Unsupported format: ${format}`);
  }

  /**
   * Import metrics from a file
   * @param data Imported data
   * @param format Import format (json or csv)
   */
  importMetrics(data: string, format: 'json' | 'csv'): void {
    if (format === 'json') {
      const metrics = JSON.parse(data) as Metric[];
      this.metrics = [...this.metrics, ...metrics];
    } else if (format === 'csv') {
      const lines = data.split('\n');
      const header = lines[0].split(',');
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        
        if (values.length === header.length) {
          const metric: Metric = {
            name: values[0],
            type: values[1] as MetricType,
            category: values[2] as MetricCategory,
            platform: values[3] as PlatformType,
            operation: values[4] as OperationType,
            value: parseFloat(values[5]),
            timestamp: parseInt(values[6])
          };
          
          this.metrics.push(metric);
        }
      }
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Check if any alerts should be triggered
   * @param metric Metric to check
   */
  private checkAlerts(metric: Metric): void {
    for (const alert of this.alerts) {
      if (
        alert.metric.name === metric.name &&
        alert.metric.category === metric.category &&
        alert.metric.platform === metric.platform &&
        alert.metric.operation === metric.operation &&
        !alert.resolved
      ) {
        const shouldTrigger = this.evaluateAlertCondition(metric.value, alert.threshold);
        
        if (shouldTrigger && !alert.triggered) {
          alert.triggered = true;
          alert.timestamp = Date.now();
          
          // Emit alert triggered event
          this.emit('alertTriggered', alert);
        } else if (!shouldTrigger && alert.triggered) {
          this.resolveAlert(alert.id);
        }
      }
    }
  }

  /**
   * Evaluate alert condition
   * @param value Metric value
   * @param threshold Alert threshold
   * @returns Whether the alert should be triggered
   */
  private evaluateAlertCondition(value: number, threshold: number): boolean {
    // For simplicity, we're just checking if the value exceeds the threshold
    return value > threshold;
  }

  /**
   * Persist metrics to disk
   */
  private persistMetrics(): void {
    const filename = path.join(this.storageDir, `metrics-${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify(this.metrics, null, 2));
  }
}

// Define alert filter options
export interface AlertFilterOptions {
  severity?: 'info' | 'warning' | 'error' | 'critical';
  triggered?: boolean;
  resolved?: boolean;
  platform?: PlatformType;
  operation?: OperationType;
}

/**
 * Create a metric
 * @param name Metric name
 * @param type Metric type
 * @param category Metric category
 * @param platform Platform type
 * @param operation Operation type
 * @param value Metric value
 * @param labels Optional labels
 * @returns Created metric
 */
export function createMetric(
  name: string,
  type: MetricType,
  category: MetricCategory,
  platform: PlatformType,
  operation: OperationType,
  value: number,
  labels?: Record<string, string>
): Metric {
  return {
    name,
    type,
    category,
    platform,
    operation,
    value,
    timestamp: Date.now(),
    labels
  };
}

// Create a singleton dashboard instance
export const dashboard = new IntegrationDashboard();

// Export the dashboard instance
export default dashboard;