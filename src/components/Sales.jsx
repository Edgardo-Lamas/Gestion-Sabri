import React, { useState, useMemo } from 'react';
import { BadgeDollarSign, Trash2, Plus, Search, Calendar, Package, Percent, Info, TrendingUp } from 'lucide-react';
import { ejecutarAlgoritmoVentaFIFO } from '../utils/fifo';
import Modal from './ui/Modal';
import { useToast } from '../context/ToastContext';

const Sales = ({ productos, setProductos, compras, setCompras, ventas, setVentas, stock_actual, costoPromedio }) => {
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
        margen_ganancia: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    // Info del producto seleccionado para el panel de contexto
    const productoSeleccionado = useMemo(() => {
        if (!nuevaVenta.producto_id) return null;
        const prod = productos.find(p => p.id === nuevaVenta.producto_id);
        const costo = costoPromedio[nuevaVenta.producto_id] || 0;
        const ultimaVenta = ventas.find(v => v.producto_id === nuevaVenta.producto_id);
        const lotes = compras
            .filter(c => c.producto_id === nuevaVenta.producto_id && c.cantidad_disponible > 0)
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        return { prod, costo, ultimaVenta, lotes };
    }, [nuevaVenta.producto_id, productos, costoPromedio, ventas, compras]);

    // Al seleccionar un producto, autocompletar precio y margen
    const handleProductoChange = (producto_id) => {
        if (!producto_id) {
            setNuevaVenta({ ...nuevaVenta, producto_id: '', precio_venta_unitario: '', margen_ganancia: '' });
            return;
        }

        const prod = productos.find(p => p.id === producto_id);
        const costo = costoPromedio[producto_id] || 0;
        const ultimaVenta = ventas.find(v => v.producto_id === producto_id);

        let precio = '';
        let margen = prod?.margen_ganancia || '';

        if (margen && costo > 0) {
            // Calcular precio desde margen guardado
            precio = (costo * (1 + parseFloat(margen) / 100)).toFixed(2);
        } else if (ultimaVenta) {
            // Usar último precio de venta
            precio = ultimaVenta.precio_venta_unitario.toString();
            // Calcular margen inverso si hay costo
            if (costo > 0) {
                margen = (((ultimaVenta.precio_venta_unitario - costo) / costo) * 100).toFixed(1);
            }
        }

        setNuevaVenta({ ...nuevaVenta, producto_id, precio_venta_unitario: precio, margen_ganancia: margen });
    };

    // Al cambiar el margen, recalcular el precio
    const handleMargenChange = (margenStr) => {
        const costo = costoPromedio[nuevaVenta.producto_id] || 0;
        let precio = nuevaVenta.precio_venta_unitario;

        if (margenStr && costo > 0) {
            const margen = parseFloat(margenStr);
            if (!isNaN(margen)) {
                precio = (costo * (1 + margen / 100)).toFixed(2);
            }
        }

        setNuevaVenta({ ...nuevaVenta, margen_ganancia: margenStr, precio_venta_unitario: precio });
    };

    // Al cambiar el precio manualmente, recalcular el margen
    const handlePrecioChange = (precioStr) => {
        const costo = costoPromedio[nuevaVenta.producto_id] || 0;
        let margen = nuevaVenta.margen_ganancia;

        if (precioStr && costo > 0) {
            const precio = parseFloat(precioStr);
            if (!isNaN(precio)) {
                margen = (((precio - costo) / costo) * 100).toFixed(1);
            }
        }

        setNuevaVenta({ ...nuevaVenta, precio_venta_unitario: precioStr, margen_ganancia: margen });
    };

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

            // Persistir margen en el producto para futuras ventas
            if (nuevaVenta.margen_ganancia) {
                const productosActualizados = productos.map(p =>
                    p.id === nuevaVenta.producto_id
                        ? { ...p, margen_ganancia: nuevaVenta.margen_ganancia }
                        : p
                );
                setProductos(productosActualizados);
            }

            setCompras(nuevas_compras);
            setVentas([registro_venta, ...ventas]);

            addToast('Venta registrada exitosamente', 'success');
            setIsModalOpen(false);

            // Reset form
            setNuevaVenta({
                producto_id: '',
                cantidad_vendida: '',
                precio_venta_unitario: '',
                margen_ganancia: '',
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
                                <th>Cantidad (kg)</th>
                                <th>Precio (kg)</th>
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
                                onChange={(e) => handleProductoChange(e.target.value)}
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

                    {/* Panel de contexto de costos */}
                    {productoSeleccionado && productoSeleccionado.costo > 0 && (
                        <div className="cost-context-panel">
                            <div className="context-header">
                                <Info size={16} />
                                <span>Info de precio — {productoSeleccionado.prod?.nombre}</span>
                            </div>
                            <div className="context-metrics">
                                <div className="context-metric">
                                    <span className="metric-label">Costo promedio stock</span>
                                    <span className="metric-value">${productoSeleccionado.costo.toFixed(2)}/kg</span>
                                </div>
                                {productoSeleccionado.ultimaVenta && (
                                    <div className="context-metric">
                                        <span className="metric-label">Último precio venta</span>
                                        <span className="metric-value">${productoSeleccionado.ultimaVenta.precio_venta_unitario.toFixed(2)}/kg</span>
                                    </div>
                                )}
                                {nuevaVenta.margen_ganancia && (
                                    <div className="context-metric highlight">
                                        <span className="metric-label">Margen ganancia</span>
                                        <span className="metric-value accent">{parseFloat(nuevaVenta.margen_ganancia).toFixed(1)}%</span>
                                    </div>
                                )}
                            </div>
                            {productoSeleccionado.lotes.length > 1 && (
                                <div className="context-lotes">
                                    <span className="lotes-title">⚠ {productoSeleccionado.lotes.length} lotes con costos distintos:</span>
                                    {productoSeleccionado.lotes.map((l, i) => (
                                        <div key={i} className="lote-item">
                                            <span>Lote {new Date(l.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}:</span>
                                            <span>${l.costo_unitario.toFixed(2)}/kg ({l.cantidad_disponible.toFixed(2)} kg disp.)</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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

                    <div className="form-row">
                        <div className="form-group">
                            <label>Margen de ganancia (%)</label>
                            <div className="input-wrapper">
                                <Percent size={16} className="input-icon-small" />
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="Ej: 30"
                                    value={nuevaVenta.margen_ganancia}
                                    onChange={(e) => handleMargenChange(e.target.value)}
                                    className="margin-input"
                                />
                            </div>
                            <small className="field-hint">Se recuerda para futuras ventas</small>
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
                                    onChange={(e) => handlePrecioChange(e.target.value)}
                                    required
                                />
                            </div>
                            {nuevaVenta.precio_venta_unitario && nuevaVenta.cantidad_vendida && (
                                <small className="field-hint total-hint">
                                    <TrendingUp size={12} /> Total: ${(parseFloat(nuevaVenta.precio_venta_unitario) * parseFloat(nuevaVenta.cantidad_vendida || 0)).toFixed(2)}
                                </small>
                            )}
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

                /* Cost Context Panel */
                .cost-context-panel {
                    background: linear-gradient(135deg, rgba(249, 115, 22, 0.04), rgba(59, 130, 246, 0.04));
                    border: 1px solid rgba(249, 115, 22, 0.15);
                    border-radius: 12px;
                    padding: 1rem;
                    animation: fadeIn 0.3s ease;
                }

                .context-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--primary);
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid rgba(249, 115, 22, 0.1);
                }

                .context-metrics {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 0.75rem;
                    margin-bottom: 0.5rem;
                }

                .context-metric {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    padding: 0.5rem 0.75rem;
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 8px;
                    border-left: 3px solid var(--border);
                }

                .context-metric.highlight {
                    border-left-color: var(--primary);
                    background: rgba(249, 115, 22, 0.06);
                }

                .metric-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .metric-value {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--text);
                }

                .metric-value.accent {
                    color: var(--primary);
                }

                .context-lotes {
                    margin-top: 0.5rem;
                    padding-top: 0.5rem;
                    border-top: 1px dashed rgba(249, 115, 22, 0.15);
                }

                .lotes-title {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #f59e0b;
                    display: block;
                    margin-bottom: 0.25rem;
                }

                .lote-item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    padding: 0.2rem 0;
                }

                /* Margin field */
                .input-icon-small {
                    position: absolute;
                    left: 0.75rem;
                    color: var(--text-muted);
                    pointer-events: none;
                }

                .margin-input {
                    padding-left: 2rem !important;
                }

                .field-hint {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                    font-style: italic;
                }

                .total-hint {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    color: var(--primary);
                    font-weight: 600;
                    font-style: normal;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 640px) {
                    .view-header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    .context-metrics {
                        grid-template-columns: 1fr;
                    }
                    .lote-item {
                        flex-direction: column;
                        gap: 0.1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Sales;
