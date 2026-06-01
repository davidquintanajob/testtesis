<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Detalles de Lista de Ventas</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="mb-4">
        <div class="text-sm text-gray-600">Nota: <span class="font-medium">{{ listaVenta?.nota || '-' }}</span></div>
        <div class="text-sm text-gray-600">Creado: <span class="font-medium">{{ listaVenta?.createdAt ? listaVenta.createdAt.substring(0,19).replace('T',' ') : '-' }}</span></div>
      </div>

      <div>
        <DataTable
          :columns="ventasColumns"
          :items="ventasData"
          :is-loading="false"
          :items-per-page="5"
          :total-items="ventasTotal"
          :current-page="ventasPage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import DataTable from './DataTable.vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  listaVenta: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['update:modelValue']);

const ventasPage = ref(1);

// Formateador de hora 12h (igual que en la vista de ventas)
function formatTime12(timeStr) {
  if (!timeStr) return '';
  const t = String(timeStr).substring(0,8);
  const parts = t.split(':');
  if (parts.length < 2) return timeStr;
  let hh = parseInt(parts[0], 10);
  const mm = parts[1];
  const ampm = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${mm} ${ampm}`;
}

const ventasColumns = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'hora', label: 'Hora' },
  { key: 'productoNombre', label: 'Producto' },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'precio_cobrado', label: 'Precio Cobrado' },
  { key: 'total', label: 'Total' },
  { key: 'forma_pago', label: 'Forma Pago' },
  { key: 'usuario', label: 'Usuario' }
];

const ventasData = computed(() => {
  const v = Array.isArray(props.listaVenta?.ventas) ? props.listaVenta.ventas : [];
  return v.map(item => {
    const fecha = item.fecha_hora ? item.fecha_hora.substring(0,10) : (item.createdAt ? item.createdAt.substring(0,10) : '');
    const horaRaw = item.fecha_hora ? item.fecha_hora.substring(11,19) : (item.createdAt ? item.createdAt.substring(11,19) : '');
    const hora = formatTime12(horaRaw);
    return {
      fecha,
      hora,
      productoNombre: item.producto ? item.producto.nombre : (item.servicio ? item.servicio.nombre : ''),
      cantidad: item.cantidad,
      precio_cobrado: item.precio_cobrado,
      total: (Number(item.cantidad || 0) * (parseFloat(item.precio_cobrado) || 0)).toFixed(2),
      usuario: item.usuario ? item.usuario.nombre_usuario : '',
      forma_pago: item.forma_pago || ''
    };
  });
});

const ventasTotal = computed(() => ventasData.value.length);

function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
/* estilos si necesarios */
</style>
