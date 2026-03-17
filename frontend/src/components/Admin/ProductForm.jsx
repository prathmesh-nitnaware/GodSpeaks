import React, { useState } from 'react';
import { Form, Button, Row, Col, Container, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL', 'ONE_SIZE'];

const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://godspeaks.onrender.com';

const ProductForm = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // --------------------
  // STATE
  // --------------------
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Apparel',
    color: '#000000',
  });

  const [sizes, setSizes] = useState(
    SIZES.map(size => ({ size, available: true }))
  );

  const [availableColors, setAvailableColors] = useState([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // --------------------
  // HANDLERS
  // --------------------
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSize = sizeName => {
    setSizes(prev =>
      prev.map(s =>
        s.size === sizeName ? { ...s, available: !s.available } : s
      )
    );
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setAvailableColors(prev => [
      ...prev,
      { name: newColorName.trim(), hex: newColorHex },
    ]);
    setNewColorName('');
  };

  // --------------------
  // IMAGE UPLOAD
  // --------------------
  const uploadImages = async () => {
    const adminData =
      JSON.parse(localStorage.getItem('godspeaks_admin')) || {};
    const authToken = token || adminData.token;

    if (!authToken) {
      throw new Error('Admin authentication required');
    }

    const urls = [];

    for (const file of images) {
      const form = new FormData();
      form.append('image', file);

      const res = await axios.post(`${API_BASE_URL}/api/upload`, form, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      urls.push(res.data.url);
    }

    return urls;
  };

  // --------------------
  // SUBMIT
  // --------------------
  const submitHandler = async e => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    try {
      const adminData =
        JSON.parse(localStorage.getItem('godspeaks_admin')) || {};
      const authToken = token || adminData.token;

      if (!authToken) {
        throw new Error('Admin authentication required');
      }

      const imageUrls = await uploadImages();

      const payload = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        category: formData.category,
        color: formData.color,
        sizes,
        availableColors,
        images: imageUrls,
        isAvailable: true,
      };

      await axios.post(`${API_BASE_URL}/api/products`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  // --------------------
  // UI
  // --------------------
  return (
    <Container>
      <h2 className="my-4 fw-bold">Create POD Product</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <Form onSubmit={submitHandler} className="p-4 border rounded bg-white">
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Price (₹)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
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
            onChange={handleChange}
          />
        </Form.Group>

        <h5 className="mt-4">Available Sizes</h5>
        <div className="d-flex flex-wrap gap-3 mb-3">
          {sizes.map(s => (
            <Form.Check
              key={s.size}
              label={s.size}
              checked={s.available}
              onChange={() => toggleSize(s.size)}
            />
          ))}
        </div>

        <h5 className="mt-4">Colors</h5>
        <Row className="mb-3">
          <Col md={5}>
            <Form.Control
              placeholder="Color name (e.g. Black)"
              value={newColorName}
              onChange={e => setNewColorName(e.target.value)}
            />
          </Col>
          <Col md={2}>
            <Form.Control
              type="color"
              value={newColorHex}
              onChange={e => setNewColorHex(e.target.value)}
            />
          </Col>
          <Col md={2}>
            <Button onClick={handleAddColor}>Add</Button>
          </Col>
        </Row>

        <div className="d-flex gap-2 flex-wrap mb-3">
          {availableColors.map((c, i) => (
            <Badge key={i} bg="light" text="dark" className="border">
              <span
                style={{
                  background: c.hex,
                  width: 12,
                  height: 12,
                  display: 'inline-block',
                  marginRight: 6,
                }}
              />
              {c.name}
            </Badge>
          ))}
        </div>

        <Form.Group className="mb-4">
          <Form.Label>Upload Images</Form.Label>
          <Form.Control
            type="file"
            multiple
            onChange={e => setImages([...e.target.files])}
          />
        </Form.Group>

        <Button type="submit" disabled={uploading} className="w-100">
          {uploading ? 'Creating…' : 'Create Product'}
        </Button>
      </Form>
    </Container>
  );
};

export default ProductForm;
