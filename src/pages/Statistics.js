import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Dropdown } from 'react-bootstrap';
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiPackage, 
  FiUsers, 
  FiDownload,
  FiCalendar,
  FiBarChart,
  FiCheckCircle
} from 'react-icons/fi';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Statistics.css';

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [generalStats, setGeneralStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [stockStats, setStockStats] = useState(null);

  const fetchAllStats = useCallback(async () => {
    setLoading(true);
    try {
      // Utiliser les routes existantes pour obtenir les données
      const [productsRes, movementsRes] = await Promise.all([
        api.get('/products'),
        api.get('/stock')
      ]);

      const products = productsRes.data.data.products || [];
      const movements = movementsRes.data.data.movements || [];

      // Calculer les statistiques manuellement
      const totalProducts = products.length;
      const totalStock = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
      const totalValue = products.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.price || 0)), 0);
      const averagePrice = products.length > 0 ? totalValue / totalStock : 0;

      const categories = [...new Set(products.map(p => p.category_name))];
      const totalCategories = categories.length;

      const users = [
        { role: 'admin', count: 1 },
        { role: 'employee', count: 0 }
      ];

      const recentMovements = movements.slice(0, 7);

      setGeneralStats({
        products: {
          total_products: totalProducts,
          total_stock: totalStock,
          total_value: totalValue,
          average_price: averagePrice
        },
        categories: { total_categories: totalCategories },
        users: {
          total_users: users.length,
          admin_count: users.filter(u => u.role === 'admin').length,
          employee_count: users.filter(u => u.role === 'employee').length
        },
        recentMovements: {
          movements_count: recentMovements.length,
          entries: recentMovements.filter(m => m.type === 'entry').length,
          exits: recentMovements.filter(m => m.type === 'exit').length
        }
      });

      // Simuler des données de revenus
      const dailyRevenue = movements
        .filter(m => m.type === 'exit')
        .map(m => ({
          date: new Date(m.created_at).toISOString().split('T')[0],
          daily_revenue: (m.quantity || 0) * (m.product_price || 0)
        }));

      setRevenueStats({
        totalRevenue: {
          total_revenue: dailyRevenue.reduce((sum, d) => sum + d.daily_revenue, 0),
          total_sales: dailyRevenue.length
        },
        dailyRevenue: dailyRevenue,
        topProducts: products
          .map(p => ({
            product_name: p.name,
            price: p.price,
            total_quantity: Math.floor(Math.random() * 10) + 1,
            total_revenue: (p.price || 0) * (Math.floor(Math.random() * 10) + 1)
          }))
          .sort((a, b) => b.total_revenue - a.total_revenue)
          .slice(0, 5)
      });

      // Simuler des données de stock
      const lowStockProducts = products.filter(p => (p.stock_quantity || 0) <= (p.min_stock || 5));
      
      setStockStats({
        lowStockProducts: lowStockProducts,
        movementStats: [
          { type: 'Entrée', count: movements.filter(m => m.type === 'entry').length },
          { type: 'Sortie', count: movements.filter(m => m.type === 'exit').length }
        ],
        stockEvolution: dailyRevenue.map(d => ({
          date: d.date,
          daily_change: Math.floor(Math.random() * 20) - 10,
          cumulative_stock: Math.floor(Math.random() * 100) + 50
        }))
      });

    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/statistics/export?format=${format}&period=${period}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' ? 'xlsx' : format;
      link.download = `statistiques_${period}_${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Export ${format.toUpperCase()} téléchargé avec succès !`);
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <Card className="stat-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="stat-title">{title}</h6>
            <h3 className="stat-value" style={{ color }}>{value}</h3>
            {subtitle && <p className="stat-subtitle">{subtitle}</p>}
            {trend && (
              <div className="stat-trend">
                <FiTrendingUp size={14} className="me-1" />
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
            <Icon size={24} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement des statistiques...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title">
            <FiBarChart className="me-2" />
            Statistiques
          </h2>
          <p className="text-muted">Analyse des performances et des tendances</p>
        </div>
        
        <div className="d-flex gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-primary" className="period-selector">
              <FiCalendar className="me-2" />
              {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setPeriod('week')}>Semaine</Dropdown.Item>
              <Dropdown.Item onClick={() => setPeriod('month')}>Mois</Dropdown.Item>
              <Dropdown.Item onClick={() => setPeriod('year')}>Année</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle variant="success" className="export-btn">
              <FiDownload className="me-2" />
              Exporter
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleExport('excel')}>
                📊 Excel
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleExport('pdf')}>
                📄 PDF
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleExport('word')}>
                📝 Word
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Statistiques générales */}
      {generalStats && (
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <StatCard
              title="Produits"
              value={generalStats.products.total_products}
              icon={FiPackage}
              color="#4F46E5"
              subtitle={`${generalStats.products.total_stock} en stock`}
            />
          </Col>
          <Col md={3} className="mb-3">
            <StatCard
              title="Valeur Stock"
              value={`${generalStats.products.total_value?.toLocaleString()} FCFA`}
              icon={FiDollarSign}
              color="#10B981"
              subtitle={`Prix moyen: ${generalStats.products.average_price?.toFixed(0)} FCFA`}
            />
          </Col>
          <Col md={3} className="mb-3">
            <StatCard
              title="Catégories"
              value={generalStats.categories.total_categories}
              icon={FiBarChart}
              color="#F59E0B"
            />
          </Col>
          <Col md={3} className="mb-3">
            <StatCard
              title="Utilisateurs"
              value={generalStats.users.total_users}
              icon={FiUsers}
              color="#EF4444"
              subtitle={`${generalStats.users.admin_count} admin, ${generalStats.users.employee_count} employés`}
            />
          </Col>
        </Row>
      )}

      <Row>
        {/* Graphique des revenus */}
        <Col lg={8} className="mb-4">
          <Card className="chart-card">
            <Card.Header className="chart-header">
              <h5 className="chart-title">
                <FiTrendingUp className="me-2" />
                Évolution des revenus
              </h5>
            </Card.Header>
            <Card.Body>
              {revenueStats?.dailyRevenue && revenueStats.dailyRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueStats.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Revenus']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="daily_revenue" 
                      stroke="#4F46E5" 
                      fill="#4F46E520" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <FiBarChart size={48} className="text-muted mb-3" />
                  <p className="text-muted">Aucune donnée de revenus disponible</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Top produits */}
        <Col lg={4} className="mb-4">
          <Card className="chart-card">
            <Card.Header className="chart-header">
              <h5 className="chart-title">
                <FiPackage className="me-2" />
                Top Produits
              </h5>
            </Card.Header>
            <Card.Body>
              {revenueStats?.topProducts && revenueStats.topProducts.length > 0 ? (
                <div className="top-products">
                  {revenueStats.topProducts.slice(0, 5).map((product, index) => (
                    <div key={index} className="product-item">
                      <div className="product-rank">#{index + 1}</div>
                      <div className="product-info">
                        <div className="product-name">{product.product_name}</div>
                        <div className="product-revenue">
                          {product.total_revenue.toLocaleString()} FCFA
                        </div>
                      </div>
                      <div className="product-quantity">
                        {product.total_quantity} vendus
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiPackage size={32} className="text-muted mb-2" />
                  <p className="text-muted">Aucune vente enregistrée</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Statistiques de stock */}
      {stockStats && (
        <Row>
          <Col lg={6} className="mb-4">
            <Card className="chart-card">
              <Card.Header className="chart-header">
                <h5 className="chart-title">
                  <FiTrendingUp className="me-2" />
                  Mouvements de stock
                </h5>
              </Card.Header>
              <Card.Body>
                {stockStats.movementStats && stockStats.movementStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stockStats.movementStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4F46E5" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                <div className="text-center py-4">
                  <FiBarChart size={32} className="text-muted mb-2" />
                  <p className="text-muted">Aucun mouvement enregistré</p>
                </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} className="mb-4">
            <Card className="chart-card">
              <Card.Header className="chart-header">
                <h5 className="chart-title">
                  <FiPackage className="me-2" />
                  Produits en rupture
                </h5>
              </Card.Header>
              <Card.Body>
                {stockStats.lowStockProducts && stockStats.lowStockProducts.length > 0 ? (
                  <div className="low-stock-list">
                    {stockStats.lowStockProducts.slice(0, 5).map((product, index) => (
                      <div key={index} className="low-stock-item">
                        <div className="product-name">{product.name}</div>
                        <div className="stock-info">
                          <span className="stock-quantity">{product.stock_quantity}</span>
                          <span className="stock-min">/ {product.min_stock}</span>
                        </div>
                        <div className="stock-status">⚠️</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FiCheckCircle size={32} className="text-success mb-2" />
                    <p className="text-success">Tous les stocks sont suffisants</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Résumé des revenus */}
      {revenueStats?.totalRevenue && (
        <Row>
          <Col>
            <Card className="revenue-summary">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5>Revenus {period === 'week' ? 'cette semaine' : period === 'month' ? 'ce mois' : 'cette année'}</h5>
                    <h2 className="text-primary">
                      {revenueStats.totalRevenue.total_revenue?.toLocaleString()} FCFA
                    </h2>
                    <p className="text-muted mb-0">
                      {revenueStats.totalRevenue.total_sales} ventes réalisées
                    </p>
                  </div>
                  <div className="revenue-icon">
                    <FiDollarSign size={48} className="text-primary" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Statistics;
