import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag, Utensils, Users, Package, FileText, TrendingUp, Settings,
  ShieldCheck, Bell, LogOut, Search, Plus, Minus, Trash2, Printer,
  Download, Upload, CheckCircle2, AlertTriangle, DollarSign, Truck,
  CreditCard, Lock, Sparkles, Edit3, Eye, RefreshCw, UserCheck, Layers,
  Copy, Check, Share2, ExternalLink, Smartphone, FileDown, Image as ImageIcon
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// ==========================================
// INICIALIZACIÓN DE BASE DE DATOS EN LA NUBE
// ==========================================
const appId = 'el-punto-del-sabor-app';
let db = null;
let auth = null;
try {
  const firebaseConfig = {
    apiKey: "AIzaSyDKyi-0uuIY4fjDwkZ83xicc4ArTdGF6Gk",
    authDomain: "el-punto-del-sabor-45b3d.firebaseapp.com",
    projectId: "el-punto-del-sabor-45b3d",
    storageBucket: "el-punto-del-sabor-45b3d.firebasestorage.app",
    messagingSenderId: "501069850002",
    appId: "1:501069850002:web:ee740ed897148e870e8d4b"
  };
  
  const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(firebaseApp);
  auth = getAuth(firebaseApp);
} catch (err) {
  console.warn('Fallo en la inicialización de Firebase. Usando respaldo local:', err);
}

// Helper para dividir texto automáticamente respetando márgenes en Canvas
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
  '0102 - Banco de Venezuela (BDV)', '0104 - Banco Venezolano de Crédito (BVC)',
  '0105 - Banco Mercantil', '0108 - BBVA Provincial', '0114 - Bancaribe',
  '0115 - Banco Exterior', '0128 - Banco Caroní', '0134 - Banesco Banco Universal',
  '0137 - Banco Sofitasa', '0138 - Banco Plaza', '0146 - Bangente',
  '0151 - BFC Banco Fondo Común', '0156 - 100% Banco', '0157 - DelSur Banco Universal',
  '0163 - Banco del Tesoro', '0166 - Banco Agrícola de Venezuela', '0168 - Bancrecer',
  '0169 - R4 Banco Microfinanciero', '0171 - Banco Activo', '0172 - Bancamiga Banco Universal',
  '0173 - Banco Internacional de Desarrollo', '0174 - Banplus Banco Universal',
  '0175 - Banco Digital de los Trabajadores', '0177 - BANFANB', '0178 - N58 Banco Digital',
  '0191 - BNC (Banco Nacional de Crédito)'
];

const INITIAL_USERS = [
  { id: 'usr_1', username: 'Michelle Sifontes', password: '21497110', role: 'Socia Administradora' },
  { id: 'usr_2', username: 'Jhonny Rivas', password: '19749698', role: 'Socio Administrador' }
];

const INITIAL_PRODUCTS = [
  { id: 'prod_perro_1', name: 'Perro Caliente Clásico', category: 'perros', stage: 1, price: 1.80, cost: 0.75, stock: 60, minStock: 15, active: true, description: 'Pan suave al vapor, salchicha viena, ensalada rallada, papitas, queso y salsas tradicionales.', image: FALLBACK_BY_CATEGORY.perros },
  { id: 'prod_perro_2', name: 'Perro Caliente Especial Con Todo', category: 'perros', stage: 1, price: 2.60, cost: 1.15, stock: 50, minStock: 15, active: true, description: 'Salchicha premium, tocineta crocante, maíz dulce, doble queso amarillo fundido, papitas y salsas de la casa.', image: FALLBACK_BY_CATEGORY.perros },
  { id: 'prod_perro_3', name: 'Perro Polaco / Jumbo Supremo', category: 'perros', stage: 1, price: 3.50, cost: 1.55, stock: 40, minStock: 10, active: true, description: 'Salchicha polaca ahumada XL, jamón ahumado, queso de mano, tocineta, aguacate y salsas especiales.', image: FALLBACK_BY_CATEGORY.perros },
  { id: 'prod_combo_1', name: 'Combo 1: 2 Perros Clásicos + Refresco', category: 'combos', stage: 1, price: 4.20, cost: 1.85, stock: 45, minStock: 10, active: true, description: '2 Perros Calientes Clásicos con todo + 1 Refresco personal de 355ml bien frío.', image: FALLBACK_BY_CATEGORY.combos },
  { id: 'prod_combo_2', name: 'Combo 2: 2 Perros Especiales + Refresco', category: 'combos', stage: 1, price: 5.80, cost: 2.60, stock: 40, minStock: 10, active: true, description: '2 Perros Especiales con tocineta y maíz + 1 Refresco personal de 355ml.', image: FALLBACK_BY_CATEGORY.combos },
  { id: 'prod_combo_3', name: 'Combo 3: 2 Perros Polacos Jumbo + Refresco 1.5L', category: 'combos', stage: 1, price: 8.20, cost: 3.70, stock: 30, minStock: 8, active: true, description: '2 Perros Polacos Jumbo Supremos + 1 Refresco Familiar para compartir.', image: FALLBACK_BY_CATEGORY.combos },
  { id: 'prod_ref_1', name: 'Refresco Personal 355ml (Coca-Cola / Pepsi / Chinotto)', category: 'refrescos', stage: 1, price: 1.20, cost: 0.55, stock: 80, minStock: 20, active: true, description: 'Refresco personal bien frío para acompañar tu pedido.', image: FALLBACK_BY_CATEGORY.refrescos },
  { id: 'prod_ref_2', name: 'Refresco Familiar 1.5 Litros', category: 'refrescos', stage: 1, price: 2.50, cost: 1.30, stock: 35, minStock: 10, active: true, description: 'Botella de 1.5 Litros ideal para combos familiares.', image: FALLBACK_BY_CATEGORY.refrescos },
  { id: 'prod_hamb_1', name: 'Hamburguesa Clásica El Punto', category: 'hamburguesas', stage: 2, price: 4.50, cost: 2.00, stock: 35, minStock: 10, active: true, description: '150g de carne de res a la plancha, queso cheddar, tocineta, vegetales frescos y salsa especial.', image: FALLBACK_BY_CATEGORY.hamburguesas },
  { id: 'prod_hamb_2', name: 'Combo Burger Doble + Refresco', category: 'combos', stage: 2, price: 6.80, cost: 3.10, stock: 30, minStock: 8, active: true, description: 'Hamburguesa doble carne con queso de mano y tocineta + Refresco personal.', image: FALLBACK_BY_CATEGORY.hamburguesas },
  { id: 'prod_papas_1', name: 'Ración de Papas Fritas Crocantes', category: 'papas', stage: 3, price: 3.20, cost: 1.25, stock: 40, minStock: 12, active: true, description: 'Papas fritas importadas recién hechas con topping de queso fundido y tocineta.', image: FALLBACK_BY_CATEGORY.papas },
  { id: 'prod_esp_1', name: 'Ración de 6 Tequeños Full Queso', category: 'especialidades', stage: 4, price: 4.00, cost: 1.70, stock: 35, minStock: 10, active: true, description: 'Tequeños doraditos rellenos de abundante queso blanco con salsa de ajo o miel mostaza.', image: FALLBACK_BY_CATEGORY.especialidades },
  { id: 'prod_esp_2', name: 'Box de Chicken Tenders (5 uds)', category: 'especialidades', stage: 4, price: 5.50, cost: 2.40, stock: 25, minStock: 8, active: true, description: 'Tiras de pechuga de pollo empanizadas extra crujientes.', image: FALLBACK_BY_CATEGORY.especialidades },
  { id: 'prod_postre_1', name: 'Helado Cremoso / Marquesa de Chocolate', category: 'postres', stage: 4, price: 2.80, cost: 1.15, stock: 25, minStock: 6, active: true, description: 'Postre frío artesanal con topping de chocolate y lluvia de galleta.', image: FALLBACK_BY_CATEGORY.postres }
];

const INITIAL_DELIVERY_ZONES = [
  { id: 'zone_0', name: 'Retiro Personal / Punto de Entrega Acordado', fee: 0.00 },
  { id: 'zone_1', name: 'Zona Cercana (Hasta 2 km)', fee: 1.00 },
  { id: 'zone_2', name: 'Casco Central / Urbanizaciones Medias (3 a 5 km)', fee: 2.00 },
  { id: 'zone_3', name: 'Zona Larga / Periferia (6 a 9 km)', fee: 3.00 },
  { id: 'zone_4', name: 'Zona Extraurbana Especial (+10 km)', fee: 4.50 }
];

const INITIAL_PAYMENT_METHODS = [
  { id: 'pm_1', name: 'Pago Móvil', requiresReference: true },
  { id: 'pm_2', name: 'Binance (USDT)', requiresReference: true },
  { id: 'pm_3', name: 'Efectivo USD ($)', requiresReference: false },
  { id: 'pm_4', name: 'Efectivo Bolívares', requiresReference: false },
  { id: 'pm_5', name: 'Transferencia Bancaria', requiresReference: true },
  { id: 'pm_6', name: 'Zelle', requiresReference: true }
];

const INITIAL_PAYMENT_RECEIVERS = [
  {
    id: 'pr_1',
    type: 'pago_movil',
    holder: 'Michelle Sifontes',
    document: 'V-21237816',
    bank: '0102 - Banco de Venezuela (BDV)',
    phone: '0424-9043122',
    binanceId: ''
  },
  {
    id: 'pr_2',
    type: 'binance',
    holder: 'Michelle Sifontes',
    document: 'V-21237816',
    bank: '',
    phone: '',
    binanceId: 'michelle_sifontes'
  }
];

const INITIAL_CUSTOMERS = [
  { id: 'cli_1', name: 'Carlos Mendoza', document: 'V-18452310', phone: '0414-8823411', address: 'Urb. Los Olivos, Calle Mediterráneo, Casa #14', defaultZoneId: 'zone_2' },
  { id: 'cli_2', name: 'María Fernanda Gómez', document: 'V-24910234', phone: '0412-9104422', address: 'Res. Alta Vista Norte, Torre B, Piso 4, Apt 4-B', defaultZoneId: 'zone_1' },
  { id: 'cli_3', name: 'José Gregorio Pérez', document: 'V-15229100', phone: '0424-9551102', address: 'Villa Africana, Manzana 12, Casa #08', defaultZoneId: 'zone_3' }
];

