-- Script para asegurar la Base de Datos (Modo Producción / Beta)
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar las políticas permisivas anteriores (las que permitían a CUALQUIERA insertar o borrar datos)
DROP POLICY IF EXISTS "Permitir todo a productos" ON public.productos;
DROP POLICY IF EXISTS "Permitir todo a compras" ON public.compras;
DROP POLICY IF EXISTS "Permitir todo a ventas" ON public.ventas;
DROP POLICY IF EXISTS "Permitir todo a gastos" ON public.gastos;
DROP POLICY IF EXISTS "Permitir todo a distribuciones" ON public.distribuciones;

-- 2. Asegurarse de que el acceso de lectura al público siga funcionando para todo, 
--    (o al menos para productos si solo quieres que vean el catálogo).
--    Por ahora dejaremos lectura pública a todo para no romper la app si algo asume leer sin token,
--    pero lo ideal a futuro es que solo `productos` sea 100% público. 
--    NOTA: Las politicas "Permitir lectura publica de..." ya existen del script anterior, así que no se borran.

-- 3. Crear Políticas Estrictas: Solo USUARIOS AUTENTICADOS (Sabri) pueden Insertar, Actualizar o Borrar
CREATE POLICY "Solo autenticados insertan productos" ON public.productos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Solo autenticados actualizan productos" ON public.productos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Solo autenticados borran productos" ON public.productos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Solo autenticados insertan compras" ON public.compras FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Solo autenticados actualizan compras" ON public.compras FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Solo autenticados borran compras" ON public.compras FOR DELETE TO authenticated USING (true);

CREATE POLICY "Solo autenticados insertan ventas" ON public.ventas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Solo autenticados actualizan ventas" ON public.ventas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Solo autenticados borran ventas" ON public.ventas FOR DELETE TO authenticated USING (true);

CREATE POLICY "Solo autenticados insertan gastos" ON public.gastos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Solo autenticados actualizan gastos" ON public.gastos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Solo autenticados borran gastos" ON public.gastos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Solo autenticados insertan distribuciones" ON public.distribuciones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Solo autenticados actualizan distribuciones" ON public.distribuciones FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Solo autenticados borran distribuciones" ON public.distribuciones FOR DELETE TO authenticated USING (true);
