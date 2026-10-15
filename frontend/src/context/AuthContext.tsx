import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Workspace } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  token: string | null;
  role: string;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshWorkspace: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('dineai_token'));
  const [role, setRole] = useState<string>('OWNER');
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    const savedToken = localStorage.getItem('dineai_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const meData = await api.getMe();
      setUser(meData.user);
      if (meData.workspaces && meData.workspaces.length > 0) {
        const savedWsId = localStorage.getItem('dineai_workspace_id');
        const activeWs = meData.workspaces.find((w: any) => w.workspace_id.toString() === savedWsId) || meData.workspaces[0];
        localStorage.setItem('dineai_workspace_id', activeWs.workspace_id.toString());
        setRole(activeWs.role);
        
        // Fetch full workspace details
        const fullWs = await api.getCurrentWorkspace();
        setWorkspace(fullWs);
      }
    } catch (err) {
      console.warn('Session expired or invalid, clearing credentials');
      localStorage.removeItem('dineai_token');
      localStorage.removeItem('dineai_workspace_id');
      setToken(null);
      setUser(null);
      setWorkspace(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const data = await api.login(credentials);
    localStorage.setItem('dineai_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);

    if (data.workspace) {
      localStorage.setItem('dineai_workspace_id', data.workspace.id.toString());
      setRole(data.workspace.role);
      const fullWs = await api.getCurrentWorkspace();
      setWorkspace(fullWs);
    }
  };

  const register = async (formData: any) => {
    const data = await api.register(formData);
    localStorage.setItem('dineai_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);

    if (data.workspace) {
      localStorage.setItem('dineai_workspace_id', data.workspace.id.toString());
      setRole(data.workspace.role);
      const fullWs = await api.getCurrentWorkspace();
      setWorkspace(fullWs);
    }
  };

  const logout = () => {
    localStorage.removeItem('dineai_token');
    localStorage.removeItem('dineai_workspace_id');
    setToken(null);
    setUser(null);
    setWorkspace(null);
    setRole('STAFF');
  };

  const refreshWorkspace = async () => {
    try {
      const fullWs = await api.getCurrentWorkspace();
      setWorkspace(fullWs);
    } catch (e) {
      console.error('Failed to refresh workspace details', e);
    }
  };

  const loginAsDemo = async () => {
    try {
      await login({ email: 'owner@dineai.com', password: 'DineAI@2026' });
    } catch {
      await login({ email: 'owner@royalsaffron.com', password: 'RoyalPass123!' });
    }
  };

  const isDemoMode = Boolean(workspace?.settings?.demo_mode);

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        token,
        role,
        isLoading,
        isDemoMode,
        login,
        loginAsDemo,
        register,
        logout,
        refreshWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
