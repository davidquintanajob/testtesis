<template>
  <!-- Modal principal de la factura -->
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg p-2 w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl">
      <!-- Encabezado -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Vista PDF de Factura</h2>
        <div class="flex space-x-2">
          <button @click="printFactura" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" :disabled="!isVendorDataComplete">
            Imprimir
          </button>
          <button @click="downloadFactura" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600" :disabled="!isVendorDataComplete">
            Descargar PDF
          </button>
          <button @click="$emit('update:modelValue', false)" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Banner de error si faltan datos del vendedor -->
      <div v-if="!isVendorDataComplete" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <strong>Error:</strong> Faltan datos del vendedor. Complete la información requerida antes de imprimir o descargar el PDF.
        </div>
        <ul class="mt-2 list-disc list-inside">
          <li v-for="field in missingVendorFields" :key="field">{{ getFieldLabel(field) }}</li>
        </ul>
      </div>

      <!-- Contenido de la Factura -->
      <div id="factura-content" class="bg-white p-6 max-w-full mx-auto" style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4;">
        <!-- Encabezado de la Factura -->
        <div class="text-center mb-4">
  <h1 class="text-lx font-bold mb-2" style="color: #dc2626; font-size: 40px; letter-spacing: 1px;">FACTURA</h1>
  <div class="border-b border-blue-500 w-full mb-3" style="border-color: #3b82f6;"></div>
  <p class="text-xl font-bold mb-3" style="font-size: 24px;">Nombre del Trabajo: {{ factura.contrato?.ClienteOProveedor === 'Cliente' ? 'Servicio Prestado' : 'Compra Realizada' }}</p>
</div>

        <!-- Información de la Factura -->
        <div class="flex justify-end mb-4">
  <div class="text-right">
    <p class="mb-1 text-lg"><strong>Factura N: {{ factura.num_consecutivo }}</strong></p>
    <p class="mb-1 text-lg"><strong>Fecha: ___________</strong></p>
  </div>
