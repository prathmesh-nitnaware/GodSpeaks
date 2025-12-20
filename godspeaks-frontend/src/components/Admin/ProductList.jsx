import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col, Image, Spinner, Pagination, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchAllProducts, deleteProductApi } from '../../api/productsApi'; // Ensure delete API is exported

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetches chunk of products based on current page
      const data = await fetchAllProducts({ page });
      setProducts(data.products);
      setPages(data.pages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProductApi(id);
        fetchProducts(); // Refresh list after deletion
      } catch (error) {
        alert(error.message || 'Failed to delete product');
      }
    }
  };

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="fw-bold">Product Inventory</h2>
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/admin/product/create" variant="dark" className="fw-bold shadow-sm">
            + Create New Design
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <Table hover responsive className="shadow-sm bg-white rounded overflow-hidden border">
            <thead className="bg-light">
              <tr>
                <th>Preview</th>
                <th>Name</th>
                <th>Price</th>
                <th>Color</th>
                <th>Sizes</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="align-middle">
                  <td style={{ width: '80px' }}>
                    <Image 
                      src={product.images[0]} 
                      rounded 
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                      className="border shadow-sm"
                    />
                  </td>
                  <td className="fw-semibold text-dark">{product.name}</td>
                  <td>₹{(product.price / 100).toFixed(2)}</td>
                  <td>
                    {/* Visual indicator for the color */}
                    <Badge 
                        bg="light" 
                        className="text-dark border"
                        style={{ borderLeft: `5px solid ${product.color}` }}
                    >
                        {product.color}
                    </Badge>
                  </td>
                  <td>
                    {product.sizes.map(s => (
                        <Badge key={s.size} bg="secondary" className="me-1 small">{s.size}</Badge>
                    ))}
                  </td>
                  <td className="text-center">
                    <Button 
                      as={Link} 
                      to={`/admin/product/${product._id}/edit`} 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2 fw-bold"
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="fw-bold"
                      onClick={() => deleteHandler(product._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination UI */}
          {pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
                {[...Array(pages)].map((_, idx) => (
                  <Pagination.Item 
                    key={idx + 1} 
                    active={idx + 1 === page}
                    onClick={() => setPage(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next disabled={page === pages} onClick={() => setPage(page + 1)} />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductList;