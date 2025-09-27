import React, { useState, useEffect } from 'react';
import { Form, Button, Modal, Table, Badge } from 'react-bootstrap';
import { FiUser, FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { loyalCustomerService } from '../services/api';
import './LoyalCustomerSelector.css';

const LoyalCustomerSelector = ({ onCustomerSelect, selectedCustomer }) => {
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Charger les clients fidèles depuis l'API
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await loyalCustomerService.getAll();
      if (response.data && response.data.data && response.data.data.customers) {
        setCustomers(response.data.data.customers);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients fidèles:', error);
      // Données de démonstration en cas d'erreur
      setCustomers([
        {
          id: 1,
        name: 'Moussa Diallo',
        phone: '+223 70 12 34 56',
        email: 'moussa.diallo@email.com',
        address: 'Bamako, Mali',
          total_purchases: 5,
          last_purchase: '2024-01-15',
          loyalty_points: 150
        },
        {
          id: 2,
          name: 'Fatou Sarr',
          phone: '+223 76 23 45 67',
          email: 'fatou.sarr@email.com',
          address: 'Sikasso, Mali',
          total_purchases: 3,
          last_purchase: '2024-01-10',
          loyalty_points: 90
        }
      ]);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCustomer = (customer) => {
    onCustomerSelect(customer);
    setShowModal(false);
    toast.success(`Client ${customer.name} sélectionné`);
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      toast.error('Nom et téléphone requis');
      return;
    }

    try {
      await loyalCustomerService.create(newCustomer);
      toast.success('Client ajouté avec succès');
      setNewCustomer({ name: '', phone: '', email: '', address: '' });
      setShowAddForm(false);
      await fetchCustomers(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
      const message = error.response?.data?.message || 'Erreur lors de l\'ajout du client';
      toast.error(message);
    }
  };

  const handleRemoveCustomer = async (customerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client fidèle ?')) {
      return;
    }

    try {
      await loyalCustomerService.delete(customerId);
      toast.success('Client supprimé');
      await fetchCustomers(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
      const message = error.response?.data?.message || 'Erreur lors de la suppression du client';
      toast.error(message);
    }
  };

  return (
    <>
      <div className="loyal-customer-selector">
        <Form.Group className="mb-3">
          <Form.Label>Client</Form.Label>
          <div className="customer-input-group">
            <Form.Control
              type="text"
              value={selectedCustomer ? selectedCustomer.name : ''}
              placeholder="Sélectionner un client fidèle ou saisir manuellement"
              readOnly
              className="customer-input"
            />
            <Button
              variant="outline-primary"
              onClick={() => setShowModal(true)}
              className="select-customer-btn"
            >
              <FiUser className="me-1" />
              Sélectionner
            </Button>
            <Button
              variant="outline-success"
              onClick={() => setShowAddForm(true)}
              className="add-customer-btn"
            >
              <FiPlus className="me-1" />
              Ajouter
            </Button>
          </div>
        </Form.Group>

        {selectedCustomer && (
          <div className="selected-customer-info">
            <Badge bg="success" className="me-2">
              Client fidèle
            </Badge>
            <span className="customer-details">
              {selectedCustomer.name} - {selectedCustomer.phone}
            </span>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onCustomerSelect(null)}
              className="ms-2"
            >
              <FiTrash2 size={12} />
            </Button>
          </div>
        )}
      </div>

      {/* Modal de sélection des clients */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiUser className="me-2" />
            Sélectionner un client fidèle
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="customer-search mb-3">
            <Form.Control
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="customers-list">
            {filteredCustomers.length > 0 ? (
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Téléphone</th>
                    <th>Email</th>
                    <th>Achats</th>
                    <th>Points</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id}>
                      <td>
                        <div className="customer-name">
                          <strong>{customer.name}</strong>
                          <small className="text-muted d-block">{customer.address}</small>
                        </div>
                      </td>
                      <td>{customer.phone}</td>
                      <td>{customer.email}</td>
                      <td>
                        <Badge bg="info">{customer.total_purchases || 0} achats</Badge>
                      </td>
                      <td>
                        <Badge bg="warning">{customer.loyalty_points || 0} pts</Badge>
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSelectCustomer(customer)}
                          className="me-2"
                        >
                          Sélectionner
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveCustomer(customer.id)}
                        >
                          <FiTrash2 size={12} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="no-customers">
                <FiUser size={48} className="text-muted mb-3" />
                <p className="text-muted">Aucun client trouvé</p>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal d'ajout de client */}
      <Modal show={showAddForm} onHide={() => setShowAddForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiPlus className="me-2" />
            Ajouter un nouveau client
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom complet *</Form.Label>
              <Form.Control
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                placeholder="Nom du client"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Téléphone *</Form.Label>
              <Form.Control
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                placeholder="Numéro de téléphone"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                placeholder="Email du client"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                type="text"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                placeholder="Adresse du client"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddForm(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleAddCustomer}>
            <FiPlus className="me-2" />
            Ajouter le client
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LoyalCustomerSelector;
