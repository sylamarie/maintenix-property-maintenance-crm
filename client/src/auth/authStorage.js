export const tokenStorageKey = 'maintenix_token';

export const getStoredToken = () => {
  return localStorage.getItem(tokenStorageKey);
};

export const setStoredToken = (token) => {
  localStorage.setItem(tokenStorageKey, token);
};

export const clearStoredToken = () => {
  localStorage.removeItem(tokenStorageKey);
};
