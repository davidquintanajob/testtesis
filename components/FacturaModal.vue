a <template>
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
    
    <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
      <!-- Encabezado -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          {{ isViewing ? 'Detalles de Factura' : (isEditing ? 'Editar Factura' : 'Nueva Factura') }}
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
            <SelectSearchAPI
              v-model="formData.id_entidad"
              endpoint="/entidad/filter/1/10"
              method="POST"
              search-key="nombre"
              label-key="nombre"
              value-key="id_entidad"
              placeholder="Buscar entidad por nombre..."
              :disabled="isViewing || isLoading"
              :initial-label="initialEntidadLabel"
              @entidad-seleccionada="handleEntidadSeleccionada"
            />
          </div>
          <!-- Contrato -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contrato</label>
            <SelectSearch
              v-model="formData.id_contrato"
              :options="contratosFiltrados"
              labelKey="displayLabel"
              valueKey="id_contrato"
              :disabled="isViewing || isLoading || !formData.id_entidad"
              :class="{ 'opacity-50': !formData.id_entidad }"
              placeholder="Seleccione primero una entidad..."
            />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <!-- Usuario -->
          <div v-if="isViewing || isEditing">
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <SelectSearchAPI
              v-model="formData.id_usuario"
              endpoint="/Usuario/filterUsers"
              method="POST"
              search-key="nombre_usuario"
              label-key="nombre_usuario"
              value-key="id_usuario"
              placeholder="Buscar usuario por nombre..."
              :disabled="true"
              :initial-label="initialUsuarioLabel"
              :direct-data="true"
              :class="{ 'opacity-50': isViewing || isEditing }"
            />
          </div>
          <!-- Trabajador Autorizado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Trabajador Autorizado</label>
            <SelectSearchAPI
              v-model="formData.id_trabajador_autorizado"
              endpoint="/trabajadorAutorizado/filter/1/10"
              method="POST"
              search-key="nombre"
              label-key="nombre"
              value-key="id_trabajador"
              placeholder="Buscar trabajador por nombre..."
              :disabled="isViewing || isLoading"
              :initial-label="initialTrabajadorLabel"
            />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <!-- Número Consecutivo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Número Consecutivo</label>
            <input v-model="formData.num_consecutivo" type="number" :readonly="isViewing || !canEditConsecutivo" :disabled="isLoading"
              :class="[
                'w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500',
                { 'bg-gray-100 text-gray-500': isViewing || !canEditConsecutivo }
              ]"
              required />
          </div>
          
          <!-- Fecha -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input v-model="formData.fecha" type="date" :readonly="isViewing" :disabled="isViewing || isLoading"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <!-- Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <SelectSearch
              v-model="formData.estado"
              :options="estadoOptions"
              labelKey="label"
              valueKey="value"
              :disabled="isViewing || isLoading"
              placeholder="Selecciona un estado"
            />
          </div>
          <!-- Cargo Adicional -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cargo Adicional</label>
            <input v-model="formData.cargoAdicional" type="number" :readonly="isViewing" :disabled="isViewing || isLoading"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese cargo adicional (opcional)" />
          </div>
        </div>

        <!-- Nota -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nota</label>
          <textarea v-model="formData.nota" :readonly="isViewing" :disabled="isViewing || isLoading"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2" placeholder="Ingrese una nota opcional"></textarea>
        </div>

        <!-- Tipo de Factura -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-2 text-center">Tipo de Factura</label>
          <div class="relative flex w-full">
            <div
              class="absolute top-0 left-0 w-1/2 h-full bg-primary rounded-lg transition-transform duration-300"
              :class="selectedTipo === 'productos' ? 'transform translate-x-0' : 'transform translate-x-full'"
            ></div>
            <button
              type="button"
              @click="selectTipo('productos')"
              class="relative flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 z-10"
              :class="selectedTipo === 'productos' ? 'text-neutral bg-transparent' : 'text-dark bg-secondary'"
              :disabled="isViewing || isLoading"
            >
              Venta Productos
            </button>
            <button
              type="button"
              @click="selectTipo('servicios')"
              class="relative flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 z-10"
              :class="selectedTipo === 'servicios' ? 'text-neutral bg-transparent' : 'text-dark bg-secondary'"
              :disabled="isViewing || isLoading"
            >
              Prestación de Servicios
            </button>
          </div>
        </div>

        <!-- Contenedor de Productos -->
        <div v-if="selectedTipo === 'productos'" class="mt-4">
          <h3 class="text-lg font-semibold mb-2">Productos</h3>
          <div class="grid grid-cols-1 md:grid-cols-7 gap-4 mb-2 font-semibold text-gray-700">
            <span class="col-span-2">Producto</span>
            <span>Uni/Medida</span>
            <span>Cantidad</span>
            <span>Precio</span>
            <span>Total</span>
            <span>Acción</span>
          </div>
          <div v-for="(producto, index) in productos" :key="index" class="grid grid-cols-1 md:grid-cols-7 gap-4 mb-2">
            <SelectSearchAPI
              v-model="producto.id_producto"
              endpoint="/producto/filterProductos/1/10"
              method="POST"
              search-key="nombre"
              label-key="nombre"
              value-key="id_producto"
              placeholder="Buscar producto por nombre..."
              :disabled="isViewing || isLoading"
              :initial-label="producto.nombre || ''"
              @producto-seleccionado="(selected) => handleProductoSeleccionado(selected, index)"
              class="col-span-2"
            />
            <input v-model="producto.unidadMedida" type="text" placeholder="Uni/Medida" readonly class="px-4 py-2 border-2 border-gray-400 rounded-lg opacity-50" />
            <input v-model.number="producto.cantidad" @blur="formatCantidad(producto)" type="number" step="0.01" placeholder="Cantidad" class="px-4 py-2 border-2 border-gray-400 rounded-lg" :disabled="isViewing || isLoading" />
            <input v-model.number="producto.precio" @blur="formatPrecio(producto)" type="number" step="0.01" placeholder="Precio" :readonly="!isEditing || isViewing" :disabled="isViewing || isLoading" class="px-4 py-2 border-2 border-gray-400 rounded-lg" :class="{ 'opacity-50': !isEditing || isViewing }" />
            <input :value="calcularTotal(producto)" type="text" readonly class="px-4 py-2 border-2 border-blue-400 bg-blue-50 rounded-lg font-bold text-blue-800" />
            <button @click="removeProducto(index)" type="button" class="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center" :disabled="isViewing || isLoading">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          </div>
          <button @click="addProducto" type="button" class="px-4 py-2 bg-purple-500 text-white rounded-lg mt-2 flex items-center" :disabled="isViewing || isLoading">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Producto
          </button>
          <div class="mt-4 p-4 bg-gray-100 rounded-lg">
            <strong>Importe Total Productos: {{ importeTotalProductos }}</strong>
          </div>
        </div>

          <!-- Contenedor de Servicios -->
          <div v-if="selectedTipo === 'servicios'" class="mt-4">
            <h3 class="text-lg font-semibold mb-2">Servicios</h3>
            <div class="grid grid-cols-1 md:grid-cols-7 gap-4 mb-2 font-semibold text-gray-700">
              <span class="col-span-2">Descripción</span>
              <span>Uni/Medida</span>
              <span>Cantidad</span>
              <span>Importe</span>
              <span>Total</span>
              <span>Acción</span>
            </div>
            <div v-for="(servicio, index) in services" :key="servicio.id_servicio" class="grid grid-cols-1 md:grid-cols-7 gap-4 mb-2">
              <input v-model="servicio.descripcion" type="text" placeholder="Descripción" class="col-span-2 px-4 py-2 border-2 border-gray-400 rounded-lg" :disabled="isViewing || isLoading" />
            <input v-model="servicio.unidadMedida" type="text" placeholder="Uni/Medida" class="px-4 py-2 border-2 border-gray-400 rounded-lg" :disabled="isViewing || isLoading" />
              <input v-model.number="servicio.cantidad" @blur="formatCantidad(servicio)" type="number" step="0.01" placeholder="Cantidad" class="px-4 py-2 border-2 border-gray-400 rounded-lg" :disabled="isViewing || isLoading" />
              <input v-model.number="servicio.importe" @blur="formatImporte(servicio)" type="number" step="0.01" placeholder="Importe" class="px-4 py-2 border-2 border-gray-400 rounded-lg" :disabled="isViewing || isLoading" />
              <input :value="calcularTotal(servicio)" type="text" readonly class="px-4 py-2 border-2 border-blue-400 bg-blue-50 rounded-lg font-bold text-blue-800" />
              <button @click="removeServicio(index)" type="button" class="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center" :disabled="isViewing || isLoading">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
            <button @click="addServicio" type="button" class="px-4 py-2 bg-purple-500 text-white rounded-lg mt-2 flex items-center" :disabled="isViewing || isLoading">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Servicio
            </button>
            <div class="mt-4 p-4 bg-gray-100 rounded-lg">
              <strong>Importe Total Servicios: {{ importeTotalServicios }}</strong>
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
              {{ isEditing ? 'Guardar Cambios' : 'Crear Factura' }}
            </span>
          </button>
        </div>
      </form>

      <div v-if="errorMsg" class="text-red-600 text-sm mt-2">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import SelectSearch from './SelectSearch.vue';
