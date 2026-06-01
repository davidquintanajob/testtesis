<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <!-- MessageBanner para mostrar estado de carga -->
    <div v-if="loadingBanner" class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none">
      <MessageBanner 
        :title="loadingBanner.title" 
        :description="loadingBanner.description" 
        :type="loadingBanner.type"
        @close="loadingBanner = null" 
        class="pointer-events-auto" 
      />
    </div>
    
    <div class="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
      <!-- Encabezado -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          {{ isViewing ? 'Detalles de Contrato' : (isEditing ? 'Editar Contrato' : 'Nuevo Contrato') }}
        </h2>
        <button @click="$emit('update:modelValue', false)" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Entidad -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Entidad</label>
            <SelectSearch
              v-model="formData.id_entidad"
              :options="entidades"
              labelKey="nombre"
              valueKey="id_entidad"
              :disabled="isViewing || isLoading"
              placeholder="Selecciona una entidad"
            />
          </div>
          <!-- Tipo de Contrato -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Contrato</label>
            <SelectSearch
              v-model="formData.id_tipo_contrato"
              :options="tiposContrato"
              labelKey="nombre"
              valueKey="id_tipo_contrato"
              :disabled="isViewing || isLoading"
              placeholder="Selecciona un tipo de contrato"
            />
          </div>
          <!-- Fecha Inicio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
            <input v-model="formData.fecha_inicio" type="date" :readonly="isViewing" :disabled="isViewing || isLoading"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="handleFechaInicioChange"
              required />
          </div>
          <!-- Fecha Fin -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
            <input v-model="formData.fecha_fin" type="date" :readonly="isViewing" :disabled="isViewing || isLoading"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required />
          </div>
          <!-- Número Consecutivo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Número Consecutivo</label>
            <input
              v-model="formData.num_consecutivo"
              type="text"
              :readonly="isViewing || !canEditConsecutivo"
              :disabled="isViewing || isLoading"
              @input="handleConsecutivoInput"
              :class="[
                'w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500',
                { 'opacity-50': !canEditConsecutivo }
              ]"
              required
            />
          </div>
          <!-- Clasificación -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Clasificación</label>
            <input v-model="formData.clasificacion" type="text" :readonly="isViewing" :disabled="isViewing || isLoading"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <!-- Cliente o Proveedor -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cliente o Proveedor</label>
            <SelectSearch
              v-model="formData.ClienteOProveedor"
              :options="clienteOProveedorOptions"
              labelKey="label"
              valueKey="value"
              :disabled="isViewing || isLoading"
              placeholder="Selecciona..."
            />
          </div>
          <!-- Vigencia de pago/cobro facturas -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Vigencia de pago/cobro facturas (días)</label>
            <input v-model.number="formData.vigenciaFacturasDias" type="number" :readonly="isViewing" :disabled="isViewing || isLoading"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0" required />
          </div>
          <!-- Nota -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nota</label>
            <textarea v-model="formData.nota" :readonly="isViewing" :disabled="isViewing || isLoading"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2" placeholder="Ingrese una nota opcional"></textarea>
          </div>
        </div>
        <!-- Botones de acción -->
        <div class="flex justify-end space-x-4 mt-6" v-if="!isViewing">
          <button type="button" @click="$emit('update:modelValue', false)"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            :disabled="isLoading">
            Cancelar
          </button>
          <button type="submit"
            class="px-4 py-2 text-neutral bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading">
            <span v-if="isLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isEditing ? 'Guardando...' : 'Creando...' }}
            </span>
            <span v-else>
              {{ isEditing ? 'Guardar Cambios' : 'Crear Contrato' }}
            </span>
          </button>
        </div>
      </form>
      <!-- Tablas de detalles -->
      <div v-if="isViewing || isEditing" class="mt-8 space-y-8">
        <div>
          <h3 class="text-lg font-semibold mb-2">Trabajadores Autorizados</h3>
          <DataTable
            :columns="trabajadoresColumns"
            :items="trabajadoresData"
            :total-items="trabajadoresTotal"
            :items-per-page="trabajadoresPerPage"
            :current-page="trabajadoresPage"
            :is-loading="false"
            @page-change="handleTrabajadoresPageChange"
          />
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Ofertas</h3>
          <DataTable
            :columns="ofertasColumns"
            :items="ofertasData"
            :total-items="ofertasTotal"
            :items-per-page="ofertasPerPage"
            :current-page="ofertasPage"
            :is-loading="false"
            @page-change="handleOfertasPageChange"
          />
        </div>
      </div>
      <div v-if="errorMsg" class="text-red-600 text-sm mt-2">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import SelectSearch from './SelectSearch.vue';
