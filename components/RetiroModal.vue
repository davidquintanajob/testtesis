<template>
  <Modal :show="modelValue" @close="onRequestClose" size="2xl">
    <template #title>
      <h3 class="text-lg font-semibold text-gray-900">
        {{ isViewing ? 'Detalles del Retiro' : (isEditing ? 'Editar Retiro' : 'Nuevo Retiro') }}
      </h3>
    </template>

    <template #content>
      <div ref="contentWrapper" :class="['transition-opacity', isLoading && 'pointer-events-none opacity-50']">
        <!-- loading overlay -->
        <div v-if="isLoading" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div class="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            <p class="text-gray-700 font-medium">Procesando, espere...</p>
          </div>
        </div>

        <div v-if="message" class="mb-4">
          <MessageBanner :title="message.title" :description="message.description" :type="message.type" @close="message = null" />
        </div>

        <div v-if="isViewing" class="space-y-6">
          <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="text-md font-medium text-gray-900 mb-3">Información del Retiro</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Usuario</label>
                <p class="mt-1 text-sm text-gray-900">{{ retiro.usuario?.nombre || 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Cantidad CUP</label>
                <p class="mt-1 text-sm text-gray-900">{{ Number(retiro.cantidad_retirada_cup || 0).toFixed(2) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Cantidad USD</label>
                <p class="mt-1 text-sm text-gray-900">{{ Number(retiro.cantidad_retirada_usd || 0).toFixed(2) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Cambio moneda</label>
                <p class="mt-1 text-sm text-gray-900">{{ Number(retiro.cambio_moneda || 0).toFixed(2) }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Motivo</label>
                <p class="mt-1 text-sm text-gray-900">{{ retiro.motivo || 'Sin motivo' }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Fecha</label>
                <p class="mt-1 text-sm text-gray-900">{{ retiro.fecha ? new Date(retiro.fecha).toLocaleDateString('es-ES') : 'N/A' }}</p>
              </div>
            </div>
          </div>
          <!-- sección conversión en vista -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-md font-medium text-gray-900 mb-2">Conversión de montos</h4>
            <p class="text-sm">Tasa utilizada: <strong>{{ retiro.cambio_moneda ? Number(retiro.cambio_moneda).toFixed(2) : '-' }}</strong></p>
            <p class="text-sm">CUP → USD: <strong>{{ retiro.cantidad_retirada_cup && retiro.cambio_moneda ? (Number(retiro.cantidad_retirada_cup) / Number(retiro.cambio_moneda)).toFixed(5) : '' }}</strong></p>
            <p class="text-sm">USD → CUP: <strong>{{ retiro.cantidad_retirada_usd && retiro.cambio_moneda ? (Number(retiro.cantidad_retirada_usd) * Number(retiro.cambio_moneda)).toFixed(5) : '' }}</strong></p>
          </div>

          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-md font-medium text-gray-900 mb-3">Información del Sistema</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Creado</label>
                <p class="mt-1 text-sm text-gray-900">{{ retiro.createdAt ? new Date(retiro.createdAt).toLocaleString('es-ES') : 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Última Actualización</label>
                <p class="mt-1 text-sm text-gray-900">{{ retiro.updatedAt ? new Date(retiro.updatedAt).toLocaleString('es-ES') : 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad CUP</label>
              <input
                type="number"
                v-model.number="form.cantidad_retirada_cup"
                step="any"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Cantidad en CUP..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad USD</label>
              <input
                type="number"
                v-model.number="form.cantidad_retirada_usd"
                step="any"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Cantidad en USD..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                v-model="form.fecha"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <input
                type="text"
                v-model="form.motivo"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Motivo..."
              />
            </div>
          <!-- sección de conversión -->
          <div class="md:col-span-2 bg-gray-50 rounded-lg p-4">
            <h4 class="text-md font-medium text-gray-900 mb-2">Cambio de moneda</h4>
            <p class="text-sm">Tasa utilizada: <strong>{{ cambioMonedaDisplay }}</strong></p>
            <p class="text-sm">CUP → USD: <strong>{{ convertedFromCUP }}</strong></p>
            <p class="text-sm">USD → CUP: <strong>{{ convertedFromUSD }}</strong></p>
          </div>
          </div>

          <div v-if="errorList.length" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
            <div v-for="(e, idx) in errorList" :key="idx">{{ e }}</div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <button
          v-if="!isViewing"
          @click="onSubmit"
          :disabled="isLoading"
          class="px-4 py-2 bg-primary text-neutral rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {{ isLoading ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar' : 'Crear') }}
        </button>
        <button
          @click="onRequestClose"
          :disabled="isLoading"
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cerrar
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, reactive, watch, nextTick, computed } from 'vue';
import Modal from '@/components/Modal.vue';
import MessageBanner from '@/components/MessageBanner.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  retiro: { type: Object, default: () => ({}) },
  isViewing: { type: Boolean, default: true },
  isEditing: { type: Boolean, default: false },
  submitHandler: { type: Function, default: null }
});

const emit = defineEmits(['update:modelValue', 'submit', 'success']);

const form = reactive({
  cantidad_retirada_cup: null,
  cantidad_retirada_usd: null,
  cambio_moneda: null,
  motivo: '',
  fecha: '',
  id_usuario: null
});
const cambioMoneda = ref(null);

const errorList = ref([]);
const isLoading = ref(false);
const message = ref(null);
const contentWrapper = ref(null);
const cambioMonedaInitialized = ref(false);

const convertedFromCUP = computed(() => {
  if (!cambioMoneda.value || !form.cantidad_retirada_cup) return '';
  const num = Number(form.cantidad_retirada_cup) || 0;
  return (num / cambioMoneda.value).toFixed(5);
});
const convertedFromUSD = computed(() => {
  if (!cambioMoneda.value || !form.cantidad_retirada_usd) return '';
  const num = Number(form.cantidad_retirada_usd) || 0;
  return (num * cambioMoneda.value).toFixed(5);
});
const cambioMonedaDisplay = computed(() => cambioMoneda.value != null ? Number(cambioMoneda.value).toFixed(5) : '-');

// Helper para cargar cambio_moneda desde localStorage
function loadCambioMoneda() {
  try {
    const cfg = localStorage.getItem('config');
    if (cfg) {
      const parsed = JSON.parse(cfg);
      if (parsed && parsed.cambio_moneda) {
        cambioMoneda.value = Number(parsed.cambio_moneda) || 1;
      } else {
        cambioMoneda.value = 1;
      }
    } else {
      cambioMoneda.value = 1;
    }
  } catch (e) {
    cambioMoneda.value = 1;
  }
  cambioMonedaInitialized.value = true;
}

// Cargar cambio_moneda la primera vez que se abre el modal
watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      // Garantizar que cambio_moneda se carga la primera vez
      if (!cambioMonedaInitialized.value) {
        loadCambioMoneda();
      } else {
        // En aperturas subsecuentes, recargarlo por si cambió
        try {
          const cfg = localStorage.getItem('config');
          if (cfg) {
            const parsed = JSON.parse(cfg);
            if (parsed && parsed.cambio_moneda) {
              cambioMoneda.value = Number(parsed.cambio_moneda) || 1;
            }
          }
        } catch (e) {
          // ignorar
        }
      }

      await nextTick();

      // Si abrimos en modo crear, inicializamos el formulario con la tasa de config
      if (!props.isEditing && !props.isViewing) {
        // limpiar campos para nueva entrada
        form.cantidad_retirada_cup = 0;
        form.cantidad_retirada_usd = 0;
        form.motivo = '';
        // set fecha actual del navegador
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        form.fecha = `${yyyy}-${mm}-${dd}`;
        form.cambio_moneda = cambioMoneda.value != null ? cambioMoneda.value : 1;
        errorList.value = [];
        message.value = null;

        if (process.client) {
          const stored = localStorage.getItem('usuario');
          if (stored) {
            try {
              const u = JSON.parse(stored);
              form.id_usuario = u.id_usuario || u.id || null;
            } catch (e) {
              form.id_usuario = null;
            }
          }
        }
      } else {
        // modo ver/editar -> usar valor del retiro cargado
        cambioMoneda.value = props.retiro?.cambio_moneda || cambioMoneda.value || 1;
        form.cambio_moneda = props.retiro?.cambio_moneda || null;
        errorList.value = [];
        message.value = null;
      }
    } else {
      errorList.value = [];
      message.value = null;
    }
  },
  { immediate: false, flush: 'post' }
);

watch(
  () => props.retiro,
  (val) => {
    if (val && Object.keys(val).length) {
      form.cantidad_retirada_cup = val.cantidad_retirada_cup || 0;
      form.cantidad_retirada_usd = val.cantidad_retirada_usd || 0;
      form.cambio_moneda = val.cambio_moneda || null;
      cambioMoneda.value = val.cambio_moneda || cambioMoneda.value || 1;
      form.motivo = val.motivo || '';
      form.fecha = val.fecha ? val.fecha.substring(0, 10) : '';
      form.id_usuario = val.id_usuario || null;
    } else {
      form.cantidad_retirada_cup = 0;
      form.cantidad_retirada_usd = 0;
      form.cambio_moneda = null;
      cambioMoneda.value = null;
      form.motivo = '';
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      form.fecha = `${yyyy}-${mm}-${dd}`;
      if (process.client) {
        const stored = localStorage.getItem('usuario');
        if (stored) {
          try {
            const u = JSON.parse(stored);
            form.id_usuario = u.id_usuario || u.id || null;
          } catch (e) {
            form.id_usuario = null;
          }
        }
      }
    }
  },
  { immediate: true, deep: true }
);

function onRequestClose() {
  if (isLoading.value) return;
  emit('update:modelValue', false);
}

async function onSubmit() {
  console.log('onSubmit called, submitHandler:', props.submitHandler);
  errorList.value = [];
  // ensure we have an user id (sometimes storage may not have been read earlier)
  if ((!form.id_usuario || form.id_usuario === null) && process.client) {
    try {
      const stored = localStorage.getItem('usuario');
      if (stored) {
        const u = JSON.parse(stored);
        form.id_usuario = u.id_usuario || u.id || null;
      }
    } catch {}
  }

  if (form.cantidad_retirada_cup == null && form.cantidad_retirada_usd == null) {
    errorList.value.push('Debe ingresar al menos un monto en CUP o USD');
  }
  if (!form.motivo) errorList.value.push('Debe indicar un motivo');
  if (!form.fecha) errorList.value.push('Debe seleccionar una fecha');
  if (!form.id_usuario) errorList.value.push('Usuario inválido');
  if (errorList.value.length) {
    console.log('form validation failed', errorList.value);
    return;
  }

  const payload = {
    cantidad_retirada_cup: form.cantidad_retirada_cup != null ? Number(form.cantidad_retirada_cup) : null,
    cantidad_retirada_usd: form.cantidad_retirada_usd != null ? Number(form.cantidad_retirada_usd) : null,
    cambio_moneda: cambioMoneda.value != null ? Number(cambioMoneda.value) : null,
    motivo: form.motivo,
    fecha: form.fecha,
    id_usuario: form.id_usuario
  };
  console.log('onSubmit payload', payload);

  // si el padre provee un manejador, usarlo
  if (props.submitHandler && typeof props.submitHandler === 'function') {
    try {
      isLoading.value = true;
      const created = await props.submitHandler(payload);
      // esperamos que el handler arroje error si algo sale mal
      emit('success', { title: props.isEditing ? 'Retiro actualizado' : 'Retiro creado', description: '' });
      emit('update:modelValue', false);
    } catch (e) {
      errorList.value.push(e.message || 'Error al guardar');
    } finally {
      isLoading.value = false;
    }
    return;
  }

  emit('submit', payload);
}
</script>