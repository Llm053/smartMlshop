// Configuration WhatsApp pour les commandes
export const WHATSAPP_CONFIG = {
  // Numéro de téléphone de l'administrateur (format international sans +)
  ADMIN_PHONE: '701234567', // Remplacez par le vrai numéro
  
  // Message par défaut
  DEFAULT_MESSAGE: 'Bonjour ! J\'ai une nouvelle commande à traiter.',
  
  // Format du numéro (ajustez selon votre pays)
  PHONE_FORMAT: {
    countryCode: '223', // Code pays (Sénégal)
    format: 'XXXXXXXXX' // Format attendu
  }
};

// Fonction pour formater le numéro de téléphone
export const formatPhoneNumber = (phone) => {
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Si le numéro commence par 0, le supprimer
  if (cleaned.startsWith('0')) {
    return cleaned.substring(1);
  }
  
  // Si le numéro commence par le code pays, le supprimer
  if (cleaned.startsWith(WHATSAPP_CONFIG.PHONE_FORMAT.countryCode)) {
    return cleaned.substring(3);
  }
  
  // Retourner le numéro tel quel
  return cleaned;
};

// Fonction pour créer le lien WhatsApp
export const createWhatsAppLink = (phone, message) => {
  // Si c'est un email, on l'utilise tel quel (pour les tests)
  // En production, vous devriez avoir le numéro de téléphone de l'admin
  let formattedPhone;
  
  if (phone.includes('@')) {
    // Si c'est un email, utiliser un numéro par défaut ou extraire le numéro
    formattedPhone = WHATSAPP_CONFIG.ADMIN_PHONE;
  } else {
    formattedPhone = formatPhoneNumber(phone);
  }
  
  // Ajouter l'indicatif du Sénégal (221) au numéro formaté
  const phoneWithCountryCode = WHATSAPP_CONFIG.PHONE_FORMAT.countryCode + formattedPhone;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneWithCountryCode}?text=${encodedMessage}`;
};
