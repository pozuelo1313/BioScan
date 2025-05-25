# 🌿 BIOSCAN

BIOSCAN es una aplicación web que permite identificar plantas a partir de imágenes, utilizando una API de inteligencia artificial. Está dividido en dos partes:

- `bio-r/` → Aplicación React (interfaz de usuario)
- `back/` → Servidor Node.js + Express (manejo de autenticación, conexión a la API, etc.)

---

## 🚀 Tecnologías usadas

- **Frontend:** React, CSS
- **Backend:** Node.js, Express
- **API:** DeepSeek V3 (gratuita)

---

## 🗂️ Estructura del proyecto

bioscan/
├── bio-r/ # Aplicación React
├── backend/ # Servidor Node.js + Express
├── .gitignore
├── README.md





## ⚙️ Instalación y uso

### 1. Clona el repositorio

```bash

git clone https://github.com/tu-usuario/bioscan.git
cd bioscan
2. Instala las dependencias (raíz + subcarpetas)

npm install          # instala dependencias de la raíz (concurrently)
cd front && npm install
cd ../back && npm install
cd ..

3. Ejecuta la aplicación

Desde la raíz del proyecto:
npm run dev
Esto iniciará simultáneamente el frontend (React) y el backend (Node.js).

📸 Funcionalidad

Subida de imágenes
Identificación de plantas
biblioteca con tus plantas
chatbot con IA
Registro e inicio de sesión de usuarios
Historial de identificaciones

🧪 Estado del proyecto
✅ Funcional
🚧 Mejoras en diseño en curso
📱 Optimización móvil pendiente



👨‍💻 Autor
Desarrollado por Alejandro Pozuelo