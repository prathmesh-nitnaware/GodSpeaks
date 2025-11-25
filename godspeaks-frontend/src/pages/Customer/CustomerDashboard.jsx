import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Badge, Button, Spinner, Image } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { fetchMyOrdersApi } from '../../api/orderApi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// 1. Import Wishlist Hook & ProductCard
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/Products/ProductCard';

// --- Icons ---
const BoxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-box-seam me-2" viewBox="0 0 16 16"><path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-person-circle me-2" viewBox="0 0 16 16"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/></svg>;
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-geo-alt me-2" viewBox="0 0 16 16"><path d="M12.166 2.433a.458.458 0 0 0-.632-.633L8 5.366 4.466 1.8a.458.458 0 0 0-.632.633l3.85 3.85a.458.458 0 0 0 .632 0l3.85-3.85zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/><path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-heart me-2" viewBox="0 0 16 16"><path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/></svg>;
const SignOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16"><path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/><path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/></svg>;

const CustomerDashboard = () => {
  const { adminInfo, logout } = useAuth();
  const { wishlist } = useWishlist(); // 2. Get wishlist data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const data = await fetchMyOrdersApi();
      setOrders(data);
      setLoading(false);
    };
    loadOrders();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const userEmail = adminInfo?.email || 'User';
  const avatarUrl = `https://ui-avatars.com/api/?name=${userEmail}&background=0D6EFD&color=fff&size=128&rounded=true&bold=true`;

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-end mb-5 border-bottom pb-3">
        <div>
          <h1 className="display-6 fw-bold text-dark">My Account</h1>
          <p className="text-muted mb-0">Manage your orders and personal details</p>
        </div>
        <Button variant="outline-danger" size="sm" onClick={logout} className="d-flex align-items-center gap-2">
          <SignOutIcon /> Sign Out
        </Button>
      </div>

      <Tab.Container id="dashboard-tabs" defaultActiveKey="orders">
        <Row className="g-4">
          
          {/* --- Sidebar Navigation --- */}
          <Col lg={3}>
            <Card className="shadow-sm border-0 rounded-3 overflow-hidden">
              <Card.Body className="p-0">
                <div className="p-4 text-center bg-light border-bottom">
                  <Image src={avatarUrl} roundedCircle width={80} height={80} className="mb-3 shadow-sm" />
                  <h6 className="fw-bold mb-0 text-truncate">{userEmail}</h6>
                  <small className="text-muted">Customer</small>
                </div>
                <Nav variant="pills" className="flex-column p-2 gap-1">
                  <Nav.Item>
                    <Nav.Link eventKey="orders" className="d-flex align-items-center py-3 px-3 fw-medium rounded-2">
                      <BoxIcon /> Your Orders
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="wishlist" className="d-flex align-items-center py-3 px-3 fw-medium rounded-2">
                      <HeartIcon /> Wishlist {/* New Tab */}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="profile" className="d-flex align-items-center py-3 px-3 fw-medium rounded-2">
                      <UserIcon /> Login & Security
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="addresses" className="d-flex align-items-center py-3 px-3 fw-medium rounded-2">
                      <MapIcon /> Your Addresses
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* --- Main Content Area --- */}
          <Col lg={9}>
            <Tab.Content>
              
              {/* --- ORDERS TAB --- */}
              <Tab.Pane eventKey="orders">
                <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                  <h4 className="fw-bold mb-4">Order History</h4>
                  {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                  ) : orders.length === 0 ? (
                    <div className="alert alert-light border shadow-sm text-center py-5">
                      <div className="mb-3 text-muted" style={{ fontSize: '3rem' }}>📦</div>
                      <h5>No orders found</h5>
                      <p className="text-muted">Looks like you haven't placed any orders yet.</p>
                      <Button as={Link} to="/shop" variant="primary" className="mt-2">Start Shopping</Button>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-4">
                      {orders.map(order => (
                        <Card key={order._id} className="shadow-sm border-0 rounded-3 overflow-hidden">
                          <div className="card-header bg-light bg-opacity-50 border-bottom d-flex flex-wrap justify-content-between align-items-center py-3 px-4">
                            <div className="d-flex gap-4 text-muted small text-uppercase fw-bold">
                              <div><span className="d-block text-secondary" style={{fontSize: '0.7rem'}}>Order Placed</span><span className="text-dark">{formatDate(order.createdAt)}</span></div>
                              <div><span className="d-block text-secondary" style={{fontSize: '0.7rem'}}>Total</span><span className="text-dark">₹{(order.totalPrice / 100).toFixed(2)}</span></div>
                            </div>
                            <div className="text-end mt-2 mt-sm-0"><span className="d-block text-secondary small" style={{fontSize: '0.7rem'}}>Order # {order._id.slice(-6).toUpperCase()}</span></div>
                          </div>
                          <Card.Body className="p-4">
                            <div className="mb-3">
                              <h5 className="fw-bold mb-1">Status: <Badge bg={order.orderStatus === 'Delivered' ? 'success' : 'warning'}>{order.orderStatus}</Badge></h5>
                            </div>
                            {order.orderItems.map((item, idx) => (
                              <div key={idx} className="d-flex align-items-center mb-3 pb-3 border-bottom last:border-0">
                                <Image src={item.images ? item.images[0] : '/placeholder.jpg'} rounded className="border bg-white" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                                <div className="ms-3">
                                  <Link to={`/product/${item.product}`} className="text-decoration-none fw-bold text-dark h6 d-block mb-1">{item.name}</Link>
                                  <div className="text-muted small"><span className="me-3">Size: <strong>{item.size}</strong></span><span>Qty: <strong>{item.qty}</strong></span></div>
                                </div>
                              </div>
                            ))}
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              </Tab.Pane>

              {/* --- WISHLIST TAB (NEW) --- */}
              <Tab.Pane eventKey="wishlist">
                <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                  <h4 className="fw-bold mb-4">Your Wishlist ({wishlist.length})</h4>
                  
                  {wishlist.length === 0 ? (
                    <div className="alert alert-light border shadow-sm text-center py-5">
                      <div className="mb-3 text-muted" style={{ fontSize: '3rem' }}>♡</div>
                      <h5>Your wishlist is empty</h5>
                      <p className="text-muted">Save items you love here to buy them later.</p>
                      <Button as={Link} to="/shop" variant="dark" className="mt-2">Explore Products</Button>
                    </div>
                  ) : (
                    <Row xs={1} sm={2} md={3} className="g-4">
                      {wishlist.map((product) => (
                        <Col key={product._id}>
                          {/* Reusing ProductCard for consistent look */}
                          <ProductCard product={product} />
                        </Col>
                      ))}
                    </Row>
                  )}
                </motion.div>
              </Tab.Pane>

              {/* --- PROFILE TAB --- */}
              <Tab.Pane eventKey="profile">
                <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                  <h4 className="fw-bold mb-4">Login & Security</h4>
                  <Card className="shadow-sm border-0 rounded-3"><Card.Body className="p-4">
                      <Row className="mb-3 align-items-center border-bottom pb-3"><Col xs={8}><small className="fw-bold text-muted">Email:</small><div className="fs-5">{adminInfo?.email}</div></Col><Col xs={4} className="text-end"><Button variant="outline-secondary" size="sm" disabled>Edit</Button></Col></Row>
                      <Row className="align-items-center"><Col xs={8}><small className="fw-bold text-muted">Password:</small><div className="fs-5">••••••••</div></Col><Col xs={4} className="text-end"><Button variant="outline-secondary" size="sm" disabled>Edit</Button></Col></Row>
                  </Card.Body></Card>
                </motion.div>
              </Tab.Pane>

              {/* --- ADDRESS TAB --- */}
              <Tab.Pane eventKey="addresses">
                <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                  <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="fw-bold mb-0">Your Addresses</h4><Button variant="primary" size="sm">+ Add New</Button></div>
                  <Row><Col md={6}><Card className="shadow-sm border-0 h-100 dashed-border" style={{borderStyle: 'dashed', minHeight: '150px'}}><Card.Body className="d-flex flex-column align-items-center justify-content-center text-muted"><MapIcon /><span className="mt-2">No addresses saved yet.</span></Card.Body></Card></Col></Row>
                </motion.div>
              </Tab.Pane>

            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default CustomerDashboard;