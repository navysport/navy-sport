export type Size = 'S' | 'M' | 'L' | 'XL' | 'Niño';
export type FitType = 'slim' | 'regular' | 'oversize';

export interface ProductStock {
  [key: string]: number;
}

export interface ColorVariant {
  name: string;
  hex: string;
  bgClass: string;
  borderClass: string;
  dorsalName?: string;
  dorsalNum?: string;
}

export interface Product {
  id: string | number;
  name: string;
  slug?: string;
  category: 'nacional' | 'internacional' | 'sublimacion' | 'retro';
  categoryLabel: string;
  price: number;
  fit: FitType;
  modelStats: string;
  desc: string;
  colors: ColorVariant[];
  currentColorIndex?: number;
  stock: ProductStock;
  imageUrl?: string;
}

export interface CustomizationData {
  name?: string;
  number?: string;
  notes?: string;
}

export interface CartItem {
  id: number;
  productId: string | number;
  name: string;
  price: number;
  color: string;
  size: string;
  qty: number;
  subtotal: number;
  custom: CustomizationData;
}
