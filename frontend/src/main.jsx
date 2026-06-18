import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { applyTheme } from './store/themeStore';

try {
  const raw = localStorage.getItem('intervuex-theme');
  const theme = raw ? JSON.parse(raw)?.state?.theme : 'light';
  applyTheme(theme || 'light');
} catch (_) {
  applyTheme('light');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
