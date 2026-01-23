import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { DRAMS, NAV, SPACING, TRANSITIONS } from '@drams-design/components';
import { DashboardPage } from './pages/DashboardPage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductEditPage } from './pages/ProductEditPage';
import { AgentChatPage } from './pages/AgentChatPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { ConfigPage } from './pages/ConfigPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// DRAMS: Clean white background, minimal chrome
const APP_CONTAINER_STYLE = {
  width: '100%',
  minHeight: '100vh',
  backgroundColor: '#ffffff',
  fontFamily: DRAMS.fontFamily,
};

// DRAMS: Unobtrusive header with soft shadow
const HEADER_STYLE = {
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  padding: '0 80px',
  position: 'sticky' as const,
  top: 0,
  zIndex: 10,
};

const HEADER_CONTENT_STYLE = {
  maxWidth: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '64px',
};

// DRAMS: Bold, clean logo with Sacramento cursive font
const LOGO_STYLE = {
  fontSize: '36px',
  fontFamily: "'Sacramento', cursive",
  color: DRAMS.textDark,
  textDecoration: 'none',
  transition: TRANSITIONS.hover,
  fontWeight: 'normal',
};

const NAV_STYLE = {
  display: 'flex',
  gap: SPACING.sm,
  alignItems: 'center',
};

const USER_SECTION_STYLE = {
  display: 'flex',
  gap: SPACING.sm,
  alignItems: 'center',
};

const WALLET_TEXT_STYLE = {
  fontSize: '12px',
  color: DRAMS.textLight,
};

function Header() {
  const { user } = useAuth();
  const { publicKey } = useWallet();
  const location = useLocation();

  const isActivePath = (path: string): boolean => {
    if (path === '/' || path === '/dashboard')
      return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <header style={HEADER_STYLE}>
      <div style={HEADER_CONTENT_STYLE}>
        <Link to="/" style={LOGO_STYLE}>
          Ondc Seller
        </Link>
        <nav style={NAV_STYLE}>
          {[
            { path: '/catalog', label: 'Catalog' },
            { path: '/orders', label: 'Orders' },
            { path: '/config', label: 'Config' },
            { path: '/agent', label: 'Agent' },
          ].map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              style={{
                ...NAV.link,
                ...(isActivePath(path) ? NAV.linkActive : {}),
              }}
              onMouseEnter={(e) => {
                if (!isActivePath(path)) {
                  Object.assign(e.currentTarget.style, NAV.linkHover);
                }
              }}
              onMouseLeave={(e) => {
                if (!isActivePath(path)) {
                  Object.assign(e.currentTarget.style, {
                    background: 'transparent',
                    color: DRAMS.textDark,
                  });
                }
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div style={USER_SECTION_STYLE}>
          {user && (
            <span style={WALLET_TEXT_STYLE}>
              {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
            </span>
          )}
          <WalletMultiButton
            style={{
              backgroundColor: publicKey ? DRAMS.grayTrack : DRAMS.orange,
              borderRadius: '48px',
              fontSize: '12px',
              padding: '6px 16px',
            }}
          />
        </div>
      </div>
    </header>
  );
}

export function App() {
  return (
    <div style={APP_CONTAINER_STYLE}>
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/new" element={<ProductEditPage />} />
            <Route path="/catalog/:id" element={<ProductEditPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/agent" element={<AgentChatPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
