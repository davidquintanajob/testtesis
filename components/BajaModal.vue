<template>
  <Modal :show="modelValue" @close="onRequestClose" size="3xl">
    <template #title>
      <h3 class="text-lg font-semibold text-gray-900">
        {{ isViewing ? 'Detalles de la Baja' : (isEditing ? 'Editar Baja' : 'Nueva Baja') }}
      </h3>
    </template>

    <template #content>
      <div ref="contentWrapper"
        :class="['transition-opacity', (dataLoading || isSubmitting) && 'pointer-events-none opacity-50']">
        <!-- Overlay de carga inicial -->
        <div v-if="dataLoading" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div class="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            <p class="text-gray-700 font-medium">Cargando datos...</p>
          </div>
        </div>

        <!-- Overlay de envío -->
        <div v-if="isSubmitting" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div class="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            <p class="text-gray-700 font-medium">{{ isEditing ? 'Actualizando baja...' : 'Creando baja...' }}</p>
          </div>
        </div>

        <!-- Mensajes internos -->
        <div v-if="message" class="mb-4">
          <MessageBanner :title="message.title" :description="message.description" :type="message.type"
            @close="message = null" />
        </div>

        <!-- Modo Vista -->
        <div v-if="isViewing && !isEditing" class="space-y-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-md font-medium text-gray-900 mb-3">Información General</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label class="block text-sm font-medium text-gray-700">ID Solicitud</label>
                <p class="mt-1 text-sm">{{ bajaData.id_solicitud || 'N/A' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Nota</label>
                <p class="mt-1 text-sm">{{ bajaData.solicitud?.nota || 'Sin nota' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Motivo</label>
                <p class="mt-1 text-sm">{{ bajaData.motivo || 'N/A' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Tipo Traslado</label>
                <p class="mt-1 text-sm">{{ bajaData.solicitud?.tipo_traslado || 'N/A' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Tipo Movimiento</label>
                <p class="mt-1 text-sm">{{ bajaData.solicitud?.tipo_movimiento || 'N/A' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Fundamentación</label>
                <p class="mt-1 text-sm">{{ bajaData.solicitud?.fundamentacion || 'Sin fundamentación' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Estado</label>
                <p class="mt-1 text-sm">{{ bajaData.solicitud?.estado || 'N/A' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Área Responsabilidad</label>
                <p class="mt-1 text-sm">{{ areaDesc || bajaData.id_AreaResponsabilidad || 'N/A' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Usuario Creador</label>
                <p class="mt-1 text-sm">{{ usuarioCreadorNombre || 'N/A' }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Fecha Creación</label>
                <p class="mt-1 text-sm">{{ bajaData.createdAt ? new Date(bajaData.createdAt).toLocaleString() : 'N/A' }}
                </p>
              </div>
              <div><label class="block text-sm font-medium text-gray-700">Fecha Cierre</label>
                <p class="mt-1 text-sm">{{ bajaData.solicitud?.fecha_hora_cierreSolicitud ? new
                  Date(bajaData.solicitud.fecha_hora_cierreSolicitud).toLocaleString() : 'No cerrada' }}</p>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="text-md font-medium text-gray-900 mb-3">Usuarios Involucrados</h4>
            <div v-if="usuariosMostrar.length" class="flex flex-wrap gap-2">
              <span v-for="u in usuariosMostrar" :key="u.id_usuario"
                class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{{ u.id_usuario_LDAP || u.nombre_usuario ||
                  u.id_usuario }}</span>
            </div>
            <p v-else class="text-sm text-gray-500">No hay usuarios asociados</p>
          </div>

          <div class="bg-green-50 rounded-lg p-4">
            <h4 class="text-md font-medium text-gray-900 mb-3">Activos Fijos / Útiles dados de baja</h4>
            <div v-if="activosMostrar.length" class="flex flex-wrap gap-2">
              <span v-for="item in activosMostrar" :key="item.id"
                class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{{ item.descripcion }}</span>
            </div>
            <p v-else class="text-sm text-gray-500">No hay elementos asociados</p>
          </div>

          <!-- Botón editar si estado no es Completada -->
          <div v-if="bajaData.solicitud?.estado !== 'Completada' && bajaData.estado !== 'Completada'"
            class="flex justify-end">
            <button @click="enableEditMode"
              class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99]">Editar Baja</button>
          </div>
        </div>

        <!-- Modo Edición / Creación -->
        <div v-else class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nota</label>
              <textarea v-model="form.nota" rows="3"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Motivo de la baja..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Motivo (breve)</label>
              <input type="text" v-model="form.motivo"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: Equipo obsoleto, Robo, etc." />
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo Movimiento</label>
              <SelectSearch v-model="form.tipo_movimiento" :options="tiposMovimientoOptions" label-key="label"
                value-key="value" placeholder="Seleccionar tipo de movimiento..." />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Fundamentación</label>
              <textarea v-model="form.fundamentacion" rows="2"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Justificación o fundamentación de la baja..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select v-model="form.estado" :disabled="isEstadoDisabled"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                :class="{ 'bg-gray-100 cursor-not-allowed': isEstadoDisabled }">
                <option v-for="opt in estadoOptionsDisponibles" :key="opt.value" :value="opt.value">{{ opt.label }}
                </option>
              </select>
              <p v-if="isEstadoDisabled && rolUsuario === 'Responsable de Área'" class="text-xs text-gray-500 mt-1">El
                estado solo puede ser Pendiente para tu rol.</p>
              <p v-if="isEstadoDisabled && rolUsuario === 'Jefe de Área' && isEditing"
                class="text-xs text-gray-500 mt-1">No puedes cambiar el estado de una solicitud ya creada.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Área Responsabilidad</label>
              <input type="text" v-model="form.id_AreaResponsabilidad" readonly disabled
                class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed" />
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

            <!-- Elementos a dar de baja -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Elementos a dar de baja ({{ tipoElementoLabel
                }})</label>
              <div class="flex gap-2 mb-2">
                <SelectSearchAPI ref="selectElementoRef" v-model="elementoSeleccionadoTemp" :multiple="false"
                  :endpoint="endpointElementos" method="POST" :search-key="searchKeyElementos"
                  :label-key="labelKeyElementos" :value-key="valueKeyElementos"
                  :extra-body-params="{ ID_AreaResp: idAreaResponsabilidad }"
                  :placeholder="`Buscar ${tipoElementoLabel}...`" :direct-data="false" :data-key="'datos'"
                  @entidad-seleccionada="agregarElementoSeleccionado" />
                <button type="button" @click="agregarElementoActual" :disabled="!elementoSeleccionadoTemp"
                  class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] disabled:opacity-50">
                  Agregar
                </button>
              </div>
              <div v-if="form.lista_activos.length" class="border rounded-lg divide-y max-h-48 overflow-y-auto">
                <div v-for="(item, idx) in form.lista_activos" :key="item.id"
                  class="flex justify-between items-center p-2 hover:bg-gray-50">
                  <span>{{ item.label }}</span>
                  <button type="button" @click="eliminarElemento(idx)" class="text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                    </svg>
                  </button>
                </div>
              </div>
              <p v-else class="text-sm text-gray-500 italic mt-1">No hay elementos agregados.</p>
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
import { ref, reactive, watch, computed, onMounted } from 'vue';
import Modal from '@/components/Modal.vue';
import SelectSearchAPI from '@/components/SelectSearchAPI.vue';
import SelectSearch from '@/components/SelectSearch.vue';
import MessageBanner from '@/components/MessageBanner.vue';

const props = defineProps({
  modelValue: Boolean,
  baja: { type: Object, default: () => ({}) },
  isEditing: { type: Boolean, default: false },
  isViewing: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue', 'success']);

const config = useRuntimeConfig();
const dataLoading = ref(false);
const isSubmitting = ref(false);
const message = ref(null);
const errorList = ref([]);
const contentWrapper = ref(null);
const selectElementoRef = ref(null);
const elementoSeleccionadoTemp = ref(null);

// Datos del usuario logueado
const usuarioLogueado = ref(null);
const idAreaOrigen = ref('');
const rolUsuario = ref('');
const idUsuarioJefe = ref(null);

// Variables para la vista
const bajaData = ref({});
const areaDesc = ref('');
const usuarioCreadorNombre = ref('');
const activosMostrar = ref([]);
const usuariosMostrar = ref([]);

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
  motivo: '',
  tipo_traslado: 'aft',
  tipo_movimiento: '',
  fundamentacion: '',
  estado: 'Pendiente',
  id_AreaResponsabilidad: '',
  usuarios_list: [],
  lista_activos: []
});

// Propiedades computadas para elementos según tipo_traslado
const tipoElementoLabel = computed(() => form.tipo_traslado === 'aft' ? 'Activo Fijo' : 'Útil');
const endpointElementos = computed(() => form.tipo_traslado === 'aft' ? '/aft/filtrar/1/5' : '/utiles/filtrar/1/5');
const searchKeyElementos = computed(() => form.tipo_traslado === 'aft' ? 'Desc_ActivoFijo' : 'Desc_UH');
const labelKeyElementos = computed(() => form.tipo_traslado === 'aft' ? 'Desc_ActivoFijo' : 'Desc_UH');
const valueKeyElementos = computed(() => form.tipo_traslado === 'aft' ? 'Id_ActivoFijo' : 'Id_UH');

const idAreaResponsabilidad = computed(() => usuarioLogueado.value?.id_AreaResponsabilidad?.trim() || '');

// --- Carga automática de usuarios (Especialistas + Jefe) ---
async function cargarUsuarios() {
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
        description: 'No se encontraron especialistas ni jefe para asociar a la baja.',
        type: 'warning'
      };
    }
  } catch (err) {
    console.error('[BajaModal] Error cargando usuarios:', err);
    message.value = {
      title: 'Error al cargar usuarios',
      description: err.message || 'No se pudieron cargar los usuarios',
      type: 'error'
    };
    throw err;
  }
}

// --- Funciones auxiliares para cargar áreas y elementos ---
async function cargarArea(idArea) {
  if (!idArea) return '';
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${config.public.backendHost}/areas/${idArea.trim()}`, {
      headers: { Authorization: token }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.Desc_AreaResponsabilidad || idArea;
  } catch {
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
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (tipo === 'aft') {
      return { id: data.Id_ActivoFijo?.trim(), descripcion: data.Desc_ActivoFijo };
    } else {
      return { id: data.Id_UH?.trim(), descripcion: data.Desc_UH };
    }
  } catch {
    return { id, descripcion: id };
  }
}

async function cargarDatosComplementarios(baja) {
  if (!baja || Object.keys(baja).length === 0) return;
  if (baja.id_AreaResponsabilidad) {
    areaDesc.value = await cargarArea(baja.id_AreaResponsabilidad);
  }
  if (baja.solicitud?.usuarios && baja.solicitud.usuarios.length) {
    usuarioCreadorNombre.value = baja.solicitud.usuarios[0].id_usuario_LDAP || baja.solicitud.usuarios[0].id_usuario;
    usuariosMostrar.value = baja.solicitud.usuarios;
  }
  const tipo = baja.solicitud?.tipo_traslado || 'aft';
  const detalles = baja.detalles || [];
  const elementosPromises = detalles.map(d => cargarElementoPorId(tipo, d.id_activoFijo_o_util));
  activosMostrar.value = await Promise.all(elementosPromises);
}

async function loadExistingData(baja) {
  if (!baja || Object.keys(baja).length === 0) return;
  dataLoading.value = true;
  try {
    bajaData.value = baja;
    await cargarDatosComplementarios(baja);

    if (!props.isViewing || props.isEditing) {
      form.nota = baja.solicitud?.nota || '';
      form.motivo = baja.motivo || '';
      form.tipo_traslado = baja.solicitud?.tipo_traslado || 'aft';
      form.tipo_movimiento = baja.solicitud?.tipo_movimiento || '';
      form.fundamentacion = baja.solicitud?.fundamentacion || '';
      form.estado = baja.solicitud?.estado || 'Pendiente';
      form.id_AreaResponsabilidad = baja.id_AreaResponsabilidad?.trim() || idAreaOrigen.value;

      // Cargar elementos existentes
      const tipo = baja.solicitud?.tipo_traslado || 'aft';
      const detalles = baja.detalles || [];
      const elementosPromises = detalles.map(async (d) => {
        const elem = await cargarElementoPorId(tipo, d.id_activoFijo_o_util);
        return { id: elem.id, label: `${elem.id}: ${elem.descripcion}` };
      });
      form.lista_activos = await Promise.all(elementosPromises);
    }
  } catch (err) {
    console.error('Error cargando datos de la baja:', err);
    message.value = { title: 'Error', description: 'No se pudieron cargar los datos', type: 'error' };
  } finally {
    dataLoading.value = false;
  }
}

function resetFormFields() {
  form.nota = '';
  form.motivo = '';
  form.tipo_traslado = 'aft';
  form.tipo_movimiento = '';
  form.fundamentacion = '';
  form.estado = 'Pendiente';
  form.id_AreaResponsabilidad = idAreaOrigen.value;
  form.lista_activos = [];
  errorList.value = [];
  areaDesc.value = '';
  usuarioCreadorNombre.value = '';
  activosMostrar.value = [];
  usuariosMostrar.value = [];
  bajaData.value = {};
  message.value = null;
}

function resetForm() {
  resetFormFields();
  form.usuarios_list = [];
}

function getUsuariosIds() {
  return form.usuarios_list.map(item => item.id);
}

function getListaActivosIds() {
  return form.lista_activos.map(item => item.id);
}

function agregarElementoSeleccionado(option) {
  if (!option) return;
  const id = option[valueKeyElementos.value];
  const desc = option[labelKeyElementos.value];
  const label = `${id}: ${desc}`;
  if (!form.lista_activos.some(item => item.id === id)) {
    form.lista_activos.push({ id, label });
  }
  elementoSeleccionadoTemp.value = null;
  if (selectElementoRef.value && selectElementoRef.value.clearSearch) {
    setTimeout(() => selectElementoRef.value.clearSearch(), 100);
  }
}

function agregarElementoActual() {
  if (elementoSeleccionadoTemp.value) {
    agregarElementoSeleccionado(elementoSeleccionadoTemp.value);
  }
}

function eliminarElemento(idx) {
  form.lista_activos.splice(idx, 1);
}

watch(() => form.tipo_traslado, () => {
  form.lista_activos = [];
  elementoSeleccionadoTemp.value = null;
});

watch(() => props.baja, async (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    await loadExistingData(newVal);
  } else {
    if (!props.isViewing) resetFormFields();
  }
}, { immediate: true, deep: true });

function enableEditMode() {
  emit('update:modelValue', false);
  setTimeout(() => {
    emit('update:modelValue', true);
  }, 200);
}

// NUEVO onSubmit que maneja la petición HTTP internamente
async function onSubmit() {
  errorList.value = [];
  if (!form.motivo) errorList.value.push('Debe ingresar un motivo');
  if (form.lista_activos.length === 0) errorList.value.push('Debe agregar al menos un elemento (AFT o Útil)');
  if (form.usuarios_list.length === 0) errorList.value.push('Debe haber al menos un usuario involucrado');
  if (errorList.value.length) return;

  const usuarioCreador = usuarioLogueado.value?.id_usuario || null;
  const payload = {
    solicitud: {
      nota: form.nota,
      tipo_traslado: form.tipo_traslado,
      tipo_movimiento: form.tipo_movimiento,
      fundamentacion: form.fundamentacion,
      estado: form.estado
    },
    baja: {
      id_AreaResponsabilidad: form.id_AreaResponsabilidad.trim(),
      motivo: form.motivo
    },
    usuarios_ids: [...getUsuariosIds(), usuarioCreador].filter(Boolean),
    lista_activos: getListaActivosIds(),
    usuario_creador: usuarioCreador
  };

  isSubmitting.value = true;
  message.value = null;

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay sesión activa');

    let url, method;
    if (props.isEditing && bajaData.value.id_solicitud) {
      url = `${config.public.backendHost}/bajas/${bajaData.value.id_solicitud}`;
      method = 'PUT';
    } else {
      url = `${config.public.backendHost}/bajas`;
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
        // Priorizar "error", luego "message", luego el objeto completo
        if (errData.error) {
          errorMessage = errData.error;
        } else if (errData.message) {
          errorMessage = errData.message;
        } else {
          errorMessage = JSON.stringify(errData);
        }
      } catch {
        // Si no es JSON, usar texto plano
        errorMessage = await response.text().catch(() => errorMessage);
      }
      throw new Error(errorMessage);
    }

    message.value = {
      title: props.isEditing ? 'Baja actualizada' : 'Baja creada',
      description: 'Operación exitosa',
      type: 'success'
    };
    emit('success');
    setTimeout(() => {
      emit('update:modelValue', false);
    }, 1500);
  } catch (err) {
    console.error('Error en submit:', err);
    message.value = {
      title: 'Error',
      description: err.message,
      type: 'error'
    };
  } finally {
    isSubmitting.value = false;
  }
}

function onRequestClose() {
  if (dataLoading.value || isSubmitting.value) return;
  emit('update:modelValue', false);
}

function cargarUsuarioLocal() {
  try {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      usuarioLogueado.value = JSON.parse(userStr);
      idAreaOrigen.value = usuarioLogueado.value?.id_AreaResponsabilidad?.trim() || '';
      rolUsuario.value = usuarioLogueado.value?.rol || '';
      idUsuarioJefe.value = usuarioLogueado.value?.id_usuario_jefe || null;
      form.id_AreaResponsabilidad = idAreaOrigen.value;
      if (rolUsuario.value === 'Responsable de Área') {
        form.estado = 'Pendiente';
      }
    }
  } catch (e) {
    console.warn('Error al leer usuario:', e);
  }
}

watch(() => props.modelValue, async (open) => {
  if (open) {
    message.value = null;
    errorList.value = [];

    cargarUsuarioLocal();
    dataLoading.value = true;
    try {
      await cargarUsuarios();
      if (props.baja && Object.keys(props.baja).length > 0) {
        await loadExistingData(props.baja);
      } else {
        resetFormFields();
      }
    } catch (err) {
      console.error('[BajaModal] Error en inicialización:', err);
    } finally {
      dataLoading.value = false;
    }
  }
}, { immediate: true });

onMounted(() => {
  cargarUsuarioLocal();
});
</script>

<style scoped></style>