const INITIAL_EXPENSES = [
  { id: 'exp_1', date: new Date().toISOString().split('T')[0], type: 'inversion', category: 'Baño María y Utensilios Térmicos', description: 'Baño María acero inoxidable y envases térmicos', amount: 145.00, supplier: 'Equipos Gastronómicos C.A.', expectedYieldUnits: 0, consumedPercent: 0 },
  { id: 'exp_2', date: new Date().toISOString().split('T')[0], type: 'insumo', category: 'Pan de Perro y Salchichas', description: '100 panes, 100 salchichas viena y 30 polacas', amount: 68.00, supplier: 'Distribuidora El Mayorista', expectedYieldUnits: 130, consumedPercent: 35 }
];

const INITIAL_SUPPLY_CATALOG = [
  { name: 'Pan de Perro y Salchichas Viena/Polaca', type: 'insumo', expectedYieldUnits: 130, defaultDescription: 'Panes y paquetes de salchichas' },
  { name: 'Salsas y Queso Amarillo', type: 'insumo', expectedYieldUnits: 120, defaultDescription: 'Salsas y queso' }
];

const INITIAL_SUPPLIERS_CATALOG = ['Distribuidora El Mayorista', 'Insumos Rápidos Express', 'Todo Empaques C.A.'];

const INITIAL_SALES = [
  {
    id: 'sale_init_1', invoiceNumber: 'EPDS-1001', date: new Date().toISOString().split('T')[0], timestamp: new Date().toISOString(), cashier: 'Michelle Sifontes', customerId: 'cli_1', customerName: 'Carlos Mendoza', customerPhone: '0414-8823411', customerDocument: 'V-18452310', deliveryAddress: 'Urb. Los Olivos, Calle Mediterráneo, Casa #14', deliveryZoneName: 'Casco Central', deliveryFee: 2.00, items: [{ productId: 'prod_combo_2', name: 'Combo 2', category: 'combos', qty: 2, price: 5.80, cost: 2.60, subtotal: 11.60 }], subtotal: 11.60, totalCost: 5.20, total: 13.60, totalBs: 618.80, exchangeRateUsed: 45.5, paymentCondition: 'contado', creditPaid: true, paymentMethod: 'Pago Móvil', paymentDetails: { reference: '948271', senderName: 'Carlos Mendoza', senderDocument: 'V-18452310', senderBank: '0102 - Banco de Venezuela', senderPhone: '0414-8823411' }, notes: ''
  }
];

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'perros', label: '🌭 Perros Calientes' },
  { id: 'combos', label: '🥤 Combos' },
  { id: 'hamburguesas', label: '🍔 Hamburguesas' },
  { id: 'papas', label: '🍟 Papas Fritas' },
  { id: 'especialidades', label: '🧀 Tequeños' },
  { id: 'postres', label: '🍨 Postres' },
  { id: 'refrescos', label: '🧊 Bebidas' }
];

const STAGES_INFO = [
  { stage: 1, title: 'Etapa 1: Perros y Combos', status: 'Activa' },
  { stage: 2, title: 'Etapa 2: Hamburguesas', status: 'Activa' },
  { stage: 3, title: 'Etapa 3: Papas Fritas', status: 'Activa' },
  { stage: 4, title: 'Etapa 4: Tequeños y Postres', status: 'Activa' },
  { stage: 5, title: 'Etapa 5: Puesto Físico', status: 'Proyección' }
];

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (parsed === null || parsed === undefined) return fallback;
    return parsed;
  } catch (e) {
    return fallback;
  }
}

