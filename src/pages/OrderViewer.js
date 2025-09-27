import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Table } from 'react-bootstrap';
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiClock, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { formatPrice } from '../utils/currency';
import { useCompany } from '../contexts/CompanyContext';
import DeveloperFooter from '../components/DeveloperFooter';
import './OrderViewer.css';

const OrderViewer = () => {
  const { companyInfo } = useCompany();
  const [orderNumber, setOrderNumber] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Fonction pour chercher la commande (avec loading)
  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      setError('Veuillez entrer un numéro de commande');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setOrderData(null);

      // Appel à l'API pour chercher la commande
      const response = await fetch(`/api/orders/track/${orderNumber}`);
      const data = await response.json();

      if (data.success) {
        setOrderData(data.data);
        setLastRefresh(new Date());
        
        // Démarrer l'auto-refresh quand une commande est trouvée
        startAutoRefresh();
      } else {
        setError(data.message || 'Commande non trouvée');
        stopAutoRefresh();
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setError('Erreur lors de la recherche de la commande');
      stopAutoRefresh();
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir silencieusement (sans loading)
  const refreshOrderData = async () => {
    if (!orderNumber.trim()) return;

    try {
      const response = await fetch(`/api/orders/track/${orderNumber}`);
      const data = await response.json();

      if (data.success) {
        setOrderData(data.data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Erreur lors du refresh:', error);
      // Ne pas afficher l'erreur pour le refresh silencieux
    }
  };

  // Démarrer l'auto-refresh
  const startAutoRefresh = () => {
    stopAutoRefresh(); // Nettoyer l'ancien interval
    intervalRef.current = setInterval(refreshOrderData, 5000); // 5 secondes
  };

  // Arrêter l'auto-refresh
  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup à la fermeture du composant
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'warning', text: 'En attente', icon: FiClock },
      'validated': { bg: 'info', text: 'Validée', icon: FiCheckCircle },
      'delivered': { bg: 'success', text: 'Livrée', icon: FiTruck },
      'cancelled': { bg: 'danger', text: 'Annulée', icon: FiPackage }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    const IconComponent = config.icon;

    return (
      <Badge bg={config.bg} className="status-badge">
        <IconComponent className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-viewer-page">
      {/* Header */}
      <div className="order-viewer-header">
        <Container>
          <Row>
            <Col>
              <div className="text-center">
                <FiPackage size={48} className="header-icon mb-3" />
                <h2 className="header-title">Suivi de Commande</h2>
                <p className="header-subtitle">
                  Entrez votre numéro de commande pour suivre son statut
                </p>
                {lastRefresh && (
                  <small className="text-muted" style={{fontSize: '0.8rem'}}>
                    Dernière mise à jour: {lastRefresh.toLocaleTimeString('fr-FR')}
                  </small>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        {/* Search Section */}
        <Row className="justify-content-center mb-5">
          <Col md={8} lg={6}>
            <Card className="search-card">
              <Card.Body>
                <Form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                  <Form.Group className="mb-3">
                    <Form.Label>Numéro de commande</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ex: CMD-20250120-001"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="search-input"
                    />
                    <Form.Text className="text-muted">
                      Le numéro de commande vous a été envoyé après votre commande
                    </Form.Text>
                  </Form.Group>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 search-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Recherche...
                      </>
                    ) : (
                      <>
                        <FiSearch className="me-2" />
                        Rechercher ma commande
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Error Message */}
        {error && (
          <Row className="justify-content-center mb-4">
            <Col md={8}>
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Order Details */}
        {orderData && (
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              <Card className="order-details-card">
                <Card.Header className="order-header">
                  <Row className="align-items-center">
                    <Col>
                      <h5 className="mb-0">
                        Commande {orderData.numero_commande || `#${orderData.id}`}
                      </h5>
                      <small className="text-muted">
                        Passée le {formatDate(orderData.created_at)}
                      </small>
                    </Col>
                    <Col xs="auto">
                      {getStatusBadge(orderData.status)}
                    </Col>
                  </Row>
                </Card.Header>

                <Card.Body>
                  <Row>
                    {/* Customer Info */}
                    <Col md={6} className="mb-4">
                      <h6 className="section-title">
                        <FiPackage className="me-2" />
                        Informations de livraison
                      </h6>
                      <div className="customer-info">
                        <div className="info-item">
                          <strong>{orderData.customer_name}</strong>
                        </div>
                        {orderData.customer_phone && (
                          <div className="info-item">
                            <FiPhone size={14} className="me-2" />
                            {orderData.customer_phone}
                          </div>
                        )}
                        {orderData.customer_email && (
                          <div className="info-item">
                            <FiMail size={14} className="me-2" />
                            {orderData.customer_email}
                          </div>
                        )}
                        {orderData.customer_address && (
                          <div className="info-item">
                            <FiMapPin size={14} className="me-2" />
                            {orderData.customer_address}
                          </div>
                        )}
                        {orderData.customer_city && (
                          <div className="info-item">
                            <strong>Ville:</strong> {orderData.customer_city}
                          </div>
                        )}
                      </div>
                    </Col>

                    {/* Order Timeline */}
                    <Col md={6} className="mb-4">
                      <h6 className="section-title">
                        <FiClock className="me-2" />
                        Suivi de la commande
                      </h6>
                      <div className="timeline">
                        <div className={`timeline-item ${orderData.created_at ? 'completed' : ''}`}>
                          <div className="timeline-marker"></div>
                          <div className="timeline-content">
                            <strong>Commande passée</strong>
                            <small>{formatDate(orderData.created_at)}</small>
                          </div>
                        </div>
                        
                        <div className={`timeline-item ${orderData.status !== 'pending' ? 'completed' : ''}`}>
                          <div className="timeline-marker"></div>
                          <div className="timeline-content">
                            <strong>Commande validée</strong>
                            <small>
                              {orderData.status !== 'pending' ? 'Validée' : 'En attente'}
                            </small>
                          </div>
                        </div>
                        
                        <div className={`timeline-item ${orderData.status === 'delivered' ? 'completed' : ''}`}>
                          <div className="timeline-marker"></div>
                          <div className="timeline-content">
                            <strong>Livrée</strong>
                            <small>
                              {orderData.delivery_date ? formatDate(orderData.delivery_date) : 'En cours'}
                            </small>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* Order Items */}
                  <h6 className="section-title">
                    <FiPackage className="me-2" />
                    Articles commandés
                  </h6>
                  
                  <Table responsive className="order-items-table">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderData.items?.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{item.product_name || item.name}</strong>
                          </td>
                          <td>{item.quantity}</td>
                          <td>{formatPrice(item.unit_price || item.price)}</td>
                          <td>
                            <strong>
                              {formatPrice((item.unit_price || item.price) * item.quantity)}
                            </strong>
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            Aucun article trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="total-row">
                        <td colSpan="3" className="text-end">
                          <strong>Total de la commande</strong>
                        </td>
                        <td>
                          <strong className="total-amount">
                            {formatPrice(orderData.total_amount)}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </Table>

                  {/* Notes */}
                  {orderData.notes && (
                    <div className="mt-4">
                      <h6 className="section-title">Notes</h6>
                      <p className="notes-text">{orderData.notes}</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Help Section */}
        <Row className="justify-content-center mt-5">
          <Col md={8}>
            <Card className="help-card">
              <Card.Body className="text-center">
                <h6>Besoin d'aide ?</h6>
                <p className="mb-3">
                  Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.
                </p>
                <div className="contact-info">
                  <span className="me-4">
                    <FiPhone className="me-1" />
                    {companyInfo.phone}
                  </span>
                  <span>
                    <FiMail className="me-1" />
                    {companyInfo.email}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Developer Footer */}
      <DeveloperFooter />
    </div>
  );
};

export default OrderViewer;