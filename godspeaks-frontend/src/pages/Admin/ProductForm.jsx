import React, { useState } from 'react';
import { createProductApi } from '../../api/adminApi';
import { Form, Button, Row, Col, Spinner, Alert, InputGroup } from 'react-bootstrap';

const LoadingSpinner = () => (
  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
);

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

const ProductForm = ({ onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    color: '', // Replaces Category
  });
  
  // New: Simple array of selected sizes
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

    if (selectedSizes.length === 0 || !images || images.length === 0) {
      setError('Please select at least one size and upload one image.');
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('color', formData.color || 'Black');
    
    // Pass sizes as a comma-separated string or append individually
    data.append('sizes', selectedSizes.join(','));

    for (let i = 0; i < images.length; i++) {
      data.append('images', images[i]);
    }

    try {
      const newProduct = await createProductApi(data);
      setSuccess(`Product "${newProduct.name}" created successfully!`);
      setFormData({ name: '', description: '', price: '', color: '' });
      setSelectedSizes(['S', 'M', 'L', 'XL', 'XXL']);
      setImages(null);
      if(document.getElementById('images')) {
        document.getElementById('images').value = null; 
      }
      
      if (onProductCreated) {
        onProductCreated(newProduct);
      }
    } catch (err) {
      setError(err.message || 'Failed to create product.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="name">
        <Form.Label>Product Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={formData.name}
          onChange={handleTextChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="description">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleTextChange}
          required
        />
      </Form.Group>

      <Row className="mb-3">
        <Form.Group as={Col} md="6" controlId="price">
          <Form.Label>Price (in ₹)</Form.Label>
          <InputGroup>
            <InputGroup.Text>₹</InputGroup.Text>
            <Form.Control
              type="number"
              name="price"
              value={formData.price}
              onChange={handleTextChange}
              placeholder="e.g., 799"
              required
            />
          </InputGroup>
        </Form.Group>
        
        {/* --- CHANGED: Color Input instead of Category --- */}
        <Form.Group as={Col} md="6" controlId="color">
          <Form.Label>Product Color</Form.Label>
          <Form.Control
            type="text"
            name="color"
            value={formData.color}
            onChange={handleTextChange}
            placeholder="e.g. Black, Navy Blue, White"
            required
          />
        </Form.Group>
      </Row>

      <Form.Group className="mb-3" controlId="images">
        <Form.Label>Product Images</Form.Label>
        <Form.Control
          type="file"
          name="images"
          onChange={handleFileChange}
          multiple
          accept="image/*"
        />
      </Form.Group>

      {/* --- CHANGED: Simple Checkboxes for Sizes (No Counts) --- */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold d-block">Available Sizes (POD)</Form.Label>
        <div className="d-flex flex-wrap gap-3">
          {ALL_SIZES.map((size) => (
            <Form.Check
              key={size}
              type="checkbox"
              id={`size-${size}`}
              label={size}
              checked={selectedSizes.includes(size)}
              onChange={() => handleSizeToggle(size)}
            />
          ))}
        </div>
      </Form.Group>

      <div className="mt-4">
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Button
          type="submit"
          variant="dark"
          size="lg"
          className="w-100 fw-semibold"
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner /> : 'Create Product'}
        </Button>
      </div>
    </Form>
  );
};

export default ProductForm;