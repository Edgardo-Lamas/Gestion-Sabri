import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  LayoutDashboard,
  ShoppingCart,
  BadgeDollarSign,
  Receipt,
  Package
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import Purchases from './components/Purchases';
import Sales from './components/Sales';
import Expenses from './components/Expenses';
import Inventory from './components/Inventory';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Estado persistente con nuevos nombres de entidades/campos
  const [productos, setProductos] = useLocalStorage('sabri_v2_productos', []);
  const [compras, setCompras] = useLocalStorage('sabri_v2_compras', []);
  const [ventas, setVentas] = useLocalStorage('sabri_v2_ventas', []);
  const [gastos, setGastos] = useLocalStorage('sabri_v2_gastos', []);

  // Stock calculado para la interfaz
  const stock_actual = useMemo(() => {
    const stock = {};
    compras.forEach(c => {
      if (!stock[c.producto_id]) stock[c.producto_id] = 0;
      stock[c.producto_id] += c.cantidad_disponible;
    });
    return stock;
  }, [compras]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard compras={compras} ventas={ventas} gastos={gastos} />;
      case 'purchases': return <Purchases productos={productos} setProductos={setProductos} compras={compras} setCompras={setCompras} />;
      case 'sales': return <Sales productos={productos} compras={compras} setCompras={setCompras} ventas={ventas} setVentas={setVentas} stock_actual={stock_actual} />;
      case 'expenses': return <Expenses gastos={gastos} setGastos={setGastos} />;
      case 'inventory': return <Inventory productos={productos} stock_actual={stock_actual} compras={compras} />;
      default: return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'purchases', label: 'Compras', icon: ShoppingCart },
    { id: 'sales', label: 'Ventas', icon: BadgeDollarSign },
    { id: 'expenses', label: 'Gastos', icon: Receipt },
    { id: 'inventory', label: 'Stock', icon: Package },
  ];

  return (
    <div className="app-container">
      <nav className="sidebar glass-card">
        <div className="logo">
          <h2>Gestión Sabri</h2>
        </div>
        <div className="nav-links">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="content">
        <header className="page-header">
          <h1>{navItems.find(i => i.id === activeTab).label}</h1>
        </header>
        <div className="view-container">
          {renderContent()}
        </div>
      </main>

      <style jsx>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background: var(--background);
        }

        .sidebar {
          width: 260px;
          margin: 1rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          position: sticky;
          top: 1rem;
          height: calc(100vh - 2rem);
        }

        .logo h2 {
          color: var(--primary);
          font-size: 1.5rem;
        }

        .nav-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: var(--radius);
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .nav-item:hover {
          background: rgba(249, 115, 22, 0.1);
          color: var(--primary);
        }

        .nav-item.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }

        .content {
          flex: 1;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .view-container {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;
