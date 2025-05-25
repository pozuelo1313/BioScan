const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());




// Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://pozuelo1313:bioScan@bioscan.bienguu.mongodb.net/?retryWrites=true&w=majority&appName=bioScan')
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch((err) => console.error('Error al conectar a MongoDB Atlas', err));

// Definir el esquema y modelo de usuario
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model('User', userSchema);

// Definir el esquema de álbumes
const albumSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  color: {
    type: String,
    default: '#4CAF50'
  }
});

const Album = mongoose.model('Album', albumSchema);

// Definir el esquema y modelo de plantas guardadas (actualizado)
const plantSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    default: null
  },
  species: { 
    type: String, 
    required: true 
  },
  family: String,
  confidence: Number,
  genus: String,
  commonNames: [String],
  description: String,
  distribution: String,
  image: String, // URL de Wikipedia/externa
  scannedImage: String, // Imagen escaneada por el usuario
  wikiUrl: String,
  notes: {
    type: String,
    default: ''
  },
  location: String, // Dónde fue encontrada
  tags: [String], // Etiquetas personalizadas
  savedAt: { 
    type: Date, 
    default: Date.now 
  },
  sortOrder: {
    type: Number,
    default: 0
  }
});

const Plant = mongoose.model('Plant', plantSchema);

// Endpoint de registro
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'El usuario ya existe' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el registro' });
  }
});

// Endpoint de inicio de sesión
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Credenciales incorrectas' });
    
    res.json({ message: 'Inicio de sesión exitoso', user: { email: user.email, id: user._id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
});

// Endpoint para guardar plantas (actualizado)
app.post('/api/save-plant', async (req, res) => {
  try {
    const plantData = req.body; // Ahora asumimos que mandas JSON directamente, no con multipart/form-data ni imagen
    
    if (!plantData.userId || !plantData.species) {
      return res.status(400).json({ error: 'Se requiere ID de usuario y especie de la planta' });
    }

    // Verificar si el usuario existe
    const userExists = await User.findById(plantData.userId);
    if (!userExists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // NO manejar req.file ni scannedImage
    
    // Verificar si la planta ya está guardada
    const plantExists = await Plant.findOne({
      userId: plantData.userId,
      species: plantData.species
    });
    
    if (plantExists && !plantData.allowDuplicates) {
      return res.status(200).json({ 
        message: 'Esta planta ya está en tu colección',
        plant: plantExists,
        isDuplicate: true
      });
    }
    
    const newPlant = new Plant(plantData);
    await newPlant.save();
    
    res.status(201).json({ 
      message: 'Planta guardada correctamente',
      plant: newPlant
    });
  } catch (err) {
    console.error('Error al guardar planta:', err);
    res.status(500).json({ error: 'Error al guardar la planta' });
  }
});


// Endpoint para obtener plantas guardadas (actualizado)
app.get('/api/plants/:userId', async (req, res) => {
  const { userId } = req.params;
  const { albumId, sortBy = 'savedAt', sortOrder = 'desc' } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  try {
    let query = { userId };
    
    // Filtrar por álbum si se especifica
    if (albumId && albumId !== 'all') {
      query.albumId = albumId === 'none' ? null : albumId;
    }
    
    // Configurar ordenamiento
    let sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const plants = await Plant.find(query)
      .populate('albumId', 'name color')
      .sort(sortConfig);
    
    res.json(plants);
  } catch (err) {
    console.error('Error al obtener plantas:', err);
    res.status(500).json({ error: 'Error al obtener plantas guardadas' });
  }
});

// Endpoint para actualizar una planta
app.put('/api/plants/:plantId', async (req, res) => {
  const { plantId } = req.params;
  const updateData = req.body;
  
  try {
    const updatedPlant = await Plant.findByIdAndUpdate(
      plantId, 
      updateData, 
      { new: true }
    ).populate('albumId', 'name color');
    
    if (!updatedPlant) {
      return res.status(404).json({ error: 'Planta no encontrada' });
    }
    
    res.json(updatedPlant);
  } catch (err) {
    console.error('Error al actualizar planta:', err);
    res.status(500).json({ error: 'Error al actualizar la planta' });
  }
});

// Endpoint para eliminar una planta
app.delete('/api/plants/:plantId', async (req, res) => {
  const { plantId } = req.params;
  
  try {
    const deletedPlant = await Plant.findByIdAndDelete(plantId);
    
    if (!deletedPlant) {
      return res.status(404).json({ error: 'Planta no encontrada' });
    }
    
    // Eliminar imagen escaneada si existe
    if (deletedPlant.scannedImage && deletedPlant.scannedImage.includes('localhost')) {
      const imagePath = deletedPlant.scannedImage.replace('http://localhost:3015/', '');
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error al eliminar imagen:', err);
      });
    }
    
    res.json({ message: 'Planta eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar planta:', err);
    res.status(500).json({ error: 'Error al eliminar la planta' });
  }
});

// ENDPOINTS DE ÁLBUMES

// Crear álbum
app.post('/api/albums', async (req, res) => {
  const { userId, name, description, color } = req.body;
  
  if (!userId || !name) {
    return res.status(400).json({ error: 'ID de usuario y nombre requeridos' });
  }

  try {
    const newAlbum = new Album({ userId, name, description, color });
    await newAlbum.save();
    res.status(201).json(newAlbum);
  } catch (err) {
    console.error('Error al crear álbum:', err);
    res.status(500).json({ error: 'Error al crear el álbum' });
  }
});

// Obtener álbumes de un usuario
app.get('/api/albums/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const albums = await Album.find({ userId }).sort({ createdAt: -1 });
    
    // Contar plantas en cada álbum
    const albumsWithCount = await Promise.all(
      albums.map(async (album) => {
        const count = await Plant.countDocuments({ 
          userId, 
          albumId: album._id 
        });
        return {
          ...album.toObject(),
          plantCount: count
        };
      })
    );
    
    res.json(albumsWithCount);
  } catch (err) {
    console.error('Error al obtener álbumes:', err);
    res.status(500).json({ error: 'Error al obtener álbumes' });
  }
});

// Actualizar álbum
app.put('/api/albums/:albumId', async (req, res) => {
  const { albumId } = req.params;
  const updateData = req.body;
  
  try {
    const updatedAlbum = await Album.findByIdAndUpdate(
      albumId, 
      updateData, 
      { new: true }
    );
    
    if (!updatedAlbum) {
      return res.status(404).json({ error: 'Álbum no encontrado' });
    }
    
    res.json(updatedAlbum);
  } catch (err) {
    console.error('Error al actualizar álbum:', err);
    res.status(500).json({ error: 'Error al actualizar el álbum' });
  }
});

// Eliminar álbum
app.delete('/api/albums/:albumId', async (req, res) => {
  const { albumId } = req.params;
  
  try {
    const deletedAlbum = await Album.findByIdAndDelete(albumId);
    
    if (!deletedAlbum) {
      return res.status(404).json({ error: 'Álbum no encontrado' });
    }
    
    // Mover plantas del álbum eliminado a "Sin álbum"
    await Plant.updateMany(
      { albumId: albumId },
      { $unset: { albumId: 1 } }
    );
    
    res.json({ message: 'Álbum eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar álbum:', err);
    res.status(500).json({ error: 'Error al eliminar el álbum' });
  }
});

const PORT = process.env.AUTH_PORT || 3015;
app.listen(PORT, () => console.log(`Servidor de auth corriendo en el puerto ${PORT}`));