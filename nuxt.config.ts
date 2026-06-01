// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/tailwind.css'],
  plugins: [
    { src: '~/plugins/leaflet.js', ssr: false }, // Solo en el cliente
  ],
  // SEO and runtime configuration
  runtimeConfig: {
    public: {
      backendHost: process.env.NUXT_PUBLIC_BACKEND_HOST,
      // Base site URL used for canonical links and JSON-LD. Set NUXT_PUBLIC_SITE_URL in env.
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://31.170.165.44:5356'
    }
  },
  app: {
    head: {
      title: 'Pactum',
      titleTemplate: '%s | Pactum',
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Platforma para la gestión eficiente de contratos, entidades y trabajadores.' },
  { name: 'theme-color', content: '#93C5FD' },
        { name: 'keywords', content: 'contratos, gestión, trabajadores, entidades, ofertas' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'es_ES' },
        { property: 'og:site_name', content: 'Pactum' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'canonical', href: process.env.NUXT_PUBLIC_SITE_URL || 'http://31.170.165.44:5356' }
      ],
      script: [
        // Basic Organization JSON-LD for SEO
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Pactum",
            "url": process.env.NUXT_PUBLIC_SITE_URL || 'http://31.170.165.44:5356',
            "logo": (process.env.NUXT_PUBLIC_SITE_URL || 'http://31.170.165.44:5356') + '/logo.png'
          })
        }
      ]
    }
  }
})