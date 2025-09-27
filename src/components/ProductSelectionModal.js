import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Form,
  InputGroup,
  Alert
} from 'react-bootstrap';
import { 
  FiShoppingCart, 
  FiPlus, 
  FiMinus, 
  FiSearch,
  FiPackage,
  FiTag
} from 'react-icons/fi';
import { publicService } from '../services/api';
import { formatPrice } from '../utils/currency';
import './ProductSelectionModal.css';

const ProductSelectionModal = ({ show, onHide, onAddToCart, cartItems = [] }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (show) {
      fetchProducts();
      fetchCategories();
    }
  }, [show]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await publicService.getProducts();
      console.log('API Response:', response.data); // Debug
      
      if (response.data && response.data.data && response.data.data.products) {
        console.log('Produits chargés depuis l\'API:', response.data.data.products.length);
        setProducts(response.data.data.products);
      } else if (response.data && response.data.products) {
        console.log('Produits chargés depuis response.data.products:', response.data.products.length);
        setProducts(response.data.products);
      } else {
        console.log('Aucun produit trouvé, utilisation des données de démonstration');
        // Données de démonstration si pas de produits
        setProducts([
          {
            id: 1,
            name: 'Smartphone Samsung Galaxy',
            price: 150000,
            quantity: 25,
            description: 'Smartphone dernière génération',
            category_name: 'Électronique'
          },
          {
            id: 2,
            name: 'Ordinateur Portable HP',
            price: 450000,
            quantity: 10,
            description: 'PC portable pour bureautique',
            category_name: 'Informatique'
          },
          {
            id: 3,
            name: 'Chaussures Nike Air Max',
            price: 75000,
            quantity: 15,
            description: 'Chaussures de sport confortables',
            category_name: 'Mode'
          }
        ]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      // Données de démonstration en cas d'erreur
      setProducts([
        {
          id: 1,
          name: 'Smartphone Samsung Galaxy',
          price: 150000,
          quantity: 25,
          description: 'Smartphone dernière génération',
          category_name: 'Électronique'
        },
        {
          id: 2,
          name: 'Ordinateur Portable HP',
          price: 450000,
          quantity: 10,
          description: 'PC portable pour bureautique',
          category_name: 'Informatique'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await publicService.getCategories();
      if (response.data && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category_name === selectedCategory
      );
    }

    setFilteredProducts(filtered);
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product) => {
    onAddToCart(product, 1);
  };

  const handleRemoveFromCart = (product) => {
    onAddToCart(product, -1);
  };

  const getUniqueCategories = () => {
    const cats = [...new Set(products.map(p => p.category_name))];
    return cats.filter(Boolean);
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      centered
      className="product-selection-modal"
    >
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FiPackage className="me-2" />
          Sélectionner des produits
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-0">
        {/* Barre de recherche et filtres */}
        <div className="search-filters-bar p-3 bg-light border-bottom">
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Toutes les catégories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} className="text-end">
              <Badge bg="info" className="fs-6">
                {filteredProducts.length} produits
              </Badge>
            </Col>
          </Row>
        </div>

        {/* Liste des produits */}
        <div className="products-container p-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-2">Chargement des produits...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <Alert variant="info" className="text-center">
              <FiPackage size={48} className="mb-3" />
              <h5>Aucun produit trouvé</h5>
              <p>Essayez de modifier vos critères de recherche.</p>
            </Alert>
          ) : (
            <Row>
              {filteredProducts.map(product => {
                const cartQty = getCartQuantity(product.id);
                const isOutOfStock = product.quantity <= 0;
                const isLowStock = product.quantity <= 5 && product.quantity > 0;
                
                return (
                  <Col key={product.id} xl={3} lg={4} md={6} className="mb-3">
                    <Card className={`product-card h-100 ${isOutOfStock ? 'out-of-stock' : ''}`}>
                      <Card.Body className="d-flex flex-column">
                        <div className="product-header mb-2">
                          <Card.Title className="h6 mb-1">{product.name}</Card.Title>
                          <div className="d-flex justify-content-between align-items-center">
                            <Badge bg="outline-secondary" className="category-badge">
                              <FiTag size={12} className="me-1" />
                              {product.category_name || 'Non classé'}
                            </Badge>
                            <div className="stock-badge">
                              {isOutOfStock ? (
                                <Badge bg="danger">Rupture</Badge>
                              ) : isLowStock ? (
                                <Badge bg="warning">Stock faible</Badge>
                              ) : (
                                <Badge bg="success">{product.quantity} en stock</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Card.Text className="text-muted small mb-2">
                          {product.description}
                        </Card.Text>
                        
                        <div className="mt-auto">
                          <div className="price-section mb-3">
                            <h5 className="price text-primary mb-0">
                              {formatPrice(product.price)}
                            </h5>
                          </div>
                          
                          <div className="cart-controls">
                            {cartQty > 0 ? (
                              <div className="quantity-controls d-flex align-items-center justify-content-center">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleRemoveFromCart(product)}
                                  className="quantity-btn"
                                >
                                  <FiMinus />
                                </Button>
                                <span className="quantity-display mx-3 fw-bold">
                                  {cartQty}
                                </span>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleAddToCart(product)}
                                  disabled={isOutOfStock || cartQty >= product.quantity}
                                  className="quantity-btn"
                                >
                                  <FiPlus />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="primary"
                                className="w-100 add-to-cart-btn"
                                onClick={() => handleAddToCart(product)}
                                disabled={isOutOfStock}
                              >
                                <FiShoppingCart className="me-2" />
                                {isOutOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductSelectionModal;
