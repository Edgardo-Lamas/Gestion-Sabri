import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const Dashboard = ({ compras, ventas, gastos }) => {
    const estadisticas = useMemo(() => {
        const total_ingresos = ventas.reduce((sum, v) => sum + v.ingreso_total, 0);
        const total_costo_mercaderia = ventas.reduce((sum, v) => sum + v.costo_calculado, 0);
        const ganancia_bruta = total_ingresos - total_costo_mercaderia;
        const total_gastos = gastos.reduce((sum, g) => sum + g.monto, 0);
        const resultado_final = ganancia_bruta - total_gastos;

        return { total_ingresos, total_costo_mercaderia, ganancia_bruta, total_gastos, resultado_final };
    }, [ventas, gastos]);

    const tarjetas = [
        { label: 'Ingresos de Ventas', value: estadisticas.total_ingresos, icon: DollarSign, color: 'var(--primary)' },
        { label: 'Costos de Ventas (FIFO)', value: estadisticas.total_costo_mercaderia, icon: TrendingDown, color: 'var(--text-muted)' },
        { label: 'Ganancia Bruta', value: estadisticas.ganancia_bruta, icon: TrendingUp, color: 'var(--secondary)' },
        { label: 'Total de Gastos', value: estadisticas.total_gastos, icon: TrendingDown, color: 'var(--error)' },
        { label: 'Resultado Final', value: estadisticas.resultado_final, icon: DollarSign, color: estadisticas.resultado_final >= 0 ? 'var(--secondary)' : 'var(--error)' },
    ];

    return (
        <div className="dashboard-view">
            <div className="stats-grid">
                {tarjetas.map((t, i) => (
                    <div key={i} className="glass-card stat-card" style={{ borderLeft: `4px solid ${t.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <span className="label">{t.label}</span>
                            <t.icon size={20} color={t.color} />
                        </div>
                        <div className="value" style={{ color: t.color }}>${t.value.toFixed(2)}</div>
                    </div>
                ))}
            </div>

            <div className="grid-2">
                <section className="glass-card">
                    <h3>Estructura de Margen</h3>
                    <div className="margin-info" style={{ marginTop: '1rem' }}>
                        <p><strong>Margen Bruto:</strong> {estadisticas.total_ingresos > 0 ? ((estadisticas.ganancia_bruta / estadisticas.total_ingresos) * 100).toFixed(1) : 0}%</p>
                        <p><strong>Impacto de Gastos:</strong> {estadisticas.total_ingresos > 0 ? ((estadisticas.total_gastos / estadisticas.total_ingresos) * 100).toFixed(1) : 0}% de los ingresos</p>
                    </div>
                </section>
            </div>

            <style jsx>{`
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
