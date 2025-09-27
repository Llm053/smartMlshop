import api from './api';

const salesService = {
  // Récupérer toutes les ventes
  getAll: async () => {
    return await api.get('/sales');
  },

  // Récupérer une vente avec ses items
  getById: async (id) => {
    return await api.get(`/sales/${id}`);
  },

  // Créer une nouvelle vente
  create: async (saleData) => {
    return await api.post('/sales', saleData);
  },

  // Annuler une vente
  cancel: async (id) => {
    return await api.put(`/sales/${id}/cancel`);
  },

  // Mettre à jour le statut d'une vente
  updateStatus: async (id, status) => {
    return await api.put(`/sales/${id}/status`, { status });
  }
};

export default salesService;
