import React, { useState, useEffect } from 'react';
import { fetchAllOrdersAdmin, updateOrderStatusApi } from '../../api/adminApi';
import { Container, Card, Table, Spinner, Alert, Form } from 'react-bootstrap';

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
  </div>
);

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllOrdersAdmin();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updatedOrder = await updateOrderStatusApi(orderId, newStatus);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, orderStatus: updatedOrder.orderStatus } : order
        )
      );
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Container className="py-5">
      <h1 className="display-5 fw-bold text-dark mb-5">
        Order Management
      </h1>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td className="fw-medium">...{order._id.slice(-6)}</td>
                    <td className="text-muted">{formatDate(order.createdAt)}</td>
                    <td className="text-muted">{order.shippingInfo.name}</td>
                    <td className="fw-medium">₹{(order.totalPrice / 100).toFixed(2)}</td>
                    <td>
                      {order.isPaid ? (
                        <span className="badge bg-success">Paid</span>
                      ) : (
                        <span className="badge bg-danger">No</span>
                      )}
                    </td>
                    <td className="fw-bold">{order.orderStatus}</td>
                    <td>
                      <Form.Select 
                        size="sm"
                        value={order.orderStatus} 
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled'}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </Form.Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      {/* THIS IS THE FIX: The extra </Card> was removed from here */}
    </Container>
  );
};

export default OrderManagement;