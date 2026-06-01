import { ref, computed, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseEqual, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { N as Navbar } from './Navbar-Ds5Ji1IO.mjs';
import { S as SeoMeta, _ as _sfc_main$1 } from './MessageBanner-C3gOLDB5.mjs';
import { _ as _sfc_main$2, D as DataTable } from './SelectSearchAPI-w3fp5OUm.mjs';
import { _ as _export_sfc, n as navigateTo, u as useRuntimeConfig } from './server.mjs';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import './v3-CPu3I7iP.mjs';
import 'vue-router';

const _sfc_main = {
  __name: "miarea",
  __ssrInlineRender: true,
  setup(__props) {
    const tipoSeleccionado = ref("aft");
    ref(null);
    const idAreaResponsabilidadUsuario = ref("");
    ref("");
    const esEspecialista = ref(false);
    const areaActiva = ref("");
    const areaSeleccionadaId = ref(null);
    const areaDestinoInitialLabel = ref("");
    const filtrosAFT = ref({
      Id_ActivoFijo: "",
      Desc_ActivoFijo: ""
    });
    const filtrosUtiles = ref({
      Id_UH: "",
      Desc_UH: "",
      Id_Ccosto: "",
      Id_AreaResponsabilidad: "",
      // se llenará con el área activa automáticamente
      Desc_Ccosto: "",
      Desc_AreaResponsabilidad: "",
      Desc_Empleado: "",
      Cantidad_desde: null,
      Cantidad_hasta: null
    });
    const currentPage = ref(1);
    const itemsPorPage = ref(20);
    const totalItems = ref(0);
    const isLoading = ref(false);
    const itemsData = ref([]);
    const errorBanner = ref(null);
    const config = useRuntimeConfig();
    const obtenerMensajeErrorApi = async (response) => {
      const contentType = response.headers.get("Content-Type") || "";
      try {
        const text = await response.text();
        if (!text) {
          return response.statusText || `Error ${response.status}`;
        }
        if (contentType.includes("application/json")) {
          const data = JSON.parse(text);
          if (data == null ? void 0 : data.error) return data.error;
          if (data == null ? void 0 : data.message) return data.message;
        }
        return text;
      } catch {
        return response.statusText || `Error ${response.status}`;
      }
    };
    const formatearNumero = (valor) => {
      if (valor === null || valor === void 0) return "0.00";
      const num = parseFloat(valor);
      if (isNaN(num)) return "0.00";
      return num.toFixed(2);
    };
    const columnasAFT = [
      { key: "Id_ActivoFijo", label: "ID Activo Fijo" },
      { key: "Desc_ActivoFijo", label: "Descripci\xF3n" },
      { key: "Valor_Inicial", label: "Valor Inicial" },
      { key: "Valor_Residual", label: "Valor Residual" },
      { key: "Depreciacion_Acumulada", label: "Depreciaci\xF3n Acumulada" }
    ];
    const columnasUtiles = [
      { key: "Id_UH", label: "ID \xDAtil" },
      { key: "Desc_UH", label: "Descripci\xF3n" },
      { key: "Cantidad", label: "Cantidad (\xE1rea seleccionada)" },
      { key: "Valor_Inicial", label: "Valor Inicial" }
    ];
    const columnasTabla = computed(() => {
      return tipoSeleccionado.value === "aft" ? columnasAFT : columnasUtiles;
    });
    const handleAreaSeleccionada = (area) => {
      if (area && area.Id_AreaResponsabilidad) {
        const nuevaArea = area.Id_AreaResponsabilidad.trim();
        areaActiva.value = nuevaArea;
        if (tipoSeleccionado.value === "utiles") {
          filtrosUtiles.value.Id_AreaResponsabilidad = nuevaArea;
        }
        handleSearch();
      } else {
        areaActiva.value = idAreaResponsabilidadUsuario.value;
        if (tipoSeleccionado.value === "utiles") {
          filtrosUtiles.value.Id_AreaResponsabilidad = areaActiva.value;
        }
        handleSearch();
      }
    };
    const construirBodyAFT = () => {
      const body = {};
      if (filtrosAFT.value.Id_ActivoFijo && filtrosAFT.value.Id_ActivoFijo.trim() !== "") {
        body.Id_ActivoFijo = filtrosAFT.value.Id_ActivoFijo.trim();
      }
      if (filtrosAFT.value.Desc_ActivoFijo && filtrosAFT.value.Desc_ActivoFijo.trim() !== "") {
        body.Desc_ActivoFijo = filtrosAFT.value.Desc_ActivoFijo.trim();
      }
      body.ID_AreaResp = areaActiva.value;
      return body;
    };
    const construirBodyUtiles = () => {
      const body = {};
      if (filtrosUtiles.value.Id_UH && filtrosUtiles.value.Id_UH.trim() !== "") {
        body.Id_UH = filtrosUtiles.value.Id_UH.trim();
      }
      if (filtrosUtiles.value.Desc_UH && filtrosUtiles.value.Desc_UH.trim() !== "") {
        body.Desc_UH = filtrosUtiles.value.Desc_UH.trim();
      }
      if (filtrosUtiles.value.Id_Ccosto && filtrosUtiles.value.Id_Ccosto.trim() !== "") {
        body.Id_Ccosto = filtrosUtiles.value.Id_Ccosto.trim();
      }
      if (filtrosUtiles.value.Desc_Ccosto && filtrosUtiles.value.Desc_Ccosto.trim() !== "") {
        body.Desc_Ccosto = filtrosUtiles.value.Desc_Ccosto.trim();
      }
      if (filtrosUtiles.value.Desc_AreaResponsabilidad && filtrosUtiles.value.Desc_AreaResponsabilidad.trim() !== "") {
        body.Desc_AreaResponsabilidad = filtrosUtiles.value.Desc_AreaResponsabilidad.trim();
      }
      if (filtrosUtiles.value.Desc_Empleado && filtrosUtiles.value.Desc_Empleado.trim() !== "") {
        body.Desc_Empleado = filtrosUtiles.value.Desc_Empleado.trim();
      }
      if (filtrosUtiles.value.Cantidad_desde !== null && filtrosUtiles.value.Cantidad_desde !== "") {
        body.Cantidad_desde = Number(filtrosUtiles.value.Cantidad_desde);
      }
      if (filtrosUtiles.value.Cantidad_hasta !== null && filtrosUtiles.value.Cantidad_hasta !== "") {
        body.Cantidad_hasta = Number(filtrosUtiles.value.Cantidad_hasta);
      }
      body.Id_AreaResponsabilidad = areaActiva.value;
      return body;
    };
    const transformarUtiles = (datosRaw) => {
      if (!datosRaw || !Array.isArray(datosRaw)) return [];
      const areaActivaTrimmed = areaActiva.value ? areaActiva.value.trim() : "";
      return datosRaw.map((item) => {
        let cantidad = 0;
        let valorInicial = 0;
        if (item.detalles && Array.isArray(item.detalles)) {
          const detalleEncontrado = item.detalles.find((detalle) => {
            if (!detalle.Id_AreaResponsabilidad) return false;
            const areaDetalle = detalle.Id_AreaResponsabilidad.trim();
            return areaDetalle === areaActivaTrimmed;
          });
          if (detalleEncontrado) {
            cantidad = typeof detalleEncontrado.Cantidad !== "undefined" ? detalleEncontrado.Cantidad : 0;
            valorInicial = typeof detalleEncontrado.Valor_Inicial !== "undefined" ? detalleEncontrado.Valor_Inicial : 0;
          }
        }
        return {
          Id_UH: item.Id_UH ? item.Id_UH.trim() : "",
          Desc_UH: item.Desc_UH ? item.Desc_UH.trim() : "",
          Cantidad: cantidad,
          Valor_Inicial: formatearNumero(valorInicial)
        };
      });
    };
    const transformarAFT = (datosRaw) => {
      if (!datosRaw || !Array.isArray(datosRaw)) return [];
      return datosRaw.map((item) => ({
        Id_ActivoFijo: item.Id_ActivoFijo ? item.Id_ActivoFijo.trim() : "",
        Desc_ActivoFijo: item.Desc_ActivoFijo ? item.Desc_ActivoFijo.trim() : "",
        Valor_Inicial: formatearNumero(item.Valor_Inicial),
        Valor_Residual: formatearNumero(item.Valor_Residual),
        Depreciacion_Acumulada: formatearNumero(item.Depreciacion_Acumulada)
      }));
    };
    const fetchData = async (page = 1) => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigateTo("/");
        return;
      }
      isLoading.value = true;
      errorBanner.value = null;
      try {
        let url = "";
        let body = {};
        let response;
        if (tipoSeleccionado.value === "aft") {
          url = `${config.public.backendHost}/aft/filtrar/${page}/${itemsPorPage.value}`;
          body = construirBodyAFT();
          response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": token
            },
            body: JSON.stringify(body)
          });
        } else {
          url = `${config.public.backendHost}/utiles/filtrar/${page}/${itemsPorPage.value}`;
          body = construirBodyUtiles();
          response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": token
            },
            body: JSON.stringify(body)
          });
        }
        if (response.status === 401) {
          errorBanner.value = {
            title: "Sesi\xF3n Expirada",
            description: "Tu sesi\xF3n ha expirado. Por favor, inicia sesi\xF3n nuevamente.",
            type: "warning"
          };
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          setTimeout(() => navigateTo("/"), 3e3);
          return;
        }
        if (response.status === 403) {
          errorBanner.value = {
            title: "Acceso Denegado",
            description: "No tienes permisos para realizar esta acci\xF3n.",
            type: "error"
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
        if (tipoSeleccionado.value === "aft") {
          itemsData.value = transformarAFT(data.datos || []);
        } else {
          itemsData.value = transformarUtiles(data.datos || []);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        errorBanner.value = {
          title: "Error de conexi\xF3n",
          description: "No se pudieron cargar los datos. Intente m\xE1s tarde.",
          type: "error"
        };
      } finally {
        isLoading.value = false;
      }
    };
    const handleSearch = () => {
      currentPage.value = 1;
      fetchData(1);
    };
    const handlePageChange = (page) => {
      fetchData(page);
    };
    watch(tipoSeleccionado, () => {
      currentPage.value = 1;
      fetchData(1);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white" }, _attrs))} data-v-117b390b>`);
      _push(ssrRenderComponent(SeoMeta, {
        title: "Mi \xC1rea - AFTUP",
        description: "Gesti\xF3n de Activos Fijos Tangibles y \xDAtiles. Lista y consulta de activos fijos.",
        canonical: "/miarea"
      }, null, _parent));
      _push(ssrRenderComponent(Navbar, null, null, _parent));
      if (errorBanner.value) {
        _push(`<div class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none" data-v-117b390b>`);
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
      _push(`<div class="w-[95%] mx-auto px-4 pt-6 md:pt-6 mt-20 md:mt-0" data-v-117b390b><div class="bg-white rounded-lg shadow-md p-4" data-v-117b390b><div class="flex items-center justify-start gap-8" data-v-117b390b><label class="relative inline-flex cursor-pointer items-center gap-3" data-v-117b390b><input type="radio" value="aft"${ssrIncludeBooleanAttr(ssrLooseEqual(tipoSeleccionado.value, "aft")) ? " checked" : ""} class="peer sr-only" data-v-117b390b><div class="w-14 h-7 rounded-full bg-gray-200 peer-checked:bg-[#099ebf] transition-colors duration-300 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-7" data-v-117b390b></div><span class="text-gray-700 font-medium select-none" data-v-117b390b>Activos Fijos Tangibles (AFT)</span></label><label class="relative inline-flex cursor-pointer items-center gap-3" data-v-117b390b><input type="radio" value="utiles"${ssrIncludeBooleanAttr(ssrLooseEqual(tipoSeleccionado.value, "utiles")) ? " checked" : ""} class="peer sr-only" data-v-117b390b><div class="w-14 h-7 rounded-full bg-gray-200 peer-checked:bg-[#099ebf] transition-colors duration-300 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-7" data-v-117b390b></div><span class="text-gray-700 font-medium select-none" data-v-117b390b>\xDAtiles</span></label></div></div></div><div class="w-[95%] mx-auto px-4 py-4" data-v-117b390b><div class="bg-white rounded-lg shadow-md p-4" data-v-117b390b>`);
      if (tipoSeleccionado.value === "aft") {
        _push(`<div data-v-117b390b><div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" data-v-117b390b><div data-v-117b390b><label class="block text-sm font-medium text-gray-700 mb-1" data-v-117b390b>Id Activo Fijo</label><input type="text"${ssrRenderAttr("value", filtrosAFT.value.Id_ActivoFijo)} placeholder="Ingrese el ID del activo..." class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" data-v-117b390b></div><div data-v-117b390b><label class="block text-sm font-medium text-gray-700 mb-1" data-v-117b390b>Descripci\xF3n del Activo Fijo</label><input type="text"${ssrRenderAttr("value", filtrosAFT.value.Desc_ActivoFijo)} placeholder="Ingrese la descripci\xF3n..." class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" data-v-117b390b></div></div></div>`);
      } else {
        _push(`<div data-v-117b390b><div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4" data-v-117b390b><div data-v-117b390b><label class="block text-sm font-medium text-gray-700 mb-1" data-v-117b390b>Id \xDAtil</label><input type="text"${ssrRenderAttr("value", filtrosUtiles.value.Id_UH)} placeholder="Ingrese ID del \xFAtil..." class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" data-v-117b390b></div><div data-v-117b390b><label class="block text-sm font-medium text-gray-700 mb-1" data-v-117b390b>Descripci\xF3n del \xDAtil</label><input type="text"${ssrRenderAttr("value", filtrosUtiles.value.Desc_UH)} placeholder="Ingrese descripci\xF3n..." class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" data-v-117b390b></div><div data-v-117b390b><label class="block text-sm font-medium text-gray-700 mb-1" data-v-117b390b>Id Centro de Costo</label><input type="text"${ssrRenderAttr("value", filtrosUtiles.value.Id_Ccosto)} placeholder="Ej: 1045" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" data-v-117b390b></div><div data-v-117b390b><label class="block text-sm font-medium text-gray-700 mb-1" data-v-117b390b>Descripci\xF3n Centro de Costo</label><input type="text"${ssrRenderAttr("value", filtrosUtiles.value.Desc_Ccosto)} placeholder="..." class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" data-v-117b390b></div><div data-v-117b390b><label class="block text-sm font-medium text-gray-700 mb-1" data-v-117b390b>Descripci\xF3n \xC1rea Responsabilidad</label><input type="text"${ssrRenderAttr("value", filtrosUtiles.value.Desc_AreaResponsabilidad)} placeholder="..." class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" data-v-117b390b></div><div data-v-117b390b><label class="block text-sm font-medium text-gray-700 mb-1" data-v-117b390b>Descripci\xF3n Empleado</label><input type="text"${ssrRenderAttr("value", filtrosUtiles.value.Desc_Empleado)} placeholder="..." class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" data-v-117b390b></div><div data-v-117b390b><label class="block text-sm font-medium text-gray-700 mb-1" data-v-117b390b>Cantidad desde</label><input type="number"${ssrRenderAttr("value", filtrosUtiles.value.Cantidad_desde)} placeholder="0" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" data-v-117b390b></div><div data-v-117b390b><label class="block text-sm font-medium text-gray-700 mb-1" data-v-117b390b>Cantidad hasta</label><input type="number"${ssrRenderAttr("value", filtrosUtiles.value.Cantidad_hasta)} placeholder="0" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" data-v-117b390b></div></div><p class="text-xs text-gray-500 mt-2" data-v-117b390b>* Los \xFAtiles se mostrar\xE1n con la cantidad correspondiente al \xE1rea seleccionada.</p></div>`);
      }
      if (esEspecialista.value) {
        _push(`<div class="mt-4 pt-4 border-t border-gray-200" data-v-117b390b><label class="block text-sm font-medium text-gray-700 mb-1" data-v-117b390b>\xC1rea de responsabilidad (consultar otra \xE1rea)</label>`);
        _push(ssrRenderComponent(_sfc_main$2, {
          modelValue: areaSeleccionadaId.value,
          "onUpdate:modelValue": ($event) => areaSeleccionadaId.value = $event,
          multiple: false,
          endpoint: "/areas/filtrar/1/5",
          method: "POST",
          "search-key": "Desc_AreaResponsabilidad",
          "label-key": "Desc_AreaResponsabilidad",
          "value-key": "Id_AreaResponsabilidad",
          "label-format": "{{Desc_AreaResponsabilidad}} - {{Id_AreaResponsabilidad}}",
          placeholder: "Buscar \xE1rea destino...",
          "direct-data": false,
          "data-key": "datos",
          "initial-label": areaDestinoInitialLabel.value,
          onEntidadSeleccionada: handleAreaSeleccionada
        }, null, _parent));
        _push(`<p class="text-xs text-gray-500 mt-1" data-v-117b390b>* Selecciona un \xE1rea espec\xEDfica para ver sus activos/\xFAtiles. Si dejas vac\xEDo se usar\xE1 tu \xE1rea por defecto.</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex justify-end mt-4 gap-2 flex-wrap" data-v-117b390b><button class="px-6 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] focus:ring-offset-2 transition-colors" data-v-117b390b> Buscar </button><button class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors" data-v-117b390b> Limpiar </button><button${ssrIncludeBooleanAttr(isLoading.value || totalItems.value === 0) ? " disabled" : ""} class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" data-v-117b390b><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-117b390b><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-117b390b></path></svg> Generar Reporte de Activos PDF </button><button${ssrIncludeBooleanAttr(isLoading.value || totalItems.value === 0) ? " disabled" : ""} class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" data-v-117b390b><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-117b390b><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" data-v-117b390b></path></svg> Generar QR por cada elemento </button></div></div></div><div class="w-[95%] mx-auto px-4 py-4" data-v-117b390b><div class="flex justify-between items-center mb-4" data-v-117b390b><h2 class="text-2xl font-bold text-[#077a99]" data-v-117b390b>${ssrInterpolate(tipoSeleccionado.value === "aft" ? "Activos Fijos" : "\xDAtiles")}</h2></div>`);
      _push(ssrRenderComponent(DataTable, {
        columns: columnasTabla.value,
        items: itemsData.value,
        "total-items": totalItems.value,
        "items-per-page": itemsPorPage.value,
        "current-page": currentPage.value,
        "is-loading": isLoading.value,
        onPageChange: handlePageChange
      }, null, _parent));
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/miarea.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const miarea = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-117b390b"]]);

export { miarea as default };
//# sourceMappingURL=miarea-C9Ueb8BV.mjs.map
