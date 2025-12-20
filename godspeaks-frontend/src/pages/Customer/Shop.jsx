import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Spinner, Form, InputGroup, Button, Card, Pagination } from "react-bootstrap";
import ProductCard from "../../components/Products/ProductCard";
import ProductFilter from "../../components/Products/ProductFilter";
import { fetchAllProducts } from "../../api/productApi"; // Ensure correct import path
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';

// Icons
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

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const productGridRef = useRef(null); // Ref for auto-scrolling
  
  // Pagination and Stats
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    category: [],
    size: [],
    maxPrice: 5000,
    sort: "newest",
    minRating: 0,
    page: 1, 
  });

  useEffect(() => {
    const getProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Data contains: { products, page, pages, totalOrders/total }
        const data = await fetchAllProducts(filters);
        
        if (data.products) {
            setProducts(data.products);
            setPages(data.pages);
            setTotalProducts(data.totalOrders || data.products.length);
        } else {
            setProducts(data); 
        }

        // --- NEW: Smooth scroll back to top of grid on page change ---
        if (filters.page > 1 && productGridRef.current) {
            productGridRef.current.scrollIntoView({ behavior: 'smooth' });
        }

      } catch (err) {
        setError("Unable to load designs. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => { getProducts(); }, 400); // Debounce search
    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilterChange = (key, value) => { 
      // Reset to page 1 for any change except pagination itself
      if (key !== 'page') {
          setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
      } else {
          setFilters((prev) => ({ ...prev, [key]: value }));
      }
  };
  
  const handleSearchChange = (e) => { handleFilterChange("search", e.target.value); };
  
  const clearFilters = () => { 
    setFilters({ 
        search: "", category: [], size: [], maxPrice: 5000, 
        sort: "newest", minRating: 0, page: 1 
    }); 
  };

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark">Shop Designs</h1>
        <p className="text-muted fs-5">Premium faith-based apparel, printed just for you.</p>
      </div>

      {/* Search Bar */}
      <Row className="justify-content-center mb-5">
        <Col md={8} lg={6}>
          <InputGroup size="lg" className="shadow-sm border rounded-pill overflow-hidden">
            <InputGroup.Text className="bg-white border-0 ps-4"><SearchIcon /></InputGroup.Text>
            <Form.Control 
                placeholder="Search by design name..." 
                value={filters.search} 
                onChange={handleSearchChange} 
                className="border-0 shadow-none" 
            />
            <Button 
                variant="dark" 
                className="d-lg-none px-4" 
                onClick={() => setShowMobileFilter(!showMobileFilter)}
            >
              <FilterIcon />
            </Button>
          </InputGroup>
        </Col>
      </Row>

      <Row>
        {/* Filter Sidebar */}
        <Col lg={3} className={`mb-4 ${showMobileFilter ? "d-block" : "d-none d-lg-block"}`}>
          <ProductFilter filters={filters} onFilterChange={handleFilterChange} onClearFilters={clearFilters} />
          
          <Card className="mt-4 border-0 shadow-sm bg-primary text-white text-center">
            <Card.Body className="p-4">
               <h5 className="fw-bold mb-3">Custom Request?</h5>
               <p className="small mb-4">Upload your high-res design and we'll handle the rest.</p>
               <Button as={Link} to="/custom-print" variant="light" className="fw-bold w-100 py-2">Design Your Own</Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Product Grid */}
        <Col lg={9} ref={productGridRef}>
          <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <span className="text-muted fw-medium">{totalProducts} Items Found</span>
            <div className="d-flex align-items-center">
              <span className="me-2 text-muted small d-none d-sm-block">Sort:</span>
              <Form.Select 
                size="sm" 
                className="border-0 bg-light fw-bold" 
                style={{ width: "160px", cursor: "pointer" }} 
                value={filters.sort} 
                onChange={(e) => handleFilterChange("sort", e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="top-rated">Top Rated</option>
              </Form.Select>
            </div>
          </div>

          <main>
            {isLoading ? (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="grow" variant="primary" />
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center border-0 shadow-sm">{error}</div>
            ) : products.length === 0 ? (
              <div className="text-center py-5 bg-light rounded border border-dashed">
                <h3 className="text-muted fw-bold">No matches found</h3>
                <p>Try adjusting your filters or search keywords.</p>
                <Button variant="outline-dark" className="mt-2" onClick={clearFilters}>Reset All Filters</Button>
              </div>
            ) : (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  <Row xs={1} sm={2} md={3} className="g-4">
                    {products.map((product) => (
                        <Col key={product._id}>
                            <ProductCard product={product} />
                        </Col>
                    ))}
                  </Row>
                </motion.div>

                {/* Pagination Controls */}
                {pages > 1 && (
                  <div className="d-flex justify-content-center mt-5">
                    <Pagination className="shadow-sm">
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