import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Row, Col, Image, Button, Form } from 'react-bootstrap';

const TrashIcon = () => (
  <svg className="bi" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
  </svg>
);

const CartItem = ({ item }) => {
  const { updateItemQuantity, removeItemFromCart } = useCart();

  const priceInRupees = (item.price / 100).toFixed(2);
  const itemTotalInRupees = (item.price * item.qty / 100).toFixed(2);

  const handleQuantityChange = (e) => {
    const newQty = parseInt(e.target.value);
    if (newQty > 0) {
      updateItemQuantity(item.cartItemId, newQty);
    } else if (newQty === 0) {
        removeItemFromCart(item.cartItemId); // Also remove if qty is set to 0
    }
  };
  
  const handleRemove = () => {
    removeItemFromCart(item.cartItemId);
  };
  
  // <-- FIX: REMOVED UNUSED handleIncrement and handleDecrement FUNCTIONS

  return (
    <Row className="py-4 border-bottom mx-0">
      <Col xs={4} md={2}>
        <Image
          src={item.images[0]}
          alt={item.name}
          fluid
          rounded
        />
      </Col>

      <Col xs={8} md={10}>
        <Row>
          <Col md={5}>
            <h5 className="fw-semibold fs-6 mb-1">
              <Link to={`/product/${item._id}`} className="text-dark text-decoration-none">
                {item.name}
              </Link>
            </h5>
            <p className="text-muted small mb-1">Size: {item.size}</p>
            <p className="text-dark fw-medium">₹{priceInRupees}</p>
          </Col>

          <Col md={4} className="d-flex align-items-start mt-2 mt-md-0">
            <Form.Control 
              type="number"
              value={item.qty}
              onChange={handleQuantityChange}
              min="0" // Allow 0 to remove item
              className="text-center"
              style={{ width: '80px' }}
            />
          </Col>
          
          <Col md={3} className="text-md-end mt-2 mt-md-0">
             <p className="fw-bold fs-5 mb-2">₹{itemTotalInRupees}</p>
             <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={handleRemove}
              >
                <TrashIcon /> <span className="d-none d-md-inline ms-1">Remove</span>
             </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default CartItem;