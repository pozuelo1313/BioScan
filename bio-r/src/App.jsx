// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import UploadArea from "./components/UploadArea";
import Result from "./components/Result";
import History from "./components/History";
import PlantCollection from "./components/Plantcollection"; // Importamos el nuevo componente
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import Chatbot from "./components/chatbot";
import "./App.css";

function App() {
  // Estado para almacenar la información del usuario autenticado
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]); // Estado para el historial
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // Estado para mostrar la imagen cargada en el cuadro de carga
  const [preview, setPreview] = useState(null);

  // Verificar si hay un usuario almacenado al cargar la aplicación
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Función para manejar el inicio de sesión exitoso
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleImageUpload = async (file) => {
    // Crear URL temporal para vista previa
    const previewURL = URL.createObjectURL(file);
    setPreview(previewURL);

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:3013/api/identify", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error en la identificación");
      }

      const data = await response.json();
      setResult(data);

      // Agregar al historial: se almacena la fecha, el nombre del archivo, la imagen de vista previa y la respuesta de la API.
      const newEntry = {
        id: Date.now(),
        fileName: file.name,
        preview: previewURL,
        result: data,
        date: new Date().toLocaleString(),
      };

      setHistory((prevHistory) => [newEntry, ...prevHistory]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={
            <main>
              <h1>Identificador de Especies</h1>
              <UploadArea onImageUpload={handleImageUpload} />
              {preview && (
                <div className="preview-container">
                  <h3>Vista Previa</h3>
                  <img src={preview} alt="Vista previa" className="preview-image" />
                </div>
              )}
              {loading && <div className="loading">Identificando especie...</div>}
              {error && <div className="error">{error}</div>}
              {/* Pasamos el userId al componente Result */}
              {result && <Result data={result} userId={user ? user.id : null} />}
              <History history={history} />
            </main>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* Añadimos ruta para la colección de plantas */}
        <Route 
          path="/mi-coleccion" 
          element={user ? <PlantCollection userId={user.id} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={user ? <div>Perfil de {user.email}</div> : <Navigate to="/login" />} 
        />
      </Routes>
      <Chatbot />
    </Router>
  );
}

export default App;