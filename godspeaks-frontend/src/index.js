import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// --- 1. IMPORT BOOTSTRAP CSS (Crucial) ---
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css'; 
import App from './App'; // It might import from './App' or './App.jsx', both work
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();