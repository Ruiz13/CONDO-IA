import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Vote, LayoutDashboard, Settings, FileText, Loader2, Megaphone, Bot, Trash2, TrendingUp, TrendingDown, Clock, Download, CalendarDays, Check, X, RefreshCw, Upload, CheckCircle, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
const PIE_COLORS = ['#34d399', '#f472b6']; // Emerald para Solventes, Pink para Morosos

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
  const morosidadRef = useRef<HTMLDivElement>(null);
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
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', appliesTo: 'ALL', providerName: '', providerInvoice: '', observation: '' });
  const [creatingExpense, setCreatingExpense] = useState(false);
  const [generatingInvoices, setGeneratingInvoices] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [approvingPayment, setApprovingPayment] = useState<string | null>(null);

  // Conciliacion State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [parsingFile, setParsingFile] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [reconciliationResults, setReconciliationResults] = useState<any>(null);

  // Reservas
  const [reservations, setReservations] = useState<any[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

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
      if (activeTab === 'reservas') fetchReservations();
      if (activeTab === 'perfil') fetchTenantConfig();
    }
  }, [user, activeTab, selectedYear, selectedMonth]);

  const fetchReservations = async () => {
    setLoadingReservations(true);
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/reservations`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) setReservations(await res.json());
    } catch (e) { console.error(e); }
    setLoadingReservations(false);
  };

  const handleUpdateReservationStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/reservations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Reserva ${status === 'APPROVED' ? 'Aprobada' : 'Rechazada'} exitosamente`);
        fetchReservations();
      } else {
        toast.error('Error al actualizar estado');
      }
    } catch (e) { toast.error('Error de conexión'); }
  };

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
    let downloaded = false;
    
    const downloadSvgAsPng = (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
      return new Promise<void>((resolve, reject) => {
        try {
          if (!ref.current) return reject("Ref no existe");
          const svg = ref.current.querySelector('svg');
          if (!svg) return reject("No se encontró el SVG del gráfico");
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const data = (new XMLSerializer()).serializeToString(svg);
          const DOMURL = window.URL || window.webkitURL || window;
          const img = new Image();
          const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
          const url = DOMURL.createObjectURL(svgBlob);
          
          img.onload = () => {
            // Darle un fondo oscuro
            canvas.width = img.width + 40;
            canvas.height = img.height + 40;
            if (ctx) {
              ctx.fillStyle = '#0a0a16';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 20, 20);
            }
            DOMURL.revokeObjectURL(url);
            
            const imgURI = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            const link = document.createElement('a');
            link.download = filename;
            link.href = imgURI;
            link.click();
            resolve();
          };
          img.onerror = (e) => reject("Error al cargar SVG en la imagen: " + e);
          img.src = url;
        } catch (err) {
          reject(err);
        }
      });
    };

    try {
      if (chartRef.current && financialData.length > 0) {
        await downloadSvgAsPng(chartRef, `Grafico_Comparativa_${user.tenantName}.png`);
        downloaded = true;
      }
      
      if (morosidadRef.current && stats.morosidadData && stats.morosidadData.length > 0) {
        await downloadSvgAsPng(morosidadRef, `Grafico_Morosidad_${user.tenantName}.png`);
        downloaded = true;
      }

      if (downloaded) {
        toast.success('Gráficos descargados exitosamente');
      } else {
        toast.error('No hay datos visibles para descargar');
      }
    } catch (error: any) {
      console.error('Error descargando imagen:', error);
      toast.error('Hubo un error al generar la imagen: ' + (error.message || error.toString()));
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
          providerInvoice: newExpense.providerInvoice || null,
          observation: newExpense.observation || null
        })
      });
      if (res.ok) {
        setNewExpense({ description: '', amount: '', appliesTo: 'ALL', providerName: '', providerInvoice: '', observation: '' });
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
        fetchUnits();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setTransactions([]);
    setReconciliationResults(null);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      handleExcelUpload(file);
    } else if (ext === 'pdf') {
      handlePdfUpload(file);
    } else {
      toast.error('Tipo de archivo no soportado. Suba un archivo Excel (.xlsx/.xls), CSV o PDF.');
    }
  };

  const handleExcelUpload = (file: File) => {
    setParsingFile(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const parsedTransactions: any[] = [];
        
        let refColIdx = -1;
        let amountColIdx = -1;
        let dateColIdx = -1;
        let descColIdx = -1;
        
        if (json.length > 0) {
          for (let r = 0; r < Math.min(5, json.length); r++) {
            const row = json[r];
            if (!Array.isArray(row)) continue;
            for (let c = 0; c < row.length; c++) {
              const cellVal = String(row[c]).toLowerCase();
              if (cellVal.includes('ref') || cellVal.includes('operacion') || cellVal.includes('transaccion') || cellVal.includes('documento')) {
                refColIdx = c;
              }
              if (cellVal.includes('monto') || cellVal.includes('importe') || cellVal.includes('credito') || cellVal.includes('abono') || cellVal.includes('deposito') || cellVal.includes('monto total')) {
                amountColIdx = c;
              }
              if (cellVal.includes('fecha') || cellVal.includes('date')) {
                dateColIdx = c;
              }
              if (cellVal.includes('descrip') || cellVal.includes('concepto') || cellVal.includes('detalle') || cellVal.includes('motivo')) {
                descColIdx = c;
              }
            }
            if (refColIdx !== -1 && amountColIdx !== -1) {
              break;
            }
          }
        }
        
        const startRow = 1;
        
        for (let i = startRow; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length === 0) continue;
          
          let date = '';
          let description = '';
          let referenceNumber = '';
          let amount = 0;
          
          if (refColIdx !== -1 && amountColIdx !== -1) {
            date = dateColIdx !== -1 ? String(row[dateColIdx] || '') : '';
            description = descColIdx !== -1 ? String(row[descColIdx] || '') : '';
            referenceNumber = String(row[refColIdx] || '');
            amount = Number(String(row[amountColIdx] || '0').replace(/[^0-9.-]/g, ''));
          } else {
            for (const cell of row) {
              const strVal = String(cell).trim();
              if (/^\d{6,12}$/.test(strVal)) {
                referenceNumber = strVal;
              } else if (/^-?\d+(\.\d{1,2})?$/.test(strVal) && Number(strVal) !== 0) {
                const num = Number(strVal);
                if (num > 0) amount = num;
              }
            }
          }
          
          if (referenceNumber && amount > 0) {
            parsedTransactions.push({
              date: date || 'N/A',
              description: description || 'Depósito Bancario',
              referenceNumber,
              amount
            });
          }
        }
        
        setTransactions(parsedTransactions);
        toast.success(`Se extrajeron ${parsedTransactions.length} transacciones del Excel.`);
      } catch (err) {
        toast.error('Error al leer el archivo Excel.');
        console.error(err);
      } finally {
        setParsingFile(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handlePdfUpload = async (file: File) => {
    setParsingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/payments/reconciliation/parse-pdf`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
        toast.success(`Se extrajeron ${data.transactions.length} transacciones del PDF.`);
      } else {
        toast.error(data.error || 'Error al procesar el PDF');
      }
    } catch (err) {
      toast.error('Error al conectar con el servidor.');
      console.error(err);
    } finally {
      setParsingFile(false);
    }
  };

  const runReconciliation = async () => {
    setReconciling(true);
    try {
      const res = await fetch(`https://condo-ia-backend.onrender.com/api/payments/reconciliation/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions,
          adminId: user?.id
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReconciliationResults(data);
        toast.success('Conciliación completada exitosamente.');
        fetchPendingPayments();
      } else {
        toast.error(data.error || 'Error al procesar la conciliación');
      }
    } catch (err) {
      toast.error('Error de red al procesar conciliación.');
      console.error(err);
    } finally {
      setReconciling(false);
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
            onClick={() => setActiveTab('reservas')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'reservas' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="font-medium">Reservas</span>
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
            onClick={() => {
              setActiveTab('conciliacion');
              setUploadedFile(null);
              setTransactions([]);
              setReconciliationResults(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'conciliacion' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <RefreshCw className="w-5 h-5 text-purple-400" />
            <span className="font-medium">Conciliación</span>
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
        <div className="hidden print:flex flex-col items-center justify-center mb-8 border-b border-gray-200 pb-6 relative">
          <div className="absolute top-0 right-0 text-sm text-gray-500 font-bold">
            Fecha: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
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
                <div className="h-64 w-full" ref={morosidadRef}>
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
                  <div className="print:mb-6">
                    <label className="block text-sm text-gray-400 mb-1 print:text-gray-600 print:text-sm">Observación (Opcional)</label>
                    <textarea
                      value={newExpense.observation}
                      onChange={(e) => setNewExpense({ ...newExpense, observation: e.target.value })}
                      className="w-full bg-[#050512] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none print:bg-transparent print:border-none print:text-black print:font-bold print:text-lg print:p-0 resize-none h-24"
                      placeholder="Ej. Esta factura tiene soporte..."
                    />
                  </div>
                  {/* Signature lines specifically for printing */}
                  <div className="hidden print:flex justify-between items-end mt-24 pt-8">
                    <div className="text-center w-1/3 px-4">
                      <div className="border-b-2 border-black mb-2"></div>
                      <p className="text-black font-bold text-sm">Preparado por</p>
                      <p className="text-gray-500 text-xs">Administración</p>
                    </div>
                    <div className="text-center w-1/3 px-4">
                      <div className="border-b-2 border-black mb-2"></div>
                      <p className="text-black font-bold text-sm">Aprobado por</p>
                      <p className="text-gray-500 text-xs">Junta de Condominio</p>
                    </div>
                    <div className="text-center w-1/3 px-4">
                      <div className="border-b-2 border-black mb-2"></div>
                      <p className="text-black font-bold text-sm">Recibido por</p>
                      <p className="text-gray-500 text-xs">Firma / Sello</p>
                    </div>
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
                      {creatingExpense ? 'Registrando...' : '1. Registrar Gasto'}
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
                    Total Gastos Pendientes: <span>${expenses.filter((e: any) => !e.isBilled).reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0).toFixed(2)}</span>
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
                          .filter((e: any) => e.description.toLowerCase().includes(searchTermFinanzas.toLowerCase()) || e.providerName?.toLowerCase().includes(searchTermFinanzas.toLowerCase()))
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

        {activeTab === 'reservas' && (
          <div className="space-y-6">
            <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Gestión de Reservas (Áreas Comunes)</h3>
              <p className="text-sm text-gray-400 mb-6">Administra las solicitudes de reservación de áreas comunes realizadas por los residentes que están solventes.</p>
              
              {loadingReservations ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
              ) : reservations.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay reservas registradas.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 text-sm">
                        <th className="pb-3 px-4">Fecha Solicitada</th>
                        <th className="pb-3 px-4">Área</th>
                        <th className="pb-3 px-4">Residente</th>
                        <th className="pb-3 px-4">Estado</th>
                        <th className="pb-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((res: any) => (
                        <tr key={res.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 font-medium">{new Date(res.date).toLocaleDateString()}</td>
                          <td className="py-4 px-4 text-gray-300">
                            {res.area === 'POOL' ? 'Piscina' : res.area === 'GYM' ? 'Gimnasio' : 'Salón de Fiestas'}
                          </td>
                          <td className="py-4 px-4 text-gray-300">
                            <div className="text-sm">Apto {res.unit?.unitNumber}</div>
                            <div className="text-xs text-gray-500">{res.unit?.owner?.email}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                              res.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                              res.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {res.status === 'APPROVED' ? 'Aprobada' : res.status === 'REJECTED' ? 'Rechazada' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-end gap-2">
                              {res.status === 'PENDING' && (
                                <>
                                  <button onClick={() => handleUpdateReservationStatus(res.id, 'APPROVED')} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors" title="Aprobar">
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleUpdateReservationStatus(res.id, 'REJECTED')} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="Rechazar">
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
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


        {activeTab === 'conciliacion' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin-slow" />
                  Conciliación Bancaria Inteligente
                </h2>
                <p className="text-gray-400 mt-1">
                  Sube tu estado de cuenta en formato Excel (.xlsx/.xls), CSV o PDF para cruzar los pagos con los reportes de los propietarios.
                </p>
              </div>
            </div>

            {/* Main Area: Upload & Quick Steps */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-[#0a0a16] border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300 min-h-[250px]">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv,.pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={parsingFile || reconciling}
                />
                <div className="flex flex-col items-center justify-center text-center z-0 pointer-events-none">
                  {parsingFile ? (
                    <>
                      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                      <p className="text-white font-bold text-lg">Procesando y extrayendo transacciones...</p>
                      <p className="text-gray-500 text-sm mt-1">Nuestra IA y parseadores están leyendo el archivo</p>
                    </>
                  ) : uploadedFile ? (
                    <>
                      {uploadedFile.name.endsWith('.pdf') ? (
                        <FileText className="w-16 h-16 text-red-500 mb-4" />
                      ) : (
                        <FileSpreadsheet className="w-16 h-16 text-emerald-500 mb-4" />
                      )}
                      <p className="text-white font-bold text-lg">{uploadedFile.name}</p>
                      <p className="text-gray-500 text-sm mt-1">{(uploadedFile.size / 1024).toFixed(1)} KB — Listo para conciliar</p>
                      <button 
                        type="button"
                        className="mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-all text-xs"
                      >
                        Cambiar archivo
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-indigo-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-indigo-400" />
                      </div>
                      <p className="text-white font-bold text-lg">Arrastra tu archivo aquí o haz clic para buscar</p>
                      <p className="text-gray-500 text-sm mt-1">Formatos soportados: Excel (.xlsx, .xls), CSV, y estados de cuenta PDF</p>
                    </>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">¿Cómo funciona?</h3>
                <ol className="space-y-4 text-sm text-gray-400 list-decimal list-inside">
                  <li>
                    <strong className="text-white">Sube el archivo</strong> de tu banco.
                  </li>
                  <li>
                    El sistema <strong className="text-white">extrae los ingresos</strong> (depósitos y abonos) detectando el número de referencia y monto.
                  </li>
                  <li>
                    Presiona <strong className="text-white">Iniciar Conciliación</strong> para buscar coincidencias con los reportes de tus residentes.
                  </li>
                  <li>
                    Los pagos que coincidan exactamente se aprobarán y acreditarán automáticamente.
                  </li>
                </ol>
              </div>
            </div>

            {/* Preview Section */}
            {transactions.length > 0 && !reconciliationResults && (
              <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">Transacciones Bancarias Detectadas</h3>
                    <p className="text-gray-400 text-xs mt-1">
                      Verifique que las referencias y montos se hayan extraído correctamente antes de iniciar.
                    </p>
                  </div>
                  <button
                    onClick={runReconciliation}
                    disabled={reconciling}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {reconciling ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Conciliando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        Ejecutar Conciliación
                      </>
                    )}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400">
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4">Descripción</th>
                        <th className="py-3 px-4">Referencia</th>
                        <th className="py-3 px-4 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transactions.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-xs font-mono">{tx.date}</td>
                          <td className="py-3 px-4 text-xs max-w-xs truncate">{tx.description}</td>
                          <td className="py-3 px-4 font-mono font-bold text-indigo-400 text-xs">{tx.referenceNumber}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">${Number(tx.amount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Results Section */}
            {reconciliationResults && (
              <div className="space-y-6">
                {/* Scorecards */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 text-xs font-semibold block uppercase tracking-wider">Conciliados (Auto-Aprobados)</span>
                      <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">{reconciliationResults.matchedCount}</span>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-full">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>
                  <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 text-xs font-semibold block uppercase tracking-wider">No Encontrados en Sistema</span>
                      <span className="text-3xl font-extrabold text-yellow-500 mt-1 block">{reconciliationResults.unmatchedBankCount}</span>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-full">
                      <X className="w-8 h-8 text-yellow-400" />
                    </div>
                  </div>
                  <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 text-xs font-semibold block uppercase tracking-wider">Pagos en Sistema sin Confirmar</span>
                      <span className="text-3xl font-extrabold text-indigo-400 mt-1 block">{reconciliationResults.unmatchedSystemCount}</span>
                    </div>
                    <div className="p-3 bg-indigo-500/10 rounded-full">
                      <Clock className="w-8 h-8 text-indigo-400" />
                    </div>
                  </div>
                </div>

                {/* Tabs to show details */}
                <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-6 space-y-6">
                  <h3 className="text-lg font-bold text-white">Detalle de la Conciliación</h3>

                  <div className="space-y-8">
                    {/* Matched Payments */}
                    {reconciliationResults.matched.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Pagos Conciliados y Aprobados Correctamente ({reconciliationResults.matched.length})
                        </h4>
                        <div className="overflow-x-auto border border-white/5 rounded-xl">
                          <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-white/5 text-gray-400">
                              <tr>
                                <th className="py-2.5 px-4">Unidad</th>
                                <th className="py-2.5 px-4">Referencia</th>
                                <th className="py-2.5 px-4 text-right">Monto</th>
                                <th className="py-2.5 px-4">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {reconciliationResults.matched.map((item: any, idx: number) => (
                                <tr key={idx}>
                                  <td className="py-3 px-4 font-semibold text-white">{item.payment.unit?.unitNumber || 'Sistema'}</td>
                                  <td className="py-3 px-4 font-mono text-xs">{item.payment.referenceNumber}</td>
                                  <td className="py-3 px-4 text-right font-mono font-bold text-white">${Number(item.payment.amount).toFixed(2)}</td>
                                  <td className="py-3 px-4">
                                    <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-full">APROBADO AUTO</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Unmatched Bank (Bank transactions not reported in system) */}
                    {reconciliationResults.unmatchedBank.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-yellow-500 flex items-center gap-2">
                          <X className="w-4 h-4" /> Depósitos en Cuenta Bancaria No Reportados en Condo IA ({reconciliationResults.unmatchedBank.length})
                        </h4>
                        <p className="text-xs text-gray-400">
                          Estos montos ingresaron al banco pero ningún propietario los ha registrado aún en la app móvil.
                        </p>
                        <div className="overflow-x-auto border border-white/5 rounded-xl">
                          <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-white/5 text-gray-400">
                              <tr>
                                <th className="py-2.5 px-4">Fecha</th>
                                <th className="py-2.5 px-4">Descripción Banco</th>
                                <th className="py-2.5 px-4">Referencia</th>
                                <th className="py-2.5 px-4 text-right">Monto</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {reconciliationResults.unmatchedBank.map((bankTx: any, idx: number) => (
                                <tr key={idx} className="text-gray-400">
                                  <td className="py-3 px-4 font-mono text-xs">{bankTx.date}</td>
                                  <td className="py-3 px-4 text-xs max-w-xs truncate">{bankTx.description}</td>
                                  <td className="py-3 px-4 font-mono text-xs text-yellow-500">{bankTx.referenceNumber}</td>
                                  <td className="py-3 px-4 text-right font-mono font-bold">${Number(bankTx.amount).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Unmatched System (Pending payments in system not in bank) */}
                    {reconciliationResults.unmatchedSystem.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Reportes de Copropietarios No Hallados en el Banco ({reconciliationResults.unmatchedSystem.length})
                        </h4>
                        <p className="text-xs text-gray-400">
                          Estos pagos fueron reportados por los residentes pero no se encontraron en este estado de cuenta. Requieren validación manual.
                        </p>
                        <div className="overflow-x-auto border border-white/5 rounded-xl">
                          <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-white/5 text-gray-400">
                              <tr>
                                <th className="py-2.5 px-4">Apto/Local</th>
                                <th className="py-2.5 px-4">Referencia Reportada</th>
                                <th className="py-2.5 px-4 text-right">Monto</th>
                                <th className="py-2.5 px-4">Acción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {reconciliationResults.unmatchedSystem.map((payment: any, idx: number) => (
                                <tr key={idx}>
                                  <td className="py-3 px-4 font-semibold text-white">{payment.unit?.unitNumber}</td>
                                  <td className="py-3 px-4 font-mono text-xs">{payment.referenceNumber}</td>
                                  <td className="py-3 px-4 text-right font-mono font-bold text-white">${Number(payment.amount).toFixed(2)}</td>
                                  <td className="py-3 px-4">
                                    <button
                                      onClick={() => {
                                        setActiveTab('finanzas');
                                        toast.success('Redirigiendo a Finanzas para aprobación manual');
                                      }}
                                      className="text-xs px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all"
                                    >
                                      Revisar Manual
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
