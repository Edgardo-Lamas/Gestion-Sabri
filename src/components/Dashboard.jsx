import React, { useMemo } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt,
    BadgeDollarSign
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const Dashboard = ({ compras, ventas, gastos }) => {
    const estadisticas = useMemo(() => {
        const total_ingresos = (ventas || []).reduce((sum, v) => sum + (v.ingreso_total || 0), 0);
        const total_costo_mercaderia = (ventas || []).reduce((sum, v) => sum + (v.costo_calculado || 0), 0);
        const ganancia_bruta = total_ingresos - total_costo_mercaderia;
        const total_gastos = (gastos || []).reduce((sum, g) => sum + (g.monto || 0), 0);
        const resultado_final = ganancia_bruta - total_gastos;

        return { total_ingresos, total_costo_mercaderia, ganancia_bruta, total_gastos, resultado_final };
    }, [ventas, gastos]);

    // Preparar datos para gráficos
    const dataIngresosGastos = useMemo(() => {
        const data = {};

        // Agrupar ventas por fecha (mes/dia simplificado para demo)
        (ventas || []).forEach(v => {
            const date = v.fecha;
            if (!data[date]) data[date] = { name: date, ingresos: 0, gastos: 0 };
            data[date].ingresos += v.ingreso_total;
        });

        // Agrupar gastos por fecha
        (gastos || []).forEach(g => {
            const date = g.fecha;
            if (!data[date]) data[date] = { name: date, ingresos: 0, gastos: 0 };
            data[date].gastos += g.monto;
        });

        return Object.values(data).sort((a, b) => new Date(a.name) - new Date(b.name)).slice(-7); // Últimos 7 días con actividad
    }, [ventas, gastos]);

    const dataVentasProducto = useMemo(() => {
        const data = {};
        (ventas || []).forEach(v => {
            if (!v.producto_nombre) return;
            if (!data[v.producto_nombre]) data[v.producto_nombre] = 0;
            data[v.producto_nombre] += (v.cantidad_vendida || v.cantidad || 0);
        });
        return Object.entries(data)
            .map(([name, value]) => ({ name, value: value || 0 }))
            .sort((a, b) => b.value - a.value);
    }, [ventas]);

    const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const tarjetas = [
        { label: 'Ingresos de Ventas', value: estadisticas.total_ingresos, icon: DollarSign, color: '#0ea5e9', desc: 'Suma de ingreso_total' },
        { label: 'Costos de Ventas (FIFO)', value: estadisticas.total_costo_mercaderia, icon: TrendingDown, color: '#64748b', desc: 'Suma de costo_calculado' },
        { label: 'Ganancia Bruta', value: estadisticas.ganancia_bruta, icon: TrendingUp, color: '#10b981', desc: 'Ingresos - Costos' },
        { label: 'Total de Gastos', value: estadisticas.total_gastos, icon: Receipt, color: '#ef4444', desc: 'Gastos operativos' },
        { label: 'Resultado Final', value: estadisticas.resultado_final, icon: BadgeDollarSign, color: estadisticas.resultado_final >= 0 ? '#f59e0b' : '#ef4444', desc: 'Ganancia Bruta - Gastos', focus: true },
    ];

    return (
        <div className="dashboard-container">
            <div className="stats-grid">
                {tarjetas.map((t, i) => (
                    <div key={i} className={`glass-card stat-card ${t.focus ? 'focus-card' : ''}`} style={{ '--card-color': t.color }}>
                        <div className="card-header">
                            <span className="label">{t.label}</span>
                            <div className="icon-wrapper" style={{ backgroundColor: `${t.color}20` }}>
                                <t.icon size={20} color={t.color} />
                            </div>
                        </div>
                        <div className="value">${(t.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="desc">{t.desc}</div>
                    </div>
                ))}
            </div>

            <div className="charts-grid">
                <section className="glass-card chart-card">
                    <h3>Ingresos vs Gastos (Última Actividad)</h3>
                    <p className="chart-explainer">El <strong style={{ color: '#10b981' }}>área verde</strong> representa los ingresos por ventas y el <strong style={{ color: '#ef4444' }}>área roja</strong> los gastos de cada día. Cuando el verde está por encima del rojo, hubo ganancia ese día.</p>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={dataIngresosGastos}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `$${value}`} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [`$${value}`, '']}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="ingresos" stroke="#10b981" fillOpacity={1} fill="url(#colorIngresos)" name="Ingresos" />
                                <Area type="monotone" dataKey="gastos" stroke="#ef4444" fillOpacity={1} fill="url(#colorGastos)" name="Gastos" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="glass-card chart-card">
                    <h3>Productos Más Vendidos (Kg)</h3>
                    <div className="ranking-wrapper">
                        {dataVentasProducto.length > 0 ? (
                            <div className="ranking-list">
                                {dataVentasProducto.map((item, index) => {
                                    const maxValue = dataVentasProducto[0]?.value || 1;
                                    const pct = (item.value / maxValue) * 100;
                                    return (
                                        <div key={item.name} className="ranking-item">
                                            <span className="ranking-pos" style={{ background: COLORS[index % COLORS.length] + '20', color: COLORS[index % COLORS.length] }}>
                                                {index + 1}
                                            </span>
                                            <div className="ranking-info">
                                                <div className="ranking-header">
                                                    <span className="ranking-name">{item.name}</span>
                                                    <span className="ranking-value">{item.value.toFixed(1)} kg</span>
                                                </div>
                                                <div className="ranking-bar-bg">
                                                    <div className="ranking-bar-fill" style={{ width: `${pct}%`, background: COLORS[index % COLORS.length] }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="no-data">
                                <p>Registra ventas para ver el ranking</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <div className="dashboard-footer">
                <section className="glass-card margin-card">
                    <h3>Análisis de Rentabilidad</h3>
                    <div className="metrics-row">
                        <div className="chart-container">
                            <div className="donut-chart" style={{
                                backgroundImage: `conic-gradient(
                                    #64748b 0% ${(estadisticas.total_costo_mercaderia / (estadisticas.total_ingresos || 1)) * 100}%,
                                    #ef4444 ${(estadisticas.total_costo_mercaderia / (estadisticas.total_ingresos || 1)) * 100}% ${((estadisticas.total_costo_mercaderia + estadisticas.total_gastos) / (estadisticas.total_ingresos || 1)) * 100}%,
                                    #10b981 ${((estadisticas.total_costo_mercaderia + estadisticas.total_gastos) / (estadisticas.total_ingresos || 1)) * 100}% 100%
                                )`
                            }}>
                                <div className="donut-inner">
                                    <span className="inner-label">Distribución</span>
                                </div>
                            </div>
                            <div className="chart-legend">
                                <div className="legend-item"><span className="dot" style={{ background: '#64748b' }}></span> Costos</div>
                                <div className="legend-item"><span className="dot" style={{ background: '#ef4444' }}></span> Gastos</div>
                                <div className="legend-item"><span className="dot" style={{ background: '#10b981' }}></span> Beneficio</div>
                            </div>
                        </div>

                        <div className="progress-section">
                            <div className="progress-container">
                                <div className="progress-label">
                                    <span>Margen Bruto</span>
                                    <span>{estadisticas.total_ingresos > 0 ? ((estadisticas.ganancia_bruta / estadisticas.total_ingresos) * 100).toFixed(1) : 0}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${Math.max(0, Math.min(100, estadisticas.total_ingresos > 0 ? (estadisticas.ganancia_bruta / estadisticas.total_ingresos) * 100 : 0))}%`,
                                            background: '#10b981'
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <p className="insight-text">
                                {estadisticas.resultado_final > 0
                                    ? 'Tu negocio está generando ganancias netas positivas.'
                                    : 'Revisa tus costos y gastos para mejorar el resultado.'}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="glass-card expansion-card">
                    <div className="expansion-badge">FASE 2: EXPANSIÓN COMERCIAL</div>
                    <h3>Generador de Ventas</h3>
                    <p className="expansion-desc">Impulsa tus ventas compartiendo tu catálogo actualizado en tiempo real.</p>
                    <div className="mockup-buttons">
                        <button className="mockup-btn disabled" title="Próximamente">
                            <i className="lucide-share-2" style={{ marginRight: '8px' }}></i>
                            Compartir Catálogo (WhatsApp)
                        </button>
                    </div>
                </section>
            </div>

            <style jsx>{`
                .dashboard-container {
                    animation: slideUp 0.5s ease-out;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                }
                
                .charts-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                }
                
                .chart-card h3 {
                    margin-bottom: 0.5rem;
                    font-size: 1.1rem;
                    color: var(--text);
                }

                .chart-explainer {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                    margin-bottom: 1rem;
                    line-height: 1.4;
                }
                
                .chart-wrapper {
                    width: 100%;
                    min-height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .no-data {
                    color: var(--text-muted);
                    font-style: italic;
                }

                .ranking-wrapper {
                    min-height: 200px;
                }

                .ranking-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .ranking-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .ranking-pos {
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 0.85rem;
                    flex-shrink: 0;
                }

                .ranking-info {
                    flex: 1;
                    min-width: 0;
                }

                .ranking-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 0.3rem;
                }

                .ranking-name {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: var(--text);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .ranking-value {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    flex-shrink: 0;
                    margin-left: 0.5rem;
                }

                .ranking-bar-bg {
                    height: 6px;
                    background: #e2e8f0;
                    border-radius: 3px;
                    overflow: hidden;
                }

                .ranking-bar-fill {
                    height: 100%;
                    border-radius: 3px;
                    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .stat-card {
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    border-bottom: 3px solid var(--card-color);
                }
                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1);
                }
                .focus-card {
                    background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
                    transform: scale(1.02);
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .icon-wrapper {
                    padding: 0.5rem;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .label {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                .value {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--text);
                    letter-spacing: -0.5px;
                }
                .desc {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-top: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .dashboard-footer {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .metrics-row {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 2rem;
                    align-items: center;
                }
                .chart-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }
                .donut-chart {
                    width: 130px;
                    height: 130px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.5s ease;
                }
                .donut-inner {
                    width: 70%;
                    height: 70%;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
                }
                .inner-label {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }
                .chart-legend {
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }
                .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                .progress-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    min-width: 0;
                }
                .margin-card h3 {
                    margin-bottom: 2rem;
                    font-size: 1.1rem;
                    color: var(--text);
                }
                .progress-label {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: var(--text);
                }
                .progress-bar {
                    height: 10px;
                    background: #e2e8f0;
                    border-radius: 5px;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .insight-text {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    font-style: italic;
                    padding-left: 1rem;
                    border-left: 2px solid var(--border);
                }

                /* Expansion Card Styles */
                .expansion-card {
                    position: relative;
                    background: linear-gradient(135deg, rgba(249, 115, 22, 0.05), rgba(255,255,255,0.8));
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 2rem;
                }
                .expansion-badge {
                    background: var(--primary);
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    width: fit-content;
                    margin-bottom: 1rem;
                    letter-spacing: 1px;
                }
                .expansion-desc {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin: 0.5rem 0 1.5rem 0;
                }
                .mockup-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .mockup-btn {
                    padding: 0.8rem 1.2rem;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: not-allowed;
                    opacity: 0.7;
                    transition: all 0.2s;
                    background: #25d366; /* WhatsApp Green */
                    color: white;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 1024px) {
                    .dashboard-footer {
                        grid-template-columns: 1fr;
                    }
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .value { font-size: 1.5rem; }
                    .stats-grid { grid-template-columns: 1fr; }
                    .metrics-row { 
                        grid-template-columns: 1fr; 
                        gap: 2rem; 
                        justify-items: center;
                    }
                    .chart-container {
                        width: 100%;
                    }
                    .progress-section {
                        width: 100%;
                    }
                    .expansion-card {
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
