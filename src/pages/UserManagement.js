import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge, Dropdown } from 'react-bootstrap';
import { FiUsers, FiPlus, FiEdit, FiTrash, FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    employees: 0,
    deliveries: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        const usersList = data.data.users || [];
        setUsers(usersList);
        
        // Calculer les statistiques
        const statsData = {
          total: usersList.length,
          admins: usersList.filter(user => user.role === 'admin').length,
          employees: usersList.filter(user => user.role === 'employee').length,
          deliveries: usersList.filter(user => user.role === 'delivery').length
        };
        setStats(statsData);
      } else {
        toast.error('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || (!editingUser && !formData.password)) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const url = editingUser 
        ? `/api/users/${editingUser.id}` 
        : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const payload = { ...formData };
      if (editingUser && !formData.password) {
        delete payload.password; // Ne pas envoyer le mot de passe vide lors de la mise à jour
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(editingUser ? 'Utilisateur mis à jour avec succès !' : 'Utilisateur créé avec succès !');
        setShowModal(false);
        setFormData({ name: '', email: '', password: '', role: 'employee', phone: '' });
        setEditingUser(null);
        loadUsers();
      } else {
        toast.error(data.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Utilisateur supprimé avec succès !');
        loadUsers();
      } else {
        toast.error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      'admin': { bg: 'danger', text: 'Administrateur' },
      'employee': { bg: 'primary', text: 'Employé' },
      'delivery': { bg: 'success', text: 'Livreur' }
    };
    
    const config = roleConfig[role] || { bg: 'secondary', text: role };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'employee', phone: '' });
    setShowPassword(false);
  };

  return (
    <div className="user-management-page">
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="page-title">
                  <FiUsers className="me-2" />
                  Gestion des Utilisateurs
                </h2>
                <p className="text-muted">Gérez les administrateurs, employés et livreurs</p>
              </div>
              <Button 
                variant="primary" 
                onClick={() => setShowModal(true)}
                className="add-user-btn"
              >
                <FiUserPlus className="me-2" />
                Ajouter un Utilisateur
              </Button>
            </div>
          </Col>
        </Row>

        {/* Cartes de statistiques */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="stats-card border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="stats-icon mb-2">
                  <FiUsers size={32} className="text-primary" />
                </div>
                <h3 className="stats-number mb-1">{stats.total}</h3>
                <p className="stats-label text-muted mb-0">Total Utilisateurs</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="stats-icon mb-2">
                  <FiUsers size={32} className="text-danger" />
                </div>
                <h3 className="stats-number mb-1">{stats.admins}</h3>
                <p className="stats-label text-muted mb-0">Administrateurs</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="stats-icon mb-2">
                  <FiUsers size={32} className="text-info" />
                </div>
                <h3 className="stats-number mb-1">{stats.employees}</h3>
                <p className="stats-label text-muted mb-0">Employés</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="stats-icon mb-2">
                  <FiUsers size={32} className="text-success" />
                </div>
                <h3 className="stats-number mb-1">{stats.deliveries}</h3>
                <p className="stats-label text-muted mb-0">Livreurs</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="users-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Liste des Utilisateurs</h5>
                <Badge bg="info">{users.length} utilisateur(s)</Badge>
              </Card.Header>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                ) : (
                  <Table responsive hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Rôle</th>
                        <th>Créé le</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>
                            <strong>{user.name}</strong>
                          </td>
                          <td>{user.email}</td>
                          <td>{user.phone || '-'}</td>
                          <td>{getRoleBadge(user.role)}</td>
                          <td>{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-secondary" size="sm">
                                Actions
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleEdit(user)}>
                                  <FiEdit className="me-2" />
                                  Modifier
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item 
                                  onClick={() => handleDelete(user.id, user.name)}
                                  className="text-danger"
                                >
                                  <FiTrash className="me-2" />
                                  Supprimer
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                
                {!loading && users.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    <FiUsers size={48} className="mb-3 opacity-50" />
                    <p>Aucun utilisateur trouvé</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal Ajouter/Modifier Utilisateur */}
      <Modal show={showModal} onHide={handleModalClose} size="md">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Modifier l\'Utilisateur' : 'Ajouter un Utilisateur'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom complet *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nom et prénom"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@exemple.com"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+223 70 12 34 56"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rôle *</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="employee">Employé</option>
                    <option value="delivery">Livreur</option>
                    <option value="admin">Administrateur</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {formData.role === 'employee' && 'Peut gérer les ventes et commandes'}
                    {formData.role === 'delivery' && 'Peut uniquement gérer les livraisons'}
                    {formData.role === 'admin' && 'Accès complet au système'}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                Mot de passe {editingUser ? '(laisser vide pour ne pas modifier)' : '*'}
              </Form.Label>
              <div className="password-input">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={editingUser ? "Nouveau mot de passe" : "Mot de passe"}
                  required={!editingUser}
                />
                <Button
                  variant="outline-secondary"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </Button>
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Sauvegarde...
                </>
              ) : (
                editingUser ? 'Modifier' : 'Créer'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
