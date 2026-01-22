import { useState } from 'react';
import type { BecknItem } from '@ondc-sdk/shared';
import { CARD, DRAMS, BUTTON, SPACING, TYPOGRAPHY } from '@drams-design/components';

export interface InventoryTableProps {
  items: BecknItem[];
  onEdit: (item: BecknItem) => void;
  onDelete: (itemId: string) => void;
}

const TABLE_CONTAINER_STYLE = {
  ...CARD.base,
  overflowX: 'auto' as const,
};

const TABLE_STYLE = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  background: 'white',
};

const HEADER_ROW_STYLE = {
  borderBottom: `1px solid ${DRAMS.grayTrack}`,
  background: DRAMS.grayTrack,
};

const HEADER_STYLE = {
  textAlign: 'left' as const,
  ...TYPOGRAPHY.label,
  padding: SPACING.md,
  color: DRAMS.textDark,
};

const ROW_STYLE = {
  borderBottom: `1px solid ${DRAMS.grayTrack}`,
  transition: 'transform 0.2s, box-shadow 0.2s',
};

const ROW_HOVER_STYLE = {
  backgroundColor: DRAMS.grayHover,
};

const CELL_STYLE = {
  padding: SPACING.md,
  ...TYPOGRAPHY.body,
};

export function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps): JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div style={TABLE_CONTAINER_STYLE}>
      <table style={TABLE_STYLE}>
        <thead style={HEADER_ROW_STYLE}>
          <tr>
            <th style={HEADER_STYLE}>Product</th>
            <th style={HEADER_STYLE}>Price</th>
            <th style={HEADER_STYLE}>Category</th>
            <th style={HEADER_STYLE}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              style={{ ...ROW_STYLE, ...(selectedId === item.id ? ROW_HOVER_STYLE : {}) }}
              onMouseEnter={() => setSelectedId(item.id)}
              onMouseLeave={() => setSelectedId(null)}
            >
              <td style={CELL_STYLE}>{item.descriptor?.name || 'Unknown'}</td>
              <td style={CELL_STYLE}>
                {item.price?.value || 0} {item.price?.currency || 'INR'}
              </td>
              <td style={CELL_STYLE}>{item.category_id || '-'}</td>
              <td style={{ ...CELL_STYLE, display: 'flex', gap: SPACING.sm }}>
                <button
                  onClick={() => onEdit(item)}
                  style={{ ...BUTTON.secondary, padding: `${SPACING.sm} ${SPACING.lg}` }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  style={{ ...BUTTON.danger, padding: `${SPACING.sm} ${SPACING.lg}` }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
