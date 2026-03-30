# Stack Técnico — Sistema de Gestión (Base Reutilizable)
**Studio Lamas · Desarrollo Digital**
Última actualización: marzo 2026

---

## 1. Stack Tecnológico

### Frontend
| Tecnología | Versión | Rol |
|---|---|---|
| **React** | 19.x | Framework UI principal |
| **Vite** | 7.x | Bundler y servidor de desarrollo |
| **CSS-in-JS (styled jsx)** | — | Estilos por componente, sin librerías externas |
| **Lucide React** | 0.56x | Íconos SVG |
| **Recharts** | 3.x | Gráficos del Dashboard |

### Backend / Infraestructura
| Tecnología | Rol |
|---|---|
| **Supabase** | Base de datos (PostgreSQL), autenticación y API REST |
| **GitHub Pages** | Hosting estático gratuito |
| **GitHub Actions** | CI/CD — deploy automático en cada push a main |

### Lenguajes
- JavaScript (ES Modules)
- JSX
- SQL (PostgreSQL para schema de Supabase)

---

## 2. Arquitectura

### Estructura de archivos
```
src/
├── App.jsx                  # Raíz: routing por estado + auth wrapper
├── main.jsx                 # Entry point
├── components/
│   ├── Login.jsx            # Pantalla de login
│   ├── Dashboard.jsx        # Resumen financiero con gráficos
│   ├── Purchases.jsx        # Módulo de compras / ingreso de stock
│   ├── Sales.jsx            # Módulo de ventas con cálculo FIFO
│   ├── Expenses.jsx         # Módulo de gastos operativos
│   ├── Inventory.jsx        # Vista de stock disponible
│   ├── MeatDistribution.jsx # Distribución a empleados
│   ├── ClientProfiles.jsx   # Perfiles de clientes con precios personalizados
│   ├── B2BStoreFront.jsx    # Catálogo público para clientes mayoristas
│   ├── Entrega.jsx          # Documento de entrega al cliente (público)
│   └── ui/
│       └── Modal.jsx        # Componente modal reutilizable
├── context/
│   └── ToastContext.jsx     # Sistema global de notificaciones
├── lib/
│   ├── supabase.js          # Cliente Supabase (usa variables de entorno)
│   ├── AuthContext.jsx      # Context de autenticación
│   └── mockData.js          # Datos de demo para cuando Supabase no está disponible
└── utils/
    ├── fifo.js              # Algoritmo FIFO para descuento de stock
    └── meatDistribution.js  # Utilidades de distribución
```

### Routing
El sistema NO usa React Router. La navegación funciona por **estado React** (`currentView` + `activeTab`). Las vistas públicas se acceden por query params:
- `?view=storefront` → Catálogo público B2B
- `?view=entrega` → Documento de entrega (con contraseña)

### Flujo de autenticación
```
App carga → AuthContext verifica sesión en Supabase
→ Si hay sesión: muestra AppContent (panel completo)
→ Si no hay sesión: muestra Login
→ Login llama supabase.auth.signInWithPassword()
→ onAuthStateChange actualiza el contexto automáticamente
```

### Flujo de datos
```
fetchData() → Promise.all(7 queries a Supabase)
→ setState de cada entidad (productos, compras, ventas, gastos, distribuciones, clientes, clienteProductos)
→ useMemo calcula stock_actual y costoPromedio desde compras
→ Los componentes reciben los datos como props
→ Cada operación (venta, compra, etc.) llama onUpdate() para refrescar
```

---

## 3. Base de Datos (Supabase / PostgreSQL)

### Tablas
| Tabla | Descripción |
|---|---|
| `productos` | Catálogo de productos con margen y precio catálogo |
| `compras` | Lotes de compra con `cantidad_disponible` para FIFO |
| `ventas` | Registro de ventas con costo calculado y ganancia |
| `gastos` | Gastos operativos categorizados |
| `distribuciones` | Entrega de mercadería a empleados |
| `clientes` | Perfiles de clientes con categoría |
| `cliente_productos` | Productos frecuentes por cliente con margen o precio fijo |