</div>

        <!-- Información de las Partes -->
        <div class="grid grid-cols-2 gap-10 mb-4">
          <!-- Parte Izquierda -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold" style="color: #2563eb; font-size: 18px;">Vendedor</h3>
              <button @click="openVendorConfig" class="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 border border-blue-500 rounded no-print" title="Configurar datos del vendedor">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <div class="space-y-0.5">
              <div class="flex items-center justify-between">
                <p><strong>Nombre:</strong> {{ getVendorData('nombre') }}</p>
              </div>
              <div class="flex items-center justify-between">
                <p><strong>Carné Identidad:</strong> {{ getVendorData('carnet_identidad') }}</p>
              </div>
              <div class="flex items-center justify-between">
                <p><strong>Identificación Fiscal (RC-05):</strong> {{ getVendorData('identificacion_fiscal') }}</p>
              </div>
              <div class="flex items-center justify-between">
                <p><strong>Cuenta Bancaria:</strong> {{ getVendorData('cuenta_bancaria').replace(/-/g, '') }}</p>
              </div>
              <div class="flex items-center justify-between">
                <p><strong>Agencia Bancaria:</strong> {{ getVendorData('agencia_bancaria') }}</p>
              </div>
              <div class="flex items-center justify-between">
                <p><strong>Dirección Particular:</strong> {{ getVendorData('direccion_particular') }}</p>
              </div>
              <div class="flex items-center justify-between">
                <p><strong>Teléfono:</strong> {{ getVendorData('telefono') }}</p>
              </div>
            </div>
          </div>

          <!-- Parte Derecha -->
          <div>
            <h3 class="font-bold mb-2" style="color: #2563eb; font-size: 18px;">Comprador</h3>
            <div class="space-y-0.5">
              <div class="flex items-center justify-between">
                <p><strong>Nombre:</strong> {{ factura.contrato?.entidad?.nombre || '_________________' }}</p>
              </div>
              <div class="flex items-center justify-between">
                <p><strong>Código:</strong> {{ factura.contrato?.entidad?.consecutivo || '_________________' }}</p>
              </div>
              <div class="flex items-center justify-between">
                <p><strong>Dirección:</strong> {{ factura.contrato?.entidad?.direccion || '_________________' }}</p>
              </div>
              <div class="flex items-center justify-between">
                <p><strong>Cuenta Bancaria:</strong> {{ (factura.contrato?.entidad?.cuenta_bancaria || '_________________').replace(/-/g, '') }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="border-b border-black w-full mb-3"></div>

        <!-- Tabla de Productos/Servicios -->
        <table class="w-full border-collapse border border-black mb-4">
            <thead>
            <tr style="background-color: #f0f0f0;">
              <th class="border border-black p-2 text-center font-bold">Descripción</th>
              <th class="border border-black p-2 text-center font-bold">U/M</th>
              <th class="border border-black p-2 text-center font-bold">Cantidad</th>
              <th class="border border-black p-2 text-center font-bold">Precio en CUP</th>
              <th class="border border-black p-2 text-center font-bold">Precio Total</th>
              </tr>
            </thead>
            <tbody>
            <!-- Servicios -->
              <tr v-for="servicio in factura.servicio" :key="servicio.id_servicio">
              <td class="border border-black p-2">{{ servicio.descripcion }}</td>
              <td class="border border-black p-2">{{ servicio.unidadMedida }}</td>
              <td class="border border-black p-2 text-right">{{ parseFloat(servicio.cantidad).toFixed(2) }}</td>
              <td class="border border-black p-2 text-right">{{ parseFloat(servicio.importe).toFixed(2) }}</td>
              <td class="border border-black p-2 text-right">{{ (servicio.cantidad * parseFloat(servicio.importe)).toFixed(2) }}</td>
              </tr>
            <!-- Productos -->
            <tr v-for="producto in factura.productos" :key="producto.id_producto">
              <td class="border border-black p-2">{{ producto.nombre }}</td>
              <td class="border border-black p-2">{{ producto.unidadMedida }}</td>
              <td class="border border-black p-2 text-right">{{ parseFloat(producto.factura_producto?.cantidad || 0).toFixed(2) }}</td>
              <td class="border border-black p-2 text-right">{{ parseFloat(producto.factura_producto?.precioVenta || 0).toFixed(2) }}</td>
              <td class="border border-black p-2 text-right">{{ ((producto.factura_producto?.cantidad || 0) * parseFloat(producto.factura_producto?.precioVenta || 0)).toFixed(2) }}</td>
              </tr>
            <!-- Filas vacías para completar -->
            <tr v-for="n in emptyRows" :key="`empty-${n}`">
              <td class="border border-black p-2 h-6"></td>
              <td class="border border-black p-2"></td>
              <td class="border border-black p-2"></td>
              <td class="border border-black p-2"></td>
              <td class="border border-black p-2"></td>
              </tr>
            </tbody>
          </table>

        <!-- Total -->
        <div class="text-right mb-4">
          <p class="text-lg font-bold"><strong>Cantidad Total a Cobrar: $ {{ formatNumber(factura.suma_general) }}</strong></p>
        </div>

        <!-- Firmas -->
        <div class="grid grid-cols-2 gap-10 mt-6">
          <div>
            <div class="border-b border-black w-full mb-2"></div>
            <p class="font-bold mb-2 text-center">Emitido</p>
            <div class="space-y-0.5">
              <p><strong>Nombre:</strong> {{ factura.usuario?.nombre || '_________________' }}</p>
              <p><strong>Cargo:</strong> {{ factura.usuario?.cargo || '_________________' }}</p>
              <p><strong>C. Identidad:</strong> {{ factura.usuario?.carnet_identidad || '_________________' }}</p>
              <p><strong>Fecha:</strong> ___________</p>
            </div>
            <div class="mt-3">
              <div class="border-b border-black w-full mb-1"></div>
              <p class="font-bold text-center">Cuño</p>
            </div>
          </div>

          <div>
            <div class="border-b border-black w-full mb-2"></div>
            <p class="font-bold mb-2 text-center">Recibido</p>
            <div class="space-y-0.5">
              <p><strong>Nombre:</strong> {{ getTrabajadorAutorizado()?.nombre || '________________________' }}</p>
              <p><strong>Cargo:</strong> {{ getTrabajadorAutorizado()?.cargo || '________________________' }}</p>
              <p><strong>C. Identidad:</strong> {{ getTrabajadorAutorizado()?.carnet_identidad || '________________________' }}</p>
              <p><strong>Fecha:</strong> ________________________</p>
            </div>
            <div class="mt-3">
              <div class="border-b border-black w-full mb-1"></div>
              <p class="font-bold text-center">Cuño</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de configuración de datos del vendedor -->
  <div v-if="showVendorConfig" class="fixed inset-0 bg-black bg-opacity-50 z-70 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Configurar Datos del Vendedor</h2>
        <button @click="closeVendorConfig" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="saveVendorData" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
          <input v-model="vendorData.nombre" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ingrese el nombre completo">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Carné de Identidad</label>
          <input v-model="vendorData.carnet_identidad" @input="handleCarnetIdentidadInput" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ingrese el carné de identidad">
          <p v-if="validationErrors.carnet_identidad" class="text-red-500 text-xs mt-1">{{ validationErrors.carnet_identidad }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Identificación Fiscal (RC-05)</label>
          <input v-model="vendorData.identificacion_fiscal" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ingrese la identificación fiscal">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cuenta Bancaria</label>
          <input v-model="vendorData.cuenta_bancaria" @input="handleCuentaBancariaInput" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ingrese la cuenta bancaria">
          <p v-if="validationErrors.cuenta_bancaria" class="text-red-500 text-xs mt-1">{{ validationErrors.cuenta_bancaria }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Agencia Bancaria</label>
          <input v-model="vendorData.agencia_bancaria" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ingrese la agencia bancaria">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Dirección Particular</label>
          <input v-model="vendorData.direccion_particular" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ingrese la dirección particular">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input v-model="vendorData.telefono" @input="handleTelefonoInput" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ingrese el teléfono">
          <p v-if="validationErrors.telefono" class="text-red-500 text-xs mt-1">{{ validationErrors.telefono }}</p>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" @click="closeVendorConfig" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Guardar Datos
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  factura: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue']);

// Variables reactivas
const showVendorConfig = ref(false);
const vendorData = ref({
  nombre: '',
  carnet_identidad: '',
  identificacion_fiscal: '',
  cuenta_bancaria: '',
  agencia_bancaria: '',
  direccion_particular: '',
  telefono: ''
});

// Validación
const validationErrors = ref({
  carnet_identidad: '',
  cuenta_bancaria: '',
  telefono: ''
});

// Funciones de validación
const validateCarnetIdentidad = (value) => {
  if (!value) return '';
  if (!/^\d+$/.test(value)) {
    return 'El carné de identidad solo puede contener números.';
  }
  if (value.length > 12) {
    return 'El carné de identidad no puede tener más de 12 caracteres.';
  }
  return '';
};

const validateCuentaBancaria = (value) => {
  if (!value) return '';
  const cleanValue = value.replace(/-/g, '');
  if (cleanValue.length !== 16 || !/^\d+$/.test(cleanValue)) {
    return 'La cuenta bancaria debe tener exactamente 16 dígitos.';
  }
  return '';
};

const validateTelefono = (value) => {
  if (!value) return '';
  if (!/^[\d-]+$/.test(value)) {
    return 'El teléfono solo puede contener números y guiones.';
  }
  return '';
};

const formatCuentaBancaria = (value) => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 16) {
    return cleanValue.replace(/(\d{4})(?=\d)/g, '$1-');
  }
  return value;
};

// Handlers de entrada para validación en tiempo real
const handleCarnetIdentidadInput = (event) => {
  let value = event.target.value;
  // Solo permitir números y máximo 11 caracteres
  value = value.replace(/\D/g, '').substring(0, 11);
  vendorData.value.carnet_identidad = value;
  validationErrors.value.carnet_identidad = validateCarnetIdentidad(value);
};

const handleCuentaBancariaInput = (event) => {
  let value = event.target.value;
  // Solo permitir números y guiones, máximo 16 dígitos (sin contar guiones)
  const cleanValue = value.replace(/[^0-9-]/g, '');
  const digitsOnly = cleanValue.replace(/-/g, '');
  if (digitsOnly.length > 16) {
    // Si excede 16 dígitos, truncar
    const truncatedDigits = digitsOnly.substring(0, 16);
    value = truncatedDigits.replace(/(\d{4})(?=\d)/g, '$1-');
  } else {
    value = cleanValue.replace(/(\d{4})(?=\d)/g, '$1-');
  }
  vendorData.value.cuenta_bancaria = value;
  validationErrors.value.cuenta_bancaria = validateCuentaBancaria(value);
};

const handleTelefonoInput = (event) => {
  let value = event.target.value;
  // Solo permitir números y guiones
  value = value.replace(/[^0-9-]/g, '');
  vendorData.value.telefono = value;
  validationErrors.value.telefono = validateTelefono(value);
};

// Clave para localStorage
const VENDOR_DATA_KEY = 'factura_vendor_data';

// Funciones para manejar datos del vendedor
const loadVendorData = () => {
  try {
    const stored = localStorage.getItem(VENDOR_DATA_KEY);
    if (stored) {
      vendorData.value = { ...vendorData.value, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error cargando datos del vendedor:', error);
  }
};

const saveVendorData = () => {
  // Validar campos
  validationErrors.value.carnet_identidad = validateCarnetIdentidad(vendorData.value.carnet_identidad);
  validationErrors.value.cuenta_bancaria = validateCuentaBancaria(vendorData.value.cuenta_bancaria);
  validationErrors.value.telefono = validateTelefono(vendorData.value.telefono);

  // Verificar si hay errores
  const hasErrors = Object.values(validationErrors.value).some(error => error !== '');

  if (hasErrors) {
    return; // No guardar si hay errores
  }

  try {
    localStorage.setItem(VENDOR_DATA_KEY, JSON.stringify(vendorData.value));
    closeVendorConfig();
  } catch (error) {
    console.error('Error guardando datos del vendedor:', error);
  }
};

const getVendorData = (field) => {
  const stored = vendorData.value[field];
  if (stored && stored.trim() !== '') {
    return stored;
  }

  // No cargar datos de la factura, mostrar campos vacíos
  return '_________________';
};

const openVendorConfig = () => {
  emit('update:modelValue', false);
  showVendorConfig.value = true;
};

const closeVendorConfig = () => {
  showVendorConfig.value = false;
};

// Cargar datos al montar el componente
onMounted(() => {
  loadVendorData();
});

// Computed para verificar si los datos del vendedor están completos
const isVendorDataComplete = computed(() => {
  const requiredFields = ['nombre', 'carnet_identidad', 'identificacion_fiscal', 'cuenta_bancaria', 'agencia_bancaria', 'direccion_particular', 'telefono'];
  return requiredFields.every(field => {
    const value = vendorData.value[field];
    return value && value.trim() !== '';
  });
});

// Computed para obtener los campos faltantes
const missingVendorFields = computed(() => {
  const requiredFields = ['nombre', 'carnet_identidad', 'identificacion_fiscal', 'cuenta_bancaria', 'agencia_bancaria', 'direccion_particular', 'telefono'];
  return requiredFields.filter(field => {
    const value = vendorData.value[field];
    return !value || value.trim() === '';
  });
});

// Función para obtener etiquetas legibles para los campos
const getFieldLabel = (field) => {
  const labels = {
    nombre: 'Nombre Completo',
    carnet_identidad: 'Carné de Identidad',
    identificacion_fiscal: 'Identificación Fiscal (RC-05)',
    cuenta_bancaria: 'Cuenta Bancaria',
    agencia_bancaria: 'Agencia Bancaria',
    direccion_particular: 'Dirección Particular',
    telefono: 'Teléfono'
  };
  return labels[field] || field;
};

// Computed para determinar si es un contrato con proveedor
const isProveedorContract = computed(() => {
  return props.factura.contrato?.ClienteOProveedor === 'Proveedor';
});

// Computed para los datos de la parte izquierda (Vendedor o Comprador según el tipo de contrato)
const leftPartyData = computed(() => {
  if (isProveedorContract.value) {
    // Si es proveedor, la izquierda es el Comprador (entidad)
    return {
      title: 'Comprador',
      nombre: props.factura.contrato?.entidad?.nombre || '_________________',
      codigo: props.factura.contrato?.entidad?.consecutivo || '_________________',
      direccion: props.factura.contrato?.entidad?.direccion || '_________________',
      cuenta_bancaria: props.factura.contrato?.entidad?.cuenta_bancaria || '_________________',
      showConfigButton: false
    };
  } else {
    // Si es cliente, la izquierda es el Vendedor (datos locales)
    return {
      title: 'Vendedor',
      nombre: getVendorData('nombre'),
      carnet_identidad: getVendorData('carnet_identidad'),
      identificacion_fiscal: getVendorData('identificacion_fiscal'),
      cuenta_bancaria: getVendorData('cuenta_bancaria'),
      agencia_bancaria: getVendorData('agencia_bancaria'),
      direccion_particular: getVendorData('direccion_particular'),
      telefono: getVendorData('telefono'),
      showConfigButton: true
    };
  }
});

// Computed para los datos de la parte derecha (Comprador o Vendedor según el tipo de contrato)
const rightPartyData = computed(() => {
  if (isProveedorContract.value) {
    // Si es proveedor, la derecha es el Vendedor (datos locales)
    return {
      title: 'Vendedor',
      nombre: getVendorData('nombre'),
      carnet_identidad: getVendorData('carnet_identidad'),
      identificacion_fiscal: getVendorData('identificacion_fiscal'),
      cuenta_bancaria: getVendorData('cuenta_bancaria'),
      agencia_bancaria: getVendorData('agencia_bancaria'),
      direccion_particular: getVendorData('direccion_particular'),
      telefono: getVendorData('telefono'),
      showConfigButton: true
    };
  } else {
    // Si es cliente, la derecha es el Comprador (entidad)
    return {
      title: 'Comprador',
      nombre: props.factura.contrato?.entidad?.nombre || '_________________',
      codigo: props.factura.contrato?.entidad?.consecutivo || '_________________',
      direccion: props.factura.contrato?.entidad?.direccion || '_________________',
      cuenta_bancaria: props.factura.contrato?.entidad?.cuenta_bancaria || '_________________',
      showConfigButton: false
    };
  }
});

// Computed para los datos de firma izquierda (Emitido o Recibido según el tipo de contrato)
const leftSignatureData = computed(() => {
  if (isProveedorContract.value) {
    // Si es proveedor, la izquierda es Recibido (trabajador autorizado)
    return {
      title: 'Recibido',
      nombre: getTrabajadorAutorizado()?.nombre || '________________________',
      cargo: getTrabajadorAutorizado()?.cargo || '________________________',
      carnet_identidad: getTrabajadorAutorizado()?.carnet_identidad || '________________________',
      fecha: '________________________'
    };
  } else {
    // Si es cliente, la izquierda es Emitido (usuario)
    return {
      title: 'Emitido',
      nombre: props.factura.usuario?.nombre || '_________________',
      cargo: props.factura.usuario?.cargo || '_________________',
      carnet_identidad: props.factura.usuario?.carnet_identidad || '_________________',
      fecha: '___________'
    };
  }
});

// Computed para los datos de firma derecha (Recibido o Emitido según el tipo de contrato)
const rightSignatureData = computed(() => {
  if (isProveedorContract.value) {
    // Si es proveedor, la derecha es Emitido (usuario)
    return {
      title: 'Emitido',
      nombre: props.factura.usuario?.nombre || '_________________',
      cargo: props.factura.usuario?.cargo || '_________________',
      carnet_identidad: props.factura.usuario?.carnet_identidad || '_________________',
      fecha: '___________'
    };
  } else {
    // Si es cliente, la derecha es Recibido (trabajador autorizado)
    return {
      title: 'Recibido',
      nombre: getTrabajadorAutorizado()?.nombre || '________________________',
      cargo: getTrabajadorAutorizado()?.cargo || '________________________',
      carnet_identidad: getTrabajadorAutorizado()?.carnet_identidad || '________________________',
      fecha: '________________________'
    };
  }
});



const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

const formatNumber = (number) => {
  if (!number) return '0,00';
  return parseFloat(number).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace(/\./g, ' ').replace(',', ',');
};

const calculateServicesTotal = () => {
  if (!props.factura.servicio || props.factura.servicio.length === 0) return 0;
  return props.factura.servicio.reduce((total, servicio) => {
    return total + (servicio.cantidad * parseFloat(servicio.importe));
  }, 0);
};

const calculateProductsTotal = () => {
  if (!props.factura.productos || props.factura.productos.length === 0) return 0;
  return props.factura.productos.reduce((total, producto) => {
    const cantidad = producto.factura_producto?.cantidad || 0;
    const precio = parseFloat(producto.factura_producto?.precioVenta || 0);
    return total + (cantidad * precio);
  }, 0);
};

const getTrabajadorAutorizado = () => {
  // Buscar trabajador autorizado en los datos de la factura
  // Puede estar en diferentes ubicaciones dependiendo de la estructura de datos
  if (props.factura.contrato?.trabajadorAutorizado) {
    return props.factura.contrato.trabajadorAutorizado;
  }
  
  if (props.factura.trabajadorAutorizado) {
    return props.factura.trabajadorAutorizado;
  }
  
  
  return null;
};

const printFactura = () => {
  try {
  const printContent = document.getElementById('factura-content');
  const originalContent = document.body.innerHTML;
    const originalTitle = document.title;
    
    // Crear una ventana de impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Factura ${props.factura.num_consecutivo}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              font-size: 12px;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
            }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .border-b { border-bottom: 1px solid #000; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  } catch (error) {
    console.error('Error imprimiendo:', error);
    alert('Error al imprimir. Intente nuevamente.');
  }
};

const downloadFactura = async () => {
  try {
    // Importaciones dinámicas para evitar errores de SSR
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf'),
      import('html2canvas')
    ]);

  const element = document.getElementById('factura-content');

  // Ocultar elementos que no deben aparecer en el PDF
  const noPrintElements = element.querySelectorAll('.no-print');
  const originalDisplays = [];
  noPrintElements.forEach(el => {
    originalDisplays.push(el.style.display);
    el.style.display = 'none';
  });

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
  });

  // Restaurar la visibilidad de los elementos
  noPrintElements.forEach((el, index) => {
    el.style.display = originalDisplays[index];
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  const numeroFactura = props.factura.num_consecutivo || '';
  const nombreEntidad = props.factura.contrato?.entidad?.nombre || '';
  const clienteOProveedor = props.factura.contrato?.ClienteOProveedor || '';
  const filename = `Factura ${numeroFactura} ${nombreEntidad} - ${clienteOProveedor}.pdf`.replace(/[^a-zA-Z0-9\s\-_.]/g, '').trim();
  pdf.save(filename);
  } catch (error) {
    console.error('Error generando PDF:', error);
    alert('Error al generar el PDF. Intente nuevamente.');
  }
};

const totalRows = 10;
const emptyRows = computed(() => {
  const serviciosCount = props.factura.servicio ? props.factura.servicio.length : 0;
  const productosCount = props.factura.productos ? props.factura.productos.length : 0;
  const filledRows = serviciosCount + productosCount;
  const emptyCount = totalRows - filledRows;
  return emptyCount > 0 ? Array.from({ length: emptyCount }, (_, i) => i + 1) : [];
});
</script>

<style scoped>
/* Estilos para el modal de factura */
#factura-content {
  font-family: 'Arial', sans-serif;
  color: #000;
  background: white;
  max-width: 800px;
  margin: 0 auto;
}

