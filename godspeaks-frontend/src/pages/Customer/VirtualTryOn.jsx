import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Rnd } from 'react-rnd'; // For draggable/resizable shirt
import html2canvas from 'html2canvas'; // For taking photos
import { Container, Row, Col, Button, Spinner, Card } from 'react-bootstrap';
import { fetchAllProducts } from '../../api/productsApi';
import { Link } from 'react-router-dom';

const VirtualTryOn = () => {
  const webcamRef = useRef(null);
  const captureRef = useRef(null); // Ref for the div capturing the combined image
  
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('webcam'); // 'webcam' or 'upload'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  // Fetch products on load
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchAllProducts();
        // Handle API response structure (data.products or just data)
        const productList = data.products || data || [];
        setProducts(productList);
        if (productList.length > 0) setSelectedProduct(productList[0]);
      } catch (err) {
        console.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Handle File Upload (Alternative to Webcam)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      setMode('upload');
    }
  };

  // Capture Screenshot (Merge Webcam/Photo + Shirt)
  const handleCapture = async () => {
    if (captureRef.current) {
      // Use html2canvas to take a picture of the DOM element
      const canvas = await html2canvas(captureRef.current, { 
          backgroundColor: null,
          useCORS: true // Important for loading images from Cloudinary
      });
      setCapturedImage(canvas.toDataURL('image/png'));
    }
  };

  return (
    <Container className="py-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold">Virtual Try-On Studio 📸</h1>
        <p className="text-muted">
          Select a design, drag to adjust, and see how it fits!
        </p>
      </div>

      <Row className="gy-4">
        {/* --- LEFT: CONTROLS & PRODUCTS --- */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="fw-bold mb-3">1. Select a Design</h5>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <div className="d-flex flex-wrap gap-2 mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {products.map((p) => (
                    <img
                      key={p._id}
                      src={p.images[0]}
                      alt={p.name}
                      onClick={() => setSelectedProduct(p)}
                      className={`border rounded cursor-pointer ${selectedProduct?._id === p._id ? 'border-primary border-3' : ''}`}
                      style={{ width: '80px', height: '80px', objectFit: 'contain', cursor: 'pointer' }}
                      title={p.name}
                    />
                  ))}
                </div>
              )}

              <h5 className="fw-bold mb-3">2. Choose Mode</h5>
              <div className="d-flex gap-2 mb-3">
                <Button 
                    variant={mode === 'webcam' ? 'dark' : 'outline-dark'} 
                    onClick={() => setMode('webcam')}
                    className="flex-grow-1"
                >
                    Live Camera
                </Button>
                <Button 
                    variant={mode === 'upload' ? 'dark' : 'outline-dark'} 
                    onClick={() => document.getElementById('upload-input').click()}
                    className="flex-grow-1"
                >
                    Upload Photo
                </Button>
                <input 
                    type="file" 
                    id="upload-input" 
                    hidden 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                />
              </div>

              <div className="alert alert-info small">
                <i className="bi bi-arrows-move me-2"></i>
                <strong>Instructions:</strong> Drag the shirt to move it. Drag the corners to resize it to fit your body.
              </div>
              
              {selectedProduct && (
                  <div className="mt-4 pt-3 border-top text-center">
                      <h6 className="fw-bold">{selectedProduct.name}</h6>
                      <p>₹{(selectedProduct.price / 100).toFixed(2)}</p>
                      <Button as={Link} to={`/product/${selectedProduct._id}`} variant="primary" className="w-100">
                          Buy This Look
                      </Button>
                  </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* --- RIGHT: PREVIEW AREA --- */}
        <Col lg={8}>
          <div className="position-relative bg-dark rounded overflow-hidden d-flex justify-content-center align-items-center" style={{ minHeight: '500px', backgroundColor: '#000' }}>
            
            {/* Capture Area Wrapper - This is what gets screenshotted */}
            <div ref={captureRef} className="position-relative" style={{ width: '100%', height: '100%', maxWidth: '640px', overflow: 'hidden' }}>
                
                {/* A. Background Layer (Webcam or Image) */}
                {mode === 'webcam' ? (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "user" }}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                ) : uploadedImage ? (
                    <img src={uploadedImage} alt="User Upload" style={{ width: '100%', display: 'block' }} />
                ) : (
                    <div className="text-white text-center py-5 d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
                        <div>Please upload a photo or enable camera permissions.</div>
                    </div>
                )}

                {/* B. Overlay Layer (Draggable Shirt) */}
                {selectedProduct && (
                    <Rnd
                        default={{
                            x: 100,
                            y: 100,
                            width: 200,
                            height: 200,
                        }}
                        bounds="parent"
                        lockAspectRatio={true}
                    >
                        <img 
                            src={selectedProduct.images[0]} 
                            alt="Shirt Overlay" 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain', 
                                pointerEvents: 'none' // Lets clicks pass through to Rnd handler
                            }}
                            crossOrigin="anonymous" // Essential for html2canvas + Cloudinary
                        />
                    </Rnd>
                )}
            </div>

            {/* Action Buttons Overlay */}
            <div className="position-absolute bottom-0 mb-3 d-flex gap-3" style={{ zIndex: 10 }}>
                <Button variant="light" onClick={handleCapture} className="shadow fw-bold">
                    📸 Take Snapshot
                </Button>
            </div>
          </div>

          {/* Snapshot Result */}
          {capturedImage && (
              <div className="mt-4 text-center bg-light p-4 rounded border">
                  <h5 className="fw-bold mb-3">Your Try-On Result</h5>
                  <img src={capturedImage} alt="Snapshot" className="img-fluid rounded border shadow-sm mb-3" style={{ maxHeight: '400px' }} />
                  <div>
                      <a href={capturedImage} download="godspeaks-tryon.png" className="btn btn-dark">
                          <i className="bi bi-download me-2"></i> Download Image
                      </a>
                  </div>
              </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default VirtualTryOn;