import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Form, InputGroup, Button, Card, Pagination } from "react-bootstrap";
import ProductCard from "../../components/Products/ProductCard";
import ProductFilter from "../../components/Products/ProductFilter";
import { fetchAllProducts } from "../../api/productsApi";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
  </svg>
);
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel" viewBox="0 0 16 16">
    <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <Spinner animation="border" variant="primary" style={{ width: "4rem", height: "4rem" }} />
  </div>
);

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  // Pagination State
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    category: [],
    size: [],
    maxPrice: 5000,
    sort: "newest",
    minRating: 0,
    page: 1, // Default page
  });

  useEffect(() => {
    const getProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // data contains: { products, page, pages, total }
        const data = await fetchAllProducts(filters);
        
        if (data.products) {
            setProducts(data.products);
            setPages(data.pages);
            setTotalProducts(data.total);
        } else {
            // Fallback if API structure mismatches
            setProducts(data); 
        }
      } catch (err) {
        setError("Failed to fetch products. Ensure backend is running.");
      } finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(() => { getProducts(); }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilterChange = (key, value) => { 
      // Reset to page 1 when filtering changes (except when key IS 'page')
      if (key !== 'page') {
          setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
      } else {
          setFilters((prev) => ({ ...prev, [key]: value }));
      }
  };
  
  const handleSearchChange = (e) => { handleFilterChange("search", e.target.value); };
  const clearFilters = () => { setFilters({ search: "", category: [], size: [], maxPrice: 5000, sort: "newest", minRating: 0, page: 1 }); };

  return (
    <Container className="py-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold">Shop Designs</h1>
        <p className="text-muted">Browse our collection or create your own masterpiece.</p>
      </div>

      <Row className="justify-content-center mb-5">
        <Col md={8} lg={6}>
          <InputGroup size="lg" className="shadow-sm">
            <InputGroup.Text className="bg-white border-end-0"><SearchIcon /></InputGroup.Text>
            <Form.Control placeholder="Search..." value={filters.search} onChange={handleSearchChange} className="border-start-0 border-end-0" />
            <Button variant="outline-secondary" className="d-lg-none border-start-0" onClick={() => setShowMobileFilter(!showMobileFilter)}>
              <FilterIcon /> Filters
            </Button>
          </InputGroup>
        </Col>
      </Row>

      <Row>
        <Col lg={3} className={`mb-4 ${showMobileFilter ? "d-block" : "d-none d-lg-block"}`}>
          <ProductFilter filters={filters} onFilterChange={handleFilterChange} onClearFilters={clearFilters} />
          
          <Card className="mt-4 border-0 shadow-sm bg-dark text-white text-center">
            <Card.Body>
               <h5 className="fw-bold">Have a unique idea?</h5>
               <p className="small">Upload your own artwork and we'll print it!</p>
               <Button as={Link} to="/custom-print" variant="light" size="sm" className="fw-bold w-100">Design Your Own</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <span className="text-muted">{totalProducts} Products Found</span>
            <div className="d-flex align-items-center">
              <span className="me-2 text-muted small">Sort By:</span>
              <Form.Select size="sm" style={{ width: "150px" }} value={filters.sort} onChange={(e) => handleFilterChange("sort", e.target.value)}>
                <option value="newest">Newest Arrivals</option>
                <option value="top-rated">Top Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="oldest">Oldest</option>
              </Form.Select>
            </div>
          </div>

          <main>
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="alert alert-danger text-center">{error}</div>
            ) : products.length === 0 ? (
              <div className="text-center py-5">
                <h3 className="text-muted">No products found.</h3>
                <p>Can't find what you're looking for?</p>
                <Button as={Link} to="/custom-print" variant="primary" className="mt-2 me-3">Design Your Own</Button>
                <Button variant="link" className="mt-2" onClick={clearFilters}>Clear filters</Button>
              </div>
            ) : (
              <>
                  <motion.div layout>
                    <Row xs={1} sm={2} md={3} className="g-4">
                      {products.map((product) => (<Col key={product._id}><ProductCard product={product} /></Col>))}
                    </Row>
                  </motion.div>

                  {/* --- NEW: PAGINATION UI --- */}
                  {pages > 1 && (
                      <div className="d-flex justify-content-center mt-5">
                          <Pagination>
                              <Pagination.Prev 
                                  disabled={filters.page === 1}
                                  onClick={() => handleFilterChange('page', filters.page - 1)}
                              />
                              {[...Array(pages)].map((_, idx) => (
                                  <Pagination.Item 
                                    key={idx + 1} 
                                    active={idx + 1 === filters.page}
                                    onClick={() => handleFilterChange('page', idx + 1)}
                                  >
                                    {idx + 1}
                                  </Pagination.Item>
                              ))}
                              <Pagination.Next 
                                  disabled={filters.page === pages}
                                  onClick={() => handleFilterChange('page', filters.page + 1)}
                              />
                          </Pagination>
                      </div>
                  )}
              </>
            )}
          </main>
        </Col>
      </Row>
    </Container>
  );
};

export default Shop;