/* Estilos para impresión */
@media print {
  body * {
    visibility: hidden;
  }
  #factura-content, #factura-content * {
    visibility: visible;
  }
  #factura-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    box-shadow: none;
    padding: 20px;
    border: 1px solid #000;
  }
  
  /* Mejorar la apariencia de las tablas en impresión */
  table {
    page-break-inside: avoid;
  }
  
  /* Asegurar que las líneas de firma se vean bien */
  .border-b {
    border-bottom: 1px solid #000 !important;
  }
  
  /* Ocultar botones durante la impresión */
  .no-print {
    display: none !important;
  }
}

/* Estilos para las tablas */
table {
  border-collapse: collapse;
  width: 100%;
  border: 1px solid #000;
}

th, td {
  border: 1px solid #000;
  padding: 8px;
  text-align: left;
}

th {
  font-weight: bold;
  text-align: center;
  background-color: #f0f0f0;
}

/* Estilos específicos para encabezados de tabla */
thead tr {
  background-color: #f0f0f0;
}

/* Estilos para los encabezados de sección */
h3 {
  margin: 0;
  font-weight: bold;
  color: #2563eb;
}

/* Estilos para el título principal */
h1 {
  font-weight: bold;
  color: #dc2626;
  text-transform: uppercase;
}

/* Estilos para los totales */
.text-lg {
  font-size: 1.125rem;
}

/* Estilos para las líneas de firma */
.border-b {
  border-bottom: 1px solid #000;
  min-height: 20px;
}

/* Estilos específicos para la factura */
.border-black {
  border-color: #000 !important;
}

/* Espaciado mejorado */
.space-y-0\.5 > * + * {
  margin-top: 0.125rem;
}

.space-y-1 > * + * {
  margin-top: 0.25rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

/* Alineación de texto */
.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.font-bold {
  font-weight: bold;
}
</style>
