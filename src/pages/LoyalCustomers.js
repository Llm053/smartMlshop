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
  Spinner 
} from 'react-bootstrap';
import { 
  FiUser, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSearch, 
  FiPhone, 
  FiMail, 
  FiMapPin,
  FiStar,
  FiShoppingBag,
  FiCalendar
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { loyalCustomerService } from '../services/api';
import { formatPrice, formatDate } from '../utils/currency';
import './LoyalCustomers.css';

const LoyalCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await loyalCustomerService.getAll();
      if (response.data && response.data.data && response.data.data.customers) {
        setCustomers(response.data.data.customers);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      toast.error('Erreur lors du chargement des clients fidèles');
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  };

  const handleShowModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || ''
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: ''
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Le téléphone est requis';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (editingCustomer) {
        await loyalCustomerService.update(editingCustomer.id, formData);
        toast.success('Client mis à jour avec succès');
      } else {
        await loyalCustomerService.create(formData);
        toast.success('Client créé avec succès');
      }
      
      handleCloseModal();
      await loadCustomers();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      const message = error.response?.data?.message || 'Erreur lors de la sauvegarde';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${customer.name}" ?`)) {
      return;
    }
    
    try {
      await loyalCustomerService.delete(customer.id);
      toast.success('Client supprimé avec succès');
      await loadCustomers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    }
  };

  const getLoyaltyBadge = (points) => {
    if (points >= 200) return <Badge bg="warning" className="loyalty-badge">🏆 VIP</Badge>;
    if (points >= 100) return <Badge bg="success" className="loyalty-badge">⭐ Gold</Badge>;
    if (points >= 50) return <Badge bg="info" className="loyalty-badge">🥈 Silver</Badge>;
    return <Badge bg="secondary" className="loyalty-badge">🥉 Bronze</Badge>;
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="page-title">
                <FiUser className="me-2" />
                Clients Fidèles
              </h2>
              <p className="text-muted">Gérez votre base de clients fidèles</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => handleShowModal()}
              className="add-customer-btn"
            >
              <FiPlus className="me-2" />
              Nouveau Client
            </Button>
          </div>

          {/* Barre de recherche */}
          <Card className="mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FiSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Rechercher un client (nom, téléphone, email)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={6} className="text-end">
                  <div className="stats-info">
                    <Badge bg="info" className="me-2">
                      {filteredCustomers.length} client{filteredCustomers.length > 1 ? 's' : ''}
                    </Badge>
                    <Badge bg="success">
                      {customers.reduce((sum, c) => sum + (c.total_purchases || 0), 0)} ventes totales
                    </Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Liste des clients */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Liste des Clients Fidèles</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Chargement des clients...</p>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-5">
                  <FiUser size={48} className="text-muted mb-3" />
                  <p className="text-muted">
                    {searchTerm ? 'Aucun client trouvé' : 'Aucun client fidèle enregistré'}
                  </p>
                  {!searchTerm && (
                    <Button variant="primary" onClick={() => handleShowModal()}>
                      <FiPlus className="me-2" />
                      Ajouter le premier client
                    </Button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="customers-table">
                    <thead className="table-dark">
                      <tr>
                        <th>Client</th>
                        <th>Contact</th>
                        <th>Statut</th>
                        <th>Achats</th>
                        <th>Montant Total</th>
                        <th>Points</th>
                        <th>Dernier Achat</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="customer-row">
                          <td>
                            <div className="customer-info">
                              <strong className="customer-name">{customer.name}</strong>
                              {customer.address && (
                                <div className="customer-address">
                                  <FiMapPin size={12} className="me-1" />
                                  <small className="text-muted">{customer.address}</small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="contact-info">
                              <div className="phone">
                                <FiPhone size={12} className="me-1" />
                                {customer.phone}
                              </div>
                              {customer.email && (
                                <div className="email">
                                  <FiMail size={12} className="me-1" />
                                  <small className="text-muted">{customer.email}</small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {getLoyaltyBadge(customer.loyalty_points || 0)}
                          </td>
                          <td>
                            <Badge bg="outline-primary" className="purchases-badge">
                              <FiShoppingBag size={12} className="me-1" />
                              {customer.total_purchases || 0}
                            </Badge>
                          </td>
                          <td>
                            <strong className="amount">
                              {formatPrice(customer.total_amount || 0)}
                            </strong>
                          </td>
                          <td>
                            <Badge bg="warning" className="points-badge">
                              <FiStar size={12} className="me-1" />
                              {customer.loyalty_points || 0} pts
                            </Badge>
                          </td>
                          <td>
                            {customer.last_purchase ? (
                              <div className="last-purchase">
                                <FiCalendar size={12} className="me-1" />
                                <small>{formatDate(customer.last_purchase)}</small>
                              </div>
                            ) : (
                              <small className="text-muted">Aucun achat</small>
                            )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleShowModal(customer)}
                                className="me-1"
                                title="Modifier"
                              >
                                <FiEdit size={14} />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(customer)}
                                title="Supprimer"
                              >
                                <FiTrash2 size={14} />
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

      {/* Modal d'ajout/modification */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiUser className="me-2" />
            {editingCustomer ? 'Modifier le client' : 'Nouveau client fidèle'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom complet *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    isInvalid={!!formErrors.name}
                    placeholder="Nom du client"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone *</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    isInvalid={!!formErrors.phone}
                    placeholder="Ex: +223 70 12 34 56"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.phone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Email (optionnel)</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    isInvalid={!!formErrors.email}
                    placeholder="email@example.com"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Adresse (optionnel)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Adresse du client"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {editingCustomer && (
              <Alert variant="info">
                <Row>
                  <Col md={3}>
                    <strong>Achats:</strong> {editingCustomer.total_purchases || 0}
                  </Col>
                  <Col md={4}>
                    <strong>Total dépensé:</strong> {formatPrice(editingCustomer.total_amount || 0)}
                  </Col>
                  <Col md={3}>
                    <strong>Points:</strong> {editingCustomer.loyalty_points || 0}
                  </Col>
                  <Col md={2}>
                    {getLoyaltyBadge(editingCustomer.loyalty_points || 0)}
                  </Col>
                </Row>
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  {editingCustomer ? <FiEdit className="me-2" /> : <FiPlus className="me-2" />}
                  {editingCustomer ? 'Modifier' : 'Créer'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default LoyalCustomers;
