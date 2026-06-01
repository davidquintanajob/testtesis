<template>
    <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <!-- Blocking loading overlay (controlled by parent via prop `isLoading`) -->
    <div v-if="isLoading" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <p class="text-gray-700 font-medium">Procesando, espere...</p>
      </div>
    </div>
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

    <div :class="['bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto', isLoading && 'pointer-events-none opacity-50']">
      <!-- Encabezado -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          {{ isViewing ? 'Detalles de Producto' : (isEditing ? 'Editar Producto' : 'Nuevo Producto') }}
        </h2>
        <button @click="$emit('update:modelValue', false)" :disabled="isLoading" class="text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Código -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input v-model="formData.codigo" type="text" required :readonly="isViewing" :disabled="isViewing || isLoading"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese el código del producto" />
          </div>
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input v-model="formData.nombre" type="text" required :readonly="isViewing" :disabled="isViewing || isLoading"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese el nombre del producto" />
          </div>
          <!-- Precio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input v-model="formData.precio" @input="onPrecioInput" type="number" step="any" :readonly="isViewing" :disabled="isViewing || isLoading"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese el precio" />
          </div>
            <!-- Costo -->
            <div v-if="!isVendedor">
              <label class="block text-sm font-medium text-gray-700 mb-1">Costo</label>
              <input v-model="formData.costo" @input="onCostoInput" type="number" step="any" :readonly="isViewing" :disabled="isViewing || isLoading"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el costo" />
            </div>
            <!-- Precio USD y Costo USD (solo administradores) -->
            <div v-if="isAdmin">
              <label class="block text-sm font-medium text-gray-700 mb-1">Precio USD</label>
              <input v-model="formData.precio_usd" @input="onPrecioUsdInput" type="number" step="any" :readonly="isViewing" :disabled="isViewing || isLoading"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el precio en USD" />
            </div>
            <div v-if="isAdmin">
              <label class="block text-sm font-medium text-gray-700 mb-1">Costo USD</label>
              <input v-model="formData.costo_usd" @input="onCostoUsdInput" type="number" step="any" :readonly="isViewing" :disabled="isViewing || isLoading"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el costo en USD" />
            </div>
            <!-- Costo Inspectores CUP -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Costo Inspectores CUP</label>
              <input v-model="formData.precio_inspectores_cup" @input="onPrecioInspectoresInput" type="number" step="any" min="0" :readonly="isViewing" :disabled="isViewing || isLoading"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el precio para inspectores (CUP)" />
            </div>
          <!-- Unidad de Medida -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
            <input v-model="formData.unidadMedida" type="text" required :readonly="isViewing" :disabled="isViewing || isLoading"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese la unidad de medida" />
          </div>
          <!-- Tipo de Producto -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Producto</label>
            <input v-model="formData.tipoProducto" type="text" required :readonly="isViewing" :disabled="isViewing || isLoading"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese el tipo de producto" />
          </div>
            <!-- Foto (drag & drop) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Foto</label>
              <div
                class="relative mt-2">
                <div
                  :class="['w-full h-40 rounded border-dashed border-2 flex items-center justify-center bg-gray-50', isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300']"
                  @dragover.prevent="handleDragOver"
                  @dragleave.prevent="handleDragLeave"
                  @drop.prevent="handleDrop">
                  <input ref="hiddenFileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" :disabled="isViewing || isLoading" />

                  <div v-if="showCamera" class="w-full h-full flex flex-col items-center justify-center gap-3">
                    <video ref="videoRef" class="w-full h-full object-contain rounded" autoplay playsinline></video>
                    <div class="flex items-center justify-center gap-2">
                      <button type="button" @click="takePhoto" :disabled="isViewing || isLoading"
                        class="px-4 py-2 bg-primary text-white rounded shadow">Tomar foto</button>
                      <button type="button" @click="cancelCamera" :disabled="isViewing || isLoading"
                        class="px-4 py-2 bg-white border rounded">Cancelar</button>
                    </div>
                  </div>

                  <div v-else-if="!fotoBase64 && !fotoLoading" class="text-center px-4">
                    <p class="text-sm text-gray-500 mb-2">Arrastra la foto aquí</p>
                    <div class="flex items-center justify-center gap-2">
                      <button type="button" @click="triggerFileInput" :disabled="isViewing || isLoading"
                        class="px-4 py-2 bg-primary text-white rounded shadow flex items-center gap-2">
                        Elegir foto
                      </button>
                      <button type="button" @click="openCamera" :disabled="isViewing || isLoading"
                        class="px-3 py-2 bg-white border rounded flex items-center gap-2">
                        <img src="/camera.png" alt="cam" class="w-5 h-5 bg-white rounded" />
                        <span class="text-sm text-gray-700">Cámara</span>
                      </button>
                    </div>
                  </div>

                  <div v-else-if="fotoLoading" class="flex items-center justify-center w-full h-full">
                    <svg class="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  </div>

                  <div v-else class="w-full h-full flex items-center justify-center p-2">
                    <img :src="fotoBase64" alt="Previsualización" class="max-h-full object-contain rounded" />
                  </div>
                </div>

                <!-- Botón eliminar (X) en esquina cuando hay imagen -->
                <button v-if="fotoBase64" type="button" @click="removeImage"
                  class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow">
                  <span class="text-sm font-bold">×</span>
                </button>
              </div>
            </div>
          <!-- Cantidad en Existencia -->
          <div v-if="isEditing || isViewing">
            <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad en Existencia</label>
            <input v-model="formData.cantidadExistencia" type="number" :required="isEditing" :readonly="true" :disabled="true"
              class="w-full px-4 py-2 rounded-lg border bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese la cantidad en existencia" />
          </div>
        </div>
        <!-- Nota -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nota</label>
          <textarea v-model="formData.nota" :readonly="isViewing" :disabled="isViewing || isLoading"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese una nota (opcional)" rows="3"></textarea>
        </div>
        <!-- Botones de acción -->
        <div class="flex justify-end space-x-4 mt-6" v-if="!isViewing">
          <button type="button" @click="$emit('update:modelValue', false)"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              {{ isEditing ? 'Guardar Cambios' : 'Crear Producto' }}
            </span>
          </button>
        </div>
      </form>

      <!-- Tabla de Factura Productos -->
      <div v-if="(isViewing || isEditing) && props.producto.facturaProductos && props.producto.facturaProductos.length > 0" class="mt-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Historial de Facturas</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-300">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Consecu</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente/Proveedor</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Venta</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="fp in props.producto.facturaProductos" :key="fp.id_factura_producto">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{{ fp.factura.num_consecutivo }}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm">
                  <span v-html="renderClienteProveedor(fp.factura.contrato.ClienteOProveedor)"></span>
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{{ new Date(fp.factura.fecha).toLocaleDateString() }}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm">
                  <span v-html="renderEstado(fp.factura.estado)"></span>
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{{ fp.cantidad }}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{{ fp.precioVenta }}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{{ fp.costoVenta }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="errorMsg" class="text-red-600 text-sm mt-2">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRuntimeConfig } from '#app';
import MessageBanner from './MessageBanner.vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  producto: { type: Object, default: () => ({}) },
  isEditing: { type: Boolean, default: false },
  isViewing: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue', 'submit']);