import DataTable from './DataTable.vue';
import MessageBanner from './MessageBanner.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  contrato: {
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
  },
  entidades: {
    type: Array,
    default: () => []
  },
  tiposContrato: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'submit']);

const formData = ref({
  id_entidad: '',
  id_tipo_contrato: '',
  fecha_inicio: '',
  fecha_fin: '',
  num_consecutivo: '',
  clasificacion: '',
  ClienteOProveedor: '',
  vigenciaFacturasDias: 30,
  nota: ''
});

const clienteOProveedorOptions = ref([
  { label: 'Cliente', value: 'Cliente' },
  { label: 'Proveedor', value: 'Proveedor' }
]);

const errorMsg = ref('');
const isLoading = ref(false);
const loadingBanner = ref(null);

// Función para obtener el siguiente número consecutivo
async function fetchNextConsecutivo() {
  const token = localStorage.getItem('token');
  
  // Verificar si hay token
  if (!token) {
    navigateTo('/');
    return;
  }
  
  try {
    const currentYear = new Date().getFullYear();
    const config = useRuntimeConfig();
    const res = await fetch(`${config.public.backendHost}/contrato/next-consecutivo/${currentYear}`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });
    
    // Verificar si hay error de autenticación
    if (res.status === 401 || res.status === 403) {
      errorBanner.value = {
        title: 'Sesión Expirada',
        description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        type: 'warning'
      };
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setTimeout(() => {
        navigateTo('/');
      }, 3000);
      return;
    }
    
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.siguiente_consecutivo) {
        formData.value.num_consecutivo = data.data.siguiente_consecutivo;
      }
    } else {
      console.error('Error al obtener el siguiente consecutivo');
    }
  } catch (err) {
    console.error('Error al obtener el siguiente consecutivo:', err);
  }
}

// Watcher para detectar cuando se abre el modal en modo "nuevo contrato"
watch(() => props.modelValue, async (newValue) => {
  if (newValue && !props.isEditing && !props.isViewing) {
    // Es un nuevo contrato, obtener el siguiente consecutivo
    await fetchNextConsecutivo();
  }
});

watch(() => props.contrato, (contrato) => {
  if (contrato && Object.keys(contrato).length > 0) {
    formData.value = {
      id_entidad: contrato.id_entidad || '',
      id_tipo_contrato: contrato.id_tipo_contrato || '',
      fecha_inicio: contrato.fecha_inicio ? contrato.fecha_inicio.substring(0, 10) : '',
      fecha_fin: contrato.fecha_fin ? contrato.fecha_fin.substring(0, 10) : '',
      num_consecutivo: contrato.num_consecutivo || '',
      clasificacion: contrato.clasificacion || '',
      ClienteOProveedor: contrato.ClienteOProveedor || '',
      vigenciaFacturasDias: contrato.vigenciaFacturasDias || 30,
      nota: contrato.nota || ''
    };
  } else {
    formData.value = {
      id_entidad: '',
      id_tipo_contrato: '',
      fecha_inicio: '',
      fecha_fin: '',
      num_consecutivo: '',
      clasificacion: '',
      ClienteOProveedor: '',
      vigenciaFacturasDias: 30,
      nota: ''
    };
  }
}, { immediate: true });

const handleSubmit = async () => {
  errorMsg.value = '';
  if (!formData.value.id_entidad) {
    errorMsg.value = 'Debe seleccionar una Entidad.';
    return;
  }
  if (!formData.value.id_tipo_contrato) {
    errorMsg.value = 'Debe seleccionar un Tipo de Contrato.';
    return;
  }
  if (!formData.value.fecha_inicio) {
    errorMsg.value = 'Debe ingresar la Fecha de Inicio.';
    return;
  }
  if (!formData.value.fecha_fin) {
    errorMsg.value = 'Debe ingresar la Fecha de Fin.';
    return;
  }
  if (!formData.value.num_consecutivo) {
    errorMsg.value = 'Debe ingresar el Número Consecutivo.';
    return;
  }
  // Validate num_consecutivo format according to new rules (coerce to string)
  const val = String(formData.value.num_consecutivo ?? '');
  const slashIndex = val.indexOf('/');
  if (slashIndex === -1) {
    // No slash, must be only numbers
    if (!/^\d+$/.test(val)) {
      errorMsg.value = 'El Número Consecutivo debe contener solo números si no tiene "/".';
      return;
    }
  } else {
    // Slash present, left side must be numbers and not empty
    const left = val.substring(0, slashIndex);
    if (!left || !/^\d+$/.test(left)) {
      errorMsg.value = 'La parte izquierda del "/" debe contener solo números y no puede estar vacía.';
      return;
    }
    // Right side can be anything, no validation needed
  }
  if (!formData.value.ClienteOProveedor) {
    errorMsg.value = 'Debe seleccionar si este contrato es como Cliente o Proveedor.';
    return;
  }
  if (!formData.value.vigenciaFacturasDias || formData.value.vigenciaFacturasDias < 0) {
    errorMsg.value = 'El campo "Vigencia de pago/cobro facturas (días)" es obligatorio y debe ser un número mayor o igual a 0.';
    return;
  }
  
  // Activar estado de carga
  isLoading.value = true;
  loadingBanner.value = {
    title: props.isEditing ? 'Guardando Contrato' : 'Creando Contrato',
    description: 'Comunicando con el servidor, espere por favor...',
    type: 'warning'
  };
  
  try {
    // Emitir el evento submit y esperar la respuesta
    await new Promise((resolve, reject) => {
      emit('submit', { ...formData.value });
      // Simular un pequeño delay para que el usuario vea el mensaje
      setTimeout(resolve, 100);
    });
  } catch (error) {
    console.error('Error en handleSubmit:', error);
  } finally {
    // Desactivar estado de carga después de un breve delay
    setTimeout(() => {
      isLoading.value = false;
      loadingBanner.value = null;
    }, 500);
  }
};

