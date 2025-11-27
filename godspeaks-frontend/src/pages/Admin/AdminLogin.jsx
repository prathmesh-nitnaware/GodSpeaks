import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google'; // Import Google Component
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import axios from 'axios'; // Ensure axios is imported for the google call

const AdminLogin = () => {
  const { login, register, isLoading, error: authError, adminInfo } = useAuth();
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (adminInfo) {
      if (adminInfo.role === "admin" || adminInfo.role === "superadmin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [adminInfo, navigate]);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) return setLocalError("Please fill in all fields.");
    if (!isLoginMode && password !== confirmPassword) return setLocalError("Passwords do not match.");
    
    if (isLoginMode) {
      await login(email, password);
    } else {
      await register(email, password);
    }
  };

  // Handle Google Success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
        // Send token to backend
        const { data } = await axios.post('http://localhost:5000/api/auth/google', {
            token: credentialResponse.credential
        });
        // Manually trigger the SUCCESS action in AuthContext (You might need to expose a method or reload)
        // For now, we will simply reload to force state update or use the context method if exposed.
        // A cleaner way is to add a googleLogin method to AuthContext.
        localStorage.setItem('godspeaks_admin', JSON.stringify(data));
        window.location.reload(); 
    } catch (err) {
        setLocalError("Google Login Failed.");
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center bg-light" style={{ minHeight: "80vh" }}>
      <Row>
        <Col md={12}>
          <Card className="shadow-lg border-0" style={{ width: "25rem" }}>
            <Card.Body className="p-4 p-md-5">
              <h2 className="text-center fw-bold fs-3 mb-4">{isLoginMode ? "Login" : "Create Account"}</h2>
              
              {/* GOOGLE LOGIN BUTTON */}
              <div className="d-flex justify-content-center mb-4">
                  <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setLocalError("Google Login Failed")}
                  />
              </div>

              <div className="text-center text-muted mb-3 separator">OR</div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email"><Form.Label>Email address</Form.Label><Form.Control type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Form.Group>
                <Form.Group className="mb-3" controlId="password"><Form.Label>Password</Form.Label><Form.Control type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Form.Group>
                {!isLoginMode && (<Form.Group className="mb-3" controlId="confirm"><Form.Label>Confirm Password</Form.Label><Form.Control type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></Form.Group>)}
                
                {(localError || authError) && <Alert variant="danger" className="py-2 text-center small">{localError || authError}</Alert>}
                
                <Button type="submit" variant="dark" size="lg" className="w-100 fw-semibold mt-3" disabled={isLoading}>{isLoading ? <Spinner size="sm" /> : (isLoginMode ? "Sign In" : "Sign Up")}</Button>
              </Form>
              <div className="text-center mt-4"><Button variant="link" onClick={toggleMode}>{isLoginMode ? "Create Account" : "Login Here"}</Button></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLogin;