-- Script de Creación de Tablas para Supabase
-- Carga esto en el "SQL Editor" de tu proyecto de Supabase y dale a "Run"

-- 1. Tabla de Productos
CREATE TABLE IF NOT EXISTS public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    margen_ganancia NUMERIC,
    visible_catalogo BOOLEAN DEFAULT true,
    precio_manual NUMERIC,
    imagen TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Compras
CREATE TABLE IF NOT EXISTS public.compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
    cantidad_kg NUMERIC NOT NULL,
    cantidad_disponible NUMERIC NOT NULL,
    costo_unitario NUMERIC NOT NULL,
    fecha DATE NOT NULL,
    creado_en BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Ventas
CREATE TABLE IF NOT EXISTS public.ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES public.productos(id) ON DELETE RESTRICT,
    producto_nombre TEXT NOT NULL,
    cantidad_vendida NUMERIC NOT NULL,
    precio_venta_unitario NUMERIC NOT NULL,
    ingreso_total NUMERIC NOT NULL,
    costo_calculado NUMERIC NOT NULL,
    ganancia NUMERIC NOT NULL,
    fecha DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Gastos
CREATE TABLE IF NOT EXISTS public.gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    descripcion TEXT NOT NULL,
    categoria TEXT NOT NULL,
    monto NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Distribuciones (Carniceros)
CREATE TABLE IF NOT EXISTS public.distribuciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    empleado_id TEXT,
    producto_id UUID REFERENCES public.productos(id) ON DELETE RESTRICT,
    cantidad_kg NUMERIC NOT NULL,
    precio_base NUMERIC NOT NULL,
    shipping_cost NUMERIC,
    precio_venta NUMERIC NOT NULL,
    partner_share_percentage NUMERIC,
    total_cost NUMERIC,
    total_profit NUMERIC,
    partner_profit NUMERIC,
    supplier_profit NUMERIC,
    supplier_total_return NUMERIC,
    total_sale NUMERIC,
    total_partner_profit NUMERIC,
    total_supplier_profit NUMERIC,
    total_supplier_return NUMERIC,
    monto_total NUMERIC,
    pago_entregado NUMERIC DEFAULT 0,
    saldo_pendiente NUMERIC,
    estado_pago TEXT,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de Seguridad (RTS) básicas para acceso anónimo (para el MVP y desarrollo rápido)
-- Habilitar RLS en todas las tablas
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribuciones ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir LEER a todos (necesario para el catálogo público)
CREATE POLICY "Permitir lectura publica de productos" ON public.productos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de compras" ON public.compras FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de ventas" ON public.ventas FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de gastos" ON public.gastos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de distribuciones" ON public.distribuciones FOR SELECT USING (true);

-- Crear políticas para permitir INSERTAR, ACTUALIZAR, ELIMINAR temporalmente (hasta implementar Auth de Admin)
-- ¡OJO! Esto permite que cualquiera que tenga la Anon Key edite la base de datos anonimamente.
-- Es aceptable para la etapa de desarrollo y migración sin login.
CREATE POLICY "Permitir todo a productos" ON public.productos FOR ALL USING (true);
CREATE POLICY "Permitir todo a compras" ON public.compras FOR ALL USING (true);
CREATE POLICY "Permitir todo a ventas" ON public.ventas FOR ALL USING (true);
CREATE POLICY "Permitir todo a gastos" ON public.gastos FOR ALL USING (true);
CREATE POLICY "Permitir todo a distribuciones" ON public.distribuciones FOR ALL USING (true);
