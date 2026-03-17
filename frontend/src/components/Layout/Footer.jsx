import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-top py-5 mt-auto">
      <Container>
        <Row className="gy-4">
          {/* Brand Column */}
          <Col lg={4} md={12}>
            <h5 className="fw-bold text-dark mb-3" style={{ fontFamily: 'serif' }}>GodSpeaks.</h5>
            <p className="text-muted small" style={{ maxWidth: '300px' }}>
              Wear your faith. Share the message. Premium quality Christian apparel designed to inspire conversations and strengthen your walk.
            </p>
            <div className="d-flex gap-3 mt-3">
                 {/* Social Placeholders */}
                 <i className="bi bi-instagram text-muted fs-5 cursor-pointer"></i>
                 <i className="bi bi-facebook text-muted fs-5 cursor-pointer"></i>
                 <i className="bi bi-twitter text-muted fs-5 cursor-pointer"></i>
            </div>
          </Col>

          {/* Quick Links */}
          <Col lg={2} md={4} xs={6}>
            <h6 className="fw-bold text-dark mb-3">Shop</h6>
            <ul className="list-unstyled text-muted small">
              <li className="mb-2"><Link to="/shop" className="text-decoration-none text-muted">All Products</Link></li>
              <li className="mb-2"><Link to="/shop?category=Faith" className="text-decoration-none text-muted">Faith Collection</Link></li>
              <li className="mb-2"><Link to="/custom-print" className="text-decoration-none text-primary fw-medium">Design Your Own</Link></li>
              <li className="mb-2"><Link to="/track-order" className="text-decoration-none text-muted">Track Order</Link></li>
            </ul>
          </Col>

          {/* Legal & Support (NEW - Required for Payments) */}
          <Col lg={2} md={4} xs={6}>
            <h6 className="fw-bold text-dark mb-3">Support</h6>
            <ul className="list-unstyled text-muted small">
              <li className="mb-2"><Link to="/about" className="text-decoration-none text-muted">About Us</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-decoration-none text-muted">Contact Us</Link></li>
              <li className="mb-2"><Link to="/policies/privacy" className="text-decoration-none text-muted">Privacy Policy</Link></li>
              <li className="mb-2"><Link to="/policies/refund" className="text-decoration-none text-muted">Refund Policy</Link></li>
            </ul>
          </Col>

          {/* Newsletter */}
          <Col lg={4} md={4} xs={12}>
            <h6 className="fw-bold text-dark mb-3">Stay Connected</h6>
            <p className="text-muted small">
              Join 10,000+ believers. Get exclusive deals & drops.
            </p>
            <div className="d-flex gap-2">
                <input type="email" className="form-control" placeholder="Enter your email" />
                <button className="btn btn-dark btn-sm px-3">Join</button>
            </div>
          </Col>
        </Row>
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-muted small mt-5 pt-3 border-top">
          <div className="mb-2 mb-md-0">
            &copy; {new Date().getFullYear()} GodSpeaks. All rights reserved.
          </div>
          <div>
            Made with <span className="text-danger">&hearts;</span> for the Kingdom.
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;