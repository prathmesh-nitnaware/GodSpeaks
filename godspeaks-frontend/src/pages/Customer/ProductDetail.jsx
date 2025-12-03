import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Image,
  Button,
  Spinner,
  Alert,
  ButtonGroup,
  Form,
  ListGroup,
  InputGroup,
} from "react-bootstrap";
import {
  fetchProductById,
  addProductReviewApi,
  joinWaitlistApi,
  fetchRelatedProducts,
} from "../../api/productsApi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import ProductCard from "../../components/Products/ProductCard";
import SizeGuideModal from "../../components/Products/SizeGuideModal";

// --- Icons ---
const StarIcon = ({ filled }) => (
  <svg
    className={`bi ${filled ? "text-warning" : "text-muted"}`}
    width="18"
    height="18"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z" />
  </svg>
);

const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-bell-fill"
    viewBox="0 0 16 16"
  >
    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z" />
  </svg>
);

const RulerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-ruler"
    viewBox="0 0 16 16"
  >
    <path d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8zm15 0A8 8 0 1 0 0 8a8 8 0 0 0 16 0zM2.5 8a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z" />
  </svg>
);

const LoadingSpinner = () => (
  <div
    className="d-flex justify-content-center align-items-center"
    style={{ minHeight: "80vh" }}
  >
    <Spinner
      animation="border"
      variant="primary"
      style={{ width: "5rem", height: "5rem" }}
    />
  </div>
);

