import React, { useEffect, useState } from 'react';
import { Product, Sale } from '../domain/types';
import { api } from '../services/api';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

export const PointOfSaleView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({ size: 100 });
      setProducts(res.items.filter((p) => p.stock > 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const addToCart = (product: Product) => {
    setErrorMessage(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          setErrorMessage(`No puedes agregar más unidades de ${product.name}. Stock máximo: ${product.stock}.`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setErrorMessage(null);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              setErrorMessage(`No hay suficiente stock disponible de ${item.product.name}.`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const itemsPayload = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const sale = await api.createSale(itemsPayload);
      setCompletedSale(sale);
      setCart([]);
      loadProducts();
    } catch (err: any) {
      setErrorMessage(err.detail || 'Ocurrió un conflicto al procesar la venta.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val);
  };

  return (
    <div className="pos-container">
      <div className="pos-layout">
        {/* Lado izquierdo: Selector de productos */}
        <div className="pos-products-panel">
          <div className="panel-header">
            <h3>Productos Disponibles</h3>
            <span className="subtitle">Selecciona los productos para agregar al carrito</span>
          </div>

          {loading ? (
            <div className="loading-state">Cargando productos...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">No hay productos con existencias para vender.</div>
          ) : (
            <div className="pos-grid">
              {products.map((p) => (
                <div key={p.id} className="pos-item-card" onClick={() => addToCart(p)}>
                  <div className="pos-item-header">
                    <strong>{p.name}</strong>
                    <span className="category-pill">{p.categoryName || 'General'}</span>
                  </div>
                  <div className="pos-item-footer">
                    <span className="price">{formatCOP(p.price)}</span>
                    <span className="stock">{p.stock} disp.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lado derecho: Carrito de ventas */}
        <div className="pos-cart-panel">
          <div className="panel-header">
            <div className="cart-title">
              <ShoppingCart size={20} />
              <h3>Carrito de Ventas</h3>
            </div>
            <span className="badge">{cart.length} líneas</span>
          </div>

          {errorMessage && (
            <div className="alert-error">
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="empty-cart">
              <ShoppingCart size={40} className="empty-icon" />
              <p>El carrito está vacío</p>
              <small>Haz clic en los productos a la izquierda para agregarlos.</small>
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="cart-item-row">
                    <div className="cart-item-details">
                      <strong>{product.name}</strong>
                      <span className="unit-price">{formatCOP(product.price)} c/u</span>
                    </div>

                    <div className="cart-qty-controls">
                      <button onClick={() => updateQuantity(product.id, -1)} className="btn-qty">
                        <Minus size={14} />
                      </button>
                      <span className="qty-val">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, 1)} className="btn-qty">
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="cart-item-subtotal">
                      <span>{formatCOP(product.price * quantity)}</span>
                    </div>

                    <button onClick={() => removeFromCart(product.id)} className="btn-trash">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-row total">
                  <span>Total a Pagar</span>
                  <strong>{formatCOP(calculateTotal())}</strong>
                </div>

                <button
                  className="btn-checkout"
                  onClick={handleCheckout}
                  disabled={submitting}
                >
                  {submitting ? 'Confirmando venta...' : 'Confirmar Venta y Descontar Stock'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmación de venta exitosa */}
      {completedSale && (
        <div className="modal-overlay">
          <div className="modal-card receipt-card">
            <div className="receipt-header">
              <CheckCircle2 size={48} className="success-icon" />
              <h3>¡Venta Registrada Exitosamente!</h3>
              <p className="sale-id">ID: {completedSale.id}</p>
              <small>Fecha: {new Date(completedSale.soldAt).toLocaleString('es-CO')}</small>
            </div>

            <div className="receipt-body">
              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {completedSale.items.map((it, idx) => (
                    <tr key={idx}>
                      <td>{it.productName}</td>
                      <td>{it.quantity}</td>
                      <td>{formatCOP(it.unitPrice)}</td>
                      <td>{formatCOP(it.subtotal || it.unitPrice * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="receipt-total">
                <span>Total Registrado:</span>
                <strong>{formatCOP(completedSale.total)}</strong>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setCompletedSale(null)}>
                Aceptar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
