import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// (No PUBLIC_URL usage here. If you add any, use process.env.PUBLIC_URL)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
