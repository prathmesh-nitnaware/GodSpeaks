import React from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/Products/ProductCard';

// --- Icon Definition ---
const HeartBrokenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-heartbreak text-muted" viewBox="0 0 16 16">
    <path d="M8.867 14.41c13.308-9.322 4.79-16.563.064-13.824L7 1.548v10.288l1.867 2.574ZM5.5 0D1.8 0 0 3.2 0 5.5c0 3.122 3.5 8.15 5.5 10.5V0Zm5-1.732V1.9a1 1 0 0 0-1 1v2.5a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V1.9a1 1 0 0 0-1-1H10.5Z"/>
  </svg>
);

const Wishlist = () => {
  const { wishlist } = useWishlist();

  return (
    <Container className="py-5">
      <h1 className="display-5 fw-bold text-center text-dark mb-5">
        My Wishlist
      </h1>

      {wishlist.length === 0 ? (
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="light" className="text-center p-5 shadow-sm">
              <div className="mb-3">
                {/* --- FIX: Now using the icon component --- */}
                <HeartBrokenIcon />
              </div>
              <h2 className="mt-2 h3 fw-semibold text-dark">
                Your wishlist is empty
              </h2>
              <p className="text-muted fs-5 mt-2">
                Save items you love here to buy them later.
              </p>
              <Button as={Link} to="/shop" variant="dark" size="lg" className="mt-4 fw-semibold">
                Explore Products
              </Button>
            </Alert>
          </Col>
        </Row>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {wishlist.map((product) => (
            <Col key={product._id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Wishlist;