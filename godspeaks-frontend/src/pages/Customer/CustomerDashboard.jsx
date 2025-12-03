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
// You might need to implement/import a fetchMyOrders function in your orderApi
// import { fetchMyOrders } from '../../api/orderApi';

// --- ICONS ---
const DashboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-speedometer2"
    viewBox="0 0 16 16"
  >
    <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4zM3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10zm9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5zm.754-4.246a.389.389 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.389.389 0 0 0-.029-.518z" />
    <path
      fillRule="evenodd"
      d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A7.988 7.988 0 0 1 0 10zm8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.92C4.397 13.233 6.32 12 8 12s3.604 1.232 4.923 1.249c.757-.043 1.477-.344 1.68-.92A7 7 0 0 0 8 3z"
    />
  </svg>
);
const OrdersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-box-seam"
    viewBox="0 0 16 16"
  >
    <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z" />
  </svg>
);
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-person"
    viewBox="0 0 16 16"
  >
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
  </svg>
);
const AddressIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-geo-alt"
    viewBox="0 0 16 16"
  >
    <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z" />
    <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
  </svg>
);
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-box-arrow-right"
    viewBox="0 0 16 16"
  >
    <path
      fillRule="evenodd"
      d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 0h-8A1.5 1.5 0 0 0 0 1.5v9A1.5 1.5 0 0 0 1.5 12h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
    />
    <path
      fillRule="evenodd"
      d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
    />
  </svg>
);

