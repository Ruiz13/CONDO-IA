"use client";
import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [gastos, setGastos] = useState([
    { id: 1, desc: 'Electricidad Pasillos', monto: 150.00, regla: 'Todos' },
    { id: 2, desc: 'Mantenimiento Ascensor', monto: 420.00, regla: 'Excluye Locales' }
  ]);
  const [pagosOcr, setPagosOcr] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [notificacion, setNotificacion] = useState('');
  const [activeTab, setActiveTab] = useState('finanzas'); // 'finanzas', 'comunicados', 'auditoria'

  // Comunicados State
  const [tituloAviso, setTituloAviso] = useState('');
  const [contenidoAviso, setContenidoAviso] = useState('');
  
  // Votaciones State
  const [preguntaEncuesta, setPreguntaEncuesta] = useState('');
  const [opcionesEncuesta, setOpcionesEncuesta] = useState(''); // Comma separated

  const fetchPayments = async () => {
    try {
      const response = await fetch('https://condo-ia-backend.onrender.com/api/payments/pending', {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      const data = await response.json();
      setPagosOcr(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('https://condo-ia-backend.onrender.com/api/audit-logs', {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      const data = await response.json();
      setAuditLogs(data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const fetchGastos = async () => {
    try {
      const tenantId = 'TENANT-ID-MOCK';
      const response = await fetch(`https://condo-ia-backend.onrender.com/api/expenses/${tenantId}`, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      if (response.ok) {
        const data = await response.json();
        setGastos(data.map((ex: any) => ({
          id: ex.id,
          desc: ex.description,
          monto: ex.amount,
          regla: ex.appliesTo === 'ALL' ? 'Todos' : 'Excluye Locales'
        })));
      }
    } catch (error) {
      console.error('Error fetching expenses', error);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchAuditLogs();
    fetchGastos();
    
    // Polling cada 5 segundos para tiempo real
    const interval = setInterval(() => {
      fetchPayments();
      fetchAuditLogs();
      fetchGastos();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const agregarGasto = async () => {
    const desc = prompt('Descripción del gasto:');
    if (!desc) return;
    const montoStr = prompt('Monto del gasto ($):');
    if (!montoStr) return;
    const reglaStr = prompt('Aplica a (T=Todos, A=Solo Apartamentos):', 'T');
    
    const tenantId = 'TENANT-ID-MOCK';
    const amount = parseFloat(montoStr);
    const appliesTo = (reglaStr?.toUpperCase() === 'A') ? 'APARTMENTS_ONLY' : 'ALL';

    try {
      await fetch('https://condo-ia-backend.onrender.com/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ tenantId, description: desc, amount, appliesTo })
      });
      fetchGastos();
    } catch (error) {
      console.error('Error adding expense', error);
    }
  };

  const ejecutarFacturacion = async () => {
    try {
      const res = await fetch('https://condo-ia-backend.onrender.com/api/invoices/generate-monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' }
      });
      if (res.ok) {
        setNotificacion('¡Facturación ejecutada con éxito! Matemáticas aplicadas correctamente.');
        setTimeout(() => setNotificacion(''), 4000);
      }
    } catch (error) {
      console.error('Error triggering billing', error);
    }
  };

  const aprobarPago = async (id: string) => {
    try {
      const response = await fetch(`https://condo-ia-backend.onrender.com/api/payments/${id}/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true' 
        },
        body: JSON.stringify({}) // Backend will fallback to first Admin
      });
      if (response.ok) {
        fetchPayments();
        fetchAuditLogs();
      }
    } catch (error) {
      console.error('Error approving payment:', error);
    }
  };

  const enviarComunicado = async () => {
    try {
      // Mock tenantId for MVP
      const tenantId = 'TENANT-ID-MOCK'; 
      const response = await fetch('https://condo-ia-backend.onrender.com/api/communications/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ tenantId, title: tituloAviso, content: contenidoAviso })
      });
      if (response.ok) {
        setNotificacion('Comunicado enviado a todos los residentes.');
        setTimeout(() => setNotificacion(''), 4000);
        setTituloAviso('');
        setContenidoAviso('');
      }
    } catch (e) {}
  };

  const crearVotacion = async () => {
    try {
      const tenantId = 'TENANT-ID-MOCK'; 
      const optionsArray = opcionesEncuesta.split(',').map(o => o.trim()).filter(o => o);
      const response = await fetch('https://condo-ia-backend.onrender.com/api/communications/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ tenantId, question: preguntaEncuesta, options: optionsArray })
      });
      if (response.ok) {
        setNotificacion('Votación creada y publicada.');
        setTimeout(() => setNotificacion(''), 4000);
        setPreguntaEncuesta('');
        setOpcionesEncuesta('');
      }
    } catch (e) {}
  };

  return (
    <div className="flex h-screen bg-[#050512] text-slate-100 font-[family-name:var(--font-geist-sans)]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a16] border-r border-[#1e1e38] flex flex-col">
        <div className="p-6 border-b border-[#1e1e38]">
          <h1 className="text-xl font-bold">
            <span className="text-yellow-500">COND</span>
            <span className="text-orange-500">🏠</span>
            <span className="text-yellow-500">-</span>
            <span className="text-[#c084fc]">IA</span>
          </h1>
          <p className="text-xs text-slate-400">Panel de Administrador</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('finanzas')} className={`w-full text-left px-4 py-2 rounded-lg font-medium border ${activeTab === 'finanzas' ? 'bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30' : 'text-slate-400 border-transparent hover:bg-[#1e1e38] hover:text-slate-200'}`}>Finanzas y Gastos</button>
          <button onClick={() => setActiveTab('comunicados')} className={`w-full text-left px-4 py-2 rounded-lg font-medium border ${activeTab === 'comunicados' ? 'bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30' : 'text-slate-400 border-transparent hover:bg-[#1e1e38] hover:text-slate-200'}`}>Asamblea Digital</button>
          <button className="w-full text-left px-4 py-2 rounded-lg text-slate-400 hover:bg-[#1e1e38] hover:text-slate-200">Configuración</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        {/* Notificación Flotante */}
        {notificacion && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl shadow-emerald-500/20 font-medium animate-bounce border border-emerald-400">
            {notificacion}
          </div>
        )}

        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {activeTab === 'finanzas' ? 'Finanzas del Mes' : 'Asamblea Digital'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {activeTab === 'finanzas' ? 'Carga la data para ejecutar el cobro automático el Día 3.' : 'Emite comunicados oficiales y encuestas vinculantes para los residentes.'}
            </p>
          </div>
          {activeTab === 'finanzas' && (
            <button 
              onClick={ejecutarFacturacion}
              className="px-6 py-3 bg-[#c084fc] text-white font-bold rounded-xl shadow-lg shadow-[#c084fc]/20 hover:bg-[#a855f7] transition-colors"
            >
              Ejecutar Facturación
            </button>
          )}
        </header>

        {activeTab === 'finanzas' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hoja de Calculo */}
          <section className="col-span-2 space-y-8">
            <div className="bg-[#0a0a16] rounded-3xl border border-[#1e1e38] p-8 shadow-xl">
              <h3 className="font-semibold text-lg mb-6 text-white tracking-wide">HOJA DE CÁLCULO INTERACTIVA</h3>
              <div className="border border-[#1e1e38] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-[#111122] border-b border-[#1e1e38]">
                    <tr>
                      <th className="p-4 font-medium text-slate-200">Descripción</th>
                      <th className="p-4 font-medium text-slate-200">Monto</th>
                      <th className="p-4 font-medium text-slate-200">Regla</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#0a0a16]">
                    {gastos.map((gasto) => (
                      <tr key={gasto.id} className="border-b border-[#1e1e38] hover:bg-[#111122] transition-colors">
                        <td className="p-4">{gasto.desc}</td>
                        <td className="p-4 text-white font-bold">${gasto.monto.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${gasto.regla === 'Todos' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'}`}>
                            {gasto.regla}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button 
                onClick={agregarGasto}
                className="mt-6 px-5 py-2.5 border border-[#c084fc]/50 rounded-xl text-[#c084fc] hover:bg-[#c084fc]/10 font-medium text-sm transition-colors"
              >
                + Agregar Gasto
              </button>
            </div>

            {/* Monitor de Auditoría en Tiempo Real */}
            <div className="bg-[#050512] rounded-3xl border border-[#1e1e38] p-8 shadow-xl">
              <h3 className="font-semibold text-lg mb-6 text-white tracking-wide flex items-center gap-2">
                <span>👁️</span> Registro de Auditoría (Tiempo Real)
              </h3>
              <div className="border border-[#1e1e38] rounded-2xl overflow-hidden bg-[#0a0a16] h-64 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono text-slate-400">
                  <thead className="bg-[#111122] border-b border-[#1e1e38] sticky top-0">
                    <tr>
                      <th className="p-3">FECHA</th>
                      <th className="p-3">USUARIO/ADMIN</th>
                      <th className="p-3">ACCIÓN</th>
                      <th className="p-3">TABLA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-600">No hay registros de auditoría</td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="border-b border-[#1e1e38]/50 hover:bg-[#111122]">
                          <td className="p-3 text-emerald-400/80">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="p-3 text-blue-400/80">{log.user?.email || log.userId}</td>
                          <td className="p-3 font-bold text-amber-400">{log.action}</td>
                          <td className="p-3">{log.tableName}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* OCR Panel */}
          <section className="col-span-1 bg-gradient-to-b from-[#111122] to-[#0a0a16] rounded-3xl border border-[#1e1e38] p-8 shadow-xl">
            <h3 className="font-semibold text-lg mb-6 text-white tracking-wide flex items-center gap-2">
              <span>🧾</span> Pagos Pendientes (OCR)
            </h3>
            <div className="space-y-4">
              {pagosOcr.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No hay pagos pendientes de revisión.</p>
              ) : (
                pagosOcr.map((pago) => (
                  <div key={pago.id} className="p-5 rounded-2xl border border-amber-500/30 bg-amber-900/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-amber-400">Apto {pago.invoice?.unit?.unitNumber} - Pago Reportado</p>
                        <p className="text-xs mt-1.5 text-amber-500/80">Referencia: {pago.referenceNumber || 'N/A'}</p>
                        <p className="text-xs mt-1 text-white font-bold">Monto: ${pago.amount.toFixed(2)}</p>
                      </div>
                    </div>
                    {pago.status === 'PENDING' && (
                      <button 
                        onClick={() => aprobarPago(pago.id)}
                        className="mt-5 w-full py-2 rounded-xl text-xs font-bold transition-colors bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                      >
                        ✓ Aprobar Pago
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Emitir Comunicado */}
            <section className="bg-[#0a0a16] rounded-3xl border border-[#1e1e38] p-8 shadow-xl">
              <h3 className="font-semibold text-lg mb-6 text-white tracking-wide flex items-center gap-2">
                <span>📢</span> Emitir Comunicado Oficial
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">TÍTULO DEL AVISO</label>
                  <input 
                    type="text" 
                    value={tituloAviso}
                    onChange={(e) => setTituloAviso(e.target.value)}
                    className="w-full bg-[#111122] border border-[#1e1e38] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c084fc]"
                    placeholder="Ej. Fumigación el Viernes"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">MENSAJE PARA LOS RESIDENTES</label>
                  <textarea 
                    value={contenidoAviso}
                    onChange={(e) => setContenidoAviso(e.target.value)}
                    className="w-full bg-[#111122] border border-[#1e1e38] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c084fc] h-32 resize-none"
                    placeholder="Detalles importantes..."
                  ></textarea>
                </div>
                <button 
                  onClick={enviarComunicado}
                  disabled={!tituloAviso || !contenidoAviso}
                  className="w-full py-3 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-[#3b82f6]/20 transition-colors"
                >
                  Enviar a Todos los Móviles
                </button>
              </div>
            </section>

            {/* Crear Votación */}
            <section className="bg-[#0a0a16] rounded-3xl border border-[#1e1e38] p-8 shadow-xl">
              <h3 className="font-semibold text-lg mb-6 text-white tracking-wide flex items-center gap-2">
                <span>🗳️</span> Crear Asamblea Virtual (Votación)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">PREGUNTA A DEBATIR</label>
                  <input 
                    type="text" 
                    value={preguntaEncuesta}
                    onChange={(e) => setPreguntaEncuesta(e.target.value)}
                    className="w-full bg-[#111122] border border-[#1e1e38] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c084fc]"
                    placeholder="Ej. ¿Aprobamos el presupuesto de pintura?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">OPCIONES (SEPARADAS POR COMA)</label>
                  <input 
                    type="text" 
                    value={opcionesEncuesta}
                    onChange={(e) => setOpcionesEncuesta(e.target.value)}
                    className="w-full bg-[#111122] border border-[#1e1e38] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c084fc]"
                    placeholder="Ej. Si apruebo, No apruebo, Me abstengo"
                  />
                </div>
                <button 
                  onClick={crearVotacion}
                  disabled={!preguntaEncuesta || !opcionesEncuesta}
                  className="w-full py-3 bg-[#c084fc] hover:bg-[#a855f7] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-[#c084fc]/20 transition-colors"
                >
                  Abrir Urnas de Votación
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
