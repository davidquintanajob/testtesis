<template>
  <div class="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white">
    <SeoMeta title="Iniciar Sesión - AFTUP" description="Accede a la plataforma de gestión de activos fijos tangibles y útiles." canonical="/login" />
    
    <!-- Pantalla de carga -->
    <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-gray-200 border-t-[#099ebf] rounded-full animate-spin"></div>
        <p class="text-gray-700 font-medium">Iniciando sesión...</p>
      </div>
    </div>

    <!-- Banner de error -->
    <MessageBanner 
      v-if="showError" 
      title="Error al iniciar sesión" 
      :description="errorMsg" 
      type="error" 
      @close="showError = false"
    />

    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-24 w-24 rounded-full shadow mt-8" src="/logo.png" alt="Logo AFTUP" />
      <h2 class="mt-8 text-center text-2xl font-bold tracking-tight text-[#077a99]">Inicia sesión en tu cuenta</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="handleLogin">
        <div>
          <label for="usuario" class="block text-sm font-medium text-gray-900">Usuario</label>
          <div class="mt-2">
            <input
              id="usuario"
              name="usuario"
              type="text"
              autocomplete="username"
              required
              v-model="usuario"
              :disabled="isLoading"
              class="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#099ebf] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Nombre de usuario"
            />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="contrasena" class="block text-sm font-medium text-gray-900">Contraseña</label>
          </div>
          <div class="mt-2">
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              autocomplete="current-password"
              required
              v-model="contrasena"
              :disabled="isLoading"
              class="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#099ebf] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Contraseña"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="flex w-full justify-center rounded-md bg-[#099ebf] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#077a99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#099ebf] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ingresar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import SeoMeta from '@/components/SeoMeta.vue';
import MessageBanner from '@/components/MessageBanner.vue';
import { ref } from 'vue';
import { useRuntimeConfig, navigateTo } from 'nuxt/app';

const usuario = ref('');
const contrasena = ref('');
const errorMsg = ref('');
const showError = ref(false);
const isLoading = ref(false);
const config = useRuntimeConfig();

const handleLogin = async () => {
  errorMsg.value = '';
  showError.value = false;
  
  if (!usuario.value || !contrasena.value) {
    errorMsg.value = 'Por favor, completa todos los campos.';
    showError.value = true;
    return;
  }
  
  isLoading.value = true;
  
  try {
    const res = await fetch(`${config.public.backendHost}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        usuario: usuario.value,
        contrasena: contrasena.value
      })
    });
    
    if (!res.ok) {
      // Mostrar mensaje con el código de error
      const errorCode = res.status;
      let customMessage = 'Usuario o contraseña incorrectos.';
      if (errorCode === 401) customMessage = 'Usuario o contraseña incorrectos.';
      else if (errorCode === 400) customMessage = 'Solicitud incorrecta. Verifica los datos enviados.';
      else if (errorCode === 500) customMessage = 'Error interno del servidor. Intenta más tarde.';
      
      errorMsg.value = `${customMessage} (Código ${errorCode})`;
      showError.value = true;
      isLoading.value = false;
      return;
    }
    
    const data = await res.json();
    
    if (data.token && data.usuario) {
      // Guardar token y datos del usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      
      // Opcional: Obtener configuración (tasa de cambio u otros parámetros) después del login
      try {
        const cfgRes = await fetch(`${config.public.backendHost}/config`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': data.token
          }
        });
        if (cfgRes.ok) {
          const cfgData = await cfgRes.json();
          // Si la respuesta contiene cambio_moneda, lo guardamos, si no guardamos todo el objeto
          if (cfgData && typeof cfgData === 'object') {
            localStorage.setItem('config', JSON.stringify(cfgData));
          }
        } else {
          console.warn('No se pudo obtener la configuración del servidor:', cfgRes.status);
        }
      } catch (e) {
        console.warn('Error al obtener configuración:', e);
      }
      
      // Redirigir al home
      navigateTo('/');
    } else {
      errorMsg.value = 'Respuesta inesperada del servidor.';
      showError.value = true;
      isLoading.value = false;
    }
  } catch (e) {
    errorMsg.value = 'Error de conexión con el servidor.';
    showError.value = true;
    isLoading.value = false;
  }
};
</script>