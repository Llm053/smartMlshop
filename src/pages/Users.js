import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { userService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'employee',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
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
    
    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (editingUser) {
        await userService.update(editingUser.id, formData);
        toast.success('Utilisateur mis à jour avec succès !');
      } else {
        // Pour la création, on ajoute un mot de passe par défaut
        const userData = {
          ...formData,
          password: 'password123' // Mot de passe par défaut
        };
        await userService.create(userData);
        toast.success('Utilisateur créé avec succès !');
      }
      
      setShowModal(false);
      setFormData({ username: '', email: '', role: 'employee' });
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (user.id === currentUser.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.username}" ?`)) {
      try {
        await userService.delete(user.id);
        toast.success('Utilisateur supprimé avec succès !');
        loadUsers();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ username: '', email: '', role: 'employee', phone: '' });
    setEditingUser(null);
    setErrors({});
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', role: 'employee', phone: '' });
    setShowModal(true);
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

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-4 text-primary">👥 Utilisateurs</h1>
              <p className="lead text-muted">Gérez les utilisateurs du système</p>
            </div>
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleAddNew}
              className="pulse"
            >
              ➕ Nouvel Utilisateur
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Liste des Utilisateurs</h5>
            </Card.Header>
            <Card.Body>
              {users.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nom d'utilisateur</th>
                          <th>Email</th>
                          <th>Téléphone</th>
                          <th>Rôle</th>
                          <th>Date de Création</th>
                          <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <Badge bg="secondary">#{user.id}</Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <strong>{user.username}</strong>
                              {user.id === currentUser.id && (
                                <Badge bg="info" className="ms-2">Vous</Badge>
                              )}
                            </div>
                          </td>
                          <td>
                            <span>{user.email}</span>
                          </td>
                          <td>
                            <span>{user.phone || 'Non renseigné'}</span>
                          </td>
                          <td>
                            <Badge bg={user.role === 'admin' ? 'danger' : 'success'}>
                              {user.role === 'admin' ? '👑 Admin' : '👤 Employé'}
                            </Badge>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(user.created_at)}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEdit(user)}
                              >
                                ✏️ Modifier
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(user)}
                                disabled={user.id === currentUser.id}
                              >
                                🗑️ Supprimer
                              </Button>
                            </div>
                            {user.id === currentUser.id && (
                              <small className="text-muted d-block mt-1">
                                Vous ne pouvez pas supprimer votre propre compte
                              </small>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <h4 className="text-muted">Aucun utilisateur trouvé</h4>
                  <p className="text-muted">Commencez par créer votre premier utilisateur</p>
                  <Button variant="primary" onClick={handleAddNew}>
                    ➕ Créer un Utilisateur
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal pour créer/modifier un utilisateur */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? '✏️ Modifier l\'Utilisateur' : '➕ Nouvel Utilisateur'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom d'utilisateur *</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    isInvalid={!!errors.username}
                    placeholder="Entrez le nom d'utilisateur"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rôle *</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="employee">👤 Employé</option>
                    <option value="admin">👑 Administrateur</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                isInvalid={!!errors.email}
                placeholder="Entrez l'email"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Numéro de téléphone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Entrez le numéro de téléphone"
              />
            </Form.Group>

            {!editingUser && (
              <Alert variant="info">
                <strong>Note :</strong> Un mot de passe par défaut "password123" sera attribué au nouvel utilisateur. 
                Il devra le changer lors de sa première connexion.
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {editingUser ? 'Modification...' : 'Création...'}
                </>
              ) : (
                editingUser ? 'Modifier' : 'Créer'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Users;
