// Utilitaires pour générer des numéros de commandes et ventes

// Générer un numéro de commande (CMD-YYYYMMDD-XXX)
export const generateOrderNumber = (id, date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const sequence = String(id).padStart(3, '0');
  
  return `CMD-${year}${month}${day}-${sequence}`;
};

// Générer un numéro de vente (VTE-YYYYMMDD-XXX)
export const generateSaleNumber = (id, date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const sequence = String(id).padStart(3, '0');
  
  return `VTE-${year}${month}${day}-${sequence}`;
};

// Extraire l'ID depuis un numéro de commande/vente
export const extractIdFromNumber = (orderNumber) => {
  if (!orderNumber) return null;
  const parts = orderNumber.split('-');
  if (parts.length !== 3) return null;
  return parseInt(parts[2]);
};

// Valider un numéro de commande
export const isValidOrderNumber = (orderNumber) => {
  if (!orderNumber) return false;
  const pattern = /^(CMD|VTE)-\d{8}-\d{3}$/;
  return pattern.test(orderNumber);
};

// Formater la date pour les numéros
export const formatDateForNumber = (dateString) => {
  if (!dateString) return new Date();
  return new Date(dateString);
};
