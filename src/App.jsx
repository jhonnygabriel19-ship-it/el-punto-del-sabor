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

// Helper para dividir texto automáticamente respetando márgenes en Canvas (PDF e Imagen)
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

// ==========================================
// RESPALDOS FOTOGRÁFICOS REALES DE ALTA PRESENCIA Y BANCOS
// ==========================================
const createFoodSvgDataUri = (emoji, title, bgFrom = '#f59e0b', bgTo = '#ea580c') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgFrom}"/>
        <stop offset="100%" stop-color="${bgTo}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#g)"/>
    <circle cx="300" cy="175" r="110" fill="rgba(255,255,255,0.18)"/>
    <text x="300" y="205" font-size="115" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    <rect x="40" y="310" width="520" height="54" rx="16" fill="rgba(28,25,23,0.82)"/>
    <text x="300" y="344" font-family="sans-serif" font-size="22" font-weight="bold" fill="#fde68a" text-anchor="middle">${title}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Fotografías reales verificadas por categoría como respaldo primario
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
  '0128 - Banco Caroní',
  '0134 - Banesco Banco Universal',
  '0137 - Banco Sofitasa',
  '0138 - Banco Plaza',
  '0146 - Bangente',
  '0151 - BFC Banco Fondo Común',
  '0156 - 100% Banco',
  '0157 - DelSur Banco Universal',
  '0163 - Banco del Tesoro',
  '0166 - Banco Agrícola de Venezuela',
  '0168 - Bancrecer',
  '0169 - R4 Banco Microfinanciero (Mi Banco)',
  '0171 - Banco Activo',
  '0172 - Bancamiga Banco Universal',
  '0173 - Banco Internacional de Desarrollo',
  '0174 - Banplus Banco Universal',
  '0175 - Banco Digital de los Trabajadores (Bicentenario)',
  '0177 - BANFANB',
  '0178 - N58 Banco Digital',
  '0191 - BNC (Banco Nacional de Crédito)'
];

// ==========================================
// DATOS INICIALES PRE-CARGADOS ("EL PUNTO DEL SABOR")
// ==========================================

const INITIAL_USERS = [
  {
    id: 'usr_1',
    username: 'Michelle Sifontes',
    password: '21237816',
    role: 'Socia Administradora'
  },
  {
    id: 'usr_2',
    username: 'Jhonny Rivas',
    password: '19749698',
    role: 'Socio Administrador'
  }
];

// Categorías Dinámicas Iniciales
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

// Cuentas Receptoras Propias Iniciales
const INITIAL_RECEIVING_ACCOUNTS = [
  { id: 'acc_1', name: 'BDV - Michelle Sifontes' },
  { id: 'acc_2', name: 'Binance USDT - Empresa' },
  { id: 'acc_3', name: 'Caja Fuerte (Efectivo)' }
];

const INITIAL_PRODUCTS = [
  // ETAPA 1: 3 TIPOS DE PERROS CALIENTES Y SUS RESPECTIVOS COMBOS CON REFRESCO
  {
    id: 'prod_perro_1',
    name: 'Perro Caliente Clásico',
    category: 'perros',
    stage: 1,
    price: 1.80,
    cost: 0.75,
    stock: 60,
    minStock: 15,
    active: true,
    description: 'Pan suave al vapor, salchicha viena, ensalada rallada, papitas, queso y salsas tradicionales.',
    image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'prod_perro_2',
    name: 'Perro Caliente Especial Con Todo',
    category: 'perros',
    stage: 1,
    price: 2.60,
    cost: 1.15,
    stock: 50,
    minStock: 15,
    active: true,
    description: 'Salchicha premium, tocineta crocante, maíz dulce, doble queso amarillo fundido, papitas y salsas de la casa.',
    image: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'prod_perro_3',
    name: 'Perro Polaco / Jumbo Supremo',
    category: 'perros',
    stage: 1,
    price: 3.50,
    cost: 1.55,
    stock: 40,
    minStock: 10,
    active: true,
    description: 'Salchicha polaca ahumada XL, jamón ahumado, queso de mano, tocineta, aguacate y salsas especiales.',
    image: 'https://images.unsplash.com/photo-1612392062631-94dd858cba88?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'prod_combo_1',
    name: 'Combo 1: 2 Perros Clásicos + Refresco',
    category: 'combos',
    stage: 1,
    price: 4.20,
    cost: 1.85,
    stock: 45,
    minStock: 10,
    active: true,
    description: '2 Perros Calientes Clásicos con todo + 1 Refresco personal de 355ml bien frío.',
    image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'prod_combo_2',
    name: 'Combo 2: 2 Perros Especiales + Refresco',
    category: 'combos',
    stage: 1,
    price: 5.80,
    cost: 2.60,
    stock: 40,
    minStock: 10,
    active: true,
    description: '2 Perros Especiales con tocineta y maíz + 1 Refresco personal de 355ml.',
    image: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'prod_combo_3',
    name: 'Combo 3: 2 Perros Polacos Jumbo + Refresco 1.5L',
    category: 'combos',
    stage: 1,
    price: 8.20,
    cost: 3.70,
    stock: 30,
    minStock: 8,
    active: true,
    description: '2 Perros Polacos Jumbo Supremos + 1 Refresco Familiar para compartir.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'prod_ref_1',
    name: 'Refresco Personal 355ml (Coca-Cola / Pepsi / Chinotto)',
    category: 'refrescos',
    stage: 1,
    price: 1.20,
    cost: 0.55,
    stock: 80,
    minStock: 20,
    active: true,
    description: 'Refresco personal bien frío para acompañar tu pedido.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'prod_ref_2',
    name: 'Refresco Familiar 1.5 Litros',
    category: 'refrescos',
    stage: 1,
    price: 2.50,
    cost: 1.30,
    stock: 35,
    minStock: 10,
    active: true,
    description: 'Botella de 1.5 Litros ideal para combos familiares.',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=700&q=80'
  },

  // ETAPA 2: HAMBURGUESAS Y SUS COMBOS CON REFRESCO
  {
    id: 'prod_hamb_1',
    name: 'Hamburguesa Clásica El Punto',
    category: 'hamburguesas',
    stage: 2,
    price: 4.50,
    cost: 2.00,
    stock: 35,
    minStock: 10,
    active: true,
    description: '150g de carne de res a la plancha, queso cheddar, tocineta, vegetales frescos y salsa especial.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'prod_hamb_2',
    name: 'Combo Burger Doble + Refresco',
    category: 'combos',
    stage: 2,
    price: 6.80,
    cost: 3.10,
    stock: 30,
    minStock: 8,
    active: true,
    description: 'Hamburguesa doble carne con queso de mano y tocineta + Refresco personal.',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80'
  },

  // ETAPA 3: PAPAS FRITAS EN COMBOS Y RACIONES
  {
    id: 'prod_papas_1',
    name: 'Ración de Papas Fritas Crocantes con Queso y Tocineta',
    category: 'papas',
    stage: 3,
    price: 3.20,
    cost: 1.25,
    stock: 40,
    minStock: 12,
    active: true,
    description: 'Papas fritas importadas recién hechas con topping de queso fundido y tocineta.',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80'
  },

  // ETAPA 4: ESPECIALIDADES (TEQUEÑOS, TENDERS DE POLLO, POSTRES, HELADOS)
  {
    id: 'prod_esp_1',
    name: 'Ración de 6 Tequeños Full Queso con Salsa tártara',
    category: 'especialidades',
    stage: 4,
    price: 4.00,
    cost: 1.70,
    stock: 35,
    minStock: 10,
    active: true,
    description: 'Tequeños doraditos rellenos de abundante queso blanco con salsa de ajo o miel mostaza.',
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'prod_esp_2',
    name: 'Box de Chicken Tenders (5 uds) + Salsa Miel Mostaza',
    category: 'especialidades',
    stage: 4,
    price: 5.50,
    cost: 2.40,
    stock: 25,
    minStock: 8,
    active: true,
    description: 'Tiras de pechuga de pollo empanizadas extra crujientes.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'prod_postre_1',
    name: 'Helado Cremoso / Marquesa de Chocolate de la Casa',
    category: 'postres',
    stage: 4,
    price: 2.80,
    cost: 1.15,
    stock: 25,
    minStock: 6,
    active: true,
    description: 'Postre frío artesanal con topping de chocolate y lluvia de galleta.',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=80'
  }
];

const INITIAL_DELIVERY_ZONES = [
  { id: 'zone_0', name: 'Retiro Personal / Punto de Entrega Acordado', fee: 0.00 },
  { id: 'zone_1', name: 'Zona Cercana (Hasta 2 km)', fee: 1.00 },
  { id: 'zone_2', name: 'Casco Central / Urbanizaciones Medias (3 a 5 km)', fee: 2.00 },
  { id: 'zone_3', name: 'Zona Larga / Periferia (6 a 9 km)', fee: 3.00 },
  { id: 'zone_4', name: 'Zona Extraurbana Especial (+10 km)', fee: 4.50 }
];

const INITIAL_PAYMENT_METHODS = [
  { id: 'pm_1', name: 'Pago Móvil', requiresReference: true, details: '0414-8823411 / V-21237816 / BDV' },
  { id: 'pm_2', name: 'Binance (USDT)', requiresReference: true, details: 'pagos@elpuntodelsabor.com' },
  { id: 'pm_3', name: 'Efectivo USD ($)', requiresReference: false, details: 'Monto exacto al entregar' },
  { id: 'pm_4', name: 'Efectivo Bolívares', requiresReference: false, details: 'Monto exacto al entregar' },
  { id: 'pm_5', name: 'Transferencia Bancaria', requiresReference: true, details: 'Solicitar datos por chat' },
  { id: 'pm_6', name: 'Zelle', requiresReference: true, details: 'zelle@ejemplo.com' }
];

const INITIAL_CUSTOMERS = [
  {
    id: 'cli_1',
    name: 'Carlos Mendoza',
    document: 'V-18452310',
    phone: '0414-8823411',
    address: 'Urb. Los Olivos, Calle Mediterráneo, Casa #14 (Rejas negras)',
    defaultZoneId: 'zone_2'
  },
  {
    id: 'cli_2',
    name: 'María Fernanda Gómez',
    document: 'V-24910234',
    phone: '0412-9104422',
    address: 'Res. Alta Vista Norte, Torre B, Piso 4, Apto 4-B',
    defaultZoneId: 'zone_1'
  },
  {
    id: 'cli_3',
    name: 'José Gregorio Pérez',
    document: 'V-15229100',
    phone: '0424-9551102',
    address: 'Villa Africana, Manzana 12, Casa #08 frente al parque',
    defaultZoneId: 'zone_3'
  }
];

const INITIAL_EXPENSES = [
  {
    id: 'exp_1',
    date: new Date().toISOString().split('T')[0],
    type: 'inversion',
    category: 'Baño María y Utensilios Térmicos',
    description: 'Baño María acero inoxidable, pinzas, envases térmicos para delivery y bombona',
    amount: 145.00,
    supplier: 'Equipos Gastronómicos C.A.',
    expectedYieldUnits: 0,
    consumedPercent: 0
  },
  {
    id: 'exp_2',
    date: new Date().toISOString().split('T')[0],
    type: 'insumo',
    category: 'Pan de Perro y Salchichas Viena/Polaca',
    description: 'Compra inicial: 100 panes de perro, 100 salchichas viena y 30 polacas',
    amount: 68.00,
    supplier: 'Distribuidora El Mayorista',
    expectedYieldUnits: 130,
    consumedPercent: 35
  },
  {
    id: 'exp_3',
    date: new Date().toISOString().split('T')[0],
    type: 'insumo',
    category: 'Salsas, Queso Amarillo y Papitas',
    description: 'Galones de salsa de tomate, mayonesa, mostaza, 3kg queso amarillo y 2kg papitas',
    amount: 42.50,
    supplier: 'Insumos Rápidos Express',
    expectedYieldUnits: 120,
    consumedPercent: 85 // Generará alarma de consumo excesivo de insumo vs ventas
  },
  {
    id: 'exp_4',
    date: new Date().toISOString().split('T')[0],
    type: 'insumo',
    category: 'Cajas Térmicas y Bolsas Delivery',
    description: '150 cajas térmicas porta-perros, bolsas kraft y servilletas',
    amount: 22.00,
    supplier: 'Todo Empaques C.A.',
    expectedYieldUnits: 150,
    consumedPercent: 25
  }
];

const INITIAL_SUPPLY_CATALOG = [
  { name: 'Pan de Perro y Salchichas Viena/Polaca', type: 'insumo', expectedYieldUnits: 130, defaultDescription: 'Panes de perro caliente y paquetes de salchichas' },
  { name: 'Salchicha Polaca Ahumada XL', type: 'insumo', expectedYieldUnits: 50, defaultDescription: 'Paquete de salchichas polacas jumbo' },
  { name: 'Salsas, Queso Amarillo y Papitas', type: 'insumo', expectedYieldUnits: 120, defaultDescription: 'Salsa de tomate, mayonesa, mostaza, queso y papitas ralladas' },
  { name: 'Cajas Térmicas y Bolsas Delivery', type: 'insumo', expectedYieldUnits: 150, defaultDescription: 'Envases térmicos, bolsas kraft y servilletas' },
  { name: 'Refrescos Personales y Familiares 1.5L', type: 'insumo', expectedYieldUnits: 60, defaultDescription: 'Cajas de refrescos 355ml y botellas 1.5L' },
  { name: 'Carne de Hamburguesa y Pan Brioche', type: 'insumo', expectedYieldUnits: 40, defaultDescription: 'Insumos para hamburguesas Etapa 2' },
  { name: 'Papas Fritas Congeladas Importadas', type: 'insumo', expectedYieldUnits: 60, defaultDescription: 'Saco de papas para freír Etapa 3' },
  { name: 'Tequeños y Tenders de Pollo', type: 'insumo', expectedYieldUnits: 45, defaultDescription: 'Bandejas de tequeños y tiras de pollo Etapa 4' },
  { name: 'Baño María y Utensilios Térmicos', type: 'inversion', expectedYieldUnits: 0, defaultDescription: 'Herramientas e implementos de trabajo' },
  { name: 'Recarga de Gas Doméstico / Industrial', type: 'operativo', expectedYieldUnits: 0, defaultDescription: 'Servicio de recarga de cilindro de gas' }
];

const INITIAL_SUPPLIERS_CATALOG = [
  'Distribuidora El Mayorista',
  'Insumos Rápidos Express',
  'Todo Empaques C.A.',
  'Equipos Gastronómicos C.A.',
  'Frigorífico y Charcutería Central',
  'Distribuidora de Bebidas y Refrescos',
  'Panadería y Distribuidora San José',
  'Makro Comercializadora'
];

const INITIAL_SALES = [
  {
    id: 'sale_init_1',
    invoiceNumber: 'EPDS-1001',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    cashier: 'Michelle Sifontes',
    customerId: 'cli_1',
    customerName: 'Carlos Mendoza',
    customerPhone: '0414-8823411',
    customerDocument: 'V-18452310',
    deliveryAddress: 'Urb. Los Olivos, Calle Mediterráneo, Casa #14 (Rejas negras)',
    deliveryZoneName: 'Casco Central / Urbanizaciones Medias (3 a 5 km)',
    deliveryFee: 2.00,
    items: [
      {
        productId: 'prod_combo_2',
        name: 'Combo 2: 2 Perros Especiales + Refresco',
        category: 'combos',
        qty: 2,
        price: 5.80,
        cost: 2.60,
        subtotal: 11.60
      },
      {
        productId: 'prod_perro_3',
        name: 'Perro Polaco / Jumbo Supremo',
        category: 'perros',
        qty: 1,
        price: 3.50,
        cost: 1.55,
        subtotal: 3.50
      }
    ],
    subtotal: 15.10,
    totalCost: 6.75,
    total: 17.10,
    totalBs: 17.10 * 45.5,
    exchangeRateUsed: 45.5,
    paymentCondition: 'contado',
    creditPaid: true,
    paymentMethod: 'Pago Móvil',
    paymentDetails: {
      reference: '948271',
      senderName: 'Carlos Mendoza',
      senderDocument: 'V-18452310',
      senderBank: '0102 - Banco de Venezuela',
      senderPhone: '0414-8823411',
      sender: 'Carlos Mendoza | V-18452310 | 0102 - Banco de Venezuela',
      bankOrPhone: '0102 - Banco de Venezuela (0414-8823411)'
    },
    notes: 'Con bastante salsa de ajo y queso arriba.'
  },
  {
    id: 'sale_init_2',
    invoiceNumber: 'EPDS-1002',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    cashier: 'Jhonny Rivas',
    customerId: 'cli_2',
    customerName: 'María Fernanda Gómez',
    customerPhone: '0412-9104422',
    customerDocument: 'V-24910234',
    deliveryAddress: 'Res. Alta Vista Norte, Torre B, Piso 4, Apto 4-B',
    deliveryZoneName: 'Zona Cercana (Hasta 2 km)',
    deliveryFee: 1.00,
    items: [
      {
        productId: 'prod_combo_1',
        name: 'Combo 1: 2 Perros Clásicos + Refresco',
        category: 'combos',
        qty: 2,
        price: 4.20,
        cost: 1.85,
        subtotal: 8.40
      }
    ],
    subtotal: 8.40,
    totalCost: 3.70,
    total: 9.40,
    totalBs: 9.40 * 45.5,
    exchangeRateUsed: 45.5,
    paymentCondition: 'credito',
    creditPaid: false,
    paymentMethod: 'Crédito Pendiente',
    paymentDetails: {
      reference: 'Pendiente Pago Quincena',
      senderName: 'María Fernanda Gómez',
      senderDocument: 'V-24910234',
      senderBank: 'Por definir al cobrar',
      senderPhone: '0412-9104422',
      sender: 'María Fernanda Gómez | V-24910234',
      bankOrPhone: '0412-9104422'
    },
    notes: 'Cliente de confianza, cancela mañana por Pago Móvil.'
  }
];

