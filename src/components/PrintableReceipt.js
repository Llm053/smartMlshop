import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiPrinter, FiX } from 'react-icons/fi';
import { formatPrice, formatDate } from '../utils/currency';
import './PrintableReceipt.css';

const PrintableReceipt = ({ show, onHide, sale }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const calculateSubtotal = () => {
    if (!sale.items || !Array.isArray(sale.items)) return sale.total_amount || 0;
    return sale.items.reduce((sum, item) => {
      const price = item.price || item.unit_price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  };

  const formatReceiptDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="sm" 
      centered
      className="receipt-modal"
    >
      <Modal.Header className="receipt-modal-header">
        <Modal.Title className="receipt-modal-title">
          <FiPrinter className="me-2" />
          Facture #{sale.id}
        </Modal.Title>
        <Button 
          variant="link" 
          onClick={onHide}
          className="receipt-close-btn"
        >
          <FiX size={20} />
        </Button>
      </Modal.Header>
      
      <Modal.Body className="p-0">
        <div className="receipt-container" id="receipt-content">
          {/* En-tête du magasin */}
          <div className="receipt-header">
            <div className="store-name">STOCK MANAGEMENT MALI</div>
            <div className="store-info">
              <div>Système de Gestion</div>
              <div>Tél: +223 70 XX XX XX</div>
              <div>Email: contact@stockmanagement.ml</div>
              <div>Bamako, Mali</div>
            </div>
          </div>

          <div className="receipt-divider">================================</div>

          {/* Informations de la vente */}
          <div className="sale-info">
            <div className="sale-row">
              <span className="label">Facture N°:</span>
              <span className="value">#{sale.id || 'N/A'}</span>
            </div>
            <div className="sale-row">
              <span className="label">Date:</span>
              <span className="value">{sale.created_at ? formatReceiptDate(sale.created_at) : 'N/A'}</span>
            </div>
            <div className="sale-row">
              <span className="label">Vendeur:</span>
              <span className="value">{sale.created_by_name || 'Admin'}</span>
            </div>
          </div>

          <div className="receipt-divider">--------------------------------</div>

          {/* Informations client */}
          <div className="customer-info">
            <div className="section-title">CLIENT</div>
            <div className="customer-details">
              <div>{sale.customer_name || 'Client non spécifié'}</div>
              {sale.customer_phone && <div>Tél: {sale.customer_phone}</div>}
              {sale.customer_email && <div>Email: {sale.customer_email}</div>}
              {sale.customer_address && <div>Adresse: {sale.customer_address}</div>}
              {sale.customer_city && <div>Ville: {sale.customer_city}</div>}
            </div>
          </div>

          <div className="receipt-divider">--------------------------------</div>

          {/* Articles */}
          <div className="items-section">
            <div className="section-title">ARTICLES</div>
            <div className="items-header">
              <span className="item-name">Article</span>
              <span className="item-qty">Qté</span>
              <span className="item-price">Prix</span>
              <span className="item-total">Total</span>
            </div>
            
            {sale.items && sale.items.length > 0 ? sale.items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="item-name">{item.product_name || item.name || 'Produit'}</div>
                <div className="item-details">
                  <span className="item-qty">{item.quantity || 1}</span>
                  <span className="item-price">{formatPrice(item.price || item.unit_price || 0)}</span>
                  <span className="item-total">{formatPrice((item.price || item.unit_price || 0) * (item.quantity || 1))}</span>
                </div>
              </div>
            )) : (
              <div className="item-row">
                <div className="item-name">Aucun article trouvé</div>
              </div>
            )}
          </div>

          <div className="receipt-divider">--------------------------------</div>

          {/* Totaux */}
          <div className="totals-section">
            <div className="total-row">
              <span className="label">Sous-total:</span>
              <span className="value">{formatPrice(calculateSubtotal())}</span>
            </div>
            <div className="total-row">
              <span className="label">TVA (0%):</span>
              <span className="value">{formatPrice(0)}</span>
            </div>
            <div className="total-row total-final">
              <span className="label">TOTAL:</span>
              <span className="value">{formatPrice(sale.total_amount)}</span>
            </div>
          </div>

          <div className="receipt-divider">================================</div>

          {/* Pied de page */}
          <div className="receipt-footer">
            <div className="footer-message">
              Merci pour votre achat !
            </div>
            <div className="footer-info">
              <div>Échange possible sous 7 jours</div>
              <div>sur présentation de cette facture</div>
            </div>
            <div className="footer-contact">
              Service client: +223 70 XX XX XX
            </div>
          </div>

          {/* Code-barres simulé */}
          <div className="barcode">
            <div className="barcode-lines">
              |||||| |||| | ||| |||| |||||| | |||| | |||
            </div>
            <div className="barcode-number">#{(sale.id || 0).toString().padStart(8, '0')}</div>
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="receipt-modal-footer">
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          <FiPrinter className="me-2" />
          Imprimer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrintableReceipt;
