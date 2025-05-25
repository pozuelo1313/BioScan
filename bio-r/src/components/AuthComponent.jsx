// components/AuthComponent.jsx
import React, { useState, useEffect } from 'react';
import Login from 'components/Login';
import Register from 'components/Register';

function AuthComponent() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  // Verificar si hay un usuario almacenado al cargar el componente
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Función para manejar el inicio de sesión exitoso
  const handleLoginSuccess = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
  };

  // Si el usuario está autenticado
  if (currentUser) {
    return (
      <div>
        <div className="user-info">
          <p>Bienvenido, {currentUser.email}</p>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login o registro
  return (
    <div>
      {showLogin ? (
        <div>
          <Login onLoginSuccess={handleLoginSuccess} />
          <p>
            ¿No tienes una cuenta?{' '}
            <button onClick={() => setShowLogin(false)}>Regístrate aquí</button>
          </p>
        </div>
      ) : (
        <div>
          <Register onRegisterSuccess={() => setShowLogin(true)} />
          <p>
            ¿Ya tienes una cuenta?{' '}
            <button onClick={() => setShowLogin(true)}>Inicia sesión</button>
          </p>
        </div>
      )}
    </div>
  );
}

export default AuthComponent;