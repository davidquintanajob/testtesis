<template>
  <div class="min-h-screen bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white">
    <SeoMeta title="Mi Área - AFTUP"
      description="Gestión de Activos Fijos Tangibles y Útiles. Lista y consulta de activos fijos."
      canonical="/miarea" />
    <Navbar />

    <!-- Banner de error global -->
    <div v-if="errorBanner"
      class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none">
      <MessageBanner :title="errorBanner.title" :description="errorBanner.description" :type="errorBanner.type"
        @close="errorBanner = null" class="pointer-events-auto" />
    </div>

    <!-- Selector de tipo (AFT / Útiles) con diseño moderno -->
    <div class="w-[95%] mx-auto px-4 pt-6 md:pt-6 mt-20 md:mt-0">
      <div class="bg-white rounded-lg shadow-md p-4">
        <div class="flex items-center justify-start gap-8">
          <!-- Opción AFT -->
          <label class="relative inline-flex cursor-pointer items-center gap-3">
            <input type="radio" value="aft" v-model="tipoSeleccionado" class="peer sr-only" />
            <div
              class="w-14 h-7 rounded-full bg-gray-200 peer-checked:bg-[#099ebf] transition-colors duration-300 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-7">
            </div>
            <span class="text-gray-700 font-medium select-none">Activos Fijos Tangibles (AFT)</span>
          </label>

          <!-- Opción Útiles -->
          <label class="relative inline-flex cursor-pointer items-center gap-3">
            <input type="radio" value="utiles" v-model="tipoSeleccionado" class="peer sr-only" />
            <div
              class="w-14 h-7 rounded-full bg-gray-200 peer-checked:bg-[#099ebf] transition-colors duration-300 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-7">
            </div>
            <span class="text-gray-700 font-medium select-none">Útiles</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Filtros según el tipo -->
    <div class="w-[95%] mx-auto px-4 py-4">
      <div class="bg-white rounded-lg shadow-md p-4">
        <!-- Filtros para AFT -->
        <div v-if="tipoSeleccionado === 'aft'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Id Activo Fijo</label>
              <input type="text" v-model="filtrosAFT.Id_ActivoFijo" placeholder="Ingrese el ID del activo..."
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
                @keyup.enter="handleSearch" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción del Activo Fijo</label>
              <input type="text" v-model="filtrosAFT.Desc_ActivoFijo" placeholder="Ingrese la descripción..."
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
                @keyup.enter="handleSearch" />
            </div>
          </div>
        </div>

        <!-- Filtros para Útiles -->
        <div v-else>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Id Útil</label>
              <input type="text" v-model="filtrosUtiles.Id_UH" placeholder="Ingrese ID del útil..."
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
                @keyup.enter="handleSearch" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción del Útil</label>
              <input type="text" v-model="filtrosUtiles.Desc_UH" placeholder="Ingrese descripción..."
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
                @keyup.enter="handleSearch" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Id Centro de Costo</label>
              <input type="text" v-model="filtrosUtiles.Id_Ccosto" placeholder="Ej: 1045"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
                @keyup.enter="handleSearch" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción Centro de Costo</label>
              <input type="text" v-model="filtrosUtiles.Desc_Ccosto" placeholder="..."
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
                @keyup.enter="handleSearch" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción Área Responsabilidad</label>
              <input type="text" v-model="filtrosUtiles.Desc_AreaResponsabilidad" placeholder="..."
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
                @keyup.enter="handleSearch" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción Empleado</label>
              <input type="text" v-model="filtrosUtiles.Desc_Empleado" placeholder="..."
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
                @keyup.enter="handleSearch" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad desde</label>
              <input type="number" v-model="filtrosUtiles.Cantidad_desde" placeholder="0"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
                @keyup.enter="handleSearch" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad hasta</label>
              <input type="number" v-model="filtrosUtiles.Cantidad_hasta" placeholder="0"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"
                @keyup.enter="handleSearch" />
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">* Los útiles se mostrarán con la cantidad correspondiente al área seleccionada.</p>
        </div>

        <!-- Selector de área especial para rol "Especialista" -->
        <div v-if="esEspecialista" class="mt-4 pt-4 border-t border-gray-200">
          <label class="block text-sm font-medium text-gray-700 mb-1">Área de responsabilidad (consultar otra área)</label>
          <SelectSearchAPI
            v-model="areaSeleccionadaId"
            :multiple="false"
            endpoint="/areas/filtrar/1/5"
            method="POST"
            search-key="Desc_AreaResponsabilidad"
            label-key="Desc_AreaResponsabilidad"
            value-key="Id_AreaResponsabilidad"
            :label-format="'{{Desc_AreaResponsabilidad}} - {{Id_AreaResponsabilidad}}'"
            placeholder="Buscar área destino..."
            :direct-data="false"
            :data-key="'datos'"
            :initial-label="areaDestinoInitialLabel"
            @entidad-seleccionada="handleAreaSeleccionada"
          />
          <p class="text-xs text-gray-500 mt-1">* Selecciona un área específica para ver sus activos/útiles. Si dejas vacío se usará tu área por defecto.</p>
        </div>

        <div class="flex justify-end mt-4 gap-2 flex-wrap">
          <button @click="handleSearch"
            class="px-6 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] focus:ring-offset-2 transition-colors">
            Buscar
          </button>
          <button @click="limpiarFiltros"
            class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
            Limpiar
          </button>
          <button @click="generarReportePDF" :disabled="isLoading || totalItems === 0"
            class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generar Reporte de Activos PDF
          </button>
          <button @click="generarQrPorElementos" :disabled="isLoading || totalItems === 0"
            class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Generar QR por cada elemento
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla dinámica -->
    <div class="w-[95%] mx-auto px-4 py-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-[#077a99]">
          {{ tipoSeleccionado === 'aft' ? 'Activos Fijos' : 'Útiles' }}
        </h2>
      </div>
      <DataTable :columns="columnasTabla" :items="itemsData" :total-items="totalItems" :items-per-page="itemsPorPage"
        :current-page="currentPage" :is-loading="isLoading" @page-change="handlePageChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import Navbar from "@/components/Navbar.vue";
