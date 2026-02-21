# Gestión Sabri: Fase 2 (Hacia Producción Profesional)

Este documento recopila las ideas, mejoras y optimizaciones recomendadas para implementar luego de que el usuario final haya probado la versión Beta (MVP) durante algunas semanas.

## 1. Experiencia de Usuario Comercial (B2B)
*   **PWA (Progressive Web App):** Convertir la web en instalable para que Sabri y sus clientes puedan agregarla a la pantalla de inicio del celular como una app nativa, mejorando el rendimiento y permitiendo algo de caché offline.
*   **SEO y Compartición (Open Graph):** Agregar *Meta Tags* dinámicos (`og:title`, `og:image`, `og:description`). Cuando Sabri envíe el link del catálogo por WhatsApp, debe aparecer una imagen profesional con el nombre de su negocio, en lugar de un enlace en blanco.
*   **Gestión de Pedidos Interna:** Actualmente el cliente B2B envía el carrito directo al WhatsApp de Sabri. A futuro, se podría crear una tabla `pedidos` en Supabase para que Sabri tenga un historial en la app de qué cliente pidió qué cosa, en estado "Pendiente", antes de facturarlo en `ventas`.

## 2. Robustez de la Base de Datos (Supabase)
*   **Restricciones de Integridad (Constraints):** Agregar comprobaciones a nivel de SQL (`CHECK`) en la base de datos para impedir matemáticamente que el campo `cantidad_disponible` de la tabla `compras` baje de 0, para tener una doble capa de seguridad más allá de la validación actual en React.
*   **Políticas RLS Específicas:** Separar el acceso totalmente transparente del catálogo B2B (que requiere anonimato) de las tablas internas. Asegurar que las reglas RLS sean robustas frente a ataques maliciosos externos.
*   **Backups Automatizados:** Configurar exportaciones periódicas programadas o un flujo de trabajo para asegurar los datos comerciales críticos (debido a limitaciones del tier gratuito de Supabase).

## 3. Monitoreo y Mantenimiento
*   **Reportes de Errores (Sentry o similar):** Integrar una librería de tracking de errores de frontend. Si el navegador del celular de Sabri falla en silencio, recibiremos un aviso técnico por correo para depurar el problema rápidamente sin depender de que ella recuerde qué botón tocó.
*   **Optimización de Carga:** El Bundle de Vite tiene archivos JS bastante grandes (`> 500kb` debido a Recharts y Lucide). A futuro implementaremos *Code Splitting* (importación dinámica) o *Manual Chunks* en la configuración de Vite para que la web cargue instantáneamente incluso con mala señal 3G.
