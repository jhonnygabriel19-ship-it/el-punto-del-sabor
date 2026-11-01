import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Utensils,
  Users,
  Package,
  FileText,
  TrendingUp,
  Settings,
  ShieldCheck,
  Bell,
  LogOut,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Truck,
  CreditCard,
  Lock,
  Sparkles,
  Edit3,
  Eye,
  RefreshCw,
  MapPin,
  Phone,
  UserCheck,
  Calculator,
  Award,
  Layers,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Smartphone,
  FileDown,
  Image as ImageIcon,
  Landmark
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';

// ==========================================
// INICIALIZACIÓN DE BASE DE DATOS EN LA NUBE (FIRESTORE)
// ==========================================
const appId = typeof __app_id !== 'undefined' ? __app_id : 'el-punto-del-sabor-app';
let db = null;
let auth = null;
try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
  }
} catch (err) {
  console.warn('Usando almacenamiento local de respaldo:', err);
}

function wrapCanvasText(ctx, text, maxWidth) {
  const words = String(text || '').split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx ? ctx.measureText(testLine) : { width: 0 };
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.length > 0 ? lines : [''];
}

const FALLBACK_BY_CATEGORY = {
  perros: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=700&q=80',
  combos: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?auto=format&fit=crop&w=700&q=80',
  hamburguesas: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80',
  papas: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=700&q=80',
  especialidades: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=700&q=80',
  postres: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=700&q=80',
  refrescos: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=700&q=80'
};

const VENEZUELAN_BANKS = [
  '0102 - Banco de Venezuela (BDV)',
  '0104 - Banco Venezolano de Crédito (BVC)',
  '0105 - Banco Mercantil',
  '0108 - BBVA Provincial',
  '0114 - Bancaribe',
  '0115 - Banco Exterior',
  '0134 - Banesco Banco Universal',
  '0151 - BFC Banco Fondo Común',
  '0156 - 100% Banco',
  '0163 - Banco del Tesoro',
  '0172 - Bancamiga',
  '0175 - Bicentenario',
  '0191 - BNC'
];

const INITIAL_USERS = [
  { id: 'usr_1', username: 'Michelle Sifontes', password: '21237816', role: 'Socia Administradora' },
  { id: 'usr_2', username: 'Jhonny Rivas', password: '19749698', role: 'Socio Administrador' }
];

const INITIAL_CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'perros', label: '🌭 Perros Calientes' },
  { id: 'combos', label: '🥤 Combos con Refresco' },
  { id: 'hamburguesas', label: '🍔 Hamburguesas' },
  { id: 'papas', label: '🍟 Papas Fritas' },
  { id: 'especialidades', label: '🧀 Tequeños y Tenders' },
  { id: 'postres', label: '🍨 Postres y Helados' },
  { id: 'refrescos', label: '🧊 Bebidas y Refrescos' }
];

const INITIAL_RECEIVING_ACCOUNTS = [
  { id: 'acc_1', name: 'BDV - Michelle Sifontes' },
  { id: 'acc_2', name: 'Mercantil - Jhonny Rivas' },
  { id: 'acc_3', name: 'Binance USDT - El Punto' },
  { id: 'acc_4', name: 'Caja Efectivo Local' }
];

const INITIAL_PAYMENT_METHODS = [
  { id: 'pm_1', name: 'Pago Móvil', requiresReference: true, details: '0424-9043122 / V-21237816 / Banco de Venezuela' },
  { id: 'pm_2', name: 'Binance (USDT)', requiresReference: true, details: 'michelle_binance@email.com' },
  { id: 'pm_3', name: 'Efectivo USD ($)', requiresReference: false, details: 'Pago al momento de la entrega' },
  { id: 'pm_4', name: 'Efectivo Bolívares', requiresReference: false, details: 'Pago al momento de la entrega' },
  { id: 'pm_5', name: 'Transferencia Bancaria', requiresReference: true, details: 'Solicitar cuenta al privado' },
  { id: 'pm_6', name: 'Zelle', requiresReference: true, details: 'solicitar_zelle@email.com' }
];

const INITIAL_DELIVERY_ZONES = [
  { id: 'zone_0', name: 'Retiro Personal / Punto de Entrega Acordado', fee: 0.00 },
  { id: 'zone_1', name: 'Zona Cercana (Hasta 2 km)', fee: 1.00 },
  { id: 'zone_2', name: 'Casco Central / Urbanizaciones Medias (3 a 5 km)', fee: 2.00 },
  { id: 'zone_3', name: 'Zona Larga / Periferia (6 a 9 km)', fee: 3.00 },
  { id: 'zone_4', name: 'Zona Extraurbana Especial (+10 km)', fee: 4.50 }
];

const INITIAL_PRODUCTS = [
  { id: 'prod_perro_1', name: 'Perro Caliente Clásico', category: 'perros', stage: 1, price: 1.80, cost: 0.75, stock: 60, minStock: 15, active: true, description: 'Pan suave, salchicha viena, papitas, queso y salsas.', image: FALLBACK_BY_CATEGORY.perros },
  { id: 'prod_combo_1', name: 'Combo 1: 2 Perros Clásicos + Refresco', category: 'combos', stage: 1, price: 4.20, cost: 1.85, stock: 45, minStock: 10, active: true, description: '2 Perros Clásicos + 1 Refresco 355ml.', image: FALLBACK_BY_CATEGORY.combos }
];

const STAGES_INFO = [
  { stage: 1, title: 'Etapa 1: Perros Calientes + Combos', status: 'Activa' },
  { stage: 2, title: 'Etapa 2: Hamburguesas', status: 'En Menú' },
  { stage: 3, title: 'Etapa 3: Papas Fritas', status: 'En Menú' },
  { stage: 4, title: 'Etapa 4: Tequeños, Tenders y Postres', status: 'En Menú' },
  { stage: 5, title: 'Etapa 5: Puesto Físico', status: 'Proyección' }
];

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
}

