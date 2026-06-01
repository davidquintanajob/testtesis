<template>
  <div class="min-h-screen bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white">
    <SeoMeta title="Usuarios - AFTUP" description="Gestión de usuarios y roles." canonical="/usuarios" />
    <Navbar />

    <!-- Banner de error global -->
    <div v-if="errorBanner"
      class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none">
      <MessageBanner :title="errorBanner.title" :description="errorBanner.description" :type="errorBanner.type"
        @close="errorBanner = null" class="pointer-events-auto" />
    </div>

    <!-- ConfirmBanner para eliminar -->
    <div v-if="showConfirmBanner"
      class="fixed top-24 left-1/2 transform -translate-x-1/2 z-[10000] w-full max-w-md px-4 pointer-events-auto">
      <ConfirmBanner :title="'¿Estás seguro de eliminar este usuario?'"
        :description="'Esta acción no se puede deshacer.'" type="warning" @confirm="confirmarEliminar"
        @close="showConfirmBanner = false" />
    </div>

    <!-- Filtros -->
    <div class="w-[95%] mx-auto px-4 py-4 md:py-4 mt-20 md:mt-0">
      <div class="bg-white rounded-lg shadow-md p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario LDAP</label>
            <input type="text" v-model="filtros.id_usuario_LDAP" placeholder="Ej: dqvaldes"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
              @keyup.enter="handleSearch" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Área de Responsabilidad</label>
            <input type="text" v-model="filtros.id_AreaResponsabilidad" placeholder="Código de área"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
              @keyup.enter="handleSearch" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select v-model="filtros.rol"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
              @change="handleSearch">
              <option value="">Todos</option>
              <option value="Administrador">Administrador</option>
              <option value="Comercial">Comercial</option>
              <option value="Invitado">Invitado</option>
              <option value="Vendedor">Vendedor</option>
            </select>
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
          <button @click="exportToExcel"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors">
            Exportar a Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="w-[95%] mx-auto px-4 py-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-[#077a99]">Usuarios</h2>
        <button @click="abrirModalCrear"
          class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </button>
      </div>
      <DataTable :columns="columnas" :items="itemsData" :total-items="totalItems" :items-per-page="itemsPorPage"
        :current-page="currentPage" :is-loading="isLoading" @page-change="handlePageChange"
        @row-click="handleRowClick" />
    </div>

    <!-- Modal de Usuario -->
    <UsuarioModal v-model="showModal" :usuario="selectedUsuario" :is-editing="isEditing" :is-viewing="isViewing"
      @submit="handleSubmitUsuario" @success="refrescarLista" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import Navbar from "@/components/Navbar.vue";
import SeoMeta from '@/components/SeoMeta.vue';
import DataTable from "@/components/DataTable.vue";
import MessageBanner from '@/components/MessageBanner.vue';
import ConfirmBanner from '@/components/ConfirmBanner.vue';
import UsuarioModal from '@/components/UsuarioModal.vue';
import { navigateTo } from 'nuxt/app';
import * as XLSX from 'xlsx';

const config = useRuntimeConfig();

// Filtros
const filtros = ref({
  id_usuario_LDAP: '',
  id_AreaResponsabilidad: '',
  rol: ''
});

// Paginación
const currentPage = ref(1);
const itemsPorPage = ref(20);
const totalItems = ref(0);
const isLoading = ref(false);
const itemsData = ref([]);
const errorBanner = ref(null);

// Modal y confirmación
const showModal = ref(false);
const selectedUsuario = ref({});
const isEditing = ref(false);
const isViewing = ref(false);
const showConfirmBanner = ref(false);
const usuarioAEliminar = ref(null);

// Función auxiliar para parsear errores de la API (incluye array "errors")
const parseApiError = async (response) => {
  try {
    const data = await response.json();
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.join('. ');
    }
    if (data.message) return data.message;
    if (typeof data === 'string') return data;
    return `Error ${response.status}: ${response.statusText}`;
  } catch {
    return `Error ${response.status}: ${response.statusText}`;
  }
};

// Columnas de la tabla (incluye nueva columna "Jefe")
const columnas = [
  { key: 'id_usuario', label: 'ID' },
  { key: 'id_usuario_LDAP', label: 'Usuario LDAP' },
  { key: 'id_AreaResponsabilidad', label: 'Área Responsabilidad' },
  { key: 'rol', label: 'Rol' },
  {
    key: 'jefe_nombre',
    label: 'Jefe',
    cellRenderer: (value) => value || '—'
  },
  {
    key: 'activo',
    label: 'Estado',
    cellRenderer: (value) => {
      if (value === true || value === 1 || value === 'true' || value === '1') {
        return '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Activo</span>';
      } else {
        return '<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Inactivo</span>';
      }
    }
  },
  {
    key: 'acciones',
    label: 'Acciones',
    cellRenderer: (value, item) => {
      return `
        <div class="flex space-x-2">
          <button class="editar-usuario-btn px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600" data-id="${item.id_usuario}">Editar</button>
          <button class="eliminar-usuario-btn px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600" data-id="${item.id_usuario}">Eliminar</button>
        </div>
      `;
    }
  }
];

// Asignar eventos a los botones dinámicos
const setupActionListeners = () => {
  nextTick(() => {
    document.querySelectorAll('.editar-usuario-btn').forEach(btn => {
      btn.removeEventListener('click', handleEditarClick);
      btn.addEventListener('click', handleEditarClick);
    });
    document.querySelectorAll('.eliminar-usuario-btn').forEach(btn => {
      btn.removeEventListener('click', handleEliminarClick);
      btn.addEventListener('click', handleEliminarClick);
    });
  });
};

