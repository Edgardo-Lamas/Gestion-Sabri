import React from 'react';

const Inventory = ({ productos, stock_actual, compras }) => {
    return (
        <div className="inventory-view">
            <section className="glass-card">
                <h3>Stock Actual por Producto</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Stock Total</th>
                                <th>Próximo Lote a Vender (FIFO)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos.map(p => {
                                const stock = stock_actual[p.id] || 0;
                                const proximo_lote = compras
                                    .filter(c => c.producto_id === p.id && c.cantidad_disponible > 0)
                                    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];

                                return (
                                    <tr key={p.id}>
                                        <td><strong>{p.nombre}</strong></td>
                                        <td style={{ color: stock > 0 ? 'var(--secondary)' : 'var(--error)', fontWeight: 'bold' }}>
                                            {stock.toFixed(2)} kg
                                        </td>
                                        <td>
                                            {proximo_lote
                                                ? `${proximo_lote.cantidad_disponible.toFixed(2)} kg @ $${proximo_lote.costo_unitario.toFixed(2)} (${proximo_lote.fecha})`
                                                : 'Sin stock'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="glass-card" style={{ marginTop: '2rem' }}>
                <h3>Detalle de Lotes Disponibles (Compras)</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Fecha Compra</th>
                                <th>Cantidad Disponible</th>
                                <th>Costo Unitario/kg</th>
                            </tr>
                        </thead>
                        <tbody>
                            {compras
                                .filter(c => c.cantidad_disponible > 0)
                                .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                                .map(c => (
                                    <tr key={c.id}>
                                        <td>{productos.find(p => p.id === c.producto_id)?.nombre}</td>
                                        <td>{c.fecha}</td>
                                        <td>{c.cantidad_disponible.toFixed(2)} kg</td>
                                        <td>${c.costo_unitario.toFixed(2)}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Inventory;
