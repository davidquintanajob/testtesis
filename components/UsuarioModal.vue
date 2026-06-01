<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
      <!-- Encabezado -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          {{ isViewing ? 'Detalles de Usuario' : (isEditing ? 'Editar Usuario' : 'Nuevo Usuario') }}
        </h2>
        <button @click="$emit('update:modelValue', false)" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Usuario LDAP -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Usuario LDAP</label>
          <input
            v-model="formData.id_usuario_LDAP"
            type="text"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
            required
            :readonly="isViewing"
            :disabled="isViewing || isLoading"
            placeholder="nombre usuario"
          />
        </div>

        <!-- Área de Responsabilidad (con SelectSearchAPI) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Área de Responsabilidad</label>
          <SelectSearchAPI
            v-if="!isViewing"
            v-model="formData.id_AreaResponsabilidad"
            :multiple="false"
            endpoint="/areas/filtrar/1/5"
            method="POST"
            search-key="Desc_AreaResponsabilidad"
            label-key="Desc_AreaResponsabilidad"
            value-key="Id_AreaResponsabilidad"
            :label-format="'{{Desc_AreaResponsabilidad}} - {{Id_AreaResponsabilidad}}'"
            placeholder="Buscar área de responsabilidad..."
            :direct-data="false"
            :data-key="'datos'"
            :initial-label="areaInitialLabel"
            :disabled="isViewing || isLoading"
            required
          />
          <!-- Modo vista: mostrar texto plano -->
          <div v-else class="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100">
            {{ areaInitialLabel || formData.id_AreaResponsabilidad || 'No especificada' }}
          </div>
        </div>

        <!-- Rol -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            v-model="formData.rol"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
            required
            :disabled="isViewing || isLoading"
          >
            <option value="">Seleccione un rol</option>
            <option value="Responsable de Área">Responsable de Área</option>
            <option value="Administrador">Administrador</option>
            <option value="Jefe de Área">Jefe de Área</option>
            <option value="Especialista">Especialista</option>
          </select>
        </div>

        <!-- Jefe (Usuario Superior) - NUEVO CAMPO -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Jefe (usuario superior)</label>
          <SelectSearchAPI
            v-if="!isViewing"
            v-model="formData.id_usuario_jefe"
            :multiple="false"
            endpoint="/usuarios/filtrar/1/5"
            method="POST"
            search-key="id_usuario_LDAP"
            label-key="id_usuario_LDAP"
            value-key="id_usuario"
            :label-format="'{{id_usuario_LDAP}} (ID: {{id_usuario}})'"
            placeholder="Buscar usuario jefe por LDAP..."
            :direct-data="false"
            :data-key="'datos'"
            :initial-label="jefeInitialLabel"
            :disabled="isViewing || isLoading"
          />
          <!-- Modo vista: mostrar texto plano -->
          <div v-else class="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100">
            {{ jefeInitialLabel || 'Sin jefe asignado' }}
          </div>
        </div>

        <!-- Estado Activo (solo lectura, solo se muestra si existe) -->
        <div v-if="isViewing || (formData.activo !== undefined && !isEditing)">
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <div class="flex items-center">
            <span
              v-if="formData.activo"
              class="px-3 py-2 rounded-lg bg-green-100 text-green-700 border border-green-400"
            >
              Activo
            </span>
            <span v-else class="px-3 py-2 rounded-lg bg-red-100 text-red-700 border border-red-400">
              Inactivo
            </span>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-end space-x-4 mt-6" v-if="!isViewing">
          <button
            type="button"
            @click="$emit('update:modelValue', false)"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            :disabled="isLoading"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isEditing ? 'Guardando...' : 'Creando...' }}
            </span>
            <span v-else>
              {{ isEditing ? 'Guardar Cambios' : 'Crear Usuario' }}
            </span>
          </button>
        </div>
      </form>
      <div v-if="errorMsg" class="text-red-600 text-sm mt-2">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import SelectSearchAPI from '@/components/SelectSearchAPI.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  usuario: {
    type: Object,
    default: () => ({})
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  isViewing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'submit', 'success']);

