import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Spinner, Alert, ButtonGroup, Form, ListGroup } from 'react-bootstrap';
import { fetchProductById, addProductReviewApi } from '../../api/productsApi'; // Added API import
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext'; // To check if logged in

// --- Icons ---
const StarIcon = ({ filled }) => (
  <svg className={`bi ${filled ? 'text-warning' : 'text-muted'}`} width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z"/>
  </svg>
);

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
    <Spinner animation="border" variant="primary" style={{ width: '5rem', height: '5rem' }} />
  </div>
);

const MOCK_STOCK = [
  { size: 'S', count: 10 }, { size: 'M', count: 15 }, { size: 'L', count: 5 },
  { size: 'XL', count: 0 }, { size: 'XXL', count: 8 },
];

const ProductDetail = () => {
  const { id } = useParams();
  const { addItemToCart } = useCart();
  const { adminInfo } = useAuth(); // Check user info
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selection State
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addMessage, setAddMessage] = useState('');

  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState(null);

  // Move function inside useEffect to satisfy linter
  useEffect(() => {
    const fetchProductData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const data = await fetchProductById(id);
          setProduct({ ...data, stock: MOCK_STOCK }); 
        } catch (err) {
          setError('Product not found.');
        } finally {
          setIsLoading(false);
        }
      };
    fetchProductData();
  }, [id]);

  // We need a way to refresh data after a review submission without triggering a full reload
  const refreshData = async () => {
      try {
        const data = await fetchProductById(id);
        setProduct({ ...data, stock: MOCK_STOCK }); 
      } catch (err) {
        console.error("Failed to refresh product data");
      }
  };

  const handleAddToCart = () => {
    setAddMessage('');
    if (!selectedSize) {
      setAddMessage('Please select a size.');
      setTimeout(() => setAddMessage(''), 2000);
      return;
    }
    addItemToCart(product, selectedSize, quantity);
    setAddMessage('Added to cart!');
    setTimeout(() => setAddMessage(''), 2000);
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!comment) return;

    setReviewLoading(true);
    try {
        await addProductReviewApi(id, {
            rating: Number(rating),
            comment,
            name: adminInfo?.name || adminInfo?.email.split('@')[0] || 'User'
        });
        setReviewMessage({ type: 'success', text: 'Review submitted successfully' });
        setComment('');
        setRating(5);
        refreshData(); // Refresh to show new review
    } catch (err) {
        setReviewMessage({ type: 'danger', text: 'Failed to submit review' });
    } finally {
        setReviewLoading(false);
        setTimeout(() => setReviewMessage(null), 3000);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <Container className="text-center py-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/shop" className="btn btn-primary">
          &larr; Back to Shop
        </Link>
      </Container>
    );
  }

  if (!product) return null;

  const priceInRupees = (product.price / 100).toFixed(2);

  return (
    <Container className="py-5">
      <Row className="g-5 mb-5">
        
        {/* --- A. IMAGE GALLERY --- */}
        <Col lg={6}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fluid 
            rounded 
            className="shadow-sm bg-white border"
          />
        </Col>

        {/* --- B. PRODUCT INFO --- */}
        <Col lg={6}>
          <h1 className="display-4 fw-bold text-dark">{product.name}</h1>
          <p className="display-5 text-dark mt-2">₹{priceInRupees}</p>
          
          <div className="d-flex align-items-center my-3">
            <div className="d-flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} filled={i < product.rating} />
              ))}
            </div>
            <span className="ms-2 text-muted">({product.numReviews} Reviews)</span>
          </div>

          <p className="fs-5 text-muted mt-4">
            {product.description || "A high-quality, comfortable cotton tee perfect for expressing your faith. Inspired by the word of God."}
          </p>

          {/* --- C. OPTIONS (Size & Quantity) --- */}
          <div className="mt-4 border-top pt-4">
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold fs-6 mb-2">Select Size:</Form.Label>
              <div>
                {product.stock.map((item) => (
                  <Button
                    key={item.size}
                    onClick={() => setSelectedSize(item.size)}
                    disabled={item.count === 0}
                    variant={selectedSize === item.size ? 'dark' : 'outline-dark'}
                    className="me-2 rounded-pill mb-2"
                    style={{ minWidth: '60px' }}
                  >
                    {item.size}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold fs-6 mb-2">Quantity:</Form.Label>
              <ButtonGroup style={{ maxWidth: '150px' }}>
                <Button variant="outline-secondary" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <Form.Control 
                  type="text" 
                  value={quantity} 
                  readOnly 
                  className="text-center fw-bold"
                />
                <Button variant="outline-secondary" onClick={() => setQuantity(quantity + 1)}>+</Button>
              </ButtonGroup>
            </Form.Group>

            <div className="mt-4 d-flex align-items-center">
              <Button
                variant="dark"
                size="lg"
                onClick={handleAddToCart}
                className="fw-bold"
                style={{ minWidth: '200px' }}
              >
                Add to Cart
              </Button>
              {addMessage && (
                <span className={`ms-3 fw-medium ${addMessage.includes('select') ? 'text-danger' : 'text-success'}`}>
                  {addMessage}
                </span>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* --- D. REVIEWS SECTION --- */}
      <Row className="mt-5">
        <Col md={6}>
          <h3 className="fw-bold mb-4">Reviews</h3>
          {product.reviews.length === 0 && <Alert variant="light">No reviews yet.</Alert>}
          <ListGroup variant="flush">
            {product.reviews.map((review) => (
              <ListGroup.Item key={review._id} className="bg-light mb-3 rounded border-0 p-3">
                <div className="d-flex justify-content-between">
                    <strong>{review.name}</strong>
                    <div className="d-flex text-warning">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} filled={i < review.rating} />
                        ))}
                    </div>
                </div>
                <p className="mb-1 mt-2">{review.comment}</p>
                <small className="text-muted">{review.createdAt.substring(0, 10)}</small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        
        <Col md={6}>
          <div className="p-4 border rounded bg-white shadow-sm">
            <h4 className="fw-bold mb-3">Write a Review</h4>
            {adminInfo ? (
              <Form onSubmit={submitReviewHandler}>
                {reviewMessage && <Alert variant={reviewMessage.type}>{reviewMessage.text}</Alert>}
                <Form.Group className="mb-3" controlId="rating">
                  <Form.Label>Rating</Form.Label>
                  <Form.Select value={rating} onChange={(e) => setRating(e.target.value)}>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="comment">
                  <Form.Label>Comment</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button disabled={reviewLoading} type="submit" variant="primary">
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </Button>
              </Form>
            ) : (
              <Alert variant="info">
                Please <Link to="/admin/login">sign in</Link> to write a review.
              </Alert>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;