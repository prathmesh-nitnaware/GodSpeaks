import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';

// Import the local image
import heroImage from '../../assets/hero-background.jpg'; 

const HeroBanner = () => {
  return (
    <div 
      className="bg-dark text-white position-relative overflow-hidden" 
      style={{ minHeight: '600px' }}
    >
      {/* Background Image Layer with Overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.5, // Darkens the image so text is readable
          zIndex: 1
        }}
      />

      {/* Content Layer */}
      <Container 
        className="position-relative h-100 d-flex align-items-center" 
        style={{ zIndex: 2, minHeight: '600px' }}
      >
        <Row className="w-100">
          <Col lg={8} md={10}>
            {/* Animation Wrapper */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-uppercase small fw-semibold text-warning mb-2">
                New Collection
              </h2>
              
              <h1 className="display-3 fw-bold mb-4">
                Wear Your Faith. <br/>
                <span>Share His Word.</span>
              </h1>
              
              <p className="lead mb-5 fs-4" style={{ maxWidth: '600px', opacity: 0.9 }}>
                Inspire others with beautiful Christian apparel featuring Scripture and messages of hope, love, and faith.
              </p>
              
              {/* Call to Action Buttons */}
              <div className="d-flex flex-wrap gap-3">
                <Button 
                  as={Link} 
                  to="/shop" 
                  variant="primary" 
                  size="lg" 
                  className="px-5 py-3 fw-bold rounded-pill"
                >
                  Shop Collection
                </Button>
                
                {/* --- NEW BUTTON: Link to Custom Print Page --- */}
                <Button 
                  as={Link} 
                  to="/custom-print" 
                  variant="outline-light" 
                  size="lg" 
                  className="px-5 py-3 fw-bold rounded-pill"
                >
                  Design Your Own
                </Button>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HeroBanner;