// Función para manejar el cambio de fecha de inicio
const handleFechaInicioChange = () => {
  // Solo aplicar la lógica si es un nuevo contrato (no edición ni visualización)
  if (!props.isEditing && !props.isViewing && formData.value.fecha_inicio) {
    const fechaInicio = new Date(formData.value.fecha_inicio);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setFullYear(fechaFin.getFullYear() + 5);
    
    // Formatear la fecha de fin como YYYY-MM-DD
    const fechaFinFormateada = fechaFin.toISOString().split('T')[0];
    formData.value.fecha_fin = fechaFinFormateada;
  }
};

// Columnas para trabajadores autorizados
const trabajadoresColumns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'carnet_identidad', label: 'Carnet de Identidad' },
  { key: 'num_telefono', label: 'Teléfono' }
];
const trabajadoresPage = ref(1);
const trabajadoresPerPage = 5;
const trabajadoresData = computed(() => {
  if (!props.contrato || !Array.isArray(props.contrato.trabajadoresAutorizados)) return [];
  return props.contrato.trabajadoresAutorizados;
});
const trabajadoresTotal = computed(() => trabajadoresData.value.length);
const handleTrabajadoresPageChange = (newPage) => {
  trabajadoresPage.value = newPage;
};

// Columnas para ofertas
const ofertasColumns = [
  { key: 'id_oferta', label: 'ID Oferta' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'fecha_inicio', label: 'Fecha Inicio', format: (val) => val?.substring(0, 10) },
  { key: 'fecha_fin', label: 'Fecha Fin', format: (val) => val?.substring(0, 10) }
];
const ofertasPage = ref(1);
const ofertasPerPage = 5;
const ofertasData = computed(() => {
  if (!props.contrato || !Array.isArray(props.contrato.oferta)) return [];
  return props.contrato.oferta.map(o => ({
    ...o,
    fecha_inicio: o.fecha_inicio ? o.fecha_inicio.substring(0, 10) : '',
    fecha_fin: o.fecha_fin ? o.fecha_fin.substring(0, 10) : ''
  }));
});
const ofertasTotal = computed(() => ofertasData.value.length);
const handleOfertasPageChange = (newPage) => {
  ofertasPage.value = newPage;
};

const canEditConsecutivo = computed(() => {
  return formData.value.ClienteOProveedor && formData.value.ClienteOProveedor !== 'Cliente';
});

const handleConsecutivoInput = (event) => {
  let val = event.target.value;
  // If first non-numeric character typed and no slash yet, insert slash automatically
  const slashIndex = val.indexOf('/');
  if (slashIndex === -1) {
    // Find first non-digit character
    const firstNonDigitIndex = val.search(/\D/);
    if (firstNonDigitIndex !== -1) {
      // Insert slash at first non-digit character position
      val = val.slice(0, firstNonDigitIndex) + '/' + val.slice(firstNonDigitIndex);
    }
  }
  // Validate left side of slash is only numbers
  const parts = val.split('/');
  if (parts.length > 1) {
    // Left side must be numbers only
    parts[0] = parts[0].replace(/\D/g, '');
    val = parts[0] + '/' + parts.slice(1).join('/');
  } else {
    // No slash, only numbers allowed
    val = val.replace(/\D/g, '');
  }
  formData.value.num_consecutivo = val;
};
</script>
