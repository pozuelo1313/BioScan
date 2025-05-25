import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import '../App.css';
const styles = `
.status-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 2rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.5s ease-out;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-message.success {
  border-left: 4px solid #059669;
  background-color: #ecfdf5;
}

.status-message.error {
  border-left: 4px solid #dc2626;
  background-color: #fef2f2;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.status-message.fade-out {
  animation: fadeOut 0.5s ease-out forwards;
}
`;

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState({
    submitted: false,
    submitting: false,
    info: { error: false, msg: null }
  });

  const [showStatusMessage, setShowStatusMessage] = useState(false);

  // Resetear estado cuando el mensaje se envía correctamente
  useEffect(() => {
    if (status.submitted || status.info.error) {
      setShowStatusMessage(true);
      const timer = setTimeout(() => {
        setShowStatusMessage(false);
        setStatus({
          submitted: false,
          submitting: false,
          info: { error: false, msg: null }
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [status.submitted, status.info.error]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Iniciando envío de email...');
    setStatus(prevStatus => ({ ...prevStatus, submitting: true }));

    // Validación básica
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus({
        submitted: false,
        submitting: false,
        info: { 
          error: true, 
          msg: 'Por favor, completa todos los campos del formulario.' 
        }
      });
      return;
    }

    try {
      // Reemplaza estos valores con los de tu cuenta EmailJS
      const serviceId = 'service_lu4eyoh';  
      const templateId = 'template_oort3wn';
      const publicKey = 'tbkRCwraYaOd9IpW7';
      
      console.log('Verificando credenciales de EmailJS...');
      if (!serviceId || !templateId || !publicKey) {
        throw new Error('Faltan credenciales de EmailJS. Por favor, verifica la configuración.');
      }

      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        reply_to: formData.email
      };

      console.log('Intentando enviar email con los siguientes parámetros:', {
        serviceId,
        templateId,
        templateParams
      });

      // Verificar que emailjs está inicializado
      if (typeof emailjs === 'undefined') {
        throw new Error('EmailJS no está inicializado correctamente');
      }

      // Inicializar EmailJS si no está inicializado
      if (!emailjs.init) {
        emailjs.init(publicKey);
      }

      const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log('Respuesta de EmailJS:', response);

      if (response.status !== 200) {
        throw new Error(`Error en la respuesta de EmailJS: ${response.text}`);
      }

      // Éxito
      setStatus({
        submitted: true,
        submitting: false,
        info: { error: false, msg: '¡Mensaje enviado con éxito!' }
      });
      
      // Reiniciar el formulario
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error detallado al enviar el mensaje:', {
        error: error,
        message: error.message,
        text: error.text,
        status: error.status,
        stack: error.stack
      });

      let errorMessage = 'Error al enviar el mensaje. ';
      
      if (error.message) {
        errorMessage += error.message;
      } else if (error.text) {
        errorMessage += error.text;
      } else {
        errorMessage += 'Por favor, verifica tu conexión a internet e inténtalo de nuevo.';
      }

      setStatus({
        submitted: false,
        submitting: false,
        info: { 
          error: true, 
          msg: errorMessage
        }
      });
    }
  };

  return (
    <>
      <style>{styles}</style>
      {showStatusMessage && (
        <div className={`status-message ${status.info.error ? 'error' : 'success'} ${!showStatusMessage ? 'fade-out' : ''}`}>
          {status.info.error ? (
            <>
              ❌ {status.info.msg}
            </>
          ) : (
            <>
              ✅ ¡Mensaje enviado con éxito! Te responderemos lo antes posible.
            </>
          )}
        </div>
      )}
      <div className="contact-container">
        <div className="contact-wrapper">
          {/* Encabezado */}
          <header className="contact-header">
            <h1 className="contact-title">
              Contacta con <span>BioScan</span>
            </h1>
            <p className="contact-subtitle">
              ¿Tienes alguna pregunta o sugerencia? Estamos aquí para ayudarte
            </p>
          </header>

          {/* Información de contacto */}
          <div className="info-grid">
            <div className="info-card">
              <h2>Información de Contacto</h2>
              <div className="info-content">
                <p className="info-item">📍 Madrid, España</p>
                <p className="info-item">📧 info@bioscan.com</p>
                <p className="info-item">📱 +34 123 456 789</p>
                <p className="info-item">⏰ Lun - Vie: 9:00 - 18:00</p>
              </div>
            </div>

            <div className="info-card">
              <h2>Redes Sociales</h2>
              <div className="info-content">
                <p className="info-item">👥 Facebook: /BioScan</p>
                <p className="info-item">📸 Instagram: @bioscan_oficial</p>
                <p className="info-item">🐦 Twitter: @BioScan</p>
                <p className="info-item">💼 LinkedIn: BioScan-Tech</p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Envíanos un mensaje</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="subject">Asunto</label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="form-input"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Asunto del mensaje"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="message">Mensaje</label>
              <textarea
                id="message"
                name="message"
                className="form-textarea"
                value={formData.message}
                onChange={handleChange}
                placeholder="Escribe tu mensaje aquí..."
                required
              ></textarea>
            </div>

            <div className="submit-button-wrapper">
              <button 
                type="submit" 
                className="submit-button"
                disabled={status.submitting}
              >
                {status.submitting ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ContactPage;