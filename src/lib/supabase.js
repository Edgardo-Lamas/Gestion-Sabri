import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Variables de entorno de Supabase no encontradas. La autenticación no funcionará correctamente.')
}

// Inicializar el cliente
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
