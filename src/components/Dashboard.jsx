import React, { useMemo } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt,
    BadgeDollarSign
} from 'lucide-react';

const Dashboard = ({ compras, ventas, gastos }) => {
    const estadisticas = useMemo(() => {
        const total_ingresos = (ventas || []).reduce((sum, v) => sum + (v.ingreso_total || 0), 0);
        const total_costo_mercaderia = (ventas || []).reduce((sum, v) => sum + (v.costo_calculado || 0), 0);
        const ganancia_bruta = total_ingresos - total_costo_mercaderia;
        const total_gastos = (gastos || []).reduce((sum, g) => sum + (g.monto || 0), 0);
        const resultado_final = ganancia_bruta - total_gastos;

        return { total_ingresos, total_costo_mercaderia, ganancia_bruta, total_gastos, resultado_final };
    }, [ventas, gastos]);

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
                        <button className="mockup-btn disabled secondary" title="Próximamente">
                            <i className="lucide-clipboard-list" style={{ marginRight: '8px' }}></i>
                            Recibir Pedidos Online
                        </button>
                    </div>
                    <div className="expansion-footer">
                        <span className="info-tag">Módulo de ventas activo (Próximamente)</span>
                    </div>
                </section>
            </div>

            <style jsx>{`
                .dashboard-container {
                    animation: slideUp 0.5s ease-out;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
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
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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
                .mockup-btn.secondary {
                    background: #f8fafc;
                    border: 1px solid var(--border);
                    color: var(--text);
                }
                .expansion-footer {
                    margin-top: 1.5rem;
                    padding-top: 1rem;
                    border-top: 1px dashed var(--border);
                }
                .info-tag {
                    font-size: 0.75rem;
                    color: var(--primary);
                    font-weight: 600;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .value { font-size: 1.5rem; }
                    .stats-grid { grid-template-columns: 1fr; }
                    .metrics-row { grid-template-columns: 1fr; gap: 2rem; }
                    .dashboard-footer { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