export default function App() {
  const [fbUser, setFbUser] = useState(null);
  const [cloudReady, setCloudReady] = useState(false);

  const [users, setUsers] = useState(() => loadFromStorage('epds_users_v2', INITIAL_USERS));
  const [categories, setCategories] = useState(() => loadFromStorage('epds_categories_v2', INITIAL_CATEGORIES));
  const [receivingAccounts, setReceivingAccounts] = useState(() => loadFromStorage('epds_recv_accs_v2', INITIAL_RECEIVING_ACCOUNTS));
  const [paymentMethods, setPaymentMethods] = useState(() => loadFromStorage('epds_pm_v2', INITIAL_PAYMENT_METHODS));
  const [deliveryZones, setDeliveryZones] = useState(() => loadFromStorage('epds_zones_v2', INITIAL_DELIVERY_ZONES));
  const [products, setProducts] = useState(() => loadFromStorage('epds_products_v2', INITIAL_PRODUCTS));
  const [customers, setCustomers] = useState(() => loadFromStorage('epds_customers_v2', []));
  const [expenses, setExpenses] = useState(() => loadFromStorage('epds_expenses_v2', []));
  const [sales, setSales] = useState(() => loadFromStorage('epds_sales_v2', []));
  const [supplyCatalog, setSupplyCatalog] = useState(() => loadFromStorage('epds_supply_catalog_v2', []));
  const [supplierCatalog, setSupplierCatalog] = useState(() => loadFromStorage('epds_supplier_catalog_v2', []));

  const [currentUser, setCurrentUser] = useState(() => INITIAL_USERS[0]);
  const [loginUsername, setLoginUsername] = useState('Michelle Sifontes');
  const [loginPassword, setLoginPassword] = useState('21237816');
  const [loginError, setLoginError] = useState('');

  const [isCustomerPublicView, setIsCustomerPublicView] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('vista') === 'menu' || window.location.hash.includes('menu-digital');
    } catch (e) { return false; }
  });
  
  const [showShareMenuModal, setShowShareMenuModal] = useState(false);
  const [businessWhatsApp, setBusinessWhatsApp] = useState(() => loadFromStorage('epds_whatsapp_v2', '0424-9043122'));
  const [customPublicUrl, setCustomPublicUrl] = useState(() => loadFromStorage('epds_custom_public_url_v2', ''));
  const [customerCart, setCustomerCart] = useState([]);
  const [customerFilterCat, setCustomerFilterCat] = useState('todos');
  const [customerSearch, setCustomerSearch] = useState('');

  const [customerOrderForm, setCustomerOrderForm] = useState({
    name: '', document: '', phone: '', address: '', zoneId: 'zone_1', paymentCondition: 'contado', paymentMethod: 'Pago Móvil', paymentReference: '', paymentSenderBank: '0102 - Banco de Venezuela (BDV)', notes: ''
  });

  const [activeTab, setActiveTab] = useState('pos');
  const [activeStageFilter, setActiveStageFilter] = useState('all');
  const [exchangeRate, setExchangeRate] = useState(() => loadFromStorage('epds_rate_v2', 45.50));
  const [bcvLastUpdate, setBcvLastUpdate] = useState(() => loadFromStorage('epds_bcv_last_update_v2', 'Sincronización pendiente'));
  const [isSyncingBCV, setIsSyncingBCV] = useState(false);

  const [securityDeletePin, setSecurityDeletePin] = useState(() => loadFromStorage('epds_delete_pin_v2', '2026'));
  const [newDeletePinInput, setNewDeletePinInput] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, title: '', description: '', onConfirm: null });
  const [deletePinAttempt, setDeletePinAttempt] = useState('');
  const [deletePinError, setDeletePinError] = useState('');

  const [notification, setNotification] = useState(null);
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    if (!auth) return;
    let isMounted = true;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => { if (isMounted && u) setFbUser(u); });
    return () => { isMounted = false; unsub(); };
  }, []);

  useEffect(() => {
    if (!db || !fbUser) return;
    const stateDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'epds_store', 'main_state');
    const unsub = onSnapshot(stateDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.users) && data.users.length > 0) setUsers(data.users);
        if (Array.isArray(data.categories) && data.categories.length > 0) setCategories(data.categories);
        if (Array.isArray(data.receivingAccounts) && data.receivingAccounts.length > 0) setReceivingAccounts(data.receivingAccounts);
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.deliveryZones)) setDeliveryZones(data.deliveryZones);
        if (Array.isArray(data.paymentMethods)) setPaymentMethods(data.paymentMethods);
        if (Array.isArray(data.customers)) setCustomers(data.customers);
        if (Array.isArray(data.expenses)) setExpenses(data.expenses);
        if (Array.isArray(data.sales)) setSales(data.sales);
        if (Array.isArray(data.supplyCatalog)) setSupplyCatalog(data.supplyCatalog);
        if (Array.isArray(data.supplierCatalog)) setSupplierCatalog(data.supplierCatalog);
        if (data.securityDeletePin) setSecurityDeletePin(data.securityDeletePin);
        if (data.businessWhatsApp) setBusinessWhatsApp(data.businessWhatsApp);
        setCloudReady(true);
      } else {
        setDoc(stateDocRef, {
          users, categories, receivingAccounts, products, deliveryZones, paymentMethods, customers, expenses, sales, supplyCatalog, supplierCatalog, securityDeletePin, businessWhatsApp, updatedAt: new Date().toISOString()
        }, { merge: true }).then(() => setCloudReady(true)).catch(() => setCloudReady(true));
      }
    });
    return () => unsub();
  }, [fbUser]);

  const persistToCloud = async (partialData) => {
    if (!db || !fbUser) return;
    try {
      const stateDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'epds_store', 'main_state');
      await setDoc(stateDocRef, { ...partialData, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) { }
  };

  const syncStateAndStorage = (key, stateValue) => {
    try { localStorage.setItem(key, JSON.stringify(stateValue)); } catch (e) {}
    if (cloudReady) persistToCloud({ [key.replace('epds_', '').replace('_v2', '')]: stateValue });
  };

  useEffect(() => syncStateAndStorage('epds_users_v2', users), [users, cloudReady]);
  useEffect(() => syncStateAndStorage('epds_categories_v2', categories), [categories, cloudReady]);
  useEffect(() => syncStateAndStorage('epds_recv_accs_v2', receivingAccounts), [receivingAccounts, cloudReady]);
  useEffect(() => syncStateAndStorage('epds_products_v2', products), [products, cloudReady]);
  useEffect(() => syncStateAndStorage('epds_zones_v2', deliveryZones), [deliveryZones, cloudReady]);
  useEffect(() => syncStateAndStorage('epds_pm_v2', paymentMethods), [paymentMethods, cloudReady]);
  useEffect(() => syncStateAndStorage('epds_customers_v2', customers), [customers, cloudReady]);
  useEffect(() => syncStateAndStorage('epds_expenses_v2', expenses), [expenses, cloudReady]);
  useEffect(() => syncStateAndStorage('epds_sales_v2', sales), [sales, cloudReady]);
  useEffect(() => syncStateAndStorage('epds_supply_catalog_v2', supplyCatalog), [supplyCatalog, cloudReady]);
  useEffect(() => syncStateAndStorage('epds_supplier_catalog_v2', supplierCatalog), [supplierCatalog, cloudReady]);

  useEffect(() => { try { localStorage.setItem('epds_rate_v2', JSON.stringify(exchangeRate)); } catch (e) {} }, [exchangeRate]);
  useEffect(() => { try { localStorage.setItem('epds_bcv_last_update_v2', JSON.stringify(bcvLastUpdate)); } catch (e) {} }, [bcvLastUpdate]);
  useEffect(() => { try { localStorage.setItem('epds_whatsapp_v2', JSON.stringify(businessWhatsApp)); } catch (e) {} if (cloudReady) persistToCloud({ businessWhatsApp }); }, [businessWhatsApp, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_delete_pin_v2', JSON.stringify(securityDeletePin)); } catch (e) {} if (cloudReady) persistToCloud({ securityDeletePin }); }, [securityDeletePin, cloudReady]);

  const [posSearch, setPosSearch] = useState('');
  const [posCategory, setPosCategory] = useState('todos');
  const [cart, setCart] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customDeliveryAddress, setCustomDeliveryAddress] = useState('');
  
  // Delivery Zone Autocomplete state
  const [zoneSearchInput, setZoneSearchInput] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');

  const [paymentCondition, setPaymentCondition] = useState('contado');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Pago Móvil');
  const [selectedReceivingAccountId, setSelectedReceivingAccountId] = useState('');

  const [paymentReference, setPaymentReference] = useState('');
  const [paymentSenderName, setPaymentSenderName] = useState('');
  const [paymentSenderDoc, setPaymentSenderDoc] = useState('');
  const [paymentSenderBank, setPaymentSenderBank] = useState('');
  const [isCustomBankEdit, setIsCustomBankEdit] = useState(false);
  const [paymentSenderPhone, setPaymentSenderPhone] = useState('');

  const [orderNotes, setOrderNotes] = useState('');
  const [lastInvoiceModal, setLastInvoiceModal] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null); // Nuevo estado modal confirmación
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Settings Forms
  const [newCategoryForm, setNewCategoryForm] = useState({ id: '', label: '' });
  const [newRecvAccForm, setNewRecvAccForm] = useState({ name: '' });
  const [newPaymentMethodForm, setNewPaymentMethodForm] = useState({ name: '', details: '' });

  const syncBCVExchangeRate = async (silent = false) => {
    setIsSyncingBCV(true);
    try {
      let fetchedRate = null;
      try {
        const res1 = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (res1.ok) {
          const data1 = await res1.json();
          if (data1 && Number(data1.promedio) > 0) fetchedRate = Number(Number(data1.promedio).toFixed(2));
        }
      } catch (err1) {}
      if (!fetchedRate) {
        try {
          const res2 = await fetch('https://open.er-api.com/v6/latest/USD');
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2?.rates?.VES && Number(data2.rates.VES) > 0) fetchedRate = Number(Number(data2.rates.VES).toFixed(2));
          }
        } catch (err2) {}
      }
      if (fetchedRate && fetchedRate > 0) {
        const nowFormatted = new Date().toLocaleString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
        setExchangeRate(fetchedRate);
        setBcvLastUpdate(`BCV ${nowFormatted}`);
        if (!silent) showNotification(`Tasa BCV actualizada: Bs. ${fetchedRate.toFixed(2)}/$`);
      } else if (!silent) {
        showNotification('Conexión fallida. Ajusta la tasa manualmente.', 'error');
      }
    } finally { setIsSyncingBCV(false); }
  };

  useEffect(() => { syncBCVExchangeRate(true); }, []);

  const requestAuthorizedDelete = (title, description, actionCallback) => {
    setDeletePinAttempt(''); setDeletePinError('');
    setDeleteModal({ isOpen: true, title, description, onConfirm: actionCallback });
  };

  const handleConfirmProtectedDelete = (e) => {
    e.preventDefault();
    if (deletePinAttempt.trim() !== securityDeletePin) {
      setDeletePinError('Clave especial incorrecta.');
      return;
    }
    if (typeof deleteModal.onConfirm === 'function') deleteModal.onConfirm();
    setDeleteModal({ isOpen: false, title: '', description: '', onConfirm: null });
  };

  const handleDeleteProduct = (prod) => {
    requestAuthorizedDelete(`Eliminar: ${prod.name}`, `¿Confirmas eliminar "${prod.name}" del catálogo?`, () => {
      setProducts(prev => prev.filter(item => item.id !== prod.id));
      setCart(prev => prev.filter(item => item.productId !== prod.id));
      showNotification(`Producto eliminado.`);
    });
  };

  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', document: '', phone: '', address: '', defaultZoneId: 'zone_1' });
  const [newZoneForm, setNewZoneForm] = useState({ name: '', fee: '' });

  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', category: 'perros', stage: 1, price: '', cost: '', stock: '', minStock: 10, description: '', image: '' });

  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().split('T')[0], type: 'insumo', category: '', description: '', amount: '', supplier: '', expectedYieldUnits: 100, consumedPercent: 20 });
  
  const [showSupplySuggestions, setShowSupplySuggestions] = useState(false);
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);

  const matchingSupplies = useMemo(() => supplyCatalog.filter(item => item.name.toLowerCase().includes((expenseForm.category || '').toLowerCase())), [supplyCatalog, expenseForm.category]);
  const matchingSuppliers = useMemo(() => supplierCatalog.filter(sup => sup.toLowerCase().includes((expenseForm.supplier || '').toLowerCase())), [supplierCatalog, expenseForm.supplier]);

  const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);
  const [passwordChangeForm, setPasswordChangeForm] = useState({ newPassword: '', confirmPassword: '' });
  const [newUserForm, setNewUserForm] = useState({ username: '', password: '', role: 'Operador de Ventas' });

  const handleSelectCustomerInPOS = (custId) => {
    setSelectedCustomerId(custId);
    const found = customers.find(c => c.id === custId);
    if (found) {
      setCustomDeliveryAddress(found.address);
      if (found.defaultZoneId) {
        setSelectedZoneId(found.defaultZoneId);
        const z = deliveryZones.find(dz => dz.id === found.defaultZoneId);
        if(z) setZoneSearchInput(`${z.name} - $${z.fee}`);
      }
      setPaymentSenderName(found.name || '');
      setPaymentSenderDoc(found.document || '');
      setPaymentSenderPhone(found.phone || '');
    }
  };

  const generateAndDownloadPDF = (title, subtitle, linesArray, filename = 'Documento.pdf') => {
    try {
      const width = 794; const marginX = 48; const contentWidth = width - marginX * 2; const lineHeight = 24;
      const measureCanvas = document.createElement('canvas'); const mCtx = measureCanvas.getContext('2d');
      const preparedBlocks = []; let calculatedHeight = 165;

      linesArray.forEach(line => {
        if (line.type === 'divider') { preparedBlocks.push({ type: 'divider' }); calculatedHeight += 18; }
        else if (line.type === 'header') { mCtx.font = 'bold 15px sans-serif'; const wrapped = wrapCanvasText(mCtx, line.text, contentWidth); preparedBlocks.push({ type: 'header', lines: wrapped }); calculatedHeight += wrapped.length * lineHeight + 6; }
        else if (line.type === 'total') { mCtx.font = 'bold 15px sans-serif'; const wrapped = wrapCanvasText(mCtx, line.text, contentWidth - 28); preparedBlocks.push({ type: 'total', lines: wrapped }); calculatedHeight += wrapped.length * 24 + 32; }
        else { mCtx.font = line.bold ? 'bold 13px sans-serif' : '13px sans-serif'; const wrapped = wrapCanvasText(mCtx, line.text, contentWidth); preparedBlocks.push({ type: 'text', bold: line.bold, lines: wrapped }); calculatedHeight += wrapped.length * lineHeight; }
      });

      const height = Math.max(1123, calculatedHeight + 70);
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#1c1917'; ctx.fillRect(0, 0, width, 120);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 25px sans-serif'; ctx.fillText('EL PUNTO DEL SABOR', marginX, 46);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 15px sans-serif'; ctx.fillText(wrapCanvasText(ctx, title, contentWidth)[0] || '', marginX, 74);
      ctx.fillStyle = '#d6d3d1'; ctx.font = '12px sans-serif'; ctx.fillText(wrapCanvasText(ctx, subtitle, contentWidth)[0] || '', marginX, 98);

      let y = 155;
      preparedBlocks.forEach(block => {
        if (block.type === 'divider') { ctx.strokeStyle = '#d6d3d1'; ctx.beginPath(); ctx.moveTo(marginX, y - 8); ctx.lineTo(width - marginX, y - 8); ctx.stroke(); y += 16; }
        else if (block.type === 'header') { ctx.fillStyle = '#9a3412'; ctx.font = 'bold 15px sans-serif'; block.lines.forEach(txtLine => { ctx.fillText(txtLine, marginX, y); y += lineHeight; }); y += 4; }
        else if (block.type === 'total') { const boxHeight = block.lines.length * 24 + 20; ctx.fillStyle = '#fef3c7'; ctx.fillRect(marginX, y - 18, contentWidth, boxHeight); ctx.strokeStyle = '#f59e0b'; ctx.strokeRect(marginX, y - 18, contentWidth, boxHeight); ctx.fillStyle = '#1c1917'; ctx.font = 'bold 14px sans-serif'; block.lines.forEach((txtLine, idx) => { ctx.fillText(txtLine, marginX + 14, y + idx * 23 + 4); }); y += boxHeight + 16; }
        else { ctx.fillStyle = '#292524'; ctx.font = block.bold ? 'bold 13px sans-serif' : '13px sans-serif'; block.lines.forEach(txtLine => { ctx.fillText(txtLine, marginX, y); y += lineHeight; }); }
      });

      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const link = document.createElement('a'); link.href = jpegDataUrl; link.setAttribute('download', filename.replace('.pdf', '.jpg')); document.body.appendChild(link); link.click(); document.body.removeChild(link);
      showNotification(`Documento (${filename}) generado como JPG compatible.`);
    } catch (error) { window.print(); }
  };

  const handleDownloadInvoicePDF = (invoice) => {
    const lines = [
      { type: 'header', text: `FACTURA / COMANDA: ${invoice.invoiceNumber}` },
      { text: `Fecha: ${invoice.date}   |   Cajero: ${invoice.cashier}`, bold: true },
      { type: 'divider' },
      { type: 'header', text: 'DATOS DEL CLIENTE Y ENVÍO' },
      { text: `Cliente: ${invoice.customerName}   |   Documento: ${invoice.customerDocument}` },
      { text: `Dirección: ${invoice.deliveryAddress}` },
      { text: `Ruta: ${invoice.deliveryZoneName} ($${Number(invoice.deliveryFee).toFixed(2)})` },
      { type: 'divider' },
      { type: 'header', text: 'PAGO Y CUENTA RECEPTORA' },
      { text: `Condición: ${invoice.paymentCondition.toUpperCase()}   |   Método: ${invoice.paymentMethod}` },
      { text: `Receptor (Interno): ${invoice.receivingAccountName || 'N/D'}`, bold: true },
      { text: `Referencia: ${invoice.paymentDetails?.reference || 'N/A'}` },
      { type: 'divider' },
      { type: 'header', text: 'DETALLE DE PRODUCTOS' },
      ...invoice.items.map(item => ({ text: `${item.qty}x ${item.name}  —  $${item.price.toFixed(2)} c/u  =  $${item.subtotal.toFixed(2)}`, bold: true })),
      { type: 'divider' },
      { type: 'total', text: `TOTAL FACTURA: $${Number(invoice.total).toFixed(2)} USD   (Bs. ${Number(invoice.totalBs).toFixed(2)})` }
    ];
    if (invoice.notes) lines.push({ text: `Nota: ${invoice.notes}`, bold: true });
    generateAndDownloadPDF(`Factura ${invoice.invoiceNumber}`, `Tasa aplicada: Bs. ${invoice.exchangeRateUsed}/$`, lines, `Factura_${invoice.invoiceNumber}.pdf`);
  };

  const exportToExcelCSV = (filename, headers, rows) => {
    const BOM = '\uFEFF';
    const csvLines = [headers.join(';'), ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))];
    const blob = new Blob([BOM + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.setAttribute('download', filename); document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showNotification(`Reporte Excel (.csv) descargado.`);
  };

  const handleExportFullBackupJSON = () => {
    const backup = { businessName: 'El Punto del Sabor', exportedAt: new Date().toISOString(), exchangeRate, users, categories, receivingAccounts, products, deliveryZones, paymentMethods, customers, expenses, sales, supplyCatalog, supplierCatalog };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.setAttribute('download', `Respaldo_EPDS_${new Date().toISOString().split('T')[0]}.json`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showNotification('Respaldo JSON descargado con éxito.');
  };

  const handleImportFullBackupJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        if (backup.products) setProducts(backup.products);
        if (backup.customers) setCustomers(backup.customers);
        if (backup.sales) setSales(backup.sales);
        if (backup.expenses) setExpenses(backup.expenses);
        if (backup.users) setUsers(backup.users);
        if (backup.deliveryZones) setDeliveryZones(backup.deliveryZones);
        if (backup.paymentMethods) setPaymentMethods(backup.paymentMethods);
        if (backup.categories) setCategories(backup.categories);
        if (backup.receivingAccounts) setReceivingAccounts(backup.receivingAccounts);
        showNotification('¡Base de datos restaurada correctamente desde JSON!');
      } catch (error) {
        showNotification('Error al leer el archivo JSON. Formato inválido.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const copyTextToClipboard = (text) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        setCopiedWhatsApp(true); setTimeout(() => setCopiedWhatsApp(false), 3000);
        showNotification('Copiado al portapapeles.');
      } else { throw new Error(); }
    } catch (err) {
      const textarea = document.createElement('textarea'); textarea.value = text; document.body.appendChild(textarea); textarea.select(); document.execCommand('copy'); document.body.removeChild(textarea);
      setCopiedWhatsApp(true); setTimeout(() => setCopiedWhatsApp(false), 3000);
      showNotification('Copiado al portapapeles (Fallback).');
    }
  };

  const availableCustomerProducts = useMemo(() => products.filter(p => Number(p.stock) > 0 && p.active !== false && (activeStageFilter === 'all' || Number(p.stage) <= Number(activeStageFilter))), [products, activeStageFilter]);

  const handleCopyDigitalMenuLink = () => {
    const shareUrl = customPublicUrl ? `${customPublicUrl.trim().split('?')[0]}?vista=menu#menu-digital` : 'https://elpuntodelsabor.vercel.app/?vista=menu#menu-digital';
    const message = `🌭 *MENÚ DIGITAL - EL PUNTO DEL SABOR* 🍔\n¡Hola! Te compartimos nuestro menú actualizado:\n\n🌐 *Enlace Web:* ${shareUrl}\n\n💳 *Cuentas para Pagos:*\n` +
      paymentMethods.map(pm => `• *${pm.name}*: ${pm.details || 'Consultar al DM'}`).join('\n') +
      `\n\n📲 *Pedidos WhatsApp:* ${businessWhatsApp}`;
    copyTextToClipboard(message);
    showNotification('¡Enlace y datos de pago copiados para WhatsApp!');
  };

  const filteredProducts = useMemo(() => products.filter(p => (posCategory === 'todos' || p.category === posCategory) && (activeStageFilter === 'all' || Number(p.stage) <= Number(activeStageFilter)) && (!posSearch || p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.description.toLowerCase().includes(posSearch.toLowerCase()))), [products, posCategory, activeStageFilter, posSearch]);

  const addToCart = (product) => setCart(prev => {
    const ex = prev.find(i => i.productId === product.id);
    if (ex) return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.price } : i);
    return [...prev, { productId: product.id, name: product.name, category: product.category, price: Number(product.price), cost: Number(product.cost), qty: 1, subtotal: Number(product.price) }];
  });

  const updateCartQty = (id, delta) => setCart(prev => prev.map(i => {
    if (i.productId !== id) return i;
    const newQty = i.qty + delta; return newQty > 0 ? { ...i, qty: newQty, subtotal: newQty * i.price } : null;
  }).filter(Boolean));

  const selectedZone = useMemo(() => deliveryZones.find(z => z.id === selectedZoneId) || { name: 'Sin ruta', fee: 0 }, [deliveryZones, selectedZoneId]);
  const cartSubtotal = useMemo(() => cart.reduce((acc, i) => acc + i.subtotal, 0), [cart]);
  const cartTotalCost = useMemo(() => cart.reduce((acc, i) => acc + i.cost * i.qty, 0), [cart]);
  const cartTotalUSD = cartSubtotal + Number(selectedZone.fee || 0);
  const cartTotalBs = cartTotalUSD * Number(exchangeRate || 1);

  const handlePrepareCheckout = () => {
    if (cart.length === 0) { showNotification('Agrega al menos un producto a la factura.', 'error'); return; }
    if (!customDeliveryAddress.trim()) { showNotification('La dirección de envío es obligatoria.', 'error'); return; }
    if (paymentCondition === 'contado' && selectedPaymentMethod === 'Pago Móvil' && !paymentReference.trim()) { showNotification('Ingresa la referencia de Pago Móvil.', 'error'); return; }
    
    const recvAccObj = receivingAccounts.find(a => a.id === selectedReceivingAccountId) || receivingAccounts[0] || { name: 'N/A' };
    const customerObj = customers.find(c => c.id === selectedCustomerId) || { id: 'cli_eventual', name: 'Cliente Delivery', phone: paymentSenderPhone || 'S/N', document: paymentSenderDoc || 'V-00000000' };

    const newInvoice = {
      id: `sale_${Date.now()}`, invoiceNumber: `EPDS-${1001 + sales.length}`, date: new Date().toISOString().split('T')[0], timestamp: new Date().toISOString(), cashier: currentUser.username,
      customerId: customerObj.id, customerName: customerObj.name, customerPhone: customerObj.phone, customerDocument: customerObj.document,
      deliveryAddress: customDeliveryAddress.trim(), deliveryZoneName: selectedZone.name, deliveryFee: Number(selectedZone.fee || 0),
      items: cart, subtotal: cartSubtotal, totalCost: cartTotalCost, total: cartTotalUSD, totalBs: cartTotalBs, exchangeRateUsed: exchangeRate,
      paymentCondition, creditPaid: paymentCondition === 'contado', paymentMethod: paymentCondition === 'credito' ? 'Crédito Pendiente' : selectedPaymentMethod,
      receivingAccountId: recvAccObj.id, receivingAccountName: recvAccObj.name,
      paymentDetails: {
        reference: paymentCondition === 'credito' ? 'Por Cobrar' : (paymentReference || 'N/A'),
        senderName: paymentSenderName || customerObj.name, senderDocument: paymentSenderDoc || customerObj.document,
        senderBank: paymentCondition === 'credito' ? 'Pendiente' : (paymentSenderBank || 'N/A')
      },
      notes: orderNotes
    };
    setPreviewInvoice(newInvoice); // Levanta el modal de revisión
  };

  const confirmCheckout = () => {
    if(!previewInvoice) return;
    setProducts(prev => prev.map(prod => {
      const sold = previewInvoice.items.find(i => i.productId === prod.id);
      return sold ? { ...prod, stock: Math.max(0, Number(prod.stock) - sold.qty) } : prod;
    }));
    setCustomers(prev => prev.map(c => c.id === previewInvoice.customerId ? { ...c, address: previewInvoice.deliveryAddress, defaultZoneId: selectedZoneId } : c));
    setSales(prev => [previewInvoice, ...prev]);
    setLastInvoiceModal(previewInvoice);
    setPreviewInvoice(null);
    setCart([]); setPaymentReference(''); setOrderNotes('');
    showNotification(`Factura ${previewInvoice.invoiceNumber} aprobada y registrada.`);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productForm, stage: Number(productForm.stage), price: Number(productForm.price), cost: Number(productForm.cost), stock: Number(productForm.stock), minStock: Number(productForm.minStock) } : p));
      showNotification('Producto actualizado.');
    } else {
      setProducts(prev => [{ id: `prod_${Date.now()}`, ...productForm, stage: Number(productForm.stage), price: Number(productForm.price), cost: Number(productForm.cost), stock: Number(productForm.stock), minStock: Number(productForm.minStock), active: true }, ...prev]);
      showNotification('Producto agregado.');
    }
    setEditingProduct(null); setProductForm({ name: '', category: 'perros', stage: 1, price: '', cost: '', stock: '', minStock: 10, description: '', image: '' });
  };

  const kpiMetrics = useMemo(() => {
    const totalSalesRevenue = sales.reduce((acc, s) => acc + Number(s.total || 0), 0);
    const totalInsumosExpenses = expenses.filter(e => e.type === 'insumo' || e.type === 'operativo').reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const totalInitialInvestment = expenses.filter(e => e.type === 'inversion').reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const alarms = products.filter(p => Number(p.stock) <= Number(p.minStock)).map(p => ({ id: p.id, severity: p.stock <= 5 ? 'critical' : 'warning', title: `Reposición: ${p.name}`, detail: `Quedan ${p.stock} uds.` }));
    return { totalSalesRevenue, totalInsumosExpenses, totalInitialInvestment, alarms, pendingCredit: sales.filter(s => s.paymentCondition === 'credito' && !s.creditPaid).reduce((acc, s) => acc + Number(s.total || 0), 0) };
  }, [sales, expenses, products]);

  if (isCustomerPublicView) {
    // Código de vista pública (resumido por espacio, usa la lógica ya existente)
    return (
      <div className="min-h-screen bg-stone-950 text-white p-5 text-center">
        <h1 className="text-2xl font-black text-amber-500 mb-4">Vista Clientes (Menú Digital)</h1>
        <p>Esta es la vista pública del cliente. Para volver al administrador:</p>
        <button onClick={() => setIsCustomerPublicView(false)} className="mt-4 px-4 py-2 bg-white text-black font-bold rounded-xl">Volver al POS</button>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <form onSubmit={e => { e.preventDefault(); const f = users.find(u => u.username === loginUsername && u.password === loginPassword); if (f) setCurrentUser(f); else setLoginError('Error credenciales'); }} className="bg-white p-6 rounded-3xl max-w-sm w-full">
          <h1 className="text-xl font-black text-center mb-4">EL PUNTO DEL SABOR</h1>
          <input type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} className="w-full mb-3 p-2 border rounded" placeholder="Usuario" />
          <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full mb-3 p-2 border rounded" placeholder="Clave" />
          <button type="submit" className="w-full p-3 bg-stone-900 text-amber-400 font-bold rounded-xl">Entrar</button>
        </form>
      </div>
    );
  }

  const dailyClosingSales = sales.filter(s => s.date === closingDate);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col [&_*]:scrollbar-thin [&_*]:scrollbar-thumb-stone-300">
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-bold transition-all ${notification.type === 'error' ? 'bg-red-900 text-white' : 'bg-stone-900 text-amber-400'}`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" /> <span>{notification.message}</span>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <header className="bg-stone-900 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-xl">🌭</div>
            <div>
              <h1 className="text-lg font-black leading-tight">EL PUNTO DEL SABOR</h1>
              <p className="text-[10px] text-stone-400">Op: {currentUser.username} | Tasa: Bs. {exchangeRate}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'pos', label: 'Facturación', icon: ShoppingBag },
              { id: 'catalog', label: 'Menú & Stock', icon: Utensils },
              { id: 'customers', label: 'Clientes & Rutas', icon: Users },
              { id: 'expenses', label: 'Compras', icon: Package },
              { id: 'architecture', label: 'Respaldos', icon: Download },
              { id: 'settings', label: 'Ajustes', icon: Settings }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab.id ? 'bg-amber-500 text-stone-900' : 'bg-stone-800 text-stone-300'}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
            <button onClick={() => setCurrentUser(null)} className="px-3 py-2 rounded-xl bg-red-900 text-red-100 text-xs font-bold"><LogOut className="w-4 h-4"/></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-4 py-5 flex-1">
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:h-[calc(100vh-140px)]">
            {/* PANEL IZQUIERDO: PRODUCTOS */}
            <div className="lg:col-span-7 overflow-y-auto space-y-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm flex flex-wrap gap-2 sticky top-0 z-10">
                <input type="text" value={posSearch} onChange={e => setPosSearch(e.target.value)} placeholder="Buscar..." className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 text-xs" />
                <div className="flex gap-1 overflow-x-auto">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setPosCategory(cat.id)} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap ${posCategory === cat.id ? 'bg-stone-900 text-amber-400' : 'bg-stone-100'}`}>{cat.label}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredProducts.map(prod => (
                  <div key={prod.id} onClick={() => addToCart(prod)} className="cursor-pointer bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:border-amber-400">
                    <img src={prod.image} alt={prod.name} className="h-24 w-full object-cover bg-stone-100" />
                    <div className="p-2">
                      <h3 className="font-extrabold text-[11px] leading-tight text-stone-900">{prod.name}</h3>
                      <div className="mt-1 flex justify-between items-center text-xs">
                        <strong className="text-stone-900">${Number(prod.price).toFixed(2)}</strong>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[9px]">+ Add</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PANEL DERECHO: FACTURA */}
            <div className="lg:col-span-5 bg-white p-5 rounded-3xl shadow-sm border border-stone-200 overflow-y-auto space-y-4">
              <h2 className="text-sm font-black border-b pb-2">Factura Delivery</h2>
              
              <div className="space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <select value={selectedCustomerId} onChange={e => handleSelectCustomerInPOS(e.target.value)} className="w-full p-2 border rounded-xl text-xs font-bold bg-white">
                  <option value="">Seleccionar Cliente Guardado...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
                <textarea rows="1" value={customDeliveryAddress} onChange={e => setCustomDeliveryAddress(e.target.value)} placeholder="Dirección de envío..." className="w-full p-2 border rounded-xl text-xs bg-white" />
                
                {/* BUSCADOR DE RUTAS CON DATALIST */}
                <input type="text" list="zones-list" value={zoneSearchInput} onChange={e => {
                  setZoneSearchInput(e.target.value);
                  const matched = deliveryZones.find(z => `${z.name} - $${z.fee}` === e.target.value);
                  if (matched) setSelectedZoneId(matched.id);
                }} placeholder="Escriba o seleccione Zona Delivery..." className="w-full p-2 border rounded-xl text-xs font-bold bg-white focus:border-amber-500" />
                <datalist id="zones-list">
                  {deliveryZones.map(z => <option key={z.id} value={`${z.name} - $${z.fee}`} />)}
                </datalist>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-2">
                {cart.length === 0 ? <p className="text-center text-xs text-stone-400 py-4">Agrega productos al carrito.</p> : cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-center text-xs bg-stone-50 p-2 rounded-xl border">
                    <div className="flex-1 font-bold">{item.name}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartQty(item.productId, -1)} className="w-6 h-6 bg-stone-200 rounded font-bold">-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateCartQty(item.productId, 1)} className="w-6 h-6 bg-amber-500 rounded font-bold">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button onClick={() => setPaymentCondition('contado')} className={`py-2 rounded-xl font-bold ${paymentCondition==='contado'?'bg-emerald-600 text-white':'bg-stone-100 text-stone-600'}`}>💵 Contado</button>
                  <button onClick={() => setPaymentCondition('credito')} className={`py-2 rounded-xl font-bold ${paymentCondition==='credito'?'bg-amber-600 text-white':'bg-stone-100 text-stone-600'}`}>📝 Fiado</button>
                </div>
                
                {paymentCondition === 'contado' && (
                  <div className="bg-stone-50 p-3 rounded-2xl space-y-2 border">
                    <select value={selectedPaymentMethod} onChange={e => setSelectedPaymentMethod(e.target.value)} className="w-full p-2 text-xs font-bold border rounded-lg bg-white">
                      {paymentMethods.map(pm => <option key={pm.id} value={pm.name}>{pm.name}</option>)}
                    </select>
                    
                    {/* CUENTA RECEPTORA */}
                    <div className="pt-1">
                      <label className="text-[10px] font-bold text-stone-600">📥 Cuenta Interna Receptora:</label>
                      <select value={selectedReceivingAccountId} onChange={e => setSelectedReceivingAccountId(e.target.value)} className="w-full p-2 mt-1 text-xs border rounded-lg bg-emerald-50 font-bold text-emerald-900 border-emerald-200">
                        {receivingAccounts.map(ra => <option key={ra.id} value={ra.id}>{ra.name}</option>)}
                      </select>
                    </div>

                    <input type="text" value={paymentReference} onChange={e => setPaymentReference(e.target.value)} placeholder="N° Referencia" className="w-full p-2 text-xs border rounded-lg bg-white mt-1" />
                  </div>
                )}
              </div>

              <div className="bg-stone-900 text-white p-4 rounded-2xl">
                <div className="flex justify-between text-xs text-stone-400"><span>Subtotal:</span><span>${cartSubtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs text-stone-400"><span>Delivery:</span><span>${Number(selectedZone.fee||0).toFixed(2)}</span></div>
                <div className="flex justify-between font-black text-lg text-amber-400 pt-2"><span>TOTAL:</span><span>${cartTotalUSD.toFixed(2)}</span></div>
              </div>

              <button onClick={handlePrepareCheckout} className="w-full p-3 rounded-2xl bg-amber-500 font-black text-sm text-stone-900">
                Emitir Factura y Revisar Venta
              </button>
            </div>
          </div>
        )}

        {/* MODAL REVISIÓN DE FACTURA ANTES DE CONFIRMAR */}
        {previewInvoice && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <h3 className="font-black text-lg text-center border-b pb-2">Revisión de Factura</h3>
              <div className="text-xs space-y-1 bg-stone-50 p-3 rounded-xl">
                <p><strong>Cliente:</strong> {previewInvoice.customerName}</p>
                <p><strong>Ruta:</strong> {previewInvoice.deliveryZoneName} (${previewInvoice.deliveryFee.toFixed(2)})</p>
                <p><strong>Método:</strong> {previewInvoice.paymentMethod}</p>
                <p><strong>Receptor:</strong> {previewInvoice.receivingAccountName || 'N/A'}</p>
                <p><strong>Total:</strong> ${previewInvoice.total.toFixed(2)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={() => setPreviewInvoice(null)} className="p-3 bg-stone-200 rounded-xl text-stone-800 font-bold text-xs">Volver a Modificar</button>
                <button onClick={confirmCheckout} className="p-3 bg-emerald-500 rounded-xl text-white font-black text-xs">Aprobar y Emitir</button>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA ARCHITECTURE / RESPALDOS Y EXPORTACIÓN */}
        {activeTab === 'architecture' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="text-lg font-black flex items-center gap-2"><Landmark className="w-5 h-5 text-amber-600"/> Gestión de Base de Datos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 border rounded-2xl">
                  <h3 className="font-bold text-sm mb-2">Exportar Respaldos</h3>
                  <button onClick={handleExportFullBackupJSON} className="w-full p-3 bg-stone-900 text-amber-400 rounded-xl text-xs font-bold flex justify-center gap-2"><Download className="w-4 h-4"/> Descargar Copia Completa (.JSON)</button>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <h3 className="font-bold text-sm mb-2 text-amber-900">Restaurar Sistema (Importar)</h3>
                  <input type="file" accept=".json" onChange={handleImportFullBackupJSON} className="w-full text-xs file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-amber-600 file:text-white file:font-bold" />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-bold text-sm mb-3">Exportar Tablas a Excel (CSV)</h3>
                <div className="flex gap-2">
                  <button onClick={() => exportToExcelCSV('Productos.csv', ['ID', 'Nombre', 'Categoria', 'Precio', 'Costo', 'Stock'], products.map(p => [p.id, p.name, p.category, p.price, p.cost, p.stock]))} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">⬇ Productos Excel</button>
                  <button onClick={() => exportToExcelCSV('Clientes.csv', ['Nombre', 'Telefono', 'Direccion', 'Ruta Default'], customers.map(c => [c.name, c.phone, c.address, deliveryZones.find(z => z.id === c.defaultZoneId)?.name]))} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">⬇ Clientes Excel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA AJUSTES: CATEGORÍAS, CUENTAS RECEPTORAS, MÉTODOS PAGO */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECCIÓN CATEGORÍAS */}
            <div className="bg-white p-5 rounded-3xl border space-y-4">
              <h2 className="text-base font-black">📂 Editar Categorías del Menú</h2>
              <form onSubmit={e => {
                e.preventDefault();
                if(!newCategoryForm.label) return;
                const id = newCategoryForm.label.toLowerCase().replace(/\s+/g, '_');
                setCategories([...categories, { id, label: newCategoryForm.label }]);
                setNewCategoryForm({ id: '', label: '' });
                showNotification('Categoría Agregada.');
              }} className="flex gap-2">
                <input type="text" value={newCategoryForm.label} onChange={e => setNewCategoryForm({ label: e.target.value })} placeholder="Ej: 🍕 Pizzas" className="flex-1 p-2 border rounded-xl text-xs" />
                <button type="submit" className="px-3 bg-stone-900 text-amber-400 rounded-xl text-xs font-bold">+</button>
              </form>
              <div className="space-y-1">
                {categories.map(c => (
                  <div key={c.id} className="flex justify-between p-2 bg-stone-50 border rounded-lg text-xs font-bold">
                    {c.label}
                    {c.id !== 'todos' && <button onClick={() => setCategories(categories.filter(cat => cat.id !== c.id))} className="text-red-600"><Trash2 className="w-3.5 h-3.5"/></button>}
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN MÉTODOS DE PAGO Y CUENTAS */}
            <div className="bg-white p-5 rounded-3xl border space-y-6">
              
              <div>
                <h2 className="text-base font-black mb-2">📥 Cuentas Receptoras Internas</h2>
                <p className="text-[10px] text-stone-500 mb-2">Las cuentas propias donde recibes el dinero de las ventas.</p>
                <form onSubmit={e => { e.preventDefault(); if(newRecvAccForm.name) { setReceivingAccounts([...receivingAccounts, { id: `acc_${Date.now()}`, name: newRecvAccForm.name }]); setNewRecvAccForm({name: ''}); } }} className="flex gap-2 mb-2">
                   <input type="text" value={newRecvAccForm.name} onChange={e => setNewRecvAccForm({name: e.target.value})} placeholder="Ej: Banesco - Empresa" className="flex-1 p-2 border rounded-xl text-xs" />
                   <button type="submit" className="px-3 bg-stone-900 text-white rounded-xl text-xs font-bold">+</button>
                </form>
                {receivingAccounts.map(r => (
                  <div key={r.id} className="flex justify-between p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-bold mt-1 text-emerald-900">
                    {r.name} <button onClick={()=>setReceivingAccounts(receivingAccounts.filter(x=>x.id!==r.id))} className="text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <h2 className="text-base font-black mb-2">💳 Métodos de Pago a Compartir con Clientes</h2>
                <form onSubmit={e => {
                  e.preventDefault();
                  if(newPaymentMethodForm.name) {
                    setPaymentMethods([...paymentMethods, { id: `pm_${Date.now()}`, name: newPaymentMethodForm.name, details: newPaymentMethodForm.details }]);
                    setNewPaymentMethodForm({name: '', details: ''});
                  }
                }} className="space-y-2 mb-3">
                   <input type="text" value={newPaymentMethodForm.name} onChange={e => setNewPaymentMethodForm({...newPaymentMethodForm, name: e.target.value})} placeholder="Método (Ej: Pago Móvil BDV)" className="w-full p-2 border rounded-xl text-xs" />
                   <input type="text" value={newPaymentMethodForm.details} onChange={e => setNewPaymentMethodForm({...newPaymentMethodForm, details: e.target.value})} placeholder="Detalles (Ej: 0414-000000 / V-1234 / BDV)" className="w-full p-2 border rounded-xl text-xs" />
                   <button type="submit" className="w-full p-2 bg-stone-900 text-amber-400 rounded-xl text-xs font-bold">+ Agregar Método</button>
                </form>
                <div className="space-y-2">
                  {paymentMethods.map(pm => (
                    <div key={pm.id} className="p-2 bg-stone-50 border rounded-lg text-xs flex justify-between items-center">
                      <div>
                        <strong className="block">{pm.name}</strong>
                        <span className="text-[10px] text-stone-500">{pm.details || 'Sin datos'}</span>
                      </div>
                      <button onClick={()=>setPaymentMethods(paymentMethods.filter(x=>x.id!==pm.id))} className="text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
