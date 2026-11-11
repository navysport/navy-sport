/**
 * NAVY SPORT - Conector Oficial de Supabase
 * Conexión en tiempo real para tienda-cliente y panel-trabajadores
 */
const SUPABASE_CONFIG = {
  url: 'https://oyvnmhjtdskauajgmuhc.supabase.co',
  key: 'sb_publishable_ndYh7xWNW8DhVSBnJaBSzw_PoQua3UU'
};

// Inicializar cliente Supabase cuando la libreria este disponible
let _supabaseClient = null;

function getSupabaseClient() {
  if (!_supabaseClient && window.supabase && window.supabase.createClient) {
    _supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
  }
  return _supabaseClient;
}

window.NavySupabase = {
  config: SUPABASE_CONFIG,
  getClient: getSupabaseClient,

  // ==========================================
  // CATEGORIAS
  // ==========================================
  async getCategories() {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client.from('categorias').select('*').order('created_at', { ascending: true });
    if (error) {
      console.warn('[Supabase] Error cargando categorias:', error.message);
      return null;
    }
    return data;
  },

  async saveCategory(cat) {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client.from('categorias').upsert({
      slug: cat.slug || cat.id,
      nombre: cat.nombre || cat.name,
      tag: cat.tag || 'CAT',
      color: cat.color || '#16243e'
    }, { onConflict: 'slug' });
    if (error) console.error('[Supabase] Error guardando categoria:', error);
    return !error;
  },

  // ==========================================
  // PRODUCTOS Y STOCK
  // ==========================================
  async getProducts() {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data: prods, error: pErr } = await client.from('productos').select('*').eq('activo', true);
    if (pErr || !prods) {
      console.warn('[Supabase] Error cargando productos:', pErr?.message);
      return null;
    }

    const { data: stocks, error: sErr } = await client.from('inventario_tallas').select('*');
    if (sErr) console.warn('[Supabase] Error cargando stock:', sErr.message);

    // Mapear al formato que usan la tienda y el panel
    return prods.map(p => {
      const prodStocks = (stocks || []).filter(s => s.producto_id === p.id);
      const stockMap = { xs: 0, s: 0, m: 0, l: 0, xl: 0 };
      prodStocks.forEach(s => {
        const k = (s.talla || '').toLowerCase();
        if (stockMap.hasOwnProperty(k)) stockMap[k] = s.cantidad;
      });

      return {
        id: p.id,
        name: p.nombre,
        category: p.categoria_slug,
        categoryLabel: p.categoria_slug === 'nacional' ? 'Liga Nacional' : (p.categoria_slug === 'retro' ? 'Colección Retro' : 'Internacional'),
        price: parseFloat(p.precio) || 25,
        fullKitPrice: parseFloat(p.precio_kit) || 33,
        fabric: p.tipo_tela,
        badge: p.badge,
        imageFront: p.imagen_url,
        stock: stockMap
      };
    });
  },

  async saveProduct(prod) {
    const client = getSupabaseClient();
    if (!client) return false;

    // 1. Guardar producto
    const { error: pErr } = await client.from('productos').upsert({
      id: prod.id,
      nombre: prod.name,
      categoria_slug: prod.category,
      precio: prod.price,
      precio_kit: prod.fullKitPrice || (prod.price + 8),
      tipo_tela: prod.fabric || 'Microfibra Dry-Fit Pro',
      badge: prod.badge || 'OFICIAL 2024',
      imagen_url: prod.imageFront || prod.image || '',
      activo: true
    }, { onConflict: 'id' });

    if (pErr) {
      console.error('[Supabase] Error guardando producto:', pErr);
      return false;
    }

    // 2. Guardar stock de tallas
    if (prod.stock) {
      const stockEntries = Object.entries(prod.stock).map(([talla, cantidad]) => ({
        producto_id: prod.id,
        talla: talla.toUpperCase(),
        cantidad: parseInt(cantidad, 10) || 0,
        updated_at: new Date().toISOString()
      }));
      await client.from('inventario_tallas').upsert(stockEntries, { onConflict: 'producto_id,talla' });
    }

    return true;
  },

  async deleteProduct(productId, productName) {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('productos').delete().eq('id', productId);
    if (!error) {
      // Registrar movimiento
      this.logMovement({
        producto_id: productId,
        producto_nombre: productName || productId,
        tipo: 'eliminado',
        detalle: 'Baja definitiva de catálogo'
      });
    }
    return !error;
  },

  async updateStock(productId, talla, cantidad) {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('inventario_tallas').upsert({
      producto_id: productId,
      talla: talla.toUpperCase(),
      cantidad: parseInt(cantidad, 10) || 0,
      updated_at: new Date().toISOString()
    }, { onConflict: 'producto_id,talla' });

    return !error;
  },

  // ==========================================
  // PEDIDOS
  // ==========================================
  async getOrders() {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data: orders, error: oErr } = await client.from('pedidos').select('*').order('created_at', { ascending: false });
    if (oErr || !orders) return null;

    const { data: items } = await client.from('pedido_items').select('*');

    return orders.map(o => ({
      id: o.id,
      clientName: o.cliente_nombre,
      phone: o.cliente_telefono,
      city: o.cliente_ciudad,
      total: parseFloat(o.total) || 0,
      status: o.estado,
      createdAt: o.created_at,
      items: (items || []).filter(i => i.pedido_id === o.id).map(i => ({
        productId: i.producto_id,
        productName: i.producto_nombre,
        mode: i.modalidad,
        size: i.talla,
        quantity: i.cantidad,
        unitPrice: parseFloat(i.precio_unitario),
        subtotal: parseFloat(i.subtotal),
        shortsColor: i.color_pantaloneta,
        customPlayers: i.jugadores_personalizados || []
      }))
    }));
  },

  async createOrder(order) {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error: oErr } = await client.from('pedidos').insert({
      id: order.id,
      cliente_nombre: order.clientName || 'Cliente Navy Sport',
      cliente_telefono: order.phone || '',
      cliente_ciudad: order.city || 'Ecuador',
      total: order.total || 0,
      estado: order.status || 'pendiente',
      notas: order.notes || ''
    });

    if (oErr) {
      console.error('[Supabase] Error creando pedido:', oErr);
      return false;
    }

    if (Array.isArray(order.items) && order.items.length > 0) {
      const itemsToInsert = order.items.map(it => ({
        pedido_id: order.id,
        producto_id: it.productId || null,
        producto_nombre: it.productName || 'Camiseta',
        modalidad: it.mode || 'solo_camiseta',
        talla: it.size || 'M',
        cantidad: it.quantity || 1,
        precio_unitario: it.unitPrice || 25,
        subtotal: it.subtotal || (it.unitPrice * (it.quantity || 1)),
        color_pantaloneta: it.shortsColor || 'club',
        pantaloneta_con_numero: !!it.shortsHasNumber,
        jugadores_personalizados: it.customPlayers || []
      }));
      await client.from('pedido_items').insert(itemsToInsert);
    }

    return true;
  },

  async updateOrderStatus(orderId, status) {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('pedidos').update({ estado: status }).eq('id', orderId);
    return !error;
  },

  // ==========================================
  // MOVIMIENTOS DE BODEGA
  // ==========================================
  async logMovement(mov) {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('movimientos_bodega').insert({
        producto_id: mov.producto_id || mov.productId || null,
        producto_nombre: mov.producto_nombre || mov.productName || 'Producto',
        tipo: mov.tipo || mov.type || 'edicion',
        talla: mov.talla || mov.size || null,
        cantidad: mov.cantidad || mov.quantity || 0,
        detalle: mov.detalle || mov.detail || ''
      });
    } catch (e) {
      console.warn('[Supabase] logMovement error:', e);
    }
  },

  async getMovements() {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client.from('movimientos_bodega').select('*').order('created_at', { ascending: false }).limit(30);
    if (error) return null;
    return data;
  }
};
