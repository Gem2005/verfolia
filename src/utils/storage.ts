/**
 * Centralized Storage Management Utility
 * Handles localStorage, sessionStorage, and cookies with improved error handling, 
 * performance optimization, and consistent patterns
 */

import Cookies from 'js-cookie';

// Storage types
export type StorageType = 'local' | 'session' | 'cookie';

// Cookie options interface
export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

// Storage keys enum for better type safety and consistency
export const STORAGE_KEYS = {
  // Analytics
  SESSION_ID: 'session_id',
  CREATION_SESSION_ID: 'creation_session_id',
  
  // User preferences
  SELECTED_OPTION: 'selectedOption',
  USER_THEME: 'user_theme',
  USER_LANGUAGE: 'user_language',
  REMEMBER_ME: 'remember_me',
  
  // Resume data
  RESUME_DATA: 'resumeData',
  
  // Visit tracking (prefix patterns)
  USER_VISIT_PREFIX: 'has_visited_create_resume_',
  SESSION_VISIT_PREFIX: 'has_visited_create_resume_session_',
} as const;

// Cache for frequently accessed items to reduce storage calls
const storageCache = new Map<string, { value: any; timestamp: number; ttl?: number }>();

// Cache TTL (5 minutes for most items)
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

class StorageManager {
  private isClient = typeof window !== 'undefined';
  
