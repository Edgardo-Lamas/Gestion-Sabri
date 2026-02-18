import React, { useState } from 'react';
import { BadgeDollarSign, Trash2, Plus, Search, Calendar, Package } from 'lucide-react';
import { ejecutarAlgoritmoVentaFIFO } from '../utils/fifo';
import Modal from './ui/Modal';
import { useToast } from '../context/ToastContext';

const Sales = ({ productos, compras, setCompras, ventas, setVentas, stock_actual }) => {
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Paginación simple
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [nuevaVenta, setNuevaVenta] = useState({
        producto_id: '',
        cantidad_vendida: '',
        precio_venta_unitario: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    const handleVenta = (e) => {
        e.preventDefault();

        if (!nuevaVenta.producto_id || !nuevaVenta.cantidad_vendida || !nuevaVenta.precio_venta_unitario) {
            addToast('Por favor completa todos los campos', 'error');
            return;
        }

        const cantidad_vendida = parseFloat(nuevaVenta.cantidad_vendida);
        const precio_venta_unitario = parseFloat(nuevaVenta.precio_venta_unitario);

        // Validar stock antes de procesar
        if (!stock_actual[nuevaVenta.producto_id] || stock_actual[nuevaVenta.producto_id] < cantidad_vendida) {
            addToast(`Stock insuficiente. Disponible: ${stock_actual[nuevaVenta.producto_id]?.toFixed(2) || 0} kg`, 'error');
            return;
        }

        // 2. Buscar compras (FIFO)
        const compras_producto = compras
            .filter(c => c.producto_id === nuevaVenta.producto_id && c.cantidad_disponible > 0)
            .sort((a, b) => {
                const fechaA = new Date(a.fecha);
                const fechaB = new Date(b.fecha);
                if (fechaA - fechaB !== 0) return fechaA - fechaB;
                return (a.creado_en || 0) - (b.creado_en || 0);
            });

        try {
            const { lotes_actualizados, costo_total } = ejecutarAlgoritmoVentaFIFO(cantidad_vendida, compras_producto);
            const ingreso_total = cantidad_vendida * precio_venta_unitario;
            const ganancia = ingreso_total - costo_total;

            const nuevas_compras = compras.map(c => {
                const actualizado = lotes_actualizados.find(la => la.id === c.id);
                return actualizado ? actualizado : c;
            });

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

            addToast('Venta registrada exitosamente', 'success');
            setIsModalOpen(false);

            // Reset form
            setNuevaVenta({
                producto_id: '',
                cantidad_vendida: '',
                precio_venta_unitario: '',
                fecha: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const deleteVenta = (venta) => {
        if (window.confirm('¿Eliminar esta venta? Nota: El stock NO se restaurará automáticamente en este MVP.')) {
            setVentas(ventas.filter(v => v.id !== venta.id));
            addToast('Venta eliminada del historial', 'info');
        }
    };

    // Filter and Pagination Logic
    const filteredVentas = ventas.filter(v =>
        v.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.fecha.includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredVentas.length / itemsPerPage);
    const paginatedVentas = filteredVentas.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="sales-view">
            <div className="view-header">
                <div className="search-bar glass-card">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por producto o fecha..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="primary-btn pulse" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Nueva Venta
                </button>
            </div>

            <section className="glass-card table-section">
                <div className="table-header-row">
                    <h3>Historial de Ventas</h3>
                    <span className="badge">{ventas.length} registros</span>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Producto</th>
                                <th>Cant.</th>
                                <th>Precio Unit.</th>
                                <th>Total</th>
                                <th>Ganancia</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedVentas.length > 0 ? (
                                paginatedVentas.map(v => (
                                    <tr key={v.id}>
                                        <td>
                                            <div className="date-badge">
                                                <Calendar size={14} />
                                                {new Date(v.fecha).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="fw-600">{v.producto_nombre}</td>
                                        <td>{v.cantidad_vendida} kg</td>
                                        <td>${v.precio_venta_unitario}</td>
                                        <td className="fw-700 text-primary">${v.ingreso_total.toFixed(2)}</td>
                                        <td>
                                            <span className={`profit-badge ${v.ganancia >= 0 ? 'positive' : 'negative'}`}>
                                                ${v.ganancia.toFixed(2)}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="icon-btn delete"
                                                onClick={() => deleteVenta(v)}
                                                title="Eliminar venta"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-state">
                                        No se encontraron ventas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            Anterior
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </section>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registrar Nueva Venta"
            >
                <form onSubmit={handleVenta} className="modal-form">
                    <div className="form-group">
                        <label>Producto</label>
                        <div className="select-wrapper">
                            <Package size={18} className="input-icon" />
                            <select
                                value={nuevaVenta.producto_id}
                                onChange={(e) => setNuevaVenta({ ...nuevaVenta, producto_id: e.target.value })}
                                required
                            >
                                <option value="">Seleccionar producto...</option>
                                {productos.map(p => (
                                    <option key={p.id} value={p.id} disabled={!stock_actual[p.id] || stock_actual[p.id] <= 0}>
                                        {p.nombre} (Stock: {stock_actual[p.id]?.toFixed(2) || 0} kg)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={nuevaVenta.fecha}
                                onChange={(e) => setNuevaVenta({ ...nuevaVenta, fecha: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Cantidad (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={nuevaVenta.cantidad_vendida}
                                onChange={(e) => setNuevaVenta({ ...nuevaVenta, cantidad_vendida: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Precio de Venta Unitario ($)</label>
                        <div className="input-wrapper">
                            <span className="currency-symbol">$</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={nuevaVenta.precio_venta_unitario}
                                onChange={(e) => setNuevaVenta({ ...nuevaVenta, precio_venta_unitario: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="primary-btn">
                            <BadgeDollarSign size={18} /> Registrar Venta
                        </button>
                    </div>
                </form>
            </Modal>

            <style jsx>{`
                .view-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .search-bar {
                    flex: 1;
                    min-width: 250px;
                    display: flex;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    gap: 0.75rem;
                }

                .search-bar input {
                    border: none;
                    background: transparent;
                    width: 100%;
                    outline: none;
                    font-size: 0.95rem;
                    color: var(--text);
                }

                .search-icon {
                    color: var(--text-muted);
                }

                .primary-btn {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.3);
                }

                .primary-btn:hover {
                    background: var(--primary-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4);
                }

                .pulse {
                    animation: pulse-shadow 2s infinite;
                }

                @keyframes pulse-shadow {
                    0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
                }

                .secondary-btn {
                    background: #f1f5f9;
                    color: var(--text);
                    border: 1px solid var(--border);
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .secondary-btn:hover {
                    background: #e2e8f0;
                }

                .table-section {
                    padding: 0;
                    overflow: hidden;
                }

                .table-header-row {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .badge {
                    background: #f1f5f9;
                    color: var(--text-muted);
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .date-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .fw-600 { font-weight: 600; }
                .fw-700 { font-weight: 700; }
                .text-primary { color: var(--primary); }

                .profit-badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.85rem;
                }
                .profit-badge.positive {
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--secondary);
                }
                .profit-badge.negative {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--error);
                }

                .icon-btn.delete {
                    color: var(--text-muted);
                    padding: 0.4rem;
                    border-radius: 6px;
                    transition: all 0.2s;
                }
                .icon-btn.delete:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--error);
                }

                .pagination {
                    padding: 1rem;
                    border-top: 1px solid var(--border);
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 1rem;
                }
                .pagination button {
                    background: transparent;
                    border: 1px solid var(--border);
                    padding: 0.4rem 0.8rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85rem;
                }
                .pagination button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: var(--text-muted);
                }

                /* Modal Form Styles */
                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group label {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--text);
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .select-wrapper, .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon, .currency-symbol {
                    position: absolute;
                    left: 1rem;
                    color: var(--text-muted);
                    pointer-events: none;
                }
                
                .currency-symbol {
                    font-weight: 600;
                }

                select, input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    padding-left: 2.5rem; /* Space for icon */
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: border-color 0.2s;
                    background: #f8fafc;
                }
                
                input[type="date"] {
                    padding-left: 1rem;
                }

                select:focus, input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: white;
                }

                .input-wrapper input {
                    padding-left: 2rem;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 1rem;
                }

                @media (max-width: 640px) {
                    .view-header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Sales;
