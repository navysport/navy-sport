/**
 * NAVY SPORT - Conector Oficial de Supabase
 * Conexión en tiempo real bidireccional para tienda-cliente y panel-trabajadores
 */
const SUPABASE_CONFIG = {
  url: 'https://oyvnmhjtdskauajgmuhc.supabase.co',
  key: 'sb_publishable_ndYh7xWNW8DhVSBnJaBSzw_PoQua3UU'
};

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
    try {
      const { data, error } = await client.from('categorias').select('*').order('created_at', { ascending: true });
      if (error) {
        console.warn('[Supabase] Error cargando categorias:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('[Supabase] Error de red en getCategories:', e);
      return null;
    }
  },

  async saveCategory(cat) {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('categorias').upsert({
        slug: cat.slug || cat.id,
        nombre: cat.nombre || cat.name,
        tag: cat.tag || 'CAT',
        color: cat.color || '#16243e'
      }, { onConflict: 'slug' });
      if (error) console.error('[Supabase] Error guardando categoria:', error);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // ==========================================
  // PRODUCTOS Y STOCK
  // ==========================================
  async getProducts() {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data: prods, error: pErr } = await client.from('productos').select('*').eq('activo', true);
      if (pErr || !prods) {
        console.warn('[Supabase] Error cargando productos:', pErr?.message);
        return null;
      }

      const { data: stocks, error: sErr } = await client.from('inventario_tallas').select('*');
      if (sErr) console.warn('[Supabase] Error cargando stock:', sErr.message);

      // Mapear al formato unificado de Navy Sport
      return prods.map(p => {
        const prodStocks = (stocks || []).filter(s => s.producto_id === p.id);
        const stockMap = { "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0 };
        prodStocks.forEach(s => {
          const k = (s.talla || '').toUpperCase();
          if (stockMap.hasOwnProperty(k)) stockMap[k] = s.cantidad;
        });

        const cat = p.categoria_slug || 'nacional';
        let catLabel = 'Liga Nacional';
        if (cat === 'retro') catLabel = 'Colección Retro';
        else if (cat === 'buzos') catLabel = 'Buzos Oficiales';
        else if (cat === 'uniformes') catLabel = 'Uniformes Completos';
        else if (cat === 'liquidacion') catLabel = 'Liquidación en Stock';
        else if (cat === 'internacional') catLabel = 'Internacional';

        const priceNum = parseFloat(p.precio) || 28.00;
        const priceKitNum = parseFloat(p.precio_kit) || (priceNum + 8.00);

        return {
          id: p.id,
          name: p.nombre,
          category: cat,
          categoryLabel: catLabel,
          price: priceNum,
          priceShirt: priceNum,
          fullKitPrice: priceKitNum,
          priceKit: priceKitNum,
          fabric: p.tipo_tela || 'Microfibra Dry-Fit Pro con respiracion perimetral',
          badge: p.badge || 'OFICIAL 2026',
          imageFront: p.imagen_url || '',
          image: p.imagen_url || '',
          sleeve: (cat === 'buzos' ? 'larga' : 'corta'),
          stock: stockMap
        };
      });
    } catch (e) {
      console.warn('[Supabase] Error de conexion en getProducts:', e);
      return null;
    }
  },

  async saveProduct(prod) {
    const client = getSupabaseClient();
    if (!client || !prod) return false;

    try {
      const priceNum = parseFloat(prod.price || prod.priceShirt || 28.00);
      const priceKitNum = parseFloat(prod.fullKitPrice || prod.priceKit || (priceNum + 8.00));
      const catSlug = prod.category || 'nacional';

      // 1. Guardar producto
      const { error: pErr } = await client.from('productos').upsert({
        id: prod.id,
        nombre: prod.name,
        categoria_slug: catSlug,
        precio: priceNum,
        precio_kit: priceKitNum,
        tipo_tela: prod.fabric || 'Microfibra Dry-Fit Pro con respiracion perimetral',
        badge: prod.badge || 'OFICIAL 2026',
        imagen_url: prod.image || prod.imageFront || '',
        activo: true
      }, { onConflict: 'id' });

      if (pErr) {
        console.error('[Supabase] Error guardando producto:', pErr);
        return false;
      }

      // 2. Guardar stock de tallas
      if (prod.stock && typeof prod.stock === 'object') {
        const stockEntries = Object.entries(prod.stock).map(([talla, cantidad]) => ({
          producto_id: prod.id,
          talla: talla.toUpperCase(),
          cantidad: parseInt(cantidad, 10) || 0,
          updated_at: new Date().toISOString()
        }));
        await client.from('inventario_tallas').upsert(stockEntries, { onConflict: 'producto_id,talla' });
      }

      console.log('[Supabase] Producto sincronizado con éxito:', prod.name);
      return true;
    } catch (e) {
      console.error('[Supabase] Error en saveProduct:', e);
      return false;
    }
  },

  async syncInitialProducts(products) {
    const client = getSupabaseClient();
    if (!client || !Array.isArray(products) || products.length === 0) return;
    try {
      const { data: existing } = await client.from('productos').select('id');
      const existingIds = new Set((existing || []).map(p => p.id));
      for (const prod of products) {
        if (!existingIds.has(prod.id)) {
          await this.saveProduct(prod);
        }
      }
    } catch (e) {
      console.warn('[Supabase] syncInitialProducts error:', e);
    }
  },

  async deleteProduct(productId, productName) {
    const client = getSupabaseClient();
    if (!client || !productId) return false;

    try {
      const { error } = await client.from('productos').delete().eq('id', productId);
      if (!error) {
        this.logMovement({
          producto_id: productId,
          producto_nombre: productName || productId,
          tipo: 'eliminado',
          detalle: 'Baja definitiva de catálogo y bodega'
        });
        console.log('[Supabase] Producto eliminado de la nube:', productId);
      }
      return !error;
    } catch (e) {
      console.error('[Supabase] Error en deleteProduct:', e);
      return false;
    }
  },

  async updateStock(productId, talla, cantidad) {
    const client = getSupabaseClient();
    if (!client || !productId) return false;

    try {
      const { error } = await client.from('inventario_tallas').upsert({
        producto_id: productId,
        talla: talla.toUpperCase(),
        cantidad: parseInt(cantidad, 10) || 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'producto_id,talla' });
      return !error;
    } catch (e) {
      return false;
    }
  },

  // ==========================================
  // PEDIDOS
  // ==========================================
  async getOrders() {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data: orders, error: oErr } = await client.from('pedidos').select('*').order('created_at', { ascending: false });
      if (oErr || !orders) return null;

      const { data: items } = await client.from('pedido_items').select('*');

      return orders.map(o => ({
        id: o.id,
        client: o.cliente_nombre,
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
    } catch (e) {
      console.warn('[Supabase] Error cargando pedidos:', e);
      return null;
    }
  },

  async createOrder(order) {
    const client = getSupabaseClient();
    if (!client || !order) return false;

    try {
      const { error: oErr } = await client.from('pedidos').insert({
        id: order.id,
        cliente_nombre: order.clientName || order.client || 'Cliente Navy Sport',
        cliente_telefono: order.phone || 'WhatsApp',
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
          producto_nombre: it.productName || 'Camiseta Oficial',
          modalidad: it.mode || 'solo_camiseta',
          talla: it.size || 'M',
          cantidad: it.quantity || 1,
          precio_unitario: it.unitPrice || 28.00,
          subtotal: it.subtotal || ((it.unitPrice || 28.00) * (it.quantity || 1)),
          color_pantaloneta: it.shortsColor || 'club',
          pantaloneta_con_numero: !!it.shortsHasNumber,
          jugadores_personalizados: it.customPlayers || []
        }));
        await client.from('pedido_items').insert(itemsToInsert);
      }

      console.log('[Supabase] Pedido guardado en la nube con éxito:', order.id);
      return true;
    } catch (e) {
      console.error('[Supabase] Error en createOrder:', e);
      return false;
    }
  },

  async updateOrderStatus(orderId, status) {
    const client = getSupabaseClient();
    if (!client || !orderId) return false;
    try {
      const { error } = await client.from('pedidos').update({ estado: status }).eq('id', orderId);
      return !error;
    } catch (e) {
      return false;
    }
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
    try {
      const { data, error } = await client.from('movimientos_bodega').select('*').order('created_at', { ascending: false }).limit(30);
      if (error) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  // ==========================================
  // TIEMPO REAL (REALTIME SUBSCRIBERS)
  // ==========================================
  subscribeToProducts(callback) {
    const client = getSupabaseClient();
    if (!client || !client.channel) return null;
    try {
      const channel = client.channel('realtime:productos')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, (payload) => {
          console.log('[Supabase Realtime] Cambio en catálogo:', payload.eventType);
          if (typeof callback === 'function') callback(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inventario_tallas' }, (payload) => {
          console.log('[Supabase Realtime] Cambio en inventario:', payload.eventType);
          if (typeof callback === 'function') callback(payload);
        })
        .subscribe();
      return channel;
    } catch (e) {
      console.warn('[Supabase Realtime] Error en suscripción:', e);
      return null;
    }
  },

  subscribeToOrders(callback) {
    const client = getSupabaseClient();
    if (!client || !client.channel) return null;
    try {
      const channel = client.channel('realtime:pedidos')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (payload) => {
          console.log('[Supabase Realtime] Nuevo pedido recibido en vivo:', payload.new);
          if (typeof callback === 'function') callback(payload.new);
        })
        .subscribe();
      return channel;
    } catch (e) {
      console.warn('[Supabase Realtime] Error en suscripción pedidos:', e);
      return null;
    }
  }
};
