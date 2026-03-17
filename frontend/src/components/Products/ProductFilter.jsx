import React from "react";
import { Card, Form, Button } from "react-bootstrap";

const StarFill = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="#ffc107"
    className="bi bi-star-fill"
    viewBox="0 0 16 16"
  >
    <path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z" />
  </svg>
);

const ProductFilter = ({ filters, onFilterChange, onClearFilters }) => {
  const categories = ["Faith", "Scripture", "Minimalist", "Inspirational"];
  const sizes = ["S", "M", "L", "XL", "XXL", "3XL"];

  const handleCheckboxChange = (groupKey, value) => {
    const currentValues = filters[groupKey] || [];
    let newValues;

    if (currentValues.includes(value)) {
      newValues = currentValues.filter((v) => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    onFilterChange(groupKey, newValues);
  };

  const handlePriceChange = (e) => {
    onFilterChange("maxPrice", parseInt(e.target.value));
  };

  const handleRatingChange = (rating) => {
    // If clicking the same rating, toggle it off (reset to 0), else set new rating
    const newRating = filters.minRating === rating ? 0 : rating;
    onFilterChange("minRating", newRating);
  };

  return (
    <Card
      className="shadow-sm border-0 sticky-top"
      style={{ top: "6rem", zIndex: 100 }}
    >
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
                onChange={() => handleCheckboxChange("category", category)}
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
                  onChange={() => handleCheckboxChange("size", size)}
                />
              ))}
            </div>
          </Form.Group>

          {/* --- Customer Rating (NEW) --- */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold fs-6 mb-2">
              Avg. Customer Review
            </Form.Label>
            {[4, 3, 2].map((star) => (
              <div key={star} className="form-check mb-1">
                <input
                  className="form-check-input"
                  type="radio"
                  name="ratingFilter"
                  id={`rating-${star}`}
                  checked={filters.minRating === star}
                  onChange={() => handleRatingChange(star)}
                  style={{ cursor: "pointer" }}
                />
                <label
                  className="form-check-label d-flex align-items-center"
                  htmlFor={`rating-${star}`}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex me-2">
                    {[...Array(star)].map((_, i) => (
                      <StarFill key={i} />
                    ))}
                  </div>
                  <span className="small text-muted">& Up</span>
                </label>
              </div>
            ))}
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
