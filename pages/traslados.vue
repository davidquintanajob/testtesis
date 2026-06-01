<template>
  <div class="min-h-screen bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white">
    <SeoMeta
      title="Traslados - AFTUP"
      description="Gestión de traslados de activos fijos tangibles y útiles."
      canonical="/traslados"
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
        :title="'¿Estás seguro de eliminar este traslado?'"
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
            <input type="text" v-model="filtros.tipo_traslado" placeholder="aft / util"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
              @keyup.enter="handleSearch" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Área destino</label>
            <input type="text" v-model="filtros.id_AreaResponsabilidad_destino" placeholder="ID área destino"
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

    <!-- Tabla de traslados con acciones -->
    <div class="w-[95%] mx-auto px-4 py-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-[#077a99]">Movimientos</h2>
        <button @click="abrirModalCrear"
          class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Traslado
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
        <TrasladoPdfAft ref="pdfAftRef" :traslado="trasladoParaPdf" />
        <TrasladoPdfUtil ref="pdfUtilRef" :traslado="trasladoParaPdf" />
      </div>
    </div>

    <!-- Modal de Traslado -->
    <TrasladoModal
      v-model="showModal"
      :traslado="selectedTraslado"
      :is-editing="isEditing"
      :is-viewing="isViewing"
      @submit="handleSubmitTraslado"
      @success="refrescarLista"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from "@/components/Navbar.vue";
import SeoMeta from '@/components/SeoMeta.vue';
import DataTable from "@/components/DataTable.vue";
import MessageBanner from '@/components/MessageBanner.vue';
import SelectSearch from '@/components/SelectSearch.vue';
import ConfirmBanner from '@/components/ConfirmBanner.vue';
import TrasladoModal from '@/components/TrasladoModal.vue';
import TrasladoPdfAft from '@/components/TrasladoPdfAft.vue';
import TrasladoPdfUtil from '@/components/TrasladoPdfUtil.vue';
import { navigateTo } from 'nuxt/app';

