<template>
  <div class="min-h-screen flex flex-col items-center py-12 bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white">
    <Navbar />

    <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl mt-8">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-[#099ebf]">Mi Perfil</h2>
      </div>

      <div v-if="isLoading" class="text-center text-[#077a99]">
        Cargando perfil...
      </div>

      <div v-else-if="perfil" class="space-y-4">
        <div class="grid gap-4">
          <div class="flex justify-between items-center border-b border-[#d8eff4] pb-3">
            <span class="font-semibold text-[#077a99]">ID Usuario</span>
            <span class="text-gray-900">{{ perfil.id_usuario }}</span>
          </div>

          <div class="flex justify-between items-center border-b border-[#d8eff4] pb-3">
            <span class="font-semibold text-[#077a99]">Rol</span>
            <span class="text-gray-900">{{ perfil.rol }}</span>
          </div>

          <div class="flex justify-between items-center border-b border-[#d8eff4] pb-3">
            <span class="font-semibold text-[#077a99]">ID Usuario LDAP</span>
            <span class="text-gray-900">{{ perfil.id_usuario_LDAP }}</span>
          </div>

          <div class="flex justify-between items-center border-b border-[#d8eff4] pb-3">
            <span class="font-semibold text-[#077a99]">Área de responsabilidad</span>
            <span class="text-gray-900">{{ perfil.id_AreaResponsabilidad?.trim() || '—' }}</span>
          </div>

          <div class="flex justify-between items-center border-b border-[#d8eff4] pb-3">
            <span class="font-semibold text-[#077a99]">Estado</span>
            <span
              :class="perfil.activo ? 'bg-[#099ebf] text-white' : 'bg-[#dbeef2] text-[#077a99]'"
              class="px-3 py-1 rounded-full text-xs font-semibold"
            >
              {{ perfil.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <div class="flex justify-between items-center border-b border-[#d8eff4] pb-3">
            <span class="font-semibold text-[#077a99]">Creado</span>
            <span class="text-gray-900">{{ perfil.createdAt }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="font-semibold text-[#077a99]">Actualizado</span>
            <span class="text-gray-900">{{ perfil.updatedAt }}</span>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-[#077a99]">
        No se pudo cargar el perfil.
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRuntimeConfig, navigateTo } from 'nuxt/app';
import Navbar from '@/components/Navbar.vue';

const config = useRuntimeConfig();
const perfil = ref(null);
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;

  try {
    const usuarioLS = localStorage.getItem('usuario');

    if (!usuarioLS) {
      navigateTo('/login');
      return;
    }

    let usuario;

    try {
      usuario = JSON.parse(usuarioLS);
    } catch (error) {
      navigateTo('/login');
      return;
    }

    if (!usuario || !usuario.id_usuario) {
      navigateTo('/login');
      return;
    }

    const response = await fetch(`${config.public.backendHost}/usuarios/${usuario.id_usuario}`);

    if (!response.ok) {
      perfil.value = null;
      return;
    }

    perfil.value = await response.json();
  } catch (error) {
    perfil.value = null;
  } finally {
    isLoading.value = false;
  }
});
</script> 