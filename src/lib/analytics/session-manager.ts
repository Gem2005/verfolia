/**
 * Session Manager for Analytics Tracking
 * Generates and manages unique session IDs for analytics tracking
 * Sessions expire after 15 days of inactivity
 */

const STORAGE_KEY = 'verfolia_analytics_session';
const SESSION_TIMEOUT = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds

interface SessionData {
  sessionId: string;
  timestamp: number;
}

/**
 * Get existing session ID or create a new one
 * @returns Unique session ID for the current browser session
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - return temporary ID
    return 'ssr-session';
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const sessionData: SessionData = JSON.parse(stored);
      const isExpired = Date.now() - sessionData.timestamp > SESSION_TIMEOUT;
      
      if (!isExpired) {
        // Update timestamp to extend session
        sessionData.timestamp = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
        console.log(`🔄 [Session] Using existing session: ${sessionData.sessionId.substring(0, 8)}...`);
        return sessionData.sessionId;
      }
    }
  } catch (error) {
    console.error('Error reading session from storage:', error);
  }

  // Create new session
  const newSessionId = generateSessionId();
  const sessionData: SessionData = {
    sessionId: newSessionId,
    timestamp: Date.now()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    console.log(`🆕 [Session] Created new session: ${newSessionId.substring(0, 8)}...`);
  } catch (error) {
    console.error('Error storing session:', error);
  }

  return newSessionId;
}

/**
 * Clear the current session
 * Useful for logout or explicit session termination
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

/**
 * Check if a valid session exists
 * @returns true if session exists and hasn't expired
 */
export function isSessionActive(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    const sessionData: SessionData = JSON.parse(stored);
    const isExpired = Date.now() - sessionData.timestamp > SESSION_TIMEOUT;
    
    return !isExpired;
  } catch (error) {
    console.error('Error checking session status:', error);
    return false;
  }
}

/**
 * Get current session ID without creating a new one
 * @returns Current session ID or null if none exists
 */
export function getCurrentSessionId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const sessionData: SessionData = JSON.parse(stored);
    const isExpired = Date.now() - sessionData.timestamp > SESSION_TIMEOUT;
    
    return isExpired ? null : sessionData.sessionId;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

/**
 * Generate a unique session ID
 * @returns UUID v4 format session ID
 */
function generateSessionId(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback to manual UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