import SelectSearchAPI from './SelectSearchAPI.vue';
import MessageBanner from './MessageBanner.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  factura: {
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
  contratos: {
    type: Array,
    default: () => []
  },
  entidades: {
    type: Array,
    default: () => []
  },
  trabajadores: {
    type: Array,
    default: () => []
  },
  usuarios: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'submit']);

const formData = ref({
  id_entidad: '',
  id_contrato: '',
  id_usuario: '',
  id_trabajador_autorizado: '',
  num_consecutivo: '',
  fecha: '',
  estado: '',
  nota: '',
  cargoAdicional: ''
});

const selectedTipo = ref('productos');

watch(() => props.factura, (factura) => {
  if (factura && factura.tipoFactura) {
    selectedTipo.value = factura.tipoFactura;
  } else {
    selectedTipo.value = 'productos';
  }
});

function selectTipo(tipo) {
  if (props.isViewing || props.isLoading) return;
  selectedTipo.value = tipo;
  formData.value.tipoFactura = tipo;
}

const estadoOptions = ref([
  { label: 'Facturado', value: 'Facturado' },
  { label: 'No Facturado', value: 'No Facturado' },
  { label: 'Cancelado', value: 'Cancelado' }
]);

const services = ref([{ descripcion: '', unidadMedida: '', cantidad: 0, importe: 0 }]);
const productos = ref([{ id_producto: '', nombre: '', unidadMedida: '', cantidad: 0, precio: 0 }]);

