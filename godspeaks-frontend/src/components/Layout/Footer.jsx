import React from 'react';
import { Link } from 'react-router-dom';
// --- 1. IMPORT BOOTSTRAP COMPONENTS ---
import { Container, Row, Col } from 'react-bootstrap';

// You can install react-icons (npm install react-icons) to use these
// import { FaFacebookF, FaInstagram } from 'react-icons/fa';

// --- Placeholder Icons ---
const FacebookIcon = () => (
  <svg className="bi" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0 0 3.603 0 8.049c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg className="bi" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.703.01 5.556 0 5.829 0 8s.01 2.444.048 3.297c.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.556 15.99 5.829 16 8 16s2.444-.01 3.297-.048c.852-.04 1.433-.174 1.942-.372.526-.205.972-.478 1.417-.923.445-.444.719-.89.923-1.416.198-.51.333-1.09.372-1.942C15.99 10.444 16 10.171 16 8s-.01-2.444-.048-3.297c-.04-.852-.174-1.433-.372-1.942a3.916 3.916 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.942-.372C10.444.01 10.171 0 8 0zm0 1.44c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.282.24.705.275 1.485.039.843.047 1.096.047 3.232s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.282.11-.705.24-1.485.276-.843.038-1.096.047-3.232.047s-2.389-.009-3.232-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.282-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.232s.008-2.389.046-3.232c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.843-.038 1.096-.047 3.232-.047zM8 3.88c-2.277 0-4.12.732-4.12 4.12s1.843 4.12 4.12 4.12 4.12-1.843 4.12-4.12S10.277 3.88 8 3.88zm0 6.78c-1.468 0-2.66-1.192-2.66-2.66s1.192-2.66 2.66-2.66 2.66 1.192 2.66 2.66-1.192 2.66-2.66 2.66zM13.23 3.33c-.596 0-1.08.484-1.08 1.08s.484 1.08 1.08 1.08 1.08-.484 1.08-1.08-.484-1.08-1.08-1.08z"/>
  </svg>
);
// -----------------------------------------------------------


const Footer = () => {
  return (
    // --- 2. USE BOOTSTRAP CLASSES ---
    // 'bg-dark' and 'text-light' set the theme
    // 'py-5' adds padding on the top and bottom
    <footer className="bg-dark text-light py-5">
      <Container>
        {/* --- Top Section: 4-Column Grid --- */}
        {/* On mobile ('md'), this will stack to 1 column */}
        <Row className="gy-4">
          
          {/* --- Column 1: Brand & Quote --- */}
          <Col md={4} lg={4}>
            <h3 className="h4 text-white mb-3">GodSpeaks</h3>
            <p className="small fst-italic">
              "For I know the plans I have for you," declares
              the Lord, "plans to prosper you and not to harm
              you, plans to give you hope and a future."
            </p>
            <p className="small fw-semibold mt-2">- Jeremiah 29:11</p>
          </Col>

          {/* --- Column 2: Quick Links --- */}
          <Col md={4} lg={2}>
            <h5 className="text-white mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-light text-decoration-none">Home</Link></li>
              <li className="mb-2"><Link to="/shop" className="text-light text-decoration-none">Shop</Link></li>
              <li className="mb-2"><Link to="/about" className="text-light text-decoration-none">About Us</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-light text-decoration-none">Contact</Link></li>
            </ul>
          </Col>

          {/* --- Column 3: Customer Service --- */}
          <Col md={4} lg={3}>
            <h5 className="text-white mb-3">Customer Service</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/shipping" className="text-light text-decoration-none">Shipping Info</Link></li>
              <li className="mb-2"><Link to="/returns" className="text-light text-decoration-none">Returns</Link></li>
              <li className="mb-2"><Link to="/privacy-policy" className="text-light text-decoration-none">Privacy Policy</Link></li>
              <li className="mb-2"><Link to="/terms" className="text-light text-decoration-none">Terms & Conditions</Link></li>
            </ul>
          </Col>

          {/* --- Column 4: Connect With Us --- */}
          <Col md={4} lg={3}>
            <h5 className="text-white mb-3">Connect With Us</h5>
            <div className="d-flex">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-light me-3" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-light" aria-label="Instagram">
                <InstagramIcon />
              </a>
              {/* Add more social icons as needed */}
            </div>
          </Col>
        </Row>

        {/* --- Bottom Section: Copyright --- */}
        {/* 'mt-5' is margin-top, 'border-top' adds the line, 'pt-4' is padding-top */}
        <Row className="mt-5 border-top border-secondary pt-4">
          <Col>
            <p className="text-center text-muted small">
              © {new Date().getFullYear()} GodSpeaks. All rights reserved. Spreading God's Word through fashion.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;