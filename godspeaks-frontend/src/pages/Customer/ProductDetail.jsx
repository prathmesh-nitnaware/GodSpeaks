import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container, Row, Col, Image, Button, Spinner, Alert, ButtonGroup, Form, ListGroup, InputGroup, Breadcrumb
} from "react-bootstrap";
import {
  fetchProductById, addProductReviewApi, joinWaitlistApi, fetchRelatedProducts,
} from "../../api/productsApi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import ProductCard from "../../components/Products/ProductCard";
import SizeGuideModal from "../../components/Products/SizeGuideModal";

// --- Icons ---
const StarIcon = ({ filled }) => (
  <svg className={`bi ${filled ? "text-warning" : "text-muted"}`} width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z" />
  </svg>
);

const ProductDetail = () => {
  const { id } = useParams();
  const { addItemToCart } = useCart();
  const { adminInfo } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selection State
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(""); // NEW: Stores selected color name
  const [quantity, setQuantity] = useState(1);
  const [addMessage, setAddMessage] = useState("");
  const [mainImage, setMainImage] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState(null);

  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const fetchProductData = useCallback(async (isRefresh = false) => {
      try {
        if (!isRefresh) setIsLoading(true);
        setError(null);
        const [productData, relatedData] = await Promise.all([
          fetchProductById(id),
          fetchRelatedProducts(id),
        ]);
        setProduct(productData);
        setRelatedProducts(relatedData);
        
        if (productData.images && productData.images.length > 0) {
          setMainImage(productData.images[0]);
        }
        // Set default selected color
        if (productData.availableColors && productData.availableColors.length > 0) {
            setSelectedColor(productData.availableColors[0].name);
        } else {
            setSelectedColor(productData.color); // Fallback to primary color
        }

        if (!isRefresh) window.scrollTo(0, 0);
      } catch (err) {
        setError("Product not found.");
      } finally {
        if (!isRefresh) setIsLoading(false);
      }
    }, [id]);

  useEffect(() => { fetchProductData(); }, [fetchProductData]);

  const handleAddToCart = () => {
    setAddMessage("");
    if (!selectedSize) {
      setAddMessage("Please select a size.");
      setTimeout(() => setAddMessage(""), 2000);
      return;
    }
    
    // Create item with specific color selection
    const itemToAdd = {
        ...product,
        selectedColor: selectedColor // Pass this to Cart
    };

    addItemToCart(itemToAdd, selectedSize, quantity);
    setAddMessage(product.stockStatus === "pre-order" ? "Pre-Order Confirmed!" : "Added to cart!");
    setTimeout(() => setAddMessage(""), 2000);
  };

  if (isLoading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>;
  if (error || !product) return <Container className="py-5"><Alert variant="danger">{error || "Product not found"}</Alert></Container>;

  const priceInRupees = (product.price / 100).toFixed(2);
  const isOutOfStock = product.stockStatus === "out-of-stock";

  return (
    <Container className="py-4 pb-5 mb-5">
      <Breadcrumb className="small mb-4 text-muted">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/shop" }}>Shop</Breadcrumb.Item>
        <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="g-4 g-lg-5 mb-5">
        {/* LEFT: Gallery */}
        <Col lg={6}>
          <div className="mb-3">
            <Image
              src={mainImage || product.images[0]}
              fluid rounded
              className={`w-100 shadow-sm border ${isOutOfStock ? "opacity-75" : ""}`}
              style={{ objectFit: 'contain', maxHeight: '500px' }}
            />
          </div>
          <div className="d-flex gap-2 overflow-auto pb-2">
            {product.images.map((img, idx) => (
              <Image 
                key={idx} src={img} thumbnail
                style={{ width: '70px', height: '70px', objectFit: 'cover', cursor: 'pointer', borderColor: mainImage === img ? '#000' : '#dee2e6' }}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </Col>

        {/* RIGHT: Details */}
        <Col lg={6}>
            {product.stockStatus === 'pre-order' && <span className="badge bg-warning text-dark mb-2 px-3 py-2">PRE-ORDER</span>}
            <h1 className="display-6 fw-bold text-dark">{product.name}</h1>
            <p className="fs-2 fw-semibold text-dark mb-2">₹{priceInRupees}</p>
            
            <div className="d-flex align-items-center mb-3">
                 <div className="d-flex text-warning me-2">{[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < product.rating} />)}</div>
                 <span className="text-muted small">({product.numReviews} Reviews)</span>
            </div>
            <p className="text-muted mb-4">{product.description}</p>

            <div className="mt-4 border-top pt-4">
                
                {/* --- NEW: COLOR SELECTION --- */}
                <div className="mb-4">
                    <span className="text-uppercase small fw-bold text-muted">Color:</span> <span className="fw-semibold ms-1">{selectedColor}</span>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                        {/* Render Available Colors */}
                        {product.availableColors && product.availableColors.length > 0 ? (
                            product.availableColors.map((c, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => setSelectedColor(c.name)}
                                    style={{ 
                                        width: '35px', height: '35px', 
                                        backgroundColor: c.hex, 
                                        borderRadius: '50%', 
                                        cursor: 'pointer',
                                        border: selectedColor === c.name ? '3px solid #0d6efd' : '1px solid #ddd',
                                        boxShadow: 'inset 0 0 2px rgba(0,0,0,0.1)'
                                    }}
                                    title={c.name}
                                />
                            ))
                        ) : (
                            // Fallback if no specific colors added
                            <span className="badge bg-light text-dark border">{product.color}</span>
                        )}
                    </div>
                </div>

                {!isOutOfStock ? (
                    <>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-uppercase small fw-bold text-muted">Size</span>
                                <Button variant="link" className="p-0 text-dark small text-decoration-none" onClick={() => setShowSizeGuide(true)}>Size Guide</Button>
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                                {product.sizes.map((sizeObj, idx) => {
                                    const sizeName = typeof sizeObj === 'object' ? sizeObj.size : sizeObj;
                                    const isAvailable = typeof sizeObj === 'object' ? sizeObj.available : true;
                                    return (
                                        <Button
                                            key={idx}
                                            variant={selectedSize === sizeName ? "dark" : "outline-dark"}
                                            className="rounded-0 px-3 py-1"
                                            disabled={!isAvailable}
                                            onClick={() => isAvailable && setSelectedSize(sizeName)}
                                            style={{ opacity: !isAvailable ? 0.5 : 1 }}
                                        >
                                            {sizeName}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-3 mt-4">
                            <div className="d-none d-lg-block">
                                <ButtonGroup>
                                    <Button variant="outline-secondary" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                                    <Button variant="outline-secondary" disabled className="text-dark fw-bold" style={{ width: '50px' }}>{quantity}</Button>
                                    <Button variant="outline-secondary" onClick={() => setQuantity(quantity + 1)}>+</Button>
                                </ButtonGroup>
                            </div>
                            <Button variant="dark" size="lg" className="w-100 rounded-0 d-none d-lg-block" onClick={handleAddToCart}>
                                {product.stockStatus === 'pre-order' ? 'Pre-Order Now' : 'Add to Cart'}
                            </Button>
                        </div>
                        {addMessage && <p className={`mt-2 fw-bold ${addMessage.includes('select') ? 'text-danger' : 'text-success'}`}>{addMessage}</p>}
                    </>
                ) : (
                   <Alert variant="secondary">Currently Out of Stock</Alert>
                )}
            </div>
        </Col>
      </Row>

      {/* --- Sticky Mobile Cart Bar --- */}
      {!isOutOfStock && (
        <div className="d-lg-none position-fixed bottom-0 start-0 end-0 bg-white border-top p-3 shadow-lg d-flex align-items-center gap-3" style={{ zIndex: 1050 }}>
           <div className="d-flex border rounded">
                <Button variant="light" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <div className="px-3 py-1 fw-bold">{quantity}</div>
                <Button variant="light" size="sm" onClick={() => setQuantity(quantity + 1)}>+</Button>
           </div>
           <Button variant="dark" className="flex-grow-1 fw-bold rounded-pill" onClick={handleAddToCart}>
               {product.stockStatus === 'pre-order' ? 'Pre-Order' : 'Add'} - ₹{priceInRupees}
           </Button>
        </div>
      )}
      
      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="mb-5 border-top pt-5">
          <h3 className="fw-bold mb-4">You May Also Like</h3>
          <Row xs={2} md={4} className="g-3">
            {relatedProducts.map((p) => (
              <Col key={p._id}><ProductCard product={p} /></Col>
            ))}
          </Row>
        </div>
      )}

      <SizeGuideModal show={showSizeGuide} onHide={() => setShowSizeGuide(false)} />
    </Container>
  );
};

export default ProductDetail;