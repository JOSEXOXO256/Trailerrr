const express = require('express');

const router = express.Router();

const requiredFields = [
    'marca',
    'placa',
    'ejes',
    'peso',
    'dimensiones',
    'destino',
    'origen',
    'historial',
    'seguro',
    'caja',
    'tipoTrailer',
    'estadoCarga',
    'licencia',
    'operador',
];

function parseTrailerId(rawId) {
    const trailerId = Number(rawId);
    if (!Number.isInteger(trailerId) || trailerId <= 0) {
        return null;
    }

    return trailerId;
}

function normalizeTrailerPayload(body) {
    const missingFields = requiredFields.filter((field) => {
        const value = body[field];
        return value === undefined || value === null || String(value).trim() === '';
    });

    if (missingFields.length > 0) {
        return {
            errors: [`Faltan campos obligatorios: ${missingFields.join(', ')}`],
        };
    }

    const ejes = Number(body.ejes);
    const peso = Number(body.peso);

    const validationErrors = [];

    if (!Number.isInteger(ejes) || ejes <= 0) {
        validationErrors.push('ejes debe ser un numero entero mayor a 0');
    }

    if (!Number.isFinite(peso) || peso <= 0) {
        validationErrors.push('peso debe ser un numero mayor a 0');
    }

    if (validationErrors.length > 0) {
        return { errors: validationErrors };
    }

    return {
        values: {
            marca: String(body.marca).trim(),
            placa: String(body.placa).trim().toUpperCase(),
            ejes,
            peso,
            dimensiones: String(body.dimensiones).trim(),
            destino: String(body.destino).trim(),
            origen: String(body.origen).trim(),
            historial: String(body.historial).trim(),
            seguro: String(body.seguro).trim(),
            caja: String(body.caja).trim(),
            tipoTrailer: String(body.tipoTrailer).trim(),
            estadoCarga: String(body.estadoCarga).trim(),
            licencia: String(body.licencia).trim(),
            operador: String(body.operador).trim(),
        },
    };
}

function handleDatabaseError(error, res, actionMessage) {
    if (error.code === '23505') {
        return res.status(409).json({ error: 'Conflicto: la placa ya existe' });
    }

    console.error(actionMessage, error);
    return res.status(500).json({ error: 'Error interno del servidor' });
}

router.get('/', async (req, res) => {
    try {
        const result = await req.db.query('SELECT * FROM trailers ORDER BY created_at DESC');
        return res.json(result.rows);
    } catch (error) {
        return handleDatabaseError(error, res, 'Error obteniendo trailers:');
    }
});

router.get('/:id', async (req, res) => {
    const trailerId = parseTrailerId(req.params.id);

    if (!trailerId) {
        return res.status(400).json({ error: 'ID de trailer invalido' });
    }

    try {
        const result = await req.db.query('SELECT * FROM trailers WHERE id = $1', [trailerId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trailer no encontrado' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        return handleDatabaseError(error, res, 'Error obteniendo trailer:');
    }
});

router.post('/', async (req, res) => {
    const payload = normalizeTrailerPayload(req.body || {});

    if (payload.errors) {
        return res.status(400).json({ error: payload.errors.join('. ') });
    }

    const trailer = payload.values;

    try {
        const result = await req.db.query(
            `INSERT INTO trailers
            (marca, placa, ejes, peso, dimensiones, destino, origen, historial, seguro, caja, tipo_trailer, estado_carga, licencia, operador)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *`,
            [
                trailer.marca,
                trailer.placa,
                trailer.ejes,
                trailer.peso,
                trailer.dimensiones,
                trailer.destino,
                trailer.origen,
                trailer.historial,
                trailer.seguro,
                trailer.caja,
                trailer.tipoTrailer,
                trailer.estadoCarga,
                trailer.licencia,
                trailer.operador,
            ]
        );

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        return handleDatabaseError(error, res, 'Error creando trailer:');
    }
});

router.put('/:id', async (req, res) => {
    const trailerId = parseTrailerId(req.params.id);

    if (!trailerId) {
        return res.status(400).json({ error: 'ID de trailer invalido' });
    }

    const payload = normalizeTrailerPayload(req.body || {});

    if (payload.errors) {
        return res.status(400).json({ error: payload.errors.join('. ') });
    }

    const trailer = payload.values;

    try {
        const result = await req.db.query(
            `UPDATE trailers SET
            marca = $1, placa = $2, ejes = $3, peso = $4, dimensiones = $5,
            destino = $6, origen = $7, historial = $8, seguro = $9, caja = $10,
            tipo_trailer = $11, estado_carga = $12, licencia = $13, operador = $14
            WHERE id = $15 RETURNING *`,
            [
                trailer.marca,
                trailer.placa,
                trailer.ejes,
                trailer.peso,
                trailer.dimensiones,
                trailer.destino,
                trailer.origen,
                trailer.historial,
                trailer.seguro,
                trailer.caja,
                trailer.tipoTrailer,
                trailer.estadoCarga,
                trailer.licencia,
                trailer.operador,
                trailerId,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trailer no encontrado' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        return handleDatabaseError(error, res, 'Error actualizando trailer:');
    }
});

router.delete('/:id', async (req, res) => {
    const trailerId = parseTrailerId(req.params.id);

    if (!trailerId) {
        return res.status(400).json({ error: 'ID de trailer invalido' });
    }

    try {
        const result = await req.db.query(
            'DELETE FROM trailers WHERE id = $1 RETURNING *',
            [trailerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trailer no encontrado' });
        }

        return res.json({ message: 'Trailer eliminado correctamente' });
    } catch (error) {
        return handleDatabaseError(error, res, 'Error eliminando trailer:');
    }
});

router.put('/:id/salida', async (req, res) => {
    const trailerId = parseTrailerId(req.params.id);

    if (!trailerId) {
        return res.status(400).json({ error: 'ID de trailer invalido' });
    }

    try {
        const result = await req.db.query(
            `UPDATE trailers SET hora_salida = CURRENT_TIMESTAMP, estado = 'En ruta'
            WHERE id = $1 RETURNING *`,
            [trailerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trailer no encontrado' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        return handleDatabaseError(error, res, 'Error registrando salida:');
    }
});

router.put('/:id/entrada', async (req, res) => {
    const trailerId = parseTrailerId(req.params.id);

    if (!trailerId) {
        return res.status(400).json({ error: 'ID de trailer invalido' });
    }

    try {
        const result = await req.db.query(
            `UPDATE trailers SET hora_entrada = CURRENT_TIMESTAMP, estado = 'En patio'
            WHERE id = $1 RETURNING *`,
            [trailerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trailer no encontrado' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        return handleDatabaseError(error, res, 'Error registrando entrada:');
    }
});

module.exports = router;
