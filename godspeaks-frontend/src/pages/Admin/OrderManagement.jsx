import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Badge, Container, Modal, Form, Image, Row, Col, Card, Pagination, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext'; 
import { getAllOrdersApi, updateOrderStatusApi } from '../../api/orderApi'; 

const OrderManagement = () => {
  const { adminInfo } = useAuth(); 
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  /**
   * Memoized Fetcher: Prevents infinite re-render loops and satisfies ESLint.
   */
  const fetchOrders = useCallback(async (page) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllOrdersApi(page);
      setOrders(data.orders);
      setTotalPages(data.pages);
      setTotalOrders(data.totalOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.status === 401 ? "Session expired. Please log in again." : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync effect with Auth state and Pagination
  useEffect(() => {
    if (adminInfo) {
        fetchOrders(currentPage);
    }
  }, [currentPage, adminInfo, fetchOrders]);

  const handleShowModal = (order) => {
    setSelectedOrder(order);
    setStatus(order.orderStatus);
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    try {
      await updateOrderStatusApi(selectedOrder._id, status);
      setShowModal(false);
      fetchOrders(currentPage); 
    } catch (error) {
      alert('Failed to update status. Check backend permissions.');
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
      {error && <Alert variant="danger" className="border-0 shadow-sm mb-4">{error}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-0">Fulfillment Dashboard</h2>
          <p className="text-muted small mb-0">Total Orders: {totalOrders}</p>
        </div>
        <Button variant="outline-dark" size="sm" onClick={() => fetchOrders(currentPage)} disabled={loading || !adminInfo}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Refresh List'}
        </Button>
      </div>

      <Table hover responsive className="shadow-sm bg-white rounded overflow-hidden">
        <thead className="bg-light text-uppercase small">
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
          {loading ? (
            <tr><td colSpan="6" className="text-center py-5"><Spinner animation="grow" variant="primary" /></td></tr>
          ) : orders.length === 0 ? (
            <tr><td colSpan="6" className="text-center py-5 text-muted">No orders found.</td></tr>
          ) : (
            orders.map((order) => (
              <tr key={order._id} className="align-middle">
                <td className="fw-bold text-primary">#GS-{order._id.slice(-6).toUpperCase()}</td>
                <td>
                  <div className="fw-semibold">{order.shippingInfo.name}</div>
                  <small className="text-muted">{order.shippingInfo.email}</small>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="fw-bold">₹{(order.totalPrice / 100).toFixed(2)}</td>
                <td>{getStatusBadge(order.orderStatus)}</td>
                <td className="text-center">
                  <Button variant="dark" size="sm" className="px-3 rounded-pill" onClick={() => handleShowModal(order)}>
                    Update
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination className="shadow-sm">
            <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} />
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item 
                key={idx + 1} 
                active={idx + 1 === currentPage} 
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} />
          </Pagination>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold fs-5">Fulfillment Details: #GS-{selectedOrder?._id.slice(-6).toUpperCase()}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-uppercase text-muted fw-bold x-small mb-2">Courier Destination</h6>
                  <Card className="bg-light border-0 p-3 h-100">
                    <p className="mb-1 fw-bold">{selectedOrder.shippingInfo.name}</p>
                    <p className="mb-1 small">{selectedOrder.shippingInfo.address}</p>
                    <p className="mb-1 small">{selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state} - {selectedOrder.shippingInfo.postalCode}</p>
                    <p className="mb-0 text-primary small fw-bold">📞 {selectedOrder.shippingInfo.phone}</p>
                  </Card>
                </Col>
                <Col md={6} className="mt-3 mt-md-0">
                  <h6 className="text-uppercase text-muted fw-bold x-small mb-2">Shipping Progress</h6>
                  <Form.Group>
                    <Form.Select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="form-select-lg mb-3"
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

              <h6 className="text-uppercase text-muted fw-bold x-small mb-3">Order Items & Assets</h6>
              <div className="table-responsive">
                <Table borderless className="align-middle">
                  <thead className="bg-light x-small">
                    <tr>
                      <th>Item Preview</th>
                      <th>Customization</th>
                      <th className="text-end">Print Files</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderItems.map((item, index) => (
                      <tr key={index} className="border-bottom">
                        <td>
                          <div className="d-flex align-items-center">
                            <Image src={item.image} width="50" height="50" rounded className="me-3 border" />
                            <div>
                              <div className="fw-bold small">{item.isCustom ? "CUSTOM POD" : item.name}</div>
                              <small className="text-muted">Qty: {item.qty}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg="dark" className="me-1">{item.size}</Badge>
                          <Badge bg="secondary-subtle" className="text-dark border">{item.color || "N/A"}</Badge>
                        </td>
                        <td className="text-end">
                          {item.isCustom ? (
                            <div className="d-flex flex-column gap-1 align-items-end">
                              <a href={item.printFileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger py-1">Front PNG</a>
                              {item.secondaryPrintUrl && (
                                <a href={item.secondaryPrintUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info py-1">Back PNG</a>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted x-small">Stock Item</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default OrderManagement;