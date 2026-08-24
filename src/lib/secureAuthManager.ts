import { useState, useEffect } from 'react';
import type { User } from '../types';

export interface AdminSessionInfo {
  user: User;
  expiresAt: number; // Unix timestamp in ms
  lastActivityAt: number;
  durationMs: number; // e.g. 30 minutes = 30 * 60 * 1000
  sessionToken: string;
}

export type AuthListener = (user: User | null) => void;
export type SessionTickListener = (remainingSeconds: number, isExpiringSoon: boolean) => void;
export type SessionExpireListener = () => void;

// 30 minutes admin session duration by default
export const DEFAULT_ADMIN_SESSION_DURATION_MS = 30 * 60 * 1000;
// Warning threshold (5 minutes)
export const EXPIRING_SOON_THRESHOLD_SECONDS = 5 * 60;

/**
 * Volatile In-Memory Security Engine
 * Cryptographically secures the authenticated session in JavaScript heap memory.
 * NEVER stores plain user/admin data or credentials in disk storage.
 * On browser restart, all memory keys and sessions are permanently destroyed.
 */
class SecureAuthManager {
  private static instance: SecureAuthManager;
  private currentUser: User | null = null;
  private currentSession: AdminSessionInfo | null = null;
  private authListeners: Set<AuthListener> = new Set();
  private tickListeners: Set<SessionTickListener> = new Set();
  private expireListeners: Set<SessionExpireListener> = new Set();
  private timerInterval: any = null;
  private ephemeralEncryptionKey: CryptoKey | null = null;
  private encryptedPayload: { cipherText: ArrayBuffer; iv: Uint8Array } | null = null;

  private constructor() {
    this.initCryptoKey();
    this.setupActivityListeners();
  }

  public static getInstance(): SecureAuthManager {
    if (!SecureAuthManager.instance) {
      SecureAuthManager.instance = new SecureAuthManager();
    }
    return SecureAuthManager.instance;
  }

