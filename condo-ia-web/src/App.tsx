import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, ChevronRight, BarChart3, Smartphone, CheckCircle } from 'lucide-react';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-36 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Condo IA Logo" className="h-24 md:h-32 w-auto drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-transform hover:scale-105" />
          </div>
          <div className="flex items-center gap-6">
            <a href="https://condo-ia-admin-web.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
              Acceso Administradores
            </a>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Agendar Demostración
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mt-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-purple-400 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              El futuro de la gestión inmobiliaria
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight"
            >
              Inteligencia Artificial para <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                Condominios Modernos
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Automatice cobros, concilie pagos al instante con IA y mantenga a sus propietarios felices con transparencia total. Olvídese de las hojas de Excel.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                Agendar Demostración <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>

          {/* Explanation Section */}
          <div className="mt-32 flex flex-col md:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <img src="/admin_demo.png" alt="Admin Dashboard" className="w-full h-auto object-cover" />
                <div className="absolute bottom-6 left-6 z-20">
                  <div className="flex items-center gap-2 text-sm text-purple-300 font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md w-fit">
                    <CheckCircle className="w-4 h-4" /> Panel de Control Activo
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                Gestión profesional desde <span className="text-purple-400">su escritorio</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Nuestra plataforma está diseñada para administradores exigentes. Tendrá acceso a un panel de control avanzado donde podrá supervisar los ingresos, revisar el nivel de morosidad y aprobar pagos en tiempo real.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block text-white">Reportes con 1 Clic</strong>
                    <span className="text-gray-400">Descargue gráficos financieros listos para presentar en asambleas.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block text-white">Auditoría Transparente</strong>
                    <span className="text-gray-400">Genere comprobantes de gastos numerados con firmas autorizadas.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block text-white">Manejo de Inquilinos</strong>
                    <span className="text-gray-400">Suspenda accesos y comuníquese con morosos de forma automática.</span>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Mobile App Explanation Section */}
          <div className="mt-32 flex flex-col md:flex-row-reverse items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 max-w-sm mx-auto">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10"></div>
                <img src="/mobile_demo.png" alt="App Móvil Condo IA" className="w-full h-auto object-cover" />
                <div className="absolute bottom-6 left-6 z-20">
                  <div className="flex items-center gap-2 text-sm text-blue-300 font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md w-fit">
                    <Smartphone className="w-4 h-4" /> App para Residentes
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                El poder en la palma de <span className="text-blue-400">sus propietarios</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Brinde a los residentes de su edificio o locales comerciales una aplicación móvil premium. Desde consultar su balance de deuda hasta interactuar con nuestra IA para resolver dudas al instante.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-400 shrink-0" />
                  <div>
                    <strong className="block text-white">Reporte de Pagos con Inteligencia Artificial (OCR)</strong>
                    <span className="text-gray-400">Los usuarios solo toman una foto del recibo de transferencia y nuestra IA extrae el monto y número de referencia automáticamente, conciliando el pago en tiempo real.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-400 shrink-0" />
                  <div>
                    <strong className="block text-white">Chat Asistente 24/7</strong>
                    <span className="text-gray-400">Un chat interactivo (estilo WhatsApp) conectado a Gemini para que los residentes resuelvan dudas del reglamento interno a cualquier hora.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-400 shrink-0" />
                  <div>
                    <strong className="block text-white">Gestión de Áreas Comunes</strong>
                    <span className="text-gray-400">Permisos y reservaciones digitales para el Salón de Fiestas, Piscina y Gimnasio, verificando automáticamente que el residente no tenga morosidad para poder reservar.</span>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-32">
            <FeatureCard 
              icon={<Bot className="w-6 h-6 text-purple-400" />}
              title="Conciliación con IA"
              description="Nuestra IA lee los recibos y transferencias automáticamente, aprobando pagos al instante sin intervención humana."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-blue-400" />}
              title="Transparencia Financiera"
              description="Panel de control en tiempo real con exportación de reportes PDF y gráficos para las asambleas de propietarios."
            />
            <FeatureCard 
              icon={<Smartphone className="w-6 h-6 text-emerald-400" />}
              title="App para Residentes"
              description="Sus inquilinos y propietarios reportan pagos y revisan sus deudas desde una aplicación móvil premium."
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Condo IA. Todos los derechos reservados.</p>
      </footer>

      {/* Modal de Demostración */}
      {isModalOpen && <DemoModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function DemoModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ name: '', condo: '', units: '', phone: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = "584241842770";
    const text = `Hola, mi nombre es *${formData.name}*.\n\nEstoy interesado en agendar una demostración de *Condo IA* para mi condominio/centro comercial.\n\n*Datos:*\n- Edificio/CC: ${formData.condo}\n- Cantidad de inmuebles: ${formData.units}\n- Teléfono: ${formData.phone}\n\n¡Quedo atento para coordinar la llamada!`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-[#111] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          ✕
        </button>
        <h3 className="text-2xl font-bold mb-2">Agendar Demostración</h3>
        <p className="text-gray-400 text-sm mb-6">Llene estos datos rápidos y le contactaremos directamente por WhatsApp para coordinar.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="Ej. Juan Pérez" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Condominio / CC</label>
            <input required type="text" value={formData.condo} onChange={e => setFormData({...formData, condo: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="Ej. Residencias El Parque" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">Nº de Inmuebles</label>
              <input required type="number" value={formData.units} onChange={e => setFormData({...formData, units: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="Ej. 120" />
            </div>
            <div className="flex-[2]">
              <label className="block text-sm font-medium text-gray-300 mb-1">Su Teléfono</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="Ej. 0414-1234567" />
            </div>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium py-3 rounded-xl hover:opacity-90 transition-opacity mt-4 flex items-center justify-center gap-2">
            Enviar a WhatsApp
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

export default App;
