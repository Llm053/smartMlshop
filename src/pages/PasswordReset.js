import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import './Auth.css';

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [step, setStep] = useState(token ? 'reset' : 'request');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (step === 'request') {
      if (!formData.email) {
        newErrors.email = 'Email requis';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email invalide';
      }
    } else {
      if (!formData.newPassword) {
        newErrors.newPassword = 'Nouveau mot de passe requis';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
        newErrors.newPassword = 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmation du mot de passe requise';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await api.post('/password/request-reset', { email: formData.email });
      toast.success('Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.');
      setStep('sent');
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await api.post('/password/reset', {
        token,
        newPassword: formData.newPassword
      });
      toast.success('Mot de passe réinitialisé avec succès !');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la réinitialisation';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const renderRequestForm = () => (
    <Card className="auth-card">
      <Card.Body className="p-5">
        <div className="text-center mb-4">
          <div className="auth-icon">
            <FiMail size={32} />
          </div>
          <h2 className="auth-title">Mot de passe oublié ?</h2>
          <p className="auth-subtitle">
            Entrez votre adresse email et nous vous enverrons un lien de réinitialisation.
          </p>
        </div>

        <Form onSubmit={handleRequestReset}>
          <Form.Group className="mb-4">
            <Form.Label className="form-label">Adresse email</Form.Label>
            <div className="input-group-modern">
              <span className="input-icon">
                <FiMail size={20} />
              </span>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className={`form-control-modern ${errors.email ? 'is-invalid' : ''}`}
                required
              />
            </div>
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </Form.Group>

          <Button 
            type="submit" 
            className="btn-modern w-100"
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <Link to="/login" className="auth-link">
            <FiArrowLeft size={16} className="me-2" />
            Retour à la connexion
          </Link>
        </div>
      </Card.Body>
    </Card>
  );

  const renderResetForm = () => (
    <Card className="auth-card">
      <Card.Body className="p-5">
        <div className="text-center mb-4">
          <div className="auth-icon">
            <FiLock size={32} />
          </div>
          <h2 className="auth-title">Nouveau mot de passe</h2>
          <p className="auth-subtitle">
            Entrez votre nouveau mot de passe ci-dessous.
          </p>
        </div>

        <Form onSubmit={handleResetPassword}>
          <Form.Group className="mb-4">
            <Form.Label className="form-label">Nouveau mot de passe</Form.Label>
            <div className="input-group-modern">
              <span className="input-icon">
                <FiLock size={20} />
              </span>
              <Form.Control
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Votre nouveau mot de passe"
                className={`form-control-modern ${errors.newPassword ? 'is-invalid' : ''}`}
                required
              />
            </div>
            {errors.newPassword && (
              <div className="invalid-feedback">{errors.newPassword}</div>
            )}
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="form-label">Confirmer le mot de passe</Form.Label>
            <div className="input-group-modern">
              <span className="input-icon">
                <FiLock size={20} />
              </span>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmez votre nouveau mot de passe"
                className={`form-control-modern ${errors.confirmPassword ? 'is-invalid' : ''}`}
                required
              />
            </div>
            {errors.confirmPassword && (
              <div className="invalid-feedback">{errors.confirmPassword}</div>
            )}
          </Form.Group>

          <Button 
            type="submit" 
            className="btn-modern w-100"
            disabled={loading}
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <Link to="/login" className="auth-link">
            <FiArrowLeft size={16} className="me-2" />
            Retour à la connexion
          </Link>
        </div>
      </Card.Body>
    </Card>
  );

  const renderSentConfirmation = () => (
    <Card className="auth-card">
      <Card.Body className="p-5 text-center">
        <div className="auth-icon success">
          <FiCheckCircle size={48} />
        </div>
        <h2 className="auth-title">Email envoyé !</h2>
        <p className="auth-subtitle">
          Nous avons envoyé un lien de réinitialisation à <strong>{formData.email}</strong>
        </p>
        <p className="text-muted">
          Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
        </p>
        <p className="text-muted small">
          Le lien est valide pendant 1 heure.
        </p>
        
        <div className="mt-4">
          <Link to="/login" className="btn-modern">
            Retour à la connexion
          </Link>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="auth-container">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5} xl={4}>
            {step === 'request' && renderRequestForm()}
            {step === 'reset' && renderResetForm()}
            {step === 'sent' && renderSentConfirmation()}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PasswordReset;
