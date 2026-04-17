const { logSecurityEvent } = require('./securityLogger.middleware');

const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error('Error:', err);
  
  // Log security-related errors
  if (err.name === 'UnauthorizedError' || err.status === 401 || err.status === 403) {
    logSecurityEvent('AUTH_ERROR', {
      error: err.message,
      url: req.url,
      method: req.method,
      ip: req.ip || req.connection.remoteAddress,
    });
  }
  
  // Default error response
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
  };
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Validation Error';
    error.details = err.details;
  } else if (err.name === 'CastError') {
    error.status = 400;
    error.message = 'Invalid ID format';
  } else if (err.code === 11000) {
    error.status = 409;
    error.message = 'Duplicate entry';
    const field = Object.keys(err.keyPattern)[0];
    error.field = field;
  } else if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }
  
  // Don't expose stack trace in production
  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
  } else {
    error.stack = err.stack;
  }
  
  res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(error.field && { field: error.field }),
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
