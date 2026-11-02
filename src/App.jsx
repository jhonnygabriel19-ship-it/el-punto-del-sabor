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
// INICIALIZACIÓN DE BASE DE DATOS
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
  console.warn('Usando almacenamiento local:', err);
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
  if (currentLine) lines.push(currentLine);
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
  { id: 'usr_1', username: 'Michelle Sifontes', password: '21237816', role: 'Socia Administradora' },
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
    id: 'sale_init_1', invoiceNumber: 'EPDS-1001', date: new Date().toISOString().split('T')[0], timestamp: new Date().toISOString(), cashier: 'Michelle Sifontes', customerId: 'cli_1', customerName: 'Carlos Mendoza', customerPhone: '0414-8823411', customerDocument: 'V-18452310', deliveryAddress: 'Urb. Los Olivos, Calle Mediterráneo, Casa #14', deliveryZoneName: 'Casco Central', deliveryFee: 2.00, items: [{ productId: 'prod_combo_2', name: 'Combo 2', category: 'combos', qty: 2, price: 5.80, cost: 2.60, subtotal: 11.60 }], subtotal: 11.60, totalCost: 5.20, total: 13.60, totalBs: 618.80, exchangeRateUsed: 45.5, paymentCondition: 'contado', creditPaid: true, paymentMethod: 'Pago Móvil', paymentDetails: { reference: '948271', senderName: 'Carlos Mendoza', senderDocument: 'V-18452310', senderBank: '0102 - Banco de Venezuela', senderPhone: '0414-8823411', sender: 'Carlos Mendoza', bankOrPhone: '0102' }, notes: ''
  }
];

const DEFAULT_CATEGORIES = [
  { id: 'todos', label: 'Todos', isFixed: true },
  { id: 'perros', label: '🌭 Perros Calientes' },
  { id: 'combos', label: '🥤 Combos' },
  { id: 'hamburguesas', label: '🍔 Hamburguesas' },
  { id: 'papas', label: '🍟 Papas Fritas' },
  { id: 'especialidades', label: '🧀 Tequeños' },
  { id: 'postres', label: '🍨 Postres' },
  { id: 'refrescos', label: '🧊 Bebidas' }
];

