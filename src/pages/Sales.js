import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Modal, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiPlus } from 'react-icons/fi';
import { formatPrice, formatCurrency, formatDate } from '../utils/currency';
import salesService from '../services/salesService';
import ProductSelectionModal from '../components/ProductSelectionModal';
import CartModal from '../components/CartModal';
import FloatingCart from '../components/FloatingCart';
import SimpleInvoice from '../components/SimpleInvoice';
import PrintableReceipt from '../components/PrintableReceipt';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  
  // Nouveaux états pour le système de panier
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [saleLoading, setSaleLoading] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await salesService.getAll();
      const salesData = response.data?.data?.ventes || response.data?.ventes || [];
      
      // Filtrer pour ne garder que les ventes validées (exclure les commandes en attente)
      const validatedSales = salesData.filter(sale => 
        sale.sale_type === 'in_store' || 
        (sale.sale_type === 'online' && sale.status === 'completed')
      );
      
      setSales(validatedSales);
    } catch (error) {
      console.error('Erreur lors du chargement des ventes:', error);
      setError('Erreur lors du chargement des ventes');
      toast.error('Erreur lors du chargement des ventes');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour gérer le panier
  const handleAddToCart = (product, quantityChange) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product_id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityChange;
        
        if (newQuantity <= 0) {
          // Retirer l'article du panier
          return prevItems.filter(item => item.product_id !== product.id);
        } else if (newQuantity <= product.quantity) {
          // Mettre à jour la quantité
          return prevItems.map(item =>
            item.product_id === product.id
              ? { ...item, quantity: newQuantity }
              : item
          );
        }
        return prevItems; // Pas de changement si quantité dépasse le stock
      } else if (quantityChange > 0) {
        // Ajouter un nouvel article
        return [...prevItems, {
          product_id: product.id,
          product_name: product.name,
          unit_price: product.price,
          quantity: quantityChange,
          stock_available: product.quantity
        }];
      }
      
      return prevItems;
    });
  };

  const handleUpdateCartQuantity = (productId, quantityChange) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.product_id === productId) {
          const newQuantity = item.quantity + quantityChange;
          if (newQuantity <= 0) {
            return null; // Will be filtered out
          } else if (newQuantity <= item.stock_available) {
            return { ...item, quantity: newQuantity };
          }
        }
        return item;
      }).filter(Boolean);
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.product_id !== productId));
  };

  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  };

  const handleConfirmSale = async (saleData) => {
    setSaleLoading(true);
    try {
      await salesService.create(saleData);
      toast.success('Vente enregistrée avec succès !');
      
      // Réinitialiser le panier et fermer les modals
      setCartItems([]);
      setShowCartModal(false);
      setShowProductModal(false);
      
      // Recharger la liste des ventes
      await loadSales();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la vente:', error);
      const message = error.response?.data?.message || 'Erreur lors de l\'enregistrement de la vente';
      toast.error(message);
    } finally {
      setSaleLoading(false);
    }
  };

  // Filtrer les ventes
  const getFilteredSales = () => {
    return sales.filter(sale => {
      const matchesSearch = 
        sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toString().includes(searchTerm) ||
        sale.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = !dateFilter || 
        new Date(sale.created_at).toDateString() === new Date(dateFilter).toDateString();

      const matchesStatus = !statusFilter || sale.status === statusFilter;

      return matchesSearch && matchesDate && matchesStatus;
    });
  };

  // Voir la facture
  const viewInvoice = async (sale) => {
    try {
      const response = await salesService.getById(sale.id);
      const saleData = response.data?.data || response.data;
      setSelectedSale(saleData);
      setShowInvoice(true);
    } catch (error) {
      console.error('Erreur lors du chargement de la facture:', error);
      toast.error('Erreur lors du chargement de la facture');
    }
  };

  // Voir la facture imprimable
  const viewReceipt = async (sale) => {
    try {
      const response = await salesService.getById(sale.id);
      const saleData = response.data?.data || response.data;
      setSelectedSale(saleData);
      setShowReceipt(true);
    } catch (error) {
      console.error('Erreur lors du chargement de la facture:', error);
      toast.error('Erreur lors du chargement de la facture');
    }
  };

  // Annuler une vente
  const cancelSale = async (saleId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette vente ? Cette action est irréversible.')) {
      return;
    }

    try {
      setCancellingId(saleId);
      await salesService.cancel(saleId);
      toast.success('Vente annulée avec succès');
      await loadSales();
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      const message = error.response?.data?.message || 'Erreur lors de l\'annulation de la vente';
      toast.error(message);
    } finally {
      setCancellingId(null);
    }
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge bg="success">Terminée</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Annulée</Badge>;
      case 'pending':
        return <Badge bg="warning">En attente</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const filteredSales = getFilteredSales();

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-2">Chargement des ventes...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Gestion des Ventes</h2>
            <Button 
              variant="success" 
              onClick={() => setShowProductModal(true)}
              className="d-flex align-items-center"
            >
              <FiPlus className="me-2" />
              Nouvelle Vente
            </Button>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Filtres */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Filtres et Recherche</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Recherche</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>🔍</InputGroup.Text>
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
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
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
                      <option value="completed">Terminées</option>
                      <option value="cancelled">Annulées</option>
                      <option value="pending">En attente</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Liste des ventes */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                Liste des Ventes ({filteredSales.length} résultat{filteredSales.length !== 1 ? 's' : ''})
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {filteredSales.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">Aucune vente trouvée</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Numéro Vente</th>
                        <th>Client</th>
                        <th>Téléphone</th>
                        <th>Montant</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Vendeur</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales.map((sale) => (
                        <tr key={sale.id}>
                          <td>
                            <strong>{sale.numero_vente || `#${sale.id}`}</strong>
                          </td>
                          <td>
                            <div>
                              <strong>{sale.customer_name}</strong>
                              {sale.customer_email && (
                                <div className="text-muted small">{sale.customer_email}</div>
                              )}
                            </div>
                          </td>
                          <td>{sale.customer_phone || '-'}</td>
                          <td>
                            <strong className="text-success">
                              {formatCurrency(sale.total_amount)}
                            </strong>
                          </td>
                          <td>
                            <div className="small">
                              {formatDate(sale.created_at)}
                            </div>
                          </td>
                          <td>
                            <Badge 
                              bg={sale.sale_type === 'in_store' ? 'success' : 'info'}
                              className="sale-type-badge"
                            >
                              {sale.sale_type === 'in_store' ? '🏪 Magasin' : '🌐 En ligne'}
                            </Badge>
                          </td>
                          <td>{sale.created_by_name || '-'}</td>
                          <td>{getStatusBadge(sale.status)}</td>
                          <td>
                            <div className="d-flex gap-1 flex-wrap">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => viewReceipt(sale)}
                                title="Imprimer facture"
                              >
                                🖨️ Imprimer
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => viewInvoice(sale)}
                                title="Voir les détails"
                              >
                                👁️ Détails
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

      {/* Modal de facture détaillée */}
      <SimpleInvoice
        show={showInvoice}
        onHide={() => {
          setShowInvoice(false);
          setSelectedSale(null);
        }}
        sale={selectedSale}
      />

      {/* Modal de facture imprimable */}
      <PrintableReceipt
        show={showReceipt}
        onHide={() => {
          setShowReceipt(false);
          setSelectedSale(null);
        }}
        sale={selectedSale}
      />

      {/* Modal de sélection des produits */}
      <ProductSelectionModal
        show={showProductModal}
        onHide={() => setShowProductModal(false)}
        onAddToCart={handleAddToCart}
        cartItems={cartItems}
      />

      {/* Modal du panier */}
      <CartModal
        show={showCartModal}
        onHide={() => setShowCartModal(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onConfirmSale={handleConfirmSale}
        loading={saleLoading}
      />

      {/* Panier flottant */}
      <FloatingCart
        cartItems={cartItems}
        total={calculateCartTotal()}
        onClick={() => setShowCartModal(true)}
      />
    </Container>
  );
};

export default Sales;