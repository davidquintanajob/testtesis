<template>
  <div class="min-h-screen bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white">
    <SeoMeta
      title="Revisiones - AFTUP"
      description="Gestión de revisiones de activos fijos tangibles y útiles."
      canonical="/revisiones"
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
        :title="'¿Estás seguro de eliminar esta revisión?'"
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Área de responsabilidad</label>
            <SelectSearchAPI
              v-model="filtros.id_AreaResponsabilidad"
              :multiple="false"
              endpoint="/areas/filtrar/1/5"
              method="POST"
              search-key="Desc_AreaResponsabilidad"
              label-key="Desc_AreaResponsabilidad"
              value-key="Id_AreaResponsabilidad"
              :label-format="'{{Desc_AreaResponsabilidad}} - {{Id_AreaResponsabilidad}}'"
              placeholder="Buscar área..."
              :direct-data="false"
              :data-key="'datos'"
            />
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

    <!-- Tabla de revisiones -->
    <div class="w-[95%] mx-auto px-4 py-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-[#077a99]">Revisiones</h2>
        <button @click="abrirModalCrear"
          class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Revisión
        </button>
      </div>
      <DataTable
        :columns="columnasConAcciones"
        :items="itemsData"
        :total-items="totalItems"
        :items-per-page="itemsPorPage"
        :current-page="currentPage"
        :is-loading="isLoading"
        @page-change="handlePageChange"
        @row-click="handleRowClick"
      />
    </div>

    <!-- Modal de Revisión -->
    <RevisionesModal
      v-model="showModal"
      :revision="selectedRevision"
      :is-editing="isEditing"
      :is-viewing="isViewing"
      @submit="handleSubmitRevision"
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
import SelectSearchAPI from '@/components/SelectSearchAPI.vue';
import ConfirmBanner from '@/components/ConfirmBanner.vue';
import RevisionesModal from '@/components/revisionesModal.vue';
import { navigateTo } from 'nuxt/app';

