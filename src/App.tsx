import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { DRAMS, NAV, SPACING, TYPOGRAPHY, TRANSITIONS } from '@drams-design/components';
import { RollingSearch } from '@drams-design/components';
import { DashboardPage } from './pages/DashboardPage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductEditPage } from './pages/ProductEditPage';
import { AgentChatPage } from './pages/AgentChatPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { ConfigPage } from './pages/ConfigPage';
import { useAuth } from './hooks/useAuth';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// DRAMS: Clean white background, minimal chrome
const APP_CONTAINER_STYLE = {
  width: '100%',
  minHeight: '100vh',
  backgroundColor: '#ffffff',
  fontFamily: DRAMS.fontFamily,
  display: 'flex',
  flexDirection: 'column' as const,
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

// DRAMS: Navigation link with built-in hover states using CSS
const NAV_LINK_CLASS = 'drams-nav-link';

// Inject CSS for nav link hover states
const NAV_STYLES = `
  .${NAV_LINK_CLASS} {
    padding: ${SPACING.sm} ${SPACING.lg};
    border-radius: 48px;
    text-decoration: none;
    color: ${DRAMS.textDark};
    ${TYPOGRAPHY.body}
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .${NAV_LINK_CLASS}:hover:not(.${NAV_LINK_CLASS}-active) {
    background: ${DRAMS.grayTrack};
  }
  .${NAV_LINK_CLASS}-active {
    background: ${DRAMS.orange};
    color: white;
  }
`;

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActivePath = (path: string): boolean => {
    if (path === '/' || path === '/dashboard')
      return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleSearch = (query: string) => {
    navigate(`/catalog?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <style>{NAV_STYLES}</style>
      <div style={APP_CONTAINER_STYLE}>
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
                  className={`${NAV_LINK_CLASS} ${isActivePath(path) ? `${NAV_LINK_CLASS}-active` : ''}`}
                >
                  {label}
                </Link>
              ))}
              <RollingSearch onSearch={handleSearch} />

              {/* Auth section with wallet connection */}
              <WalletMultiButton
                style={{
                  backgroundColor: DRAMS.orange,
                  borderRadius: '48px',
                  ...TYPOGRAPHY.bodySmall,
                }}
              />
            </nav>
          </div>
        </header>
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/new" element={<ProductEditPage />} />
            <Route path="/catalog/:id" element={<ProductEditPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/agent" element={<AgentChatPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
