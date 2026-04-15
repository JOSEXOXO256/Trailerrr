const { Pool } = require('pg');
require('dotenv').config();

function isTruthy(value) {
    if (typeof value !== 'string') {
        return false;
    }

    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

const connectionString = process.env.DATABASE_URL;
const hasDbPassword = typeof process.env.DB_PASSWORD === 'string' && process.env.DB_PASSWORD.length > 0;
const databasePassword = hasDbPassword ? process.env.DB_PASSWORD : 'changeme';
const shouldUseSsl = isTruthy(process.env.DB_SSL);

const poolConfig = connectionString
    ? {
        connectionString,
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME || 'sistema_trailers',
        user: process.env.DB_USER || 'postgres',
        password: databasePassword,
    };

if (connectionString) {
    console.log('Conexion PostgreSQL configurada con DATABASE_URL');
} else if (!hasDbPassword) {
    console.warn('DB_PASSWORD no configurado. Usa un archivo .env basado en .env.example');
}

if (shouldUseSsl) {
    poolConfig.ssl = {
        rejectUnauthorized: false,
    };
}

const pool = new Pool(poolConfig);

pool.on('error', (error) => {
    console.error('Error inesperado en el pool de PostgreSQL:', error.message);
});

async function testConnection() {
    try {
        await pool.query('SELECT 1');
        console.log('Conexion a PostgreSQL establecida');
    } catch (error) {
        console.error('Error conectando a PostgreSQL:', error.message);
    }
}

testConnection();

module.exports = pool;
