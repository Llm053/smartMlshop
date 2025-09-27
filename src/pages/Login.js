import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiSettings, FiUsers } from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
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
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      const errorMessage = error.response?.data?.message || 'Email ou mot de passe incorrect';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-login-page">
      {/* Background Elements */}
      <div className="login-background">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
      </div>

      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5} xl={4}>
            <Card className="modern-login-card">
              <Card.Body className="p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="login-icon mb-3">
                    <FiShield size={48} />
                  </div>
                  <h2 className="login-title">Espace Administration</h2>
                  <p className="login-subtitle">
                    Connectez-vous pour accéder au panneau d'administration
                  </p>
                </div>

                {/* Form */}
                <Form onSubmit={handleSubmit}>
                  {errors.general && (
                    <Alert variant="danger" className="modern-alert">
                      {errors.general}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label className="modern-label">
                      <FiMail className="me-2" />
                      Adresse email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Votre email"
                      className={`modern-input ${errors.email ? 'is-invalid' : ''}`}
                      disabled={loading}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">
                        {errors.email}
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="modern-label">
                      <FiLock className="me-2" />
                      Mot de passe
                    </Form.Label>
                    <div className="password-input-wrapper">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Votre mot de passe"
                        className={`modern-input ${errors.password ? 'is-invalid' : ''}`}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="link"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </Button>
                    </div>
                    {errors.password && (
                      <div className="invalid-feedback d-block">
                        {errors.password}
                      </div>
                    )}
                  </Form.Group>

                  <Button
                    type="submit"
                    className="modern-login-btn w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        <FiShield className="me-2" />
                        Se connecter
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Link to="/password-reset" className="forgot-password-link">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                </Form>

                {/* Footer */}
                <hr className="my-4" />
                <div className="login-footer">
                  <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
                    <div className="footer-item">
                      <FiSettings className="footer-icon" />
                      <small>Admin</small>
                    </div>
                    <div className="footer-item">
                      <FiUsers className="footer-icon" />
                      <small>Employés</small>
                    </div>
                    <div className="footer-item">
                      <FiShield className="footer-icon" />
                      <small>Sécurisé</small>
                    </div>
                  </div>
                  <div className="text-center">
                    <small className="text-muted">
                      Stock Shop Mali - Système de Gestion
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;