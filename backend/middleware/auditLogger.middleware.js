/**
 * HIPAA Compliant Audit Logging
 * Tracks access to protected health information (PHI)
 */

const fs = require('fs');
const path = require('path');

const AUDIT_LOG_PATH = path.join(__dirname, '../logs/audit.log');

// Ensure logs directory exists
const logsDir = path.dirname(AUDIT_LOG_PATH);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log audit trail for PHI access
 * @param {Object} data - Audit data
 * @param {string} data.userId - ID of the user performing the action
 * @param {string} data.userRole - Role of the user (user, doctor, admin)
 * @param {string} data.action - Action performed (view, update, delete, create)
 * @param {string} data.resourceType - Type of resource accessed (appointment, prescription, patient_record)
 * @param {string} data.resourceId - ID of the resource accessed
 * @param {string} data.ipAddress - IP address of the user
 * @param {string} data.userAgent - User agent string
 * @param {Object} data.metadata - Additional metadata
 */
const logAuditEvent = (data) => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      userId: data.userId || 'anonymous',
      userRole: data.userRole || 'unknown',
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: data.metadata || {}
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(AUDIT_LOG_PATH, logLine);
  } catch (error) {
    console.error('Audit logging error:', error);
  }
};

/**
 * Middleware to automatically log PHI access
 */
const auditPHIAccess = (resourceType) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log on successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAuditEvent({
          userId: req.user?.id,
          userRole: req.user?.role,
          action: req.method.toLowerCase(),
          resourceType,
          resourceId: req.params.id || req.body?._id,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          metadata: {
            endpoint: req.path,
            method: req.method
          }
        });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Query audit logs
 */
const queryAuditLogs = (filters = {}) => {
  try {
    if (!fs.existsSync(AUDIT_LOG_PATH)) {
      return [];
    }
    
    const logs = fs.readFileSync(AUDIT_LOG_PATH, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
    
    return logs.filter(log => {
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.userRole && log.userRole !== filters.userRole) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.resourceType && log.resourceType !== filters.resourceType) return false;
      if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false;
      return true;
    });
  } catch (error) {
    console.error('Error querying audit logs:', error);
    return [];
  }
};

module.exports = {
  logAuditEvent,
  auditPHIAccess,
  queryAuditLogs
};
