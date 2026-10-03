import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, ShoppingCart, FileText, BarChart3, LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="brand" onClick={() => onSelectTab('catalog')} style={{ cursor: 'pointer' }}>
          <span className="brand-logo">SSF</span>
          <span className="brand-title">Simple Stock Flow</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${currentTab === 'catalog' ? 'active' : ''}`}
            onClick={() => onSelectTab('catalog')}
          >
            <Package size={18} />
            <span>Catálogo</span>
          </button>

          <button
            className={`nav-btn ${currentTab === 'pos' ? 'active' : ''}`}
            onClick={() => onSelectTab('pos')}
          >
            <ShoppingCart size={18} />
            <span>Punto de Venta</span>
          </button>

          <button
            className={`nav-btn ${currentTab === 'sales' ? 'active' : ''}`}
            onClick={() => onSelectTab('sales')}
          >
            <FileText size={18} />
            <span>Ventas</span>
          </button>

          <button
            className={`nav-btn ${currentTab === 'reports' ? 'active' : ''}`}
            onClick={() => onSelectTab('reports')}
          >
            <BarChart3 size={18} />
            <span>Reportes</span>
          </button>
        </nav>

        <div className="user-section">
          <div className="user-info">
            <UserIcon size={16} />
            <span className="username">{user?.username}</span>
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-seller'}`}>
              {isAdmin ? 'Administrador' : 'Vendedor'}
            </span>
          </div>

          <button className="logout-btn" onClick={logout} title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
