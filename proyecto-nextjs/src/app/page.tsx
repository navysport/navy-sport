'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product, CartItem } from '@/types';
import { ShoppingBag, Search, X, ArrowRight } from 'lucide-react';

const REAL_PHOTO_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Camiseta Liga de Quito Oficial 2024",
    category: "nacional",
    categoryLabel: "Nacional",
    price: 24.00,
    fit: "regular",
    modelStats: "1.82m / 78kg usa Talla L (Regular Fit)",
    desc: "Edición titular con tecnología dry-fit jacquard de alta evaporación, escudo termo-sellado con las 5 estrellas y dorsal oficial.",
    colors: [
      {
        name: "Blanco Titular",
        hex: "#f8fafc",
        bgClass: "",
        borderClass: "",
        dorsalName: "GONZÁLEZ",
        dorsalNum: "9"
      },
      {
        name: "Negro Alterna",
        hex: "#171717",
        bgClass: "",
        borderClass: "",
        dorsalName: "GONZÁLEZ",
        dorsalNum: "9"
      }
    ],
    currentColorIndex: 0,
    stock: { S: 8, M: 14, L: 9, XL: 3, Niño: 5 }
  },
  {
    id: 2,
    name: "Camiseta Barcelona SC Titular 2024",
    category: "nacional",
    categoryLabel: "Nacional",
    price: 24.00,
    fit: "slim",
    modelStats: "1.79m / 74kg usa Talla M (Slim Fit)",
    desc: "Corte entallado aerodinámico. Cuello en V reforzado y sublimación de alta resistencia con detalles en negro y rojo.",
    colors: [
      {
        name: "Amarillo Canario",
        hex: "#eab308",
        bgClass: "",
        borderClass: "",
        dorsalName: "DÍAZ",
        dorsalNum: "10"
      },
      {
        name: "Rojo Pasión",
        hex: "#b91c1c",
        bgClass: "",
        borderClass: "",
        dorsalName: "DÍAZ",
        dorsalNum: "10"
      }
    ],
    currentColorIndex: 0,
    stock: { S: 10, M: 12, L: 6, XL: 2, Niño: 4 }
  },
  {
    id: 3,
    name: "Camiseta Real Madrid Titular 24/25",
    category: "internacional",
    categoryLabel: "Internacional",
    price: 28.00,
    fit: "regular",
    modelStats: "1.84m / 80kg usa Talla L (Regular Fit)",
    desc: "Inspirada en el tejido tradicional de las fiestas de San Isidro. Escudo termosellado de alta definición.",
    colors: [
      {
        name: "Blanco Titular",
        hex: "#f8fafc",
        bgClass: "",
        borderClass: "",
        dorsalName: "VINÍCIUS JR.",
        dorsalNum: "7"
      },
      {
        name: "Naranja Alterna",
        hex: "#ea580c",
        bgClass: "",
        borderClass: "",
        dorsalName: "BELLINGHAM",
        dorsalNum: "5"
      }
    ],
    currentColorIndex: 0,
    stock: { S: 6, M: 8, L: 7, XL: 1, Niño: 3 }
  },
  {
    id: 4,
    name: "Camiseta Arsenal Highbury Retro 2006",
    category: "retro",
    categoryLabel: "Retro Classic",
    price: 29.00,
    fit: "oversize",
    modelStats: "1.80m / 76kg usa Talla M (Oversize Drop)",
    desc: "Color grosella oscuro histórico de la despedida de Highbury. Patrocinador clásico O2 y tipografía dorada en dorsal.",
    colors: [
      {
        name: "Grosella Highbury",
        hex: "#701a75",
        bgClass: "",
        borderClass: "",
        dorsalName: "HENRY",
        dorsalNum: "14"
      }
    ],
    currentColorIndex: 0,
    stock: { S: 4, M: 6, L: 5, XL: 0, Niño: 0 }
  },
  {
    id: 5,
    name: "Uniforme Sublimación Total Pro (Navy Sport)",
    category: "sublimacion",
    categoryLabel: "Sublimación",
    price: 19.50,
    fit: "regular",
    modelStats: "1.83m / 79kg usa Talla L (Regular Fit)",
    desc: "Equipación para campeonatos y clubes. Incluye camiseta + pantaloneta con diseño a medida.",
    colors: [
      {
        name: "Rojo / Negro Gradient",
        hex: "#dc2626",
        bgClass: "",
        borderClass: "",
        dorsalName: "CAPITÁN",
        dorsalNum: "10"
      }
    ],
    currentColorIndex: 0,
    stock: { S: 40, M: 50, L: 45, XL: 25, Niño: 20 }
  },
  {
    id: 6,
    name: "Camiseta Streetwear Oversize 'District'",
    category: "sublimacion",
    categoryLabel: "Streetwear",
    price: 22.00,
    fit: "oversize",
    modelStats: "1.85m / 82kg usa Talla XL (Boxy Fit)",
    desc: "Gramaje pesado de alta caída para el día a día. Silueta boxy relajada y tacto suave.",
    colors: [
      {
        name: "Negro & Rojo District",
        hex: "#991b1b",
        bgClass: "",
        borderClass: "",
        dorsalName: "NAVY",
        dorsalNum: "01"
      }
    ],
    currentColorIndex: 0,
    stock: { S: 15, M: 22, L: 18, XL: 8, Niño: 0 }
  }
];

