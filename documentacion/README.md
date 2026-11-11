# Navy Sport — Catálogo & Control de Inventario (MVP)

Aplicación web ligera conectada a base de datos centralizada (Supabase) y desplegable en Vercel, diseñada para el negocio textil deportivo **Navy Sport** (Neli Caisapanta).

---

## 🚀 Tecnologías Utilizadas

* **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Lucide Icons.
* **Backend & Base de Datos:** Supabase (PostgreSQL, Row Level Security, Storage).
* **Despliegue & Hosting:** Vercel.
* **Cierre de Ventas:** Generador inteligente de pedidos formateados para **WhatsApp**.

---

## 📁 Estructura del Proyecto

```text
navy-sport/
├── supabase-schema.sql    # Script SQL listo para ejecutar en Supabase (tablas, RLS y productos iniciales)
├── src/
│   ├── app/
│   │   ├── page.tsx       # Catálogo de clientes, filtros, modal de producto y checkout a WhatsApp
│   │   ├── admin/
│   │   │   └── page.tsx   # Panel de control de stock en tiempo real (+/-) para la dueña
│   │   ├── layout.tsx     # Layout principal y metadatos
│   │   └── globals.css    # Estilos globales y Tailwind CSS
│   ├── lib/
│   │   └── supabase.ts    # Cliente Supabase con fallback local automático
│   └── types/
│       └── index.ts       # Tipos TypeScript para productos, tallas y pedidos
├── .env.local.example     # Plantilla de variables de entorno
├── package.json
└── tailwind.config.js
```

---

## ⚡ Paso 1: Configurar Supabase (2 minutos)

1. Ingresa a [https://supabase.com](https://supabase.com) y crea una cuenta o inicia sesión.
2. Crea un nuevo proyecto llamado **Navy Sport**.
3. En el menú lateral izquierdo, ve a **SQL Editor**.
4. Abre el archivo `supabase-schema.sql` de este proyecto, copia todo su contenido y pégalo en el editor SQL de Supabase.
5. Haz clic en **Run**. ¡Listo! Ya tienes creadas las tablas:
   * `categorias` (Nacionales, Internacionales, Sublimación).
   * `productos` (Modelos con precios y datos de personalización).
   * `inventario_tallas` (Stock en tiempo real por talla: S, M, L, XL, Niño).
   * `pedidos` y `pedido_items` (Registro de pedidos de clientes).

6. Ve a **Project Settings** -> **API** y copia:
   * `Project URL`
   * `anon public key`

7. En tu proyecto local, crea un archivo `.env.local` con esas credenciales:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
   NEXT_PUBLIC_WHATSAPP_NUMBER=593999999999 # Número de Navy Sport
   ```

---

## 💻 Paso 2: Ejecutar en Local

Si aún no tienes Node.js instalado en tu computadora, puedes instalarlo con Windows Terminal:
```powershell
winget install OpenJS.NodeJS.LTS
```

Luego, en la carpeta del proyecto:
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador o celular conectado a la misma red.

---

## 🌐 Paso 3: Desplegar en Vercel (1 Clic)

1. Sube tu carpeta a un repositorio en **GitHub**.
2. Entra a [https://vercel.com](https://vercel.com) y haz clic en **Add New...** -> **Project**.
3. Selecciona tu repositorio `navy-sport`.
4. En **Environment Variables**, añade las mismas variables de tu `.env.local`:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `NEXT_PUBLIC_WHATSAPP_NUMBER`
5. Haz clic en **Deploy**. En menos de 1 minuto tendrás tu enlace `https://navy-sport.vercel.app` funcionando.
