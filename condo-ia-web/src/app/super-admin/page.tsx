"use client";
import React, { useState } from 'react';

export default function SuperAdminPage() {
  const [formData, setFormData] = useState({
    name: 'Residencias El Parque',
    floors: 11,
    aptsPerFloor: 4,
    locales: 7,
    aptAliquot: 1.62024,
    apiKey: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'name' || name === 'apiKey' ? value : Number(value)
    });
  };

  const handleDeploy = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('https://condo-ia-backend.onrender.com/api/tenants/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al desplegar el sistema');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050512] flex items-center justify-center p-6 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-3xl bg-[#0a0a16] rounded-3xl border border-[#c084fc]/30 p-10 shadow-2xl shadow-[#c084fc]/10">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Fábrica de Clientes <span className="text-[#c084fc]">(Super-Admin)</span>
          </h1>
          <p className="text-slate-400 mt-2">Despliega un condominio completo en 5 segundos.</p>
        </div>

        {result ? (
          <div className="bg-emerald-900/20 border border-emerald-500/30 p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">¡Despliegue Exitoso!</h2>
            <p className="text-slate-300 mb-6">{result.message}</p>
            
            <div className="bg-[#050512] rounded-xl p-6 text-left border border-[#1e1e38] space-y-3">
              <p className="text-sm"><span className="text-slate-500 w-32 inline-block">Condominio ID:</span> <span className="text-white font-mono">{result.tenantId}</span></p>
              <p className="text-sm"><span className="text-slate-500 w-32 inline-block">Admin Web:</span> <span className="text-blue-400 font-mono">{result.adminEmail}</span></p>
              <p className="text-sm"><span className="text-slate-500 w-32 inline-block">Clave Temporal:</span> <span className="text-amber-400 font-mono">CondoIA2026*</span></p>
              <p className="text-sm"><span className="text-slate-500 w-32 inline-block">Apartamentos:</span> <span className="text-white">{result.totalApts} creados</span></p>
              <p className="text-sm"><span className="text-slate-500 w-32 inline-block">Locales:</span> <span className="text-white">{result.totalLocales} creados</span></p>
            </div>
            
            <button 
              onClick={() => setResult(null)} 
              className="mt-8 px-6 py-2 bg-[#1e1e38] text-white rounded-lg hover:bg-[#334155] transition-colors"
            >
              Crear Otro Cliente
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 mb-2">NOMBRE DEL CONDOMINIO</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  className="w-full bg-[#111122] border border-[#1e1e38] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c084fc]"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">CANTIDAD DE PISOS</label>
                <input 
                  type="number" name="floors" value={formData.floors} onChange={handleChange}
                  className="w-full bg-[#111122] border border-[#1e1e38] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c084fc]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">APTOS POR PISO</label>
                <input 
                  type="number" name="aptsPerFloor" value={formData.aptsPerFloor} onChange={handleChange}
                  className="w-full bg-[#111122] border border-[#1e1e38] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c084fc]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">CANTIDAD DE LOCALES</label>
                <input 
                  type="number" name="locales" value={formData.locales} onChange={handleChange}
                  className="w-full bg-[#111122] border border-[#1e1e38] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c084fc]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">ALÍCUOTA BASE POR APTO (%)</label>
                <input 
                  type="number" step="0.00001" name="aptAliquot" value={formData.aptAliquot} onChange={handleChange}
                  className="w-full bg-[#111122] border border-[#c084fc]/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c084fc]"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 mb-2">GEMINI API KEY (OPCIONAL)</label>
                <input 
                  type="password" name="apiKey" value={formData.apiKey} onChange={handleChange}
                  className="w-full bg-[#111122] border border-[#1e1e38] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c084fc]"
                  placeholder="AIzaSyB..."
                />
              </div>
            </div>

            <button 
              onClick={handleDeploy}
              disabled={loading}
              className="w-full mt-8 py-4 bg-gradient-to-r from-[#c084fc] to-[#9333ea] hover:from-[#a855f7] hover:to-[#7e22ce] text-white font-bold text-lg rounded-xl shadow-lg shadow-[#c084fc]/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Construyendo Bases de Datos...' : '⚡ Desplegar Sistema del Cliente'}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">
              Esto generará {formData.floors * formData.aptsPerFloor + formData.locales} usuarios y aplicará un reseteo de clave obligatorio (CondoIA2026*).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