const PHOTO_MAP: Record<number, { front: string; back: string }> = {
  1: {
    front: "https://media.marathon.store/products/he3/h0d/h00/10209317552158.jpg",
    back: "https://media.marathon.store/products/h81/hc3/h00/10404273160222.jpg"
  },
  2: {
    front: "https://media.marathon.store/products/h23/hfa/h00/10198431957022.jpg",
    back: "https://media.marathon.store/products/h4c/hfe/h00/10432079757342.jpg"
  },
  3: {
    front: "https://assets.adidas.com/images/w_600,f_auto,q_auto/78b62417f1e042aeb25e3353d278de3b_9366/IX8095_HM1.jpg",
    back: "https://assets.adidas.com/images/w_600,f_auto,q_auto/15842c1060dc4e12a9f9a272f8ac5ea0_9366/Real_Madrid_24-25_Home_Jersey_White_IU5011_HM3_hover.jpg"
  },
  4: {
    front: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=600&q=80",
    back: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80"
  },
  5: {
    front: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80",
    back: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80"
  },
  6: {
    front: "https://images.unsplash.com/photo-1614632537197-3ce0173b17c1?auto=format&fit=crop&w=600&q=80",
    back: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80"
  }
};

export default function RealPhotoCatalogCleanPage() {
  const [products, setProducts] = useState<Product[]>(REAL_PHOTO_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'nacional' | 'internacional' | 'sublimacion' | 'retro'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [modalSide, setModalSide] = useState<'front' | 'back'>('front');
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [sizeError, setSizeError] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    if (!clientName.trim() || !clientPhone.trim()) {
      alert("Por favor ingresa tu Nombre y Teléfono.");
      return;
    }

    let text = `*SOLICITUD DE PEDIDO - NAVY SPORT*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Cliente: ${clientName.trim()}\n`;
    text += `Teléfono: ${clientPhone.trim()}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `DETALLE DE PRENDAS:\n`;

    cart.forEach((item, idx) => {
      text += `\n${idx + 1}. ${item.name}\n`;
      text += `   • Color: ${item.color}\n`;
      text += `   • Talla: ${item.size} (Cant: ${item.qty})\n`;
      text += `   • Subtotal: $${item.subtotal.toFixed(2)}\n`;
      if (item.custom.name || item.custom.number) {
        text += `   • Dorsal: ${item.custom.name} (#${item.custom.number})\n`;
      }
    });

    text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `TOTAL ESTIMADO: $${cartTotal.toFixed(2)}\n\n`;
    text += `Pedido generado desde la tienda de Navy Sport.`;

    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '593999999999';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased font-sans selection:bg-red-600 selection:text-white">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-red-600 shrink-0 border border-neutral-800">
                <img src="/logo.png" alt="Navy Sport Logo" className="w-full h-full object-cover" />
              </div>
              <div className="leading-tight">
                <span className="text-xl font-black tracking-tight text-white uppercase block">
                  NAVY<span className="text-red-500">SPORT</span>
                </span>
                <span className="text-[9px] tracking-widest text-neutral-500 font-bold uppercase block">
                  ATHLETIC APPAREL
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`transition pb-1 ${selectedCategory === 'all' ? 'text-white border-b-2 border-red-500 font-bold' : 'hover:text-white'}`}
              >
                Ver Todo
              </button>
              <button
                onClick={() => setSelectedCategory('nacional')}
                className={`transition pb-1 ${selectedCategory === 'nacional' ? 'text-white border-b-2 border-red-500 font-bold' : 'hover:text-white'}`}
              >
                Liga Nacional
              </button>
              <button
                onClick={() => setSelectedCategory('internacional')}
                className={`transition pb-1 ${selectedCategory === 'internacional' ? 'text-white border-b-2 border-red-500 font-bold' : 'hover:text-white'}`}
              >
                Internacionales
              </button>
              <button
                onClick={() => setSelectedCategory('sublimacion')}
                className={`transition pb-1 ${selectedCategory === 'sublimacion' ? 'text-white border-b-2 border-red-500 font-bold' : 'hover:text-white'}`}
              >
                Sublimación Pro
              </button>
              <button
                onClick={() => setSelectedCategory('retro')}
                className={`transition pb-1 ${selectedCategory === 'retro' ? 'text-white border-b-2 border-red-500 font-bold' : 'hover:text-white'}`}
              >
                Colección Retro
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64 hidden sm:block">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar prenda..."
                className="w-full bg-neutral-900/60 border border-neutral-800 rounded-lg py-2 pl-9 pr-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
              />
            </div>

            <Link
              href="/admin"
              className="text-xs font-medium uppercase tracking-wider border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:border-neutral-700 px-3 py-2 rounded-lg transition"
            >
              Panel Stock
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden md:inline">Mi Pedido</span>
              <span className="bg-white text-neutral-950 text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                {cart.length}
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* HERO SOBRIO */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="border border-neutral-900 rounded-2xl p-8 md:p-10 bg-neutral-900/40 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-semibold text-red-500 tracking-wider uppercase">Colección Temporada 2024 / 2025</span>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
              Fotografía Real & Uniformes Oficiales
            </h2>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
              Catálogo con fotografías directas de cada camiseta. Pasa el cursor sobre la prenda para ver su dorsal en tiempo real.
            </p>
          </div>

          <div className="w-24 h-24 rounded-2xl bg-red-600 overflow-hidden shadow-xl border border-neutral-800 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="Logo Navy Sport" className="w-full h-full object-cover" />
          </div>
        </section>

        {/* LISTADO */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <h3 className="text-base font-bold uppercase tracking-tight text-white">
            Colección ({filteredProducts.length} Prendas)
          </h3>
          <span className="text-xs text-neutral-500 hidden sm:inline">
            Pasa el cursor por las camisetas para ver el dorsal
          </span>
        </div>

        {/* GRID DE FOTOS REALES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const currentColor = p.colors[p.currentColorIndex || 0];
            const photos = PHOTO_MAP[Number(p.id)] || {
              front: "https://media.marathon.store/products/he3/h0d/h00/10209317552158.jpg",
              back: "https://media.marathon.store/products/h81/hc3/h00/10404273160222.jpg"
            };

            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProduct(p);
                  setSelectedColorIdx(p.currentColorIndex || 0);
                  setSelectedSize(null);
                  setModalSide('front');
                  setCustomName('');
                  setCustomNumber('');
                  setSizeError(false);
                }}
                className="group relative bg-neutral-900/60 border border-neutral-900 rounded-xl overflow-hidden hover:border-neutral-700 transition duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="relative h-72 w-full bg-neutral-950 overflow-hidden flex items-center justify-center p-3 border-b border-neutral-900">
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
                        {p.categoryLabel}
                      </span>
                      <span className="text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-900">
                        {p.fit}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition">
                      <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                        Dorsal
                      </span>
                    </div>

                    {/* FOTO FRENTE */}
                    <div className="absolute inset-0 flex items-center justify-center p-3 transition-opacity duration-300 group-hover:opacity-0">
                      <img
                        src={photos.front}
                        alt={p.name}
                        className="w-full h-full object-contain filter drop-shadow-md"
                        loading="lazy"
                      />
                    </div>

                    {/* FOTO DORSAL (HOVER) */}
                    <div className="absolute inset-0 flex items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <img
                        src={photos.back}
                        alt={`${p.name} Dorsal`}
                        className="w-full h-full object-contain filter drop-shadow-md"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase text-white leading-snug line-clamp-1 group-hover:text-red-400 transition">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                      {currentColor.name} • {p.desc}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-neutral-900 mt-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">${p.price.toFixed(2)}</span>
                  <span className="text-[11px] font-medium text-neutral-400 group-hover:text-white flex items-center gap-1 transition">
                    <span>Personalizar</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 text-neutral-400 hover:text-white bg-neutral-950/80 border border-neutral-800 p-2 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12">
              <div className="md:col-span-6 bg-neutral-950 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-900">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
                    {selectedProduct.categoryLabel}
                  </span>
                  <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-1 text-xs">
                    <button
                      onClick={() => setModalSide('front')}
                      className={`px-3 py-1 rounded font-semibold transition ${modalSide === 'front' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                    >
                      Frente
                    </button>
                    <button
                      onClick={() => setModalSide('back')}
                      className={`px-3 py-1 rounded font-semibold transition ${modalSide === 'back' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                    >
                      Dorsal
                    </button>
                  </div>
                </div>

                <div className="my-6 flex items-center justify-center min-h-[320px]">
                  <div className="w-full max-w-[280px] h-[340px] rounded-2xl overflow-hidden relative shadow-2xl bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-center p-3">
                    <img
                      src={modalSide === 'front' 
                        ? (PHOTO_MAP[Number(selectedProduct.id)]?.front || "")
                        : (PHOTO_MAP[Number(selectedProduct.id)]?.back || "")}
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-tight text-white leading-tight">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-xl font-bold text-red-500 mt-1">${selectedProduct.price.toFixed(2)}</p>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {selectedProduct.desc}
                  </p>

                  <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-medium">Tipo de Ajuste</span>
                      <span className="font-bold text-red-500 uppercase">{selectedProduct.fit} Fit</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <div className={`h-1.5 rounded-full transition-all ${selectedProduct.fit === 'slim' ? 'bg-red-600' : 'bg-neutral-800'}`} />
                      <div className={`h-1.5 rounded-full transition-all ${selectedProduct.fit === 'regular' ? 'bg-red-600' : 'bg-neutral-800'}`} />
                      <div className={`h-1.5 rounded-full transition-all ${selectedProduct.fit === 'oversize' ? 'bg-red-600' : 'bg-neutral-800'}`} />
                    </div>

                    <div className="flex justify-between text-[10px] text-neutral-500 uppercase font-semibold">
                      <span>Slim</span>
                      <span>Regular</span>
                      <span>Oversize</span>
                    </div>

                    <div className="pt-2 border-t border-neutral-900 text-xs text-neutral-400">
                      <span>Modelo: {selectedProduct.modelStats}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-neutral-400 font-medium block">Talla Disponible</span>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.entries(selectedProduct.stock).map(([size, count]) => {
                        const isAvail = count > 0;
                        const isSel = selectedSize === size;
                        return (
                          <button
                            key={size}
                            disabled={!isAvail}
                            onClick={() => {
                              setSelectedSize(size);
                              setSizeError(false);
                            }}
                            className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                              isSel
                                ? 'border-red-600 bg-red-600/10 text-white ring-1 ring-red-500'
                                : isAvail
                                ? 'border-neutral-800 bg-neutral-950 hover:border-neutral-700 text-neutral-300'
                                : 'opacity-25 border-neutral-900 bg-neutral-950 text-neutral-600 cursor-not-allowed line-through'
                            }`}
                          >
                            <span className="text-xs font-bold uppercase">{size}</span>
                            <span className={`text-[10px] ${isAvail ? 'text-neutral-400' : 'text-neutral-600'}`}>
                              {isAvail ? `${count} disp.` : '0'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {sizeError && (
                      <p className="text-xs text-red-500 font-medium">Selecciona una talla para continuar.</p>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (!selectedSize) {
                        setSizeError(true);
                        return;
                      }
                      const activeColor = selectedProduct.colors[selectedColorIdx];
                      setCart(prev => [...prev, {
                        id: Date.now(),
                        productId: selectedProduct.id,
                        name: selectedProduct.name,
                        price: selectedProduct.price,
                        color: activeColor.name,
                        size: selectedSize,
                        qty: 1,
                        subtotal: selectedProduct.price,
                        custom: {}
                      }]);
                      setSelectedProduct(null);
                      setIsCartOpen(true);
                    }}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl text-xs transition flex items-center justify-center gap-2"
                  >
                    <span>Añadir a Cotización</span>
                    <span>•</span>
                    <span>${selectedProduct.price.toFixed(2)}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="bg-neutral-950 border-l border-neutral-900 w-full max-w-md h-full flex flex-col p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
              <div>
                <h3 className="text-base font-bold uppercase text-white tracking-tight">Tu Cotización</h3>
                <p className="text-xs text-neutral-500">Envío directo de detalles a WhatsApp</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-neutral-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 py-4 space-y-3 overflow-y-auto">
              {cart.map((item, idx) => (
                <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-white">{item.name}</p>
                    <span className="font-bold text-red-500">${item.subtotal.toFixed(2)}</span>
                  </div>
                  <p className="text-neutral-400">Talla: {item.size}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-900 pt-4 space-y-3">
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 text-[11px]">Nombre y Apellido *</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej: Nicolás Bravo"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 text-[11px]">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ej: 0991234567"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm font-bold pt-1">
                <span className="text-neutral-400">Total Estimado:</span>
                <span className="text-lg text-red-500 font-bold">${cartTotal.toFixed(2)}</span>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={handleWhatsAppCheckout}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <span>Enviar Pedido por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