const DEFAULT_PAYMENT_RECEIVERS = [
  { id: 'pr_1', type: 'pago_movil', holder: 'Michelle Sifontes', bank: '0102 - Banco de Venezuela (BDV)', phone: '0424-9043122', document: 'V-21237816', account: '', binanceId: '', email: '', isActive: true, showToCustomers: true },
  { id: 'pr_2', type: 'binance', holder: 'Michelle Sifontes', bank: '', phone: '', document: 'V-21237816', account: '', binanceId: 'michelle_sifontes', email: 'michelle@email.com', isActive: true, showToCustomers: true }
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

  const [categories, setCategories] = useState(() => loadFromStorage('epds_categories_v2', DEFAULT_CATEGORIES));
  const [paymentReceivers, setPaymentReceivers] = useState(() => loadFromStorage('epds_payment_receivers_v2', DEFAULT_PAYMENT_RECEIVERS));
  const [pendingInvoiceReview, setPendingInvoiceReview] = useState(null);
  const [zoneSearchInput, setZoneSearchInput] = useState('');
  const [showZoneSuggestions, setShowZoneSuggestions] = useState(false);
  const [selectedReceiverId, setSelectedReceiverId] = useState('');
  const [showPaymentShareModal, setShowPaymentShareModal] = useState(false);
  const [paymentShareSelections, setPaymentShareSelections] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ id: '', label: '' });
  const [showPaymentReceiverModal, setShowPaymentReceiverModal] = useState(false);
  const [editingPaymentReceiver, setEditingPaymentReceiver] = useState(null);
  const [paymentReceiverForm, setPaymentReceiverForm] = useState({ type: 'pago_movil', holder: '', bank: '', phone: '', document: '', account: '', binanceId: '', email: '', showToCustomers: true });

  const [products, setProducts] = useState(() => loadFromStorage('epds_products_v2', INITIAL_PRODUCTS));
  const [deliveryZones, setDeliveryZones] = useState(() => loadFromStorage('epds_zones_v2', INITIAL_DELIVERY_ZONES));
  const [paymentMethods, setPaymentMethods] = useState(() => loadFromStorage('epds_pm_v2', INITIAL_PAYMENT_METHODS));
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

  // EFECTOS FIREBASE
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
        if (Array.isArray(data.users) && data.users.length > 0) setUsers(data.users);
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
        if (Array.isArray(data.categories)) setCategories(data.categories);
        if (Array.isArray(data.paymentReceivers)) setPaymentReceivers(data.paymentReceivers);
        setCloudReady(true);
      } else {
        setDoc(stateDocRef, {
          users, products, deliveryZones, paymentMethods, customers, expenses, sales,
          supplyCatalog, supplierCatalog, securityDeletePin, businessWhatsApp, categories, paymentReceivers,
          updatedAt: new Date().toISOString()
        }, { merge: true }).then(() => setCloudReady(true)).catch(() => setCloudReady(true));
      }
    }, (err) => console.warn('Error reading cloud:', err));
    return () => unsub();
  }, [fbUser]);

  const persistToCloud = async (partialData) => {
    if (!db || !fbUser) return;
    try {
      const stateDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'epds_store', 'main_state');
      await setDoc(stateDocRef, { ...partialData, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) { console.warn('Sync error:', e); }
  };

  useEffect(() => { try { localStorage.setItem('epds_users_v2', JSON.stringify(users)); } catch (e) {} if (cloudReady) persistToCloud({ users }); }, [users, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_rate_v2', JSON.stringify(exchangeRate)); } catch (e) {} }, [exchangeRate]);
  useEffect(() => { try { localStorage.setItem('epds_bcv_last_update_v2', JSON.stringify(bcvLastUpdate)); } catch (e) {} }, [bcvLastUpdate]);
  useEffect(() => { try { localStorage.setItem('epds_delete_pin_v2', JSON.stringify(securityDeletePin)); } catch (e) {} if (cloudReady) persistToCloud({ securityDeletePin }); }, [securityDeletePin, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_products_v2', JSON.stringify(products)); } catch (e) {} if (cloudReady) persistToCloud({ products }); }, [products, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_zones_v2', JSON.stringify(deliveryZones)); } catch (e) {} if (cloudReady) persistToCloud({ deliveryZones }); }, [deliveryZones, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_pm_v2', JSON.stringify(paymentMethods)); } catch (e) {} if (cloudReady) persistToCloud({ paymentMethods }); }, [paymentMethods, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_customers_v2', JSON.stringify(customers)); } catch (e) {} if (cloudReady) persistToCloud({ customers }); }, [customers, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_expenses_v2', JSON.stringify(expenses)); } catch (e) {} if (cloudReady) persistToCloud({ expenses }); }, [expenses, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_sales_v2', JSON.stringify(sales)); } catch (e) {} if (cloudReady) persistToCloud({ sales }); }, [sales, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_supply_catalog_v2', JSON.stringify(supplyCatalog)); } catch (e) {} if (cloudReady) persistToCloud({ supplyCatalog }); }, [supplyCatalog, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_supplier_catalog_v2', JSON.stringify(supplierCatalog)); } catch (e) {} if (cloudReady) persistToCloud({ supplierCatalog }); }, [supplierCatalog, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_whatsapp_v2', JSON.stringify(businessWhatsApp)); } catch (e) {} if (cloudReady) persistToCloud({ businessWhatsApp }); }, [businessWhatsApp, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_custom_public_url_v2', JSON.stringify(customPublicUrl)); } catch (e) {} }, [customPublicUrl]);
  useEffect(() => { try { localStorage.setItem('epds_categories_v2', JSON.stringify(categories)); } catch (e) {} if (cloudReady) persistToCloud({ categories }); }, [categories, cloudReady]);
  useEffect(() => { try { localStorage.setItem('epds_payment_receivers_v2', JSON.stringify(paymentReceivers)); } catch (e) {} if (cloudReady) persistToCloud({ paymentReceivers }); }, [paymentReceivers, cloudReady]);
  useEffect(() => {
    const z = (deliveryZones || []).find(zz => zz.id === selectedZoneId);
    if (z) setZoneSearchInput(z.name);
  }, [selectedZoneId, deliveryZones]);

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
    (categories || []).filter(c => c.id !== 'todos').forEach(cat => {
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

  const handlePrepareCheckout = () => {
    if (cart.length === 0) { showNotification('Agrega productos.', 'error'); return; }
    if (!customDeliveryAddress.trim()) { showNotification('Falta la dirección.', 'error'); return; }
    if (paymentCondition === 'contado' && selectedPaymentMethod === 'Pago Móvil' && !paymentReference.trim()) { showNotification('Falta la referencia.', 'error'); return; }

    const customerObj = (customers || []).find(c => c.id === selectedCustomerId) || { id: 'cli_eventual', name: 'Cliente Delivery', phone: paymentSenderPhone || 'S/N', document: paymentSenderDoc || 'V-00000000' };
    const selectedReceiver = (paymentReceivers || []).find(r => r.id === selectedReceiverId) || null;
    const receiverSummary = selectedReceiver ? `${selectedReceiver.holder} | ${selectedReceiver.bank || ''} ${selectedReceiver.phone || ''}`.trim() : null;

    const newInvoice = {
      id: `sale_${Date.now()}`, invoiceNumber: getNextInvoiceNumber(paymentCondition), date: new Date().toISOString().split('T')[0], timestamp: new Date().toISOString(), cashier: (currentUser || {}).username || 'Admin', customerId: customerObj.id, customerName: customerObj.name, customerPhone: customerObj.phone, customerDocument: customerObj.document, deliveryAddress: customDeliveryAddress.trim(), deliveryZoneName: selectedZone.name, deliveryFee: Number(selectedZone.fee || 0), items: cart, subtotal: cartSubtotal, totalCost: cartTotalCost, total: cartTotalUSD, totalBs: cartTotalBs, exchangeRateUsed: exchangeRate, paymentCondition, creditPaid: paymentCondition === 'contado', paymentMethod: paymentCondition === 'credito' ? 'Crédito Pendiente' : selectedPaymentMethod, receiver: selectedReceiver, receiverSummary, paymentDetails: { reference: paymentCondition === 'credito' ? 'Por Cobrar' : (paymentReference || 'N/A'), senderName: paymentSenderName || customerObj.name, senderDocument: paymentSenderDoc || customerObj.document, senderBank: paymentCondition === 'credito' ? 'Pendiente' : (paymentSenderBank || 'N/A'), senderPhone: paymentSenderPhone || customerObj.phone, sender: '', bankOrPhone: '' }, notes: orderNotes
    };
    setPendingInvoiceReview(newInvoice);
  };

  const handleApproveInvoice = () => {
    if (!pendingInvoiceReview) return;
    setProducts(prev => prev.map(prod => { const sold = pendingInvoiceReview.items.find(i => i.productId === prod.id); return sold ? { ...prod, stock: Math.max(0, Number(prod.stock) - sold.qty) } : prod; }));
    setCustomers(prev => prev.map(c => c.id === pendingInvoiceReview.customerId ? { ...c, address: pendingInvoiceReview.deliveryAddress, defaultZoneId: selectedZoneId } : c));
    setSales(prev => [pendingInvoiceReview, ...prev]);
    setLastInvoiceModal(pendingInvoiceReview); setPendingInvoiceReview(null); setCart([]); setPaymentReference(''); setOrderNotes('');
    showNotification(`Factura ${pendingInvoiceReview.invoiceNumber} emitida.`);
  };

  const handleImportBackupJSON = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.users)) setUsers(data.users);
        if (Array.isArray(data.customers)) setCustomers(data.customers);
        if (Array.isArray(data.sales)) setSales(data.sales);
        if (Array.isArray(data.expenses)) setExpenses(data.expenses);
        if (Array.isArray(data.deliveryZones)) setDeliveryZones(data.deliveryZones);
        if (Array.isArray(data.categories)) setCategories(data.categories);
        if (Array.isArray(data.paymentReceivers)) setPaymentReceivers(data.paymentReceivers);
        if (typeof data.exchangeRate === 'number') setExchangeRate(data.exchangeRate);
        showNotification('Respaldo restaurado.');
      } catch (err) { showNotification('Archivo inválido.', 'error'); }
    };
    reader.readAsText(file); e.target.value = '';
  };

  const handleExportTableCSV = (filename, headers, rows) => {
    const BOM = '\uFEFF'; const csvLines = [headers.join(';'), ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))];
    const blob = new Blob([BOM + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.setAttribute('download', filename); document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showNotification(`Archivo ${filename} descargado.`);
  };

  const handleExportFullBackupJSON = () => {
    const backup = { businessName: 'El Punto del Sabor', exportedAt: new Date().toISOString(), exchangeRate, users, products, deliveryZones, paymentMethods, customers, expenses, sales, supplyCatalog, supplierCatalog, categories, paymentReceivers };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.setAttribute('download', `Respaldo.json`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showNotification('Respaldo descargado.');
  };

  const handleSharePaymentData = () => {
    const selected = (paymentReceivers || []).filter(r => r.isActive !== false && paymentShareSelections[r.id]);
    if (selected.length === 0) { showNotification('Selecciona una cuenta.', 'error'); return; }
    const labels = { pago_movil: '📱 Pago Móvil', transferencia: '🏦 Transferencia', binance: '🟡 Binance', zelle: '💜 Zelle', efectivo: '💵 Efectivo' };
    const lines = [`💳 *DATOS PARA TU PAGO* - EL PUNTO DEL SABOR 🌭\n`];
    selected.forEach((r, idx) => {
      lines.push(`*${idx + 1}. ${labels[r.type] || r.type}*`);
      if (r.holder) lines.push(`• Titular: ${r.holder}`); if (r.document) lines.push(`• C.I: ${r.document}`);
      if (r.bank) lines.push(`• Banco: ${r.bank}`); if (r.phone) lines.push(`• Teléfono: ${r.phone}`);
      if (r.account) lines.push(`• Cuenta: ${r.account}`); if (r.binanceId) lines.push(`• Binance: ${r.binanceId}`);
      if (r.email) lines.push(`• Email: ${r.email}`); lines.push('');
    });
    lines.push(`💰 *Tasa BCV:* Bs. ${Number(exchangeRate).toFixed(2)}/$`);
    lines.push(`📞 *WhatsApp:* ${businessWhatsApp}\n⚠️ Envía tu comprobante por WhatsApp.`);
    const msg = lines.join('\n'); copyTextToClipboard(msg);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleSaveCategory = (e) => {
    e.preventDefault(); if (!categoryForm.label.trim() || !categoryForm.id.trim()) return;
    const cid = categoryForm.id.trim().toLowerCase().replace(/\s+/g, '_');
    if (editingCategory) setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, label: categoryForm.label.trim() } : c));
    else setCategories(prev => [...prev, { id: cid, label: categoryForm.label.trim() }]);
    setShowCategoryModal(false); setEditingCategory(null); setCategoryForm({ id: '', label: '' });
  };

  const handleSavePaymentReceiver = (e) => {
    e.preventDefault(); if (!paymentReceiverForm.holder.trim()) return;
    if (editingPaymentReceiver) setPaymentReceivers(prev => prev.map(r => r.id === editingPaymentReceiver.id ? { ...r, ...paymentReceiverForm } : r));
    else setPaymentReceivers(prev => [...prev, { id: `pr_${Date.now()}`, ...paymentReceiverForm, isActive: true }]);
    setShowPaymentReceiverModal(false); setEditingPaymentReceiver(null);
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
                {(categories || []).map(c => <button key={c.id} onClick={() => setCustomerFilterCat(c.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${customerFilterCat === c.id ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300'}`}>{c.label}</button>)}
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
  const filteredZones = (deliveryZones || []).filter(z => (z.name || '').toLowerCase().includes((zoneSearchInput || '').toLowerCase()));

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      {notification && <div className={`fixed bottom-5 right-5 z-50 px-4 py-2 rounded-xl shadow-xl text-xs font-bold text-white ${notification.type === 'error' ? 'bg-red-600' : 'bg-stone-900'}`}>{notification.message}</div>}
      
      <header className="bg-stone-900 text-white p-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2"><span className="text-2xl">🌭</span><h1 className="font-black text-sm">EL PUNTO DEL SABOR</h1></div>
          <div className="flex items-center gap-2 text-xs">
            <input type="number" value={exchangeRate} onChange={e => setExchangeRate(Number(e.target.value) || 1)} className="w-16 bg-stone-800 text-amber-400 p-1 rounded text-center border border-stone-700" />
            <button onClick={() => setShowPaymentShareModal(true)} className="bg-emerald-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"><DollarSign className="w-3 h-3" /> Compartir Pago</button>
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
              <div className="relative">
                <input type="text" placeholder="Ruta de envío..." value={zoneSearchInput} onChange={e => { setZoneSearchInput(e.target.value); setShowZoneSuggestions(true); }} className="w-full p-2 border rounded-xl text-xs" />
                {showZoneSuggestions && <div className="absolute bg-white w-full border rounded-xl mt-1 shadow-xl z-20 max-h-32 overflow-y-auto">{filteredZones.map(z => <div key={z.id} onClick={() => { setSelectedZoneId(z.id); setZoneSearchInput(z.name); setShowZoneSuggestions(false); }} className="p-2 text-xs hover:bg-amber-50 cursor-pointer flex justify-between">{z.name} <span>${z.fee}</span></div>)}</div>}
              </div>
              <select value={selectedReceiverId} onChange={e => setSelectedReceiverId(e.target.value)} className="w-full p-2 border rounded-xl text-xs">
                <option value="">Recibe pago: --</option>
                {(paymentReceivers || []).filter(r => r.isActive !== false).map(r => <option key={r.id} value={r.id}>{r.holder} - {r.type}</option>)}
              </select>
              <div className="bg-stone-900 text-white p-3 rounded-xl flex justify-between items-center"><span className="text-xs font-bold">TOTAL:</span><span className="text-lg font-black text-amber-400">${cartTotalUSD.toFixed(2)}</span></div>
              <button onClick={handlePrepareCheckout} className="w-full bg-amber-500 font-black py-3 rounded-xl text-xs flex justify-center items-center gap-1"><Printer className="w-4 h-4" /> Revisar y Emitir</button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border space-y-3">
              <div className="flex justify-between items-center"><h2 className="font-black text-xs uppercase flex gap-1"><Layers className="w-4 h-4" /> Categorías</h2><button onClick={() => { setEditingCategory(null); setCategoryForm({ id: '', label: '' }); setShowCategoryModal(true); }} className="bg-stone-900 text-amber-400 px-2 py-1 rounded text-xs">+ Nueva</button></div>
              {(categories || []).map(c => <div key={c.id} className="flex justify-between items-center bg-stone-50 p-2 rounded text-xs"><span>{c.label}</span><div className="flex gap-1">{!c.isFixed && <button onClick={() => { setEditingCategory(c); setCategoryForm({ id: c.id, label: c.label }); setShowCategoryModal(true); }}><Edit3 className="w-3 h-3 text-stone-600" /></button>}</div></div>)}
            </div>
            <div className="bg-white p-4 rounded-2xl border space-y-3">
              <div className="flex justify-between items-center"><h2 className="font-black text-xs uppercase flex gap-1"><DollarSign className="w-4 h-4" /> Cuentas de Pago</h2><button onClick={() => { setEditingPaymentReceiver(null); setPaymentReceiverForm({ type: 'pago_movil', holder: '', bank: '', phone: '', document: '', account: '', binanceId: '', email: '', showToCustomers: true }); setShowPaymentReceiverModal(true); }} className="bg-stone-900 text-amber-400 px-2 py-1 rounded text-xs">+ Nueva</button></div>
              {(paymentReceivers || []).map(r => <div key={r.id} className="bg-stone-50 p-2 rounded text-xs border flex justify-between"><div><strong>{r.holder}</strong><br/>{r.type}</div><button onClick={() => { setEditingPaymentReceiver(r); setPaymentReceiverForm(r); setShowPaymentReceiverModal(true); }}><Edit3 className="w-3 h-3" /></button></div>)}
            </div>
            <div className="bg-white p-4 rounded-2xl border md:col-span-2 space-y-3">
              <h2 className="font-black text-xs uppercase">Respaldos</h2>
              <div className="flex gap-2">
                <button onClick={handleExportFullBackupJSON} className="bg-stone-900 text-amber-400 p-2 rounded-xl text-xs font-bold flex-1">Descargar JSON</button>
                <label className="bg-emerald-600 text-white p-2 rounded-xl text-xs font-bold flex-1 text-center cursor-pointer">Subir JSON<input type="file" onChange={handleImportBackupJSON} className="hidden" /></label>
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

      {/* MODALES GLOBALES (PARA EVITAR ERRORES) */}
      {showPaymentShareModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm space-y-3">
            <h3 className="font-black text-sm">Compartir Cuentas</h3>
            {(paymentReceivers || []).map(r => <label key={r.id} className="flex gap-2 items-center text-xs border p-2 rounded"><input type="checkbox" onChange={e => setPaymentShareSelections(prev => ({ ...prev, [r.id]: e.target.checked }))} /> {r.holder} - {r.type}</label>)}
            <div className="flex gap-2"><button onClick={() => { handleSharePaymentData(); setShowPaymentShareModal(false); }} className="bg-emerald-600 text-white p-2 rounded flex-1 font-bold text-xs">Enviar WhatsApp</button><button onClick={() => setShowPaymentShareModal(false)} className="bg-stone-200 p-2 rounded text-xs font-bold">Cerrar</button></div>
          </div>
        </div>
      )}

      {pendingInvoiceReview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 w-full max-w-md space-y-3">
            <h3 className="font-black text-sm text-center">Revisar Factura {pendingInvoiceReview.invoiceNumber}</h3>
            <div className="text-xs bg-stone-50 p-2 rounded">{pendingInvoiceReview.customerName} - ${pendingInvoiceReview.total.toFixed(2)}</div>
            <div className="flex gap-2"><button onClick={handleApproveInvoice} className="bg-emerald-600 text-white p-2 rounded flex-1 font-bold text-xs">Aprobar y Emitir</button><button onClick={() => setPendingInvoiceReview(null)} className="bg-stone-200 p-2 rounded text-xs font-bold">Volver</button></div>
          </div>
        </div>
      )}

      {lastInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm space-y-3">
            <h3 className="font-black text-sm text-center">Factura Emitida</h3>
            <div className="text-xs text-center">{lastInvoiceModal.invoiceNumber}</div>
            <button onClick={() => setLastInvoiceModal(null)} className="w-full bg-stone-900 text-white p-2 rounded font-bold text-xs">Cerrar</button>
          </div>
        </div>
      )}

    </div>
  );
}
