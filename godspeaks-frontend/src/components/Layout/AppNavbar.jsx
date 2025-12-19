import React from 'react';
import { Navbar, Nav, Container, Badge, NavDropdown, Image, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap'; 
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AppNavbar = () => {
  const { totalItems } = useCart();
  const { adminInfo, logout } = useAuth(); // adminInfo contains user data (customer or admin)
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login'); // Redirect to login after logout
  };

  // Helper to check role
  const isAdmin = adminInfo && (adminInfo.role === 'admin' || adminInfo.role === 'superadmin');
  
  // Generate Avatar
  const userEmail = adminInfo?.email || 'Guest';
  const avatarUrl = `https://ui-avatars.com/api/?name=${userEmail}&background=0D6EFD&color=fff&size=40&rounded=true`;

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm sticky-top py-3">
      <Container>
        {/* Brand Logo */}
        <LinkContainer to="/">
          <Navbar.Brand className="fw-bold fs-4" style={{ fontFamily: 'serif', letterSpacing: '1px' }}>
            GodSpeaks.
          </Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto align-items-center">
            <LinkContainer to="/">
              <Nav.Link className="fw-semibold px-3">Home</Nav.Link>
            </LinkContainer>
            
            <LinkContainer to="/shop">
               <Nav.Link className="fw-semibold px-3">Shop</Nav.Link>
            </LinkContainer>
            
            {/* --- FEATURE LINKS --- */}
            <LinkContainer to="/try-on">
               <Nav.Link className="fw-semibold px-3">Virtual Try-On</Nav.Link>
            </LinkContainer>

            <LinkContainer to="/custom-print">
               <Nav.Link className="fw-bold px-3 text-primary">
                 Design Your Own ✨
               </Nav.Link>
            </LinkContainer>
             
            <LinkContainer to="/about">
               <Nav.Link className="fw-semibold px-3">About</Nav.Link>
            </LinkContainer>
          </Nav>

          {/* Right Side Icons */}
          <Nav className="ms-auto align-items-center d-flex gap-3 mt-3 mt-lg-0">
            
            {/* Cart Icon (Only for Customers) */}
            {!isAdmin && (
              <LinkContainer to="/cart">
                <Nav.Link className="position-relative text-dark">
                  <i className="bi bi-bag fs-5"></i> {/* Bootstrap Icon Class */}
                  {/* Fallback SVG if icons not loaded */}
                  {!window.bootstrap && (
                     <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/>
                     </svg>
                  )}
                  {totalItems > 0 && (
                    <Badge 
                      bg="dark" 
                      pill 
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>
            )}

            {/* User Profile / Login */}
            {adminInfo ? (
              <NavDropdown 
                title={
                  <Image 
                    src={avatarUrl} 
                    roundedCircle 
                    width="35" 
                    height="35" 
                    className="border" 
                    alt="Profile"
                  />
                } 
                id="profile-dropdown" 
                align="end"
              >
                <NavDropdown.Header>
                    Signed in as <br/>
                    <strong>{adminInfo.name || adminInfo.email.split('@')[0]}</strong>
                </NavDropdown.Header>
                
                <NavDropdown.Divider />
                
                {isAdmin ? (
                  <LinkContainer to="/admin/dashboard">
                    <NavDropdown.Item>Admin Dashboard</NavDropdown.Item>
                  </LinkContainer>
                ) : (
                  <LinkContainer to="/account">
                    <NavDropdown.Item>My Orders</NavDropdown.Item>
                  </LinkContainer>
                )}
                
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger fw-semibold">
                   Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <LinkContainer to="/admin/login">
                <Button variant="dark" size="sm" className="rounded-pill px-4 fw-bold">
                  Login
                </Button>
              </LinkContainer>
            )}

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;