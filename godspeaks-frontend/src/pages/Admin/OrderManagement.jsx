import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Container, Modal, Form, Image } from 'react-bootstrap';
import { getAllOrdersApi, updateOrderStatusApi } from '../../api/orderApi'; 

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
      fetchOrders(); 
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
              <td>{order._id.substring(0, 6).toUpperCase()}</td>
              <td>{order.shippingInfo.name}<br/><small className="text-muted">{order.shippingInfo.email}</small></td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>₹{(order.totalPrice / 100).toFixed(2)}</td>
              <td>
                {order.isPaid ? <Badge bg="success">Paid</Badge> : <Badge bg="danger">Not Paid</Badge>}
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
                <Button variant="dark" size="sm" onClick={() => handleShowModal(order)}>Details</Button>
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
              <h5>Items (POD)</h5>
              <Table size="sm" className="mb-4 align-middle">
                <thead>
                    <tr>
                        <th>Preview</th>
                        <th>Product</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th>Print Asset</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedOrder.orderItems.map((item, index) => (
                        <tr key={index}>
                            <td>
                                <Image src={item.image} width="50" height="50" rounded style={{objectFit: 'cover'}} />
                            </td>
                            <td>
                                {item.isCustom ? <span className="text-primary fw-bold">Custom Print</span> : item.name}
                                <br/><small className="text-muted">ID: {item.product || 'N/A'}</small>
                            </td>
                            <td>{item.size}</td>
                            <td>{item.qty}</td>
                            <td>
                                {/* --- FIX: Check for Print File URL first --- */}
                                {item.isCustom ? (
                                    <a 
                                      href={item.printFileUrl || item.customPrintUrl} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="btn btn-sm btn-danger fw-bold"
                                    >
                                        ⬇ Download High-Res
                                    </a>
                                ) : (
                                    <span className="text-muted small">Standard Stock</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
              </Table>
              
              <hr />

              <div className="d-flex justify-content-between flex-wrap gap-3">
                <div className="bg-light p-3 rounded" style={{minWidth: '250px'}}>
                    <h6 className="fw-bold">Shipping To:</h6>
                    <p className="mb-0">{selectedOrder.shippingInfo.name}</p>
                    <p className="mb-0">{selectedOrder.shippingInfo.address}</p>
                    <p className="mb-0">{selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state} - {selectedOrder.shippingInfo.postalCode}</p>
                    <p className="mb-0 text-primary">{selectedOrder.shippingInfo.phone}</p>
                </div>
                <div>
                     <h6 className="fw-bold">Update Status</h6>
                     <Form.Select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)}
                        className="mb-2"
                     >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing (Printing)</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                     </Form.Select>
                     <Button variant="primary" onClick={handleUpdateStatus} className="w-100">Update Status</Button>
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