// server/config/jwt.js
// JWT secret and options (for consistency, though secret is usually in .env)

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Fallback for development
const JWT_EXPIRES_IN = '1h';

export { JWT_SECRET, JWT_EXPIRES_IN };
