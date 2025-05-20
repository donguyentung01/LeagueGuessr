import React from 'react';
import ReactDOM from 'react-dom/client'; // Correct import for React 18
import App from './App';
import 'nes.css/css/nes.min.css';

const root = ReactDOM.createRoot(document.getElementById('root')); // React 18 uses createRoot
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
