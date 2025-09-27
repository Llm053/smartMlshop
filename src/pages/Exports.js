import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Table, Badge } from 'react-bootstrap';
import { FiDownload, FiFileText, FiFile, FiBarChart, FiCalendar, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { productService, stockService, salesService } from '../services/api';
import './Exports.css';

const Exports = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [sales, setSales] = useState([]);
  const [exportType, setExportType] = useState('products');
  const [exportFormat, setExportFormat] = useState('excel');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, movementsRes, salesRes] = await Promise.all([
        productService.getAll(),
        stockService.getAll(),
        salesService.getAll()
      ]);
      setProducts(productsRes.data.data.products || []);
      setMovements(movementsRes.data.data.movements || []);
      setSales(salesRes.data.data.ventes || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      let data = [];
      let filename = '';

      switch (exportType) {
        case 'products':
          data = products;
          filename = `produits_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'movements':
          data = movements;
          filename = `mouvements_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'stock':
          data = products.map(p => ({
            ...p,
            stock_value: (p.stock_quantity || 0) * (p.price || 0)
          }));
          filename = `stock_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'sales':
          data = sales.map(sale => ({
            id: sale.id,
            date: new Date(sale.created_at).toLocaleDateString('fr-FR'),
            client: sale.customer_name,
            telephone: sale.customer_phone || '-',
            email: sale.customer_email || '-',
            montant: sale.total_amount,
            statut: sale.status,
            type: sale.sale_type === 'in_store' ? 'Magasin' : 'En ligne',
            vendeur: sale.created_by_name || '-'
          }));
          filename = `ventes_${new Date().toISOString().split('T')[0]}`;
          break;
        default:
          data = products;
          filename = `export_${new Date().toISOString().split('T')[0]}`;
      }

      // Simuler l'export (en réalité, vous appelleriez l'API backend)
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Export ${exportFormat.toUpperCase()} téléchargé avec succès !`);

    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  const getExportPreview = () => {
    switch (exportType) {
      case 'products':
        return products.slice(0, 5);
      case 'movements':
        return movements.slice(0, 5);
      case 'stock':
        return products.slice(0, 5).map(p => ({
          ...p,
          stock_value: (p.stock_quantity || 0) * (p.price || 0)
        }));
      case 'sales':
        return sales.slice(0, 5);
      default:
        return [];
    }
  };

  const getExportColumns = () => {
    switch (exportType) {
      case 'products':
        return ['ID', 'Nom', 'Catégorie', 'Prix', 'Stock', 'Stock Min'];
      case 'movements':
        return ['ID', 'Produit', 'Type', 'Quantité', 'Prix Unitaire', 'Date', 'Utilisateur'];
      case 'stock':
        return ['ID', 'Nom', 'Catégorie', 'Prix', 'Stock', 'Valeur Stock'];
      case 'sales':
        return ['ID', 'Date', 'Client', 'Téléphone', 'Montant', 'Statut', 'Type', 'Vendeur'];
      default:
        return [];
    }
  };

  const getExportData = (item) => {
    switch (exportType) {
      case 'products':
        return [
          item.id,
          item.name,
          item.category_name,
          `${item.price} FCFA`,
          item.stock_quantity,
          item.min_stock
        ];
      case 'movements':
        return [
          item.id,
          item.product_name,
          item.type === 'entry' ? 'Entrée' : 'Sortie',
          item.quantity,
          `${item.product_price || 0} FCFA`,
          new Date(item.created_at).toLocaleDateString('fr-FR'),
          item.username
        ];
      case 'stock':
        return [
          item.id,
          item.name,
          item.category_name,
          `${item.price} FCFA`,
          item.stock_quantity,
          `${item.stock_value} FCFA`
        ];
      case 'sales':
        return [
          item.id,
          new Date(item.created_at).toLocaleDateString('fr-FR'),
          item.customer_name,
          item.customer_phone || '-',
          `${item.total_amount} FCFA`,
          item.status === 'completed' ? 'Terminée' : item.status === 'pending' ? 'En attente' : 'Annulée',
          item.sale_type === 'in_store' ? 'Magasin' : 'En ligne',
          item.created_by_name || '-'
        ];
      default:
        return [];
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title">
            <FiDownload className="me-2" />
            Exports de Données
          </h2>
          <p className="text-muted">Exporter vos données en différents formats</p>
        </div>
      </div>

      <Row>
        {/* Configuration d'export */}
        <Col lg={4} className="mb-4">
          <Card className="export-config-card">
            <Card.Header className="export-header">
              <h5 className="export-title">
                <FiFileText className="me-2" />
                Configuration
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Type de données</Form.Label>
                  <Form.Select
                    value={exportType}
                    onChange={(e) => setExportType(e.target.value)}
                    className="form-select-modern"
                  >
                    <option value="products">📦 Produits</option>
                    <option value="movements">📊 Mouvements de Stock</option>
                    <option value="stock">📈 État des Stocks</option>
                    <option value="sales">💰 Ventes</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Format d'export</Form.Label>
                  <Form.Select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="form-select-modern"
                  >
                    <option value="excel">📊 Excel (.xlsx)</option>
                    <option value="csv">📄 CSV (.csv)</option>
                    <option value="json">📋 JSON (.json)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Période (optionnel)</Form.Label>
                  <div className="date-range">
                    <Form.Control
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      className="form-control-modern"
                      placeholder="Date de début"
                    />
                    <span className="date-separator">à</span>
                    <Form.Control
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      className="form-control-modern"
                      placeholder="Date de fin"
                    />
                  </div>
                </Form.Group>

                <Button 
                  variant="success" 
                  onClick={handleExport}
                  disabled={loading}
                  className="export-btn w-100"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Export en cours...
                    </>
                  ) : (
                    <>
                      <FiDownload className="me-2" />
                      Exporter les Données
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Aperçu des données */}
        <Col lg={8}>
          <Card className="export-preview-card">
            <Card.Header className="export-header">
              <h5 className="export-title">
                <FiBarChart className="me-2" />
                Aperçu des Données
              </h5>
              <Badge bg="info" className="data-count">
                {exportType === 'products' && `${products.length} produits`}
                {exportType === 'movements' && `${movements.length} mouvements`}
                {exportType === 'stock' && `${products.length} produits`}
                {exportType === 'sales' && `${sales.length} ventes`}
              </Badge>
            </Card.Header>
            <Card.Body>
              {getExportPreview().length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="export-table">
                    <thead>
                      <tr>
                        {getExportColumns().map((column, index) => (
                          <th key={index}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getExportPreview().map((item, index) => (
                        <tr key={index}>
                          {getExportData(item).map((data, dataIndex) => (
                            <td key={dataIndex}>{data}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="no-data">
                  <FiFile size={48} className="text-muted mb-3" />
                  <p className="text-muted">Aucune donnée à exporter</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Types d'export disponibles */}
      <Row className="mt-4">
        <Col>
          <Card className="export-types-card">
            <Card.Header className="export-header">
              <h5 className="export-title">
                <FiFile className="me-2" />
                Types d'Export Disponibles
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="export-type-item">
                    <div className="export-icon">
                      <FiBarChart size={24} />
                    </div>
                    <h6>Produits</h6>
                    <p className="text-muted">Liste complète des produits avec prix et stock</p>
                    <Badge bg="primary">{products.length} produits</Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="export-type-item">
                    <div className="export-icon">
                      <FiCalendar size={24} />
                    </div>
                    <h6>Mouvements</h6>
                    <p className="text-muted">Historique des entrées et sorties de stock</p>
                    <Badge bg="success">{movements.length} mouvements</Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="export-type-item">
                    <div className="export-icon">
                      <FiFileText size={24} />
                    </div>
                    <h6>État des Stocks</h6>
                    <p className="text-muted">Valeur et état actuel des stocks</p>
                    <Badge bg="info">{products.length} produits</Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="export-type-item">
                    <div className="export-icon">
                      <FiDownload size={24} />
                    </div>
                    <h6>Ventes</h6>
                    <p className="text-muted">Historique des ventes et facturations</p>
                    <Badge bg="warning">{sales.length} ventes</Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Exports;
