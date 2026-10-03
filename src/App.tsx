import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { CatalogView } from './components/CatalogView';
import { PointOfSaleView } from './components/PointOfSaleView';
import { SalesHistoryView } from './components/SalesHistoryView';
import { ReportsView } from './components/ReportsView';

const MainLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('catalog');

  if (loading) {
    return <div className="loading-screen">Iniciando Simple Stock Flow...</div>;
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="app-shell">
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      <main className="main-content">
        {currentTab === 'catalog' && <CatalogView />}
        {currentTab === 'pos' && <PointOfSaleView />}
        {currentTab === 'sales' && <SalesHistoryView />}
        {currentTab === 'reports' && <ReportsView />}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
