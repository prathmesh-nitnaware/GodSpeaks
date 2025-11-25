import React, { useState, useEffect } from 'react';
import { createProductApi, updateProductApi } from '../../api/adminApi';
import { Form, Button, Row, Col, Spinner, Alert, InputGroup } from 'react-bootstrap';

const LoadingSpinner = () => (
  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
);

const ProductForm = ({ onProductCreated, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Faith',
  });
  const [stock, setStock] = useState([]); 
  const [images, setImages] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Populate form if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        // Backend sends price in paisa, convert to rupees for display
        price: initialData.price ? initialData.price / 100 : '', 
        category: initialData.category || 'Faith',
      });
      setStock(initialData.stock || []);
      // Note: We cannot programmatically set file inputs for security reasons.
      // Images will only be updated if the user selects new ones.
    } else {
        // Reset if switching back to add mode
        setFormData({ name: '', description: '', price: '', category: 'Faith' });
        setStock([]);
        setImages(null);
    }
  }, [initialData]);

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const addStockItem = () => {
    setStock([...stock, { size: 'S', count: 0 }]);
  };

  const handleStockChange = (index, field, value) => {
    const newStock = [...stock];
    newStock[index][field] = value;
    setStock(newStock);
  };

  const removeStockItem = (index) => {
    setStock(stock.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (stock.length === 0) {
      setError('Please add at least one stock size.');
      setIsLoading(false);
      return;
    }
    // If creating new, image is required. If editing, it's optional.
    if (!initialData && (!images || images.length === 0)) {
      setError('Please add at least one image for a new product.');
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('stock', JSON.stringify(stock));

    if (images) {
        for (let i = 0; i < images.length; i++) {
            data.append('images', images[i]);
        }
    }

    try {
      let result;
      if (initialData) {
        // Update
        result = await updateProductApi(initialData._id, data);
        setSuccess(`Product "${result.product.name}" updated successfully!`);
      } else {
        // Create
        result = await createProductApi(data);
        setSuccess(`Product "${result.name}" created successfully!`); // Adjust based on API response structure
        
        // Clear form only on create
        setFormData({ name: '', description: '', price: '', category: 'Faith' });
        setStock([]);
        setImages(null);
        if(document.getElementById('images')) document.getElementById('images').value = null; 
      }
      
      if (onProductCreated) {
        // Pass the updated/created product back up
        onProductCreated(initialData ? result.product : result);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save product.');
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
        <Form.Group as={Col} md="6" controlId="category">
          <Form.Label>Category</Form.Label>
          <Form.Select
            name="category"
            value={formData.category}
            onChange={handleTextChange}
            required
          >
            <option>Faith</option>
            <option>Scripture</option>
            <option>Minimalist</option>
            <option>Inspirational</option>
          </Form.Select>
        </Form.Group>
      </Row>

      <Form.Group className="mb-3" controlId="images">
        <Form.Label>Product Images {initialData && <span className="text-muted small">(Leave empty to keep current)</span>}</Form.Label>
        <Form.Control
          type="file"
          name="images"
          id="images"
          onChange={handleFileChange}
          multiple
          accept="image/*"
          // Required only if creating new
          required={!initialData}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Stock by Size</Form.Label>
        {stock.map((item, index) => (
          <Row key={index} className="g-2 mb-2 align-items-center">
            <Col xs={4}>
              <Form.Select
                value={item.size}
                onChange={(e) => handleStockChange(index, 'size', e.target.value)}
              >
                <option>S</option>
                <option>M</option>
                <option>L</option>
                <option>XL</option>
                <option>XXL</option>
              </Form.Select>
            </Col>
            <Col xs={4}>
              <Form.Control
                type="number"
                placeholder="Count"
                value={item.count}
                onChange={(e) => handleStockChange(index, 'count', parseInt(e.target.value))}
              />
            </Col>
            <Col xs="auto">
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => removeStockItem(index)}
              >
                Remove
              </Button>
            </Col>
          </Row>
        ))}
        <Button
          variant="outline-primary"
          size="sm"
          onClick={addStockItem}
          className="mt-2"
        >
          + Add Size
        </Button>
      </Form.Group>

      <div className="mt-4 d-flex gap-2">
        <Button
          type="submit"
          variant="dark"
          className="w-100 fw-semibold"
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner /> : (initialData ? 'Update Product' : 'Create Product')}
        </Button>
        {initialData && (
            <Button variant="outline-secondary" onClick={onCancel}>
                Cancel
            </Button>
        )}
      </div>
      
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      {success && <Alert variant="success" className="mt-3">{success}</Alert>}
    </Form>
  );
};

export default ProductForm;