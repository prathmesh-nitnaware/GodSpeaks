import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// --- 1. IMPORT BOOTSTRAP COMPONENTS ---
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";

const AdminLogin = () => {
  const { login, register, isLoading, error: authError, adminInfo } = useAuth();
  const navigate = useNavigate();

  // Toggle state: True = Login Mode, False = Register Mode
  const [isLoginMode, setIsLoginMode] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Only for registration
  const [localError, setLocalError] = useState(null);

  // --- REDIRECT LOGIC BASED ON ROLE ---
  useEffect(() => {
    if (adminInfo) {
      // Check the role attached to the user object
      if (adminInfo.role === "admin" || adminInfo.role === "superadmin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/"); // Customers are sent to the shop
      }
    }
  }, [adminInfo, navigate]);

  // Reset inputs when switching modes
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setLocalError(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // 1. Validation
    if (!email || !password) {
      setLocalError("Please fill in all fields.");
      return;
    }

    if (!isLoginMode) {
      if (password !== confirmPassword) {
        setLocalError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setLocalError("Password must be at least 6 characters.");
        return;
      }
    }

    // 2. API Call
    // We don't need to manually navigate here; the useEffect above
    // will detect the change in 'adminInfo' and redirect accordingly.
    if (isLoginMode) {
      await login(email, password);
    } else {
      await register(email, password);
    }
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center bg-light"
      style={{ minHeight: "80vh" }}
    >
      <Row>
        <Col md={12}>
          <Card className="shadow-lg border-0" style={{ width: "25rem" }}>
            <Card.Body className="p-4 p-md-5">
              <h2 className="text-center fw-bold fs-3 mb-4">
                {isLoginMode ? "Login" : "Create Account"}
              </h2>

              <Form onSubmit={handleSubmit}>
                {/* Email Input */}
                <Form.Group className="mb-3" controlId="email-address">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    size="lg"
                  />
                </Form.Group>

                {/* Password Input */}
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    size="lg"
                  />
                </Form.Group>

                {/* Confirm Password (Only for Register) */}
                {!isLoginMode && (
                  <Form.Group className="mb-3" controlId="confirm-password">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      size="lg"
                    />
                  </Form.Group>
                )}

                {/* Error Display */}
                {(localError || authError) && (
                  <Alert variant="danger" className="py-2 text-center small">
                    {localError || authError}
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="dark"
                  size="lg"
                  className="w-100 fw-semibold mt-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : isLoginMode ? (
                    "Sign In"
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </Form>

              {/* Toggle Mode Link */}
              <div className="text-center mt-4">
                <p className="text-muted small mb-0">
                  {isLoginMode
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </p>
                <Button
                  variant="link"
                  className="fw-bold text-decoration-none p-0"
                  onClick={toggleMode}
                >
                  {isLoginMode ? "Create Account" : "Login Here"}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLogin;