const formData = ref({
  id_usuario_LDAP: '',
  id_AreaResponsabilidad: '',
  rol: '',
  activo: true,
  id_usuario_jefe: null   // nuevo campo
});

const errorMsg = ref('');
const isLoading = ref(false);
const areaInitialLabel = ref('');
const jefeInitialLabel = ref(''); // etiqueta para el jefe

// Cargar descripción del área
async function loadAreaDescription(areaId) {
  if (!areaId) return '';
  try {
    const token = localStorage.getItem('token');
    const config = useRuntimeConfig();
    const response = await fetch(`${config.public.backendHost}/areas/${areaId}`, {
      headers: { Authorization: token }
    });
    if (!response.ok) throw new Error('Error al cargar área');
    const data = await response.json();
    return `${data.Desc_AreaResponsabilidad} - ${data.Id_AreaResponsabilidad}`;
  } catch (err) {
    console.error(err);
    return areaId;
  }
}

// Cargar descripción del jefe (usuario)
async function loadJefeDescription(usuarioId) {
  if (!usuarioId) return '';
  try {
    const token = localStorage.getItem('token');
    const config = useRuntimeConfig();
    const response = await fetch(`${config.public.backendHost}/usuarios/${usuarioId}`, {
      headers: { Authorization: token }
    });
    if (!response.ok) throw new Error('Error al cargar jefe');
    const data = await response.json();
    return `${data.id_usuario_LDAP} (ID: ${data.id_usuario})`;
  } catch (err) {
    console.error(err);
    return `ID: ${usuarioId}`;
  }
}

// Limpiar error al abrir modal
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    errorMsg.value = '';
  }
});

// Sincronizar con el usuario recibido (edición o vista)
watch(() => props.usuario, async (newUsuario) => {
  if (newUsuario && Object.keys(newUsuario).length > 0) {
    formData.value = {
      id_usuario_LDAP: newUsuario.id_usuario_LDAP || '',
      id_AreaResponsabilidad: newUsuario.id_AreaResponsabilidad || '',
      rol: newUsuario.rol || '',
      activo: newUsuario.activo !== undefined ? newUsuario.activo : true,
      id_usuario_jefe: newUsuario.id_usuario_jefe || null
    };
    // Cargar etiqueta del área
    if (formData.value.id_AreaResponsabilidad) {
      areaInitialLabel.value = await loadAreaDescription(formData.value.id_AreaResponsabilidad);
    } else {
      areaInitialLabel.value = '';
    }
    // Cargar etiqueta del jefe
    if (formData.value.id_usuario_jefe) {
      jefeInitialLabel.value = await loadJefeDescription(formData.value.id_usuario_jefe);
    } else {
      jefeInitialLabel.value = '';
    }
  } else {
    // Reset para nuevo usuario
    formData.value = {
      id_usuario_LDAP: '',
      id_AreaResponsabilidad: '',
      rol: '',
      activo: true,
      id_usuario_jefe: null
    };
    areaInitialLabel.value = '';
    jefeInitialLabel.value = '';
  }
}, { immediate: true });

const handleSubmit = async () => {
  errorMsg.value = '';

  // Validaciones básicas
  if (!formData.value.id_usuario_LDAP || !formData.value.id_AreaResponsabilidad || !formData.value.rol) {
    errorMsg.value = 'Todos los campos excepto Jefe son obligatorios.';
    return;
  }

  isLoading.value = true;
  try {
    const payload = {
      rol: formData.value.rol,
      id_usuario_LDAP: formData.value.id_usuario_LDAP,
      id_AreaResponsabilidad: formData.value.id_AreaResponsabilidad,
      id_usuario_jefe: formData.value.id_usuario_jefe || null   // puede ser null
    };
    await emit('submit', payload);
    emit('success');
    emit('update:modelValue', false);
  } catch (error) {
    errorMsg.value = error.message || 'Error al guardar el usuario. Inténtelo de nuevo.';
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>