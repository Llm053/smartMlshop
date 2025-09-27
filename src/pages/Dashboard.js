import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert } from 'react-bootstrap';
import { productService, stockService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    products: { total_products: 0, total_quantity: 0, average_price: 0, low_stock_count: 0 },
    movements: { total_movements: 0, total_ins: 0, total_outs: 0 }
  });
  const [recentMovements, setRecentMovements] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productStats, movementStats, recentMovementsData, lowStockData] = await Promise.all([
        productService.getStats(),
        stockService.getStats(),
        stockService.getRecent(5),
        productService.getLowStock(10)
      ]);

      setStats({
        products: productStats.data?.data?.stats || productStats.data?.stats || { total_products: 0, total_quantity: 0, average_price: 0, low_stock_count: 0 },
        movements: movementStats.data?.data?.stats || movementStats.data?.stats || { total_movements: 0, total_ins: 0, total_outs: 0 }
      });
      setRecentMovements(recentMovementsData.data?.data?.movements || recentMovementsData.data?.movements || []);
      setLowStockProducts(lowStockData.data?.data?.products || lowStockData.data?.products || []);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'xof'
    }).format(price);
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
          <h1 className="display-4 text-primary">
            🏠 Dashboard
          </h1>
          <p className="lead text-muted">
            Bienvenue, {user?.username} ! Voici un aperçu de votre gestion de stock.
          </p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Statistiques principales */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="stats-card h-100">
            <div className="stats-number">{stats.products.total_products}</div>
            <div className="stats-label">Produits Total</div>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stats-card h-100" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
            <div className="stats-number">{stats.products.total_quantity}</div>
            <div className="stats-label">Quantité Total</div>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stats-card h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <div className="stats-number">{formatPrice(stats.products.average_price)}</div>
            <div className="stats-label">Prix Moyen</div>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stats-card h-100" style={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
            <div className="stats-number">{stats.products.low_stock_count}</div>
            <div className="stats-label">Stock Faible</div>
          </Card>
        </Col>
      </Row>

      {/* Statistiques des mouvements */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">📥 Entrées</h5>
            </Card.Header>
            <Card.Body className="text-center">
              <h2 className="text-success">{stats.movements.total_ins}</h2>
              <p className="text-muted mb-0">Mouvements d'entrée</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Header className="bg-warning text-white">
              <h5 className="mb-0">📤 Sorties</h5>
            </Card.Header>
            <Card.Body className="text-center">
              <h2 className="text-warning">{stats.movements.total_outs}</h2>
              <p className="text-muted mb-0">Mouvements de sortie</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">📊 Total</h5>
            </Card.Header>
            <Card.Body className="text-center">
              <h2 className="text-info">{stats.movements.total_movements}</h2>
              <p className="text-muted mb-0">Mouvements total</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Produits en stock faible */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header className="bg-warning text-white">
              <h5 className="mb-0">⚠️ Stock Faible</h5>
            </Card.Header>
            <Card.Body>
              {lowStockProducts.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <strong>{product.name}</strong>
                            <br />
                            <small className="text-muted">{product.category_name}</small>
                          </td>
                          <td>
                            <Badge bg={product.quantity <= 5 ? 'danger' : 'warning'}>
                              {product.quantity}
                            </Badge>
                          </td>
                          <td>
                            {product.quantity <= 5 ? (
                              <Badge bg="danger">Critique</Badge>
                            ) : (
                              <Badge bg="warning">Faible</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <p>🎉 Aucun produit en stock faible !</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Mouvements récents */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">🕒 Mouvements Récents</h5>
            </Card.Header>
            <Card.Body>
              {recentMovements.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Type</th>
                        <th>Quantité</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentMovements.map((movement) => (
                        <tr key={movement.id}>
                          <td>
                            <strong>{movement.product_name}</strong>
                            <br />
                            <small className="text-muted">{movement.category_name}</small>
                          </td>
                          <td>
                            <Badge bg={movement.type === 'in' ? 'success' : 'warning'}>
                              {movement.type === 'in' ? 'Entrée' : 'Sortie'}
                            </Badge>
                          </td>
                          <td>{movement.quantity}</td>
                          <td>
                            <small>{formatDate(movement.created_at)}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <p>Aucun mouvement récent</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