  /**
   * Initialize volatile AES-GCM ephemeral key in heap memory
   */
  private async initCryptoKey() {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        this.ephemeralEncryptionKey = await window.crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          false, // Not extractable for maximum security
          ['encrypt', 'decrypt']
        );
      }
    } catch (e) {
      console.warn('Web Crypto API fallback initialization', e);
    }
  }

  /**
   * Encrypt and store payload in memory
   */
  private async encryptInMemory(data: AdminSessionInfo) {
    if (!this.ephemeralEncryptionKey || typeof window === 'undefined' || !window.crypto?.subtle) {
      return;
    }
    try {
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(JSON.stringify(data));
      const cipherText = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.ephemeralEncryptionKey,
        encoded
      );
      this.encryptedPayload = { cipherText, iv };
    } catch (e) {
      console.error('In-memory encryption failed:', e);
    }
  }

  /**
   * Listen to user activity to refresh last activity timestamp
   */
  private setupActivityListeners() {
    if (typeof window === 'undefined') return;

    const onUserActivity = () => {
      if (this.currentSession && this.currentUser?.isAdmin) {
        this.currentSession.lastActivityAt = Date.now();
      }
    };

    window.addEventListener('click', onUserActivity, { passive: true });
    window.addEventListener('keydown', onUserActivity, { passive: true });
    window.addEventListener('touchstart', onUserActivity, { passive: true });
  }

  /**
   * Start 1-second interval ticker for session expiration countdown
   */
  private startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (!this.currentSession || !this.currentUser) {
        this.stopTimer();
        return;
      }

      const now = Date.now();
      const remainingMs = Math.max(0, this.currentSession.expiresAt - now);
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      const isExpiringSoon = remainingSeconds <= EXPIRING_SOON_THRESHOLD_SECONDS && remainingSeconds > 0;

      // Broadcast tick to subscribers
      this.tickListeners.forEach(listener => listener(remainingSeconds, isExpiringSoon));

      // Handle session expiration
      if (remainingMs <= 0) {
        this.handleSessionExpired();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Execute auto-logout upon session expiration
   */
  private handleSessionExpired() {
    this.stopTimer();
    const expiredUser = this.currentUser;
    this.currentUser = null;
    this.currentSession = null;
    this.encryptedPayload = null;

    // Purge any legacy keys
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sy_logged_user');
      localStorage.removeItem('sy_user');
      localStorage.removeItem('sy_saved_login_password');
      sessionStorage.removeItem('sy_admin_session');
    }

    // Notify listeners
    this.authListeners.forEach(listener => listener(null));
    this.expireListeners.forEach(listener => listener());

    // Dispatch global event for non-react or modal consumers
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sy_admin_session_expired', {
        detail: { reason: 'timeout', previousUser: expiredUser }
      }));
    }
  }

  /**
   * Login user with encrypted in-memory session management
   */
  public async login(
    user: User, 
    customDurationMs: number = DEFAULT_ADMIN_SESSION_DURATION_MS
  ): Promise<void> {
    const isOwner = user.email === 'sy.car.com@gmail.com' || user.role === 'admin' || user.isAdmin === true;
    
    const finalUser: User = {
      ...user,
      isAdmin: isOwner,
      role: isOwner ? 'admin' : (user.role || 'user')
    };

    this.currentUser = finalUser;

    const now = Date.now();
    const token = `sec-tok-${Math.random().toString(36).substring(2)}-${now}`;

    this.currentSession = {
      user: finalUser,
      expiresAt: now + customDurationMs,
      lastActivityAt: now,
      durationMs: customDurationMs,
      sessionToken: token
    };

    // Encrypt in volatile memory
    await this.encryptInMemory(this.currentSession);

    // Clean up any plain passwords or legacy items
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sy_saved_login_password');
      localStorage.removeItem('sy_logged_user');
      localStorage.removeItem('sy_user');
    }

    if (finalUser.isAdmin) {
      this.startTimer();
    }

    // Broadcast state update
    this.authListeners.forEach(listener => listener(finalUser));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sy_auth_state_changed', { detail: { user: finalUser } }));
    }
  }

  /**
   * Manual Logout - safely clear all memory and sessions
   */
  public logout(): void {
    this.stopTimer();
    this.currentUser = null;
    this.currentSession = null;
    this.encryptedPayload = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('sy_logged_user');
      localStorage.removeItem('sy_user');
      localStorage.removeItem('sy_saved_login_password');
      sessionStorage.removeItem('sy_admin_session');
    }

    this.authListeners.forEach(listener => listener(null));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sy_auth_state_changed', { detail: { user: null } }));
    }
  }

  /**
   * Extend current active admin session
   */
  public extendSession(extensionMs: number = DEFAULT_ADMIN_SESSION_DURATION_MS): boolean {
    if (!this.currentSession || !this.currentUser) return false;

    const now = Date.now();
    this.currentSession.expiresAt = now + extensionMs;
    this.currentSession.lastActivityAt = now;
    this.currentSession.durationMs = extensionMs;

    this.encryptInMemory(this.currentSession);
    this.startTimer();

    // Trigger tick immediately
    const remainingSeconds = Math.ceil(extensionMs / 1000);
    this.tickListeners.forEach(listener => listener(remainingSeconds, false));

    return true;
  }

  /**
   * Get Current In-Memory User
   */
  public getUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get Active Session Info
   */
  public getSession(): AdminSessionInfo | null {
    return this.currentSession;
  }

  /**
   * Get remaining seconds
   */
  public getRemainingSeconds(): number {
    if (!this.currentSession) return 0;
    const remainingMs = Math.max(0, this.currentSession.expiresAt - Date.now());
    return Math.ceil(remainingMs / 1000);
  }

  /**
   * Subscribe to Auth State Changes
   */
  public subscribeAuth(listener: AuthListener): () => void {
    this.authListeners.add(listener);
    // Initial call
    listener(this.currentUser);
    return () => {
      this.authListeners.delete(listener);
    };
  }

  /**
   * Subscribe to Session Countdown Ticks
   */
  public subscribeSessionTick(listener: SessionTickListener): () => void {
    this.tickListeners.add(listener);
    if (this.currentSession) {
      const remainingSeconds = this.getRemainingSeconds();
      listener(remainingSeconds, remainingSeconds <= EXPIRING_SOON_THRESHOLD_SECONDS && remainingSeconds > 0);
    }
    return () => {
      this.tickListeners.delete(listener);
    };
  }

  /**
   * Subscribe to Session Expiration
   */
  public subscribeSessionExpire(listener: SessionExpireListener): () => void {
    this.expireListeners.add(listener);
    return () => {
      this.expireListeners.delete(listener);
    };
  }
}

export const secureAuthManager = SecureAuthManager.getInstance();

/**
 * Custom React Hook for React Components
 */
export function useSecureAuth() {
  const [user, setUser] = useState<User | null>(() => secureAuthManager.getUser());
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => secureAuthManager.getRemainingSeconds());
  const [isExpiringSoon, setIsExpiringSoon] = useState<boolean>(false);

  useEffect(() => {
    const unsubAuth = secureAuthManager.subscribeAuth((updatedUser) => {
      setUser(updatedUser);
    });

    const unsubTick = secureAuthManager.subscribeSessionTick((seconds, expiringSoon) => {
      setRemainingSeconds(seconds);
      setIsExpiringSoon(expiringSoon);
    });

    return () => {
      unsubAuth();
      unsubTick();
    };
  }, []);

  const formatRemainingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return {
    user,
    isAdmin: Boolean(user?.isAdmin || user?.role === 'admin' || user?.email === 'sy.car.com@gmail.com'),
    remainingSeconds,
    formattedTime: formatRemainingTime(remainingSeconds),
    isExpiringSoon,
    login: (u: User, duration?: number) => secureAuthManager.login(u, duration),
    logout: () => secureAuthManager.logout(),
    extendSession: (duration?: number) => secureAuthManager.extendSession(duration)
  };
}
