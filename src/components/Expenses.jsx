import React, { useState } from 'react';
import { Receipt, Plus, Trash2 } from 'lucide-react';

const Expenses = ({ gastos, setGastos }) => {
    const [gasto, setGasto] = useState({
        concepto: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    const addGasto = (e) => {
        e.preventDefault();
        if (!gasto.concepto || !gasto.monto) return;

        const nuevoGasto = {
            ...gasto,
            id: crypto.randomUUID(),
            monto: parseFloat(gasto.monto)
        };

        setGastos([nuevoGasto, ...gastos]);
        setGasto({
            concepto: '',
            monto: '',
            fecha: new Date().toISOString().split('T')[0]
        });
    };

    const deleteGasto = (id) => {
        if (window.confirm('¿Eliminar este gasto?')) {
            setGastos(gastos.filter(g => g.id !== id));
        }
    };

    return (
        <div className="expenses-view">
            <section className="glass-card">
                <h3>Registrar Gasto</h3>
                <form onSubmit={addGasto} style={{ marginTop: '1rem' }}>
                    <div className="input-group">
                        <label>Concepto</label>
                        <input
                            type="text"
                            placeholder="Ej: Alquiler, Luz, Empaques"
                            value={gasto.concepto}
                            onChange={(e) => setGasto({ ...gasto, concepto: e.target.value })}
                        />
                    </div>
                    <div className="grid-2">
                        <div className="input-group">
                            <label>Monto ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={gasto.monto}
                                onChange={(e) => setGasto({ ...gasto, monto: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={gasto.fecha}
                                onChange={(e) => setGasto({ ...gasto, fecha: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="primary">
                        <Receipt size={18} /> Registrar Gasto
                    </button>
                </form>
            </section>

            <section className="glass-card" style={{ marginTop: '2rem' }}>
                <h3>Historial de Gastos</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Concepto</th>
                                <th>Monto</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gastos.map(g => (
                                <tr key={g.id}>
                                    <td>{g.fecha}</td>
                                    <td>{g.concepto}</td>
                                    <td>${g.monto.toFixed(2)}</td>
                                    <td>
                                        <button onClick={() => deleteGasto(g.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
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
          .grid-2 { grid-template-columns: 1fr; gap: 1rem; }
        }
      `}</style>
        </div>
    );
};

export default Expenses;
