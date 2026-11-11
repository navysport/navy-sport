'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { INITIAL_MOCK_PRODUCTS, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ArrowLeft, Plus, Minus, Package, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_MOCK_PRODUCTS);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Cargar productos de Supabase si está disponible
  useEffect(() => {
    async function fetchProducts() {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const { data: prods, error } = await supabase
          .from('productos')
          .select(`
            id,
            nombre,
            descripcion,
            precio,
            categoria_slug,
            emoji,
            es_personalizable,
            inventario_tallas (
              id,
              talla,
              cantidad
            )
          `)
          .order('created_at', { ascending: false });

        if (!error && prods && prods.length > 0) {
          const formatted: Product[] = prods.map((p: any) => {
            const stockMap: Record<string, number> = {};
            if (p.inventario_tallas) {
              p.inventario_tallas.forEach((item: any) => {
                stockMap[item.talla] = item.cantidad;
              });
            }
            return {
              id: p.id,
              name: p.nombre,
              desc: p.descripcion || '',
              price: Number(p.precio),
              category: p.categoria_slug,
              categoryLabel: p.categoria_slug === 'nacional' ? 'Nacional' : p.categoria_slug === 'internacional' ? 'Internacional' : 'Sublimación',
              emoji: p.emoji || '👕',
              isCustomizable: p.es_personalizable,
              stock: stockMap
            };
          });
          setProducts(formatted);
        }
      } catch (e) {
        console.error("Error al cargar en admin:", e);
      }
    }

    fetchProducts();
  }, []);

  // Ajustar cantidad de stock (+1 o -1)
  const adjustStock = async (productId: string | number, size: string, delta: number) => {
    const updatingKey = `${productId}-${size}`;
    setIsUpdating(updatingKey);

    // 1. Actualización optimista local
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const currentQty = p.stock[size] || 0;
        const newQty = Math.max(0, currentQty + delta);
        return {
          ...p,
          stock: {
            ...p.stock,
            [size]: newQty
          }
        };
      }
      return p;
    }));

    // 2. Persistencia en Supabase si está conectado
    if (isSupabaseConfigured && supabase && typeof productId === 'string') {
      try {
        // Consultar stock actual en DB
        const { data: row } = await supabase
          .from('inventario_tallas')
          .select('id, cantidad')
          .eq('producto_id', productId)
          .eq('talla', size)
          .single();

        if (row) {
          const updated = Math.max(0, row.cantidad + delta);
          await supabase
            .from('inventario_tallas')
            .update({ cantidad: updated, updated_at: new Date().toISOString() })
            .eq('id', row.id);
        }
      } catch (err) {
        console.error("Error al actualizar inventario en Supabase:", err);
      }
    }

    setIsUpdating(null);
  };

  const totalStockUnits = useMemo(() => {
    return products.reduce((acc, p) => {
      return acc + Object.values(p.stock).reduce((a, b) => a + b, 0);
    }, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => {
      return Object.values(p.stock).some(qty => qty <= 2);
    }).length;
  }, [products]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            title="Volver al catálogo"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              Panel de Control de Inventario
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                isSupabaseConfigured 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {isSupabaseConfigured ? '🟢 Conectado a Supabase' : '🟡 Modo Local / Demo'}
              </span>
            </h1>
            <p className="text-xs text-slate-500">Navy Sport — Supervisión y actualización ágil para dueña/vendedora</p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow"
        >
          <span>Ir a Vista Cliente</span>
        </Link>
      </div>

      {/* MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Modelos</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black mt-1">{products.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Unidades en Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalStockUnits}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Tallas Bajas / Agotadas</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500 mt-1">{lowStockCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Canal de Ventas</span>
            <span className="text-base">📱</span>
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-2">WhatsApp Directo</p>
        </div>
      </div>

      {/* TABLA DE INVENTARIO EN VIVO */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold">Disponibilidad en Vivo por Talla</h2>
            <p className="text-xs text-slate-500">Toca (+) o (-) para modificar unidades cuando un cliente compre o ingrese mercadería.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">Prenda / Modelo</th>
                <th className="p-3.5 font-bold">Categoría</th>
                <th className="p-3.5 font-bold">Precio</th>
                <th className="p-3.5 font-bold">Stock por Talla (S / M / L / XL / Niño)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.emoji}</span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{p.name}</p>
                        <p className="text-[11px] text-slate-400">Personalizable: {p.isCustomizable ? 'Sí' : 'No'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {p.categoryLabel}
                    </span>
                  </td>

                  <td className="p-3.5 font-black text-slate-900 dark:text-slate-100">
                    ${p.price.toFixed(2)}
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Object.entries(p.stock).map(([size, qty]) => {
                        const isUpdatingThis = isUpdating === `${p.id}-${size}`;
                        return (
                          <div
                            key={size}
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${
                              qty === 0
                                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
                                : qty <= 3
                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <span className="font-bold">{size}:</span>
                            <span className="font-black min-w-[14px] text-center">{qty}</span>
                            
                            <button
                              type="button"
                              onClick={() => adjustStock(p.id, size, -1)}
                              disabled={qty <= 0 || isUpdatingThis}
                              className="w-5 h-5 rounded flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-600 font-bold disabled:opacity-30"
                              title="Reducir 1 unidad"
                            >
                              -
                            </button>

                            <button
                              type="button"
                              onClick={() => adjustStock(p.id, size, 1)}
                              disabled={isUpdatingThis}
                              className="w-5 h-5 rounded flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 font-bold"
                              title="Aumentar 1 unidad"
                            >
                              +
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