import SeoMeta from '@/components/SeoMeta.vue';
import DataTable from "@/components/DataTable.vue";
import MessageBanner from '@/components/MessageBanner.vue';
import SelectSearchAPI from '@/components/SelectSearchAPI.vue';
import { navigateTo } from 'nuxt/app';
import QRCode from 'qrcode';

// Tipo de consulta: 'aft' o 'utiles'
const tipoSeleccionado = ref('aft');

// Datos del usuario logueado (se obtiene al montar)
const usuarioData = ref(null);
const idAreaResponsabilidadUsuario = ref('');   // área original del usuario
const rolUsuario = ref('');                     // rol del usuario
const esEspecialista = ref(false);              // flag si es Especialista

// Área que se usará realmente en las consultas (puede ser la del usuario o la seleccionada por especialista)
const areaActiva = ref('');

// Para el componente SelectSearchAPI
const areaSeleccionadaId = ref(null);
const areaDestinoInitialLabel = ref('');

// Filtros específicos para AFT
const filtrosAFT = ref({
  Id_ActivoFijo: '',
  Desc_ActivoFijo: ''
});

// Filtros específicos para Útiles
const filtrosUtiles = ref({
  Id_UH: '',
  Desc_UH: '',
  Id_Ccosto: '',
  Id_AreaResponsabilidad: '',   // se llenará con el área activa automáticamente
  Desc_Ccosto: '',
  Desc_AreaResponsabilidad: '',
  Desc_Empleado: '',
  Cantidad_desde: null,
  Cantidad_hasta: null
});

// Paginación y datos comunes
const currentPage = ref(1);
const itemsPorPage = ref(20);
const totalItems = ref(0);
const isLoading = ref(false);
const itemsData = ref([]);
const errorBanner = ref(null);

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

