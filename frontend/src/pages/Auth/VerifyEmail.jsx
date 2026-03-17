import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Alert, Spinner } from 'react-bootstrap';

// Update 

const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://godspeaks.onrender.com';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/api/auth/verify-email/${token}`
        );

        setStatus('success');
        setMessage(data.message || 'Email verified successfully');

        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
            'Invalid or expired verification link'
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <Container className="py-5 text-center">
      {status === 'loading' && (
        <>
          <Spinner animation="border" />
          <p className="mt-3">Verifying your email…</p>
        </>
      )}

      {status === 'success' && (
        <Alert variant="success">
          <h4>Email Verified 🎉</h4>
          <p>{message}</p>
          <p>You will be redirected to login shortly.</p>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="danger">
          <h4>Verification Failed ❌</h4>
          <p>{message}</p>
        </Alert>
      )}
    </Container>
  );
};

export default VerifyEmail;
