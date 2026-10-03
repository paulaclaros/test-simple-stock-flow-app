import React, { useEffect, useState } from 'react';
import { SalesReport } from '../domain/types';
import { api } from '../services/api';
import { BarChart3, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const [fromStr, setFromStr] = useState(startOfMonth.toISOString().slice(0, 10));
  const [toStr, setToStr] = useState(endOfMonth.toISOString().slice(0, 10));

  const loadReport = async () => {
    setLoading(true);
    setError(null);

    try {
      // D-C3: ISO 8601 con desplazamiento explícito (Z)
      const fromIso = `${fromStr}T00:00:00Z`;
      const toIso = `${toStr}T23:59:59Z`;

      const data = await api.getSalesReport(fromIso, toIso);
      setReport(data);
    } catch (err: any) {
      setError(err.detail || 'Ocurrió un error al generar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val);
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>Reporte de Ventas por Período</h2>
          <p className="subtitle">
            Agregación histórica inmutable calculada en el motor de base de datos
          </p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="date-filter-group">
          <Calendar size={18} />
          <label>Desde:</label>
          <input
            type="date"
            value={fromStr}
            onChange={(e) => setFromStr(e.target.value)}
          />
        </div>

        <div className="date-filter-group">
          <Calendar size={18} />
          <label>Hasta:</label>
          <input
            type="date"
            value={toStr}
            onChange={(e) => setToStr(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={loadReport} disabled={loading}>
          {loading ? 'Generando...' : 'Generar Reporte'}
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {report && (
        <>
          {/* Tarjetas de resumen */}
          <div className="report-summary-cards">
            <div className="summary-card">
              <div className="card-icon"><TrendingUp size={24} /></div>
              <div className="card-info">
                <span className="card-label">Transacciones Realizadas</span>
                <strong className="card-val">{report.totalSales}</strong>
              </div>
            </div>

            <div className="summary-card highlight">
              <div className="card-icon"><DollarSign size={24} /></div>
              <div className="card-info">
                <span className="card-label">Recaudo Total ({report.currency})</span>
                <strong className="card-val">{formatCOP(report.grandTotal)}</strong>
              </div>
            </div>
          </div>

          {/* Tabla de desglose por producto y categoría congelada */}
          <div className="report-table-box">
            <h3>Desglose por Producto</h3>

            {report.items.length === 0 ? (
              <div className="empty-state">
                <BarChart3 size={40} />
                <p>No se registraron ventas de ningún producto dentro de este rango.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría Congelada</th>
                      <th>Unidades Vendidas</th>
                      <th>Total Generado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.items.map((it, idx) => (
                      <tr key={idx}>
                        <td><strong>{it.productName}</strong></td>
                        <td><span className="category-pill">{it.categoryName}</span></td>
                        <td>{it.unitsSold} u.</td>
                        <td className="price-cell">{formatCOP(it.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
