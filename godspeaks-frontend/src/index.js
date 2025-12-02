import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css'; 
import App from './App';
import reportWebVitals from './reportWebVitals';
// --- 1. Import the Google Provider ---
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* --- 2. Wrap the entire app with the Provider --- */}
    {/* REPLACE "YOUR_GOOGLE_CLIENT_ID" with your actual Client ID from Google Cloud Console */}
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();