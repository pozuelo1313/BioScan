import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const RegisterContainer = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #4caf50;
  text-align: center;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #1a2e35;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #4caf50;
    outline: none;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const Message = styled.p`
  text-align: center;
  margin-top: 1rem;
  padding: 0.8rem;
  border-radius: 5px;
  color: ${props => props.isError ? '#f44336' : '#4caf50'};
  background-color: ${props => props.isError ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)'};
`;

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Validaciones básicas
    if (!email || !password) {
      setError('Por favor ingresa un email y contraseña');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('http://localhost:3015/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Error en el registro');
        return;
      }
      
      setMessage(data.message || 'Registro exitoso! Redirigiendo al inicio de sesión...');
      
      // Limpiar el formulario
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Redireccionar al usuario a la página de inicio de sesión después de un breve retraso
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión al servidor');
    }
  };

  return (
    <RegisterContainer>
      <Title>Registro de Usuario</Title>
      <Form onSubmit={handleRegister}>
        <FormGroup>
          <Label>Email:</Label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="Ingresa tu email"
          />
        </FormGroup>
        <FormGroup>
          <Label>Contraseña:</Label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Ingresa tu contraseña"
          />
        </FormGroup>
        <FormGroup>
          <Label>Confirmar Contraseña:</Label>
          <Input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            placeholder="Confirma tu contraseña"
          />
        </FormGroup>
        <Button type="submit">Registrarse</Button>
        {message && <Message isError={false}>{message}</Message>}
        {error && <Message isError={true}>{error}</Message>}
      </Form>
    </RegisterContainer>
  );
}

export default Register;