// --- Color Map for Visual Hexagons ---
const COLOR_MAP = {
  White: "#FFFFFF",
  Black: "#000000",
  Navy: "#000080",
  Red: "#DC143C",
  "Heather Grey": "#B0B0B0",
  "Royal Blue": "#4169E1",
};

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
  const [quantity, setQuantity] = useState(1);
  const [addMessage, setAddMessage] = useState("");

  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState(null);

  // Notify Me State
  const [email, setEmail] = useState("");
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState(null);

  // Modal State
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const fetchProductData = useCallback(
    async (isRefresh = false) => {
      try {
        if (!isRefresh) setIsLoading(true);
        setError(null);

        const [productData, relatedData] = await Promise.all([
          fetchProductById(id),
          fetchRelatedProducts(id),
        ]);

        setProduct(productData);
        setRelatedProducts(relatedData);

        if (!isRefresh) window.scrollTo(0, 0);
      } catch (err) {
        setError("Product not found.");
      } finally {
        if (!isRefresh) setIsLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleAddToCart = () => {
    setAddMessage("");
    if (!selectedSize) {
      setAddMessage("Please select a size.");
      setTimeout(() => setAddMessage(""), 2000);
      return;
    }
    addItemToCart(product, selectedSize, quantity);

    if (product.stockStatus === "pre-order") {
      setAddMessage("Pre-Order Confirmed!");
    } else {
      setAddMessage("Added to cart!");
    }

    setTimeout(() => setAddMessage(""), 2000);
  };

  const handleNotifyMe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setNotifyLoading(true);
    try {
      await joinWaitlistApi(id, email);
      setNotifyMessage({
        type: "success",
        text: "You're on the list! We'll notify you.",
      });
      setEmail("");
    } catch (err) {
      setNotifyMessage({
        type: "danger",
        text: err.message || "Failed to join list.",
      });
    } finally {
      setNotifyLoading(false);
    }
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!comment) return;

    setReviewLoading(true);
    try {
      await addProductReviewApi(id, {
        rating: Number(rating),
        comment,
        name: adminInfo?.name || adminInfo?.email.split("@")[0] || "User",
      });
      setReviewMessage({
        type: "success",
        text: "Review submitted successfully",
      });
      setComment("");
      setRating(5);
      fetchProductData(true);
    } catch (err) {
      setReviewMessage({ type: "danger", text: "Failed to submit review" });
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
  const isOutOfStock = product.stockStatus === "out-of-stock";
  const isPreOrder = product.stockStatus === "pre-order";
  const productColorHex = COLOR_MAP[product.color] || "#000000"; // Fallback to black if unknown color

  // Hexagon Style for Display Only
  const hexagonStyle = {
    width: "30px",
    height: "35px",
    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
    backgroundColor: productColorHex,
    border: "none",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    display: "inline-block",
    verticalAlign: "middle",
  };

  return (
    <Container className="py-5">
      <Row className="g-5 mb-5">
        <Col lg={6}>
          <div className="position-relative">
            <Image
              src={product.images[0]}
              alt={product.name}
              fluid
              rounded
              className={`shadow-sm bg-white border ${
                isOutOfStock ? "opacity-75" : ""
              }`}
            />
            {isOutOfStock && (
              <div className="position-absolute top-50 start-50 translate-middle bg-dark text-white px-4 py-2 rounded fw-bold opacity-100">
                SOLD OUT
              </div>
            )}
          </div>
        </Col>

        <Col lg={6}>
          {isPreOrder && (
            <span className="badge bg-warning text-dark mb-2 px-3 py-2">
              PRE-ORDER ITEM
            </span>
          )}

          <h1 className="display-4 fw-bold text-dark">{product.name}</h1>
          <p className="display-5 text-dark mt-2">₹{priceInRupees}</p>

          <div className="d-flex align-items-center my-3">
            <div className="d-flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} filled={i < product.rating} />
              ))}
            </div>
            <span className="ms-2 text-muted">
              ({product.numReviews} Reviews)
            </span>
          </div>

          <p className="fs-5 text-muted mt-4">
            {product.description ||
              "A high-quality, comfortable cotton tee perfect for expressing your faith."}
          </p>

          <div className="mt-4 border-top pt-4">
            {/* Display Color */}
            <div className="mb-4">
              <span className="fw-semibold fs-6 me-2">Color:</span>
              <span className="d-inline-flex align-items-center border px-3 py-1 rounded bg-light">
                <span style={hexagonStyle} className="me-2"></span>
                {product.color}
              </span>
            </div>

            {isOutOfStock ? (
              <div className="bg-light p-4 rounded border">
                <h5 className="fw-bold d-flex align-items-center mb-3">
                  <BellIcon />
                  <span className="ms-2">Notify Me When Available</span>
                </h5>
                <p className="small text-muted mb-3">
                  This item is currently out of stock. Enter your email below to
                  be the first to know when it returns!
                </p>
                {notifyMessage && (
                  <Alert variant={notifyMessage.type} className="py-2 small">
                    {notifyMessage.text}
                  </Alert>
                )}
                <Form onSubmit={handleNotifyMe}>
                  <InputGroup>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                      variant="dark"
                      type="submit"
                      disabled={notifyLoading}
                    >
                      {notifyLoading ? "Submitting..." : "Notify Me"}
                    </Button>
                  </InputGroup>
                </Form>
              </div>
            ) : (
              <>
                {isPreOrder && product.preOrderReleaseDate && (
                  <Alert variant="info" className="mb-4">
                    <strong>Note:</strong> This is a pre-order item. Estimated
                    shipping date:{" "}
                    {new Date(product.preOrderReleaseDate).toLocaleDateString()}
                    .
                  </Alert>
                )}

                <Form.Group className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="fw-semibold fs-6 mb-0">
                      Select Size:
                    </Form.Label>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-decoration-none p-0 d-flex align-items-center"
                      onClick={() => setShowSizeGuide(true)}
                    >
                      <RulerIcon />
                      <span className="ms-1">Size Guide</span>
                    </Button>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        variant={
                          selectedSize === size ? "dark" : "outline-dark"
                        }
                        className="rounded-pill px-4"
                        style={{ minWidth: "60px" }}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold fs-6 mb-2">
                    Quantity:
                  </Form.Label>
                  <ButtonGroup style={{ maxWidth: "150px" }}>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <Form.Control
                      type="text"
                      value={quantity}
                      readOnly
                      className="text-center fw-bold"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </ButtonGroup>
                </Form.Group>

                <div className="mt-4 d-flex align-items-center">
                  <Button
                    variant="dark"
                    size="lg"
                    onClick={handleAddToCart}
                    className="fw-bold px-5"
                  >
                    {isPreOrder ? "Pre-Order Now" : "Add to Cart"}
                  </Button>
                  {addMessage && (
                    <span
                      className={`ms-3 fw-medium ${
                        addMessage.includes("select")
                          ? "text-danger"
                          : "text-success"
                      }`}
                    >
                      {addMessage}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </Col>
      </Row>

      {relatedProducts.length > 0 && (
        <div className="mb-5 border-top pt-5">
          <h3 className="fw-bold mb-4">You May Also Like</h3>
          <Row xs={1} sm={2} md={4} className="g-4">
            {relatedProducts.map((p) => (
              <Col key={p._id}>
                <ProductCard product={p} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      <Row className="mt-5 border-top pt-5">
        <Col md={6}>
          <h3 className="fw-bold mb-4">Reviews</h3>
          {product.reviews.length === 0 && (
            <Alert variant="light">No reviews yet.</Alert>
          )}
          <ListGroup variant="flush">
            {product.reviews.map((review) => (
              <ListGroup.Item
                key={review._id}
                className="bg-light mb-3 rounded border-0 p-3"
              >
                <div className="d-flex justify-content-between">
                  <strong>{review.name}</strong>
                  <div className="d-flex text-warning">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} filled={i < review.rating} />
                    ))}
                  </div>
                </div>
                <p className="mb-1 mt-2">{review.comment}</p>
                <small className="text-muted">
                  {review.createdAt.substring(0, 10)}
                </small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col md={6}>
          <div className="p-4 border rounded bg-white shadow-sm">
            <h4 className="fw-bold mb-3">Write a Review</h4>
            {adminInfo ? (
              <Form onSubmit={submitReviewHandler}>
                {reviewMessage && (
                  <Alert variant={reviewMessage.type}>
                    {reviewMessage.text}
                  </Alert>
                )}
                <Form.Group className="mb-3" controlId="rating">
                  <Form.Label>Rating</Form.Label>
                  <Form.Select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
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
                <Button
                  disabled={reviewLoading}
                  type="submit"
                  variant="primary"
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
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

      <SizeGuideModal
        show={showSizeGuide}
        onHide={() => setShowSizeGuide(false)}
      />
    </Container>
  );
};

export default ProductDetail;
