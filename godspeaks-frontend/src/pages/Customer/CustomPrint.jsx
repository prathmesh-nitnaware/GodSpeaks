import React, { useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Image,
  Alert,
  Spinner,
  Card,
} from "react-bootstrap";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];
const CUSTOM_PRICE = 99900;

// --- Color Options ---
const COLORS = [
  { name: "White", hex: "#FFFFFF", border: "#e5e5e5" },
  { name: "Black", hex: "#000000", border: "#000000" },
  { name: "Navy", hex: "#000080", border: "#000080" },
  { name: "Red", hex: "#DC143C", border: "#DC143C" },
  { name: "Heather Grey", hex: "#B0B0B0", border: "#B0B0B0" },
  { name: "Royal Blue", hex: "#4169E1", border: "#4169E1" },
];

const CustomPrint = () => {
  const colorInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // --- Enhanced Color Picker State ---
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const { addItemToCart } = useCart();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.type.startsWith("image/")) {
        setError("Please upload a valid image file (JPEG, PNG).");
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError("");
    }
  };

  const handleCustomColorChange = (e) => {
    const hex = e.target.value;
    setSelectedColor({ name: hex, hex: hex, border: hex });
  };

  const handleAddToCart = async () => {
    if (!file) {
      setError("Please upload an image for your design.");
      return;
    }
    if (!size) {
      setError("Please select a T-Shirt size.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      // Uploading high-res file
      const { data } = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const highResPrintUrl = data.url;

      const customProduct = {
        _id: "custom-print-item",
        name: `Custom Design T-Shirt (${selectedColor.name})`,
        price: CUSTOM_PRICE,
        // Using highResUrl for display for now, but separating variables allows
        // you to generate a separate thumbnail later if needed.
        images: [highResPrintUrl], 
        category: "Custom",
        isCustom: true,
        color: selectedColor.name,
      };

      // --- UPDATED: Pass highResPrintUrl as BOTH customPrintUrl (display) AND printFileUrl (print)
      // Arguments: product, size, qty, isCustom, customPrintUrl, printFileUrl
      addItemToCart(customProduct, size, quantity, true, highResPrintUrl, highResPrintUrl);
      
      navigate("/cart");
    } catch (err) {
      console.error(err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // --- Hexagon Styles ---
  const hexagonStyle = {
    width: "45px",
    height: "50px",
    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    border: "none",
  };

  const isCustomSelected = !COLORS.some((c) => c.name === selectedColor.name);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <div className="text-center mb-5">
            <h1 className="fw-bold display-5">Design Your Own</h1>
            <p className="text-muted fs-5">
              Create a unique masterpiece in 3 simple steps.
            </p>
          </div>

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-5">
              {error && <Alert variant="danger">{error}</Alert>}

              {/* STEP 1: UPLOAD */}
              <div className="mb-5">
                <h5 className="fw-bold mb-3 text-primary">1. Upload Artwork</h5>
                <div className="p-4 border rounded bg-light text-center">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mb-2 w-75 mx-auto"
                  />
                  <Form.Text className="text-muted">
                    High-quality PNG with transparent background works best.
                  </Form.Text>
                </div>
              </div>

              {/* PREVIEW AREA */}
              {preview && (
                <div className="mb-5 text-center">
                  <h6 className="fw-bold text-muted text-uppercase small mb-3">
                    Live Preview
                  </h6>
                  <div
                    className="mx-auto position-relative d-inline-block shadow-sm rounded"
                    style={{
                      width: "320px",
                      height: "380px",
                      backgroundColor:
                        selectedColor.hex === "#FFFFFF"
                          ? "#f8f9fa"
                          : selectedColor.hex,
                      borderRadius: "20px",
                      transition: "background-color 0.3s ease",
                    }}
                  >
                    {/* T-Shirt Outline Overlay */}
                    <Image
                      src="https://res.cloudinary.com/dkqtb4wmq/image/upload/v1/godspeaks-assets/blank-tee-outline"
                      alt="T-Shirt Outline"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        opacity: 0.8,
                        position: "relative",
                        zIndex: 1,
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />

                    {/* User Artwork */}
                    <Image
                      src={preview}
                      alt="Preview"
                      style={{
                        position: "absolute",
                        top: "25%",
                        left: "25%",
                        width: "50%",
                        height: "40%",
                        objectFit: "contain",
                        mixBlendMode: "multiply",
                        zIndex: 2,
                      }}
                    />
                  </div>
                  <div className="mt-2 text-muted small">
                    Base Color: <strong>{selectedColor.name}</strong>
                  </div>
                </div>
              )}

              {/* STEP 2: COLOR SELECTION */}
              <div className="mb-5">
                <h5 className="fw-bold mb-3 text-primary">
                  2. Choose Base Color
                </h5>
                <div className="d-flex justify-content-center p-4 border rounded bg-light">
                  <div className="d-flex flex-wrap gap-3 justify-content-center align-items-center">
                    {COLORS.map((c) => (
                      <div
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        title={c.name}
                        className="position-relative"
                        style={{
                          ...hexagonStyle,
                          backgroundColor: c.hex,
                          transform:
                            selectedColor.name === c.name
                              ? "scale(1.25)"
                              : "scale(1)",
                          opacity: selectedColor.name === c.name ? 1 : 0.6,
                          boxShadow:
                            selectedColor.name === c.name
                              ? "0 4px 6px rgba(0,0,0,0.1)"
                              : "none",
                          zIndex: selectedColor.name === c.name ? 2 : 1,
                        }}
                      >
                        {selectedColor.name === c.name && (
                          <div
                            className="position-absolute top-50 start-50 translate-middle text-white"
                            style={{
                              fontSize: "10px",
                              textShadow: "0 0 2px black",
                            }}
                          >
                            ✓
                          </div>
                        )}
                      </div>
                    ))}

                    <div
                      style={{
                        width: "1px",
                        height: "30px",
                        backgroundColor: "#ccc",
                        margin: "0 5px",
                      }}
                    ></div>

                    {/* Custom Picker */}
                    <div
                      title="Custom Color"
                      className="position-relative d-flex justify-content-center align-items-center bg-white"
                      style={{
                        ...hexagonStyle,
                        backgroundColor: isCustomSelected
                          ? selectedColor.hex
                          : "#ffffff",
                        backgroundImage: isCustomSelected
                          ? "none"
                          : "linear-gradient(45deg, #f3f3f3 25%, #ffffff 25%, #ffffff 50%, #f3f3f3 50%, #f3f3f3 75%, #ffffff 75%, #ffffff 100%)",
                        backgroundSize: "10px 10px",
                        transform: isCustomSelected
                          ? "scale(1.25)"
                          : "scale(1)",
                        boxShadow: isCustomSelected
                          ? "0 4px 6px rgba(0,0,0,0.1)"
                          : "none",
                        filter: isCustomSelected
                          ? "none"
                          : "drop-shadow(0 0 1px #999)",
                        zIndex: isCustomSelected ? 2 : 1,
                      }}
                    >
                      <input
                        type="color"
                        ref={colorInputRef}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          opacity: 0,
                          cursor: "pointer",
                        }}
                        onChange={handleCustomColorChange}
                      />
                      {isCustomSelected ? (
                        <div
                          className="position-absolute top-50 start-50 translate-middle text-white"
                          style={{
                            fontSize: "10px",
                            textShadow: "0 0 2px black",
                            pointerEvents: "none",
                          }}
                        >
                          ✓
                        </div>
                      ) : (
                        <span
                          className="text-muted fw-bold"
                          style={{ fontSize: "20px", pointerEvents: "none" }}
                        >
                          +
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: SIZE & QUANTITY */}
              <div className="mb-5">
                <h5 className="fw-bold mb-3 text-primary">
                  3. Select Size & Quantity
                </h5>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {SIZES.map((s) => (
                    <Button
                      key={s}
                      variant={size === s ? "dark" : "outline-secondary"}
                      onClick={() => setSize(s)}
                      className={`px-4 rounded-pill ${
                        size === s ? "fw-bold shadow-sm" : ""
                      }`}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
                <Form.Group className="d-flex align-items-center mt-3">
                  <Form.Label className="me-3 mb-0 fw-semibold">
                    Qty:
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    style={{ width: "80px", textAlign: "center" }}
                  />
                </Form.Group>
              </div>

              <div className="d-grid pt-3 border-top">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={uploading}
                  className="fw-bold py-3 shadow"
                >
                  {uploading ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Creating Your Design...
                    </>
                  ) : (
                    `Add Custom Tee to Cart - ₹${(CUSTOM_PRICE / 100).toFixed(
                      2
                    )}`
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomPrint;