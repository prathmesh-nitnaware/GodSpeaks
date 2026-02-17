import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Nav,
  Card,
  Table,
  Button,
  Form,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* ================== CONFIG ================== */
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://godspeaks.onrender.com";

/* ================== ICONS (UNCHANGED) ================== */
const DashboardIcon = () => <span>📊</span>;
const OrdersIcon = () => <span>📦</span>;
const UserIcon = () => <span>👤</span>;
const AddressIcon = () => <span>📍</span>;
const LogoutIcon = () => <span>🚪</span>;

const CustomerDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");

  /* ================== ORDERS ================== */
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState(null);

  /* ================== PROFILE ================== */
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: user?.age || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
  });

  /* ================== ADDRESS ================== */
  const [addressData, setAddressData] = useState({
    street: "123 Faith Avenue",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400001",
    country: "India",
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  /* ================== FETCH ORDERS ================== */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const { data } = await axios.get(
          `${API_BASE_URL}/api/orders/myorders`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(data);
      } catch (err) {
        setOrderError("Failed to load orders");
      } finally {
        setLoadingOrders(false);
      }
    };

    if (activeTab === "orders" && token) {
      fetchOrders();
    }
  }, [activeTab, token]);

  /* ================== REORDER ================== */
  const handleReorder = async (orderId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/orders/reorder/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/cart");
    } catch (err) {
      alert("Reorder failed. Please try again.");
    }
  };

  /* ================== ACTIONS ================== */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    alert("Profile update API can be connected here.");
  };

  const handleAddressUpdate = (e) => {
    e.preventDefault();
    setIsEditingAddress(false);
    alert("Address saved.");
  };

  /* ================== UI ================== */
  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4">My Account</h2>

      <Row>
        {/* SIDEBAR */}
        <Col lg={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <Nav className="flex-column">
                <Nav.Link onClick={() => setActiveTab("dashboard")}>
                  <DashboardIcon /> Dashboard
                </Nav.Link>
                <Nav.Link onClick={() => setActiveTab("orders")}>
                  <OrdersIcon /> My Orders
                </Nav.Link>
                <Nav.Link onClick={() => setActiveTab("details")}>
                  <UserIcon /> Account Details
                </Nav.Link>
                <Nav.Link className="text-danger" onClick={handleLogout}>
                  <LogoutIcon /> Logout
                </Nav.Link>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        {/* CONTENT */}
        <Col lg={9}>
          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <Alert variant="info">
              Welcome back <strong>{user?.name}</strong> 🙏
            </Alert>
          )}

          {/* ORDERS */}
          {activeTab === "orders" && (
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="fw-bold mb-0">Order History</h5>
              </Card.Header>
              <Card.Body>
                {loadingOrders ? (
                  <Spinner />
                ) : orderError ? (
                  <Alert variant="danger">{orderError}</Alert>
                ) : orders.length === 0 ? (
                  <p>No orders found.</p>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-6)}</td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td>₹{order.totalPrice}</td>
                          <td>
                            <Badge bg={order.isPaid ? "success" : "warning"}>
                              {order.isPaid ? "Paid" : "Pending"}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-dark"
                              onClick={() => handleReorder(order._id)}
                            >
                              Reorder
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          )}

          {/* ACCOUNT DETAILS */}
          {activeTab === "details" && (
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="fw-bold mb-0">Account Details</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleProfileUpdate}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          name: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control value={profileData.email} disabled />
                  </Form.Group>

                  <Button type="submit" variant="dark">
                    Save Changes
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerDashboard;
