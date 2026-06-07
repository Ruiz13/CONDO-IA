import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, LogOut, Loader2, Users, Trash2, KeyRound, MapPin, Phone, Lock, Unlock, Eraser } from 'lucide-react';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Tenant Form
  const [tenantName, setTenantName] = useState('');
  const [floors, setFloors] = useState('');
  const [aptsPerFloor, setAptsPerFloor] = useState('');
  const [locales, setLocales] = useState('0');
  const [aptAliquot, setAptAliquot] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('Venezuela');
  const [phone, setPhone] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'SUPER_ADMIN') {
      navigate('/login');
      return;
    }
    fetchTenants();
  }, [navigate]);

  const fetchTenants = async () => {
    try {
      const res = await fetch('https://condo-ia-backend.onrender.com/api/tenants'); // We need to create this endpoint
      if (res.ok) {
        const data = await res.json();
        setTenants(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleDeleteTenant = async (tenantId: string, tenantName: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar todo el condominio "${tenantName}"? Esta acción borrará a todos los residentes, asambleas y pagos. Es irreversible.`)) return;
    
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${tenantId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchTenants();
      } else {
        const err = await res.json();
        alert(`Error al eliminar: ${err.message}`);
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedFloors = parseInt(floors);
    const parsedApts = parseInt(aptsPerFloor);
    const parsedLocales = locales ? parseInt(locales) : 0;
    const parsedAliquot = parseFloat(aptAliquot);

    if (isNaN(parsedFloors) || isNaN(parsedApts) || isNaN(parsedLocales) || isNaN(parsedAliquot)) {
      alert("Por favor, asegúrate de ingresar números válidos en todos los campos.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('https://condo-ia-backend.onrender.com/api/tenants/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tenantName,
          floors: parsedFloors,
          aptsPerFloor: parsedApts,
          locales: parsedLocales,
          aptAliquot: parsedAliquot,
          address,
          city,
          state,
          country,
          phone
        })
      });

      if (res.ok) {
        setShowModal(false);
        setTenantName('');
        setFloors('');
        setAptsPerFloor('');
        setLocales('0');
        setAptAliquot('');
        setAddress('');
        setCity('');
        setState('');
        setPhone('');
        fetchTenants();
      } else {
        const err = await res.json();
        alert(`Error al crear el edificio: ${err.message}`);
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (tenantId: string) => {
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${tenantId}/toggle-status`, { method: 'PATCH' });
      if (res.ok) {
        fetchTenants();
      } else {
        alert('Error al cambiar estado del edificio');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const handleLogoUpload = async (tenantId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      try {
        const res = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${tenantId}/logo`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoBase64: base64String })
        });
        if (res.ok) {
          alert('Logo actualizado correctamente');
          fetchTenants();
        } else {
          alert('Error al actualizar el logo');
        }
      } catch (error) {
        alert('Error de conexión');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetPassword = async (tenantId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres resetear la clave del administrador a "admin123"?')) return;
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${tenantId}/reset-admin-password`, { method: 'POST' });
      if (res.ok) {
        alert('Clave reseteada a admin123 correctamente');
      } else {
        alert('Error al resetear la clave');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const handleClearFinances = async (tenantId: string, tenantName: string) => {
    if (!window.confirm(`⚠️ MODO PRUEBA ⚠️\n\n¿Estás seguro de que quieres limpiar TODAS las finanzas (pagos, facturas, gastos) de "${tenantName}"?`)) return;
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${tenantId}/clear-finances`, { method: 'POST' });
      if (res.ok) {
        alert('Finanzas limpiadas correctamente');
      } else {
        alert('Error al limpiar las finanzas');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  return (
    <div className="min-h-screen bg-[#050512] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Condo IA Logo" className="w-32 h-auto drop-shadow-lg" />
            <div className="ml-2 border-l border-white/20 pl-4">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Súper Admin</h1>
              <p className="text-xs text-gray-400">Luis Alberto Ruiz</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Edificios Vendidos</h2>
            <p className="text-gray-400 mt-1">Gestión de tus clientes (Condominios)</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl font-medium shadow-lg shadow-emerald-500/25 transition-all"
          >
            <Plus className="w-5 h-5" />
            Vender a Nuevo Edificio
          </button>
        </div>

        {/* Grid de Edificios */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#0a0a16]">
            <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300">No hay edificios aún</h3>
            <p className="text-gray-500 mt-2">Vende tu primer Condo IA haciendo clic en el botón superior.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map(tenant => (
              <div key={tenant.id} className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${
                      tenant.isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {tenant.isActive ? 'Activo' : 'Suspendido'}
                    </span>
                    <label className="text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 p-2 rounded-lg cursor-pointer transition-colors" title="Subir Logo">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleLogoUpload(tenant.id, e.target.files[0]);
                          }
                        }}
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </label>
                    <button 
                      onClick={() => handleToggleStatus(tenant.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        tenant.isActive 
                          ? 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/10'
                          : 'text-emerald-500 hover:bg-emerald-500/10'
                      }`}
                      title={tenant.isActive ? "Suspender Condominio" : "Reactivar Condominio"}
                    >
                      {tenant.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleClearFinances(tenant.id, tenant.name)}
                      className="text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 p-2 rounded-lg transition-colors"
                      title="Limpiar Finanzas (Modo Prueba)"
                    >
                      <Eraser className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                      className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                      title="Eliminar Condominio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{tenant.name}</h3>
                
                {/* Contact Info */}
                {(tenant.address || tenant.phone) && (
                  <div className="flex flex-col gap-2 mb-4 p-3 bg-white/5 rounded-xl border border-white/5">
                    {tenant.address && (
                      <div className="flex items-start gap-2 text-xs text-gray-400">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-500" />
                        <span>{tenant.address}, {tenant.city}, {tenant.state}, {tenant.country}</span>
                      </div>
                    )}
                    {tenant.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Phone className="w-3.5 h-3.5 text-gray-500" />
                        <span>{tenant.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2 text-sm text-gray-400 mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>Admin: <span className="text-white">{tenant.users?.[0]?.email || 'N/A'}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pl-6 mt-1">
                    <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">Clave: Encriptada</span>
                    <button
                      onClick={() => handleResetPassword(tenant.id)}
                      className="flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 px-2 py-1 rounded transition-colors"
                      title="Resetear a admin123"
                    >
                      <KeyRound className="w-3 h-3" />
                      Resetear
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Crear Edificio */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a16] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Nuevo Edificio (Cliente)</h3>
              <p className="text-gray-400 text-sm mt-1">Se creará el condominio y su primer administrador.</p>
            </div>
            <form onSubmit={handleCreateTenant} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Edificio</label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#050512] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  placeholder="Ej. Res. Las Palmas"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cantidad de Pisos</label>
                  <input
                    type="number"
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                    className="w-full px-4 py-3 bg-[#050512] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="Ej. 10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Aptos por Piso</label>
                  <input
                    type="number"
                    value={aptsPerFloor}
                    onChange={(e) => setAptsPerFloor(e.target.value)}
                    className="w-full px-4 py-3 bg-[#050512] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="Ej. 4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Locales Comerciales</label>
                  <input
                    type="number"
                    value={locales}
                    onChange={(e) => setLocales(e.target.value)}
                    className="w-full px-4 py-3 bg-[#050512] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="Ej. 0 (Si no hay)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Alícuota por Apto (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={aptAliquot}
                    onChange={(e) => setAptAliquot(e.target.value)}
                    className="w-full px-4 py-3 bg-[#050512] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="Ej. 2.5"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-2">
                <h4 className="text-sm font-bold text-indigo-400 mb-4">Información de Contacto</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Dirección Exacta</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2 bg-[#050512] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="Ej. Av. Principal, Urb. Los Mangos"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Ciudad</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2 bg-[#050512] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                        placeholder="Ej. Caracas"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Estado</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-4 py-2 bg-[#050512] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                        placeholder="Ej. Miranda"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">País</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-2 bg-[#050512] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                        placeholder="Ej. Venezuela"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Teléfono de Contacto</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 bg-[#050512] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                        placeholder="Ej. +58 414 1234567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-purple-400 mt-2 text-center bg-purple-500/10 p-2 rounded-lg">
                El sistema creará automáticamente el correo del administrador genérico y las credenciales de cada apartamento usando el nombre del edificio.
              </p>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 flex items-center justify-center disabled:opacity-50"
                >
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear y Vender'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