const errorMsg = ref('');
const isLoading = ref(false);
const loadingBanner = ref(null);

const contratosFiltrados = ref([]); // Added to hold filtered contracts based on selected entity
const entidadCompleta = ref(null); // To hold full entity data from API
const usuarioData = ref(null); // To hold fetched user data
const trabajadorData = ref(null); // To hold fetched worker data

const selectedContract = computed(() => {
  return contratosFiltrados.value.find(contrato => contrato.id_contrato === formData.value.id_contrato);
});

const canEditConsecutivo = computed(() => {
  if (!selectedContract.value) return false;
  return selectedContract.value.ClienteOProveedor !== 'Cliente';
});

// Función para obtener el siguiente número consecutivo
async function fetchNextConsecutivo() {
  const token = localStorage.getItem('token');

  if (!token) {
    navigateTo('/');
    return;
  }

  try {
    const config = useRuntimeConfig();
    const currentYear = new Date().getFullYear();
    const res = await fetch(`${config.public.backendHost}/Factura/nextConsecutivo/${currentYear}`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });

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
      if (data.data && data.data.nextConsecutivo) {
        formData.value.num_consecutivo = data.data.nextConsecutivo;
        // Guardar el número consecutivo en localStorage para uso futuro
        localStorage.setItem('num_consecutivo_guardado', data.data.nextConsecutivo);
      }
    } else {
      console.error('Error al obtener el siguiente consecutivo');
    }
  } catch (err) {
    console.error('Error al obtener el siguiente consecutivo:', err);
  }
}

// Watcher para detectar cuando se abre el modal
watch(() => props.modelValue, async (newValue) => {
  if (newValue) {
    if (!props.isEditing && !props.isViewing) {
      // Es una nueva factura, obtener el siguiente consecutivo
      await fetchNextConsecutivo();
    } else if (props.isViewing) {
      // Es modo ver, obtener y guardar el siguiente consecutivo en localStorage
      await fetchNextConsecutivo();
    }
  }
});

