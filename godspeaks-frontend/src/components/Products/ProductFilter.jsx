import React from 'react';
import { Card, Form, Button } from 'react-bootstrap';

const ProductFilter = ({ filters, onFilterChange, onClearFilters }) => {
  const categories = ['Faith', 'Scripture', 'Minimalist', 'Inspirational'];
  // --- UPDATED SIZES FOR POD ---
  const sizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

  const handleCheckboxChange = (groupKey, value) => {
    const currentValues = filters[groupKey] || [];
    let newValues;

    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    onFilterChange(groupKey, newValues);
  };

  const handlePriceChange = (e) => {
    onFilterChange('maxPrice', parseInt(e.target.value));
  };

  return (
    <Card className="shadow-sm border-0 sticky-top" style={{ top: '6rem', zIndex: 100 }}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Card.Title as="h3" className="fw-bold fs-5 mb-0">
            Filters
          </Card.Title>
          <Button 
            variant="link" 
            className="text-decoration-none p-0 text-muted small"
            onClick={onClearFilters}
          >
            Reset
          </Button>
        </div>

        <Form>
          {/* --- Category Filter --- */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold fs-6 mb-2">Category</Form.Label>
            {categories.map((category) => (
              <Form.Check 
                key={category}
                type="checkbox"
                id={`category-${category}`}
                label={category}
                className="mb-1"
                checked={filters.category?.includes(category) || false}
                onChange={() => handleCheckboxChange('category', category)}
              />
            ))}
          </Form.Group>

          {/* --- Size Filter --- */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold fs-6 mb-2">Size</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {sizes.map((size) => (
                <Form.Check 
                  key={size}
                  type="checkbox"
                  id={`size-${size}`}
                  label={size}
                  inline
                  className="mb-1 me-2"
                  checked={filters.size?.includes(size) || false}
                  onChange={() => handleCheckboxChange('size', size)}
                />
              ))}
            </div>
          </Form.Group>

          {/* --- Price Range Filter --- */}
          <Form.Group>
            <Form.Label className="fw-semibold fs-6 mb-2 d-flex justify-content-between">
              <span>Max Price</span>
              <span className="text-primary">₹{filters.maxPrice}</span>
            </Form.Label>
            <Form.Range 
              min="500"
              max="5000"
              step="100"
              value={filters.maxPrice || 5000}
              onChange={handlePriceChange}
            />
            <div className="d-flex justify-content-between text-muted small mt-1">
              <span>₹500</span>
              <span>₹5000</span>
            </div>
          </Form.Group>

          {/* --- Clear Filters Button --- */}
          <Button 
            variant="outline-secondary" 
            className="w-100 mt-4"
            onClick={onClearFilters}
          >
            Clear All Filters
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ProductFilter;