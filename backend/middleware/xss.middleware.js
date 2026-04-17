// XSS sanitization middleware
// Since xss-clean is deprecated, we'll create a simple sanitizer
const xss = require('xss');

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    const sanitizeObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      }
      
      const sanitized = {};
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          sanitized[key] = xss(obj[key], {
            whiteList: {}, // No HTML tags allowed
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script'],
          });
        } else if (typeof obj[key] === 'object') {
          sanitized[key] = sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
      return sanitized;
    };
    
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    const sanitizeObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const sanitized = {};
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          sanitized[key] = xss(obj[key], {
            whiteList: {},
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script'],
          });
        } else {
          sanitized[key] = obj[key];
        }
      }
      return sanitized;
    };
    
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    const sanitizeObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const sanitized = {};
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          sanitized[key] = xss(obj[key], {
            whiteList: {},
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script'],
          });
        } else {
          sanitized[key] = obj[key];
        }
      }
      return sanitized;
    };
    
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

module.exports = sanitizeInput;
