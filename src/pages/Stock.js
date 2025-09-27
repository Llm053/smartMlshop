import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { stockService, productService } from '../services/api';
import SearchFilter from '../components/SearchFilter';

const Stock = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'in',
    quantity: '',
    reason: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('movements');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movementsResponse, productsResponse] = await Promise.all([
        stockService.getAll(),
        productService.getAll()
      ]);
      
      // Vérifier la structure de la réponse
      const movements = movementsResponse.data?.data?.movements || movementsResponse.data?.movements || [];
      const products = productsResponse.data?.data?.products || productsResponse.data?.products || [];
      
      setMovements(movements);
      setProducts(products);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des données';
      toast.error(errorMessage);
      
      // Définir des données vides en cas d'erreur
      setMovements([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMovements = () => {
    return movements.filter(movement => {
      const matchesSearch = movement.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           movement.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           movement.username.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        switch (key) {
          case 'type':
            return movement.type === value;
          case 'date_from':
            return new Date(movement.created_at) >= new Date(value);
          case 'date_to':
            return new Date(movement.created_at) <= new Date(value);
          default:
            return true;
        }
      });

      return matchesSearch && matchesFilters;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.product_id) {
      newErrors.product_id = 'Veuillez sélectionner un produit';
    }
    
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'La quantité doit être un nombre positif';
    }
    
    if (formData.reason && formData.reason.length > 255) {
      newErrors.reason = 'La raison ne peut pas dépasser 255 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const movementData = {
        ...formData,
        quantity: parseInt(formData.quantity)
      };
      
      await stockService.create(movementData);
      toast.success(`Mouvement de stock ${formData.type === 'in' ? 'd\'entrée' : 'de sortie'} enregistré avec succès !`);
      
      setShowModal(false);
      setFormData({ product_id: '', type: 'in', quantity: '', reason: '' });
      loadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ product_id: '', type: 'in', quantity: '', reason: '' });
    setErrors({});
  };

  const handleAddMovement = () => {
    setFormData({ product_id: '', type: 'in', quantity: '', reason: '' });
    setShowModal(true);
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

  const getSelectedProduct = () => {
    return products.find(p => p.id === parseInt(formData.product_id));
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 5) return { variant: 'danger', text: 'Critique' };
    if (quantity <= 10) return { variant: 'warning', text: 'Faible' };
    return { variant: 'success', text: 'Normal' };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
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
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-4 text-primary">📊 Gestion du Stock</h1>
              <p className="lead text-muted">Gérez les entrées et sorties de stock</p>
            </div>
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleAddMovement}
              className="pulse"
            >
              ➕ Nouveau Mouvement
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-0"
              >
                <Tab eventKey="movements" title="📋 Mouvements de Stock" />
                <Tab eventKey="products" title="📦 État des Produits" />
              </Tabs>
            </Card.Header>
            <Card.Body>
              {activeTab === 'movements' && (
                <div>
                  <SearchFilter
                    onSearch={setSearchTerm}
                    onFilter={setFilters}
                    placeholder="Rechercher dans les mouvements..."
                    filters={[
                      {
                        key: 'type',
                        label: 'Type',
                        type: 'select',
                        options: [
                          { value: 'entry', label: 'Entrée' },
                          { value: 'exit', label: 'Sortie' }
                        ]
                      },
                      {
                        key: 'date_from',
                        label: 'Date de début',
                        type: 'date'
                      },
                      {
                        key: 'date_to',
                        label: 'Date de fin',
                        type: 'date'
                      }
                    ]}
                    showFilters={true}
                  />
                  {getFilteredMovements().length > 0 ? (
                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Produit</th>
                            <th>Type</th>
                            <th>Quantité</th>
                            <th>Raison</th>
                            <th>Utilisateur</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredMovements().map((movement) => (
                            <tr key={movement.id}>
                              <td>
                                <Badge bg="secondary">#{movement.id}</Badge>
                              </td>
                              <td>
                                <div>
                                  <strong>{movement.product_name}</strong>
                                  <br />
                                  <small className="text-muted">{movement.category_name}</small>
                                </div>
                              </td>
                              <td>
                                <Badge bg={movement.type === 'in' ? 'success' : 'warning'}>
                                  {movement.type === 'in' ? '📥 Entrée' : '📤 Sortie'}
                                </Badge>
                              </td>
                              <td>
                                <strong>{movement.quantity}</strong>
                              </td>
                              <td>
                                {movement.reason || (
                                  <span className="text-muted">Aucune raison</span>
                                )}
                              </td>
                              <td>
                                <Badge bg="info">{movement.user_name || 'Système'}</Badge>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {formatDate(movement.created_at)}
                                </small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <h4 className="text-muted">Aucun mouvement de stock</h4>
                      <p className="text-muted">Commencez par enregistrer votre premier mouvement</p>
                      <Button variant="primary" onClick={handleAddMovement}>
                        ➕ Enregistrer un Mouvement
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'products' && (
                <div>
                  {products.length > 0 ? (
                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>Produit</th>
                            <th>Catégorie</th>
                            <th>Prix</th>
                            <th>Quantité</th>
                            <th>Statut</th>
                            <th>Valeur Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => {
                            const stockStatus = getStockStatus(product.quantity);
                            const stockValue = product.price * product.quantity;
                            return (
                              <tr key={product.id}>
                                <td>
                                  <div>
                                    <strong>{product.name}</strong>
                                    {product.description && (
                                      <>
                                      
                                      <br />
                                      <small className="text-muted">{product.description}</small>
                                      </>

                                    )}
                                  </div>
                                </td>
                                <td>
                                  {product.category_name ? (
                                    <Badge bg="light" text="dark">{product.category_name}</Badge>
                                  ) : (
                                    <span className="text-muted">Aucune catégorie</span>
                                  )}
                                </td>
                                <td>
                                  <strong className="text-success">{formatPrice(product.price)}</strong>
                                </td>
                                <td>
                                  <Badge bg={stockStatus.variant}>{product.quantity}</Badge>
                                </td>
                                <td>
                                  <Badge bg={stockStatus.variant}>{stockStatus.text}</Badge>
                                </td>
                                <td>
                                  <strong className="text-primary">{formatPrice(stockValue)}</strong>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <h4 className="text-muted">Aucun produit trouvé</h4>
                      <p className="text-muted">Commencez par créer vos premiers produits</p>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal pour créer un mouvement */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>➕ Nouveau Mouvement de Stock</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Produit *</Form.Label>
                  <Form.Select
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleInputChange}
                    isInvalid={!!errors.product_id}
                  >
                    <option value="">Sélectionner un produit</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Stock: {product.quantity})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.product_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type de mouvement *</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="in">📥 Entrée de stock</option>
                    <option value="out">📤 Sortie de stock</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantité *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    isInvalid={!!errors.quantity}
                    placeholder="Entrez la quantité"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.quantity}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Raison</Form.Label>
                  <Form.Control
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    isInvalid={!!errors.reason}
                    placeholder="Raison du mouvement (optionnel)"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.reason}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {formData.product_id && (
              <Alert variant="info">
                <strong>Produit sélectionné :</strong> {getSelectedProduct()?.name}<br />
                <strong>Stock actuel :</strong> {getSelectedProduct()?.quantity}<br />
                <strong>Stock après mouvement :</strong> {
                  formData.type === 'in' 
                    ? (getSelectedProduct()?.quantity || 0) + (parseInt(formData.quantity) || 0)
                    : Math.max(0, (getSelectedProduct()?.quantity || 0) - (parseInt(formData.quantity) || 0))
                }
                {formData.type === 'out' && (parseInt(formData.quantity) || 0) > (getSelectedProduct()?.quantity || 0) && (
                  <div className="text-danger mt-2">
                    ⚠️ Attention : Stock insuffisant !
                  </div>
                )}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Stock;
