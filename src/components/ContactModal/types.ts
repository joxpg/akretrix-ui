export interface ContactFormData {
  fullName: string;
  workEmail: string;
  countryCode?: string;
  phone?: string;
  company?: string;
  service: string;
  message?: string;
  privacyConsent: boolean;
  website_url_hp?: string; // honeypot
  turnstileToken?: string;
}

export interface ContactSubmissionPayload {
  fullName: string;
  workEmail: string;
  phone?: string;
  company?: string;
  service: string;
  message?: string;
  privacyConsent: boolean;
  website_url_hp?: string;
  'cf-turnstile-response': string;
  source: string;
  submitDurationMs: number;
  clientTimestamp: string;
  clientIsoWithTz: string;
  clientTimezone: string;
  clientTimezoneOffset: number;
}

export interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiEndpoint?: string;
  turnstileSiteKey?: string;
  source?: 'landing' | 'elearning' | 'enterprise' | string;
  defaultService?: string;
  lang?: 'en' | 'es';
  onSuccess?: () => void;
  privacyPolicyUrl?: string;
}