const formData = ref({
  codigo: '',
  nombre: '',
  precio: '',
  nota: '',
  unidadMedida: '',
  tipoProducto: '',
  cantidadExistencia: 0,
  costo: 0,
  precio_usd: '',
  costo_usd: '',
  precio_inspectores_cup: 0
});

// cambio de moneda desde config en localStorage
const cambioMoneda = ref(1);

// Flags para evitar bucles entre watchers
const updatingPrecio = ref(false);
const updatingPrecioUsd = ref(false);
const updatingCosto = ref(false);
const updatingCostoUsd = ref(false);

// Imagen (base64)
const fotoBase64 = ref(null);
const fotoName = ref(null);
const fotoUserProvided = ref(false);
const isDragOver = ref(false);
const hiddenFileInput = ref(null);
const fotoLoading = ref(false);
const config = useRuntimeConfig();
const showCamera = ref(false);
const videoRef = ref(null);
const streamRef = ref(null);

// Computed para detectar si el usuario logueado tiene rol 'Vendedor'
const isVendedor = computed(() => {
  try {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return false;
    const usuario = JSON.parse(usuarioStr);
    const rawRole = usuario && (usuario.rol || usuario.role || (usuario.perfil && usuario.perfil.rol) || (usuario.profile && usuario.profile.role)) ? (usuario.rol || usuario.role || (usuario.perfil && usuario.perfil.rol) || (usuario.profile && usuario.profile.role)) : null;
    if (!rawRole) return false;
    return String(rawRole).trim().toLowerCase() === 'vendedor';
  } catch (e) {
    return false;
  }
});
// Computed para detectar si el usuario logueado tiene rol 'Administrador'
const isAdmin = computed(() => {
  try {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return false;
    const usuario = JSON.parse(usuarioStr);
    const rawRole = usuario && (usuario.rol || usuario.role || (usuario.perfil && usuario.perfil.rol) || (usuario.profile && usuario.profile.role)) ? (usuario.rol || usuario.role || (usuario.perfil && usuario.perfil.rol) || (usuario.profile && usuario.profile.role)) : null;
    if (!rawRole) return false;
    const role = String(rawRole).trim().toLowerCase();
    return role === 'administrador' || role === 'admin';
  } catch (e) {
    return false;
  }
});
const errorMsg = ref('');
const isLoading = ref(false);
const loadingBanner = ref(null);

