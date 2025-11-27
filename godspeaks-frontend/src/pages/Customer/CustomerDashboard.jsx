import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Tab,
  Nav,
  Badge,
  Button,
  Spinner,
  Image,
  ProgressBar,
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { fetchMyOrdersApi } from "../../api/orderApi";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useWishlist } from "../../context/WishlistContext";
import ProductCard from "../../components/Products/ProductCard";

// --- Icons ---
const BoxIcon = () => <span>📦</span>;
const UserIcon = () => <span>👤</span>;
const MapIcon = () => <span>📍</span>;
const HeartIcon = () => <span>❤️</span>;
const SignOutIcon = () => <span>🚪</span>;

// --- NEW: Order Timeline Component ---
const OrderTimeline = ({ status }) => {
  // Define progress percentage based on status
  let progress = 0;
  if (status === "Pending") progress = 10;
  else if (status === "Processing") progress = 50;
  else if (status === "Shipped") progress = 75;
  else if (status === "Delivered") progress = 100;

  // Status check helper
  const isCompleted = (stepStatus) => {
    const stages = ["Pending", "Processing", "Shipped", "Delivered"];
    return stages.indexOf(status) >= stages.indexOf(stepStatus);
  };

  if (status === "Cancelled") {
    return <div className="text-danger fw-bold my-3">Order Cancelled</div>;
  }

  return (
    <div className="py-3">
      {/* Visual Bar */}
      <ProgressBar
        now={progress}
        variant="success"
        style={{ height: "6px" }}
        className="mb-2"
      />

      {/* Text Labels */}
      <div className="d-flex justify-content-between small fw-bold text-uppercase">
        <span
          className={isCompleted("Pending") ? "text-success" : "text-muted"}
        >
          Placed
        </span>
        <span
          className={isCompleted("Processing") ? "text-success" : "text-muted"}
        >
          Processing
        </span>
        <span
          className={isCompleted("Shipped") ? "text-success" : "text-muted"}
        >
          Shipped
        </span>
        <span
          className={isCompleted("Delivered") ? "text-success" : "text-muted"}
        >
          Delivered
        </span>
      </div>
    </div>
  );
};

