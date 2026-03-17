import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams(); // Grabs the token from the URL
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return setError('Passwords do not match');

        setLoading(true);
        try {
            await axios.put(`/api/auth/reset-password/${token}`, { password });
            alert('Password reset successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Token expired or invalid');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Card className="p-4 shadow-sm border-0" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center fw-bold mb-4">Set New Password</h2>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100 fw-bold py-2" disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Update Password'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default ResetPassword;