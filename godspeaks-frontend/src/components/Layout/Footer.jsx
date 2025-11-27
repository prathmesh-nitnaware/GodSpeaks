import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-top py-5 mt-auto">
      <Container>
        <Row className="gy-4">
          <Col lg={4} md={6}>
            <h5 className="fw-bold text-dark mb-3">GodSpeaks</h5>
            <p className="text-muted">
              Wear your faith. Share the message. Premium quality Christian apparel designed to inspire conversations and strengthen your walk.
            </p>
          </Col>
          <Col lg={2} md={3} xs={6}>
            <h6 className="fw-bold text-dark mb-3">Shop</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/shop" className="text-decoration-none text-muted">All Products</Link></li>
              <li className="mb-2"><Link to="/shop?category=Faith" className="text-decoration-none text-muted">Faith Collection</Link></li>
              <li className="mb-2"><Link to="/shop?category=Scripture" className="text-decoration-none text-muted">Scripture Tees</Link></li>
              <li className="mb-2"><Link to="/custom-print" className="text-decoration-none text-primary fw-medium">Design Your Own</Link></li>
            </ul>
          </Col>
          <Col lg={2} md={3} xs={6}>
            <h6 className="fw-bold text-dark mb-3">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/about" className="text-decoration-none text-muted">About Us</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-decoration-none text-muted">Contact</Link></li>
              <li className="mb-2"><Link to="/admin/login" className="text-decoration-none text-muted">Admin Login</Link></li>
            </ul>
          </Col>
          <Col lg={4} md={6}>
            <h6 className="fw-bold text-dark mb-3">Stay Connected</h6>
            <p className="text-muted small">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="d-flex gap-2">
                <input type="email" className="form-control" placeholder="Enter your email" />
                <button className="btn btn-dark">Subscribe</button>
            </div>
          </Col>
        </Row>
        <div className="text-center text-muted small mt-5 pt-3 border-top">
          &copy; {new Date().getFullYear()} GodSpeaks. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;