const CustomerDashboard = () => {
  const { adminInfo, logout } = useAuth();
  const { wishlist } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchMyOrdersApi();
        setOrders(data);
      } catch (e) {
        console.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const userEmail = adminInfo?.email || "User";
  const avatarUrl = `https://ui-avatars.com/api/?name=${userEmail}&background=0D6EFD&color=fff&size=128&rounded=true&bold=true`;

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-end mb-5 border-bottom pb-3">
        <div>
          <h1 className="display-6 fw-bold text-dark">My Account</h1>
          <p className="text-muted mb-0">
            Manage your orders and personal details
          </p>
        </div>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={logout}
          className="d-flex align-items-center gap-2"
        >
          <SignOutIcon /> Sign Out
        </Button>
      </div>

      <Tab.Container id="dashboard-tabs" defaultActiveKey="orders">
        <Row className="g-4">
          {/* --- Sidebar --- */}
          <Col lg={3}>
            <Card className="shadow-sm border-0 rounded-3 overflow-hidden">
              <Card.Body className="p-0">
                <div className="p-4 text-center bg-light border-bottom">
                  <Image
                    src={avatarUrl}
                    roundedCircle
                    width={80}
                    height={80}
                    className="mb-3 shadow-sm"
                  />
                  <h6 className="fw-bold mb-0 text-truncate">{userEmail}</h6>
                  <small className="text-muted">Customer</small>
                </div>
                <Nav variant="pills" className="flex-column p-2 gap-1">
                  <Nav.Item>
                    <Nav.Link
                      eventKey="orders"
                      className="d-flex align-items-center py-3 px-3 fw-medium rounded-2"
                    >
                      <BoxIcon /> <span className="ms-2">Your Orders</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="wishlist"
                      className="d-flex align-items-center py-3 px-3 fw-medium rounded-2"
                    >
                      <HeartIcon /> <span className="ms-2">Wishlist</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="profile"
                      className="d-flex align-items-center py-3 px-3 fw-medium rounded-2"
                    >
                      <UserIcon />{" "}
                      <span className="ms-2">Login & Security</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="addresses"
                      className="d-flex align-items-center py-3 px-3 fw-medium rounded-2"
                    >
                      <MapIcon /> <span className="ms-2">Your Addresses</span>
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* --- Main Content --- */}
          <Col lg={9}>
            <Tab.Content>
              {/* --- ORDERS TAB --- */}
              <Tab.Pane eventKey="orders">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                >
                  <h4 className="fw-bold mb-4">Order History</h4>
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="alert alert-light border shadow-sm text-center py-5">
                      <div
                        className="mb-3 text-muted"
                        style={{ fontSize: "3rem" }}
                      >
                        📦
                      </div>
                      <h5>No orders found</h5>
                      <p className="text-muted">
                        Looks like you haven't placed any orders yet.
                      </p>
                      <Button
                        as={Link}
                        to="/shop"
                        variant="primary"
                        className="mt-2"
                      >
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-4">
                      {orders.map((order) => (
                        <Card
                          key={order._id}
                          className="shadow-sm border-0 rounded-3 overflow-hidden"
                        >
                          <div className="card-header bg-light bg-opacity-50 border-bottom d-flex flex-wrap justify-content-between align-items-center py-3 px-4">
                            <div className="d-flex gap-4 text-muted small text-uppercase fw-bold">
                              <div>
                                <span
                                  className="d-block text-secondary"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  Order Placed
                                </span>
                                <span className="text-dark">
                                  {formatDate(order.createdAt)}
                                </span>
                              </div>
                              <div>
                                <span
                                  className="d-block text-secondary"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  Total
                                </span>
                                <span className="text-dark">
                                  ₹{(order.totalPrice / 100).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="text-end mt-2 mt-sm-0">
                              <span
                                className="d-block text-secondary small"
                                style={{ fontSize: "0.7rem" }}
                              >
                                Order # {order._id.slice(-6).toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <Card.Body className="p-4">
                            {/* --- TIMELINE COMPONENT HERE --- */}
                            <OrderTimeline status={order.orderStatus} />

                            <hr className="my-3 text-muted opacity-25" />

                            {order.orderItems.map((item, idx) => (
                              <div
                                key={idx}
                                className="d-flex align-items-center mb-3 pb-3 border-bottom last:border-0"
                              >
                                <Image
                                  src={
                                    item.images
                                      ? item.images[0]
                                      : "/placeholder.jpg"
                                  }
                                  rounded
                                  className="border bg-white"
                                  style={{
                                    width: 80,
                                    height: 80,
                                    objectFit: "cover",
                                  }}
                                />
                                <div className="ms-3">
                                  <Link
                                    to={`/product/${item.product}`}
                                    className="text-decoration-none fw-bold text-dark h6 d-block mb-1"
                                  >
                                    {item.name}
                                  </Link>
                                  <div className="text-muted small">
                                    <span className="me-3">
                                      Size: <strong>{item.size}</strong>
                                    </span>
                                    <span>
                                      Qty: <strong>{item.qty}</strong>
                                    </span>
                                  </div>
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

              {/* --- WISHLIST TAB --- */}
              <Tab.Pane eventKey="wishlist">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                >
                  <h4 className="fw-bold mb-4">
                    Your Wishlist ({wishlist.length})
                  </h4>
                  {wishlist.length === 0 ? (
                    <div className="alert alert-light border shadow-sm text-center py-5">
                      <h5>Your wishlist is empty</h5>
                      <Button
                        as={Link}
                        to="/shop"
                        variant="dark"
                        className="mt-2"
                      >
                        Explore Products
                      </Button>
                    </div>
                  ) : (
                    <Row xs={1} sm={2} md={3} className="g-4">
                      {wishlist.map((product) => (
                        <Col key={product._id}>
                          <ProductCard product={product} />
                        </Col>
                      ))}
                    </Row>
                  )}
                </motion.div>
              </Tab.Pane>

              {/* --- PROFILE TAB --- */}
              <Tab.Pane eventKey="profile">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                >
                  <h4 className="fw-bold mb-4">Login & Security</h4>
                  <Card className="shadow-sm border-0 rounded-3">
                    <Card.Body className="p-4">
                      <Row className="mb-3 align-items-center border-bottom pb-3">
                        <Col xs={8}>
                          <small className="fw-bold text-muted">Email:</small>
                          <div className="fs-5">{adminInfo?.email}</div>
                        </Col>
                        <Col xs={4} className="text-end">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled
                          >
                            Edit
                          </Button>
                        </Col>
                      </Row>
                      <Row className="align-items-center">
                        <Col xs={8}>
                          <small className="fw-bold text-muted">
                            Password:
                          </small>
                          <div className="fs-5">••••••••</div>
                        </Col>
                        <Col xs={4} className="text-end">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled
                          >
                            Edit
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Tab.Pane>

              {/* --- ADDRESS TAB --- */}
              <Tab.Pane eventKey="addresses">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                >
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Your Addresses</h4>
                    <Button variant="primary" size="sm">
                      + Add New
                    </Button>
                  </div>
                  <Row>
                    <Col md={6}>
                      <Card
                        className="shadow-sm border-0 h-100 dashed-border"
                        style={{ borderStyle: "dashed", minHeight: "150px" }}
                      >
                        <Card.Body className="d-flex flex-column align-items-center justify-content-center text-muted">
                          <MapIcon />
                          <span className="mt-2">No addresses saved yet.</span>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
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
