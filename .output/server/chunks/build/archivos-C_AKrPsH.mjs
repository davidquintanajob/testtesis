import { ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderClass, ssrRenderStyle, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { N as Navbar } from './Navbar-Ds5Ji1IO.mjs';
import { S as SeoMeta, _ as _sfc_main$1 } from './MessageBanner-C3gOLDB5.mjs';
import './nuxt-link-DyRFq4kt.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';
import './v3-CPu3I7iP.mjs';

const _sfc_main = {
  __name: "archivos",
  __ssrInlineRender: true,
  setup(__props) {
    const errorBanner = ref(null);
    const isLoadingEnviados = ref(false);
    const isLoadingRecibidos = ref(false);
    const documentosEnviados = ref([]);
    const documentosRecibidos = ref([]);
    const seccionEnviadosOpen = ref(true);
    const seccionRecibidosOpen = ref(true);
    const imagenPreviewOpen = ref(false);
    const previewUrl = ref("");
    const previewNombre = ref("");
    const filtros = ref({
      fecha_desde: "",
      fecha_hasta: ""
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white" }, _attrs))}>`);
      _push(ssrRenderComponent(SeoMeta, {
        title: "Documentos de Mensajes - AFTUP",
        description: "Gesti\xF3n de documentos adjuntos en mensajes.",
        canonical: "/mensajes-documentos"
      }, null, _parent));
      _push(ssrRenderComponent(Navbar, null, null, _parent));
      if (errorBanner.value) {
        _push(`<div class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none">`);
        _push(ssrRenderComponent(_sfc_main$1, {
          title: errorBanner.value.title,
          description: errorBanner.value.description,
          type: errorBanner.value.type,
          onClose: ($event) => errorBanner.value = null,
          class: "pointer-events-auto"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="w-[95%] mx-auto px-4 pt-6 md:pt-6 mt-20 md:mt-0"><div class="bg-white rounded-lg shadow-md p-4 mb-6"><div class="flex flex-col md:flex-row gap-4 items-end"><div class="flex-1"><label class="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label><input type="datetime-local"${ssrRenderAttr("value", filtros.value.fecha_desde)} class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div><div class="flex-1"><label class="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label><input type="datetime-local"${ssrRenderAttr("value", filtros.value.fecha_hasta)} class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div><div class="flex gap-2"><button class="px-6 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] transition-colors">Buscar</button><button class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">Limpiar</button></div></div></div><div class="bg-white rounded-lg shadow-md mb-6 overflow-hidden"><button class="w-full flex justify-between items-center p-4 bg-gradient-to-r from-[#099ebf] to-[#077a99] text-white"><h2 class="text-xl font-bold">Documentos Enviados</h2><svg class="${ssrRenderClass([seccionEnviadosOpen.value ? "rotate-180" : "", "w-6 h-6 transition-transform"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button><div style="${ssrRenderStyle(seccionEnviadosOpen.value ? null : { display: "none" })}" class="p-4">`);
      if (isLoadingEnviados.value) {
        _push(`<div class="text-center py-8">Cargando documentos enviados...</div>`);
      } else if (documentosEnviados.value.length === 0) {
        _push(`<div class="text-center py-8 text-gray-500">No hay documentos adjuntos en mensajes enviados.</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);
        ssrRenderList(documentosEnviados.value, (doc) => {
          _push(`<div class="border rounded-lg p-3 hover:shadow-md transition"><div class="flex items-start gap-3"><div class="flex-shrink-0">`);
          if (doc.esImagen) {
            _push(`<img${ssrRenderAttr("src", doc.thumbnail || doc.url)} class="h-16 w-16 object-cover rounded-md cursor-pointer">`);
          } else {
            _push(`<div class="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center"><svg class="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg></div>`);
          }
          _push(`</div><div class="flex-1 min-w-0"><p class="font-semibold text-sm truncate"${ssrRenderAttr("title", doc.nombre)}>${ssrInterpolate(doc.nombre)}</p><p class="text-xs text-gray-500">Mensaje: ${ssrInterpolate(doc.descripcionCorta || "Sin descripci\xF3n")}</p><p class="text-xs text-gray-400">Fecha: ${ssrInterpolate(doc.fecha)}</p><p class="text-xs text-gray-500">Para: ${ssrInterpolate(doc.destinatario)}</p><button class="mt-2 text-xs bg-[#099ebf] text-white px-2 py-1 rounded hover:bg-[#077a99]">Descargar</button></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div><div class="bg-white rounded-lg shadow-md overflow-hidden"><button class="w-full flex justify-between items-center p-4 bg-gradient-to-r from-[#099ebf] to-[#077a99] text-white"><h2 class="text-xl font-bold">Documentos Recibidos</h2><svg class="${ssrRenderClass([seccionRecibidosOpen.value ? "rotate-180" : "", "w-6 h-6 transition-transform"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button><div style="${ssrRenderStyle(seccionRecibidosOpen.value ? null : { display: "none" })}" class="p-4">`);
      if (isLoadingRecibidos.value) {
        _push(`<div class="text-center py-8">Cargando documentos recibidos...</div>`);
      } else if (documentosRecibidos.value.length === 0) {
        _push(`<div class="text-center py-8 text-gray-500">No hay documentos adjuntos en mensajes recibidos.</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);
        ssrRenderList(documentosRecibidos.value, (doc) => {
          _push(`<div class="border rounded-lg p-3 hover:shadow-md transition"><div class="flex items-start gap-3"><div class="flex-shrink-0">`);
          if (doc.esImagen) {
            _push(`<img${ssrRenderAttr("src", doc.thumbnail || doc.url)} class="h-16 w-16 object-cover rounded-md cursor-pointer">`);
          } else {
            _push(`<div class="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center"><svg class="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg></div>`);
          }
          _push(`</div><div class="flex-1 min-w-0"><p class="font-semibold text-sm truncate"${ssrRenderAttr("title", doc.nombre)}>${ssrInterpolate(doc.nombre)}</p><p class="text-xs text-gray-500">Mensaje: ${ssrInterpolate(doc.descripcionCorta || "Sin descripci\xF3n")}</p><p class="text-xs text-gray-400">Fecha: ${ssrInterpolate(doc.fecha)}</p><p class="text-xs text-gray-500">De: ${ssrInterpolate(doc.remitente)}</p><button class="mt-2 text-xs bg-[#099ebf] text-white px-2 py-1 rounded hover:bg-[#077a99]">Descargar</button></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div></div>`);
      if (imagenPreviewOpen.value) {
        _push(`<div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 p-4"><div class="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden"><div class="flex justify-between items-center p-3 border-b"><h3 class="font-semibold">${ssrInterpolate(previewNombre.value)}</h3><button class="text-gray-500 hover:text-gray-800">\xD7</button></div><img${ssrRenderAttr("src", previewUrl.value)} class="max-w-full max-h-[80vh] object-contain"></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/archivos.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=archivos-C_AKrPsH.mjs.map
