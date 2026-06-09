import { useNavigate } from 'react-router-dom';
import { Bot, Smartphone, ShieldCheck, CheckCircle2, ArrowRight, CalendarDays, Receipt } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const handleWhatsAppDemo = () => {
    const text = encodeURIComponent("Hola, estoy interesado en recibir una demostración de CONDO IA para mi edificio.");
    window.open(`https://wa.me/584241842770?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#050512] text-white font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Condo IA Logo" className="w-40 h-auto" />
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleWhatsAppDemo}
            className="hidden md:block px-5 py-2 text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
          >
            Agendar Demo
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20"
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center gap-12">
        {/* Glow Effects */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>

        <div className="flex-1 space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            El futuro de los condominios
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Gestión Inteligente con <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">Condo IA</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
            Automatiza pagos, controla reservas de áreas comunes y ofrece a tus residentes una experiencia Premium desde su celular.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleWhatsAppDemo}
              className="px-8 py-4 bg-white text-indigo-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-white/10"
            >
              Agendar Demostración
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="flex-1 relative z-10 w-full">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/10">
            {/* Imagen de la chica en el monitor (Placeholder premium) */}
            <img 
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800" 
              alt="Administradora usando Condo IA" 
              className="w-full h-auto object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050512] via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Panel Administrativo</h3>
                  <p className="text-sm text-gray-300">Control total desde tu computadora</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 bg-[#0a0a16] border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Todo lo que necesitas, en un solo lugar</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Nuestra plataforma conecta a la junta de condominio con los residentes a través de herramientas de última generación.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-[#050512] border border-white/10 hover:border-indigo-500/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6">
                <CalendarDays className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Reservas de Áreas Comunes</h3>
              <p className="text-gray-400 leading-relaxed">
                Control automático para Piscina, Gimnasio y Salón de Fiestas. El sistema verifica la solvencia del residente en tiempo real antes de permitir la reserva.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-[#050512] border border-white/10 hover:border-indigo-500/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
                <Smartphone className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">App Móvil para Residentes</h3>
              <p className="text-gray-400 leading-relaxed">
                Los propietarios pueden reportar pagos con tecnología OCR, ver su estado de cuenta, votar en asambleas y acceder a la bitácora desde su celular.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-[#050512] border border-white/10 hover:border-indigo-500/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <Bot className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Inteligencia Artificial</h3>
              <p className="text-gray-400 leading-relaxed">
                Un asistente virtual (Cerebro IA) lee los comprobantes de pago automáticamente y responde dudas de los residentes 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Showcase */}
      <section className="py-24 max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 order-2 md:order-1 flex justify-center relative">
          {/* Decorative glow behind phone */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-30"></div>
          
          <div className="relative w-[300px] h-[600px] bg-black border-4 border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-900/50 flex flex-col items-center justify-center">
             <div className="absolute top-0 w-40 h-6 bg-gray-800 rounded-b-3xl z-20"></div>
             {/* Simulacro de pantalla de app */}
             <div className="w-full h-full bg-[#050512] flex flex-col pt-12 px-6">
                <h3 className="text-white text-xl font-bold mb-6">Hola, Residente</h3>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 shadow-lg shadow-indigo-500/30">
                  <p className="text-indigo-100 text-sm mb-1">Balance Actual</p>
                  <h2 className="text-3xl font-bold text-white">$ 0.00</h2>
                  <p className="text-emerald-300 text-xs mt-2 font-medium">¡Estás al día!</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2">
                    <Receipt className="w-6 h-6 text-indigo-400" />
                    <span className="text-xs text-gray-300 text-center">Pagar</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2">
                    <CalendarDays className="w-6 h-6 text-purple-400" />
                    <span className="text-xs text-gray-300 text-center">Reservas</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2">
                    <Bot className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs text-gray-300 text-center">Chat IA</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-blue-400" />
                    <span className="text-xs text-gray-300 text-center">Accesos</span>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 order-1 md:order-2">
          <h2 className="text-4xl font-bold mb-6">Tu Condominio en la Palma de tu Mano</h2>
          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="mt-1 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Pagos con OCR</h4>
                <p className="text-gray-400">La inteligencia artificial lee el comprobante por ti, extrae el monto y referencia automáticamente.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="mt-1 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Aprobación Inteligente</h4>
                <p className="text-gray-400">El sistema compara el pago con la deuda. Si cuadra perfecto, se aprueba solo en tiempo real.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="mt-1 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Asambleas y Comunicados</h4>
                <p className="text-gray-400">Votaciones en línea y avisos importantes directo al celular de cada residente.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-[#02020a] py-16 border-t border-white/10 text-center relative z-10">
        <h2 className="text-3xl font-bold mb-6">¿Listo para transformar tu edificio?</h2>
        <button 
          onClick={handleWhatsAppDemo}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-600/20"
        >
          Escríbenos al WhatsApp
        </button>
        <p className="text-gray-500 mt-8">© 2026 Condo IA. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
