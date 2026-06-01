<template>
  <div class="min-h-screen bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white">
    <SeoMeta
      title="Bajas - AFTUP"
      description="Gestión de bajas de activos fijos tangibles y útiles."
      canonical="/bajas"
    />
    <Navbar />

    <!-- Banner de error global -->
    <div v-if="errorBanner"
      class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none">
      <MessageBanner :title="errorBanner.title" :description="errorBanner.description" :type="errorBanner.type"
        @close="errorBanner = null" class="pointer-events-auto" />
    </div>

    <!-- ConfirmBanner para eliminar -->
    <div v-if="showConfirmBanner" class="fixed top-24 left-1/2 transform -translate-x-1/2 z-[10000] w-full max-w-md px-4 pointer-events-auto">
      <ConfirmBanner
        :title="'¿Estás seguro de eliminar esta baja?'"
        :description="'Esta acción no se puede deshacer.'"
        type="warning"
        @confirm="confirmarEliminar"
        @close="showConfirmBanner = false"
      />
    </div>

    <!-- Filtros -->
    <div class="w-[95%] mx-auto px-4 py-4 md:py-4 mt-20 md:mt-0">
      <div class="bg-white rounded-lg shadow-md p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nota</label>
            <input type="text" v-model="filtros.nota" placeholder="Buscar por nota..."
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
              @keyup.enter="handleSearch" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <SelectSearch v-model="filtros.estado" :options="estadoOptions" labelKey="label" valueKey="value"
              placeholder="Seleccionar estado..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo traslado</label>
            <SelectSearch v-model="filtros.tipo_traslado" :options="tipoOptions" labelKey="label" valueKey="value"
              placeholder="aft / util" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <input type="text" v-model="filtros.motivo" placeholder="Motivo de baja..."
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
              @keyup.enter="handleSearch" />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha creación (desde)</label>
            <input type="datetime-local" v-model="filtros.fecha_hora_creacion_desde"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha creación (hasta)</label>
            <input type="datetime-local" v-model="filtros.fecha_hora_creacion_hasta"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha cierre (desde)</label>
            <input type="datetime-local" v-model="filtros.fecha_hora_cierreSolicitud_desde"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha cierre (hasta)</label>
            <input type="datetime-local" v-model="filtros.fecha_hora_cierreSolicitud_hasta"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" />
          </div>
        </div>
        <div class="flex justify-end gap-2 flex-wrap mt-4">
          <button @click="handleSearch"
            class="px-6 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] focus:ring-offset-2 transition-colors">
            Buscar
          </button>
          <button @click="limpiarFiltros"
            class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de bajas con acciones -->
    <div class="w-[95%] mx-auto px-4 py-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-[#077a99]">Bajas</h2>
        <button @click="abrirModalCrear"
          class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Baja
        </button>
      </div>
      <DataTable
        :columns="columnasBase"
        :actions="acciones"
        :items="itemsData"
        :total-items="totalItems"
        :items-per-page="itemsPorPage"
        :current-page="currentPage"
        :is-loading="isLoading"
        @page-change="handlePageChange"
        @row-click="handleRowClick"
      />
      <div>
        <BajaPdfAft ref="pdfAftRef" :baja="bajaParaPdf" />
        <BajaPdfUtil ref="pdfUtilRef" :baja="bajaParaPdf" />
      </div>
    </div>

    <!-- Modal de Baja -->
    <BajaModal
      v-model="showModal"
      :baja="selectedBaja"
      :is-editing="isEditing"
      :is-viewing="isViewing"
      @submit="handleSubmitBaja"
      @success="refrescarLista"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import Navbar from "@/components/Navbar.vue";
import SeoMeta from '@/components/SeoMeta.vue';
import DataTable from "@/components/DataTable.vue";
import MessageBanner from '@/components/MessageBanner.vue';
import SelectSearch from '@/components/SelectSearch.vue';
import ConfirmBanner from '@/components/ConfirmBanner.vue';
import BajaModal from '@/components/BajaModal.vue';
import BajaPdfAft from '@/components/BajaPdfAft.vue';
import BajaPdfUtil from '@/components/BajaPdfUtil.vue';
import { navigateTo } from 'nuxt/app';

// Filtros
const filtros = ref({
  nota: '',
  estado: '',
  tipo_traslado: '',
  motivo: '',
  fecha_hora_creacion_desde: '',
  fecha_hora_creacion_hasta: '',
  fecha_hora_cierreSolicitud_desde: '',
  fecha_hora_cierreSolicitud_hasta: ''
});

const estadoOptions = [
  { label: 'Todos', value: '' },
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'En Proceso', value: 'En Proceso' },
  { label: 'Aprobada', value: 'Aprobada' },
  { label: 'Rechazada', value: 'Rechazada' },
  { label: 'Cancelada', value: 'Cancelada' },
  { label: 'Completada', value: 'Completada' }
];

