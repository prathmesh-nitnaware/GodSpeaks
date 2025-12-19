import React, { useState } from 'react';
import { createProductApi } from '../../api/adminApi';
import { Form, Button, Row, Col, Spinner, Alert, InputGroup } from 'react-bootstrap';

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

const ProductForm = ({ onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    color: '#000000', // Default Hex for the picker
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

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('color', formData.color); // Saves the unlimited color selection
    data.append('sizes', selectedSizes.join(','));

    if (images) {
      for (let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
    }

    try {
      const newProduct = await createProductApi(data);
      setSuccess(`Product "${newProduct.name}" created successfully!`);
      if (onProductCreated) onProductCreated(newProduct);
    } catch (err) {
      setError(err.message || 'Failed to create product.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-sm border">
      <h4 className="mb-4 fw-bold">Add New Product</h4>
      
      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Product Name</Form.Label>
        <Form.Control type="text" name="name" value={formData.name} onChange={handleTextChange} required />
      </Form.Group>

      <Row className="mb-3">
        <Form.Group as={Col} md="6">
          <Form.Label className="fw-bold">Price (₹)</Form.Label>
          <Form.Control type="number" name="price" value={formData.price} onChange={handleTextChange} required />
        </Form.Group>
        
        {/* --- UNLIMITED COLOR PICKER FOR ADMIN --- */}
        <Form.Group as={Col} md="6">
          <Form.Label className="fw-bold">Fabric Color (Unlimited)</Form.Label>
          <div className="d-flex gap-2">
             <Form.Control
                type="color"
                name="color"
                value={formData.color}
                onChange={handleTextChange}
                style={{ width: '60px', height: '38px', padding: '2px', cursor: 'pointer' }}
              />
              <Form.Control
                type="text"
                name="color"
                value={formData.color}
                onChange={handleTextChange}
                placeholder="#hex or color name"
                required
              />
          </div>
          <Form.Text className="text-muted">Pick any color to match your fabric inventory.</Form.Text>
        </Form.Group>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Available Sizes</Form.Label>
        <div className="d-flex gap-3 flex-wrap">
          {ALL_SIZES.map(size => (
            <Form.Check 
              key={size} 
              type="checkbox" 
              label={size} 
              checked={selectedSizes.includes(size)} 
              onChange={() => handleSizeToggle(size)} 
            />
          ))}
        </div>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Upload Images</Form.Label>
        <Form.Control type="file" multiple onChange={handleFileChange} accept="image/*" />
      </Form.Group>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Button type="submit" variant="dark" className="w-100 fw-bold py-2" disabled={isLoading}>
        {isLoading ? <Spinner animation="border" size="sm" /> : 'Create Product'}
      </Button>
    </Form>
  );
};

export default ProductForm;