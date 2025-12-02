import React from 'react';
import { Navbar, Nav, Container, Badge, NavDropdown, Image } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap'; 
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-cart3" viewBox="0 0 16 16">
    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </svg>
);

const AppNavbar = () => {
  const { totalItems } = useCart();
  const { adminInfo, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  const isAdmin = adminInfo && (adminInfo.role === 'admin' || adminInfo.role === 'superadmin');
  const userEmail = adminInfo?.email || 'Guest';
  const avatarUrl = `https://ui-avatars.com/api/?name=${userEmail}&background=0D6EFD&color=fff&size=40&rounded=true`;

  return (
    <Navbar bg="white" variant="light" expand="md" className="shadow-sm" sticky="top">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand className="fw-bold fs-4">GodSpeaks</Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
             <LinkContainer to="/shop">
                <Nav.Link>Shop</Nav.Link>
             </LinkContainer>
             
             {/* --- NEW LINK: VIRTUAL TRY ON --- */}
             <LinkContainer to="/try-on">
                <Nav.Link>Try On</Nav.Link>
             </LinkContainer>

             {/* --- CUSTOM PRINT LINK --- */}
             <LinkContainer to="/custom-print">
                <Nav.Link className="fw-semibold text-primary">Design Your Own</Nav.Link>
             </LinkContainer>
          </Nav>

          <Nav className="ms-auto align-items-center d-flex gap-3">
            {!isAdmin && (
              <LinkContainer to="/cart">
                <Nav.Link className="position-relative d-flex align-items-center text-dark">
                  <CartIcon />
                  {totalItems > 0 && (
                    <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.7rem' }}>
                      {totalItems}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>
            )}

            <NavDropdown 
              title={<Image src={adminInfo ? avatarUrl : "https://ui-avatars.com/api/?name=Guest&background=6c757d&color=fff&size=40&rounded=true"} roundedCircle width="40" height="40" className="border" alt="Profile"/>} 
              id="profile-dropdown" 
              align="end" 
            >
              {adminInfo ? (
                <>
                  <NavDropdown.Header>Hello, {adminInfo.email.split('@')[0]}</NavDropdown.Header>
                  {isAdmin ? (
                    <LinkContainer to="/admin/dashboard"><NavDropdown.Item className="fw-bold text-danger">Dashboard</NavDropdown.Item></LinkContainer>
                  ) : (
                    <LinkContainer to="/account"><NavDropdown.Item>My Account</NavDropdown.Item></LinkContainer>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </>
              ) : (
                <LinkContainer to="/admin/login"><NavDropdown.Item>Login / Sign Up</NavDropdown.Item></LinkContainer>
              )}
            </NavDropdown>

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;