import React, { useState, useEffect } from 'react';
import { fetchAllProductsAdmin, deleteProductApi } from '../../api/adminApi';
import ProductForm from '../../components/Admin/ProductForm';
// --- 1. IMPORT BOOTSTRAP COMPONENTS ---
import { Container, Row, Col, Card, Table, Button, Spinner, Alert } from 'react-bootstrap';

// --- Placeholder Spinner ---
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
  </div>
);
// -----------------------------

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- DATA FETCHING ---
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllProductsAdmin();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // Fetch on component mount

  // --- HANDLERS ---
  const handleProductCreated = (newProduct) => {
    // Add the new product to the top of the list
    setProducts([newProduct, ...products]);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProductApi(productId);
        // Filter out the deleted product
        setProducts(products.filter(p => p._id !== productId));
      } catch (err) {
        setError(err.message || 'Failed to delete product');
      }
    }
  };

  return (
    // --- 2. USE BOOTSTRAP LAYOUT ---
    <Container className="py-5">
      <h1 className="display-5 fw-bold text-dark mb-5">
        Product Management
      </h1>

      {/* 'gy-5' adds vertical gap on mobile */}
      <Row className="gy-5">
        
        {/* --- 1. Product Form (Create) --- */}
        <Col lg={5}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4 p-md-5">
              <Card.Title as="h3" className="fw-bold fs-4 mb-4">Add New Product</Card.Title>
              <ProductForm onProductCreated={handleProductCreated} />
            </Card.Body>
          </Card>
        </Col>

        {/* --- 2. Product List --- */}
        <Col lg={7}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4 p-md-5">
              <Card.Title as="h3" className="fw-bold fs-4 mb-4">Existing Products</Card.Title>
              
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                // 'responsive' makes the table scroll horizontally on small screens
                <Table striped bordered hover responsive>
                  <thead className="table-dark">
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id}>
                        <td className="fw-medium">{product.name}</td>
                        <td>₹{(product.price / 100).toFixed(2)}</td>
                        <td className="text-center">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            // TODO: Add edit functionality
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(product._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductManagement;