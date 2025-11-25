import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
// 1. Import Recharts components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminDashboard = () => {
  const { adminInfo, logout } = useAuth();

  // --- MOCK DATA FOR CHARTS ---
  // In a real app, this would come from your fetchAnalyticsApi() call
  const salesData = [
    { name: 'Jan', sales: 12000 },
    { name: 'Feb', sales: 19000 },
    { name: 'Mar', sales: 15000 },
    { name: 'Apr', sales: 24000 },
    { name: 'May', sales: 21000 },
    { name: 'Jun', sales: 32000 },
  ];

  const categoryData = [
    { name: 'Faith', count: 45 },
    { name: 'Scripture', count: 32 },
    { name: 'Minimal', count: 28 },
    { name: 'Inspire', count: 19 },
  ];

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
          From here you can manage your products, view customer orders, and update site settings.
        </p>
      </Alert>

      {/* --- Navigation Blocks --- */}
      <Row className="gy-4">
        
        {/* Card 1: Manage Products */}
        <Col md={6} lg={4}>
          <Card as={Link} to="/admin/products" className="h-100 shadow-sm text-decoration-none text-dark border-0 hover-shadow transition">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
              <Card.Title as="h3" className="fw-bold fs-4 mb-3">Manage Products</Card.Title>
              <Card.Text className="text-muted mb-4">
                Add, edit, or delete t-shirt designs and manage stock levels.
              </Card.Text>
              <Button variant="primary" className="mt-auto fw-bold px-4">
                Go to Products &rarr;
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 2: Manage Orders */}
        <Col md={6} lg={4}>
          <Card as={Link} to="/admin/orders" className="h-100 shadow-sm text-decoration-none text-dark border-0 hover-shadow transition">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
              <Card.Title as="h3" className="fw-bold fs-4 mb-3">View Orders</Card.Title>
              <Card.Text className="text-muted mb-4">
                Track new orders, update shipping status, and view customer details.
              </Card.Text>
              <Button variant="primary" className="mt-auto fw-bold px-4">
                Go to Orders &rarr;
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 3: Analytics */}
        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm text-decoration-none text-dark border-0">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
              <Card.Title as="h3" className="fw-bold fs-4 mb-3">Analytics</Card.Title>
              <Card.Text className="text-muted mb-4">
                View detailed reports on revenue, user growth, and inventory.
              </Card.Text>
              <Button variant="outline-secondary" className="mt-auto fw-bold px-4" disabled>
                Coming Soon &rarr;
              </Button>
            </Card.Body>
          </Card>
        </Col>

      </Row>

      {/* --- NEW: Charts Section --- */}
      <Row className="mt-5 g-4">
        
        {/* 1. Sales Overview (Line Chart) */}
        <Col lg={8}>
            <Card className="shadow-sm border-0 h-100">
                <Card.Body className="p-4">
                    <Card.Title className="fw-bold mb-4">Sales Overview</Card.Title>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                                    formatter={(value) => [`₹${value}`, 'Revenue']}
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
                </Card.Body>
            </Card>
        </Col>

        {/* 2. Top Categories (Bar Chart) */}
        <Col lg={4}>
            <Card className="shadow-sm border-0 h-100">
                <Card.Body className="p-4">
                    <Card.Title className="fw-bold mb-4">Top Categories</Card.Title>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 10 }}>
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
                </Card.Body>
            </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default AdminDashboard;