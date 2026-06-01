<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white">
    <SeoMeta title="AFTUP - Gestión de Activos Fijos Tangibles y Útiles | Universidad de Sancti Spíritus"
      description="Plataforma integral para la gestión de los procesos de los activos fijos tangibles y útiles de la Universidad José Martí Pérez de Sancti Spíritus."
      canonical="/" />
    <Navbar />

    <button
      type="button"
      @click="toggleChat"
      class="fixed z-[55] right-4 top-16 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#099ebf] text-white shadow-lg transition hover:bg-[#077a99] md:top-4"
      aria-label="Abrir chat"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h8M8 14h5m4 5l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3z" />
      </svg>
      <span
        v-if="chatMessagesCount > 0"
        class="absolute -right-1 -top-1 inline-flex min-w-6 items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white"
      >
        {{ chatMessagesCount }}
      </span>
    </button>

    <DesktopChatPanel
      v-if="isChatOpen"
      @close="closeChat"
      @summary-updated="handleChatSummaryUpdate"
    />

    <!-- MessageBanner para mostrar estado de verificación de activos próximos a vencer -->
    <div v-if="verificationBanner"
      class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none">
      <MessageBanner :title="verificationBanner.title" :description="verificationBanner.description"
        :type="verificationBanner.type" :persistent="verificationBanner.persistent" @close="verificationBanner = null"
        class="pointer-events-auto" />
    </div>

    <div class="mt-8 md:mt-0 flex-1 flex flex-col">
      <!-- Header con logo y título -->
      <header class="flex flex-col items-center justify-center py-12">
        <img src="/logo.png" alt="Logo Universidad de Sancti Spíritus" class="h-40 w-40 shadow-md mb-4" />
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#099ebf] mb-2 text-center drop-shadow">
          Activos Fijos Tangibles y Útiles Procesos
        </h1>
        <h2 class="text-xl md:text-2xl text-[#077a99] text-center">
          Software para la gestión integral de los procesos
        </h2>
      </header>

      <!-- Funcionalidades principales y accesos directos -->
      <section class="flex-1 flex flex-col items-center justify-center px-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-7xl w-full mb-12">
          <!-- Botón: Mi Área (redirige a /miarea) -->
          <div @click="!isVendedor && goTo('miarea')"
            :class="[isVendedor ? 'pointer-events-none opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg', 'bg-white rounded-xl shadow p-6 flex flex-col items-center transition group']">
            <svg class="h-12 w-12 text-[#099ebf] mb-4 group-hover:text-[#077a99] transition" fill="none"
              stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 class="text-xl font-semibold text-[#099ebf] mb-2">Mi Área</h3>
            <p class="text-gray-600 text-center">Accede a tu espacio personal y gestión de activos.</p>
          </div>

          <!-- Botón: Traslados (redirige) - con badge de activos próximos a vencer -->
          <div @click="!isVendedor && goTo('traslados')"
            :class="[isVendedor ? 'pointer-events-none opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg', 'bg-white rounded-xl shadow p-6 flex flex-col items-center transition group relative']">
            <div v-if="activosProximosCount > 0"
              class="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
              {{ activosProximosCount }}
            </div>
            <svg class="h-12 w-12 text-[#099ebf] mb-4 group-hover:text-[#077a99] transition" fill="none"
              stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <h3 class="text-xl font-semibold text-[#099ebf] mb-2">Movimientos</h3>
            <p class="text-gray-600 text-center">Gestiona movimientos y transferencias de activos.</p>
          </div>

          <div @click="!isVendedor && goTo('bajas')"
            :class="[isVendedor ? 'pointer-events-none opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg', 'bg-white rounded-xl shadow p-6 flex flex-col items-center transition group']">
            <svg class="h-12 w-12 text-[#099ebf] mb-4 group-hover:text-[#077a99] transition" fill="none"
              stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <h3 class="text-xl font-semibold text-[#099ebf] mb-2">Bajas</h3>
            <p class="text-gray-600 text-center">Registra y administra activos dados de baja.</p>
          </div>

          <!-- Botón: Revisiones (redirige a /productos) -->
          <div @click="goTo('revisiones')"
            class="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:shadow-lg transition cursor-pointer group">
            <svg class="h-12 w-12 text-[#099ebf] mb-4 group-hover:text-[#077a99] transition" fill="none"
              stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 class="text-xl font-semibold text-[#099ebf] mb-2">Revisiones</h3>
            <p class="text-gray-600 text-center">Control de inspecciones y mantenimiento.</p>
          </div>

          <!-- Botón: Archivos enviados y recibidos (redirige a /trabajadores) -->
          <div @click="!isVendedor && goTo('archivos')"
            :class="[isVendedor ? 'pointer-events-none opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg', 'bg-white rounded-xl shadow p-6 flex flex-col items-center transition group']">
            <svg class="h-12 w-12 text-[#099ebf] mb-4 group-hover:text-[#077a99] transition" fill="none"
              stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <h3 class="text-xl font-semibold text-[#099ebf] mb-2">Archivos enviados y recibidos</h3>
            <p class="text-gray-600 text-center">Documentación y correspondencia de activos.</p>
          </div>
        </div>
        <button @click="goToLogin"
          class="mt-4 px-8 py-3 bg-[#099ebf] text-white text-lg font-semibold rounded-full shadow hover:bg-[#077a99] transition">Iniciar
          sesión</button>
      </section>

      <!-- Footer -->
      <footer class="w-full py-6 text-center text-gray-500 text-sm bg-transparent mt-auto">
        © {{ new Date().getFullYear() }} AFTUP - Universidad de Sancti Spíritus “José Martí Pérez”.
      </footer>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue';