const CustomerDashboard = () => {
  const { user, logout } = useAuth(); // Assuming 'user' holds customer data
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false); // Mock loading for now

  // --- Profile State ---
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: user?.age || "", // New Age Field
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
  });

  // --- Address State ---
  const [addressData, setAddressData] = useState({
    street: "123 Faith Avenue",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400001",
    country: "India",
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    // If you have a real backend endpoint for profile details, fetch here.
    // For now, we sync with Auth Context or use mocks.
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }

    // Mock Fetch Orders
    // const loadOrders = async () => { ... }
    // loadOrders();
    setOrders([
      {
        _id: "ORD-7782",
        date: "2023-10-25",
        total: 4500,
        status: "Delivered",
        items: 3,
      },
      {
        _id: "ORD-9921",
        date: "2023-11-02",
        total: 1299,
        status: "Processing",
        items: 1,
      },
    ]);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login"); // Or wherever your login route is
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    alert("Profile updated successfully! (Logic to be connected to backend)");
    // Call backend API to update user.age, user.name, etc.
  };

  const handleAddressUpdate = (e) => {
    e.preventDefault();
    setIsEditingAddress(false);
    alert("Address saved successfully!");
  };

  const handleTabChange = (tab) => setActiveTab(tab);

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h2 className="fw-bold">My Account</h2>
        <p className="text-muted">
          Manage your profile, orders, and addresses.
        </p>
      </div>

      <Row>
        {/* --- LEFT SIDEBAR NAVIGATION --- */}
        <Col lg={3} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="p-4 text-center border-bottom bg-light">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-dark text-white rounded-circle"
                  style={{ width: "60px", height: "60px", fontSize: "24px" }}
                >
                  {profileData.name
                    ? profileData.name.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <h6 className="fw-bold mb-0">{profileData.name}</h6>
                <small className="text-muted">{profileData.email}</small>
              </div>
              <Nav variant="pills" className="flex-column p-2">
                <Nav.Link
                  active={activeTab === "dashboard"}
                  onClick={() => handleTabChange("dashboard")}
                  className={`d-flex align-items-center px-3 py-2 my-1 ${
                    activeTab === "dashboard"
                      ? "bg-dark text-white"
                      : "text-dark"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <span className="me-3">
                    <DashboardIcon />
                  </span>{" "}
                  Dashboard
                </Nav.Link>
                <Nav.Link
                  active={activeTab === "orders"}
                  onClick={() => handleTabChange("orders")}
                  className={`d-flex align-items-center px-3 py-2 my-1 ${
                    activeTab === "orders" ? "bg-dark text-white" : "text-dark"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <span className="me-3">
                    <OrdersIcon />
                  </span>{" "}
                  My Orders
                </Nav.Link>
                <Nav.Link
                  active={activeTab === "addresses"}
                  onClick={() => handleTabChange("addresses")}
                  className={`d-flex align-items-center px-3 py-2 my-1 ${
                    activeTab === "addresses"
                      ? "bg-dark text-white"
                      : "text-dark"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <span className="me-3">
                    <AddressIcon />
                  </span>{" "}
                  Addresses
                </Nav.Link>
                <Nav.Link
                  active={activeTab === "details"}
                  onClick={() => handleTabChange("details")}
                  className={`d-flex align-items-center px-3 py-2 my-1 ${
                    activeTab === "details" ? "bg-dark text-white" : "text-dark"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <span className="me-3">
                    <UserIcon />
                  </span>{" "}
                  Account Details
                </Nav.Link>
                <Nav.Link
                  onClick={handleLogout}
                  className="d-flex align-items-center px-3 py-2 my-1 text-danger"
                  style={{ cursor: "pointer" }}
                >
                  <span className="me-3">
                    <LogoutIcon />
                  </span>{" "}
                  Logout
                </Nav.Link>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        {/* --- RIGHT CONTENT AREA --- */}
        <Col lg={9}>
          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="fade-in">
              <Alert
                variant="info"
                className="border-0 shadow-sm text-dark bg-light"
              >
                Hello <strong>{profileData.name}</strong> (not{" "}
                <strong>{profileData.name}</strong>?{" "}
                <span
                  className="text-primary text-decoration-underline"
                  style={{ cursor: "pointer" }}
                  onClick={handleLogout}
                >
                  Log out
                </span>
                ).
                <br />
                From your account dashboard you can view your{" "}
                <span
                  className="text-primary cursor-pointer"
                  onClick={() => setActiveTab("orders")}
                >
                  recent orders
                </span>
                , manage your{" "}
                <span
                  className="text-primary cursor-pointer"
                  onClick={() => setActiveTab("addresses")}
                >
                  shipping and billing addresses
                </span>
                , and edit your{" "}
                <span
                  className="text-primary cursor-pointer"
                  onClick={() => setActiveTab("details")}
                >
                  password and account details
                </span>
                .
              </Alert>

              <Row className="g-3 mt-2">
                <Col md={4}>
                  <Card className="border-0 shadow-sm h-100 text-center py-4 bg-white">
                    <Card.Body>
                      <div className="text-primary mb-2">
                        <OrdersIcon />
                      </div>
                      <h3 className="fw-bold">{orders.length}</h3>
                      <p className="text-muted mb-0">Total Orders</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="border-0 shadow-sm h-100 text-center py-4 bg-white">
                    <Card.Body>
                      <div className="text-warning mb-2">
                        <AddressIcon />
                      </div>
                      <h3 className="fw-bold">1</h3>
                      <p className="text-muted mb-0">Saved Address</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="border-0 shadow-sm h-100 text-center py-4 bg-white">
                    <Card.Body>
                      <div className="text-success mb-2">
                        <UserIcon />
                      </div>
                      <h3 className="fw-bold">Active</h3>
                      <p className="text-muted mb-0">Account Status</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {/* 2. MY ORDERS */}
          {activeTab === "orders" && (
            <Card className="border-0 shadow-sm fade-in">
              <Card.Header className="bg-white py-3">
                <h5 className="mb-0 fw-bold">Order History</h5>
              </Card.Header>
              <Card.Body>
                {orders.length > 0 ? (
                  <Table responsive hover className="align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Order</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td className="fw-bold text-primary">#{order._id}</td>
                          <td>{order.date}</td>
                          <td>
                            <Badge
                              bg={
                                order.status === "Delivered"
                                  ? "success"
                                  : "warning"
                              }
                              className="fw-normal px-2 py-1"
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td>
                            ₹{order.total} for {order.items} item(s)
                          </td>
                          <td>
                            <Button
                              variant="outline-dark"
                              size="sm"
                              className="rounded-pill"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted">No orders found.</p>
                    <Button variant="dark" onClick={() => navigate("/shop")}>
                      Go Shop
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* 3. ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="fade-in">
              <p className="text-muted mb-4">
                The following addresses will be used on the checkout page by
                default.
              </p>
              <Row>
                <Col md={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 fw-bold">Billing Address</h5>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setIsEditingAddress(!isEditingAddress)}
                      >
                        {isEditingAddress ? "Cancel" : "Edit"}
                      </Button>
                    </Card.Header>
                    <Card.Body>
                      {isEditingAddress ? (
                        <Form onSubmit={handleAddressUpdate}>
                          <Form.Group className="mb-2">
                            <Form.Label className="small">
                              Street Address
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={addressData.street}
                              onChange={(e) =>
                                setAddressData({
                                  ...addressData,
                                  street: e.target.value,
                                })
                              }
                            />
                          </Form.Group>
                          <Row>
                            <Col xs={6}>
                              <Form.Group className="mb-2">
                                <Form.Label className="small">City</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={addressData.city}
                                  onChange={(e) =>
                                    setAddressData({
                                      ...addressData,
                                      city: e.target.value,
                                    })
                                  }
                                />
                              </Form.Group>
                            </Col>
                            <Col xs={6}>
                              <Form.Group className="mb-2">
                                <Form.Label className="small">
                                  Zip Code
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  value={addressData.zip}
                                  onChange={(e) =>
                                    setAddressData({
                                      ...addressData,
                                      zip: e.target.value,
                                    })
                                  }
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Button
                            type="submit"
                            variant="dark"
                            size="sm"
                            className="mt-2"
                          >
                            Save Address
                          </Button>
                        </Form>
                      ) : (
                        <address className="fst-normal text-muted">
                          <strong>{profileData.name}</strong>
                          <br />
                          {addressData.street}
                          <br />
                          {addressData.city}, {addressData.zip}
                          <br />
                          {addressData.state}, {addressData.country}
                        </address>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {/* 4. ACCOUNT DETAILS (Name, Age, Password) */}
          {activeTab === "details" && (
            <Card className="border-0 shadow-sm fade-in">
              <Card.Header className="bg-white py-3">
                <h5 className="mb-0 fw-bold">Account Details</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleProfileUpdate}>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="formName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      {/* --- NEW: Age Field --- */}
                      <Form.Group controlId="formAge">
                        <Form.Label>Age</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="e.g. 25"
                          value={profileData.age}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              age: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-light"
                    />
                    <Form.Text className="text-muted">
                      Email cannot be changed.
                    </Form.Text>
                  </Form.Group>

                  <hr className="my-4" />
                  <h6 className="fw-bold mb-3">Password Change</h6>

                  <Form.Group className="mb-3" controlId="currentPass">
                    <Form.Label>
                      Current Password (leave blank to leave unchanged)
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={profileData.currentPassword}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="newPass">
                    <Form.Label>
                      New Password (leave blank to leave unchanged)
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          newPassword: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  <Button variant="dark" type="submit" className="mt-2 px-4">
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