const tipoOptions = [
  { label: 'Todos', value: '' },
  { label: 'AFT', value: 'aft' },
  { label: 'Útil', value: 'util' }
];

// Paginación
const currentPage = ref(1);
const itemsPorPage = ref(20);
const totalItems = ref(0);
const isLoading = ref(false);
const itemsData = ref([]);
const errorBanner = ref(null);

// Modal y confirmación
const showModal = ref(false);
const selectedBaja = ref({});
const isEditing = ref(false);
const isViewing = ref(false);
const showConfirmBanner = ref(false);
const bajaAEliminar = ref(null);

const config = useRuntimeConfig();

const obtenerMensajeErrorApi = async (response) => {
  const contentType = response.headers.get('Content-Type') || '';
  try {
    const text = await response.text();
    if (!text) {
      return response.statusText || `Error ${response.status}`;
    }
    if (contentType.includes('application/json')) {
      const data = JSON.parse(text);
      if (data?.error) return data.error;
      if (data?.message) return data.message;
    }
    return text;
  } catch {
    return response.statusText || `Error ${response.status}`;
  }
};

// Obtener área del usuario logueado
const obtenerAreaUsuario = () => {
  try {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id_AreaResponsabilidad ? user.id_AreaResponsabilidad.trim() : '';
    }
  } catch (e) {}
  return '';
};

// Columnas base
const columnasBase = [
  { key: 'id_AreaResponsabilidad', label: 'Área Responsabilidad' },
  { key: 'motivo', label: 'Motivo' },
  { key: 'estado', label: 'Estado' },
  { key: 'tipo_traslado', label: 'Tipo' },
  { key: 'fecha_creacion', label: 'Fecha Creación' },
  { key: 'fecha_cierre', label: 'Fecha Cierre' },
  { key: 'usuario_creador', label: 'Usuario Creador' }
];

const pdfAftRef = ref(null);
const pdfUtilRef = ref(null);
const bajaParaPdf = ref({});

const editarBaja = (item) => {
  selectedBaja.value = item.raw || item;
  isEditing.value = true;
  isViewing.value = false;
  showModal.value = true;
};

const eliminarBaja = (item) => {
  bajaAEliminar.value = item.raw || item;
  showConfirmBanner.value = true;
};

const handleModeloBaja = async (item) => {
  bajaParaPdf.value = item.raw || item;
  const tipo = (item.raw?.solicitud?.tipo_traslado || item.tipo_traslado || '').toString().toLowerCase();
  console.log('handleModeloBaja start', {
    id: item?.id_solicitud,
    tipo,
    item,
    pdfAftRef: pdfAftRef.value,
    pdfUtilRef: pdfUtilRef.value
  });
  try {
    if (tipo === 'aft') {
      if (!pdfAftRef.value) console.warn('pdfAftRef no está disponible');
      await pdfAftRef.value?.exportPdf?.();
    } else {
      if (!pdfUtilRef.value) console.warn('pdfUtilRef no está disponible');
      await pdfUtilRef.value?.exportPdf?.();
    }
    console.log('handleModeloBaja completed successfully', { tipo });
  } catch (error) {
    console.error('handleModeloBaja error', error);
    errorBanner.value = {
      title: 'Error',
      description: error?.message || 'No se pudo generar el modelo de baja.',
      type: 'error'
    };
  }
};

const acciones = [
  {
    name: 'Modelo de baja',
    buttonClass: 'px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600',
    handler: handleModeloBaja
  },
  {
    name: 'Editar',
    buttonClass: 'px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600',
    handler: editarBaja,
    visible: (item) => {
      const estado = item.estado || item.raw?.solicitud?.estado;
      return estado !== 'Completada';
    }
  },
  {
    name: 'Eliminar',
    buttonClass: 'px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600',
    handler: eliminarBaja,
    visible: (item) => {
      const estado = item.estado || item.raw?.solicitud?.estado;
      return estado !== 'Completada';
    }
  }
];

