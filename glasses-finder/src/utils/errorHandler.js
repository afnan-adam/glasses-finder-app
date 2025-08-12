/**
 * Centralized error handling utilities
 */

/**
 * Custom error classes for better error categorization
 */
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class ServiceError extends Error {
  constructor(message, code = null) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

export class NetworkError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
  }
}

/**
 * Error handler utility functions
 */
export const errorHandler = {
  /**
   * Handle and format errors for user display
   * @param {Error} error - The error to handle
   * @returns {Object} Formatted error information
   */
  handleError(error) {
    console.error('Error occurred:', error);

    // Default error info
    const errorInfo = {
      message: 'An unexpected error occurred. Please try again.',
      type: 'error',
      code: 'UNKNOWN_ERROR'
    };

    // Handle different error types
    if (error instanceof ValidationError) {
      errorInfo.message = error.message;
      errorInfo.type = 'warning';
      errorInfo.code = 'VALIDATION_ERROR';
      errorInfo.field = error.field;
    } else if (error instanceof ServiceError) {
      errorInfo.message = error.message || 'Service temporarily unavailable. Please try again later.';
      errorInfo.type = 'error';
      errorInfo.code = error.code || 'SERVICE_ERROR';
    } else if (error instanceof NetworkError) {
      errorInfo.message = 'Network connection error. Please check your internet connection.';
      errorInfo.type = 'error';
      errorInfo.code = 'NETWORK_ERROR';
      errorInfo.status = error.status;
    } else if (error.message) {
      // Regular error with message
      errorInfo.message = error.message;
    }

    return errorInfo;
  },

  /**
   * Log error for debugging/monitoring
   * @param {Error} error - The error to log
   * @param {Object} context - Additional context information
   */
  logError(error, context = {}) {
    const errorData = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In production, you might send this to an error monitoring service
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Details:', errorData);
    } else {
      // Example: Send to monitoring service
      // sendToErrorMonitoring(errorData);
    }
  },

  /**
   * Create user-friendly error messages
   * @param {string} operation - The operation that failed
   * @param {Error} error - The original error
   * @returns {string} User-friendly error message
   */
  getUserFriendlyMessage(operation, error) {
    const baseMessages = {
      'form_submission': 'There was a problem submitting your form. Please check your information and try again.',
      'eligibility_assessment': 'We couldn\'t process your eligibility assessment. Please verify your information and try again.',
      'data_loading': 'We couldn\'t load the glasses data. Please refresh the page and try again.',
      'network_request': 'Connection problem. Please check your internet connection and try again.'
    };

    if (error instanceof ValidationError) {
      return error.message;
    }

    return baseMessages[operation] || 'Something went wrong. Please try again.';
  },

  /**
   * Retry mechanism for failed operations
   * @param {Function} operation - The operation to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Delay between retries in ms
   * @returns {Promise} The result of the operation
   */
  async withRetry(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry validation errors
        if (error instanceof ValidationError) {
          throw error;
        }
        
        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError;
  }
};

/**
 * Async error boundary for handling promises
 * @param {Promise} promise - Promise to wrap
 * @param {string} operation - Operation name for error context
 * @returns {Promise<[Error|null, any]>} Tuple of [error, result]
 */
export const asyncErrorBoundary = async (promise, operation = 'unknown') => {
  try {
    const result = await promise;
    return [null, result];
  } catch (error) {
    errorHandler.logError(error, { operation });
    return [error, null];
  }
};

/**
 * Input sanitization utilities
 */
export const sanitizer = {
  /**
   * Sanitize string input
   * @param {string} input - Input to sanitize
   * @returns {string} Sanitized input
   */
  sanitizeString(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  },

  /**
   * Sanitize numeric input
   * @param {any} input - Input to sanitize
   * @returns {number|null} Sanitized number or null if invalid
   */
  sanitizeNumber(input) {
    const num = Number(input);
    return isNaN(num) ? null : num;
  },

  /**
   * Sanitize ZIP code input
   * @param {string} input - ZIP code input
   * @returns {string} Sanitized ZIP code
   */
  sanitizeZipCode(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/\D/g, '') // Remove non-digits
      .substring(0, 5); // Limit to 5 digits
  },

  /**
   * Sanitize household size input
   * @param {any} input - Household size input
   * @returns {number|null} Sanitized household size
   */
  sanitizeHouseholdSize(input) {
    const num = this.sanitizeNumber(input);
    if (num === null || num < 1 || num > 15) return null;
    return Math.floor(num);
  }
};

export default errorHandler;