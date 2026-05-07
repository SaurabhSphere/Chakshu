// Parse API error responses
export const parseError = (error) => {
  if (!error) return 'An unexpected error occurred';

  // Handle axios error
  if (error.response) {
    const { data, status } = error.response;

    if (data && data.message) {
      return data.message;
    }

    if (data && data.detail) {
      return data.detail;
    }

    // Default HTTP status messages
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This resource already exists.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Error: ${status}`;
    }
  }

  // Handle network error
  if (error.message === 'Network Error') {
    return 'Network error. Please check your connection.';
  }

  // Handle generic error
  return error.message || 'An unexpected error occurred';
};

// Get validation errors from API response
export const getValidationErrors = (error) => {
  if (!error) return {};

  if (error.response && error.response.data) {
    const { data } = error.response;

    if (data.errors && typeof data.errors === 'object') {
      return data.errors;
    }

    if (Array.isArray(data.errors)) {
      // Convert array of error messages to object
      const errorObj = {};
      data.errors.forEach((err) => {
        const [field, message] = err.split(':');
        if (field && message) {
          errorObj[field.trim()] = message.trim();
        }
      });
      return errorObj;
    }
  }

  return {};
};

// Log error for debugging
export const logError = (error, context = '') => {
  const timestamp = new Date().toISOString();
  const message = parseError(error);
  console.error(`[${timestamp}] ${context ? `[${context}] ` : ''}${message}`, error);
};

// Create user-friendly error message
export const getUserFriendlyError = (error) => {
  const message = parseError(error);
  return message.charAt(0).toUpperCase() + message.slice(1);
};
