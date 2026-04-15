CREATE TABLE IF NOT EXISTS trailers (
    id SERIAL PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    placa VARCHAR(20) UNIQUE NOT NULL,
    ejes INTEGER NOT NULL,
    peso DECIMAL(10,2) NOT NULL,
    dimensiones VARCHAR(50) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    origen VARCHAR(100) NOT NULL,
    historial VARCHAR(20) NOT NULL,
    seguro VARCHAR(50) NOT NULL,
    caja VARCHAR(20) NOT NULL,
    tipo_trailer VARCHAR(20) NOT NULL,
    estado_carga VARCHAR(20) NOT NULL,
    licencia VARCHAR(50) NOT NULL,
    operador VARCHAR(100) NOT NULL,
    hora_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hora_salida TIMESTAMP NULL,
    estado VARCHAR(20) DEFAULT 'En patio',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'operador',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (username, password, rol)
VALUES
    ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
    ('operador', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'operador')
ON CONFLICT (username) DO NOTHING;