// Función para formatear números a 2 decimales
const formatearNumero = (valor) => {
  if (valor === null || valor === undefined) return '0.00';
  const num = parseFloat(valor);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
};

// Columnas para AFT
const columnasAFT = [
  { key: 'Id_ActivoFijo', label: 'ID Activo Fijo' },
  { key: 'Desc_ActivoFijo', label: 'Descripción' },
  { key: 'Valor_Inicial', label: 'Valor Inicial' },
  { key: 'Valor_Residual', label: 'Valor Residual' },
  { key: 'Depreciacion_Acumulada', label: 'Depreciación Acumulada' }
];

// Columnas para Útiles
const columnasUtiles = [
  { key: 'Id_UH', label: 'ID Útil' },
  { key: 'Desc_UH', label: 'Descripción' },
  { key: 'Cantidad', label: 'Cantidad (área seleccionada)' },
  { key: 'Valor_Inicial', label: 'Valor Inicial' }
];

// Computed para las columnas según el tipo
const columnasTabla = computed(() => {
  return tipoSeleccionado.value === 'aft' ? columnasAFT : columnasUtiles;
});

// Obtener datos del usuario desde localStorage y validar token
const cargarUsuario = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigateTo('/');
    return false;
  }
  const usuarioStr = localStorage.getItem('usuario');
  if (!usuarioStr) {
    navigateTo('/');
    return false;
  }
  try {
    const usuario = JSON.parse(usuarioStr);
    usuarioData.value = usuario;
    idAreaResponsabilidadUsuario.value = usuario.id_AreaResponsabilidad ? usuario.id_AreaResponsabilidad.trim() : '';
    rolUsuario.value = usuario.rol || '';
    esEspecialista.value = (rolUsuario.value === 'Especialista');

    if (!idAreaResponsabilidadUsuario.value) {
      errorBanner.value = {
        title: 'Datos incompletos',
        description: 'El usuario no tiene un área de responsabilidad asignada.',
        type: 'error'
      };
      return false;
    }

    // Inicializar área activa con la del usuario
    areaActiva.value = idAreaResponsabilidadUsuario.value;
    // Si es especialista, permitir selección de otra área
    if (esEspecialista.value) {
      areaDestinoInitialLabel.value = ''; // se puede cargar después si se desea
    }
    return true;
  } catch (e) {
    navigateTo('/');
    return false;
  }
};

// Manejar selección de área en el componente especialista
const handleAreaSeleccionada = (area) => {
  if (area && area.Id_AreaResponsabilidad) {
    const nuevaArea = area.Id_AreaResponsabilidad.trim();
    areaActiva.value = nuevaArea;
    // Limpiar filtros y recargar automáticamente
    if (tipoSeleccionado.value === 'utiles') {
      // Actualizar el filtro interno de útiles
      filtrosUtiles.value.Id_AreaResponsabilidad = nuevaArea;
    }
    handleSearch();
  } else {
    // Si se limpia la selección, volver al área original del usuario
    areaActiva.value = idAreaResponsabilidadUsuario.value;
    if (tipoSeleccionado.value === 'utiles') {
      filtrosUtiles.value.Id_AreaResponsabilidad = areaActiva.value;
    }
    handleSearch();
  }
};

// Construir el body para AFT (incluye siempre ID_AreaResp)
const construirBodyAFT = () => {
  const body = {};
  if (filtrosAFT.value.Id_ActivoFijo && filtrosAFT.value.Id_ActivoFijo.trim() !== '') {
    body.Id_ActivoFijo = filtrosAFT.value.Id_ActivoFijo.trim();
  }
  if (filtrosAFT.value.Desc_ActivoFijo && filtrosAFT.value.Desc_ActivoFijo.trim() !== '') {
    body.Desc_ActivoFijo = filtrosAFT.value.Desc_ActivoFijo.trim();
  }
  // Usar el área activa (puede ser la del usuario o la seleccionada por especialista)
  body.ID_AreaResp = areaActiva.value;
  return body;
};

