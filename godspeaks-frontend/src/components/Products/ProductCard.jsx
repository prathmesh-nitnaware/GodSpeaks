import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { motion } from 'framer-motion';

// --- ICONS ---
const StarIcon = () => (<svg className="bi text-warning" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z"/></svg>);
const HeartFill = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#dc3545" className="bi bi-heart-fill" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/></svg>;
const HeartOutline = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-heart" viewBox="0 0 16 16"><path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/></svg>;

const ProductCard = ({ product }) => {
  const { addItemToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);

  // Destructure with robust defaults
  const { 
    _id, 
    name, 
    images = [], 
    price, 
    verse = "Bible Verse", 
    rating = 5, 
    sizes = [] 
  } = product || {};

  // Resolve the primary image or a placeholder
  const mainImage = images && images.length > 0 && typeof images[0] === 'string'
    ? images[0]
    : "/placeholder.jpg"; 

  const priceInRupees = (price / 100).toFixed(2);
  const isSaved = isInWishlist(_id);

  const handleWishlist = (e) => {
    e.preventDefault();
    if (isSaved) removeFromWishlist(_id);
    else addToWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    // Default to the first available size from the backend
    const defaultSize = sizes && sizes.length > 0 ? sizes[0].size : 'S';
    addItemToCart(product, defaultSize, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="h-100 shadow-sm border-0 position-relative overflow-hidden bg-white">
        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
          className="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center"
          style={{ width: '36px', height: '36px', zIndex: 10, padding: 0 }}
        >
          {isSaved ? <HeartFill /> : <HeartOutline />}
        </button>

        <Link to={`/product/${_id}`} className="text-decoration-none">
          {/* IMAGE CONTAINER: Fixed height and ratio */}
          <div style={{ 
            height: '350px', 
            width: '100%', 
            overflow: 'hidden', 
            backgroundColor: '#f8f9fa' 
          }}>
            <Card.Img 
              variant="top" 
              src={mainImage} 
              alt={name} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', // Ensures image fills container without stretching
                objectPosition: 'center' 
              }}
              onError={(e) => { e.target.src = "/placeholder.jpg"; }} 
            />
          </div>
        </Link>
        
        <Card.Body className="d-flex flex-column text-center p-3">
          <Card.Title as="h6" className="fw-bold text-dark mb-1 text-truncate">
            {name}
          </Card.Title>
          <Card.Text className="text-muted small mb-2 text-truncate" style={{ fontSize: '0.85rem' }}>
            {verse}
          </Card.Text>

          {/* Consistent Rating Row */}
          <div className="d-flex justify-content-center mb-2" style={{ gap: '2px' }}>
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={i < Math.round(rating) ? "text-warning" : "text-light"} />
            ))}
          </div>

          <Card.Text className="fs-5 fw-bold text-dark mt-auto mb-3">
            ₹{priceInRupees}
          </Card.Text>

          <Button 
            variant={isAdded ? "success" : "dark"}
            onClick={handleAddToCart}
            disabled={isAdded}
            className="w-100 fw-bold py-2 border-0"
            style={{ borderRadius: '8px', fontSize: '0.9rem' }}
          >
            {isAdded ? 'Added!' : 'Add to Cart'}
          </Button>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default ProductCard;