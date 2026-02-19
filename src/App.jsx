import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ToastProvider } from './context/ToastContext';
import {
  LayoutDashboard,
  ShoppingCart,
  BadgeDollarSign,
  Receipt,
  Package,
  Scale,
  Menu,
  X
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import Purchases from './components/Purchases';
import Sales from './components/Sales';
import Expenses from './components/Expenses';
import Inventory from './components/Inventory';
import MeatDistribution from './components/MeatDistribution';
import B2BStoreFront from './components/B2BStoreFront';

function App() {
  // Navigation states: 'app' (dashboard) or 'storefront'
  const [currentView, setCurrentView] = useState('app');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Estado persistente con nuevos nombres de entidades/campos
  const [productos, setProductos] = useLocalStorage('sabri_v2_productos', []);
  const [compras, setCompras] = useLocalStorage('sabri_v2_compras', []);
  const [ventas, setVentas] = useLocalStorage('sabri_v2_ventas', []);
  const [gastos, setGastos] = useLocalStorage('sabri_v2_gastos', []);
  const [distribuciones, setDistribuciones] = useLocalStorage('sabri_v2_distribuciones', []);

  // Stock calculado para la interfaz
  const stock_actual = useMemo(() => {
    const stock = {};
    compras.forEach(c => {
      if (!stock[c.producto_id]) stock[c.producto_id] = 0;
      stock[c.producto_id] += c.cantidad_disponible;
    });
    return stock;
  }, [compras]);

  // Costo promedio ponderado por producto (solo lotes con stock disponible)
  const costoPromedio = useMemo(() => {
    const costos = {};
    compras.forEach(c => {
      if (c.cantidad_disponible > 0) {
        if (!costos[c.producto_id]) costos[c.producto_id] = { totalCosto: 0, totalKg: 0 };
        costos[c.producto_id].totalCosto += c.costo_unitario * c.cantidad_disponible;
        costos[c.producto_id].totalKg += c.cantidad_disponible;
      }
    });
    const resultado = {};
    Object.entries(costos).forEach(([id, data]) => {
      resultado[id] = data.totalKg > 0 ? data.totalCosto / data.totalKg : 0;
    });
    return resultado;
  }, [compras]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    closeSidebar();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard compras={compras} ventas={ventas} gastos={gastos} />;
      case 'purchases': return <Purchases productos={productos} setProductos={setProductos} compras={compras} setCompras={setCompras} />;
      case 'sales': return <Sales productos={productos} setProductos={setProductos} compras={compras} setCompras={setCompras} ventas={ventas} setVentas={setVentas} stock_actual={stock_actual} costoPromedio={costoPromedio} />;
      case 'expenses': return <Expenses gastos={gastos} setGastos={setGastos} />;
      case 'inventory': return <Inventory productos={productos} setProductos={setProductos} stock_actual={stock_actual} compras={compras} />;
      case 'distribution': return <MeatDistribution distribuciones={distribuciones} setDistribuciones={setDistribuciones} productos={productos} costoPromedio={costoPromedio} ventas={ventas} />;
      default: return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'purchases', label: 'Compras', icon: ShoppingCart },
    { id: 'sales', label: 'Ventas', icon: BadgeDollarSign },
    { id: 'expenses', label: 'Gastos', icon: Receipt },
    { id: 'inventory', label: 'Stock', icon: Package },
    { id: 'distribution', label: 'Distribución', icon: Scale },
  ];

  return (
    <ToastProvider>
      {currentView === 'storefront' ? (
        <React.Fragment>
          <B2BStoreFront productos={productos} costoPromedio={costoPromedio} />
          {/* Un botón temporal para poder volver al admin mientras desarrollamos */}
          <button
            onClick={() => setCurrentView('app')}
            style={{
              position: 'fixed', bottom: '20px', left: '20px',
              background: '#0f172a', color: 'white', padding: '10px 15px',
              borderRadius: '8px', zIndex: 9999, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            ← Volver al Admin
          </button>
        </React.Fragment>
      ) : (
        <div className="app-container">
          {/* Overlay para móvil */}
          {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

          <nav className={`sidebar glass-card ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <div className="logo">
                <h2>Gestión Sabri</h2>
              </div>
              <button className="mobile-close-btn" onClick={closeSidebar}>
                <X size={24} />
              </button>
            </div>

            <div className="nav-links">
              {navItems.map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(item.id)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="nav-links" style={{ marginTop: 'auto' }}>
              <button
                className="nav-item"
                style={{ color: '#f97316', background: 'rgba(249,115,22,0.1)' }}
                onClick={() => {
                  setCurrentView('storefront');
                  closeSidebar();
                }}
              >
                <Package size={20} />
                <span>Ver Catálogo Público</span>
              </button>
            </div>

            {/* User Section (New) */}
            <div className="user-section">
              <div className="user-avatar">S</div>
              <div className="user-info">
                <span className="user-name">Sabrina</span>
                <span className="user-role">Administradora</span>
              </div>
            </div>
          </nav>

          <main className="content">
            <header className="page-header">
              <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <Menu size={24} />
              </button>
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
            width: 100%;
            overflow-x: hidden;
            position: relative;
          }

          /* Animated Background */
          .app-container::before {
            content: '';
            position: fixed;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at center, rgba(249, 115, 22, 0.03) 0%, transparent 50%);
            z-index: 0;
            animation: rotateBackground 60s linear infinite;
            pointer-events: none;
          }

          @keyframes rotateBackground {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .sidebar {
            width: 260px;
            margin: 1rem;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            position: sticky;
            top: 1rem;
            height: calc(100vh - 2rem);
            transition: transform 0.3s ease, left 0.3s ease;
            z-index: 100;
            justify-content: space-between;
          }

          .sidebar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          .mobile-close-btn {
            display: none;
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
          }

          .logo h2 {
            color: var(--primary);
            font-size: 1.5rem;
            background: linear-gradient(to right, var(--primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .nav-links {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            flex: 1;
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
            width: 100%;
            text-align: left;
          }

          .nav-item:hover {
            background: rgba(249, 115, 22, 0.08);
            color: var(--primary);
          }

          .nav-item.active {
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
          }

          .user-section {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border);
            margin-top: auto;
          }

          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.2rem;
          }

          .user-info {
            display: flex;
            flex-direction: column;
          }

          .user-name {
            font-weight: 600;
            color: var(--text);
            font-size: 0.9rem;
          }

          .user-role {
            font-size: 0.75rem;
            color: var(--text-muted);
          }

          .content {
            flex: 1;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
            min-width: 0; /* Evita que el contenido flex rompa el contenedor */
            z-index: 1;
          }

          .page-header {
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .mobile-menu-btn {
            display: none;
            background: var(--surface);
            border: 1px solid var(--border);
            padding: 0.5rem;
            border-radius: 8px;
            color: var(--text);
            cursor: pointer;
            box-shadow: var(--shadow);
          }

          .view-container {
            animation: fadeIn 0.3s ease;
            width: 100%;
          }

          .sidebar-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            z-index: 90;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* --- RESPONSIVE --- */
          @media (max-width: 1024px) {
            .sidebar {
              position: fixed;
              left: -300px;
              top: 0;
              bottom: 0;
              height: 100vh;
              margin: 0;
              border-radius: 0;
              transform: translateX(0);
            }

            .sidebar.open {
              left: 0;
            }

            .sidebar-overlay {
              display: block;
            }

            .mobile-menu-btn {
              display: flex;
            }

            .mobile-close-btn {
              display: block;
            }

            .content {
              padding: 1.5rem;
            }
          }

          @media (max-width: 640px) {
            .content {
              padding: 1rem;
            }
            
            .page-header h1 {
              font-size: 1.5rem;
            }
          }
        `}</style>
        </div>
      )}
    </ToastProvider>
  );
}

export default App;
