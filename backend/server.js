const http = require('http');
const fs = require('fs');
const path = require('path');
const { IncomingForm } = require('formidable');
const axios = require('axios');
const FormData = require('form-data');
const NodeCache = require('node-cache');

const PORT = process.env.PORT || 3013;
const PLANT_NET_API_KEY = '2b10a7hLVkKes23SAXFut8m8Zu';
const PLANT_NET_API_URL = 'https://my-api.plantnet.org/v2/identify/all';

// Cambia la URL al endpoint de OpenRouter
const OPENAI_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENAI_API_KEY = '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';
const SITE_URL = 'http://localhost:3000'; // URL de tu aplicación frontend
const SITE_NAME = 'Plant Identification App'; // Nombre de tu aplicación

// Cache con tiempo de expiración de 24 horas
const cache = new NodeCache({ stdTTL: 86400 });

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg'
};

async function askOpenAI(question, plantContext = null) {
    if (!question) {
        throw new Error('La pregunta no puede estar vacía');
    }

    const cacheKey = `openai_${question}_${plantContext || ''}`;
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
        console.log('Usando respuesta en caché para:', question);
        return cachedResponse;
    }

    try {
        console.log('Iniciando consulta a OpenRouter...');
        console.log('API Key:', OPENAI_API_KEY.substring(0, 10) + '...');
        console.log('URL:', OPENAI_API_URL);
        
        let messages = [
            {
                role: "system",
                content: "Eres un experto botánico especializado en identificación y cuidado de plantas. Proporciona información precisa, científica y práctica sobre plantas. Tus respuestas deben ser concisas pero informativas. Si no estás seguro de algo, indícalo claramente."
            }
        ];
        
        if (plantContext) {
            messages.push({
                role: "system",
                content: `La consulta es sobre esta planta específica: ${plantContext}`
            });
        }
        
        messages.push({
            role: "user",
            content: question
        });

        const requestConfig = {
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: messages,
            max_tokens: 500,
            temperature: 0.7
        };

        console.log('Configuración de la petición:', JSON.stringify(requestConfig, null, 2));
        console.log('Headers:', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY.substring(0, 10)}...`,
            'HTTP-Referer': SITE_URL,
            'X-Title': SITE_NAME
        });

        const response = await axios({
            method: 'post',
            url: OPENAI_API_URL,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'HTTP-Referer': SITE_URL,
                'X-Title': SITE_NAME
            },
            data: requestConfig,
            timeout: 10000
        });

        console.log('Respuesta recibida:', JSON.stringify(response.data, null, 2));

        if (!response.data?.choices?.[0]?.message?.content) {
            console.error('Respuesta inesperada de OpenRouter:', response.data);
            throw new Error('Formato de respuesta inesperado');
        }

        const answer = response.data.choices[0].message.content.trim();
        cache.set(cacheKey, answer);
        return answer;
    } catch (error) {
        console.error('Error detallado en la consulta a OpenRouter:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });
        throw new Error('No se pudo obtener una respuesta del chatbot');
    }
}


async function identifyPlant(imageFile) {
    try {
        console.log('Archivo recibido:', imageFile);
        
        // Si imageFile es un array, tomamos el primer elemento
        const file = Array.isArray(imageFile) ? imageFile[0] : imageFile;
        
        if (!file || !file.filepath) {
            console.log('Error: Archivo no válido:', file);
            throw new Error('No se recibió archivo de imagen válido');
        }

        // Verificar que el archivo existe
        if (!fs.existsSync(file.filepath)) {
            console.log('Error: El archivo no existe en el sistema');
            throw new Error('El archivo no existe en el sistema');
        }

        const formData = new FormData();
        
        console.log('Ruta del archivo:', file.filepath);
        console.log('Tipo MIME:', file.mimetype);
        
        const imageStream = fs.createReadStream(file.filepath);
        
        formData.append('images', imageStream, {
            filename: file.originalFilename || 'image.jpg',
            contentType: file.mimetype
        });

        const response = await axios.post(PLANT_NET_API_URL, formData, {
            params: {
                'api-key': PLANT_NET_API_KEY
            },
            headers: {
                ...formData.getHeaders()
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        // Cerrar el stream después de usarlo
        imageStream.destroy();

        if (response.data && response.data.results && response.data.results.length > 0) {
            const bestMatch = response.data.results[0];
            return {
                species: bestMatch.species.scientificNameWithoutAuthor,
                confidence: Math.round(bestMatch.score * 100),
                family: bestMatch.species.family.scientificNameWithoutAuthor,
                details: {
                    commonNames: bestMatch.species.commonNames || [],
                    genus: bestMatch.species.genus.scientificNameWithoutAuthor,
                    description: bestMatch.species.description || 'No hay descripción disponible'
                }
            };
        }
        throw new Error('No se encontraron coincidencias');
    } catch (error) {
        console.error('Error detallado en identifyPlant:', error);
        throw error;
    }
}

// Función para obtener información de Wikipedia
async function getWikipediaInfo(scientificName, lang = 'es') {
    const cacheKey = `wiki_${lang}_${scientificName}`;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await axios.get(
            `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(scientificName)}`
        );
        
        const result = {
            description: response.data.extract,
            thumbnail: response.data.thumbnail?.source,
            url: response.data.content_urls?.desktop?.page
        };

        cache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error('Error fetching Wikipedia data:', error);
        return null;
    }
}

// Función para consultar Wikidata
async function getWikidataInfo(scientificName) {
    const cacheKey = `wikidata_${scientificName}`;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    console.log('Iniciando búsqueda para especie:', scientificName);

    // Consulta SPARQL simplificada
    const query = `
    SELECT DISTINCT ?item ?commonName ?distribution ?image
    WHERE {
      ?item wdt:P225 "${scientificName}".
      OPTIONAL { ?item wdt:P1843 ?commonName. FILTER(LANG(?commonName) = "es") }
      OPTIONAL { ?item wdt:P183 ?distribution. }
      OPTIONAL { ?item wdt:P18 ?image. }
    }`;

    try {
        console.log('Enviando consulta SPARQL:', query);
        const response = await axios.get('https://query.wikidata.org/sparql', {
            params: {
                query: query,
                format: 'json'
            },
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'BIOSCAN/1.0 (pozuelo1313@gmail.com)'
            }
        });

        console.log('Respuesta recibida de Wikidata');
        console.log('Número de resultados:', response.data.results.bindings.length);

        const bindings = response.data.results.bindings;
        const commonNames = new Set();

        // Procesar los resultados
        bindings.forEach(binding => {
            if (binding.commonName?.value) {
                commonNames.add(binding.commonName.value);
            }
        });

        const result = {
            commonNames: Array.from(commonNames),
            image: bindings[0]?.image?.value || null,
            distribution: bindings[0]?.distribution?.value || null
        };

        console.log('Resultado final procesado:', result);

        cache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error('Error detallado en getWikidataInfo:', error);
        if (error.response) {
            console.error('Respuesta de error:', error.response.data);
            console.error('Estado HTTP:', error.response.status);
        }
        return {
            commonNames: [],
            image: null,
            distribution: null,
            error: error.message
        };
    }
}

// Función para obtener información adicional de la planta
async function getAdditionalPlantInfo(scientificName) {
    try {
        console.log('Obteniendo información adicional para:', scientificName);
        
        const [wikiInfo, wikidataInfo] = await Promise.all([
            getWikipediaInfo(scientificName),
            getWikidataInfo(scientificName)
        ]);

        const result = {
            description: wikiInfo?.description || 'No hay descripción disponible',
            image: wikiInfo?.thumbnail || wikidataInfo?.image || null,
            commonNames: wikidataInfo?.commonNames || [],
            distribution: wikidataInfo?.distribution || null,
            wikiUrl: wikiInfo?.url
        };

        console.log('Resultado final:', {
            scientificName,
            description: result.description.substring(0, 100) + '...',
            hasCommonNames: result.commonNames.length > 0,
            hasDistribution: !!result.distribution
        });

        return result;
    } catch (error) {
        console.error('Error detallado en getAdditionalPlantInfo:', error);
        throw error;
    }
}

const server = http.createServer(async (req, res) => {
    // Configurar CORS para todas las rutas
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Endpoint de prueba
    if (req.method === 'GET' && req.url === '/api/test') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server is working!' }));
        return;
    }

    // Endpoint para el chatbot
    if (req.method === 'POST' && req.url === '/api/chatbot') {
        console.log('\n=== NUEVA SOLICITUD DE CHATBOT ===');
        console.log('URL:', req.url);
        console.log('Método:', req.method);
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                console.log('\n=== DATOS RECIBIDOS ===');
                console.log('Body raw:', body);
                const data = JSON.parse(body);
                console.log('Datos parseados:', JSON.stringify(data, null, 2));
                const { question, scientificName } = data;
                
                if (!question) {
                    console.log('Error: No se proporcionó pregunta');
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Es necesario proporcionar una pregunta' }));
                    return;
                }
                
                const plantContext = scientificName ? scientificName : null;
                console.log('Consultando OpenAI con:', { question, plantContext });
                
                const answer = await askOpenAI(question, plantContext);
                console.log('Respuesta de OpenAI:', answer);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ answer }));
            } catch (error) {
                console.error('Error detallado al procesar la solicitud del chatbot:', error);
                if (error.response) {
                    console.error('Respuesta de error de OpenAI:', error.response.data);
                }
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 'Error al procesar la solicitud',
                    details: error.message 
                }));
            }
        });
        return;
    }

    // Endpoint para información de planta
    if (req.method === 'GET' && req.url.startsWith('/api/plant-info/')) {
        const scientificName = decodeURIComponent(req.url.split('/api/plant-info/')[1]);
        
        try {
            const additionalInfo = await getAdditionalPlantInfo(scientificName);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(additionalInfo));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                error: 'Error al obtener información adicional',
                details: error.message 
            }));
        }
        return;
    }

    // Endpoint para identificar planta
    if (req.method === 'POST' && req.url === '/api/identify') {
        console.log('Recibida solicitud POST para identificar imagen');
        
        // Crear directorio temporal si no existe
        const tmpDir = path.join(__dirname, 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const form = new IncomingForm({
            uploadDir: tmpDir,
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            multiples: false
        });

        form.parse(req, async (err, fields, files) => {
            console.log('Campos recibidos:', fields);
            console.log('Archivos recibidos:', files);

            if (err) {
                console.error('Error al parsear el formulario:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al procesar el archivo' }));
                return;
            }

            if (!files || !files.image) {
                console.error('No se encontró el archivo de imagen en la solicitud');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No se proporcionó ninguna imagen' }));
                return;
            }

            try {
                const result = await identifyPlant(files.image);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (error) {
                console.error('Error al procesar la imagen:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 'Error en la identificación',
                    details: error.message 
                }));
            } finally {
                // Limpiar el archivo temporal
                const fileToDelete = Array.isArray(files.image) ? files.image[0] : files.image;
                if (fileToDelete && fileToDelete.filepath) {
                    fs.unlink(fileToDelete.filepath, (err) => {
                        if (err) console.error('Error al eliminar archivo temporal:', err);
                    });
                }
            }
        });
        return;
    }

    // Servir archivos estáticos (solo si no es una ruta de API)
    if (!req.url.startsWith('/api/')) {
        let filePath = '.' + req.url;
        if (filePath === './') {
            filePath = './index.html';
        }

        const extname = path.extname(filePath);
        const contentType = MIME_TYPES[extname] || 'application/octet-stream';

        try {
            const content = await fs.promises.readFile(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        } catch (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Archivo no encontrado');
            } else {
                res.writeHead(500);
                res.end('Error del servidor');
            }
        }
        return;
    }

    // Si llegamos aquí, la ruta no existe
    res.writeHead(404);
    res.end('Ruta no encontrada');
});

server.listen(PORT, (err) => {
    if (err) {
        console.error('Error al iniciar el servidor:', err);
        process.exit(1);
    }
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});