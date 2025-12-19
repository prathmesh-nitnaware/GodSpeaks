import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { useCart } from '../../context/CartContext';
import { loadScript, createOrderApi, verifyPaymentApi } from '../../api/orderApi'; 
import { Container, Row, Col, Form, Button, Card, ListGroup, Image, Spinner, Alert } from 'react-bootstrap';

// Standard list for Courier Address
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi", "Chandigarh", "Puducherry", "Jammu and Kashmir", "Ladakh"
];

const LoadingOverlay = () => (
  <div 
    className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center"
    style={{ 
      top: 0, 
      left: 0, 
      backgroundColor: 'rgba(255, 255, 255, 0.7)', 
      zIndex: 10 
    }}
  >
    <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
  </div>
);

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalItems, totalPrice } = useCart();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '', // User MUST select their state
    postalCode: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setValidated(true);
    setIsLoading(true);

    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setIsLoading(false);
      return;
    }

    try {
      const formattedOrderItems = cart.map(item => ({
        name: item.name,
        qty: item.qty,
        size: item.size,
        image: item.isCustom ? (item.customPrintUrl || item.images[0]) : item.images[0], 
        price: item.price,
        product: item._id, 
        isCustom: item.isCustom || false,
        customPrintUrl: item.customPrintUrl || null,
        printFileUrl: item.printFileUrl || null // CRITICAL for POD
      }));

      const orderData = {
        shippingInfo: formData,
        orderItems: formattedOrderItems,
        totalPrice: totalPrice,
      };

      const data = await createOrderApi(orderData);
      
      const { amount, razorpayOrderId, razorpayKeyId, orderId } = data;

      const options = {
        key: razorpayKeyId,
        amount: amount.toString(),
        currency: 'INR',
        name: 'GodSpeaks',
        description: 'Christian T-Shirt Order',
        image: '/logo192.png',
        order_id: razorpayOrderId,
        
        handler: async function (response) {
          setIsLoading(true);
          const paymentData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            order_id: orderId,
          };

          try {
            const verifyResult = await verifyPaymentApi(paymentData);
            navigate('/order-success', { state: { order: verifyResult.order } });
          } catch (err) {
            console.error(err);
            alert('Payment verification failed. Please contact support.');
            setIsLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      alert('Error creating order. Please try again.');
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container className="py-5 position-relative">
      {isLoading && <LoadingOverlay />}
      
      <h1 className="display-5 fw-bold text-center text-dark mb-5">
        Checkout
      </h1>

      {totalItems === 0 ? (
        <Alert variant="warning" className="text-center fs-5">
          Your cart is empty. <Alert.Link as={Link} to="/shop">Go shopping</Alert.Link>. 
        </Alert>
      ) : (
        <Row className="gy-5">
          {/* --- Shipping Form --- */}
          <Col lg={7}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4 p-md-5">
                <Card.Title as="h3" className="fw-bold fs-4 mb-4">
                  Courier Details
                </Card.Title>
                
                <Form noValidate validated={validated} onSubmit={handlePayment}>
                  <Row className="g-3">
                    <Col sm={6}>
                      <Form.Group controlId="name">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                        <Form.Control.Feedback type="invalid">Please enter name for courier label.</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col sm={6}>
                      <Form.Group controlId="email">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                        <Form.Control.Feedback type="invalid">Valid email required for order updates.</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col sm={12}>
                      <Form.Group controlId="phone">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} pattern="^[6-9]\d{9}$" required />
                        <Form.Control.Feedback type="invalid">Courier needs valid 10-digit number.</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col sm={12}>
                      <Form.Group controlId="address">
                        <Form.Label>Street Address (House No, Building, Street)</Form.Label>
                        <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} required />
                        <Form.Control.Feedback type="invalid">Please enter complete address.</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col sm={5}>
                      <Form.Group controlId="city">
                        <Form.Label>City</Form.Label>
                        <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} required />
                        <Form.Control.Feedback type="invalid">City is required.</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    
                    <Col sm={4}>
                      <Form.Group controlId="state">
                        <Form.Label>State</Form.Label>
                        <Form.Select name="state" value={formData.state} onChange={handleChange} required>
                          <option value="">Choose...</option>
                          {INDIAN_STATES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">Select State.</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col sm={3}>
                      <Form.Group controlId="postalCode">
                        <Form.Label>PIN Code</Form.Label>
                        <Form.Control type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} pattern="^\d{6}$" required />
                        <Form.Control.Feedback type="invalid">Valid 6-digit PIN.</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  {/* --- NEW: POD Policy Checkbox --- */}
                  <Form.Group className="mb-3 mt-4 p-3 bg-light rounded border">
                    <Form.Check 
                        type="checkbox"
                        id="pod-policy"
                        required
                        label={
                            <span>
                                I understand that this is a <strong>Custom/Print-on-Demand</strong> order. 
                                Returns/Exchanges are not available for size issues.
                            </span>
                        }
                        feedback="You must agree to the policy before ordering."
                        feedbackType="invalid"
                    />
                  </Form.Group>

                  <Button type="submit" variant="dark" size="lg" className="w-100 mt-3 fw-semibold" disabled={isLoading}>
                    {isLoading ? 'Processing...' : `Pay & Place Order`}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* --- Order Summary --- */}
          <Col lg={5}>
            <Card className="shadow-sm border-0" style={{ top: '6rem' }}>
              <Card.Body className="p-4">
                <Card.Title as="h3" className="fw-bold fs-4 mb-4">
                  Your Order
                </Card.Title>
                
                <ListGroup variant="flush">
                  {cart.map(item => (
                    <ListGroup.Item key={item.cartItemId} className="d-flex justify-content-between align-items-center px-0">
                      <div className="d-flex align-items-center">
                        <Image 
                           src={item.isCustom ? (item.customPrintUrl || item.images[0]) : item.images[0]} 
                           alt={item.name} 
                           rounded 
                           style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                        />
                        <div className="ms-3">
                          <h6 className="fw-semibold mb-0 fs-6">
                             {item.isCustom ? <span className="text-primary">Custom Design</span> : item.name}
                          </h6>
                          <span className="text-muted small">Size: {item.size} | Qty: {item.qty}</span>
                        </div>
                      </div>
                      <span className="fw-medium">₹{(item.price * item.qty / 100).toFixed(2)}</span>
                    </ListGroup.Item>
                  ))}
                  
                  <ListGroup.Item className="d-flex justify-content-between px-0 mt-3 pt-3 border-top">
                    <span className="text-muted">Subtotal</span>
                    <span className="fw-medium">₹{(totalPrice / 100).toFixed(2)}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between px-0 fw-bold fs-5 mt-2 pt-3 border-top">
                    <span>Total</span>
                    <span>₹{(totalPrice / 100).toFixed(2)}</span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Checkout;