const handleEditarClick = (event) => {
  event.stopPropagation();
  const id = event.currentTarget.getAttribute('data-id');
  const usuario = itemsData.value.find(u => u.id_usuario == id);
  if (usuario) {
    selectedUsuario.value = { ...usuario };
    isEditing.value = true;
    isViewing.value = false;
    showModal.value = true;
  }
};

const handleEliminarClick = (event) => {
  event.stopPropagation();
  const id = event.currentTarget.getAttribute('data-id');
  const usuario = itemsData.value.find(u => u.id_usuario == id);
  if (usuario) {
    usuarioAEliminar.value = usuario;
    showConfirmBanner.value = true;
  }
};

// Obtener usuarios desde la API (paginado + filtros)
const fetchUsuarios = async (page = 1) => {
  const token = localStorage.getItem('token');
  if (!token) return navigateTo('/');

  isLoading.value = true;
  errorBanner.value = null;

  try {
    const body = {};
    if (filtros.value.id_usuario_LDAP) body.id_usuario_LDAP = filtros.value.id_usuario_LDAP;
    if (filtros.value.id_AreaResponsabilidad) body.id_AreaResponsabilidad = filtros.value.id_AreaResponsabilidad;
    if (filtros.value.rol) body.rol = filtros.value.rol;

    const res = await fetch(`${config.public.backendHost}/usuarios/filtrar/${page}/${itemsPorPage.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(body)
    });

    if (res.status === 401) throw new Error('Sesión expirada');
    if (res.status === 403) throw new Error('Acceso denegado');
    if (!res.ok) {
      const errorMsg = await parseApiError(res);
      throw new Error(errorMsg);
    }

    const data = await res.json();
    itemsData.value = data.datos.map(item => ({
      id_usuario: item.id_usuario,
      id_usuario_LDAP: item.id_usuario_LDAP,
      id_AreaResponsabilidad: item.id_AreaResponsabilidad,
      rol: item.rol,
      activo: item.activo,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      id_usuario_jefe: item.id_usuario_jefe || null,
      jefe_nombre: item.jefe?.id_usuario_LDAP || null   // asumiendo que la API devuelve objeto jefe anidado
    }));
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

const handleSearch = () => {
  currentPage.value = 1;
  fetchUsuarios(1);
};

const limpiarFiltros = () => {
  filtros.value = { id_usuario_LDAP: '', id_AreaResponsabilidad: '', rol: '' };
  handleSearch();
};

const handlePageChange = (page) => fetchUsuarios(page);

const handleRowClick = (item) => {
  selectedUsuario.value = { ...item };
  isEditing.value = false;
  isViewing.value = true;
  showModal.value = true;
};

const abrirModalCrear = () => {
  selectedUsuario.value = {};
  isEditing.value = false;
  isViewing.value = false;
  showModal.value = true;
};

// Envío del formulario (crear/editar) - incluye id_usuario_jefe
const handleSubmitUsuario = async (payload) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  errorBanner.value = null;

  try {
    let response;
    if (isEditing.value && selectedUsuario.value.id_usuario) {
      response = await fetch(`${config.public.backendHost}/usuarios/${selectedUsuario.value.id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify(payload)
      });
    } else {
      response = await fetch(`${config.public.backendHost}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const errorMsg = await parseApiError(response);
      throw new Error(errorMsg);
    }

    errorBanner.value = {
      title: isEditing.value ? 'Usuario actualizado' : 'Usuario creado',
      description: 'Operación exitosa',
      type: 'success'
    };
    showModal.value = false;
    await fetchUsuarios(currentPage.value);
  } catch (err) {
    errorBanner.value = { title: 'Error', description: err.message, type: 'error' };
  }
};

const confirmarEliminar = async () => {
  if (!usuarioAEliminar.value) return;
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${config.public.backendHost}/usuarios/${usuarioAEliminar.value.id_usuario}`, {
      method: 'DELETE',
      headers: { Authorization: token }
    });
    if (!response.ok) {
      const errorMsg = await parseApiError(response);
      throw new Error(errorMsg);
    }
    errorBanner.value = { title: 'Éxito', description: 'Usuario eliminado correctamente', type: 'success' };
    await fetchUsuarios(currentPage.value);
  } catch (err) {
    errorBanner.value = { title: 'Error', description: err.message, type: 'error' };
  } finally {
    showConfirmBanner.value = false;
    usuarioAEliminar.value = null;
  }
};

const refrescarLista = () => {
  fetchUsuarios(currentPage.value);
};

// Exportar a Excel (incluye columna Jefe)
const exportToExcel = () => {
  const exportData = itemsData.value.map(item => ({
    'ID': item.id_usuario,
    'Usuario LDAP': item.id_usuario_LDAP,
    'Área Responsabilidad': item.id_AreaResponsabilidad,
    'Rol': item.rol,
    'Jefe': item.jefe_nombre || '',
    'Activo': item.activo ? 'Activo' : 'Inactivo'
  }));
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
  XLSX.writeFile(workbook, `usuarios_${new Date().toISOString().slice(0,19)}.xlsx`);
};

// Observar cambios en itemsData para reasignar eventos
watch(() => itemsData.value, () => {
  setupActionListeners();
}, { deep: true });

onMounted(() => {
  if (!localStorage.getItem('token')) navigateTo('/');
  fetchUsuarios();
});
</script>

<style scoped></style>