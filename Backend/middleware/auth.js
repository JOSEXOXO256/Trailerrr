const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({
            error: 'Configuracion incompleta del servidor: falta JWT_SECRET',
        });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalido o expirado' });
    }
}

module.exports = { authenticateToken };
