import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchDashboardStatsApi } from '../../api/adminApi';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { FaBox, FaClipboardList, FaRupeeSign, FaArrowUp } from 'react-icons/fa';

const AdminDashboard = () => {
  const { adminInfo, logout } = useAuth();
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
        // UPDATED: Pass the token explicitly to the API
        const token = adminInfo ? adminInfo.token : null;
        if (!token) return;

        const data = await fetchDashboardStatsApi(token);
        setStats(data);
      } catch (err) {
        console.error(err);
        // If 401, it means token expired
        if (err.message.includes('401')) {
            setError("Session expired. Please logout and login again.");
        } else {
            setError("Failed to load dashboard analytics.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (adminInfo) {
        loadStats();
    }
  }, [adminInfo]);

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Spinner animation="border" variant="primary" />
    </Container>
  );

  // Colors for Bar Chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Container className="py-4">
      {/* --- Header --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-dark mb-1">GodSpeaks Analytics</h1>
          <p className="text-muted">Overview of your print-on-demand performance.</p>
        </div>
        <Button variant="outline-dark" size="sm" onClick={logout} className="fw-bold px-3">
          Sign Out
        </Button>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

      {/* --- Quick Stats --- */}
      <Row className="gy-4 mb-4">
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted small fw-bold text-uppercase mb-1">Total Revenue</p>
                  <h2 className="fw-bold">₹{(stats.totalRevenue / 100).toLocaleString()}</h2>
                  <span className="text-success small fw-bold"><FaArrowUp /> +12% growth</span>
                </div>
                <div className="bg-primary-subtle p-3 rounded-circle text-primary h-50">
                  <FaRupeeSign size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted small fw-bold text-uppercase mb-1">Total Orders</p>
                  <h2 className="fw-bold">{stats.totalOrders}</h2>
                  <Link to="/admin/orders" className="small text-decoration-none">View all orders</Link>
                </div>
                <div className="bg-success-subtle p-3 rounded-circle text-success h-50">
                  <FaClipboardList size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted small fw-bold text-uppercase mb-1">Products</p>
                  <h2 className="fw-bold">{stats.totalProducts}</h2>
                  <Link to="/admin/products" className="small text-decoration-none">Manage inventory</Link>
                </div>
                <div className="bg-warning-subtle p-3 rounded-circle text-warning h-50">
                  <FaBox size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Charts --- */}
      {/* Only render charts if we have data to avoid width(-1) errors */}
      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-4">
              <Card.Title className="fw-bold mb-4">Revenue Trend</Card.Title>
              <div style={{ width: '100%', height: 350 }}>
                {stats.salesData && stats.salesData.length > 0 ? (
                    <ResponsiveContainer>
                    <LineChart data={stats.salesData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                        <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#999', fontSize: 12}} 
                        tickFormatter={(value) => `₹${value / 100000}k`} 
                        />
                        <Tooltip 
                        formatter={(value) => [`₹${(value / 100).toLocaleString()}`, 'Revenue']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="sales" stroke="#0d6efd" strokeWidth={4} dot={{ r: 6, fill: '#0d6efd', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                        No sales data available yet.
                    </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-4">
              <Card.Title className="fw-bold mb-4">Product Categories</Card.Title>
              <div style={{ width: '100%', height: 350 }}>
                {stats.categoryData && stats.categoryData.length > 0 ? (
                    <ResponsiveContainer>
                    <BarChart data={stats.categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 11}} />
                        <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                        <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={35}>
                        {stats.categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                        No category data.
                    </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;