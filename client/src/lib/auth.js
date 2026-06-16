const TOKEN_KEY = 'jt_token';
const USER_KEY = 'jt_user';

/**
 * Retrieves the auth token from local storage.
 * @returns {string|null} The auth token or null if not found.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Retrieves the user object from local storage.
 * @returns {object|null} The user object or null if not found.
 */
export function getUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * Stores the auth token and user object in local storage.
 * @param {string} token - The auth token.
 * @param {object} user - The user object.
 */
export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Removes the auth token and user object from local storage.
 */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
