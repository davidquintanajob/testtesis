<template>
  <div class="min-h-screen bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white">
    <SeoMeta title="Documentos de Mensajes - AFTUP" description="Gestión de documentos adjuntos en mensajes." canonical="/mensajes-documentos" />
    <Navbar />

    <!-- Banner de error global -->
    <div v-if="errorBanner" class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none">
      <MessageBanner :title="errorBanner.title" :description="errorBanner.description" :type="errorBanner.type" @close="errorBanner = null" class="pointer-events-auto" />
    </div>

    <!-- Contenedor principal -->
    <div class="w-[95%] mx-auto px-4 pt-6 md:pt-6 mt-20 md:mt-0">
      <!-- Filtros de fecha -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="flex flex-col md:flex-row gap-4 items-end">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
            <input type="datetime-local" v-model="filtros.fecha_desde" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
            <input type="datetime-local" v-model="filtros.fecha_hasta" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" />
          </div>
          <div class="flex gap-2">
            <button @click="aplicarFiltros" class="px-6 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] transition-colors">Buscar</button>
            <button @click="limpiarFiltros" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">Limpiar</button>
          </div>
        </div>
      </div>

      <!-- Sección Documentos Enviados (colapsable) -->
      <div class="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <button @click="seccionEnviadosOpen = !seccionEnviadosOpen" class="w-full flex justify-between items-center p-4 bg-gradient-to-r from-[#099ebf] to-[#077a99] text-white">
          <h2 class="text-xl font-bold">Documentos Enviados</h2>
          <svg :class="seccionEnviadosOpen ? 'rotate-180' : ''" class="w-6 h-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div v-show="seccionEnviadosOpen" class="p-4">
          <div v-if="isLoadingEnviados" class="text-center py-8">Cargando documentos enviados...</div>
          <div v-else-if="documentosEnviados.length === 0" class="text-center py-8 text-gray-500">No hay documentos adjuntos en mensajes enviados.</div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="doc in documentosEnviados" :key="doc.id" class="border rounded-lg p-3 hover:shadow-md transition">
              <div class="flex items-start gap-3">
                <!-- Miniatura o icono -->
                <div class="flex-shrink-0">
                  <img v-if="doc.esImagen" :src="doc.thumbnail || doc.url" class="h-16 w-16 object-cover rounded-md cursor-pointer" @click="previsualizarImagen(doc.url, doc.nombre)" />
                  <div v-else class="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                    <!-- Icono genérico (puedes reemplazar por heroicons si los tienes) -->
                    <svg class="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm truncate" :title="doc.nombre">{{ doc.nombre }}</p>
                  <p class="text-xs text-gray-500">Mensaje: {{ doc.descripcionCorta || 'Sin descripción' }}</p>
                  <p class="text-xs text-gray-400">Fecha: {{ doc.fecha }}</p>
                  <p class="text-xs text-gray-500">Para: {{ doc.destinatario }}</p>
                  <button @click="descargarDocumento(doc)" class="mt-2 text-xs bg-[#099ebf] text-white px-2 py-1 rounded hover:bg-[#077a99]">Descargar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección Documentos Recibidos (colapsable) -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <button @click="seccionRecibidosOpen = !seccionRecibidosOpen" class="w-full flex justify-between items-center p-4 bg-gradient-to-r from-[#099ebf] to-[#077a99] text-white">
          <h2 class="text-xl font-bold">Documentos Recibidos</h2>
          <svg :class="seccionRecibidosOpen ? 'rotate-180' : ''" class="w-6 h-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div v-show="seccionRecibidosOpen" class="p-4">
          <div v-if="isLoadingRecibidos" class="text-center py-8">Cargando documentos recibidos...</div>
          <div v-else-if="documentosRecibidos.length === 0" class="text-center py-8 text-gray-500">No hay documentos adjuntos en mensajes recibidos.</div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="doc in documentosRecibidos" :key="doc.id" class="border rounded-lg p-3 hover:shadow-md transition">
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                  <img v-if="doc.esImagen" :src="doc.thumbnail || doc.url" class="h-16 w-16 object-cover rounded-md cursor-pointer" @click="previsualizarImagen(doc.url, doc.nombre)" />
                  <div v-else class="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                    <svg class="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm truncate" :title="doc.nombre">{{ doc.nombre }}</p>
                  <p class="text-xs text-gray-500">Mensaje: {{ doc.descripcionCorta || 'Sin descripción' }}</p>
                  <p class="text-xs text-gray-400">Fecha: {{ doc.fecha }}</p>
                  <p class="text-xs text-gray-500">De: {{ doc.remitente }}</p>
                  <button @click="descargarDocumento(doc)" class="mt-2 text-xs bg-[#099ebf] text-white px-2 py-1 rounded hover:bg-[#077a99]">Descargar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de previsualización de imagen -->
    <div v-if="imagenPreviewOpen" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 p-4" @click.self="cerrarPreview">
      <div class="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
        <div class="flex justify-between items-center p-3 border-b">
          <h3 class="font-semibold">{{ previewNombre }}</h3>
          <button @click="cerrarPreview" class="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <img :src="previewUrl" class="max-w-full max-h-[80vh] object-contain" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '@/components/Navbar.vue';
import SeoMeta from '@/components/SeoMeta.vue';
import MessageBanner from '@/components/MessageBanner.vue';
import { navigateTo } from 'nuxt/app';

const config = useRuntimeConfig();

// Estado
const errorBanner = ref(null);
const isLoadingEnviados = ref(false);
const isLoadingRecibidos = ref(false);
const documentosEnviados = ref([]);
const documentosRecibidos = ref([]);
const seccionEnviadosOpen = ref(true);
const seccionRecibidosOpen = ref(true);
const imagenPreviewOpen = ref(false);
const previewUrl = ref('');
const previewNombre = ref('');

// Filtros
const filtros = ref({
  fecha_desde: '',
  fecha_hasta: ''
});

// Obtener usuario actual y token
const obtenerUsuarioActual = () => {
  try {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return null;
    return JSON.parse(usuarioStr);
  } catch {
    return null;
  }
};

const obtenerToken = () => localStorage.getItem('token');

// Función para obtener mensajes con filtros
const fetchMensajes = async (tipo, fechaDesde, fechaHasta) => {
  const token = obtenerToken();
  const usuario = obtenerUsuarioActual();
  if (!token || !usuario) {
    throw new Error('No hay sesión activa');
  }

  const body = {
    [tipo === 'emisor' ? 'id_usuario' : 'id_usuario_receptor']: usuario.id_usuario
  };
  if (fechaDesde) body.fecha_desde = new Date(fechaDesde).toISOString();
  if (fechaHasta) body.fecha_hasta = new Date(fechaHasta).toISOString();

  const response = await fetch(`${config.public.backendHost}/mensajes/filtrar/1/999999`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(errorMsg || `Error ${response.status}`);
  }

  const data = await response.json();
  return data.datos || [];
};

// Extraer documentos de los mensajes con metadata
const extraerDocumentos = (mensajes, tipo) => {
  const docs = [];
  for (const mensaje of mensajes) {
    if (!mensaje.documentos || mensaje.documentos.length === 0) continue;

    const fecha = new Date(mensaje.fecha_hora || mensaje.createdAt);
    const fechaStr = fecha.toLocaleString();
    const descripcion = mensaje.descripcion || '';
    const descripcionCorta = descripcion.length > 60 ? descripcion.substring(0, 57) + '...' : descripcion;

    for (const doc of mensaje.documentos) {
      let url = doc.direccion || doc.contenido || doc.url;
      if (url && !url.startsWith('http') && !url.startsWith('data:')) {
        url = `${config.public.backendHost}${url.startsWith('/') ? url : '/' + url}`;
      }
      const nombre = doc.nombre || url.split('/').pop() || 'documento';
      const esImagen = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(nombre) || (url && url.startsWith('data:image'));
      const thumbnail = esImagen && url && !url.startsWith('data:') ? url : null;

      docs.push({
        id: `${mensaje.id_mensaje}_${doc.id_documento || Math.random()}`,
        nombre,
        url,
        esImagen,
        thumbnail,
        fecha: fechaStr,
        descripcionCorta,
        remitente: mensaje.remitente?.id_usuario_LDAP || 'Desconocido',
        destinatario: mensaje.destinatario?.id_usuario_LDAP || 'Desconocido',
        mensajeId: mensaje.id_mensaje
      });
    }
  }
  return docs;
};

// Cargar documentos enviados
const cargarEnviados = async () => {
  isLoadingEnviados.value = true;
  errorBanner.value = null;
  try {
    const mensajes = await fetchMensajes('emisor', filtros.value.fecha_desde, filtros.value.fecha_hasta);
    documentosEnviados.value = extraerDocumentos(mensajes, 'emisor');
  } catch (err) {
    console.error('Error cargando enviados:', err);
    errorBanner.value = { title: 'Error', description: err.message, type: 'error' };
  } finally {
    isLoadingEnviados.value = false;
  }
};

// Cargar documentos recibidos
const cargarRecibidos = async () => {
  isLoadingRecibidos.value = true;
  errorBanner.value = null;
  try {
    const mensajes = await fetchMensajes('receptor', filtros.value.fecha_desde, filtros.value.fecha_hasta);
    documentosRecibidos.value = extraerDocumentos(mensajes, 'receptor');
  } catch (err) {
    console.error('Error cargando recibidos:', err);
    errorBanner.value = { title: 'Error', description: err.message, type: 'error' };
  } finally {
    isLoadingRecibidos.value = false;
  }
};

// Aplicar filtros
const aplicarFiltros = () => {
  cargarEnviados();
  cargarRecibidos();
};

const limpiarFiltros = () => {
  filtros.value.fecha_desde = '';
  filtros.value.fecha_hasta = '';
  aplicarFiltros();
};

// Descargar documento
const descargarDocumento = async (doc) => {
  if (!doc.url) return;
  try {
    const token = obtenerToken();
    const response = await fetch(doc.url, {
      headers: token ? { Authorization: token } : {}
    });
    if (!response.ok) throw new Error('Error al descargar');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = doc.nombre;
    link.click();
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    errorBanner.value = { title: 'Error', description: 'No se pudo descargar el archivo', type: 'error' };
  }
};

// Previsualizar imagen
const previsualizarImagen = (url, nombre) => {
  previewUrl.value = url;
  previewNombre.value = nombre;
  imagenPreviewOpen.value = true;
};

const cerrarPreview = () => {
  imagenPreviewOpen.value = false;
  previewUrl.value = '';
  previewNombre.value = '';
};

// Función para obtener icono según extensión (opcional, no se usa en el template actual)
// Se deja por si se quiere usar en el futuro
const getIconoArchivo = (nombre) => {
  const ext = nombre.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'DocumentPdfIcon';
  if (['doc', 'docx'].includes(ext)) return 'DocumentTextIcon';
  if (['xls', 'xlsx'].includes(ext)) return 'TableCellsIcon';
  if (ext === 'txt') return 'DocumentIcon';
  return 'DocumentIcon';
};

// --- CARGA INICIAL (CORREGIDO) ---
onMounted(async () => {
  const token = obtenerToken();
  if (!token) {
    errorBanner.value = { title: 'Sesión no encontrada', description: 'Redirigiendo al inicio...', type: 'warning' };
    setTimeout(() => navigateTo('/'), 2000);
    return;
  }
  // Cargar ambos tipos de documentos al montar la página
  await cargarEnviados();
  await cargarRecibidos();
});
</script>