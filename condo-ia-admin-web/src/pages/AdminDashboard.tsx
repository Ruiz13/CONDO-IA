import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Vote, LayoutDashboard, Settings, FileText, Loader2, Megaphone, Bot, Trash2, TrendingUp, TrendingDown, Clock, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
const PIE_COLORS = ['#34d399', '#f472b6']; // Emerald para Solventes, Pink para Morosos
import html2canvas from 'html2canvas';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('resumen');
  
  // Estados para filtros
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState('ALL'); // 'ALL' o '0' a '11'
  const [rawFinancialData, setRawFinancialData] = useState<{payments: any[], expenses: any[]}>({ payments: [], expenses: [] });

  const [stats, setStats] = useState<{ingresosDelMes: number, gastosDelMes: number, pagosPorAprobar: number, totalResidentes: number, morosidadData: any[], consultasIA: any[]}>({ ingresosDelMes: 0, gastosDelMes: 0, pagosPorAprobar: 0, totalResidentes: 0, morosidadData: [], consultasIA: [] });
  const [financialData, setFinancialData] = useState<any[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [polls, setPolls] = useState<any[]>([]);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState('');
  const [creatingPoll, setCreatingPoll] = useState(false);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementImage, setAnnouncementImage] = useState<File | null>(null);
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);

  const [auditMessages, setAuditMessages] = useState<any[]>([]);

  const [knowledgeDocs, setKnowledgeDocs] = useState<any[]>([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocText, setNewDocText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [units, setUnits] = useState<any[]>([]);
  const [resetUnitEmail, setResetUnitEmail] = useState('');
  const [newGenericPassword, setNewGenericPassword] = useState('admin123');
  const [resettingPassword, setResettingPassword] = useState(false);

  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [tenantRif, setTenantRif] = useState('');
  const [tenantAddress, setTenantAddress] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [updatingTenantConfig, setUpdatingTenantConfig] = useState(false);

  // Finanzas State
  const [expenses, setExpenses] = useState<any[]>([]);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', appliesTo: 'ALL', providerName: '', providerInvoice: '' });
  const [creatingExpense, setCreatingExpense] = useState(false);
  const [generatingInvoices, setGeneratingInvoices] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [approvingPayment, setApprovingPayment] = useState<string | null>(null);

  // Filtros de Búsqueda
  const [searchTermResidentes, setSearchTermResidentes] = useState('');
  const [searchTermFinanzas, setSearchTermFinanzas] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    setUser(parsedUser);
    setProfileEmail(parsedUser.email);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      if (activeTab === 'votaciones') fetchPolls();
      if (activeTab === 'comunicados') fetchAnnouncements();
      if (activeTab === 'auditoria-ia') fetchAuditMessages();
      if (activeTab === 'cerebro-ia') fetchKnowledgeDocs();
      if (activeTab === 'residentes') fetchUnits();
      if (activeTab === 'finanzas') {
        fetchExpenses();
        fetchPendingPayments();
        fetchUnits();
      }
      if (activeTab === 'resumen') {
        fetchStats();
        fetchFinancialDataForCharts();
        fetchUnits();
      }
      if (activeTab === 'perfil') fetchTenantConfig();
    }
  }, [user, activeTab]);

  const fetchTenantConfig = async () => {
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${user.tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setTenantRif(data.rif || '');
        setTenantAddress(data.address || '');
        setTenantPhone(data.phone || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/expenses/${user.tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/payments/pending`);
      if (res.ok) {
        const data = await res.json();
        setPendingPayments(data.filter((p: any) => p.tenantId === user.tenantId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${user.tenantId}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(prev => ({
          ...prev,
          ingresosDelMes: data.ingresosDelMes || 0,
          gastosDelMes: data.gastosDelMes || 0,
          pagosPorAprobar: data.pagosPorAprobar || 0,
          totalResidentes: data.totalResidentes || 0,
          morosidadData: data.morosidadData || [],
          consultasIA: data.consultasIA || []
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFinancialDataForCharts = async () => {
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${user.tenantId}/reports/financial`);
      if (res.ok) {
        const data = await res.json();
        setRawFinancialData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Efecto para filtrar la data financiera localmente
  useEffect(() => {
    let filteredPayments = rawFinancialData.payments || [];
    let filteredExpenses = rawFinancialData.expenses || [];

    if (selectedYear !== 'ALL') {
      filteredPayments = filteredPayments.filter(p => new Date(p.createdAt).getFullYear().toString() === selectedYear);
      filteredExpenses = filteredExpenses.filter(e => new Date(e.date).getFullYear().toString() === selectedYear);
    }

    if (selectedMonth !== 'ALL') {
      filteredPayments = filteredPayments.filter(p => new Date(p.createdAt).getMonth().toString() === selectedMonth);
      filteredExpenses = filteredExpenses.filter(e => new Date(e.date).getMonth().toString() === selectedMonth);
    }

    // Actualizar KPIs de ingresos/gastos filtrados (mantenemos residentes y pendientes igual)
    const ingresos = filteredPayments.reduce((acc, p) => acc + p.amount, 0);
    const gastos = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
    setStats(prev => ({ ...prev, ingresosDelMes: ingresos, gastosDelMes: gastos }));

    // Agrupar para el gráfico
    const groupedData: Record<string, { name: string; Ingresos: number; Gastos: number }> = {};
    const isDayView = selectedMonth !== 'ALL'; // Si hay un mes seleccionado, vemos día a día

    filteredPayments.forEach((p: any) => {
      const date = new Date(p.createdAt);
      const key = isDayView ? `${date.getDate()}` : `${date.getMonth() + 1}`;
      if (!groupedData[key]) groupedData[key] = { name: isDayView ? `Día ${key}` : `Mes ${key}`, Ingresos: 0, Gastos: 0 };
      groupedData[key].Ingresos += p.amount;
    });

    filteredExpenses.forEach((e: any) => {
      const date = new Date(e.date);
      const key = isDayView ? `${date.getDate()}` : `${date.getMonth() + 1}`;
      if (!groupedData[key]) groupedData[key] = { name: isDayView ? `Día ${key}` : `Mes ${key}`, Ingresos: 0, Gastos: 0 };
      groupedData[key].Gastos += e.amount;
    });

    const chartData = Object.keys(groupedData).map(k => ({ keyNum: Number(k), ...groupedData[k] })).sort((a, b) => a.keyNum - b.keyNum);
    setFinancialData(chartData);
  }, [rawFinancialData, selectedYear, selectedMonth]);

  const handleExportExcel = async () => {
    try {
      // Usar los datos filtrados en vez de hacer un nuevo fetch completo (o volver a filtrar aquí)
      let filteredPayments = rawFinancialData.payments;
      let filteredExpenses = rawFinancialData.expenses;

      if (selectedYear !== 'ALL') {
        filteredPayments = filteredPayments.filter(p => new Date(p.createdAt).getFullYear().toString() === selectedYear);
        filteredExpenses = filteredExpenses.filter(e => new Date(e.date).getFullYear().toString() === selectedYear);
      }

      if (selectedMonth !== 'ALL') {
        filteredPayments = filteredPayments.filter(p => new Date(p.createdAt).getMonth().toString() === selectedMonth);
        filteredExpenses = filteredExpenses.filter(e => new Date(e.date).getMonth().toString() === selectedMonth);
      }

      // Preparar hoja de Ingresos
      const ingresosSheet = filteredPayments.map((p: any) => ({
        'Fecha': new Date(p.createdAt).toLocaleDateString(),
        'Apartamento': p.unit?.unitNumber || 'N/A',
        'Monto ($)': p.amount,
        'Método': p.paymentMethod,
        'Referencia': p.referenceNumber || '',
        'Estado': p.status
      }));

      // Preparar hoja de Gastos
      const gastosSheet = filteredExpenses.map((e: any) => ({
        'Fecha': new Date(e.date).toLocaleDateString(),
        'Descripción': e.description,
        'Categoría': e.expenseCategory,
        'Tipo': e.isExtraordinary ? 'Extraordinario' : 'Ordinario',
        'Monto ($)': e.amount
      }));

      // Preparar hoja de Resumen Gráfico
      const resumenGraficoSheet = financialData.map(d => ({
        'Periodo': d.name,
        'Ingresos ($)': d.Ingresos,
        'Gastos ($)': d.Gastos,
        'Balance ($)': d.Ingresos - d.Gastos
      }));

      const wb = XLSX.utils.book_new();
      const wsIngresos = XLSX.utils.json_to_sheet(ingresosSheet.length > 0 ? ingresosSheet : [{ Mensaje: 'No hay ingresos' }]);
      const wsGastos = XLSX.utils.json_to_sheet(gastosSheet.length > 0 ? gastosSheet : [{ Mensaje: 'No hay gastos' }]);
      const wsResumen = XLSX.utils.json_to_sheet(resumenGraficoSheet.length > 0 ? resumenGraficoSheet : [{ Mensaje: 'No hay datos' }]);

      XLSX.utils.book_append_sheet(wb, wsIngresos, 'Ingresos');
      XLSX.utils.book_append_sheet(wb, wsGastos, 'Gastos');
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen_Grafico');

      const fileName = `Reporte_Contable_${user.tenantName.replace(/\s+/g, '_')}_${selectedYear}_${selectedMonth !== 'ALL' ? Number(selectedMonth)+1 : 'Todo'}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Reporte descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el reporte');
      console.error(error);
    }
  };

  const downloadChartImage = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, { backgroundColor: '#0a0a16' });
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `Grafico_Condominio_${user.tenantName}.png`;
        link.href = image;
        link.click();
        toast.success('Gráfico descargado exitosamente');
      } catch (error) {
        console.error('Error descargando imagen:', error);
        toast.error('Hubo un error al generar la imagen');
      }
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingExpense(true);
    try {
      const res = await fetch('https://condo-ia-backend.onrender.com/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: user.tenantId,
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          appliesTo: newExpense.appliesTo,
          providerName: newExpense.providerName || null,
          providerInvoice: newExpense.providerInvoice || null
        })
      });
      if (res.ok) {
        setNewExpense({ description: '', amount: '', appliesTo: 'ALL', providerName: '', providerInvoice: '' });
        fetchExpenses();
      } else {
        alert('Error al registrar gasto');
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setCreatingExpense(false);
    }
  };

  const handleGenerateInvoices = async () => {
    if (!window.confirm('¿Estás seguro de generar las facturas del mes para todos los residentes usando los gastos actuales?')) return;
    setGeneratingInvoices(true);
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/billing/generate/${user.tenantId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Facturación generada y recibos enviados con éxito');
        fetchExpenses();
      } else {
        alert(data.message || 'Error al generar facturas');
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setGeneratingInvoices(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) return;
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/expenses/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Gasto eliminado exitosamente');
        fetchExpenses();
      } else {
        alert('Error al eliminar gasto');
      }
    } catch (e) {
      alert('Error de conexión');
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    setApprovingPayment(paymentId);
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/payments/${paymentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user.id })
      });
      if (res.ok) {
        fetchPendingPayments();
        fetchStats();
      } else {
        alert('Error al aprobar pago');
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setApprovingPayment(null);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${user.tenantId}/units`);
      if (res.ok) {
        const data = await res.json();
        setUnits(data);
        fetchStats();
      }
    } catch (error) {
      console.error(error);
    }
  };


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUnitEmail) return;
    if (!window.confirm(`¿Estás seguro de restablecer la contraseña a "${newGenericPassword}" para el residente?`)) return;
    
    setResettingPassword(true);
    try {
      const res = await fetch('https://condo-ia-backend.onrender.com/api/auth/admin-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          targetEmail: resetUnitEmail,
          newPassword: newGenericPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Contraseña restablecida exitosamente');
        setResetUnitEmail('');
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleUpdateTenantConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingTenantConfig(true);
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${user.tenantId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rif: tenantRif,
          address: tenantAddress,
          phone: tenantPhone
        }),
      });
      if (res.ok) {
        toast.success('Configuración del edificio actualizada');
      } else {
        toast.error('Error al actualizar la configuración');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setUpdatingTenantConfig(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await fetch('https://condo-ia-backend.onrender.com/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          newEmail: profileEmail || undefined,
          newPassword: profilePassword || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Perfil actualizado con éxito. Por favor inicia sesión nuevamente con tus nuevos datos.');
        handleLogout();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const fetchPolls = async () => {
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/communications/polls/${user.tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setPolls(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPoll(true);
    const optionsArray = pollOptions.split(',').map(o => o.trim()).filter(o => o);
    try {
      const res = await fetch('https://condo-ia-backend.onrender.com/api/communications/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: user.tenantId,
          question: pollQuestion,
          options: optionsArray
        })
      });
      if (res.ok) {
        setPollQuestion('');
        setPollOptions('');
        fetchPolls();
      } else {
        alert('Error al publicar encuesta');
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setCreatingPoll(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/communications/announcements/${user.tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAuditMessages = async () => {
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/chat/audit/${user.tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setAuditMessages(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchKnowledgeDocs = async () => {
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/knowledge/${user.tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setKnowledgeDocs(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUploadPDF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/knowledge/${user.tenantId}/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setSelectedFile(null);
        fetchKnowledgeDocs();
        toast.success('Documento guardado y enseñado a la IA exitosamente');
      } else {
        toast.error('Error al subir documento');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleAddTextDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingDoc(true);
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/knowledge/${user.tenantId}/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newDocTitle, content: newDocText })
      });
      if (res.ok) {
        setNewDocTitle('');
        setNewDocText('');
        fetchKnowledgeDocs();
        toast.success('Texto guardado exitosamente');
      } else {
        toast.error('Error al guardar texto');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    // Usamos toast personalizado o confirmación simple
    if (!window.confirm('¿Seguro que deseas eliminar este documento? La IA ya no lo usará para responder.')) return;
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/knowledge/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchKnowledgeDocs();
        toast.success('Documento eliminado correctamente');
      }
    } catch (error) {
      toast.error('Error al eliminar');
      console.error(error);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAnnouncement(true);
    try {
      let imageUrl = undefined;
      
      // Si hay imagen, la subimos primero
      if (announcementImage) {
        const formData = new FormData();
        formData.append('file', announcementImage);
        
        const uploadRes = await fetch('https://condo-ia-backend.onrender.com/api/communications/announcements/upload', {
          method: 'POST',
          body: formData
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.imageUrl;
        } else {
          toast.error('Error al subir la imagen');
          setCreatingAnnouncement(false);
          return;
        }
      }

      // Luego creamos el comunicado
      const res = await fetch('https://condo-ia-backend.onrender.com/api/communications/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: user.tenantId,
          title: announcementTitle,
          content: announcementContent,
          imageUrl
        })
      });

      if (res.ok) {
        setAnnouncementTitle('');
        setAnnouncementContent('');
        setAnnouncementImage(null);
        fetchAnnouncements();
        toast.success('Comunicado publicado exitosamente');
      } else {
        toast.error('Error al publicar comunicado');
      }
    } catch (e) {
      toast.error('Error de conexión');
    } finally {
      setCreatingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este comunicado?')) return;
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/communications/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAnnouncements();
        toast.success('Comunicado eliminado correctamente');
      }
    } catch (error) {
      toast.error('Error al eliminar');
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050512] flex text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a16] border-r border-white/10 flex flex-col h-screen print:hidden">
        <div className="p-6 flex flex-col items-center gap-3 border-b border-white/10">
          <img src="/logo.png" alt="Condo IA Logo" className="w-40 h-auto drop-shadow-lg" />
          <div className="text-center">
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">{user?.tenantName || 'Mi Edificio'}</h1>
            <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'resumen' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Resumen</span>
          </button>
          
          <button
            onClick={() => setActiveTab('residentes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'residentes' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Residentes</span>
          </button>

          <button
            onClick={() => setActiveTab('finanzas')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'finanzas' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Finanzas</span>
          </button>

          <button
            onClick={() => setActiveTab('votaciones')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'votaciones' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Vote className="w-5 h-5" />
            <span className="font-medium">Asambleas</span>
          </button>
          
          <button
            onClick={() => setActiveTab('comunicados')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'comunicados' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Megaphone className="w-5 h-5" />
            <span className="font-medium">Comunicados</span>
          </button>
          
          <button
            onClick={() => setActiveTab('auditoria-ia')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'auditoria-ia' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Bot className="w-5 h-5" />
            <span className="font-medium">Auditoría IA</span>
          </button>
          
          <button
            onClick={() => setActiveTab('cerebro-ia')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'cerebro-ia' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Bot className="w-5 h-5 text-emerald-400" />
            <span className="font-medium">Cerebro IA</span>
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'perfil' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Mi Perfil</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative print:p-0">
        
        {/* Logo specifically for printing */}
        <div className="hidden print:flex flex-col items-center justify-center mb-8 border-b border-gray-200 pb-6">
          <img src="/logo.png" alt="Condo IA Logo" className="w-48 h-auto mb-2" />
          <h2 className="text-black text-2xl font-bold">Comprobante de Gasto</h2>
          <p className="text-gray-500 text-sm">Condominio: {user?.tenantName}</p>
        </div>

        {/* Decorative glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 pointer-events-none"></div>

        <header className="mb-8 flex justify-between items-end print:hidden">
          <div>
            <h2 className="text-3xl font-bold text-white capitalize">{activeTab}</h2>
            <p className="text-gray-400 mt-1">Gestión del Condominio</p>
          </div>
          <div className="flex items-center gap-3 bg-[#0a0a16] border border-white/10 px-4 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-300">{user.email}</span>
          </div>
        </header>

        {/* Tab Contents */}
        {activeTab === 'resumen' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold">Resumen Financiero y Operativo</h2>
              
              <div className="flex flex-wrap items-center gap-3">
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500"
                >
                  <option value="ALL">Todos los Años</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>

                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500"
                >
                  <option value="ALL">Todo el Año</option>
                  <option value="0">Enero</option>
                  <option value="1">Febrero</option>
                  <option value="2">Marzo</option>
                  <option value="3">Abril</option>
                  <option value="4">Mayo</option>
                  <option value="5">Junio</option>
                  <option value="6">Julio</option>
                  <option value="7">Agosto</option>
                  <option value="8">Septiembre</option>
                  <option value="9">Octubre</option>
                  <option value="10">Noviembre</option>
                  <option value="11">Diciembre</option>
                </select>

                <button 
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl font-medium shadow-lg transition-all text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Exportar a Excel
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="w-16 h-16 text-emerald-400" />
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-2 relative z-10">Ingresos ({selectedMonth !== 'ALL' ? 'Mes' : 'Total'})</h3>
                <p className="text-4xl font-bold text-emerald-400 relative z-10">${stats.ingresosDelMes.toFixed(2)}</p>
              </div>
              <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingDown className="w-16 h-16 text-pink-400" />
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-2 relative z-10">Gastos ({selectedMonth !== 'ALL' ? 'Mes' : 'Total'})</h3>
                <p className="text-4xl font-bold text-pink-400 relative z-10">${stats.gastosDelMes.toFixed(2)}</p>
              </div>
              <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Clock className="w-16 h-16 text-amber-400" />
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-2 relative z-10">Pagos por Aprobar</h3>
                <p className="text-4xl font-bold text-amber-400 relative z-10">{stats.pagosPorAprobar}</p>
              </div>
              <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users className="w-16 h-16 text-indigo-400" />
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-2 relative z-10">Total Residentes</h3>
                <p className="text-4xl font-bold text-indigo-400 relative z-10">{stats.totalResidentes}</p>
              </div>
            </div>

            {/* Gráfico de Ingresos vs Gastos */}
            <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 mt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Comparativa de Ingresos vs Gastos {selectedMonth !== 'ALL' ? '(Diaria)' : '(Mensual)'}</h3>
                <button 
                  onClick={downloadChartImage}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium shadow-lg transition-all text-sm"
                >
                  <Download className="w-4 h-4" />
                  Descargar Imagen
                </button>
              </div>
              <div className="h-80 w-full p-2" ref={chartRef}>
                {financialData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" stroke="#9ca3af" tick={{fill: '#9ca3af'}} />
                      <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af'}} tickFormatter={(value) => `$${value}`} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0a0a16', borderColor: '#ffffff20', color: '#fff', borderRadius: '8px' }}
                        itemStyle={{ fontWeight: 'bold' }}
                        formatter={(value: any) => [`$${value}`, undefined]}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="Ingresos" fill="#34d399" radius={[4, 4, 0, 0]} barSize={40} />
                      <Bar dataKey="Gastos" fill="#f472b6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <p>No hay datos financieros para mostrar en este periodo.</p>
                  </div>
                )}
              </div>
            </div>
            {/* Gráficos Adicionales: Morosidad y Consultas IA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Gráfico de Morosidad */}
              <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6">Estado de Morosidad (Mes Actual)</h3>
                <div className="h-64 w-full">
                  {stats.morosidadData && stats.morosidadData.length > 0 && stats.morosidadData.reduce((acc: number, curr: any) => acc + curr.value, 0) > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.morosidadData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                        >
                          {stats.morosidadData.map((_entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0a0a16', borderColor: '#ffffff20', color: '#fff' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <p>Aún no hay recibos emitidos en el mes.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Gráfico de Consultas IA */}
              <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6">Uso de la IA (Últimos 7 días)</h3>
                <div className="h-64 w-full">
                  {stats.consultasIA && stats.consultasIA.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.consultasIA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} allowDecimals={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#0a0a16', borderColor: '#ffffff20', color: '#fff', borderRadius: '8px' }}
                          cursor={{fill: '#ffffff10'}}
                        />
                        <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={30} name="Consultas" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <p>No hay consultas recientes.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'residentes' && (
          <div className="space-y-6">
            <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Restablecer Clave de Acceso</h3>
              <p className="text-sm text-gray-400 mb-6">Selecciona el residente y asígnale una clave temporal si ha perdido su acceso.</p>
              <form onSubmit={handleResetPassword} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Seleccionar Apartamento</label>
                  <select
                    value={resetUnitEmail}
                    onChange={(e) => setResetUnitEmail(e.target.value)}
                    className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none"
                    required
                  >
                    <option value="" disabled>Selecciona un residente...</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.owner?.email}>
                        {unit.unitNumber} - {unit.owner?.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nueva Clave Temporal</label>
                  <input
                    type="text"
                    value={newGenericPassword}
                    onChange={(e) => setNewGenericPassword(e.target.value)}
                    className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none"
                    required
                    placeholder="ej. admin123"
                  />
                </div>
                <div className="md:col-span-2 mt-2">
                  <button type="submit" disabled={resettingPassword || !resetUnitEmail} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">
                    {resettingPassword ? 'Actualizando...' : 'Restablecer Contraseña'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold">Lista de Residentes</h3>
                <div className="flex gap-3 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Buscar por apartamento o correo..."
                    value={searchTermResidentes}
                    onChange={(e) => setSearchTermResidentes(e.target.value)}
                    className="flex-1 bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={() => {
                      const ws = XLSX.utils.json_to_sheet(
                        units
                          .filter(u => u.unitNumber.toLowerCase().includes(searchTermResidentes.toLowerCase()) || u.owner?.email?.toLowerCase().includes(searchTermResidentes.toLowerCase()))
                          .map(u => ({ Apartamento: u.unitNumber, Correo: u.owner?.email || 'N/A', Alicuota: `${u.aliquotPercentage}%` }))
                      );
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Residentes');
                      XLSX.writeFile(wb, 'Lista_Residentes.csv');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl font-medium shadow-lg transition-all text-sm whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" /> CSV
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium shadow-lg transition-all text-sm whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4" /> PDF
                  </button>
                </div>
              </div>
              {units.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay apartamentos registrados aún.</p>
              ) : (
                <div className="overflow-x-auto" id="table-residentes">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400">
                        <th className="p-3 font-medium">Apartamento</th>
                        <th className="p-3 font-medium">Propietario (Correo)</th>
                        <th className="p-3 font-medium">Alícuota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units
                        .filter(unit => unit.unitNumber.toLowerCase().includes(searchTermResidentes.toLowerCase()) || unit.owner?.email?.toLowerCase().includes(searchTermResidentes.toLowerCase()))
                        .map((unit: any) => (
                        <tr key={unit.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3 font-bold text-white">{unit.unitNumber}</td>
                          <td className="p-3 text-gray-300">{unit.owner?.email}</td>
                          <td className="p-3 text-indigo-400">{unit.aliquotPercentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'finanzas' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 print:border-none print:p-0">
                <h3 className="text-xl font-bold mb-4 print:hidden">Registrar Gasto Mensual</h3>
                <form onSubmit={handleCreateExpense} className="space-y-4">
                  <div className="print:mb-6">
                    <label className="block text-sm text-gray-400 mb-1 print:text-gray-600 print:text-sm">Descripción del Gasto</label>
                    <input
                      type="text"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none print:bg-transparent print:border-none print:text-black print:font-bold print:text-2xl print:p-0"
                      placeholder="Ej. Conserje, Mantenimiento Ascensor"
                      required
                    />
                  </div>
                  <div className="print:mb-6">
                    <label className="block text-sm text-gray-400 mb-1 print:text-gray-600 print:text-sm">Monto ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none print:bg-transparent print:border-none print:text-black print:font-bold print:text-2xl print:p-0"
                      required
                    />
                  </div>
                  <div className="print:mb-6">
                    <label className="block text-sm text-gray-400 mb-1 print:text-gray-600 print:text-sm">Proveedor (Opcional)</label>
                    <input
                      type="text"
                      value={newExpense.providerName}
                      onChange={(e) => setNewExpense({ ...newExpense, providerName: e.target.value })}
                      className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none print:bg-transparent print:border-none print:text-black print:font-bold print:text-2xl print:p-0"
                      placeholder="Ej. Ascensores C.A."
                    />
                  </div>
                  <div className="print:mb-6">
                    <label className="block text-sm text-gray-400 mb-1 print:text-gray-600 print:text-sm">N° Factura Proveedor (Opcional)</label>
                    <input
                      type="text"
                      value={newExpense.providerInvoice}
                      onChange={(e) => setNewExpense({ ...newExpense, providerInvoice: e.target.value })}
                      className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none print:bg-transparent print:border-none print:text-black print:font-bold print:text-2xl print:p-0"
                      placeholder="Ej. FAC-00123"
                    />
                  </div>
                  <div className="print:hidden">
                    <label className="block text-sm text-gray-400 mb-1">Aplica a</label>
                    <select
                      value={newExpense.appliesTo}
                      onChange={(e) => setNewExpense({ ...newExpense, appliesTo: e.target.value })}
                      className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none"
                    >
                      <option value="ALL">Todos (Aptos y Locales)</option>
                      <option value="APARTMENTS_ONLY">Solo Apartamentos</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4 print:hidden">
                    <button type="submit" disabled={creatingExpense} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">
                      {creatingExpense ? 'Registrando...' : '1. Guardar Gasto'}
                    </button>
                    <button type="button" onClick={() => window.print()} className="px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg">
                      <FileText className="w-5 h-5" /> 2. Imprimir Factura
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 flex flex-col print:hidden">
                <h3 className="text-xl font-bold mb-4">Emisión de Recibos</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Una vez que hayas registrado todos los gastos del mes, presiona el siguiente botón. El sistema calculará automáticamente la deuda de cada residente según su porcentaje de alícuota y generará los recibos pendientes.
                </p>
                <div className="mt-auto">
                  <div className="text-2xl font-bold text-white mb-2">
                    Total Gastos Pendientes: ${expenses.filter((e: any) => !e.isBilled).reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0).toFixed(2)}
                  </div>
                  <button 
                    onClick={handleGenerateInvoices}
                    disabled={generatingInvoices || expenses.filter((e: any) => !e.isBilled).length === 0} 
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {generatingInvoices ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Emitir Facturación Mensual'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 print:hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold">Gastos del Mes</h3>
                <div className="flex gap-3 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Buscar gastos, residentes o pagos..."
                    value={searchTermFinanzas}
                    onChange={(e) => setSearchTermFinanzas(e.target.value)}
                    className="flex-1 bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={() => {
                      const ws = XLSX.utils.json_to_sheet(
                        expenses
                          .filter(e => e.description.toLowerCase().includes(searchTermFinanzas.toLowerCase()) || e.providerName?.toLowerCase().includes(searchTermFinanzas.toLowerCase()))
                          .map((e: any) => ({ Descripcion: e.description, Aplica: e.appliesTo === 'ALL' ? 'Todos' : 'Solo Apartamentos', Monto: e.amount }))
                      );
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Gastos');
                      XLSX.writeFile(wb, 'Gastos_Mes.csv');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl font-medium shadow-lg transition-all text-sm whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" /> CSV
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium shadow-lg transition-all text-sm whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4" /> PDF
                  </button>
                </div>
              </div>
              {expenses.filter((e: any) => !e.isBilled).length === 0 ? (
                <p className="text-gray-400 text-center py-8">No has registrado gastos para este mes.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400">
                        <th className="p-3 font-medium">Descripción</th>
                        <th className="p-3 font-medium">Aplica a</th>
                        <th className="p-3 font-medium text-right">Monto</th>
                        <th className="p-3 font-medium text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses
                        .filter((expense: any) => !expense.isBilled)
                        .filter((expense: any) => expense.description.toLowerCase().includes(searchTermFinanzas.toLowerCase()) || expense.providerName?.toLowerCase().includes(searchTermFinanzas.toLowerCase()))
                        .map((expense: any) => (
                        <tr key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3 text-white">{expense.description}</td>
                          <td className="p-3 text-gray-400 text-sm">
                            {expense.appliesTo === 'ALL' ? 'Todos' : 'Solo Apartamentos'}
                          </td>
                          <td className="p-3 text-emerald-400 font-bold text-right">${expense.amount.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              title="Eliminar gasto"
                              className="text-red-400 hover:text-white p-2 hover:bg-red-500 rounded-lg transition-all duration-200 transform hover:scale-110"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 print:hidden">
              <h3 className="text-xl font-bold mb-4">Recibos Emitidos (Mes Actual)</h3>
              <p className="text-gray-400 text-sm mb-4">Aquí puedes ver los recibos que se han generado para los residentes.</p>
              {units.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay información de recibos.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400">
                        <th className="p-3 font-medium">Unidad</th>
                        <th className="p-3 font-medium">Propietario</th>
                        <th className="p-3 font-medium text-right">Deuda Mes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units
                        .filter(unit => unit.unitNumber.toLowerCase().includes(searchTermFinanzas.toLowerCase()) || unit.owner?.email?.toLowerCase().includes(searchTermFinanzas.toLowerCase()))
                        .map((unit: any) => {
                        const totalDeuda = (unit.invoices || [])
                          .filter((i: any) => i.status === 'PENDING' || i.status === 'PARTIAL')
                          .reduce((acc: number, curr: any) => acc + (curr.totalAmount - curr.amountPaid), 0);
                        return (
                          <tr key={unit.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-3 text-white font-bold">{unit.unitNumber}</td>
                            <td className="p-3 text-gray-400 text-sm">{unit.owner?.email || 'N/A'}</td>
                            <td className="p-3 text-emerald-400 font-bold text-right">${totalDeuda.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 print:hidden">
              <h3 className="text-xl font-bold mb-4">Pagos Pendientes por Aprobar</h3>
              {pendingPayments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay pagos pendientes de aprobación.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400">
                        <th className="p-3 font-medium">Fecha</th>
                        <th className="p-3 font-medium">Unidad</th>
                        <th className="p-3 font-medium">Monto</th>
                        <th className="p-3 font-medium">Referencia / Info IA</th>
                        <th className="p-3 font-medium text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPayments
                        .filter(payment => payment.unit?.unitNumber.toLowerCase().includes(searchTermFinanzas.toLowerCase()) || payment.referenceNumber?.toLowerCase().includes(searchTermFinanzas.toLowerCase()))
                        .map((payment: any) => (
                        <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3 text-gray-300">{new Date(payment.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 font-bold text-white">{payment.unit?.unitNumber}</td>
                          <td className="p-3 text-emerald-400 font-bold">${payment.amount.toFixed(2)}</td>
                          <td className="p-3 text-gray-400 text-sm">
                            <div>Ref: <span className="text-white">{payment.referenceNumber}</span></div>
                            {payment.ocrConfidence && (
                              <div className="text-indigo-400 text-xs flex items-center gap-1 mt-1">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                Extraído por IA ({(payment.ocrConfidence * 100).toFixed(0)}%)
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleApprovePayment(payment.id)}
                              disabled={approvingPayment === payment.id}
                              className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg font-medium transition-all text-sm disabled:opacity-50"
                            >
                              {approvingPayment === payment.id ? 'Aprobando...' : 'Aprobar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'votaciones' && (
          <div className="space-y-6">
            <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Crear Nueva Asamblea / Votación</h3>
              <form onSubmit={handleCreatePoll} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Pregunta Principal</label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none"
                    placeholder="Ej. ¿Pintamos la fachada de azul?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Opciones (separadas por coma)</label>
                  <input
                    type="text"
                    value={pollOptions}
                    onChange={(e) => setPollOptions(e.target.value)}
                    className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none"
                    placeholder="Sí, No, Me da igual"
                    required
                  />
                </div>
                <button type="submit" disabled={creatingPoll} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">
                  {creatingPoll ? 'Creando...' : 'Publicar Encuesta'}
                </button>
              </form>
            </div>

            <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Asambleas Activas</h3>
              {polls.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay asambleas creadas.</p>
              ) : (
                <div className="grid gap-4">
                  {polls.map((poll: any) => (
                    <div key={poll.id} className="p-4 border border-white/10 rounded-xl bg-white/5">
                      <h4 className="font-medium text-lg mb-3">{poll.question}</h4>
                      <div className="space-y-2">
                        {poll.options.map((opt: any) => (
                          <div key={opt.id} className="flex justify-between items-center text-sm text-gray-400 bg-[#050512] px-3 py-2 rounded-lg">
                            <span>{opt.text}</span>
                            <span className="font-bold text-indigo-400">{opt._count?.votes || 0} votos</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'comunicados' && (
          <div className="space-y-6">
            <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Redactar Nuevo Comunicado</h3>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Título / Asunto</label>
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none"
                    placeholder="Ej. Mantenimiento del ascensor"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cuerpo del Mensaje</label>
                  <textarea
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none min-h-[100px]"
                    placeholder="Detalles del aviso..."
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Adjuntar Archivo (Imagen o PDF)</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, application/pdf"
                    onChange={(e) => setAnnouncementImage(e.target.files?.[0] || null)}
                    className="w-full bg-[#050512]/50 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 transition-all cursor-pointer"
                  />
                  {announcementImage && (
                    <p className="text-xs text-emerald-400 mt-2">Archivo listo: {announcementImage.name}</p>
                  )}
                </div>
                <button type="submit" disabled={creatingAnnouncement} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">
                  {creatingAnnouncement ? 'Enviando...' : 'Enviar a Residentes'}
                </button>
              </form>
            </div>

            <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Historial de Comunicados</h3>
              {announcements.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No has enviado ningún comunicado.</p>
              ) : (
                <div className="grid gap-4">
                  {announcements.map((ann: any) => (
                    <div key={ann.id} className="p-4 border border-white/10 rounded-xl bg-white/5 group hover:border-indigo-500/50 transition-all duration-300">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-lg text-indigo-400">{ann.title}</h4>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500">{new Date(ann.createdAt).toLocaleDateString()}</span>
                          <button 
                            onClick={() => handleDeleteAnnouncement(ann.id)} 
                            title="Eliminar comunicado"
                            className="text-red-400 hover:text-white p-2 hover:bg-red-500 rounded-lg transition-all duration-200 transform hover:scale-110 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{ann.content}</p>
                      {ann.imageUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-white/10 max-w-sm">
                          {ann.imageUrl.toLowerCase().endsWith('.pdf') ? (
                            <div className="p-4 bg-indigo-900/30 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="w-6 h-6 text-indigo-400" />
                                <span className="text-sm text-indigo-200">Documento Adjunto</span>
                              </div>
                              <a href={`https://condo-ia-backend.onrender.com${ann.imageUrl}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 text-xs rounded-lg transition-colors">
                                Ver PDF
                              </a>
                            </div>
                          ) : (
                            <img src={`https://condo-ia-backend.onrender.com${ann.imageUrl}`} alt="Adjunto" className="w-full h-auto object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'auditoria-ia' && (
          <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Auditoría del Chat Inteligente</h3>
            <p className="text-gray-400 mb-6 text-sm">
              Aquí puedes revisar el historial global de conversaciones de todos los residentes con la Inteligencia Artificial del condominio.
            </p>
            {auditMessages.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No hay mensajes registrados aún.</p>
            ) : (
              <div className="grid gap-3">
                {auditMessages.map((msg: any) => (
                  <div key={msg.id} className={`p-4 rounded-xl border ${msg.isBot ? 'bg-indigo-900/20 border-indigo-500/20 ml-8' : 'bg-white/5 border-white/10 mr-8'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-gray-400">
                        {msg.isBot ? '🤖 Asistente Condo IA' : `👤 ${msg.user?.email || 'Usuario'}`}
                      </span>
                      <span className="text-[10px] text-gray-500">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-200">{msg.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cerebro-ia' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-indigo-500/30">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="text-emerald-400" /> Subir Documento Oficial (PDF/TXT)
                </h3>
                <p className="text-gray-400 text-sm mb-4">La IA leerá este archivo y basará sus respuestas en él.</p>
                <form onSubmit={handleUploadPDF} className="space-y-4">
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full bg-[#050512]/50 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 transition-all cursor-pointer"
                  />
                  <button type="submit" disabled={uploadingDoc || !selectedFile} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2">
                    {uploadingDoc ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Subir y Enseñar a la IA'}
                  </button>
                </form>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-indigo-500/30">
                <h3 className="text-xl font-bold mb-4">O Pegar Texto Directamente</h3>
                <p className="text-gray-400 text-sm mb-4">Pega reglamentos rápidos o reglas temporales.</p>
                <form onSubmit={handleAddTextDoc} className="space-y-4">
                  <input
                    type="text"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    placeholder="Título (Ej. Regla de la piscina)"
                    className="w-full bg-[#050512]/50 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 transition-all outline-none"
                    required
                  />
                  <textarea
                    value={newDocText}
                    onChange={(e) => setNewDocText(e.target.value)}
                    placeholder="Contenido del texto..."
                    className="w-full bg-[#050512]/50 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 transition-all outline-none min-h-[100px]"
                    required
                  />
                  <button type="submit" disabled={uploadingDoc} className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2">
                    {uploadingDoc ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Texto'}
                  </button>
                </form>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Memoria de la IA (Documentos Activos)</h3>
              {knowledgeDocs.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay documentos en la memoria de la IA.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {knowledgeDocs.map((doc: any) => (
                    <div key={doc.id} className="p-4 border border-white/10 rounded-xl bg-gradient-to-br from-white/5 to-transparent flex justify-between items-start group hover:border-indigo-500/50 transition-all duration-300">
                      <div>
                        <h4 className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{doc.title}</h4>
                        <span className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteDoc(doc.id)} 
                        title="Eliminar documento"
                        className="text-red-400 hover:text-white p-2 hover:bg-red-500 rounded-lg transition-all duration-200 transform hover:scale-110 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="space-y-8">
          <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Configuración de Administrador</h3>
            <p className="text-gray-400 mb-6 text-sm">
              Aquí puedes cambiar tu correo de administrador genérico por tu correo personal real y cambiar la clave temporal por una más segura.
            </p>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Correo Electrónico Actualizado</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nueva Contraseña (Opcional)</label>
                <input
                  type="password"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                  placeholder="Dejar en blanco para mantener la misma"
                />
              </div>
              <div className="pt-4">
                <button type="submit" disabled={updatingProfile} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">
                  {updatingProfile ? 'Guardando...' : 'Guardar Cambios de Perfil'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 max-w-2xl mt-8">
            <h3 className="text-xl font-bold mb-4">Configuración de Facturación del Edificio</h3>
            <p className="text-gray-400 mb-6 text-sm">
              Estos datos se imprimirán en la cabecera de los recibos de cobro y facturas en PDF.
            </p>
            <form onSubmit={handleUpdateTenantConfig} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">R.I.F del Condominio</label>
                <input
                  type="text"
                  value={tenantRif}
                  onChange={(e) => setTenantRif(e.target.value)}
                  className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                  placeholder="Ej. J-00000000-0"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                  placeholder="Ej. 0414-1234567"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Dirección Fiscal</label>
                <input
                  type="text"
                  value={tenantAddress}
                  onChange={(e) => setTenantAddress(e.target.value)}
                  className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                  placeholder="Ej. Caracas, Venezuela"
                />
              </div>
              <div className="pt-4">
                <button type="submit" disabled={updatingTenantConfig} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">
                  {updatingTenantConfig ? 'Guardando...' : 'Guardar Información Fiscal'}
                </button>
              </div>
            </form>
          </div>
          </div>
        )}
      </main>
    </div>
  );
}
