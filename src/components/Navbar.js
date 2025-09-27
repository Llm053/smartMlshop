import React, { useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setExpanded(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setExpanded(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <BootstrapNavbar 
      bg="primary" 
      variant="dark" 
      expand="lg" 
      fixed="top"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <Container fluid>
        <BootstrapNavbar.Brand 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('/dashboard');
          }}
          className="fw-bold"
        >
          📦 Gestion de Stock
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              active={isActive('/dashboard')}
              onClick={() => handleNavClick('/dashboard')}
              className="nav-link-custom"
            >
              🏠 Dashboard
            </Nav.Link>
            
            <Nav.Link 
              active={isActive('/categories')}
              onClick={() => handleNavClick('/categories')}
              className="nav-link-custom"
            >
              📂 Catégories
            </Nav.Link>
            
            <Nav.Link 
              active={isActive('/products')}
              onClick={() => handleNavClick('/products')}
              className="nav-link-custom"
            >
              📦 Produits
            </Nav.Link>
            
            <Nav.Link 
              active={isActive('/stock')}
              onClick={() => handleNavClick('/stock')}
              className="nav-link-custom"
            >
              📊 Stock
            </Nav.Link>
            
            {user?.role === 'admin' && (
              <Nav.Link 
                active={isActive('/users')}
                onClick={() => handleNavClick('/users')}
                className="nav-link-custom"
              >
                👥 Utilisateurs
              </Nav.Link>
            )}
          </Nav>
          
          <Nav>
            <NavDropdown 
              title={
                <span>
                  👤 {user?.username} 
                  <span className="badge bg-light text-dark ms-1">
                    {user?.role === 'admin' ? 'Admin' : 'Employé'}
                  </span>
                </span>
              } 
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item onClick={() => handleNavClick('/profile')}>
                ⚙️ Mon Profil
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                🚪 Déconnexion
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
