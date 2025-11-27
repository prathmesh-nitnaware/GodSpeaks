import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const About = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} className="text-center">
          <h1 className="fw-bold mb-4">About GodSpeaks</h1>
          <p className="lead text-muted">
            GodSpeaks is more than just a clothing brand; it's a movement to share the Gospel through everyday fashion.
          </p>
          <p className="text-muted mt-4">
            Founded with a mission to spark conversations about faith, we design high-quality, comfortable apparel featuring powerful scripture and Christian themes. Whether you are looking for a subtle reminder of God's love or a bold statement of faith, we have something for you.
          </p>
          <p className="text-muted mt-3">
             Now with our new <strong>Design Your Own</strong> feature, you can bring your own God-inspired creativity to life. We handle the printing and shipping, so you can focus on the message.
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default About;