  /**
   * Check if storage is available and functional
   */
  private isStorageAvailable(type: StorageType): boolean {
    if (!this.isClient) return false;
    
    try {
      const storage = type === 'local' ? localStorage : sessionStorage;
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage instance with fallback
   */
  private getStorage(type: StorageType): Storage | null {
    if (!this.isStorageAvailable(type)) return null;
    return type === 'local' ? localStorage : sessionStorage;
  }

  /**
   * Generate cache key
   */
  private getCacheKey(key: string, type: StorageType): string {
    return `${type}:${key}`;
  }

  /**
   * Check if cached value is still valid
   */
  private isCacheValid(item: { timestamp: number; ttl?: number }): boolean {
    if (!item.ttl) return true; // No TTL means always valid
    return Date.now() - item.timestamp < item.ttl;
  }

  /**
   * Get item from storage with caching
   */
  get<T = string>(key: string, type: StorageType = 'local', useCache = true): T | null {
    const cacheKey = this.getCacheKey(key, type);
    
    // Check cache first
    if (useCache) {
      const cached = storageCache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        return cached.value;
      }
    }

    const storage = this.getStorage(type);
    if (!storage) return null;

    try {
      const value = storage.getItem(key);
      const parsedValue = value ? this.parseValue<T>(value) : null;
      
      // Update cache
      if (useCache && parsedValue !== null) {
        storageCache.set(cacheKey, {
          value: parsedValue,
          timestamp: Date.now(),
          ttl: DEFAULT_CACHE_TTL
        });
      }
      
      return parsedValue;
    } catch (error) {
      console.warn(`Storage get error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set item to storage with caching
   */
  set<T>(key: string, value: T, type: StorageType = 'local', useCache = true): boolean {
    const storage = this.getStorage(type);
    if (!storage) return false;

    try {
      const serializedValue = this.serializeValue(value);
      storage.setItem(key, serializedValue);
      
      // Update cache
      if (useCache) {
        const cacheKey = this.getCacheKey(key, type);
        storageCache.set(cacheKey, {
          value,
          timestamp: Date.now(),
          ttl: DEFAULT_CACHE_TTL
        });
      }
      
      return true;
    } catch (error) {
      console.warn(`Storage set error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove item from storage and cache
   */
  remove(key: string, type: StorageType = 'local'): boolean {
    const storage = this.getStorage(type);
    if (!storage) return false;

    try {
      storage.removeItem(key);
      
      // Remove from cache
      const cacheKey = this.getCacheKey(key, type);
      storageCache.delete(cacheKey);
      
      return true;
    } catch (error) {
      console.warn(`Storage remove error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all items of a specific type
   */
  clear(type: StorageType = 'local'): boolean {
    const storage = this.getStorage(type);
    if (!storage) return false;

    try {
      storage.clear();
      
      // Clear relevant cache entries
      for (const [key] of storageCache.entries()) {
        if (key.startsWith(`${type}:`)) {
          storageCache.delete(key);
        }
      }
      
      return true;
    } catch (error) {
      console.warn(`Storage clear error:`, error);
      return false;
    }
  }

  /**
   * Get all keys matching a pattern
   */
  getKeysMatching(pattern: string, type: StorageType = 'local'): string[] {
    const storage = this.getStorage(type);
    if (!storage) return [];

    try {
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.includes(pattern)) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.warn(`Storage getKeysMatching error:`, error);
      return [];
    }
  }

  /**
   * Remove all keys matching a pattern
   */
  removeKeysMatching(pattern: string, type: StorageType = 'local'): number {
    const keys = this.getKeysMatching(pattern, type);
    let removedCount = 0;
    
    keys.forEach(key => {
      if (this.remove(key, type)) {
        removedCount++;
      }
    });
    
    return removedCount;
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(type: StorageType = 'local'): { used: number; available: number; percentage: number } | null {
    const storage = this.getStorage(type);
    if (!storage) return null;

    try {
      const total = 5 * 1024 * 1024; // Assume 5MB limit (standard for localStorage)
      let used = 0;
      
      for (let key in storage) {
        if (storage.hasOwnProperty(key)) {
          used += storage[key].length + key.length;
        }
      }
      
      return {
        used,
        available: total - used,
        percentage: Math.round((used / total) * 100)
      };
    } catch (error) {
      console.warn(`Storage info error:`, error);
      return null;
    }
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupCache(): void {
    const now = Date.now();
    for (const [key, item] of storageCache.entries()) {
      if (!this.isCacheValid(item)) {
        storageCache.delete(key);
      }
    }
  }

  /**
   * Parse value from storage (handles JSON automatically)
   */
  private parseValue<T>(value: string): T {
    try {
      return JSON.parse(value);
    } catch {
      return value as T;
    }
  }

  /**
   * Serialize value for storage
   */
  private serializeValue<T>(value: T): string {
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  }

  // ================================
  // COOKIE MANAGEMENT METHODS
  // ================================

  /**
   * Get cookie value with optional parsing
   */
  getCookie<T = string>(key: string): T | null {
    if (!this.isClient) return null;

    try {
      const value = Cookies.get(key);
      if (!value) return null;
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.warn(`Cookie get error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set cookie with options
   */
  setCookie<T>(key: string, value: T, options: CookieOptions = {}): boolean {
    if (!this.isClient) return false;

    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      // Default options for security and compliance
      const defaultOptions: CookieOptions = {
        expires: 30, // 30 days default
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      };

      const finalOptions = { ...defaultOptions, ...options };
      Cookies.set(key, serializedValue, finalOptions);
      return true;
    } catch (error) {
      console.warn(`Cookie set error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove cookie
   */
  removeCookie(key: string, options: Partial<CookieOptions> = {}): boolean {
    if (!this.isClient) return false;

    try {
      const removeOptions = {
        path: '/',
        ...options
      };
      Cookies.remove(key, removeOptions);
      return true;
    } catch (error) {
      console.warn(`Cookie remove error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Check if cookie exists
   */
  hasCookie(key: string): boolean {
    if (!this.isClient) return false;
    return Cookies.get(key) !== undefined;
  }

  /**
   * Get all cookies as object
   */
  getAllCookies(): Record<string, string> {
    if (!this.isClient) return {};
    return Cookies.get();
  }
}

// Singleton instance
export const storage = new StorageManager();

// Convenience methods for common operations
export const storageHelpers = {
  // Session management
  getSessionId: () => storage.get(STORAGE_KEYS.SESSION_ID, 'local'),
  setSessionId: (id: string) => storage.set(STORAGE_KEYS.SESSION_ID, id, 'local'),
  
  getCreationSessionId: () => storage.get(STORAGE_KEYS.CREATION_SESSION_ID, 'session'),
  setCreationSessionId: (id: string) => storage.set(STORAGE_KEYS.CREATION_SESSION_ID, id, 'session'),
  clearCreationSession: () => storage.remove(STORAGE_KEYS.CREATION_SESSION_ID, 'session'),

  // Resume data
  getResumeData: () => storage.get(STORAGE_KEYS.RESUME_DATA, 'session'),
  setResumeData: (data: any) => storage.set(STORAGE_KEYS.RESUME_DATA, data, 'session'),
  clearResumeData: () => storage.remove(STORAGE_KEYS.RESUME_DATA, 'session'),

  // User preferences
  getSelectedOption: () => storage.get(STORAGE_KEYS.SELECTED_OPTION, 'local'),
  setSelectedOption: (option: string) => storage.set(STORAGE_KEYS.SELECTED_OPTION, option, 'local'),
  clearSelectedOption: () => storage.remove(STORAGE_KEYS.SELECTED_OPTION, 'local'),

  // Visit tracking
  hasUserVisited: (userId: string) => {
    const key = `${STORAGE_KEYS.USER_VISIT_PREFIX}${userId}`;
    return !!storage.get(key, 'local');
  },
  markUserVisited: (userId: string) => {
    const key = `${STORAGE_KEYS.USER_VISIT_PREFIX}${userId}`;
    return storage.set(key, 'true', 'local');
  },
  hasSessionVisited: (sessionId: string) => {
    const key = `${STORAGE_KEYS.SESSION_VISIT_PREFIX}${sessionId}`;
    return !!storage.get(key, 'session');
  },
  markSessionVisited: (sessionId: string) => {
    const key = `${STORAGE_KEYS.SESSION_VISIT_PREFIX}${sessionId}`;
    return storage.set(key, 'true', 'session');
  },

  // Cleanup utilities
  cleanupOldVisitRecords: () => {
    const userVisitKeys = storage.getKeysMatching(STORAGE_KEYS.USER_VISIT_PREFIX, 'local');
    const sessionVisitKeys = storage.getKeysMatching(STORAGE_KEYS.SESSION_VISIT_PREFIX, 'session');
    
    // Keep only recent visit records (optional cleanup)
    // This can be customized based on your needs
    return {
      userVisitsRemoved: 0, // Could implement cleanup logic here
      sessionVisitsRemoved: 0
    };
  },

  // ================================
  // COOKIE HELPERS
  // ================================

  // User Preferences
  getUserTheme: () => storage.getCookie<string>(STORAGE_KEYS.USER_THEME) || 'system',
  setUserTheme: (theme: 'light' | 'dark' | 'system') => 
    storage.setCookie(STORAGE_KEYS.USER_THEME, theme, { expires: 30 }),
  
  getUserLanguage: () => storage.getCookie<string>(STORAGE_KEYS.USER_LANGUAGE) || 'en',
  setUserLanguage: (language: string) => 
    storage.setCookie(STORAGE_KEYS.USER_LANGUAGE, language, { expires: 30 }),

  // Authentication Preferences
  getRememberMe: () => storage.getCookie<boolean>(STORAGE_KEYS.REMEMBER_ME) || false,
  setRememberMe: (remember: boolean) => 
    storage.setCookie(STORAGE_KEYS.REMEMBER_ME, remember, { expires: remember ? 30 : 0 }),
  clearRememberMe: () => storage.removeCookie(STORAGE_KEYS.REMEMBER_ME),

  // Cookie Management
  clearAllPreferences: () => {
    storage.removeCookie(STORAGE_KEYS.USER_THEME);
    storage.removeCookie(STORAGE_KEYS.USER_LANGUAGE);
    storage.removeCookie(STORAGE_KEYS.REMEMBER_ME);
  },

  // Get all user preferences as object
  getAllPreferences: () => ({
    theme: storageHelpers.getUserTheme(),
    language: storageHelpers.getUserLanguage(),
    rememberMe: storageHelpers.getRememberMe()
  })
};

// Auto cleanup cache every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    storage.cleanupCache();
  }, 5 * 60 * 1000);
}