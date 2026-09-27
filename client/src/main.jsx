import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import './styles/tokens.css';
import './styles/base.css';

// Use HashRouter automatically when deployed on GitHub Pages or static previews
const isStaticHost =
  window.location.hostname.includes('github.io') ||
  window.location.protocol === 'file:' ||
  import.meta.env.VITE_USE_HASH_ROUTER === 'true';

const Router = isStaticHost ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
