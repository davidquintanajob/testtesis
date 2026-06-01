<template>
  <Modal :show="modelValue" @close="$emit('update:modelValue', false)" size="2xl">
    <template #title>
      <h3 class="text-lg font-semibold text-gray-900">
        {{ isViewing ? 'Detalles de la Salida' : (isEditing ? 'Editar Salida' : 'Nueva Salida') }}
      </h3>
    </template>

    <template #content>
      <div v-if="isViewing" class="space-y-6">
        <!-- Vista sólo lectura -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-md font-medium text-gray-900 mb-3">Información del Producto</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre</label>
              <p class="mt-1 text-sm text-gray-900">{{ salida.producto?.nombre || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Código</label>
              <p class="mt-1 text-sm text-gray-900">{{ salida.producto?.codigo || 'N/A' }}</p>
            </div>
          </div>
        </div>
        <div class="bg-blue-50 rounded-lg p-4">
          <h4 class="text-md font-medium text-gray-900 mb-3">Información de la Salida</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Cantidad</label>
              <p class="mt-1 text-sm text-gray-900">{{ salida.cantidad }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Fecha</label>
              <p class="mt-1 text-sm text-gray-900">{{ salida.fecha ? new Date(salida.fecha).toLocaleDateString('es-ES') : 'N/A' }}</p>
            </div>
             <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Descripción</label>
              <p class="mt-1 text-sm text-gray-900">{{ salida.descripcion || 'Sin descripción' }}</p>
            </div>
          </div>
        </div>
         <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-md font-medium text-gray-900 mb-3">Información del Sistema</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Creado por</label>
              <p class="mt-1 text-sm text-gray-900">{{ salida.usuario?.nombre || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Creado</label>
              <p class="mt-1 text-sm text-gray-900">{{ salida.createdAt ? new Date(salida.createdAt).toLocaleString('es-ES') : 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Última Actualización</label>
              <p class="mt-1 text-sm text-gray-900">{{ salida.updatedAt ? new Date(salida.updatedAt).toLocaleString('es-ES') : 'N/A' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-6">
        <!-- Formulario de creación/edición -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Producto</label>
            <SelectSearchAPI
              v-model="form.id_producto"
              endpoint="/Producto/filterProductos/1/10"
              method="POST"
              search-key="nombre"
              label-key="nombre"
              value-key="id_producto"
              placeholder="Buscar producto..."
              :initial-label="productoNombre"
              @producto-seleccionado="handleProductoSeleccionado"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" v-model="form.fecha" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input type="number" v-model.number="form.cantidad" min="0" step="0.01" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
           <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input type="text" :value="usuarioNombre" class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100" disabled />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input type="text" v-model="form.descripcion" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Descripción..." />
          </div>
        </div>
        <div v-if="errorList.length" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          <div v-for="(e, idx) in errorList" :key="idx">{{ e }}</div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <button v-if="!isViewing" @click="onSubmit" class="px-4 py-2 bg-primary text-neutral rounded-lg hover:bg-primary/90">{{ isEditing ? 'Guardar' : 'Crear' }}</button>
        <button @click="$emit('update:modelValue', false)" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Cerrar</button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import Modal from '@/components/Modal.vue';
import SelectSearchAPI from '@/components/SelectSearchAPI.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  salida: { type: Object, default: () => ({}) },
  isViewing: { type: Boolean, default: true },
  isEditing: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'submit']);

const form = reactive({ 
  id_producto: null, 
  id_usuario: null,
  cantidad: null, 
  descripcion: '', 
  fecha: '' 
});

const usuarioNombre = ref('');
const productoNombre = ref('');
const errorList = ref([]);

watch(() => props.salida, (val) => {
  if (val && Object.keys(val).length) {
    form.id_producto = val.id_producto || val.producto?.id_producto || null;
    productoNombre.value = val.producto?.nombre || '';
    form.cantidad = val.cantidad || null;
    form.descripcion = val.descripcion || '';
    form.fecha = val.fecha ? val.fecha.substring(0,10) : '';
    form.id_usuario = val.id_usuario || null;
    usuarioNombre.value = val.usuario?.nombre || '';
  } else {
    // Reset form for new entry
    form.id_producto = null;
    productoNombre.value = '';
    form.cantidad = null;
    form.descripcion = '';
    form.fecha = '';
    // Get user from localStorage for new entries
    if (process.client) {
      const storedUser = JSON.parse(localStorage.getItem('usuario'));
      if (storedUser) {
        form.id_usuario = storedUser.id_usuario;
        usuarioNombre.value = storedUser.nombre;
      }
    }
  }
}, { immediate: true, deep: true });

function handleProductoSeleccionado(selected) {
  if (selected) {
    form.id_producto = selected.id_producto;
    productoNombre.value = selected.nombre;
  } else {
    form.id_producto = null;
    productoNombre.value = '';
  }
}

function onSubmit() {
  errorList.value = [];
  if (!form.id_producto) errorList.value.push('Debe seleccionar un producto');
  if (form.cantidad == null || Number(form.cantidad) <= 0) errorList.value.push('La cantidad debe ser mayor que 0');
  if (!form.fecha) errorList.value.push('Debe seleccionar una fecha');
  if (!form.descripcion) errorList.value.push('Debe añadir una descripción');
  if (errorList.value.length) return;
  
  const payload = {
    id_producto: form.id_producto,
    id_usuario: form.id_usuario,
    fecha: form.fecha,
    descripcion: form.descripcion,
    cantidad: Number(form.cantidad)
  };
  emit('submit', payload);
}

watch(() => props.modelValue, (open) => {
  if (open) {
    // When modal opens, if it's a new entry, ensure user is set
    if (!props.isEditing && !props.isViewing) {
      if (process.client) {
        const storedUser = JSON.parse(localStorage.getItem('usuario'));
        if (storedUser) {
          form.id_usuario = storedUser.id_usuario;
          usuarioNombre.value = storedUser.nombre;
        }
      }
    }
  } else {
    errorList.value = [];
  }
});

onMounted(() => {
  if (process.client) {
    const storedUser = JSON.parse(localStorage.getItem('usuario'));
    if (storedUser) {
      if (!props.isEditing && !props.isViewing) {
        form.id_usuario = storedUser.id_usuario;
      }
      usuarioNombre.value = storedUser.nombre;
    }
  }
});
</script>
