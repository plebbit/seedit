import './polyfills.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import { HashRouter as Router } from 'react-router-dom';
import './lib/init-translations';
import './index.css';
import './themes.css';
import './preload-assets.css';
import { App as CapacitorApp } from '@capacitor/app';
import { registerSW } from 'virtual:pwa-register';

const reloadSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Reload the page to load the new version
    reloadSW(true);
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
);

// add back button in android app
CapacitorApp.addListener('backButton', ({ canGoBack }) => {
  if (canGoBack) {
    window.history.back();
  } else {
    CapacitorApp.exitApp();
  }
});
