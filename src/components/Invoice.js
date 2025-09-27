import React from 'react';
import './Invoice.css';

const Invoice = ({ sale, onClose }) => {
  if (!sale) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-modal">
      <div className="invoice-content">
        <div className="invoice-header">
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
          <h2>Détails de la Vente #{sale.id}</h2>
        </div>

        <div className="invoice-body">
          {/* En-tête de la facture */}
          <div className="invoice-info">
            <div className="company-info">
              <h3>STOCK MANAGEMENT MALI</h3>
              <p>Système de Gestion de Stock</p>
              <p>Bamako, Mali</p>
              <p>Tél: +223 70 XX XX XX</p>
              <p>Email: contact@stockmanagement.ml</p>
            </div>
            
            <div className="invoice-details">
              <h4>FACTURE</h4>
              <p><strong>N°:</strong> #{sale.id}</p>
              <p><strong>Date:</strong> {sale.created_at ? formatDate(sale.created_at) : 'N/A'}</p>
              <p><strong>Type:</strong> {sale.sale_type === 'in_store' ? '🏪 Magasin' : '🌐 En ligne'}</p>
              <p><strong>Vendeur:</strong> {sale.created_by_name || 'Système'}</p>
            </div>
          </div>

          {/* Informations client */}
          <div className="customer-info">
            <h4>Informations Client:</h4>
            <p><strong>Nom:</strong> {sale.customer_name || 'Non spécifié'}</p>
            {sale.customer_phone && <p><strong>Téléphone:</strong> {sale.customer_phone}</p>}
            {sale.customer_email && <p><strong>Email:</strong> {sale.customer_email}</p>}
            {sale.customer_address && <p><strong>Adresse:</strong> {sale.customer_address}</p>}
            {sale.customer_city && <p><strong>Ville:</strong> {sale.customer_city}</p>}
          </div>

          {/* Articles */}
          <div className="invoice-items">
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items && sale.items.length > 0 ? sale.items.map((item, index) => {
                  const price = item.price || item.unit_price || 0;
                  const quantity = item.quantity || 1;
                  const productName = item.product_name || item.name || 'Produit';
                  
                  return (
                    <tr key={index}>
                      <td>{productName}</td>
                      <td>{quantity}</td>
                      <td>{formatCurrency(price)}</td>
                      <td>{formatCurrency(quantity * price)}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      Aucun article trouvé
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan="3"><strong>TOTAL</strong></td>
                  <td><strong>{formatCurrency(sale.total_amount || 0)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {sale.notes && (
            <div className="invoice-notes">
              <h4>Notes:</h4>
              <p>{sale.notes}</p>
            </div>
          )}

          {/* Pied de page */}
          <div className="invoice-footer">
            <p>Merci pour votre achat !</p>
            <p>Statut: <span className={`status ${sale.status}`}>{sale.status}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
