import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// Animaciones
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const leafFloat = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(2deg);
  }
`;

const grow = keyframes`
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;


const PlantIcon = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.8s ease-out 0.2s both;

  &::before {
    content: '🌿';
    font-size: 3rem;
    display: block;
    animation: ${leafFloat} 3s ease-in-out infinite;
  }
`;



const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError('Por favor ingresa un email y contraseña');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3015/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Error en el inicio de sesión');
        setIsLoading(false);
        return;
      }
      
      // Simulamos un pequeño delay para mostrar el loading
      setTimeout(() => {
        onLoginSuccess(data.user);
        navigate('/');
      }, 500);
      
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión al servidor');
      setIsLoading(false);
    }
  };

  return (
  <div className="login-wrapper"> 
    <div className="login-container">
      <PlantIcon /> 
      <h2 className="login-title">Bienvenido de vuelta</h2> 
      <form className="login-form" onSubmit={handleLogin}> 
        <div className="form-group"> 
          <label className="form-label" htmlFor="email">Email</label> 
          <div className="input-wrapper">
            <span className="input-icon">📧</span> 
            <input
              id="email"
              className="login-input" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Contraseña</label>
          <div className="input-wrapper">
            <span className="input-icon">🔒</span>
            <input
              id="password"
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Tu contraseña"
              disabled={isLoading}
            />
          </div>
        </div>

        <button type="submit" className="login-button" disabled={isLoading}> 
          {isLoading && <LoadingSpinner />}
          {isLoading ? 'Iniciando...' : 'Iniciar Sesión 🌱'}
        </button>

        {error && <div className="error-message-login">{error}</div>} 
      </form>
     
      { <div className="login-links">
        
        <span>¿No tienes una cuenta? -{'>'}</span>
        <a href="/register">Crear una cuenta</a>
      </div> }
    </div>
  </div>
);
}

export default Login;