// Construir el body para Útiles (incluye siempre Id_AreaResponsabilidad)
const construirBodyUtiles = () => {
  const body = {};
  if (filtrosUtiles.value.Id_UH && filtrosUtiles.value.Id_UH.trim() !== '') {
    body.Id_UH = filtrosUtiles.value.Id_UH.trim();
  }
  if (filtrosUtiles.value.Desc_UH && filtrosUtiles.value.Desc_UH.trim() !== '') {
    body.Desc_UH = filtrosUtiles.value.Desc_UH.trim();
  }
  if (filtrosUtiles.value.Id_Ccosto && filtrosUtiles.value.Id_Ccosto.trim() !== '') {
    body.Id_Ccosto = filtrosUtiles.value.Id_Ccosto.trim();
  }
  if (filtrosUtiles.value.Desc_Ccosto && filtrosUtiles.value.Desc_Ccosto.trim() !== '') {
    body.Desc_Ccosto = filtrosUtiles.value.Desc_Ccosto.trim();
  }
  if (filtrosUtiles.value.Desc_AreaResponsabilidad && filtrosUtiles.value.Desc_AreaResponsabilidad.trim() !== '') {
    body.Desc_AreaResponsabilidad = filtrosUtiles.value.Desc_AreaResponsabilidad.trim();
  }
  if (filtrosUtiles.value.Desc_Empleado && filtrosUtiles.value.Desc_Empleado.trim() !== '') {
    body.Desc_Empleado = filtrosUtiles.value.Desc_Empleado.trim();
  }
  if (filtrosUtiles.value.Cantidad_desde !== null && filtrosUtiles.value.Cantidad_desde !== '') {
    body.Cantidad_desde = Number(filtrosUtiles.value.Cantidad_desde);
  }
  if (filtrosUtiles.value.Cantidad_hasta !== null && filtrosUtiles.value.Cantidad_hasta !== '') {
    body.Cantidad_hasta = Number(filtrosUtiles.value.Cantidad_hasta);
  }
  // Usar el área activa para la consulta
  body.Id_AreaResponsabilidad = areaActiva.value;
  return body;
};

// Transformar datos de útiles: extraer cantidad y valor inicial del área activa
const transformarUtiles = (datosRaw) => {
  if (!datosRaw || !Array.isArray(datosRaw)) return [];
  const areaActivaTrimmed = areaActiva.value ? areaActiva.value.trim() : '';
  return datosRaw.map(item => {
    let cantidad = 0;
    let valorInicial = 0;
    if (item.detalles && Array.isArray(item.detalles)) {
      const detalleEncontrado = item.detalles.find(detalle => {
        if (!detalle.Id_AreaResponsabilidad) return false;
        const areaDetalle = detalle.Id_AreaResponsabilidad.trim();
        return areaDetalle === areaActivaTrimmed;
      });
      if (detalleEncontrado) {
        cantidad = typeof detalleEncontrado.Cantidad !== 'undefined' ? detalleEncontrado.Cantidad : 0;
        valorInicial = typeof detalleEncontrado.Valor_Inicial !== 'undefined' ? detalleEncontrado.Valor_Inicial : 0;
      }
    }
    return {
      Id_UH: item.Id_UH ? item.Id_UH.trim() : '',
      Desc_UH: item.Desc_UH ? item.Desc_UH.trim() : '',
      Cantidad: cantidad,
      Valor_Inicial: formatearNumero(valorInicial)
    };
  });
};

// Transformar datos de AFT (los AFT ya tienen los campos planos, no dependen del área)
const transformarAFT = (datosRaw) => {
  if (!datosRaw || !Array.isArray(datosRaw)) return [];
  return datosRaw.map(item => ({
    Id_ActivoFijo: item.Id_ActivoFijo ? item.Id_ActivoFijo.trim() : '',
    Desc_ActivoFijo: item.Desc_ActivoFijo ? item.Desc_ActivoFijo.trim() : '',
    Valor_Inicial: formatearNumero(item.Valor_Inicial),
    Valor_Residual: formatearNumero(item.Valor_Residual),
    Depreciacion_Acumulada: formatearNumero(item.Depreciacion_Acumulada)
  }));
};

