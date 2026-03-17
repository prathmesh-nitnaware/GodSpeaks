import React, { useState } from 'react';
import { createProductApi } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext'; // Access the admin token
import { Form, Button, Row, Col, Spinner, Alert, InputGroup } from 'react-bootstrap';

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

const ProductForm = ({ onProductCreated }) => {
  const { adminInfo } = useAuth(); // Destructure admin information
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    color: '#000000',
  });
  
  const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L', 'XL', 'XXL']); 
  const [images, setImages] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSizeToggle = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!images || images.length === 0 || selectedSizes.length === 0) {
      setError('Please select at least one size and upload one image.');
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price); // Price handling matches backend expectations
    data.append('color', formData.color);
    data.append('sizes', selectedSizes.join(','));

    for (let i = 0; i < images.length; i++) {
      data.append('images', images[i]);
    }

    try {
      // CRITICAL: Extract token from Context and pass to API
      const token = adminInfo?.token;
      if (!token) throw new Error("Auth error: Please log in again.");

      const newProduct = await createProductApi(data, token);
      
      setSuccess(`Product "${newProduct.name}" created successfully!`);
      
      // Reset logic
      setFormData({ name: '', description: '', price: '', color: '#000000' });
      setSelectedSizes(['S', 'M', 'L', 'XL', 'XXL']);
      setImages(null);
      const fileInput = document.getElementById('images-input');
      if (fileInput) fileInput.value = null;

      if (onProductCreated) onProductCreated(newProduct);
    } catch (err) {
      // Captures 401, 403, and 500 errors from backend
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-sm border">
      <h4 className="mb-4 fw-bold text-primary">Add New Apparel</h4>

      {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
      {success && <Alert variant="success" className="py-2 small">{success}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label className="fw-bold small">Product Name</Form.Label>
        <Form.Control type="text" name="name" value={formData.name} onChange={handleTextChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-bold small">Description</Form.Label>
        <Form.Control as="textarea" name="description" rows={2} value={formData.description} onChange={handleTextChange} required />
      </Form.Group>

      <Row className="mb-3">
        <Col sm={6}>
          <Form.Label className="fw-bold small">Price (₹)</Form.Label>
          <Form.Control type="number" name="price" value={formData.price} onChange={handleTextChange} required />
        </Col>
        <Col sm={6}>
          <Form.Label className="fw-bold small">Hex Color</Form.Label>
          <div className="d-flex gap-2">
            <Form.Control type="color" name="color" value={formData.color} onChange={handleTextChange} style={{width: '50px'}} />
            <Form.Control type="text" name="color" value={formData.color} onChange={handleTextChange} />
          </div>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label className="fw-bold small">Showcase Images</Form.Label>
        <Form.Control id="images-input" type="file" onChange={handleFileChange} multiple accept="image/*" />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="fw-bold small d-block">Available Sizes</Form.Label>
        <div className="d-flex flex-wrap gap-3 p-2 bg-light border rounded">
          {ALL_SIZES.map(size => (
            <Form.Check key={size} type="checkbox" label={size} checked={selectedSizes.includes(size)} onChange={() => handleSizeToggle(size)} />
          ))}
        </div>
      </Form.Group>

      <Button type="submit" variant="primary" className="w-100 fw-bold py-2 shadow-sm" disabled={isLoading}>
        {isLoading ? <Spinner size="sm" /> : 'Publish to Store'}
      </Button>
    </Form>
  );
};

export default ProductForm;