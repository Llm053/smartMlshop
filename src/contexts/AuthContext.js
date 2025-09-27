import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Vérifier la validité du token
      api.get('/auth/profile')
        .then(response => {
          const user = response.data?.data?.user || response.data?.user;
          if (user) {
            setUser(user);
          } else {
            throw new Error('Structure de réponse invalide');
          }
        })
        .catch(error => {
          console.error('Token invalide:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data?.data || response.data;
      const { token, user } = data;
      
      if (!token || !user) {
        throw new Error('Structure de réponse invalide');
      }
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      toast.success('Connexion réussie !');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Erreur de connexion';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const data = response.data?.data || response.data;
      const { token, user } = data;
      
      if (!token || !user) {
        throw new Error('Structure de réponse invalide');
      }
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      toast.success('Inscription réussie !');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Erreur d\'inscription';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.info('Déconnexion réussie');
  };

  // Fonction pour changer le mot de passe
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      toast.success('Mot de passe modifié avec succès !');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors du changement de mot de passe';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Fonction pour mettre à jour le profil
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put(`/users/${user.id}`, profileData);
      setUser(response.data.data.user);
      
      toast.success('Profil mis à jour avec succès !');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour du profil';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
