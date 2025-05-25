import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

const Chatbot = ({ scientificName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef(null);

  // Mostrar mensaje de bienvenida cada vez que se carga la página
  useEffect(() => {
    // Ocultar el mensaje después de 5 segundos
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []); // Se ejecuta solo al montar el componente

  // Agrega un mensaje de bienvenida al inicio
  useEffect(() => {
    setMessages([
      {
        type: 'bot',
        text: scientificName 
          ? `¡Hola! Soy tu asistente botánico. Puedo responder preguntas sobre ${scientificName} u otras plantas. ¿En qué puedo ayudarte?` 
          : '¡Hola! Soy tu asistente botánico. ¿En qué puedo ayudarte hoy?'
      }
    ]);
  }, [scientificName]);
  const formatBotResponse = (text) => {
  if (!text) return text;
  
  return text
    // Convertir **texto** a <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convertir *texto* a <em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convertir listas con - o •
    .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
    // Envolver listas en <ul>
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    // Convertir saltos de línea dobles en párrafos
    .replace(/\n\n/g, '</p><p>')
    // Envolver todo en párrafos si no hay otros elementos HTML
    .replace(/^(?!<[ul|ol|h|p])(.+)$/gm, '<p>$1</p>')
    // Limpiar párrafos vacíos
    .replace(/<p><\/p>/g, '');
};

// Modifica el componente de mensaje del bot
const BotMessage = ({ text }) => (
  <div 
    className="message-content"
    dangerouslySetInnerHTML={{ __html: formatBotResponse(text) }}
  />
);
  // Desplaza automáticamente hacia abajo cuando se agregan nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue;
    setInputValue('');
    
    // Agrega el mensaje del usuario al chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: 'user', text: userMessage }
    ]);
    
    setIsLoading(true);
    
    try {
      console.log('Enviando solicitud al chatbot:', {
        question: userMessage,
        scientificName: scientificName || null
      });

      const response = await fetch('http://localhost:3013/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          question: userMessage,
          scientificName: scientificName || null
        }),
      });
      
      console.log('Respuesta recibida:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta:', errorData);
        throw new Error(errorData.error || 'Error en la solicitud al chatbot');
      }
      
      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      // Agrega la respuesta del bot al chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', text: data.answer }
      ]);
    } catch (error) {
      console.error('Error al enviar mensaje al chatbot:', error);
      
      // Mensaje de error
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', text: 'Lo siento, he tenido un problema para procesar tu consulta. Por favor, intenta de nuevo más tarde.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {showWelcome && (
        <div className="chatbot-welcome-message">
          ¡Chatea conmigo! 👋
        </div>
      )}
      <button 
        className="chatbot-toggle" 
        onClick={toggleChat}
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
      >
        <img 
          src="/images/agenteBioScan.webp" 
          alt="Chat" 
          className="chatbot-icon"
        />
      </button>
      
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Asistente Botánico</h3>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message, index) => (
  <div key={index} className={`message ${message.type}`}>
    {message.type === 'bot' ? (
      <BotMessage text={message.text} />
    ) : (
      <div className="message-content">
        {message.text}
      </div>
    )}
  </div>
))}
            {isLoading && (
              <div className="message bot">
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Escribe tu pregunta..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !inputValue.trim()}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;