watch(() => props.producto, (producto) => {
  if (producto && Object.keys(producto).length > 0) {
    formData.value = {
      codigo: producto.codigo || '',
      nombre: producto.nombre || '',
      precio: producto.precio || '',
      nota: producto.nota || '',
      unidadMedida: producto.unidadMedida || '',
      tipoProducto: producto.tipoProducto || '',
      cantidadExistencia: producto.cantidadExistencia || 0,
      costo: producto.costo || 0,
      precio_usd: producto.precio_usd !== undefined && producto.precio_usd !== null ? String(producto.precio_usd) : '',
      costo_usd: producto.costo_usd !== undefined && producto.costo_usd !== null ? String(producto.costo_usd) : '',
      precio_inspectores_cup: producto.precio_inspectores_cup !== undefined && producto.precio_inspectores_cup !== null ? Number(producto.precio_inspectores_cup) : 0
    };
    // mantener foto existente si la hay (asegurar URL completa)
    if (producto.foto) {
      if (typeof producto.foto === 'string' && (producto.foto.startsWith('http') || producto.foto.startsWith('data:'))) {
        fotoBase64.value = producto.foto;
      } else {
        fotoBase64.value = `${config.public.backendHost}${producto.foto}`;
      }
      fotoName.value = 'imagen_producto';
      fotoUserProvided.value = false; // no fue provista en la sesión actual
    } else {
      fotoBase64.value = null;
      fotoName.value = null;
      fotoUserProvided.value = false;
    }
  } else {
    formData.value = {
      codigo: '',
      nombre: '',
      precio: '',
      nota: '',
      unidadMedida: '',
      tipoProducto: '',
      cantidadExistencia: 0,
      costo: 0,
      precio_usd: '',
      costo_usd: '',
      precio_inspectores_cup: 0
    };
    fotoBase64.value = null;
    fotoName.value = null;
    fotoUserProvided.value = false;
  }
}, { immediate: true });

// Resetear imagen cuando se cierra el modal
watch(() => props.modelValue, (val) => {
  if (val) {
    // cada vez que se abre el modal, recargar la imagen del producto (si existe)
    loadProductoImage();
    // cargar cambio de moneda desde localStorage config
    try {
      const cfgStr = localStorage.getItem('config');
      if (cfgStr) {
        const cfg = JSON.parse(cfgStr);
        const cm = Number(cfg?.cambio_moneda);
        if (!isNaN(cm) && cm > 0) cambioMoneda.value = cm;
        else cambioMoneda.value = 1;
      } else {
        cambioMoneda.value = 1;
      }
    } catch (e) {
      cambioMoneda.value = 1;
    }
  } else {
    fotoBase64.value = null;
    fotoName.value = null;
    fotoUserProvided.value = false;
    fotoLoading.value = false;
    stopCamera();
  }
});

// Conversiones solo al tipear: handlers ligados a los inputs
function onPrecioInput(e) {
  const val = e && e.target ? e.target.value : formData.value.precio;
  const cambio = Number(cambioMoneda.value) || 1;
  const n = Number(val);
  if (isNaN(n)) {
    formData.value.precio_usd = '';
    return;
  }
  const usd = n / cambio;
  formData.value.precio_usd = usd.toFixed(5);
}

function onPrecioUsdInput(e) {
  const val = e && e.target ? e.target.value : formData.value.precio_usd;
  const cambio = Number(cambioMoneda.value) || 1;
  const n = Number(val);
  if (isNaN(n)) {
    formData.value.precio = '';
    return;
  }
  const localVal = n * cambio;
  formData.value.precio = localVal.toFixed(5);
}

