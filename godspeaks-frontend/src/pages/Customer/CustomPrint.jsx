import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Image, Alert, Spinner } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
const CUSTOM_PRICE = 99900; // Fixed price for custom prints: ₹999.00

const CustomPrint = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const { addItemToCart } = useCart();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        setError('Please upload a valid image file (JPEG, PNG).');
        return;
      }
      setFile(selected);
      // Create local preview URL
      setPreview(URL.createObjectURL(selected));
      setError('');
    }
  };

  const handleAddToCart = async () => {
    if (!file) {
      setError('Please upload an image for your design.');
      return;
    }
    if (!size) {
      setError('Please select a T-Shirt size.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // 1. Upload Image to Backend -> Cloudinary
      const formData = new FormData();
      formData.append('image', file);

      // Adjust URL based on your backend port
      const { data } = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const customUrl = data.url;

      // 2. Add to Cart
      // We create a "Virtual" product object for the cart
      const customProduct = {
        _id: 'custom-print-item', // Generic ID
        name: 'Custom Design T-Shirt',
        price: CUSTOM_PRICE,
        images: [customUrl], // Use uploaded image as product image
        category: 'Custom',
        isCustom: true
      };

      addItemToCart(customProduct, size, quantity, true, customUrl);
      
      // 3. Redirect
      navigate('/cart');

    } catch (err) {
      console.error(err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="text-center mb-5">
            <h1 className="fw-bold">Design Your Own</h1>
            <p className="text-muted">Upload your artwork and we'll print it on a premium tee.</p>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border">
            {error && <Alert variant="danger">{error}</Alert>}

            {/* 1. File Upload */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">1. Upload Artwork (Image)</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <Form.Text className="text-muted">
                Recommended: High resolution PNG with transparent background.
              </Form.Text>
            </Form.Group>

            {/* Preview Area */}
            {preview && (
              <div className="mb-4 text-center bg-light p-3 rounded position-relative">
                <p className="small text-muted mb-2">Preview (Mockup)</p>
                <div style={{ position: 'relative', display: 'inline-block', width: '300px', height: '350px' }}>
                   {/* Blank T-Shirt Base Image */}
                   <Image 
                      src="https://res.cloudinary.com/dkqtb4wmq/image/upload/v1/godspeaks-assets/blank-white-tee" 
                      alt="Blank Tee" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      // If you don't have a blank tee image online, remove src or use a placeholder
                      onError={(e) => {e.target.src = 'https://via.placeholder.com/300x350?text=T-Shirt+Base'}} 
                   />
                   
                   {/* User's Uploaded Art Overlay */}
                   <Image 
                      src={preview} 
                      alt="Preview" 
                      style={{ 
                        position: 'absolute', 
                        top: '25%', 
                        left: '25%', 
                        width: '50%', 
                        height: '40%', 
                        objectFit: 'contain',
                        mixBlendMode: 'multiply' // Helps blend ink into fabric visually
                      }} 
                   />
                </div>
              </div>
            )}

            {/* 2. Size Selection */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">2. Select Size</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {SIZES.map(s => (
                  <Button
                    key={s}
                    variant={size === s ? 'dark' : 'outline-dark'}
                    onClick={() => setSize(s)}
                    className="flex-grow-1"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </Form.Group>

            {/* 3. Quantity */}
            <Form.Group className="mb-4">
               <Form.Label className="fw-semibold">3. Quantity</Form.Label>
               <Form.Control 
                  type="number" 
                  min="1" 
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  style={{ maxWidth: '100px' }}
               />
            </Form.Group>

            <div className="d-grid mt-5">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleAddToCart}
                disabled={uploading}
                className="fw-bold"
              >
                {uploading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Uploading Design...
                  </>
                ) : (
                  `Add to Cart - ₹${(CUSTOM_PRICE/100).toFixed(2)}`
                )}
              </Button>
            </div>

          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomPrint;