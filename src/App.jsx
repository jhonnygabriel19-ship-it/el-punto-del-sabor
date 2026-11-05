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
  Image as ImageIcon
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
  console.warn('Usando almacenamiento local de respaldo:', err);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

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

const INITIAL_PRODUCTS = [
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
  { id: 'pm_1', name: 'Pago Móvil', requiresReference: true },
  { id: 'pm_2', name: 'Binance (USDT)', requiresReference: true },
  { id: 'pm_3', name: 'Efectivo USD ($)', requiresReference: false },
  { id: 'pm_4', name: 'Efectivo Bolívares', requiresReference: false },
  { id: 'pm_5', name: 'Transferencia Bancaria', requiresReference: true },
  { id: 'pm_6', name: 'Zelle', requiresReference: true }
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
    consumedPercent: 85
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
    invoiceNumber: 'EPDS-CR-0001',
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

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'perros', label: '🌭 Perros Calientes' },
  { id: 'combos', label: '🥤 Combos con Refresco' },
  { id: 'hamburguesas', label: '🍔 Hamburguesas' },
  { id: 'papas', label: '🍟 Papas Fritas' },
  { id: 'especialidades', label: '🧀 Tequeños y Tenders' },
  { id: 'postres', label: '🍨 Postres y Helados' },
  { id: 'refrescos', label: '🧊 Bebidas y Refrescos' }
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
  const [currentUser, setCurrentUser] = useState(null);
  const [loginUsername, setLoginUsername] = useState('Michelle Sifontes');
  const [loginPassword, setLoginPassword] = useState('21237816');
  const [loginError, setLoginError] = useState('');

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

  // NUEVO: Filtro de facturas (contado / crédito) y modal de cobro de factura a crédito
  const [invoiceFilterType, setInvoiceFilterType] = useState('all');
  const [creditPaymentModal, setCreditPaymentModal] = useState({
    isOpen: false,
    saleId: null,
    invoiceNumber: '',
    customerName: '',
    totalUSD: 0,
    daysPending: 0,
    paymentMethod: 'Pago Móvil',
    reference: '',
    senderName: '',
    senderDocument: '',
    senderBank: '0102 - Banco de Venezuela (BDV)',
    senderPhone: '',
    notes: ''
  });

  const [products, setProducts] = useState(() => {
    const saved = loadFromStorage('epds_products_v2', INITIAL_PRODUCTS);
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
  const [deliveryZones, setDeliveryZones] = useState(() => loadFromStorage('epds_zones_v2', INITIAL_DELIVERY_ZONES));
  const [paymentMethods, setPaymentMethods] = useState(() => loadFromStorage('epds_pm_v2', INITIAL_PAYMENT_METHODS));
  const [customers, setCustomers] = useState(() => loadFromStorage('epds_customers_v2', INITIAL_CUSTOMERS));
  const [expenses, setExpenses] = useState(() => loadFromStorage('epds_expenses_v2', INITIAL_EXPENSES));
  const [sales, setSales] = useState(() => loadFromStorage('epds_sales_v2', INITIAL_SALES));

  const [supplyCatalog, setSupplyCatalog] = useState(() =>
    loadFromStorage('epds_supply_catalog_v2', INITIAL_SUPPLY_CATALOG)
  );
  const [supplierCatalog, setSupplierCatalog] = useState(() =>
    loadFromStorage('epds_supplier_catalog_v2', INITIAL_SUPPLIERS_CATALOG)
  );

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

  useEffect(() => {
    if (!db || !fbUser) return;
    const stateDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'epds_store', 'main_state');
    const unsub = onSnapshot(
      stateDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.users) && data.users.length > 0) setUsers(data.users);
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
          setDoc(
            stateDocRef,
            {
              users,
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

  useEffect(() => {
    try { localStorage.setItem('epds_users_v2', JSON.stringify(users)); } catch (e) {}
    if (cloudReady) persistToCloud({ users });
  }, [users, cloudReady]);
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
      setPaymentSenderBank('');
      setIsCustomBankEdit(false);
    } else if (!paymentSenderBank) {
      setPaymentSenderBank(VENEZUELAN_BANKS[0]);
    }
  };

  const syncBCVExchangeRate = async (silent = false) => {
    setIsSyncingBCV(true);
    try {
      let fetchedRate = null;
      try {
        const res1 = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (res1.ok) {
          const data1 = await res1.json();
          if (data1 && Number(data1.promedio) > 0) {
            fetchedRate = Number(Number(data1.promedio).toFixed(2));
          }
        }
      } catch (err1) {}
      if (!fetchedRate) {
        try {
          const res2 = await fetch('https://open.er-api.com/v6/latest/USD');
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2?.rates?.VES && Number(data2.rates.VES) > 0) {
              fetchedRate = Number(Number(data2.rates.VES).toFixed(2));
            }
          }
        } catch (err2) {}
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

  useEffect(() => {
    syncBCVExchangeRate(true);
    const interval = setInterval(() => {
      syncBCVExchangeRate(true);
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
            category: 'perros',
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

  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    document: '',
    phone: '',
    address: '',
    defaultZoneId: 'zone_1'
  });

  const [newZoneForm, setNewZoneForm] = useState({ name: '', fee: '' });

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

  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'insumo',
    category: '',
    description: '',
    amount: '',
    supplier: '',
    expectedYieldUnits: 100,
    consumedPercent: 20
  });
  const [showSupplySuggestions, setShowSupplySuggestions] = useState(false);
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);

  const matchingSupplies = useMemo(() => {
    const q = (expenseForm.category || '').trim().toLowerCase();
    if (!q) return supplyCatalog;
    return supplyCatalog.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        (item.defaultDescription || '').toLowerCase().includes(q)
    );
  }, [supplyCatalog, expenseForm.category]);

  const matchingSuppliers = useMemo(() => {
    const q = (expenseForm.supplier || '').trim().toLowerCase();
    if (!q) return supplierCatalog;
    return supplierCatalog.filter(sup => sup.toLowerCase().includes(q));
  }, [supplierCatalog, expenseForm.supplier]);

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
  const [newPaymentMethodName, setNewPaymentMethodName] = useState('');

  const handleSelectCustomerInPOS = (custId) => {
    setSelectedCustomerId(custId);
    const found = customers.find(c => c.id === custId);
    if (found) {
      setCustomDeliveryAddress(found.address);
      if (found.defaultZoneId) {
        setSelectedZoneId(found.defaultZoneId);
      }
      setPaymentSenderName(found.name || '');
      setPaymentSenderDoc(found.document || '');
      setPaymentSenderPhone(found.phone || '');
    }
  };

  // ==========================================
  // GENERADOR Y DESCARGA DIRECTA DE ARCHIVO .PDF CON MÁRGENES AJUSTADOS
  // ==========================================
  const generateAndDownloadPDF = (title, subtitle, linesArray, filename = 'Documento.pdf') => {
    try {
      const width = 794;
      const marginX = 48;
      const contentWidth = width - marginX * 2;
      const lineHeight = 24;

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

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

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
      { type: 'header', text: 'DATOS DEL PAGO Y EMISOR' },
      { text: `Condición: ${invoice.paymentCondition.toUpperCase()}   |   Método: ${invoice.paymentMethod}`, bold: true },
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

  const availableCustomerProducts = useMemo(() => {
    return products.filter(p => {
      const hasStock = Number(p.stock) > 0 && p.active !== false;
      const matchesStage = activeStageFilter === 'all' || Number(p.stage) <= Number(activeStageFilter);
      return hasStock && matchesStage;
    });
  }, [products, activeStageFilter]);

  const getPublicMenuShareUrl = () => {
    if (customPublicUrl && customPublicUrl.trim()) {
      const clean = customPublicUrl.trim().split('?')[0];
      return `${clean}?vista=menu#menu-digital`;
    }
    try {
      const origin = window.location.origin;
      const pathname = window.location.pathname || '/';
      if (
        origin &&
        origin !== 'null' &&
        !origin.includes('about:') &&
        !window.location.href.startsWith('about:')
      ) {
        return `${origin}${pathname}?vista=menu#menu-digital`;
      }
    } catch (e) {}
    return 'https://elpuntodelsabor.vercel.app/?vista=menu#menu-digital';
  };

  const handleCopyDigitalMenuLink = () => {
    const shareUrl = getPublicMenuShareUrl();
    const message =
      `🌭 *MENÚ DIGITAL DISPONIBLE - EL PUNTO DEL SABOR* 🍔\n` +
      `¡Hola! Te compartimos nuestro menú actualizado con servicio Delivery.\n\n` +
      `📋 *Nuestros Productos Disponibles hoy:*\n` +
      availableCustomerProducts
        .map(
          p =>
            `• *${p.name}*: $${Number(p.price).toFixed(2)} (Bs. ${(
              Number(p.price) * exchangeRate
            ).toFixed(2)})`
        )
        .join('\n') +
      `\n\n🛵 *Tarifas Delivery:*\n` +
      deliveryZones.map(z => `• ${z.name}: $${Number(z.fee).toFixed(2)}`).join('\n') +
      `\n\n💳 *Formas de Pago:* Pago Móvil, Binance (USDT), Efectivo y Transferencia.\n` +
      `📲 *Para ordenar responde este mensaje con:*\n1) Tu Pedido\n2) Nombre, Cédula y Teléfono\n3) Dirección exacta de envío\n4) Método de Pago y Referencia\n\n` +
      `🌐 *Enlace Web:* ${shareUrl}\n` +
      `📞 *WhatsApp Ventas:* ${businessWhatsApp}`;

    copyTextToClipboard(message);
    showNotification('¡Enlace y catálogo completo copiados para compartir en tus redes sociales y WhatsApp!');
  };

  const handleDownloadCustomerMenuPDF = () => {
    const lines = [
      { type: 'header', text: 'CARTA / MENÚ DIGITAL DISPONIBLE PARA CLIENTES' },
      {
        text: `Pedidos a Domicilio (Delivery) • WhatsApp: ${businessWhatsApp} • Tasa BCV: Bs. ${Number(
          exchangeRate
        ).toFixed(2)}/$`,
        bold: true
      },
      { type: 'divider' }
    ];

    CATEGORIES.filter(c => c.id !== 'todos').forEach(cat => {
      const catProds = availableCustomerProducts.filter(p => p.category === cat.id);
      if (catProds.length > 0) {
        lines.push({ type: 'header', text: cat.label.toUpperCase() });
        catProds.forEach(p => {
          lines.push({
            text: `• ${p.name}  —  $${Number(p.price).toFixed(2)}  (Bs. ${(
              Number(p.price) * exchangeRate
            ).toFixed(2)})`,
            bold: true
          });
          if (p.description) {
            lines.push({ text: `   ${p.description}` });
          }
        });
        lines.push({ type: 'divider' });
      }
    });

    lines.push({ type: 'header', text: 'TARIFAS DE ENVÍO DELIVERY POR RUTA' });
    deliveryZones.forEach(z => {
      lines.push({
        text: `• ${z.name}: $${Number(z.fee).toFixed(2)} (Bs. ${(
          Number(z.fee) * exchangeRate
        ).toFixed(2)})`
      });
    });
    lines.push({ type: 'divider' });
    lines.push({
      type: 'total',
      text: `PEDIDOS POR WHATSAPP: ${businessWhatsApp} • FORMAS DE PAGO: PAGO MÓVIL, BINANCE (USDT), EFECTIVO Y TRANSFERENCIA`
    });

    generateAndDownloadPDF(
      'MENÚ OFICIAL DE PRODUCTOS Y COMBOS',
      `Servicio Delivery • Pedidos al ${businessWhatsApp} • Precios en USD y Bolívares`,
      lines,
      `Menu_El_Punto_del_Sabor.pdf`
    );
  };

  const handleDownloadCustomerMenuImagePoster = () => {
    try {
      const items = availableCustomerProducts;
      const width = 900;
      const marginX = 48;
      const boxWidth = width - marginX * 2;
      const rowHeight = 90;
      const footerBoxHeight = 96;
      const height = Math.max(1080, 230 + items.length * rowHeight + footerBoxHeight + 50);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(1, '#292524');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 0, width, 155);

      ctx.fillStyle = '#1c1917';
      ctx.font = '900 38px sans-serif';
      ctx.fillText('🌭 EL PUNTO DEL SABOR', marginX, 62);

      ctx.font = 'bold 19px sans-serif';
      ctx.fillText('MENÚ DIGITAL DELIVERY • PERROS, COMBOS, BURGERS Y ESPECIALIDADES', marginX, 98);

      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(
        `📲 Pedidos WhatsApp: ${businessWhatsApp}   |   Tasa BCV: Bs. ${Number(exchangeRate).toFixed(2)}/$`,
        marginX,
        132
      );

      let y = 195;
      const textMaxW = boxWidth - 210;

      items.forEach((p, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#292524' : '#1f1c1a';
        ctx.fillRect(marginX, y - 34, boxWidth, 76);

        ctx.strokeStyle = '#44403c';
        ctx.lineWidth = 1;
        ctx.strokeRect(marginX, y - 34, boxWidth, 76);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 19px sans-serif';
        const titleLines = wrapCanvasText(ctx, p.name, textMaxW);
        ctx.fillText(titleLines[0] || '', marginX + 18, y - 8);

        ctx.fillStyle = '#d6d3d1';
        ctx.font = '13px sans-serif';
        const descLines = wrapCanvasText(ctx, p.description || '', textMaxW);
        ctx.fillText(descLines[0] || '', marginX + 18, y + 14);
        if (descLines[1]) {
          ctx.fillText(descLines[1], marginX + 18, y + 31);
        }

        const priceBoxW = 165;
        const priceBoxX = width - marginX - priceBoxW - 14;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(priceBoxX, y - 22, priceBoxW, 52);
        ctx.fillStyle = '#1c1917';
        ctx.font = '900 20px sans-serif';
        ctx.fillText(`$${Number(p.price).toFixed(2)}`, priceBoxX + 14, y + 2);
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`Bs. ${(Number(p.price) * exchangeRate).toFixed(2)}`, priceBoxX + 14, y + 22);

        y += rowHeight;
      });

      const footerY = height - footerBoxHeight - 25;
      ctx.fillStyle = '#292524';
      ctx.fillRect(marginX, footerY, boxWidth, footerBoxHeight);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(marginX, footerY, boxWidth, footerBoxHeight);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 17px sans-serif';
      const footerLine1 = `🛵 ¡SERVICIO DELIVERY RÁPIDO! • PEDIDOS AL WHATSAPP: ${businessWhatsApp}`;
      const footerLine2 = `💳 FORMAS DE PAGO: PAGO MÓVIL • BINANCE (USDT) • EFECTIVO • TRANSFERENCIA`;

      const wrappedFooter1 = wrapCanvasText(ctx, footerLine1, boxWidth - 36);
      const wrappedFooter2 = wrapCanvasText(ctx, footerLine2, boxWidth - 36);

      ctx.fillText(wrappedFooter1[0] || '', marginX + 18, footerY + 36);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(wrappedFooter2[0] || '', marginX + 18, footerY + 68);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.setAttribute('download', 'Carta_Menu_El_Punto_del_Sabor.jpg');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Carta de Menú en Imagen HD (.JPG) descargada.');
    } catch (e) {
      handleDownloadCustomerMenuPDF();
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = posCategory === 'todos' || p.category === posCategory;
      const matchesStage = activeStageFilter === 'all' || Number(p.stage) <= Number(activeStageFilter);
      const q = posSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCategory && matchesStage && matchesSearch;
    });
  }, [products, posCategory, activeStageFilter, posSearch]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.price }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          category: product.category,
          price: Number(product.price),
          cost: Number(product.cost),
          qty: 1,
          subtotal: Number(product.price)
        }
      ];
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.productId !== productId) return item;
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty, subtotal: newQty * item.price } : null;
        })
        .filter(Boolean)
    );
  };

  const selectedZone = useMemo(
    () => deliveryZones.find(z => z.id === selectedZoneId) || { name: 'Sin ruta', fee: 0 },
    [deliveryZones, selectedZoneId]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.subtotal, 0),
    [cart]
  );
  const cartTotalCost = useMemo(
    () => cart.reduce((acc, item) => acc + item.cost * item.qty, 0),
    [cart]
  );
  const cartTotalUSD = cartSubtotal + Number(selectedZone.fee || 0);
  const cartTotalBs = cartTotalUSD * Number(exchangeRate || 1);

  // ==========================================
  // NUEVO: HELPERS DE CORRELATIVO, DÍAS PENDIENTES Y COBRO DE CRÉDITO
  // ==========================================
  const getNextInvoiceNumber = (paymentCondition) => {
    if (paymentCondition === 'credito') {
      const creditNums = sales
        .filter(s => s.invoiceNumber && s.invoiceNumber.startsWith('EPDS-CR-'))
        .map(s => parseInt(s.invoiceNumber.replace('EPDS-CR-', ''), 10))
        .filter(n => !isNaN(n));
      const next = creditNums.length > 0 ? Math.max(...creditNums) + 1 : 1;
      return `EPDS-CR-${String(next).padStart(4, '0')}`;
    }
    const cashNums = sales
      .filter(s => s.invoiceNumber && s.invoiceNumber.startsWith('EPDS-') && !s.invoiceNumber.startsWith('EPDS-CR-'))
      .map(s => parseInt(s.invoiceNumber.replace('EPDS-', ''), 10))
      .filter(n => !isNaN(n));
    const next = cashNums.length > 0 ? Math.max(1000, ...cashNums) + 1 : 1001;
    return `EPDS-${next}`;
  };

  const getDaysPending = (dateStr) => {
    try {
      const saleDate = new Date(dateStr + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = Math.floor((today.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, diff);
    } catch (e) {
      return 0;
    }
  };

  const getDaysPendingBadge = (days) => {
    if (days <= 3) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (days <= 7) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (days <= 15) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const openCreditPaymentModal = (sale) => {
    setCreditPaymentModal({
      isOpen: true,
      saleId: sale.id,
      invoiceNumber: sale.invoiceNumber,
      customerName: sale.customerName,
      totalUSD: Number(sale.total || 0),
      daysPending: getDaysPending(sale.date),
      paymentMethod: 'Pago Móvil',
      reference: '',
      senderName: sale.customerName || '',
      senderDocument: sale.customerDocument || '',
      senderBank: '0102 - Banco de Venezuela (BDV)',
      senderPhone: sale.customerPhone || '',
      notes: ''
    });
  };

  const handleConfirmCreditPayment = (e) => {
    e.preventDefault();
    if (!creditPaymentModal.reference.trim()) {
      showNotification('Ingresa el número de referencia del pago.', 'error');
      return;
    }
    const paidAt = new Date().toISOString();
    setSales(prev =>
      prev.map(s =>
        s.id === creditPaymentModal.saleId
          ? {
              ...s,
              creditPaid: true,
              creditPaidDate: paidAt,
              paymentMethod: `${creditPaymentModal.paymentMethod} (Crédito Liquidado)`,
              paymentDetails: {
                ...s.paymentDetails,
                reference: creditPaymentModal.reference,
                senderName: creditPaymentModal.senderName,
                senderDocument: creditPaymentModal.senderDocument,
                senderBank: creditPaymentModal.senderBank,
                senderPhone: creditPaymentModal.senderPhone,
                paidAt,
                paidNotes: creditPaymentModal.notes || ''
              }
            }
          : s
      )
    );
    showNotification(`Factura ${creditPaymentModal.invoiceNumber} cobrada y liberada correctamente.`);
    setCreditPaymentModal(prev => ({ ...prev, isOpen: false, saleId: null }));
  };

  const handleMarkCreditPaid = (saleId, method = 'Pago Móvil', ref = 'Cobrado') => {
    const paidAt = new Date().toISOString();
    setSales(prev =>
      prev.map(s =>
        s.id === saleId
          ? {
              ...s,
              creditPaid: true,
              creditPaidDate: paidAt,
              paymentMethod: `${method} (Crédito Liquidado)`,
              paymentDetails: { ...s.paymentDetails, reference: ref, paidAt }
            }
          : s
      )
    );
    showNotification('Factura a crédito marcada como cobrada y sumada a caja.');
  };

  // Emitir Factura
  const handleCheckout = () => {
    if (cart.length === 0) {
      showNotification('Agrega al menos un producto del menú a la factura.', 'error');
      return;
    }
    if (!customDeliveryAddress.trim()) {
      showNotification('La dirección de envío es obligatoria para la factura delivery.', 'error');
      return;
    }
    if (paymentCondition === 'contado' && selectedPaymentMethod === 'Pago Móvil' && !paymentReference.trim()) {
      showNotification('Ingresa el número de referencia del Pago Móvil.', 'error');
      return;
    }

    const customerObj = customers.find(c => c.id === selectedCustomerId) || {
      id: 'cli_eventual',
      name: 'Cliente Delivery',
      phone: paymentSenderPhone || 'S/N',
      document: paymentSenderDoc || 'V-00000000'
    };

    const formattedSenderSummary = [
      paymentSenderName || customerObj.name,
      paymentSenderDoc || customerObj.document,
      paymentSenderBank
    ]
      .filter(Boolean)
      .join(' | ');

    const newInvoice = {
      id: `sale_${Date.now()}`,
      invoiceNumber: getNextInvoiceNumber(paymentCondition),
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      cashier: currentUser.username,
      customerId: customerObj.id,
      customerName: customerObj.name,
      customerPhone: customerObj.phone,
      customerDocument: customerObj.document,
      deliveryAddress: customDeliveryAddress.trim(),
      deliveryZoneName: selectedZone.name,
      deliveryFee: Number(selectedZone.fee || 0),
      items: cart,
      subtotal: cartSubtotal,
      totalCost: cartTotalCost,
      total: cartTotalUSD,
      totalBs: cartTotalBs,
      exchangeRateUsed: exchangeRate,
      paymentCondition,
      creditPaid: paymentCondition === 'contado',
      paymentMethod: paymentCondition === 'credito' ? 'Crédito Pendiente' : selectedPaymentMethod,
      paymentDetails: {
        reference: paymentCondition === 'credito' ? 'Por Cobrar (Crédito)' : (paymentReference || 'N/A'),
        senderName: paymentSenderName || customerObj.name,
        senderDocument: paymentSenderDoc || customerObj.document,
        senderBank: paymentCondition === 'credito' ? 'Pendiente' : (paymentSenderBank || 'N/A'),
        senderPhone: paymentSenderPhone || customerObj.phone,
        sender: formattedSenderSummary,
        bankOrPhone: `${paymentSenderBank || ''} (${paymentSenderPhone || customerObj.phone})`.trim()
      },
      notes: orderNotes
    };

    setProducts(prev =>
      prev.map(prod => {
        const soldItem = cart.find(i => i.productId === prod.id);
        if (!soldItem) return prod;
        return { ...prod, stock: Math.max(0, Number(prod.stock) - soldItem.qty) };
      })
    );

    setCustomers(prev =>
      prev.map(c =>
        c.id === selectedCustomerId
          ? { ...c, address: customDeliveryAddress.trim(), defaultZoneId: selectedZoneId }
          : c
      )
    );

    setSales(prev => [newInvoice, ...prev]);
    setLastInvoiceModal(newInvoice);
    setCart([]);
    setPaymentReference('');
    setOrderNotes('');
    showNotification(`Factura ${newInvoice.invoiceNumber} registrada con éxito.`);
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim() || !newCustomerForm.address.trim()) {
      showNotification('Ingresa al menos el nombre y la dirección de envío del cliente.', 'error');
      return;
    }
    const created = {
      id: `cli_${Date.now()}`,
      name: newCustomerForm.name.trim(),
      document: newCustomerForm.document.trim() || 'V-00000000',
      phone: newCustomerForm.phone.trim() || 'S/N',
      address: newCustomerForm.address.trim(),
      defaultZoneId: newCustomerForm.defaultZoneId || 'zone_1'
    };
    setCustomers(prev => [created, ...prev]);
    setSelectedCustomerId(created.id);
    setCustomDeliveryAddress(created.address);
    setSelectedZoneId(created.defaultZoneId);
    setPaymentSenderName(created.name);
    setPaymentSenderDoc(created.document);
    setPaymentSenderPhone(created.phone);
    setNewCustomerForm({
      name: '',
      document: '',
      phone: '',
      address: '',
      defaultZoneId: 'zone_1'
    });
    setShowQuickCustomerModal(false);
    showNotification(`Cliente "${created.name}" registrado y seleccionado.`);
  };

  const handleAddDeliveryZone = (e) => {
    e.preventDefault();
    if (!newZoneForm.name.trim() || newZoneForm.fee === '') {
      showNotification('Indica el nombre de la ruta y el costo de envío.', 'error');
      return;
    }
    const createdZone = {
      id: `zone_${Date.now()}`,
      name: newZoneForm.name.trim(),
      fee: Number(newZoneForm.fee)
    };
    setDeliveryZones(prev => [...prev, createdZone]);
    setSelectedZoneId(createdZone.id);
    setNewZoneForm({ name: '', fee: '' });
    showNotification(`Ruta "${createdZone.name}" ($${createdZone.fee.toFixed(2)}) registrada.`);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 500;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setProductForm(prev => ({ ...prev, image: compressedDataUrl }));
          showNotification('Fotografía cargada y optimizada correctamente.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price) {
      showNotification('Completa el nombre y el precio del producto.', 'error');
      return;
    }
    const fallbackImg =
      FALLBACK_BY_CATEGORY[productForm.category] || FALLBACK_BY_CATEGORY.perros;

    if (editingProduct) {
      setProducts(prev =>
        prev.map(p =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: productForm.name.trim(),
                category: productForm.category,
                stage: Number(productForm.stage || 1),
                price: Number(productForm.price),
                cost: Number(productForm.cost || 0),
                stock: Number(productForm.stock || 0),
                minStock: Number(productForm.minStock || 10),
                description: productForm.description.trim(),
                image: productForm.image.trim() || fallbackImg
              }
            : p
        )
      );
      showNotification(`Producto "${productForm.name}" actualizado.`);
    } else {
      const newProd = {
        id: `prod_${Date.now()}`,
        name: productForm.name.trim(),
        category: productForm.category,
        stage: Number(productForm.stage || 1),
        price: Number(productForm.price),
        cost: Number(productForm.cost || 0),
        stock: Number(productForm.stock || 0),
        minStock: Number(productForm.minStock || 10),
        active: true,
        description: productForm.description.trim() || 'Especialidad de El Punto del Sabor',
        image: productForm.image.trim() || fallbackImg
      };
      setProducts(prev => [newProd, ...prev]);
      showNotification(`Producto "${newProd.name}" agregado al menú.`);
    }

    setEditingProduct(null);
    setProductForm({
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
  };

  const handleSelectSupplyFromMemory = (item) => {
    setExpenseForm(prev => ({
      ...prev,
      category: item.name,
      type: item.type || prev.type,
      expectedYieldUnits: item.expectedYieldUnits ?? prev.expectedYieldUnits,
      description: prev.description || item.defaultDescription || ''
    }));
    setShowSupplySuggestions(false);
  };

  const handleSelectSupplierFromMemory = (supplierName) => {
    setExpenseForm(prev => ({
      ...prev,
      supplier: supplierName
    }));
    setShowSupplierSuggestions(false);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.category.trim() || !expenseForm.amount) {
      showNotification('Completa el producto/insumo y el monto de la compra.', 'error');
      return;
    }
    const cleanCategory = expenseForm.category.trim();
    const cleanSupplier = expenseForm.supplier.trim() || 'Proveedor General';
    const cleanDesc = expenseForm.description.trim() || cleanCategory;

    const exp = {
      id: `exp_${Date.now()}`,
      date: expenseForm.date,
      type: expenseForm.type,
      category: cleanCategory,
      description: cleanDesc,
      amount: Number(expenseForm.amount),
      supplier: cleanSupplier,
      expectedYieldUnits: Number(expenseForm.expectedYieldUnits || 0),
      consumedPercent: Number(expenseForm.consumedPercent || 0)
    };

    setSupplyCatalog(prev => {
      const exists = prev.some(i => i.name.toLowerCase() === cleanCategory.toLowerCase());
      if (exists) return prev;
      return [
        {
          name: cleanCategory,
          type: expenseForm.type,
          expectedYieldUnits: Number(expenseForm.expectedYieldUnits || 100),
          defaultDescription: cleanDesc
        },
        ...prev
      ];
    });

    setSupplierCatalog(prev => {
      const exists = prev.some(s => s.toLowerCase() === cleanSupplier.toLowerCase());
      if (exists) return prev;
      return [cleanSupplier, ...prev];
    });

    setExpenses(prev => [exp, ...prev]);
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      type: 'insumo',
      category: '',
      description: '',
      amount: '',
      supplier: '',
      expectedYieldUnits: 100,
      consumedPercent: 20
    });
    showNotification(`Compra de "${cleanCategory}" en "${cleanSupplier}" guardada en memoria.`);
  };

  const kpiMetrics = useMemo(() => {
    const totalSalesRevenue = sales.reduce((acc, s) => acc + Number(s.total || 0), 0);
    const totalFoodRevenue = sales.reduce((acc, s) => acc + Number(s.subtotal || 0), 0);
    const totalDeliveryRevenue = sales.reduce((acc, s) => acc + Number(s.deliveryFee || 0), 0);
    const totalRecipeCost = sales.reduce((acc, s) => acc + Number(s.totalCost || 0), 0);

    const cashCollected = sales
      .filter(s => s.paymentCondition === 'contado' || s.creditPaid)
      .reduce((acc, s) => acc + Number(s.total || 0), 0);

    const pendingCredit = sales
      .filter(s => s.paymentCondition === 'credito' && !s.creditPaid)
      .reduce((acc, s) => acc + Number(s.total || 0), 0);

    const totalInsumosExpenses = expenses
      .filter(e => e.type === 'insumo' || e.type === 'operativo')
      .reduce((acc, e) => acc + Number(e.amount || 0), 0);

    const totalInitialInvestment = expenses
      .filter(e => e.type === 'inversion')
      .reduce((acc, e) => acc + Number(e.amount || 0), 0);

    const grossProfit = totalFoodRevenue - totalRecipeCost;
    const grossMarginPct = totalFoodRevenue > 0 ? (grossProfit / totalFoodRevenue) * 100 : 0;
    const netOperatingBalance = totalSalesRevenue - totalInsumosExpenses;
    const roiProgressPct =
      totalInitialInvestment > 0 ? Math.min(100, Math.max(0, (grossProfit / totalInitialInvestment) * 100)) : 100;

    const totalUnitsSold = sales.reduce(
      (acc, s) => acc + s.items.reduce((sum, i) => sum + Number(i.qty || 0), 0),
      0
    );

    const alarms = [];

    products.forEach(p => {
      if (Number(p.stock) <= Number(p.minStock)) {
        alarms.push({
          id: `alm_stock_${p.id}`,
          severity: Number(p.stock) <= 5 ? 'critical' : 'warning',
          title: `Reposición de Stock: ${p.name}`,
          detail: `Quedan ${p.stock} unidades disponibles (Mínimo recomendado: ${p.minStock}).`
        });
      }
    });

    expenses
      .filter(e => e.type === 'insumo' && Number(e.expectedYieldUnits) > 0)
      .forEach(e => {
        const expectedSoldRatio = (totalUnitsSold / Number(e.expectedYieldUnits)) * 100;
        if (Number(e.consumedPercent) > expectedSoldRatio + 25) {
          alarms.push({
            id: `alm_yield_${e.id}`,
            severity: 'critical',
            title: `Consumo Excesivo de Insumo: ${e.category}`,
            detail: `Se ha consumido el ${e.consumedPercent}% del lote (${e.description}), pero el volumen de ventas actual (${totalUnitsSold} uds vendidas) solo justifica un ~${Math.round(expectedSoldRatio)}% de uso. Revisar porciones o merma.`
          });
        }
      });

    products.forEach(p => {
      const margin = ((p.price - p.cost) / p.price) * 100;
      if (margin < 45) {
        alarms.push({
          id: `alm_margin_${p.id}`,
          severity: 'warning',
          title: `Rentabilidad Baja en Receta: ${p.name}`,
          detail: `Su margen bruto actual es ${margin.toFixed(1)}%. Se recomienda mantener al menos 50% en comida rápida.`
        });
      }
    });

    if (pendingCredit > 0) {
      alarms.push({
        id: 'alm_credit_pending',
        severity: 'warning',
        title: `Cuentas por Cobrar (Ventas a Crédito)`,
        detail: `Tienes $${pendingCredit.toFixed(2)} pendientes por cobrar de facturas a crédito.`
      });
    }

    return {
      totalSalesRevenue,
      totalFoodRevenue,
      totalDeliveryRevenue,
      totalRecipeCost,
      cashCollected,
      pendingCredit,
      totalInsumosExpenses,
      totalInitialInvestment,
      grossProfit,
      grossMarginPct,
      netOperatingBalance,
      roiProgressPct,
      totalUnitsSold,
      alarms
    };
  }, [sales, expenses, products]);

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

  const copyTextToClipboard = (text) => {
    try {
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
      showNotification('Texto copiado al portapapeles listo para pegar en WhatsApp.');
    } catch (err) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        setCopiedWhatsApp(true);
        setTimeout(() => setCopiedWhatsApp(false), 3000);
        showNotification('Copiado al portapapeles.');
      }
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
      invoiceNumber: getNextInvoiceNumber('contado'),
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
              {currentUser && (
                <button
                  type="button"
                  onClick={() => setIsCustomerPublicView(false)}
                  className="px-3 py-2 rounded-xl bg-white/90 hover:bg-white text-stone-900 text-xs font-black shadow"
                >
                  ← Volver al Panel Administrativo
                </button>
              )}
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
                {CATEGORIES.map(cat => (
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
                      setLoginPassword('');
                      setLoginError('');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      loginUsername === u.username
                        ? 'border-amber-500 bg-amber-50 text-stone-900 font-bold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{u.username}</div>
                    <div className="text-[10px] text-stone-500">{u.role}</div>
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

          <div className="flex flex-wrap items-center gap-2">
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

            <button
              onClick={() => setShowShareMenuModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-1.5 shadow transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Menú Clientes (Descargar / Enlace)</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Probar / Usar Fuera del Chat</span>
            </button>

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

      <main className="max-w-7xl w-full mx-auto px-4 py-5 flex-1">
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:h-[calc(100vh-140px)] lg:overflow-hidden">
            <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto lg:pr-2 space-y-4 scrollbar-thin">
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

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {CATEGORIES.map(cat => (
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

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      🛵 Ruta de Domicilio / Tarifa de Envío:
                    </label>
                    <select
                      value={selectedZoneId}
                      onChange={e => setSelectedZoneId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900"
                    >
                      {deliveryZones.map(z => (
                        <option key={z.id} value={z.id}>
                          {z.name} — ${Number(z.fee).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

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
                    placeholder="Nota de cocina o entrega (Ej: Sin cebolla, llamar afuera)..."
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                  />
                </div>

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
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Emitir Factura y Registrar Venta
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                      {CATEGORIES.filter(c => c.id !== 'todos').map(c => (
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
                            category: 'perros',
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

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                      .map(s => {
                        const daysPending = getDaysPending(s.date);
                        return (
                          <div
                            key={s.id}
                            className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300 flex flex-wrap items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex-1 min-w-[200px]">
                              <div className="font-black text-stone-900 flex flex-wrap items-center gap-1.5">
                                <span>{s.invoiceNumber} — {s.customerName} ({s.customerPhone})</span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${getDaysPendingBadge(daysPending)}`}>
                                  ⏱ {daysPending} {daysPending === 1 ? 'día pendiente' : 'días pendientes'}
                                </span>
                              </div>
                              <div className="text-stone-600 text-[11px]">{s.deliveryAddress}</div>
                              <div className="text-[11px] text-amber-900 font-bold mt-1">
                                Fecha: {s.date} | Monto Pendiente: ${s.total.toFixed(2)} (Bs.{' '}
                                {(s.total * exchangeRate).toFixed(2)})
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => openCreditPaymentModal(s)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow flex items-center gap-1"
                            >
                              <DollarSign className="w-3.5 h-3.5" /> Registrar Cobro
                            </button>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>

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

                {/* FILTRO DE FACTURAS: CONTADO / CRÉDITO */}
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-stone-200">
                  <span className="text-[11px] font-bold text-stone-500 mr-1">Filtrar por tipo:</span>
                  <button
                    type="button"
                    onClick={() => setInvoiceFilterType('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                      invoiceFilterType === 'all'
                        ? 'bg-stone-900 text-amber-400 border-stone-900'
                        : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    Todas ({dailyClosingSales.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoiceFilterType('contado')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                      invoiceFilterType === 'contado'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    💵 Contado ({dailyClosingSales.filter(s => s.paymentCondition === 'contado').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoiceFilterType('credito')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                      invoiceFilterType === 'credito'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    📝 Crédito ({dailyClosingSales.filter(s => s.paymentCondition === 'credito').length})
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(() => {
                    const filteredClosingSales = dailyClosingSales.filter(s => {
                      if (invoiceFilterType === 'all') return true;
                      return s.paymentCondition === invoiceFilterType;
                    });

                    if (filteredClosingSales.length === 0) {
                      return (
                        <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl">
                          No hay facturas {invoiceFilterType === 'all' ? '' : invoiceFilterType === 'contado' ? 'de contado' : 'a crédito'} en esta fecha.
                        </div>
                      );
                    }

                    return filteredClosingSales.map(s => {
                      const isCredit = s.paymentCondition === 'credito';
                      const isPaid = s.creditPaid;
                      const daysPending = isCredit && !isPaid ? getDaysPending(s.date) : 0;
                      return (
                        <div
                          key={s.id}
                          className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
                            isCredit && !isPaid ? 'bg-amber-50 border-amber-300' : 'bg-stone-50 border-stone-200'
                          }`}
                        >
                          <div className="space-y-0.5 flex-1 min-w-[200px]">
                            <div className="font-black text-stone-900 flex flex-wrap items-center gap-1.5">
                              <span>{s.invoiceNumber} — {s.customerName}</span>
                              {isCredit && !isPaid && (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${getDaysPendingBadge(daysPending)}`}>
                                  ⏱ {daysPending} {daysPending === 1 ? 'día pendiente' : 'días pendientes'}
                                </span>
                              )}
                              {isCredit && isPaid && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  ✅ Pagada
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-600">📍 {s.deliveryAddress}</div>
                            <div className="text-[11px] text-stone-500">
                              💳 <strong>{s.paymentMethod}</strong> | Ref:{' '}
                              <strong>{s.paymentDetails?.reference}</strong> | Emisor:{' '}
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
                            {isCredit && !isPaid && (
                              <button
                                type="button"
                                onClick={() => openCreditPaymentModal(s)}
                                className="px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow flex items-center gap-1"
                                title="Cobrar y liberar factura a crédito"
                              >
                                <DollarSign className="w-3.5 h-3.5" /> Cobrar
                              </button>
                            )}
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
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kpis' && (
          <div className="space-y-6">
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

        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border-2 border-amber-500 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase">
                    Simulador Interactivo en Vivo
                  </span>
                  <h2 className="text-lg font-black text-stone-900 mt-2">
                    Prueba el sistema con 1 clic o descarga tu respaldo de base de datos
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
                  <button
                    type="button"
                    onClick={handleExportFullBackupJSON}
                    className="px-4 py-3 rounded-2xl bg-stone-900 text-amber-400 font-bold text-xs flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Descargar Base de Datos (.JSON)
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

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-4">
              <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" /> Métodos de Pago Aceptados
              </h2>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!newPaymentMethodName.trim()) return;
                  setPaymentMethods(prev => [
                    ...prev,
                    {
                      id: `pm_${Date.now()}`,
                      name: newPaymentMethodName.trim(),
                      requiresReference: true
                    }
                  ]);
                  setNewPaymentMethodName('');
                  showNotification('Nuevo método de pago agregado.');
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={newPaymentMethodName}
                  onChange={e => setNewPaymentMethodName(e.target.value)}
                  placeholder="Ej: Zinli, PayPal, Punto de Venta..."
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-900 text-amber-400 font-extrabold text-xs"
                >
                  + Agregar
                </button>
              </form>
              <div className="space-y-2">
                {paymentMethods.map(pm => (
                  <div
                    key={pm.id}
                    className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800"
                  >
                    {pm.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {showShareMenuModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-amber-500">
            <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    Menú Digital para Clientes — "El Punto del Sabor"
                  </h3>
                  <p className="text-xs text-stone-500">
                    Comparte tu enlace web en redes sociales y WhatsApp para recibir pedidos directamente.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareMenuModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <label className="block font-extrabold text-stone-800">
                  📱 Número de WhatsApp Oficial de Ventas:
                </label>
                <input
                  type="text"
                  value={businessWhatsApp}
                  onChange={e => setBusinessWhatsApp(e.target.value)}
                  placeholder="Ej: 0424-9043122"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <label className="block font-extrabold text-amber-950">
                  🌐 Enlace Web (URL) para Redes Sociales y WhatsApp:
                </label>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Pega aquí el enlace definitivo que te dé Vercel (ej: <code>https://el-punto-del-sabor.vercel.app</code>) para que el botón de compartir genere el enlace exacto que abrirán tus clientes.
                </p>
                <input
                  type="text"
                  value={customPublicUrl}
                  onChange={e => setCustomPublicUrl(e.target.value)}
                  placeholder="https://el-punto-del-sabor.vercel.app"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-400 bg-white text-xs font-bold text-stone-900"
                />
                <button
                  type="button"
                  onClick={handleCopyDigitalMenuLink}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow"
                >
                  <Copy className="w-4 h-4" /> Copiar Enlace y Catálogo para Redes / WhatsApp
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadCustomerMenuPDF}
                  className="p-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-black text-xs flex items-center justify-center gap-2 shadow"
                >
                  <FileDown className="w-4 h-4" /> Descargar Menú en PDF
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCustomerMenuImagePoster}
                  className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow"
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
                className="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 font-extrabold text-xs flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4 text-amber-600" /> Abrir Vista Previa del Menú Digital
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* NUEVO MODAL: COBRO DE FACTURA A CRÉDITO */}
      {creditPaymentModal.isOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-amber-500 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    Cobrar Factura a Crédito
                  </h3>
                  <p className="text-xs text-stone-500">
                    {creditPaymentModal.invoiceNumber} — {creditPaymentModal.customerName}
                  </p>
                  <p className="text-[11px] font-bold text-amber-700 mt-0.5">
                    ⏱ {creditPaymentModal.daysPending} {creditPaymentModal.daysPending === 1 ? 'día pendiente' : 'días pendientes'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreditPaymentModal(prev => ({ ...prev, isOpen: false }))}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-900">Monto a cobrar:</span>
                <span className="font-black text-xl text-amber-900">
                  ${creditPaymentModal.totalUSD.toFixed(2)}
                </span>
              </div>
              <div className="text-right text-[11px] text-amber-700 font-bold">
                Bs. {(creditPaymentModal.totalUSD * exchangeRate).toFixed(2)}
              </div>
            </div>

            <form onSubmit={handleConfirmCreditPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Método de Pago Recibido:
                </label>
                <select
                  value={creditPaymentModal.paymentMethod}
                  onChange={e => {
                    const m = e.target.value;
                    const isBinOrCash =
                      m.toLowerCase().includes('binance') ||
                      m.toLowerCase().includes('efectivo') ||
                      m.toLowerCase().includes('zelle');
                    setCreditPaymentModal(prev => ({
                      ...prev,
                      paymentMethod: m,
                      senderBank: isBinOrCash ? '' : '0102 - Banco de Venezuela (BDV)'
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900"
                >
                  {paymentMethods.map(pm => (
                    <option key={pm.id} value={pm.name}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  🔢 N° de Referencia / ID de Operación *
                </label>
                <input
                  type="text"
                  value={creditPaymentModal.reference}
                  onChange={e =>
                    setCreditPaymentModal(prev => ({ ...prev, reference: e.target.value }))
                  }
                  placeholder="Ej: 849201"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                    👤 Nombre del Emisor:
                  </label>
                  <input
                    type="text"
                    value={creditPaymentModal.senderName}
                    onChange={e =>
                      setCreditPaymentModal(prev => ({ ...prev, senderName: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                    🪪 Cédula / RIF Emisor:
                  </label>
                  <input
                    type="text"
                    value={creditPaymentModal.senderDocument}
                    onChange={e =>
                      setCreditPaymentModal(prev => ({ ...prev, senderDocument: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                  🏦 Banco / Usuario Emisor:
                </label>
                {creditPaymentModal.paymentMethod.toLowerCase().includes('binance') ? (
                  <input
                    type="text"
                    value={creditPaymentModal.senderBank}
                    onChange={e =>
                      setCreditPaymentModal(prev => ({ ...prev, senderBank: e.target.value }))
                    }
                    placeholder="Usuario / correo / ID Binance"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-400 text-xs font-bold bg-white text-stone-900"
                  />
                ) : creditPaymentModal.paymentMethod.toLowerCase().includes('efectivo') ? (
                  <input
                    type="text"
                    value={creditPaymentModal.senderBank}
                    onChange={e =>
                      setCreditPaymentModal(prev => ({ ...prev, senderBank: e.target.value }))
                    }
                    placeholder="Detalle del efectivo recibido (opcional)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                  />
                ) : (
                  <select
                    value={creditPaymentModal.senderBank}
                    onChange={e =>
                      setCreditPaymentModal(prev => ({ ...prev, senderBank: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold bg-white text-stone-900"
                  >
                    <option value="">-- Seleccionar banco --</option>
                    {VENEZUELAN_BANKS.map(b => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                  📱 Teléfono Emisor:
                </label>
                <input
                  type="text"
                  value={creditPaymentModal.senderPhone}
                  onChange={e =>
                    setCreditPaymentModal(prev => ({ ...prev, senderPhone: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                  📝 Nota (Opcional):
                </label>
                <input
                  type="text"
                  value={creditPaymentModal.notes}
                  onChange={e =>
                    setCreditPaymentModal(prev => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Ej: Pago recibido con retraso, abono parcial..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirmar Pago y Liberar Factura
                </button>
                <button
                  type="button"
                  onClick={() => setCreditPaymentModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuickCustomerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-stone-900">
              Registrar Nuevo Cliente Delivery
            </h3>
            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <input
                type="text"
                placeholder="Nombre y Apellido *"
                value={newCustomerForm.name}
                onChange={e => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Cédula / RIF"
                  value={newCustomerForm.document}
                  onChange={e =>
                    setNewCustomerForm({ ...newCustomerForm, document: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                />
                <input
                  type="text"
                  placeholder="Teléfono WhatsApp *"
                  value={newCustomerForm.phone}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Dirección exacta de envío (Urbanización, calle, casa, referencia) *"
                value={newCustomerForm.address}
                onChange={e => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900"
                required
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs"
                >
                  Guardar Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuickCustomerModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  Cerrar
                </button>
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
              <p className="text-xs font-bold text-stone-500">
                Factura Delivery: {lastInvoiceModal.invoiceNumber} • Tel: {businessWhatsApp}
              </p>
              <p className="text-[11px] text-stone-400">
                Fecha: {lastInvoiceModal.date} | Cajero: {lastInvoiceModal.cashier}
              </p>
            </div>

            <div className="text-xs space-y-1 bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <div>
                <strong>Cliente:</strong> {lastInvoiceModal.customerName} (
                {lastInvoiceModal.customerPhone})
              </div>
              <div>
                <strong>📍 Dirección de Envío:</strong> {lastInvoiceModal.deliveryAddress}
              </div>
              <div>
                <strong>🛵 Ruta:</strong> {lastInvoiceModal.deliveryZoneName} ($
                {Number(lastInvoiceModal.deliveryFee).toFixed(2)})
              </div>
              <div>
                <strong>💳 Pago:</strong> {lastInvoiceModal.paymentMethod} (
                {lastInvoiceModal.paymentCondition.toUpperCase()})
              </div>
              <div>
                <strong>🔢 N° Referencia:</strong> {lastInvoiceModal.paymentDetails?.reference}
              </div>
              <div>
                <strong>👤 Nombre Emisor:</strong>{' '}
                {lastInvoiceModal.paymentDetails?.senderName ||
                  lastInvoiceModal.paymentDetails?.sender}
              </div>
              <div>
                <strong>🪪 Cédula Emisor:</strong>{' '}
                {lastInvoiceModal.paymentDetails?.senderDocument || 'N/A'} |{' '}
                <strong>🏦 Banco:</strong> {lastInvoiceModal.paymentDetails?.senderBank || 'N/A'}
              </div>
            </div>

            <div className="space-y-1.5 text-xs border-b border-dashed border-stone-300 pb-3">
              {lastInvoiceModal.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {item.qty}x {item.name}
                  </span>
                  <span className="font-bold">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-stone-500 pt-1">
                <span>Servicio Delivery:</span>
                <span>${Number(lastInvoiceModal.deliveryFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-stone-900 pt-1">
                <span>TOTAL FACTURA:</span>
                <span>
                  ${lastInvoiceModal.total.toFixed(2)} (Bs.{' '}
                  {Number(lastInvoiceModal.totalBs).toFixed(2)})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 print:hidden">
              <button
                type="button"
                onClick={() => {
                  const text = `*EL PUNTO DEL SABOR - ${lastInvoiceModal.invoiceNumber}*\nCliente: ${lastInvoiceModal.customerName} (${lastInvoiceModal.customerPhone})\n📍 Dirección: ${lastInvoiceModal.deliveryAddress}\nPedido:\n${lastInvoiceModal.items
                    .map(i => `- ${i.qty}x ${i.name} ($${i.subtotal.toFixed(2)})`)
                    .join('\n')}\n🛵 Delivery: $${lastInvoiceModal.deliveryFee.toFixed(
                    2
                  )}\n*TOTAL: $${lastInvoiceModal.total.toFixed(2)} (Bs. ${Number(
                    lastInvoiceModal.totalBs
                  ).toFixed(2)})*\nPago: ${lastInvoiceModal.paymentMethod}\nRef: ${
                    lastInvoiceModal.paymentDetails?.reference
                  }\nEmisor: ${
                    lastInvoiceModal.paymentDetails?.senderName ||
                    lastInvoiceModal.paymentDetails?.sender
                  } | C.I: ${lastInvoiceModal.paymentDetails?.senderDocument || 'S/N'} | Banco: ${
                    lastInvoiceModal.paymentDetails?.senderBank || 'S/N'
                  }`;
                  copyTextToClipboard(text);
                }}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow"
              >
                {copiedWhatsApp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedWhatsApp ? '¡Copiado al Portapapeles!' : 'Copiar para WhatsApp'}
              </button>
              <button
                type="button"
                onClick={() => handleDownloadInvoicePDF(lastInvoiceModal)}
                className="py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-extrabold text-xs flex items-center justify-center gap-1 shadow"
              >
                <Printer className="w-4 h-4" /> Descargar Factura PDF
              </button>
            </div>

            <button
              type="button"
              onClick={() => setLastInvoiceModal(null)}
              className="w-full py-2 rounded-xl bg-stone-200 text-stone-800 font-bold text-xs print:hidden"
            >
              Cerrar Factura
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
