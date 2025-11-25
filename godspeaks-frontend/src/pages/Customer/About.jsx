import React from 'react';
import { Link } from 'react-router-dom';
// --- 1. IMPORT BOOTSTRAP COMPONENTS ---
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

const About = () => {
  return (
    // --- 2. USE BOOTSTRAP LAYOUT ---
    <div className="bg-white py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8} className="text-center">
            <h1 className="display-4 fw-bold text-dark">
              Our Mission
            </h1>
            <p className="fs-4 text-muted mt-3">
              Spreading God's Word, one t-shirt at a time.
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center mt-5">
          <Col md={10} lg={8}>
            <p className="fs-5 text-dark mb-4">
              Welcome to <strong>GodSpeaks</strong>, your new home for modern, high-quality Christian apparel. We believe that what you wear is more than just fabric—it's an opportunity to share a message of hope, faith, and love.
            </p>
            <p className="fs-5 text-dark mb-4">
              Our journey began with a simple idea: to create beautifully designed t-shirts that weren't just fashionable, but also served as a "walking billboard" for the Gospel. In a world full of noise, we wanted to give believers a way to wear their faith proudly and spark meaningful conversations.
            </p>
            
            {/* Value Proposition Section */}
            <Card className="shadow-sm border-0 bg-light p-4 mt-5">
              <Card.Body>
                <h3 className="h4 fw-bold text-dark mb-4">What We Stand For</h3>
                <ul className="list-unstyled fs-5">
                  <li className="mb-3 d-flex">
                    <span className="me-2">✔</span>
                    <strong>Faith-Driven Designs:</strong>
                    <span className="text-muted ms-2">Every product is thoughtfully created to inspire.</span>
                  </li>
                  <li className="mb-3 d-flex">
                    <span className="me-2">✔</span>
                    <strong>Premium Quality:</strong>
                    <span className="text-muted ms-2">We use soft, comfortable fabrics that last.</span>
                  </li>
                  <li className="mb-3 d-flex">
                    <span className="me-2">✔</span>
                    <strong>Easy Shopping:</strong>
                    <span className="text-muted ms-2">A seamless and secure ordering process.</span>
                  </li>
                </ul>
              </Card.Body>
            </Card>
            
            <p className="fs-5 text-dark mt-5">
              Thank you for joining us on this mission. We're honored to be a part of your faith journey.
            </p>
            
            <div className="text-center pt-4">
              <Button
                as={Link}
                to="/shop"
                variant="dark"
                size="lg"
                className="fw-semibold"
              >
                Shop Our Collection
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default About;