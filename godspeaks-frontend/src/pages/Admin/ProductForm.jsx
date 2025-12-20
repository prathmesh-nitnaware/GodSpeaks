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

    // Validation: Require at least one image and one size
    if (!images || images.length === 0 || selectedSizes.length === 0) {
      setError('Please select at least one size and upload one image.');
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('color', formData.color); // Saves custom Hex or Name
    data.append('sizes', selectedSizes.join(',')); // Backend handles POD object formatting

    if (images) {
      for (let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
    }

    try {
      const newProduct = await createProductApi(data);
      setSuccess(`Product "${newProduct.name}" created successfully!`);
      
      // Clear Form on Success
      setFormData({ name: '', description: '', price: '', color: '#000000' });
      setSelectedSizes(['S', 'M', 'L', 'XL', 'XXL']);
      setImages(null);
      
      // Manually reset the file input field
      const fileInput = document.getElementById('images-input');
      if (fileInput) fileInput.value = null;

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
    <Form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-sm border">
      <h4 className="mb-4 fw-bold">Inventory: Add New Apparel</h4>

      <Form.Group className="mb-3" controlId="name">
        <Form.Label className="fw-bold">Product Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          placeholder="e.g. Divine Oversized Tee"
          value={formData.name}
          onChange={handleTextChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="description">
        <Form.Label className="fw-bold">Description</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          rows={3}
          placeholder="Tell customers about the fabric and fit..."
          value={formData.description}
          onChange={handleTextChange}
          required
        />
      </Form.Group>

      <Row className="mb-3 g-3">
        <Col md={6}>
          <Form.Group controlId="price">
            <Form.Label className="fw-bold">Price (₹)</Form.Label>
            <InputGroup>
              <InputGroup.Text>₹</InputGroup.Text>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleTextChange}
                placeholder="e.g. 799"
                required
              />
            </InputGroup>
          </Form.Group>
        </Col>
        
        {/* --- UNLIMITED COLOR PICKER --- */}
        <Col md={6}>
          <Form.Group controlId="color">
            <Form.Label className="fw-bold">Fabric Color (Unlimited)</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="color"
                name="color"
                value={formData.color}
                onChange={handleTextChange}
                style={{ width: '60px', height: '38px', padding: '2px', cursor: 'pointer' }}
                title="Select hex visually"
              />
              <Form.Control
                type="text"
                name="color"
                value={formData.color}
                onChange={handleTextChange}
                placeholder="#hex or Name"
                required
              />
            </div>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Product Showcase Images</Form.Label>
        <Form.Control
          id="images-input"
          type="file"
          name="images"
          onChange={handleFileChange}
          multiple
          accept="image/*"
        />
        <Form.Text className="text-muted small">
          Tip: Select multiple images to show front, back, and detail shots.
        </Form.Text>
      </Form.Group>

      {/* --- POD SIZE SELECTION --- */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold d-block">Available Sizes (POD)</Form.Label>
        <div className="d-flex flex-wrap gap-3 p-2 bg-light rounded border">
          {ALL_SIZES.map((size) => (
            <Form.Check
              key={size}
              type="checkbox"
              id={`size-${size}`}
              label={<span className="fw-medium">{size}</span>}
              checked={selectedSizes.includes(size)}
              onChange={() => handleSizeToggle(size)}
            />
          ))}
        </div>
      </Form.Group>

      <div className="mt-4">
        {error && <Alert variant="danger" className="py-2">{error}</Alert>}
        {success && <Alert variant="success" className="py-2">{success}</Alert>}
        <Button
          type="submit"
          variant="dark"
          size="lg"
          className="w-100 fw-bold shadow-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Creating Product...
            </>
          ) : (
            'Publish Product to Store'
          )}
        </Button>
      </div>
    </Form>
  );
};

export default ProductForm;