import MessageBanner from '@/components/MessageBanner.vue';
import SeoMeta from '@/components/SeoMeta.vue';
import DesktopChatPanel from '@/components/DesktopChatPanel.vue';
import { navigateTo } from 'nuxt/app';
import { ref, onMounted, computed } from 'vue';

const goToLogin = () => navigateTo('/login');

const isChatOpen = ref(false);

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
};

const closeChat = () => {
  isChatOpen.value = false;
};

const hasUserSession = () => {
  try {
    if (typeof window === 'undefined') return false;
    return Boolean(localStorage.getItem('usuario'));
  } catch (error) {
    return false;
  }
};

const goTo = (ruta) => {
  if (hasUserSession()) {
    const targetPath = ruta ? `/${ruta}` : '/';
    navigateTo(targetPath);
  } else {
    navigateTo('/login');
  }
};

const isVendedor = computed(() => {
  try {
    if (typeof window === 'undefined' || !localStorage) return false;
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return false;
    const usuarioObj = JSON.parse(usuarioStr);
    const rawRole = usuarioObj?.rol || usuarioObj?.role || usuarioObj?.perfil || usuarioObj?.profile;
    if (!rawRole) return false;
    return String(rawRole).trim().toLowerCase() === 'vendedor';
  } catch (e) {
    return false;
  }
});

const verificationBanner = ref(null);
const activosProximosCount = ref(0);
const chatMessagesCount = ref(0);

const handleChatSummaryUpdate = (summary) => {
  chatMessagesCount.value = Number(summary?.count || 0);
};

const syncChatSummaryCountFromStorage = () => {
  try {
    const storedCount = Number(localStorage.getItem('chatUnreadCount') || 0);
    chatMessagesCount.value = Number.isFinite(storedCount) ? storedCount : 0;
  } catch {
    chatMessagesCount.value = 0;
  }
};

const verificarActivosProximos = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return;
  }

  try {

    const config = useRuntimeConfig();
    const response = await fetch(`${config.public.backendHost}/contrato/proximos-a-vencer`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });

    if (response.status === 401) {
      verificationBanner.value = {
        title: 'Sesión Expirada',
        description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        type: 'warning',
        persistent: false
      };
      localStorage.clear();
      setTimeout(() => {
        navigateTo('/login');
      }, 3000);
      return;
    }
    if (response.status === 403) {
      verificationBanner.value = {
        title: 'Acceso Denegado',
        description: 'No tienes permisos para realizar esta acción.',
        type: 'error',
        persistent: false
      };
      return;
    }

    const data = await response.json();

    if (data.count > 0) {
      const entidades = data.data.map(contrato => contrato.entidad?.nombre).filter(nombre => nombre);
      const entidadesUnicas = [...new Set(entidades)];
      const entidadesTexto = entidadesUnicas.join(', ');

      activosProximosCount.value = data.count;

      verificationBanner.value = {
        title: `Activos Fijos Próximos a Vencer`,
        description: `Hay ${data.count} activo(s) próximo(s) a vencer de: ${entidadesTexto}`,
        type: 'warning',
        persistent: true
      };
    } else {
      activosProximosCount.value = 0;
      verificationBanner.value = {
        title: 'Sin Activos Próximos a Vencer',
        description: 'No hay activos fijos próximos a vencer en este momento.',
        type: 'success',
        persistent: false
      };
    }
  } catch (error) {
    console.error('Error al verificar activos próximos a vencer:', error);
  }
};

onMounted(() => {
  if (!hasUserSession()) {
    navigateTo('/login');
    return;
  }

  verificarActivosProximos();
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>