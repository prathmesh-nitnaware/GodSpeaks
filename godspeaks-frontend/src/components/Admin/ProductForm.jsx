import React, { useState } from 'react';
import { createProductApi } from '../../api/adminApi';
import { Form, Button, Row, Col, Spinner, Alert, InputGroup, Card } from 'react-bootstrap';

const LoadingSpinner = () => (
  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
);

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

// --- Color Options ---
const COLORS = [
  { name: 'White', hex: '#FFFFFF', border: '#e5e5e5' },
  { name: 'Black', hex: '#000000', border: '#000000' },
  { name: 'Navy', hex: '#000080', border: '#000080' },
  { name: 'Red', hex: '#DC143C', border: '#DC143C' },
  { name: 'Heather Grey', hex: '#B0B0B0', border: '#B0B0B0' },
  { name: 'Royal Blue', hex: '#4169E1', border: '#4169E1' },
];

const ProductForm = ({ onProductCreated }) => {
  // Removed ref, we will use direct overlay approach
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  
  const [selectedColor, setSelectedColor] = useState(COLORS[1]); // Default to Black
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

  // Handle selection from color picker
  const handleCustomColorChange = (e) => {
    const hex = e.target.value;
    setSelectedColor({ name: hex, hex: hex, border: hex });
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
    data.append('color', selectedColor.name);
    data.append('sizes', selectedSizes.join(','));

    for (let i = 0; i < images.length; i++) {
      data.append('images', images[i]);
    }

    try {
      const newProduct = await createProductApi(data);
      setSuccess(`Product "${newProduct.name}" created successfully!`);
      setFormData({ name: '', description: '', price: '' });
      setSelectedColor(COLORS[1]); 
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

  const hexagonStyle = {
    width: '45px',
    height: '50px',
    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    border: 'none',
  };

  const isCustomSelected = !COLORS.some(c => c.name === selectedColor.name);

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white py-3 border-bottom">
        <h5 className="mb-0 fw-bold text-dark">Add New Product</h5>
      </Card.Header>
      <Card.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          {/* Product Details Section */}
          <h6 className="text-muted text-uppercase small fw-bold mb-3">Basic Information</h6>
          <Row className="g-3 mb-4">
            <Col md={12}>
              <Form.Floating className="mb-3">
                <Form.Control
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={handleTextChange}
                  required
                />
                <label htmlFor="name">Product Name</label>
              </Form.Floating>
            </Col>
            
            <Col md={12}>
               <Form.Floating>
                <Form.Control
                  id="description"
                  as="textarea"
                  name="description"
                  placeholder="Description"
                  style={{ height: '100px' }}
                  value={formData.description}
                  onChange={handleTextChange}
                  required
                />
                <label htmlFor="description">Product Description</label>
              </Form.Floating>
            </Col>

            <Col md={6}>
              <InputGroup size="lg">
                <InputGroup.Text className="bg-light border-end-0">₹</InputGroup.Text>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleTextChange}
                  placeholder="Price"
                  className="border-start-0"
                  required
                />
              </InputGroup>
            </Col>
          </Row>

          <hr className="my-4 text-muted opacity-25" />

          {/* Color & Size Section */}
          <h6 className="text-muted text-uppercase small fw-bold mb-3">Variants & Media</h6>
          <Row className="g-4 mb-4">
            {/* 1. Base Color - Full Width and Centered Layout */}
            <Col md={12}>
              <Form.Label className="fw-semibold mb-2 d-block text-center">Base Color</Form.Label>
              <div className="d-flex flex-column justify-content-center align-items-center p-4 border rounded bg-light mb-3">
                 <div className="d-flex flex-wrap gap-3 justify-content-center align-items-center">
                    {/* Predefined Colors */}
                    {COLORS.map((c) => (
                    <div 
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        title={c.name}
                        className="position-relative"
                        style={{
                            ...hexagonStyle,
                            backgroundColor: c.hex,
                            transform: selectedColor.name === c.name ? 'scale(1.25)' : 'scale(1)',
                            opacity: selectedColor.name === c.name ? 1 : 0.6,
                            boxShadow: selectedColor.name === c.name ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                            zIndex: selectedColor.name === c.name ? 2 : 1
                        }}
                    >
                        {selectedColor.name === c.name && (
                            <div className="position-absolute top-50 start-50 translate-middle text-white" style={{ fontSize: '10px', textShadow: '0 0 2px black' }}>
                            ✓
                            </div>
                        )}
                    </div>
                    ))}

                    {/* Divider */}
                    <div style={{ width: '1px', height: '30px', backgroundColor: '#ccc', margin: '0 5px' }}></div>

                    {/* Custom Color Hexagon Trigger */}
                    <div 
                        title="Custom Color"
                        className="position-relative d-flex justify-content-center align-items-center bg-white"
                        style={{
                            ...hexagonStyle,
                            backgroundColor: isCustomSelected ? selectedColor.hex : '#ffffff',
                            backgroundImage: isCustomSelected ? 'none' : 'linear-gradient(45deg, #f3f3f3 25%, #ffffff 25%, #ffffff 50%, #f3f3f3 50%, #f3f3f3 75%, #ffffff 75%, #ffffff 100%)',
                            backgroundSize: '10px 10px',
                            transform: isCustomSelected ? 'scale(1.25)' : 'scale(1)',
                            boxShadow: isCustomSelected ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                            filter: isCustomSelected ? 'none' : 'drop-shadow(0 0 1px #999)',
                            zIndex: isCustomSelected ? 2 : 1
                        }}
                    >
                        {/* FIX: Overlay the color input directly on top.
                           This ensures the native picker spawns relative to this element, 
                           not in top-left corner (0,0) as it does with display:none.
                        */}
                        <input 
                            type="color" 
                            style={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%', 
                                opacity: 0, 
                                cursor: 'pointer' 
                            }}
                            onChange={handleCustomColorChange}
                        />

                        {isCustomSelected ? (
                            <div className="position-absolute top-50 start-50 translate-middle text-white" style={{ fontSize: '10px', textShadow: '0 0 2px black', pointerEvents: 'none' }}>
                            ✓
                            </div>
                        ) : (
                            <span className="text-muted fw-bold" style={{ fontSize: '20px', pointerEvents: 'none' }}>+</span>
                        )}
                    </div>
                 </div>
                 
                 {/* Color Name Display */}
                 <div className="text-center mt-3 pt-2 border-top border-light w-50">
                    <span className="text-muted small">Selected: </span>
                    <span className="fw-bold text-dark">{selectedColor.name}</span>
                 </div>
              </div>
            </Col>

            {/* 2. Upload Images - Centered */}
            <Col md={12}>
               <Form.Label className="fw-semibold mb-2 d-block text-center">Upload Images</Form.Label>
               <div className="p-4 border rounded bg-light text-center">
                  <Form.Control
                    type="file"
                    id="images"
                    name="images"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="mb-2 w-50 mx-auto" // Limit width and center
                  />
                  <Form.Text className="text-muted d-block small">
                    Supported formats: JPEG, PNG. Max 5MB per file.
                  </Form.Text>
               </div>
            </Col>
            
            {/* 3. Sizes */}
            <Col md={12}>
              <Form.Label className="fw-semibold mb-2 d-block text-center">Available Sizes</Form.Label>
              <div className="d-flex flex-wrap justify-content-center gap-2 p-4 border rounded bg-white">
                {ALL_SIZES.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSizes.includes(size) ? "dark" : "outline-secondary"}
                    size="md"
                    className={`rounded-pill px-4 ${selectedSizes.includes(size) ? 'fw-bold shadow-sm' : 'opacity-75'}`}
                    onClick={() => handleSizeToggle(size)}
                    style={{ minWidth: '80px' }}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>

          <div className="mt-4 pt-3 border-top">
            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
            {success && <Alert variant="success" className="py-2 small">{success}</Alert>}
            
            <div className="d-grid">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="fw-bold shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner /> Creating Product...
                  </>
                ) : (
                  'Create Product'
                )}
              </Button>
            </div>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ProductForm;