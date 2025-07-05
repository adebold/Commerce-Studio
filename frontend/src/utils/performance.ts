/**
 * Performance Monitoring Utilities
 * Tracks Web Vitals and provides performance insights
 */

import React from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

export interface PerformanceBudget {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}

// Performance budgets based on Core Web Vitals thresholds
export const PERFORMANCE_BUDGETS: PerformanceBudget = {
  fcp: 1800, // First Contentful Paint (ms)
  lcp: 2500, // Largest Contentful Paint (ms)
  fid: 100,  // First Input Delay (ms)
  cls: 0.1,  // Cumulative Layout Shift
  ttfb: 800, // Time to First Byte (ms)
};

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  private listeners: Array<(metrics: PerformanceMetrics) => void> = [];

  constructor() {
    this.initWebVitals();
  }

  private initWebVitals() {
    // Measure Core Web Vitals
    onCLS((metric) => {
      this.metrics.cls = metric.value;
      this.notifyListeners();
    });

    onFID((metric) => {
      this.metrics.fid = metric.value;
      this.notifyListeners();
    });

    onFCP((metric) => {
      this.metrics.fcp = metric.value;
      this.notifyListeners();
    });

    onLCP((metric) => {
      this.metrics.lcp = metric.value;
      this.notifyListeners();
    });

    onTTFB((metric) => {
      this.metrics.ttfb = metric.value;
      this.notifyListeners();
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.metrics }));
  }

  public onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public checkBudgets(): { [key: string]: { value: number; budget: number; passed: boolean } } {
    const results: { [key: string]: { value: number; budget: number; passed: boolean } } = {};

    Object.entries(PERFORMANCE_BUDGETS).forEach(([key, budget]) => {
      const value = this.metrics[key as keyof PerformanceMetrics] as number;
      if (value !== undefined) {
        results[key] = {
          value,
          budget,
          passed: value <= budget,
        };
      }
    });

    return results;
  }

  public getPerformanceScore(): number {
    const budgetResults = this.checkBudgets();
    const totalMetrics = Object.keys(budgetResults).length;
    const passedMetrics = Object.values(budgetResults).filter(result => result.passed).length;
    
    return totalMetrics > 0 ? (passedMetrics / totalMetrics) * 100 : 0;
  }

  public sendToAnalytics(endpoint?: string) {
    const data = {
      ...this.metrics,
      budgetResults: this.checkBudgets(),
      performanceScore: this.getPerformanceScore(),
    };

    if (endpoint) {
      // Send to custom analytics endpoint
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch(error => {
        console.warn('Failed to send performance metrics:', error);
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚀 Performance Metrics');
      console.table(data);
      console.groupEnd();
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>(
    performanceMonitor.getMetrics()
  );

  React.useEffect(() => {
    const unsubscribe = performanceMonitor.onMetricsUpdate(setMetrics);
    return unsubscribe;
  }, []);

  return {
    metrics,
    budgetResults: performanceMonitor.checkBudgets(),
    performanceScore: performanceMonitor.getPerformanceScore(),
  };
}

// Memory usage monitoring
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }
  return null;
}

// Resource timing analysis
export function getResourceTimings() {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const analysis = {
    totalResources: resources.length,
    totalSize: 0,
    slowestResource: null as PerformanceResourceTiming | null,
    resourcesByType: {} as { [key: string]: { count: number; totalDuration: number } },
  };

  let slowestDuration = 0;

  resources.forEach(resource => {
    const duration = resource.responseEnd - resource.requestStart;
    const size = resource.transferSize || 0;
    
    analysis.totalSize += size;

    if (duration > slowestDuration) {
      slowestDuration = duration;
      analysis.slowestResource = resource;
    }

    // Categorize by resource type
    const extension = resource.name.split('.').pop()?.toLowerCase() || 'other';
    const type = getResourceType(extension);
    
    if (!analysis.resourcesByType[type]) {
      analysis.resourcesByType[type] = { count: 0, totalDuration: 0 };
    }
    
    analysis.resourcesByType[type].count++;
    analysis.resourcesByType[type].totalDuration += duration;
  });

  return analysis;
}

function getResourceType(extension: string): string {
  const typeMap: { [key: string]: string } = {
    'js': 'JavaScript',
    'css': 'CSS',
    'png': 'Image',
    'jpg': 'Image',
    'jpeg': 'Image',
    'gif': 'Image',
    'svg': 'Image',
    'webp': 'Image',
    'woff': 'Font',
    'woff2': 'Font',
    'ttf': 'Font',
    'otf': 'Font',
    'json': 'Data',
    'xml': 'Data',
  };
  
  return typeMap[extension] || 'Other';
}

// Performance observer for long tasks
export function observeLongTasks(callback: (entries: PerformanceEntry[]) => void) {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      
      return () => observer.disconnect();
    } catch (error) {
      console.warn('Long task observation not supported:', error);
    }
  }
  
  return () => {};
}

// Initialize performance monitoring
export function initPerformanceMonitoring(options?: {
  analyticsEndpoint?: string;
  enableConsoleLogging?: boolean;
}) {
  // Send metrics after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.sendToAnalytics(options?.analyticsEndpoint);
    }, 1000);
  });

  // Send metrics before page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.sendToAnalytics(options?.analyticsEndpoint);
  });

  // Monitor long tasks
  const stopLongTaskObserver = observeLongTasks((entries) => {
    if (options?.enableConsoleLogging) {
      console.warn('Long tasks detected:', entries);
    }
  });

  return {
    stop: () => {
      stopLongTaskObserver();
    },
  };
}