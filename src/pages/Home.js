import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { publicService } from '../services/api';

const Home = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    loadAdmin();
  }, []);

  const loadAdmin = async () => {
    try {
      const response = await publicService.getAdmin();
      setAdmin(response.data.data.admin);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'admin:', error);
    }
  };

  return (
    <div className="home-page">
      <PublicNavbar />
      
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-3 fw-bold mb-4">
                🛍️ Bienvenue dans notre boutique
              </h1>
              <p className="lead mb-4">
                Découvrez une large gamme de produits de qualité à des prix imbattables. 
                Commandez facilement via WhatsApp et recevez vos articles rapidement.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/shop" variant="light" size="lg" className="pulse">
                  🛒 Voir nos produits
                </Button>
                <Button variant="outline-light" size="lg">
                  📞 Nous contacter
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="hero-image">
                <div className="display-1">🛍️</div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="display-5 fw-bold">Pourquoi choisir notre boutique ?</h2>
            <p className="lead text-muted">Des avantages qui font la différence</p>
          </Col>
        </Row>

        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="display-4 mb-3">📱</div>
                <Card.Title>Commande WhatsApp</Card.Title>
                <Card.Text className="text-muted">
                  Commandez facilement via WhatsApp. Pas besoin de créer de compte, 
                  commandez en quelques clics !
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="display-4 mb-3">🚚</div>
                <Card.Title>Livraison Rapide</Card.Title>
                <Card.Text className="text-muted">
                  Livraison rapide et sécurisée. Recevez vos commandes 
                  dans les plus brefs délais.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="display-4 mb-3">⭐</div>
                <Card.Title>Qualité Garantie</Card.Title>
                <Card.Text className="text-muted">
                  Tous nos produits sont sélectionnés avec soin pour 
                  vous garantir la meilleure qualité.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* How it works Section */}
      <div className="bg-light py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold">Comment ça marche ?</h2>
              <p className="lead text-muted">3 étapes simples pour commander</p>
            </Col>
          </Row>

          <Row>
            <Col md={4} className="text-center mb-4">
              <div className="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                   style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                1
              </div>
              <h4>Parcourez nos produits</h4>
              <p className="text-muted">
                Découvrez notre catalogue de produits et ajoutez ceux qui vous intéressent à votre panier.
              </p>
            </Col>

            <Col md={4} className="text-center mb-4">
              <div className="step-number bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                   style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                2
              </div>
              <h4>Finalisez votre commande</h4>
              <p className="text-muted">
                Remplissez vos informations et cliquez sur "Commander via WhatsApp".
              </p>
            </Col>

            <Col md={4} className="text-center mb-4">
              <div className="step-number bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                   style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                3
              </div>
              <h4>Recevez votre commande</h4>
              <p className="text-muted">
                Nous vous contactons pour confirmer et organiser la livraison de vos articles.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Contact Section */}
      <div className="bg-light py-5" id="contact">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold">📞 Contact</h2>
              <p className="lead text-muted">Notre équipe est là pour vous aider</p>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={6}>
              <Card className="text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="display-4 mb-3">👨‍💼</div>
                  <Card.Title>Administrateur</Card.Title>
                  {admin ? (
                    <>
                      <Card.Text className="mb-3">
                        <strong>{admin.username}</strong>
                      </Card.Text>
                      <Card.Text className="text-muted mb-3">
                        📧 {admin.email}
                      </Card.Text>
                      {admin.phone && (
                        <Card.Text className="text-muted mb-3">
                          📱 {admin.phone}
                        </Card.Text>
                      )}
                      <Button 
                        variant="success" 
                        href={`https://wa.me/221${admin.phone || '701234567'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📱 Contacter sur WhatsApp
                      </Button>
                    </>
                  ) : (
                    <Card.Text className="text-muted">
                      Chargement des informations...
                    </Card.Text>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CTA Section */}
      <Container className="py-5">
        <Row className="text-center">
          <Col>
            <h2 className="display-5 fw-bold mb-4">Prêt à commander ?</h2>
            <p className="lead text-muted mb-4">
              Découvrez nos produits et passez votre première commande
            </p>
            <Button as={Link} to="/shop" variant="primary" size="lg" className="pulse">
              🛒 Commencer mes achats
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <Container>
          <Row>
            <Col md={6}>
              <h5>🛍️ Ma Boutique</h5>
              <p className="text-muted mb-0">
                Votre boutique en ligne de confiance pour tous vos besoins.
              </p>
            </Col>
            <Col md={6} className="text-end">
              <p className="text-muted mb-0">
                © 2024 Ma Boutique. Tous droits réservés.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default Home;
