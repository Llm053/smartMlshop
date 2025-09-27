import React from 'react';
import { Modal, Button, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { FiX, FiPrinter, FiUser, FiPhone, FiMail, FiMapPin, FiCalendar } from 'react-icons/fi';
import { formatPrice, formatDate } from '../utils/currency';
import './SimpleInvoice.css';

const SimpleInvoice = ({ show, onHide, sale }) => {
  if (!sale) return null;

  const handlePrint = () => {
    // Optimiser pour l'impression d'une seule page
    const printWindow = window.open('', '_blank');
    const printContent = document.getElementById('invoice-print-area').innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture #${sale.id || 'N/A'}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            @page { 
              size: A4; 
              margin: 0.5cm; 
            }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 12px; 
              line-height: 1.2; 
              margin: 0; 
              padding: 10px;
            }
            .invoice-container { 
              max-width: 100%; 
              margin: 0; 
              padding: 0;
            }
            .company-name { font-size: 16px; margin-bottom: 2px; }
            .company-details { font-size: 10px; }
            .invoice-title { font-size: 14px; margin-bottom: 5px; }
            .invoice-meta { font-size: 10px; }
            .section-title { font-size: 12px; margin-bottom: 5px; }
            .client-info { padding: 8px; background-color: #f8f8f8; border: 1px solid #ddd; margin-bottom: 10px; }
            .client-details div { font-size: 10px; margin-bottom: 2px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th, td { padding: 4px; border: 1px solid #ddd; }
            th { background-color: #333; color: white; }
            .total-row td { background-color: #f0f0f0; font-weight: bold; }
            .invoice-footer { margin-top: 10px; padding-top: 8px; border-top: 1px solid #ccc; font-size: 9px; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const calculateTotal = () => {
    if (!sale.items || !Array.isArray(sale.items)) return sale.total_amount || 0;
    return sale.items.reduce((sum, item) => {
      const price = item.price || item.unit_price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered
      className="simple-invoice-modal"
    >
      <Modal.Header className="invoice-modal-header">
        <Modal.Title>
          📄 Détails de la Vente #{sale.id}
        </Modal.Title>
        <div className="header-actions">
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={handlePrint}
            className="print-btn me-2"
          >
            <FiPrinter className="me-1" />
            Imprimer
          </Button>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={onHide}
          >
            <FiX />
          </Button>
        </div>
      </Modal.Header>
      
      <Modal.Body className="p-0" id="invoice-print-area">
        <div className="invoice-container">
          {/* En-tête compact */}
          <Row className="header-row">
            <Col md={7}>
              <div className="company-info">
                <h4 className="company-name">STOCK MANAGEMENT MALI</h4>
                <div className="company-details">
                  Bamako, Mali | +223 70 XX XX XX | contact@stockmanagement.ml
                </div>
              </div>
            </Col>
            <Col md={5} className="text-end">
              <div className="invoice-info">
                <h5 className="invoice-title">FACTURE #{sale.id || 'N/A'}</h5>
                <div className="invoice-meta">
                  <div><strong>Date:</strong> {sale.created_at ? formatDate(sale.created_at) : 'N/A'}</div>
                  <div><strong>Vendeur:</strong> {sale.created_by_name || 'Système'}</div>
                  <Badge bg={sale.sale_type === 'in_store' ? 'success' : 'info'}>
                    {sale.sale_type === 'in_store' ? '🏪 Magasin' : '🌐 En ligne'}
                  </Badge>
                </div>
              </div>
            </Col>
          </Row>

          <hr className="section-divider" />

          {/* Client et Articles en une section */}
          <Row>
            <Col md={5}>
              <div className="client-info">
                <h6 className="section-title">👤 Client</h6>
                <div className="client-details">
                  <div><strong>{sale.customer_name || 'Non spécifié'}</strong></div>
                  {sale.customer_phone && <div>📞 {sale.customer_phone}</div>}
                  {sale.customer_email && <div>📧 {sale.customer_email}</div>}
                  {sale.customer_address && <div>📍 {sale.customer_address}</div>}
                  {sale.customer_city && <div>🏙️ {sale.customer_city}</div>}
                </div>
              </div>
            </Col>
            <Col md={7}>
              <h6 className="section-title">📦 Articles</h6>
              <Table size="sm" className="items-table-compact">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Qté</th>
                    <th>Prix</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items && sale.items.length > 0 ? sale.items.map((item, index) => {
                    const price = parseFloat(item.price || item.unit_price || 0);
                    const quantity = parseInt(item.quantity || 1);
                    const productName = item.product_name || item.name || 'Produit';
                    
                    return (
                      <tr key={index}>
                        <td><strong>{productName}</strong></td>
                        <td className="text-center">{quantity}</td>
                        <td className="text-end">{formatPrice(price)}</td>
                        <td className="text-end"><strong>{formatPrice(quantity * price)}</strong></td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">Aucun article</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan="3" className="text-end"><strong>TOTAL</strong></td>
                    <td className="text-end">
                      <strong className="total-amount">
                        {formatPrice(sale.total_amount || calculateTotal())}
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </Col>
          </Row>


          {/* Pied de page simplifié */}
          <div className="invoice-footer">
            <div className="text-center">
              <small className="text-muted">
                <strong>Merci pour votre confiance !</strong><br />
                Service client: +223 70 XX XX XX | contact@stockmanagement.ml
              </small>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SimpleInvoice;
