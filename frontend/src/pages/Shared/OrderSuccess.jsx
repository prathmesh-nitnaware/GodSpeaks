import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Container, Button, Alert, Row, Col } from 'react-bootstrap'; // <-- FIX: IMPORTED Row and Col

const CheckCircleIcon = () => (
  <svg className="bi text-success" width="80" height="80" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
  </svg>
);

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const { clearCart } = useCart(); 

  useEffect(() => {
    if (order) {
      clearCart();
    }
  }, [order, clearCart]);

  useEffect(() => {
    if (!order) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [order, navigate]);

  if (!order) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '60vh' }}>
        <h1 className="h3 fw-bold text-dark">Verifying order...</h1>
        <p className="fs-5 text-muted mt-2">
          You will be redirected to the homepage.
        </p>
        <Button as={Link} to="/" variant="dark" size="lg" className="mt-4 fw-semibold">
          Go to Homepage
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* <-- FIX: <Row> and <Col> are now defined */}
      <Row className="justify-content-center">
        <Col md={9} lg={8}>
          <Alert variant="light" className="text-center p-5 shadow-sm">
            <div className="mb-4">
              <CheckCircleIcon />
            </div>
            
            <h1 className="display-5 fw-bold text-dark">
              Thank you for your order!
            </h1>

            <p className="fs-5 text-muted mt-4">
              Your order (<b>#{order._id.slice(-6).toUpperCase()}</b>) has been confirmed
              and is now processing.
            </p>
            <p className="fs-5 text-muted mt-2">
              You will receive an email confirmation at <b>{order.shippingInfo?.email || 'your email'}</b>.
            </p>

            <Button 
              as={Link} 
              to="/shop" 
              variant="dark" 
              size="lg" 
              className="mt-4 fw-semibold"
            >
              Continue Shopping
            </Button>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderSuccess;