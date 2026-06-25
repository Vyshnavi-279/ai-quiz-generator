/**
 * API configuration for the AI Quiz Generator.
 * Uses Vite environment variables with sensible defaults.
 * 
 * VITE_API_BASE_URL - Backend API URL (default: http://localhost:5000)
 * VITE_PARSER_URL   - Parser service URL (default: http://localhost:5001)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const PARSER_URL = import.meta.env.VITE_PARSER_URL || 'http://localhost:5001';

export { API_BASE_URL, PARSER_URL };

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  });
  return response;
}