// Función principal para cargar datos según el tipo seleccionado
const fetchData = async (page = 1) => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigateTo('/');
    return;
  }

  isLoading.value = true;
  errorBanner.value = null;

  try {
    let url = '';
    let body = {};
    let response;

    if (tipoSeleccionado.value === 'aft') {
      url = `${config.public.backendHost}/aft/filtrar/${page}/${itemsPorPage.value}`;
      body = construirBodyAFT();
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(body)
      });
    } else {
      url = `${config.public.backendHost}/utiles/filtrar/${page}/${itemsPorPage.value}`;
      body = construirBodyUtiles();
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(body)
      });
    }

    if (response.status === 401) {
      errorBanner.value = {
        title: 'Sesión Expirada',
        description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        type: 'warning'
      };
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      setTimeout(() => navigateTo('/'), 3000);
      return;
    }
    if (response.status === 403) {
      errorBanner.value = {
        title: 'Acceso Denegado',
        description: 'No tienes permisos para realizar esta acción.',
        type: 'error'
      };
      return;
    }
    if (!response.ok) {
      const errorMessage = await obtenerMensajeErrorApi(response);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    totalItems.value = data.total || 0;
    currentPage.value = data.pagina || page;

    if (tipoSeleccionado.value === 'aft') {
      itemsData.value = transformarAFT(data.datos || []);
    } else {
      itemsData.value = transformarUtiles(data.datos || []);
    }
  } catch (error) {
    console.error('Error al cargar datos:', error);
    errorBanner.value = {
      title: 'Error de conexión',
      description: 'No se pudieron cargar los datos. Intente más tarde.',
      type: 'error'
    };
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchData(1);
};

const limpiarFiltros = () => {
  if (tipoSeleccionado.value === 'aft') {
    filtrosAFT.value.Id_ActivoFijo = '';
    filtrosAFT.value.Desc_ActivoFijo = '';
  } else {
    filtrosUtiles.value.Id_UH = '';
    filtrosUtiles.value.Desc_UH = '';
    filtrosUtiles.value.Id_Ccosto = '';
    filtrosUtiles.value.Desc_Ccosto = '';
    filtrosUtiles.value.Desc_AreaResponsabilidad = '';
    filtrosUtiles.value.Desc_Empleado = '';
    filtrosUtiles.value.Cantidad_desde = null;
    filtrosUtiles.value.Cantidad_hasta = null;
  }
  // Si es especialista, también podemos resetear el área seleccionada a la suya por defecto
  if (esEspecialista.value) {
    areaActiva.value = idAreaResponsabilidadUsuario.value;
    areaSeleccionadaId.value = null;
    areaDestinoInitialLabel.value = '';
  }
  handleSearch();
};

const handlePageChange = (page) => {
  fetchData(page);
};

watch(tipoSeleccionado, () => {
  currentPage.value = 1;
  fetchData(1);
});

