import React from 'react';
import { Row, Col, Image, Form, Button } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

const CartItem = ({ item }) => {
  const { removeItemFromCart, updateItemQuantity } = useCart();

  // Handle Price Display (Backend stores in Paisa, Frontend displays Rupees)
  // But Custom items might be passed in directly as Rupees or Paisa depending on logic.
  // In our logic: DB products = Paisa, Custom = Paisa (99900).
  const price = item.price / 100; 

  // Image Source: Standard uses item.images[0], Custom uses item.customPrintUrl or item.images[0]
  const imageUrl = item.isCustom ? (item.customPrintUrl || item.images[0]) : item.images[0];

  return (
    <Row className="mb-4 align-items-center bg-white p-3 shadow-sm rounded">
      {/* IMAGE */}
      <Col xs={3} md={2}>
        <Image 
          src={imageUrl} 
          alt={item.name} 
          fluid 
          rounded 
          style={{ maxHeight: '100px', objectFit: 'cover' }}
        />
      </Col>

      {/* DETAILS */}
      <Col xs={9} md={4}>
        {item.isCustom ? (
             <div>
                <h5 className="mb-1 text-primary fw-bold">Custom Design</h5>
                <p className="mb-0 text-muted small">Your unique artwork</p>
             </div>
        ) : (
            <Link to={`/product/${item._id}`} className="text-decoration-none text-dark">
                <h5 className="mb-1">{item.name}</h5>
            </Link>
        )}
        <span className="text-muted small">Size: {item.size}</span>
      </Col>

      {/* PRICE */}
      <Col xs={4} md={2} className="mt-3 mt-md-0">
        <span className="fw-semibold">₹{price.toFixed(2)}</span>
      </Col>

      {/* QUANTITY */}
      <Col xs={4} md={2} className="mt-3 mt-md-0">
        <Form.Select
          value={item.qty}
          onChange={(e) => updateItemQuantity(item.cartItemId, Number(e.target.value))}
          size="sm"
          style={{ width: '70px' }}
        >
          {[...Array(10).keys()].map((x) => (
            <option key={x + 1} value={x + 1}>
              {x + 1}
            </option>
          ))}
        </Form.Select>
      </Col>

      {/* REMOVE BUTTON */}
      <Col xs={4} md={2} className="text-end mt-3 mt-md-0">
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => removeItemFromCart(item.cartItemId)}
        >
          <i className="bi bi-trash"></i> Remove
        </Button>
      </Col>
    </Row>
  );
};

export default CartItem;