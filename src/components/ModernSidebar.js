import React, { useState } from 'react';
import { Nav, Navbar, Offcanvas, Container } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiLayers,
  FiTrendingUp,
  FiBarChart,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
  FiShield,
  FiDownload,
  FiShoppingCart,
  FiGlobe
} from 'react-icons/fi';
import './ModernSidebar.css';

const ModernSidebar = () => {
  const [show, setShow] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: FiHome,
      label: 'Tableau de Bord',
      color: '#4F46E5'
    },
    {
      path: '/categories',
      icon: FiLayers,
      label: 'Catégories',
      color: '#10B981'
    },
    {
      path: '/products',
      icon: FiPackage,
      label: 'Produits',
      color: '#F59E0B'
    },
    {
      path: '/stock',
      icon: FiTrendingUp,
      label: 'Stock',
      color: '#EF4444'
    },
    {
      path: '/statistics',
      icon: FiBarChart,
      label: 'Statistiques',
      color: '#8B5CF6'
    },
    {
      path: '/sales',
      icon: FiShoppingCart,
      label: 'Ventes',
      color: '#F59E0B'
    },
    {
      path: '/loyal-customers',
      icon: FiUsers,
      label: 'Clients Fidèles',
      color: '#8B5CF6'
    },
    {
      path: '/online-orders',
      icon: FiGlobe,
      label: 'Commandes en Ligne',
      color: '#06B6D4'
    },
    {
      path: '/user-management',
      icon: FiShield,
      label: 'Gestion Utilisateurs',
      color: '#DC2626',
      adminOnly: true
    },
    {
      path: '/exports',
      icon: FiDownload,
      label: 'Exports',
      color: '#84CC16'
    },
    {
      path: '/users',
      icon: FiUsers,
      label: 'Utilisateurs',
      color: '#06B6D4',
      adminOnly: true
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  return (
    <>
      {/* Bouton de menu pour mobile */}
      <Navbar className="modern-navbar d-lg-none" bg="white" expand="lg">
        <Container fluid>
          <Navbar.Brand className="modern-brand">
            <FiMenu 
              size={24} 
              onClick={handleShow}
              className="menu-toggle"
            />
            <span className="brand-text">Stock Manager</span>
          </Navbar.Brand>
        </Container>
      </Navbar>

      {/* Sidebar pour desktop */}
      <div className="modern-sidebar d-none d-lg-block">
        <div className="sidebar-header">
          <div className="brand-section">
            <div className="brand-icon">
              <FiPackage size={28} />
            </div>
            <div className="brand-info">
              <h4 className="brand-title">Stock Manager</h4>
              <p className="brand-subtitle">Gestion moderne</p>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          <Nav className="flex-column sidebar-nav">
            {filteredMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Nav.Item key={index} className="nav-item-modern">
                  <Link 
                    to={item.path} 
                    className={`nav-link-modern ${isActive ? 'active' : ''}`}
                    style={{ '--item-color': item.color }}
                  >
                    <Icon size={20} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {isActive && <div className="active-indicator" />}
                  </Link>
                </Nav.Item>
              );
            })}
          </Nav>
        </div>

        {/* Section utilisateur et actions */}
        <div className="sidebar-footer">
          <div className="user-section">
            <div className="user-avatar">
              {user?.role === 'admin' ? <FiShield size={20} /> : <FiUser size={20} />}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.username}</p>
              <p className="user-role">{user?.role === 'admin' ? 'Administrateur' : 'Employé'}</p>
            </div>
          </div>
          
          <div className="footer-actions">
            <Link to="/profile" className="footer-link">
              <FiUser size={18} />
              <span>Mon Compte</span>
            </Link>
            <Link to="/settings" className="footer-link">
              <FiSettings size={18} />
              <span>Paramètres</span>
            </Link>
            <button onClick={handleLogout} className="footer-link logout-btn">
              <FiLogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Offcanvas pour mobile */}
      <Offcanvas show={show} onHide={handleClose} placement="start" className="modern-offcanvas">
        <Offcanvas.Header className="offcanvas-header-modern">
          <div className="offcanvas-brand">
            <div className="brand-icon">
              <FiPackage size={24} />
            </div>
            <div className="brand-info">
              <h4 className="brand-title">Stock Manager</h4>
              <p className="brand-subtitle">Gestion moderne</p>
            </div>
          </div>
          <FiX size={24} onClick={handleClose} className="close-btn" />
        </Offcanvas.Header>
        
        <Offcanvas.Body className="offcanvas-body-modern">
          <Nav className="flex-column sidebar-nav">
            {filteredMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Nav.Item key={index} className="nav-item-modern">
                  <Link 
                    to={item.path} 
                    className={`nav-link-modern ${isActive ? 'active' : ''}`}
                    onClick={handleClose}
                    style={{ '--item-color': item.color }}
                  >
                    <Icon size={20} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {isActive && <div className="active-indicator" />}
                  </Link>
                </Nav.Item>
              );
            })}
          </Nav>

          <div className="mobile-footer">
            <div className="user-section">
              <div className="user-avatar">
                {user?.role === 'admin' ? <FiShield size={20} /> : <FiUser size={20} />}
              </div>
              <div className="user-info">
                <p className="user-name">{user?.username}</p>
                <p className="user-role">{user?.role === 'admin' ? 'Administrateur' : 'Employé'}</p>
              </div>
            </div>
            
            <div className="footer-actions">
              <Link to="/profile" className="footer-link" onClick={handleClose}>
                <FiUser size={18} />
                <span>Mon Compte</span>
              </Link>
              <Link to="/settings" className="footer-link" onClick={handleClose}>
                <FiSettings size={18} />
                <span>Paramètres</span>
              </Link>
              <button onClick={handleLogout} className="footer-link logout-btn">
                <FiLogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default ModernSidebar;
