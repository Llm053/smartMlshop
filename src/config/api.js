// Configuration de l'API
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Fonction pour tester la connexion à l'API
export const testApiConnection = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/api/test`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API accessible:', data);
      return true;
    } else {
      console.error('❌ API non accessible:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur de connexion API:', error);
    return false;
  }
};

export default API_CONFIG;
