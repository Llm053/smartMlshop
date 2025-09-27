import React, { createContext, useContext, useState, useEffect } from 'react';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'STOCK SHOP MALI',
    phone: '+223 70 XX XX XX',
    email: 'contact@stockshop.ml',
    address: 'Bamako, Mali',
    website: 'www.stockshop.ml',
    description: 'Votre partenaire de confiance pour tous vos besoins en électronique et accessoires',
    logo: null
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
      setLoading(true);
      
      // Charger depuis l'API
      const response = await fetch('/api/company/public-info');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCompanyInfo(data.data);
          // Sauvegarder localement pour cache
          localStorage.setItem('company_info', JSON.stringify(data.data));
          return;
        }
      }
      
      // Fallback: charger depuis localStorage
      const savedInfo = localStorage.getItem('company_info');
      if (savedInfo) {
        const parsedInfo = JSON.parse(savedInfo);
        setCompanyInfo(prev => ({ ...prev, ...parsedInfo }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des infos entreprise:', error);
      // Utiliser les valeurs par défaut en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyInfo = async (newInfo) => {
    try {
      const updatedInfo = { ...companyInfo, ...newInfo };
      
      // Sauvegarder via API
      const response = await fetch('/api/company/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedInfo)
      });

      const data = await response.json();

      if (data.success) {
        setCompanyInfo(data.data);
        localStorage.setItem('company_info', JSON.stringify(data.data));
        
        // Émettre un événement pour notifier les autres composants
        window.dispatchEvent(new CustomEvent('companyInfoUpdated', {
          detail: data.data
        }));
        
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      
      // Sauvegarder localement en cas d'erreur API
      const updatedInfo = { ...companyInfo, ...newInfo };
      setCompanyInfo(updatedInfo);
      localStorage.setItem('company_info', JSON.stringify(updatedInfo));
      
      window.dispatchEvent(new CustomEvent('companyInfoUpdated', {
        detail: updatedInfo
      }));
      
      return { success: false, error: error.message };
    }
  };

  const value = {
    companyInfo,
    loading,
    updateCompanyInfo,
    refreshCompanyInfo: loadCompanyInfo
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};
