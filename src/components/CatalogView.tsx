import React, { useEffect, useState } from 'react';
import { Category, Product } from '../domain/types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProductModal } from './ProductModal';
import { Search, Plus, Edit, Trash2, Package, RefreshCw } from 'lucide-react';

export const CatalogView: React.FC = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error al cargar categorías', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({
        page,
        size: 15,
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
      });
      setProducts(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Error al cargar catálogo', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!window.confirm(`¿Seguro que deseas dar de baja el producto "${name}"?\nDesaparecerá del catálogo pero las ventas históricas se mantendrán intactas.`)) {
      return;
    }

    try {
      await api.deleteProduct(id);
      loadProducts();
    } catch (err: any) {
      alert(err.detail || 'Error al dar de baja el producto.');
    }
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val);
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>Catálogo de Productos</h2>
          <p className="subtitle">Existencias en tiempo real y gestión del inventario</p>
        </div>

        {isAdmin && (
          <button className="btn-primary" onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>
            <Plus size={18} />
            <span>Nuevo Producto</span>
          </button>
        )}
      </div>

      <div className="filters-bar">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-secondary">Buscar</button>
        </form>

        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button className="icon-btn" onClick={loadProducts} title="Recargar">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="catalog-info-bar">
        <span>Mostrando <strong>{products.length}</strong> de <strong>{total}</strong> productos</span>
      </div>

      {loading ? (
        <div className="loading-state">Cargando inventario...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <p>No se encontraron productos disponibles en el catálogo.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio (COP)</th>
                <th>Stock</th>
                {isAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="thumbnail-cell">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="product-thumb" />
                    ) : (
                      <div className="thumb-placeholder"><Package size={20} /></div>
                    )}
                  </td>
                  <td className="product-title-cell">
                    <strong>{p.name}</strong>
                  </td>
                  <td>
                    <span className="category-pill">{p.categoryName || 'General'}</span>
                  </td>
                  <td className="price-cell">
                    {formatCOP(p.price)}
                  </td>
                  <td>
                    <span className={`stock-badge ${p.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {p.stock} unidades
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="actions-cell">
                      <button
                        className="btn-action edit"
                        onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-action delete"
                        onClick={() => handleDeactivate(p.id, p.name)}
                        title="Dar de baja"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="btn-page"
          >
            Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="btn-page"
          >
            Siguiente
          </button>
        </div>
      )}

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => { setIsModalOpen(false); loadProducts(); }}
        />
      )}
    </div>
  );
};
