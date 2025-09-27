import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Form, 
  InputGroup, 
  Badge, 
  Modal, 
  Alert,
  Spinner,
  Dropdown 
} from 'react-bootstrap';
import { 
  FiGlobe, 
  FiCheck, 
  FiX, 
  FiSearch, 
  FiFilter, 
  FiEye,
  FiCalendar,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiPackage,
  FiCheckCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { orderService } from '../services/api';
import { formatPrice, formatDate } from '../utils/currency';
import PrintableReceipt from '../components/PrintableReceipt';
import './OnlineOrders.css';

const OnlineOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadOrders();
    
    // Actualisation automatique toutes les 10 secondes
    const interval = setInterval(() => {
      loadOrders();
      setLastRefresh(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      const ordersData = response.data?.data?.orders || [];
      setOrders(ordersData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      toast.error('Erreur lors du chargement des commandes en ligne');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)
      );
    }

    // Filtrer par statut
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filtrer par date
    if (dateFilter) {
      filtered = filtered.filter(order =>
        new Date(order.created_at).toDateString() === new Date(dateFilter).toDateString()
      );
    }

    setFilteredOrders(filtered);
  };

  const handleValidateOrder = async (orderId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir valider cette commande ? Elle sera transférée vers les ventes.')) {
      return;
    }

    setProcessingId(orderId);
    try {
      await orderService.validate(orderId);
      toast.success('Commande validée et transférée vers les ventes !');
      await loadOrders();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      const message = error.response?.data?.message || 'Erreur lors de la validation de la commande';
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }

    setProcessingId(orderId);
    try {
      await orderService.cancel(orderId);
      toast.success('Commande annulée avec succès');
      await loadOrders();
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      const message = error.response?.data?.message || 'Erreur lors de l\'annulation de la commande';
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      setProcessingId(orderId);
      
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Commande ${newStatus === 'validated' ? 'validée' : 'mise à jour'} avec succès`);
        loadOrders();
      } else {
        toast.error(data.message || 'Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Erreur lors du changement de statut');
    } finally {
      setProcessingId(null);
    }
  };

  const viewOrderDetails = async (order) => {
    try {
      const response = await orderService.getById(order.id);
      const orderData = response.data?.data?.order || response.data?.order;
      setSelectedOrder(orderData);
      setShowDetails(true);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      toast.error('Erreur lors du chargement des détails de la commande');
    }
  };

  const viewReceipt = async (order) => {
    try {
      const response = await orderService.getById(order.id);
      const orderData = response.data?.data?.order || response.data?.order;
      setSelectedOrder(orderData);
      setShowReceipt(true);
    } catch (error) {
      console.error('Erreur lors du chargement de la facture:', error);
      toast.error('Erreur lors du chargement de la facture');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning" className="status-badge">⏳ En attente</Badge>;
      case 'completed':
        return <Badge bg="success" className="status-badge">✅ Validée</Badge>;
      case 'cancelled':
        return <Badge bg="danger" className="status-badge">❌ Annulée</Badge>;
      default:
        return <Badge bg="secondary" className="status-badge">{status}</Badge>;
    }
  };

  const getPendingCount = () => orders.filter(o => o.status === 'pending').length;
  const getTotalValue = () => filteredOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="page-title">
                <FiGlobe className="me-2" />
                Commandes en Ligne
              </h2>
              <p className="text-muted">
                Gérez les commandes passées via le site web
                <br />
                <small className="text-info">
                  🔄 Actualisation automatique • Dernière mise à jour : {lastRefresh.toLocaleTimeString('fr-FR')}
                </small>
              </p>
            </div>
            <div className="stats-cards d-flex gap-3">
              <Card className="stat-card text-center">
                <Card.Body className="py-2">
                  <div className="stat-number text-warning">{getPendingCount()}</div>
                  <div className="stat-label">En attente</div>
                </Card.Body>
              </Card>
              <Card className="stat-card text-center">
                <Card.Body className="py-2">
                  <div className="stat-number text-success">{formatPrice(getTotalValue())}</div>
                  <div className="stat-label">Valeur totale</div>
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* Filtres */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FiFilter className="me-2" />
                Filtres et Recherche
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Recherche</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FiSearch />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Client, téléphone, email, ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Statut</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">Tous les statuts</option>
                      <option value="pending">⏳ En attente</option>
                      <option value="validated">✅ Validées (faisabilité confirmée)</option>
                      <option value="delivered">🚚 Livrées</option>
                      <option value="cancelled">❌ Annulées</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Liste des commandes */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                Commandes en Ligne ({filteredOrders.length} résultat{filteredOrders.length !== 1 ? 's' : ''})
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Chargement des commandes...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-5">
                  <FiGlobe size={48} className="text-muted mb-3" />
                  <p className="text-muted">
                    {statusFilter === 'pending' 
                      ? 'Aucune commande en attente' 
                      : 'Aucune commande trouvée'
                    }
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="orders-table">
                    <thead className="table-dark">
                      <tr>
                        <th>Numéro Commande</th>
                        <th>Client</th>
                        <th>Contact</th>
                        <th>Montant</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className={`order-row ${order.status}`}>
                          <td>
                            <strong className="order-id">{order.numero_commande || `#${order.id}`}</strong>
                          </td>
                          <td>
                            <div className="customer-info">
                              <strong className="customer-name">{order.customer_name}</strong>
                              {order.customer_email && (
                                <div className="customer-email">
                                  <FiMail size={12} className="me-1" />
                                  <small className="text-muted">{order.customer_email}</small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="contact-info">
                              {order.customer_phone && (
                                <div className="phone">
                                  <FiPhone size={12} className="me-1" />
                                  {order.customer_phone}
                                </div>
                              )}
                              {order.customer_address && (
                                <div className="address">
                                  <FiMapPin size={12} className="me-1" />
                                  <small className="text-muted">{order.customer_address}</small>
                                </div>
                              )}
                              {order.customer_city && order.customer_city !== 'Non spécifiée' && (
                                <div className="city">
                                  <small className="text-info">{order.customer_city}</small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <strong className="amount text-success">
                              {formatPrice(order.total_amount)}
                            </strong>
                          </td>
                          <td>
                            <div className="order-date">
                              <FiCalendar size={12} className="me-1" />
                              <small>{formatDate(order.created_at)}</small>
                            </div>
                          </td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle 
                                variant={order.status === 'pending' ? 'warning' : order.status === 'validated' ? 'success' : 'secondary'}
                                size="sm"
                                disabled={processingId === order.id}
                              >
                                {order.status === 'pending' && '⏳ En attente'}
                                {order.status === 'validated' && '✅ Validée'}
                                {order.status === 'cancelled' && '❌ Annulée'}
                                {order.status === 'delivered' && '🚚 Livrée'}
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                {order.status === 'pending' && (
                                  <Dropdown.Item 
                                    onClick={() => handleChangeStatus(order.id, 'validated')}
                                    disabled={processingId === order.id}
                                  >
                                    ✅ Valider (confirmer faisabilité)
                                  </Dropdown.Item>
                                )}
                                {(order.status === 'pending' || order.status === 'validated') && order.status !== 'delivered' && (
                                  <Dropdown.Item 
                                    onClick={() => handleCancelOrder(order.id)}
                                    disabled={processingId === order.id}
                                    className="text-danger"
                                  >
                                    ❌ Annuler
                                  </Dropdown.Item>
                                )}
                                {order.status === 'delivered' && (
                                  <Dropdown.Item disabled className="text-success">
                                    ✅ Commande livrée (non modifiable)
                                  </Dropdown.Item>
                                )}
                                {order.status === 'validated' && (
                                  <Dropdown.Item disabled className="text-muted">
                                    🚚 Prête pour livraison
                                  </Dropdown.Item>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                          <td>
                            <div className="action-buttons d-flex gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => viewOrderDetails(order)}
                                title="Voir les détails"
                              >
                                <FiEye size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal des détails de commande */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiPackage className="me-2" />
            Détails de la Commande #{selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <Row>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Header>
                    <h6 className="mb-0">
                      <FiUser className="me-2" />
                      Informations Client
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="client-details">
                      <div className="detail-row">
                        <strong>Nom:</strong> {selectedOrder.customer_name}
                      </div>
                      {selectedOrder.customer_phone && (
                        <div className="detail-row">
                          <FiPhone size={14} className="me-1" />
                          <strong>Téléphone:</strong> {selectedOrder.customer_phone}
                        </div>
                      )}
                      {selectedOrder.customer_email && (
                        <div className="detail-row">
                          <FiMail size={14} className="me-1" />
                          <strong>Email:</strong> {selectedOrder.customer_email}
                        </div>
                      )}
                      {selectedOrder.customer_address && (
                        <div className="detail-row">
                          <FiMapPin size={14} className="me-1" />
                          <strong>Adresse:</strong> {selectedOrder.customer_address}
                        </div>
                      )}
                      {selectedOrder.customer_city && (
                        <div className="detail-row">
                          <strong>Ville:</strong> {selectedOrder.customer_city}
                        </div>
                      )}
                      <div className="detail-row">
                        <strong>Paiement:</strong> 
                        <Badge bg="info" className="ms-2">
                          {selectedOrder.payment_method === 'cash_on_delivery' ? '💰 Paiement à la livraison' : selectedOrder.payment_method}
                        </Badge>
                      </div>
                      <div className="detail-row">
                        <FiCalendar size={14} className="me-1" />
                        <strong>Date:</strong> {formatDate(selectedOrder.created_at)}
                      </div>
                      <div className="detail-row">
                        <strong>Statut:</strong> {getStatusBadge(selectedOrder.status)}
                      </div>
                      {selectedOrder.notes && (
                        <div className="detail-row">
                          <strong>Notes:</strong> {selectedOrder.notes}
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Header>
                    <h6 className="mb-0">
                      <FiPackage className="me-2" />
                      Articles Commandés
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <div className="items-list">
                        {selectedOrder.items.map((item, index) => {
                          const price = item.price || item.unit_price || 0;
                          const quantity = item.quantity || 1;
                          const productName = item.product_name || item.name || 'Produit';
                          
                          return (
                            <div key={index} className="item-detail">
                              <div className="item-name">{productName}</div>
                              <div className="item-info">
                                <span className="quantity">{quantity} × {formatPrice(price)}</span>
                                <span className="total">{formatPrice(quantity * price)}</span>
                              </div>
                              {item.description && (
                                <div className="item-description text-muted small">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <hr />
                        <div className="total-section">
                          <strong>Total: {formatPrice(selectedOrder.total_amount)}</strong>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted">Aucun article trouvé</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Fermer
          </Button>
          {selectedOrder && selectedOrder.status === 'pending' && (
            <>
              <Button 
                variant="success" 
                onClick={() => {
                  setShowDetails(false);
                  handleValidateOrder(selectedOrder.id);
                }}
              >
                <FiCheck className="me-2" />
                Valider
              </Button>
              <Button 
                variant="danger" 
                onClick={() => {
                  setShowDetails(false);
                  handleCancelOrder(selectedOrder.id);
                }}
              >
                <FiX className="me-2" />
                Annuler
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal de facture imprimable */}
      <PrintableReceipt
        show={showReceipt}
        onHide={() => {
          setShowReceipt(false);
          setSelectedOrder(null);
        }}
        sale={selectedOrder}
      />
    </Container>
  );
};

export default OnlineOrders;
