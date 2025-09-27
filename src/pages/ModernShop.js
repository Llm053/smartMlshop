import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  InputGroup, 
  Badge, 
  Modal,
  Alert,
  Spinner,
  Navbar,
  Nav
} from 'react-bootstrap';
import { 
  FiShoppingCart, 
  FiPlus, 
  FiMinus, 
  FiSearch, 
  FiFilter,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiCheck,
  FiStar,
  FiHeart,
  FiEye,
  FiTag,
  FiX
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { publicService, orderService } from '../services/api';
import { formatPrice } from '../utils/currency';
import './ModernShop.css';

const ModernShop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: ''
  });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const loadProducts = async () => {
    try {
      const response = await publicService.getProducts();
      if (response.data && response.data.data && response.data.data.products) {
        setProducts(response.data.data.products);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await publicService.getCategories();
      if (response.data && response.data.data && response.data.data.categories) {
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category_id.toString() === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.quantity) }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
    
    toast.success(`${product.name} ajouté au panier`);
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(newQuantity, item.stock_quantity) }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const validateCustomerInfo = () => {
    const errors = {};
    
    if (!customerInfo.firstName.trim()) errors.firstName = 'Prénom requis';
    if (!customerInfo.lastName.trim()) errors.lastName = 'Nom requis';
    if (!customerInfo.phone.trim()) errors.phone = 'Téléphone requis';
    if (!customerInfo.address.trim()) errors.address = 'Adresse requise';
    if (!customerInfo.city.trim()) errors.city = 'Ville requise';
    
    if (customerInfo.email && !/\S+@\S+\.\S+/.test(customerInfo.email)) {
      errors.email = 'Format email invalide';
    }
    
    return errors;
  };

  const handleSubmitOrder = async () => {
    const errors = validateCustomerInfo();
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach(error => toast.error(error));
      return;
    }

    if (cart.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    setOrderSubmitting(true);
    try {
      const orderData = {
        customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email || null,
        customer_address: customerInfo.address,
        customer_city: customerInfo.city,
        total_amount: getCartTotal(),
        notes: `${customerInfo.notes || ''}${customerInfo.deliveryTime ? ` | Livraison préférée: ${customerInfo.deliveryTime}` : ''}`.trim(),
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        }))
      };

      const response = await orderService.create(orderData);
      setOrderNumber(response.data.data.order_id);
      setShowSuccess(true);
      setShowCheckout(false);
      setCart([]);
      setCustomerInfo({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        notes: ''
      });
      toast.success('Commande passée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      const message = error.response?.data?.message || 'Erreur lors de la validation de votre commande';
      toast.error(message);
    } finally {
      setOrderSubmitting(false);
    }
  };

  const getProductBadge = (product) => {
    if (product.quantity <= 0) {
      return <Badge bg="danger" className="stock-badge">Rupture</Badge>;
    } else if (product.quantity <= 5) {
      return <Badge bg="warning" className="stock-badge">Stock faible</Badge>;
    } else {
      return <Badge bg="success" className="stock-badge">{product.quantity} disponible{product.quantity > 1 ? 's' : ''}</Badge>;
    }
  };

  return (
    <div className="modern-shop">
      {/* Header moderne */}
      <Navbar bg="white" expand="lg" className="shop-navbar shadow-sm">
        <Container>
          <Navbar.Brand className="shop-brand">
            <div className="brand-content">
              <div className="brand-name">STOCK SHOP MALI</div>
              <div className="brand-tagline">Boutique en ligne - Mali</div>
            </div>
          </Navbar.Brand>
          
          <Nav className="ms-auto">
            <Button
              variant="outline-primary"
              className="cart-toggle-btn"
              onClick={() => setShowCart(true)}
            >
              <FiShoppingCart className="me-2" />
              Panier ({getCartItemsCount()})
              {getCartItemsCount() > 0 && (
                <Badge bg="danger" className="cart-badge">
                  {getCartItemsCount()}
                </Badge>
              )}
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className="hero-content">
                <h1 className="hero-title">
                  Découvrez nos produits
                  <span className="hero-highlight"> exceptionnels</span>
                </h1>
                <p className="hero-description">
                  Commandez en ligne et recevez vos produits partout au Mali. 
                  Paiement à la livraison, satisfaction garantie.
                </p>
                <div className="hero-features">
                  <div className="feature-item">
                    <FiTruck className="feature-icon" />
                    <span>Livraison rapide</span>
                  </div>
                  <div className="feature-item">
                    <FiCreditCard className="feature-icon" />
                    <span>Paiement à la livraison</span>
                  </div>
                  <div className="feature-item">
                    <FiCheck className="feature-icon" />
                    <span>Qualité garantie</span>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image">
                <div className="hero-card">
                  <FiShoppingCart size={80} className="hero-icon" />
                  <div className="hero-stats">
                    <div className="stat">
                      <span className="stat-number">{products.length}</span>
                      <span className="stat-label">Produits</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">{categories.length}</span>
                      <span className="stat-label">Catégories</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Filtres et recherche */}
      <Container className="py-4">
        <Card className="filters-card mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="filter-label">
                    <FiSearch className="me-1" />
                    Rechercher un produit
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nom du produit, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="filter-label">
                    <FiFilter className="me-1" />
                    Catégorie
                  </Form.Label>
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-select"
                  >
                    <option value="all">Toutes les catégories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <div className="results-count">
                  <Badge bg="primary" className="count-badge">
                    {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Grille des produits */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3">Chargement des produits...</p>
          </div>
        ) : (
          <Row>
            {filteredProducts.map(product => (
              <Col key={product.id} xl={3} lg={4} md={6} className="mb-4">
                <Card className="product-card h-100">
                  <div className="product-image">
                    <div className="product-placeholder">
                      <FiTag size={40} className="placeholder-icon" />
                    </div>
                    <div className="product-actions">
                      <Button
                        variant="light"
                        className="action-btn"
                        title="Voir les détails"
                      >
                        <FiEye />
                      </Button>
                      <Button
                        variant="light"
                        className="action-btn"
                        title="Ajouter aux favoris"
                      >
                        <FiHeart />
                      </Button>
                    </div>
                  </div>
                  
                  <Card.Body className="d-flex flex-column">
                    <div className="product-header mb-2">
                      <Card.Title className="product-name">{product.name}</Card.Title>
                      <div className="product-category">
                        <Badge bg="outline-secondary" className="category-badge">
                          {product.category_name || 'Non classé'}
                        </Badge>
                      </div>
                    </div>
                    
                    <Card.Text className="product-description">
                      {product.description}
                    </Card.Text>
                    
                    <div className="mt-auto">
                      <div className="product-footer">
                        <div className="price-section">
                          <div className="price">{formatPrice(product.price)}</div>
                          {getProductBadge(product)}
                        </div>
                        
                        <div className="cart-section mt-3">
                          {cart.find(item => item.id === product.id) ? (
                            <div className="quantity-controls">
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => updateCartQuantity(product.id, cart.find(item => item.id === product.id).quantity - 1)}
                                className="qty-btn"
                              >
                                <FiMinus />
                              </Button>
                              <span className="quantity-display">
                                {cart.find(item => item.id === product.id).quantity}
                              </span>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => updateCartQuantity(product.id, cart.find(item => item.id === product.id).quantity + 1)}
                                disabled={cart.find(item => item.id === product.id).quantity >= product.quantity}
                                className="qty-btn"
                              >
                                <FiPlus />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="primary"
                              className="add-to-cart-btn w-100"
                              onClick={() => addToCart(product)}
                              disabled={product.quantity <= 0}
                            >
                              <FiShoppingCart className="me-2" />
                              {product.quantity <= 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Modal du panier */}
      <Modal show={showCart} onHide={() => setShowCart(false)} size="lg">
        <Modal.Header closeButton className="cart-header">
          <Modal.Title>
            <FiShoppingCart className="me-2" />
            Mon Panier ({getCartItemsCount()} article{getCartItemsCount() > 1 ? 's' : ''})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cart.length === 0 ? (
            <div className="empty-cart">
              <FiShoppingCart size={64} className="empty-icon" />
              <h5>Votre panier est vide</h5>
              <p className="text-muted">Ajoutez des produits pour commencer vos achats</p>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <Row className="align-items-center">
                    <Col md={6}>
                      <div className="item-info">
                        <h6 className="item-name">{item.name}</h6>
                        <p className="item-price">{formatPrice(item.price)} / unité</p>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="quantity-controls">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          <FiMinus />
                        </Button>
                        <span className="quantity">{item.quantity}</span>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock_quantity}
                        >
                          <FiPlus />
                        </Button>
                      </div>
                    </Col>
                    <Col md={2}>
                      <div className="item-total">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </Col>
                    <Col md={1}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <FiX />
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
              
              <div className="cart-total">
                <Row>
                  <Col className="text-end">
                    <h4 className="total-amount">
                      Total: {formatPrice(getCartTotal())}
                    </h4>
                  </Col>
                </Row>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCart(false)}>
            Continuer mes achats
          </Button>
          {cart.length > 0 && (
            <Button 
              variant="success" 
              onClick={() => {
                setShowCart(false);
                setShowCheckout(true);
              }}
            >
              <FiCheck className="me-2" />
              Passer commande
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal de commande */}
      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} size="lg">
        <Modal.Header closeButton className="checkout-header">
          <Modal.Title>
            <FiCreditCard className="me-2" />
            Finaliser votre commande
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={7}>
              <Card className="customer-form-card">
                <Card.Header>
                  <h6 className="mb-0">
                    <FiUser className="me-2" />
                    Vos informations
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Prénom *</Form.Label>
                        <Form.Control
                          type="text"
                          value={customerInfo.firstName}
                          onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                          placeholder="Votre prénom"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nom *</Form.Label>
                        <Form.Control
                          type="text"
                          value={customerInfo.lastName}
                          onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                          placeholder="Votre nom"
                        />
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
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                          placeholder="+223 70 12 34 56"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FiMail className="me-1" />
                          Email (pour la facture)
                        </Form.Label>
                        <Form.Control
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                          placeholder="votre@email.com"
                        />
                        <Form.Text className="text-muted">
                          Optionnel - Utilisé pour l'envoi de la facture
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FiMapPin className="me-1" />
                          Adresse de livraison complète *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={customerInfo.address}
                          onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                          placeholder="Rue, quartier, numéro, point de repère..."
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Ville *</Form.Label>
                        <Form.Select
                          value={customerInfo.city}
                          onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                        >
                          <option value="">Sélectionner une ville</option>
                          <option value="Bamako">Bamako</option>
                          <option value="Sikasso">Sikasso</option>
                          <option value="Koutiala">Koutiala</option>
                          <option value="Ségou">Ségou</option>
                          <option value="Mopti">Mopti</option>
                          <option value="Gao">Gao</option>
                          <option value="Tombouctou">Tombouctou</option>
                          <option value="Kayes">Kayes</option>
                          <option value="Kidal">Kidal</option>
                          <option value="Autre">Autre ville</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Heure de livraison préférée</Form.Label>
                        <Form.Select
                          value={customerInfo.deliveryTime || ''}
                          onChange={(e) => setCustomerInfo({...customerInfo, deliveryTime: e.target.value})}
                        >
                          <option value="">Pas de préférence</option>
                          <option value="morning">Matin (8h-12h)</option>
                          <option value="afternoon">Après-midi (12h-18h)</option>
                          <option value="evening">Soir (18h-20h)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Notes (optionnel)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={customerInfo.notes}
                          onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                          placeholder="Instructions spéciales pour la livraison..."
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={5}>
              <Card className="order-summary-card">
                <Card.Header>
                  <h6 className="mb-0">
                    <FiShoppingCart className="me-2" />
                    Résumé de commande
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="order-items">
                    {cart.map(item => (
                      <div key={item.id} className="order-item">
                        <div className="item-details">
                          <div className="item-name">{item.name}</div>
                          <div className="item-quantity">{item.quantity} × {formatPrice(item.price)}</div>
                        </div>
                        <div className="item-total">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <hr />
                  
                  <div className="order-totals">
                    <div className="total-row">
                      <span>Sous-total:</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="total-row">
                      <span>Frais de livraison:</span>
                      <span className="text-success">Gratuit</span>
                    </div>
                    <div className="total-row final-total">
                      <span>Total:</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                  </div>
                  
                  <Alert variant="info" className="payment-info">
                    <div className="payment-method">
                      <FiTruck className="me-2" />
                      <strong>Paiement à la livraison</strong>
                    </div>
                    <small>Payez en espèces lors de la réception de vos produits</small>
                  </Alert>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckout(false)}>
            Retour
          </Button>
          <Button 
            variant="success" 
            onClick={handleSubmitOrder}
            disabled={orderSubmitting || cart.length === 0}
            className="order-btn"
          >
            {orderSubmitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Traitement...
              </>
            ) : (
              <>
                <FiCheck className="me-2" />
                Confirmer la commande
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de succès */}
      <Modal show={showSuccess} onHide={() => setShowSuccess(false)} centered>
        <Modal.Body className="text-center success-modal">
          <div className="success-icon">
            <FiCheck size={64} className="text-success" />
          </div>
          <h4 className="success-title">Commande confirmée !</h4>
          <p className="success-message">
            Votre commande #{orderNumber} a été enregistrée avec succès.
          </p>
          <Alert variant="success" className="delivery-info">
            <FiTruck className="me-2" />
            <strong>Livraison sous 24-48h</strong><br />
            <small>Vous serez contacté pour confirmer l'heure de livraison</small>
          </Alert>
          <Button 
            variant="primary" 
            onClick={() => setShowSuccess(false)}
            className="continue-btn"
          >
            Continuer mes achats
          </Button>
        </Modal.Body>
      </Modal>

      {/* Panier flottant */}
      {cart.length > 0 && (
        <div className="floating-cart-btn">
          <Button
            variant="success"
            className="cart-float"
            onClick={() => setShowCart(true)}
          >
            <FiShoppingCart className="me-2" />
            {getCartItemsCount()} article{getCartItemsCount() > 1 ? 's' : ''}
            <Badge bg="light" text="dark" className="ms-2">
              {formatPrice(getCartTotal())}
            </Badge>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ModernShop;
