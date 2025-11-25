import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const FullPageSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
    <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
  </div>
);

const ProtectedRoute = ({ adminOnly = false }) => {
  const { adminInfo, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageSpinner />; 
  }

  // 1. Check if user is logged in at all
  if (!adminInfo) {
    return <Navigate to="/admin/login" replace />;
  }

  // 2. If route requires Admin, check role
  if (adminOnly && adminInfo.role !== 'admin' && adminInfo.role !== 'superadmin') {
    // User is logged in but is NOT an admin, send them to home
    return <Navigate to="/" replace />;
  }

  // 3. If we pass all checks, render the page
  return <Outlet />;
};

export default ProtectedRoute;