// Generar PDF (igual que antes, pero usando área activa en el título)
const generarReportePDF = async () => {
  if (totalItems.value === 0) {
    errorBanner.value = {
      title: 'Sin datos',
      description: 'No hay registros para generar el reporte.',
      type: 'warning'
    };
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    navigateTo('/');
    return;
  }

  isLoading.value = true;
  errorBanner.value = null;

  try {
    let url = '';
    let body = {};
    let transformarDatos = null;

    if (tipoSeleccionado.value === 'aft') {
      url = `${config.public.backendHost}/aft/filtrar/1/${totalItems.value}`;
      body = construirBodyAFT();
      transformarDatos = (data) => transformarAFT(data.datos || []);
    } else {
      url = `${config.public.backendHost}/utiles/filtrar/1/${totalItems.value}`;
      body = construirBodyUtiles();
      transformarDatos = (data) => transformarUtiles(data.datos || []);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    let registros = transformarDatos(data);

    if (!registros.length) {
      errorBanner.value = {
        title: 'Sin datos',
        description: 'No se encontraron registros con los filtros actuales.',
        type: 'warning'
      };
      return;
    }

    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF('landscape');
    const fecha = new Date().toLocaleString();

    const titulo = tipoSeleccionado.value === 'aft'
      ? 'Reporte de Activos Fijos Tangibles (AFT)'
      : 'Reporte de Útiles por Área de Responsabilidad';

    doc.setFontSize(16);
    doc.text(titulo, 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${fecha}`, 14, 25);
    doc.text(`Total de registros: ${registros.length}`, 14, 32);
    doc.text(`Área de responsabilidad consultada: ${areaActiva.value}`, 14, 39);

    let columnas = [];
    let filas = [];

    if (tipoSeleccionado.value === 'aft') {
      columnas = ['ID Activo Fijo', 'Descripción', 'Valor Inicial (€)', 'Valor Residual (€)', 'Depreciación Acumulada (€)'];
      filas = registros.map(item => [
        item.Id_ActivoFijo,
        item.Desc_ActivoFijo,
        item.Valor_Inicial,
        item.Valor_Residual,
        item.Depreciacion_Acumulada
      ]);
    } else {
      columnas = ['ID Útil', 'Descripción', 'Cantidad (área seleccionada)', 'Valor Inicial (€)'];
      filas = registros.map(item => [
        item.Id_UH,
        item.Desc_UH,
        item.Cantidad,
        item.Valor_Inicial
      ]);
    }

    autoTable(doc, {
      startY: 45,
      head: [columnas],
      body: filas,
      theme: 'striped',
      headStyles: { fillColor: [9, 158, 191], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 250, 252] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' }
      }
    });

    const nombreArchivo = tipoSeleccionado.value === 'aft'
      ? `reporte_aft_${new Date().toISOString().slice(0, 19)}.pdf`
      : `reporte_utiles_${new Date().toISOString().slice(0, 19)}.pdf`;
    doc.save(nombreArchivo);

    errorBanner.value = {
      title: 'PDF Generado',
      description: `Se exportaron ${registros.length} registros correctamente.`,
      type: 'success'
    };
  } catch (error) {
    console.error('Error generando PDF:', error);
    errorBanner.value = {
      title: 'Error al generar PDF',
      description: error.message || 'Ocurrió un error inesperado.',
      type: 'error'
    };
  } finally {
    isLoading.value = false;
  }
};

// Generar QR (usando área activa para los títulos, pero la información es la misma)
const generarQrPorElementos = async () => {
  if (totalItems.value === 0) {
    errorBanner.value = {
      title: 'Sin datos',
      description: 'No hay registros para generar los códigos QR.',
      type: 'warning'
    };
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    navigateTo('/');
    return;
  }

  isLoading.value = true;
  errorBanner.value = null;

  try {
    let url = '';
    let body = {};
    let transformarDatos = null;

    if (tipoSeleccionado.value === 'aft') {
      url = `${config.public.backendHost}/aft/filtrar/1/${totalItems.value}`;
      body = construirBodyAFT();
      transformarDatos = (data) => transformarAFT(data.datos || []);
    } else {
      url = `${config.public.backendHost}/utiles/filtrar/1/${totalItems.value}`;
      body = construirBodyUtiles();
      transformarDatos = (data) => transformarUtiles(data.datos || []);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

    const data = await response.json();
    let elementos = transformarDatos(data);

    if (!elementos.length) {
      errorBanner.value = { title: 'Sin datos', description: 'No hay elementos para generar los QR.', type: 'warning' };
      return;
    }

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const columnas = 4;
    const margenX = 10;
    const margenY = 15;
    const anchoCelda = (doc.internal.pageSize.getWidth() - (margenX * 2)) / columnas;
    const altoQR = 30;
    const altoTexto = 15;
    const altoCelda = altoQR + altoTexto + 4;
    const margenInterno = 2;

    const tipoTexto = tipoSeleccionado.value === 'aft' ? 'AFT' : 'Útil';
    const fechaStr = new Date().toLocaleString();

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Códigos QR - ${tipoSeleccionado.value === 'aft' ? 'Activos Fijos' : 'Útiles'}`, margenX, 10);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Área de responsabilidad consultada: ${areaActiva.value}`, margenX, 18);
    doc.text(`Generado: ${fechaStr}`, margenX, 24);

    let elementoIdx = 0;
    const totalElementos = elementos.length;

    while (elementoIdx < totalElementos) {
      let fila = 0;
      let yInicial = margenY;

      while (fila * altoCelda + yInicial + altoCelda <= doc.internal.pageSize.getHeight() - margenY && elementoIdx < totalElementos) {
        for (let col = 0; col < columnas && elementoIdx < totalElementos; col++) {
          const elemento = elementos[elementoIdx];
          const id = tipoSeleccionado.value === 'aft' ? elemento.Id_ActivoFijo?.trim() : elemento.Id_UH?.trim();
          const nombre = tipoSeleccionado.value === 'aft' ? elemento.Desc_ActivoFijo?.trim() : elemento.Desc_UH?.trim();
          const cantidad = tipoSeleccionado.value === 'aft' ? null : elemento.Cantidad;

          const qrDataURL = await QRCode.toDataURL(id, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 120
          });

          const x = margenX + col * anchoCelda;
          const y = yInicial + fila * altoCelda;

          doc.setDrawColor(0);
          doc.setLineWidth(0.5);
          doc.rect(x, y, anchoCelda, altoCelda);

          const qrSize = altoQR;
          const xQR = x + (anchoCelda - qrSize) / 2;
          const yQR = y + margenInterno;
          doc.addImage(qrDataURL, 'PNG', xQR, yQR, qrSize, qrSize);

          const yTexto = yQR + qrSize + 2;
          doc.setFontSize(8);
          doc.setFont(undefined, 'bold');
          doc.text(`ID: ${id}`, x + margenInterno, yTexto);
          doc.setFont(undefined, 'normal');
          let nombreCorto = nombre || 'Sin descripción';
          if (nombreCorto.length > 35) nombreCorto = nombreCorto.substring(0, 32) + '...';
          doc.text(nombreCorto, x + margenInterno, yTexto + 4);
          doc.text(`Tipo: ${tipoTexto}`, x + margenInterno, yTexto + 8);
          if (cantidad !== null) {
            doc.text(`Cantidad: ${cantidad}`, x + margenInterno, yTexto + 12);
          }

          elementoIdx++;
        }
        fila++;
      }
      if (elementoIdx < totalElementos) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`Códigos QR - ${tipoSeleccionado.value === 'aft' ? 'Activos Fijos' : 'Útiles'}`, margenX, 10);
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(`Área de responsabilidad consultada: ${areaActiva.value}`, margenX, 18);
        doc.text(`Generado: ${fechaStr}`, margenX, 24);
      }
    }

    const nombreArchivo = tipoSeleccionado.value === 'aft'
      ? `qr_aft_${new Date().toISOString().slice(0, 19)}.pdf`
      : `qr_utiles_${new Date().toISOString().slice(0, 19)}.pdf`;
    doc.save(nombreArchivo);

    errorBanner.value = {
      title: 'PDF con QR generado',
      description: `Se generaron ${totalElementos} códigos QR organizados en cuadrícula.`,
      type: 'success'
    };
  } catch (error) {
    console.error('Error generando QR PDF:', error);
    errorBanner.value = {
      title: 'Error al generar PDF con QR',
      description: error.message || 'Ocurrió un error inesperado.',
      type: 'error'
    };
  } finally {
    isLoading.value = false;
  }
};

// Inicializar
onMounted(() => {
  if (!cargarUsuario()) return;
  // Sincronizar el área activa con los filtros de útiles
  filtrosUtiles.value.Id_AreaResponsabilidad = areaActiva.value;
  fetchData();
});
</script>

<style scoped>
/* No se requieren estilos adicionales */
</style>