// Filtros (ya no incluye id_AreaResponsabilidad_origen)
const filtros = ref({
  nota: '',
  estado: '',
  tipo_traslado: '',
  fecha_hora_creacion_desde: '',
  fecha_hora_creacion_hasta: '',
  fecha_hora_cierreSolicitud_desde: '',
  fecha_hora_cierreSolicitud_hasta: '',
  id_AreaResponsabilidad_destino: ''
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

const currentPage = ref(1);
const itemsPorPage = ref(20);
const totalItems = ref(0);
const isLoading = ref(false);
const itemsData = ref([]);
const errorBanner = ref(null);

const showModal = ref(false);
const selectedTraslado = ref({});
const isEditing = ref(false);
const isViewing = ref(false);
const showConfirmBanner = ref(false);
const trasladoAEliminar = ref(null);

const config = useRuntimeConfig();

// Obtener usuario desde localStorage (clave 'usuario' o 'user')
const getUserFromLocalStorage = () => {
  // Priorizar 'usuario' porque así aparece en los logs
  let userStr = localStorage.getItem('usuario');
  if (!userStr) {
    userStr = localStorage.getItem('user');
  }
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Error parseando usuario', e);
    return null;
  }
};

const obtenerMensajeErrorApi = async (response) => {
  const contentType = response.headers.get('Content-Type') || '';
  try {
    const text = await response.text();
    if (!text) return response.statusText || `Error ${response.status}`;
    if (contentType.includes('application/json')) {
      const data = JSON.parse(text);
      return data?.error || data?.message || text;
    }
    return text;
  } catch {
    return response.statusText || `Error ${response.status}`;
  }
};

const columnasBase = [
  { key: 'id_AreaResponsabilidad_origen', label: 'Área Origen' },
  { key: 'id_AreaResponsabilidad_destino', label: 'Área Destino' },
  { key: 'estado', label: 'Estado' },
  { key: 'tipo_traslado', label: 'Tipo Traslado' },
  { key: 'tipo_movimiento', label: 'Tipo Movimiento' },
  { key: 'cantidad_detalles', label: 'Cantidad Activos' }
];

const pdfAftRef = ref(null);
const pdfUtilRef = ref(null);
const trasladoParaPdf = ref({});

const editarTraslado = (item) => {
  selectedTraslado.value = item.raw || item;
  isEditing.value = true;
  isViewing.value = false;
  showModal.value = true;
};

const eliminarTraslado = (item) => {
  trasladoAEliminar.value = item.raw || item;
  showConfirmBanner.value = true;
};

const handleModeloTraslado = async (item) => {
  trasladoParaPdf.value = item.raw || item;
  const tipo = (item.solicitud?.tipo_traslado || item.tipo_traslado || '').toString().toLowerCase();
  try {
    if (tipo === 'aft') {
      await pdfAftRef.value?.exportPdf?.();
    } else {
      await pdfUtilRef.value?.exportPdf?.();
    }
  } catch (error) {
    errorBanner.value = {
      title: 'Error',
      description: error?.message || 'No se pudo generar el modelo de traslado.',
      type: 'error'
    };
  }
};

const acciones = [
  {
    name: 'Modelo para traslado',
    buttonClass: 'px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600',
    handler: handleModeloTraslado
  },
  {
    name: 'Editar',
    buttonClass: 'px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600',
    handler: editarTraslado,
    visible: (item) => (item.estado || item.raw?.solicitud?.estado) !== 'Completada'
  },
  {
    name: 'Eliminar',
    buttonClass: 'px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600',
    handler: eliminarTraslado,
    visible: (item) => (item.estado || item.raw?.solicitud?.estado) !== 'Completada'
  }
];

const confirmarEliminar = async () => {
  if (!trasladoAEliminar.value) return;
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${config.public.backendHost}/traslados/${trasladoAEliminar.value.id_solicitud}`, {
      method: 'DELETE',
      headers: { Authorization: token }
    });
    if (!response.ok) throw new Error('Error al eliminar');
    errorBanner.value = { title: 'Éxito', description: 'Traslado eliminado correctamente', type: 'success' };
    await fetchTraslados(currentPage.value);
  } catch (err) {
    errorBanner.value = { title: 'Error', description: err.message, type: 'error' };
  } finally {
    showConfirmBanner.value = false;
    trasladoAEliminar.value = null;
  }
};

// Obtener traslados con los filtros requeridos
const fetchTraslados = async (page = 1) => {
  const token = localStorage.getItem('token');
  if (!token) return navigateTo('/');

  const user = getUserFromLocalStorage();
  if (!user) {
    errorBanner.value = { title: 'Error', description: 'No se encontraron datos de usuario. Redirigiendo...', type: 'error' };
    setTimeout(() => navigateTo('/'), 2000);
    return;
  }

  // Validar área de responsabilidad
  let areaOrigen = user.id_AreaResponsabilidad;
  if (!areaOrigen) {
    errorBanner.value = { title: 'Error', description: 'El usuario no tiene área de responsabilidad asignada.', type: 'error' };
    return;
  }
  // Limpiar espacios en blanco
  areaOrigen = String(areaOrigen).trim();

  isLoading.value = true;
  errorBanner.value = null;

  try {
    const body = {};

    if (filtros.value.nota) body.nota = filtros.value.nota;
    if (filtros.value.estado) body.estado = filtros.value.estado;
    if (filtros.value.tipo_traslado) body.tipo_traslado = filtros.value.tipo_traslado;
    if (filtros.value.fecha_hora_creacion_desde) body.fecha_hora_creacion_desde = new Date(filtros.value.fecha_hora_creacion_desde).toISOString();
    if (filtros.value.fecha_hora_creacion_hasta) body.fecha_hora_creacion_hasta = new Date(filtros.value.fecha_hora_creacion_hasta).toISOString();
    if (filtros.value.fecha_hora_cierreSolicitud_desde) body.fecha_hora_cierreSolicitud_desde = new Date(filtros.value.fecha_hora_cierreSolicitud_desde).toISOString();
    if (filtros.value.fecha_hora_cierreSolicitud_hasta) body.fecha_hora_cierreSolicitud_hasta = new Date(filtros.value.fecha_hora_cierreSolicitud_hasta).toISOString();

    // Área origen (siempre la del usuario, sin espacios)
    body.id_AreaResponsabilidad_origen = areaOrigen;

    // Área destino (si el usuario la especificó)
    if (filtros.value.id_AreaResponsabilidad_destino) {
      body.id_AreaResponsabilidad_destino = filtros.value.id_AreaResponsabilidad_destino.trim();
    }

    // === FILTRO id_usuario (requerido) ===
    if (user.id_usuario) {
      body.id_usuario = user.id_usuario;
    } else {
      console.warn('El usuario no tiene id_usuario, no se enviará ese filtro');
    }

    console.log('Enviando a /traslados/filtrar:', JSON.stringify(body, null, 2));

    const res = await fetch(`${config.public.backendHost}/traslados/filtrar/${page}/${itemsPorPage.value}`, {
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
    itemsData.value = data.datos.map(item => ({
      id_solicitud: item.id_solicitud,
      id_AreaResponsabilidad_origen: item.id_AreaResponsabilidad_origen,
      id_AreaResponsabilidad_destino: item.id_AreaResponsabilidad_destino,
      estado: item.solicitud?.estado || '',
      tipo_traslado: item.solicitud?.tipo_traslado || '',
      tipo_movimiento: item.solicitud?.tipo_movimiento || '',
      cantidad_detalles: item.detalles?.length || 0,
      raw: item
    }));
    totalItems.value = data.total || 0;
    currentPage.value = data.pagina || page;
  } catch (err) {
    console.error('Error en fetchTraslados:', err);
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
  fetchTraslados(1);
};

const limpiarFiltros = () => {
  filtros.value = {
    nota: '', estado: '', tipo_traslado: '',
    fecha_hora_creacion_desde: '', fecha_hora_creacion_hasta: '',
    fecha_hora_cierreSolicitud_desde: '', fecha_hora_cierreSolicitud_hasta: '',
    id_AreaResponsabilidad_destino: ''
  };
  handleSearch();
};

const handlePageChange = (page) => fetchTraslados(page);
const handleRowClick = (item) => {
  selectedTraslado.value = item.raw || item;
  isEditing.value = false;
  isViewing.value = true;
  showModal.value = true;
};
const abrirModalCrear = () => {
  selectedTraslado.value = {};
  isEditing.value = false;
  isViewing.value = false;
  showModal.value = true;
};
const handleSubmitTraslado = async (payload) => {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    let response;
    if (isEditing.value && selectedTraslado.value.id_solicitud) {
      response = await fetch(`${config.public.backendHost}/traslados/${selectedTraslado.value.id_solicitud}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify(payload)
      });
    } else {
      response = await fetch(`${config.public.backendHost}/traslados`, {
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
      title: isEditing.value ? 'Traslado actualizado' : 'Traslado creado',
      description: 'Operación exitosa',
      type: 'success'
    };
    showModal.value = false;
    fetchTraslados(currentPage.value);
  } catch (err) {
    errorBanner.value = { title: 'Error', description: err.message, type: 'error' };
  }
};
const refrescarLista = () => fetchTraslados(currentPage.value);

onMounted(() => {
  const token = localStorage.getItem('token');
  if (!token) return navigateTo('/');
  const user = getUserFromLocalStorage();
  if (!user || !user.id_AreaResponsabilidad) {
    errorBanner.value = { title: 'Error', description: 'Datos de usuario incompletos. Redirigiendo...', type: 'error' };
    setTimeout(() => navigateTo('/'), 2000);
    return;
  }
  fetchTraslados();
});
</script>

<style scoped></style>