### Algoritmo FIFO
Al registrar una venta, el sistema:
1. Busca los lotes de compra del producto ordenados por fecha ASC
2. Descuenta la cantidad vendida del lote más antiguo primero
3. Si el lote se agota, continúa con el siguiente
4. Calcula el `costo_calculado` real según los lotes consumidos
5. Persiste los cambios con `supabase.from('compras').upsert()`

### Costo Promedio Ponderado
Calculado en tiempo real con `useMemo`:
```js
// Solo considera lotes con stock disponible
costo = (suma de costo_unitario * cantidad_disponible) / total_kg_disponible
```

---

## 4. Capacidades Actuales

### ✅ Lo que puede hacer
- Gestión completa de stock con método FIFO
- Control de lotes de compra con costo por kg
- Registro de ventas con cálculo automático de ganancia
- Dashboard financiero con gráficos (ingresos, gastos, ganancia, stock valorizado)
- Control de gastos operativos
- Distribución de mercadería a empleados con trazabilidad
- Perfiles de clientes con precios personalizados (margen % o precio fijo por producto)
- Cobro rápido por cliente con productos precargados
- Catálogo público B2B con pedidos por WhatsApp
- Autenticación segura con Supabase Auth
- PWA: instalable en celular como app
- Deploy automático vía GitHub Actions
- Modo demo offline con mock data cuando Supabase no está disponible

### ❌ Lo que NO tiene (aún)
- Portal de login para clientes finales
- Notificaciones automáticas (alertas de stock bajo, etc.)
- Exportación a Excel / PDF de reportes
- Multi-usuario con roles (ej: admin vs. vendedor)
- Historial de precios por producto
- Facturación electrónica (AFIP)
- App móvil nativa

---

## 5. Posibles Extensiones

| Feature | Complejidad | Descripción |
|---|---|---|
| **Roles de usuario** | Media | Admin vs. operador con permisos distintos |
| **Portal del cliente** | Alta | Login propio, ver precios, hacer pedidos |
| **Alertas de stock** | Baja | Notificación cuando un producto baja de X kg |
| **Exportar reportes** | Media | PDF/Excel de ventas, gastos, ganancia mensual |
| **Facturación AFIP** | Muy alta | Integración con ARCA para facturas electrónicas |
| **Multi-sucursal** | Alta | Varias ubicaciones con stock independiente |
| **App nativa** | Muy alta | React Native para iOS/Android |
| **Dominio personalizado** | Baja | Comprar dominio y apuntar a GitHub Pages |

---

## 6. Instrucciones para Reusar en Otro Cliente

### Pasos para adaptar el sistema a un nuevo cliente

**1. Clonar el repositorio**
```bash
git clone https://github.com/Edgardo-Lamas/Gestion-Sabri.git nuevo-cliente
cd nuevo-cliente
npm install
```

**2. Crear nuevo repositorio en GitHub**
- Crear repo nuevo en GitHub (ej: `Gestion-NuevoCliente`)
- Cambiar el remote: `git remote set-url origin https://github.com/Edgardo-Lamas/Gestion-NuevoCliente.git`

**3. Crear nuevo proyecto en Supabase**
- Cuenta nueva del cliente en supabase.com
- Ejecutar `schema_completo.sql` en el SQL Editor
- Crear usuario del cliente en Authentication → Users
- Copiar URL y anon key

**4. Actualizar variables**
- `.env.local` con las nuevas credenciales de Supabase
- GitHub → Settings → Environments → github-pages → Secrets: actualizar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

**5. Personalizar la marca**
- `package.json`: cambiar `name` y `homepage`
- `vite.config.js`: cambiar `base` con el nombre del nuevo repo
- `App.jsx`: cambiar nombre del negocio en la sidebar ("Gestión Sabri" → nombre del cliente)
- `Entrega.jsx`: actualizar nombre del cliente, email y contraseña de acceso

**6. Deploy**
```bash
git add -A
git commit -m "feat: adaptar para nuevo cliente"
git push origin main
```
GitHub Actions despliega automáticamente.

---

## 7. Variables de Entorno

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase (`https://xxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon de Supabase (JWT) |

- En desarrollo: `.env.local` (no se sube a git, está en `.gitignore`)
- En producción: GitHub Secrets en el environment `github-pages`

---

*Studio Lamas · Desarrollo Digital · © 2026 Edgardo Lamas*
