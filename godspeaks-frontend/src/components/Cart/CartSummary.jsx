import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
// --- 1. IMPORT BOOTSTRAP COMPONENTS ---
import { Card, ListGroup, Button } from 'react-bootstrap';

const CartSummary = () => {
  const { totalPrice } = useCart();

  const subtotalInRupees = (totalPrice / 100).toFixed(2);
  
  // TODO: Add real shipping calculation
  const shippingInRupees = (50).toFixed(2); // Placeholder
  const totalInRupees = ((totalPrice / 100) + 50).toFixed(2); // Placeholder

  return (
    // --- 2. USE BOOTSTRAP CARD ---
    // 'sticky-top' makes the summary stick on desktop
    <Card className="shadow-sm border-0" style={{ top: '6rem' }}> 
      <Card.Body>
        <Card.Title as="h3" className="fw-bold fs-4 mb-3">
          Order Summary
        </Card.Title>
        
        {/* 'list-group-flush' removes borders */}
        <ListGroup variant="flush">
          {/* Subtotal */}
          <ListGroup.Item className="d-flex justify-content-between px-0">
            <span className="text-muted">Subtotal</span>
            <span className="fw-medium">₹{subtotalInRupees}</span>
          </ListGroup.Item>
          
          {/* Shipping (Placeholder) */}
          <ListGroup.Item className="d-flex justify-content-between px-0">
            <span className="text-muted">Shipping (Est.)</span>
            <span className="fw-medium">₹{shippingInRupees}</span>
          </ListGroup.Item>
          
          {/* Order Total */}
          <ListGroup.Item className="d-flex justify-content-between px-0 mt-2 pt-3 border-top">
            <span className="fw-bold fs-5">Order total</span>
            <span className="fw-bold fs-5">₹{totalInRupees}</span>
          </ListGroup.Item>
        </ListGroup>

        {/* Checkout Button */}
        <Button 
          as={Link} 
          to="/checkout" 
          variant="dark" // 'dark' is black
          size="lg"      // 'lg' is large
          className="w-100 mt-4 fw-semibold"
        >
          Proceed to Checkout
        </Button>
        
        {/* Continue Shopping Link */}
        <div className="text-center mt-3">
          <Link to="/shop" className="text-primary text-decoration-none fw-medium">
            or Continue Shopping<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CartSummary;