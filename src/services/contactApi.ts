import { ContactFormData, ContactSubmissionPayload } from '../components/ContactModal/types';

export const DEFAULT_CONTACT_API_ENDPOINT = 'https://api.akretrix.com/leads';

export class ContactApiError extends Error {
  public recoverable: boolean;
  constructor(message: string, { recoverable = false }: { recoverable?: boolean } = {}) {
    super(message);
    this.name = 'ContactApiError';
    this.recoverable = recoverable;
  }
}

export async function submitContactInquiry(
  formData: ContactFormData,
  options: {
    apiEndpoint?: string;
    source?: string;
    modalOpenedTimestamp: number;
  }
): Promise<{ success: boolean; message?: string }> {
  const {
    apiEndpoint = DEFAULT_CONTACT_API_ENDPOINT,
    source = 'unknown',
    modalOpenedTimestamp
  } = options;

  // Anti-spam Honeypot validation
  if (formData.website_url_hp && formData.website_url_hp.trim().length > 0) {
    // Silently succeed to trick spam bot
    return { success: true };
  }

  if (!formData.turnstileToken) {
    throw new ContactApiError('Please complete the verification challenge (Captcha).', { recoverable: true });
  }

  const now = new Date();
  const tzo = -now.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0');
  const clientIsoWithTz = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}${dif}${pad(tzo / 60)}:${pad(tzo % 60)}`;

  let fullPhone: string | undefined = undefined;
  if (formData.phone && formData.phone.trim().length > 0) {
    fullPhone = formData.countryCode ? `${formData.countryCode} ${formData.phone.trim()}` : formData.phone.trim();
  }

  const payload: ContactSubmissionPayload = {
    fullName: formData.fullName.trim(),
    workEmail: formData.workEmail.trim(),
    phone: fullPhone,
    company: formData.company ? formData.company.trim() : undefined,
    service: formData.service,
    message: formData.message ? formData.message.trim() : undefined,
    privacyConsent: formData.privacyConsent,
    website_url_hp: formData.website_url_hp || '',
    'cf-turnstile-response': formData.turnstileToken,
    source,
    submitDurationMs: Date.now() - modalOpenedTimestamp,
    clientTimestamp: now.toString(),
    clientIsoWithTz,
    clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UNKNOWN',
    clientTimezoneOffset: now.getTimezoneOffset()
  };

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Request failed with status ${response.status}`;
      throw new ContactApiError(message, { recoverable: response.status < 500 });
    }

    return { success: true };
  } catch (error) {
    if (error instanceof ContactApiError) {
      throw error;
    }
    throw new ContactApiError(
      error instanceof Error ? error.message : 'An unexpected network error occurred.',
      { recoverable: true }
    );
  }
}
