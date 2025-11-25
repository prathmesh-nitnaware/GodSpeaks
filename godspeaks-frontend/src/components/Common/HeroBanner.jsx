import React from 'react';
import { Link } from 'react-router-dom';
// --- 1. IMPORT BOOTSTRAP COMPONENTS ---
import { Container, Button } from 'react-bootstrap';

// --- 2. IMPORT THE HERO IMAGE ---
// Make sure you have placed your image at this path: 
// src/assets/hero-background.jpg
import heroImage from '../../assets/hero-background.jpg'; 

const HeroBanner = () => {

  // --- 3. INLINE STYLE FOR THE BACKGROUND IMAGE ---
  // We apply this to a wrapper div
  const heroStyle = {
    backgroundImage: `url(${heroImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white' // Default text color on image
  };

  return (
    <div style={heroStyle}>
      {/* This overlay adds a dark tint so the white text is readable,
        matching your design. 'vh-75' makes it 75% of the viewport height.
        'd-flex' and 'align-items-center' vertically center the content.
      */}
      <div className="bg-dark bg-opacity-50">
        <Container className="py-5">
          {/* 'py-5' adds padding, 'text-md-start' aligns text left on medium screens+ */}
          <div className="py-5 text-center text-md-start col-md-10 col-lg-8">
            
            {/* Subtitle from design */}
            <h2 className="text-uppercase small fw-semibold text-light">
              New Collection
            </h2>
            
            {/* Main Headline from design */}
            {/* 'display-3' is a large headline, 'fw-bold' is font-weight bold */}
            <h1 className="display-3 fw-bold text-white mt-2">
              Wear Your Faith
            </h1>
            
            {/* Description from design */}
            <p className="fs-5 text-light-emphasis mt-3">
              Inspire others with beautiful Christian apparel featuring
              Scripture and messages of hope, love, and faith.
            </p>
            
            {/* Call to Action Button */}
            {/* 'btn-primary' is blue, 'btn-lg' is a large button */}
            <Button 
              as={Link} 
              to="/shop" 
              variant="primary" 
              size="lg" 
              className="mt-4 fw-bold"
            >
              Shop Collection
            </Button>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default HeroBanner;