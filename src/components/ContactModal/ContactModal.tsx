import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { TurnstileWidget } from '../Turnstile/TurnstileWidget';
import { ContactFormData, ContactModalProps } from './types';
import { submitContactInquiry } from '../../services/contactApi';

const I18N = {
  en: {
    title: 'Contact Us & Request a Proposal',
    subtitle: 'Connect with our engineering leadership to discuss your cloud, DevOps, migration, automation, or product needs.',
    fullName: 'Full Name *',
    fullNamePlaceholder: 'e.g. Jane Doe',
    workEmail: 'Work Email *',
    workEmailPlaceholder: 'jane@company.com',
    phone: 'Phone Number (Optional)',
    phonePlaceholder: '(555) 000-0000',
    company: 'Company / Organization',
    companyPlaceholder: 'e.g. Enterprise Inc.',
    service: 'Service or Product of Interest *',
    servicePlaceholder: 'Select a service or product...',
    groupServices: 'Enterprise Services',
    groupProducts: 'Products & Platforms',
    optCloudFoundations: 'Cloud Foundations & Infrastructure',
    optMigrations: 'Zero-Downtime Database Migrations',
    optDevops: 'DevOps & CI/CD Pipelines',
    optAutomation: 'Test Automation & RPA',
    optAi: 'AI Development & LLM Integration',
    optArgos: 'Argos Observability Platform',
    optSentinel: 'Uptime Sentinel Engine',
    optElearning: 'e-Learning (Compliance & Verifiable Badges)',
    optBlueprints: 'Cloud Datalayer Blueprints',
    optFreeTools: 'Free Developer Tools',
    optGeneral: 'General Inquiry / Strategic Partnership',
    notes: 'Project Details / Scope',
    notesPlaceholder: 'Tell us about your requirements, timeline, or current infrastructure...',
    privacyConsentPrefix: 'I agree to the ',
    privacyConsentLink: 'Privacy Policy',
    privacyConsentSuffix: ' and consent to the secure storage of my contact information.',
    submit: 'Send Inquiry & Request Proposal',
    submitting: 'Sending Inquiry...',
    successTitle: 'Inquiry Received!',
    successSubtitle: 'Thank you for reaching out. Our engineering leadership will review your request and get in touch within 24 hours.',
    close: 'Close',
    errorGeneric: 'An error occurred while sending your request. Please try again.'
  },
  es: {
    title: 'Contáctanos y Solicita una Propuesta',
    subtitle: 'Conecta con nuestro liderazgo de ingeniería para discutir tus necesidades de nube, DevOps, migración, automatización o producto.',
    fullName: 'Nombre Completo *',
    fullNamePlaceholder: 'ej. Juan Pérez',
    workEmail: 'Correo Corporativo *',
    workEmailPlaceholder: 'juan@empresa.com',
    phone: 'Teléfono (Opcional)',
    phonePlaceholder: '(555) 000-0000',
    company: 'Empresa / Organización',
    companyPlaceholder: 'ej. Empresa S.A.',
    service: 'Servicio o Producto de Interés *',
    servicePlaceholder: 'Selecciona un servicio o producto...',
    groupServices: 'Servicios Empresariales',
    groupProducts: 'Productos y Plataformas',
    optCloudFoundations: 'Fundaciones Cloud e Infraestructura',
    optMigrations: 'Migraciones de Base de Datos sin Downtime',
    optDevops: 'DevOps & Pipelines CI/CD',
    optAutomation: 'Automatización de Pruebas & RPA',
    optAi: 'Desarrollo IA & Integración LLM',
    optArgos: 'Plataforma de Observabilidad Argos',
    optSentinel: 'Motor Uptime Sentinel',
    optElearning: 'e-Learning (Cumplimiento e Insignias Verificables)',
    optBlueprints: 'Blueprints de Capa de Datos Cloud',
    optFreeTools: 'Herramientas Gratuitas para Desarrolladores',
    optGeneral: 'Consulta General / Alianza Estratégica',
    notes: 'Detalles del Proyecto / Alcance',
    notesPlaceholder: 'Cuéntanos sobre tus requerimientos, tiempos o infraestructura actual...',
    privacyConsentPrefix: 'Acepto la ',
    privacyConsentLink: 'Política de Privacidad',
    privacyConsentSuffix: ' y consiento el almacenamiento seguro de mis datos de contacto.',
    submit: 'Enviar Consulta y Solicitar Propuesta',
    submitting: 'Enviando Consulta...',
    successTitle: '¡Consulta Recibida!',
    successSubtitle: 'Gracias por contactarnos. Nuestro equipo de ingeniería revisará tu solicitud y se comunicará en un plazo de 24 horas.',
    close: 'Cerrar',
    errorGeneric: 'Ocurrió un error al enviar tu solicitud. Por favor intenta de nuevo.'
  }
};

