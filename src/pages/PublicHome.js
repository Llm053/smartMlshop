import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Spinner, Alert, Navbar, Nav } from 'react-bootstrap';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiPhone, FiMail, FiMapPin, FiCheckCircle, FiPackage, FiTruck, FiStar, FiHeart, FiGlobe, FiUsers, FiAward, FiShield, FiHome, FiSearch, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { publicService, orderService } from '../services/api';
import { formatPrice } from '../utils/currency';
import { generateOrderNumber } from '../utils/orderNumbers';
import { useCompany } from '../contexts/CompanyContext';
import DeveloperFooter from '../components/DeveloperFooter';
import './PublicHome.css';

const PublicHome = () => {
  const { companyInfo } = useCompany();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Données client
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Bamako',
    notes: ''
  });

  const malianCities = ['Bamako', 'Sikasso', 'Ségou', 'Mopti', 'Gao', 'Tombouctou', 'Kayes', 'Koulikoro', 'Autre'];
  
  useEffect(() => {
    loadProducts();
    
    // Écouter les changements d'infos entreprise
    const handleCompanyUpdate = (event) => {
      // Le contexte se met automatiquement à jour
      console.log('Company info updated:', event.detail);
    };
    
    window.addEventListener('companyInfoUpdated', handleCompanyUpdate);
    
    return () => {
      window.removeEventListener('companyInfoUpdated', handleCompanyUpdate);
    };
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await publicService.getProducts();
      const productsData = response.data?.data?.products || response.data?.products || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast.error('Erreur lors du chargement des produits');
      // Produits de démonstration en cas d'erreur
      setProducts([
        { id: 1, name: 'Laptop Dell Inspiron 15', price: 150000, description: 'Ordinateur portable performant', category_name: 'Électronique', quantity: 5 },
        { id: 2, name: 'Souris Logitech Wireless', price: 25000, description: 'Souris sans fil ergonomique', category_name: 'Accessoires', quantity: 10 },
        { id: 3, name: 'Clavier Mécanique RGB', price: 45000, description: 'Clavier gaming avec éclairage', category_name: 'Accessoires', quantity: 8 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} ajouté au panier`);
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    if (!customerData.name || !customerData.phone || !customerData.address) {
      toast.error('Veuillez remplir tous les champs obligatoires (nom, téléphone, adresse)');
      return;
    }

    try {
      setSubmitting(true);
      
      const orderPayload = {
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        customer_email: customerData.email || null,
        customer_address: customerData.address || null,
        customer_city: customerData.city,
        total_amount: getCartTotal(),
        notes: customerData.notes || null,
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        }))
      };

      const response = await orderService.create(orderPayload);
      
      if (response.data.success) {
        const orderInfo = response.data.data;
        const orderNumber = generateOrderNumber(orderInfo.order_id, new Date());
        setOrderData({...orderInfo, order_number: orderNumber});
        setOrderSuccess(true);
        setCart([]);
        setShowCheckout(false);
        setCustomerData({
          name: '',
          phone: '',
          email: '',
          address: '',
          city: 'Bamako',
          notes: ''
        });
        toast.success(`Commande ${orderNumber} passée avec succès !`);
      }
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category_name))].filter(Boolean);

  return (
    <div className="public-home">
      {/* Navigation Bar */}
      <Navbar bg="white" expand="lg" className="public-navbar shadow-sm" fixed="top">
        <Container>
          <Navbar.Brand href="#home" className="brand-logo">
            <FiPackage className="me-2" />
            <strong>{companyInfo.name}</strong>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home" className="nav-link-custom">
                <FiHome className="me-1" />
                Accueil
              </Nav.Link>
              <Nav.Link href="#products" className="nav-link-custom">
                <FiPackage className="me-1" />
                Produits
              </Nav.Link>
              <Nav.Link href="#contact" className="nav-link-custom">
                <FiPhone className="me-1" />
                Contact
              </Nav.Link>
            </Nav>
            
            <Nav>
              <Nav.Link href="/order" className="nav-link-custom">
                <FiSearch className="me-1" />
                Suivre ma commande
              </Nav.Link>
              {cart.length > 0 && (
                <Button
                  variant="primary"
                  className="navbar-cart-btn"
                  onClick={() => setShowCart(true)}
                >
                  <FiShoppingCart className="me-1" />
                  Panier ({getCartItemsCount()})
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6}>
              <div className="hero-content">
                <Badge bg="primary" className="hero-badge mb-3">
                  <FiStar className="me-1" />
                  #1 au Mali
                </Badge>
                <h1 className="hero-title">
                  {companyInfo.name}
                  <span className="text-primary">.</span>
                </h1>
                <p className="hero-subtitle">
                  {companyInfo.description}
                </p>
                <div className="hero-stats">
                  <div className="stat-item">
                    <FiPackage className="stat-icon" />
                    <div>
                      <h3>500+</h3>
                      <p>Produits</p>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FiUsers className="stat-icon" />
                    <div>
                      <h3>1000+</h3>
                      <p>Clients</p>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FiTruck className="stat-icon" />
                    <div>
                      <h3>24h</h3>
                      <p>Livraison</p>
                    </div>
                  </div>
                </div>
                <div className="hero-actions">
                  <Button 
                    size="lg" 
                    className="btn-primary-custom me-3"
                    onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
                  >
                    <FiShoppingCart className="me-2" />
                    Commander maintenant
                  </Button>
                  <Button 
                    variant="outline-light" 
                    size="lg"
                    onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                  >
                    <FiPhone className="me-2" />
                    Nous contacter
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image">
                <div className="hero-card">
                  <FiShield className="hero-card-icon" />
                  <h4>Qualité Garantie</h4>
                  <p>Tous nos produits sont certifiés et garantis</p>
                </div>
                <div className="hero-card">
                  <FiTruck className="hero-card-icon" />
                  <h4>Livraison Rapide</h4>
                  <p>Livraison en 24h partout au Mali</p>
                </div>
                <div className="hero-card">
                  <FiHeart className="hero-card-icon" />
                  <h4>Service Client</h4>
                  <p>Support 7j/7 pour vous accompagner</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Products Section */}
      <section id="products" className="products-section">
        <Container>
          <Row>
            <Col>
              <div className="section-header text-center mb-5">
                <Badge bg="primary" className="section-badge mb-3">
                  <FiPackage className="me-1" />
                  Nos Produits
                </Badge>
                <h2 className="section-title">Découvrez notre gamme</h2>
                <p className="section-subtitle">
                  Des produits de qualité sélectionnés avec soin pour répondre à tous vos besoins
                </p>
              </div>
            </Col>
          </Row>

          {/* Filters */}
          <Row className="mb-4">
            <Col md={8}>
              <Form.Control
                type="search"
                placeholder="🔍 Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </Col>
            <Col md={4}>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" size="lg" />
              <p className="mt-3">Chargement des produits...</p>
            </div>
          ) : (
            <Row>
              {filteredProducts.map(product => (
                <Col key={product.id} lg={4} md={6} className="mb-4">
                  <Card className="product-card h-100">
                    <div className="product-image">
                      {product.image_path ? (
                        <img 
                          src={product.image_path} 
                          alt={product.name}
                          className="product-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="product-placeholder" style={product.image_path ? {display: 'none'} : {}}>
                        <FiPackage size={40} />
                      </div>
                      {product.quantity <= 5 && (
                        <Badge bg="warning" className="stock-badge">
                          Stock limité
                        </Badge>
                      )}
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <h5 className="product-name">{product.name}</h5>
                      <p className="product-description">{product.description}</p>
                      <div className="product-meta">
                        <Badge bg="light" text="dark" className="category-badge">
                          {product.category_name}
                        </Badge>
                        <span className="stock-info">
                          Stock: {product.quantity}
                        </span>
                      </div>
                      <div className="product-footer mt-auto">
                        <div className="product-price">
                          {formatPrice(product.price)}
                        </div>
                        <Button
                          variant="primary"
                          onClick={() => addToCart(product)}
                          disabled={product.quantity <= 0}
                          className="add-to-cart-btn"
                        >
                          <FiPlus className="me-1" />
                          Ajouter
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <Container>
          <Row>
            <Col>
              <div className="section-header text-center mb-5">
                <Badge bg="primary" className="section-badge mb-3">
                  <FiPhone className="me-1" />
                  Contact
                </Badge>
                <h2 className="section-title text-white">Contactez-nous</h2>
                <p className="section-subtitle text-white">
                  Notre équipe est là pour vous accompagner dans vos achats
                </p>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="contact-card">
                <Card.Body className="text-center">
                  <FiPhone className="contact-icon mb-3" />
                  <h5>Téléphone</h5>
                  <p>{companyInfo.phone}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="contact-card">
                <Card.Body className="text-center">
                  <FiMail className="contact-icon mb-3" />
                  <h5>Email</h5>
                  <p>{companyInfo.email}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="contact-card">
                <Card.Body className="text-center">
                  <FiMapPin className="contact-icon mb-3" />
                  <h5>Adresse</h5>
                  <p>{companyInfo.address}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Floating Cart */}
      {cart.length > 0 && (
        <Button
          className="floating-cart"
          onClick={() => setShowCart(true)}
        >
          <FiShoppingCart />
          <Badge bg="danger" className="cart-count">
            {getCartItemsCount()}
          </Badge>
        </Button>
      )}

      {/* Cart Modal */}
      <Modal show={showCart} onHide={() => setShowCart(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiShoppingCart className="me-2" />
            Mon Panier ({getCartItemsCount()} articles)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cart.length === 0 ? (
            <div className="text-center py-4">
              <FiShoppingCart size={48} className="text-muted mb-3" />
              <p>Votre panier est vide</p>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <Row className="align-items-center">
                    <Col md={6}>
                      <h6>{item.name}</h6>
                      <small className="text-muted">{formatPrice(item.price)} / unité</small>
                    </Col>
                    <Col md={3}>
                      <div className="quantity-controls">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          <FiMinus />
                        </Button>
                        <span className="mx-2">{item.quantity}</span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          <FiPlus />
                        </Button>
                      </div>
                    </Col>
                    <Col md={2} className="text-end">
                      <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </Col>
                    <Col md={1}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <FiTrash2 />
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
              <hr />
              <div className="cart-total">
                <h5>Total: {formatPrice(getCartTotal())}</h5>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCart(false)}>
            Continuer les achats
          </Button>
          {cart.length > 0 && (
            <Button
              variant="primary"
              onClick={() => {
                setShowCart(false);
                setShowCheckout(true);
              }}
            >
              <FiCheckCircle className="me-1" />
              Passer commande
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Checkout Modal */}
      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiCheckCircle className="me-2" />
            Finaliser la commande
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitOrder}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <h6 className="mb-3">Informations personnelles</h6>
                <Form.Group className="mb-3">
                  <Form.Label>Nom complet *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={customerData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Votre nom complet"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={customerData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+223 XX XX XX XX"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email (optionnel)</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={customerData.email}
                    onChange={handleInputChange}
                    placeholder="votre@email.com"
                  />
                  <Form.Text className="text-muted">
                    📧 Recommandé : Recevez des notifications sur l'état de votre commande et votre facture par email
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <h6 className="mb-3">Adresse de livraison</h6>
                <Form.Group className="mb-3">
                  <Form.Label>Ville</Form.Label>
                  <Form.Select
                    name="city"
                    value={customerData.city}
                    onChange={handleInputChange}
                  >
                    {malianCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Adresse complète *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={customerData.address}
                    onChange={handleInputChange}
                    placeholder="Quartier, rue, point de repère..."
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Notes (optionnel)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="notes"
                    value={customerData.notes}
                    onChange={handleInputChange}
                    placeholder="Instructions spéciales..."
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <hr />
            
            <h6>Résumé de la commande</h6>
            <div className="order-summary">
              {cart.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="summary-total">
                <strong>Total: {formatPrice(getCartTotal())}</strong>
              </div>
            </div>
            
            <Alert variant="info" className="mt-3">
              <FiTruck className="me-2" />
              <strong>Paiement à la livraison (uniquement à Bamako)</strong> - Payez en espèces lors de la réception. Des frais de livraison peuvent s'appliquer.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCheckout(false)}>
              Retour
            </Button>
            <Button
              type="submit"
              variant="success"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Commande en cours...
                </>
              ) : (
                <>
                  <FiCheckCircle className="me-1" />
                  Confirmer la commande
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Success Modal */}
      <Modal show={orderSuccess} onHide={() => setOrderSuccess(false)} centered>
        <Modal.Body className="text-center py-5">
          <FiCheckCircle size={64} className="text-success mb-3" />
          <h4>Commande confirmée !</h4>
          <p className="mb-4">
            Votre commande <strong>{orderData?.order_number}</strong> a été enregistrée avec succès.
            <br />
            Nous vous contacterons sous peu pour confirmer la livraison.
            <br />
            <small className="text-muted">
              Vous pouvez suivre votre commande avec ce numéro.
            </small>
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <Button
              variant="outline-primary"
              href="/order"
            >
              <FiSearch className="me-1" />
              Suivre ma commande
            </Button>
            <Button
              variant="primary"
              onClick={() => setOrderSuccess(false)}
            >
              Continuer les achats
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Developer Footer */}
      <DeveloperFooter />
    </div>
  );
};

export default PublicHome;
