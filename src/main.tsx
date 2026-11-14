import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {AdminApp} from './admin/AdminApp.tsx';
import {I18nProvider} from './i18n';
import './index.css';

const isAdminRoute = window.location.pathname.replace(/\/+$/, '') === '/admin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>{isAdminRoute ? <AdminApp /> : <App />}</I18nProvider>
  </StrictMode>,
);