const confirmarEliminar = async () => {
  if (!bajaAEliminar.value) return;
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${config.public.backendHost}/bajas/${bajaAEliminar.value.id_solicitud}`, {
      method: 'DELETE',
      headers: { Authorization: token }
    });
    if (!response.ok) throw new Error('Error al eliminar');
    errorBanner.value = { title: 'Éxito', description: 'Baja eliminada correctamente', type: 'success' };
    await fetchBajas(currentPage.value);
  } catch (err) {
    errorBanner.value = { title: 'Error', description: err.message, type: 'error' };
  } finally {
    showConfirmBanner.value = false;
    bajaAEliminar.value = null;
  }
};

// Obtener bajas desde la API
const fetchBajas = async (page = 1) => {
  const token = localStorage.getItem('token');
  if (!token) return navigateTo('/');

  isLoading.value = true;
  errorBanner.value = null;

  try {
    const idArea = obtenerAreaUsuario();
    const body = { id_AreaResponsabilidad: idArea };
    if (filtros.value.nota) body.nota = filtros.value.nota;
    if (filtros.value.estado) body.estado = filtros.value.estado;
    if (filtros.value.tipo_traslado) body.tipo_traslado = filtros.value.tipo_traslado;
    if (filtros.value.motivo) body.motivo = filtros.value.motivo;
    if (filtros.value.fecha_hora_creacion_desde) body.fecha_hora_creacion_desde = new Date(filtros.value.fecha_hora_creacion_desde).toISOString();
    if (filtros.value.fecha_hora_creacion_hasta) body.fecha_hora_creacion_hasta = new Date(filtros.value.fecha_hora_creacion_hasta).toISOString();
    if (filtros.value.fecha_hora_cierreSolicitud_desde) body.fecha_hora_cierreSolicitud_desde = new Date(filtros.value.fecha_hora_cierreSolicitud_desde).toISOString();
    if (filtros.value.fecha_hora_cierreSolicitud_hasta) body.fecha_hora_cierreSolicitud_hasta = new Date(filtros.value.fecha_hora_cierreSolicitud_hasta).toISOString();
    
    const res = await fetch(`${config.public.backendHost}/bajas/filtrar/${page}/${itemsPorPage.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(body)
    });

    if (res.status === 401) throw new Error('Sesión expirada');
    if (res.status === 403) throw new Error('Acceso denegado');
    if (!res.ok) {
      const errorMessage = await obtenerMensajeErrorApi(res);
      throw new Error(errorMessage);
    }

    const data = await res.json();
    itemsData.value = data.datos.map(item => {
      const solicitud = item.solicitud || {};
      const primerUsuario = solicitud.usuarios?.[0] || {};
      return {
        id_solicitud: item.id_solicitud,
        id_AreaResponsabilidad: item.id_AreaResponsabilidad?.trim() || '',
        motivo: item.motivo || '',
        estado: solicitud.estado || '',
        tipo_traslado: solicitud.tipo_traslado || '',
        fecha_creacion: solicitud.fecha_hora_creacion ? new Date(solicitud.fecha_hora_creacion).toLocaleDateString() : '',
        fecha_cierre: solicitud.fecha_hora_cierreSolicitud ? new Date(solicitud.fecha_hora_cierreSolicitud).toLocaleDateString() : '',
        usuario_creador: primerUsuario.id_usuario_LDAP || '',
        raw: item
      };
    });
    totalItems.value = data.total || 0;
    currentPage.value = data.pagina || page;
  } catch (err) {
    console.error(err);
    if (err.message === 'Sesión expirada') {
      errorBanner.value = { title: 'Sesión Expirada', description: 'Redirigiendo al inicio...', type: 'warning' };
      localStorage.removeItem('token');
      setTimeout(() => navigateTo('/'), 2000);
    } else {
      errorBanner.value = { title: 'Error', description: err.message, type: 'error' };
    }
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchBajas(1);
};

const limpiarFiltros = () => {
  filtros.value = {
    nota: '', estado: '', tipo_traslado: '', motivo: '',
    fecha_hora_creacion_desde: '', fecha_hora_creacion_hasta: '',
    fecha_hora_cierreSolicitud_desde: '', fecha_hora_cierreSolicitud_hasta: ''
  };
  handleSearch();
};

const handlePageChange = (page) => fetchBajas(page);

const handleRowClick = (item) => {
  selectedBaja.value = item.raw || item;
  isEditing.value = false;
  isViewing.value = true;
  showModal.value = true;
};

const abrirModalCrear = () => {
  selectedBaja.value = {};
  isEditing.value = false;
  isViewing.value = false;
  showModal.value = true;
};

const handleSubmitBaja = async (payload) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    let response;
    if (isEditing.value && selectedBaja.value.id_solicitud) {
      response = await fetch(`${config.public.backendHost}/bajas/${selectedBaja.value.id_solicitud}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify(payload)
      });
    } else {
      response = await fetch(`${config.public.backendHost}/bajas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Error ${response.status}`);
    }

    errorBanner.value = {
      title: isEditing.value ? 'Baja actualizada' : 'Baja creada',
      description: 'Operación exitosa',
      type: 'success'
    };
    showModal.value = false;
    fetchBajas(currentPage.value);
  } catch (err) {
    errorBanner.value = { title: 'Error', description: err.message, type: 'error' };
  }
};

const refrescarLista = () => {
  fetchBajas(currentPage.value);
};

onMounted(() => {
  if (!localStorage.getItem('token')) navigateTo('/');
  fetchBajas();
});
</script>

<style scoped></style>