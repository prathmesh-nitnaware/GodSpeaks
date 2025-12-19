import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Container, Modal, Form, Image, Row, Col } from 'react-bootstrap';
import { getAllOrdersApi, updateOrderStatusApi } from '../../api/orderApi'; 

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrdersApi();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (order) => {
    setSelectedOrder(order);
    setStatus(order.orderStatus);
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    try {
      await updateOrderStatusApi(selectedOrder._id, status);
      setShowModal(false);
      fetchOrders(); // Refresh list
    } catch (error) {
      alert('Failed to update status');
      console.error(error);
    }
  };

  const getStatusBadge = (orderStatus) => {
    switch (orderStatus) {
      case 'Delivered': return <Badge bg="success">Delivered</Badge>;
      case 'Shipped': return <Badge bg="info">Shipped</Badge>;
      case 'Processing': return <Badge bg="warning" text="dark">Processing</Badge>;
      case 'Cancelled': return <Badge bg="danger">Cancelled</Badge>;
      default: return <Badge bg="secondary">Pending</Badge>;
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Order Management</h2>
        <Button variant="outline-dark" size="sm" onClick={fetchOrders}>Refresh Orders</Button>
      </div>

      <Table hover responsive className="shadow-sm bg-white rounded">
        <thead className="bg-light">
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Payment</th>
            <th>Status</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="align-middle">
              <td className="fw-bold text-primary">#{order._id.slice(-6).toUpperCase()}</td>
              <td>
                <div className="fw-semibold">{order.shippingInfo.name}</div>
                <small className="text-muted">{order.shippingInfo.email}</small>
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
              <td className="fw-bold">₹{(order.totalPrice / 100).toFixed(2)}</td>
              <td>
                {order.isPaid ? 
                  <Badge bg="success-subtle" className="text-success border border-success">Paid</Badge> : 
                  <Badge bg="danger-subtle" className="text-danger border border-danger">Unpaid</Badge>
                }
              </td>
              <td>{getStatusBadge(order.orderStatus)}</td>
              <td className="text-center">
                <Button variant="dark" size="sm" className="px-3" onClick={() => handleShowModal(order)}>
                  Manage
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* --- ORDER DETAILS MODAL --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">Order Details: #{selectedOrder?._id.toUpperCase()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-uppercase text-muted fw-bold small">Shipping Address</h6>
                  <p className="mb-1"><strong>{selectedOrder.shippingInfo.name}</strong></p>
                  <p className="mb-1 text-muted">{selectedOrder.shippingInfo.address}</p>
                  <p className="mb-1 text-muted">
                    {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state} - {selectedOrder.shippingInfo.postalCode}
                  </p>
                  <p className="text-primary fw-bold">{selectedOrder.shippingInfo.phone}</p>
                </Col>
                <Col md={6} className="border-start">
                  <h6 className="text-uppercase text-muted fw-bold small">Order Status Control</h6>
                  <Form.Group className="mb-3">
                    <Form.Select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="form-select-lg mb-2"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing (Printing)</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </Form.Select>
                    <Button variant="primary" onClick={handleUpdateStatus} className="w-100 fw-bold">
                      Update Order Status
                    </Button>
                  </Form.Group>
                </Col>
              </Row>

              <hr />

              <h6 className="text-uppercase text-muted fw-bold small mb-3">Order Items (Fulfillment)</h6>
              <Table borderless className="align-middle">
                <thead className="bg-light small">
                  <tr>
                    <th>Product</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th className="text-end">Assets</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.orderItems.map((item, index) => (
                    <tr key={index} className="border-bottom">
                      <td>
                        <div className="d-flex align-items-center">
                          <Image src={item.image} width="50" height="50" rounded className="me-3 border" />
                          <div>
                            <div className="fw-bold">{item.isCustom ? "Custom Design" : item.name}</div>
                            <small className="text-muted">ID: {item.product || 'N/A'}</small>
                          </div>
                        </div>
                      </td>
                      <td className="fw-bold">{item.size}</td>
                      <td>{item.qty}</td>
                      <td className="text-end">
                        {item.isCustom ? (
                          <a 
                            href={item.printFileUrl || item.customPrintUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-sm btn-outline-danger fw-bold shadow-sm"
                          >
                            <i className="bi bi-download me-1"></i> High-Res PNG
                          </a>
                        ) : (
                          <span className="badge bg-light text-dark border">In-Stock Item</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default OrderManagement;