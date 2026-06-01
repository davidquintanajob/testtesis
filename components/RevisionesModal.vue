<template>
  <Modal :show="modelValue" @close="onRequestClose" size="3xl">
    <template #title>
      <h3 class="text-lg font-semibold text-gray-900">
        {{ isViewing ? 'Detalles de la Revisión' : (isEditing ? 'Editar Revisión' : 'Nueva Revisión') }}
      </h3>
    </template>

    <template #content>
      <div ref="contentWrapper" :class="['transition-opacity', dataLoading && 'pointer-events-none opacity-50']">
        <!-- Overlay de carga general -->
        <div v-if="dataLoading" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div class="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            <p class="text-gray-700 font-medium">{{ loadingMessage }}</p>
          </div>
        </div>

        <!-- Overlay de escáner -->
        <div v-if="showScanner" class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80">
          <div class="bg-white rounded-lg p-4 w-full max-w-md">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-lg font-semibold">Escáner QR / código de barras</h3>
              <button @click="closeScanner" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div id="qr-reader" class="w-full"></div>
            <p class="text-sm text-gray-500 mt-3">Apunte la cámara al código QR o barras</p>
          </div>
        </div>

        <!-- Mensajes internos -->
        <div v-if="message" class="mb-4">
          <MessageBanner :title="message.title" :description="message.description" :type="message.type"
            @close="message = null" />
        </div>

        <!-- Modo Vista (con filtros y resumen añadidos) -->
        <div v-if="isViewing && !isEditing" class="space-y-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-md font-medium text-gray-900 mb-3">Información General</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label class="block text-sm font-medium text-gray-700">ID Solicitud</label>
                <p class="mt-1 text-sm">{{ revisionData.id_solicitud || 'N/A' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Nota</label>
                <p class="mt-1 text-sm">{{ revisionData.solicitud?.nota || 'Sin nota' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Tipo Traslado</label>
                <p class="mt-1 text-sm">{{ revisionData.solicitud?.tipo_traslado || 'N/A' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Estado</label>
                <p class="mt-1 text-sm">{{ revisionData.solicitud?.estado || 'N/A' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Área Responsabilidad</label>
                <p class="mt-1 text-sm">{{ areaDesc || revisionData.id_AreaResponsabilidad || 'N/A' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Usuario Creador</label>
                <p class="mt-1 text-sm">{{ usuarioCreadorNombre || 'N/A' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Fecha Creación</label>
                <p class="mt-1 text-sm">{{ revisionData.createdAt ? new Date(revisionData.createdAt).toLocaleString() : 'N/A' }}</p>
              </div>
            </div>
          </div>
          <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="text-md font-medium text-gray-900 mb-3">Usuarios Involucrados</h4>
            <div v-if="usuariosMostrar.length" class="flex flex-wrap gap-2">
              <span v-for="u in usuariosMostrar" :key="u.id_usuario"
                class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{{ u.id_usuario_LDAP || u.nombre_usuario || u.id_usuario }}</span>
            </div>
            <p v-else class="text-sm text-gray-500">No hay usuarios asociados</p>
          </div>

          <!-- Lista de elementos con checkboxes, escáner, filtros y resumen -->
          <div class="bg-green-50 rounded-lg p-4">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h4 class="text-md font-medium text-gray-900">Elementos a Revisar</h4>
              <div class="flex flex-wrap gap-2">
                <button @click="openScanner"
                  class="px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Escanear QR / Código
                </button>
                <button @click="guardarCambiosRevision"
                  :disabled="guardandoRevision"
                  class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50">
                  {{ guardandoRevision ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </div>
            </div>

            <!-- Filtros y resumen -->
            <div v-if="elementosVistaConCheckbox.length" class="mb-3 flex flex-wrap items-end gap-3 justify-between">
              <div class="flex flex-wrap gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Filtrar por código</label>
                  <input type="text" v-model="filterCodeView" placeholder="Ej: AFT-001, UTIL-123"
                    class="w-48 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#099ebf]" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Filtrar por nombre</label>
                  <input type="text" v-model="filterNameView" placeholder="Ej: Laptop, Silla"
                    class="w-48 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#099ebf]" />
                </div>
                <button v-if="filterCodeView || filterNameView" @click="clearFiltersView" class="text-xs text-[#099ebf] hover:underline self-end mb-1">
                  Limpiar
                </button>
              </div>
              <div class="text-sm bg-gray-100 px-3 py-1.5 rounded-lg">
                <span class="font-medium">Resumen:</span> 
                Total: {{ elementosVistaConCheckbox.length }} | 
                Revisados: {{ reviewedCountView }}
              </div>
            </div>

            <!-- Lista de elementos filtrada -->
            <div v-if="filteredElementosVista.length" class="space-y-2 max-h-64 overflow-y-auto border rounded p-2 bg-white">
              <div v-for="item in filteredElementosVista" :key="item.id" class="flex items-center gap-2">
                <input type="checkbox" v-model="item.isRevisado" @change="onCheckboxChange(item, getOriginalIndexVista(item))"
                  class="rounded border-gray-300 text-[#099ebf] focus:ring-[#099ebf]">
                <span :class="['text-sm', item.isRevisado ? 'line-through text-gray-500' : '']">
                  {{ item.descripcion }} ({{ item.id }})
                </span>
              </div>
            </div>
            <div v-else-if="elementosVistaConCheckbox.length && filteredElementosVista.length === 0" class="text-sm text-gray-500 italic p-2">
              No hay elementos que coincidan con los filtros.
            </div>
            <div v-else class="text-sm text-gray-500 italic">No hay elementos asociados</div>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-end gap-2">
            <button @click="enableEditMode"
              class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99]">Editar Revisión</button>
          </div>
        </div>

        <!-- Modo Edición / Creación -->
        <div v-else class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nota</label>
              <textarea v-model="form.nota" rows="3"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Motivo de la revisión..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo Traslado</label>
              <select v-model="form.tipo_traslado"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="aft">Activo Fijo Tangible (AFT)</option>
                <option value="util">Útil</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select v-model="form.estado" :disabled="isEstadoDisabled"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                :class="{ 'bg-gray-100 cursor-not-allowed': isEstadoDisabled }">
                <option v-for="opt in estadoOptionsDisponibles" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <p v-if="isEstadoDisabled && rolUsuario === 'Responsable de Área'" class="text-xs text-gray-500 mt-1">El estado solo puede ser Pendiente para tu rol.</p>
              <p v-if="isEstadoDisabled && rolUsuario === 'Jefe de Área' && isEditing" class="text-xs text-gray-500 mt-1">No puedes cambiar el estado de una solicitud ya creada.</p>
            </div>

            <!-- Sección Usuarios (automática, sin selector) -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Usuarios Involucrados</label>
              <div v-if="form.usuarios_list.length" class="border rounded-lg divide-y max-h-48 overflow-y-auto">
                <div v-for="(item, idx) in form.usuarios_list" :key="item.id"
                  class="flex justify-between items-center p-2 hover:bg-gray-50">
                  <span>{{ item.label }}</span>
                </div>
              </div>
              <p v-else class="text-sm text-gray-500 italic mt-1">Cargando usuarios...</p>
            </div>

            <!-- Elementos a revisar en modo edición -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ esUsuarioConRolEspecial ? 'Tus elementos (según tu área de responsabilidad)' : 'Responsable del área cuyos elementos se incluirán automáticamente' }}
              </label>
              <div v-if="!esUsuarioConRolEspecial" class="flex gap-2 mb-3">
                <SelectSearchAPI 
                  ref="selectResponsableRef"
                  v-model="responsableSeleccionado"
                  :multiple="false"
                  endpoint="/usuarios/filtrar/1/5"
                  method="POST"
                  search-key="id_usuario_LDAP"
                  label-key="id_usuario_LDAP"
                  value-key="id_usuario"
                  :label-format="'{{id_usuario_LDAP}} (ID: {{id_usuario}}) - Área: {{id_AreaResponsabilidad}}'"
                  placeholder="Buscar usuario responsable..."
                  :direct-data="false"
                  :data-key="'datos'"
                  @entidad-seleccionada="onResponsableSeleccionado"
                />
                <button type="button" @click="limpiarResponsable" class="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                  Limpiar
                </button>
              </div>
              <div v-else class="mb-3 p-2 bg-blue-50 rounded text-sm">
                Eres {{ rolUsuarioActual }}. Se cargarán automáticamente todos los {{ tipoElementoLabel }} de tu área ({{ areaUsuarioActual }}).
              </div>
              <div v-if="cargandoElementos" class="text-sm text-gray-500 italic mt-1">Cargando elementos...</div>
              <label class="block text-sm font-medium text-gray-700 mt-4 mb-1">
                Elementos incluidos en esta revisión ({{ form.lista_activos.length }})
              </label>
              <div v-if="form.lista_activos.length" class="border rounded-lg divide-y max-h-64 overflow-y-auto">
                <div v-for="(item, idx) in form.lista_activos" :key="item.id"
                  class="flex justify-between items-center p-2 hover:bg-gray-50">
                  <div class="flex items-center gap-2 flex-1">
                    <input type="checkbox" v-model="item.isRevisado" class="rounded border-gray-300 text-[#099ebf] focus:ring-[#099ebf]">
                    <span>{{ item.label }}</span>
                  </div>
                  <button type="button" @click="eliminarElemento(idx)" class="text-red-500 hover:text-red-700 ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <p v-else class="text-sm text-gray-500 italic mt-1">No hay elementos agregados.</p>
              <p class="text-xs text-gray-400 mt-1">* Los elementos se cargan automáticamente al seleccionar un responsable.</p>
            </div>
          </div>
          <div v-if="errorList.length" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
            <div v-for="(e, idx) in errorList" :key="idx">{{ e }}</div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
    <div class="flex justify-end gap-2">
      <button v-if="!isViewing || isEditing" @click="onSubmit" :disabled="dataLoading || isSubmitting"
        class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] disabled:opacity-50">
        {{ isEditing ? 'Guardar' : 'Crear' }}
      </button>
      <button @click="onRequestClose" :disabled="dataLoading || isSubmitting"
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Cerrar</button>
    </div>
  </template>
  </Modal>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
import Modal from '@/components/Modal.vue';
import SelectSearchAPI from '@/components/SelectSearchAPI.vue';
import SelectSearch from '@/components/SelectSearch.vue';
import MessageBanner from '@/components/MessageBanner.vue';

const props = defineProps({
  modelValue: Boolean,
  revision: { type: Object, default: () => ({}) },
  isEditing: { type: Boolean, default: false },
  isViewing: { type: Boolean, default: false },
  isProcessing: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue', 'submit', 'success']);

const config = useRuntimeConfig();
const dataLoading = ref(false);
const message = ref(null);
const errorList = ref([]);
const contentWrapper = ref(null);
const selectResponsableRef = ref(null);
const responsableSeleccionado = ref(null);
const cargandoElementos = ref(false);
const loadingMessage = ref('Cargando datos...');

const isSubmitting = ref(false);

// Variables para filtros y escáner
const filterCodeView = ref('');
const filterNameView = ref('');
const showScanner = ref(false);
let html5QrCode = null;
const guardandoRevision = ref(false);

// Datos del usuario logueado
const usuarioLogueado = ref(null);
const idUsuarioJefe = ref(null);
const rolUsuario = ref('');
const rolesEspeciales = ['Responsable de Área', 'Jefe de Área'];

const esUsuarioConRolEspecial = computed(() => {
  if (!usuarioLogueado.value) return false;
  const rol = usuarioLogueado.value.rol;
  return rolesEspeciales.includes(rol);
});

const rolUsuarioActual = computed(() => usuarioLogueado.value?.rol || '');
const areaUsuarioActual = computed(() => usuarioLogueado.value?.id_AreaResponsabilidad?.trim() || 'Sin área asignada');

// Variables para la vista
const revisionData = ref({});
const areaDesc = ref('');
const usuarioCreadorNombre = ref('');
const elementosMostrar = ref([]);
const usuariosMostrar = ref([]);
const elementosVistaConCheckbox = ref([]);

// Opciones de tipo movimiento (predefinidas)
const tiposMovimientoOptions = [
  { label: "Compra MB Nuevo", value: "Compra MB Nuevo" },
  { label: "Compra MB USO", value: "Compra MB USO" },
  { label: "Traspaso Recibido", value: "Traspaso Recibido" },
  { label: "Ajuste de inventario alta", value: "Ajuste de inventario alta" },
  { label: "Ajuste de Inventario Alta", value: "Ajuste de Inventario Alta" },
  { label: "Pérdida", value: "Pérdida" },
  { label: "Traspaso Efectuado", value: "Traspaso Efectuado" },
  { label: "Préstamo temporal al trabajador", value: "Préstamo temporal al trabajador" },
  { label: "Baja", value: "Baja" },
  { label: "Traslado interno", value: "Traslado interno" },
  { label: "Ajuste de Inv", value: "Ajuste de Inv" },
  { label: "Activo Ocioso", value: "Activo Ocioso" },
  { label: "Enviado a reparar", value: "Enviado a reparar" },
  { label: "Otro", value: "Otro" },
  { label: "Préstamo fuera de la Entidad", value: "Préstamo fuera de la Entidad" },
  { label: "Venta", value: "Venta" },
  { label: "Retiro", value: "Retiro" }
];

// Opciones de estado completas
const todasLasOpcionesEstado = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'En Proceso', value: 'En Proceso' },
  { label: 'Aprobada', value: 'Aprobada' },
  { label: 'Rechazada', value: 'Rechazada' },
  { label: 'Cancelada', value: 'Cancelada' },
  { label: 'Completada', value: 'Completada' }
];

// Opciones según rol
const estadoOptionsDisponibles = computed(() => {
  if (rolUsuario.value === 'Responsable de Área') {
    return todasLasOpcionesEstado.filter(opt => opt.value === 'Pendiente');
  } else if (rolUsuario.value === 'Jefe de Área') {
    return todasLasOpcionesEstado.filter(opt => ['Pendiente', 'En Proceso', 'Rechazada'].includes(opt.value));
  } else {
    return todasLasOpcionesEstado;
  }
});

// Si el estado debe estar deshabilitado
const isEstadoDisabled = computed(() => {
  if (rolUsuario.value === 'Responsable de Área') return true;
  if (rolUsuario.value === 'Jefe de Área' && props.isEditing) return true;
  return false;
});

// Formulario reactivo
const form = reactive({
  nota: '',
  tipo_traslado: 'aft',
  tipo_movimiento: '',
  fundamentacion: '',
  estado: 'Pendiente',
  usuarios_list: [],
  lista_activos: [],
  id_AreaResponsabilidad: ''
});

const tipoElementoLabel = computed(() => form.tipo_traslado === 'aft' ? 'Activos Fijos' : 'Útiles');
const endpointElementosCarga = computed(() => form.tipo_traslado === 'aft' ? '/aft/filtrar/1/999999' : '/utiles/filtrar/1/999999');
const bodyKeyArea = computed(() => form.tipo_traslado === 'aft' ? 'ID_AreaResp' : 'Id_AreaResponsabilidad');

// Computed para filtros en vista
const filteredElementosVista = computed(() => {
  let result = elementosVistaConCheckbox.value;
  if (filterCodeView.value) {
    const codeFilter = filterCodeView.value.toLowerCase().trim();
    result = result.filter(item => item.id && item.id.toLowerCase().includes(codeFilter));
  }
  if (filterNameView.value) {
    const nameFilter = filterNameView.value.toLowerCase().trim();
    result = result.filter(item => item.descripcion && item.descripcion.toLowerCase().includes(nameFilter));
  }
  return result;
});

const reviewedCountView = computed(() => 
  elementosVistaConCheckbox.value.filter(item => item.isRevisado).length
);

const getOriginalIndexVista = (filteredItem) => {
  return elementosVistaConCheckbox.value.findIndex(orig => orig.id === filteredItem.id);
};

const clearFiltersView = () => {
  filterCodeView.value = '';
  filterNameView.value = '';
};

// --- Carga automática de usuarios (Especialistas + Jefe) ---
async function cargarUsuarios() {
  console.log('[RevisionesModal] cargarUsuarios iniciando...');
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay token de autenticación');

    const url = `${config.public.backendHost}/usuarios/filtrar/1/999999`;
    const resEspecialistas = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ rol: 'Especialista' })
    });
    if (!resEspecialistas.ok) {
      const errorText = await resEspecialistas.text();
      throw new Error(`Error al cargar especialistas: ${resEspecialistas.status} - ${errorText}`);
    }
    const dataEsp = await resEspecialistas.json();
    const especialistas = dataEsp.datos || [];

    let jefe = null;
    if (idUsuarioJefe.value) {
      const resJefe = await fetch(`${config.public.backendHost}/usuarios/${idUsuarioJefe.value}`, {
        headers: { Authorization: token }
      });
      if (resJefe.ok) {
        jefe = await resJefe.json();
      }
    }

    const usuariosMap = new Map();
    especialistas.forEach(u => {
      usuariosMap.set(u.id_usuario, {
        id: u.id_usuario,
        label: `${u.id_usuario_LDAP} (ID: ${u.id_usuario})`
      });
    });
    if (jefe && !usuariosMap.has(jefe.id_usuario)) {
      usuariosMap.set(jefe.id_usuario, {
        id: jefe.id_usuario,
        label: `${jefe.id_usuario_LDAP} (ID: ${jefe.id_usuario})`
      });
    }
    form.usuarios_list = Array.from(usuariosMap.values());

    if (form.usuarios_list.length === 0) {
      message.value = {
        title: 'Sin usuarios',
        description: 'No se encontraron especialistas ni jefe para asociar a la revisión.',
        type: 'warning'
      };
    }
  } catch (err) {
    console.error('[RevisionesModal] Error cargando usuarios:', err);
    message.value = {
      title: 'Error al cargar usuarios',
      description: err.message || 'No se pudieron cargar los usuarios',
      type: 'error'
    };
    throw err;
  }
}

// --- Funciones API ---
async function cargarArea(idArea) {
  if (!idArea) return '';
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${config.public.backendHost}/areas/${idArea}`, {
      headers: { Authorization: token }
    });
    if (!res.ok) throw new Error('Error al cargar área');
    const data = await res.json();
    return data.Desc_AreaResponsabilidad || idArea;
  } catch (err) {
    console.error(err);
    return idArea;
  }
}

async function cargarElementoPorId(tipo, id) {
  try {
    const token = localStorage.getItem('token');
    const endpoint = tipo === 'aft' ? `/aft/${id}` : `/utiles/${id}`;
    const res = await fetch(`${config.public.backendHost}${endpoint}`, {
      headers: { Authorization: token }
    });
    if (!res.ok) throw new Error(`Error al cargar ${tipo} ${id}`);
    const data = await res.json();
    if (tipo === 'aft') {
      return { id: data.Id_ActivoFijo?.trim(), descripcion: data.Desc_ActivoFijo };
    } else {
      return { id: data.Id_UH?.trim(), descripcion: data.Desc_UH };
    }
  } catch (err) {
    console.error(err);
    return { id, descripcion: id };
  }
}

async function cargarYReemplazarElementos(areaId) {
  if (!areaId) return [];
  cargandoElementos.value = true;
  dataLoading.value = true;
  loadingMessage.value = `Cargando ${tipoElementoLabel.value} del área...`;
  try {
    const token = localStorage.getItem('token');
    const payload = { [bodyKeyArea.value]: areaId };
    const res = await fetch(`${config.public.backendHost}${endpointElementosCarga.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error al obtener elementos');
    const data = await res.json();
    const items = data.datos || [];
    const nuevosElementos = items.map(item => {
      let id, desc;
      if (form.tipo_traslado === 'aft') {
        id = item.Id_ActivoFijo?.trim();
        desc = item.Desc_ActivoFijo;
      } else {
        id = item.Id_UH?.trim();
        desc = item.Desc_UH;
      }
      return {
        id,
        label: `${id}: ${desc}`,
        isRevisado: false,
        descripcion: desc
      };
    });
    form.lista_activos = nuevosElementos;
    form.id_AreaResponsabilidad = areaId;
    return nuevosElementos;
  } catch (err) {
    console.error(err);
    message.value = { title: 'Error', description: 'No se pudieron cargar los elementos del área.', type: 'error' };
    return [];
  } finally {
    cargandoElementos.value = false;
    dataLoading.value = false;
  }
}

async function onResponsableSeleccionado(usuario) {
  if (!usuario) return;
  responsableSeleccionado.value = usuario;
  const areaUsuario = usuario.id_AreaResponsabilidad?.trim();
  if (!areaUsuario) {
    message.value = { title: 'Advertencia', description: 'El usuario seleccionado no tiene un área de responsabilidad asignada.', type: 'warning' };
    form.lista_activos = [];
    form.id_AreaResponsabilidad = '';
    return;
  }
  await cargarYReemplazarElementos(areaUsuario);
}

function limpiarResponsable() {
  responsableSeleccionado.value = null;
  form.lista_activos = [];
  form.id_AreaResponsabilidad = '';
  if (selectResponsableRef.value && selectResponsableRef.value.clearSearch) {
    selectResponsableRef.value.clearSearch();
  }
}

async function cargarElementosDelUsuarioActual() {
  if (!usuarioLogueado.value) return;
  const areaId = usuarioLogueado.value.id_AreaResponsabilidad?.trim();
  if (!areaId) {
    message.value = { title: 'Advertencia', description: 'Su usuario no tiene un área de responsabilidad asignada.', type: 'warning' };
    form.lista_activos = [];
    form.id_AreaResponsabilidad = '';
    return;
  }
  await cargarYReemplazarElementos(areaId);
}

// --- Carga de datos existentes (modo vista/edición) ---
async function cargarDatosComplementarios(revision) {
  if (!revision || Object.keys(revision).length === 0) return;

  if (revision.id_AreaResponsabilidad) {
    const desc = await cargarArea(revision.id_AreaResponsabilidad);
    areaDesc.value = desc;
  }

  if (revision.solicitud?.usuarios && revision.solicitud.usuarios.length > 0) {
    const creador = revision.solicitud.usuarios[0];
    usuarioCreadorNombre.value = creador.id_usuario_LDAP || creador.id_usuario;
  } else {
    usuarioCreadorNombre.value = '';
  }

  const tipo = revision.solicitud?.tipo_traslado || 'aft';
  const detalles = revision.detalles || [];
  const elementosPromises = detalles.map(d => cargarElementoPorId(tipo, d.id_activoFijo_o_util));
  const elementos = await Promise.all(elementosPromises);
  elementosMostrar.value = detalles.map((d, idx) => ({
    ...elementos[idx],
    isRevisado: d.isRevisado
  }));
  elementosVistaConCheckbox.value = elementosMostrar.value.map(e => ({ ...e }));

  if (revision.solicitud?.usuarios) {
    usuariosMostrar.value = revision.solicitud.usuarios;
  } else {
    usuariosMostrar.value = [];
  }
}

async function loadExistingData(revision) {
  if (!revision || Object.keys(revision).length === 0) return;

  dataLoading.value = true;
  try {
    revisionData.value = revision;
    await cargarDatosComplementarios(revision);

    if (!props.isViewing || props.isEditing) {
      form.nota = revision.solicitud?.nota || '';
      form.tipo_traslado = revision.solicitud?.tipo_traslado || 'aft';
      form.tipo_movimiento = revision.solicitud?.tipo_movimiento || '';
      form.fundamentacion = revision.solicitud?.fundamentacion || '';
      form.estado = revision.solicitud?.estado || 'Pendiente';
      form.id_AreaResponsabilidad = revision.id_AreaResponsabilidad || '';

      // No modificar usuarios_list, ya se cargó desde cargarUsuarios

      const tipo = revision.solicitud?.tipo_traslado || 'aft';
      const detalles = revision.detalles || [];
      const elementosPromises = detalles.map(async (d) => {
        const elem = await cargarElementoPorId(tipo, d.id_activoFijo_o_util);
        return {
          id: elem.id,
          label: `${elem.id}: ${elem.descripcion}`,
          isRevisado: d.isRevisado || false,
          descripcion: elem.descripcion
        };
      });
      form.lista_activos = await Promise.all(elementosPromises);
    }
  } catch (err) {
    console.error('Error cargando datos de la revisión:', err);
    message.value = {
      title: 'Error',
      description: 'No se pudieron cargar los datos de la revisión',
      type: 'error'
    };
  } finally {
    dataLoading.value = false;
  }
}

function resetFormFields() {
  form.nota = '';
  form.tipo_traslado = 'aft';
  form.tipo_movimiento = '';
  form.fundamentacion = '';
  form.estado = 'Pendiente';
  form.lista_activos = [];
  form.id_AreaResponsabilidad = '';
  errorList.value = [];
  areaDesc.value = '';
  usuarioCreadorNombre.value = '';
  elementosMostrar.value = [];
  usuariosMostrar.value = [];
  revisionData.value = {};
  responsableSeleccionado.value = null;
  elementosVistaConCheckbox.value = [];
  clearFiltersView();
  message.value = null;
}

function resetForm() {
  resetFormFields();
  form.usuarios_list = [];
}

function getUsuariosIds() {
  return form.usuarios_list.map(item => item.id);
}

function getListaActivos() {
  return form.lista_activos.map(item => ({
    id_activoFijo_o_util: item.id,
    isRevisado: item.isRevisado || false
  }));
}

function eliminarElemento(idx) {
  form.lista_activos.splice(idx, 1);
}

// --- Modo vista: checkboxes y escáner ---
function onCheckboxChange(item, idx) {
  if (idx !== -1) {
    elementosVistaConCheckbox.value[idx].isRevisado = item.isRevisado;
  }
}

async function guardarCambiosRevision() {
  if (!revisionData.value.id_solicitud) return;
  guardandoRevision.value = true;
  dataLoading.value = true;
  loadingMessage.value = 'Guardando cambios...';
  try {
    const token = localStorage.getItem('token');
    const payload = {
      lista_activos: elementosVistaConCheckbox.value.map(item => ({
        id_activoFijo_o_util: item.id,
        isRevisado: item.isRevisado
      }))
    };
    const res = await fetch(`${config.public.backendHost}/revisiones/${revisionData.value.id_solicitud}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error al actualizar la revisión');
    message.value = { title: 'Éxito', description: 'Cambios guardados correctamente', type: 'success' };
    await loadExistingData(revisionData.value);
  } catch (err) {
    console.error(err);
    message.value = { title: 'Error', description: err.message, type: 'error' };
  } finally {
    guardandoRevision.value = false;
    dataLoading.value = false;
  }
}

// Escáner
async function openScanner() {
  showScanner.value = true;
  await nextTick();
  try {
    const { Html5Qrcode } = await import('html5-qrcode');
    html5QrCode = new Html5Qrcode("qr-reader");
    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        const scanned = decodedText.replace(/\s/g, '');
        const index = elementosVistaConCheckbox.value.findIndex(item => {
          const itemIdClean = item.id.replace(/\s/g, '');
          return itemIdClean === scanned;
        });
        if (index !== -1 && !elementosVistaConCheckbox.value[index].isRevisado) {
          elementosVistaConCheckbox.value[index].isRevisado = true;
          message.value = { title: 'Éxito', description: `Elemento "${elementosVistaConCheckbox.value[index].descripcion}" marcado como revisado`, type: 'success' };
          setTimeout(() => message.value = null, 3000);
        } else if (index !== -1 && elementosVistaConCheckbox.value[index].isRevisado) {
          message.value = { title: 'Info', description: 'El elemento ya estaba marcado como revisado', type: 'info' };
        } else {
          message.value = { title: 'No encontrado', description: 'El código escaneado no coincide con ningún elemento', type: 'warning' };
        }
        setTimeout(() => message.value = null, 3000);
        closeScanner();
      },
      (error) => {
        console.warn("Scan error", error);
      }
    );
  } catch (err) {
    console.error("Error al iniciar escáner", err);
    message.value = { title: 'Error', description: 'No se pudo iniciar la cámara', type: 'error' };
    showScanner.value = false;
  }
}

function closeScanner() {
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop().then(() => {
      html5QrCode = null;
      showScanner.value = false;
    }).catch(err => console.warn("Error al detener escáner", err));
  } else {
    showScanner.value = false;
  }
}

// --- Watchers y métodos de ciclo de vida ---
watch(() => form.tipo_traslado, async () => {
  if (esUsuarioConRolEspecial.value) {
    await cargarElementosDelUsuarioActual();
  } else if (responsableSeleccionado.value) {
    const areaId = responsableSeleccionado.value.id_AreaResponsabilidad?.trim();
    if (areaId) {
      await cargarYReemplazarElementos(areaId);
    }
  } else {
    form.lista_activos = [];
    form.id_AreaResponsabilidad = '';
  }
});

watch(() => props.revision, async (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    await loadExistingData(newVal);
  } else {
    if (!props.isViewing) {
      resetFormFields();
      if (esUsuarioConRolEspecial.value && !props.isEditing && !props.isViewing) {
        await cargarElementosDelUsuarioActual();
      }
    }
  }
}, { immediate: true, deep: true });

function enableEditMode() {
  emit('update:modelValue', false);
  setTimeout(() => {
    emit('submit', { action: 'edit', data: revisionData.value });
  }, 200);
}

async function onSubmit() {
  errorList.value = [];
  if (!form.id_AreaResponsabilidad) errorList.value.push('No se ha seleccionado un área de responsabilidad (debe seleccionar un responsable o tener rol especial)');
  if (form.lista_activos.length === 0) errorList.value.push('Debe agregar al menos un elemento (AFT o Útil)');
  if (form.usuarios_list.length === 0) errorList.value.push('Debe haber al menos un usuario involucrado');
  if (errorList.value.length) return;

  isSubmitting.value = true;
  dataLoading.value = true;
  loadingMessage.value = props.isEditing ? 'Actualizando revisión...' : 'Creando revisión...';

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay sesión activa');

    const usuarioCreador = usuarioLogueado.value?.id_usuario || null;
    const payload = {
      solicitud: {
        nota: form.nota,
        tipo_traslado: form.tipo_traslado,
        tipo_movimiento: form.tipo_movimiento,
        fundamentacion: form.fundamentacion,
        estado: form.estado
      },
      revision: {
        id_AreaResponsabilidad: form.id_AreaResponsabilidad.trim()
      },
      usuarios_ids: [...getUsuariosIds(), usuarioCreador].filter(Boolean),
      lista_activos: getListaActivos(),
      usuario_creador: usuarioCreador
    };

    let url, method;
    if (props.isEditing && revisionData.value.id_solicitud) {
      url = `${config.public.backendHost}/revisiones/${revisionData.value.id_solicitud}`;
      method = 'PUT';
    } else {
      url = `${config.public.backendHost}/revisiones`;
      method = 'POST';
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}`;
      try {
        const errData = await response.json();
        errorMessage = errData.error || errData.message || JSON.stringify(errData);
      } catch {
        errorMessage = await response.text().catch(() => errorMessage);
      }
      throw new Error(errorMessage);
    }

    message.value = {
      title: 'Éxito',
      description: `Revisión ${props.isEditing ? 'actualizada' : 'creada'} correctamente`,
      type: 'success'
    };
    emit('success');
    setTimeout(() => {
      emit('update:modelValue', false);
    }, 1500);
  } catch (err) {
    console.error('Error en onSubmit:', err);
    message.value = {
      title: 'Error',
      description: err.message,
      type: 'error'
    };
  } finally {
    isSubmitting.value = false;
    dataLoading.value = false;
  }
}

function onRequestClose() {
  if (dataLoading.value) return;
  emit('update:modelValue', false);
}

function cargarUsuarioLocal() {
  try {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      usuarioLogueado.value = JSON.parse(userStr);
      rolUsuario.value = usuarioLogueado.value?.rol || '';
      idUsuarioJefe.value = usuarioLogueado.value?.id_usuario_jefe || null;
      if (rolUsuario.value === 'Responsable de Área') {
        form.estado = 'Pendiente';
      }
    }
  } catch (e) {
    console.warn('Error al leer usuario:', e);
  }
}

// Watch que maneja la apertura del modal
watch(() => props.modelValue, async (open) => {
  if (open) {
    message.value = null;
    errorList.value = [];

    cargarUsuarioLocal();
    dataLoading.value = true;
    try {
      await cargarUsuarios();
      if (props.revision && Object.keys(props.revision).length > 0) {
        await loadExistingData(props.revision);
      } else {
        // Nueva revisión: resetear campos pero conservar los usuarios ya cargados
        resetFormFields();
        if (esUsuarioConRolEspecial.value) {
          await cargarElementosDelUsuarioActual();
        }
      }
    } catch (err) {
      console.error('[RevisionesModal] Error en inicialización:', err);
    } finally {
      dataLoading.value = false;
    }
  }
}, { immediate: true });

onMounted(() => {
  cargarUsuarioLocal();
});

onUnmounted(() => {
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop().catch(console.warn);
  }
});
</script>

<style scoped></style>