import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FiTruck, FiUser, FiLock, FiEye, FiEyeOff, FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './DeliveryLogin.css';

const DeliveryLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/delivery/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('delivery_token', data.token);
        localStorage.setItem('delivery_user', JSON.stringify(data.user));
        toast.success(`Bienvenue ${data.user.name} !`);
        navigate('/delivery/dashboard');
      } else {
        toast.error(data.message || 'Identifiants incorrects');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    try {
      setResetLoading(true);
      
      const response = await fetch('/api/delivery/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Email de réinitialisation envoyé !');
        setShowResetForm(false);
        setResetEmail('');
      } else {
        toast.error(data.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur reset:', error);
      toast.error('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="delivery-login-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5}>
            <Card className="delivery-login-card">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="delivery-icon mb-3">
                    <FiTruck size={48} />
                  </div>
                  <h3 className="delivery-title">Espace Livreurs</h3>
                  <p className="delivery-subtitle">
                    Connectez-vous pour gérer vos livraisons
                  </p>
                </div>

                {!showResetForm ? (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FiMail className="me-2" />
                        Email
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="votre@email.com"
                        className="delivery-input"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>
                        <FiLock className="me-2" />
                        Mot de passe
                      </Form.Label>
                      <div className="password-input-group">
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Votre mot de passe"
                          className="delivery-input"
                          required
                        />
                        <Button
                          variant="link"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </Button>
                      </div>
                    </Form.Group>

                    <Button
                      type="submit"
                      className="delivery-login-btn w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Connexion...
                        </>
                      ) : (
                        <>
                          <FiTruck className="me-2" />
                          Se connecter
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="link"
                        className="forgot-password-link"
                        onClick={() => setShowResetForm(true)}
                      >
                        Mot de passe oublié ?
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <Form onSubmit={handlePasswordReset}>
                    <div className="text-center mb-4">
                      <h5>Réinitialiser le mot de passe</h5>
                      <p className="text-muted">
                        Entrez votre email pour recevoir un lien de réinitialisation
                      </p>
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="delivery-input"
                        required
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      className="delivery-login-btn w-100 mb-3"
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <FiMail className="me-2" />
                          Envoyer le lien
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="link"
                        className="forgot-password-link"
                        onClick={() => setShowResetForm(false)}
                      >
                        Retour à la connexion
                      </Button>
                    </div>
                  </Form>
                )}

                <hr className="my-4" />
                
                <div className="text-center">
                  <small className="text-muted">
                    Réservé aux livreurs autorisés de Stock Shop Mali
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DeliveryLogin;
