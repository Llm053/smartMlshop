import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { productService, categoryService } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category_id: '',
    image_path: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ]);
      
      // Vérifier la structure de la réponse
      const products = productsResponse.data?.data?.products || productsResponse.data?.products || [];
      const categories = categoriesResponse.data?.data?.categories || categoriesResponse.data?.categories || [];
      
      setProducts(products);
      setCategories(categories);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des données';
      toast.error(errorMessage);
      
      // Définir des données vides en cas d'erreur
      setProducts([]);
      setCategories([]);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du produit est requis';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }
    
    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Le prix doit être un nombre positif';
    }
    
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'La quantité doit être un nombre entier positif';
    }
    
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'La description ne peut pas dépasser 1000 caractères';
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
      let imagePath = formData.image_path;
      
      // Upload de l'image si une nouvelle image est sélectionnée
      if (selectedImage) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', selectedImage);
        
        const uploadResponse = await fetch('/api/upload/product-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataUpload
        });
        
        const uploadData = await uploadResponse.json();
        
        if (uploadData.success) {
          imagePath = uploadData.data.imagePath;
          toast.success('Image uploadée avec succès !');
        } else {
          throw new Error(uploadData.message || 'Erreur lors de l\'upload de l\'image');
        }
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category_id: formData.category_id || null,
        image_path: imagePath
      };
      
      if (editingProduct) {
        await productService.update(editingProduct.id, productData);
        toast.success('Produit mis à jour avec succès !');
      } else {
        await productService.create(productData);
        toast.success('Produit créé avec succès !');
      }
      
      setShowModal(false);
      setFormData({ name: '', description: '', price: '', quantity: '', category_id: '', image_path: '' });
      setSelectedImage(null);
      setImagePreview(null);
      setEditingProduct(null);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      category_id: product.category_id || '',
      image_path: product.image_path || ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) {
      try {
        await productService.delete(product.id);
        toast.success('Produit supprimé avec succès !');
        loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: '', description: '', price: '', quantity: '', category_id: '' });
    setEditingProduct(null);
    setErrors({});
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', quantity: '', category_id: '' });
    setShowModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'xof'
    }).format(price);
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 5) return { variant: 'danger', text: 'Critique' };
    if (quantity <= 10) return { variant: 'warning', text: 'Faible' };
    return { variant: 'success', text: 'Normal' };
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category_name && product.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <h1 className="display-4 text-primary">📦 Produits</h1>
              <p className="lead text-muted">Gérez votre inventaire de produits</p>
            </div>
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleAddNew}
              className="pulse"
            >
              ➕ Nouveau Produit
            </Button>
          </div>
        </Col>
      </Row>

      {/* Barre de recherche */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-end">
          <Badge bg="info" className="fs-6">
            {filteredProducts.length} produit(s) trouvé(s)
          </Badge>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Liste des Produits</h5>
            </Card.Header>
            <Card.Body>
              {filteredProducts.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Catégorie</th>
                        <th>Prix</th>
                        <th>Quantité</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const stockStatus = getStockStatus(product.quantity);
                        return (
                          <tr key={product.id}>
                            <td>
                              <Badge bg="secondary">#{product.id}</Badge>
                            </td>
                            <td>
                              <div>
                                <strong>{product.name}</strong>
                                {product.description && (
                                  <>
                                  
                                  <br />
                                  <small className="text-muted">{product.description}</small>
                                  </>

                                )}
                              </div>
                            </td>
                            <td>
                              {product.category_name ? (
                                <Badge bg="light" text="dark">{product.category_name}</Badge>
                              ) : (
                                <span className="text-muted">Aucune catégorie</span>
                              )}
                            </td>
                            <td>
                              <strong className="text-success">{formatPrice(product.price)}</strong>
                            </td>
                            <td>
                              <Badge bg={stockStatus.variant}>{product.quantity}</Badge>
                            </td>
                            <td>
                              <Badge bg={stockStatus.variant}>{stockStatus.text}</Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleEdit(product)}
                                >
                                  ✏️ Modifier
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(product)}
                                >
                                  🗑️ Supprimer
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <h4 className="text-muted">
                    {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit trouvé'}
                  </h4>
                  <p className="text-muted">
                    {searchTerm 
                      ? 'Essayez de modifier votre recherche' 
                      : 'Commencez par créer votre premier produit'
                    }
                  </p>
                  {!searchTerm && (
                    <Button variant="primary" onClick={handleAddNew}>
                      ➕ Créer un Produit
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal pour créer/modifier un produit */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? '✏️ Modifier le Produit' : '➕ Nouveau Produit'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom du produit *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.name}
                    placeholder="Entrez le nom du produit"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Catégorie</Form.Label>
                  <Form.Select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                isInvalid={!!errors.description}
                placeholder="Entrez une description (optionnel)"
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {formData.description.length}/1000 caractères
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image du produit</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                isInvalid={!!errors.image}
              />
              <Form.Control.Feedback type="invalid">
                {errors.image}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Formats acceptés: JPG, PNG, WebP. Taille max: 5MB. Recommandé: 400x300px
              </Form.Text>
              
              {/* Aperçu de l'image */}
              {imagePreview && (
                <div className="mt-3">
                  <p className="mb-2"><strong>Aperçu :</strong></p>
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '150px', 
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #e9ecef'
                    }} 
                  />
                </div>
              )}
              
              {/* Image existante lors de l'édition */}
              {editingProduct && editingProduct.image_path && !imagePreview && (
                <div className="mt-3">
                  <p className="mb-2"><strong>Image actuelle :</strong></p>
                  <img 
                    src={editingProduct.image_path} 
                    alt="Image actuelle" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '150px', 
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #e9ecef'
                    }} 
                  />
                </div>
              )}
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prix (FCFA) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="1"
                    min="0"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    isInvalid={!!errors.price}
                    placeholder="0.00"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.price}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantité *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    isInvalid={!!errors.quantity}
                    placeholder="0"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.quantity}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
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
                  {editingProduct ? 'Modification...' : 'Création...'}
                </>
              ) : (
                editingProduct ? 'Modifier' : 'Créer'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Products;
