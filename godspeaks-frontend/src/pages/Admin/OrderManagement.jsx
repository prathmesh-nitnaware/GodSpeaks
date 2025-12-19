import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Container, Modal, Form, Image, Row, Col, Card } from 'react-bootstrap';
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
      fetchOrders(); // Refresh list to reflect changes
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
        <h2 className="fw-bold text-dark">Fulfillment Dashboard</h2>
        <Button variant="outline-dark" size="sm" onClick={fetchOrders} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Orders'}
        </Button>
      </div>

      <Table hover responsive className="shadow-sm bg-white rounded overflow-hidden">
        <thead className="bg-light">
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="align-middle">
              <td className="fw-bold text-primary">
                #GS-{order._id.slice(-6).toUpperCase()} {/* Professional formatting */}
              </td>
              <td>
                <div className="fw-semibold">{order.shippingInfo.name}</div>
                <small className="text-muted">{order.shippingInfo.email}</small>
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
              <td className="fw-bold">₹{(order.totalPrice / 100).toFixed(2)}</td>
              <td>{getStatusBadge(order.orderStatus)}</td>
              <td className="text-center">
                <Button variant="dark" size="sm" className="px-3 rounded-pill" onClick={() => handleShowModal(order)}>
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* --- ORDER DETAILS MODAL --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">Fulfillment Details: #GS-{selectedOrder?._id.slice(-6).toUpperCase()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-uppercase text-muted fw-bold small">Courier Label</h6>
                  <Card className="bg-light border-0 p-3">
                    <p className="mb-1"><strong>{selectedOrder.shippingInfo.name}</strong></p>
                    <p className="mb-1">{selectedOrder.shippingInfo.address}</p>
                    <p className="mb-1">{selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state}</p>
                    <p className="mb-1 fw-bold">PIN: {selectedOrder.shippingInfo.postalCode}</p>
                    <p className="mb-0 text-primary fw-bold">Phone: {selectedOrder.shippingInfo.phone}</p>
                  </Card>
                </Col>
                <Col md={6} className="border-start">
                  <h6 className="text-uppercase text-muted fw-bold small">Shipping Progress</h6>
                  <Form.Group className="mb-3">
                    <Form.Select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="form-select-lg mb-2"
                    >
                      <option value="Pending">Order Received</option>
                      <option value="Processing">In Production (Printing)</option>
                      <option value="Shipped">Dispatched (Courier)</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled/Refunded</option>
                    </Form.Select>
                    <Button variant="primary" onClick={handleUpdateStatus} className="w-100 fw-bold shadow-sm">
                      Apply Status Change
                    </Button>
                  </Form.Group>
                </Col>
              </Row>

              <hr />

              <h6 className="text-uppercase text-muted fw-bold small mb-3">Customization Assets & Items</h6>
              <Table borderless className="align-middle">
                <thead className="bg-light small">
                  <tr>
                    <th>Product & Preview</th>
                    <th>Size/Color</th>
                    <th>Qty</th>
                    <th className="text-end">Fulfillment Files</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.orderItems.map((item, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-bottom">
                        <td>
                          <div className="d-flex align-items-center">
                            <Image src={item.image} width="50" height="50" rounded className="me-3 border shadow-sm" />
                            <div>
                              <div className="fw-bold">{item.isCustom ? "CUSTOM DESIGN" : item.name}</div>
                              <small className="text-muted">Database ID: {item.product || 'N/A'}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg="dark" className="me-1">{item.size}</Badge>
                          <Badge bg="secondary-subtle" className="text-dark border">{item.color || "N/A"}</Badge>
                        </td>
                        <td>{item.qty}</td>
                        <td className="text-end">
                          {item.isCustom ? (
                            <div className="d-flex flex-column gap-1">
                              <a href={item.printFileUrl} target="_blank" rel="noreferrer" className="btn btn-xs btn-outline-danger py-1 fw-bold">
                                ⬇ Front PNG
                              </a>
                              {item.secondaryPrintUrl && (
                                <a href={item.secondaryPrintUrl} target="_blank" rel="noreferrer" className="btn btn-xs btn-outline-info py-1 fw-bold">
                                  ⬇ Back PNG
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted small">Stock Item</span>
                          )}
                        </td>
                      </tr>
                      {/* --- Display Customer Message/Instructions --- */}
                      {item.isCustom && item.message && (
                        <tr>
                          <td colSpan="4" className="bg-warning-subtle p-2 rounded small">
                            <strong>Client Message:</strong> {item.message}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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