function onCostoInput(e) {
  const val = e && e.target ? e.target.value : formData.value.costo;
  const cambio = Number(cambioMoneda.value) || 1;
  const n = Number(val);
  if (isNaN(n)) {
    formData.value.costo_usd = '';
    return;
  }
  const usd = n / cambio;
  formData.value.costo_usd = usd.toFixed(5);
}

function onCostoUsdInput(e) {
  const val = e && e.target ? e.target.value : formData.value.costo_usd;
  const cambio = Number(cambioMoneda.value) || 1;
  const n = Number(val);
  if (isNaN(n)) {
    formData.value.costo = '';
    return;
  }
  const localVal = n * cambio;
  formData.value.costo = localVal.toFixed(5);
}

function onPrecioInspectoresInput(e) {
  const val = e && e.target ? e.target.value : formData.value.precio_inspectores_cup;
  const n = Number(val);
  if (isNaN(n) || n < 0) {
    formData.value.precio_inspectores_cup = 0;
    return;
  }
  formData.value.precio_inspectores_cup = n;
}

const handleSubmit = async () => {
  errorMsg.value = '';
  const requiredFields = ['codigo', 'nombre', 'unidadMedida', 'tipoProducto'];
  const missingFields = requiredFields.filter(field => !formData.value[field]);
  if (missingFields.length > 0) {
    errorMsg.value = 'Los campos ' + missingFields.join(', ') + ' son obligatorios.';
    return;
  }

  // Activar estado de carga
  isLoading.value = true;
  loadingBanner.value = {
    title: props.isEditing ? 'Guardando Producto' : 'Creando Producto',
    description: 'Comunicando con el servidor, espere por favor...',
    type: 'warning'
  };

  try {
    // Emitir el evento submit
    await new Promise((resolve, reject) => {
      const payload = {
        codigo: formData.value.codigo,
        nombre: formData.value.nombre,
        nota: formData.value.nota,
        unidadMedida: formData.value.unidadMedida,
        tipoProducto: formData.value.tipoProducto,
        cantidadExistencia: props.isEditing ? Number(formData.value.cantidadExistencia) : 0
      };
      // Incluir precio y costo solo si el usuario ingresó valores válidos
      if (formData.value.precio !== '' && formData.value.precio !== null && !isNaN(Number(formData.value.precio))) {
        payload.precio = Number(formData.value.precio);
      }
      if (formData.value.costo !== '' && formData.value.costo !== null && !isNaN(Number(formData.value.costo))) {
        payload.costo = Number(formData.value.costo);
      }
      // Incluir USD solo si el usuario es administrador y digitó un valor
      if (isAdmin.value) {
        if (formData.value.precio_usd !== '' && formData.value.precio_usd !== null && !isNaN(Number(formData.value.precio_usd))) payload.precio_usd = Number(formData.value.precio_usd);
        if (formData.value.costo_usd !== '' && formData.value.costo_usd !== null && !isNaN(Number(formData.value.costo_usd))) payload.costo_usd = Number(formData.value.costo_usd);
      }
      // Incluir precio_inspectores_cup (siempre, con validación de no negativos)
      const precioInspectores = Number(formData.value.precio_inspectores_cup);
      if (!isNaN(precioInspectores) && precioInspectores >= 0) {
        payload.precio_inspectores_cup = precioInspectores;
      } else {
        payload.precio_inspectores_cup = 0;
      }
      // Incluir foto sólo si el usuario la proporcionó en esta sesión
      if (fotoUserProvided.value && fotoBase64.value) payload.foto = fotoBase64.value;
      emit('submit', payload);
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

function handleFileChange(event) {
  const file = event.target && event.target.files ? event.target.files[0] : null;
  if (!file) return;
  fotoLoading.value = true;
  // Comprimir y convertir a base64
  compressImage(file).then(dataUrl => {
    fotoBase64.value = dataUrl;
    fotoName.value = file.name;
    fotoUserProvided.value = true;
  }).catch(() => {
    errorMsg.value = 'No se pudo procesar la imagen seleccionada.';
  }).finally(() => {
    fotoLoading.value = false;
  });
}

function removeImage() {
  fotoBase64.value = null;
  fotoName.value = null;
  fotoUserProvided.value = true; // el usuario modificó la imagen (la removió)
}

function triggerFileInput() {
  if (hiddenFileInput.value) hiddenFileInput.value.click();
}

function handleDragOver() {
  isDragOver.value = true;
}

function handleDragLeave() {
  isDragOver.value = false;
}

function handleDrop(event) {
  isDragOver.value = false;
  const file = event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files[0] : null;
  if (!file) return;
  fotoLoading.value = true;
  compressImage(file).then(dataUrl => {
    fotoBase64.value = dataUrl;
    fotoName.value = file.name;
    fotoUserProvided.value = true;
  }).catch(() => {
    errorMsg.value = 'No se pudo procesar la imagen arrastrada.';
  }).finally(() => {
    fotoLoading.value = false;
  });
}

// Cámara: abrir, capturar y parar
async function openCamera() {
  showCamera.value = true;
  await startCamera();
}

async function startCamera() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    streamRef.value = stream;
    if (videoRef.value) videoRef.value.srcObject = stream;
    if (videoRef.value) await videoRef.value.play();
  } catch (e) {
    console.error('No se pudo acceder a la cámara', e);
    showCamera.value = false;
  }
}

function stopCamera() {
  try {
    if (streamRef.value) {
      streamRef.value.getTracks().forEach(t => t.stop());
      streamRef.value = null;
    }
    if (videoRef.value && videoRef.value.pause) videoRef.value.pause();
  } catch (e) {
    // ignore
  }
}

async function takePhoto() {
  if (!videoRef.value) return;
  const video = videoRef.value;
  const w = video.videoWidth;
  const h = video.videoHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, w, h);
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return reject(new Error('no_blob'));
      try {
        // convertir blob a file y comprimir
        const file = new File([blob], 'camera.jpg', { type: blob.type || 'image/jpeg' });
        const dataUrl = await compressImage(file);
        fotoBase64.value = dataUrl;
        fotoName.value = file.name;
        fotoUserProvided.value = true;
        resolve();
      } catch (e) {
        reject(e);
      }
    }, 'image/jpeg');
  }).finally(() => {
    stopCamera();
    showCamera.value = false;
  });
}

