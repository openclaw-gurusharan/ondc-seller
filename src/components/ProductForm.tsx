import { useState } from 'react';
import type { BecknItem } from '@ondc-sdk/shared';
import { SPACING, TYPOGRAPHY, DRAMS, disabled } from '@drams-design/components';
import { DramsInput, DramsDropdown, DramsButton } from '@drams-design/components';

export interface ProductFormData {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  categoryId: string;
}

export interface ProductFormProps {
  product?: BecknItem;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: 'cat-1', label: 'Grocery' },
  { value: 'cat-2', label: 'Restaurant' },
  { value: 'cat-3', label: 'Fashion' },
  { value: 'cat-4', label: 'Electronics' },
] as const;

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
] as const;

const FORM_STYLE = {
  maxWidth: '600px',
};

const CONTAINER_STYLE = {
  marginBottom: SPACING.md,
};

const LABEL_STYLE = {
  ...TYPOGRAPHY.label,
  display: 'block',
  marginBottom: SPACING.xs,
  color: DRAMS.textDark,
};

const BUTTON_CONTAINER_STYLE = {
  display: 'flex',
  gap: SPACING.md,
  marginTop: SPACING.xl,
};

const HELPER_TEXT_STYLE = {
  ...TYPOGRAPHY.bodySmall,
  color: DRAMS.textLight,
  marginTop: SPACING.xs,
  marginBottom: '0',
};

const REQUIRED_STYLE = { color: '#dc2626' };

export function ProductForm({ product, onSubmit, onCancel, loading }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    id: product?.id || `item-${Date.now()}`,
    name: product?.descriptor?.name || '',
    description: product?.descriptor?.short_desc || '',
    price: product?.price?.value || '',
    currency: product?.price?.currency || 'INR',
    categoryId: product?.category_id || 'cat-1',
  });

  const handleInputChange = (field: keyof ProductFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={FORM_STYLE}>
      <div style={CONTAINER_STYLE}>
        <label htmlFor="product-id" style={LABEL_STYLE}>
          Product ID
        </label>
        <DramsInput
          id="product-id"
          type="text"
          value={formData.id}
          onChange={handleInputChange('id')}
          disabled={!!product}
          required
          style={product ? (disabled as React.CSSProperties) : undefined}
        />
        {product && (
          <p style={HELPER_TEXT_STYLE}>
            Product ID cannot be changed after creation
          </p>
        )}
      </div>

      <div style={CONTAINER_STYLE}>
        <label htmlFor="product-name" style={LABEL_STYLE}>
          Product Name <span style={REQUIRED_STYLE}>*</span>
        </label>
        <DramsInput
          id="product-name"
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          required
          placeholder="e.g., Organic Mango"
        />
      </div>

      <div style={CONTAINER_STYLE}>
        <label htmlFor="product-description" style={LABEL_STYLE}>
          Description
        </label>
        <DramsInput
          id="product-description"
          type="text"
          value={formData.description}
          onChange={handleInputChange('description')}
          placeholder="Short product description"
          style={{ minHeight: '80px' } as React.CSSProperties}
        />
      </div>

      <div style={CONTAINER_STYLE}>
        <label htmlFor="product-category" style={LABEL_STYLE}>
          Category
        </label>
        <DramsDropdown
          id="product-category"
          options={CATEGORY_OPTIONS}
          value={formData.categoryId}
          onChange={(value) => setFormData({ ...formData, categoryId: value })}
        />
      </div>

      <div style={CONTAINER_STYLE}>
        <label htmlFor="product-price" style={LABEL_STYLE}>
          Price <span style={REQUIRED_STYLE}>*</span>
        </label>
        <div style={{ display: 'flex', gap: SPACING.md }}>
          <div style={{ flex: 1 }}>
            <DramsInput
              id="product-price"
              type="number"
              value={formData.price}
              onChange={handleInputChange('price')}
              required
              min="0"
              step="0.01"
              placeholder="100"
                />
          </div>
          <DramsDropdown
            value={formData.currency}
            onChange={(value) => setFormData({ ...formData, currency: value })}
            options={CURRENCY_OPTIONS}
            style={{ width: '120px' } as React.CSSProperties}
          />
        </div>
      </div>

      <div style={BUTTON_CONTAINER_STYLE}>
        <DramsButton type="submit" loading={loading} variant="primary">
          {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </DramsButton>
        <DramsButton
          type="button"
          onClick={onCancel}
          disabled={loading}
          variant="gray"
        >
          Cancel
        </DramsButton>
      </div>
    </form>
  );
}
