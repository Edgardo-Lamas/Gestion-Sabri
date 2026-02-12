import React, { useState } from 'react';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';

const Purchases = ({ productos, setProductos, compras, setCompras }) => {
    const [nuevoProductoNombre, setNuevoProductoNombre] = useState('');
    const [compra, setCompra] = useState({
        producto_id: '',
        cantidad_kg: '',
        costo_unitario: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    const addProducto = () => {
        if (!nuevoProductoNombre.trim()) return;
        const nuevoProducto = {
            id: crypto.randomUUID(),
            nombre: nuevoProductoNombre.trim()
        };
        setProductos([...productos, nuevoProducto]);
        setNuevoProductoNombre('');
    };

    const addCompra = (e) => {
        e.preventDefault();
        if (!compra.producto_id || !compra.cantidad_kg || !compra.costo_unitario) return;

        const nuevaCompra = {
            ...compra,
            id: crypto.randomUUID(),
            cantidad_kg: parseFloat(compra.cantidad_kg),
            cantidad_disponible: parseFloat(compra.cantidad_kg),
            costo_unitario: parseFloat(compra.costo_unitario),
            fecha: compra.fecha || new Date().toISOString().split('T')[0]
        };

        setCompras([nuevaCompra, ...compras]);
        setCompra({
            producto_id: '',
            cantidad_kg: '',
            costo_unitario: '',
            fecha: new Date().toISOString().split('T')[0]
        });
    };

    const deleteCompra = (id) => {
        if (window.confirm('¿Seguro que deseas eliminar esta compra?')) {
            setCompras(compras.filter(c => c.id !== id));
        }
    };

    return (
        <div className="purchases-view">
            <div className="grid-2">
                <section className="glass-card">
                    <h3>Nuevo Producto</h3>
                    <div className="input-group" style={{ marginTop: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Nombre del producto (ej: Queso)"
                            value={nuevoProductoNombre}
                            onChange={(e) => setNuevoProductoNombre(e.target.value)}
                        />
                    </div>
                    <button className="primary" onClick={addProducto}>
                        <Plus size={18} /> Añadir Producto
                    </button>
                </section>

                <section className="glass-card">
                    <h3>Registrar Compra</h3>
                    <form onSubmit={addCompra} style={{ marginTop: '1rem' }}>
                        <div className="input-group">
                            <label>Producto</label>
                            <select
                                value={compra.producto_id}
                                onChange={(e) => setCompra({ ...compra, producto_id: e.target.value })}
                            >
                                <option value="">Seleccionar...</option>
                                {productos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid-2">
                            <div className="input-group">
                                <label>Cantidad (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={compra.cantidad_kg}
                                    onChange={(e) => setCompra({ ...compra, cantidad_kg: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>Costo por kg</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={compra.costo_unitario}
                                    onChange={(e) => setCompra({ ...compra, costo_unitario: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={compra.fecha}
                                onChange={(e) => setCompra({ ...compra, fecha: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="primary">
                            <ShoppingCart size={18} /> Registrar Compra
                        </button>
                    </form>
                </section>
            </div>

            <section className="glass-card" style={{ marginTop: '2rem' }}>
                <h3>Historial de Compras</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Costo/kg</th>
                            <th>Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {compras.map(c => (
                            <tr key={c.id}>
                                <td>{c.fecha}</td>
                                <td>{productos.find(p => p.id === c.producto_id)?.nombre || 'Eliminado'}</td>
                                <td>{c.cantidad_kg} kg</td>
                                <td>${c.costo_unitario.toFixed(2)}</td>
                                <td>${(c.cantidad_kg * c.costo_unitario).toFixed(2)}</td>
                                <td>
                                    <button onClick={() => deleteCompra(c.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <style jsx>{`
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};

export default Purchases;
