// GA4 Analytics Service for Form Tracking
// This service provides comprehensive tracking for multi-step forms
// Events are pushed to dataLayer for GTM to forward to GA4.

interface DataLayerEvent {
  event: string;
  [key: string]: string | number | boolean | undefined;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer: DataLayerEvent[];
  }
}

export interface FormStepData {
  step_number: number;
  step_name: string;
  form_name: string;
  session_id: string;
  user_id?: string;
  time_on_step?: number;
  previous_step?: number;
  answers_count?: number;
  publisher_id?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface FormAnswerData {
  step_number: number;
  question: string;
  answer: string | string[];
  answer_type: 'single_choice' | 'multiple_choice' | 'text_input' | 'address';
  form_name: string;
  session_id: string;
}

export interface FormConversionData {
  form_name: string;
  total_steps: number;
  completed_steps: number;
  total_time: number;
  session_id: string;
  conversion_value?: number;
  publisher_id?: string;
  lead_quality_score?: number;
}

class FormAnalytics {
  private sessionId: string;
  private startTime: number;
  private stepStartTime: number;
  private formName: string;
  private isInitialized: boolean = false;

  constructor(formName: string = 'simplified_lander') {
    this.formName = formName;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.stepStartTime = Date.now();
  }

  // Initialize tracking if not already initialized
  private ensureInitialized(): boolean {
    if (typeof window === 'undefined') return false;
    window.dataLayer = window.dataLayer || [];
    this.isInitialized = true;
    return true;
  }

  // Generate a unique session ID
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get URL parameters for attribution tracking
  private getUrlParams(): Record<string, string> {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || '',
      gclid: params.get('gclid') || '',
      fbclid: params.get('fbclid') || '',
      referrer: document.referrer || '',
    };
  }

  // Track when a user views a form step
  trackStepView(stepNumber: number, stepName: string, additionalData: Partial<FormStepData> = {}) {
    if (!this.ensureInitialized()) return;

    const now = Date.now();
    const timeOnPreviousStep = now - this.stepStartTime;
    this.stepStartTime = now;

    window.dataLayer.push({
      event: 'form_step_view',
      step_number: stepNumber,
      step_name: stepName,
      form_name: this.formName,
      session_id: this.sessionId,
      time_on_step: stepNumber > 0 ? timeOnPreviousStep : 0,
      previous_step: stepNumber > 0 ? stepNumber - 1 : undefined,
      publisher_id: additionalData.publisher_id || undefined,
      ...this.getUrlParams(),
    });

    // Also track as a virtual page view for funnel analysis
    window.dataLayer.push({
      event: 'virtual_page_view',
      page_title: `${this.formName} - Step ${stepNumber} - ${stepName}`,
      page_location: `${window.location.origin}/form/${this.formName}/step/${stepNumber}`,
    });

    console.log('📊 GA4 Step View:', { step_number: stepNumber, step_name: stepName });
  }

  // Track when a user answers a question
  trackAnswerSubmission(
    stepNumber: number,
    question: string,
    answer: string | string[],
    answerType: FormAnswerData['answer_type'] = 'single_choice'
  ) {
    if (!this.ensureInitialized()) return;

    // Format answer: join arrays with | separator, truncate to 100 chars
    const formattedAnswer = Array.isArray(answer)
      ? answer.join('|').substring(0, 100)
      : String(answer).substring(0, 100);

    window.dataLayer.push({
      event: 'form_answer_submitted',
      step_number: stepNumber,
      question,
      answer: formattedAnswer,
      answer_type: answerType,
      form_name: this.formName,
      session_id: this.sessionId,
    });

    console.log('📝 GA4 Answer Submitted:', { step_number: stepNumber, question });
  }

  // Track form abandonment (when user leaves without completing)
  trackFormAbandonment(currentStep: number, reason: string = 'unknown') {
    if (!this.ensureInitialized()) return;

    const totalTime = Date.now() - this.startTime;

    window.dataLayer.push({
      event: 'form_abandoned',
      abandoned_at_step: currentStep,
      total_time_spent: totalTime,
      abandonment_reason: reason,
      completion_rate: Math.round((currentStep / 11) * 100),
      form_name: this.formName,
      session_id: this.sessionId,
      publisher_id: undefined,
      ...this.getUrlParams(),
    });

    console.log('🚪 GA4 Form Abandoned:', { abandoned_at_step: currentStep, reason });
  }

