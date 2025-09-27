import React, { useState } from 'react';
import { 
  Modal, 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form,
  ListGroup,
  Badge,
  Alert,
  InputGroup
} from 'react-bootstrap';
import { 
  FiShoppingCart, 
  FiPlus, 
  FiMinus, 
  FiTrash2,
  FiUser,
  FiPhone,
  FiMail,
  FiCheck,
  FiCreditCard
} from 'react-icons/fi';
import { formatPrice } from '../utils/currency';
import LoyalCustomerSelector from './LoyalCustomerSelector';
import './CartModal.css';

const CartModal = ({ 
  show, 
  onHide, 
  cartItems = [], 
  onUpdateQuantity, 
  onRemoveItem, 
  onConfirmSale,
  loading = false 
}) => {
  const [customerData, setCustomerData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    notes: ''
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [useCustomerSelector, setUseCustomerSelector] = useState(false);
  const [errors, setErrors] = useState({});

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (useCustomerSelector) {
      if (!selectedCustomer) {
        newErrors.customer = 'Veuillez sélectionner un client fidèle ou saisir les informations manuellement';
      }
    } else {
      if (!customerData.customer_name.trim()) {
        newErrors.customer_name = 'Le nom du client est requis';
      }
      if (!customerData.customer_phone.trim()) {
        newErrors.customer_phone = 'Le numéro de téléphone est requis';
      }
    }
    
    if (cartItems.length === 0) {
      newErrors.items = 'Le panier est vide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const saleData = {
      items: cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity
      })),
      total_amount: calculateTotal(),
      sale_type: 'in_store', // Vente en magasin par défaut
      ...(useCustomerSelector && selectedCustomer ? {
        customer_name: selectedCustomer.name,
        customer_phone: selectedCustomer.phone,
        customer_email: selectedCustomer.email,
        customer_id: selectedCustomer.id // Ajouter l'ID du client fidèle
      } : customerData)
    };

    onConfirmSale(saleData);
  };

  const handleCustomerDataChange = (field, value) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    if (errors.customer) {
      setErrors(prev => ({
        ...prev,
        customer: undefined
      }));
    }
  };

  const total = calculateTotal();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered
      className="cart-modal"
    >
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          <FiShoppingCart className="me-2" />
          Finaliser la vente
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-0">
        <Form onSubmit={handleSubmit}>
          {/* Résumé du panier */}
          <div className="cart-summary p-3 bg-light border-bottom">
            <Row className="align-items-center">
              <Col>
                <h6 className="mb-0">
                  <FiShoppingCart className="me-2" />
                  {itemCount} article{itemCount > 1 ? 's' : ''} dans le panier
                </h6>
              </Col>
              <Col xs="auto">
                <h5 className="mb-0 text-success fw-bold">
                  {formatPrice(total)}
                </h5>
              </Col>
            </Row>
          </div>

          {/* Liste des articles */}
          <div className="cart-items" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {cartItems.length === 0 ? (
              <Alert variant="info" className="m-3">
                <FiShoppingCart size={24} className="me-2" />
                Votre panier est vide
              </Alert>
            ) : (
              <ListGroup variant="flush">
                {cartItems.map(item => (
                  <ListGroup.Item key={item.product_id} className="cart-item">
                    <Row className="align-items-center">
                      <Col>
                        <h6 className="mb-1">{item.product_name}</h6>
                        <small className="text-muted">
                          {formatPrice(item.unit_price)} × {item.quantity}
                        </small>
                      </Col>
                      <Col xs="auto">
                        <div className="quantity-controls d-flex align-items-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.product_id, -1)}
                            className="quantity-btn"
                          >
                            <FiMinus />
                          </Button>
                          <span className="quantity-display mx-2">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.product_id, 1)}
                            className="quantity-btn"
                          >
                            <FiPlus />
                          </Button>
                        </div>
                      </Col>
                      <Col xs="auto">
                        <div className="item-total fw-bold">
                          {formatPrice(item.unit_price * item.quantity)}
                        </div>
                      </Col>
                      <Col xs="auto">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onRemoveItem(item.product_id)}
                          className="remove-btn"
                        >
                          <FiTrash2 />
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>

          {/* Informations client */}
          <div className="customer-section p-3 border-top">
            <h6 className="mb-3">
              <FiUser className="me-2" />
              Informations client
            </h6>

            {/* Toggle entre client fidèle et nouveau client */}
            <div className="mb-3">
              <Form.Check
                type="switch"
                id="use-loyal-customer"
                label="Utiliser un client fidèle"
                checked={useCustomerSelector}
                onChange={(e) => {
                  setUseCustomerSelector(e.target.checked);
                  setSelectedCustomer(null);
                  setCustomerData({
                    customer_name: '',
                    customer_phone: '',
                    customer_email: '',
                    notes: ''
                  });
                  setErrors({});
                }}
              />
            </div>

            {useCustomerSelector ? (
              <div>
                <LoyalCustomerSelector
                  selectedCustomer={selectedCustomer}
                  onCustomerSelect={handleCustomerSelect}
                />
                {errors.customer && (
                  <div className="text-danger small mt-1">{errors.customer}</div>
                )}
              </div>
            ) : (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FiUser className="me-1" />
                      Nom du client *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={customerData.customer_name}
                      onChange={(e) => handleCustomerDataChange('customer_name', e.target.value)}
                      isInvalid={!!errors.customer_name}
                      placeholder="Nom complet du client"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.customer_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FiPhone className="me-1" />
                      Téléphone *
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      value={customerData.customer_phone}
                      onChange={(e) => handleCustomerDataChange('customer_phone', e.target.value)}
                      isInvalid={!!errors.customer_phone}
                      placeholder="Ex: +223 70 12 34 56"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.customer_phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FiMail className="me-1" />
                      Email (optionnel)
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={customerData.customer_email}
                      onChange={(e) => handleCustomerDataChange('customer_email', e.target.value)}
                      placeholder="email@example.com"
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            {/* Notes */}
            <Form.Group className="mb-3">
              <Form.Label>Notes (optionnel)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={customerData.notes}
                onChange={(e) => handleCustomerDataChange('notes', e.target.value)}
                placeholder="Commentaires ou notes sur la vente..."
              />
            </Form.Group>
          </div>

          {/* Total et validation */}
          <div className="cart-footer p-3 bg-light border-top">
            <Row className="align-items-center">
              <Col>
                <div className="total-section">
                  <div className="total-label text-muted">Total à payer</div>
                  <div className="total-amount h4 mb-0 text-success fw-bold">
                    {formatPrice(total)}
                  </div>
                </div>
              </Col>
              <Col xs="auto">
                <div className="d-flex gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={onHide}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button 
                    variant="success" 
                    type="submit"
                    disabled={loading || cartItems.length === 0}
                    className="confirm-btn"
                  >
                    {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Chargement...</span>
                        </div>
                        Traitement...
                      </>
                    ) : (
                      <>
                        <FiCheck className="me-2" />
                        Confirmer la vente
                      </>
                    )}
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CartModal;
