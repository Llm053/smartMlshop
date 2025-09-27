import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Alert, Spinner, Table } from 'react-bootstrap';
import { FiTruck, FiPackage, FiUser, FiLogOut, FiSettings, FiSearch, FiCheckCircle, FiClock, FiMapPin, FiPhone, FiMail, FiDollarSign, FiEdit, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/currency';
import { generateOrderNumber, extractIdFromNumber } from '../utils/orderNumbers';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [deliveryAmount, setDeliveryAmount] = useState('');
  const [processingDelivery, setProcessingDelivery] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    delivered: 0,
    totalEarnings: 0
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
    loadDeliveryStats();
  }, []);

  const loadUserData = () => {
    const userData = localStorage.getItem('delivery_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfileData({
        name: parsedUser.name || '',
        phone: parsedUser.phone || ''
      });
    } else {
      navigate('/delivery/login');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('delivery_token');
      const response = await fetch('/api/delivery/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (data.success) {
        // Mettre à jour les données locales
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem('delivery_user', JSON.stringify(updatedUser));
        
        setEditingProfile(false);
        toast.success('Profil mis à jour avec succès !');
      } else {
        toast.error(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const loadDeliveryStats = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('delivery_token');
      if (!token) {
        navigate('/delivery/login');
        return;
      }

      // Charger seulement les statistiques, pas toutes les commandes
      const response = await fetch('/api/delivery/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        }
      } else {
        // Utiliser des stats par défaut si l'API n'est pas encore implémentée
        setStats({ pending: 0, delivered: 0, totalEarnings: 0 });
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
      // Utiliser des stats par défaut en cas d'erreur
      setStats({ pending: 0, delivered: 0, totalEarnings: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchOrderNumber.trim()) {
      toast.error('Veuillez entrer un numéro de commande');
      return;
    }

    try {
      const token = localStorage.getItem('delivery_token');
      const response = await fetch(`/api/orders/track/${searchOrderNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSelectedOrder(data.data);
        setShowOrderModal(true);
        setSearchOrderNumber('');
        toast.success(`Commande ${data.data.numero_commande} trouvée !`);
      } else {
        toast.error(data.message || 'Commande non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast.error('Erreur lors de la recherche de commande');
    }
  };

  const handleDeliveryComplete = async () => {
    if (!deliveryAmount) {
      toast.error('Veuillez entrer le montant récupéré');
      return;
    }

    if (parseFloat(deliveryAmount) !== parseFloat(selectedOrder.total_amount)) {
      toast.error('Le montant ne correspond pas au total de la commande');
      return;
    }

    try {
      setProcessingDelivery(true);

      const token = localStorage.getItem('delivery_token');
      const response = await fetch(`/api/delivery/orders/${selectedOrder.id}/deliver`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount_received: deliveryAmount })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Livraison confirmée avec succès !');
        setShowOrderModal(false);
        setSelectedOrder(null);
        setDeliveryAmount('');
        loadDeliveryStats(); // Recharger pour mettre à jour les stats
      } else {
        toast.error(data.message || 'Erreur lors de la confirmation');
      }

    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
      toast.error('Erreur lors de la confirmation de livraison');
    } finally {
      setProcessingDelivery(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('delivery_token');
    localStorage.removeItem('delivery_user');
    navigate('/delivery/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="delivery-loading">
        <Spinner animation="border" variant="warning" />
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="delivery-dashboard">
      {/* Header */}
      <div className="delivery-header">
        <Container>
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center">
                <div className="delivery-avatar">
                  <FiUser size={24} />
                </div>
                <div className="ms-3">
                  <h5 className="mb-0">Bonjour {user?.name}</h5>
                  <small className="text-muted">Livreur - Bamako</small>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <div className="d-flex gap-2">
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => setShowProfileModal(true)}
                >
                  <FiSettings className="me-1" />
                  Profil
                </Button>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                >
                  <FiLogOut className="me-1" />
                  Déconnexion
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="stats-card pending-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stats-icon">
                    <FiClock />
                  </div>
                  <div className="ms-3">
                    <h3>{stats.pending}</h3>
                    <p>En attente</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stats-card delivered-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stats-icon">
                    <FiCheckCircle />
                  </div>
                  <div className="ms-3">
                    <h3>{stats.delivered}</h3>
                    <p>Livrées</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stats-card earnings-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stats-icon">
                    <FiDollarSign />
                  </div>
                  <div className="ms-3">
                    <h3>{formatPrice(stats.totalEarnings)}</h3>
                    <p>Gains totaux</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search Section */}
        <Row className="mb-4">
          <Col>
            <Card className="search-card">
              <Card.Body>
                <h5 className="mb-3">
                  <FiSearch className="me-2" />
                  Rechercher une commande
                </h5>
                <Row>
                  <Col md={8}>
                    <Form.Control
                      type="text"
                      placeholder="Entrez le numéro de commande (ex: CMD-20250120-001)"
                      value={searchOrderNumber}
                      onChange={(e) => setSearchOrderNumber(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </Col>
                  <Col md={4}>
                    <Button
                      variant="primary"
                      onClick={handleSearch}
                      className="w-100"
                    >
                      <FiSearch className="me-1" />
                      Rechercher
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Instructions de livraison */}
        <Row>
          <Col>
            <Card className="instructions-card">
              <Card.Header>
                <h5 className="mb-0">
                  <FiPackage className="me-2" />
                  Instructions de livraison
                </h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="info" className="mb-3">
                  <FiTruck className="me-2" />
                  <strong>Mode de fonctionnement :</strong>
                  <br />
                  • L'admin vous donnera le numéro de commande à livrer
                  <br />
                  • Recherchez le numéro dans le champ ci-dessus
                  <br />
                  • Effectuez la livraison et confirmez avec le montant exact
                </Alert>
                
                <div className="delivery-stats">
                  <Row className="text-center">
                    <Col md={4}>
                      <div className="stat-item">
                        <h4 className="text-warning">{stats.pending}</h4>
                        <p className="mb-0">À livrer</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="stat-item">
                        <h4 className="text-success">{stats.delivered}</h4>
                        <p className="mb-0">Livrées</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="stat-item">
                        <h4 className="text-primary">{formatPrice(stats.totalEarnings)}</h4>
                        <p className="mb-0">Gains totaux</p>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Order Details Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiPackage className="me-2" />
            Détails de la commande
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Informations client</h6>
                  <div className="client-info">
                    <p><FiUser className="me-2" /><strong>{selectedOrder.customer_name}</strong></p>
                    <p><FiPhone className="me-2" />{selectedOrder.customer_phone}</p>
                    <p><FiMapPin className="me-2" />{selectedOrder.customer_address}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <h6>Informations commande</h6>
                  <div className="order-info">
                    <p><strong>Numéro:</strong> {selectedOrder.numero_commande || selectedOrder.order_number || `#${selectedOrder.id}`}</p>
                    <p><strong>Statut:</strong> 
                      <Badge bg={selectedOrder.status === 'delivered' ? 'success' : 'warning'} className="ms-2">
                        {selectedOrder.status === 'delivered' ? 'Livrée' : 'En attente'}
                      </Badge>
                    </p>
                    <p><strong>Total:</strong> {formatPrice(selectedOrder.total_amount)}</p>
                  </div>
                </Col>
              </Row>

              <h6>Articles</h6>
              <Table size="sm" className="mb-4">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatPrice(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {selectedOrder.status === 'pending' && (
                <Alert variant="warning">
                  <h6>Confirmer la livraison</h6>
                  <p>Une fois la livraison effectuée et l'argent récupéré, entrez le montant exact pour confirmer.</p>
                  <Form.Group className="mb-3">
                    <Form.Label>Montant récupéré (FCFA)</Form.Label>
                    <Form.Control
                      type="number"
                      value={deliveryAmount}
                      onChange={(e) => setDeliveryAmount(e.target.value)}
                      placeholder={selectedOrder.total_amount}
                    />
                  </Form.Group>
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Fermer
          </Button>
          {selectedOrder?.status === 'pending' && (
            <Button
              variant="success"
              onClick={handleDeliveryComplete}
              disabled={processingDelivery}
            >
              {processingDelivery ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Confirmation...
                </>
              ) : (
                <>
                  <FiCheckCircle className="me-1" />
                  Confirmer livraison
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Profile Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiUser className="me-2" />
            Mon profil
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div className="profile-avatar">
              <FiUser size={48} />
            </div>
            <h5 className="mt-3">{user?.name}</h5>
            <Badge bg="warning">Livreur</Badge>
          </div>
          
          {!editingProfile ? (
            <div className="profile-info">
              <p><FiMail className="me-2" />{user?.email}</p>
              <p><FiPhone className="me-2" />{user?.phone || '+223 XX XX XX XX'}</p>
              <p><FiMapPin className="me-2" />Bamako, Mali</p>
            </div>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nom complet</Form.Label>
                <Form.Control
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  placeholder="Votre nom complet"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Téléphone</Form.Label>
                <Form.Control
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  placeholder="+223 XX XX XX XX"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={user?.email}
                  disabled
                  className="text-muted"
                />
                <Form.Text className="text-muted">
                  L'email ne peut pas être modifié
                </Form.Text>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!editingProfile ? (
            <>
              <Button 
                variant="outline-primary"
                onClick={() => setEditingProfile(true)}
              >
                <FiEdit className="me-1" />
                Modifier mes informations
              </Button>
              <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
                Fermer
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="success"
                onClick={handleUpdateProfile}
              >
                <FiSave className="me-1" />
                Sauvegarder
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setEditingProfile(false);
                  setProfileData({
                    name: user?.name || '',
                    phone: user?.phone || ''
                  });
                }}
              >
                Annuler
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DeliveryDashboard;
