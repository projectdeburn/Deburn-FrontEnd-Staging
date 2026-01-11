/**
 * API Configuration and Base Fetch Utility
 * Handles API requests with proper error handling and authentication
 */

/**
 * Get the base URL for API requests
 * Uses VITE_API_URL environment variable for production
 * Falls back to relative URLs (handled by Vite proxy in development)
 */
export function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL || '';
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, code, status, fields = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

/**
 * Make an API request with proper error handling
 * @param {string} endpoint - API endpoint (e.g., '/api/auth/login')
 * @param {object} options - Fetch options
 * @returns {Promise<object>} API response data
 */
export async function apiRequest(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for session management
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error?.message || 'Request failed',
        data.error?.code,
        response.status,
        data.error?.fields
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR',
        0
      );
    }

    throw new ApiError(error.message, 'UNKNOWN_ERROR', 0);
  }
}

/**
 * Make a GET request
 */
export function get(endpoint, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'GET' });
}

/**
 * Make a POST request
 */
export function post(endpoint, body, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Make a PUT request
 */
export function put(endpoint, body, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Make a DELETE request
 */
export function del(endpoint, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'DELETE' });
}

/**
 * Make a request with FormData (for file uploads)
 */
export async function uploadFile(endpoint, formData, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    ...options,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error?.message || 'Upload failed',
      data.error?.code,
      response.status
    );
  }

  return data;
}
