import React from 'react';
import { Nav, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaBox, 
  FaClipboardList, 
  FaPlusSquare, 
  FaChartLine, 
  FaSignOutAlt, 
  FaHome 
} from 'react-icons/fa'; // Install via: npm install react-icons

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FaChartLine /> },
    { name: 'Order Requests', path: '/admin/orders', icon: <FaClipboardList /> },
    { name: 'Product Inventory', path: '/admin/products', icon: <FaBox /> },
    { name: 'Add New Apparel', path: '/admin/product/create', icon: <FaPlusSquare /> },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('godspeaks_admin');
      window.location.href = '/login';
    }
  };

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 bg-dark text-white shadow" style={{ width: '280px', minHeight: '100vh', position: 'sticky', top: 0 }}>
      <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <span className="fs-4 fw-bold tracking-tight">GodSpeaks <span className="text-primary">Admin</span></span>
      </div>
      <hr />
      
      <Nav variant="pills" className="flex-column mb-auto">
        {menuItems.map((item) => (
          <Nav.Item key={item.path} className="mb-1">
            <Nav.Link 
              as={Link} 
              to={item.path} 
              className={`d-flex align-items-center gap-3 py-2 px-3 transition-all ${currentPath === item.path ? 'active' : 'text-white'}`}
              style={{ borderRadius: '8px' }}
            >
              <span className="fs-5">{item.icon}</span>
              <span className="fw-medium">{item.name}</span>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <hr />
      
      <div className="px-2">
        <Button 
          as={Link} 
          to="/" 
          variant="outline-light" 
          size="sm" 
          className="w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
        >
          <FaHome /> Visit Main Site
        </Button>
        <Button 
          onClick={handleLogout} 
          variant="danger" 
          size="sm" 
          className="w-100 d-flex align-items-center justify-content-center gap-2 fw-bold"
        >
          <FaSignOutAlt /> Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;