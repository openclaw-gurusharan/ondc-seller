import { useApi } from '../hooks/useApi';
import { PageLayout, PageHeader, CARD, SPACING, TYPOGRAPHY, PILL_BUTTON, DRAMS, GRID } from '@ondc-sdk/shared/design-system';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
}

export function DashboardPage() {
  const { data } = useApi<DashboardStats>('/api/catalog');
  const navigate = useNavigate();
  const itemCount = (data as any)?.['bpp/providers']?.[0]?.items?.length ?? 0;

  return (
    <PageLayout>
      <PageHeader
        title="Seller Dashboard"
        subtitle="Manage your products and track your business performance"
      />
      <div style={{ ...GRID.threeColumns, marginBottom: SPACING['2xl'] }}>
        <div style={{ ...CARD.base, textAlign: 'center' }}>
          <h3 style={{ ...TYPOGRAPHY.h3, color: DRAMS.textDark }}>Total Products</h3>
          <p style={{ fontSize: TYPOGRAPHY.h1.fontSize, margin: `${SPACING.md} 0`, color: DRAMS.textDark }}>
            {itemCount}
          </p>
        </div>
        <div style={{ ...CARD.base, textAlign: 'center' }}>
          <h3 style={{ ...TYPOGRAPHY.h3, color: DRAMS.textDark }}>Active Listings</h3>
          <p style={{ fontSize: TYPOGRAPHY.h1.fontSize, margin: `${SPACING.md} 0`, color: DRAMS.orange }}>
            {itemCount}
          </p>
        </div>
        <div
          style={{
            ...CARD.base,
            textAlign: 'center',
          }}
        >
          <h3 style={{ ...TYPOGRAPHY.h3, color: DRAMS.textDark }}>Pending Orders</h3>
          <p style={{ fontSize: TYPOGRAPHY.h1.fontSize, margin: `${SPACING.md} 0`, color: DRAMS.textDark }}>0</p>
        </div>
      </div>

      <div style={{ marginTop: SPACING['2xl'] }}>
        <h3 style={{ ...TYPOGRAPHY.h3, marginBottom: SPACING.md, color: DRAMS.textDark }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: SPACING.md }}>
          <button onClick={() => navigate('/catalog/new')} style={PILL_BUTTON.orange}>
            Add New Product
          </button>
          <button onClick={() => navigate('/catalog')} style={PILL_BUTTON.gray}>
            Manage Catalog
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
