const jwt = require('jsonwebtoken');
require('dotenv').config();

const CreateToken = async (data) => {
    try {
        // Include id and role from the data in the token payload
        const payload = {
            id: data._id, // User ID
            role: data.role, // User Role
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expiration time
        };

        // Generate and return the token
        return jwt.sign(payload, process.env.JWT_SECRET_KEY);
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = CreateToken;