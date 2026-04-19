/**
 * HIPAA Compliant Session Management
 * Handles session timeout and secure cookie configuration
 */

const jwt = require('jsonwebtoken');

// Session configuration
const SESSION_CONFIG = {
  // Access token expiry: 15 minutes (short-lived for security)
  ACCESS_TOKEN_EXPIRY: '15m',
  
  // Refresh token expiry: 7 days
  REFRESH_TOKEN_EXPIRY: '7d',
  
  // Session timeout: 30 minutes of inactivity
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
  
  // Maximum session duration: 8 hours
  MAX_SESSION_DURATION: 8 * 60 * 60 * 1000 // 8 hours in milliseconds
};

/**
 * Generate access token with short expiry
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: SESSION_CONFIG.ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generate refresh token with longer expiry
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: SESSION_CONFIG.REFRESH_TOKEN_EXPIRY }
  );
};

/**
 * Verify token and check session timeout
 */
const verifyTokenWithSessionCheck = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is of correct type
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    // Check session timeout (issued at time)
    const now = Date.now();
    const issuedAt = decoded.iat * 1000; // Convert to milliseconds
    const sessionDuration = now - issuedAt;
    
    if (sessionDuration > SESSION_CONFIG.MAX_SESSION_DURATION) {
      throw new Error('Session expired');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Middleware to check session timeout
 */
const checkSessionTimeout = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = verifyTokenWithSessionCheck(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: error.message === 'Session expired' 
        ? 'Session expired. Please login again.' 
        : 'Invalid token' 
    });
  }
};

/**
 * Secure cookie configuration for HTTP-only cookies
 */
const getCookieOptions = () => {
  return {
    httpOnly: true, // Prevent JavaScript access
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS
    sameSite: 'strict', // Prevent CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  };
};

module.exports = {
  SESSION_CONFIG,
  generateAccessToken,
  generateRefreshToken,
  verifyTokenWithSessionCheck,
  checkSessionTimeout,
  getCookieOptions
};