function cancelCamera() {
  stopCamera();
  showCamera.value = false;
}

// Comprimir imagen usando canvas. Redimensiona si es mayor a 1280px y exporta a webp para reducir peso.
function compressImage(file) {
  const maxDim = 1280;
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read_error'));
    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img;
        let scale = 1;
        if (width > maxDim || height > maxDim) {
          scale = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // Exportar a webp para buena compresión; calidad alta para mantener nitidez
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('compress_error'));
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result);
          fr.onerror = () => reject(new Error('read_blob_error'));
          fr.readAsDataURL(blob);
        }, 'image/webp', 0.9);
      };
      img.onerror = () => reject(new Error('image_load_error'));
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Cargar la imagen del producto (remota o data) cada vez que se abre el modal
function loadProductoImage() {
  const producto = props.producto || {};
  if (producto && producto.foto) {
    const src = (typeof producto.foto === 'string' && (producto.foto.startsWith('http') || producto.foto.startsWith('data:')))
      ? producto.foto
      : `${config.public.backendHost}${producto.foto}`;
    // Si es data URL, asignar directamente
    if (src.startsWith('data:')) {
      fotoBase64.value = src;
      fotoUserProvided.value = false;
      fotoLoading.value = false;
      return;
    }
    fotoLoading.value = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      fotoBase64.value = src;
      fotoUserProvided.value = false;
      fotoLoading.value = false;
    };
    img.onerror = () => {
      fotoBase64.value = null;
      fotoUserProvided.value = false;
      fotoLoading.value = false;
    };
    img.src = src;
  } else {
    fotoBase64.value = null;
    fotoUserProvided.value = false;
    fotoLoading.value = false;
  }
}

function renderEstado(value) {
  if (!value) return '';
  let bgColor = '';
  let textColor = '';
  if (value === 'Facturado') {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
  } else if (value === 'No Facturado') {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
  } else if (value === 'Cancelado') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
  }
  return `<span class="px-2 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}">${value}</span>`;
}

function renderClienteProveedor(value) {
  if (!value) return '';
  let bgColor = '';
  let textColor = '';
  if (value === 'Proveedor') {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
  } else if (value === 'Cliente') {
    bgColor = 'bg-blue-100';
    textColor = 'text-blue-800';
  } else {
    return '';
  }
  return `<span class="px-2 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}">${value}</span>`;
}
</script>
