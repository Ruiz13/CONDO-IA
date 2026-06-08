import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  tenantName?: string;
  mustChangePassword?: boolean;
  avatarBase64?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Referencia global para poder cerrar sesión desde archivos de peticiones (API)
export let globalLogout: () => void = () => {};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al arrancar la app, recuperar sesión guardada
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('auth_token');
        const savedUser = await AsyncStorage.getItem('auth_user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error('Error cargando sesión:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const logout = async () => {
    setToken(null);
    setUser(null);
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
    } catch (e) {
      console.error('Error borrando sesión:', e);
    }
  };

  // Asignamos la función local a la referencia global
  useEffect(() => {
    globalLogout = logout;
  }, []);

  const login = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    // Guardar sesión en disco
    try {
      await AsyncStorage.setItem('auth_token', newToken);
      await AsyncStorage.setItem('auth_user', JSON.stringify(newUser));
    } catch (e) {
      console.error('Error guardando sesión:', e);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      try {
        await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
      } catch (e) {
        console.error('Error actualizando sesión:', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
  }
  return context;
};
