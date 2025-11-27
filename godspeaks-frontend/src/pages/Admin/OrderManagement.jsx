import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Container, Modal, Form, Image } from 'react-bootstrap';
import { getAllOrdersApi, updateOrderStatusApi } from '../../api/orderApi'; // Ensure these match your API file

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrdersApi();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
      console.error('Error updating status:', error);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Order Management</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Date</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id.substring(0, 10)}...</td>
              <td>{order.shippingInfo.name}<br/><small className="text-muted">{order.shippingInfo.email}</small></td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>₹{(order.totalPrice / 100).toFixed(2)}</td>
              <td>
                {order.isPaid ? (
                  <Badge bg="success">Paid</Badge>
                ) : (
                  <Badge bg="danger">Not Paid</Badge>
                )}
              </td>
              <td>
                 <Badge bg={
                    order.orderStatus === 'Delivered' ? 'success' : 
                    order.orderStatus === 'Shipped' ? 'info' : 
                    order.orderStatus === 'Processing' ? 'warning' : 'secondary'
                 }>
                    {order.orderStatus}
                 </Badge>
              </td>
              <td>
                <Button variant="dark" size="sm" onClick={() => handleShowModal(order)}>
                  Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* ORDER DETAILS MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <h5>Items</h5>
              <Table size="sm" className="mb-4">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Product</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedOrder.orderItems.map((item, index) => (
                        <tr key={index}>
                            <td>
                                <Image src={item.isCustom ? item.customPrintUrl : item.image} width="50" height="50" rounded />
                            </td>
                            <td>
                                {item.isCustom ? <span className="text-primary fw-bold">Custom Print</span> : item.name}
                            </td>
                            <td>{item.size}</td>
                            <td>{item.qty}</td>
                            <td>
                                {/* ADMIN FEATURE: Download Custom Artwork */}
                                {item.isCustom && item.customPrintUrl && (
                                    <a href={item.customPrintUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                                        Download Artwork
                                    </a>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
              </Table>
              
              <hr />

              <div className="d-flex justify-content-between">
                <div>
                    <h5>Shipping Info</h5>
                    <p className="mb-0">{selectedOrder.shippingInfo.address}</p>
                    <p className="mb-0">{selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state} - {selectedOrder.shippingInfo.postalCode}</p>
                    <p>Phone: {selectedOrder.shippingInfo.phone}</p>
                </div>
                <div>
                     <h5>Update Status</h5>
                     <Form.Select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)}
                        className="mb-2"
                     >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                     </Form.Select>
                     <Button variant="primary" onClick={handleUpdateStatus}>Update Status</Button>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default OrderManagement;