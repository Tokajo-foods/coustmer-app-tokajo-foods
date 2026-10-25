import axios from 'axios';

import { API_BASE_URL } from '@/lib/api';

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return 'Request timed out. Check your internet and try again.';
      }

      const detail = error.message?.toLowerCase() ?? '';
      if (detail.includes('network error') || detail.includes('network request failed')) {
        return `Cannot reach ${API_BASE_URL}. Check your Wi‑Fi or mobile data and try again.`;
      }

      return error.message || 'Cannot reach the server. Check your internet connection.';
    }

    const data = error.response?.data as
      | { message?: string; error?: string; errors?: string[] }
      | undefined;

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.join('\n');
    }
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.error === 'string') return data.error;
    if (error.message && error.message !== 'Network Error') return error.message;
  }

  if (error instanceof Error) {
    if (error.message.includes('Security token')) {
      return `${error.message}. Check that ${API_BASE_URL} is reachable from your phone.`;
    }
    return error.message;
  }

  return fallback;
}
