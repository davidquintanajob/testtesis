import { ref, watch, mergeProps, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate } from 'vue/server-renderer';
import { N as Navbar } from './Navbar-Ds5Ji1IO.mjs';
import { S as SeoMeta, _ as _sfc_main$2 } from './MessageBanner-C3gOLDB5.mjs';
import { D as DataTable, _ as _sfc_main$4 } from './SelectSearchAPI-w3fp5OUm.mjs';
import { _ as _sfc_main$3 } from './ConfirmBanner-D2jJGKTl.mjs';
import { u as useRuntimeConfig, n as navigateTo } from './server.mjs';
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

const _sfc_main$1 = {
  __name: "UsuarioModal",
  __ssrInlineRender: true,
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    usuario: {
      type: Object,
      default: () => ({})
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    isViewing: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:modelValue", "submit", "success"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const formData = ref({
      id_usuario_LDAP: "",
      id_AreaResponsabilidad: "",
      rol: "",
      activo: true,
      id_usuario_jefe: null
      // nuevo campo
    });
    const errorMsg = ref("");
    const isLoading = ref(false);
    const areaInitialLabel = ref("");
    const jefeInitialLabel = ref("");
    async function loadAreaDescription(areaId) {
      if (!areaId) return "";
      try {
        const token = localStorage.getItem("token");
        const config = useRuntimeConfig();
        const response = await fetch(`${config.public.backendHost}/areas/${areaId}`, {
          headers: { Authorization: token }
        });
        if (!response.ok) throw new Error("Error al cargar \xE1rea");
        const data = await response.json();
        return `${data.Desc_AreaResponsabilidad} - ${data.Id_AreaResponsabilidad}`;
      } catch (err) {
        console.error(err);
        return areaId;
      }
    }
    async function loadJefeDescription(usuarioId) {
      if (!usuarioId) return "";
      try {
        const token = localStorage.getItem("token");
        const config = useRuntimeConfig();
        const response = await fetch(`${config.public.backendHost}/usuarios/${usuarioId}`, {
          headers: { Authorization: token }
        });
        if (!response.ok) throw new Error("Error al cargar jefe");
        const data = await response.json();
        return `${data.id_usuario_LDAP} (ID: ${data.id_usuario})`;
      } catch (err) {
        console.error(err);
        return `ID: ${usuarioId}`;
      }
    }
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        errorMsg.value = "";
      }
    });
    watch(() => props.usuario, async (newUsuario) => {
      if (newUsuario && Object.keys(newUsuario).length > 0) {
        formData.value = {
          id_usuario_LDAP: newUsuario.id_usuario_LDAP || "",
          id_AreaResponsabilidad: newUsuario.id_AreaResponsabilidad || "",
          rol: newUsuario.rol || "",
          activo: newUsuario.activo !== void 0 ? newUsuario.activo : true,
          id_usuario_jefe: newUsuario.id_usuario_jefe || null
        };
        if (formData.value.id_AreaResponsabilidad) {
          areaInitialLabel.value = await loadAreaDescription(formData.value.id_AreaResponsabilidad);
        } else {
          areaInitialLabel.value = "";
        }
        if (formData.value.id_usuario_jefe) {
          jefeInitialLabel.value = await loadJefeDescription(formData.value.id_usuario_jefe);
        } else {
          jefeInitialLabel.value = "";
        }
      } else {
        formData.value = {
          id_usuario_LDAP: "",
          id_AreaResponsabilidad: "",
          rol: "",
          activo: true,
          id_usuario_jefe: null
        };
        areaInitialLabel.value = "";
        jefeInitialLabel.value = "";
      }
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.modelValue) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" }, _attrs))}><div class="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"><div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-bold text-gray-800">${ssrInterpolate(__props.isViewing ? "Detalles de Usuario" : __props.isEditing ? "Editar Usuario" : "Nuevo Usuario")}</h2><button class="text-gray-500 hover:text-gray-700"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><form class="space-y-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Usuario LDAP</label><input${ssrRenderAttr("value", formData.value.id_usuario_LDAP)} type="text" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" required${ssrIncludeBooleanAttr(__props.isViewing) ? " readonly" : ""}${ssrIncludeBooleanAttr(__props.isViewing || isLoading.value) ? " disabled" : ""} placeholder="nombre usuario"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">\xC1rea de Responsabilidad</label>`);
        if (!__props.isViewing) {
          _push(ssrRenderComponent(_sfc_main$4, {
            modelValue: formData.value.id_AreaResponsabilidad,
            "onUpdate:modelValue": ($event) => formData.value.id_AreaResponsabilidad = $event,
            multiple: false,
            endpoint: "/areas/filtrar/1/5",
            method: "POST",
            "search-key": "Desc_AreaResponsabilidad",
            "label-key": "Desc_AreaResponsabilidad",
            "value-key": "Id_AreaResponsabilidad",
            "label-format": "{{Desc_AreaResponsabilidad}} - {{Id_AreaResponsabilidad}}",
            placeholder: "Buscar \xE1rea de responsabilidad...",
            "direct-data": false,
            "data-key": "datos",
            "initial-label": areaInitialLabel.value,
            disabled: __props.isViewing || isLoading.value,
            required: ""
          }, null, _parent));
        } else {
          _push(`<div class="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100">${ssrInterpolate(areaInitialLabel.value || formData.value.id_AreaResponsabilidad || "No especificada")}</div>`);
        }
        _push(`</div><div><label class="block text-sm font-medium text-gray-700 mb-1">Rol</label><select class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]" required${ssrIncludeBooleanAttr(__props.isViewing || isLoading.value) ? " disabled" : ""}><option value=""${ssrIncludeBooleanAttr(Array.isArray(formData.value.rol) ? ssrLooseContain(formData.value.rol, "") : ssrLooseEqual(formData.value.rol, "")) ? " selected" : ""}>Seleccione un rol</option><option value="Responsable de \xC1rea"${ssrIncludeBooleanAttr(Array.isArray(formData.value.rol) ? ssrLooseContain(formData.value.rol, "Responsable de \xC1rea") : ssrLooseEqual(formData.value.rol, "Responsable de \xC1rea")) ? " selected" : ""}>Responsable de \xC1rea</option><option value="Administrador"${ssrIncludeBooleanAttr(Array.isArray(formData.value.rol) ? ssrLooseContain(formData.value.rol, "Administrador") : ssrLooseEqual(formData.value.rol, "Administrador")) ? " selected" : ""}>Administrador</option><option value="Jefe de \xC1rea"${ssrIncludeBooleanAttr(Array.isArray(formData.value.rol) ? ssrLooseContain(formData.value.rol, "Jefe de \xC1rea") : ssrLooseEqual(formData.value.rol, "Jefe de \xC1rea")) ? " selected" : ""}>Jefe de \xC1rea</option><option value="Especialista"${ssrIncludeBooleanAttr(Array.isArray(formData.value.rol) ? ssrLooseContain(formData.value.rol, "Especialista") : ssrLooseEqual(formData.value.rol, "Especialista")) ? " selected" : ""}>Especialista</option></select></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Jefe (usuario superior)</label>`);
        if (!__props.isViewing) {
          _push(ssrRenderComponent(_sfc_main$4, {
            modelValue: formData.value.id_usuario_jefe,
            "onUpdate:modelValue": ($event) => formData.value.id_usuario_jefe = $event,
            multiple: false,
            endpoint: "/usuarios/filtrar/1/5",
            method: "POST",
            "search-key": "id_usuario_LDAP",
            "label-key": "id_usuario_LDAP",
            "value-key": "id_usuario",
            "label-format": "{{id_usuario_LDAP}} (ID: {{id_usuario}})",
            placeholder: "Buscar usuario jefe por LDAP...",
            "direct-data": false,
            "data-key": "datos",
            "initial-label": jefeInitialLabel.value,
            disabled: __props.isViewing || isLoading.value
          }, null, _parent));
        } else {
          _push(`<div class="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100">${ssrInterpolate(jefeInitialLabel.value || "Sin jefe asignado")}</div>`);
        }
        _push(`</div>`);
        if (__props.isViewing || formData.value.activo !== void 0 && !__props.isEditing) {
          _push(`<div><label class="block text-sm font-medium text-gray-700 mb-1">Estado</label><div class="flex items-center">`);
          if (formData.value.activo) {
            _push(`<span class="px-3 py-2 rounded-lg bg-green-100 text-green-700 border border-green-400"> Activo </span>`);
          } else {
            _push(`<span class="px-3 py-2 rounded-lg bg-red-100 text-red-700 border border-red-400"> Inactivo </span>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (!__props.isViewing) {
          _push(`<div class="flex justify-end space-x-4 mt-6"><button type="button" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"${ssrIncludeBooleanAttr(isLoading.value) ? " disabled" : ""}> Cancelar </button><button type="submit" class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] disabled:opacity-50 disabled:cursor-not-allowed"${ssrIncludeBooleanAttr(isLoading.value) ? " disabled" : ""}>`);
          if (isLoading.value) {
            _push(`<span class="flex items-center"><svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ${ssrInterpolate(__props.isEditing ? "Guardando..." : "Creando...")}</span>`);
          } else {
            _push(`<span>${ssrInterpolate(__props.isEditing ? "Guardar Cambios" : "Crear Usuario")}</span>`);
          }
          _push(`</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</form>`);
        if (errorMsg.value) {
          _push(`<div class="text-red-600 text-sm mt-2">${ssrInterpolate(errorMsg.value)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/UsuarioModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "usuarios",
  __ssrInlineRender: true,
  setup(__props) {
    const config = useRuntimeConfig();
    const filtros = ref({
      id_usuario_LDAP: "",
      id_AreaResponsabilidad: "",
      rol: ""
    });
    const currentPage = ref(1);
    const itemsPorPage = ref(20);
    const totalItems = ref(0);
    const isLoading = ref(false);
    const itemsData = ref([]);
    const errorBanner = ref(null);
    const showModal = ref(false);
    const selectedUsuario = ref({});
    const isEditing = ref(false);
    const isViewing = ref(false);
    const showConfirmBanner = ref(false);
    const usuarioAEliminar = ref(null);
    const parseApiError = async (response) => {
      try {
        const data = await response.json();
        if (data.errors && Array.isArray(data.errors)) {
          return data.errors.join(". ");
        }
        if (data.message) return data.message;
        if (typeof data === "string") return data;
        return `Error ${response.status}: ${response.statusText}`;
      } catch {
        return `Error ${response.status}: ${response.statusText}`;
      }
    };
    const columnas = [
      { key: "id_usuario", label: "ID" },
      { key: "id_usuario_LDAP", label: "Usuario LDAP" },
      { key: "id_AreaResponsabilidad", label: "\xC1rea Responsabilidad" },
      { key: "rol", label: "Rol" },
      {
        key: "jefe_nombre",
        label: "Jefe",
        cellRenderer: (value) => value || "\u2014"
      },
      {
        key: "activo",
        label: "Estado",
        cellRenderer: (value) => {
          if (value === true || value === 1 || value === "true" || value === "1") {
            return '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Activo</span>';
          } else {
            return '<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Inactivo</span>';
          }
        }
      },
      {
        key: "acciones",
        label: "Acciones",
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
    const setupActionListeners = () => {
      nextTick(() => {
        (void 0).querySelectorAll(".editar-usuario-btn").forEach((btn) => {
          btn.removeEventListener("click", handleEditarClick);
          btn.addEventListener("click", handleEditarClick);
        });
        (void 0).querySelectorAll(".eliminar-usuario-btn").forEach((btn) => {
          btn.removeEventListener("click", handleEliminarClick);
          btn.addEventListener("click", handleEliminarClick);
        });
      });
    };
    const handleEditarClick = (event) => {
      event.stopPropagation();
      const id = event.currentTarget.getAttribute("data-id");
      const usuario = itemsData.value.find((u) => u.id_usuario == id);
      if (usuario) {
        selectedUsuario.value = { ...usuario };
        isEditing.value = true;
        isViewing.value = false;
        showModal.value = true;
      }
    };
    const handleEliminarClick = (event) => {
      event.stopPropagation();
      const id = event.currentTarget.getAttribute("data-id");
      const usuario = itemsData.value.find((u) => u.id_usuario == id);
      if (usuario) {
        usuarioAEliminar.value = usuario;
        showConfirmBanner.value = true;
      }
    };
    const fetchUsuarios = async (page = 1) => {
      const token = localStorage.getItem("token");
      if (!token) return navigateTo("/");
      isLoading.value = true;
      errorBanner.value = null;
      try {
        const body = {};
        if (filtros.value.id_usuario_LDAP) body.id_usuario_LDAP = filtros.value.id_usuario_LDAP;
        if (filtros.value.id_AreaResponsabilidad) body.id_AreaResponsabilidad = filtros.value.id_AreaResponsabilidad;
        if (filtros.value.rol) body.rol = filtros.value.rol;
        const res = await fetch(`${config.public.backendHost}/usuarios/filtrar/${page}/${itemsPorPage.value}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify(body)
        });
        if (res.status === 401) throw new Error("Sesi\xF3n expirada");
        if (res.status === 403) throw new Error("Acceso denegado");
        if (!res.ok) {
          const errorMsg = await parseApiError(res);
          throw new Error(errorMsg);
        }
        const data = await res.json();
        itemsData.value = data.datos.map((item) => {
          var _a;
          return {
            id_usuario: item.id_usuario,
            id_usuario_LDAP: item.id_usuario_LDAP,
            id_AreaResponsabilidad: item.id_AreaResponsabilidad,
            rol: item.rol,
            activo: item.activo,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            id_usuario_jefe: item.id_usuario_jefe || null,
            jefe_nombre: ((_a = item.jefe) == null ? void 0 : _a.id_usuario_LDAP) || null
            // asumiendo que la API devuelve objeto jefe anidado
          };
        });
        totalItems.value = data.total || 0;
        currentPage.value = data.pagina || page;
      } catch (err) {
        console.error(err);
        if (err.message === "Sesi\xF3n expirada") {
          errorBanner.value = { title: "Sesi\xF3n Expirada", description: "Redirigiendo al inicio...", type: "warning" };
          localStorage.removeItem("token");
          setTimeout(() => navigateTo("/"), 2e3);
        } else {
          errorBanner.value = { title: "Error", description: err.message, type: "error" };
        }
      } finally {
        isLoading.value = false;
        setupActionListeners();
      }
    };
    const handlePageChange = (page) => fetchUsuarios(page);
    const handleRowClick = (item) => {
      selectedUsuario.value = { ...item };
      isEditing.value = false;
      isViewing.value = true;
      showModal.value = true;
    };
    const handleSubmitUsuario = async (payload) => {
      const token = localStorage.getItem("token");
      if (!token) return;
      errorBanner.value = null;
      try {
        let response;
        if (isEditing.value && selectedUsuario.value.id_usuario) {
          response = await fetch(`${config.public.backendHost}/usuarios/${selectedUsuario.value.id_usuario}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify(payload)
          });
        } else {
          response = await fetch(`${config.public.backendHost}/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify(payload)
          });
        }
        if (!response.ok) {
          const errorMsg = await parseApiError(response);
          throw new Error(errorMsg);
        }
        errorBanner.value = {
          title: isEditing.value ? "Usuario actualizado" : "Usuario creado",
          description: "Operaci\xF3n exitosa",
          type: "success"
        };
        showModal.value = false;
        await fetchUsuarios(currentPage.value);
      } catch (err) {
        errorBanner.value = { title: "Error", description: err.message, type: "error" };
      }
    };
    const confirmarEliminar = async () => {
      if (!usuarioAEliminar.value) return;
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch(`${config.public.backendHost}/usuarios/${usuarioAEliminar.value.id_usuario}`, {
          method: "DELETE",
          headers: { Authorization: token }
        });
        if (!response.ok) {
          const errorMsg = await parseApiError(response);
          throw new Error(errorMsg);
        }
        errorBanner.value = { title: "\xC9xito", description: "Usuario eliminado correctamente", type: "success" };
        await fetchUsuarios(currentPage.value);
      } catch (err) {
        errorBanner.value = { title: "Error", description: err.message, type: "error" };
      } finally {
        showConfirmBanner.value = false;
        usuarioAEliminar.value = null;
      }
    };
    const refrescarLista = () => {
      fetchUsuarios(currentPage.value);
    };
    watch(() => itemsData.value, () => {
      setupActionListeners();
    }, { deep: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white" }, _attrs))}>`);
      _push(ssrRenderComponent(SeoMeta, {
        title: "Usuarios - AFTUP",
        description: "Gesti\xF3n de usuarios y roles.",
        canonical: "/usuarios"
      }, null, _parent));
      _push(ssrRenderComponent(Navbar, null, null, _parent));
      if (errorBanner.value) {
        _push(`<div class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none">`);
        _push(ssrRenderComponent(_sfc_main$2, {
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
      if (showConfirmBanner.value) {
        _push(`<div class="fixed top-24 left-1/2 transform -translate-x-1/2 z-[10000] w-full max-w-md px-4 pointer-events-auto">`);
        _push(ssrRenderComponent(_sfc_main$3, {
          title: "\xBFEst\xE1s seguro de eliminar este usuario?",
          description: "Esta acci\xF3n no se puede deshacer.",
          type: "warning",
          onConfirm: confirmarEliminar,
          onClose: ($event) => showConfirmBanner.value = false
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="w-[95%] mx-auto px-4 py-4 md:py-4 mt-20 md:mt-0"><div class="bg-white rounded-lg shadow-md p-4"><div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Usuario LDAP</label><input type="text"${ssrRenderAttr("value", filtros.value.id_usuario_LDAP)} placeholder="Ej: dqvaldes" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">\xC1rea de Responsabilidad</label><input type="text"${ssrRenderAttr("value", filtros.value.id_AreaResponsabilidad)} placeholder="C\xF3digo de \xE1rea" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Rol</label><select class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"><option value=""${ssrIncludeBooleanAttr(Array.isArray(filtros.value.rol) ? ssrLooseContain(filtros.value.rol, "") : ssrLooseEqual(filtros.value.rol, "")) ? " selected" : ""}>Todos</option><option value="Administrador"${ssrIncludeBooleanAttr(Array.isArray(filtros.value.rol) ? ssrLooseContain(filtros.value.rol, "Administrador") : ssrLooseEqual(filtros.value.rol, "Administrador")) ? " selected" : ""}>Administrador</option><option value="Comercial"${ssrIncludeBooleanAttr(Array.isArray(filtros.value.rol) ? ssrLooseContain(filtros.value.rol, "Comercial") : ssrLooseEqual(filtros.value.rol, "Comercial")) ? " selected" : ""}>Comercial</option><option value="Invitado"${ssrIncludeBooleanAttr(Array.isArray(filtros.value.rol) ? ssrLooseContain(filtros.value.rol, "Invitado") : ssrLooseEqual(filtros.value.rol, "Invitado")) ? " selected" : ""}>Invitado</option><option value="Vendedor"${ssrIncludeBooleanAttr(Array.isArray(filtros.value.rol) ? ssrLooseContain(filtros.value.rol, "Vendedor") : ssrLooseEqual(filtros.value.rol, "Vendedor")) ? " selected" : ""}>Vendedor</option></select></div></div><div class="flex justify-end gap-2 flex-wrap mt-4"><button class="px-6 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] focus:ring-offset-2 transition-colors"> Buscar </button><button class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"> Limpiar </button><button class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors"> Exportar a Excel </button></div></div></div><div class="w-[95%] mx-auto px-4 py-4"><div class="flex justify-between items-center mb-4"><h2 class="text-2xl font-bold text-[#077a99]">Usuarios</h2><button class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Nuevo Usuario </button></div>`);
      _push(ssrRenderComponent(DataTable, {
        columns: columnas,
        items: itemsData.value,
        "total-items": totalItems.value,
        "items-per-page": itemsPorPage.value,
        "current-page": currentPage.value,
        "is-loading": isLoading.value,
        onPageChange: handlePageChange,
        onRowClick: handleRowClick
      }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_sfc_main$1, {
        modelValue: showModal.value,
        "onUpdate:modelValue": ($event) => showModal.value = $event,
        usuario: selectedUsuario.value,
        "is-editing": isEditing.value,
        "is-viewing": isViewing.value,
        onSubmit: handleSubmitUsuario,
        onSuccess: refrescarLista
      }, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/usuarios.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=usuarios-BFece7G5.mjs.map
