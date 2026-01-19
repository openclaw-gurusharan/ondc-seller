import { useEffect, useCallback, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { InventoryTable } from '../components';
import {
  PageLayout,
  PageHeader,
  DRAMS_CARD,
  PILL_BUTTON,
  CARD,
  SPACING,
  TYPOGRAPHY,
  DRAMS,
  GRID,
} from '@ondc-sdk/shared/design-system';
import type { BecknItem } from '@ondc-sdk/shared';

const LOADING_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: SPACING['3xl'],
  color: DRAMS.textLight,
  fontSize: TYPOGRAPHY.body.fontSize,
};

const ERROR_STYLE: CSSProperties = {
  ...DRAMS_CARD.base,
  padding: SPACING.lg,
  backgroundColor: '#fef2f2',
  border: `1px solid #fecaca`,
  color: '#dc2626',
  fontSize: TYPOGRAPHY.body.fontSize,
};

const CARD_STYLE: CSSProperties = {
  ...DRAMS_CARD.base,
  padding: SPACING.xl,
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'pointer',
};

export function CatalogPage() {
  const navigate = useNavigate();
  const { data, loading, error, execute } = useApi<any>('/api/catalog');

  useEffect(() => {
    execute();
  }, [execute]);

  // Extract items from nested API response structure
  const items = (data as any)?.['bpp/providers']?.[0]?.items ?? [];

  const handleEdit = useCallback(
    (item: BecknItem) => {
      navigate(`/catalog/${item.id}`);
    },
    [navigate]
  );

  const handleAdd = useCallback(() => {
    navigate('/catalog/edit/new');
  }, [navigate]);

  if (error) {
    return (
      <PageLayout>
        <PageHeader title="Product Catalog" subtitle="Manage your product listings and inventory" />
        <div style={ERROR_STYLE}>Error loading catalog: {error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Product Catalog"
        subtitle="Manage your product listings and inventory"
        actions={
          <button onClick={handleAdd} style={PILL_BUTTON.orange}>
            Add New Product
          </button>
        }
      />

      {loading ? (
        <div style={LOADING_STYLE}>Loading catalog...</div>
      ) : items.length === 0 ? (
        <div style={{ ...CARD_STYLE, textAlign: 'center', marginTop: SPACING.lg }}>
          <p style={{ color: DRAMS.textLight, fontSize: TYPOGRAPHY.body.fontSize }}>No products found</p>
        </div>
      ) : (
        <>
          <div style={GRID.autoFill}>
            {items.map((item: BecknItem) => (
              <div
                key={item.id}
                onClick={() => handleEdit(item)}
                style={CARD_STYLE}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {(item as any).images?.[0] ? (
                  <img
                    src={(item as any).images[0].url}
                    alt={item.descriptor?.name ?? (item as any).name}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '16px',
                      marginBottom: SPACING.md,
                      backgroundColor: DRAMS.grayTrack,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '180px',
                      borderRadius: '16px',
                      marginBottom: SPACING.md,
                      backgroundColor: DRAMS.grayTrack,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    📦
                  </div>
                )}
                <h3 style={{ ...TYPOGRAPHY.label, color: DRAMS.textDark, margin: `0 0 ${SPACING.sm} 0` }}>
                  {item.descriptor?.name || 'Unnamed Product'}
                </h3>
                {item.price && (
                  <p style={{ ...TYPOGRAPHY.label, color: DRAMS.orange, margin: `0 0 ${SPACING.md} 0` }}>
                    {item.price.currency} {item.price.value}
                  </p>
                )}
                {item.descriptor?.short_desc && (
                  <p style={{ ...TYPOGRAPHY.body, color: DRAMS.textLight, margin: `0 0 ${SPACING.md} 0`, lineHeight: 1.4 }}>
                    {item.descriptor.short_desc}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: SPACING.xl }}>
            <InventoryTable items={items} onEdit={handleEdit} onDelete={(id) => console.log('Delete', id)} />
          </div>
        </>
      )}
    </PageLayout>
  );
}