// Filtros
const filtros = ref({
  nota: '',
  estado: '',
  tipo_traslado: '',
  fecha_hora_creacion_desde: '',
  fecha_hora_creacion_hasta: '',
  id_AreaResponsabilidad: ''
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
const selectedRevision = ref({});
const isEditing = ref(false);
const isViewing = ref(false);
const showConfirmBanner = ref(false);
const revisionAEliminar = ref(null);

const config = useRuntimeConfig();

// Columnas base
const columnasBase = [
  { key: 'area', label: 'Área' },
  { key: 'estado', label: 'Estado' },
  { key: 'tipo_traslado', label: 'Tipo Traslado' },
  { key: 'fecha_creacion', label: 'Fecha Creación' },
  { key: 'total_elementos', label: 'Total Elementos' },
  { key: 'revisados', label: 'Revisados' },
  { key: 'pendientes', label: 'Pendientes' }
];

// Columna de acciones
const columnasConAcciones = computed(() => {
  return [
    ...columnasBase,
    {
      key: 'acciones',
      label: 'Acciones',
      cellRenderer: (value, item) => {
        if (item.estado === 'Completada') return '';
        return `
          <div class="flex space-x-2">
            <button class="editar-revision-btn px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600" data-id="${item.id_solicitud}">Editar</button>
            <button class="eliminar-revision-btn px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600" data-id="${item.id_solicitud}">Eliminar</button>
          </div>
        `;
      }
    }
  ];
});

// Asignar event listeners a los botones dinámicos
const setupActionListeners = () => {
  nextTick(() => {
    document.querySelectorAll('.editar-revision-btn').forEach(btn => {
      btn.removeEventListener('click', handleEditarClick);
      btn.addEventListener('click', handleEditarClick);
    });
    document.querySelectorAll('.eliminar-revision-btn').forEach(btn => {
      btn.removeEventListener('click', handleEliminarClick);
      btn.addEventListener('click', handleEliminarClick);
    });
  });
};

// Manejador editar
const handleEditarClick = (event) => {
  event.stopPropagation();
  const id = event.currentTarget.getAttribute('data-id');
  const revision = itemsData.value.find(r => r.id_solicitud == id);
  if (revision) {
    selectedRevision.value = revision.raw || revision;
    isEditing.value = true;
    isViewing.value = false;
    showModal.value = true;
  }
};

// Manejador eliminar
const handleEliminarClick = (event) => {
  event.stopPropagation();
  const id = event.currentTarget.getAttribute('data-id');
  const revision = itemsData.value.find(r => r.id_solicitud == id);
  if (revision) {
    revisionAEliminar.value = revision;
    showConfirmBanner.value = true;
  }
};

// Confirmar eliminación
const confirmarEliminar = async () => {
  if (!revisionAEliminar.value) return;
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${config.public.backendHost}/revisiones/${revisionAEliminar.value.id_solicitud}`, {
      method: 'DELETE',
      headers: { Authorization: token }
    });
    if (!response.ok) throw new Error('Error al eliminar');
    errorBanner.value = { title: 'Éxito', description: 'Revisión eliminada correctamente', type: 'success' };
    await fetchRevisiones(currentPage.value);
  } catch (err) {
    errorBanner.value = { title: 'Error', description: err.message, type: 'error' };
  } finally {
    showConfirmBanner.value = false;
    revisionAEliminar.value = null;
  }
};

// Obtener revisiones desde la API
const fetchRevisiones = async (page = 1) => {
  const token = localStorage.getItem('token');
  if (!token) return navigateTo('/');

  isLoading.value = true;
  errorBanner.value = null;

  try {
    const body = {};
    if (filtros.value.nota) body.nota = filtros.value.nota;
    if (filtros.value.estado) body.estado = filtros.value.estado;
    if (filtros.value.tipo_traslado) body.tipo_traslado = filtros.value.tipo_traslado;
    if (filtros.value.fecha_hora_creacion_desde) body.fecha_hora_creacion_desde = new Date(filtros.value.fecha_hora_creacion_desde).toISOString();
    if (filtros.value.fecha_hora_creacion_hasta) body.fecha_hora_creacion_hasta = new Date(filtros.value.fecha_hora_creacion_hasta).toISOString();
    if (filtros.value.id_AreaResponsabilidad) body.id_AreaResponsabilidad = filtros.value.id_AreaResponsabilidad;
    
    
    const res = await fetch(`${config.public.backendHost}/revisiones/filtrar/${page}/${itemsPorPage.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(body)
    });

    if (res.status === 401) throw new Error('Sesión expirada');
    if (res.status === 403) throw new Error('Acceso denegado');
    if (!res.ok) throw new Error('Error al cargar datos');

    const data = await res.json();
    itemsData.value = data.datos.map(item => {
      const detalles = item.detalles || [];
      const total = detalles.length;
      const revisados = detalles.filter(d => d.isRevisado === true).length;
      const pendientes = total - revisados;
      return {
        id_solicitud: item.id_solicitud,
        area: item.id_AreaResponsabilidad ? item.id_AreaResponsabilidad.trim() : '',
        estado: item.solicitud?.estado || '',
        tipo_traslado: item.solicitud?.tipo_traslado || '',
        fecha_creacion: item.solicitud?.fecha_hora_creacion ? new Date(item.solicitud.fecha_hora_creacion).toLocaleDateString() : '',
        total_elementos: total,
        revisados: revisados,
        pendientes: pendientes,
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
    setupActionListeners();
  }
};

// Acciones de búsqueda y limpieza
const handleSearch = () => {
  currentPage.value = 1;
  fetchRevisiones(1);
};

const limpiarFiltros = () => {
  filtros.value = {
    nota: '',
    estado: '',
    tipo_traslado: '',
    fecha_hora_creacion_desde: '',
    fecha_hora_creacion_hasta: '',
    id_AreaResponsabilidad: ''
  };
  handleSearch();
};

const handlePageChange = (page) => fetchRevisiones(page);

// Al hacer clic en una fila, abrir modal en modo ver
const handleRowClick = (item) => {
  selectedRevision.value = item.raw || item;
  isEditing.value = false;
  isViewing.value = true;
  showModal.value = true;
};

// Apertura del modal para crear
const abrirModalCrear = () => {
  selectedRevision.value = {};
  isEditing.value = false;
  isViewing.value = false;
  showModal.value = true;
};

// Envío del formulario (crear/editar)
const handleSubmitRevision = async (payload) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    let response;
    if (isEditing.value && selectedRevision.value.id_solicitud) {
      response = await fetch(`${config.public.backendHost}/revisiones/${selectedRevision.value.id_solicitud}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify(payload)
      });
    } else {
      response = await fetch(`${config.public.backendHost}/revisiones`, {
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
      title: isEditing.value ? 'Revisión actualizada' : 'Revisión creada',
      description: 'Operación exitosa',
      type: 'success'
    };
    showModal.value = false;
    fetchRevisiones(currentPage.value);
  } catch (err) {
    errorBanner.value = { title: 'Error', description: err.message, type: 'error' };
  }
};

const refrescarLista = () => {
  fetchRevisiones(currentPage.value);
};

// Observar cambios en itemsData para reasignar eventos
watch(() => itemsData.value, () => {
  setupActionListeners();
}, { deep: true });

onMounted(() => {
  if (!localStorage.getItem('token')) navigateTo('/');
  fetchRevisiones();
});
</script>

<style scoped></style>