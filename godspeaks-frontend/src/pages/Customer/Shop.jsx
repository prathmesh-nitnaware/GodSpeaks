import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Form, InputGroup, Button } from 'react-bootstrap';
import ProductCard from '../../components/Products/ProductCard';
import ProductFilter from '../../components/Products/ProductFilter';
import { fetchAllProducts } from '../../api/productsApi';
import { motion } from 'framer-motion';

// --- Icons ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel" viewBox="0 0 16 16"><path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z"/></svg>;

// --- Spinner ---
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
  </div>
);

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Filter State
  const [filters, setFilters] = useState({
    search: '',
    category: [],
    maxPrice: 5000,
  });

  // --- Data Fetching ---
  useEffect(() => {
    const getProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Pass filters to the API function
        const data = await fetchAllProducts(filters);
        setProducts(data);
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search slightly to avoid too many calls while typing
    const timer = setTimeout(() => {
      getProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]); // Re-run whenever filters change

  // --- Handlers ---
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (e) => {
    handleFilterChange('search', e.target.value);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: [],
      maxPrice: 5000,
    });
  };

  return (
    <Container className="py-5">
      
      {/* --- Page Header --- */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark">
          Shop All Designs
        </h1>
        <p className="fs-5 text-muted mt-2">
          Find the perfect apparel to express your faith.
        </p>
      </div>

      {/* --- Search Bar & Mobile Filter Toggle --- */}
      <Row className="justify-content-center mb-5">
        <Col md={8} lg={6}>
          <InputGroup size="lg" className="shadow-sm">
            <InputGroup.Text className="bg-white border-end-0">
              <SearchIcon />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search for t-shirts, verses..."
              aria-label="Search"
              className="border-start-0 border-end-0"
              value={filters.search}
              onChange={handleSearchChange}
            />
            <Button 
              variant="outline-secondary" 
              className="d-lg-none border-start-0"
              onClick={() => setShowMobileFilter(!showMobileFilter)}
            >
              <FilterIcon /> Filters
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {/* --- Main Content: Filter + Grid --- */}
      <Row>
        
        {/* 1. Filter Sidebar */}
        <Col lg={3} className={`mb-4 ${showMobileFilter ? 'd-block' : 'd-none d-lg-block'}`}>
          <ProductFilter 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onClearFilters={clearFilters}
          />
        </Col>

        {/* 2. Product Grid */}
        <Col lg={9}>
          <main>
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="alert alert-danger text-center py-4">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-5">
                <h3 className="text-muted">No products found.</h3>
                <p className="text-muted">Try adjusting your filters or search query.</p>
                <Button variant="link" onClick={clearFilters}>Clear all filters</Button>
              </div>
            ) : (
              // Animation Wrapper for smooth transitions
              <motion.div layout>
                <Row xs={1} sm={2} md={3} className="g-4">
                  {products.map((product) => (
                    <Col key={product._id}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>
              </motion.div>
            )}
          </main>
        </Col>

      </Row>
    </Container>
  );
};

export default Shop;