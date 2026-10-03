import React, { useState } from 'react';
import { Category, Product } from '../domain/types';
import { api } from '../services/api';
import { X, Upload } from 'lucide-react';

interface ProductModalProps {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, categories, onClose, onSaved }) => {
  const isEditing = !!product;
  const [name, setName] = useState(product?.name || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || (categories[0]?.id || ''));
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '0');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const numPrice = parseFloat(price);
    const numStock = parseInt(stock, 10);

    if (numPrice <= 0) {
      setError('El precio debe ser mayor que cero.');
      setSaving(false);
      return;
    }

    if (!isEditing && numStock < 0) {
      setError('El stock inicial no puede ser negativo.');
      setSaving(false);
      return;
    }

    try {
      let productId = product?.id;

      if (isEditing && productId) {
        await api.updateProduct(productId, {
          name,
          categoryId,
          price: numPrice,
        });
      } else {
        const res = await api.createProduct({
          name,
          categoryId,
          price: numPrice,
          stock: numStock,
        });
        productId = res.id;
      }

      if (imageFile && productId) {
        await api.uploadProductImage(productId, imageFile);
      }

      onSaved();
    } catch (err: any) {
      setError(err.detail || 'Ocurrió un error al guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nombre del Producto</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Taladro Percutor 650W"
            />
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio (COP)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {!isEditing && (
              <div className="form-group">
                <label>Stock Inicial</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Fotografía del Producto (opcional)</label>
            <div className="file-input-wrapper">
              <Upload size={18} />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
            {imageFile && <span className="file-name">{imageFile.name}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Producto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
