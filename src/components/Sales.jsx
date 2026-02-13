import React, { useState } from 'react';
import { BadgeDollarSign, Trash2, AlertCircle } from 'lucide-react';
import { ejecutarAlgoritmoVentaFIFO } from '../utils/fifo';

const Sales = ({ productos, compras, setCompras, ventas, setVentas, stock_actual }) => {
    const [nuevaVenta, setNuevaVenta] = useState({
        producto_id: '',
        cantidad_vendida: '',
        precio_venta_unitario: '',
        fecha: new Date().toISOString().split('T')[0]
    });
    const [error, setError] = useState('');

    const handleVenta = (e) => {
        e.preventDefault();
        setError('');

        if (!nuevaVenta.producto_id || !nuevaVenta.cantidad_vendida || !nuevaVenta.precio_venta_unitario) {
            setError('Por favor completa todos los campos');
            return;
        }

        const cantidad_vendida = parseFloat(nuevaVenta.cantidad_vendida);
        const precio_venta_unitario = parseFloat(nuevaVenta.precio_venta_unitario);

        // 2. Buscar todas las compras del mismo producto ordenadas por fecha ascendente donde cantidad_disponible > 0
        const compras_producto = compras
            .filter(c => c.producto_id === nuevaVenta.producto_id && c.cantidad_disponible > 0)
            .sort((a, b) => {
                const fechaA = new Date(a.fecha);
                const fechaB = new Date(b.fecha);
                if (fechaA - fechaB !== 0) return fechaA - fechaB;
                // FIFO Real: A igual fecha, el que se registró primero (creado_en más bajo)
                return (a.creado_en || 0) - (b.creado_en || 0);
            });

        try {
            const { lotes_actualizados, costo_total } = ejecutarAlgoritmoVentaFIFO(cantidad_vendida, compras_producto);

            // 4. Calcular ingreso_total
            const ingreso_total = cantidad_vendida * precio_venta_unitario;

            // 5. Calcular ganancia
            const ganancia = ingreso_total - costo_total;

            // Actualizar compras (Paso 3: "Guardar la compra")
            const nuevas_compras = compras.map(c => {
                const actualizado = lotes_actualizados.find(la => la.id === c.id);
                return actualizado ? actualizado : c;
            });

            // 6. Guardar ingreso_total, costo_calculado y ganancia en la venta
            const registro_venta = {
                id: crypto.randomUUID(),
                producto_id: nuevaVenta.producto_id,
                producto_nombre: productos.find(p => p.id === nuevaVenta.producto_id)?.nombre,
                fecha: nuevaVenta.fecha,
                cantidad_vendida: cantidad_vendida,
                precio_venta_unitario: precio_venta_unitario,
                ingreso_total: ingreso_total,
                costo_calculado: costo_total,
                ganancia: ganancia
            };

            setCompras(nuevas_compras);
            setVentas([registro_venta, ...ventas]);
            setNuevaVenta({
                producto_id: '',
                cantidad_vendida: '',
                precio_venta_unitario: '',
                fecha: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            setError(err.message === 'Stock insuficiente' ? `Stock insuficiente para vender ${cantidad_vendida} kg` : err.message);
        }
    };

    const deleteVenta = (venta) => {
        if (window.confirm('¿Eliminar esta venta? Nota: El stock NO se restaurará automáticamente en este MVP.')) {
            setVentas(ventas.filter(v => v.id !== venta.id));
        }
    };

    return (
        <div className="sales-view">
            <section className="glass-card">
                <h3>Registrar Nueva Venta</h3>
                <form onSubmit={handleVenta} style={{ marginTop: '1rem' }}>
                    <div className="grid-2">
                        <div className="input-group">
                            <label>Producto</label>
                            <select
                                value={nuevaVenta.producto_id}
                                onChange={(e) => setNuevaVenta({ ...nuevaVenta, producto_id: e.target.value })}
                            >
                                <option value="">Seleccionar...</option>
                                {productos.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombre} (Stock: {stock_actual[p.id]?.toFixed(2) || 0} kg)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={nuevaVenta.fecha}
                                onChange={(e) => setNuevaVenta({ ...nuevaVenta, fecha: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="input-group">
                            <label>Cantidad Vendida (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={nuevaVenta.cantidad_vendida}
                                onChange={(e) => setNuevaVenta({ ...nuevaVenta, cantidad_vendida: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>Precio Venta Unitario ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={nuevaVenta.precio_venta_unitario}
                                onChange={(e) => setNuevaVenta({ ...nuevaVenta, precio_venta_unitario: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="error-msg" style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <button type="submit" className="primary">
                        <BadgeDollarSign size={18} /> Registrar Venta
                    </button>
                </form>
            </section>

            <section className="glass-card" style={{ marginTop: '2rem' }}>
                <h3>Historial de Ventas</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Producto</th>
                                <th>Cant. Vendida</th>
                                <th>Ingreso Total</th>
                                <th>Costo Calc.</th>
                                <th>Ganancia</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ventas.map(v => (
                                <tr key={v.id}>
                                    <td>{v.fecha}</td>
                                    <td>{v.producto_nombre}</td>
                                    <td>{v.cantidad_vendida} kg</td>
                                    <td>${v.ingreso_total.toFixed(2)}</td>
                                    <td>${v.costo_calculado.toFixed(2)}</td>
                                    <td style={{ color: v.ganancia >= 0 ? 'var(--secondary)' : 'var(--error)', fontWeight: 'bold' }}>
                                        ${v.ganancia.toFixed(2)}
                                    </td>
                                    <td>
                                        <button onClick={() => deleteVenta(v)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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

export default Sales;
