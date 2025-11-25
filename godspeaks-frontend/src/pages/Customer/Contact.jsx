import React, { useState } from 'react';
// --- 1. IMPORT BOOTSTRAP COMPONENTS ---
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add logic to send this form data
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
  };

  return (
    // --- 2. USE BOOTSTRAP LAYOUT ---
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8} className="text-center">
          <h1 className="display-4 fw-bold text-dark">
            Get In Touch
          </h1>
          <p className="fs-4 text-muted mt-3">
            Have questions about your order or just want to say hello? We'd love to hear from you.
          </p>
        </Col>
      </Row>

      <Row className="justify-content-center mt-5">
        <Col md={10} lg={8}>
          {isSubmitted ? (
            <Alert variant="success" className="text-center p-5 shadow-sm">
              <h2 className="h3 fw-bold">Thank You!</h2>
              <p className="fs-5 mt-3">
                Your message has been sent successfully. We'll get back to you as soon as possible.
              </p>
            </Alert>
          ) : (
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4 p-md-5">
                <Form onSubmit={handleSubmit}>
                  {/* Name */}
                  <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      size="lg"
                    />
                  </Form.Group>
                  
                  {/* Email */}
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      size="lg"
                    />
                  </Form.Group>

                  {/* Message */}
                  <Form.Group className="mb-3" controlId="message">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      size="lg"
                    />
                  </Form.Group>
                  
                  {/* Submit Button */}
                  <div className="text-end">
                    <Button
                      type="submit"
                      variant="dark"
                      size="lg"
                      className="fw-semibold px-5"
                    >
                      Send Message
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;