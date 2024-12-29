const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if token is present
    if (!token) {
        return res.status(401).json({ message: 'Access denied: No token provided' });
    }

    try {
        // Verify the token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach user info to the request object
        next(); // Call the next middleware or route handler
    } catch (error) {
        // Log the error for debugging
        console.error('Token verification error:', error);
        return res.status(400).json({ message: 'Invalid token' });
    }
};

module.exports = authenticate;
