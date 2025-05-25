import React, { useEffect, useState } from 'react';
import '../App.css';

function Result({ data, userId }) {
  const [additionalInfo, setAdditionalInfo] = useState({
    description: '',
    commonNames: [],
    distribution: null,
    image: null,
    wikiUrl: null,
    loading: true,
    error: null
  });
  const [saveStatus, setSaveStatus] = useState({
    saving: false,
    saved: false,
    error: null
  });

  useEffect(() => {
    const fetchAdditionalInfo = async () => {
      try {
        console.log('Fetching additional info for species:', data.species);
        const url = `http://localhost:3013/api/plant-info/${encodeURIComponent(data.species)}`;
console.log('Fetching from URL:', url); // Add this line
const response = await fetch(url);
        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.error || 'Error al obtener información adicional');
        }
        const info = await response.json();
        console.log('Información recibida del backend:', info);
        setAdditionalInfo({ ...info, loading: false });
      } catch (error) {
        console.error('Error fetching plant info:', error);
        setAdditionalInfo(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
      }
    };

    if (data && data.species) {
      console.log('Starting to fetch additional info...');
      fetchAdditionalInfo();
    } else {
      console.log('No species data available:', data);
    }
  }, [data?.species]);

  const savePlant = async () => {
    if (!userId) {
      setSaveStatus({
        saving: false,
        saved: false,
        error: "Debes iniciar sesión para guardar plantas"
      });
      return;
    }

    setSaveStatus({ saving: true, saved: false, error: null });
    
    try {
      const plantData = {
        userId,
        species: data.species,
        family: data.family,
        confidence: data.confidence,
        genus: data.details?.genus,
        commonNames: additionalInfo.commonNames,
        description: additionalInfo.description,
        distribution: additionalInfo.distribution,
        image: additionalInfo.image,
        wikiUrl: additionalInfo.wikiUrl,
        scannedImage: data.scannedImage,
        notes: '',
        savedAt: new Date()
      };
      
      const response = await fetch('http://localhost:3015/api/save-plant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plantData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la planta');
      }
      
      setSaveStatus({ saving: false, saved: true, error: null });
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, saved: false }));
      }, 3000);
    } catch (error) {
      console.error('Error saving plant:', error);
      setSaveStatus({
        saving: false,
        saved: false,
        error: error.message
      });
    }
  };

  if (!data) {
    return null;
  }

  return (
    <div className="result-container">
      <div className="result-card">
        <div className="result-header">
          <h2 className="species-name">{data.species}</h2>
          <div className="confidence-badge">
            <span className="confidence-value">{data.confidence}%</span>
            <span className="confidence-label">precisión</span>
          </div>
        </div>

        <div className="result-details">
          {additionalInfo.loading ? (
            <div className="loading">Cargando información adicional...</div>
          ) : (
            <>
              <div className="detail-section">
                <h3>Clasificación Taxonómica</h3>
                <div className="taxonomy-info">
                  <div className="taxonomy-item">
                    <span className="label">Familia:</span>
                    <span className="value">{data.family || 'No disponible'}</span>
                  </div>
                  <div className="taxonomy-item">
                    <span className="label">Género:</span>
                    <span className="value">{data.details?.genus || 'No disponible'}</span>
                  </div>
                </div>
              </div>

              {additionalInfo.commonNames && additionalInfo.commonNames.length > 0 && (
                <div className="detail-section">
                  <h3>Nombres Comunes</h3>
                  <div className="common-names">
                    {additionalInfo.commonNames.map((name, index) => (
                      <span key={index} className="common-name-tag">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-section description">
                <h3>Descripción</h3>
                <p>{additionalInfo.description || 'No hay descripción disponible'}</p>
              </div>

              {additionalInfo.distribution && (
                <div className="detail-section distribution">
                  <h3>🌍 Distribución</h3>
                  <p>{additionalInfo.distribution}</p>
                </div>
              )}

              {additionalInfo.image && (
                <div className="detail-section plant-image">
                  <h3>Imagen de Referencia</h3>
                  <img src={additionalInfo.image} alt={data.species} />
                </div>
              )}

              <div className="detail-section save-plant">
                <button 
                  onClick={savePlant}
                  disabled={saveStatus.saving || saveStatus.saved}
                  className={`save-button ${saveStatus.saved ? 'saved' : ''}`}
                >
                  {saveStatus.saving ? 'Guardando...' : 
                   saveStatus.saved ? '✓ Guardada' : 
                   '💾 Guardar en mi colección'}
                </button>
                {saveStatus.error && (
                  <p className="error-message">{saveStatus.error}</p>
                )}
              </div>

              <div className="detail-section info-links">
                <h3>Más Información</h3>
                <div className="external-links">
                  {additionalInfo.wikiUrl && (
                    <a 
                      href={additionalInfo.wikiUrl}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="info-link"
                    >
                      📚 Ver en Wikipedia
                    </a>
                  )}
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(data.species)}+planta`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="info-link"
                  >
                    🔍 Buscar en Google
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
       
      </div>
    </div>
  );
}

export default Result;