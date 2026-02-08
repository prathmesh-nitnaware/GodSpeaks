import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Table, 
  Form, Modal, Badge, Spinner, Alert 
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaTicketAlt, FaCalendarAlt, FaPercent } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const CouponManagement = () => {
  const { adminInfo } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: '',
    expiryDate: '',
    isActive: true
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
      const { data } = await axios.get('/api/coupons', config);
      setCoupons(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminInfo) fetchCoupons();
  }, [adminInfo]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
      await axios.post('/api/coupons', newCoupon, config);
      setShowModal(false);
      setNewCoupon({ code: '', discount: '', expiryDate: '', isActive: true });
      fetchCoupons(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Error creating coupon");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
        await axios.delete(`/api/coupons/${id}`, config);
        fetchCoupons();
      } catch (err) {
        alert("Error deleting coupon");
      }
    }
  };

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Spinner animation="border" variant="primary" />
    </Container>
  );

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-dark mb-1">Coupon Management</h1>
          <p className="text-muted">Create and manage discount codes for GodSpeaks.</p>
        </div>
        <Button variant="dark" onClick={() => setShowModal(true)} className="fw-bold px-4 d-flex align-items-center gap-2">
          <FaPlus /> Create Coupon
        </Button>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="ps-4 py-3 text-uppercase small fw-bold text-muted">Coupon Code</th>
                <th className="py-3 text-uppercase small fw-bold text-muted">Discount</th>
                <th className="py-3 text-uppercase small fw-bold text-muted">Expiry Date</th>
                <th className="py-3 text-uppercase small fw-bold text-muted">Status</th>
                <th className="pe-4 py-3 text-end text-uppercase small fw-bold text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length > 0 ? coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-primary-subtle p-2 rounded text-primary">
                        <FaTicketAlt />
                      </div>
                      <span className="fw-bold text-dark">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge bg="success-subtle" className="text-success fs-6 fw-semibold">
                      <FaPercent size={12} className="me-1" /> {coupon.discount}% Off
                    </Badge>
                  </td>
                  <td className="py-3 text-muted">
                    <FaCalendarAlt className="me-2" />
                    {new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="py-3">
                    {new Date(coupon.expiryDate) < new Date() ? (
                      <Badge bg="danger">Expired</Badge>
                    ) : (
                      <Badge bg={coupon.isActive ? "success" : "secondary"}>
                        {coupon.isActive ? "Active" : "Disabled"}
                      </Badge>
                    )}
                  </td>
                  <td className="pe-4 py-3 text-end">
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => handleDeleteCoupon(coupon._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No coupons found. Create your first one to boost sales!
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* CREATE MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">New Promo Code</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateCoupon}>
          <Modal.Body className="pt-0">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">COUPON CODE</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g. LAUNCH20" 
                required 
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">DISCOUNT PERCENTAGE (%)</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="20" 
                min="1" max="100" 
                required 
                value={newCoupon.discount}
                onChange={(e) => setNewCoupon({...newCoupon, discount: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">EXPIRY DATE</Form.Label>
              <Form.Control 
                type="date" 
                required 
                value={newCoupon.expiryDate}
                onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="dark" type="submit" className="fw-bold px-4">Save Coupon</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CouponManagement;