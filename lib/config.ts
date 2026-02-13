// lib/config.ts

/**
 * Application configuration
 * Handles environment-specific settings
 */

export const config = {
  // Backend API URL
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 
              process.env.BACKEND_URL || 
              'http://localhost:8000',
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // API endpoints
  api: {
    generate: '/api/v1/generate',
    health: '/health',
  },
} as const;

/**
 * Get full API endpoint URL
 */
export function getApiUrl(endpoint: string): string {
  return `${config.backendUrl}${endpoint}`;
}

/**
 * Validate backend connection
 */
export async function validateBackendConnection(): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl(config.api.health), {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
}
