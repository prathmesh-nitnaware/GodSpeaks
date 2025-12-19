import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import HeroBanner from '../../components/Common/HeroBanner';
import ProductCard from '../../components/Products/ProductCard';
import FadeIn from '../../components/Common/FadeIn';
import { fetchAllProducts } from '../../api/productsApi'; // Import the API function

// --- ICONS ---
const HeartIcon = () => <svg className="bi" width="32" height="32" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/></svg>;
const StarIcon = () => <svg className="bi" width="32" height="32" fill="currentColor" viewBox="0 0 16 16"><path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z"/></svg>;
const CartIcon = () => <svg className="bi" width="32" height="32" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>;

const Home = () => {
  // --- STATE FOR REAL DATA ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- FETCH PRODUCTS ON LOAD ---
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchAllProducts();
        // The backend returns { products: [...], page, pages }
        // We grab the array and take the first 4-8 items for the homepage
        setProducts(data.products || []);
      } catch (err) {
        console.error("Failed to load products", err);
        setError("Could not load products. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <div>
      <HeroBanner />

      <Container as="section" className="py-5">
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

        {/* --- DYNAMIC CONTENT AREA --- */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="dark" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center mt-4">
            {error}
          </Alert>
        ) : (
          <Row xs={1} sm={2} md={4} className="g-4 mt-4">
            {/* Show only first 4 items if you want a concise homepage */}
            {products.slice(0, 4).map((product, index) => (
              <Col key={product._id}>
                <FadeIn delay={index * 0.1}>
                  <ProductCard product={product} />
                </FadeIn>
              </Col>
            ))}
            
            {/* Fallback if no products exist yet */}
            {products.length === 0 && (
                <Col xs={12} className="text-center text-muted py-5">
                    <h4>No designs available yet.</h4>
                    <p>Check back soon!</p>
                </Col>
            )}
          </Row>
        )}

        <FadeIn>
          <div className="text-center mt-5">
            <Button as={Link} to="/shop" variant="outline-dark" size="lg">
              View All Designs &rarr;
            </Button>
          </div>
        </FadeIn>
      </Container>

      {/* --- FEATURES SECTION (UNCHANGED) --- */}
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