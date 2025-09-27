import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Tabs, 
  Tab,
  Modal,
  Spinner 
} from 'react-bootstrap';
import { 
  FiSettings, 
  FiUser, 
  FiShield, 
  FiBell, 
  FiGlobe, 
  FiSave, 
  FiEdit,
  FiEye,
  FiEyeOff,
  FiPhone,
  FiMail,
  FiMapPin,
  FiSun
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
import { authService } from '../services/api';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const { companyInfo, updateCompanyInfo } = useCompany();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  
  // États pour les paramètres de l'entreprise
  const [companyData, setCompanyData] = useState({
    name: 'STOCK MANAGEMENT MALI',
    address: 'Bamako, Mali',
    phone: '+223 70 XX XX XX',
    email: 'contact@stockmanagement.ml',
    website: 'www.stockmanagement.ml',
    description: 'Système de gestion de stock moderne'
  });
  
  // États pour le profil utilisateur
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: ''
  });
  
  // États pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [systemData, setSystemData] = useState({
    language: 'fr',
    timezone: 'Africa/Bamako',
    currency: 'FCFA',
    dateFormat: 'DD/MM/YYYY',
    lowStockThreshold: 10,
    autoBackup: true,
    emailNotifications: true
  });

  const [themeData, setThemeData] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    accentColor: '#f59e0b',
    darkMode: false
  });

  const colorPresets = [
    { name: 'Bleu (Défaut)', primary: '#3b82f6', secondary: '#10b981', accent: '#f59e0b' },
    { name: 'Vert Nature', primary: '#059669', secondary: '#0d9488', accent: '#f59e0b' },
    { name: 'Violet Royal', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#f59e0b' },
    { name: 'Rouge Moderne', primary: '#dc2626', secondary: '#ef4444', accent: '#f59e0b' },
    { name: 'Orange Dynamique', primary: '#ea580c', secondary: '#f97316', accent: '#3b82f6' },
    { name: 'Rose Élégant', primary: '#db2777', secondary: '#ec4899', accent: '#8b5cf6' }
  ];

  useEffect(() => {
    loadUserData();
    loadThemeData();
    loadCompanyData();
  }, [user, companyInfo]);

  const loadCompanyData = () => {
    setCompanyData({
      name: companyInfo.name || 'STOCK MANAGEMENT MALI',
      address: companyInfo.address || 'Bamako, Mali',
      phone: companyInfo.phone || '+223 70 XX XX XX',
      email: companyInfo.email || 'contact@stockshop.ml',
      website: companyInfo.website || 'www.stockshop.ml',
      description: companyInfo.description || 'Votre partenaire de confiance'
    });
  };

  const loadUserData = () => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      });
    }
  };

  const loadThemeData = () => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme) {
      const theme = JSON.parse(savedTheme);
      setThemeData(theme);
      applyTheme(theme);
    }
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.style.setProperty('--bs-primary', theme.primaryColor);
    root.style.setProperty('--bs-success', theme.secondaryColor);
    root.style.setProperty('--bs-warning', theme.accentColor);
    
    // Variables CSS personnalisées
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    
    if (theme.darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  const handleThemeChange = (field, value) => {
    setThemeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePresetSelect = (preset) => {
    const newTheme = {
      ...themeData,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    };
    setThemeData(newTheme);
    applyTheme(newTheme);
  };

  const handleSaveTheme = () => {
    try {
      localStorage.setItem('app_theme', JSON.stringify(themeData));
      applyTheme(themeData);
      
      // Émettre un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('themeUpdated', {
        detail: themeData
      }));
      
      toast.success('Thème sauvegardé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème:', error);
      toast.error('Erreur lors de la sauvegarde du thème');
    }
  };

  const handleSaveCompany = async () => {
    setLoading(true);
    try {
      const result = await updateCompanyInfo(companyData);
      if (result.success !== false) {
        toast.success('Paramètres d\'entreprise sauvegardés avec succès !');
      } else {
        toast.error(result.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Appeler l'API pour mettre à jour le profil
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Mot de passe modifié avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors du changement de mot de passe';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystem = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Paramètres système mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="page-title">
                <FiSettings className="me-2" />
                Paramètres
              </h2>
              <p className="text-muted">Configurez votre système et vos préférences</p>
            </div>
          </div>

          <Card className="settings-card">
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={(tab) => setActiveTab(tab)}
                className="settings-tabs"
              >
                {/* Paramètres de l'entreprise */}
                <Tab eventKey="company" title={
                  <span>
                    <FiGlobe className="me-2" />
                    Entreprise
                  </span>
                }>
                  <div className="tab-content-padding">
                    <Row>
                      <Col lg={8}>
                        <Card className="company-settings-card">
                          <Card.Header>
                            <h5 className="mb-0">Informations de l'Entreprise</h5>
                          </Card.Header>
                          <Card.Body>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Nom de l'entreprise</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={companyData.name}
                                    onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                                    placeholder="Nom de votre entreprise"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>
                                    <FiPhone className="me-1" />
                                    Téléphone
                                  </Form.Label>
                                  <Form.Control
                                    type="tel"
                                    value={companyData.phone}
                                    onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                                    placeholder="+223 70 XX XX XX"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>
                                    <FiMail className="me-1" />
                                    Email
                                  </Form.Label>
                                  <Form.Control
                                    type="email"
                                    value={companyData.email}
                                    onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                                    placeholder="contact@entreprise.ml"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Site web</Form.Label>
                                  <Form.Control
                                    type="url"
                                    value={companyData.website}
                                    onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                                    placeholder="www.monentreprise.ml"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={12}>
                                <Form.Group className="mb-3">
                                  <Form.Label>
                                    <FiMapPin className="me-1" />
                                    Adresse
                                  </Form.Label>
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={companyData.address}
                                    onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                                    placeholder="Adresse complète de l'entreprise"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={12}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Description</Form.Label>
                                  <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={companyData.description}
                                    onChange={(e) => setCompanyData({...companyData, description: e.target.value})}
                                    placeholder="Description de votre entreprise"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            
                            <div className="d-flex justify-content-end">
                              <Button 
                                variant="primary" 
                                onClick={handleSaveCompany}
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    <Spinner size="sm" className="me-2" />
                                    Sauvegarde...
                                  </>
                                ) : (
                                  <>
                                    <FiSave className="me-2" />
                                    Sauvegarder
                                  </>
                                )}
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={4}>
                        <Card className="preview-card">
                          <Card.Header>
                            <h6 className="mb-0">Aperçu Facture</h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="company-preview">
                              <div className="preview-name">{companyData.name}</div>
                              <div className="preview-info">
                                <div>{companyData.description}</div>
                                <div>{companyData.address}</div>
                                <div>Tél: {companyData.phone}</div>
                                <div>Email: {companyData.email}</div>
                                {companyData.website && <div>Web: {companyData.website}</div>}
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* Profil utilisateur */}
                <Tab eventKey="profile" title={
                  <span>
                    <FiUser className="me-2" />
                    Mon Profil
                  </span>
                }>
                  <div className="tab-content-padding">
                    <Card className="profile-settings-card">
                      <Card.Header>
                        <h5 className="mb-0">Informations Personnelles</h5>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Nom d'utilisateur</Form.Label>
                              <Form.Control
                                type="text"
                                value={profileData.username}
                                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                                placeholder="Nom d'utilisateur"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Email</Form.Label>
                              <Form.Control
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                placeholder="votre@email.com"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Prénom</Form.Label>
                              <Form.Control
                                type="text"
                                value={profileData.firstName}
                                onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                                placeholder="Votre prénom"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Nom</Form.Label>
                              <Form.Control
                                type="text"
                                value={profileData.lastName}
                                onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                                placeholder="Votre nom"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>
                                <FiPhone className="me-1" />
                                Téléphone
                              </Form.Label>
                              <Form.Control
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                placeholder="+223 70 12 34 56"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <div className="d-flex justify-content-end">
                          <Button 
                            variant="primary" 
                            onClick={handleSaveProfile}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Spinner size="sm" className="me-2" />
                                Sauvegarde...
                              </>
                            ) : (
                              <>
                                <FiSave className="me-2" />
                                Sauvegarder
                              </>
                            )}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </Tab>

                {/* Sécurité */}
                <Tab eventKey="security" title={
                  <span>
                    <FiShield className="me-2" />
                    Sécurité
                  </span>
                }>
                  <div className="tab-content-padding">
                    <Card className="security-settings-card">
                      <Card.Header>
                        <h5 className="mb-0">Changer le Mot de Passe</h5>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={12}>
                            <Form.Group className="mb-3">
                              <Form.Label>Mot de passe actuel</Form.Label>
                              <div className="password-input-group">
                                <Form.Control
                                  type={showPassword.current ? "text" : "password"}
                                  value={passwordData.currentPassword}
                                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                  placeholder="Votre mot de passe actuel"
                                />
                                <Button
                                  variant="outline-secondary"
                                  className="password-toggle"
                                  onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                                >
                                  {showPassword.current ? <FiEyeOff /> : <FiEye />}
                                </Button>
                              </div>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Nouveau mot de passe</Form.Label>
                              <div className="password-input-group">
                                <Form.Control
                                  type={showPassword.new ? "text" : "password"}
                                  value={passwordData.newPassword}
                                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                  placeholder="Nouveau mot de passe"
                                />
                                <Button
                                  variant="outline-secondary"
                                  className="password-toggle"
                                  onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                                >
                                  {showPassword.new ? <FiEyeOff /> : <FiEye />}
                                </Button>
                              </div>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Confirmer le mot de passe</Form.Label>
                              <div className="password-input-group">
                                <Form.Control
                                  type={showPassword.confirm ? "text" : "password"}
                                  value={passwordData.confirmPassword}
                                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                  placeholder="Confirmer le mot de passe"
                                />
                                <Button
                                  variant="outline-secondary"
                                  className="password-toggle"
                                  onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                                >
                                  {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                                </Button>
                              </div>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Alert variant="info">
                          <strong>Conseils de sécurité :</strong>
                          <ul className="mb-0 mt-2">
                            <li>Utilisez au moins 8 caractères</li>
                            <li>Mélangez majuscules, minuscules et chiffres</li>
                            <li>Évitez les mots de passe trop simples</li>
                          </ul>
                        </Alert>
                        
                        <div className="d-flex justify-content-end">
                          <Button 
                            variant="warning" 
                            onClick={handleChangePassword}
                            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                          >
                            {loading ? (
                              <>
                                <Spinner size="sm" className="me-2" />
                                Modification...
                              </>
                            ) : (
                              <>
                                <FiShield className="me-2" />
                                Changer le mot de passe
                              </>
                            )}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </Tab>

                {/* Thème et couleurs */}
                <Tab eventKey="theme" title={
                  <span>
                    <FiSun className="me-2" />
                    Thème & Couleurs
                  </span>
                }>
                  <div className="tab-content-padding">
                    <Row>
                      <Col md={6}>
                        <Card className="theme-settings-card">
                          <Card.Header>
                            <h6 className="mb-0">Couleurs du Site</h6>
                          </Card.Header>
                          <Card.Body>
                            <Form.Group className="mb-3">
                              <Form.Label>Couleur Principale</Form.Label>
                              <div className="d-flex align-items-center gap-2">
                                <Form.Control
                                  type="color"
                                  value={themeData.primaryColor}
                                  onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                                  style={{ width: '50px', height: '40px' }}
                                />
                                <Form.Control
                                  type="text"
                                  value={themeData.primaryColor}
                                  onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                                  placeholder="#3b82f6"
                                />
                              </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>Couleur Secondaire</Form.Label>
                              <div className="d-flex align-items-center gap-2">
                                <Form.Control
                                  type="color"
                                  value={themeData.secondaryColor}
                                  onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                                  style={{ width: '50px', height: '40px' }}
                                />
                                <Form.Control
                                  type="text"
                                  value={themeData.secondaryColor}
                                  onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                                  placeholder="#10b981"
                                />
                              </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>Couleur d'Accent</Form.Label>
                              <div className="d-flex align-items-center gap-2">
                                <Form.Control
                                  type="color"
                                  value={themeData.accentColor}
                                  onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                                  style={{ width: '50px', height: '40px' }}
                                />
                                <Form.Control
                                  type="text"
                                  value={themeData.accentColor}
                                  onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                                  placeholder="#f59e0b"
                                />
                              </div>
                            </Form.Group>

                            <div className="d-flex gap-2">
                              <Button
                                variant="primary"
                                onClick={handleSaveTheme}
                                className="flex-fill"
                              >
                                <FiSave className="me-1" />
                                Sauvegarder
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={6}>
                        <Card className="theme-presets-card">
                          <Card.Header>
                            <h6 className="mb-0">Thèmes Prédéfinis</h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="color-presets">
                              {colorPresets.map((preset, index) => (
                                <div
                                  key={index}
                                  className="color-preset"
                                  onClick={() => handlePresetSelect(preset)}
                                >
                                  <div className="preset-colors">
                                    <div 
                                      className="color-dot" 
                                      style={{ backgroundColor: preset.primary }}
                                    ></div>
                                    <div 
                                      className="color-dot" 
                                      style={{ backgroundColor: preset.secondary }}
                                    ></div>
                                    <div 
                                      className="color-dot" 
                                      style={{ backgroundColor: preset.accent }}
                                    ></div>
                                  </div>
                                  <span className="preset-name">{preset.name}</span>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4">
                              <h6>Aperçu</h6>
                              <div className="theme-preview">
                                <div 
                                  className="preview-primary" 
                                  style={{ backgroundColor: themeData.primaryColor }}
                                >
                                  Couleur Principale
                                </div>
                                <div 
                                  className="preview-secondary" 
                                  style={{ backgroundColor: themeData.secondaryColor }}
                                >
                                  Couleur Secondaire
                                </div>
                                <div 
                                  className="preview-accent" 
                                  style={{ backgroundColor: themeData.accentColor }}
                                >
                                  Couleur d'Accent
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* Paramètres système */}
                <Tab eventKey="system" title={
                  <span>
                    <FiBell className="me-2" />
                    Système
                  </span>
                }>
                  <div className="tab-content-padding">
                    <Row>
                      <Col md={6}>
                        <Card className="system-settings-card">
                          <Card.Header>
                            <h6 className="mb-0">Paramètres Généraux</h6>
                          </Card.Header>
                          <Card.Body>
                            <Form.Group className="mb-3">
                              <Form.Label>Langue</Form.Label>
                              <Form.Select
                                value={systemData.language}
                                onChange={(e) => setSystemData({...systemData, language: e.target.value})}
                              >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                                <option value="bm">Bambara</option>
                              </Form.Select>
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Fuseau horaire</Form.Label>
                              <Form.Select
                                value={systemData.timezone}
                                onChange={(e) => setSystemData({...systemData, timezone: e.target.value})}
                              >
                                <option value="Africa/Bamako">Mali (GMT+0)</option>
                                <option value="UTC">UTC</option>
                              </Form.Select>
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Format de date</Form.Label>
                              <Form.Select
                                value={systemData.dateFormat}
                                onChange={(e) => setSystemData({...systemData, dateFormat: e.target.value})}
                              >
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                              </Form.Select>
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Devise</Form.Label>
                              <Form.Select
                                value={systemData.currency}
                                onChange={(e) => setSystemData({...systemData, currency: e.target.value})}
                              >
                                <option value="FCFA">FCFA (Franc CFA)</option>
                                <option value="EUR">EUR (Euro)</option>
                                <option value="USD">USD (Dollar)</option>
                              </Form.Select>
                            </Form.Group>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col md={6}>
                        <Card className="notifications-settings-card">
                          <Card.Header>
                            <h6 className="mb-0">Notifications & Alertes</h6>
                          </Card.Header>
                          <Card.Body>
                            <Form.Group className="mb-3">
                              <Form.Label>Seuil de stock faible</Form.Label>
                              <Form.Control
                                type="number"
                                value={systemData.lowStockThreshold}
                                onChange={(e) => setSystemData({...systemData, lowStockThreshold: parseInt(e.target.value)})}
                                min="1"
                                max="100"
                              />
                              <Form.Text className="text-muted">
                                Alerte quand le stock est inférieur à cette valeur
                              </Form.Text>
                            </Form.Group>
                            
                            <Form.Check
                              type="switch"
                              id="auto-backup"
                              label="Sauvegarde automatique"
                              checked={systemData.autoBackup}
                              onChange={(e) => setSystemData({...systemData, autoBackup: e.target.checked})}
                              className="mb-3"
                            />
                            
                            <Form.Check
                              type="switch"
                              id="email-notifications"
                              label="Notifications par email"
                              checked={systemData.emailNotifications}
                              onChange={(e) => setSystemData({...systemData, emailNotifications: e.target.checked})}
                              className="mb-3"
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    
                    <div className="d-flex justify-content-end mt-3">
                      <Button 
                        variant="success" 
                        onClick={handleSaveSystem}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Sauvegarde...
                          </>
                        ) : (
                          <>
                            <FiSave className="me-2" />
                            Sauvegarder les paramètres
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;