watch(() => props.factura, async (factura) => {
  if (factura && Object.keys(factura).length > 0) {
    formData.value = {
      id_entidad: factura.contrato?.id_entidad || '',
      id_contrato: factura.id_contrato || '',
      id_usuario: factura.id_usuario || '',
      id_trabajador_autorizado: factura.id_trabajador_autorizado || '',
      num_consecutivo: factura.num_consecutivo || '',
      fecha: factura.fecha ? factura.fecha.substring(0, 10) : '',
      estado: factura.estado || '',
      nota: factura.nota || '',
      cargoAdicional: factura.cargoAdicional || ''
    };
    // Load productos and servicios
    if (factura.servicio && factura.servicio.length > 0) {
      selectedTipo.value = 'servicios';
      services.value = [...factura.servicio];
      formData.value.services = [...factura.servicio];
      productos.value = [{ id_producto: '', nombre: '', unidadMedida: '', cantidad: 0, precio: 0 }];
      formData.value.products = [];
    } else {
      selectedTipo.value = 'productos'; // default
      if (factura.productos && factura.productos.length > 0) {
        productos.value = factura.productos.map(producto => ({
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          unidadMedida: producto.unidadMedida,
          cantidad: producto.factura_producto?.cantidad || 0,
          precio: producto.factura_producto?.precioVenta || producto.precio
        }));
        formData.value.products = [...factura.productos];
      } else {
        productos.value = [{ id_producto: '', nombre: '', unidadMedida: '', cantidad: 0, precio: 0 }];
        formData.value.products = [];
      }
      services.value = [{ descripcion: '', unidadMedida: '', cantidad: 0, importe: 0 }];
      formData.value.services = [];
    }
    // Load contratosFiltrados based on the entity in factura
    if (factura.contrato?.id_entidad) {
      await cargarContratosPorEntidad(factura.contrato.id_entidad);
    }
    // Load initial data for user and worker if in view/edit mode
    if (props.isViewing || props.isEditing) {
      if (factura.id_usuario) {
        await cargarUsuarioPorId(factura.id_usuario);
      }
      if (factura.id_trabajador_autorizado) {
        await cargarTrabajadorPorId(factura.id_trabajador_autorizado);
      }
    }
    // Si está en modo crear o editar, verificar si el contrato es Cliente y cargar consecutivo guardado
    if (!props.isViewing) {
      const contratoSeleccionado = contratosFiltrados.value.find(c => c.id_contrato === formData.value.id_contrato);
      if (contratoSeleccionado && contratoSeleccionado.ClienteOProveedor === 'Cliente') {
        const consecutivoGuardado = localStorage.getItem('num_consecutivo_guardado');
        if (consecutivoGuardado) {
          formData.value.num_consecutivo = consecutivoGuardado;
          console.log('Carga inicial (crear/editar): Número consecutivo establecido a:', consecutivoGuardado);
        }
      }
    }
  } else {
    formData.value = {
      id_entidad: '',
      id_contrato: '',
      id_usuario: '',
      id_trabajador_autorizado: '',
      num_consecutivo: '',
      fecha: '',
      estado: '',
      nota: '',
      cargoAdicional: ''
    };
    contratosFiltrados.value = [];
    entidadCompleta.value = null;
    usuarioData.value = null;
    trabajadorData.value = null;
    productos.value = [{ id_producto: '', nombre: '', unidadMedida: '', cantidad: 0, precio: 0 }];
    services.value = [{ descripcion: '', unidadMedida: '', cantidad: 0, importe: 0 }];
  }
}, { immediate: true });

// Watcher para cuando se selecciona un contrato en modo crear/editar
watch(() => formData.value.id_contrato, (newIdContrato) => {
  if (!props.isViewing && newIdContrato) {
    const contratoSeleccionado = contratosFiltrados.value.find(c => c.id_contrato === newIdContrato);
    if (contratoSeleccionado && contratoSeleccionado.ClienteOProveedor === 'Cliente') {
      const consecutivoGuardado = localStorage.getItem('num_consecutivo_guardado');
      if (consecutivoGuardado) {
        formData.value.num_consecutivo = consecutivoGuardado;
        console.log('Selección de contrato (crear/editar): Número consecutivo establecido a:', consecutivoGuardado);
      }
    }
  }
});

// Watcher para agregar automáticamente una nueva fila de producto cuando la última esté completa
watch(() => productos.value, (newProductos) => {
  if (newProductos.length > 0 && !props.isViewing) {
    const last = newProductos[newProductos.length - 1];
    if (last.id_producto && last.unidadMedida && last.cantidad > 0 && last.precio > 0) {
      productos.value.push({ id_producto: '', nombre: '', unidadMedida: '', cantidad: 0, precio: 0 });
    }
  }
}, { deep: true });

