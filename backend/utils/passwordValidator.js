/**
 * HIPAA Compliant Password Strength Validator
 * Ensures strong passwords for user accounts
 */

const validatePasswordStrength = (password) => {
  const errors = [];
  
  // Minimum length: 8 characters
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Maximum length: 128 characters
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  
  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // At least one number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // At least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // No common passwords (basic check)
  const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123',
    'monkey', 'master', 'dragon', 'letmein', 'login',
    'princess', 'solo', 'starwars', 'passw0rd', 'admin'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password cannot contain common words');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const getPasswordStrengthScore = (password) => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  return {
    score,
    maxScore: 7,
    strength: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'
  };
};

module.exports = {
  validatePasswordStrength,
  getPasswordStrengthScore
};
