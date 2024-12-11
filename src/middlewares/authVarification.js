const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWToken = process.env.JWT_SECRET_KEY;

exports.authVarify = (req, res, next) => {
    let token = req.headers['token'];

    if (!token) {
        return res.status(401).json({ status: 'unauthorized', message: 'No token provided' });
    }

    jwt.verify(token, JWToken, (err, decoded) => {
        if (err) {
            return res.status(401).json({ status: 'unauthorized', message: 'Invalid token' });
        }

        // Extract id and role from the token's payload
        const { id, role } = decoded;

        if (!id || !role) {
            return res.status(400).json({ status: 'bad request', message: 'Invalid token payload' });
        }

        // Attach id and role to the request headers
        req.headers.id = id;
        req.headers.role = role;

        console.log('User ID:', id);
        console.log('User Role:', role);

        next();
    });
};