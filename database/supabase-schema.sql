-- ================================================================
-- ESQUEMA DE BASE DE DATOS COMPLETO PARA NAVY SPORT (SUPABASE)
-- ================================================================
-- Pega este script completo en: Supabase Dashboard -> SQL Editor -> New query -> RUN

-- 1. TABLA: CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    tag TEXT DEFAULT 'CAT',
    color TEXT DEFAULT '#16243e',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA: PRODUCTOS (CAMISETAS Y EQUIPACIONES)
CREATE TABLE IF NOT EXISTS public.productos (
    id TEXT PRIMARY KEY, -- ej: 'cam-01', 'cam-02' o slug
    nombre TEXT NOT NULL,
    categoria_slug TEXT REFERENCES public.categorias(slug) ON UPDATE CASCADE ON DELETE SET NULL,
    precio NUMERIC(10, 2) NOT NULL DEFAULT 25.00,
    precio_kit NUMERIC(10, 2) NOT NULL DEFAULT 33.00,
    tipo_tela TEXT DEFAULT 'Microfibra Dry-Fit Pro con respiracion perimetral',
    badge TEXT DEFAULT 'OFICIAL 2024',
    imagen_url TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: INVENTARIO POR TALLA (STOCK EN TIEMPO REAL)
CREATE TABLE IF NOT EXISTS public.inventario_tallas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id TEXT REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE CASCADE,
    talla TEXT NOT NULL, -- 'XS', 'S', 'M', 'L', 'XL'
    cantidad INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(producto_id, talla)
);

-- 4. TABLA: PEDIDOS DE CLIENTES
CREATE TABLE IF NOT EXISTS public.pedidos (
    id TEXT PRIMARY KEY, -- ej: 'ORD-1038'
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT NOT NULL,
    cliente_ciudad TEXT DEFAULT 'Loja / Ecuador',
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'listo', 'entregado', 'cancelado')),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: DETALLE DE ITEMS POR PEDIDO (CON DORSALES Y JUGADORES)
CREATE TABLE IF NOT EXISTS public.pedido_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id TEXT REFERENCES public.pedidos(id) ON UPDATE CASCADE ON DELETE CASCADE,
    producto_id TEXT REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE SET NULL,
    producto_nombre TEXT NOT NULL,
    modalidad TEXT DEFAULT 'solo_camiseta', -- 'solo_camiseta' o 'kit_completo'
    talla TEXT NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    color_pantaloneta TEXT DEFAULT 'club',
    pantaloneta_con_numero BOOLEAN DEFAULT false,
    jugadores_personalizados JSONB DEFAULT '[]'::jsonb, -- [{ nombre: "CAISAPANTA", numero: "10", talla: "M" }]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA: MOVIMIENTOS DE BODEGA / KARDEX (HISTORIAL)
CREATE TABLE IF NOT EXISTS public.movimientos_bodega (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id TEXT,
    producto_nombre TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'baja', 'edicion', 'eliminado', 'venta')),
    talla TEXT,
    cantidad INTEGER DEFAULT 0,
    detalle TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ================================================================
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_tallas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_bodega ENABLE ROW LEVEL SECURITY;

-- Lectura publica para la tienda de clientes y panel
CREATE POLICY "Permitir lectura publica categorias" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica productos" ON public.productos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica inventario" ON public.inventario_tallas FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica pedidos" ON public.pedidos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica pedido_items" ON public.pedido_items FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica movimientos" ON public.movimientos_bodega FOR SELECT USING (true);

-- Escritura y actualizacion (Permitir insercion y edicion publica para modo web/app directa)
CREATE POLICY "Permitir insercion pedidos" ON public.pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion pedidos" ON public.pedidos FOR UPDATE USING (true);
CREATE POLICY "Permitir insercion pedido_items" ON public.pedido_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir gestion inventario" ON public.inventario_tallas FOR ALL USING (true);
CREATE POLICY "Permitir gestion productos" ON public.productos FOR ALL USING (true);
CREATE POLICY "Permitir gestion categorias" ON public.categorias FOR ALL USING (true);
CREATE POLICY "Permitir gestion movimientos" ON public.movimientos_bodega FOR ALL USING (true);

-- ================================================================
-- DATOS INICIALES (CATEGORIAS BASE DE NAVY SPORT)
-- ================================================================
INSERT INTO public.categorias (slug, nombre, tag, color) VALUES
('nacional', 'Liga Nacional (Ecuador)', 'ECU', '#f59e0b'),
('internacional', 'Internacionales (Clubes & Selecciones)', 'CLUB', '#38bdf8'),
('retro', 'Coleccion Retro (Historicas)', '90s', '#c084fc')
ON CONFLICT (slug) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    tag = EXCLUDED.tag,
    color = EXCLUDED.color;

-- ================================================================
-- PRODUCTOS INICIALES DE EJEMPLO
-- ================================================================
INSERT INTO public.productos (id, nombre, categoria_slug, precio, precio_kit, tipo_tela, badge, imagen_url) VALUES
('cam-01', 'COLOMBIA 2026 VISITANTE', 'internacional', 24.00, 32.00, 'Microfibra transpirable Dry-Fit', 'OFICIAL 2024', 'camisetas/colombia.png'),
('cam-02', 'ECUADOR RETRO 2001 ELIMINATORIAS', 'retro', 35.00, 43.00, 'Poliester interlock retro pesado', 'COLECCION RETRO', 'camisetas/ecuador-retro.png'),
('cam-03', 'ESPANA LA ROJA TITULAR 2026', 'internacional', 28.00, 36.00, 'Tejido jacquard athletic pro', 'MATCH EDITION', 'camisetas/espana.png'),
('cam-04', 'ITALIA AZZURRA ELITE 2026', 'internacional', 26.00, 34.00, 'Microfibra Dry-Fit Pro con respiracion', 'EDICION ESPECIAL', 'camisetas/italia.png'),
('cam-05', 'LIGA DE QUITO LDU PRO 5 ESTRELLAS', 'nacional', 25.00, 33.00, 'Poliester interlock pesado athletic', 'OFICIAL 2024', 'camisetas/ldu.png'),
('cam-06', 'BARCELONA SC EDICION COPA 2026', 'nacional', 25.00, 33.00, 'Microfibra transpirable', 'OFICIAL 2024', 'camisetas/bsc.png')
ON CONFLICT (id) DO NOTHING;

-- Tallas para cam-01 a cam-06
INSERT INTO public.inventario_tallas (producto_id, talla, cantidad) VALUES
('cam-01', 'XS', 6), ('cam-01', 'S', 8), ('cam-01', 'M', 12), ('cam-01', 'L', 10), ('cam-01', 'XL', 4),
('cam-02', 'XS', 16), ('cam-02', 'S', 8), ('cam-02', 'M', 14), ('cam-02', 'L', 10), ('cam-02', 'XL', 4),
('cam-03', 'XS', 7), ('cam-03', 'S', 10), ('cam-03', 'M', 15), ('cam-03', 'L', 8), ('cam-03', 'XL', 5),
('cam-04', 'XS', 10), ('cam-04', 'S', 15), ('cam-04', 'M', 20), ('cam-04', 'L', 12), ('cam-04', 'XL', 8),
('cam-05', 'XS', 6), ('cam-05', 'S', 9), ('cam-05', 'M', 16), ('cam-05', 'L', 11), ('cam-05', 'XL', 5),
('cam-06', 'XS', 8), ('cam-06', 'S', 12), ('cam-06', 'M', 14), ('cam-06', 'L', 9), ('cam-06', 'XL', 4)
ON CONFLICT (producto_id, talla) DO NOTHING;
