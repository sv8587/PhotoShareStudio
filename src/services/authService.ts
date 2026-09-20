import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../mockData';

const STORAGE_KEY_CURRENT_USER = 'trizen_auth_current_user';
const STORAGE_KEY_TOKEN = 'trizen_auth_token';
const STORAGE_KEY_USERS_DB = 'trizen_users_db';
const STORAGE_KEY_EXPLICIT_LOGOUT = 'trizen_explicit_logout';
const SESSION_KEY_ACTIVE = 'trizen_session_active';

// Helper to get all registered users (combines initial mock users and newly registered ones)
export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    // Ensure all INITIAL_USERS exist in stored list
    const combined = [...INITIAL_USERS];
    for (const u of parsed) {
      if (!combined.some(c => c.id === u.id || c.email.toLowerCase() === u.email.toLowerCase())) {
        combined.push(u);
      }
    }
    return combined;
  } catch (err) {
    console.warn('Failed to parse stored users:', err);
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
  } catch (err) {
    console.warn('Failed to persist users to localStorage:', err);
  }
}

// Get the currently authenticated user
export function getActiveUser(): User | null {
  try {
    const isExplicitLogout = localStorage.getItem(STORAGE_KEY_EXPLICIT_LOGOUT) === 'true';
    if (isExplicitLogout) {
      return null;
    }

    // Require an active session in the current browser session so the site always starts with the login page
    const isSessionActive = sessionStorage.getItem(SESSION_KEY_ACTIVE) === 'true';
    if (!isSessionActive) {
      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (raw) {
      const user = JSON.parse(raw);
      if (user && user.id && user.email) {
        return user;
      }
    }
  } catch (err) {
    console.warn('Failed to parse current user from storage:', err);
  }

  // Starts on login page by default (no auto-login)
  return null;
}

// Perform login with API first, then rock-solid local fallback
export async function loginWithCredentials(
  email: string,
  password?: string
): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Try remote API endpoint
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.user && data.token) {
        sessionStorage.setItem(SESSION_KEY_ACTIVE, 'true');
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(data.user));
        localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
        localStorage.removeItem(STORAGE_KEY_EXPLICIT_LOGOUT);
        return { success: true, user: data.user, token: data.token };
      }
    }
  } catch (err) {
    console.warn('Backend API login offline or static host, using local fallback verification:', err);
  }

  // 2. Resilient local fallback (works on static hosting like Vercel, offline, or preview)
  const users = getStoredUsers();
  const matchedUser = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!matchedUser) {
    return {
      success: false,
      error: `No account found with email "${email}". Please verify your credentials or register a new account.`,
    };
  }

  // Check password if configured
  if (matchedUser.password && password && matchedUser.password !== password) {
    return {
      success: false,
      error: 'Incorrect password entered. For demo accounts, try password "admin123" or "team123".',
    };
  }

  const token = matchedUser.id;
  try {
    sessionStorage.setItem(SESSION_KEY_ACTIVE, 'true');
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(matchedUser));
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.removeItem(STORAGE_KEY_EXPLICIT_LOGOUT);
  } catch {}

  return { success: true, user: matchedUser, token };
}

// Perform registration with API first, then local fallback
export async function registerNewUser(
  name: string,
  email: string,
  role: UserRole,
  password?: string
): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedName || !normalizedEmail) {
    return { success: false, error: 'Full name and email are required.' };
  }

  // 1. Try remote API endpoint
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: trimmedName,
        email: normalizedEmail,
        role,
        password,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.user && data.token) {
        sessionStorage.setItem(SESSION_KEY_ACTIVE, 'true');
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(data.user));
        localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
        localStorage.removeItem(STORAGE_KEY_EXPLICIT_LOGOUT);
        
        // Also add to local cache
        const allUsers = getStoredUsers();
        allUsers.push(data.user);
        saveStoredUsers(allUsers);

        return { success: true, user: data.user, token: data.token };
      }
    }
  } catch (err) {
    console.warn('Backend API register offline or static host, registering locally:', err);
  }

  // 2. Local fallback registration
  const allUsers = getStoredUsers();
  const exists = allUsers.some(u => u.email.toLowerCase() === normalizedEmail);
  if (exists) {
    return { success: false, error: `An account with email "${email}" already exists. Please sign in instead.` };
  }

  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: trimmedName,
    email: normalizedEmail,
    role,
    password: password || 'trizen123',
    avatar: role === 'admin'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  };

  allUsers.push(newUser);
  saveStoredUsers(allUsers);

  try {
    sessionStorage.setItem(SESSION_KEY_ACTIVE, 'true');
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEY_TOKEN, newUser.id);
    localStorage.removeItem(STORAGE_KEY_EXPLICIT_LOGOUT);
  } catch {}

  return { success: true, user: newUser, token: newUser.id };
}

// Perform sign out
export function logoutUser(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY_ACTIVE);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.setItem(STORAGE_KEY_EXPLICIT_LOGOUT, 'true');
  } catch (err) {
    console.warn('Failed to clear session from localStorage:', err);
  }
}