const STAGES_INFO = [
  { stage: 1, title: 'Etapa 1: Perros Calientes + Combos Delivery', status: 'Activa (Inicial)' },
  { stage: 2, title: 'Etapa 2: Hamburguesas y Combos con Refresco', status: 'Lista en Menú' },
  { stage: 3, title: 'Etapa 3: Papas Fritas en Combos y Raciones', status: 'Lista en Menú' },
  { stage: 4, title: 'Etapa 4: Tequeños, Chicken Tenders y Postres', status: 'Lista en Menú' },
  { stage: 5, title: 'Etapa 5: Puesto de Ventas Físico Propio', status: 'Proyección POS' }
];

// Helper seguro para LocalStorage
function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
}

export default function App() {
  // ==========================================
  // ESTADOS PRINCIPALES Y PERSISTENCIA EN NUBE + LOCAL
  // ==========================================
  const [fbUser, setFbUser] = useState(null);
  const [cloudReady, setCloudReady] = useState(false);

  const [users, setUsers] = useState(() => loadFromStorage('epds_users_v2', INITIAL_USERS));
  const [categories, setCategories] = useState(() => loadFromStorage('epds_categories_v2', INITIAL_CATEGORIES));
  const [receivingAccounts, setReceivingAccounts] = useState(() => loadFromStorage('epds_recv_accs_v2', INITIAL_RECEIVING_ACCOUNTS));
  const [paymentMethods, setPaymentMethods] = useState(() => loadFromStorage('epds_pm_v2', INITIAL_PAYMENT_METHODS));
  const [deliveryZones, setDeliveryZones] = useState(() => loadFromStorage('epds_zones_v2', INITIAL_DELIVERY_ZONES));
  const [customers, setCustomers] = useState(() => loadFromStorage('epds_customers_v2', INITIAL_CUSTOMERS));
  const [expenses, setExpenses] = useState(() => loadFromStorage('epds_expenses_v2', INITIAL_EXPENSES));
  const [sales, setSales] = useState(() => loadFromStorage('epds_sales_v2', INITIAL_SALES));

  // Memoria persistente de Insumos/Productos Comprados y Comercios/Proveedores
  const [supplyCatalog, setSupplyCatalog] = useState(() =>
    loadFromStorage('epds_supply_catalog_v2', INITIAL_SUPPLY_CATALOG)
  );
  const [supplierCatalog, setSupplierCatalog] = useState(() =>
    loadFromStorage('epds_supplier_catalog_v2', INITIAL_SUPPLIERS_CATALOG)
  );

  const [currentUser, setCurrentUser] = useState(() => INITIAL_USERS[0]);
  const [loginUsername, setLoginUsername] = useState('Michelle Sifontes');
  const [loginPassword, setLoginPassword] = useState('21237816');
  const [loginError, setLoginError] = useState('');

  // Detectar automáticamente si el enlace fue abierto por un cliente (?vista=menu o #menu-digital)
  const [isCustomerPublicView, setIsCustomerPublicView] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return (
        params.get('vista') === 'menu' ||
        window.location.hash.includes('menu-digital')
      );
    } catch (e) {
      return false;
    }
  });
  const [showShareMenuModal, setShowShareMenuModal] = useState(false);
  const [businessWhatsApp, setBusinessWhatsApp] = useState(() => {
    const saved = loadFromStorage('epds_whatsapp_v2', '0424-9043122');
    return saved === '0414-8823411' ? '0424-9043122' : saved;
  });
  const [customPublicUrl, setCustomPublicUrl] = useState(() =>
    loadFromStorage('epds_custom_public_url_v2', '')
  );
  const [customerCart, setCustomerCart] = useState([]);
  const [customerFilterCat, setCustomerFilterCat] = useState('todos');
  const [customerSearch, setCustomerSearch] = useState('');

  // Datos completos del cliente en el Menú Digital Público para facturación por WhatsApp
  const [customerOrderForm, setCustomerOrderForm] = useState({
    name: '',
    document: '',
    phone: '',
    address: '',
    zoneId: 'zone_1',
    paymentCondition: 'contado',
    paymentMethod: 'Pago Móvil',
    paymentReference: '',
    paymentSenderBank: '0102 - Banco de Venezuela (BDV)',
    notes: ''
  });

  const [activeTab, setActiveTab] = useState('pos');
  const [activeStageFilter, setActiveStageFilter] = useState('all');
  const [exchangeRate, setExchangeRate] = useState(() => loadFromStorage('epds_rate_v2', 45.50));
  const [bcvLastUpdate, setBcvLastUpdate] = useState(() =>
    loadFromStorage('epds_bcv_last_update_v2', 'Sincronización pendiente')
  );
  const [isSyncingBCV, setIsSyncingBCV] = useState(false);

  // Clave especial de seguridad para autorizar eliminaciones (Por defecto: 2026)
  const [securityDeletePin, setSecurityDeletePin] = useState(() =>
    loadFromStorage('epds_delete_pin_v2', '2026')
  );
  const [newDeletePinInput, setNewDeletePinInput] = useState('');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: null
  });
  const [deletePinAttempt, setDeletePinAttempt] = useState('');
  const [deletePinError, setDeletePinError] = useState('');

  const [products, setProducts] = useState(() => {
    const saved = loadFromStorage('epds_products_v2', INITIAL_PRODUCTS);
    // Actualizar automáticamente cualquier imagen dibujada (SVG) o URL antigua a las fotografías gastronómicas reales
    const brokenOrOldUrls = [
      'photo-1627054245718-b7d7f000b35b',
      'photo-1599599810694-b5b37304c041',
      'photo-1581636625402-29b2a704ef13',
      'data:image/svg+xml'
    ];
    return saved.map(item => {
      const freshDefault = INITIAL_PRODUCTS.find(p => p.id === item.id);
      const needsRealPhotoUpgrade = brokenOrOldUrls.some(b => (item.image || '').includes(b));
      if (needsRealPhotoUpgrade && freshDefault) {
        return { ...item, image: freshDefault.image };
      }
      return item;
    });
  });

  // Notificaciones flotantes
  const [notification, setNotification] = useState(null);
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ==========================================
  // CONEXIÓN Y SINCRONIZACIÓN EN TIEMPO REAL CON FIRESTORE (NUBE)
  // ==========================================
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
      } catch (e) {
        console.warn('Error de autenticación en nube:', e);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      if (isMounted && u) {
        setFbUser(u);
      }
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Escuchar cambios desde la base de datos en la nube para no perder ningún registro
  useEffect(() => {
    if (!db || !fbUser) return;
    const stateDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'epds_store', 'main_state');
    const unsub = onSnapshot(
      stateDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.users) && data.users.length > 0) setUsers(data.users);
          if (Array.isArray(data.categories) && data.categories.length > 0) setCategories(data.categories);
          if (Array.isArray(data.receivingAccounts) && data.receivingAccounts.length > 0) setReceivingAccounts(data.receivingAccounts);
          if (Array.isArray(data.products)) setProducts(data.products);
          if (Array.isArray(data.deliveryZones) && data.deliveryZones.length > 0) setDeliveryZones(data.deliveryZones);
          if (Array.isArray(data.paymentMethods) && data.paymentMethods.length > 0) setPaymentMethods(data.paymentMethods);
          if (Array.isArray(data.customers)) setCustomers(data.customers);
          if (Array.isArray(data.expenses)) setExpenses(data.expenses);
          if (Array.isArray(data.sales)) setSales(data.sales);
          if (Array.isArray(data.supplyCatalog) && data.supplyCatalog.length > 0) setSupplyCatalog(data.supplyCatalog);
          if (Array.isArray(data.supplierCatalog) && data.supplierCatalog.length > 0) setSupplierCatalog(data.supplierCatalog);
          if (data.securityDeletePin) setSecurityDeletePin(data.securityDeletePin);
          if (data.businessWhatsApp) setBusinessWhatsApp(data.businessWhatsApp);
          setCloudReady(true);
        } else {
          // Inicializar documento en la nube con los datos actuales
          setDoc(
            stateDocRef,
            {
              users,
              categories,
              receivingAccounts,
              products,
              deliveryZones,
              paymentMethods,
              customers,
              expenses,
              sales,
              supplyCatalog,
              supplierCatalog,
              securityDeletePin,
              businessWhatsApp,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          )
            .then(() => setCloudReady(true))
            .catch(() => setCloudReady(true));
        }
      },
      (err) => {
        console.warn('Error leyendo estado en la nube:', err);
      }
    );
    return () => unsub();
  }, [fbUser]);

  // Función central para persistir inmediatamente en la nube y en almacenamiento local
  const persistToCloud = async (partialData) => {
    if (!db || !fbUser) return;
    try {
      const stateDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'epds_store', 'main_state');
      await setDoc(
        stateDocRef,
        {
          ...partialData,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('No se pudo sincronizar cambio en la nube:', e);
    }
  };

  // Guardar automáticamente en LocalStorage y sincronizar cambios con la Nube
  useEffect(() => {
    try { localStorage.setItem('epds_users_v2', JSON.stringify(users)); } catch (e) {}
    if (cloudReady) persistToCloud({ users });
  }, [users, cloudReady]);
  useEffect(() => {
    try { localStorage.setItem('epds_categories_v2', JSON.stringify(categories)); } catch (e) {}
    if (cloudReady) persistToCloud({ categories });
  }, [categories, cloudReady]);
  useEffect(() => {
    try { localStorage.setItem('epds_recv_accs_v2', JSON.stringify(receivingAccounts)); } catch (e) {}
    if (cloudReady) persistToCloud({ receivingAccounts });
  }, [receivingAccounts, cloudReady]);
  useEffect(() => {
    try { localStorage.setItem('epds_rate_v2', JSON.stringify(exchangeRate)); } catch (e) {}
  }, [exchangeRate]);
  useEffect(() => {
    try { localStorage.setItem('epds_bcv_last_update_v2', JSON.stringify(bcvLastUpdate)); } catch (e) {}
  }, [bcvLastUpdate]);
  useEffect(() => {
    try { localStorage.setItem('epds_delete_pin_v2', JSON.stringify(securityDeletePin)); } catch (e) {}
    if (cloudReady) persistToCloud({ securityDeletePin });
  }, [securityDeletePin, cloudReady]);
  useEffect(() => {
    try { localStorage.setItem('epds_products_v2', JSON.stringify(products)); } catch (e) {}
    if (cloudReady) persistToCloud({ products });
  }, [products, cloudReady]);
  useEffect(() => {
    try { localStorage.setItem('epds_zones_v2', JSON.stringify(deliveryZones)); } catch (e) {}
    if (cloudReady) persistToCloud({ deliveryZones });
  }, [deliveryZones, cloudReady]);
  useEffect(() => {
    try { localStorage.setItem('epds_pm_v2', JSON.stringify(paymentMethods)); } catch (e) {}
    if (cloudReady) persistToCloud({ paymentMethods });
  }, [paymentMethods, cloudReady]);
  useEffect(() => {
    try { localStorage.setItem('epds_customers_v2', JSON.stringify(customers)); } catch (e) {}
    if (cloudReady) persistToCloud({ customers });
  }, [customers, cloudReady]);
  useEffect(() => {
    try { localStorage.setItem('epds_expenses_v2', JSON.stringify(expenses)); } catch (e) {}
    if (cloudReady) persistToCloud({ expenses });
  }, [expenses, cloudReady]);
  useEffect(() => {
    try { localStorage.setItem('epds_sales_v2', JSON.stringify(sales)); } catch (e) {}
    if (cloudReady) persistToCloud({ sales });
  }, [sales, cloudReady]);
  useEffect(() => {
    try { localStorage.setItem('epds_supply_catalog_v2', JSON.stringify(supplyCatalog)); } catch (e) {}
    if (cloudReady) persistToCloud({ supplyCatalog });
  }, [supplyCatalog, cloudReady]);
  useEffect(() => {
    try { localStorage.setItem('epds_supplier_catalog_v2', JSON.stringify(supplierCatalog)); } catch (e) {}
    if (cloudReady) persistToCloud({ supplierCatalog });
  }, [supplierCatalog, cloudReady]);
  useEffect(() => {
    try { localStorage.setItem('epds_whatsapp_v2', JSON.stringify(businessWhatsApp)); } catch (e) {}
    if (cloudReady) persistToCloud({ businessWhatsApp });
  }, [businessWhatsApp, cloudReady]);
  useEffect(() => {
    try { localStorage.setItem('epds_custom_public_url_v2', JSON.stringify(customPublicUrl)); } catch (e) {}
  }, [customPublicUrl]);

  // ==========================================
  // ESTADOS DEL PUNTO DE VENTA (POS) Y FACTURACIÓN
  // ==========================================
  const [posSearch, setPosSearch] = useState('');
  const [posCategory, setPosCategory] = useState('todos');
  const [cart, setCart] = useState([]);
  
  // Solución anti-crash si customers está vacío
  const defaultCustomerId = customers.length > 0 ? customers[0].id : '';
  const [selectedCustomerId, setSelectedCustomerId] = useState(defaultCustomerId);
  const [customDeliveryAddress, setCustomDeliveryAddress] = useState(customers.length > 0 ? customers[0].address : '');
  
  // Modificación: Datalist input state
  const [zoneSearchInput, setZoneSearchInput] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');

  const [paymentCondition, setPaymentCondition] = useState('contado'); // 'contado' | 'credito'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Pago Móvil');
  
  // Modificación: Cuenta receptora seleccionada al facturar
  const [selectedReceivingAccountId, setSelectedReceivingAccountId] = useState('');

  // Celdas separadas para los datos del emisor (sin tener que poner "/" manualmente)
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentSenderName, setPaymentSenderName] = useState(customers.length > 0 ? customers[0].name : '');
  const [paymentSenderDoc, setPaymentSenderDoc] = useState(customers.length > 0 ? customers[0].document : '');
  const [paymentSenderBank, setPaymentSenderBank] = useState('0102 - Banco de Venezuela (BDV)');
  const [isCustomBankEdit, setIsCustomBankEdit] = useState(false);
  const [paymentSenderPhone, setPaymentSenderPhone] = useState(customers.length > 0 ? customers[0].phone : '');

  const [orderNotes, setOrderNotes] = useState('');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  
  // Modificación: Modal de revisión antes de procesar
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [lastInvoiceModal, setLastInvoiceModal] = useState(null);

  // Estados de Configuración / Ajustes
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newReceivingAccountName, setNewReceivingAccountName] = useState('');
  const [newPaymentMethodForm, setNewPaymentMethodForm] = useState({ name: '', details: '' });
  
  // Selector de métodos de pago a compartir
  const [selectedPaymentsToShare, setSelectedPaymentsToShare] = useState([]);

  // Auto-llenado inicial de los métodos a compartir
  useEffect(() => {
    if (selectedPaymentsToShare.length === 0 && paymentMethods.length > 0) {
      setSelectedPaymentsToShare(paymentMethods.map(p => p.id));
    }
  }, [paymentMethods]);

  // Cambiar método de pago limpia o adapta el campo de Banco / Usuario Binance
  const handleSelectPaymentMethodInPOS = (methodName) => {
    setSelectedPaymentMethod(methodName);
    const lower = methodName.toLowerCase();
    if (lower.includes('binance') || lower.includes('zelle') || lower.includes('efectivo')) {
      setPaymentSenderBank('');
      setIsCustomBankEdit(false);
    } else if (!paymentSenderBank) {
      setPaymentSenderBank(VENEZUELAN_BANKS[0]);
    }
  };

  // ==========================================
  // SINCRONIZACIÓN AUTOMÁTICA DEL DÓLAR BCV EN TIEMPO REAL
  // ==========================================
  const syncBCVExchangeRate = async (silent = false) => {
    setIsSyncingBCV(true);
    try {
      let fetchedRate = null;

      // Fuente 1: API pública en vivo del BCV (Venezuela)
      try {
        const res1 = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (res1.ok) {
          const data1 = await res1.json();
          if (data1 && Number(data1.promedio) > 0) {
            fetchedRate = Number(Number(data1.promedio).toFixed(2));
          }
        }
      } catch (err1) {
        // Continúa al respaldo 2
      }

      // Fuente 2: Open Exchange Rates ( Paridad oficial VES/USD )
      if (!fetchedRate) {
        try {
          const res2 = await fetch('https://open.er-api.com/v6/latest/USD');
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2?.rates?.VES && Number(data2.rates.VES) > 0) {
              fetchedRate = Number(Number(data2.rates.VES).toFixed(2));
            }
          }
        } catch (err2) {
          // Continúa
        }
      }

      if (fetchedRate && fetchedRate > 0) {
        const nowFormatted = new Date().toLocaleString('es-VE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        setExchangeRate(fetchedRate);
        setBcvLastUpdate(`BCV ${nowFormatted}`);
        if (!silent) {
          showNotification(`Tasa oficial BCV actualizada: Bs. ${fetchedRate.toFixed(2)}/$ (${nowFormatted})`);
        }
      } else if (!silent) {
        showNotification('No se pudo conectar con el servidor BCV. Puedes ajustar la tasa manualmente.', 'error');
      }
    } finally {
      setIsSyncingBCV(false);
    }
  };

  // Sincronizar automáticamente la tasa BCV al abrir la aplicación y cada 30 minutos
  useEffect(() => {
    syncBCVExchangeRate(true);
    const interval = setInterval(() => {
      syncBCVExchangeRate(true);
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // SISTEMA DE AUTORIZACIÓN CON CLAVE ESPECIAL PARA ELIMINAR
  // ==========================================
  const requestAuthorizedDelete = (title, description, actionCallback) => {
    setDeletePinAttempt('');
    setDeletePinError('');
    setDeleteModal({
      isOpen: true,
      title,
      description,
      onConfirm: actionCallback
    });
  };

  const handleConfirmProtectedDelete = (e) => {
    e.preventDefault();
    if (deletePinAttempt.trim() !== securityDeletePin) {
      setDeletePinError('Clave especial de seguridad incorrecta. Operación cancelada.');
      return;
    }
    if (typeof deleteModal.onConfirm === 'function') {
      deleteModal.onConfirm();
    }
    setDeleteModal({ isOpen: false, title: '', description: '', onConfirm: null });
    setDeletePinAttempt('');
    setDeletePinError('');
  };

  // Función para eliminar cualquier ítem del menú con autorización de clave especial
  const handleDeleteProduct = (prod) => {
    requestAuthorizedDelete(
      `Eliminar del Menú: ${prod.name}`,
      `¿Confirmas eliminar permanentemente "${prod.name}" ($${Number(prod.price).toFixed(2)}) de tu catálogo e inventario?`,
      () => {
        setProducts(prev => prev.filter(item => item.id !== prod.id));
        setCart(prev => prev.filter(item => item.productId !== prod.id));
        setCustomerCart(prev => prev.filter(item => item.id !== prod.id));
        if (editingProduct && editingProduct.id === prod.id) {
          setEditingProduct(null);
          setProductForm({
            name: '',
            category: categories.length > 0 ? categories[0].id : 'perros',
            stage: 1,
            price: '',
            cost: '',
            stock: '',
            minStock: 10,
            description: '',
            image: ''
          });
        }
        showNotification(`Producto "${prod.name}" eliminado del menú.`);
      }
    );
  };

  // Modal rápido para crear cliente o ruta desde el POS
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    document: '',
    phone: '',
    address: '',
    defaultZoneId: 'zone_1'
  });

  const [newZoneForm, setNewZoneForm] = useState({ name: '', fee: '' });

  // ==========================================
  // ESTADOS DE GESTIÓN DE MENÚ E INVENTARIO
  // ==========================================
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'perros',
    stage: 1,
    price: '',
    cost: '',
    stock: '',
    minStock: 10,
    description: '',
    image: ''
  });

  // ==========================================
  // ESTADOS DE GASTOS E INVERSIÓN CON AUTOCOMPLETADO Y DESPLEGABLE
  // ==========================================
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'insumo', // 'insumo' | 'inversion' | 'operativo'
    category: '',
    description: '',
    amount: '',
    supplier: '',
    expectedYieldUnits: 100,
    consumedPercent: 20
  });
  const [showSupplySuggestions, setShowSupplySuggestions] = useState(false);
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);

  // Filtrado por escritura para el autocompletado de Insumos/Productos comprados
  const matchingSupplies = useMemo(() => {
    const q = (expenseForm.category || '').trim().toLowerCase();
    if (!q) return supplyCatalog;
    return supplyCatalog.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        (item.defaultDescription || '').toLowerCase().includes(q)
    );
  }, [supplyCatalog, expenseForm.category]);

  // Filtrado por escritura para el autocompletado de Comercios/Proveedores
  const matchingSuppliers = useMemo(() => {
    const q = (expenseForm.supplier || '').trim().toLowerCase();
    if (!q) return supplierCatalog;
    return supplierCatalog.filter(sup => sup.toLowerCase().includes(q));
  }, [supplierCatalog, expenseForm.supplier]);

  // ==========================================
  // ESTADOS DE CIERRE DIARIO Y CONFIGURACIÓN
  // ==========================================
  const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);
  const [passwordChangeForm, setPasswordChangeForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    role: 'Operador de Ventas'
  });

  // Sincronizar dirección, ruta y celdas separadas del emisor cuando cambia el cliente en el POS
  const handleSelectCustomerInPOS = (custId) => {
    setSelectedCustomerId(custId);
    const found = customers.find(c => c.id === custId);
    if (found) {
      setCustomDeliveryAddress(found.address);
      if (found.defaultZoneId) {
        setSelectedZoneId(found.defaultZoneId);
        // Actualizamos el datalist con el nombre y precio para que se vea reflejado
        const z = deliveryZones.find(dz => dz.id === found.defaultZoneId);
        if (z) setZoneSearchInput(`${z.name} - $${Number(z.fee).toFixed(2)}`);
      }
      setPaymentSenderName(found.name || '');
      setPaymentSenderDoc(found.document || '');
      setPaymentSenderPhone(found.phone || '');
    }
  };

  // ==========================================
  // GENERADOR Y DESCARGA DIRECTA DE ARCHIVO .PDF CON MÁRGENES AJUSTADOS Y AUTO-SALTOS DE LÍNEA
  // ==========================================
  const generateAndDownloadPDF = (title, subtitle, linesArray, filename = 'Documento.pdf') => {
    try {
      const width = 794; // A4 a 96 DPI
      const marginX = 48; // Margen seguro izquierdo y derecho
      const contentWidth = width - marginX * 2;
      const lineHeight = 24;

      // Canvas temporal para medir líneas envueltas antes de fijar el alto total
      const measureCanvas = document.createElement('canvas');
      const mCtx = measureCanvas.getContext('2d');
      if (!mCtx) return;

      const preparedBlocks = [];
      let calculatedHeight = 165;

      linesArray.forEach(line => {
        if (line.type === 'divider') {
          preparedBlocks.push({ type: 'divider' });
          calculatedHeight += 18;
        } else if (line.type === 'header') {
          mCtx.font = 'bold 15px sans-serif';
          const wrapped = wrapCanvasText(mCtx, line.text, contentWidth);
          preparedBlocks.push({ type: 'header', lines: wrapped });
          calculatedHeight += wrapped.length * lineHeight + 6;
        } else if (line.type === 'total') {
          mCtx.font = 'bold 15px sans-serif';
          const wrapped = wrapCanvasText(mCtx, line.text, contentWidth - 28);
          preparedBlocks.push({ type: 'total', lines: wrapped });
          calculatedHeight += wrapped.length * 24 + 32;
        } else {
          mCtx.font = line.bold ? 'bold 13px sans-serif' : '13px sans-serif';
          const wrapped = wrapCanvasText(mCtx, line.text, contentWidth);
          preparedBlocks.push({ type: 'text', bold: line.bold, lines: wrapped });
          calculatedHeight += wrapped.length * lineHeight;
        }
      });

      const height = Math.max(1123, calculatedHeight + 70);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fondo blanco y marco de margen sutil
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Encabezado corporativo dentro de márgenes
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, width, 120);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 25px sans-serif';
      ctx.fillText('EL PUNTO DEL SABOR', marginX, 46);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      const titleLines = wrapCanvasText(ctx, title, contentWidth);
      ctx.fillText(titleLines[0] || '', marginX, 74);

      ctx.fillStyle = '#d6d3d1';
      ctx.font = '12px sans-serif';
      const subLines = wrapCanvasText(ctx, subtitle, contentWidth);
      ctx.fillText(subLines[0] || '', marginX, 98);

      // Cuerpo del documento con ajuste estricto a los márgenes
      let y = 155;
      preparedBlocks.forEach(block => {
        if (block.type === 'divider') {
          ctx.strokeStyle = '#d6d3d1';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(marginX, y - 8);
          ctx.lineTo(width - marginX, y - 8);
          ctx.stroke();
          y += 16;
        } else if (block.type === 'header') {
          ctx.fillStyle = '#9a3412';
          ctx.font = 'bold 15px sans-serif';
          block.lines.forEach(txtLine => {
            ctx.fillText(txtLine, marginX, y);
            y += lineHeight;
          });
          y += 4;
        } else if (block.type === 'total') {
          const boxHeight = block.lines.length * 24 + 20;
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(marginX, y - 18, contentWidth, boxHeight);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(marginX, y - 18, contentWidth, boxHeight);

          ctx.fillStyle = '#1c1917';
          ctx.font = 'bold 14px sans-serif';
          block.lines.forEach((txtLine, idx) => {
            ctx.fillText(txtLine, marginX + 14, y + idx * 23 + 4);
          });
          y += boxHeight + 16;
        } else {
          ctx.fillStyle = '#292524';
          ctx.font = block.bold ? 'bold 13px sans-serif' : '13px sans-serif';
          block.lines.forEach(txtLine => {
            ctx.fillText(txtLine, marginX, y);
            y += lineHeight;
          });
        }
      });

      // Convertir Canvas a JPEG y empaquetar en contenedor PDF 1.4 estándar
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const base64Data = jpegDataUrl.split(',')[1];
      const jpegBinary = atob(base64Data);
      const jpegLength = jpegBinary.length;

      const pdfParts = [];
      const offsets = [];
      let currentOffset = 0;

      const addString = (str) => {
        pdfParts.push(str);
        currentOffset += str.length;
      };

      const startObj = (id) => {
        offsets[id] = currentOffset;
        addString(`${id} 0 obj\n`);
      };

      const pdfW = 595;
      const pdfH = Math.round((height / width) * 595);

      addString('%PDF-1.4\n');

      startObj(1);
      addString('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

      startObj(2);
      addString('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

      startObj(3);
      addString(
        `<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im1 4 0 R >> >> /MediaBox [0 0 ${pdfW} ${pdfH}] /Contents 5 0 R >>\nendobj\n`
      );

      startObj(4);
      addString(
        `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegLength} >>\nstream\n`
      );
      pdfParts.push(jpegBinary);
      currentOffset += jpegLength;
      addString('\nendstream\nendobj\n');

      const contentStream = `q\n${pdfW} 0 0 ${pdfH} 0 0 cm\n/Im1 Do\nQ\n`;
      startObj(5);
      addString(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`);

      const xrefOffset = currentOffset;
      addString('xref\n0 6\n0000000000 65535 f \n');
      for (let i = 1; i <= 5; i++) {
        addString(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
      }
      addString(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

      // Construir Uint8Array binario para el Blob PDF
      const totalBytes = currentOffset;
      const uint8 = new Uint8Array(totalBytes);
      let pos = 0;
      for (const part of pdfParts) {
        for (let i = 0; i < part.length; i++) {
          uint8[pos++] = part.charCodeAt(i) & 0xff;
        }
      }

      const blob = new Blob([uint8], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification(`Archivo PDF (${filename}) generado y descargado correctamente.`);
    } catch (error) {
      window.print();
    }
  };

  const handleDownloadInvoicePDF = (invoice) => {
    const lines = [
      { type: 'header', text: `FACTURA / COMANDA DE ENTREGA: ${invoice.invoiceNumber}` },
      { text: `Fecha: ${invoice.date}   |   Operador: ${invoice.cashier}   |   Ventas: ${businessWhatsApp}`, bold: true },
      { type: 'divider' },
      { type: 'header', text: 'DATOS DEL CLIENTE Y DESTINO DELIVERY' },
      { text: `Cliente: ${invoice.customerName}   |   Documento: ${invoice.customerDocument || 'S/N'}`, bold: true },
      { text: `Teléfono Cliente: ${invoice.customerPhone || 'S/N'}` },
      { text: `Dirección de Envío: ${invoice.deliveryAddress}`, bold: true },
      { text: `Ruta Asignada: ${invoice.deliveryZoneName} ($${Number(invoice.deliveryFee).toFixed(2)})` },
      { type: 'divider' },
      { type: 'header', text: 'DATOS DEL PAGO Y CUENTA RECEPTORA' },
      { text: `Condición: ${invoice.paymentCondition.toUpperCase()}   |   Método: ${invoice.paymentMethod}`, bold: true },
      { text: `Receptor Interno (Caja): ${invoice.receivingAccountName || 'Por Cobrar'}`, bold: true },
      { text: `N° de Referencia: ${invoice.paymentDetails?.reference || 'N/A'}`, bold: true },
      { text: `Nombre del Emisor: ${invoice.paymentDetails?.senderName || invoice.paymentDetails?.sender || 'N/A'}` },
      { text: `Cédula / RIF Emisor: ${invoice.paymentDetails?.senderDocument || 'N/A'}` },
      { text: `Banco Emisor: ${invoice.paymentDetails?.senderBank || 'N/A'}   |   Tel: ${invoice.paymentDetails?.senderPhone || 'N/A'}` },
      { type: 'divider' },
      { type: 'header', text: 'DETALLE DE PRODUCTOS FACTURADOS' },
      ...invoice.items.map(item => ({
        text: `${item.qty}x ${item.name}  —  $${item.price.toFixed(2)} c/u  =  $${item.subtotal.toFixed(2)}`,
        bold: true
      })),
      { type: 'divider' },
      { text: `Subtotal Productos: $${Number(invoice.subtotal).toFixed(2)}` },
      { text: `Costo de Envío Delivery: $${Number(invoice.deliveryFee).toFixed(2)}` },
      {
        type: 'total',
        text: `TOTAL FACTURA: $${Number(invoice.total).toFixed(2)} USD   (Bs. ${Number(invoice.totalBs).toFixed(2)})`
      }
    ];
    if (invoice.notes) {
      lines.push({ text: `Nota de entrega / cocina: ${invoice.notes}`, bold: true });
    }
    generateAndDownloadPDF(
      `Factura Delivery ${invoice.invoiceNumber}`,
      `Fecha: ${invoice.date} | Tasa aplicada: Bs. ${invoice.exchangeRateUsed}/$`,
      lines,
      `Factura_${invoice.invoiceNumber}.pdf`
    );
  };

  const handleDownloadDailyClosingPDF = () => {
    const totalDayUSD = dailyClosingSales.reduce((acc, s) => acc + Number(s.total || 0), 0);
    const lines = [
      { type: 'header', text: `RESUMEN DE CIERRE DIARIO DE VENTAS (${closingDate})` },
      { text: `Total Órdenes Procesadas: ${dailyClosingSales.length}   |   Responsable: ${currentUser.username}`, bold: true },
      { type: 'divider' },
      { type: 'header', text: 'UNIDADES VENDIDAS POR PRODUCTO' },
      ...Object.entries(dailyProductSummary).map(([prodName, info]) => ({
        text: `• ${prodName}: ${info.qty} unidades vendidas  —  Total: $${info.totalUSD.toFixed(2)}`,
        bold: true
      })),
      { type: 'divider' },
      { type: 'header', text: 'RELACIÓN DE FACTURAS Y REFERENCIAS DEL DÍA' },
      ...dailyClosingSales.map(s => ({
        text: `${s.invoiceNumber} | ${s.customerName} | ${s.paymentMethod} Ref: ${s.paymentDetails?.reference || 'N/A'} | $${s.total.toFixed(2)}`
      })),
      { type: 'divider' },
      {
        type: 'total',
        text: `TOTAL PERCIBIDO EN EL DÍA: $${totalDayUSD.toFixed(2)} USD   (Bs. ${(totalDayUSD * exchangeRate).toFixed(2)})`
      }
    ];
    generateAndDownloadPDF(
      `Cierre de Ventas Diario - ${closingDate}`,
      `Generado por: ${currentUser.username} | Tasa Bs. ${exchangeRate}/$`,
      lines,
      `Cierre_Ventas_${closingDate}.pdf`
    );
  };

  // ==========================================
  // EXPORTACIÓN A EXCEL (CSV) Y RESPALDO JSON (IMPORTAR Y EXPORTAR)
  // ==========================================
  const exportToExcelCSV = (filename, headers, rows) => {
    const BOM = '\uFEFF';
    const csvLines = [
      headers.join(';'),
      ...rows.map(row =>
        row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';')
      )
    ];
    const blob = new Blob([BOM + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Reporte Excel (${filename}) descargado.`);
  };

  const handleExportFullBackupJSON = () => {
    const backup = {
      businessName: 'El Punto del Sabor',
      exportedAt: new Date().toISOString(),
      exchangeRate,
      users,
      categories,
      receivingAccounts,
      products,
      deliveryZones,
      paymentMethods,
      customers,
      expenses,
      sales,
      supplyCatalog,
      supplierCatalog
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Respaldo_El_Punto_del_Sabor_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Respaldo completo de la base de datos (.JSON) descargado.');
  };

  const handleImportFullBackupJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        if (backup.users) setUsers(backup.users);
        if (backup.categories) setCategories(backup.categories);
        if (backup.receivingAccounts) setReceivingAccounts(backup.receivingAccounts);
        if (backup.products) setProducts(backup.products);
        if (backup.deliveryZones) setDeliveryZones(backup.deliveryZones);
        if (backup.paymentMethods) setPaymentMethods(backup.paymentMethods);
        if (backup.customers) setCustomers(backup.customers);
        if (backup.expenses) setExpenses(backup.expenses);
        if (backup.sales) setSales(backup.sales);
        if (backup.supplyCatalog) setSupplyCatalog(backup.supplyCatalog);
        if (backup.supplierCatalog) setSupplierCatalog(backup.supplierCatalog);
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
        setCopiedWhatsApp(true);
        setTimeout(() => setCopiedWhatsApp(false), 3000);
        showNotification('Texto copiado al portapapeles listo para pegar en WhatsApp.');
      } else {
        throw new Error();
      }
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 3000);
      showNotification('Copiado al portapapeles.');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const found = users.find(
      u =>
        u.username.toLowerCase() === loginUsername.trim().toLowerCase() &&
        u.password === loginPassword
    );
    if (!found) {
      setLoginError('Usuario o contraseña incorrectos. Verifica tus credenciales.');
      return;
    }
    setCurrentUser(found);
    setLoginError('');
    showNotification(`Bienvenido(a), ${found.username}`);
  };

  const handleLoadDemoSales = () => {
    const demoSale = {
      id: `sale_${Date.now()}`,
      invoiceNumber: `EPDS-${1001 + sales.length}`,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      cashier: currentUser?.username || 'Michelle Sifontes',
      customerId: customers[0]?.id || 'cli_1',
      customerName: customers[0]?.name || 'Cliente Prueba',
      customerPhone: customers[0]?.phone || '0414-8823411',
      customerDocument: customers[0]?.document || 'V-18452310',
      deliveryAddress: customers[0]?.address || 'Urb. Los Olivos, Casa #14',
      deliveryZoneName: 'Zona Cercana (Hasta 2 km)',
      deliveryFee: 1.0,
      items: [
        {
          productId: 'prod_combo_1',
          name: 'Combo 1: 2 Perros Clásicos + Refresco',
          category: 'combos',
          qty: 1,
          price: 4.2,
          cost: 1.85,
          subtotal: 4.2
        }
      ],
      subtotal: 4.2,
      totalCost: 1.85,
      total: 5.2,
      totalBs: 5.2 * exchangeRate,
      exchangeRateUsed: exchangeRate,
      paymentCondition: 'contado',
      creditPaid: true,
      paymentMethod: 'Pago Móvil',
      receivingAccountName: 'BDV - Michelle Sifontes',
      paymentDetails: {
        reference: String(Math.floor(100000 + Math.random() * 900000)),
        senderName: customers[0]?.name || 'Cliente Prueba',
        senderDocument: customers[0]?.document || 'V-18452310',
        senderBank: '0102 - Banco de Venezuela (BDV)',
        senderPhone: customers[0]?.phone || '0414-8823411',
        sender: 'Cliente Prueba | 0102 - Banco de Venezuela'
      },
      notes: 'Pedido de prueba generado con 1 clic.'
    };
    setSales(prev => [demoSale, ...prev]);
    showNotification(`Factura de prueba ${demoSale.invoiceNumber} generada con éxito.`);
  };

  if (isCustomerPublicView) {
    const publicProducts = availableCustomerProducts.filter(p => {
      const matchCat = customerFilterCat === 'todos' || p.category === customerFilterCat;
      const q = customerSearch.trim().toLowerCase();
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q);
      return matchCat && matchQ;
    });

    const selectedPublicZone =
      deliveryZones.find(z => z.id === customerOrderForm.zoneId) ||
      deliveryZones[0] || { name: 'Delivery', fee: 0 };

    const customerSubtotalUSD = customerCart.reduce((acc, i) => acc + i.price * i.qty, 0);
    const customerDeliveryFeeUSD =
      customerCart.length > 0 ? Number(selectedPublicZone.fee || 0) : 0;
    const customerTotalUSD = customerSubtotalUSD + customerDeliveryFeeUSD;

    const addCustomerItem = (prod) => {
      setCustomerCart(prev => {
        const exists = prev.find(i => i.id === prod.id);
        if (exists) {
          return prev.map(i => (i.id === prod.id ? { ...i, qty: i.qty + 1 } : i));
        }
        return [
          ...prev,
          {
            id: prod.id,
            name: prod.name,
            category: prod.category,
            price: Number(prod.price),
            cost: Number(prod.cost || 0),
            qty: 1
          }
        ];
      });
    };

    const updateCustomerQty = (id, delta) => {
      setCustomerCart(prev =>
        prev
          .map(i => (i.id === id ? { ...i, qty: i.qty + delta } : i))
          .filter(i => i.qty > 0)
      );
    };

    const handleSendCustomerOrderWhatsApp = () => {
      if (customerCart.length === 0) {
        showNotification('Selecciona al menos un producto del menú.', 'error');
        return;
      }
      if (!customerOrderForm.name.trim() || !customerOrderForm.phone.trim()) {
        showNotification('Por favor ingresa tu Nombre y Teléfono de contacto.', 'error');
        return;
      }
      if (!customerOrderForm.address.trim()) {
        showNotification('Por favor ingresa la Dirección exacta de envío.', 'error');
        return;
      }

      const cleanName = customerOrderForm.name.trim();
      const cleanDoc = customerOrderForm.document.trim() || 'V-00000000';
      const cleanPhone = customerOrderForm.phone.trim();
      const cleanAddr = customerOrderForm.address.trim();

      setCustomers(prev => {
        const exists = prev.some(
          c =>
            c.name.toLowerCase() === cleanName.toLowerCase() ||
            (cleanPhone && c.phone === cleanPhone)
        );
        if (exists) return prev;
        return [
          {
            id: `cli_${Date.now()}`,
            name: cleanName,
            document: cleanDoc,
            phone: cleanPhone,
            address: cleanAddr,
            defaultZoneId: customerOrderForm.zoneId
          },
          ...prev
        ];
      });

      const rawBizPhone = businessWhatsApp.replace(/[^0-9]/g, '');
      const intlPhone = rawBizPhone.startsWith('0')
        ? `58${rawBizPhone.slice(1)}`
        : rawBizPhone;

      const orderText =
        `🌭 *NUEVO PEDIDO DELIVERY - EL PUNTO DEL SABOR*\n\n` +
        `👤 *DATOS DEL CLIENTE PARA FACTURAR:*\n` +
        `• *Nombre:* ${cleanName}\n` +
        `• *Cédula / RIF:* ${cleanDoc}\n` +
        `• *Teléfono:* ${cleanPhone}\n` +
        `• *Dirección de Envío:* ${cleanAddr}\n` +
        `• *Ruta Delivery:* ${selectedPublicZone.name} ($${customerDeliveryFeeUSD.toFixed(2)})\n\n` +
        `📋 *DETALLE DEL PEDIDO:*\n` +
        customerCart
          .map(
            i =>
              `• ${i.qty}x *${i.name}* — $${(i.price * i.qty).toFixed(2)} (Bs. ${(
                i.price *
                i.qty *
                exchangeRate
              ).toFixed(2)})`
          )
          .join('\n') +
        `\n\n💵 *Subtotal Productos:* $${customerSubtotalUSD.toFixed(2)}\n` +
        `🛵 *Costo de Envío:* $${customerDeliveryFeeUSD.toFixed(2)}\n` +
        `💰 *TOTAL A FACTURAR: $${customerTotalUSD.toFixed(2)} (Bs. ${(
          customerTotalUSD * exchangeRate
        ).toFixed(2)})*\n\n` +
        `💳 *DATOS DEL PAGO:*\n` +
        `• *Modalidad:* ${
          customerOrderForm.paymentCondition === 'credito'
            ? 'Solicitud a Crédito'
            : 'Pago de Contado'
        }\n` +
        `• *Forma de Pago:* ${customerOrderForm.paymentMethod}\n` +
        `• *Banco / Cuenta Emisor:* ${customerOrderForm.paymentSenderBank || 'N/A'}\n` +
        `• *N° Referencia / Operación:* ${
          customerOrderForm.paymentReference.trim() || 'Envío comprobante por aquí'
        }` +
        (customerOrderForm.notes.trim()
          ? `\n\n📝 *Nota del Cliente:* ${customerOrderForm.notes.trim()}`
          : '');

      copyTextToClipboard(orderText);
      window.open(
        `https://wa.me/${intlPhone}?text=${encodeURIComponent(orderText)}`,
        '_blank'
      );
    };

    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col">
        <header className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-stone-950 shadow-xl sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-950 text-white flex items-center justify-center text-2xl shadow">
                🌭
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full bg-stone-950 text-amber-400 text-[10px] font-black uppercase">
                  Menú Digital Oficial • Servicio Delivery
                </span>
                <h1 className="text-xl font-black tracking-tight text-stone-950">
                  EL PUNTO DEL SABOR
                </h1>
                <p className="text-xs font-extrabold text-stone-900">
                  📲 Pedidos WhatsApp: {businessWhatsApp} • Tasa BCV: Bs. {Number(exchangeRate).toFixed(2)}/$
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadCustomerMenuPDF}
                className="px-3 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-amber-400 text-xs font-extrabold flex items-center gap-1.5 shadow"
              >
                <FileDown className="w-4 h-4" /> Descargar Menú PDF
              </button>
              <button
                type="button"
                onClick={() => setIsCustomerPublicView(false)}
                className="px-3 py-2 rounded-xl bg-white/90 hover:bg-white text-stone-900 text-xs font-black shadow"
              >
                ← Volver al Panel Administrativo
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-stone-900 p-4 rounded-3xl border border-stone-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  placeholder="Busca tu perro caliente, combo, hamburguesa o bebida favorita..."
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-stone-950 border border-stone-700 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCustomerFilterCat(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                      customerFilterCat === cat.id
                        ? 'bg-amber-500 text-stone-950 shadow'
                        : 'bg-stone-950 text-stone-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {publicProducts.map(prod => {
                const inCart = customerCart.find(i => i.id === prod.id);
                return (
                  <div
                    key={prod.id}
                    className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 bg-stone-800 overflow-hidden">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          onError={e => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              FALLBACK_BY_CATEGORY[prod.category] || FALLBACK_BY_CATEGORY.perros;
                          }}
                          className="w-full h-full object-cover"
                        />
                        {inCart && (
                          <span className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-amber-500 text-stone-950 font-black text-xs shadow">
                            Seleccionado: {inCart.qty}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-black text-sm text-white">{prod.name}</h3>
                        <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                          {prod.description}
                        </p>
                      </div>
                    </div>
                    <div className="px-4 pb-4 pt-2 border-t border-stone-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-lg font-black text-amber-400">
                          ${Number(prod.price).toFixed(2)}
                        </div>
                        <div className="text-[11px] font-bold text-stone-400">
                          Bs. {(Number(prod.price) * exchangeRate).toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addCustomerItem(prod)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow"
                      >
                        <Plus className="w-4 h-4" /> Quiero este
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-stone-900 rounded-3xl border border-stone-800 p-5 space-y-3.5 sticky top-24 max-h-[calc(100vh-110px)] overflow-y-auto">
              <div className="border-b border-stone-800 pb-2.5">
                <h2 className="text-base font-black text-amber-400">
                  🛵 Arma tu Pedido y Datos de Envío
                </h2>
                <p className="text-xs text-stone-400">
                  Completa tus datos, dirección y forma de pago para enviarnos tu orden lista para facturar al WhatsApp ({businessWhatsApp}).
                </p>
              </div>

              {customerCart.length === 0 ? (
                <div className="py-5 text-center text-xs text-stone-500 border border-dashed border-stone-800 rounded-2xl p-4">
                  Toca <strong>"Quiero este"</strong> en cualquier perro caliente, combo o bebida para armar tu pedido.
                </div>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {customerCart.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-stone-950 p-2.5 rounded-2xl border border-stone-800 text-xs"
                    >
                      <div className="flex-1 pr-2">
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-amber-400 font-bold">${item.price.toFixed(2)} c/u</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateCustomerQty(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-stone-800 text-white flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-black">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateCustomerQty(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2.5 pt-2 border-t border-stone-800 text-xs">
                <div className="text-[11px] font-black text-amber-400 uppercase">
                  1. Datos del Cliente y Dirección de Entrega:
                </div>
                <input
                  type="text"
                  value={customerOrderForm.name}
                  onChange={e =>
                    setCustomerOrderForm({ ...customerOrderForm, name: e.target.value })
                  }
                  placeholder="Nombre y Apellido *"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs outline-none focus:border-amber-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customerOrderForm.document}
                    onChange={e =>
                      setCustomerOrderForm({ ...customerOrderForm, document: e.target.value })
                    }
                    placeholder="Cédula / RIF *"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={customerOrderForm.phone}
                    onChange={e =>
                      setCustomerOrderForm({ ...customerOrderForm, phone: e.target.value })
                    }
                    placeholder="Teléfono WhatsApp *"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 mb-1">
                    🛵 Selecciona tu Zona / Ruta de Envío:
                  </label>
                  <select
                    value={customerOrderForm.zoneId}
                    onChange={e =>
                      setCustomerOrderForm({ ...customerOrderForm, zoneId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs font-bold outline-none focus:border-amber-500"
                  >
                    {deliveryZones.map(z => (
                      <option key={z.id} value={z.id}>
                        {z.name} (+${Number(z.fee).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  rows={2}
                  value={customerOrderForm.address}
                  onChange={e =>
                    setCustomerOrderForm({ ...customerOrderForm, address: e.target.value })
                  }
                  placeholder="📍 Dirección exacta de envío (Urbanización, calle, casa, referencia) *"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs outline-none focus:border-amber-500"
                />

                <div className="text-[11px] font-black text-amber-400 uppercase pt-1">
                  2. Forma de Pago:
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 mb-1">
                      Método de Pago:
                    </label>
                    <select
                      value={customerOrderForm.paymentMethod}
                      onChange={e => {
                        const m = e.target.value;
                        const isBinOrCash =
                          m.toLowerCase().includes('binance') ||
                          m.toLowerCase().includes('efectivo') ||
                          m.toLowerCase().includes('zelle');
                        setCustomerOrderForm({
                          ...customerOrderForm,
                          paymentMethod: m,
                          paymentSenderBank: isBinOrCash ? '' : VENEZUELAN_BANKS[0]
                        });
                      }}
                      className="w-full px-2.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs font-bold"
                    >
                      {paymentMethods.map(pm => (
                        <option key={pm.id} value={pm.name}>
                          {pm.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 mb-1">
                      N° Referencia (Opcional):
                    </label>
                    <input
                      type="text"
                      value={customerOrderForm.paymentReference}
                      onChange={e =>
                        setCustomerOrderForm({
                          ...customerOrderForm,
                          paymentReference: e.target.value
                        })
                      }
                      placeholder="Ej: 948271"
                      className="w-full px-2.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs"
                    />
                  </div>
                </div>

                {customerOrderForm.paymentMethod.toLowerCase().includes('binance') ? (
                  <input
                    type="text"
                    value={customerOrderForm.paymentSenderBank}
                    onChange={e =>
                      setCustomerOrderForm({
                        ...customerOrderForm,
                        paymentSenderBank: e.target.value
                      })
                    }
                    placeholder="🟡 Tu Usuario / Correo / ID Binance"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-amber-500/60 text-white text-xs"
                  />
                ) : !customerOrderForm.paymentMethod.toLowerCase().includes('efectivo') ? (
                  <select
                    value={customerOrderForm.paymentSenderBank}
                    onChange={e =>
                      setCustomerOrderForm({
                        ...customerOrderForm,
                        paymentSenderBank: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs"
                  >
                    <option value="">-- Banco desde donde realizas el pago --</option>
                    {VENEZUELAN_BANKS.map(b => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                ) : null}

                <input
                  type="text"
                  value={customerOrderForm.notes}
                  onChange={e =>
                    setCustomerOrderForm({ ...customerOrderForm, notes: e.target.value })
                  }
                  placeholder="📝 Nota de cocina (Ej: Con todo, salsas aparte...)"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal Productos:</span>
                  <span>${customerSubtotalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Costo Delivery ({selectedPublicZone.name}):</span>
                  <span>${customerDeliveryFeeUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-1.5 border-t border-stone-800">
                  <span className="text-xs font-bold text-amber-400">TOTAL A PAGAR:</span>
                  <div className="text-right">
                    <div className="text-xl font-black text-white">
                      ${customerTotalUSD.toFixed(2)}
                    </div>
                    <div className="text-xs text-amber-400 font-bold">
                      Bs. {(customerTotalUSD * exchangeRate).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={customerCart.length === 0}
                onClick={handleSendCustomerOrderWhatsApp}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-stone-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" /> Enviar Pedido y Datos por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-500/30">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 p-6 text-white text-center">
            <div className="w-16 h-16 rounded-2xl bg-stone-950/90 mx-auto flex items-center justify-center text-3xl shadow-lg mb-3">
              🌭
            </div>
            <h1 className="text-2xl font-black tracking-tight">EL PUNTO DEL SABOR</h1>
            <p className="text-xs font-medium text-amber-100 mt-1">
              Sistema Integral POS Delivery, Costos, Inventario y KPIs
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                Acceso Rápido de Socios Autorizados:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {users.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setLoginUsername(u.username);
                      setLoginPassword(u.password);
                      setLoginError('');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      loginUsername === u.username
                        ? 'border-amber-500 bg-amber-50 text-stone-900 font-bold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{u.username}</div>
                    <div className="text-[10px] text-stone-500">Clave: {u.password}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Usuario</label>
              <input
                type="text"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-extrabold text-sm shadow-lg transition"
            >
              Entrar al Sistema de Gestión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Ventas filtradas para el Cierre Diario
  const dailyClosingSales = sales.filter(s => s.date === closingDate);
  const dailyProductSummary = {};
  dailyClosingSales.forEach(s => {
    s.items.forEach(item => {
      if (!dailyProductSummary[item.name]) {
        dailyProductSummary[item.name] = { qty: 0, totalUSD: 0, category: item.category };
      }
      dailyProductSummary[item.name].qty += item.qty;
      dailyProductSummary[item.name].totalUSD += item.subtotal;
    });
  });

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col [&_*]:scrollbar-thin [&_*]:scrollbar-thumb-stone-300 [&_*]:scrollbar-track-transparent">
      {/* NOTIFICACIÓN FLOTANTE */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
            notification.type === 'error'
              ? 'bg-red-900 text-white border-red-500'
              : 'bg-stone-900 text-amber-400 border-amber-500'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* BARRA SUPERIOR */}
      <header className="bg-stone-900 text-white shadow-lg sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-red-600 flex items-center justify-center text-2xl shadow-md">
              🌭
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">EL PUNTO DEL SABOR</h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold">
                  Etapas 1 a 5
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Operador: <strong className="text-amber-300">{currentUser.username}</strong> • Ventas WhatsApp: <strong className="text-emerald-400">{businessWhatsApp}</strong>
              </p>
            </div>
          </div>

          {/* Controles Rápidos Superiores */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tasa BCV / Paralelo con Sincronización Automática */}
            <div className="flex items-center gap-1.5 bg-stone-800 border border-stone-700 px-3 py-1.5 rounded-xl text-xs">
              <div className="flex flex-col">
                <span className="text-amber-400 font-extrabold text-[10px] leading-tight">
                  Tasa BCV (Bs/$):
                </span>
                <span className="text-[9px] text-stone-400 leading-tight">{bcvLastUpdate}</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={exchangeRate}
                onChange={e => setExchangeRate(Number(e.target.value) || 1)}
                className="w-20 bg-stone-900 text-amber-400 font-extrabold px-1.5 py-1 rounded border border-stone-600 text-center"
              />
              <button
                type="button"
                onClick={() => syncBCVExchangeRate(false)}
                disabled={isSyncingBCV}
                title="Actualizar tasa del dólar BCV en tiempo real desde la red"
                className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBCV ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Botón de Alarmas Activas */}
            <button
              onClick={() => setActiveTab('kpis')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                kpiMetrics.alarms.length > 0
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-stone-800 text-stone-300 border border-stone-700'
              }`}
            >
              <Bell className={`w-4 h-4 ${kpiMetrics.alarms.length > 0 ? 'text-red-400 animate-pulse' : ''}`} />
              <span>Alarmas ({kpiMetrics.alarms.length})</span>
            </button>

            {/* Botón Destacado: Menú Digital Descargable y Enlace para Clientes */}
            <button
              onClick={() => setShowShareMenuModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-1.5 shadow transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Menú Clientes (Descargar / Enlace)</span>
            </button>

            {/* Botón Rápido: Cómo Poner en Marcha */}
            <button
              onClick={() => setActiveTab('architecture')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Probar / Usar Fuera del Chat</span>
            </button>

            {/* Cerrar Sesión / Cambiar entre Michelle y Jhonny */}
            <button
              onClick={() => setCurrentUser(null)}
              className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-red-600/80 text-stone-300 hover:text-white text-xs font-bold flex items-center gap-1 transition"
              title="Cambiar de usuario o cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cambiar Usuario</span>
            </button>
          </div>
        </div>

        {/* BARRA DE NAVEGACIÓN DE MÓDULOS */}
        <div className="bg-stone-950/90 border-t border-stone-800">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1.5">
            {[
              { id: 'pos', label: 'Facturación & POS Digital', icon: ShoppingBag },
              { id: 'catalog', label: 'Menú, Fotos e Inventario', icon: Utensils },
              { id: 'customers', label: 'Clientes, Rutas y Créditos', icon: Users },
              { id: 'expenses', label: 'Gastos e Inversión Inicial', icon: Package },
              { id: 'closing', label: 'Cierre Diario de Ventas', icon: FileText },
              { id: 'kpis', label: 'KPIs, Rentabilidad y Alarmas', icon: TrendingUp },
              { id: 'architecture', label: '🚀 Probar y Poner en Marcha', icon: ShieldCheck },
              { id: 'settings', label: 'Usuarios y Tipos de Pago', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl w-full mx-auto px-4 py-5 flex-1">
        
        {/* ========================================== */}
        {/* MÓDULO 1: FACTURACIÓN Y POS DIGITAL DELIVERY */}
        {/* ========================================== */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:h-[calc(100vh-140px)] lg:overflow-hidden">
            {/* COLUMNA IZQUIERDA (7 cols): MENÚ DIGITAL CON BARRA DE DESPLAZAMIENTO INDEPENDIENTE */}
            <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto lg:pr-2 space-y-4 scrollbar-thin">
              {/* Buscador en tiempo real letra por letra + Filtro de Etapas (Fijo arriba del menú) */}
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-200 space-y-3 sticky top-0 z-10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={posSearch}
                      onChange={e => setPosSearch(e.target.value)}
                      placeholder="Buscar letra por letra (ej: Clásico, Polaco, Combo, Tequeños)..."
                      className="w-full pl-10 pr-4 py-2 rounded-2xl border border-stone-300 text-xs font-medium bg-white text-stone-900 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <select
                    value={activeStageFilter}
                    onChange={e => setActiveStageFilter(e.target.value)}
                    className="px-3 py-2 rounded-2xl border border-stone-300 bg-white text-xs font-bold text-stone-900"
                  >
                    <option value="all">Todas las Etapas (1 a 5)</option>
                    <option value="1">Solo Etapa 1 (Perros y Combos)</option>
                    <option value="2">Hasta Etapa 2 (+ Hamburguesas)</option>
                    <option value="3">Hasta Etapa 3 (+ Papas Fritas)</option>
                    <option value="4">Hasta Etapa 4 (+ Especialidades y Postres)</option>
                  </select>
                </div>

                {/* Pestañas de Clasificación del Menú */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setPosCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                        posCategory === cat.id
                          ? 'bg-stone-900 text-amber-400 shadow'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tarjetas de Productos del Menú Digital (1 Clic para Agregar) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 pb-4">
                {filteredProducts.map(prod => {
                  const inCart = cart.find(i => i.productId === prod.id);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => addToCart(prod)}
                      className={`cursor-pointer bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group ${
                        inCart ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-stone-200'
                      }`}
                    >
                      <div>
                        <div className="relative h-32 bg-stone-200 overflow-hidden">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            onError={e => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                FALLBACK_BY_CATEGORY[prod.category] || FALLBACK_BY_CATEGORY.perros;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-stone-900/80 text-amber-300 text-[10px] font-extrabold">
                            Etapa {prod.stage}
                          </span>
                          <span
                            className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              prod.stock <= prod.minStock
                                ? 'bg-red-600 text-white'
                                : 'bg-black/70 text-white'
                            }`}
                          >
                            Stock: {prod.stock}
                          </span>
                          {inCart && (
                            <div className="absolute bottom-2 right-2 bg-amber-500 text-stone-950 font-black text-xs px-2.5 py-1 rounded-xl shadow">
                              En Factura: {inCart.qty}
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-extrabold text-xs text-stone-900 leading-snug">
                            {prod.name}
                          </h3>
                          <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">
                            {prod.description}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 pb-3 pt-1 flex items-center justify-between border-t border-stone-100">
                        <div>
                          <div className="text-sm font-black text-stone-900">
                            ${Number(prod.price).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-stone-500 font-semibold">
                            Bs. {(Number(prod.price) * exchangeRate).toFixed(2)}
                          </div>
                        </div>
                        <span className="px-2.5 py-1.5 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-stone-950 font-extrabold text-xs flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Agregar
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMNA DERECHA (5 cols): COMANDA / FACTURA DELIVERY CON BARRA DE DESPLAZAMIENTO PROPIA */}
            <div className="lg:col-span-5 lg:h-full lg:overflow-y-auto lg:pl-1 pb-4 scrollbar-thin">
              <div className="bg-white rounded-3xl shadow-md border border-stone-200 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <h2 className="text-base font-black text-stone-900">
                      Factura Delivery & Orden
                    </h2>
                    <p className="text-[11px] text-stone-500">
                      Selecciona cliente, dirección de envío y método de pago
                    </p>
                  </div>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-xs text-red-600 hover:underline font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Vaciar
                    </button>
                  )}
                </div>

                {/* Selección de Cliente y Dirección Obligatoria */}
                <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-stone-700 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-amber-600" /> Cliente Registrado:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuickCustomerModal(true)}
                      className="text-[11px] font-extrabold text-amber-700 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> + Nuevo Cliente
                    </button>
                  </div>

                  <select
                    value={selectedCustomerId}
                    onChange={e => handleSelectCustomerInPOS(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900"
                  >
                    {customers.length === 0 && <option value="">Sin clientes registrados</option>}
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      📍 Dirección Exacta de Envío (Impresa en Factura):
                    </label>
                    <textarea
                      rows={2}
                      value={customDeliveryAddress}
                      onChange={e => setCustomDeliveryAddress(e.target.value)}
                      placeholder="Urbanización, calle, número de casa, punto de referencia..."
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                    />
                  </div>

                  {/* BUSCADOR INTELIGENTE DE RUTAS DE DELIVERY CON DATALIST */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      🛵 Escriba o seleccione su Ruta de Domicilio:
                    </label>
                    <input
                      type="text"
                      list="zones-list"
                      value={zoneSearchInput}
                      onChange={e => {
                        setZoneSearchInput(e.target.value);
                        // Buscar coincidencia exacta en las opciones desplegadas para setear el ID
                        const matched = deliveryZones.find(
                          z => `${z.name} - $${Number(z.fee).toFixed(2)}` === e.target.value
                        );
                        if (matched) {
                          setSelectedZoneId(matched.id);
                        }
                      }}
                      placeholder="Ej: Casco Central, Retiro, Zona Cercana..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <datalist id="zones-list">
                      {deliveryZones.map(z => (
                        <option key={z.id} value={`${z.name} - $${Number(z.fee).toFixed(2)}`} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Lista de Productos en la Factura */}
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {cart.length === 0 ? (
                    <div className="text-center py-6 text-xs text-stone-400 border border-dashed border-stone-200 rounded-2xl">
                      Haz clic sobre cualquier perro caliente, combo o bebida del menú para agregarlo a la factura.
                    </div>
                  ) : (
                    cart.map(item => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 text-xs"
                      >
                        <div className="flex-1 pr-2">
                          <div className="font-bold text-stone-900">{item.name}</div>
                          <div className="text-[11px] text-stone-500">
                            ${item.price.toFixed(2)} c/u
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.productId, -1)}
                            className="w-6 h-6 rounded-lg bg-stone-200 hover:bg-stone-300 flex items-center justify-center font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-extrabold">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.productId, 1)}
                            className="w-6 h-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="w-16 text-right font-extrabold text-stone-900">
                          ${item.subtotal.toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Modalidad de Pago: Contado vs Crédito y Datos de Pago Móvil */}
                <div className="space-y-2.5 pt-2 border-t border-stone-200">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentCondition('contado')}
                      className={`py-2 rounded-xl text-xs font-extrabold border transition ${
                        paymentCondition === 'contado'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      💵 Pago de Contado
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentCondition('credito')}
                      className={`py-2 rounded-xl text-xs font-extrabold border transition ${
                        paymentCondition === 'credito'
                          ? 'bg-amber-600 text-white border-amber-600 shadow'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      📝 Venta a Crédito (Fiado)
                    </button>
                  </div>

                  {paymentCondition === 'contado' && (
                    <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                            Método de Pago Recibido:
                          </label>
                          <select
                            value={selectedPaymentMethod}
                            onChange={e => handleSelectPaymentMethodInPOS(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-bold text-stone-900"
                          >
                            {paymentMethods.map(pm => (
                              <option key={pm.id} value={pm.name}>
                                {pm.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                            🔢 N° de Referencia / ID de Operación:
                          </label>
                          <input
                            type="text"
                            value={paymentReference}
                            onChange={e => setPaymentReference(e.target.value)}
                            placeholder={
                              selectedPaymentMethod.toLowerCase().includes('binance')
                                ? 'ID de Orden Binance Pay'
                                : 'Ej: 849201'
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold bg-white text-stone-900"
                          />
                        </div>
                      </div>

                      {/* SELECCIÓN DE CUENTA RECEPTORA PROPIA */}
                      <div>
                        <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                          📥 ¿A qué cuenta nuestra entró el dinero?
                        </label>
                        <select
                          value={selectedReceivingAccountId}
                          onChange={e => setSelectedReceivingAccountId(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {receivingAccounts.length === 0 && <option value="">Sin cuentas (Configurar en Ajustes)</option>}
                          {receivingAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                              {acc.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-1 border-t border-stone-200">
                        <div className="text-[10px] font-extrabold text-amber-800 uppercase mb-1.5">
                          Datos del Emisor del Pago (Celdas Individuales):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                              👤 Nombre del Emisor:
                            </label>
                            <input
                              type="text"
                              value={paymentSenderName}
                              onChange={e => setPaymentSenderName(e.target.value)}
                              placeholder="Ej: Carlos Mendoza"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                              🪪 Cédula / RIF del Emisor:
                            </label>
                            <input
                              type="text"
                              value={paymentSenderDoc}
                              onChange={e => setPaymentSenderDoc(e.target.value)}
                              placeholder="Ej: V-18452310"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                            />
                          </div>

                          {/* Campo dinámico: Si es Binance muestra Usuario Binance, si es Banco muestra desplegable de todos los bancos de Venezuela + opción de editar */}
                          <div>
                            {selectedPaymentMethod.toLowerCase().includes('binance') ? (
                              <>
                                <label className="block text-[10px] font-bold text-amber-700 mb-0.5">
                                  🟡 Usuario / Correo / ID Binance Emisor:
                                </label>
                                <input
                                  type="text"
                                  value={paymentSenderBank}
                                  onChange={e => setPaymentSenderBank(e.target.value)}
                                  placeholder="Ej: usuario_binance o correo@..."
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-amber-400 text-xs bg-white font-bold text-stone-900"
                                />
                              </>
                            ) : selectedPaymentMethod.toLowerCase().includes('efectivo') ? (
                              <>
                                <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                                  💵 Detalle de Billetes / Efectivo (Opcional):
                                </label>
                                <input
                                  type="text"
                                  value={paymentSenderBank}
                                  onChange={e => setPaymentSenderBank(e.target.value)}
                                  placeholder="Vacío o detalle de billete recibido..."
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                                />
                              </>
                            ) : selectedPaymentMethod.toLowerCase().includes('zelle') ? (
                              <>
                                <label className="block text-[10px] font-bold text-purple-700 mb-0.5">
                                  💜 Correo / Titular de Cuenta Zelle:
                                </label>
                                <input
                                  type="text"
                                  value={paymentSenderBank}
                                  onChange={e => setPaymentSenderBank(e.target.value)}
                                  placeholder="Titular o correo Zelle emisor..."
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-purple-300 text-xs bg-white text-stone-900"
                                />
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between mb-0.5">
                                  <label className="block text-[10px] font-bold text-stone-600">
                                    🏦 Banco Emisor (Venezuela):
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsCustomBankEdit(!isCustomBankEdit);
                                      if (!isCustomBankEdit) setPaymentSenderBank('');
                                    }}
                                    className="text-[9px] font-extrabold text-amber-700 hover:underline"
                                  >
                                    {isCustomBankEdit ? '▼ Ver Lista de Bancos' : '✎ Escribir otro'}
                                  </button>
                                </div>
                                {isCustomBankEdit ? (
                                  <input
                                    type="text"
                                    value={paymentSenderBank}
                                    onChange={e => setPaymentSenderBank(e.target.value)}
                                    placeholder="Escribe el nombre o código del banco..."
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-400 text-xs bg-white font-bold text-stone-900"
                                  />
                                ) : (
                                  <select
                                    value={paymentSenderBank}
                                    onChange={e => setPaymentSenderBank(e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-lg border border-stone-300 text-xs bg-white font-bold text-stone-900"
                                  >
                                    <option value="">-- Seleccionar Banco de Venezuela --</option>
                                    {VENEZUELAN_BANKS.map(b => (
                                      <option key={b} value={b}>
                                        {b}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                              📱 Teléfono Emisor:
                            </label>
                            <input
                              type="text"
                              value={paymentSenderPhone}
                              onChange={e => setPaymentSenderPhone(e.target.value)}
                              placeholder="Ej: 0414-8823411"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    type="text"
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    placeholder="📝 Nota de cocina o entrega (Ej: Sin cebolla, llamar afuera)..."
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                  />
                </div>

                {/* Totales de la Factura */}
                <div className="bg-stone-900 text-white p-4 rounded-2xl space-y-1.5">
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Subtotal Comida:</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Costo Delivery ({selectedZone.name}):</span>
                    <span>${Number(selectedZone.fee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1 border-t border-stone-700">
                    <span className="text-sm font-extrabold text-amber-400">TOTAL A PAGAR:</span>
                    <div className="text-right">
                      <div className="text-xl font-black text-white">${cartTotalUSD.toFixed(2)}</div>
                      <div className="text-xs text-amber-300 font-bold">
                        Bs. {cartTotalBs.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePrepareCheckout}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Emitir Factura y Revisar Venta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MÓDULO 2: MENÚ DIGITAL, CARGA DE FOTOS E INVENTARIO */}
        {/* ========================================== */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Formulario para Crear / Editar Producto y Subir Imagen */}
            <div className="lg:col-span-4">
              <form
                onSubmit={handleSaveProduct}
                className="bg-white p-5 rounded-3xl shadow-sm border border-stone-200 space-y-3.5 sticky top-28"
              >
                <h2 className="text-base font-black text-stone-900">
                  {editingProduct ? `Editando: ${editingProduct.name}` : 'Agregar Producto al Menú'}
                </h2>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nombre del Producto o Combo
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Ej: Perro Especial o Combo Burger..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Categoría</label>
                    <select
                      value={productForm.category}
                      onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                    >
                      {categories.filter(c => c.id !== 'todos').map(c => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Etapa del Proyecto
                    </label>
                    <select
                      value={productForm.stage}
                      onChange={e => setProductForm({ ...productForm, stage: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                    >
                      <option value={1}>Etapa 1 (Perros/Combos)</option>
                      <option value={2}>Etapa 2 (Hamburguesas)</option>
                      <option value={3}>Etapa 3 (Papas Fritas)</option>
                      <option value={4}>Etapa 4 (Tequeños/Postres)</option>
                      <option value={5}>Etapa 5 (Puesto Físico)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Precio Venta ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="2.50"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Costo Receta ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.cost}
                      onChange={e => setProductForm({ ...productForm, cost: e.target.value })}
                      placeholder="1.10"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Stock Disponible
                    </label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                      placeholder="50"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Alerta Stock Mínimo
                    </label>
                    <input
                      type="number"
                      value={productForm.minStock}
                      onChange={e => setProductForm({ ...productForm, minStock: e.target.value })}
                      placeholder="10"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                    />
                  </div>
                </div>

                {/* Carga de Imagen desde Dispositivo o URL */}
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <label className="block text-xs font-extrabold text-amber-900">
                    📸 Fotografía del Producto (Subir desde Celular/PC):
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-stone-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-stone-900 file:text-amber-400"
                  />
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="O pega el enlace URL de una imagen..."
                    className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                  />
                  {productForm.image && (
                    <img
                      src={productForm.image}
                      alt="Vista previa"
                      className="h-24 w-full object-cover rounded-xl border border-stone-300"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Descripción / Ingredientes
                  </label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-extrabold text-xs transition"
                  >
                    {editingProduct ? 'Guardar Cambios' : 'Agregar al Menú'}
                  </button>
                  {editingProduct && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(editingProduct)}
                        className="px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1 transition"
                        title="Eliminar este producto del menú"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(null);
                          setProductForm({
                            name: '',
                            category: categories.length > 0 ? categories[0].id : 'perros',
                            stage: 1,
                            price: '',
                            cost: '',
                            stock: '',
                            minStock: 10,
                            description: '',
                            image: ''
                          });
                        }}
                        className="px-3 py-2.5 rounded-xl bg-stone-200 text-stone-700 font-bold text-xs"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>

            {/* Listado Completo del Menú por Etapas */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white p-4 rounded-3xl border border-stone-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-stone-900">
                    Catálogo e Inventario de "El Punto del Sabor" ({products.length} productos)
                  </h2>
                  <p className="text-xs text-stone-500">
                    Haz clic en "Editar / Subir Foto" para actualizar un artículo o en "Eliminar" para quitarlo del menú.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadCustomerMenuPDF}
                    className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-extrabold flex items-center gap-1.5 shadow"
                  >
                    <FileDown className="w-3.5 h-3.5" /> Descargar Menú PDF
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCustomerMenuImagePoster}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-1.5 shadow"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Descargar Carta Imagen
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShareMenuModal(true)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Compartir Enlace Menú Digital
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {products.map(p => {
                  const unitProfit = Number(p.price) - Number(p.cost);
                  const marginPct = p.price > 0 ? (unitProfit / p.price) * 100 : 0;
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div className="flex gap-3 p-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          onError={e => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              FALLBACK_BY_CATEGORY[p.category] || FALLBACK_BY_CATEGORY.perros;
                          }}
                          className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-stone-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                              Etapa {p.stage}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-stone-400">
                              {p.category}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-xs text-stone-900 mt-1 truncate">
                            {p.name}
                          </h3>
                          <div className="grid grid-cols-3 gap-1 mt-2 text-[11px] bg-stone-50 p-2 rounded-xl">
                            <div>
                              <span className="text-stone-400 block text-[9px]">PVP</span>
                              <strong className="text-stone-900">${Number(p.price).toFixed(2)}</strong>
                            </div>
                            <div>
                              <span className="text-stone-400 block text-[9px]">Costo</span>
                              <strong className="text-stone-700">${Number(p.cost).toFixed(2)}</strong>
                            </div>
                            <div>
                              <span className="text-stone-400 block text-[9px]">Margen</span>
                              <strong className="text-emerald-700">{marginPct.toFixed(0)}%</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                        <span
                          className={`font-bold ${
                            p.stock <= p.minStock ? 'text-red-600' : 'text-stone-700'
                          }`}
                        >
                          Stock actual: {p.stock} uds
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p);
                              setProductForm({
                                name: p.name,
                                category: p.category,
                                stage: p.stage,
                                price: p.price,
                                cost: p.cost,
                                stock: p.stock,
                                minStock: p.minStock,
                                description: p.description,
                                image: p.image
                              });
                            }}
                            className="px-2.5 py-1 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs flex items-center gap-1 transition"
                          >
                            <Edit3 className="w-3 h-3" /> Editar / Foto
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs flex items-center gap-1 transition"
                            title="Eliminar ítem del menú (Requiere Clave Especial)"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MÓDULO 3: CLIENTES, RUTAS DE ENVÍO Y CUENTAS POR COBRAR (CRÉDITO) */}
        {/* ========================================== */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Tarifador de Rutas Delivery */}
              <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-stone-200 space-y-4">
                <div>
                  <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-600" /> Tarifas de Envío por Destino
                  </h2>
                  <p className="text-xs text-stone-500">
                    Carga nuevas rutas a medida que salgan nuevos destinos de delivery.
                  </p>
                </div>

                <form onSubmit={handleAddDeliveryZone} className="flex gap-2">
                  <input
                    type="text"
                    value={newZoneForm.name}
                    onChange={e => setNewZoneForm({ ...newZoneForm, name: e.target.value })}
                    placeholder="Nueva ruta o sector..."
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={newZoneForm.fee}
                    onChange={e => setNewZoneForm({ ...newZoneForm, fee: e.target.value })}
                    placeholder="Costo $"
                    className="w-24 px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-stone-900 text-amber-400 font-extrabold text-xs"
                  >
                    + Ruta
                  </button>
                </form>

                <div className="space-y-2">
                  {deliveryZones.map(z => (
                    <div
                      key={z.id}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs gap-2"
                    >
                      <span className="font-bold text-stone-800 flex-1">{z.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-black">
                          ${Number(z.fee).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            requestAuthorizedDelete(
                              `Eliminar Ruta: ${z.name}`,
                              `¿Deseas eliminar la ruta "${z.name}" ($${Number(z.fee).toFixed(2)}) de la base de datos?`,
                              () => {
                                setDeliveryZones(prev => prev.filter(item => item.id !== z.id));
                                showNotification(`Ruta "${z.name}" eliminada correctamente.`);
                              }
                            )
                          }
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                          title="Eliminar ruta (Requiere Clave Especial)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Control de Ventas a Crédito Pendientes de Cobro */}
              <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-stone-900">
                      Cuentas por Cobrar (Ventas a Crédito)
                    </h2>
                    <p className="text-xs text-stone-500">
                      Liquida aquí los pedidos entregados bajo modalidad a crédito cuando el cliente realice el Pago Móvil.
                    </p>
                  </div>
                  <div className="px-3 py-1.5 rounded-2xl bg-amber-100 text-amber-900 font-black text-xs">
                    Por Cobrar: ${kpiMetrics.pendingCredit.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {sales.filter(s => s.paymentCondition === 'credito' && !s.creditPaid).length === 0 ? (
                    <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl">
                      No hay facturas a crédito pendientes de cobro en este momento.
                    </div>
                  ) : (
                    sales
                      .filter(s => s.paymentCondition === 'credito' && !s.creditPaid)
                      .map(s => (
                        <div
                          key={s.id}
                          className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300 flex flex-wrap items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-black text-stone-900">
                              {s.invoiceNumber} — {s.customerName} ({s.customerPhone})
                            </div>
                            <div className="text-stone-600 text-[11px]">{s.deliveryAddress}</div>
                            <div className="text-[11px] text-amber-900 font-bold mt-1">
                              Fecha: {s.date} | Monto Pendiente: ${s.total.toFixed(2)} (Bs.{' '}
                              {(s.total * exchangeRate).toFixed(2)})
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleMarkCreditPaid(s.id, 'Pago Móvil', 'Liquidado')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow"
                          >
                            Registrar Cobro
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Base de Datos de Clientes y su Histórico de Compras */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-stone-900">
                    Base de Datos de Clientes e Histórico Individual de Compras
                  </h2>
                  <p className="text-xs text-stone-500">
                    Cada cliente guarda su dirección de envío y el historial acumulado de pedidos realizados.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {customers.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        requestAuthorizedDelete(
                          'Borrar Todos los Clientes de Prueba',
                          'Se eliminarán todos los clientes registrados actualmente para que comiences desde cero con tus clientes reales.',
                          () => {
                            setCustomers([]);
                            setSelectedCustomerId('');
                            setCustomDeliveryAddress('');
                            showNotification('Base de datos de clientes reiniciada en limpio.');
                          }
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Borrar Clientes de Prueba
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowQuickCustomerModal(true)}
                    className="px-4 py-2 rounded-xl bg-stone-900 text-amber-400 font-extrabold text-xs"
                  >
                    + Registrar Nuevo Cliente
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {customers.map(c => {
                  const clientSales = sales.filter(
                    s => s.customerId === c.id || s.customerName === c.name
                  );
                  const totalSpent = clientSales.reduce((acc, s) => acc + Number(s.total || 0), 0);
                  return (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-black text-sm text-stone-900">{c.name}</h3>
                          <p className="text-stone-500">
                            {c.document} • {c.phone}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="px-2.5 py-1 rounded-xl bg-stone-900 text-amber-400 font-extrabold">
                            {clientSales.length} compras
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              requestAuthorizedDelete(
                                `Eliminar Cliente: ${c.name}`,
                                `¿Confirmas eliminar al cliente "${c.name}" y su ficha de dirección registrada?`,
                                () => {
                                  setCustomers(prev => prev.filter(item => item.id !== c.id));
                                  showNotification(`Cliente "${c.name}" eliminado.`);
                                }
                              )
                            }
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                            title="Eliminar cliente (Requiere Clave Especial)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-600 bg-white p-2 rounded-xl border border-stone-200">
                        📍 <strong>Dirección:</strong> {c.address}
                      </p>
                      <div className="flex justify-between items-center pt-1 text-[11px] font-bold">
                        <span className="text-stone-500">Total Histórico Comprado:</span>
                        <span className="text-emerald-700 text-xs font-black">
                          ${totalSpent.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MÓDULO 4: GASTOS DE INSUMOS E INVERSIÓN INICIAL */}
        {/* ========================================== */}
        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <form
                onSubmit={handleAddExpense}
                className="bg-white p-5 rounded-3xl border border-stone-200 space-y-3.5"
              >
                <div>
                  <h2 className="text-base font-black text-stone-900">
                    Registrar Compra de Insumos o Inversión
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Cada insumo y comercio que registres queda guardado en memoria con autocompletado y lista desplegable.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Clasificación del Egreso
                  </label>
                  <select
                    value={expenseForm.type}
                    onChange={e => setExpenseForm({ ...expenseForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                  >
                    <option value="insumo">🥖 Compra de Insumos y Materiales (Receta)</option>
                    <option value="inversion">🛠️ Inversión Inicial (Herramientas / Implementos)</option>
                    <option value="operativo">⚡ Gasto Operativo (Gas, Publicidad, Bolsas)</option>
                  </select>
                </div>

                {/* CAMPO INTELIGENTE 1: PRODUCTO / INSUMO CON SEMEJANZAS POR ESCRITURA Y DESPLEGABLE */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">
                      Producto o Insumo Comprado *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const cleanCat = (expenseForm.category || '').trim();
                        if (!cleanCat) {
                          showNotification('Escribe primero el nombre del insumo para guardarlo en memoria.', 'error');
                          return;
                        }
                        setSupplyCatalog(prev => {
                          if (prev.some(i => i.name.toLowerCase() === cleanCat.toLowerCase())) {
                            return prev;
                          }
                          const updated = [
                            {
                              name: cleanCat,
                              type: expenseForm.type,
                              expectedYieldUnits: Number(expenseForm.expectedYieldUnits || 100),
                              defaultDescription: expenseForm.description || cleanCat
                            },
                            ...prev
                          ];
                          persistToCloud({ supplyCatalog: updated });
                          return updated;
                        });
                        showNotification(`Insumo "${cleanCat}" guardado permanentemente en la lista desplegable.`);
                      }}
                      className="text-[10px] font-extrabold text-emerald-700 hover:underline"
                    >
                      + Guardar Insumo en Lista
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={expenseForm.category}
                      onFocus={() => setShowSupplySuggestions(true)}
                      onChange={e => {
                        setExpenseForm({ ...expenseForm, category: e.target.value });
                        setShowSupplySuggestions(true);
                      }}
                      placeholder="Escribe ej: Pan, Salchicha, Salsas, Cajas..."
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900 outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSupplySuggestions(prev => !prev)}
                      className="px-3 py-2 rounded-xl bg-stone-900 text-amber-400 text-xs font-extrabold"
                      title="Mostrar lista desplegable de productos guardados"
                    >
                      ▼ Lista ({supplyCatalog.length})
                    </button>
                  </div>

                  {showSupplySuggestions && (
                    <div className="absolute z-20 mt-1 w-full bg-white rounded-2xl shadow-xl border border-amber-400 max-h-52 overflow-y-auto divide-y divide-stone-100">
                      <div className="px-3 py-1.5 bg-amber-50 text-[10px] font-extrabold text-amber-900 flex justify-between items-center">
                        <span>COINCIDENCIAS EN MEMORIA ({matchingSupplies.length})</span>
                        <button
                          type="button"
                          onClick={() => setShowSupplySuggestions(false)}
                          className="text-stone-500 hover:text-stone-900"
                        >
                          Cerrar ✕
                        </button>
                      </div>
                      {matchingSupplies.length === 0 ? (
                        <div className="p-3 text-xs text-stone-500">
                          Nuevo producto: <strong>"{expenseForm.category}"</strong> (Quedará guardado en memoria al registrar).
                        </div>
                      ) : (
                        matchingSupplies.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSupplyFromMemory(item)}
                            className="w-full text-left px-3 py-2 hover:bg-amber-50 transition flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-extrabold text-stone-900">{item.name}</div>
                              <div className="text-[10px] text-stone-500">{item.defaultDescription}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-bold uppercase">
                              {item.type}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* CAMPO INTELIGENTE 2: COMERCIO / PROVEEDOR CON SEMEJANZAS POR ESCRITURA Y DESPLEGABLE */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">
                      🏪 Comercio / Proveedor donde se compró *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const cleanSup = (expenseForm.supplier || '').trim();
                        if (!cleanSup) {
                          showNotification('Escribe primero el nombre del comercio para guardarlo.', 'error');
                          return;
                        }
                        setSupplierCatalog(prev => {
                          if (prev.some(s => s.toLowerCase() === cleanSup.toLowerCase())) {
                            return prev;
                          }
                          const updated = [cleanSup, ...prev];
                          persistToCloud({ supplierCatalog: updated });
                          return updated;
                        });
                        showNotification(`Comercio "${cleanSup}" guardado permanentemente en la lista.`);
                      }}
                      className="text-[10px] font-extrabold text-emerald-700 hover:underline"
                    >
                      + Guardar Comercio en Lista
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={expenseForm.supplier}
                      onFocus={() => setShowSupplierSuggestions(true)}
                      onChange={e => {
                        setExpenseForm({ ...expenseForm, supplier: e.target.value });
                        setShowSupplierSuggestions(true);
                      }}
                      placeholder="Escribe o elige el comercio..."
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900 outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSupplierSuggestions(prev => !prev)}
                      className="px-3 py-2 rounded-xl bg-stone-900 text-amber-400 text-xs font-extrabold"
                      title="Mostrar lista desplegable de comercios guardados"
                    >
                      ▼ Comercios ({supplierCatalog.length})
                    </button>
                  </div>

                  {showSupplierSuggestions && (
                    <div className="absolute z-20 mt-1 w-full bg-white rounded-2xl shadow-xl border border-amber-400 max-h-48 overflow-y-auto divide-y divide-stone-100">
                      <div className="px-3 py-1.5 bg-amber-50 text-[10px] font-extrabold text-amber-900 flex justify-between items-center">
                        <span>COMERCIOS GUARDADOS EN MEMORIA ({matchingSuppliers.length})</span>
                        <button
                          type="button"
                          onClick={() => setShowSupplierSuggestions(false)}
                          className="text-stone-500 hover:text-stone-900"
                        >
                          Cerrar ✕
                        </button>
                      </div>
                      {matchingSuppliers.length === 0 ? (
                        <div className="p-3 text-xs text-stone-500">
                          Nuevo comercio: <strong>"{expenseForm.supplier}"</strong> (Se guardará automáticamente en la lista).
                        </div>
                      ) : (
                        matchingSuppliers.map((sup, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSupplierFromMemory(sup)}
                            className="w-full text-left px-3 py-2 hover:bg-amber-50 transition text-xs font-bold text-stone-800"
                          >
                            🏪 {sup}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Detalle o Nota de la Compra
                  </label>
                  <textarea
                    rows={2}
                    value={expenseForm.description}
                    onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    placeholder="Ej: 10 paquetes de salchicha polaca, 5 paquetes de pan..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Monto ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      placeholder="45.00"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={expenseForm.date}
                      onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                    />
                  </div>
                </div>

                {expenseForm.type === 'insumo' && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                    <div className="text-[11px] font-extrabold text-amber-900">
                      Control de Rendimiento de Insumo (Para Alarmas):
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600">
                          Porciones Esperadas
                        </label>
                        <input
                          type="number"
                          value={expenseForm.expectedYieldUnits}
                          onChange={e =>
                            setExpenseForm({ ...expenseForm, expectedYieldUnits: e.target.value })
                          }
                          className="w-full px-2 py-1 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600">
                          % Consumido Actual
                        </label>
                        <input
                          type="number"
                          max="100"
                          value={expenseForm.consumedPercent}
                          onChange={e =>
                            setExpenseForm({ ...expenseForm, consumedPercent: e.target.value })
                          }
                          className="w-full px-2 py-1 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-extrabold text-xs"
                >
                  Guardar Registro de Gasto / Inversión
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-3xl border border-stone-200">
                  <span className="text-xs font-bold text-stone-500">
                    Total Compras de Insumos y Operación
                  </span>
                  <div className="text-2xl font-black text-stone-900 mt-1">
                    ${kpiMetrics.totalInsumosExpenses.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-stone-200">
                  <span className="text-xs font-bold text-stone-500">
                    Total Inversión Inicial (Herramientas y Equipos)
                  </span>
                  <div className="text-2xl font-black text-amber-700 mt-1">
                    ${kpiMetrics.totalInitialInvestment.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-black text-sm text-stone-900">
                    Historial de Compras de Insumos e Inversiones
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {expenses.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          requestAuthorizedDelete(
                            'Borrar Historial de Gastos e Inversiones de Prueba',
                            'Se eliminarán todos los registros actuales de compras de insumos e inversiones iniciales.',
                            () => {
                              setExpenses([]);
                              showNotification('Historial de compras e inversiones vaciado correctamente.');
                            }
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Limpiar Gastos de Prueba
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        exportToExcelCSV(
                          `Gastos_Inversiones_${closingDate}.csv`,
                          ['Fecha', 'Tipo', 'Categoria', 'Descripcion', 'Monto USD'],
                          expenses.map(e => [e.date, e.type, e.category, e.description, e.amount])
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Exportar Excel
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {expenses.map(e => (
                    <div
                      key={e.id}
                      className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase mr-2 ${
                            e.type === 'inversion'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {e.type}
                        </span>
                        <strong className="text-stone-900">{e.category}:</strong>{' '}
                        <span className="text-stone-600">{e.description}</span>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          Fecha: {e.date} | Proveedor: {e.supplier}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-black text-sm text-stone-900">
                          ${Number(e.amount).toFixed(2)}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            requestAuthorizedDelete(
                              `Eliminar Gasto: ${e.category}`,
                              `¿Deseas eliminar el registro de "${e.category}" por $${Number(e.amount).toFixed(2)}?`,
                              () => {
                                setExpenses(prev => prev.filter(item => item.id !== e.id));
                                showNotification('Registro de gasto eliminado.');
                              }
                            )
                          }
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                          title="Eliminar gasto (Requiere Clave Especial)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MÓDULO 5: CIERRE DIARIO DE VENTAS */}
        {/* ========================================== */}
        {activeTab === 'closing' && (
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-stone-900">
                  Cierre de Ventas Diario — "El Punto del Sabor"
                </h2>
                <p className="text-xs text-stone-500">
                  Detalle de todos los productos vendidos, montos percibidos y referencias de Pago Móvil.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={closingDate}
                  onChange={e => setClosingDate(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                />
                <button
                  type="button"
                  onClick={() =>
                    exportToExcelCSV(
                      `Cierre_Ventas_${closingDate}.csv`,
                      [
                        'Factura',
                        'Fecha',
                        'Cliente',
                        'Direccion',
                        'Condicion',
                        'Metodo Pago',
                        'Referencia',
                        'Total USD',
                        'Total Bs'
                      ],
                      dailyClosingSales.map(s => [
                        s.invoiceNumber,
                        s.date,
                        s.customerName,
                        s.deliveryAddress,
                        s.paymentCondition,
                        s.paymentMethod,
                        s.paymentDetails?.reference || '',
                        s.total.toFixed(2),
                        (s.total * exchangeRate).toFixed(2)
                      ])
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Exportar Excel (CSV)
                </button>
                <button
                  type="button"
                  onClick={handleDownloadDailyClosingPDF}
                  className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-extrabold flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" /> Descargar / Imprimir Cierre en PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-stone-200 space-y-3">
                <h3 className="font-black text-sm text-stone-900">
                  🌭 Unidades Vendidas por Producto ({closingDate})
                </h3>
                {Object.keys(dailyProductSummary).length === 0 ? (
                  <p className="text-xs text-stone-400 py-4">
                    No hay ventas registradas en esta fecha.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(dailyProductSummary).map(([prodName, info]) => (
                      <div
                        key={prodName}
                        className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs"
                      >
                        <div>
                          <div className="font-bold text-stone-900">{prodName}</div>
                          <div className="text-[10px] text-stone-500 uppercase">{info.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-amber-700">{info.qty} uds</div>
                          <div className="text-[11px] font-bold text-stone-800">
                            ${info.totalUSD.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-stone-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-black text-sm text-stone-900">
                    🧾 Facturas y Referencias de Pago ({dailyClosingSales.length} órdenes en fecha / {sales.length} totales)
                  </h3>
                  {sales.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        requestAuthorizedDelete(
                          'Borrar Todo el Historial de Ventas / Facturas de Prueba',
                          'Se eliminarán todas las facturas y ventas de prueba acumuladas para dejar la facturación en cero.',
                          () => {
                            setSales([]);
                            showNotification('Historial de ventas y facturas eliminado por completo.');
                          }
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Borrar Todo el Historial de Ventas
                    </button>
                  )}
                </div>
                <div className="space-y-2.5">
                  {dailyClosingSales.map(s => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-black text-stone-900">
                          {s.invoiceNumber} — {s.customerName}
                        </div>
                        <div className="text-[11px] text-stone-600">📍 {s.deliveryAddress}</div>
                        <div className="text-[11px] text-stone-500">
                          💳 <strong>{s.paymentMethod}</strong> | Ref:{' '}
                          <strong>{s.paymentDetails?.reference}</strong> | Receptor:{' '}
                          <strong>{s.receivingAccountName || 'N/A'}</strong> | Emisor:{' '}
                          <strong>{s.paymentDetails?.senderName || s.paymentDetails?.sender}</strong>{' '}
                          ({s.paymentDetails?.senderDocument || 'S/C'} •{' '}
                          {s.paymentDetails?.senderBank || ''})
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-black text-sm text-stone-900">
                            ${s.total.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            Bs. {(s.total * exchangeRate).toFixed(2)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLastInvoiceModal(s)}
                          className="p-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800"
                          title="Ver Factura"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            requestAuthorizedDelete(
                              `Eliminar Factura ${s.invoiceNumber}`,
                              `¿Confirmas eliminar la factura ${s.invoiceNumber} de ${s.customerName} por $${s.total.toFixed(2)}?`,
                              () => {
                                setSales(prev => prev.filter(item => item.id !== s.id));
                                showNotification(`Factura ${s.invoiceNumber} eliminada.`);
                              }
                            )
                          }
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600"
                          title="Eliminar factura (Requiere Clave Especial)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MÓDULO 6: KPIS, RENTABILIDAD Y ALARMAS INTELIGENTES */}
        {/* ========================================== */}
        {activeTab === 'kpis' && (
          <div className="space-y-6">
            {/* Tarjetas de KPIs Financieros con Porcentajes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
                <span className="text-xs font-bold text-stone-500">Ingresos Brutos por Ventas</span>
                <div className="text-2xl font-black text-stone-900 mt-1">
                  ${kpiMetrics.totalSalesRevenue.toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-1">
                  Cobrado: ${kpiMetrics.cashCollected.toFixed(2)} | Crédito: $
                  {kpiMetrics.pendingCredit.toFixed(2)}
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
                <span className="text-xs font-bold text-stone-500">
                  Rentabilidad Sobre Receta (Margen Bruto)
                </span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {kpiMetrics.grossMarginPct.toFixed(1)}%
                </div>
                <div className="text-[11px] text-stone-600 font-bold mt-1">
                  Ganancia en Comida: ${kpiMetrics.grossProfit.toFixed(2)}
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
                <span className="text-xs font-bold text-stone-500">
                  Compras de Insumos vs Ingresos
                </span>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  ${kpiMetrics.totalInsumosExpenses.toFixed(2)}
                </div>
                <div className="text-[11px] text-stone-600 font-bold mt-1">
                  Flujo Neto Operativo: ${kpiMetrics.netOperatingBalance.toFixed(2)}
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
                <span className="text-xs font-bold text-stone-500">
                  Recuperación de Inversión Inicial (ROI)
                </span>
                <div className="text-2xl font-black text-purple-700 mt-1">
                  {kpiMetrics.roiProgressPct.toFixed(1)}%
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${kpiMetrics.roiProgressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Centro de Alarmas y Niveles de Atención (Consumo Excesivo / Reposición) */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-3">
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" /> Sistema de Alarmas de Consumo Excesivo, Reposición y Rentabilidad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {kpiMetrics.alarms.map(alm => (
                  <div
                    key={alm.id}
                    className={`p-4 rounded-2xl border text-xs ${
                      alm.severity === 'critical'
                        ? 'bg-red-50 border-red-300 text-red-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div className="font-black text-sm mb-1">{alm.title}</div>
                    <p className="text-xs opacity-90 leading-relaxed">{alm.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hoja de Ruta de las 5 Etapas del Emprendimiento */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-3">
              <h3 className="text-base font-black text-stone-900">
                📈 Plan Maestro de Crecimiento por Etapas ("El Punto del Sabor")
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {STAGES_INFO.map(st => (
                  <div
                    key={st.stage}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1"
                  >
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 font-black text-[10px]">
                      ETAPA {st.stage}
                    </span>
                    <div className="font-extrabold text-stone-900 pt-1">{st.title}</div>
                    <div className="text-[10px] text-emerald-700 font-bold">{st.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MÓDULO 7: PROBAR Y PONER EN MARCHA (RESPALDOS) */}
        {/* ========================================== */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border-2 border-amber-500 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase flex items-center w-fit gap-1">
                    <Landmark className="w-3.5 h-3.5" /> Base de Datos del Sistema
                  </span>
                  <h2 className="text-lg font-black text-stone-900 mt-2">
                    Gestiona, Restaura y Exporta toda tu Información
                  </h2>
                  <p className="text-xs text-stone-600 mt-1">
                    Exporta tablas a Excel o usa el formato JSON para crear copias de seguridad de toda la tienda.
                  </p>
                </div>
              </div>

              {/* Botones de Importación, Exportación JSON y CSV */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                  <h3 className="font-bold text-sm text-stone-900">1. Crear Copia de Respaldo</h3>
                  <button
                    type="button"
                    onClick={handleExportFullBackupJSON}
                    className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" /> Descargar Base de Datos Completa (.JSON)
                  </button>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                  <h3 className="font-bold text-sm text-amber-900">2. Restaurar Sistema desde Copia</h3>
                  <p className="text-[10px] text-amber-700">Selecciona el archivo .json que descargaste previamente para recuperar tu información.</p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFullBackupJSON}
                    className="w-full text-xs text-stone-700 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-amber-600 file:text-white file:font-bold file:cursor-pointer hover:file:bg-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200">
                <h3 className="font-bold text-sm text-stone-900 mb-3">3. Exportar Directorios a Excel (.CSV)</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      exportToExcelCSV(
                        'Productos.csv',
                        ['ID', 'Nombre', 'Categoria', 'Precio USD', 'Costo USD', 'Stock'],
                        products.map(p => [p.id, p.name, p.category, p.price, p.cost, p.stock])
                      )
                    }
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-4 h-4" /> Bajar Productos a Excel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      exportToExcelCSV(
                        'Clientes.csv',
                        ['Nombre', 'Telefono', 'Documento', 'Direccion Exacta'],
                        customers.map(c => [c.name, c.phone, c.document, c.address])
                      )
                    }
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-4 h-4" /> Bajar Clientes a Excel
                  </button>
                </div>
              </div>
            </div>

            {/* Simulador de 1 Clic */}
            <div className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-900 text-xs font-extrabold uppercase">
                    Simulador Interactivo
                  </span>
                  <h2 className="text-lg font-black text-stone-900 mt-2">
                    Prueba el sistema con 1 clic
                  </h2>
                  <p className="text-xs text-stone-600 mt-1">
                    Todos los cambios que hagas aquí quedan guardados automáticamente en el navegador.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleLoadDemoSales}
                    className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-black text-xs shadow flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> + Simular Venta Delivery Ahora (1 Clic)
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-stone-900 text-white p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-black text-amber-400">
                🚀 ¿Cómo ponerlo en marcha fuera de este chat en tu Celular y PC?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-stone-800 border border-stone-700 space-y-2">
                  <div className="font-black text-amber-400 text-sm">
                    1. Subir Gratis a StackBlitz o Vercel
                  </div>
                  <p className="text-stone-300 leading-relaxed">
                    Entra en <strong>stackblitz.com</strong>, haz clic en crear proyecto <strong>React (Vite + Tailwind)</strong> y pega el código de este archivo <code>app.jsx</code> dentro de <code>src/App.jsx</code>.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-800 border border-stone-700 space-y-2">
                  <div className="font-black text-amber-400 text-sm">
                    2. Publicar tu Enlace Propio
                  </div>
                  <p className="text-stone-300 leading-relaxed">
                    Conecta con <strong>Vercel.com</strong> o <strong>Netlify.com</strong> (gratuitos) para obtener tu propio enlace web privado (ej: <code>elpuntodelsabor.vercel.app</code>).
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-800 border border-stone-700 space-y-2">
                  <div className="font-black text-amber-400 text-sm">
                    3. Instalar como App en los Teléfonos
                  </div>
                  <p className="text-stone-300 leading-relaxed">
                    Abre tu enlace desde Chrome o Safari en los teléfonos de <strong>Michelle Sifontes</strong> y <strong>Jhonny Rivas</strong> y pulsa <em>"Agregar a la pantalla de inicio"</em>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MÓDULO 8: USUARIOS (CAMBIO DE CLAVE) Y AJUSTES */}
        {/* ========================================== */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda: Categorías y Seguridad */}
            <div className="space-y-6">
              
              {/* Edición de Categorías */}
              <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-4">
                <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-600" /> Edición de Categorías del Menú
                </h2>
                <p className="text-xs text-stone-500">Agrega o elimina las categorías (pestañas) que aparecerán en el catálogo.</p>
                
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!newCategoryName.trim()) return;
                    const newId = newCategoryName.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    setCategories(prev => [...prev, { id: newId, label: newCategoryName.trim() }]);
                    setNewCategoryName('');
                    showNotification('Categoría agregada exitosamente.');
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="Ej: 🍕 Pizzas, 🥗 Ensaladas"
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-stone-900 text-amber-400 font-extrabold text-xs transition hover:bg-stone-800"
                  >
                    + Agregar
                  </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {categories.map(c => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
                    >
                      {c.label}
                      {c.id !== 'todos' && (
                        <button
                          onClick={() => {
                            requestAuthorizedDelete(
                              `Eliminar Categoría: ${c.label}`,
                              'Los productos dentro de esta categoría no se borrarán, pero perderán su filtro. ¿Deseas continuar?',
                              () => {
                                setCategories(prev => prev.filter(cat => cat.id !== c.id));
                                showNotification('Categoría eliminada.');
                              }
                            )
                          }}
                          className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-4">
                <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-600" /> Seguridad y Cambio de Clave ({currentUser.username})
                </h2>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (
                      !passwordChangeForm.newPassword ||
                      passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword
                    ) {
                      showNotification('Las contraseñas no coinciden.', 'error');
                      return;
                    }
                    setUsers(prev =>
                      prev.map(u =>
                        u.id === currentUser.id
                          ? { ...u, password: passwordChangeForm.newPassword }
                          : u
                      )
                    );
                    setPasswordChangeForm({ newPassword: '', confirmPassword: '' });
                    showNotification(`Contraseña de ${currentUser.username} actualizada.`);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordChangeForm.newPassword}
                      onChange={e =>
                        setPasswordChangeForm({ ...passwordChangeForm, newPassword: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordChangeForm.confirmPassword}
                      onChange={e =>
                        setPasswordChangeForm({
                          ...passwordChangeForm,
                          confirmPassword: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-stone-900 text-amber-400 font-extrabold text-xs"
                  >
                    Actualizar Mi Contraseña
                  </button>
                </form>

                <div className="pt-4 mt-4 border-t border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-red-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Clave Especial para Autorizar Eliminaciones
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-lg bg-red-50 text-red-800 border border-red-200 text-[11px] font-black">
                      Actual: {securityDeletePin}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Esta clave se solicita cada vez que alguien intenta eliminar productos del menú, rutas de delivery, facturas, gastos o clientes.
                  </p>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (!newDeletePinInput.trim()) return;
                      setSecurityDeletePin(newDeletePinInput.trim());
                      setNewDeletePinInput('');
                      showNotification('Clave especial de eliminación actualizada correctamente.');
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={newDeletePinInput}
                      onChange={e => setNewDeletePinInput(e.target.value)}
                      placeholder="Nueva clave especial (Ej: 2026)"
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs"
                    >
                      Cambiar Clave
                    </button>
                  </form>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-200 space-y-3">
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-600" /> Usuarios Registrados en el Sistema ({users.length})
                  </h3>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (!newUserForm.username.trim() || !newUserForm.password.trim()) {
                        showNotification('Completa el nombre de usuario y contraseña.', 'error');
                        return;
                      }
                      const createdUser = {
                        id: `usr_${Date.now()}`,
                        username: newUserForm.username.trim(),
                        password: newUserForm.password.trim(),
                        role: newUserForm.role || 'Operador de Ventas'
                      };
                      setUsers(prev => {
                        const updated = [...prev, createdUser];
                        persistToCloud({ users: updated });
                        return updated;
                      });
                      setNewUserForm({ username: '', password: '', role: 'Operador de Ventas' });
                      showNotification(`Usuario "${createdUser.username}" guardado permanentemente.`);
                    }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                  >
                    <input
                      type="text"
                      value={newUserForm.username}
                      onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })}
                      placeholder="Nuevo Usuario"
                      className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                    />
                    <input
                      type="text"
                      value={newUserForm.password}
                      onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      placeholder="Contraseña"
                      className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl bg-stone-900 text-amber-400 font-extrabold text-xs"
                    >
                      + Agregar Usuario
                    </button>
                  </form>

                  <div className="space-y-1.5">
                    {users.map(u => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                      >
                        <div>
                          <strong className="text-stone-900">{u.username}</strong>{' '}
                          <span className="text-stone-500">({u.role})</span>
                        </div>
                        <span className="text-[11px] font-mono bg-stone-200 px-2 py-0.5 rounded text-stone-700">
                          Clave: {u.password}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Cuentas Internas y Métodos de Pago a Clientes */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-6">
              
              {/* Cuentas Propias */}
              <div>
                <h2 className="text-base font-black text-stone-900 flex items-center gap-2 mb-2">
                  <Landmark className="w-5 h-5 text-emerald-600" /> Cuentas Receptoras Internas
                </h2>
                <p className="text-[10px] text-stone-500 mb-3">
                  Registra aquí las cuentas propias o cajas donde tú recibes el dinero. Las seleccionarás en el POS para cuadrar tus cajas.
                </p>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!newReceivingAccountName.trim()) return;
                    setReceivingAccounts(prev => [
                      ...prev,
                      { id: `acc_${Date.now()}`, name: newReceivingAccountName.trim() }
                    ]);
                    setNewReceivingAccountName('');
                    showNotification('Cuenta receptora agregada exitosamente.');
                  }}
                  className="flex gap-2 mb-3"
                >
                  <input
                    type="text"
                    value={newReceivingAccountName}
                    onChange={e => setNewReceivingAccountName(e.target.value)}
                    placeholder="Ej: Banco Banesco Empresa, Caja Fuerte, etc."
                    className="flex-1 px-3 py-2 rounded-xl border border-emerald-300 text-xs bg-emerald-50/30 text-stone-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-stone-900 text-white font-extrabold text-xs transition hover:bg-stone-800"
                  >
                    + Añadir
                  </button>
                </form>

                <div className="space-y-2">
                  {receivingAccounts.map(acc => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-900"
                    >
                      {acc.name}
                      <button
                        onClick={() => {
                          requestAuthorizedDelete(
                            `Eliminar Cuenta: ${acc.name}`,
                            '¿Seguro que deseas eliminar esta cuenta receptora?',
                            () => {
                              setReceivingAccounts(prev => prev.filter(x => x.id !== acc.id));
                              showNotification('Cuenta eliminada.');
                            }
                          );
                        }}
                        className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Métodos de pago compartidos con el Cliente */}
              <div className="border-t border-stone-200 pt-5">
                <h2 className="text-base font-black text-stone-900 flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-amber-600" /> Métodos de Pago a Clientes
                </h2>
                <p className="text-[10px] text-stone-500 mb-3">
                  Agrega los métodos y detalles (teléfono, cédula, correo) que se enviarán a los clientes automáticamente al compartirles el menú por WhatsApp.
                </p>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!newPaymentMethodForm.name.trim()) return;
                    setPaymentMethods(prev => [
                      ...prev,
                      {
                        id: `pm_${Date.now()}`,
                        name: newPaymentMethodForm.name.trim(),
                        details: newPaymentMethodForm.details.trim(),
                        requiresReference: true
                      }
                    ]);
                    setNewPaymentMethodForm({ name: '', details: '' });
                    showNotification('Nuevo método de pago para clientes agregado.');
                  }}
                  className="space-y-3 mb-4"
                >
                  <input
                    type="text"
                    value={newPaymentMethodForm.name}
                    onChange={e => setNewPaymentMethodForm({ ...newPaymentMethodForm, name: e.target.value })}
                    placeholder="Nombre (Ej: Pago Móvil BDV)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 outline-none"
                    required
                  />
                  <input
                    type="text"
                    value={newPaymentMethodForm.details}
                    onChange={e => setNewPaymentMethodForm({ ...newPaymentMethodForm, details: e.target.value })}
                    placeholder="Detalles (Ej: 0414-000000 / V-123456 / Banco de Venezuela)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-stone-900 text-amber-400 font-extrabold text-xs transition hover:bg-stone-800"
                  >
                    + Agregar Método al Menú
                  </button>
                </form>
                
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {paymentMethods.map(pm => (
                    <div
                      key={pm.id}
                      className="px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex justify-between items-center"
                    >
                      <div>
                        <strong className="block text-stone-900 text-[11px] mb-0.5">{pm.name}</strong>
                        <span className="text-[10px] text-stone-500 font-medium">{pm.details || 'Sin datos adicionales'}</span>
                      </div>
                      <button
                        onClick={() => {
                          requestAuthorizedDelete(
                            `Eliminar Método de Pago`,
                            `¿Borrar "${pm.name}" de las opciones para clientes?`,
                            () => {
                              setPaymentMethods(prev => prev.filter(x => x.id !== pm.id));
                              showNotification('Método eliminado.');
                            }
                          );
                        }}
                        className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* ========================================== */}
      {/* MODAL PARA COMPARTIR ENLACE DIGITAL Y CARTA */}
      {/* ========================================== */}
      {showShareMenuModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-amber-500 max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    Compartir Menú Digital a Clientes
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Elige qué datos de pago enviar y comparte tu menú interactivo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareMenuModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm bg-stone-100 rounded-full w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Opciones de pago a compartir */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <label className="block font-extrabold text-stone-800">
                  💳 1. Selecciona los Datos de Pago que verán los clientes:
                </label>
                <p className="text-[10px] text-stone-500 pb-1">
                  Marca las casillas de las cuentas que quieres enviar en el mensaje de WhatsApp.
                </p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {paymentMethods.map(pm => (
                    <label key={pm.id} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-stone-100 cursor-pointer hover:bg-stone-50 transition">
                      <input
                        type="checkbox"
                        className="mt-0.5 w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-500"
                        checked={selectedPaymentsToShare.includes(pm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPaymentsToShare([...selectedPaymentsToShare, pm.id]);
                          } else {
                            setSelectedPaymentsToShare(selectedPaymentsToShare.filter(id => id !== pm.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <strong className="block text-stone-800">{pm.name}</strong>
                        <span className="text-[10px] text-stone-500">{pm.details}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <label className="block font-extrabold text-stone-800">
                  📱 2. Número de WhatsApp (Recibir Pedidos):
                </label>
                <input
                  type="text"
                  value={businessWhatsApp}
                  onChange={e => setBusinessWhatsApp(e.target.value)}
                  placeholder="Ej: 0424-9043122"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900 outline-none"
                />
              </div>

              {/* ENLACE WEB OFICIAL PARA REDES SOCIALES Y WHATSAPP */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <label className="block font-extrabold text-amber-950 text-sm">
                  🌐 3. Copiar Enlace y Datos (WhatsApp/Redes):
                </label>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Verifica que este sea tu dominio real (ej: <code>https://tu-tienda.vercel.app</code>).
                </p>
                <input
                  type="text"
                  value={customPublicUrl}
                  onChange={e => setCustomPublicUrl(e.target.value)}
                  placeholder="https://el-punto-del-sabor.vercel.app"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-400 bg-white text-xs font-bold text-stone-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = getPublicMenuShareUrl();
                    
                    const activePayments = paymentMethods
                      .filter(pm => selectedPaymentsToShare.includes(pm.id))
                      .map(pm => `• *${pm.name}*${pm.details ? ` - ${pm.details}` : ''}`)
                      .join('\n');

                    const message =
                      `🌭 *MENÚ DIGITAL DISPONIBLE - EL PUNTO DEL SABOR* 🍔\n` +
                      `¡Hola! Te compartimos nuestro menú actualizado con servicio Delivery.\n\n` +
                      `🌐 *Enlace Web del Menú:* ${shareUrl}\n\n` +
                      `💳 *Cuentas para Pagos:*\n` +
                      (activePayments || 'Consultar métodos de pago al DM') +
                      `\n\n📲 *Pedidos WhatsApp:* ${businessWhatsApp}`;

                    copyTextToClipboard(message);
                    showNotification('¡Enlace y datos de pago copiados para compartir en tus redes sociales y WhatsApp!');
                  }}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow transition"
                >
                  <Copy className="w-4 h-4" /> Copiar Mensaje Completo para WhatsApp
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadCustomerMenuPDF}
                  className="p-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-black text-xs flex items-center justify-center gap-2 shadow transition"
                >
                  <FileDown className="w-4 h-4" /> Descargar Catálogo en PDF
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCustomerMenuImagePoster}
                  className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow transition"
                >
                  <ImageIcon className="w-4 h-4" /> Descargar Carta en Imagen (.JPG)
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowShareMenuModal(false);
                  setIsCustomerPublicView(true);
                }}
                className="w-full py-3 mt-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 font-extrabold text-xs flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4 text-amber-600" /> Abrir Vista Previa del Menú Digital
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL DE REVISIÓN ANTES DE CONFIRMAR LA FACTURA */}
      {/* ========================================== */}
      {previewInvoice && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border-2 border-amber-500">
            <h3 className="font-black text-lg text-center text-stone-900 border-b border-stone-200 pb-2">
              Verificar y Aprobar Venta
            </h3>
            
            <div className="text-xs space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div className="flex justify-between">
                <span className="text-stone-500">Cliente:</span>
                <span className="font-bold text-stone-900 truncate pl-2">{previewInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Ruta Asignada:</span>
                <span className="font-bold text-stone-900 max-w-[150px] text-right truncate">
                  {previewInvoice.deliveryZoneName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Método de Pago:</span>
                <span className="font-bold text-stone-900">{previewInvoice.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Cuenta Receptora:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {previewInvoice.receivingAccountName}
                </span>
              </div>
              <div className="pt-3 mt-3 border-t border-stone-200 font-black text-base flex justify-between items-center">
                <span>Total a Cobrar:</span> 
                <span className="text-amber-600">${previewInvoice.total.toFixed(2)}</span>
              </div>
            </div>
            
            <p className="text-[10px] text-center text-stone-400">
              Verifica que los montos, cuenta y método de pago coincidan antes de descontar del inventario.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                onClick={() => setPreviewInvoice(null)}
                className="p-3 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-xs transition"
              >
                Volver a Modificar
              </button>
              <button
                type="button"
                onClick={confirmCheckout}
                className="p-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl text-xs transition shadow"
              >
                Aprobar y Emitir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL DE SEGURIDAD CON CLAVE ESPECIAL PARA ELIMINAR */}
      {/* ========================================== */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-red-500">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900">{deleteModal.title}</h3>
                <p className="text-xs text-stone-500">{deleteModal.description}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmProtectedDelete} className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <label className="block text-xs font-extrabold text-stone-800">
                  🔑 Ingresa la Clave Especial de Seguridad para Eliminar:
                </label>
                <input
                  type="password"
                  autoFocus
                  value={deletePinAttempt}
                  onChange={e => {
                    setDeletePinAttempt(e.target.value);
                    setDeletePinError('');
                  }}
                  placeholder="Ingresa la clave de seguridad (Por defecto: 2026)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-red-500 outline-none bg-white text-stone-900"
                  required
                />
                <p className="text-[10px] text-stone-500">
                  Nota: La clave inicial es <strong>2026</strong> (puedes cambiarla en la pestaña{' '}
                  <em>Usuarios y Tipos de Pago</em>).
                </p>
              </div>

              {deletePinError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {deletePinError}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow"
                >
                  Autorizar y Eliminar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteModal({ isOpen: false, title: '', description: '', onConfirm: null })
                  }
                  className="px-4 py-2.5 rounded-xl bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
