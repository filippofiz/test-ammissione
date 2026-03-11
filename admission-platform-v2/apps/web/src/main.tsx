import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/config';
import './index.css';
import 'katex/dist/katex.min.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
