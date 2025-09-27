import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { publicService } from '../services/api';
import PublicNavbar from '../components/PublicNavbar';
import { WHATSAPP_CONFIG, createWhatsAppLink } from '../config/whatsapp';
import { formatPrice } from '../utils/currency';
import { FiShoppingCart, FiSearch, FiFilter, FiHeart, FiStar, FiTruck, FiShield, FiClock } from 'react-icons/fi';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadData();
    // Charger le panier depuis le localStorage
    const savedCart = localStorage.getItem('shop_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Sauvegarder le panier dans le localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(cart));
  }, [cart]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse, adminResponse] = await Promise.all([
        publicService.getProducts(),
        publicService.getCategories(),
        publicService.getAdmin()
      ]);
      setProducts(productsResponse.data.data.products);
      setCategories(categoriesResponse.data.data.categories);
      setAdmin(adminResponse.data.data.admin);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    // Supprimer le toast pour l'ajout au panier
    // toast.success(`${product.name} ajouté au panier !`);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.info('Produit retiré du panier');
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return { variant: 'danger', text: 'Rupture' };
    if (quantity <= 5) return { variant: 'warning', text: 'Stock faible' };
    return { variant: 'success', text: 'En stock' };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || product.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleOrder = () => {
    if (cart.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    setShowOrderModal(true);
  };

  const sendWhatsAppOrder = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!admin) {
      toast.error('Impossible de récupérer les informations de l\'administrateur');
      return;
    }

    // Créer le message WhatsApp selon vos spécifications
    let message = `Vous avez une nouvelle commande `;
    
    // Ajouter les articles
    const articles = cart.map(item => `${item.name} x${item.quantity}`).join(', ');
    message += articles;
    
    // Ajouter le lien
    const orderUrl = `${window.location.origin}/order?ids=${cart.map(item => item.id).join(',')}`;
    message += ` cliquez sur ce lien pour en savoir plus ${orderUrl}`;

    // Créer le lien WhatsApp avec le numéro de l'admin
    const adminPhone = admin.phone || WHATSAPP_CONFIG.ADMIN_PHONE;
    const whatsappUrl = createWhatsAppLink(adminPhone, message);

    // Ouvrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Vider le panier
    setCart([]);
    setShowOrderModal(false);
    setCustomerInfo({ name: '', phone: '', address: '' });
    
    toast.success('Commande envoyée sur WhatsApp !');
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Container>
    );
  }

  return (
    <div className="shop-page">
      <PublicNavbar />
      
      {/* Header */}
      <div className="bg-primary text-white py-4 mb-4">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 mb-0">🛍️ Notre Boutique</h1>
              <p className="lead mb-0">Découvrez nos produits de qualité</p>
            </Col>
            <Col md={6} className="text-end">
              <Button
                variant="light"
                size="lg"
                onClick={() => setShowCart(true)}
                className="position-relative"
              >
                🛒 Panier
                {getTotalItems() > 0 && (
                  <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Filtres */}
        <Row className="mb-4">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text>🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={6}>
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {/* Produits */}
        <Row>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.quantity);
              return (
                <Col lg={4} md={6} className="mb-4" key={product.id}>
                  <Card className="h-100 product-card">
                    <Card.Body>
                      <div className="text-center mb-3">
                        <div className="product-icon">📦</div>
                      </div>
                      
                      <Card.Title className="text-center">
                        {product.name}
                      </Card.Title>
                      
                      {product.description && (
                        <Card.Text className="text-muted text-center">
                          {product.description}
                        </Card.Text>
                      )}
                      
                      <div className="text-center mb-3">
                        <Badge bg="light" text="dark" className="me-2">
                          {product.category_name || 'Sans catégorie'}
                        </Badge>
                        <Badge bg={stockStatus.variant}>
                          {stockStatus.text}
                        </Badge>
                      </div>
                      
                      <div className="text-center mb-3">
                        <h4 className="text-primary mb-0">
                          {formatPrice(product.price)}
                        </h4>
                        {product.quantity > 0 && (
                          <small className="text-muted">
                            {product.quantity} en stock
                          </small>
                        )}
                      </div>
                      
                      <div className="d-grid">
                        <Button
                          variant="primary"
                          onClick={() => addToCart(product)}
                          disabled={product.quantity <= 0}
                        >
                          {product.quantity > 0 ? '🛒 Ajouter au panier' : '❌ Rupture de stock'}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          ) : (
            <Col>
              <div className="text-center py-5">
                <h4 className="text-muted">Aucun produit trouvé</h4>
                <p className="text-muted">Essayez de modifier vos critères de recherche</p>
              </div>
            </Col>
          )}
        </Row>
      </Container>

      {/* Modal du panier */}
      <Modal show={showCart} onHide={() => setShowCart(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>🛒 Votre Panier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cart.length > 0 ? (
            <>
              {cart.map((item) => (
                <div key={item.id} className="d-flex align-items-center mb-3 p-3 border rounded">
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.name}</h6>
                    <small className="text-muted">{item.category_name}</small>
                    <div className="mt-1">
                      <strong className="text-primary">{formatPrice(item.price)}</strong>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="mx-3">{item.quantity}</span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="ms-2"
                      onClick={() => removeFromCart(item.id)}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between">
                  <h5>Total ({getTotalItems()} articles):</h5>
                  <h5 className="text-primary">{formatPrice(getTotalPrice())}</h5>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <h5 className="text-muted">Votre panier est vide</h5>
              <p className="text-muted">Ajoutez des produits pour commencer vos achats</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCart(false)}>
            Continuer mes achats
          </Button>
          {cart.length > 0 && (
            <Button variant="success" onClick={handleOrder}>
              📱 Commander via WhatsApp
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal de commande */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>📱 Finaliser la commande</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>💡 Comment ça marche ?</strong><br />
            Remplissez vos informations et cliquez sur "Envoyer sur WhatsApp". 
            Votre commande sera envoyée directement à notre équipe via WhatsApp !
          </Alert>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom complet *</Form.Label>
              <Form.Control
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                placeholder="Votre nom complet"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Numéro de téléphone *</Form.Label>
              <Form.Control
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                placeholder="Votre numéro WhatsApp"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Adresse de livraison</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                placeholder="Votre adresse complète (optionnel)"
              />
            </Form.Group>
          </Form>
          
          <div className="border rounded p-3 bg-light">
            <h6>Récapitulatif de la commande :</h6>
            {cart.map((item) => (
              <div key={item.id} className="d-flex justify-content-between">
                <span>{item.name} x{item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total :</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={sendWhatsAppOrder}>
            📱 Envoyer sur WhatsApp
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Shop;
