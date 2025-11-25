import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import HeroBanner from '../../components/Common/HeroBanner';
import ProductCard from '../../components/Products/ProductCard';
// --- 1. IMPORT ANIMATION WRAPPER ---
import FadeIn from '../../components/Common/FadeIn';

const HeartIcon = () => <svg className="bi" width="32" height="32" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/></svg>;
const StarIcon = () => <svg className="bi" width="32" height="32" fill="currentColor" viewBox="0 0 16 16"><path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z"/></svg>;
const CartIcon = () => <svg className="bi" width="32" height="32" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>;

const featuredProducts = [
  { _id: '1', name: 'SON OF DAVID', description: 'Wear your faith...', verse: 'Matthew 1:1', price: 35000, images: ['/Son_of_David.png'], rating: 5 },
  { _id: '2', name: 'Faith Over Fear', verse: 'Joshua 1:9', price: 2999, images: ['/placeholder.jpg'], rating: 5 },
  { _id: '3', name: 'God is Greater', verse: 'Romans 8:31', price: 2999, images: ['/placeholder.jpg'], rating: 5 },
  { _id: '4', name: 'Blessed & Grateful', verse: 'Psalm 103:2', price: 2999, images: ['/placeholder.jpg'], rating: 5 },
];

const Home = () => {
  return (
    <div>
      {/* The Hero Banner handles its own layout, we can animate it inside HeroBanner.jsx if we want, 
          or just animate the sections below for now. */}
      <HeroBanner />

      <Container as="section" className="py-5">
        {/* --- Animate Header --- */}
        <FadeIn>
          <div className="text-center">
            <h2 className="display-5 fw-bold text-dark">
              Featured Designs
            </h2>
            <p className="fs-5 text-muted mt-3">
              Handpicked Christian T-shirts with powerful Bible verses to strengthen your faith journey
            </p>
          </div>
        </FadeIn>

        <Row xs={1} sm={2} md={4} className="g-4 mt-4">
          {featuredProducts.map((product, index) => (
            <Col key={product._id}>
              {/* --- Animate Cards with Staggered Delay --- */}
              <FadeIn delay={index * 0.1}>
                <ProductCard product={product} />
              </FadeIn>
            </Col>
          ))}
        </Row>

        <FadeIn>
          <div className="text-center mt-5">
            <Button as={Link} to="/shop" variant="outline-dark" size="lg">
              View All Designs &rarr;
            </Button>
          </div>
        </FadeIn>
      </Container>

      <section className="bg-white py-5">
        <Container>
          <Row className="gy-4">
            
            <Col md={4} className="text-center">
              <FadeIn delay={0.1}>
                <div className="text-primary mb-3"><HeartIcon /></div>
                <h3 className="h4 fw-bold text-dark">Faith-Driven</h3>
                <p className="text-muted">
                  Every design is created to inspire and strengthen your walk with Christ.
                </p>
              </FadeIn>
            </Col>

            <Col md={4} className="text-center">
              <FadeIn delay={0.2}>
                <div className="text-primary mb-3"><StarIcon /></div>
                <h3 className="h4 fw-bold text-dark">Premium Quality</h3>
                <p className="text-muted">
                  Soft, comfortable fabrics that last through countless wears and washes.
                </p>
              </FadeIn>
            </Col>

            <Col md={4} className="text-center">
              <FadeIn delay={0.3}>
                <div className="text-primary mb-3"><CartIcon /></div>
                <h3 className="h4 fw-bold text-dark">Easy Shopping</h3>
                <p className="text-muted">
                  Seamless ordering process with secure checkout and fast shipping.
                </p>
              </FadeIn>
            </Col>
            
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;