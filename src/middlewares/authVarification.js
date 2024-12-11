const jwt = require('jsonwebtoken');
const User = require('../models/UsersSchema')
require('dotenv').config();

const JWToken = process.env.JWT_SECRET_KEY;

exports.authVarify = (req, res, next) => {
    let token = req.headers['token'];

    if (!token) {
        return res.status(401).json({ success: false, message: 'unauthorized access', errorDetails: 'No token provided' });
    }

    jwt.verify(token, JWToken, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false,  message: 'unauthorized access', errorDetails: 'Invalid token' });
        }

        // Extract id and role from the token's payload
        const { id, role } = decoded;

        if (!id || !role) {
            return res.status(400).json({success: false, message: 'bad request', errorDetails: 'Invalid token payload' });
        }

        // Attach id and role to the request headers
        req.headers.id = id;
        req.headers.role = role;

        console.log('User ID:', id);
        console.log('User Role:', role);

        next();
    });
};

exports.restrict = (roles) => async (req, res, next) => {
    try {
      const userId = req.headers.id; // Assuming JWT middleware attaches user info
  
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
  
      // Check if the user's role is included in the allowed roles
      if (!roles.includes(user.role)) {
        return res.status(401).json({
          success: false,
          message: "You're not authorized",
        });
      }
  
      // Proceed to the next middleware
      next();
    } catch (error) {
      console.error('Error in restrict middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Server error occurred.',
        errorDetails: error.message,
      });
    }
  };