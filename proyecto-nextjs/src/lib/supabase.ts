import { createClient } from '@supabase/supabase-js';
import { Product } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('tu-proyecto')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Mock inicial idéntico al esquema de base de datos para pruebas locales o fallback
export const INITIAL_MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Camiseta Liga Deportiva Universitaria 2024",
    category: "nacional",
    categoryLabel: "Nacional",
    price: 22.00,
    emoji: "⚪",
    desc: "Edición titular con tecnología de absorción de sudor y escudo termo-sellado.",
    isCustomizable: true,
    stock: { S: 12, M: 18, L: 8, XL: 4, Niño: 6 }
  },
  {
    id: 2,
    name: "Camiseta Barcelona SC Edición Especial",
    category: "nacional",
    categoryLabel: "Nacional",
    price: 22.00,
    emoji: "🟡",
    desc: "Tejido micro-perforado para máxima ventilación deportiva en cancha sintética o césped.",
    isCustomizable: true,
    stock: { S: 8, M: 15, L: 10, XL: 2, Niño: 5 }
  },
  {
    id: 3,
    name: "Camiseta Real Madrid Titular 24/25",
    category: "internacional",
    categoryLabel: "Internacional",
    price: 25.00,
    emoji: "👑",
    desc: "Corte profesional réplica exacta, detalles dorados y tela ligera anti-desgarre.",
    isCustomizable: true,
    stock: { S: 5, M: 9, L: 7, XL: 0, Niño: 4 }
  },
  {
    id: 4,
    name: "Camiseta Inter Miami Messi #10",
    category: "internacional",
    categoryLabel: "Internacional",
    price: 25.00,
    emoji: "🦩",
    desc: "Color rosa característico con número y nombre en estampado duradero de alta definición.",
    isCustomizable: false,
    stock: { S: 14, M: 20, L: 12, XL: 6, Niño: 10 }
  },
  {
    id: 5,
    name: "Uniformes para Equipos por Sublimación Total",
    category: "sublimacion",
    categoryLabel: "Sublimación",
    price: 18.50,
    emoji: "🎨",
    desc: "Diseño 100% a medida para campeonatos barriales, colegiales o empresas. Incluye camiseta + pantaloneta.",
    isCustomizable: true,
    stock: { S: 50, M: 50, L: 50, XL: 30, Niño: 25 }
  },
  {
    id: 6,
    name: "Camiseta Deportiva Corporativa / Entrenamiento",
    category: "sublimacion",
    categoryLabel: "Sublimación",
    price: 15.00,
    emoji: "🏃",
    desc: "Prenda de alto rendimiento con secado rápido y protección solar UV.",
    isCustomizable: true,
    stock: { S: 20, M: 25, L: 15, XL: 5, Niño: 0 }
  }
];