const COUNTRY_CODES = [
  { code: '+1', label: '+1 (US / CA)' },
  { code: '+57', label: '+57 (Colombia)' },
  { code: '+52', label: '+52 (México)' },
  { code: '+34', label: '+34 (España)' },
  { code: '+55', label: '+55 (Brasil)' },
  { code: '+44', label: '+44 (UK)' },
  { code: '+49', label: '+49 (Germany)' },
  { code: '+33', label: '+33 (France)' },
  { code: '+61', label: '+61 (Australia)' },
  { code: '+91', label: '+91 (India)' },
  { code: '+81', label: '+81 (Japan)' },
  { code: '', label: 'Other' }
];

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  apiEndpoint,
  turnstileSiteKey,
  source = 'unknown',
  defaultService = '',
  lang = 'en',
  onSuccess,
  privacyPolicyUrl = '/privacy'
}) => {
  const t = I18N[lang] || I18N.en;

  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    workEmail: '',
    countryCode: '+1',
    phone: '',
    company: '',
    service: defaultService,
    message: '',
    privacyConsent: false,
    website_url_hp: '',
    turnstileToken: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const modalOpenedTimestamp = useRef<number>(Date.now());

  useEffect(() => {
    if (isOpen) {
      modalOpenedTimestamp.current = Date.now();
      setIsSuccess(false);
      setErrorMessage(null);
      if (defaultService) {
        setFormData(prev => ({ ...prev, service: defaultService }));
      }
    }
  }, [isOpen, defaultService]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await submitContactInquiry(formData, {
        apiEndpoint,
        source,
        modalOpenedTimestamp: modalOpenedTimestamp.current
      });

      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`ak-modal-backdrop ${isOpen ? 'ak-active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ak-contact-modal-title"
    >
      <div className="ak-modal-card">
        <button
          className="ak-modal-close"
          onClick={onClose}
          aria-label={t.close}
          type="button"
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="ak-success-state">
            <div className="ak-success-icon">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="ak-modal-title" id="ak-contact-modal-title">
              {t.successTitle}
            </h3>
            <p className="ak-modal-subtitle">
              {t.successSubtitle}
            </p>
            <button
              type="button"
              className="ak-btn-submit ak-btn-success"
              onClick={onClose}
            >
              {t.close}
            </button>
          </div>
        ) : (
          <>
            <h3 className="ak-modal-title" id="ak-contact-modal-title">
              {t.title}
            </h3>
            <p className="ak-modal-subtitle">
              {t.subtitle}
            </p>

            {errorMessage && (
              <div className="ak-error-banner" role="alert">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Anti-spam Honeypot Trap */}
              <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
                <label htmlFor="ak-website-url-hp">Leave this field blank</label>
                <input
                  type="text"
                  id="ak-website-url-hp"
                  name="website_url_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website_url_hp || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Full Name */}
              <div className="ak-form-group">
                <label className="ak-form-label" htmlFor="ak-fullName">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  id="ak-fullName"
                  name="fullName"
                  className="ak-form-input"
                  placeholder={t.fullNamePlaceholder}
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              {/* Work Email */}
              <div className="ak-form-group">
                <label className="ak-form-label" htmlFor="ak-workEmail">
                  {t.workEmail}
                </label>
                <input
                  type="email"
                  id="ak-workEmail"
                  name="workEmail"
                  className="ak-form-input"
                  placeholder={t.workEmailPlaceholder}
                  required
                  value={formData.workEmail}
                  onChange={handleChange}
                />
              </div>

              {/* Phone with Country Code */}
              <div className="ak-form-group">
                <label className="ak-form-label" htmlFor="ak-phone">
                  {t.phone}
                </label>
                <div className="ak-phone-group">
                  <select
                    name="countryCode"
                    className="ak-form-select ak-country-select"
                    value={formData.countryCode}
                    onChange={handleChange}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code || 'other'} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    id="ak-phone"
                    name="phone"
                    className="ak-form-input"
                    placeholder={t.phonePlaceholder}
                    value={formData.phone || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Company */}
              <div className="ak-form-group">
                <label className="ak-form-label" htmlFor="ak-company">
                  {t.company}
                </label>
                <input
                  type="text"
                  id="ak-company"
                  name="company"
                  className="ak-form-input"
                  placeholder={t.companyPlaceholder}
                  value={formData.company || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Service of Interest */}
              <div className="ak-form-group">
                <label className="ak-form-label" htmlFor="ak-service">
                  {t.service}
                </label>
                <select
                  id="ak-service"
                  name="service"
                  className="ak-form-select"
                  required
                  value={formData.service}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    {t.servicePlaceholder}
                  </option>
                  <optgroup label={t.groupServices}>
                    <option value="cloud-foundations">{t.optCloudFoundations}</option>
                    <option value="migrations">{t.optMigrations}</option>
                    <option value="devops">{t.optDevops}</option>
                    <option value="automation-rpa">{t.optAutomation}</option>
                    <option value="ai-solutions">{t.optAi}</option>
                  </optgroup>
                  <optgroup label={t.groupProducts}>
                    <option value="elearning-platform">{t.optElearning}</option>
                    <option value="argos-observability">{t.optArgos}</option>
                    <option value="uptime-sentinel">{t.optSentinel}</option>
                    <option value="datalayer-blueprints">{t.optBlueprints}</option>
                    <option value="free-tools">{t.optFreeTools}</option>
                  </optgroup>
                  <option value="general">{t.optGeneral}</option>
                </select>
              </div>

              {/* Message / Scope */}
              <div className="ak-form-group">
                <label className="ak-form-label" htmlFor="ak-message">
                  {t.notes}
                </label>
                <textarea
                  id="ak-message"
                  name="message"
                  className="ak-form-textarea"
                  maxLength={3000}
                  placeholder={t.notesPlaceholder}
                  value={formData.message || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Privacy Consent Checkbox */}
              <div className="ak-checkbox-group">
                <input
                  type="checkbox"
                  id="ak-privacyConsent"
                  name="privacyConsent"
                  className="ak-checkbox"
                  required
                  checked={formData.privacyConsent}
                  onChange={handleChange}
                />
                <label className="ak-checkbox-label" htmlFor="ak-privacyConsent">
                  {t.privacyConsentPrefix}
                  <a href={privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
                    {t.privacyConsentLink}
                  </a>
                  {t.privacyConsentSuffix}
                </label>
              </div>

              {/* Turnstile Captcha */}
              <TurnstileWidget
                siteKey={turnstileSiteKey}
                onSuccess={(token) => {
                  setFormData(prev => ({ ...prev, turnstileToken: token }));
                }}
                onExpire={() => {
                  setFormData(prev => ({ ...prev, turnstileToken: '' }));
                }}
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="ak-btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{t.submitting}</span>
                  </>
                ) : (
                  <span>{t.submit}</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
