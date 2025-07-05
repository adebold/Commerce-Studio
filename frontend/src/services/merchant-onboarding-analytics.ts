/**
 * Merchant Onboarding Analytics Service
 * 
 * This service tracks analytics related to the merchant onboarding process,
 * including completion rates, drop-off points, time-to-value metrics,
 * and user feedback.
 */

export interface OnboardingEvent {
  merchantId?: string;
  platform?: string;
  step: OnboardingStep;
  timestamp: number;
  sessionId: string;
  timeSpent?: number; // Time spent on the step in milliseconds
  completionStatus?: 'completed' | 'abandoned' | 'error';
  errorDetails?: string;
  metadata?: Record<string, unknown>;
}

export enum OnboardingStep {
  START = 'onboarding_start',
  PLATFORM_SELECTION = 'platform_selection',
  ACCOUNT_SETUP = 'account_setup',
  STORE_CONFIGURATION = 'store_configuration',
  INTEGRATION_SETUP = 'integration_setup',
  FINAL_VERIFICATION = 'final_verification',
  COMPLETE = 'onboarding_complete',
  APP_INSTALLATION = 'app_installation',
  PRODUCT_CONFIGURATION = 'product_configuration',
  WIDGET_PLACEMENT = 'widget_placement',
  FIRST_TRY_ON = 'first_try_on',
  FIRST_RECOMMENDATION = 'first_recommendation'
}

export enum DropOffReason {
  TIME_CONSTRAINT = 'time_constraint',
  COMPLEXITY = 'complexity',
  TECHNICAL_ISSUE = 'technical_issue',
  MISSING_INFORMATION = 'missing_information',
  CHANGED_MIND = 'changed_mind',
  OTHER = 'other'
}

export interface OnboardingFeedback {
  merchantId?: string;
  sessionId: string;
  rating: number; // 1-5 scale
  comments?: string;
  improvementSuggestions?: string;
  wouldRecommend?: boolean;
  timestamp: number;
}

export interface OnboardingMetrics {
  startCount: number;
  completionCount: number;
  completionRate: number;
  averageTimeToComplete: number; // in minutes
  stepCompletionRates: Record<OnboardingStep, number>;
  dropOffPoints: Record<OnboardingStep, number>;
  platformDistribution: Record<string, number>;
  feedbackScore: number; // Average rating
}

class MerchantOnboardingAnalytics {
  private sessionId: string;
  private stepStartTimes: Record<OnboardingStep, number> = {} as Record<OnboardingStep, number>;
  private currentStep?: OnboardingStep;
  private platform?: string;
  private merchantId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Initialize the analytics service with merchant information
   */
  public init(merchantId?: string): void {
    this.merchantId = merchantId;
    this.trackEvent(OnboardingStep.START);
  }

  /**
   * Set the merchant's platform
   */
  public setPlatform(platform: string): void {
    this.platform = platform;
  }

  /**
   * Track an onboarding event
   */
  public trackEvent(
    step: OnboardingStep,
    completionStatus?: 'completed' | 'abandoned' | 'error',
    errorDetails?: string,
    metadata?: Record<string, unknown>
  ): void {
    const timestamp = Date.now();
    let timeSpent: number | undefined;

    // Calculate time spent if this is completing a step
    if (this.currentStep === step && this.stepStartTimes[step]) {
      timeSpent = timestamp - this.stepStartTimes[step];
    }

    // Record start time for the step
    this.stepStartTimes[step] = timestamp;
    this.currentStep = step;

    const event: OnboardingEvent = {
      merchantId: this.merchantId,
      platform: this.platform,
      step,
      timestamp,
      sessionId: this.sessionId,
      timeSpent,
      completionStatus,
      errorDetails,
      metadata
    };

    // Send event to analytics service
    // Since analyticsService doesn't have a direct trackEvent method,
    // we'll log the event and in a real implementation would send it to the backend
    console.log('Tracking merchant onboarding event:', event);
    
    // In a production environment, we would use something like:
    // fetch('/api/analytics/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type: 'merchant_onboarding', data: event })
    // });

    // If this is the completion event, track additional metrics
    if (step === OnboardingStep.COMPLETE) {
      this.trackOnboardingCompletion();
    }
  }

  /**
   * Track when a merchant abandons the onboarding process
   */
  public trackDropOff(
    step: OnboardingStep,
    reason: DropOffReason,
    details?: string
  ): void {
    this.trackEvent(step, 'abandoned', undefined, {
      dropOffReason: reason,
      dropOffDetails: details
    });
  }

  /**
   * Track when a merchant encounters an error during onboarding
   */
  public trackError(
    step: OnboardingStep,
    errorDetails: string,
    metadata?: Record<string, unknown>
  ): void {
    this.trackEvent(step, 'error', errorDetails, metadata);
  }

  /**
   * Track merchant feedback about the onboarding process
   */
  public trackFeedback(feedback: Omit<OnboardingFeedback, 'sessionId' | 'timestamp'>): void {
    const feedbackEvent: OnboardingFeedback = {
      ...feedback,
      merchantId: this.merchantId,
      sessionId: this.sessionId,
      timestamp: Date.now()
    };

    // Log feedback event
    console.log('Tracking merchant onboarding feedback:', feedbackEvent);
    
    // In a production environment, we would send this to the backend
  }

  /**
   * Track the successful completion of the onboarding process
   */
  private trackOnboardingCompletion(): void {
    // Calculate total onboarding time
    const startTime = this.stepStartTimes[OnboardingStep.START];
    const completionTime = this.stepStartTimes[OnboardingStep.COMPLETE];
    
    // Ensure we have both timestamps before calculating
    const totalTime = (startTime && completionTime) ? completionTime - startTime : undefined;

    const completionData = {
      merchantId: this.merchantId,
      platform: this.platform,
      sessionId: this.sessionId,
      totalTimeMs: totalTime,
      stepTimes: { ...this.stepStartTimes }
    };
    
    // Log completion event
    console.log('Tracking merchant onboarding completion:', completionData);
    
    // In a production environment, we would send this to the backend
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export const merchantOnboardingAnalytics = new MerchantOnboardingAnalytics();

/**
 * Fetch onboarding analytics data for the dashboard
 */
export async function fetchOnboardingMetrics(
  startDate: Date,
  endDate: Date
): Promise<OnboardingMetrics> {
  try {
    const response = await fetch('/api/analytics/merchant-onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch onboarding metrics: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching onboarding metrics:', error);
    throw error;
  }
}

/**
 * Create an onboarding analytics dashboard component
 */
export function createOnboardingDashboard(
  containerId: string,
  metrics: OnboardingMetrics
): void {
  // This would be implemented with a charting library like Chart.js
  console.log('Creating onboarding dashboard with metrics:', metrics);
}