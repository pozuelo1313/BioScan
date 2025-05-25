import React, { useState, useEffect } from 'react';
import '../App.css';

function PlantCollection({ userId }) {
  const [plants, setPlants] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [sortBy, setSortBy] = useState('savedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  
  // Estados para modales
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [showEditPlant, setShowEditPlant] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plantToDelete, setPlantToDelete] = useState(null);
  
  // Estados para crear/editar álbum
  const [albumForm, setAlbumForm] = useState({
    name: '',
    description: '',
    color: '#4CAF50'
  });

  useEffect(() => {
    if (!userId) {
      setError('Debes iniciar sesión para ver tu colección');
      setLoading(false);
      return;
    }
    fetchData();
  }, [userId, selectedAlbum, sortBy, sortOrder]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchPlants(), fetchAlbums()]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchPlants = async () => {
    const params = new URLSearchParams({
      albumId: selectedAlbum,
      sortBy,
      sortOrder
    });
    
    const response = await fetch(`http://localhost:3015/api/plants/${userId}?${params}`);
    if (!response.ok) throw new Error('Error al obtener las plantas');
    
    const data = await response.json();
    setPlants(data);
  };

  const fetchAlbums = async () => {
    const response = await fetch(`http://localhost:3015/api/albums/${userId}`);
    if (!response.ok) throw new Error('Error al obtener los álbumes');
    
    const data = await response.json();
    setAlbums(data);
  };

  const createAlbum = async () => {
    try {
      const response = await fetch('http://localhost:3015/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...albumForm, userId })
      });
      
      if (!response.ok) throw new Error('Error al crear el álbum');
      
      setAlbumForm({ name: '', description: '', color: '#4CAF50' });
      setShowCreateAlbum(false);
      fetchAlbums();
    } catch (error) {
      alert('Error al crear el álbum: ' + error.message);
    }
  };

  const updatePlant = async (plantId, updateData) => {
    try {
      const response = await fetch(`http://localhost:3015/api/plants/${plantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) throw new Error('Error al actualizar la planta');
      
      fetchPlants();
      setShowEditPlant(false);
      setSelectedPlant(null);
    } catch (error) {
      alert('Error al actualizar la planta: ' + error.message);
    }
  };

  const deletePlant = async () => {
    if (!plantToDelete) return;

    try {
      const response = await fetch(`http://localhost:3015/api/plants/${plantToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar la planta');

      setPlants(plants.filter(plant => plant._id !== plantToDelete));
      setPlantToDelete(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      alert('Error al eliminar la planta: ' + error.message);
    }
  };

  const deleteAlbum = async (albumId) => {
    if (!window.confirm('¿Estás seguro? Las plantas se moverán a "Sin álbum"')) return;
    
    try {
      const response = await fetch(`http://localhost:3015/api/albums/${albumId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Error al eliminar el álbum');
      
      fetchData();
      if (selectedAlbum === albumId) setSelectedAlbum('all');
    } catch (error) {
      alert('Error al eliminar el álbum: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading-container">Cargando tu colección de plantas...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="plant-collection-container">
      {/* Header con controles */}
      <div className="collection-header">
        <h1>Mi Colección de Plantas</h1>
        <div className="collection-controls">
          <div className="album-selector">
            <select 
              value={selectedAlbum} 
              onChange={(e) => setSelectedAlbum(e.target.value)}
            >
              <option value="all">Todos los álbumes</option>
              <option value="none">Sin álbum</option>
              {albums.map(album => (
                <option key={album._id} value={album._id}>
                  {album.name} ({album.plantCount})
                </option>
              ))}
            </select>
            <button 
              className="create-album-btn"
              onClick={() => setShowCreateAlbum(true)}
            >
              + Nuevo Álbum
            </button>
          </div>
          
          <div className="sort-controls">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="savedAt">Fecha guardado</option>
              <option value="species">Nombre científico</option>
              <option value="family">Familia</option>
              <option value="confidence">Confianza</option>
            </select>
            <button 
              className={`sort-order ${sortOrder}`}
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
          
          <div className="view-controls">
            <button 
              className={view === 'grid' ? 'active' : ''}
              onClick={() => setView('grid')}
            >
              ⊞
            </button>
            <button 
              className={view === 'list' ? 'active' : ''}
              onClick={() => setView('list')}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Lista de álbumes */}
      <div className="albums-section">
        <h3>Álbumes</h3>
        <div className="albums-list">
          {albums.map(album => (
            <div 
              key={album._id} 
              className={`album-card ${selectedAlbum === album._id ? 'selected' : ''}`}
              style={{ borderColor: album.color }}
            >
              <div 
                className="album-color" 
                style={{ backgroundColor: album.color }}
              ></div>
              <div className="album-info">
                <h4>{album.name}</h4>
                <p>{album.plantCount} plantas</p>
                {album.description && <small>{album.description}</small>}
              </div>
              <div className="album-actions">
                <button onClick={() => setSelectedAlbum(album._id)}>Ver</button>
                <button onClick={() => deleteAlbum(album._id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plantas */}
      <div className={`plants-container ${view}`}>
        {plants.length === 0 ? (
          <div className="empty-collection">
            <h2>No hay plantas en esta vista</h2>
            <p>Identifica plantas y guárdalas para comenzar tu colección</p>
          </div>
        ) : (
          <div className={`plants-${view}`}>
            {plants.map(plant => (
              <div key={plant._id} className={`plant-card ${view}`}>
                <div className="plant-image-container">
                  {plant.scannedImage ? (
                    <img 
                      src={plant.scannedImage} 
                      alt={plant.species}
                      className="scanned-image"
                      title="Imagen escaneada"
                    />
                  ) : plant.image ? (
                    <img 
                      src={plant.image} 
                      alt={plant.species}
                      className="wiki-image"
                      title="Imagen de Wikipedia"
                    />
                  ) : (
                    <div className="no-image">
                      <span>Sin imagen</span>
                    </div>
                  )}
                  {plant.scannedImage && (
                    <div className="image-badge">📸 Escaneada</div>
                  )}
                </div>
                
                <div className="plant-content">
                  <div className="plant-header">
                    <h3>{plant.species}</h3>
                    <div className="confidence-badge">
                      {plant.confidence}% confianza
                    </div>
                  </div>
                  
                  {plant.commonNames && plant.commonNames.length > 0 && (
                    <div className="common-names">
                      {plant.commonNames.slice(0, 3).map((name, index) => (
                        <span key={index} className="common-name-tag">
                          {name}
                        </span>
                      ))}
                      {plant.commonNames.length > 3 && (
                        <span className="more-names">+{plant.commonNames.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="plant-taxonomy">
                    <span>Familia: {plant.family || 'No disponible'}</span>
                    {plant.genus && <span>Género: {plant.genus}</span>}
                  </div>
                  
                  {plant.albumId && (
                    <div className="album-tag" style={{ backgroundColor: plant.albumId.color }}>
                      📁 {plant.albumId.name}
                    </div>
                  )}
                  
                  {plant.notes && (
                    <div className="plant-notes">
                      <strong>Notas:</strong>
                      <p>{plant.notes}</p>
                    </div>
                  )}
                  
                  {plant.location && (
                    <div className="plant-location">
                      📍 {plant.location}
                    </div>
                  )}
                  
                  {plant.tags && plant.tags.length > 0 && (
                    <div className="plant-tags">
                      {plant.tags.map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="plant-date">
                    Guardada el {new Date(plant.savedAt).toLocaleDateString()}
                  </div>
                  
                  <div className="plant-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => {
                        setSelectedPlant(plant);
                        setShowEditPlant(true);
                      }}
                    >
                      ✏️ Editar
                    </button>
                    {plant.wikiUrl && (
                      <a 
                        href={plant.wikiUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="wiki-link"
                      >
                        📚 Wikipedia
                      </a>
                    )}
                    <button
                      className="delete-btn"
                      onClick={() => {
                        setPlantToDelete(plant._id);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear álbum */}
      {showCreateAlbum && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Crear Nuevo Álbum</h3>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={albumForm.name}
                onChange={(e) => setAlbumForm({...albumForm, name: e.target.value})}
                placeholder="Nombre del álbum"
              />
            </div>
            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                value={albumForm.description}
                onChange={(e) => setAlbumForm({...albumForm, description: e.target.value})}
                placeholder="Descripción opcional"
              />
            </div>
            <div className="form-group">
              <label>Color:</label>
              <input
                type="color"
                value={albumForm.color}
                onChange={(e) => setAlbumForm({...albumForm, color: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={createAlbum}>Crear</button>
              <button onClick={() => setShowCreateAlbum(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar planta */}
      {showEditPlant && selectedPlant && (
        <PlantEditModal
          plant={selectedPlant}
          albums={albums}
          onSave={(updateData) => updatePlant(selectedPlant._id, updateData)}
          onCancel={() => {
            setShowEditPlant(false);
            setSelectedPlant(null);
          }}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal confirmation-modal">
            <h3>Confirmar eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar esta planta de tu colección?</p>
            <div className="modal-actions">
              <button onClick={deletePlant} className="danger">Eliminar</button>
              <button onClick={() => {
                setShowDeleteConfirm(false);
                setPlantToDelete(null);
              }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para editar plantas
function PlantEditModal({ plant, albums, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    notes: plant.notes || '',
    location: plant.location || '',
    albumId: plant.albumId?._id || '',
    tags: plant.tags ? plant.tags.join(', ') : ''
  });

  const handleSubmit = () => {
    
      const updateData = {
        notes: formData.notes,
        location: formData.location,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        albumId: formData.albumId || null
      };
      onSave(updateData);
    };
  
    return (
      <div className="modal-overlay">
        <div className="modal">
          <h3>Editar Planta</h3>
          <div className="form-group">
            <label>Notas:</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Escribe tus notas sobre esta planta..."
            />
          </div>
          <div className="form-group">
            <label>Ubicación:</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ej: Parque natural, jardín..."
            />
          </div>
          <div className="form-group">
            <label>Álbum:</label>
            <select
              value={formData.albumId}
              onChange={(e) => setFormData({ ...formData, albumId: e.target.value })}
            >
              <option value="">Sin álbum</option>
              {albums.map(album => (
                <option key={album._id} value={album._id}>
                  {album.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Etiquetas:</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Separadas por comas, ej: medicinal,trepadora..."
            />
          </div>
          <div className="modal-actions">
            <button onClick={handleSubmit}>Guardar</button>
            <button onClick={onCancel}>Cancelar</button>
          </div>
        </div>
      </div>
    );
  }
  export default PlantCollection;
