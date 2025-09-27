import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PublicNavbar = () => {
  return (
    <BootstrapNavbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/shop" className="fw-bold text-primary">
          🛍️ Ma Boutique
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/shop" className="fw-semibold">
              🏠 Accueil
            </Nav.Link>
            <Nav.Link href="#contact" className="fw-semibold">
              📞 Contact
            </Nav.Link>
          </Nav>
          
          <Nav>
            <Nav.Link as={Link} to="/login" className="fw-semibold">
              🔐 Admin
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default PublicNavbar;
