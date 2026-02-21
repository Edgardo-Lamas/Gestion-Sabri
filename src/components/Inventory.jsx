import React from 'react';

import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

const Inventory = ({ productos, stock_actual, compras, onUpdate }) => {
    const { addToast } = useToast();

    const handlePriceChange = async (id, newPrice) => {
        const val = parseFloat(newPrice);
        const finalVal = isNaN(val) ? 0 : val;

        const { error } = await supabase.from('productos')
            .update({ precio_b2b: finalVal })
            .eq('id', id);

        if (error) {
            addToast('Error actualizando precio', 'error');
            return;
        }

        if (onUpdate) onUpdate();
    };

    const toggleCatalogVisibility = async (id, currentVisibility) => {
        const newVisibility = currentVisibility === false ? true : false;

        const { error } = await supabase.from('productos')
            .update({ visible_catalogo: newVisibility })
            .eq('id', id);

        if (error) {
            addToast('Error actualizando visibilidad', 'error');
            return;
        }

        addToast('Visibilidad del catálogo actualizada', 'info');
        if (onUpdate) onUpdate();
    };
    return (
        <div className="inventory-view">
            <section className="glass-card">
                <h3>Stock Actual por Producto</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Stock Total (kg)</th>
                                <th>Precio Catálogo B2B ($/kg)</th>
                                <th>Visible Catálogo</th>
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
                                            <div className="input-wrapper" style={{ width: '120px' }}>
                                                <span style={{ position: 'absolute', left: '8px', color: '#64748b', fontSize: '0.9em' }}>$</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    defaultValue={p.precio_b2b || ''}
                                                    onBlur={(e) => {
                                                        if (parseFloat(e.target.value) !== (p.precio_b2b || 0)) {
                                                            handlePriceChange(p.id, e.target.value);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handlePriceChange(p.id, e.target.value);
                                                    }}
                                                    placeholder="0.00"
                                                    style={{ width: '100%', padding: '0.4rem 0.4rem 0.4rem 1.5rem', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none' }}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => toggleCatalogVisibility(p.id, p.visible_catalogo)}
                                                style={{
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '20px',
                                                    border: 'none',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    background: p.visible_catalogo !== false ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                                                    color: p.visible_catalogo !== false ? '#10b981' : '#64748b'
                                                }}
                                            >
                                                {p.visible_catalogo !== false ? 'Ocultar' : 'Mostrar'}
                                            </button>
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
                                <th>Cantidad Disponible (kg)</th>
                                <th>Costo Unitario (kg)</th>
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
