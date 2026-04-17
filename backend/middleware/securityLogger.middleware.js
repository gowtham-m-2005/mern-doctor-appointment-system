const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logSecurityEvent = (eventType, details) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    ...details,
  };
  
  const logFile = path.join(logsDir, `security-${new Date().toISOString().split('T')[0]}.log`);
  
  fs.appendFile(logFile, JSON.stringify(logEntry) + '\n', (err) => {
    if (err) console.error('Failed to write security log:', err);
  });
  
  // Also log to console for development
  console.log(`[SECURITY] ${eventType}:`, JSON.stringify(details));
};

const logRequest = (req, res, next) => {
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  };
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script>/i,  // XSS attempt
    /SELECT.*FROM/i,  // SQL injection attempt
    /\$where/i,  // NoSQL injection attempt
  ];
  
  const bodyStr = JSON.stringify(req.body);
  const queryStr = JSON.stringify(req.query);
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(bodyStr) || pattern.test(queryStr)) {
      logSecurityEvent('SUSPICIOUS_REQUEST', {
        ...logData,
        body: req.body,
        query: req.query,
        pattern: pattern.toString(),
      });
      break;
    }
  }
  
  next();
};

const logAuthEvent = (eventType, req, userDetails = {}) => {
  logSecurityEvent(eventType, {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    ...userDetails,
  });
};

module.exports = {
  logSecurityEvent,
  logRequest,
  logAuthEvent,
};
