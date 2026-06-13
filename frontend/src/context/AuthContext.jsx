import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api';

const getSafeToken = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch (e) {
    console.warn('localStorage not accessible, falling back to in-memory session:', e);
    return null;
  }
};

const setSafeToken = (token) => {
  try {
    localStorage.setItem('token', token);
  } catch (e) {
    console.warn('localStorage not accessible, session will not persist:', e);
  }
};

const removeSafeToken = () => {
  try {
    localStorage.removeItem('token');
  } catch (e) {
    console.warn('localStorage not accessible:', e);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getSafeToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.success) {
          setUser(data);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        setSafeToken(data.token);
        setToken(data.token);
        setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
        return { success: true };
      } else {
        setError(data.message || 'Login failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Server connection failed');
      return { success: false, message: 'Server connection failed' };
    }
  };

  const register = async (name, email, password, role = 'user') => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();

      if (data.success) {
        setSafeToken(data.token);
        setToken(data.token);
        setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
        return { success: true };
      } else {
        setError(data.message || 'Registration failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Server connection failed');
      return { success: false, message: 'Server connection failed' };
    }
  };

  const logout = () => {
    removeSafeToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
