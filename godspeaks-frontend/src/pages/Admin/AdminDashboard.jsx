import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchDashboardStatsApi } from '../../api/adminApi'; // Import API
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminDashboard = () => {
  const { adminInfo, logout } = useAuth();
  
  // State for real data
  const [stats, setStats] = useState({
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      salesData: [],
      categoryData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      const loadStats = async () => {
          try {
              const data = await fetchDashboardStatsApi();
              setStats(data);
          } catch (err) {
              console.error(err);
              setError("Failed to load dashboard analytics.");
          } finally {
              setLoading(false);
          }
      };
      loadStats();
  }, []);

  if (loading) return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
          <Spinner animation="border" variant="primary" />
      </Container>
  );

  return (
    <Container className="py-5">
      
      {/* --- Header --- */}
      <Row className="justify-content-between align-items-center mb-4">
        <Col>
          <h1 className="display-5 fw-bold text-dark">Admin Dashboard</h1>
        </Col>
        <Col xs="auto">
          <Button variant="outline-danger" onClick={logout}>
            Sign Out
          </Button>
        </Col>
      </Row>

      {/* --- Welcome Message --- */}
      <Alert variant="info" className="shadow-sm border-0 bg-info-subtle text-info-emphasis mb-5">
        <Alert.Heading as="h4" className="fw-bold">
          Welcome, {adminInfo?.email}!
        </Alert.Heading>
        <p className="mb-0">
          Here is your store's performance overview.
        </p>
      </Alert>

      {/* --- Quick Stats Cards --- */}
      <Row className="gy-4 mb-5">
          <Col md={4}>
              <Card className="shadow-sm border-0 bg-primary text-white h-100">
                  <Card.Body className="text-center p-4">
                      <h3>Total Revenue</h3>
                      <h1 className="fw-bold display-6">₹{(stats.totalRevenue / 100).toLocaleString()}</h1>
                  </Card.Body>
              </Card>
          </Col>
          <Col md={4}>
              <Card className="shadow-sm border-0 bg-success text-white h-100">
                  <Card.Body className="text-center p-4">
                      <h3>Total Orders</h3>
                      <h1 className="fw-bold display-6">{stats.totalOrders}</h1>
                  </Card.Body>
              </Card>
          </Col>
          <Col md={4}>
              <Card className="shadow-sm border-0 bg-warning text-dark h-100">
                  <Card.Body className="text-center p-4">
                      <h3>Total Products</h3>
                      <h1 className="fw-bold display-6">{stats.totalProducts}</h1>
                  </Card.Body>
              </Card>
          </Col>
      </Row>

      {/* --- Navigation Blocks --- */}
      <Row className="gy-4">
        <Col md={6}>
          <Card as={Link} to="/admin/products" className="h-100 shadow-sm text-decoration-none text-dark border-0 hover-shadow transition">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
              <Card.Title as="h3" className="fw-bold fs-4 mb-3">Manage Products</Card.Title>
              <Card.Text className="text-muted">Manage inventory, sizes, and POD items.</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card as={Link} to="/admin/orders" className="h-100 shadow-sm text-decoration-none text-dark border-0 hover-shadow transition">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
              <Card.Title as="h3" className="fw-bold fs-4 mb-3">View Orders</Card.Title>
              <Card.Text className="text-muted">Process customer orders and download artwork.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Charts Section --- */}
      <Row className="mt-5 g-4">
        
        {/* 1. Sales Overview (Line Chart) */}
        <Col lg={8}>
            <Card className="shadow-sm border-0 h-100">
                <Card.Body className="p-4">
                    <Card.Title className="fw-bold mb-4">Sales Trends (6 Months)</Card.Title>
                    {stats.salesData.length > 0 ? (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={stats.salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                                        formatter={(value) => [`₹${(value/100).toFixed(2)}`, 'Revenue']}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="sales" 
                                        stroke="#0d6efd" 
                                        strokeWidth={3} 
                                        dot={{ r: 4, fill: '#0d6efd', strokeWidth: 2, stroke: '#fff' }} 
                                        activeDot={{ r: 7 }} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-muted text-center py-5">No sales data available yet.</p>
                    )}
                </Card.Body>
            </Card>
        </Col>

        {/* 2. Top Categories (Bar Chart) */}
        <Col lg={4}>
            <Card className="shadow-sm border-0 h-100">
                <Card.Body className="p-4">
                    <Card.Title className="fw-bold mb-4">Product Distribution</Card.Title>
                    {stats.categoryData.length > 0 ? (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={stats.categoryData} layout="vertical" margin={{ left: 0, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        width={80} 
                                        stroke="#555" 
                                        fontSize={13} 
                                        tickLine={false} 
                                        axisLine={false} 
                                    />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" fill="#ffc107" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-muted text-center py-5">No products found.</p>
                    )}
                </Card.Body>
            </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default AdminDashboard;