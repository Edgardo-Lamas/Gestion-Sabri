-- =====================================================
-- Migración: Agregar columnas de distribución Sabri/Proveedor
-- Ejecutar en: Supabase → SQL Editor
-- =====================================================

ALTER TABLE public.distribuciones
  ALTER COLUMN empleado DROP NOT NULL,
  ALTER COLUMN costo_unitario DROP NOT NULL,
  ALTER COLUMN costo_total DROP NOT NULL;

ALTER TABLE public.distribuciones
  ADD COLUMN IF NOT EXISTS precio_base NUMERIC,
  ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC,
  ADD COLUMN IF NOT EXISTS precio_venta NUMERIC,
  ADD COLUMN IF NOT EXISTS partner_share_percentage NUMERIC,
  ADD COLUMN IF NOT EXISTS total_cost NUMERIC,
  ADD COLUMN IF NOT EXISTS total_profit NUMERIC,
  ADD COLUMN IF NOT EXISTS partner_profit NUMERIC,
  ADD COLUMN IF NOT EXISTS supplier_profit NUMERIC,
  ADD COLUMN IF NOT EXISTS supplier_total_return NUMERIC,
  ADD COLUMN IF NOT EXISTS total_sale NUMERIC,
  ADD COLUMN IF NOT EXISTS total_partner_profit NUMERIC,
  ADD COLUMN IF NOT EXISTS total_supplier_profit NUMERIC,
  ADD COLUMN IF NOT EXISTS total_supplier_return NUMERIC;
