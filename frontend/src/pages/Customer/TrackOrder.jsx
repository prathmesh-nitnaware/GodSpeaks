import React, { useState } from 'react';
import { Container, Form, Button, Card, Spinner, Row, Col, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import OrderStatusStepper from '../../components/Orders/OrderStatusStepper';
import { motion, AnimatePresence } from 'framer-motion';

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        
        // Basic validation for MongoDB ID length (24 chars)
        if (orderId.length < 10) {
            return setError('Please enter a valid Order ID.');
        }

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            /** * Calling the Public Tracking Endpoint
             * We use the specific public route /api/orders/track/:id 
             * that we secured with .select() in the backend.
             */
            const { data } = await axios.get(`/api/orders/track/${orderId}`);
            setOrder(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Order not found. Please verify the ID from your confirmation email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <div className="text-center mb-5">
                        <h2 className="display-6 fw-bold text-dark">Track Your Blessing</h2>
                        <p className="text-muted">Enter your Order ID to see the status of your custom design.</p>
                    </div>

                    <Card className="shadow-sm border-0 p-4 mb-4">
                        <Form onSubmit={handleTrack}>
                            <Form.Group controlId="orderId">
                                <Form.Label className="small fw-bold text-uppercase text-muted">Order ID</Form.Label>
                                <InputGroup size="lg">
                                    <Form.Control 
                                        type="text" 
                                        placeholder="e.g. 658af..." 
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        className="border-end-0 shadow-none"
                                        required
                                    />
                                    <Button 
                                        variant="dark" 
                                        type="submit" 
                                        className="px-4 fw-bold" 
                                        disabled={loading}
                                    >
                                        {loading ? <Spinner animation="border" size="sm" /> : 'Track'}
                                    </Button>
                                </InputGroup>
                            </Form.Group>
                        </Form>
                    </Card>

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                className="alert alert-danger text-center border-0 shadow-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {order && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Card className="shadow-lg border-0 overflow-hidden">
                                    <div className="bg-dark text-white p-3 text-center">
                                        <small className="text-uppercase tracking-wider">Current Status</small>
                                        <h4 className="mb-0 fw-bold">{order.orderStatus}</h4>
                                    </div>
                                    <Card.Body className="p-4 p-md-5">
                                        <h5 className="mb-4">Hello, <strong>{order.shippingInfo.name.split(' ')[0]}</strong>!</h5>
                                        
                                        {/* Visual Progress Stepper */}
                                        <OrderStatusStepper currentStatus={order.orderStatus} />

                                        <div className="mt-5 pt-4 border-top d-flex justify-content-between align-items-center">
                                            <div>
                                                <p className="text-muted small mb-0">Last Update</p>
                                                <p className="fw-bold mb-0">
                                                    {new Date(order.updatedAt).toLocaleDateString('en-IN', { 
                                                        day: 'numeric', month: 'long', year: 'numeric' 
                                                    })}
                                                </p>
                                            </div>
                                            <div className="text-end">
                                                <p className="text-muted small mb-0">Order ID</p>
                                                <p className="fw-bold mb-0 text-primary">#GS-{order._id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                                
                                <div className="text-center mt-4">
                                    <p className="small text-muted">
                                        Standard printing takes 2-3 days. Having trouble? <a href="/contact" className="text-dark fw-bold">Contact Support</a>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Col>
            </Row>
        </Container>
    );
};

export default TrackOrder;