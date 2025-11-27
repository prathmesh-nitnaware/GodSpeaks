import React, { useState, useEffect } from 'react';
import { fetchAllProductsAdmin, deleteProductApi } from '../../api/adminApi';
import ProductForm from '../../components/Admin/ProductForm';
import { Container, Row, Col, Card, Table, Button, Spinner, Alert, Badge } from 'react-bootstrap';

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
  </div>
);

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

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
  }, []);

  const handleProductSaved = (savedProduct) => {
    if (editingProduct) {
        setProducts(products.map(p => p._id === savedProduct._id ? savedProduct : p));
        setEditingProduct(null); 
    } else {
        setProducts([savedProduct, ...products]);
    }
  };

  const handleEditClick = (product) => {
      setEditingProduct(product);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
      setEditingProduct(null);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProductApi(productId);
        setProducts(products.filter(p => p._id !== productId));
      } catch (err) {
        alert(err.message || 'Failed to delete product');
      }
    }
  };

  return (
    <Container className="py-5">
      <h1 className="display-5 fw-bold text-dark mb-5">
        Product Management
      </h1>

      <Row className="gy-5">
        
        {/* --- 1. Product Form (Create/Edit) --- */}
        <Col lg={5}>
          <Card className="shadow-sm border-0 sticky-top" style={{ top: '2rem' }}>
            <Card.Body className="p-4 p-md-5">
              <Card.Title as="h3" className="fw-bold fs-4 mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
              </Card.Title>
              <ProductForm 
                onProductCreated={handleProductSaved} 
                initialData={editingProduct}
                onCancel={handleCancelEdit}
              />
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
                <Table striped bordered hover responsive>
                  <thead className="table-dark">
                    <tr>
                      <th>Name</th>
                      <th>Sizes (POD)</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id}>
                        <td className="fw-medium text-break" style={{maxWidth: '150px'}}>{product.name}</td>
                        {/* --- NEW: Display Sizes --- */}
                        <td>
                            {product.sizes && product.sizes.length > 0 ? (
                                <div className="d-flex flex-wrap gap-1">
                                    {product.sizes.map(s => (
                                        <Badge key={s} bg="secondary" style={{fontSize: '0.6rem'}}>{s}</Badge>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-muted small">All Sizes</span>
                            )}
                        </td>
                        <td>₹{(product.price / 100).toFixed(2)}</td>
                        <td className="text-center" style={{minWidth: '140px'}}>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleEditClick(product)}
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