// Watcher para agregar automáticamente una nueva fila de servicio cuando la última esté completa
watch(() => services.value, (newServicios) => {
  if (newServicios.length > 0 && !props.isViewing) {
    const last = newServicios[newServicios.length - 1];
    if (last.descripcion && last.unidadMedida && last.cantidad > 0 && last.importe > 0) {
      services.value.push({ descripcion: '', unidadMedida: '', cantidad: 0, importe: 0 });
    }
  }
}, { deep: true });

const handleSubmit = async () => {
  errorMsg.value = '';

  // Sync only the selected type's array to formData before submit
  if (selectedTipo.value === 'productos') {
    formData.value.products = productos.value.filter(p => p.id_producto && p.cantidad > 0);
    delete formData.value.services;
  } else {
    formData.value.services = services.value.filter(s => s.descripcion && s.unidadMedida && s.cantidad > 0 && s.importe > 0);
    delete formData.value.products;
  }

  // Si es una nueva factura, obtener el id_usuario del localStorage
  if (!props.isEditing && !props.isViewing) {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      try {
        const usuario = JSON.parse(usuarioData);
        if (usuario && usuario.id_usuario) {
          formData.value.id_usuario = usuario.id_usuario;
        }
      } catch (error) {
        console.error('Error al parsear datos de usuario del localStorage:', error);
      }
    }
  }

  if (!formData.value.id_contrato) {
    errorMsg.value = 'Debe seleccionar un Contrato.';
    return;
  }
  if (!formData.value.id_usuario) {
    errorMsg.value = 'Debe seleccionar un Usuario.';
    return;
  }
  if (!formData.value.num_consecutivo) {
    errorMsg.value = 'Debe ingresar el Número Consecutivo.';
    return;
  }
  if (!formData.value.fecha) {
    errorMsg.value = 'Debe ingresar la Fecha.';
    return;
  }
  if (!formData.value.estado) {
    errorMsg.value = 'Debe seleccionar un Estado.';
    return;
  }

  // Activar estado de carga
  isLoading.value = true;
  loadingBanner.value = {
    title: props.isEditing ? 'Guardando Factura' : 'Creando Factura',
    description: 'Comunicando con el servidor, espere por favor...',
    type: 'warning'
  };

  try {
    // Emitir el evento submit
    emit('submit', { ...formData.value });
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

const initialEntidadLabel = computed(() => {
  if (props.factura && props.factura.contrato && props.factura.contrato.entidad) {
    return props.factura.contrato.entidad.nombre || '';
  }
  return '';
});

const initialUsuarioLabel = computed(() => {
  if (usuarioData.value) {
    return usuarioData.value.nombre || '';
  }
  if (props.factura && props.factura.usuario) {
    return props.factura.usuario.nombre || '';
  }
  return '';
});

const initialTrabajadorLabel = computed(() => {
  if (trabajadorData.value) {
    return trabajadorData.value.nombre || '';
  }
  if (props.factura && props.factura.trabajador_autorizado) {
    return props.factura.trabajador_autorizado.nombre || '';
  }
  return '';
});

const handleEntidadSeleccionada = async (entidad) => {
  if (entidad && entidad.id_entidad) {
    // Limpiar la selección de contrato cuando se selecciona una nueva entidad
    formData.value.id_contrato = '';
    await cargarContratosPorEntidad(entidad.id_entidad);
  } else {
    contratosFiltrados.value = [];
    formData.value.id_contrato = '';
  }
};

// Función para cargar contratos cuando se selecciona una entidad
async function cargarContratosPorEntidad(entidadId) {
  if (!entidadId) {
    contratosFiltrados.value = [];
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    navigateTo('/');
    return;
  }

  // Mostrar banner de carga
  loadingBanner.value = {
    title: 'Cargando Datos de la Base de Datos',
    description: 'Obteniendo contratos de la base de datos...',
    type: 'info'
  };

  try {
    const config = useRuntimeConfig();
    const res = await fetch(`${config.public.backendHost}/entidad/${entidadId}`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });

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
      entidadCompleta.value = data;

      // Procesar los contratos para el formato de display
      const contratos = data?.contratos || [];

      contratosFiltrados.value = contratos.map(contrato => ({
        ...contrato,
        displayLabel: `${contrato.num_consecutivo} - ${contrato.tipoContrato?.nombre || ''} - ${contrato.ClienteOProveedor || ''}`
      }));

    } else {
      console.error('Error en la respuesta:', res.status);
      contratosFiltrados.value = [];
    }
  } catch (err) {
    console.error('Error al cargar contratos:', err);
    contratosFiltrados.value = [];
  } finally {
    // Ocultar banner de carga después de un breve delay
    setTimeout(() => {
      loadingBanner.value = null;
    }, 3000);
  }
}

