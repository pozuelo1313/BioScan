import React, { useCallback, useRef, useEffect } from 'react';

function UploadArea({ onImageUpload }) {
  const fileInputRef = useRef(null);
  const uploadAreaRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAreaClick = (e) => {
    // Evitar que el clic se propague si ya ha alcanzado al input
    if (e.target !== fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Manejar el pegado de imágenes
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              onImageUpload(file);
              break;
            }
          }
        }
      }
    };

    // Agregar el evento de pegado al documento
    document.addEventListener('paste', handlePaste);
    
    // Limpiar el evento cuando el componente se desmonte
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [onImageUpload]);

  return (
    <div
      className="upload-area"
      ref={uploadAreaRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleAreaClick}
    >
      <p>Arrastra una imagen aquí, haz clic para seleccionar o copia y pega una imagen</p>
      <input
        type="file"
        id="fileInput"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }} // Ocultar el input visualmente
      />
    </div>
  );
}

export default UploadArea;