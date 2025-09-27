import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // État pour le profil
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  
  // État pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ modifié
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ modifié
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!profileData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    } else if (profileData.username.trim().length < 3) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Le nouveau mot de passe doit contenir au moins 6 caractères';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    setProfileSubmitting(true);
    
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setProfileData({
          username: user.username,
          email: user.email
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setPasswordSubmitting(true);
    
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
    } finally {
      setPasswordSubmitting(false);
    }
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

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1 className="display-4 text-primary">👤 Mon Profil</h1>
          <p className="lead text-muted">Gérez vos informations personnelles</p>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-0"
              >
                <Tab eventKey="profile" title="📝 Informations Personnelles" />
                <Tab eventKey="password" title="🔒 Mot de Passe" />
              </Tabs>
            </Card.Header>
            <Card.Body>
              {activeTab === 'profile' && (
                <Form onSubmit={handleProfileSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nom d'utilisateur</Form.Label>
                        <Form.Control
                          type="text"
                          name="username"
                          value={profileData.username}
                          onChange={handleProfileInputChange}
                          isInvalid={!!profileErrors.username}
                        />
                        <Form.Control.Feedback type="invalid">
                          {profileErrors.username}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileInputChange}
                          isInvalid={!!profileErrors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {profileErrors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={profileSubmitting}
                    >
                      {profileSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Mise à jour...
                        </>
                      ) : (
                        'Mettre à jour'
                      )}
                    </Button>
                  </div>
                </Form>
              )}

              {activeTab === 'password' && (
                <Form onSubmit={handlePasswordSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mot de passe actuel</Form.Label>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      isInvalid={!!passwordErrors.currentPassword}
                    />
                    <Form.Control.Feedback type="invalid">
                      {passwordErrors.currentPassword}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Nouveau mot de passe</Form.Label>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      isInvalid={!!passwordErrors.newPassword}
                    />
                    <Form.Control.Feedback type="invalid">
                      {passwordErrors.newPassword}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      isInvalid={!!passwordErrors.confirmPassword}
                    />
                    <Form.Control.Feedback type="invalid">
                      {passwordErrors.confirmPassword}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-flex justify-content-end">
                    <div className="d-grid gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={passwordSubmitting}
                      >
                        {passwordSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Changement...
                          </>
                        ) : (
                          'Changer le mot de passe'
                        )}
                      </Button>
                      <Link 
                        to="/change-password" 
                        className="btn btn-outline-secondary"
                      >
                        Page dédiée de changement de mot de passe
                      </Link>
                    </div>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">ℹ️ Informations du Compte</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                     style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Nom d'utilisateur :</strong>
                <p className="text-muted">{user?.username}</p>
              </div>
              
              <div className="mb-3">
                <strong>Email :</strong>
                <p className="text-muted">{user?.email}</p>
              </div>
              
              <div className="mb-3">
                <strong>Rôle :</strong>
                <p>
                  <span className={`badge ${user?.role === 'admin' ? 'bg-danger' : 'bg-success'}`}>
                    {user?.role === 'admin' ? '👑 Administrateur' : '👤 Employé'}
                  </span>
                </p>
              </div>
              
              <div className="mb-3">
                <strong>Membre depuis :</strong>
                <p className="text-muted">
                  {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header className="bg-warning text-white">
              <h5 className="mb-0">🔒 Sécurité</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <small>
                  <strong>Conseils de sécurité :</strong><br />
                  • Utilisez un mot de passe fort<br />
                  • Changez régulièrement votre mot de passe<br />
                  • Ne partagez jamais vos identifiants<br />
                  • Déconnectez-vous après utilisation
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