// Función para cargar usuario por ID
async function cargarUsuarioPorId(usuarioId) {
  if (!usuarioId) return;

  const token = localStorage.getItem('token');
  if (!token) {
    navigateTo('/');
    return;
  }

  try {
    const config = useRuntimeConfig();
    const res = await fetch(`${config.public.backendHost}/Usuario/${usuarioId}`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });

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
      usuarioData.value = { nombre: data.nombre };
    } else {
      console.error('Error al cargar usuario:', res.status);
    }
  } catch (err) {
    console.error('Error al cargar usuario:', err);
  }
}

async function cargarTrabajadorPorId(trabajadorId) {
  if (!trabajadorId) return;

  const token = localStorage.getItem('token');
  if (!token) {
    navigateTo('/');
    return;
  }

  try {
    const config = useRuntimeConfig();
    const res = await fetch(`${config.public.backendHost}/trabajadorAutorizado/${trabajadorId}`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });

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
      trabajadorData.value = { nombre: data.nombre };
    } else {
      console.error('Error al cargar trabajador:', res.status);
    }
  } catch (err) {
    console.error('Error al cargar trabajador:', err);
  }
}

function addServicio() {
  services.value.push({ descripcion: '', unidadMedida: '', cantidad: 0, importe: 0 });
}

function removeServicio(index) {
  if (services.value.length > 1) services.value.splice(index, 1);
}

function addProducto() {
  productos.value.push({ id_producto: '', nombre: '', unidadMedida: '', cantidad: 0, precio: 0 });
}

function handleProductoSeleccionado(selected, index) {
  if (index >= 0 && index < productos.value.length) {
    if (selected) {
      // Find matching facturaProducto for the current factura
      let cantidad = 0;
      let precio = selected.precio || 0;
      if (props.factura && props.factura.id_factura && selected.facturaProductos) {
        const matchingFacturaProducto = selected.facturaProductos.find(fp => fp.id_factura === props.factura.id_factura);
        if (matchingFacturaProducto) {
          cantidad = Number(matchingFacturaProducto.cantidad) || 0;
          precio = Number(matchingFacturaProducto.precioVenta) || selected.precio || 0;
        }
      }

      productos.value[index] = {
        ...productos.value[index],
        id_producto: selected.id_producto,
        nombre: selected.nombre,
        unidadMedida: selected.unidadMedida || '',
        cantidad: cantidad,
        precio: precio
      };
    } else {
      // Clearing selection
      productos.value[index] = {
        ...productos.value[index],
        id_producto: '',
        nombre: '',
        unidadMedida: '',
        cantidad: 0,
        precio: 0
      };
    }
  }
}

function removeProducto(index) {
  if (productos.value.length > 1) productos.value.splice(index, 1);
}

const formatCantidad = (item) => {
  if (item.cantidad !== undefined && item.cantidad !== null) {
    item.cantidad = Number(item.cantidad).toFixed(2);
  }
};

const formatPrecio = (item) => {
  if (item.precio !== undefined && item.precio !== null) {
    item.precio = Number(item.precio).toFixed(2);
  }
};

const formatImporte = (item) => {
  if (item.importe !== undefined && item.importe !== null) {
    item.importe = Number(item.importe).toFixed(2);
  }
};

function calcularTotal(item) {
  const cantidad = Number(item.cantidad) || 0;
  const precio = Number(item.precio) || 0;
  const importe = Number(item.importe) || 0;
  // For productos, use precio; for servicios, use importe
  const multiplier = item.precio !== undefined ? precio : importe;
  return (cantidad * multiplier).toFixed(2);
}

const importeTotalProductos = computed(() => {
  const productosTotal = productos.value.reduce((total, producto) => {
    return total + (Number(producto.cantidad) * Number(producto.precio));
  }, 0);
  return (productosTotal + (Number(formData.value.cargoAdicional) || 0)).toFixed(2);
});

const importeTotalServicios = computed(() => {
  const serviciosTotal = services.value.reduce((total, servicio) => {
    return total + (Number(servicio.cantidad) * Number(servicio.importe));
  }, 0);
  return (serviciosTotal + (Number(formData.value.cargoAdicional) || 0)).toFixed(2);
});

</script>
