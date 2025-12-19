import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Card, Image, Spinner, Alert } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import axios from 'axios';

const BASE_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#212529' },
  { name: 'Red', hex: '#c0392b' },
  { name: 'Yellow', hex: '#f1c40f' },
  { name: 'Sky Blue', hex: '#87CEEB' },
  { name: 'Green', hex: '#27ae60' },
  { name: 'Olive', hex: '#556b2f' },
  { name: 'Navy', hex: '#2c3e50' }
];

const CustomPrint = () => {
  const { addItemToCart } = useCart();
  
  const [selectedColor, setSelectedColor] = useState(BASE_COLORS[0]);
  const [design1, setDesign1] = useState(null); 
  const [design2, setDesign2] = useState(null); 
  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customMessage, setCustomMessage] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e, slot) => {
    const file = e.target.files[0];
    if (file) {
      if (slot === 1) {
        setDesign1(file);
        setPreview1(URL.createObjectURL(file));
      } else {
        setDesign2(file);
        setPreview2(URL.createObjectURL(file));
      }
    }
  };

  const uploadImage = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "godspeaks_unsigned"); // Replace with your Cloudinary Preset
    const res = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, data);
    return res.data.secure_url;
  };

  const handleAddToCart = async () => {
    if (!design1 || !selectedSize) {
      setError("Please upload at least the primary design and select a size.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const url1 = await uploadImage(design1);
      const url2 = design2 ? await uploadImage(design2) : null; 

      const customItem = {
        _id: `custom-${Date.now()}`,
        name: `Custom ${selectedColor.name} Tee`,
        price: 99900, 
        images: [url1], // Main image for cart thumbnail
        isCustom: true,
        printFileUrl: url1,      // Primary design for Admin
        secondaryPrintUrl: url2, // Secondary design for Admin
        color: selectedColor.name,
        message: customMessage   // Instructions for Admin
      };

      addItemToCart(customItem, selectedSize, quantity);
      setSuccess(true);
      setCustomMessage('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Upload failed. Check your Cloudinary config.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="gy-4">
        {/* --- LEFT: LIVE DESIGN PREVIEW --- */}
        <Col lg={7}>
          <div className="position-relative bg-light border rounded d-flex justify-content-center align-items-center shadow-sm" style={{ minHeight: '550px' }}>
            {/* Base T-Shirt Image */}
            <Image 
              src="/blank-tee.png" 
              className="w-100 h-100" 
              style={{ 
                objectFit: 'contain', 
                // This filter applies the selected color to the white T-shirt image
                filter: selectedColor.name === 'White' ? 'none' : `drop-shadow(0 0 0 ${selectedColor.hex})` 
              }} 
            />
            {/* User Design Overlays */}
            <div className="position-absolute" style={{ top: '25%', width: '32%', zIndex: 2 }}>
              {preview1 && <Image src={preview1} className="w-100 mb-2 shadow-sm" style={{ mixBlendMode: 'multiply' }} />}
              {preview2 && <Image src={preview2} className="w-100 shadow-sm" style={{ mixBlendMode: 'multiply', opacity: 0.8 }} />}
            </div>
          </div>
          <p className="text-center text-muted small mt-3">* Mockup for visualization. Printing is done with original high-res files.</p>
        </Col>

        {/* --- RIGHT: CUSTOMIZATION CONTROLS --- */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm p-4 h-100">
            <h5 className="fw-bold mb-3 text-primary">1. Upload Artwork (Max 2)</h5>
            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">Primary Design (Front)</Form.Label>
              <Form.Control type="file" onChange={(e) => handleFileChange(e, 1)} />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold">Secondary Design (Back/Optional)</Form.Label>
              <Form.Control type="file" onChange={(e) => handleFileChange(e, 2)} />
            </Form.Group>

            <h5 className="fw-bold mb-3 text-primary">2. Select Shirt Color</h5>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {BASE_COLORS.map(c => (
                <div 
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  style={{ 
                    width: '38px', height: '38px', backgroundColor: c.hex, borderRadius: '50%', cursor: 'pointer',
                    border: selectedColor.name === c.name ? '3px solid #007bff' : '1px solid #ddd',
                    boxShadow: 'inset 0 0 4px rgba(0,0,0,0.2)'
                  }}
                  title={c.name}
                />
              ))}
            </div>

            <h5 className="fw-bold mb-3 text-primary">3. Size & Quantity</h5>
            <div className="d-flex gap-2 mb-3">
              {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                <Button 
                  key={s} 
                  variant={selectedSize === s ? "primary" : "outline-secondary"} 
                  onClick={() => setSelectedSize(s)} 
                  className="flex-grow-1 fw-bold"
                >
                  {s}
                </Button>
              ))}
            </div>
            <Form.Control 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              className="w-25 text-center fw-bold mb-4" 
            />

            <h5 className="fw-bold mb-3 text-primary">4. Special Instructions</h5>
            <Form.Group className="mb-4">
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Message (e.g. print placement, gift note...)" 
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            </Form.Group>

            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
            {success && <Alert variant="success" className="py-2 small">Successfully added to cart!</Alert>}

            <Button 
              variant="primary" 
              size="lg" 
              className="w-100 fw-bold py-3 mt-auto" 
              disabled={isUploading} 
              onClick={handleAddToCart}
            >
              {isUploading ? <Spinner animation="border" size="sm" /> : "Add to Cart - ₹999.00"}
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomPrint;