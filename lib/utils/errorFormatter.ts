/**
 * Utility function to format API errors into user-friendly messages
 */
export const formatErrorMessage = (error: string): string => {
  // Handle duplicate key constraint errors
  if (error.includes('duplicate key value violates unique constraint')) {
    if (error.includes('translation_keys_project_id_key_key')) {
      const keyMatch = error.match(
        /Key \(project_id, key\)=\([^,]+, ([^)]+)\)/
      );
      const keyName = keyMatch ? keyMatch[1] : 'this key';
      return `Translation key "${keyName}" already exists in this project. Please choose a different key name.`;
    }
    return 'This entry already exists. Please use different values.';
  }

  // Handle foreign key constraint errors
  if (error.includes('violates foreign key constraint')) {
    return 'The referenced item does not exist or has been deleted.';
  }

  // Handle validation errors
  if (error.includes('validation') || error.includes('invalid')) {
    return 'Please check your input values and try again.';
  }

  // Handle authentication errors
  if (error.includes('unauthorized') || error.includes('authentication')) {
    return 'You are not authorized to perform this action. Please sign in again.';
  }

  // Handle permission errors
  if (error.includes('forbidden') || error.includes('permission')) {
    return 'You do not have permission to perform this action.';
  }

  // Handle network errors
  if (
    error.includes('network') ||
    error.includes('fetch') ||
    error.includes('NetworkError')
  ) {
    return 'Network error. Please check your connection and try again.';
  }

  // Handle timeout errors
  if (error.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Handle server errors
  if (error.includes('500') || error.includes('Internal Server Error')) {
    return 'Server error. Please try again later or contact support.';
  }

  // Handle not found errors
  if (error.includes('404') || error.includes('Not Found')) {
    return 'The requested item was not found.';
  }

  // Handle rate limiting
  if (error.includes('429') || error.includes('Too Many Requests')) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  // Handle JSON parsing errors
  if (error.includes('JSON') || error.includes('parse')) {
    return 'Invalid response from server. Please try again.';
  }

  // Default to a cleaned-up version of the original error message
  return cleanErrorMessage(error);
};

/**
 * Clean up raw error messages by removing technical details
 */
const cleanErrorMessage = (error: string): string => {
  // Remove common prefixes
  let cleaned = error
    .replace(/^Error:\s*/i, '')
    .replace(/^ApiError:\s*/i, '')
    .replace(/^HTTP \d+:\s*/i, '')
    .replace(/^Failed to\s*/i, '');

  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Ensure it ends with a period
  if (
    !cleaned.endsWith('.') &&
    !cleaned.endsWith('!') &&
    !cleaned.endsWith('?')
  ) {
    cleaned += '.';
  }

  return cleaned;
};

/**
 * Get error type for styling purposes
 */
export const getErrorType = (error: string): 'error' | 'warning' | 'info' => {
  if (error.includes('unauthorized') || error.includes('forbidden')) {
    return 'warning';
  }

  if (error.includes('duplicate') || error.includes('already exists')) {
    return 'warning';
  }

  return 'error';
};

/**
 * Extract error details for development/debugging
 */
export const extractErrorDetails = (
  error: unknown
): {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
} => {
  if (typeof error === 'string') {
    return { message: error };
  }

  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    return {
      message:
        (errorObj.message as string) ||
        (errorObj.detail as string) ||
        'Unknown error',
      code: errorObj.code as string | undefined,
      status: errorObj.status as number | undefined,
      details: errorObj.details || error,
    };
  }

  return { message: 'Unknown error occurred' };
};
