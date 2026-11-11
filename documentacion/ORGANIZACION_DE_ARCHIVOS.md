# Estructura y Organizaci&oacute;n del Proyecto NAVY SPORT

Este repositorio ha sido reorganizado para ofrecer una arquitectura limpia, profesional y f&aacute;cil de navegar tanto para desarrollo como para uso operativo en producci&oacute;n.

---

## 1. M&oacute;dulos Principales (Ra&iacute;z del Proyecto)

* **`index.html`**: Portal central de navegaci&oacute;n. Ofrece acceso r&aacute;pido con un solo clic a la Tienda de Clientes y al Panel de Taller.
* **`tienda-cliente.html`**: Tienda virtual oficial para clientes con Lookbook a pantalla completa, personalizaci&oacute;n din&aacute;mica de m&uacute;ltiples dorsales, opci&oacute;n de n&uacute;mero en pantaloneta (+ $2.00) y cotizador directo por WhatsApp.
* **`panel-trabajadores.html`**: Panel de control de operaciones para taller y bodega. Cuenta con pantallas independientes:
  - Nueva Prenda (formulario de alta de stock con drag & drop de foto).
  - Pedidos Pendientes (tarjetas con bot&oacute;n directo a WhatsApp de estampado y aviso al cliente).
  - Inventario (balance de stock por talla XS-XL con ingreso r&aacute;pido sin scroll horizontal).
  - Movimientos (historial cronol&oacute;gico en tiempo real de entradas y salidas de bodega).
* **`prototipo-interactivo.html`**: R&eacute;plica interactiva de respaldo para pruebas y presentaciones r&aacute;pidas.

---

## 2. Directorios y Carpetas Clasificadas

```
navy-sport/
├── camisetas/                       # Cat&aacute;logo de camisetas en alta definici&oacute;n
│   ├── argentina_3_estrellas_parche.png
│   ├── argentina_maradona_retro.png
│   ├── aucas_oro_grana_bet593.png
│   ├── barcelona_sc_centenario.png
│   ├── boca_juniors_cabj.png
│   ├── brasil_canarinha_cbf.png
│   ├── colombia_amarilla_2024.png
│   ├── colombia_amarilla_2026.png
│   ├── ecuador_retro_2001.png
│   ├── el_nacional_criollos_polo.png
│   ├── espana_roja_2024.png
│   ├── espana_roja_campeones.png
│   ├── fc_barcelona_spotify.png
│   ├── idv_independiente_del_valle.png
│   ├── inter_miami_goat.png
│   ├── inter_miami_pink.png
│   ├── italia_azzurra_elite.png
│   ├── ldu_quito_pichincha.png
│   ├── liverpool_anfield_red.png
│   ├── manchester_united_2025.png
│   ├── milan_bwin_2007.png
│   ├── nacional_antel_pro.png
│   ├── psg_hechter_qatar.png
│   ├── real_madrid_t2026.png
│   └── archivos_originales_descargas/  # Archivos y recortes en bruto archivados
│
├── pantalonetas/                    # Prendas inferiores y complementos
│   ├── pantaloneta_negra_oficial.png
│   └── archivos_originales/
│
├── public/                          # Identidad de marca y logos oficiales
│   ├── logo.png                     # Logo oficial transparente HD
│   ├── logo-hd.png
│   ├── logo-perfect.png
│   ├── logo-navy-sport.svg
│   └── variantes_archivadas/        # Bocetos anteriores guardados de forma segura
│
├── database/                        # Base de datos relacional
│   └── supabase-schema.sql          # Esquema oficial PostgreSQL para Supabase
│
├── documentacion/                   # Gu&iacute;as y manuales t&eacute;cnicos
│   ├── README.md                    # Documentaci&oacute;n general
│   └── ORGANIZACION_DE_ARCHIVOS.md  # Este &iacute;ndice estructural
│
└── proyecto-nextjs/                 # C&oacute;digo fuente React / Next.js / TypeScript
    ├── src/
    │   ├── app/
    │   ├── lib/
    │   └── types/
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── .env.local
    └── .env.local.example
```

---

## 3. C&oacute;mo Usar

1. **Para abrir el sistema:** Haz doble clic en `index.html` en tu navegador.
2. **Para entrar directo a la tienda:** Haz doble clic en `tienda-cliente.html`.
3. **Para entrar directo al taller:** Haz doble clic en `panel-trabajadores.html`.
