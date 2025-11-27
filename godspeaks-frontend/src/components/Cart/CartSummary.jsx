import React from 'react';
import { Card, Button, ListGroup } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartSummary = () => {
  const { cart, totalPrice } = useCart();
  const navigate = useNavigate();

  // Logic matches Backend: Free shipping if subtotal > ₹2000 (200000 paisa)
  // Otherwise ₹50 (5000 paisa)
  const SHIPPING_THRESHOLD = 200000; 
  const SHIPPING_COST = 5000;

  const subtotal = totalPrice; // Already in Paisa
  const shipping = subtotal > SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const finalTotal = subtotal + shipping;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <Card className="shadow-sm border-0 sticky-top" style={{ top: '6rem' }}>
      <Card.Body className="p-4">
        <Card.Title as="h3" className="fw-bold fs-4 mb-4">
          Order Summary
        </Card.Title>
        
        <ListGroup variant="flush">
          <ListGroup.Item className="d-flex justify-content-between px-0 py-3 border-bottom">
            <span className="text-muted">Subtotal</span>
            <span className="fw-medium">₹{(subtotal / 100).toFixed(2)}</span>
          </ListGroup.Item>
          
          <ListGroup.Item className="d-flex justify-content-between px-0 py-3 border-bottom">
            <span className="text-muted">Shipping</span>
            {shipping === 0 ? (
              <span className="text-success fw-bold">FREE</span>
            ) : (
              <span className="fw-medium">₹{(shipping / 100).toFixed(2)}</span>
            )}
          </ListGroup.Item>
          
          <ListGroup.Item className="d-flex justify-content-between px-0 py-3 border-bottom">
            <span className="fw-bold fs-5">Total</span>
            <span className="fw-bold fs-5">₹{(finalTotal / 100).toFixed(2)}</span>
          </ListGroup.Item>
        </ListGroup>

        {shipping > 0 && (
           <div className="alert alert-info mt-3 py-2 small text-center mb-0">
             Add <strong>₹{((SHIPPING_THRESHOLD - subtotal) / 100).toFixed(0)}</strong> more for free shipping!
           </div>
        )}

        <Button 
          variant="dark" 
          size="lg" 
          className="w-100 mt-4 fw-semibold"
          onClick={handleCheckout}
          disabled={cart.length === 0}
        >
          Proceed to Checkout
        </Button>
      </Card.Body>
    </Card>
  );
};

export default CartSummary;