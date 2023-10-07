import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './lib/init-translations';
import { HashRouter as Router } from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
);
