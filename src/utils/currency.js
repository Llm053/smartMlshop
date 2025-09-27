// Utilitaire pour formater les prix en FCFA (sans décimales)
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '0 FCFA';
  const amount = Math.floor(Number(price)); // Enlever les décimales
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};

export const formatPriceShort = (price) => {
  if (price === null || price === undefined) return '0 F';
  const amount = Math.floor(Number(price)); // Enlever les décimales
  return `${amount.toLocaleString('fr-FR')} F`;
};

export const parsePrice = (priceString) => {
  if (!priceString) return 0;
  return Number(priceString.toString().replace(/[^\d.-]/g, ''));
};

// Alias pour formatCurrency (compatible avec les autres composants)
export const formatCurrency = formatPrice;

// Fonction pour formater les dates
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
