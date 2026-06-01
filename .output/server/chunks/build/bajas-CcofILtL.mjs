import { ref, mergeProps, computed, reactive, watch, withCtx, createVNode, createBlock, createCommentVNode, openBlock, toDisplayString, Fragment, renderList, withDirectives, vModelText, vModelSelect, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderList, ssrLooseContain, ssrLooseEqual, ssrRenderStyle } from 'vue/server-renderer';
import { N as Navbar } from './Navbar-Ds5Ji1IO.mjs';
import { S as SeoMeta, _ as _sfc_main$4 } from './MessageBanner-C3gOLDB5.mjs';
import { D as DataTable, _ as _sfc_main$7 } from './SelectSearchAPI-w3fp5OUm.mjs';
import { _ as _sfc_main$1$1, a as _sfc_main$6 } from './Modal-DHe5Mkod.mjs';
import { _ as _sfc_main$5 } from './ConfirmBanner-D2jJGKTl.mjs';
import { _ as _export_sfc, u as useRuntimeConfig, n as navigateTo } from './server.mjs';
import { _ as _imports_0 } from './logo-B2DBqTv1.mjs';
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

const _sfc_main$3 = {
  __name: "BajaModal",
  __ssrInlineRender: true,
  props: {
    modelValue: Boolean,
    baja: { type: Object, default: () => ({}) },
    isEditing: { type: Boolean, default: false },
    isViewing: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "success"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const config = useRuntimeConfig();
    const dataLoading = ref(false);
    const isSubmitting = ref(false);
    const message = ref(null);
    const errorList = ref([]);
    const contentWrapper = ref(null);
    const selectElementoRef = ref(null);
    const elementoSeleccionadoTemp = ref(null);
    const usuarioLogueado = ref(null);
    const idAreaOrigen = ref("");
    const rolUsuario = ref("");
    const idUsuarioJefe = ref(null);
    const bajaData = ref({});
    const areaDesc = ref("");
    const usuarioCreadorNombre = ref("");
    const activosMostrar = ref([]);
    const usuariosMostrar = ref([]);
    const tiposMovimientoOptions = [
      { label: "Compra MB Nuevo", value: "Compra MB Nuevo" },
      { label: "Compra MB USO", value: "Compra MB USO" },
      { label: "Traspaso Recibido", value: "Traspaso Recibido" },
      { label: "Ajuste de inventario alta", value: "Ajuste de inventario alta" },
      { label: "Ajuste de Inventario Alta", value: "Ajuste de Inventario Alta" },
      { label: "P\xE9rdida", value: "P\xE9rdida" },
      { label: "Traspaso Efectuado", value: "Traspaso Efectuado" },
      { label: "Pr\xE9stamo temporal al trabajador", value: "Pr\xE9stamo temporal al trabajador" },
      { label: "Baja", value: "Baja" },
      { label: "Traslado interno", value: "Traslado interno" },
      { label: "Ajuste de Inv", value: "Ajuste de Inv" },
      { label: "Activo Ocioso", value: "Activo Ocioso" },
      { label: "Enviado a reparar", value: "Enviado a reparar" },
      { label: "Otro", value: "Otro" },
      { label: "Pr\xE9stamo fuera de la Entidad", value: "Pr\xE9stamo fuera de la Entidad" },
      { label: "Venta", value: "Venta" },
      { label: "Retiro", value: "Retiro" }
    ];
    const todasLasOpcionesEstado = [
      { label: "Pendiente", value: "Pendiente" },
      { label: "En Proceso", value: "En Proceso" },
      { label: "Aprobada", value: "Aprobada" },
      { label: "Rechazada", value: "Rechazada" },
      { label: "Cancelada", value: "Cancelada" },
      { label: "Completada", value: "Completada" }
    ];
    const estadoOptionsDisponibles = computed(() => {
      if (rolUsuario.value === "Responsable de \xC1rea") {
        return todasLasOpcionesEstado.filter((opt) => opt.value === "Pendiente");
      } else if (rolUsuario.value === "Jefe de \xC1rea") {
        return todasLasOpcionesEstado.filter((opt) => ["Pendiente", "En Proceso", "Rechazada"].includes(opt.value));
      } else {
        return todasLasOpcionesEstado;
      }
    });
    const isEstadoDisabled = computed(() => {
      if (rolUsuario.value === "Responsable de \xC1rea") return true;
      if (rolUsuario.value === "Jefe de \xC1rea" && props.isEditing) return true;
      return false;
    });
    const form = reactive({
      nota: "",
      motivo: "",
      tipo_traslado: "aft",
      tipo_movimiento: "",
      fundamentacion: "",
      estado: "Pendiente",
      id_AreaResponsabilidad: "",
      usuarios_list: [],
      lista_activos: []
    });
    const tipoElementoLabel = computed(() => form.tipo_traslado === "aft" ? "Activo Fijo" : "\xDAtil");
    const endpointElementos = computed(() => form.tipo_traslado === "aft" ? "/aft/filtrar/1/5" : "/utiles/filtrar/1/5");
    const searchKeyElementos = computed(() => form.tipo_traslado === "aft" ? "Desc_ActivoFijo" : "Desc_UH");
    const labelKeyElementos = computed(() => form.tipo_traslado === "aft" ? "Desc_ActivoFijo" : "Desc_UH");
    const valueKeyElementos = computed(() => form.tipo_traslado === "aft" ? "Id_ActivoFijo" : "Id_UH");
    const idAreaResponsabilidad = computed(() => {
      var _a, _b;
      return ((_b = (_a = usuarioLogueado.value) == null ? void 0 : _a.id_AreaResponsabilidad) == null ? void 0 : _b.trim()) || "";
    });
    async function cargarUsuarios() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No hay token de autenticaci\xF3n");
        const url = `${config.public.backendHost}/usuarios/filtrar/1/999999`;
        const resEspecialistas = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ rol: "Especialista" })
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
        const usuariosMap = /* @__PURE__ */ new Map();
        especialistas.forEach((u) => {
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
            title: "Sin usuarios",
            description: "No se encontraron especialistas ni jefe para asociar a la baja.",
            type: "warning"
          };
        }
      } catch (err) {
        console.error("[BajaModal] Error cargando usuarios:", err);
        message.value = {
          title: "Error al cargar usuarios",
          description: err.message || "No se pudieron cargar los usuarios",
          type: "error"
        };
        throw err;
      }
    }
    async function cargarArea(idArea) {
      if (!idArea) return "";
      try {
        const token = localStorage.getItem("token");
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
      var _a, _b;
      try {
        const token = localStorage.getItem("token");
        const endpoint = tipo === "aft" ? `/aft/${id}` : `/utiles/${id}`;
        const res = await fetch(`${config.public.backendHost}${endpoint}`, {
          headers: { Authorization: token }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (tipo === "aft") {
          return { id: (_a = data.Id_ActivoFijo) == null ? void 0 : _a.trim(), descripcion: data.Desc_ActivoFijo };
        } else {
          return { id: (_b = data.Id_UH) == null ? void 0 : _b.trim(), descripcion: data.Desc_UH };
        }
      } catch {
        return { id, descripcion: id };
      }
    }
    async function cargarDatosComplementarios(baja) {
      var _a, _b;
      if (!baja || Object.keys(baja).length === 0) return;
      if (baja.id_AreaResponsabilidad) {
        areaDesc.value = await cargarArea(baja.id_AreaResponsabilidad);
      }
      if (((_a = baja.solicitud) == null ? void 0 : _a.usuarios) && baja.solicitud.usuarios.length) {
        usuarioCreadorNombre.value = baja.solicitud.usuarios[0].id_usuario_LDAP || baja.solicitud.usuarios[0].id_usuario;
        usuariosMostrar.value = baja.solicitud.usuarios;
      }
      const tipo = ((_b = baja.solicitud) == null ? void 0 : _b.tipo_traslado) || "aft";
      const detalles = baja.detalles || [];
      const elementosPromises = detalles.map((d) => cargarElementoPorId(tipo, d.id_activoFijo_o_util));
      activosMostrar.value = await Promise.all(elementosPromises);
    }
    async function loadExistingData(baja) {
      var _a, _b, _c, _d, _e, _f, _g;
      if (!baja || Object.keys(baja).length === 0) return;
      dataLoading.value = true;
      try {
        bajaData.value = baja;
        await cargarDatosComplementarios(baja);
        if (!props.isViewing || props.isEditing) {
          form.nota = ((_a = baja.solicitud) == null ? void 0 : _a.nota) || "";
          form.motivo = baja.motivo || "";
          form.tipo_traslado = ((_b = baja.solicitud) == null ? void 0 : _b.tipo_traslado) || "aft";
          form.tipo_movimiento = ((_c = baja.solicitud) == null ? void 0 : _c.tipo_movimiento) || "";
          form.fundamentacion = ((_d = baja.solicitud) == null ? void 0 : _d.fundamentacion) || "";
          form.estado = ((_e = baja.solicitud) == null ? void 0 : _e.estado) || "Pendiente";
          form.id_AreaResponsabilidad = ((_f = baja.id_AreaResponsabilidad) == null ? void 0 : _f.trim()) || idAreaOrigen.value;
          const tipo = ((_g = baja.solicitud) == null ? void 0 : _g.tipo_traslado) || "aft";
          const detalles = baja.detalles || [];
          const elementosPromises = detalles.map(async (d) => {
            const elem = await cargarElementoPorId(tipo, d.id_activoFijo_o_util);
            return { id: elem.id, label: `${elem.id}: ${elem.descripcion}` };
          });
          form.lista_activos = await Promise.all(elementosPromises);
        }
      } catch (err) {
        console.error("Error cargando datos de la baja:", err);
        message.value = { title: "Error", description: "No se pudieron cargar los datos", type: "error" };
      } finally {
        dataLoading.value = false;
      }
    }
    function resetFormFields() {
      form.nota = "";
      form.motivo = "";
      form.tipo_traslado = "aft";
      form.tipo_movimiento = "";
      form.fundamentacion = "";
      form.estado = "Pendiente";
      form.id_AreaResponsabilidad = idAreaOrigen.value;
      form.lista_activos = [];
      errorList.value = [];
      areaDesc.value = "";
      usuarioCreadorNombre.value = "";
      activosMostrar.value = [];
      usuariosMostrar.value = [];
      bajaData.value = {};
      message.value = null;
    }
    function getUsuariosIds() {
      return form.usuarios_list.map((item) => item.id);
    }
    function getListaActivosIds() {
      return form.lista_activos.map((item) => item.id);
    }
    function agregarElementoSeleccionado(option) {
      if (!option) return;
      const id = option[valueKeyElementos.value];
      const desc = option[labelKeyElementos.value];
      const label = `${id}: ${desc}`;
      if (!form.lista_activos.some((item) => item.id === id)) {
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
      emit("update:modelValue", false);
      setTimeout(() => {
        emit("update:modelValue", true);
      }, 200);
    }
    async function onSubmit() {
      var _a;
      errorList.value = [];
      if (!form.motivo) errorList.value.push("Debe ingresar un motivo");
      if (form.lista_activos.length === 0) errorList.value.push("Debe agregar al menos un elemento (AFT o \xDAtil)");
      if (form.usuarios_list.length === 0) errorList.value.push("Debe haber al menos un usuario involucrado");
      if (errorList.value.length) return;
      const usuarioCreador = ((_a = usuarioLogueado.value) == null ? void 0 : _a.id_usuario) || null;
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
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No hay sesi\xF3n activa");
        let url, method;
        if (props.isEditing && bajaData.value.id_solicitud) {
          url = `${config.public.backendHost}/bajas/${bajaData.value.id_solicitud}`;
          method = "PUT";
        } else {
          url = `${config.public.backendHost}/bajas`;
          method = "POST";
        }
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          let errorMessage = `Error ${response.status}`;
          try {
            const errData = await response.json();
            if (errData.error) {
              errorMessage = errData.error;
            } else if (errData.message) {
              errorMessage = errData.message;
            } else {
              errorMessage = JSON.stringify(errData);
            }
          } catch {
            errorMessage = await response.text().catch(() => errorMessage);
          }
          throw new Error(errorMessage);
        }
        message.value = {
          title: props.isEditing ? "Baja actualizada" : "Baja creada",
          description: "Operaci\xF3n exitosa",
          type: "success"
        };
        emit("success");
        setTimeout(() => {
          emit("update:modelValue", false);
        }, 1500);
      } catch (err) {
        console.error("Error en submit:", err);
        message.value = {
          title: "Error",
          description: err.message,
          type: "error"
        };
      } finally {
        isSubmitting.value = false;
      }
    }
    function onRequestClose() {
      if (dataLoading.value || isSubmitting.value) return;
      emit("update:modelValue", false);
    }
    function cargarUsuarioLocal() {
      var _a, _b, _c, _d;
      try {
        const userStr = localStorage.getItem("usuario");
        if (userStr) {
          usuarioLogueado.value = JSON.parse(userStr);
          idAreaOrigen.value = ((_b = (_a = usuarioLogueado.value) == null ? void 0 : _a.id_AreaResponsabilidad) == null ? void 0 : _b.trim()) || "";
          rolUsuario.value = ((_c = usuarioLogueado.value) == null ? void 0 : _c.rol) || "";
          idUsuarioJefe.value = ((_d = usuarioLogueado.value) == null ? void 0 : _d.id_usuario_jefe) || null;
          form.id_AreaResponsabilidad = idAreaOrigen.value;
          if (rolUsuario.value === "Responsable de \xC1rea") {
            form.estado = "Pendiente";
          }
        }
      } catch (e) {
        console.warn("Error al leer usuario:", e);
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
          console.error("[BajaModal] Error en inicializaci\xF3n:", err);
        } finally {
          dataLoading.value = false;
        }
      }
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$6, mergeProps({
        show: __props.modelValue,
        onClose: onRequestClose,
        size: "3xl"
      }, _attrs), {
        title: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3 class="text-lg font-semibold text-gray-900"${_scopeId}>${ssrInterpolate(__props.isViewing ? "Detalles de la Baja" : __props.isEditing ? "Editar Baja" : "Nueva Baja")}</h3>`);
          } else {
            return [
              createVNode("h3", { class: "text-lg font-semibold text-gray-900" }, toDisplayString(__props.isViewing ? "Detalles de la Baja" : __props.isEditing ? "Editar Baja" : "Nueva Baja"), 1)
            ];
          }
        }),
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
          if (_push2) {
            _push2(`<div class="${ssrRenderClass(["transition-opacity", (dataLoading.value || isSubmitting.value) && "pointer-events-none opacity-50"])}"${_scopeId}>`);
            if (dataLoading.value) {
              _push2(`<div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"${_scopeId}><div class="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4"${_scopeId}><div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"${_scopeId}></div><p class="text-gray-700 font-medium"${_scopeId}>Cargando datos...</p></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (isSubmitting.value) {
              _push2(`<div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"${_scopeId}><div class="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4"${_scopeId}><div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"${_scopeId}></div><p class="text-gray-700 font-medium"${_scopeId}>${ssrInterpolate(__props.isEditing ? "Actualizando baja..." : "Creando baja...")}</p></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (message.value) {
              _push2(`<div class="mb-4"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$4, {
                title: message.value.title,
                description: message.value.description,
                type: message.value.type,
                onClose: ($event) => message.value = null
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.isViewing && !__props.isEditing) {
              _push2(`<div class="space-y-6"${_scopeId}><div class="bg-gray-50 rounded-lg p-4"${_scopeId}><h4 class="text-md font-medium text-gray-900 mb-3"${_scopeId}>Informaci\xF3n General</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-4"${_scopeId}><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>ID Solicitud</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(bajaData.value.id_solicitud || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Nota</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(((_a = bajaData.value.solicitud) == null ? void 0 : _a.nota) || "Sin nota")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Motivo</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(bajaData.value.motivo || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Tipo Traslado</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(((_b = bajaData.value.solicitud) == null ? void 0 : _b.tipo_traslado) || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Tipo Movimiento</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(((_c = bajaData.value.solicitud) == null ? void 0 : _c.tipo_movimiento) || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Fundamentaci\xF3n</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(((_d = bajaData.value.solicitud) == null ? void 0 : _d.fundamentacion) || "Sin fundamentaci\xF3n")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Estado</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(((_e = bajaData.value.solicitud) == null ? void 0 : _e.estado) || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>\xC1rea Responsabilidad</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(areaDesc.value || bajaData.value.id_AreaResponsabilidad || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Usuario Creador</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(usuarioCreadorNombre.value || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Fecha Creaci\xF3n</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(bajaData.value.createdAt ? new Date(bajaData.value.createdAt).toLocaleString() : "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Fecha Cierre</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(((_f = bajaData.value.solicitud) == null ? void 0 : _f.fecha_hora_cierreSolicitud) ? new Date(bajaData.value.solicitud.fecha_hora_cierreSolicitud).toLocaleString() : "No cerrada")}</p></div></div></div><div class="bg-blue-50 rounded-lg p-4"${_scopeId}><h4 class="text-md font-medium text-gray-900 mb-3"${_scopeId}>Usuarios Involucrados</h4>`);
              if (usuariosMostrar.value.length) {
                _push2(`<div class="flex flex-wrap gap-2"${_scopeId}><!--[-->`);
                ssrRenderList(usuariosMostrar.value, (u) => {
                  _push2(`<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"${_scopeId}>${ssrInterpolate(u.id_usuario_LDAP || u.nombre_usuario || u.id_usuario)}</span>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="text-sm text-gray-500"${_scopeId}>No hay usuarios asociados</p>`);
              }
              _push2(`</div><div class="bg-green-50 rounded-lg p-4"${_scopeId}><h4 class="text-md font-medium text-gray-900 mb-3"${_scopeId}>Activos Fijos / \xDAtiles dados de baja</h4>`);
              if (activosMostrar.value.length) {
                _push2(`<div class="flex flex-wrap gap-2"${_scopeId}><!--[-->`);
                ssrRenderList(activosMostrar.value, (item) => {
                  _push2(`<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"${_scopeId}>${ssrInterpolate(item.descripcion)}</span>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="text-sm text-gray-500"${_scopeId}>No hay elementos asociados</p>`);
              }
              _push2(`</div>`);
              if (((_g = bajaData.value.solicitud) == null ? void 0 : _g.estado) !== "Completada" && bajaData.value.estado !== "Completada") {
                _push2(`<div class="flex justify-end"${_scopeId}><button class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99]"${_scopeId}>Editar Baja</button></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<div class="space-y-6"${_scopeId}><div class="grid grid-cols-1 md:grid-cols-2 gap-4"${_scopeId}><div class="md:col-span-2"${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Nota</label><textarea rows="3" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Motivo de la baja..."${_scopeId}>${ssrInterpolate(form.nota)}</textarea></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Motivo (breve)</label><input type="text"${ssrRenderAttr("value", form.motivo)} class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ej: Equipo obsoleto, Robo, etc."${_scopeId}></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Tipo Traslado</label><select class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"${_scopeId}><option value="aft"${ssrIncludeBooleanAttr(Array.isArray(form.tipo_traslado) ? ssrLooseContain(form.tipo_traslado, "aft") : ssrLooseEqual(form.tipo_traslado, "aft")) ? " selected" : ""}${_scopeId}>Activo Fijo Tangible (AFT)</option><option value="util"${ssrIncludeBooleanAttr(Array.isArray(form.tipo_traslado) ? ssrLooseContain(form.tipo_traslado, "util") : ssrLooseEqual(form.tipo_traslado, "util")) ? " selected" : ""}${_scopeId}>\xDAtil</option></select></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Tipo Movimiento</label>`);
              _push2(ssrRenderComponent(_sfc_main$1$1, {
                modelValue: form.tipo_movimiento,
                "onUpdate:modelValue": ($event) => form.tipo_movimiento = $event,
                options: tiposMovimientoOptions,
                "label-key": "label",
                "value-key": "value",
                placeholder: "Seleccionar tipo de movimiento..."
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="md:col-span-2"${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Fundamentaci\xF3n</label><textarea rows="2" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Justificaci\xF3n o fundamentaci\xF3n de la baja..."${_scopeId}>${ssrInterpolate(form.fundamentacion)}</textarea></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Estado</label><select${ssrIncludeBooleanAttr(isEstadoDisabled.value) ? " disabled" : ""} class="${ssrRenderClass([{ "bg-gray-100 cursor-not-allowed": isEstadoDisabled.value }, "w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"])}"${_scopeId}><!--[-->`);
              ssrRenderList(estadoOptionsDisponibles.value, (opt) => {
                _push2(`<option${ssrRenderAttr("value", opt.value)}${ssrIncludeBooleanAttr(Array.isArray(form.estado) ? ssrLooseContain(form.estado, opt.value) : ssrLooseEqual(form.estado, opt.value)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(opt.label)}</option>`);
              });
              _push2(`<!--]--></select>`);
              if (isEstadoDisabled.value && rolUsuario.value === "Responsable de \xC1rea") {
                _push2(`<p class="text-xs text-gray-500 mt-1"${_scopeId}>El estado solo puede ser Pendiente para tu rol.</p>`);
              } else {
                _push2(`<!---->`);
              }
              if (isEstadoDisabled.value && rolUsuario.value === "Jefe de \xC1rea" && __props.isEditing) {
                _push2(`<p class="text-xs text-gray-500 mt-1"${_scopeId}>No puedes cambiar el estado de una solicitud ya creada.</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>\xC1rea Responsabilidad</label><input type="text"${ssrRenderAttr("value", form.id_AreaResponsabilidad)} readonly disabled class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"${_scopeId}></div><div class="md:col-span-2"${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Usuarios Involucrados</label>`);
              if (form.usuarios_list.length) {
                _push2(`<div class="border rounded-lg divide-y max-h-48 overflow-y-auto"${_scopeId}><!--[-->`);
                ssrRenderList(form.usuarios_list, (item, idx) => {
                  _push2(`<div class="flex justify-between items-center p-2 hover:bg-gray-50"${_scopeId}><span${_scopeId}>${ssrInterpolate(item.label)}</span></div>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="text-sm text-gray-500 italic mt-1"${_scopeId}>Cargando usuarios...</p>`);
              }
              _push2(`</div><div class="md:col-span-2"${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Elementos a dar de baja (${ssrInterpolate(tipoElementoLabel.value)})</label><div class="flex gap-2 mb-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$7, {
                ref_key: "selectElementoRef",
                ref: selectElementoRef,
                modelValue: elementoSeleccionadoTemp.value,
                "onUpdate:modelValue": ($event) => elementoSeleccionadoTemp.value = $event,
                multiple: false,
                endpoint: endpointElementos.value,
                method: "POST",
                "search-key": searchKeyElementos.value,
                "label-key": labelKeyElementos.value,
                "value-key": valueKeyElementos.value,
                "extra-body-params": { ID_AreaResp: idAreaResponsabilidad.value },
                placeholder: `Buscar ${tipoElementoLabel.value}...`,
                "direct-data": false,
                "data-key": "datos",
                onEntidadSeleccionada: agregarElementoSeleccionado
              }, null, _parent2, _scopeId));
              _push2(`<button type="button"${ssrIncludeBooleanAttr(!elementoSeleccionadoTemp.value) ? " disabled" : ""} class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] disabled:opacity-50"${_scopeId}> Agregar </button></div>`);
              if (form.lista_activos.length) {
                _push2(`<div class="border rounded-lg divide-y max-h-48 overflow-y-auto"${_scopeId}><!--[-->`);
                ssrRenderList(form.lista_activos, (item, idx) => {
                  _push2(`<div class="flex justify-between items-center p-2 hover:bg-gray-50"${_scopeId}><span${_scopeId}>${ssrInterpolate(item.label)}</span><button type="button" class="text-red-500 hover:text-red-700"${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"${_scopeId}><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"${_scopeId}></path></svg></button></div>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="text-sm text-gray-500 italic mt-1"${_scopeId}>No hay elementos agregados.</p>`);
              }
              _push2(`</div></div>`);
              if (errorList.value.length) {
                _push2(`<div class="bg-red-50 border border-red-200 text-red-700 p-3 rounded"${_scopeId}><!--[-->`);
                ssrRenderList(errorList.value, (e, idx) => {
                  _push2(`<div${_scopeId}>${ssrInterpolate(e)}</div>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", {
                ref_key: "contentWrapper",
                ref: contentWrapper,
                class: ["transition-opacity", (dataLoading.value || isSubmitting.value) && "pointer-events-none opacity-50"]
              }, [
                dataLoading.value ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
                }, [
                  createVNode("div", { class: "bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4" }, [
                    createVNode("div", { class: "w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin" }),
                    createVNode("p", { class: "text-gray-700 font-medium" }, "Cargando datos...")
                  ])
                ])) : createCommentVNode("", true),
                isSubmitting.value ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
                }, [
                  createVNode("div", { class: "bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4" }, [
                    createVNode("div", { class: "w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin" }),
                    createVNode("p", { class: "text-gray-700 font-medium" }, toDisplayString(__props.isEditing ? "Actualizando baja..." : "Creando baja..."), 1)
                  ])
                ])) : createCommentVNode("", true),
                message.value ? (openBlock(), createBlock("div", {
                  key: 2,
                  class: "mb-4"
                }, [
                  createVNode(_sfc_main$4, {
                    title: message.value.title,
                    description: message.value.description,
                    type: message.value.type,
                    onClose: ($event) => message.value = null
                  }, null, 8, ["title", "description", "type", "onClose"])
                ])) : createCommentVNode("", true),
                __props.isViewing && !__props.isEditing ? (openBlock(), createBlock("div", {
                  key: 3,
                  class: "space-y-6"
                }, [
                  createVNode("div", { class: "bg-gray-50 rounded-lg p-4" }, [
                    createVNode("h4", { class: "text-md font-medium text-gray-900 mb-3" }, "Informaci\xF3n General"),
                    createVNode("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-4" }, [
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "ID Solicitud"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(bajaData.value.id_solicitud || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Nota"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(((_h = bajaData.value.solicitud) == null ? void 0 : _h.nota) || "Sin nota"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Motivo"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(bajaData.value.motivo || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Tipo Traslado"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(((_i = bajaData.value.solicitud) == null ? void 0 : _i.tipo_traslado) || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Tipo Movimiento"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(((_j = bajaData.value.solicitud) == null ? void 0 : _j.tipo_movimiento) || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Fundamentaci\xF3n"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(((_k = bajaData.value.solicitud) == null ? void 0 : _k.fundamentacion) || "Sin fundamentaci\xF3n"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Estado"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(((_l = bajaData.value.solicitud) == null ? void 0 : _l.estado) || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "\xC1rea Responsabilidad"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(areaDesc.value || bajaData.value.id_AreaResponsabilidad || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Usuario Creador"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(usuarioCreadorNombre.value || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Fecha Creaci\xF3n"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(bajaData.value.createdAt ? new Date(bajaData.value.createdAt).toLocaleString() : "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Fecha Cierre"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(((_m = bajaData.value.solicitud) == null ? void 0 : _m.fecha_hora_cierreSolicitud) ? new Date(bajaData.value.solicitud.fecha_hora_cierreSolicitud).toLocaleString() : "No cerrada"), 1)
                      ])
                    ])
                  ]),
                  createVNode("div", { class: "bg-blue-50 rounded-lg p-4" }, [
                    createVNode("h4", { class: "text-md font-medium text-gray-900 mb-3" }, "Usuarios Involucrados"),
                    usuariosMostrar.value.length ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "flex flex-wrap gap-2"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(usuariosMostrar.value, (u) => {
                        return openBlock(), createBlock("span", {
                          key: u.id_usuario,
                          class: "bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        }, toDisplayString(u.id_usuario_LDAP || u.nombre_usuario || u.id_usuario), 1);
                      }), 128))
                    ])) : (openBlock(), createBlock("p", {
                      key: 1,
                      class: "text-sm text-gray-500"
                    }, "No hay usuarios asociados"))
                  ]),
                  createVNode("div", { class: "bg-green-50 rounded-lg p-4" }, [
                    createVNode("h4", { class: "text-md font-medium text-gray-900 mb-3" }, "Activos Fijos / \xDAtiles dados de baja"),
                    activosMostrar.value.length ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "flex flex-wrap gap-2"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(activosMostrar.value, (item) => {
                        return openBlock(), createBlock("span", {
                          key: item.id,
                          class: "bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                        }, toDisplayString(item.descripcion), 1);
                      }), 128))
                    ])) : (openBlock(), createBlock("p", {
                      key: 1,
                      class: "text-sm text-gray-500"
                    }, "No hay elementos asociados"))
                  ]),
                  ((_n = bajaData.value.solicitud) == null ? void 0 : _n.estado) !== "Completada" && bajaData.value.estado !== "Completada" ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "flex justify-end"
                  }, [
                    createVNode("button", {
                      onClick: enableEditMode,
                      class: "px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99]"
                    }, "Editar Baja")
                  ])) : createCommentVNode("", true)
                ])) : (openBlock(), createBlock("div", {
                  key: 4,
                  class: "space-y-6"
                }, [
                  createVNode("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-4" }, [
                    createVNode("div", { class: "md:col-span-2" }, [
                      createVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "Nota"),
                      withDirectives(createVNode("textarea", {
                        "onUpdate:modelValue": ($event) => form.nota = $event,
                        rows: "3",
                        class: "w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary",
                        placeholder: "Motivo de la baja..."
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, form.nota]
                      ])
                    ]),
                    createVNode("div", null, [
                      createVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "Motivo (breve)"),
                      withDirectives(createVNode("input", {
                        type: "text",
                        "onUpdate:modelValue": ($event) => form.motivo = $event,
                        class: "w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary",
                        placeholder: "Ej: Equipo obsoleto, Robo, etc."
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, form.motivo]
                      ])
                    ]),
                    createVNode("div", null, [
                      createVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "Tipo Traslado"),
                      withDirectives(createVNode("select", {
                        "onUpdate:modelValue": ($event) => form.tipo_traslado = $event,
                        class: "w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      }, [
                        createVNode("option", { value: "aft" }, "Activo Fijo Tangible (AFT)"),
                        createVNode("option", { value: "util" }, "\xDAtil")
                      ], 8, ["onUpdate:modelValue"]), [
                        [vModelSelect, form.tipo_traslado]
                      ])
                    ]),
                    createVNode("div", null, [
                      createVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "Tipo Movimiento"),
                      createVNode(_sfc_main$1$1, {
                        modelValue: form.tipo_movimiento,
                        "onUpdate:modelValue": ($event) => form.tipo_movimiento = $event,
                        options: tiposMovimientoOptions,
                        "label-key": "label",
                        "value-key": "value",
                        placeholder: "Seleccionar tipo de movimiento..."
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    createVNode("div", { class: "md:col-span-2" }, [
                      createVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "Fundamentaci\xF3n"),
                      withDirectives(createVNode("textarea", {
                        "onUpdate:modelValue": ($event) => form.fundamentacion = $event,
                        rows: "2",
                        class: "w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary",
                        placeholder: "Justificaci\xF3n o fundamentaci\xF3n de la baja..."
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, form.fundamentacion]
                      ])
                    ]),
                    createVNode("div", null, [
                      createVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "Estado"),
                      withDirectives(createVNode("select", {
                        "onUpdate:modelValue": ($event) => form.estado = $event,
                        disabled: isEstadoDisabled.value,
                        class: ["w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary", { "bg-gray-100 cursor-not-allowed": isEstadoDisabled.value }]
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(estadoOptionsDisponibles.value, (opt) => {
                          return openBlock(), createBlock("option", {
                            key: opt.value,
                            value: opt.value
                          }, toDisplayString(opt.label), 9, ["value"]);
                        }), 128))
                      ], 10, ["onUpdate:modelValue", "disabled"]), [
                        [vModelSelect, form.estado]
                      ]),
                      isEstadoDisabled.value && rolUsuario.value === "Responsable de \xC1rea" ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "text-xs text-gray-500 mt-1"
                      }, "El estado solo puede ser Pendiente para tu rol.")) : createCommentVNode("", true),
                      isEstadoDisabled.value && rolUsuario.value === "Jefe de \xC1rea" && __props.isEditing ? (openBlock(), createBlock("p", {
                        key: 1,
                        class: "text-xs text-gray-500 mt-1"
                      }, "No puedes cambiar el estado de una solicitud ya creada.")) : createCommentVNode("", true)
                    ]),
                    createVNode("div", null, [
                      createVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "\xC1rea Responsabilidad"),
                      withDirectives(createVNode("input", {
                        type: "text",
                        "onUpdate:modelValue": ($event) => form.id_AreaResponsabilidad = $event,
                        readonly: "",
                        disabled: "",
                        class: "w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, form.id_AreaResponsabilidad]
                      ])
                    ]),
                    createVNode("div", { class: "md:col-span-2" }, [
                      createVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "Usuarios Involucrados"),
                      form.usuarios_list.length ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "border rounded-lg divide-y max-h-48 overflow-y-auto"
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(form.usuarios_list, (item, idx) => {
                          return openBlock(), createBlock("div", {
                            key: item.id,
                            class: "flex justify-between items-center p-2 hover:bg-gray-50"
                          }, [
                            createVNode("span", null, toDisplayString(item.label), 1)
                          ]);
                        }), 128))
                      ])) : (openBlock(), createBlock("p", {
                        key: 1,
                        class: "text-sm text-gray-500 italic mt-1"
                      }, "Cargando usuarios..."))
                    ]),
                    createVNode("div", { class: "md:col-span-2" }, [
                      createVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "Elementos a dar de baja (" + toDisplayString(tipoElementoLabel.value) + ")", 1),
                      createVNode("div", { class: "flex gap-2 mb-2" }, [
                        createVNode(_sfc_main$7, {
                          ref_key: "selectElementoRef",
                          ref: selectElementoRef,
                          modelValue: elementoSeleccionadoTemp.value,
                          "onUpdate:modelValue": ($event) => elementoSeleccionadoTemp.value = $event,
                          multiple: false,
                          endpoint: endpointElementos.value,
                          method: "POST",
                          "search-key": searchKeyElementos.value,
                          "label-key": labelKeyElementos.value,
                          "value-key": valueKeyElementos.value,
                          "extra-body-params": { ID_AreaResp: idAreaResponsabilidad.value },
                          placeholder: `Buscar ${tipoElementoLabel.value}...`,
                          "direct-data": false,
                          "data-key": "datos",
                          onEntidadSeleccionada: agregarElementoSeleccionado
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "endpoint", "search-key", "label-key", "value-key", "extra-body-params", "placeholder"]),
                        createVNode("button", {
                          type: "button",
                          onClick: agregarElementoActual,
                          disabled: !elementoSeleccionadoTemp.value,
                          class: "px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] disabled:opacity-50"
                        }, " Agregar ", 8, ["disabled"])
                      ]),
                      form.lista_activos.length ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "border rounded-lg divide-y max-h-48 overflow-y-auto"
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(form.lista_activos, (item, idx) => {
                          return openBlock(), createBlock("div", {
                            key: item.id,
                            class: "flex justify-between items-center p-2 hover:bg-gray-50"
                          }, [
                            createVNode("span", null, toDisplayString(item.label), 1),
                            createVNode("button", {
                              type: "button",
                              onClick: ($event) => eliminarElemento(idx),
                              class: "text-red-500 hover:text-red-700"
                            }, [
                              (openBlock(), createBlock("svg", {
                                xmlns: "http://www.w3.org/2000/svg",
                                class: "h-5 w-5",
                                viewBox: "0 0 20 20",
                                fill: "currentColor"
                              }, [
                                createVNode("path", {
                                  "fill-rule": "evenodd",
                                  d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                })
                              ]))
                            ], 8, ["onClick"])
                          ]);
                        }), 128))
                      ])) : (openBlock(), createBlock("p", {
                        key: 1,
                        class: "text-sm text-gray-500 italic mt-1"
                      }, "No hay elementos agregados."))
                    ])
                  ]),
                  errorList.value.length ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "bg-red-50 border border-red-200 text-red-700 p-3 rounded"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(errorList.value, (e, idx) => {
                      return openBlock(), createBlock("div", { key: idx }, toDisplayString(e), 1);
                    }), 128))
                  ])) : createCommentVNode("", true)
                ]))
              ], 2)
            ];
          }
        }),
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex justify-end gap-2"${_scopeId}>`);
            if (!__props.isViewing || __props.isEditing) {
              _push2(`<button${ssrIncludeBooleanAttr(dataLoading.value || isSubmitting.value) ? " disabled" : ""} class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] disabled:opacity-50"${_scopeId}>${ssrInterpolate(__props.isEditing ? "Guardar" : "Crear")}</button>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button${ssrIncludeBooleanAttr(dataLoading.value || isSubmitting.value) ? " disabled" : ""} class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"${_scopeId}>Cerrar</button></div>`);
          } else {
            return [
              createVNode("div", { class: "flex justify-end gap-2" }, [
                !__props.isViewing || __props.isEditing ? (openBlock(), createBlock("button", {
                  key: 0,
                  onClick: onSubmit,
                  disabled: dataLoading.value || isSubmitting.value,
                  class: "px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] disabled:opacity-50"
                }, toDisplayString(__props.isEditing ? "Guardar" : "Crear"), 9, ["disabled"])) : createCommentVNode("", true),
                createVNode("button", {
                  onClick: onRequestClose,
                  disabled: dataLoading.value || isSubmitting.value,
                  class: "px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                }, "Cerrar", 8, ["disabled"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BajaModal.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const hiddenStyle$1 = "position:absolute; left:-9999px; top:0; width:210mm; min-height:297mm; opacity:0; pointer-events:none;";
const _sfc_main$2 = {
  __name: "BajaPdfAft",
  __ssrInlineRender: true,
  props: {
    baja: {
      type: Object,
      default: () => ({})
    }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const pdfContent = ref(null);
    const exportPdf = async () => {
      console.log("BajaPdfAft exportPdf start", { baja: props.baja });
      {
        console.warn("BajaPdfAft exportPdf aborted: no browser o pdfContent no disponible");
        return;
      }
    };
    __expose({ exportPdf });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "pdfContent",
        ref: pdfContent,
        class: "pdf-export-root",
        style: hiddenStyle$1
      }, _attrs))} data-v-71172d45><div class="pdf-page bg-white text-black p-6" style="${ssrRenderStyle({ "width": "210mm", "min-height": "297mm", "font-family": "'Times New Roman', serif" })}" data-v-71172d45><div class="text-center mb-2" data-v-71172d45><div class="text-xl font-bold uppercase tracking-wide" data-v-71172d45>UNIVERSIDAD DE SANCTI SP\xCDRITUS</div><div class="text-lg font-semibold italic" data-v-71172d45>Jos\xE9 Mart\xED P\xE9rez</div></div><div class="text-center my-6" data-v-71172d45><h1 class="text-base font-bold uppercase tracking-wide" data-v-71172d45>INFORME PARA LA PROPUESTA DE BAJA DE LOS MEDIOS BASICOS</h1></div><div class="mb-5" data-v-71172d45><h2 class="text-base font-bold border-b border-black inline-block pr-4" data-v-71172d45>DATOS DEL MEDIO</h2><div class="mt-3 space-y-2 text-sm" data-v-71172d45><div class="flex items-center" data-v-71172d45><span class="font-semibold w-28" data-v-71172d45>Descripci\xF3n:</span><span class="border-b border-black flex-1 ml-2 h-5" data-v-71172d45></span></div><div class="flex items-center" data-v-71172d45><span class="font-semibold w-28" data-v-71172d45>Marca:</span><span class="border-b border-black flex-1 ml-2 h-5" data-v-71172d45></span></div><div class="flex items-center" data-v-71172d45><span class="font-semibold w-28" data-v-71172d45>Modelo:</span><span class="border-b border-black flex-1 ml-2 h-5" data-v-71172d45></span></div><div class="flex items-center" data-v-71172d45><span class="font-semibold w-28" data-v-71172d45>Serie:</span><span class="border-b border-black flex-1 ml-2 h-5" data-v-71172d45></span></div><div class="flex items-center" data-v-71172d45><span class="font-semibold w-28" data-v-71172d45>No. Inventario</span><span class="border-b border-black flex-1 ml-2 h-5" data-v-71172d45></span></div><div class="flex items-center" data-v-71172d45><span class="font-semibold w-28" data-v-71172d45>Fac. o \xC1rea</span><span class="border-b border-black flex-1 ml-2 h-5" data-v-71172d45></span></div><div class="flex items-center" data-v-71172d45><span class="font-semibold w-28" data-v-71172d45>Lab. O Local</span><span class="border-b border-black flex-1 ml-2 h-5" data-v-71172d45></span></div></div></div><div class="mb-5 text-sm" data-v-71172d45><p data-v-71172d45> El medio b\xE1sico de referencia ha sido revisado por el Co. (a) <span class="border-b border-black inline-block w-48" data-v-71172d45></span> que ocupa el cargo de <span class="border-b border-black inline-block w-48" data-v-71172d45></span> en la Facultad o \xC1rea de <span class="border-b border-black inline-block w-48" data-v-71172d45></span> detect\xE1ndose que el mismo no puede seguir utilizando en funciones para la cual fue dise\xF1ado debido a los problemas siguientes: </p><div class="border-b border-black w-full h-16 mt-2" data-v-71172d45></div><div class="border-b border-black w-full h-16 mt-1" data-v-71172d45></div><div class="border-b border-black w-full h-16 mt-1" data-v-71172d45></div><div class="border-b border-black w-full h-16 mt-1" data-v-71172d45></div></div><div class="mb-6 text-sm" data-v-71172d45><p data-v-71172d45> Por lo que se propone su baja definitiva para que as\xED conste firmo la presente <span class="border-b border-black inline-block w-32" data-v-71172d45></span> el d\xEDa <span class="border-b border-black inline-block w-12" data-v-71172d45></span> de <span class="border-b border-black inline-block w-28" data-v-71172d45></span> del 20 <span class="border-b border-black inline-block w-8" data-v-71172d45></span>. </p><p class="mt-3" data-v-71172d45> Firma del T\xE9cnico <span class="border-b border-black inline-block w-48 ml-2" data-v-71172d45></span></p></div><div class="mt-6 pt-4 border-t border-black" data-v-71172d45><h2 class="text-base font-bold uppercase text-center mb-3" data-v-71172d45>ACTA DE EVALUACI\xD3N DE LA COMISI\xD3N T\xC9CNICA</h2><p class="text-sm mb-3" data-v-71172d45> De acuerdo al Resuelvo sexto de la RM 155/88. La comisi\xF3n integrada por los compa\xF1eros debajo relacionados se re\xFAne el d\xEDa <span class="border-b border-black inline-block w-12" data-v-71172d45></span> de <span class="border-b border-black inline-block w-28" data-v-71172d45></span> del 20 <span class="border-b border-black inline-block w-8" data-v-71172d45></span> y luego de evaluar el medio de referencia emiten el siguiente. </p><h3 class="font-bold text-base text-center my-2" data-v-71172d45>DICTAMEN</h3><div class="border border-black p-2 min-h-[120px] text-sm mb-4" data-v-71172d45><div class="border-b border-black w-full h-6" data-v-71172d45></div><div class="border-b border-black w-full h-6 mt-1" data-v-71172d45></div><div class="border-b border-black w-full h-6 mt-1" data-v-71172d45></div><div class="border-b border-black w-full h-6 mt-1" data-v-71172d45></div><div class="border-b border-black w-full h-6 mt-1" data-v-71172d45></div></div><div class="grid grid-cols-3 gap-4 text-center text-sm mt-4" data-v-71172d45><div data-v-71172d45><div class="border-b border-black w-full h-6 mb-1" data-v-71172d45></div><p class="font-semibold" data-v-71172d45>Dtor. Econ\xF3mico</p></div><div data-v-71172d45><div class="border-b border-black w-full h-6 mb-1" data-v-71172d45></div><p class="font-semibold" data-v-71172d45>Resp. Com. T\xE9cnica</p></div><div data-v-71172d45><div class="border-b border-black w-full h-6 mb-1" data-v-71172d45></div><p class="font-semibold" data-v-71172d45>Perito Calificado</p></div></div><div class="mt-6 text-xs" data-v-71172d45><p data-v-71172d45>Original: Direcci\xF3n de Econom\xEDa</p><p data-v-71172d45>Copia 1: Fac. o \xC1reas</p><p data-v-71172d45>Copia 2: Dependencia emisora</p></div></div></div></div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BajaPdfAft.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const BajaPdfAft = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-71172d45"]]);
const hiddenStyle = "position:absolute; left:-9999px; top:0; width:210mm; min-height:297mm; opacity:0; pointer-events:none;";
const _sfc_main$1 = {
  __name: "BajaPdfUtil",
  __ssrInlineRender: true,
  props: {
    baja: {
      type: Object,
      default: () => ({})
    }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const pdfContent = ref(null);
    const exportPdf = async () => {
      console.log("BajaPdfUtil exportPdf start", { baja: props.baja });
      {
        console.warn("BajaPdfUtil exportPdf aborted: no browser o pdfContent no disponible");
        return;
      }
    };
    __expose({ exportPdf });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "pdfContent",
        ref: pdfContent,
        class: "pdf-export-root",
        style: hiddenStyle
      }, _attrs))} data-v-70ae25d0><div class="pdf-page bg-white text-slate-800 p-6" style="${ssrRenderStyle({ "width": "210mm", "min-height": "297mm" })}" data-v-70ae25d0><div class="flex justify-between items-start border-b border-slate-300 pb-3 mb-4" data-v-70ae25d0><div class="flex items-center gap-3" data-v-70ae25d0><img${ssrRenderAttr("src", _imports_0)} alt="Logo Universidad" class="h-12 w-auto object-contain" data-v-70ae25d0><div data-v-70ae25d0><h1 class="text-sm font-bold uppercase leading-tight" data-v-70ae25d0>Universidad de Sancti Sp\xEDritus</h1><h2 class="text-xs font-semibold italic" data-v-70ae25d0>Jos\xE9 Mart\xED P\xE9rez</h2></div></div><div class="text-right text-xs" data-v-70ae25d0><p data-v-70ae25d0>Sancti Sp\xEDritus, ___ de _____ de ____</p><p class="font-semibold mt-1" data-v-70ae25d0>\u201CA\xF1o 67 de la Revoluci\xF3n\u201D</p></div></div><div class="text-center mb-5" data-v-70ae25d0><h2 class="text-base font-bold uppercase tracking-wide" data-v-70ae25d0>PROPUESTA DE BAJA PARA \xDATILES Y HERRAMIENTAS</h2></div><div class="mb-4" data-v-70ae25d0><p class="font-semibold text-xs" data-v-70ae25d0>\xC1rea que propone la Baja:</p><div class="border-b border-slate-400 mt-1 w-2/3 h-5" data-v-70ae25d0></div></div><div class="overflow-x-auto border border-slate-300 rounded-md mb-5" data-v-70ae25d0><table class="min-w-full text-xs border-collapse" data-v-70ae25d0><thead class="bg-slate-100" data-v-70ae25d0><tr data-v-70ae25d0><th class="border border-slate-300 px-2 py-1.5 text-left font-semibold" data-v-70ae25d0>C\xF3digo</th><th class="border border-slate-300 px-2 py-1.5 text-left font-semibold" data-v-70ae25d0>Descripci\xF3n</th><th class="border border-slate-300 px-2 py-1.5 text-left font-semibold" data-v-70ae25d0>Cantidad</th></tr></thead><tbody data-v-70ae25d0><!--[-->`);
      ssrRenderList(7, (n) => {
        _push(`<tr data-v-70ae25d0><td class="border border-slate-200 px-2 py-1.5" data-v-70ae25d0>\xA0</td><td class="border border-slate-200 px-2 py-1.5" data-v-70ae25d0>\xA0</td><td class="border border-slate-200 px-2 py-1.5" data-v-70ae25d0>\xA0</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div><div class="mb-5" data-v-70ae25d0><p class="font-semibold text-xs" data-v-70ae25d0>Observaci\xF3n:</p><div class="border-b border-slate-400 mt-1 w-full h-6" data-v-70ae25d0></div><div class="border-b border-slate-400 mt-1 w-full h-6" data-v-70ae25d0></div><div class="border-b border-slate-400 mt-1 w-full h-6" data-v-70ae25d0></div></div><div class="grid grid-cols-2 gap-6 mt-4" data-v-70ae25d0><div data-v-70ae25d0><div class="border-b border-slate-400 w-full h-6 mb-0.5" data-v-70ae25d0></div><p class="text-xs font-semibold mt-1" data-v-70ae25d0>Nombre y Firma:</p><p class="text-[10px] text-slate-600" data-v-70ae25d0>Responsable de los \xDAtiles del \xC1rea</p></div><div data-v-70ae25d0><div class="border-b border-slate-400 w-full h-6 mb-0.5" data-v-70ae25d0></div><p class="text-xs font-semibold mt-1" data-v-70ae25d0>Nombre y Firma de quien Recibe:</p><p class="text-[10px] text-slate-600" data-v-70ae25d0>Especialista Gesti\xF3n Econ. De los \xDAtiles</p></div></div><div class="text-right text-[9px] text-slate-400 mt-12" data-v-70ae25d0><p data-v-70ae25d0>Documento generado electr\xF3nicamente</p></div></div></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BajaPdfUtil.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const BajaPdfUtil = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-70ae25d0"]]);
const _sfc_main = {
  __name: "bajas",
  __ssrInlineRender: true,
  setup(__props) {
    const filtros = ref({
      nota: "",
      estado: "",
      tipo_traslado: "",
      motivo: "",
      fecha_hora_creacion_desde: "",
      fecha_hora_creacion_hasta: "",
      fecha_hora_cierreSolicitud_desde: "",
      fecha_hora_cierreSolicitud_hasta: ""
    });
    const estadoOptions = [
      { label: "Todos", value: "" },
      { label: "Pendiente", value: "Pendiente" },
      { label: "En Proceso", value: "En Proceso" },
      { label: "Aprobada", value: "Aprobada" },
      { label: "Rechazada", value: "Rechazada" },
      { label: "Cancelada", value: "Cancelada" },
      { label: "Completada", value: "Completada" }
    ];
    const tipoOptions = [
      { label: "Todos", value: "" },
      { label: "AFT", value: "aft" },
      { label: "\xDAtil", value: "util" }
    ];
    const currentPage = ref(1);
    const itemsPorPage = ref(20);
    const totalItems = ref(0);
    const isLoading = ref(false);
    const itemsData = ref([]);
    const errorBanner = ref(null);
    const showModal = ref(false);
    const selectedBaja = ref({});
    const isEditing = ref(false);
    const isViewing = ref(false);
    const showConfirmBanner = ref(false);
    const bajaAEliminar = ref(null);
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
    const obtenerAreaUsuario = () => {
      try {
        const userStr = localStorage.getItem("usuario");
        if (userStr) {
          const user = JSON.parse(userStr);
          return user.id_AreaResponsabilidad ? user.id_AreaResponsabilidad.trim() : "";
        }
      } catch (e) {
      }
      return "";
    };
    const columnasBase = [
      { key: "id_AreaResponsabilidad", label: "\xC1rea Responsabilidad" },
      { key: "motivo", label: "Motivo" },
      { key: "estado", label: "Estado" },
      { key: "tipo_traslado", label: "Tipo" },
      { key: "fecha_creacion", label: "Fecha Creaci\xF3n" },
      { key: "fecha_cierre", label: "Fecha Cierre" },
      { key: "usuario_creador", label: "Usuario Creador" }
    ];
    const pdfAftRef = ref(null);
    const pdfUtilRef = ref(null);
    const bajaParaPdf = ref({});
    const editarBaja = (item) => {
      selectedBaja.value = item.raw || item;
      isEditing.value = true;
      isViewing.value = false;
      showModal.value = true;
    };
    const eliminarBaja = (item) => {
      bajaAEliminar.value = item.raw || item;
      showConfirmBanner.value = true;
    };
    const handleModeloBaja = async (item) => {
      var _a, _b, _c, _d, _e, _f;
      bajaParaPdf.value = item.raw || item;
      const tipo = (((_b = (_a = item.raw) == null ? void 0 : _a.solicitud) == null ? void 0 : _b.tipo_traslado) || item.tipo_traslado || "").toString().toLowerCase();
      console.log("handleModeloBaja start", {
        id: item == null ? void 0 : item.id_solicitud,
        tipo,
        item,
        pdfAftRef: pdfAftRef.value,
        pdfUtilRef: pdfUtilRef.value
      });
      try {
        if (tipo === "aft") {
          if (!pdfAftRef.value) console.warn("pdfAftRef no est\xE1 disponible");
          await ((_d = (_c = pdfAftRef.value) == null ? void 0 : _c.exportPdf) == null ? void 0 : _d.call(_c));
        } else {
          if (!pdfUtilRef.value) console.warn("pdfUtilRef no est\xE1 disponible");
          await ((_f = (_e = pdfUtilRef.value) == null ? void 0 : _e.exportPdf) == null ? void 0 : _f.call(_e));
        }
        console.log("handleModeloBaja completed successfully", { tipo });
      } catch (error) {
        console.error("handleModeloBaja error", error);
        errorBanner.value = {
          title: "Error",
          description: (error == null ? void 0 : error.message) || "No se pudo generar el modelo de baja.",
          type: "error"
        };
      }
    };
    const acciones = [
      {
        name: "Modelo de baja",
        buttonClass: "px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600",
        handler: handleModeloBaja
      },
      {
        name: "Editar",
        buttonClass: "px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600",
        handler: editarBaja,
        visible: (item) => {
          var _a, _b;
          const estado = item.estado || ((_b = (_a = item.raw) == null ? void 0 : _a.solicitud) == null ? void 0 : _b.estado);
          return estado !== "Completada";
        }
      },
      {
        name: "Eliminar",
        buttonClass: "px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600",
        handler: eliminarBaja,
        visible: (item) => {
          var _a, _b;
          const estado = item.estado || ((_b = (_a = item.raw) == null ? void 0 : _a.solicitud) == null ? void 0 : _b.estado);
          return estado !== "Completada";
        }
      }
    ];
    const confirmarEliminar = async () => {
      if (!bajaAEliminar.value) return;
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch(`${config.public.backendHost}/bajas/${bajaAEliminar.value.id_solicitud}`, {
          method: "DELETE",
          headers: { Authorization: token }
        });
        if (!response.ok) throw new Error("Error al eliminar");
        errorBanner.value = { title: "\xC9xito", description: "Baja eliminada correctamente", type: "success" };
        await fetchBajas(currentPage.value);
      } catch (err) {
        errorBanner.value = { title: "Error", description: err.message, type: "error" };
      } finally {
        showConfirmBanner.value = false;
        bajaAEliminar.value = null;
      }
    };
    const fetchBajas = async (page = 1) => {
      const token = localStorage.getItem("token");
      if (!token) return navigateTo("/");
      isLoading.value = true;
      errorBanner.value = null;
      try {
        const idArea = obtenerAreaUsuario();
        const body = { id_AreaResponsabilidad: idArea };
        if (filtros.value.nota) body.nota = filtros.value.nota;
        if (filtros.value.estado) body.estado = filtros.value.estado;
        if (filtros.value.tipo_traslado) body.tipo_traslado = filtros.value.tipo_traslado;
        if (filtros.value.motivo) body.motivo = filtros.value.motivo;
        if (filtros.value.fecha_hora_creacion_desde) body.fecha_hora_creacion_desde = new Date(filtros.value.fecha_hora_creacion_desde).toISOString();
        if (filtros.value.fecha_hora_creacion_hasta) body.fecha_hora_creacion_hasta = new Date(filtros.value.fecha_hora_creacion_hasta).toISOString();
        if (filtros.value.fecha_hora_cierreSolicitud_desde) body.fecha_hora_cierreSolicitud_desde = new Date(filtros.value.fecha_hora_cierreSolicitud_desde).toISOString();
        if (filtros.value.fecha_hora_cierreSolicitud_hasta) body.fecha_hora_cierreSolicitud_hasta = new Date(filtros.value.fecha_hora_cierreSolicitud_hasta).toISOString();
        const res = await fetch(`${config.public.backendHost}/bajas/filtrar/${page}/${itemsPorPage.value}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify(body)
        });
        if (res.status === 401) throw new Error("Sesi\xF3n expirada");
        if (res.status === 403) throw new Error("Acceso denegado");
        if (!res.ok) {
          const errorMessage = await obtenerMensajeErrorApi(res);
          throw new Error(errorMessage);
        }
        const data = await res.json();
        itemsData.value = data.datos.map((item) => {
          var _a, _b;
          const solicitud = item.solicitud || {};
          const primerUsuario = ((_a = solicitud.usuarios) == null ? void 0 : _a[0]) || {};
          return {
            id_solicitud: item.id_solicitud,
            id_AreaResponsabilidad: ((_b = item.id_AreaResponsabilidad) == null ? void 0 : _b.trim()) || "",
            motivo: item.motivo || "",
            estado: solicitud.estado || "",
            tipo_traslado: solicitud.tipo_traslado || "",
            fecha_creacion: solicitud.fecha_hora_creacion ? new Date(solicitud.fecha_hora_creacion).toLocaleDateString() : "",
            fecha_cierre: solicitud.fecha_hora_cierreSolicitud ? new Date(solicitud.fecha_hora_cierreSolicitud).toLocaleDateString() : "",
            usuario_creador: primerUsuario.id_usuario_LDAP || "",
            raw: item
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
      }
    };
    const handlePageChange = (page) => fetchBajas(page);
    const handleRowClick = (item) => {
      selectedBaja.value = item.raw || item;
      isEditing.value = false;
      isViewing.value = true;
      showModal.value = true;
    };
    const handleSubmitBaja = async (payload) => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        let response;
        if (isEditing.value && selectedBaja.value.id_solicitud) {
          response = await fetch(`${config.public.backendHost}/bajas/${selectedBaja.value.id_solicitud}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify(payload)
          });
        } else {
          response = await fetch(`${config.public.backendHost}/bajas`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify(payload)
          });
        }
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `Error ${response.status}`);
        }
        errorBanner.value = {
          title: isEditing.value ? "Baja actualizada" : "Baja creada",
          description: "Operaci\xF3n exitosa",
          type: "success"
        };
        showModal.value = false;
        fetchBajas(currentPage.value);
      } catch (err) {
        errorBanner.value = { title: "Error", description: err.message, type: "error" };
      }
    };
    const refrescarLista = () => {
      fetchBajas(currentPage.value);
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white" }, _attrs))}>`);
      _push(ssrRenderComponent(SeoMeta, {
        title: "Bajas - AFTUP",
        description: "Gesti\xF3n de bajas de activos fijos tangibles y \xFAtiles.",
        canonical: "/bajas"
      }, null, _parent));
      _push(ssrRenderComponent(Navbar, null, null, _parent));
      if (errorBanner.value) {
        _push(`<div class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none">`);
        _push(ssrRenderComponent(_sfc_main$4, {
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
        _push(ssrRenderComponent(_sfc_main$5, {
          title: "\xBFEst\xE1s seguro de eliminar esta baja?",
          description: "Esta acci\xF3n no se puede deshacer.",
          type: "warning",
          onConfirm: confirmarEliminar,
          onClose: ($event) => showConfirmBanner.value = false
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="w-[95%] mx-auto px-4 py-4 md:py-4 mt-20 md:mt-0"><div class="bg-white rounded-lg shadow-md p-4"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Nota</label><input type="text"${ssrRenderAttr("value", filtros.value.nota)} placeholder="Buscar por nota..." class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>`);
      _push(ssrRenderComponent(_sfc_main$1$1, {
        modelValue: filtros.value.estado,
        "onUpdate:modelValue": ($event) => filtros.value.estado = $event,
        options: estadoOptions,
        labelKey: "label",
        valueKey: "value",
        placeholder: "Seleccionar estado..."
      }, null, _parent));
      _push(`</div><div><label class="block text-sm font-medium text-gray-700 mb-1">Tipo traslado</label>`);
      _push(ssrRenderComponent(_sfc_main$1$1, {
        modelValue: filtros.value.tipo_traslado,
        "onUpdate:modelValue": ($event) => filtros.value.tipo_traslado = $event,
        options: tipoOptions,
        labelKey: "label",
        valueKey: "value",
        placeholder: "aft / util"
      }, null, _parent));
      _push(`</div><div><label class="block text-sm font-medium text-gray-700 mb-1">Motivo</label><input type="text"${ssrRenderAttr("value", filtros.value.motivo)} placeholder="Motivo de baja..." class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Fecha creaci\xF3n (desde)</label><input type="datetime-local"${ssrRenderAttr("value", filtros.value.fecha_hora_creacion_desde)} class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Fecha creaci\xF3n (hasta)</label><input type="datetime-local"${ssrRenderAttr("value", filtros.value.fecha_hora_creacion_hasta)} class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Fecha cierre (desde)</label><input type="datetime-local"${ssrRenderAttr("value", filtros.value.fecha_hora_cierreSolicitud_desde)} class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Fecha cierre (hasta)</label><input type="datetime-local"${ssrRenderAttr("value", filtros.value.fecha_hora_cierreSolicitud_hasta)} class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div></div><div class="flex justify-end gap-2 flex-wrap mt-4"><button class="px-6 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] focus:ring-offset-2 transition-colors"> Buscar </button><button class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"> Limpiar </button></div></div></div><div class="w-[95%] mx-auto px-4 py-4"><div class="flex justify-between items-center mb-4"><h2 class="text-2xl font-bold text-[#077a99]">Bajas</h2><button class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Nueva Baja </button></div>`);
      _push(ssrRenderComponent(DataTable, {
        columns: columnasBase,
        actions: acciones,
        items: itemsData.value,
        "total-items": totalItems.value,
        "items-per-page": itemsPorPage.value,
        "current-page": currentPage.value,
        "is-loading": isLoading.value,
        onPageChange: handlePageChange,
        onRowClick: handleRowClick
      }, null, _parent));
      _push(`<div>`);
      _push(ssrRenderComponent(BajaPdfAft, {
        ref_key: "pdfAftRef",
        ref: pdfAftRef,
        baja: bajaParaPdf.value
      }, null, _parent));
      _push(ssrRenderComponent(BajaPdfUtil, {
        ref_key: "pdfUtilRef",
        ref: pdfUtilRef,
        baja: bajaParaPdf.value
      }, null, _parent));
      _push(`</div></div>`);
      _push(ssrRenderComponent(_sfc_main$3, {
        modelValue: showModal.value,
        "onUpdate:modelValue": ($event) => showModal.value = $event,
        baja: selectedBaja.value,
        "is-editing": isEditing.value,
        "is-viewing": isViewing.value,
        onSubmit: handleSubmitBaja,
        onSuccess: refrescarLista
      }, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bajas.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=bajas-CcofILtL.mjs.map