export default function App() {
  const [fbUser, setFbUser] = useState(null);
  const [cloudReady, setCloudReady] = useState(false);
  const [users, setUsers] = useState(() => loadFromStorage('epds_users_v2', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState(null);
  const [loginUsername, setLoginUsername] = useState('Michelle Sifontes');
  const [loginPassword, setLoginPassword] = useState('21497110');
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
  const [customerOrderForm, setCustomerOrderForm] = useState({ name: '', document: '', phone: '', address: '', zoneId: 'zone_1', paymentCondition: 'contado', paymentMethod: 'Pago Móvil', paymentReference: '', paymentSenderBank: '0102 - Banco de Venezuela (BDV)', notes: '' });

  const [activeTab, setActiveTab] = useState('pos');
  const [activeStageFilter, setActiveStageFilter] = useState('all');
  const [exchangeRate, setExchangeRate] = useState(() => loadFromStorage('epds_rate_v2', 45.50));
  const [bcvLastUpdate, setBcvLastUpdate] = useState(() => loadFromStorage('epds_bcv_last_update_v2', 'Pendiente'));
  const [isSyncingBCV, setIsSyncingBCV] = useState(false);
  const [securityDeletePin, setSecurityDeletePin] = useState(() => loadFromStorage('epds_delete_pin_v2', '2026'));
  const [newDeletePinInput, setNewDeletePinInput] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, title: '', description: '', onConfirm: null });
  const [deletePinAttempt, setDeletePinAttempt] = useState('');
  const [deletePinError, setDeletePinError] = useState('');

  const [invoiceFilterType, setInvoiceFilterType] = useState('all');
  const [creditPaymentModal, setCreditPaymentModal] = useState({ isOpen: false, saleId: null, invoiceNumber: '', customerName: '', totalUSD: 0, daysPending: 0, paymentMethod: 'Pago Móvil', reference: '', senderName: '', senderDocument: '', senderBank: '0102 - Banco de Venezuela (BDV)', senderPhone: '', notes: '' });

  const [products, setProducts] = useState(() => loadFromStorage('epds_products_v2', INITIAL_PRODUCTS));
  const [deliveryZones, setDeliveryZones] = useState(() => loadFromStorage('epds_zones_v2', INITIAL_DELIVERY_ZONES));
  const [paymentMethods, setPaymentMethods] = useState(() => loadFromStorage('epds_pm_v2', INITIAL_PAYMENT_METHODS));
  
  // NUEVOS ESTADOS PARA CUENTAS DE PAGO (RECEPTOR)
  const [paymentReceivers, setPaymentReceivers] = useState(() => loadFromStorage('epds_payment_receivers_v2', INITIAL_PAYMENT_RECEIVERS));
  const [showPaymentReceiverModal, setShowPaymentReceiverModal] = useState(false);
  const [editingPaymentReceiver, setEditingPaymentReceiver] = useState(null);
  const [paymentReceiverForm, setPaymentReceiverForm] = useState({ type: 'pago_movil', holder: '', document: '', bank: '', phone: '', binanceId: '' });
  
  // ESTADO PARA EL MODAL DE REVISIÓN DE FACTURA
  const [pendingInvoiceReview, setPendingInvoiceReview] = useState(null);

  const [customers, setCustomers] = useState(() => loadFromStorage('epds_customers_v2', INITIAL_CUSTOMERS));
  const [expenses, setExpenses] = useState(() => loadFromStorage('epds_expenses_v2', INITIAL_EXPENSES));
  const [sales, setSales] = useState(() => loadFromStorage('epds_sales_v2', INITIAL_SALES));
  const [supplyCatalog, setSupplyCatalog] = useState(() => loadFromStorage('epds_supply_catalog_v2', INITIAL_SUPPLY_CATALOG));
  const [supplierCatalog, setSupplierCatalog] = useState(() => loadFromStorage('epds_supplier_catalog_v2', INITIAL_SUPPLIERS_CATALOG));

  const [notification, setNotification] = useState(null);
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // FIREBASE EFFECTS
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
      } catch (e) { console.warn('Error de auth:', e); }
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
        if (Array.isArray(data.users)) setUsers(prev => JSON.stringify(prev) === JSON.stringify(data.users) ? prev : data.users);
        if (Array.isArray(data.products)) setProducts(prev => JSON.stringify(prev) === JSON.stringify(data.products) ? prev : data.products);
        if (Array.isArray(data.deliveryZones)) setDeliveryZones(prev => JSON.stringify(prev) === JSON.stringify(data.deliveryZones) ? prev : data.deliveryZones);
        if (Array.isArray(data.paymentMethods)) setPaymentMethods(prev => JSON.stringify(prev) === JSON.stringify(data.paymentMethods) ? prev : data.paymentMethods);
        if (Array.isArray(data.paymentReceivers)) setPaymentReceivers(prev => JSON.stringify(prev) === JSON.stringify(data.paymentReceivers) ? prev : data.paymentReceivers);
        if (Array.isArray(data.customers)) setCustomers(prev => JSON.stringify(prev) === JSON.stringify(data.customers) ? prev : data.customers);
        if (Array.isArray(data.expenses)) setExpenses(prev => JSON.stringify(prev) === JSON.stringify(data.expenses) ? prev : data.expenses);
        if (Array.isArray(data.sales)) setSales(prev => JSON.stringify(prev) === JSON.stringify(data.sales) ? prev : data.sales);
        if (Array.isArray(data.supplyCatalog)) setSupplyCatalog(prev => JSON.stringify(prev) === JSON.stringify(data.supplyCatalog) ? prev : data.supplyCatalog);
        if (Array.isArray(data.supplierCatalog)) setSupplierCatalog(prev => JSON.stringify(prev) === JSON.stringify(data.supplierCatalog) ? prev : data.supplierCatalog);
        
        if (data.securityDeletePin) setSecurityDeletePin(prev => prev === data.securityDeletePin ? prev : data.securityDeletePin);
        if (data.businessWhatsApp) setBusinessWhatsApp(prev => prev === data.businessWhatsApp ? prev : data.businessWhatsApp);
        
        setCloudReady(true);
      } else {
        setDoc(stateDocRef, { users, products, deliveryZones, paymentMethods, paymentReceivers, customers, expenses, sales, supplyCatalog, supplierCatalog, securityDeletePin, businessWhatsApp, updatedAt: new Date().toISOString() }, { merge: true })
          .then(() => setCloudReady(true))
          .catch(() => setCloudReady(true));
      }
    }, (err) => console.warn('Error leyendo estado en la nube:', err));
    return () => unsub();
  }, [fbUser]);

  const persistToCloud = async (partialData) => {
    if (!db || !fbUser) return;
    try {
      const stateDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'epds_store', 'main_state');
      await setDoc(stateDocRef, { ...partialData, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) { console.error('No se pudo sincronizar en la nube:', e); }
  };

  useEffect(() => { try { localStorage.setItem('epds_users_v2', JSON.stringify(users)); } catch (e) {} if (cloudReady) persistToCloud({ users }); }, [users, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_rate_v2', JSON.stringify(exchangeRate)); } catch (e) {} }, [exchangeRate]);
  useEffect(() => { try { localStorage.setItem('epds_bcv_last_update_v2', JSON.stringify(bcvLastUpdate)); } catch (e) {} }, [bcvLastUpdate]);
  useEffect(() => { try { localStorage.setItem('epds_delete_pin_v2', JSON.stringify(securityDeletePin)); } catch (e) {} if (cloudReady) persistToCloud({ securityDeletePin }); }, [securityDeletePin, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_products_v2', JSON.stringify(products)); } catch (e) {} if (cloudReady) persistToCloud({ products }); }, [products, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_zones_v2', JSON.stringify(deliveryZones)); } catch (e) {} if (cloudReady) persistToCloud({ deliveryZones }); }, [deliveryZones, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_pm_v2', JSON.stringify(paymentMethods)); } catch (e) {} if (cloudReady) persistToCloud({ paymentMethods }); }, [paymentMethods, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_payment_receivers_v2', JSON.stringify(paymentReceivers)); } catch (e) {} if (cloudReady) persistToCloud({ paymentReceivers }); }, [paymentReceivers, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_customers_v2', JSON.stringify(customers)); } catch (e) {} if (cloudReady) persistToCloud({ customers }); }, [customers, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_expenses_v2', JSON.stringify(expenses)); } catch (e) {} if (cloudReady) persistToCloud({ expenses }); }, [expenses, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_sales_v2', JSON.stringify(sales)); } catch (e) {} if (cloudReady) persistToCloud({ sales }); }, [sales, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_supply_catalog_v2', JSON.stringify(supplyCatalog)); } catch (e) {} if (cloudReady) persistToCloud({ supplyCatalog }); }, [supplyCatalog, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_supplier_catalog_v2', JSON.stringify(supplierCatalog)); } catch (e) {} if (cloudReady) persistToCloud({ supplierCatalog }); }, [supplierCatalog, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_whatsapp_v2', JSON.stringify(businessWhatsApp)); } catch (e) {} if (cloudReady) persistToCloud({ businessWhatsApp }); }, [businessWhatsApp, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_custom_public_url_v2', JSON.stringify(customPublicUrl)); } catch (e) {} }, [customPublicUrl]);

  // ESTADOS POS
  const [posSearch, setPosSearch] = useState('');
  const [posCategory, setPosCategory] = useState('todos');
  const [cart, setCart] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('cli_1');
  const [customDeliveryAddress, setCustomDeliveryAddress] = useState(INITIAL_CUSTOMERS[0].address);
  const [selectedZoneId, setSelectedZoneId] = useState('zone_2');
  const [paymentCondition, setPaymentCondition] = useState('contado');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Pago Móvil');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentSenderName, setPaymentSenderName] = useState(INITIAL_CUSTOMERS[0].name);
  const [paymentSenderDoc, setPaymentSenderDoc] = useState(INITIAL_CUSTOMERS[0].document);
  const [paymentSenderBank, setPaymentSenderBank] = useState('0102 - Banco de Venezuela (BDV)');
  const [isCustomBankEdit, setIsCustomBankEdit] = useState(false);
  const [paymentSenderPhone, setPaymentSenderPhone] = useState(INITIAL_CUSTOMERS[0].phone);
  const [selectedReceiverId, setSelectedReceiverId] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [lastInvoiceModal, setLastInvoiceModal] = useState(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  const handleSelectPaymentMethodInPOS = (methodName) => {
    setSelectedPaymentMethod(methodName);
    const lower = methodName.toLowerCase();
    if (lower.includes('binance') || lower.includes('zelle') || lower.includes('efectivo')) {
      setPaymentSenderBank(''); setIsCustomBankEdit(false);
    } else if (!paymentSenderBank) { setPaymentSenderBank(VENEZUELAN_BANKS[0]); }
  };

  const syncBCVExchangeRate = async (silent = false) => {
    setIsSyncingBCV(true);
    try {
      let fetchedRate = null;
      try {
        const res1 = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (res1.ok) { const data1 = await res1.json(); if (data1 && Number(data1.promedio) > 0) fetchedRate = Number(Number(data1.promedio).toFixed(2)); }
      } catch (err1) {}
      if (!fetchedRate) {
        try {
          const res2 = await fetch('https://open.er-api.com/v6/latest/USD');
          if (res2.ok) { const data2 = await res2.json(); if (data2?.rates?.VES && Number(data2.rates.VES) > 0) fetchedRate = Number(Number(data2.rates.VES).toFixed(2)); }
        } catch (err2) {}
      }
      if (fetchedRate && fetchedRate > 0) {
        const nowFormatted = new Date().toLocaleString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
        setExchangeRate(fetchedRate); setBcvLastUpdate(`BCV ${nowFormatted}`);
        if (!silent) showNotification(`Tasa BCV actualizada: Bs. ${fetchedRate.toFixed(2)}/$`);
      } else if (!silent) { showNotification('No se pudo conectar con BCV. Ajusta la tasa manualmente.', 'error'); }
    } finally { setIsSyncingBCV(false); }
  };

  useEffect(() => {
    syncBCVExchangeRate(true);
    const interval = setInterval(() => syncBCVExchangeRate(true), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const requestAuthorizedDelete = (title, description, actionCallback) => {
    setDeletePinAttempt(''); setDeletePinError('');
    setDeleteModal({ isOpen: true, title, description, onConfirm: actionCallback });
  };

  const handleConfirmProtectedDelete = (e) => {
    e.preventDefault();
    if (deletePinAttempt.trim() !== securityDeletePin) { setDeletePinError('Clave incorrecta.'); return; }
    if (typeof deleteModal.onConfirm === 'function') deleteModal.onConfirm();
    setDeleteModal({ isOpen: false, title: '', description: '', onConfirm: null });
    setDeletePinAttempt(''); setDeletePinError('');
  };

  const handleDeleteProduct = (prod) => {
    requestAuthorizedDelete(`Eliminar: ${prod.name}`, `¿Eliminar permanentemente este producto?`, () => {
      setProducts(prev => prev.filter(item => item.id !== prod.id));
      setCart(prev => prev.filter(item => item.productId !== prod.id));
      showNotification(`Producto "${prod.name}" eliminado.`);
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
  const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);
  const [passwordChangeForm, setPasswordChangeForm] = useState({ newPassword: '', confirmPassword: '' });
  const [newUserForm, setNewUserForm] = useState({ username: '', password: '', role: 'Operador de Ventas' });
  const [newPaymentMethodName, setNewPaymentMethodName] = useState('');

  const matchingSupplies = useMemo(() => {
    const q = (expenseForm.category || '').trim().toLowerCase();
    if (!q) return supplyCatalog || [];
    return (supplyCatalog || []).filter(item => (item.name || '').toLowerCase().includes(q) || (item.defaultDescription || '').toLowerCase().includes(q));
  }, [supplyCatalog, expenseForm.category]);

  const matchingSuppliers = useMemo(() => {
    const q = (expenseForm.supplier || '').trim().toLowerCase();
    if (!q) return supplierCatalog || [];
    return (supplierCatalog || []).filter(sup => (sup || '').toLowerCase().includes(q));
  }, [supplierCatalog, expenseForm.supplier]);

  const handleSelectCustomerInPOS = (custId) => {
    setSelectedCustomerId(custId);
    const found = (customers || []).find(c => c.id === custId);
    if (found) {
      setCustomDeliveryAddress(found.address || '');
      if (found.defaultZoneId) setSelectedZoneId(found.defaultZoneId);
      setPaymentSenderName(found.name || '');
      setPaymentSenderDoc(found.document || '');
      setPaymentSenderPhone(found.phone || '');
    }
  };

  const generateAndDownloadPDF = (title, subtitle, linesArray, filename = 'Documento.pdf') => {
    try {
      const width = 794; const marginX = 48; const contentWidth = width - marginX * 2; const lineHeight = 24;
      const measureCanvas = document.createElement('canvas'); const mCtx = measureCanvas.getContext('2d'); if (!mCtx) return;
      const preparedBlocks = []; let calculatedHeight = 165;
      (linesArray || []).forEach(line => {
        if (line.type === 'divider') { preparedBlocks.push({ type: 'divider' }); calculatedHeight += 18; }
        else if (line.type === 'header') { mCtx.font = 'bold 15px sans-serif'; const wrapped = wrapCanvasText(mCtx, line.text, contentWidth); preparedBlocks.push({ type: 'header', lines: wrapped }); calculatedHeight += wrapped.length * lineHeight + 6; }
        else if (line.type === 'total') { mCtx.font = 'bold 15px sans-serif'; const wrapped = wrapCanvasText(mCtx, line.text, contentWidth - 28); preparedBlocks.push({ type: 'total', lines: wrapped }); calculatedHeight += wrapped.length * 24 + 32; }
        else { mCtx.font = line.bold ? 'bold 13px sans-serif' : '13px sans-serif'; const wrapped = wrapCanvasText(mCtx, line.text, contentWidth); preparedBlocks.push({ type: 'text', bold: line.bold, lines: wrapped }); calculatedHeight += wrapped.length * lineHeight; }
      });
      const height = Math.max(1123, calculatedHeight + 70);
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#1c1917'; ctx.fillRect(0, 0, width, 120);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 25px sans-serif'; ctx.fillText('EL PUNTO DEL SABOR', marginX, 46);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 15px sans-serif'; const titleLines = wrapCanvasText(ctx, title, contentWidth); ctx.fillText(titleLines[0] || '', marginX, 74);
      ctx.fillStyle = '#d6d3d1'; ctx.font = '12px sans-serif'; const subLines = wrapCanvasText(ctx, subtitle, contentWidth); ctx.fillText(subLines[0] || '', marginX, 98);
      let y = 155;
      preparedBlocks.forEach(block => {
        if (block.type === 'divider') { ctx.strokeStyle = '#d6d3d1'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(marginX, y - 8); ctx.lineTo(width - marginX, y - 8); ctx.stroke(); y += 16; }
        else if (block.type === 'header') { ctx.fillStyle = '#9a3412'; ctx.font = 'bold 15px sans-serif'; block.lines.forEach(txtLine => { ctx.fillText(txtLine, marginX, y); y += lineHeight; }); y += 4; }
        else if (block.type === 'total') { const boxHeight = block.lines.length * 24 + 20; ctx.fillStyle = '#fef3c7'; ctx.fillRect(marginX, y - 18, contentWidth, boxHeight); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5; ctx.strokeRect(marginX, y - 18, contentWidth, boxHeight); ctx.fillStyle = '#1c1917'; ctx.font = 'bold 14px sans-serif'; block.lines.forEach((txtLine, idx) => ctx.fillText(txtLine, marginX + 14, y + idx * 23 + 4)); y += boxHeight + 16; }
        else { ctx.fillStyle = '#292524'; ctx.font = block.bold ? 'bold 13px sans-serif' : '13px sans-serif'; block.lines.forEach(txtLine => { ctx.fillText(txtLine, marginX, y); y += lineHeight; }); }
      });
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92); const base64Data = jpegDataUrl.split(',')[1]; const jpegBinary = atob(base64Data); const jpegLength = jpegBinary.length;
      const pdfParts = []; const offsets = []; let currentOffset = 0;
      const addString = (str) => { pdfParts.push(str); currentOffset += str.length; };
      const startObj = (id) => { offsets[id] = currentOffset; addString(`${id} 0 obj\n`); };
      const pdfW = 595; const pdfH = Math.round((height / width) * 595);
      addString('%PDF-1.4\n'); startObj(1); addString('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'); startObj(2); addString('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'); startObj(3); addString(`<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im1 4 0 R >> >> /MediaBox [0 0 ${pdfW} ${pdfH}] /Contents 5 0 R >>\nendobj\n`); startObj(4); addString(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegLength} >>\nstream\n`); pdfParts.push(jpegBinary); currentOffset += jpegLength; addString('\nendstream\nendobj\n');
      const contentStream = `q\n${pdfW} 0 0 ${pdfH} 0 0 cm\n/Im1 Do\nQ\n`; startObj(5); addString(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`);
      const xrefOffset = currentOffset; addString('xref\n0 6\n0000000000 65535 f \n'); for (let i = 1; i <= 5; i++) addString(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`); addString(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
      const totalBytes = currentOffset; const uint8 = new Uint8Array(totalBytes); let pos = 0; for (const part of pdfParts) { for (let i = 0; i < part.length; i++) uint8[pos++] = part.charCodeAt(i) & 0xff; }
      const blob = new Blob([uint8], { type: 'application/pdf' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.setAttribute('download', filename); document.body.appendChild(link); link.click(); document.body.removeChild(link); showNotification(`PDF (${filename}) descargado.`);
    } catch (error) { window.print(); }
  };

  const handleDownloadInvoicePDF = (invoice) => {
    const lines = [
      { type: 'header', text: `FACTURA: ${invoice.invoiceNumber}` },
      { text: `Fecha: ${invoice.date} | Operador: ${invoice.cashier}`, bold: true }, { type: 'divider' },
      { type: 'header', text: 'CLIENTE Y DESTINO' },
      { text: `Cliente: ${invoice.customerName} | Doc: ${invoice.customerDocument || 'S/N'}`, bold: true },
      { text: `Dirección: ${invoice.deliveryAddress}`, bold: true },
      { text: `Ruta: ${invoice.deliveryZoneName} ($${Number(invoice.deliveryFee || 0).toFixed(2)})` }, { type: 'divider' },
      { type: 'header', text: 'DETALLE DE PRODUCTOS' },
      ...(invoice.items || []).map(item => ({ text: `${item.qty}x ${item.name} — $${Number(item.price || 0).toFixed(2)} = $${Number(item.subtotal || 0).toFixed(2)}`, bold: true })),
      { type: 'divider' },
      { text: `Subtotal: $${Number(invoice.subtotal || 0).toFixed(2)}` },
      { text: `Delivery: $${Number(invoice.deliveryFee || 0).toFixed(2)}` },
      { type: 'total', text: `TOTAL: $${Number(invoice.total || 0).toFixed(2)} USD (Bs. ${Number(invoice.totalBs || 0).toFixed(2)})` }
    ];
    generateAndDownloadPDF(`Factura ${invoice.invoiceNumber}`, `Fecha: ${invoice.date}`, lines, `Factura_${invoice.invoiceNumber}.pdf`);
  };

  const availableCustomerProducts = useMemo(() => {
    return (products || []).filter(p => (Number(p.stock) > 0 && p.active !== false) && (activeStageFilter === 'all' || Number(p.stage) <= Number(activeStageFilter)));
  }, [products, activeStageFilter]);

  const handleCopyDigitalMenuLink = () => {
    const shareUrl = customPublicUrl || `${window.location.origin}?vista=menu`;
    const message = `🌭 *MENÚ DIGITAL - EL PUNTO DEL SABOR*\n\n` + availableCustomerProducts.map(p => `• *${p.name}*: $${Number(p.price || 0).toFixed(2)} (Bs. ${(Number(p.price || 0) * exchangeRate).toFixed(2)})`).join('\n') + `\n\n🛵 *Delivery:*\n` + (deliveryZones || []).map(z => `• ${z.name}: $${Number(z.fee || 0).toFixed(2)}`).join('\n') + `\n\n🌐 *Enlace Web:* ${shareUrl}\n📞 *WhatsApp:* ${businessWhatsApp}`;
    copyTextToClipboard(message);
  };

  const handleDownloadCustomerMenuPDF = () => {
    const lines = [{ type: 'header', text: 'CARTA / MENÚ DISPONIBLE' }, { text: `WhatsApp: ${businessWhatsApp} | Tasa: Bs. ${Number(exchangeRate).toFixed(2)}/$`, bold: true }, { type: 'divider' }];
    (CATEGORIES || []).filter(c => c.id !== 'todos').forEach(cat => {
      const catProds = availableCustomerProducts.filter(p => p.category === cat.id);
      if (catProds.length > 0) {
        lines.push({ type: 'header', text: cat.label.toUpperCase() });
        catProds.forEach(p => lines.push({ text: `• ${p.name} — $${Number(p.price || 0).toFixed(2)} (Bs. ${(Number(p.price || 0) * exchangeRate).toFixed(2)})`, bold: true }));
        lines.push({ type: 'divider' });
      }
    });
    generateAndDownloadPDF('MENÚ OFICIAL', `Precios en USD y Bolívares`, lines, `Menu.pdf`);
  };

  const handleDownloadCustomerMenuImagePoster = () => {
    try {
      const items = availableCustomerProducts; const width = 900; const marginX = 48; const boxWidth = width - marginX * 2; const rowHeight = 90; const footerBoxHeight = 96;
      const height = Math.max(1080, 230 + items.length * rowHeight + footerBoxHeight + 50);
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); if (!ctx) return;
      const grad = ctx.createLinearGradient(0, 0, 0, height); grad.addColorStop(0, '#1c1917'); grad.addColorStop(1, '#292524'); ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#f59e0b'; ctx.fillRect(0, 0, width, 155); ctx.fillStyle = '#1c1917'; ctx.font = '900 38px sans-serif'; ctx.fillText('🌭 EL PUNTO DEL SABOR', marginX, 62);
      ctx.font = 'bold 19px sans-serif'; ctx.fillText('MENÚ DIGITAL DELIVERY', marginX, 98);
      let y = 195; const textMaxW = boxWidth - 210;
      items.forEach((p, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#292524' : '#1f1c1a'; ctx.fillRect(marginX, y - 34, boxWidth, 76);
        ctx.strokeStyle = '#44403c'; ctx.lineWidth = 1; ctx.strokeRect(marginX, y - 34, boxWidth, 76);
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 19px sans-serif'; const titleLines = wrapCanvasText(ctx, p.name, textMaxW); ctx.fillText(titleLines[0] || '', marginX + 18, y - 8);
        ctx.fillStyle = '#d6d3d1'; ctx.font = '13px sans-serif'; const descLines = wrapCanvasText(ctx, p.description || '', textMaxW); ctx.fillText(descLines[0] || '', marginX + 18, y + 14);
        const priceBoxW = 165; const priceBoxX = width - marginX - priceBoxW - 14; ctx.fillStyle = '#f59e0b'; ctx.fillRect(priceBoxX, y - 22, priceBoxW, 52);
        ctx.fillStyle = '#1c1917'; ctx.font = '900 20px sans-serif'; ctx.fillText(`$${Number(p.price || 0).toFixed(2)}`, priceBoxX + 14, y + 2);
        y += rowHeight;
      });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.94); const link = document.createElement('a'); link.href = dataUrl; link.setAttribute('download', 'Menu.jpg'); document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (e) { handleDownloadCustomerMenuPDF(); }
  };

  const filteredProducts = useMemo(() => {
    return (products || []).filter(p => {
      const matchesCategory = posCategory === 'todos' || p.category === posCategory;
      const matchesStage = activeStageFilter === 'all' || Number(p.stage) <= Number(activeStageFilter);
      const q = (posSearch || '').trim().toLowerCase();
      const matchesSearch = !q || (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
      return matchesCategory && matchesStage && matchesSearch;
    });
  }, [products, posCategory, activeStageFilter, posSearch]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) return prev.map(item => item.productId === product.id ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.price } : item);
      return [...prev, { productId: product.id, name: product.name, category: product.category, price: Number(product.price), cost: Number(product.cost), qty: 1, subtotal: Number(product.price) }];
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.productId !== productId) return item;
      const newQty = item.qty + delta;
      return newQty > 0 ? { ...item, qty: newQty, subtotal: newQty * item.price } : null;
    }).filter(Boolean));
  };

  const selectedZone = useMemo(() => (deliveryZones || []).find(z => z.id === selectedZoneId) || { name: 'Sin ruta', fee: 0 }, [deliveryZones, selectedZoneId]);
  const cartSubtotal = useMemo(() => cart.reduce((acc, item) => acc + item.subtotal, 0), [cart]);
  const cartTotalCost = useMemo(() => cart.reduce((acc, item) => acc + item.cost * item.qty, 0), [cart]);
  const cartTotalUSD = cartSubtotal + Number(selectedZone.fee || 0);
  const cartTotalBs = cartTotalUSD * Number(exchangeRate || 1);

  const getNextInvoiceNumber = (condition) => {
    if (condition === 'credito') {
      const nums = (sales || []).filter(s => (s.invoiceNumber || '').startsWith('EPDS-CR-')).map(s => parseInt(s.invoiceNumber.replace('EPDS-CR-', ''), 10)).filter(n => !isNaN(n));
      return `EPDS-CR-${String(nums.length > 0 ? Math.max(...nums) + 1 : 1).padStart(4, '0')}`;
    }
    const nums = (sales || []).filter(s => (s.invoiceNumber || '').startsWith('EPDS-') && !s.invoiceNumber.startsWith('EPDS-CR-')).map(s => parseInt(s.invoiceNumber.replace('EPDS-', ''), 10)).filter(n => !isNaN(n));
    return `EPDS-${nums.length > 0 ? Math.max(1000, ...nums) + 1 : 1001}`;
  };

  const getDaysPending = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T00:00:00'); const t = new Date(); t.setHours(0, 0, 0, 0);
      return Math.max(0, Math.floor((t.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));
    } catch (e) { return 0; }
  };

  const getDaysPendingBadge = (days) => {
    if (days <= 3) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (days <= 7) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (days <= 15) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const openCreditPaymentModal = (sale) => {
    setCreditPaymentModal({ isOpen: true, saleId: sale.id, invoiceNumber: sale.invoiceNumber, customerName: sale.customerName, totalUSD: Number(sale.total || 0), daysPending: getDaysPending(sale.date), paymentMethod: 'Pago Móvil', reference: '', senderName: sale.customerName || '', senderDocument: sale.customerDocument || '', senderBank: '0102 - Banco de Venezuela (BDV)', senderPhone: sale.customerPhone || '', notes: '' });
  };

  const handleConfirmCreditPayment = (e) => {
    e.preventDefault();
    if (!creditPaymentModal.reference.trim()) { showNotification('Ingresa la referencia.', 'error'); return; }
    const paidAt = new Date().toISOString();
    setSales(prev => prev.map(s => s.id === creditPaymentModal.saleId ? { ...s, creditPaid: true, creditPaidDate: paidAt, paymentMethod: `${creditPaymentModal.paymentMethod} (Liquidado)`, paymentDetails: { ...s.paymentDetails, reference: creditPaymentModal.reference, senderName: creditPaymentModal.senderName, senderDocument: creditPaymentModal.senderDocument, senderBank: creditPaymentModal.senderBank, senderPhone: creditPaymentModal.senderPhone, paidAt, paidNotes: creditPaymentModal.notes || '' } } : s));
    showNotification(`Factura ${creditPaymentModal.invoiceNumber} cobrada.`);
    setCreditPaymentModal(prev => ({ ...prev, isOpen: false, saleId: null }));
  };

  // PREPARAR FACTURA PARA REVISIÓN (En lugar de emitir directamente)
  const handlePrepareCheckout = () => {
    if (cart.length === 0) { showNotification('Agrega productos.', 'error'); return; }
    if (!customDeliveryAddress.trim()) { showNotification('Falta la dirección.', 'error'); return; }
    if (paymentCondition === 'contado' && selectedPaymentMethod === 'Pago Móvil' && !paymentReference.trim()) { showNotification('Falta la referencia.', 'error'); return; }

    const customerObj = (customers || []).find(c => c.id === selectedCustomerId) || { id: 'cli_eventual', name: 'Cliente Delivery', phone: paymentSenderPhone || 'S/N', document: paymentSenderDoc || 'V-00000000' };
    const selectedReceiver = (paymentReceivers || []).find(r => r.id === selectedReceiverId) || null;

    const newInvoice = {
      id: `sale_${Date.now()}`, invoiceNumber: getNextInvoiceNumber(paymentCondition), date: new Date().toISOString().split('T')[0], timestamp: new Date().toISOString(), cashier: (currentUser || {}).username || 'Admin', customerId: customerObj.id, customerName: customerObj.name, customerPhone: customerObj.phone, customerDocument: customerObj.document, deliveryAddress: customDeliveryAddress.trim(), deliveryZoneName: selectedZone.name, deliveryFee: Number(selectedZone.fee || 0), items: cart, subtotal: cartSubtotal, totalCost: cartTotalCost, total: cartTotalUSD, totalBs: cartTotalBs, exchangeRateUsed: exchangeRate, paymentCondition, creditPaid: paymentCondition === 'contado', paymentMethod: paymentCondition === 'credito' ? 'Crédito Pendiente' : selectedPaymentMethod, receiver: selectedReceiver, paymentDetails: { reference: paymentCondition === 'credito' ? 'Por Cobrar' : (paymentReference || 'N/A') }, notes: orderNotes
    };
    setPendingInvoiceReview(newInvoice);
  };

  // APROBAR FACTURA
  const handleApproveInvoice = () => {
    if (!pendingInvoiceReview) return;
    setProducts(prev => prev.map(prod => { const sold = pendingInvoiceReview.items.find(i => i.productId === prod.id); return sold ? { ...prod, stock: Math.max(0, Number(prod.stock) - sold.qty) } : prod; }));
    setCustomers(prev => prev.map(c => c.id === pendingInvoiceReview.customerId ? { ...c, address: pendingInvoiceReview.deliveryAddress, defaultZoneId: selectedZoneId } : c));
    setSales(prev => [pendingInvoiceReview, ...prev]);
    setLastInvoiceModal(pendingInvoiceReview); setPendingInvoiceReview(null); setCart([]); setPaymentReference(''); setOrderNotes('');
    showNotification(`Factura ${pendingInvoiceReview.invoiceNumber} emitida.`);
  };

  // COMPARTIR COMANDA CON EL CLIENTE VÍA WHATSAPP
  const handleShareOrderReviewWhatsApp = (invoice) => {
    const itemsText = invoice.items.map(i => `• ${i.qty}x *${i.name}* — $${(i.price * i.qty).toFixed(2)}`).join('\n');
    const accountsText = (paymentReceivers || []).map(r => {
      let t = `*${r.holder}* (${(r.type || '').replace('_', ' ')})`;
      if (r.bank) t += `\nBanco: ${r.bank}`;
      if (r.phone) t += `\nTeléfono: ${r.phone}`;
      if (r.document) t += `\nC.I/RIF: ${r.document}`;
      if (r.binanceId) t += `\nBinance ID: ${r.binanceId}`;
      return t;
    }).join('\n\n');

    const text = `🌭 *VERIFICACIÓN DE PEDIDO - EL PUNTO DEL SABOR*\n\nHola *${invoice.customerName}*, revisa los detalles de tu pedido:\n\n` +
      `📋 *TU PEDIDO:*\n${itemsText}\n\n` +
      `🛵 *Delivery:* $${Number(invoice.deliveryFee).toFixed(2)}\n` +
      `💰 *TOTAL A PAGAR: $${Number(invoice.total).toFixed(2)} (Bs. ${Number(invoice.totalBs).toFixed(2)})*\n\n` +
      `💳 *DATOS PARA TU PAGO:*\n${accountsText}\n\n` +
      `⚠️ Por favor, envía tu comprobante por este medio para cerrar tu factura.`;

    copyTextToClipboard(text);
    const raw = invoice.customerPhone.replace(/[^0-9]/g, '');
    const intl = raw.startsWith('0') ? `58${raw.slice(1)}` : raw;
    window.open(`https://wa.me/${intl}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault(); if (!newCustomerForm.name.trim()) return;
    const created = { id: `cli_${Date.now()}`, ...newCustomerForm, document: newCustomerForm.document || 'V-0000', phone: newCustomerForm.phone || 'S/N' };
    setCustomers(prev => [created, ...prev]); setSelectedCustomerId(created.id); setCustomDeliveryAddress(created.address); setShowQuickCustomerModal(false);
    showNotification('Cliente registrado.');
  };

  const handleAddDeliveryZone = (e) => {
    e.preventDefault(); if (!newZoneForm.name.trim()) return;
    const nz = { id: `zone_${Date.now()}`, name: newZoneForm.name.trim(), fee: Number(newZoneForm.fee || 0) };
    setDeliveryZones(prev => [...prev, nz]); setNewZoneForm({ name: '', fee: '' }); showNotification('Ruta agregada.');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image(); img.onload = () => {
        const canvas = document.createElement('canvas'); const sc = Math.min(1, 500 / img.width);
        canvas.width = img.width * sc; canvas.height = img.height * sc;
        const ctx = canvas.getContext('2d'); if (ctx) { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); setProductForm(prev => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.82) })); }
      }; img.src = ev.target.result;
    }; reader.readAsDataURL(file);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault(); if (!productForm.name.trim()) return;
    const data = { ...productForm, price: Number(productForm.price || 0), cost: Number(productForm.cost || 0), stock: Number(productForm.stock || 0), minStock: Number(productForm.minStock || 10) };
    if (editingProduct) setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
    else setProducts(prev => [{ id: `prod_${Date.now()}`, ...data, active: true, image: data.image || FALLBACK_BY_CATEGORY[data.category] }, ...prev]);
    setEditingProduct(null); setProductForm({ name: '', category: 'perros', stage: 1, price: '', cost: '', stock: '', minStock: 10, description: '', image: '' });
    showNotification('Producto guardado.');
  };

  const handleAddExpense = (e) => {
    e.preventDefault(); if (!expenseForm.category.trim() || !expenseForm.amount) return;
    const exp = { id: `exp_${Date.now()}`, ...expenseForm, amount: Number(expenseForm.amount), expectedYieldUnits: Number(expenseForm.expectedYieldUnits || 0), consumedPercent: Number(expenseForm.consumedPercent || 0) };
    setExpenses(prev => [exp, ...prev]); setExpenseForm({ date: new Date().toISOString().split('T')[0], type: 'insumo', category: '', description: '', amount: '', supplier: '', expectedYieldUnits: 100, consumedPercent: 20 });
    showNotification('Gasto registrado.');
  };

  // GUARDAR CUENTA DE PAGO (RECEPTOR)
  const handleSavePaymentReceiver = (e) => {
    e.preventDefault();
    if (!paymentReceiverForm.holder.trim()) { showNotification('Indica el titular de la cuenta.', 'error'); return; }
    if (editingPaymentReceiver) {
      setPaymentReceivers(prev => prev.map(r => r.id === editingPaymentReceiver.id ? { ...r, ...paymentReceiverForm } : r));
      showNotification('Cuenta actualizada.');
    } else {
      setPaymentReceivers(prev => [...prev, { id: `pr_${Date.now()}`, ...paymentReceiverForm }]);
      showNotification('Cuenta agregada.');
    }
    setShowPaymentReceiverModal(false); setEditingPaymentReceiver(null);
  };

  const kpiMetrics = useMemo(() => {
    const safeSales = sales || [];
    const safeExpenses = expenses || [];
    const safeProducts = products || [];
    const totalSales = safeSales.reduce((a, s) => a + Number(s.total || 0), 0);
    const totalFood = safeSales.reduce((a, s) => a + Number(s.subtotal || 0), 0);
    const totalCost = safeSales.reduce((a, s) => a + Number(s.totalCost || 0), 0);
    const cash = safeSales.filter(s => s.paymentCondition === 'contado' || s.creditPaid).reduce((a, s) => a + Number(s.total || 0), 0);
    const credit = safeSales.filter(s => s.paymentCondition === 'credito' && !s.creditPaid).reduce((a, s) => a + Number(s.total || 0), 0);
    const insumos = safeExpenses.filter(e => e.type === 'insumo' || e.type === 'operativo').reduce((a, e) => a + Number(e.amount || 0), 0);
    const inv = safeExpenses.filter(e => e.type === 'inversion').reduce((a, e) => a + Number(e.amount || 0), 0);
    const profit = totalFood - totalCost;
    const margin = totalFood > 0 ? (profit / totalFood) * 100 : 0;
    const roi = inv > 0 ? Math.min(100, Math.max(0, (profit / inv) * 100)) : 100;
    const units = safeSales.reduce((a, s) => a + (s.items || []).reduce((sum, i) => sum + Number(i.qty || 0), 0), 0);
    const alarms = [];
    safeProducts.forEach(p => { if (Number(p.stock) <= Number(p.minStock)) alarms.push({ id: `stk_${p.id}`, severity: Number(p.stock) <= 5 ? 'critical' : 'warning', title: `Stock: ${p.name}`, detail: `Quedan ${p.stock} uds.` }); });
    if (credit > 0) alarms.push({ id: 'crd', severity: 'warning', title: `Por Cobrar`, detail: `$${credit.toFixed(2)} pendientes.` });
    return { totalSales, cash, credit, insumos, inv, profit, margin, roi, net: totalSales - insumos, alarms };
  }, [sales, expenses, products]);

  const copyTextToClipboard = (text) => {
    try {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px'; document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      setCopiedWhatsApp(true); setTimeout(() => setCopiedWhatsApp(false), 3000); showNotification('Copiado.');
    } catch (e) { if (navigator.clipboard) { navigator.clipboard.writeText(text); showNotification('Copiado.'); } }
  };

  const handleLogin = (e) => {
    e.preventDefault(); const found = (users || []).find(u => u.username.toLowerCase() === loginUsername.trim().toLowerCase() && u.password === loginPassword);
    if (!found) { setLoginError('Credenciales incorrectas.'); return; }
    setCurrentUser(found); setLoginError(''); showNotification(`Bienvenido(a), ${found.username}`);
  };

  const handleExportTableCSV = (filename, headers, rows) => {
    const BOM = '\uFEFF'; const csvLines = [headers.join(';'), ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))];
    const blob = new Blob([BOM + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.setAttribute('download', filename); document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showNotification(`Archivo ${filename} descargado.`);
  };

  const handleExportFullBackupJSON = () => {
    const backup = { businessName: 'El Punto del Sabor', exportedAt: new Date().toISOString(), exchangeRate, users, products, deliveryZones, paymentMethods, customers, expenses, sales, supplyCatalog, supplierCatalog, paymentReceivers };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.setAttribute('download', `Respaldo.json`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showNotification('Respaldo descargado.');
  };

  if (isCustomerPublicView) {
    const publicProds = availableCustomerProducts.filter(p => (customerFilterCat === 'todos' || p.category === customerFilterCat) && (!customerSearch || (p.name || '').toLowerCase().includes(customerSearch.toLowerCase())));
    const selZone = (deliveryZones || []).find(z => z.id === customerOrderForm.zoneId) || { name: 'Delivery', fee: 0 };
    const cSub = customerCart.reduce((a, i) => a + i.price * i.qty, 0);
    const cDel = customerCart.length > 0 ? Number(selZone.fee || 0) : 0;
    const cTot = cSub + cDel;

    const handleSendOrder = () => {
      if (customerCart.length === 0 || !customerOrderForm.name || !customerOrderForm.phone || !customerOrderForm.address) { showNotification('Completa tus datos y el pedido.', 'error'); return; }
      const raw = businessWhatsApp.replace(/[^0-9]/g, ''); const intl = raw.startsWith('0') ? `58${raw.slice(1)}` : raw;
      const text = `🌭 *NUEVO PEDIDO* \n\n👤 *CLIENTE:*\n• Nombre: ${customerOrderForm.name}\n• C.I: ${customerOrderForm.document}\n• Teléfono: ${customerOrderForm.phone}\n• Dirección: ${customerOrderForm.address}\n• Ruta: ${selZone.name} ($${cDel.toFixed(2)})\n\n📋 *PEDIDO:*\n` + customerCart.map(i => `• ${i.qty}x ${i.name} — $${(i.price * i.qty).toFixed(2)}`).join('\n') + `\n\n💰 *TOTAL: $${cTot.toFixed(2)} (Bs. ${(cTot * exchangeRate).toFixed(2)})*\n💳 *Pago:* ${customerOrderForm.paymentMethod}\nRef: ${customerOrderForm.paymentReference}`;
      copyTextToClipboard(text); window.open(`https://wa.me/${intl}?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col">
        <header className="bg-gradient-to-r from-amber-500 to-red-600 text-stone-950 p-4 sticky top-0 z-30 shadow-xl flex justify-between items-center">
          <div className="flex items-center gap-2"><span className="text-3xl">🌭</span><div><h1 className="text-xl font-black">EL PUNTO DEL SABOR</h1><p className="text-xs font-bold">WhatsApp: {businessWhatsApp}</p></div></div>
          <button onClick={() => setIsCustomerPublicView(false)} className="bg-white/90 px-3 py-1.5 rounded-xl text-xs font-black">← Volver</button>
        </header>
        <div className="p-4 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-stone-900 p-3 rounded-2xl border border-stone-800 flex flex-col gap-2">
              <input type="text" placeholder="Buscar..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="w-full bg-stone-950 p-2 rounded-xl text-xs text-white border border-stone-700 outline-none" />
              <div className="flex gap-1 overflow-x-auto">
                {(CATEGORIES || []).map(c => <button key={c.id} onClick={() => setCustomerFilterCat(c.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${customerFilterCat === c.id ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300'}`}>{c.label}</button>)}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {publicProds.map(p => (
                <div key={p.id} className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
                  <img src={p.image} onError={e => e.currentTarget.src = FALLBACK_BY_CATEGORY[p.category] || FALLBACK_BY_CATEGORY.perros} className="w-full h-40 object-cover" />
                  <div className="p-3"><h3 className="font-bold text-sm">{p.name}</h3><p className="text-xs text-stone-400 line-clamp-2">{p.description}</p>
                    <div className="flex justify-between items-center mt-3"><div><div className="text-amber-400 font-black">${Number(p.price).toFixed(2)}</div><div className="text-[10px] text-stone-500">Bs. {(Number(p.price) * exchangeRate).toFixed(2)}</div></div>
                      <button onClick={() => { const ex = customerCart.find(i => i.id === p.id); if (ex) setCustomerCart(prev => prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)); else setCustomerCart(prev => [...prev, { id: p.id, name: p.name, price: Number(p.price), qty: 1 }]); }} className="bg-amber-500 text-stone-950 font-black text-xs px-3 py-1.5 rounded-xl">+ Agregar</button></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 bg-stone-900 rounded-2xl border border-stone-800 p-4 space-y-3 h-fit sticky top-20">
            <h2 className="font-black text-amber-400 text-sm">🛵 Tu Pedido</h2>
            {customerCart.map(i => <div key={i.id} className="flex justify-between items-center bg-stone-950 p-2 rounded-xl text-xs"><span>{i.qty}x {i.name}</span><span className="font-bold text-amber-400">${(i.price * i.qty).toFixed(2)}</span></div>)}
            <input placeholder="Nombre *" value={customerOrderForm.name} onChange={e => setCustomerOrderForm({ ...customerOrderForm, name: e.target.value })} className="w-full bg-stone-950 p-2 rounded-xl text-xs border border-stone-700" />
            <input placeholder="Cédula *" value={customerOrderForm.document} onChange={e => setCustomerOrderForm({ ...customerOrderForm, document: e.target.value })} className="w-full bg-stone-950 p-2 rounded-xl text-xs border border-stone-700" />
            <input placeholder="Teléfono *" value={customerOrderForm.phone} onChange={e => setCustomerOrderForm({ ...customerOrderForm, phone: e.target.value })} className="w-full bg-stone-950 p-2 rounded-xl text-xs border border-stone-700" />
            <select value={customerOrderForm.zoneId} onChange={e => setCustomerOrderForm({ ...customerOrderForm, zoneId: e.target.value })} className="w-full bg-stone-950 p-2 rounded-xl text-xs border border-stone-700">{(deliveryZones || []).map(z => <option key={z.id} value={z.id}>{z.name} (+${z.fee})</option>)}</select>
            <textarea placeholder="Dirección *" value={customerOrderForm.address} onChange={e => setCustomerOrderForm({ ...customerOrderForm, address: e.target.value })} className="w-full bg-stone-950 p-2 rounded-xl text-xs border border-stone-700" rows={2} />
            <div className="text-lg font-black text-white flex justify-between"><span>TOTAL:</span><span>${cTot.toFixed(2)}</span></div>
            <button onClick={handleSendOrder} className="w-full bg-emerald-500 text-stone-950 font-black py-3 rounded-xl text-xs flex justify-center items-center gap-2"><Smartphone className="w-4 h-4" /> Enviar por WhatsApp</button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4">
          <h1 className="text-xl font-black text-center text-stone-900">EL PUNTO DEL SABOR</h1>
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} className="w-full p-2 border rounded-xl text-xs" placeholder="Usuario" />
            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-2 border rounded-xl text-xs" placeholder="Contraseña" />
            {loginError && <div className="text-red-500 text-xs">{loginError}</div>}
            <button type="submit" className="w-full bg-stone-900 text-amber-400 font-bold py-2 rounded-xl text-xs">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  const dailySales = (sales || []).filter(s => s.date === closingDate);
  const dailySummary = {};
  dailySales.forEach(s => { (s.items || []).forEach(i => { if (!dailySummary[i.name]) dailySummary[i.name] = { qty: 0, total: 0, cat: i.category }; dailySummary[i.name].qty += i.qty; dailySummary[i.name].total += i.subtotal; }); });
  const filteredClosing = dailySales.filter(s => invoiceFilterType === 'all' || s.paymentCondition === invoiceFilterType);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      {notification && <div className={`fixed bottom-5 right-5 z-50 px-4 py-2 rounded-xl shadow-xl text-xs font-bold text-white ${notification.type === 'error' ? 'bg-red-600' : 'bg-stone-900'}`}>{notification.message}</div>}
      
      <header className="bg-stone-900 text-white p-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2"><span className="text-2xl">🌭</span><h1 className="font-black text-sm">EL PUNTO DEL SABOR</h1></div>
          <div className="flex items-center gap-2 text-xs">
            <input type="number" value={exchangeRate} onChange={e => setExchangeRate(Number(e.target.value) || 1)} className="w-16 bg-stone-800 text-amber-400 p-1 rounded text-center border border-stone-700" />
            <button onClick={() => setCurrentUser(null)} className="bg-stone-800 px-3 py-1.5 rounded-lg font-bold">Salir</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex gap-1 mt-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'pos', label: 'Facturación', icon: ShoppingBag },
            { id: 'catalog', label: 'Menú', icon: Utensils },
            { id: 'customers', label: 'Clientes', icon: Users },
            { id: 'closing', label: 'Cierre', icon: FileText },
            { id: 'settings', label: 'Ajustes', icon: Settings }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap flex items-center gap-1 ${activeTab === t.id ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'}`}><t.icon className="w-3.5 h-3.5" /> {t.label}</button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-4 flex-1">
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-stone-200 flex gap-2 overflow-x-auto">
                <input type="text" placeholder="Buscar producto..." value={posSearch} onChange={e => setPosSearch(e.target.value)} className="flex-1 p-2 border rounded-xl text-xs" />
                <select value={activeStageFilter} onChange={e => setActiveStageFilter(e.target.value)} className="p-2 border rounded-xl text-xs font-bold"><option value="all">Todas</option><option value="1">Etapa 1</option><option value="2">Etapa 2</option></select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredProducts.map(p => (
                  <div key={p.id} onClick={() => addToCart(p)} className="bg-white rounded-2xl border border-stone-200 overflow-hidden cursor-pointer shadow-sm hover:shadow-md">
                    <img src={p.image} onError={e => e.currentTarget.src = FALLBACK_BY_CATEGORY[p.category]} className="w-full h-32 object-cover" />
                    <div className="p-2"><h3 className="font-bold text-xs truncate">{p.name}</h3><div className="flex justify-between items-center mt-2"><span className="font-black text-xs">${Number(p.price).toFixed(2)}</span><span className="bg-amber-500 p-1 rounded-lg text-[10px] font-bold"><Plus className="w-3 h-3" /></span></div></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-stone-200 shadow-sm h-fit space-y-3">
              <h2 className="font-black text-sm border-b pb-2">Factura</h2>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {cart.map(i => <div key={i.productId} className="flex justify-between text-xs bg-stone-50 p-2 rounded-lg"><span>{i.qty}x {i.name}</span><span className="font-bold">${i.subtotal.toFixed(2)}</span></div>)}
              </div>
              <select value={selectedZoneId} onChange={e => setSelectedZoneId(e.target.value)} className="w-full p-2 border rounded-xl text-xs">
                {(deliveryZones || []).map(z => <option key={z.id} value={z.id}>{z.name} (+${z.fee})</option>)}
              </select>
              
              {/* SELECTOR DE CUENTA QUE RECIBE EL PAGO (REEMPLAZA AL EMISOR) */}
              <div className="bg-stone-50 p-2 rounded-xl border border-stone-200">
                <label className="block text-[10px] font-bold text-stone-700 mb-1">💼 Cuenta que RECIBE el pago:</label>
                <select value={selectedReceiverId} onChange={e => setSelectedReceiverId(e.target.value)} className="w-full p-2 border border-emerald-300 bg-emerald-50 rounded-xl text-xs font-bold">
                  <option value="">-- Seleccionar cuenta (Opcional) --</option>
                  {(paymentReceivers || []).map(r => <option key={r.id} value={r.id}>{r.holder} - {r.type.replace('_', ' ')}</option>)}
                </select>
              </div>

              <div className="bg-stone-900 text-white p-3 rounded-xl flex justify-between items-center"><span className="text-xs font-bold">TOTAL:</span><span className="text-lg font-black text-amber-400">${cartTotalUSD.toFixed(2)}</span></div>
              <button onClick={handlePrepareCheckout} className="w-full bg-amber-500 font-black py-3 rounded-xl text-xs flex justify-center items-center gap-1"><Printer className="w-4 h-4" /> Revisar y Emitir</button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TARJETA: CUENTAS QUE RECIBEN PAGOS */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3 md:col-span-2">
              <div className="flex justify-between items-center">
                <h2 className="font-black text-sm text-stone-900 flex items-center gap-1"><DollarSign className="w-4 h-4 text-emerald-600" /> Cuentas que Reciben Pagos</h2>
                <button onClick={() => { setEditingPaymentReceiver(null); setPaymentReceiverForm({ type: 'pago_movil', holder: '', document: '', bank: '', phone: '', binanceId: '' }); setShowPaymentReceiverModal(true); }} className="bg-stone-900 text-amber-400 px-3 py-1.5 rounded text-xs font-bold">+ Nueva Cuenta</button>
              </div>
              <p className="text-xs text-stone-500">Estas cuentas se incluirán cuando compartas la comanda con el cliente por WhatsApp.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(paymentReceivers || []).map(r => (
                  <div key={r.id} className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs flex justify-between">
                    <div>
                      <div className="font-black text-stone-900">{r.holder} <span className="text-amber-700 uppercase">({r.type.replace('_', ' ')})</span></div>
                      <div className="text-stone-600 mt-0.5">
                        {r.bank && <>{r.bank} • </>}
                        {r.phone && <>{r.phone} • </>}
                        {r.binanceId && <>Binance: {r.binanceId}</>}
                      </div>
                    </div>
                    <div className="flex gap-1 items-start">
                      <button onClick={() => { setEditingPaymentReceiver(r); setPaymentReceiverForm(r); setShowPaymentReceiverModal(true); }} className="p-1.5 bg-stone-200 rounded hover:bg-stone-300"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { setPaymentReceivers(prev => prev.filter(item => item.id !== r.id)); showNotification('Cuenta eliminada'); }} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
              <h2 className="font-black text-xs uppercase">Respaldos</h2>
              <div className="flex gap-2">
                <button onClick={handleExportFullBackupJSON} className="bg-stone-900 text-amber-400 p-2 rounded-xl text-xs font-bold flex-1">Descargar JSON</button>
                <label className="bg-emerald-600 text-white p-2 rounded-xl text-xs font-bold flex-1 text-center cursor-pointer">Subir JSON<input type="file" onChange={(e) => { /* lógica de importación */ }} className="hidden" /></label>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => handleExportTableCSV('Ventas.csv', ['Factura','Fecha','Cliente','Total'], (sales || []).map(s => [s.invoiceNumber, s.date, s.customerName, s.total]))} className="border p-2 rounded text-xs font-bold hover:bg-stone-50">Ventas CSV</button>
                <button onClick={() => handleExportTableCSV('Productos.csv', ['Nombre','Precio','Stock'], (products || []).map(p => [p.name, p.price, p.stock]))} className="border p-2 rounded text-xs font-bold hover:bg-stone-50">Productos CSV</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'closing' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border flex justify-between">
              <h2 className="font-black text-sm">Cierre Diario</h2>
              <input type="date" value={closingDate} onChange={e => setClosingDate(e.target.value)} className="border p-1 rounded text-xs" />
            </div>
            <div className="bg-white p-4 rounded-2xl border space-y-2">
              <div className="flex gap-1 mb-2">
                <button onClick={() => setInvoiceFilterType('all')} className={`px-2 py-1 rounded text-xs ${invoiceFilterType==='all'?'bg-stone-900 text-white':'bg-stone-100'}`}>Todas</button>
                <button onClick={() => setInvoiceFilterType('contado')} className={`px-2 py-1 rounded text-xs ${invoiceFilterType==='contado'?'bg-emerald-600 text-white':'bg-stone-100'}`}>Contado</button>
                <button onClick={() => setInvoiceFilterType('credito')} className={`px-2 py-1 rounded text-xs ${invoiceFilterType==='credito'?'bg-amber-600 text-white':'bg-stone-100'}`}>Crédito</button>
              </div>
              {filteredClosing.map(s => {
                const days = s.paymentCondition === 'credito' && !s.creditPaid ? getDaysPending(s.date) : 0;
                return (
                  <div key={s.id} className="border p-2 rounded-xl flex justify-between items-center text-xs">
                    <div><strong>{s.invoiceNumber} - {s.customerName}</strong><br/>{s.paymentMethod}</div>
                    <div className="text-right"><span className="font-black">${Number(s.total).toFixed(2)}</span>{days > 0 && <div className={`text-[10px] px-1 rounded mt-1 ${getDaysPendingBadge(days)}`}>⏱ {days} días</div>}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE REVISIÓN DE FACTURA */}
      {pendingInvoiceReview && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-amber-500 max-h-[92vh] overflow-y-auto">
            <div className="text-center border-b border-dashed border-stone-300 pb-3">
              <div className="text-2xl">🧾</div>
              <h3 className="text-lg font-black text-stone-900">REVISAR FACTURA ANTES DE EMITIR</h3>
              <p className="text-xs font-bold text-amber-700">{pendingInvoiceReview.invoiceNumber} — {pendingInvoiceReview.paymentCondition === 'credito' ? 'CRÉDITO' : 'CONTADO'}</p>
            </div>
            
            <div className="text-xs space-y-1 bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <div><strong>Cliente:</strong> {pendingInvoiceReview.customerName} ({pendingInvoiceReview.customerPhone})</div>
              <div><strong>📍 Dirección:</strong> {pendingInvoiceReview.deliveryAddress}</div>
              <div><strong>🛵 Ruta:</strong> {pendingInvoiceReview.deliveryZoneName} (${Number(pendingInvoiceReview.deliveryFee).toFixed(2)})</div>
              <div><strong>💳 Pago:</strong> {pendingInvoiceReview.paymentMethod} ({pendingInvoiceReview.paymentCondition.toUpperCase()})</div>
              {pendingInvoiceReview.receiver && (
                <div className="text-emerald-800 font-bold"><strong>💼 Recibe:</strong> {pendingInvoiceReview.receiver.holder} ({pendingInvoiceReview.receiver.type})</div>
              )}
            </div>

            <div className="space-y-1.5 text-xs border-b border-dashed border-stone-300 pb-3">
              {pendingInvoiceReview.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.qty}x {item.name}</span>
                  <span className="font-bold">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-300">
                <span>TOTAL:</span>
                <span>${pendingInvoiceReview.total.toFixed(2)} (Bs. {Number(pendingInvoiceReview.totalBs).toFixed(2)})</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button onClick={handleApproveInvoice} className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Aprobar y Emitir
              </button>
              <button onClick={() => setPendingInvoiceReview(null)} className="py-3 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-black text-sm flex items-center justify-center gap-2">
                ← Volver y Modificar
              </button>
            </div>
            
            <button onClick={() => handleShareOrderReviewWhatsApp(pendingInvoiceReview)} className="w-full py-2.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs flex items-center justify-center gap-2 mt-2">
              <Share2 className="w-4 h-4" /> Compartir Comanda y Datos de Pago (WhatsApp)
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE GESTIÓN DE CUENTAS RECEPTORAS */}
      {showPaymentReceiverModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-emerald-500 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-black text-stone-900">{editingPaymentReceiver ? 'Editar Cuenta' : 'Nueva Cuenta que Recibe Pagos'}</h3>
            <form onSubmit={handleSavePaymentReceiver} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Tipo de cuenta *</label>
                <select value={paymentReceiverForm.type} onChange={e => setPaymentReceiverForm({ ...paymentReceiverForm, type: e.target.value })} className="w-full px-3 py-2 rounded-xl border font-bold">
                  <option value="pago_movil">📱 Pago Móvil</option>
                  <option value="transferencia">🏦 Transferencia</option>
                  <option value="binance">🟡 Binance (USDT)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Titular *</label>
                <input type="text" value={paymentReceiverForm.holder} onChange={e => setPaymentReceiverForm({ ...paymentReceiverForm, holder: e.target.value })} className="w-full px-3 py-2 rounded-xl border" required />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Cédula / RIF</label>
                <input type="text" value={paymentReceiverForm.document} onChange={e => setPaymentReceiverForm({ ...paymentReceiverForm, document: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
              </div>
              {paymentReceiverForm.type === 'pago_movil' && (
                <>
                  <div><label className="block font-bold text-stone-700 mb-1">Banco</label><select value={paymentReceiverForm.bank} onChange={e => setPaymentReceiverForm({ ...paymentReceiverForm, bank: e.target.value })} className="w-full px-3 py-2 rounded-xl border font-bold"><option value="">-- Seleccionar --</option>{VENEZUELAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                  <div><label className="block font-bold text-stone-700 mb-1">Teléfono</label><input type="text" value={paymentReceiverForm.phone} onChange={e => setPaymentReceiverForm({ ...paymentReceiverForm, phone: e.target.value })} placeholder="0424-XXXXXXX" className="w-full px-3 py-2 rounded-xl border" /></div>
                </>
              )}
              {paymentReceiverForm.type === 'transferencia' && (
                <>
                  <div><label className="block font-bold text-stone-700 mb-1">Banco</label><select value={paymentReceiverForm.bank} onChange={e => setPaymentReceiverForm({ ...paymentReceiverForm, bank: e.target.value })} className="w-full px-3 py-2 rounded-xl border font-bold"><option value="">-- Seleccionar --</option>{VENEZUELAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                  <div><label className="block font-bold text-stone-700 mb-1">Número de Cuenta</label><input type="text" value={paymentReceiverForm.phone} onChange={e => setPaymentReceiverForm({ ...paymentReceiverForm, phone: e.target.value })} className="w-full px-3 py-2 rounded-xl border" /></div>
                </>
              )}
              {paymentReceiverForm.type === 'binance' && (
                <div><label className="block font-bold text-stone-700 mb-1">Binance Pay ID / Correo</label><input type="text" value={paymentReceiverForm.binanceId} onChange={e => setPaymentReceiverForm({ ...paymentReceiverForm, binanceId: e.target.value })} className="w-full px-3 py-2 rounded-xl border" /></div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-black">{editingPaymentReceiver ? 'Guardar Cambios' : 'Crear Cuenta'}</button>
                <button type="button" onClick={() => setShowPaymentReceiverModal(false)} className="px-4 py-2.5 rounded-xl bg-stone-200 font-bold">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTROS MODALES (Cierre, Cobro Crédito, etc.) */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-red-500">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0"><Lock className="w-6 h-6" /></div>
              <div><h3 className="text-base font-black text-stone-900">{deleteModal.title}</h3><p className="text-xs text-stone-500">{deleteModal.description}</p></div>
            </div>
            <form onSubmit={handleConfirmProtectedDelete} className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <label className="block text-xs font-extrabold text-stone-800">🔑 Ingresa la Clave Especial:</label>
                <input type="password" autoFocus value={deletePinAttempt} onChange={e => { setDeletePinAttempt(e.target.value); setDeletePinError(''); }} placeholder="Clave (Por defecto: 2026)" className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900" required />
              </div>
              {deletePinError && <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">{deletePinError}</div>}
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow">Autorizar y Eliminar</button>
                <button type="button" onClick={() => setDeleteModal({ isOpen: false, title: '', description: '', onConfirm: null })} className="px-4 py-2.5 rounded-xl bg-stone-200 text-stone-700 font-bold text-xs">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {creditPaymentModal.isOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-amber-500 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0"><DollarSign className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Cobrar Factura a Crédito</h3>
                  <p className="text-xs text-stone-500">{creditPaymentModal.invoiceNumber} — {creditPaymentModal.customerName}</p>
                  <p className="text-[11px] font-bold text-amber-700 mt-0.5">⏱ {creditPaymentModal.daysPending} días pendientes</p>
                </div>
              </div>
              <button type="button" onClick={() => setCreditPaymentModal(prev => ({ ...prev, isOpen: false }))} className="text-stone-400 hover:text-stone-700 font-bold text-sm">✕</button>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-900">Monto a cobrar:</span>
                <span className="font-black text-xl text-amber-900">${creditPaymentModal.totalUSD.toFixed(2)}</span>
              </div>
              <div className="text-right text-[11px] text-amber-700 font-bold">Bs. {(creditPaymentModal.totalUSD * exchangeRate).toFixed(2)}</div>
            </div>
            <form onSubmit={handleConfirmCreditPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Método de Pago Recibido:</label>
                <select value={creditPaymentModal.paymentMethod} onChange={e => { const m = e.target.value; setCreditPaymentModal(prev => ({ ...prev, paymentMethod: m })); }} className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900">
                  {(paymentMethods || []).map(pm => <option key={pm.id} value={pm.name}>{pm.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">🔢 N° de Referencia / ID de Operación *</label>
                <input type="text" value={creditPaymentModal.reference} onChange={e => setCreditPaymentModal(prev => ({ ...prev, reference: e.target.value }))} placeholder="Ej: 849201" className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900" required />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4" /> Confirmar Pago</button>
                <button type="button" onClick={() => setCreditPaymentModal(prev => ({ ...prev, isOpen: false }))} className="px-4 py-2.5 rounded-xl bg-stone-200 text-stone-700 font-bold text-xs">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuickCustomerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-stone-900">Registrar Nuevo Cliente</h3>
            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <input type="text" placeholder="Nombre y Apellido *" value={newCustomerForm.name} onChange={e => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900" required />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Cédula / RIF" value={newCustomerForm.document} onChange={e => setNewCustomerForm({ ...newCustomerForm, document: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900" />
                <input type="text" placeholder="Teléfono WhatsApp *" value={newCustomerForm.phone} onChange={e => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900" />
              </div>
              <textarea rows={2} placeholder="Dirección exacta de envío *" value={newCustomerForm.address} onChange={e => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900" required />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs">Guardar Cliente</button>
                <button type="button" onClick={() => setShowQuickCustomerModal(false)} className="px-4 py-2.5 rounded-xl bg-stone-200 text-stone-700 font-bold text-xs">Cerrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lastInvoiceModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-amber-500">
            <div className="text-center border-b border-dashed border-stone-300 pb-3">
              <div className="text-2xl">🌭</div>
              <h3 className="text-lg font-black text-stone-900">EL PUNTO DEL SABOR</h3>
              <p className="text-xs font-bold text-stone-500">Factura: {lastInvoiceModal.invoiceNumber} • Tel: {businessWhatsApp}</p>
              <p className="text-[11px] text-stone-400">Fecha: {lastInvoiceModal.date} | Cajero: {lastInvoiceModal.cashier}</p>
            </div>
            <div className="text-xs space-y-1 bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <div><strong>Cliente:</strong> {lastInvoiceModal.customerName} ({lastInvoiceModal.customerPhone})</div>
              <div><strong>📍 Dirección:</strong> {lastInvoiceModal.deliveryAddress}</div>
              <div><strong>🛵 Ruta:</strong> {lastInvoiceModal.deliveryZoneName} (${Number(lastInvoiceModal.deliveryFee).toFixed(2)})</div>
              <div><strong>💳 Pago:</strong> {lastInvoiceModal.paymentMethod} ({lastInvoiceModal.paymentCondition.toUpperCase()})</div>
              {lastInvoiceModal.receiver && (
                <div className="text-emerald-800 font-bold"><strong>💼 Recibe:</strong> {lastInvoiceModal.receiver.holder}</div>
              )}
            </div>
            <div className="space-y-1.5 text-xs border-b border-dashed border-stone-300 pb-3">
              {lastInvoiceModal.items.map((item, idx) => (
                <div key={idx} className="flex justify-between"><span>{item.qty}x {item.name}</span><span className="font-bold">${item.subtotal.toFixed(2)}</span></div>
              ))}
              <div className="flex justify-between text-sm font-black text-stone-900 pt-1"><span>TOTAL:</span><span>${lastInvoiceModal.total.toFixed(2)} (Bs. {Number(lastInvoiceModal.totalBs).toFixed(2)})</span></div>
            </div>
            <button type="button" onClick={() => setLastInvoiceModal(null)} className="w-full py-2 rounded-xl bg-stone-200 text-stone-800 font-bold text-xs">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
