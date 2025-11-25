import React, { useState } from 'react';
import { createProductApi } from '../../api/adminApi';
import { Form, Button, Row, Col, Spinner, Alert, InputGroup } from 'react-bootstrap';

const LoadingSpinner = () => (
  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
);

const ProductForm = ({ onProductCreated }) => {
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

    if (stock.length === 0 || !images || images.length === 0) {
      setError('Please add at least one stock size and one image.');
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('stock', JSON.stringify(stock));

    for (let i = 0; i < images.length; i++) {
      data.append('images', images[i]);
    }

    try {
      const newProduct = await createProductApi(data);
      setSuccess(`Product "${newProduct.name}" created successfully!`);
      setFormData({ name: '', description: '', price: '', category: 'Faith' });
      setStock([]);
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
        <Form.Label>Product Images</Form.Label>
        <Form.Control
          type="file"
          name="images"
          onChange={handleFileChange}
          multiple
          accept="image/*"
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