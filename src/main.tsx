import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { applyTheme, getStoredTheme } from './lib/theme';
import { registerAppUpdates } from './lib/pwaUpdate';

// Applique le thème mémorisé avant le premier rendu (évite tout « flash »).
applyTheme(getStoredTheme());

registerAppUpdates();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
