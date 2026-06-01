/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,vue,ts}',
    './pages/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './components/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#5A4E9D",       // Azul violeta (fondo principal)
        "secondary": "#C5B6DA",     // Lila claro (logo)
        "accent": "#7E6FB2",        // Violeta intermedio (botones)
        "neutral": "#FFFFFF",       // Blanco (limpieza visual)
        "info": "#3B82F6",          // Azul informativo (notificaciones)
        "dark": "#2E225F",          // Violeta profundo (contraste)
        "success": "#10B981",       // Verde (acciones exitosas)
        "danger": "#EF4444"         // Rojo (alertas/errores)
      }
    },
  },
  plugins: [],
}
