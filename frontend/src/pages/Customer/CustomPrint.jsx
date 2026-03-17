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
    data.append("upload_preset", "godspeaks_unsigned"); 
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
        images: [url1], 
        isCustom: true,
        printFileUrl: url1,      
        secondaryPrintUrl: url2, 
        color: selectedColor.name,
        message: customMessage   
      };

      addItemToCart(customItem, selectedSize, quantity);
      setSuccess(true);
      setCustomMessage('');
      setDesign1(null); setDesign2(null);
      setPreview1(null); setPreview2(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Upload failed. Please check your connection.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container className="py-4 py-lg-5">
      <Row className="gy-4">
        {/* --- LEFT: LIVE DESIGN PREVIEW --- */}
        <Col lg={7} className="order-1 order-lg-1">
          {/* Responsive Container using CSS class from index.css */}
          <div 
            className="design-canvas-container position-relative bg-light border rounded d-flex justify-content-center align-items-center shadow-sm overflow-hidden" 
          >
            {/* Base T-Shirt Image */}
            <Image 
              src="/blank-tee.png" 
              className="w-100 h-100" 
              style={{ 
                objectFit: 'contain', 
                filter: selectedColor.name === 'White' ? 'none' : `drop-shadow(0 0 0 ${selectedColor.hex})`,
                transition: 'filter 0.3s ease'
              }} 
            />
            {/* Design Overlays - Centered visually on the chest area */}
            <div className="position-absolute d-flex flex-column align-items-center" style={{ top: '25%', width: '30%', zIndex: 2 }}>
              {preview1 && <Image src={preview1} className="w-100 mb-2 shadow-sm border border-white" style={{ mixBlendMode: 'multiply' }} />}
              {preview2 && <Image src={preview2} className="w-100 shadow-sm border border-white" style={{ mixBlendMode: 'multiply', opacity: 0.8 }} />}
              
              {!preview1 && !preview2 && (
                 <div className="text-muted border border-dashed p-2 text-center small opacity-50">
                    Artwork Area
                 </div>
              )}
            </div>
          </div>
          <p className="text-center text-muted small mt-3">
             <i className="bi bi-info-circle me-1"></i>
             Digital Mockup. Final print placement may vary slightly.
          </p>
        </Col>

        {/* --- RIGHT: CONTROLS --- */}
        <Col lg={5} className="order-2 order-lg-2">
          <Card className="border-0 shadow-sm p-4 h-100">
            <h4 className="fw-bold mb-3 text-dark">Create Your Masterpiece</h4>
            
            {/* Step 1: Upload */}
            <div className="mb-4">
               <h6 className="fw-bold text-primary mb-2">1. Upload Design</h6>
               <Row className="g-2">
                  <Col xs={12}>
                    <Form.Label className="small fw-bold text-muted">Front Design *</Form.Label>
                    <Form.Control type="file" size="sm" onChange={(e) => handleFileChange(e, 1)} accept="image/*" />
                  </Col>
                  <Col xs={12}>
                     <Form.Label className="small fw-bold text-muted">Back Design (Optional)</Form.Label>
                     <Form.Control type="file" size="sm" onChange={(e) => handleFileChange(e, 2)} accept="image/*" />
                  </Col>
               </Row>
            </div>

            {/* Step 2: Color */}
            <div className="mb-4">
               <h6 className="fw-bold text-primary mb-2">2. Choose Color</h6>
               <div className="d-flex flex-wrap gap-2">
                {BASE_COLORS.map(c => (
                    <div 
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    style={{ 
                        width: '32px', height: '32px', backgroundColor: c.hex, borderRadius: '50%', cursor: 'pointer',
                        border: selectedColor.name === c.name ? '3px solid #0d6efd' : '1px solid #ddd',
                        boxShadow: 'inset 0 0 2px rgba(0,0,0,0.2)'
                    }}
                    title={c.name}
                    />
                ))}
               </div>
               <small className="text-muted mt-1 d-block">Selected: {selectedColor.name}</small>
            </div>

            {/* Step 3: Size */}
            <div className="mb-4">
                <h6 className="fw-bold text-primary mb-2">3. Size & Qty</h6>
                <div className="d-flex flex-wrap gap-2 mb-3">
                {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <Button 
                    key={s} 
                    variant={selectedSize === s ? "dark" : "outline-secondary"} 
                    size="sm"
                    onClick={() => setSelectedSize(s)} 
                    className="fw-bold px-3"
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
                    className="w-50"
                    placeholder="Qty"
                />
            </div>

            {/* Step 4: Notes */}
            <div className="mb-4">
                <h6 className="fw-bold text-primary mb-2">4. Notes</h6>
                <Form.Control 
                    as="textarea" 
                    rows={2} 
                    placeholder="E.g. Make logo larger, center align..." 
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="fs-6"
                />
            </div>

            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
            {success && <Alert variant="success" className="py-2 small">Added to cart!</Alert>}

            <Button 
              variant="dark" 
              size="lg" 
              className="w-100 fw-bold py-3 mt-auto shadow-sm" 
              disabled={isUploading} 
              onClick={handleAddToCart}
            >
              {isUploading ? <Spinner animation="border" size="sm" /> : "Add Custom Tee - ₹999"}
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomPrint;