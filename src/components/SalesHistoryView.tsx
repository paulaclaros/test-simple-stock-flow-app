import React, { useEffect, useState } from 'react';
import { Sale } from '../domain/types';
import { api } from '../services/api';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

export const SalesHistoryView: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fechas por defecto: inicio del mes actual hasta fin de mes (ISO con Z explícita)
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const [fromStr, setFromStr] = useState(startOfMonth.toISOString().slice(0, 10));
  const [toStr, setToStr] = useState(endOfMonth.toISOString().slice(0, 10));

  const loadSales = async () => {
    setLoading(true);
    try {
      // D-C3: ISO 8601 con desplazamiento explícito (Z)
      const fromIso = `${fromStr}T00:00:00Z`;
      const toIso = `${toStr}T23:59:59Z`;

      const res = await api.getSales({ from: fromIso, to: toIso, size: 50 });
      setSales(res.items);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val);
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>Historial de Ventas</h2>
          <p className="subtitle">Registro inmutable de transacciones completadas</p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="date-filter-group">
          <label>Desde:</label>
          <input
            type="date"
            value={fromStr}
            onChange={(e) => setFromStr(e.target.value)}
          />
        </div>

        <div className="date-filter-group">
          <label>Hasta:</label>
          <input
            type="date"
            value={toStr}
            onChange={(e) => setToStr(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={loadSales}>
          Consultar Rango
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Cargando transacciones...</div>
      ) : sales.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <p>No se encontraron ventas registradas en el período seleccionado.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Fecha y Hora</th>
                <th>Vendedor</th>
                <th>Líneas</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const isExpanded = expandedId === s.id;
                return (
                  <React.Fragment key={s.id}>
                    <tr onClick={() => toggleExpand(s.id)} style={{ cursor: 'pointer' }}>
                      <td style={{ width: 40 }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                      <td>
                        <strong>{new Date(s.soldAt).toLocaleString('es-CO')}</strong>
                      </td>
                      <td>{s.soldByUsername}</td>
                      <td>{s.items?.length || 0} productos</td>
                      <td className="price-cell">{formatCOP(s.total)}</td>
                    </tr>

                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan={5}>
                          <div className="sale-details-box">
                            <h4>Detalle de la venta ({s.id})</h4>
                            <table className="sub-table">
                              <thead>
                                <tr>
                                  <th>Producto</th>
                                  <th>Categoría</th>
                                  <th>Cantidad</th>
                                  <th>Precio Congelado</th>
                                  <th>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {s.items.map((it, idx) => (
                                  <tr key={idx}>
                                    <td>{it.productName}</td>
                                    <td><span className="category-pill">{it.categoryName}</span></td>
                                    <td>{it.quantity}</td>
                                    <td>{formatCOP(it.unitPrice)}</td>
                                    <td>{formatCOP(it.subtotal || it.unitPrice * it.quantity)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
