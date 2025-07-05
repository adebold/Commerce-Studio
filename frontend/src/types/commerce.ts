export interface CommerceAppMetrics {
  deploymentStatus: 'online' | 'offline' | 'error';
  apiResponseTime: number;
  errorRate: number;
  activeUsers: number;
  lastDeployment: Date;
  buildStatus: 'success' | 'failed' | 'in_progress';
}

export interface CommerceAppsStatus {
  shopify: CommerceAppMetrics;
  woocommerce: CommerceAppMetrics;
  bigcommerce: CommerceAppMetrics;
  magento: CommerceAppMetrics;
}
