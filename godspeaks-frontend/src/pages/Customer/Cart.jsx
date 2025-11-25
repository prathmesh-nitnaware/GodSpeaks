import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
// --- 1. IMPORT BOOTSTRAP COMPONENTS ---
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import CartItem from '../../components/Cart/CartItem';
import CartSummary from '../../components/Cart/CartSummary';

// --- Placeholder Icon ---
const CartIcon = () => (
  <svg className="bi text-muted" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </svg>
);
// ------------------------

const Cart = () => {
  const { cart, totalItems } = useCart();

  return (
    // --- 2. USE BOOTSTRAP LAYOUT ---
    <Container className="py-5">
      <h1 className="display-5 fw-bold text-center text-dark mb-4">
        Shopping Cart
      </h1>

      {/* --- Check if Cart is Empty --- */}
      {totalItems === 0 ? (
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="light" className="text-center p-5 shadow-sm">
              <CartIcon />
              <h2 className="mt-4 h3 fw-semibold text-dark">
                Your cart is empty
              </h2>
              <p className="text-muted fs-5 mt-2">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button as={Link} to="/shop" variant="primary" size="lg" className="mt-4 fw-semibold">
                Start Shopping
              </Button>
            </Alert>
          </Col>
        </Row>
      ) : (
        /* --- Cart Has Items --- */
        // 'gy-4' adds vertical gap on mobile
        <Row className="gy-4">
          
          {/* 1. Cart Items List (Main Content) */}
          <Col lg={8}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Card.Title as="h3" className="fw-bold fs-4 mb-3">
                  Your Items ({totalItems})
                </Card.Title>
                {/* We use a simple div, CartItem provides the borders */}
                <div>
                  {cart.map((item) => (
                    <CartItem key={item.cartItemId} item={item} />
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* 2. Order Summary (Sidebar) */}
          <Col lg={4}>
            <CartSummary />
          </Col>

        </Row>
      )}
    </Container>
  );
};

export default Cart;