  // Track successful form completion
  trackFormCompletion(additionalData: Partial<FormConversionData> = {}) {
    if (!this.ensureInitialized()) return;

    const totalTime = Date.now() - this.startTime;
    const conversionValue = additionalData.conversion_value || 100;

    // Track as lead generation event
    window.dataLayer.push({
      event: 'generate_lead',
      currency: 'USD',
      value: conversionValue,
      lead_source: this.formName,
      form_name: this.formName,
      publisher_id: additionalData.publisher_id || undefined,
      total_time_seconds: Math.floor(totalTime / 1000),
      session_id: this.sessionId,
      ...this.getUrlParams(),
    });

    // Also track as form completion
    window.dataLayer.push({
      event: 'form_completed',
      form_name: this.formName,
      session_id: this.sessionId,
      total_time_seconds: Math.floor(totalTime / 1000),
      value: conversionValue,
    });

    console.log('🎉 GA4 Form Completed:', { form_name: this.formName, value: conversionValue });
  }

  // Track form errors
  trackFormError(stepNumber: number, errorType: string, errorMessage: string) {
    if (!this.ensureInitialized()) return;

    window.dataLayer.push({
      event: 'form_error',
      error_type: errorType,
      error_message: errorMessage.substring(0, 100),
      step_number: stepNumber,
      form_name: this.formName,
      session_id: this.sessionId,
    });

    console.log('❌ GA4 Form Error:', { error_type: errorType, step_number: stepNumber });
  }

  // Track time spent on each step (called when moving to next step)
  trackStepCompletion(stepNumber: number, stepName: string, answers: Record<string, any> = {}) {
    if (!this.ensureInitialized()) return;

    const timeOnStep = Date.now() - this.stepStartTime;

    window.dataLayer.push({
      event: 'form_step_completed',
      step_number: stepNumber,
      step_name: stepName,
      time_on_step_seconds: Math.floor(timeOnStep / 1000),
      form_name: this.formName,
      session_id: this.sessionId,
      step_completion_rate: Math.round(((stepNumber + 1) / 11) * 100),
    });

    console.log('✅ GA4 Step Completed:', { step_number: stepNumber, step_name: stepName });
  }

  // Track specific user interactions
  trackInteraction(action: string, element: string, stepNumber: number, additionalData: Record<string, any> = {}) {
    if (!this.ensureInitialized()) return;

    window.dataLayer.push({
      event: 'form_interaction',
      action,
      element,
      step_number: stepNumber,
      form_name: this.formName,
      session_id: this.sessionId,
    });

    console.log('👆 GA4 Interaction:', { action, element, step_number: stepNumber });
  }

  // Get current session data
  getSessionData() {
    return {
      sessionId: this.sessionId,
      formName: this.formName,
      startTime: this.startTime,
      currentTime: Date.now(),
      totalTime: Date.now() - this.startTime
    };
  }

  // Enhanced method for tracking field-level interactions
  trackFieldInteraction(fieldName: string, fieldType: string, stepNumber: number, interactionType: 'focus' | 'blur' | 'change' | 'error') {
    this.trackInteraction(`field_${interactionType}`, fieldName, stepNumber, {
      field_type: fieldType,
      interaction_type: interactionType
    });
  }
}

// Export singleton instance
export const formAnalytics = new FormAnalytics('simplified_lander');

// Export class for creating additional instances
export default FormAnalytics;

// Helper function to initialize tracking in your app
// Defaults to GTM mode (dataLayer only). Set VITE_USE_GTM=false to fall back to direct gtag.js.
export const initializeTracking = () => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];

  const useGTM = import.meta.env.VITE_USE_GTM !== 'false'; // defaults to true

  if (!useGTM) {
    // Legacy mode: inject gtag.js directly (rollback path)
    const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-Z8LH0DR4N1';
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);
    window.gtag = function() { window.dataLayer.push(arguments as any); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { send_page_view: false, anonymize_ip: true });
    console.log('🔧 GA4 Initialized (legacy gtag.js) with ID:', GA4_ID);
  }
  // If useGTM is true, GTM is already loaded via index.html — no gtag.js injection needed
};

// Keep old export name for backwards compat during migration (points to same logic)
export const initializeGA4 = (measurementId?: string) => {
  initializeTracking();
};
