const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = require('./database');
const trailersRoutes = require('./routes/trailers');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = Number(process.env.PORT || 3000);

const frontendDir = path.resolve(__dirname, '..', 'Frontend');
const frontendIndexFile = path.join(frontendDir, 'Index.html');
const hasFrontend = fs.existsSync(frontendIndexFile);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error('Origen no permitido por CORS'));
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
    req.db = db;
    next();
});

app.get('/api/health', async (req, res) => {
    try {
        await req.db.query('SELECT 1');
        res.json({
            status: 'ok',
            service: 'sistema-trailers-api',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'No se pudo verificar conexion a base de datos',
        });
    }
});

app.get('/api', (req, res) => {
    res.json({
        name: 'Sistema Trailers API',
        version: '1.0.0',
        auth: {
            type: 'Bearer Token (JWT)',
            loginEndpoint: 'POST /api/login',
        },
        endpoints: {
            health: 'GET /api/health',
            me: 'GET /api/me',
            trailers: 'GET/POST /api/trailers',
            trailerById: 'GET/PUT/DELETE /api/trailers/:id',
            salida: 'PUT /api/trailers/:id/salida',
            entrada: 'PUT /api/trailers/:id/entrada',
        },
    });
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: 'username y password son obligatorios',
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({
                error: 'JWT_SECRET no esta configurado en el servidor',
            });
        }

        const result = await req.db.query(
            'SELECT * FROM usuarios WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales invalidas' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales invalidas' });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                rol: user.rol,
            },
            secret,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        return res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                rol: user.rol,
            },
        });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/me', authenticateToken, (req, res) => {
    res.json({
        userId: req.user.userId,
        username: req.user.username,
        rol: req.user.rol,
    });
});

app.use('/api/trailers', authenticateToken, trailersRoutes);

if (hasFrontend) {
    app.use(express.static(frontendDir));
    app.get(/^\/(?!api(?:\/|$)).*/, (req, res) => {
        res.sendFile(frontendIndexFile);
    });
} else {
    app.get('/', (req, res) => {
        res.json({
            message: 'Sistema de Trailers API',
            docs: 'Consulta README en Backend/README.md',
        });
    });
}

app.use((error, req, res, next) => {
    if (error.message === 'Origen no permitido por CORS') {
        return res.status(403).json({ error: error.message });
    }

    console.error('Error no controlado:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});
