const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Check if the request contains an Authorization header starting with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the header: "Bearer <token_string>"
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using your JWT Secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret_key');

            // Attach the decoded user data (like userId) to the request object
            req.user = decoded;

            // Move on to the next function (the actual route logic)
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ message: 'Not authorized, token validation failed' });
        }
    }

    // If no token was sent at all
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };
