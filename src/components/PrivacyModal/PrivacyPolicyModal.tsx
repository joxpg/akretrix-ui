import React, { useEffect } from 'react';
import { X, Shield } from 'lucide-react';

export interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'en' | 'es';
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  lang = 'en'
}) => {
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

  const isEs = lang === 'es';

  return (
    <div
      className={`ak-modal-backdrop ${isOpen ? 'ak-active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ak-privacy-modal-title"
    >
      <div className="ak-modal-card" style={{ maxWidth: '680px' }}>
        <button
          className="ak-modal-close"
          onClick={onClose}
          aria-label={isEs ? 'Cerrar' : 'Close'}
          type="button"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--ak-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <h3 className="ak-modal-title" id="ak-privacy-modal-title" style={{ margin: 0 }}>
              {isEs ? 'Política de Privacidad y Tratamiento de Datos' : 'Privacy Policy & Data Protection'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--ak-text-muted)' }}>
              {isEs ? 'Última actualización: Agosto 2026' : 'Last updated: August 2026'}
            </span>
          </div>
        </div>

        <div style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          paddingRight: '8px',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          color: 'var(--ak-text-secondary)'
        }}>
          {isEs ? (
            <>
              <p>
                En <strong>AkreTrix Technologies</strong> nos comprometemos con la protección y seguridad de tus datos personales, en estricto cumplimiento del Reglamento General de Protección de Datos (RGPD / GDPR) y la Ley Estatutaria 1581 de 2012 (Habeas Data Colombia).
              </p>
              <h4 style={{ color: 'var(--ak-text-primary)', marginTop: '16px', marginBottom: '6px' }}>1. Información Recopilada</h4>
              <p>
                Recopilamos información suministrada voluntariamente al contactarnos o solicitar propuestas: Nombre completo, correo electrónico corporativo, teléfono, nombre de la empresa y alcance del proyecto.
              </p>
              <h4 style={{ color: 'var(--ak-text-primary)', marginTop: '16px', marginBottom: '6px' }}>2. Finalidad del Tratamiento</h4>
              <p>
                Los datos son utilizados exclusivamente para:
              </p>
              <ul style={{ paddingLeft: '20px', margin: '6px 0' }}>
                <li>Responder a consultas técnicas, solicitudes de cotización o propuestas comerciales.</li>
                <li>Gestión de acceso a demostraciones de plataformas e-Learning y Observabilidad.</li>
                <li>Protección contra abusos y spam mediante Cloudflare Turnstile.</li>
              </ul>
              <h4 style={{ color: 'var(--ak-text-primary)', marginTop: '16px', marginBottom: '6px' }}>3. Derechos del Titular (ARCO)</h4>
              <p>
                Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación y Oposición escribiendo a <code>privacy@akretrix.com</code> en cualquier momento.
              </p>
            </>
          ) : (
            <>
              <p>
                At <strong>AkreTrix Technologies</strong>, we are committed to safeguarding and protecting your personal data in strict compliance with the General Data Protection Regulation (GDPR / RGPD) and applicable data protection legislation.
              </p>
              <h4 style={{ color: 'var(--ak-text-primary)', marginTop: '16px', marginBottom: '6px' }}>1. Information We Collect</h4>
              <p>
                We collect information voluntarily submitted when requesting technical proposals or enterprise quotes: Full name, work email address, phone number, company name, and project scope requirements.
              </p>
              <h4 style={{ color: 'var(--ak-text-primary)', marginTop: '16px', marginBottom: '6px' }}>2. Purpose of Data Processing</h4>
              <p>
                Your data is processed strictly for:
              </p>
              <ul style={{ paddingLeft: '20px', margin: '6px 0' }}>
                <li>Responding to engineering inquiries, proposals, and enterprise consulting requests.</li>
                <li>Managing demonstration access for our eLearning and Observability platforms.</li>
                <li>Mitigating spam and bot abuse using Cloudflare Turnstile verification.</li>
              </ul>
              <h4 style={{ color: 'var(--ak-text-primary)', marginTop: '16px', marginBottom: '6px' }}>3. Data Subject Rights</h4>
              <p>
                You retain the right to access, rectify, or request erasure of your contact information at any time by contacting our data privacy office at <code>privacy@akretrix.com</code>.
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          className="ak-btn-submit"
          style={{ marginTop: '20px' }}
          onClick={onClose}
        >
          {isEs ? 'Entendido' : 'Got it'}
        </button>
      </div>
    </div>
  );
};
