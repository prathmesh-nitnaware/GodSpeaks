import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/Products/ProductCard';
import { fetchProductById } from '../../api/productsApi'; // Helper to fetch shared products

// --- Icon Definition ---
const HeartBrokenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-heartbreak text-muted" viewBox="0 0 16 16">
    <path d="M8.867 14.41c13.308-9.322 4.79-16.563.064-13.824L7 1.548v10.288l1.867 2.574ZM5.5 0D1.8 0 0 3.2 0 5.5c0 3.122 3.5 8.15 5.5 10.5V0Zm5-1.732V1.9a1 1 0 0 0-1 1v2.5a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V1.9a1 1 0 0 0-1-1H10.5Z"/>
  </svg>
);

const Wishlist = () => {
  const { wishlist, addToWishlist } = useWishlist();
  const [searchParams] = useSearchParams();
  
  const [sharedItems, setSharedItems] = useState([]);
  const [isSharedMode, setIsSharedMode] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // --- 1. Check for Shared Link on Load ---
  useEffect(() => {
    const sharedIds = searchParams.get('share');
    if (sharedIds) {
        setIsSharedMode(true);
        const ids = sharedIds.split(',');
        
        // Fetch product details for these IDs from backend
        const fetchShared = async () => {
            const promises = ids.map(id => fetchProductById(id));
            try {
                // Wait for all product details to load
                const products = await Promise.all(promises);
                // Filter out any null results (in case a product was deleted)
                setSharedItems(products.filter(p => p));
            } catch (e) {
                console.error("Error loading shared wishlist", e);
            }
        };
        fetchShared();
    }
  }, [searchParams]);

  // --- 2. Generate Share Link ---
  const handleShare = () => {
      if (wishlist.length === 0) return;
      
      const ids = wishlist.map(p => p._id).join(',');
      const url = `${window.location.origin}/wishlist?share=${ids}`;
      
      navigator.clipboard.writeText(url).then(() => {
          setShowToast(true);
      });
  };

  // Determine which list to show (My Wishlist vs Shared Wishlist)
  const displayList = isSharedMode ? sharedItems : wishlist;

  return (
    <Container className="py-5 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-5">
          <h1 className="display-5 fw-bold text-dark mb-0">
            {isSharedMode ? "Shared Wishlist" : "My Wishlist"}
          </h1>
          
          {/* Show Share Button only on My Wishlist if it has items */}
          {!isSharedMode && wishlist.length > 0 && (
              <Button variant="outline-primary" onClick={handleShare}>
                  Share List <i className="bi bi-share"></i>
              </Button>
          )}
      </div>

      {isSharedMode && (
          <Alert variant="info" className="mb-4">
              You are viewing a shared wishlist. 
              <Button variant="link" as={Link} to="/wishlist" className="p-0 ms-2 fw-bold">
                  Go to my list &rarr;
              </Button>
          </Alert>
      )}

      {displayList.length === 0 ? (
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="light" className="text-center p-5 shadow-sm">
              <div className="mb-3">
                <HeartBrokenIcon />
              </div>
              <h2 className="mt-2 h3 fw-semibold text-dark">
                {isSharedMode ? "This shared list is empty or invalid." : "Your wishlist is empty"}
              </h2>
              <p className="text-muted fs-5 mt-2">
                {isSharedMode ? "" : "Save items you love here to buy them later."}
              </p>
              <Button as={Link} to="/shop" variant="dark" size="lg" className="mt-4 fw-semibold">
                Explore Products
              </Button>
            </Alert>
          </Col>
        </Row>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {displayList.map((product) => (
            <Col key={product._id}>
              {/* Reuse ProductCard, but in shared mode add explicit Save button */}
              <div className="h-100">
                  <ProductCard product={product} />
                  {isSharedMode && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="w-100 mt-2" 
                        onClick={() => addToWishlist(product)}
                      >
                          Save to My Wishlist
                      </Button>
                  )}
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* Copy Link Success Toast */}
      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1000 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="success">
          <Toast.Header>
            <strong className="me-auto text-dark">GodSpeaks</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Wishlist link copied to clipboard! Share it with friends.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default Wishlist;