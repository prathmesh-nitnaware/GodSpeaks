import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Image, Container, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

// --- CONFIGURATION ---
const isLocal = window.location.hostname === 'localhost';
const API_BASE_URL = isLocal ? 'http://localhost:5000' : 'https://godspeaks.onrender.com';

const ProductForm = () => {
    const { id } = useParams(); 
    const isEditMode = !!id;
    const navigate = useNavigate();
    const { token } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        brand: 'GodSpeaks',
        category: 'Apparel',
        color: '#000000', 
        countInStock: 100,
        stockStatus: 'in-stock',
        preOrderReleaseDate: ''
    });

    const [selectedSizes, setSelectedSizes] = useState(
        SIZES.map(s => ({ size: s, available: true }))
    );

    const [availableColors, setAvailableColors] = useState([]);
    const [newColorHex, setNewColorHex] = useState('#000000');
    const [newColorName, setNewColorName] = useState('');

    const [images, setImages] = useState([]); 
    const [existingImages, setExistingImages] = useState([]); 
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            const fetchProduct = async () => {
                try {
                    // UPDATED: Dynamic URL
                    const { data } = await axios.get(`${API_BASE_URL}/api/products/${id}`);
                    setFormData({
                        name: data.name,
                        price: data.price,
                        description: data.description,
                        brand: data.brand,
                        category: data.category,
                        color: data.color,
                        countInStock: data.countInStock,
                        stockStatus: data.stockStatus || 'in-stock',
                        preOrderReleaseDate: data.preOrderReleaseDate ? data.preOrderReleaseDate.substring(0, 10) : ''
                    });
                    setExistingImages(data.images);
                    
                    if (data.sizes && data.sizes.length > 0) {
                         const mergedSizes = SIZES.map(s => {
                             const found = data.sizes.find(ds => (typeof ds === 'object' ? ds.size : ds) === s);
                             return {
                                 size: s,
                                 available: found ? (found.available !== false) : true 
                             };
                         });
                         setSelectedSizes(mergedSizes);
                    }

                    if (data.availableColors) {
                        setAvailableColors(data.availableColors);
                    }

                } catch (err) {
                    setError("Failed to fetch product data.");
                }
            };
            fetchProduct();
        }
    }, [id, isEditMode]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSizeChange = (sizeName) => {
        setSelectedSizes(prev => prev.map(s => 
            s.size === sizeName ? { ...s, available: !s.available } : s
        ));
    };

    const handleFileChange = (e) => {
        setImages([...e.target.files]);
    };

    const handleAddColor = () => {
        if (!newColorName) return alert("Please enter a color name");
        const newColor = { name: newColorName, hex: newColorHex };
        setAvailableColors([...availableColors, newColor]);
        setNewColorName('');
    };

    const handleRemoveColor = (index) => {
        const updated = [...availableColors];
        updated.splice(index, 1);
        setAvailableColors(updated);
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError(null);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('brand', formData.brand);
        data.append('category', formData.category);
        data.append('color', formData.color); 
        data.append('countInStock', formData.countInStock);
        data.append('stockStatus', formData.stockStatus);
        data.append('preOrderReleaseDate', formData.preOrderReleaseDate);

        data.append('sizes', JSON.stringify(selectedSizes));
        data.append('availableColors', JSON.stringify(availableColors));

        for (let file of images) {
            data.append('images', file);
        }

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        };

        try {
            // UPDATED: Dynamic URL logic
            if (isEditMode) {
                await axios.put(`${API_BASE_URL}/api/products/${id}`, data, config);
            } else {
                await axios.post(`${API_BASE_URL}/api/products`, data, config);
            }
            navigate('/admin/products');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Container>
            <h2 className="my-4 fw-bold">{isEditMode ? 'Edit Product' : 'Create Product'}</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <Form onSubmit={submitHandler} className="p-4 border rounded shadow-sm bg-white">
                
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Product Name</Form.Label>
                            <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Price (₹)</Form.Label>
                            <Form.Control type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleInputChange} />
                </Form.Group>

                <h5 className="mt-4 mb-3 border-bottom pb-2">Color Options</h5>
                <Row className="mb-3 align-items-end">
                    <Col md={4}>
                         <Form.Label className="small fw-bold">Primary Display Color</Form.Label>
                         <div className="d-flex align-items-center gap-2">
                            <Form.Control 
                                type="color" 
                                name="color" 
                                value={formData.color} 
                                onChange={handleInputChange} 
                                title="Choose Primary Color"
                                style={{ width: '50px', padding: 0 }}
                            />
                            <Form.Text className="text-muted">Shown on Shop cards</Form.Text>
                         </div>
                    </Col>
                    
                    <Col md={8}>
                        <Form.Label className="small fw-bold">Add Color Variants</Form.Label>
                        <div className="d-flex gap-2 mb-2">
                             <Form.Control 
                                type="text" 
                                placeholder="Color Name (e.g. Navy Blue)" 
                                value={newColorName}
                                onChange={(e) => setNewColorName(e.target.value)}
                             />
                             <Form.Control 
                                type="color" 
                                value={newColorHex} 
                                onChange={(e) => setNewColorHex(e.target.value)}
                                style={{ width: '50px', padding: 0 }}
                             />
                             <Button variant="outline-primary" onClick={handleAddColor}>Add</Button>
                        </div>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                            {availableColors.map((c, idx) => (
                                <Badge key={idx} bg="light" text="dark" className="border d-flex align-items-center gap-2 p-2">
                                    <span style={{ width: 15, height: 15, backgroundColor: c.hex, borderRadius: '50%', border: '1px solid #ccc' }}></span>
                                    {c.name}
                                    <span className="text-danger cursor-pointer fw-bold" onClick={() => handleRemoveColor(idx)}>&times;</span>
                                </Badge>
                            ))}
                        </div>
                    </Col>
                </Row>

                <h5 className="mt-4 mb-3 border-bottom pb-2">Inventory</h5>
                <Form.Group className="mb-3">
                    <Form.Label>Available Sizes</Form.Label>
                    <div className="d-flex flex-wrap gap-3">
                        {selectedSizes.map((item) => (
                            <Form.Check 
                                key={item.size}
                                type="checkbox"
                                label={item.size}
                                checked={item.available}
                                onChange={() => handleSizeChange(item.size)}
                            />
                        ))}
                    </div>
                </Form.Group>

                <Row>
                     <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Stock Status</Form.Label>
                            <Form.Select name="stockStatus" value={formData.stockStatus} onChange={handleInputChange}>
                                <option value="in-stock">In Stock</option>
                                <option value="out-of-stock">Out of Stock</option>
                                <option value="pre-order">Pre-Order</option>
                            </Form.Select>
                        </Form.Group>
                     </Col>
                     {formData.stockStatus === 'pre-order' && (
                         <Col md={4}>
                             <Form.Group className="mb-3">
                                 <Form.Label>Release Date</Form.Label>
                                 <Form.Control type="date" name="preOrderReleaseDate" value={formData.preOrderReleaseDate} onChange={handleInputChange} />
                             </Form.Group>
                         </Col>
                     )}
                </Row>

                <Form.Group className="mb-4">
                    <Form.Label>Upload Images</Form.Label>
                    <Form.Control type="file" multiple onChange={handleFileChange} />
                    <div className="d-flex flex-wrap gap-2 mt-2">
                        {existingImages.map((img, idx) => (
                             <Image key={idx} src={img} thumbnail style={{ width: 80, height: 80, objectFit: 'cover' }} />
                        ))}
                    </div>
                </Form.Group>

                <Button variant="dark" type="submit" size="lg" disabled={uploading} className="w-100 fw-bold">
                    {uploading ? 'Saving Product...' : (isEditMode ? 'Update Product' : 'Create Product')}
                </Button>
            </Form>
        </Container>
    );
};

export default ProductForm;