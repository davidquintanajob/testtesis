import { ref, mergeProps, computed, watch, reactive, withCtx, createVNode, createBlock, createCommentVNode, openBlock, toDisplayString, Fragment, renderList, withDirectives, vModelText, vModelSelect, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderTeleport, ssrRenderStyle, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderList, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
  __name: "TrasladoModal",
  __ssrInlineRender: true,
  props: {
    modelValue: Boolean,
    traslado: { type: Object, default: () => ({}) },
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
    const trasladoData = ref({});
    const areaOrigenDesc = ref("");
    const areaDestinoDesc = ref("");
    const areaDestinoInitialLabel = ref("");
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
      tipo_traslado: "aft",
      tipo_movimiento: "",
      fundamentacion: "",
      estado: "Pendiente",
      id_AreaResponsabilidad_origen: "",
      id_AreaResponsabilidad_destino: "",
      usuarios_list: [],
      lista_activos: []
    });
    const tipoElementoLabel = computed(() => form.tipo_traslado === "aft" ? "Activo Fijo" : "\xDAtil");
    const endpointElementos = computed(() => form.tipo_traslado === "aft" ? "/aft/filtrar/1/5" : "/utiles/filtrar/1/5");
    const searchKeyElementos = computed(() => form.tipo_traslado === "aft" ? "Desc_ActivoFijo" : "Desc_UH");
    const labelKeyElementos = computed(() => form.tipo_traslado === "aft" ? "Desc_ActivoFijo" : "Desc_UH");
    const valueKeyElementos = computed(() => form.tipo_traslado === "aft" ? "Id_ActivoFijo" : "Id_UH");
    const idAreaResponsabilidad = computed(() => {
      var _a;
      return ((_a = usuarioLogueado.value) == null ? void 0 : _a.id_AreaResponsabilidad) || null;
    });
    async function cargarUsuarios(idAreaDestino = null) {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No hay token de autenticaci\xF3n");
        const areaDestino = idAreaDestino !== null ? idAreaDestino : form.id_AreaResponsabilidad_destino;
        const usuariosMap = /* @__PURE__ */ new Map();
        const urlEspecialistas = `${config.public.backendHost}/usuarios/filtrar/1/999999`;
        const resEsp = await fetch(urlEspecialistas, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ rol: "Especialista" })
        });
        if (!resEsp.ok) throw new Error("Error al cargar especialistas");
        const dataEsp = await resEsp.json();
        const especialistas = dataEsp.datos || [];
        especialistas.forEach((u) => {
          usuariosMap.set(u.id_usuario, {
            id: u.id_usuario,
            label: `${u.id_usuario_LDAP || u.nombre_usuario} (ID: ${u.id_usuario})`
          });
        });
        if (idUsuarioJefe.value) {
          const urlJefe = `${config.public.backendHost}/usuarios/${idUsuarioJefe.value}`;
          const resJefe = await fetch(urlJefe, { headers: { Authorization: token } });
          if (resJefe.ok) {
            const jefe = await resJefe.json();
            if (!usuariosMap.has(jefe.id_usuario)) {
              usuariosMap.set(jefe.id_usuario, {
                id: jefe.id_usuario,
                label: `${jefe.id_usuario_LDAP || jefe.nombre_usuario} (ID: ${jefe.id_usuario})`
              });
            }
          } else if (resJefe.status !== 404) {
            console.warn(`Error al obtener jefe: ${resJefe.status}`);
          }
        }
        if (areaDestino && areaDestino.trim() !== "") {
          const urlArea = `${config.public.backendHost}/usuarios/filtrar/1/999999`;
          const resArea = await fetch(urlArea, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify({ id_AreaResponsabilidad: areaDestino })
          });
          if (!resArea.ok) {
            console.warn(`Error al cargar usuarios del \xE1rea destino ${areaDestino}: ${resArea.status}`);
          } else {
            const dataArea = await resArea.json();
            const usuariosArea = dataArea.datos || [];
            usuariosArea.forEach((u) => {
              if (!usuariosMap.has(u.id_usuario)) {
                usuariosMap.set(u.id_usuario, {
                  id: u.id_usuario,
                  label: `${u.id_usuario_LDAP || u.nombre_usuario} (ID: ${u.id_usuario})`
                });
              }
            });
          }
        }
        form.usuarios_list = Array.from(usuariosMap.values());
        if (form.usuarios_list.length === 0) {
          console.warn("[cargarUsuarios] No se encontraron usuarios");
          message.value = {
            title: "Sin usuarios",
            description: "No se encontraron especialistas, jefe o usuarios del \xE1rea destino.",
            type: "warning"
          };
        }
      } catch (err) {
        console.error("[cargarUsuarios] ERROR:", err);
        message.value = {
          title: "Error al cargar usuarios",
          description: err.message || "No se pudieron cargar los usuarios",
          type: "error"
        };
        throw err;
      }
    }
    async function cargarAreaDestino(idArea) {
      if (!idArea) return "";
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${config.public.backendHost}/areas/${idArea}`, { headers: { Authorization: token } });
        if (!res.ok) throw new Error("Error al cargar \xE1rea destino");
        const data = await res.json();
        return data.Desc_AreaResponsabilidad || idArea;
      } catch (err) {
        console.error(err);
        return idArea;
      }
    }
    async function cargarAreaOrigen(idArea) {
      if (!idArea) return "";
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${config.public.backendHost}/areas/${idArea}`, { headers: { Authorization: token } });
        if (!res.ok) throw new Error("Error al cargar \xE1rea origen");
        const data = await res.json();
        return data.Desc_AreaResponsabilidad || idArea;
      } catch (err) {
        console.error(err);
        return idArea;
      }
    }
    async function cargarElementoPorId(tipo, id) {
      var _a, _b;
      try {
        const token = localStorage.getItem("token");
        const endpoint = tipo === "aft" ? `/aft/${id}` : `/utiles/${id}`;
        const res = await fetch(`${config.public.backendHost}${endpoint}`, { headers: { Authorization: token } });
        if (!res.ok) throw new Error(`Error al cargar ${tipo} ${id}`);
        const data = await res.json();
        if (tipo === "aft") {
          return { id: (_a = data.Id_ActivoFijo) == null ? void 0 : _a.trim(), descripcion: data.Desc_ActivoFijo };
        } else {
          return { id: (_b = data.Id_UH) == null ? void 0 : _b.trim(), descripcion: data.Desc_UH };
        }
      } catch (err) {
        console.error(err);
        return { id, descripcion: id };
      }
    }
    async function cargarDatosComplementarios(traslado) {
      var _a, _b, _c;
      if (!traslado || Object.keys(traslado).length === 0) return;
      if (traslado.id_AreaResponsabilidad_destino) {
        const desc = await cargarAreaDestino(traslado.id_AreaResponsabilidad_destino);
        areaDestinoDesc.value = desc;
        areaDestinoInitialLabel.value = desc;
      }
      if (traslado.id_AreaResponsabilidad_origen) {
        areaOrigenDesc.value = await cargarAreaOrigen(traslado.id_AreaResponsabilidad_origen);
      }
      if (((_a = traslado.solicitud) == null ? void 0 : _a.usuarios) && traslado.solicitud.usuarios.length > 0) {
        const creador = traslado.solicitud.usuarios[0];
        usuarioCreadorNombre.value = creador.id_usuario_LDAP || creador.id_usuario;
      } else {
        usuarioCreadorNombre.value = "";
      }
      const tipo = ((_b = traslado.solicitud) == null ? void 0 : _b.tipo_traslado) || "aft";
      const detalles = traslado.detalles || [];
      const elementosPromises = detalles.map((d) => cargarElementoPorId(tipo, d.id_activoFijo_o_util));
      const elementos = await Promise.all(elementosPromises);
      activosMostrar.value = elementos;
      if ((_c = traslado.solicitud) == null ? void 0 : _c.usuarios) {
        usuariosMostrar.value = traslado.solicitud.usuarios;
      } else {
        usuariosMostrar.value = [];
      }
    }
    async function loadExistingData(traslado) {
      var _a, _b, _c, _d, _e, _f;
      if (!traslado || Object.keys(traslado).length === 0) return;
      dataLoading.value = true;
      try {
        trasladoData.value = traslado;
        await cargarDatosComplementarios(traslado);
        if (!props.isViewing || props.isEditing) {
          form.nota = ((_a = traslado.solicitud) == null ? void 0 : _a.nota) || "";
          form.tipo_traslado = ((_b = traslado.solicitud) == null ? void 0 : _b.tipo_traslado) || "aft";
          form.tipo_movimiento = ((_c = traslado.solicitud) == null ? void 0 : _c.tipo_movimiento) || "";
          form.fundamentacion = ((_d = traslado.solicitud) == null ? void 0 : _d.fundamentacion) || "";
          form.estado = ((_e = traslado.solicitud) == null ? void 0 : _e.estado) || "Pendiente";
          form.id_AreaResponsabilidad_origen = traslado.id_AreaResponsabilidad_origen || idAreaOrigen.value;
          form.id_AreaResponsabilidad_destino = traslado.id_AreaResponsabilidad_destino || "";
          const tipo = ((_f = traslado.solicitud) == null ? void 0 : _f.tipo_traslado) || "aft";
          const detalles = traslado.detalles || [];
          const elementosPromises = detalles.map(async (d) => {
            const elem = await cargarElementoPorId(tipo, d.id_activoFijo_o_util);
            return {
              id: elem.id,
              label: `${elem.id}: ${elem.descripcion}`,
              isRevisado: false,
              descripcion: elem.descripcion
            };
          });
          form.lista_activos = await Promise.all(elementosPromises);
        }
      } catch (err) {
        console.error("Error cargando datos del traslado:", err);
        message.value = { title: "Error", description: "No se pudieron cargar los datos del traslado", type: "error" };
      } finally {
        dataLoading.value = false;
      }
    }
    function resetFormFields() {
      form.nota = "";
      form.tipo_traslado = "aft";
      form.tipo_movimiento = "";
      form.fundamentacion = "";
      form.estado = "Pendiente";
      form.id_AreaResponsabilidad_origen = idAreaOrigen.value;
      form.id_AreaResponsabilidad_destino = "";
      form.lista_activos = [];
      errorList.value = [];
      areaDestinoDesc.value = "";
      areaDestinoInitialLabel.value = "";
      areaOrigenDesc.value = "";
      usuarioCreadorNombre.value = "";
      activosMostrar.value = [];
      usuariosMostrar.value = [];
      trasladoData.value = {};
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
    let lastAreaDestino = "";
    watch(() => form.id_AreaResponsabilidad_destino, async (newArea, oldArea) => {
      if (!props.modelValue) return;
      if (props.isViewing && !props.isEditing) return;
      if (newArea === lastAreaDestino) return;
      if (!newArea || newArea.trim() === "") return;
      lastAreaDestino = newArea;
      try {
        await cargarUsuarios(newArea);
      } catch (err) {
        console.error("Error al recargar usuarios por cambio de \xE1rea destino", err);
      }
    });
    watch(() => form.tipo_traslado, () => {
      form.lista_activos = [];
      elementoSeleccionadoTemp.value = null;
    });
    watch(() => props.traslado, async (newVal) => {
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
      if (!form.id_AreaResponsabilidad_destino) errorList.value.push("Debe seleccionar un \xE1rea destino");
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
        traslado: {
          id_AreaResponsabilidad_origen: form.id_AreaResponsabilidad_origen.trim(),
          id_AreaResponsabilidad_destino: form.id_AreaResponsabilidad_destino.trim()
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
        if (props.isEditing && trasladoData.value.id_solicitud) {
          url = `${config.public.backendHost}/traslados/${trasladoData.value.id_solicitud}`;
          method = "PUT";
        } else {
          url = `${config.public.backendHost}/traslados`;
          method = "POST";
        }
        console.log(JSON.stringify(payload, null, 2));
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
          title: props.isEditing ? "Traslado actualizado" : "Traslado creado",
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
          form.id_AreaResponsabilidad_origen = idAreaOrigen.value;
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
          await cargarUsuarios(null);
          if (props.traslado && Object.keys(props.traslado).length > 0) {
            await loadExistingData(props.traslado);
            if (form.id_AreaResponsabilidad_destino && form.id_AreaResponsabilidad_destino.trim() !== "") {
              await cargarUsuarios(form.id_AreaResponsabilidad_destino);
              lastAreaDestino = form.id_AreaResponsabilidad_destino;
            }
          } else {
            resetFormFields();
          }
        } catch (err) {
          console.error("[Modal] Error en inicializaci\xF3n:", err);
        } finally {
          dataLoading.value = false;
        }
      } else {
        lastAreaDestino = "";
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
            _push2(`<h3 class="text-lg font-semibold text-gray-900"${_scopeId}>${ssrInterpolate(__props.isViewing ? "Detalles del Traslado" : __props.isEditing ? "Editar Traslado" : "Nuevo Traslado")}</h3>`);
          } else {
            return [
              createVNode("h3", { class: "text-lg font-semibold text-gray-900" }, toDisplayString(__props.isViewing ? "Detalles del Traslado" : __props.isEditing ? "Editar Traslado" : "Nuevo Traslado"), 1)
            ];
          }
        }),
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
          if (_push2) {
            _push2(`<div class="${ssrRenderClass(["transition-opacity", (dataLoading.value || isSubmitting.value) && "pointer-events-none opacity-50"])}"${_scopeId}>`);
            if (dataLoading.value) {
              _push2(`<div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"${_scopeId}><div class="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4"${_scopeId}><div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"${_scopeId}></div><p class="text-gray-700 font-medium"${_scopeId}>Cargando datos...</p></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (isSubmitting.value) {
              _push2(`<div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"${_scopeId}><div class="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4"${_scopeId}><div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"${_scopeId}></div><p class="text-gray-700 font-medium"${_scopeId}>${ssrInterpolate(__props.isEditing ? "Actualizando traslado..." : "Creando traslado...")}</p></div></div>`);
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
              _push2(`<div class="space-y-6"${_scopeId}><div class="bg-gray-50 rounded-lg p-4"${_scopeId}><h4 class="text-md font-medium text-gray-900 mb-3"${_scopeId}>Informaci\xF3n General</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-4"${_scopeId}><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>ID Solicitud</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(trasladoData.value.id_solicitud || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Nota</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(((_a = trasladoData.value.solicitud) == null ? void 0 : _a.nota) || "Sin nota")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Tipo Traslado</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(((_b = trasladoData.value.solicitud) == null ? void 0 : _b.tipo_traslado) || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Estado</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(((_c = trasladoData.value.solicitud) == null ? void 0 : _c.estado) || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Tipo Movimiento</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(((_d = trasladoData.value.solicitud) == null ? void 0 : _d.tipo_movimiento) || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Fundamentaci\xF3n</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(((_e = trasladoData.value.solicitud) == null ? void 0 : _e.fundamentacion) || "Sin fundamentaci\xF3n")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>\xC1rea Origen</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(areaOrigenDesc.value || trasladoData.value.id_AreaResponsabilidad_origen || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>\xC1rea Destino</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(areaDestinoDesc.value || trasladoData.value.id_AreaResponsabilidad_destino || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Usuario Creador</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(usuarioCreadorNombre.value || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Fecha Creaci\xF3n</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(trasladoData.value.createdAt ? new Date(trasladoData.value.createdAt).toLocaleString() : "N/A")}</p></div></div></div><div class="bg-blue-50 rounded-lg p-4"${_scopeId}><h4 class="text-md font-medium text-gray-900 mb-3"${_scopeId}>Usuarios Involucrados</h4>`);
              if (usuariosMostrar.value.length) {
                _push2(`<div class="flex flex-wrap gap-2"${_scopeId}><!--[-->`);
                ssrRenderList(usuariosMostrar.value, (u) => {
                  _push2(`<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"${_scopeId}>${ssrInterpolate(u.id_usuario_LDAP || u.nombre_usuario || u.id_usuario)}</span>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="text-sm text-gray-500"${_scopeId}>No hay usuarios asociados</p>`);
              }
              _push2(`</div><div class="bg-green-50 rounded-lg p-4"${_scopeId}><h4 class="text-md font-medium text-gray-900 mb-3"${_scopeId}>Activos Fijos / \xDAtiles Trasladados</h4>`);
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
              if (((_f = trasladoData.value.solicitud) == null ? void 0 : _f.estado) !== "Completada" && trasladoData.value.estado !== "Completada") {
                _push2(`<div class="flex justify-end"${_scopeId}><button class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99]"${_scopeId}>Editar Traslado</button></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<div class="space-y-6"${_scopeId}><div class="grid grid-cols-1 md:grid-cols-2 gap-4"${_scopeId}><div class="md:col-span-2"${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Nota</label><textarea rows="3" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Motivo del traslado..."${_scopeId}>${ssrInterpolate(form.nota)}</textarea></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Tipo Traslado</label><select class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"${_scopeId}><option value="aft"${ssrIncludeBooleanAttr(Array.isArray(form.tipo_traslado) ? ssrLooseContain(form.tipo_traslado, "aft") : ssrLooseEqual(form.tipo_traslado, "aft")) ? " selected" : ""}${_scopeId}>Activo Fijo Tangible (AFT)</option><option value="util"${ssrIncludeBooleanAttr(Array.isArray(form.tipo_traslado) ? ssrLooseContain(form.tipo_traslado, "util") : ssrLooseEqual(form.tipo_traslado, "util")) ? " selected" : ""}${_scopeId}>\xDAtil</option></select></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Tipo Movimiento</label>`);
              _push2(ssrRenderComponent(_sfc_main$1$1, {
                modelValue: form.tipo_movimiento,
                "onUpdate:modelValue": ($event) => form.tipo_movimiento = $event,
                options: tiposMovimientoOptions,
                "label-key": "label",
                "value-key": "value",
                placeholder: "Seleccionar tipo de movimiento..."
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="md:col-span-2"${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Fundamentaci\xF3n</label><textarea rows="2" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Justificaci\xF3n o fundamentaci\xF3n del traslado..."${_scopeId}>${ssrInterpolate(form.fundamentacion)}</textarea></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Estado</label><select${ssrIncludeBooleanAttr(isEstadoDisabled.value) ? " disabled" : ""} class="${ssrRenderClass([{ "bg-gray-100 cursor-not-allowed": isEstadoDisabled.value }, "w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"])}"${_scopeId}><!--[-->`);
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
              _push2(`</div><div${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>\xC1rea Responsabilidad Origen</label><input type="text"${ssrRenderAttr("value", form.id_AreaResponsabilidad_origen)} readonly disabled class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"${_scopeId}></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>\xC1rea Responsabilidad Destino</label>`);
              _push2(ssrRenderComponent(_sfc_main$7, {
                modelValue: form.id_AreaResponsabilidad_destino,
                "onUpdate:modelValue": ($event) => form.id_AreaResponsabilidad_destino = $event,
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
                "initial-label": areaDestinoInitialLabel.value
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="md:col-span-2"${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Usuarios Involucrados</label>`);
              if (form.usuarios_list.length) {
                _push2(`<div class="border rounded-lg divide-y max-h-48 overflow-y-auto"${_scopeId}><!--[-->`);
                ssrRenderList(form.usuarios_list, (item, idx) => {
                  _push2(`<div class="flex justify-between items-center p-2 hover:bg-gray-50"${_scopeId}><span${_scopeId}>${ssrInterpolate(item.label)}</span></div>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="text-sm text-gray-500 italic mt-1"${_scopeId}>Cargando usuarios...</p>`);
              }
              _push2(`</div><div class="md:col-span-2"${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Elementos a Trasladar (${ssrInterpolate(tipoElementoLabel.value)})</label><div class="flex gap-2 mb-2"${_scopeId}>`);
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
                  _push2(`<div class="flex justify-between items-center p-2 hover:bg-gray-50"${_scopeId}><span${_scopeId}>${ssrInterpolate(item.label)}</span><button type="button" class="text-red-500 hover:text-red-700"${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"${_scopeId}><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"${_scopeId}></path></svg></button></div>`);
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
                    createVNode("p", { class: "text-gray-700 font-medium" }, toDisplayString(__props.isEditing ? "Actualizando traslado..." : "Creando traslado..."), 1)
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
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(trasladoData.value.id_solicitud || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Nota"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(((_g = trasladoData.value.solicitud) == null ? void 0 : _g.nota) || "Sin nota"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Tipo Traslado"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(((_h = trasladoData.value.solicitud) == null ? void 0 : _h.tipo_traslado) || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Estado"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(((_i = trasladoData.value.solicitud) == null ? void 0 : _i.estado) || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Tipo Movimiento"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(((_j = trasladoData.value.solicitud) == null ? void 0 : _j.tipo_movimiento) || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Fundamentaci\xF3n"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(((_k = trasladoData.value.solicitud) == null ? void 0 : _k.fundamentacion) || "Sin fundamentaci\xF3n"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "\xC1rea Origen"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(areaOrigenDesc.value || trasladoData.value.id_AreaResponsabilidad_origen || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "\xC1rea Destino"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(areaDestinoDesc.value || trasladoData.value.id_AreaResponsabilidad_destino || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Usuario Creador"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(usuarioCreadorNombre.value || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Fecha Creaci\xF3n"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(trasladoData.value.createdAt ? new Date(trasladoData.value.createdAt).toLocaleString() : "N/A"), 1)
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
                    createVNode("h4", { class: "text-md font-medium text-gray-900 mb-3" }, "Activos Fijos / \xDAtiles Trasladados"),
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
                  ((_l = trasladoData.value.solicitud) == null ? void 0 : _l.estado) !== "Completada" && trasladoData.value.estado !== "Completada" ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "flex justify-end"
                  }, [
                    createVNode("button", {
                      onClick: enableEditMode,
                      class: "px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99]"
                    }, "Editar Traslado")
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
                        placeholder: "Motivo del traslado..."
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, form.nota]
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
                        placeholder: "Justificaci\xF3n o fundamentaci\xF3n del traslado..."
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
                      createVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "\xC1rea Responsabilidad Origen"),
                      withDirectives(createVNode("input", {
                        type: "text",
                        "onUpdate:modelValue": ($event) => form.id_AreaResponsabilidad_origen = $event,
                        readonly: "",
                        disabled: "",
                        class: "w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, form.id_AreaResponsabilidad_origen]
                      ])
                    ]),
                    createVNode("div", null, [
                      createVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "\xC1rea Responsabilidad Destino"),
                      createVNode(_sfc_main$7, {
                        modelValue: form.id_AreaResponsabilidad_destino,
                        "onUpdate:modelValue": ($event) => form.id_AreaResponsabilidad_destino = $event,
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
                        "initial-label": areaDestinoInitialLabel.value
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "initial-label"])
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
                      createVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "Elementos a Trasladar (" + toDisplayString(tipoElementoLabel.value) + ")", 1),
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
                                  d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z",
                                  "clip-rule": "evenodd"
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TrasladoModal.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const htmlTemplate = `<div>\r
    <table cellspacing="0" cellpadding="0" style="width:518.15pt; border-collapse:collapse;">\r
        <tbody>\r
            <tr style="height:28.3pt;">\r
                <td colspan="4" style="width:163.15pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Empresa: {{EMPRESA}}</span></p>\r
                </td>\r
                <td colspan="5" style="width:108.2pt; border-top-style:solid; border-top-width:0.75pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">C\xF3digo:{{CODIGO}}</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\r
                </td>\r
                <td colspan="9" rowspan="2" style="width:210.9pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">SC-1-01</span><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;</span><span style="font-family:'Trebuchet MS';">MOVIMIENTO DE</span><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-family:'Trebuchet MS';">ACTIVOS FIJOS TANGIBLES</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:8pt;">\r
                <td colspan="9" style="width:278.35pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Direcci&oacute;n: {{DIRECCION}}</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:11.8pt;">\r
                <td colspan="9" style="width:278.35pt; border-top-style:solid; border-top-width:0.75pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&Aacute;rea: {{AREA}}</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\r
                </td>\r
                <td colspan="9" style="width:210.9pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">C&oacute;digo:</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:16.85pt;">\r
                <td colspan="18" style="width:496.25pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Descripci&oacute;n: {{FUNDAMENTACION}}</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:17pt;">\r
                <td colspan="2" style="width:112.9pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span><span style="font-family:'Trebuchet MS';">{{INVENTARIO_NO}}</span><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td colspan="4" style="width:78.7pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Fecha: {{FECHA_DIA}}/{{FECHA_MES}}/{{FECHA_ANIO}}</span></p>\r
                </td>\r
                <td colspan="7" style="width:163.1pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">A l q u i l e r</span></p>\r
                </td>\r
                <td colspan="5" style="width:120.55pt; border-top-style:solid; border-top-width:0.75pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Depreciaci&oacute;n acumulada</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:18.2pt;">\r
                <td colspan="2" style="width:112.9pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Cuenta No.</span><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td style="width:14.9pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">D</span></p>\r
                </td>\r
                <td colspan="2" style="width:35.55pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">M</span></p>\r
                </td>\r
                <td style="width:14.25pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">A</span></p>\r
                </td>\r
                <td colspan="3" rowspan="2" style="width:72.75pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Tiempo</span></p>\r
                </td>\r
                <td colspan="4" style="width:83.35pt; border-top-style:solid; border-top-width:0.75pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Devoluci&oacute;n</span></p>\r
                </td>\r
                <td colspan="5" rowspan="2" style="width:120.55pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:22pt;">\r
                <td colspan="2" rowspan="3" style="width:112.9pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Cuenta No.</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\r
                </td>\r
                <td style="width:14.9pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td colspan="2" style="width:35.55pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\r
                </td>\r
                <td style="width:14.25pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td style="width:19.55pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">D</span></p>\r
                </td>\r
                <td colspan="2" style="width:28.45pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">M</span></p>\r
                </td>\r
                <td style="width:21.35pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">A</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:12.2pt;">\r
                <td colspan="4" style="width:78.7pt; border-top-style:solid; border-top-width:0.75pt; border-right-style:solid; border-right-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Valor</span></p>\r
                </td>\r
                <td colspan="3" rowspan="2" style="width:72.75pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:bottom;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td rowspan="2" style="width:19.55pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td colspan="2" rowspan="2" style="width:28.45pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\r
                </td>\r
                <td rowspan="2" style="width:21.35pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td colspan="5" rowspan="2" style="width:120.55pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:12.2pt;">\r
                <td colspan="4" style="width:78.7pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:16.15pt;">\r
                <td rowspan="3" style="width:26.05pt; height:16.15pt; margin-right:auto; margin-left:auto; writing-mode:tb-rl; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle; -moz-transform:rotate(180deg); -ms-transform:rotate(180deg); overflow:hidden; transform:rotate(180deg); -webkit-transform:rotate(180deg);">\r
                    <div style="height:16.15pt; margin-right:auto; margin-left:auto; writing-mode:tb-rl; overflow:hidden;">\r
                        <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Receptor</span></p>\r
                    </div>\r
                </td>\r
                <td colspan="11" style="width:307.3pt; border-top-style:solid; border-top-width:0.75pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">{{ENTIDAD}}</span></p>\r
                </td>\r
                <td colspan="6" style="width:148.9pt; border-top-style:solid; border-top-width:0.75pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">{{ENTIDAD_CI}}</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:16.15pt;">\r
                <td colspan="17" style="width:463.2pt; border-top-style:solid; border-top-width:0.75pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Direcci&oacute;n: {{ENTIDAD_DIRECCION}}</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:16.15pt;">\r
                <td colspan="11" style="width:307.3pt; border-top-style:solid; border-top-width:0.75pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">\xC1rea: {{ENTIDAD_AREA}}</span></p>\r
                </td>\r
                <td colspan="6" style="width:148.9pt; border-top-style:solid; border-top-width:0.75pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Firma: _________</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:15.1pt;">\r
                <td colspan="11" style="width:319.1pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">TIPO</span><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;</span><span style="font-family:'Trebuchet MS';">DE</span><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;</span><span style="font-family:'Trebuchet MS';">MOVIMIENTO</span><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\r
                </td>\r
                <td colspan="7" rowspan="2" style="width:170.15pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">FUNDAMENTACI\xD3N DE LA OPERACI\xD3N</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:137.2pt;">\r
                <td colspan="4" style="width:163.15pt; border-top-style:solid; border-top-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.5pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__ Compra MB Nuevo</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__ Compra MB USO</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__ Traspaso Recibido</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__ Ajuste de inventario alta</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__ Ajuste de Inventario Alta</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__ P\xE9rdida</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__ Traspaso Efectuado</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__ Pr\xE9stamo temporal al trabajador trabajador</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__ Baja</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td colspan="2" style="width:28.45pt; border-top-style:solid; border-top-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.5pt; padding-left:3.5pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td colspan="2" style="width:9.9pt; border-top-style:solid; border-top-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.5pt; padding-left:3.5pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-left:14.3pt; margin-bottom:0pt; text-indent:-5.8pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td colspan="3" style="width:96.6pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__Traslado interno</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__ Ajuste de Inv</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__ Activo Ocioso</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__Enviado a reparar</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__Otro</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__Pr\xE9stamo fuera de la Entidad</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__ Venta</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">__ Retiro</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:19.15pt;">\r
                <td colspan="18" style="width:496.25pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">I N F O R M E</span><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;</span><span style="font-family:'Trebuchet MS';">T E C N I C O:</span><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:12pt;">\r
                <td colspan="6" style="width:198.6pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Nombre: {{TECNICO_NOMBRE}}</span></p>\r
                </td>\r
                <td colspan="9" style="width:200.35pt; border-top-style:solid; border-top-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.5pt; padding-left:3.5pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Cargo: {{TECNICO_CARGO}}</span></p>\r
                </td>\r
                <td colspan="3" style="width:83.3pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Firma: _____</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:14.15pt;">\r
                <td colspan="4" rowspan="3" style="width:163.15pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Hecho: {{TECNICO_HECHO}}/{{TECNICO_HECHO_MES}}/{{TECNICO_HECHO_ANIO}}</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Nombre: {{TECNICO_NOMBRE}}</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Cargo: {{TECNICO_CARGO}}</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Firma: _________</span></p>\r
                </td>\r
                <td style="width:7.2pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">D</span></p>\r
                </td>\r
                <td colspan="2" style="width:15.15pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">M</span></p>\r
                </td>\r
                <td style="width:9pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.5pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">A</span></p>\r
                </td>\r
                <td colspan="7" style="width:183.45pt; border-top-style:solid; border-top-width:0.75pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Aprobado: {{APROBADO_NOMBRE}}</span></p>\r
                </td>\r
                <td style="width:21.35pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">D</span></p>\r
                </td>\r
                <td style="width:28.45pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">M</span></p>\r
                </td>\r
                <td style="width:19.5pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">A</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:14.15pt;">\r
                <td rowspan="2" style="width:7.2pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:bottom;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td colspan="2" rowspan="2" style="width:15.15pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:bottom;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td rowspan="2" style="width:9pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:bottom;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td colspan="7" style="width:183.45pt; border-right-style:solid; border-right-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Cargo: {{APROBADO_CARGO}}</span></p>\r
                </td>\r
                <td rowspan="2" style="width:21.35pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:bottom;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td rowspan="2" style="width:28.45pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:bottom;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td rowspan="2" style="width:19.5pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:bottom;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:36.35pt;">\r
                <td colspan="7" style="width:183.45pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Firma: ________________</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:14.15pt;">\r
                <td colspan="4" style="width:163.15pt; border-top-style:solid; border-top-width:0.75pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Autorizado: {{AUTORIZADO_NOMBRE}}</span></p>\r
                </td>\r
                <td style="width:7.2pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">D</span></p>\r
                </td>\r
                <td colspan="2" style="width:15.15pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">M</span></p>\r
                </td>\r
                <td style="width:9pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">A</span></p>\r
                </td>\r
                <td colspan="7" style="width:183.45pt; border-top-style:solid; border-top-width:0.75pt; border-right-style:solid; border-right-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Transportador o Receptor: {{TRASPORTADOR_NOMBRE}}</span></p>\r
                </td>\r
                <td style="width:21.35pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">D</span></p>\r
                </td>\r
                <td style="width:28.45pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">M</span></p>\r
                </td>\r
                <td style="width:19.5pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">A</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:14.15pt;">\r
                <td colspan="4" style="width:163.15pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Cargo:________________________</span></p>\r
                </td>\r
                <td rowspan="2" style="width:7.2pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:bottom;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td colspan="2" rowspan="2" style="width:15.15pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:bottom;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td rowspan="2" style="width:9pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:bottom;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td colspan="7" rowspan="2" style="width:183.45pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Firma ____________________</span></p>\r
                </td>\r
                <td rowspan="2" style="width:21.35pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:bottom;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td rowspan="2" style="width:28.45pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:bottom;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
                <td rowspan="2" style="width:19.5pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:bottom;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:43.3pt;">\r
                <td colspan="4" style="width:163.15pt; border-right-style:solid; border-right-width:0.75pt; border-left-style:solid; border-left-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Firma:__________________</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:28.25pt;">\r
                <td colspan="4" style="width:163.15pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Anotado:</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\r
                </td>\r
                <td colspan="7" style="width:148.95pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">Comprobante de Operaciones No.__________________</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\r
                </td>\r
                <td style="width:14.25pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">D</span></p>\r
                </td>\r
                <td style="width:21.35pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">M</span></p>\r
                </td>\r
                <td style="width:28.45pt; border-right-style:solid; border-right-width:0.75pt; border-bottom-style:solid; border-bottom-width:0.75pt; padding-right:3.12pt; padding-left:3.5pt; vertical-align:middle;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">A</span></p>\r
                </td>\r
                <td colspan="4" style="width:85.1pt; border-style:solid; border-width:0.75pt; padding-right:3.12pt; padding-left:3.12pt; vertical-align:top;">\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">No.</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;</span></p>\r
                    <p style="margin-top:0pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><span style="font-family:'Trebuchet MS';">&nbsp;&nbsp;&nbsp;</span></p>\r
                </td>\r
            </tr>\r
            <tr style="height:0pt;">\r
                <td style="width:33.95pt;"><br></td>\r
                <td style="width:89.3pt;"><br></td>\r
                <td style="width:22.5pt;"><br></td>\r
                <td style="width:29.15pt;"><br></td>\r
                <td style="width:14.6pt;"><br></td>\r
                <td style="width:21.85pt;"><br></td>\r
                <td style="width:0.95pt;"><br></td>\r
                <td style="width:16.45pt;"><br></td>\r
                <td style="width:64.6pt;"><br></td>\r
                <td style="width:27.3pt;"><br></td>\r
                <td style="width:14.6pt;"><br></td>\r
                <td style="width:21.85pt;"><br></td>\r
                <td style="width:29.15pt;"><br></td>\r
                <td style="width:36.45pt;"><br></td>\r
                <td style="width:1.85pt;"><br></td>\r
                <td style="width:29.15pt;"><br></td>\r
                <td style="width:36.45pt;"><br></td>\r
                <td style="width:27.25pt;"><br></td>\r
            </tr>\r
        </tbody>\r
    </table>\r
    <p style="margin-top:0pt; margin-bottom:0pt; text-align:justify; line-height:150%;">&nbsp;</p>\r
</div>`;
const injectedStyle = `
<style>
.pdf-raw * { box-sizing: border-box; }
.pdf-raw table, .pdf-raw td, .pdf-raw th { border: 1px solid #000 !important; border-color: #000 !important; }
.pdf-raw table { border-collapse: collapse !important; }
.pdf-raw img { max-width: 100%; }
.pdf-raw td[style], .pdf-raw th[style] { border-color: #000 !important; }
</style>
`;
const _sfc_main$2 = {
  __name: "TrasladoPdfAft",
  __ssrInlineRender: true,
  props: {
    traslado: {
      type: Object,
      default: null
    }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const config = useRuntimeConfig();
    ref(null);
    const isLoading = ref(false);
    const pdfData = ref({
      empresa: "Universidad de Sancti Spiritus Jos\xE9 Mart\xED",
      codigo: "223.0.12.651",
      direccion: "Calle Principal #123",
      area: "",
      areaCodigoReferencia: "",
      inventarioNo: "",
      fechaOperacionDia: "",
      fechaOperacionMes: "",
      fechaOperacionAnio: "",
      alquiler: "N/A",
      depreciacion: "N/A",
      entidad: "Almac\xE9n Central",
      entidadDireccion: "Avenida Central #456",
      entidadArea: "Almac\xE9n",
      entidadCI: "No. Identificaci\xF3n",
      tipoMovimiento: "",
      fundamentacion: "",
      tecnicoNombre: "",
      tecnicoHecho: "",
      tecnicoHechoMes: "",
      tecnicoHechoAnio: "",
      tecnicoCargo: "",
      tecnicoFirma: "Firma autorizada",
      autorizadoNombre: "",
      autorizadoCargo: "",
      autorizadoFirma: "Firma autorizada",
      aprobadoCargo: "Director",
      aprobadoNombre: "Carlos Mart\xEDnez Silva",
      aprobadoFirma: "Firma autorizada",
      trasportadorNombre: "Personal de Transporte",
      trasportadorFirma: "Firma autorizada"
    });
    const assetsList = ref([]);
    const setCurrentDate = () => {
      const now = /* @__PURE__ */ new Date();
      pdfData.value.fechaOperacionDia = String(now.getDate()).padStart(2, "0");
      pdfData.value.fechaOperacionMes = String(now.getMonth() + 1).padStart(2, "0");
      pdfData.value.fechaOperacionAnio = String(now.getFullYear());
      pdfData.value.tecnicoHecho = pdfData.value.fechaOperacionDia;
      pdfData.value.tecnicoHechoMes = pdfData.value.fechaOperacionMes;
      pdfData.value.tecnicoHechoAnio = pdfData.value.fechaOperacionAnio;
    };
    const fetchAreaInfo = async (areaId) => {
      if (!areaId) return null;
      const token = localStorage.getItem("token");
      if (!token) return null;
      try {
        const cleanId = areaId.trim();
        const response = await fetch(`${config.public.backendHost}/areas/${cleanId}`, {
          headers: { Authorization: token }
        });
        if (!response.ok) throw new Error(`Error ${response.status} al obtener \xE1rea`);
        return await response.json();
      } catch (err) {
        console.error("Error fetching area:", err);
        return null;
      }
    };
    const loadUserInfo = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          pdfData.value.autorizadoNombre = user.id_usuario_LDAP || "";
          pdfData.value.autorizadoCargo = user.rol || "";
          if (!pdfData.value.tecnicoNombre) pdfData.value.tecnicoNombre = user.id_usuario_LDAP || "";
          if (!pdfData.value.tecnicoCargo) pdfData.value.tecnicoCargo = user.rol || "";
        } else {
          console.warn('No se encontr\xF3 usuario en localStorage bajo la clave "user"');
        }
      } catch (e) {
        console.error("Error al leer usuario de localStorage", e);
      }
    };
    const fetchAssets = async () => {
      var _a2, _b2;
      var _a, _b, _c, _d;
      if (!((_b = (_a = props.traslado) == null ? void 0 : _a.detalles) == null ? void 0 : _b.length)) {
        assetsList.value = [];
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) return;
      const fetched = [];
      for (const detalle of props.traslado.detalles) {
        const activoId = detalle.id_activoFijo_o_util;
        if (!activoId) continue;
        try {
          const response = await fetch(`${config.public.backendHost}/aft/${activoId.trim()}`, {
            headers: { Authorization: token }
          });
          if (!response.ok) throw new Error(`Error ${response.status} al obtener activo ${activoId}`);
          const data = await response.json();
          fetched.push({
            id: ((_c = data.Id_ActivoFijo) == null ? void 0 : _c.trim()) || "",
            descripcion: ((_d = data.Desc_ActivoFijo) == null ? void 0 : _d.trim()) || "",
            valorInicial: (_a2 = data.Valor_Inicial) != null ? _a2 : 0,
            depreciacionAcumulada: (_b2 = data.Depreciacion_Acumulada) != null ? _b2 : 0
          });
        } catch (err) {
          console.error(`Error fetching aft/${activoId}:`, err);
          fetched.push({ id: activoId, descripcion: "Error al cargar", valorInicial: 0, depreciacionAcumulada: 0 });
        }
      }
      assetsList.value = fetched;
    };
    const loadPdfData = async () => {
      var _a;
      if (!((_a = props.traslado) == null ? void 0 : _a.solicitud)) {
        console.warn("Traslado inv\xE1lido o sin solicitud");
        return;
      }
      const solicitud = props.traslado.solicitud;
      const origenId = props.traslado.id_AreaResponsabilidad_origen;
      setCurrentDate();
      pdfData.value.tipoMovimiento = solicitud.tipo_movimiento || "";
      pdfData.value.fundamentacion = solicitud.fundamentacion || "";
      const areaData = await fetchAreaInfo(origenId);
      if (areaData) {
        pdfData.value.area = (areaData.Desc_AreaResponsabilidad || "").trim();
        pdfData.value.areaCodigoReferencia = (areaData.Id_AreaResponsabilidad || "").trim();
        pdfData.value.inventarioNo = (areaData.Id_Ccosto || "").replace(/\s/g, "");
      } else {
        pdfData.value.area = "\xC1rea no encontrada";
        pdfData.value.inventarioNo = "N/D";
      }
      loadUserInfo();
      await fetchAssets();
    };
    const generateDocumentHtml = () => {
      let html = htmlTemplate;
      const data = pdfData.value;
      const replacements = {
        EMPRESA: data.empresa,
        CODIGO: data.codigo,
        DIRECCION: data.direccion,
        AREA: data.area,
        AREA_CODIGO: data.areaCodigoReferencia,
        INVENTARIO_NO: data.inventarioNo,
        FECHA_DIA: data.fechaOperacionDia,
        FECHA_MES: data.fechaOperacionMes,
        FECHA_ANIO: data.fechaOperacionAnio,
        ENTIDAD: data.entidad,
        ENTIDAD_DIRECCION: data.entidadDireccion,
        ENTIDAD_AREA: data.entidadArea,
        ENTIDAD_CI: data.entidadCI,
        TIPO_MOVIMIENTO: data.tipoMovimiento,
        FUNDAMENTACION: data.fundamentacion,
        TECNICO_NOMBRE: data.tecnicoNombre,
        TECNICO_HECHO: data.tecnicoHecho,
        TECNICO_HECHO_MES: data.tecnicoHechoMes,
        TECNICO_HECHO_ANIO: data.tecnicoHechoAnio,
        TECNICO_CARGO: data.tecnicoCargo,
        TECNICO_FIRMA: data.tecnicoFirma,
        AUTORIZADO_NOMBRE: data.autorizadoNombre,
        AUTORIZADO_CARGO: data.autorizadoCargo,
        AUTORIZADO_FIRMA: data.autorizadoFirma,
        APROBADO_NOMBRE: data.aprobadoNombre,
        APROBADO_CARGO: data.aprobadoCargo,
        APROBADO_FIRMA: data.aprobadoFirma,
        TRASPORTADOR_NOMBRE: data.trasportadorNombre,
        TRASPORTADOR_FIRMA: data.trasportadorFirma
      };
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`{{${key}}}`, "g");
        html = html.replace(regex, value || "");
      }
      const tipoMovimiento = (data.tipoMovimiento || "").trim();
      if (tipoMovimiento) {
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const movimientoEscaped = escapeRegex(tipoMovimiento);
        const regexPattern = new RegExp(`(_{2}\\s*)${movimientoEscaped}`, "i");
        html = html.replace(regexPattern, (match) => match.replace(/_+/, "X "));
      }
      return html;
    };
    const generateAssetsTableHtml = () => {
      if (!assetsList.value.length) {
        return '<div style="page-break-before: always; margin-top: 30mm;"></div><p>No hay activos asociados a este traslado.</p>';
      }
      let tableRows = "";
      for (const asset of assetsList.value) {
        tableRows += `
      <tr>
        <td style="border:1px solid #000; padding:4px;">${asset.id}</td>
        <td style="border:1px solid #000; padding:4px;">${asset.descripcion}</td>
        <td style="border:1px solid #000; padding:4px; text-align:right;">${asset.valorInicial.toFixed(2)}</td>
        <td style="border:1px solid #000; padding:4px; text-align:right;">${asset.depreciacionAcumulada.toFixed(2)}</td>
      </tr>
    `;
      }
      return `
    <div style="page-break-before: always; margin-top: 30mm;"></div>
    <div style="margin-top: 60mm;">
      <h2 style="text-align:center; font-size:14px;">Relaci\xF3n de Activos Trasladados</h2>
      <table style="width:100%; border-collapse:collapse; margin-top:10px;">
        <thead>
          <tr style="background-color:#f0f0f0;">
            <th style="border:1px solid #000; padding:6px;">NI</th>
            <th style="border:1px solid #000; padding:6px;">Descripci\xF3n</th>
            <th style="border:1px solid #000; padding:6px;">Valor inicial</th>
            <th style="border:1px solid #000; padding:6px;">Depreciaci\xF3n acumulada</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <p style="margin-top:20px; font-size:9px;">Fecha de generaci\xF3n: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}</p>
    </div>
  `;
    };
    const fullHtmlContent = computed(() => {
      const docHtml = generateDocumentHtml();
      const tableHtml = generateAssetsTableHtml();
      return injectedStyle + docHtml + tableHtml;
    });
    const exportPdf = async () => {
      return;
    };
    watch(() => props.traslado, async (newVal) => {
      if (newVal) await loadPdfData();
    }, { immediate: true, deep: true });
    __expose({ exportPdf });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<!--[--><div class="absolute left-[-9999px] top-0 w-[210mm] bg-white"><div class="pdf-raw w-[210mm] min-h-[297mm] bg-white p-[10mm] box-border font-[&#39;Arial&#39;] text-[9px] text-black">${(_a = fullHtmlContent.value) != null ? _a : ""}</div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (isLoading.value) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center" style="${ssrRenderStyle({ "pointer-events": "auto" })}"><div class="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[280px]"><div class="w-12 h-12 border-4 border-[#099ebf] border-t-transparent rounded-full animate-spin"></div><p class="text-gray-700 font-medium text-lg">Cargando datos y generando PDF...</p><p class="text-gray-500 text-sm">No cierres esta ventana</p></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TrasladoPdfAft.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const hiddenStyle = "position:absolute; left:-9999px; top:0; width:210mm; min-height:297mm; opacity:0; pointer-events:none;";
const _sfc_main$1 = {
  __name: "TrasladoPdfUtil",
  __ssrInlineRender: true,
  props: {
    traslado: {
      type: Object,
      default: () => ({})
    }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const pdfContent = ref(null);
    (/* @__PURE__ */ new Date()).toLocaleDateString();
    const exportPdf = async () => {
      console.log("TrasladoPdfUtil exportPdf start", { traslado: props.traslado });
      {
        console.warn("TrasladoPdfUtil exportPdf aborted: no browser o pdfContent no disponible");
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
      }, _attrs))} data-v-c145391f><div class="pdf-page bg-white text-slate-900 p-8" style="${ssrRenderStyle({ "width": "210mm", "min-height": "297mm" })}" data-v-c145391f><div class="flex justify-between items-start border-b border-slate-300 pb-4 mb-6" data-v-c145391f><div class="flex items-center gap-4" data-v-c145391f><img${ssrRenderAttr("src", _imports_0)} alt="Logo Universidad" class="h-16 w-auto object-contain" data-v-c145391f><div data-v-c145391f><h1 class="text-xl font-bold uppercase leading-tight" data-v-c145391f>Universidad de Sancti Sp\xEDritus</h1><h2 class="text-lg font-semibold italic" data-v-c145391f>Jos\xE9 Mart\xED P\xE9rez</h2></div></div><div class="text-right text-sm" data-v-c145391f><p data-v-c145391f>Sancti Sp\xEDritus, ___ de _____ de ____</p><p class="font-semibold mt-1" data-v-c145391f>\u201CA\xF1o 67 de la Revoluci\xF3n\u201D</p></div></div><div class="mb-6 text-sm space-y-1" data-v-c145391f><p data-v-c145391f><span class="font-semibold" data-v-c145391f>A:</span> Direcci\xF3n de Econom\xEDa</p><p data-v-c145391f><span class="font-semibold" data-v-c145391f>De:</span> Centro de costo.</p></div><div class="mb-6 text-justify" data-v-c145391f><p data-v-c145391f>Por medio de la presente se solicita el <span class="font-semibold" data-v-c145391f>movimiento de los \xDAtiles y Herramientas</span> que a continuaci\xF3n se detallan.</p></div><div class="overflow-x-auto border border-slate-300 rounded-md mb-8" data-v-c145391f><table class="min-w-full text-sm border-collapse" data-v-c145391f><thead class="bg-slate-100" data-v-c145391f><tr data-v-c145391f><th class="border border-slate-300 px-3 py-2 text-left" data-v-c145391f>C\xF3digo</th><th class="border border-slate-300 px-3 py-2 text-left" data-v-c145391f>Descripci\xF3n</th><th class="border border-slate-300 px-3 py-2 text-left" data-v-c145391f>Cantidad</th><th class="border border-slate-300 px-3 py-2 text-left" data-v-c145391f>C\xF3digo Trabajador</th><th class="border border-slate-300 px-3 py-2 text-left" data-v-c145391f>De \xC1rea:</th><th class="border border-slate-300 px-3 py-2 text-left" data-v-c145391f>C\xF3digo Trabajador</th><th class="border border-slate-300 px-3 py-2 text-left" data-v-c145391f>Para \xC1rea:</th></tr></thead><tbody data-v-c145391f><!--[-->`);
      ssrRenderList(6, (n) => {
        _push(`<tr data-v-c145391f><td class="border border-slate-200 px-3 py-2" data-v-c145391f>\xA0</td><td class="border border-slate-200 px-3 py-2" data-v-c145391f>\xA0</td><td class="border border-slate-200 px-3 py-2" data-v-c145391f>\xA0</td><td class="border border-slate-200 px-3 py-2" data-v-c145391f>\xA0</td><td class="border border-slate-200 px-3 py-2" data-v-c145391f>\xA0</td><td class="border border-slate-200 px-3 py-2" data-v-c145391f>\xA0</td><td class="border border-slate-200 px-3 py-2" data-v-c145391f>\xA0</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div><div class="mt-8 space-y-6 text-sm" data-v-c145391f><div data-v-c145391f><p data-v-c145391f>_________________________________________</p><p class="font-semibold" data-v-c145391f>Nombre y firma del responsable del \xC1rea para donde se encuentra el \xFAtil</p></div><div data-v-c145391f><p data-v-c145391f>_________________________________________</p><p class="font-semibold" data-v-c145391f>Nombre y firma del responsable del \xC1rea para donde va el \xFAtil</p></div><div data-v-c145391f><p data-v-c145391f>_________________________________________</p><p class="font-semibold" data-v-c145391f>Nombre y firma de quien recibe:</p><p class="text-xs text-slate-500" data-v-c145391f>(Espec. en Gesti\xF3n Econ\xF3mica de los \xDAtiles y Herramientas)</p></div></div><div class="text-right text-xs text-slate-400 mt-12" data-v-c145391f><p data-v-c145391f>Documento generado electr\xF3nicamente</p></div></div></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TrasladoPdfUtil.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const TrasladoPdfUtil = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-c145391f"]]);
const _sfc_main = {
  __name: "traslados",
  __ssrInlineRender: true,
  setup(__props) {
    const filtros = ref({
      nota: "",
      estado: "",
      tipo_traslado: "",
      fecha_hora_creacion_desde: "",
      fecha_hora_creacion_hasta: "",
      fecha_hora_cierreSolicitud_desde: "",
      fecha_hora_cierreSolicitud_hasta: "",
      id_AreaResponsabilidad_destino: ""
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
    const currentPage = ref(1);
    const itemsPorPage = ref(20);
    const totalItems = ref(0);
    const isLoading = ref(false);
    const itemsData = ref([]);
    const errorBanner = ref(null);
    const showModal = ref(false);
    const selectedTraslado = ref({});
    const isEditing = ref(false);
    const isViewing = ref(false);
    const showConfirmBanner = ref(false);
    const trasladoAEliminar = ref(null);
    const config = useRuntimeConfig();
    const getUserFromLocalStorage = () => {
      let userStr = localStorage.getItem("usuario");
      if (!userStr) {
        userStr = localStorage.getItem("user");
      }
      if (!userStr) return null;
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error("Error parseando usuario", e);
        return null;
      }
    };
    const obtenerMensajeErrorApi = async (response) => {
      const contentType = response.headers.get("Content-Type") || "";
      try {
        const text = await response.text();
        if (!text) return response.statusText || `Error ${response.status}`;
        if (contentType.includes("application/json")) {
          const data = JSON.parse(text);
          return (data == null ? void 0 : data.error) || (data == null ? void 0 : data.message) || text;
        }
        return text;
      } catch {
        return response.statusText || `Error ${response.status}`;
      }
    };
    const columnasBase = [
      { key: "id_AreaResponsabilidad_origen", label: "\xC1rea Origen" },
      { key: "id_AreaResponsabilidad_destino", label: "\xC1rea Destino" },
      { key: "estado", label: "Estado" },
      { key: "tipo_traslado", label: "Tipo Traslado" },
      { key: "tipo_movimiento", label: "Tipo Movimiento" },
      { key: "cantidad_detalles", label: "Cantidad Activos" }
    ];
    const pdfAftRef = ref(null);
    const pdfUtilRef = ref(null);
    const trasladoParaPdf = ref({});
    const editarTraslado = (item) => {
      selectedTraslado.value = item.raw || item;
      isEditing.value = true;
      isViewing.value = false;
      showModal.value = true;
    };
    const eliminarTraslado = (item) => {
      trasladoAEliminar.value = item.raw || item;
      showConfirmBanner.value = true;
    };
    const handleModeloTraslado = async (item) => {
      var _a, _b, _c, _d, _e;
      trasladoParaPdf.value = item.raw || item;
      const tipo = (((_a = item.solicitud) == null ? void 0 : _a.tipo_traslado) || item.tipo_traslado || "").toString().toLowerCase();
      try {
        if (tipo === "aft") {
          await ((_c = (_b = pdfAftRef.value) == null ? void 0 : _b.exportPdf) == null ? void 0 : _c.call(_b));
        } else {
          await ((_e = (_d = pdfUtilRef.value) == null ? void 0 : _d.exportPdf) == null ? void 0 : _e.call(_d));
        }
      } catch (error) {
        errorBanner.value = {
          title: "Error",
          description: (error == null ? void 0 : error.message) || "No se pudo generar el modelo de traslado.",
          type: "error"
        };
      }
    };
    const acciones = [
      {
        name: "Modelo para traslado",
        buttonClass: "px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600",
        handler: handleModeloTraslado
      },
      {
        name: "Editar",
        buttonClass: "px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600",
        handler: editarTraslado,
        visible: (item) => {
          var _a, _b;
          return (item.estado || ((_b = (_a = item.raw) == null ? void 0 : _a.solicitud) == null ? void 0 : _b.estado)) !== "Completada";
        }
      },
      {
        name: "Eliminar",
        buttonClass: "px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600",
        handler: eliminarTraslado,
        visible: (item) => {
          var _a, _b;
          return (item.estado || ((_b = (_a = item.raw) == null ? void 0 : _a.solicitud) == null ? void 0 : _b.estado)) !== "Completada";
        }
      }
    ];
    const confirmarEliminar = async () => {
      if (!trasladoAEliminar.value) return;
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch(`${config.public.backendHost}/traslados/${trasladoAEliminar.value.id_solicitud}`, {
          method: "DELETE",
          headers: { Authorization: token }
        });
        if (!response.ok) throw new Error("Error al eliminar");
        errorBanner.value = { title: "\xC9xito", description: "Traslado eliminado correctamente", type: "success" };
        await fetchTraslados(currentPage.value);
      } catch (err) {
        errorBanner.value = { title: "Error", description: err.message, type: "error" };
      } finally {
        showConfirmBanner.value = false;
        trasladoAEliminar.value = null;
      }
    };
    const fetchTraslados = async (page = 1) => {
      const token = localStorage.getItem("token");
      if (!token) return navigateTo("/");
      const user = getUserFromLocalStorage();
      if (!user) {
        errorBanner.value = { title: "Error", description: "No se encontraron datos de usuario. Redirigiendo...", type: "error" };
        setTimeout(() => navigateTo("/"), 2e3);
        return;
      }
      let areaOrigen = user.id_AreaResponsabilidad;
      if (!areaOrigen) {
        errorBanner.value = { title: "Error", description: "El usuario no tiene \xE1rea de responsabilidad asignada.", type: "error" };
        return;
      }
      areaOrigen = String(areaOrigen).trim();
      isLoading.value = true;
      errorBanner.value = null;
      try {
        const body = {};
        if (filtros.value.nota) body.nota = filtros.value.nota;
        if (filtros.value.estado) body.estado = filtros.value.estado;
        if (filtros.value.tipo_traslado) body.tipo_traslado = filtros.value.tipo_traslado;
        if (filtros.value.fecha_hora_creacion_desde) body.fecha_hora_creacion_desde = new Date(filtros.value.fecha_hora_creacion_desde).toISOString();
        if (filtros.value.fecha_hora_creacion_hasta) body.fecha_hora_creacion_hasta = new Date(filtros.value.fecha_hora_creacion_hasta).toISOString();
        if (filtros.value.fecha_hora_cierreSolicitud_desde) body.fecha_hora_cierreSolicitud_desde = new Date(filtros.value.fecha_hora_cierreSolicitud_desde).toISOString();
        if (filtros.value.fecha_hora_cierreSolicitud_hasta) body.fecha_hora_cierreSolicitud_hasta = new Date(filtros.value.fecha_hora_cierreSolicitud_hasta).toISOString();
        body.id_AreaResponsabilidad_origen = areaOrigen;
        if (filtros.value.id_AreaResponsabilidad_destino) {
          body.id_AreaResponsabilidad_destino = filtros.value.id_AreaResponsabilidad_destino.trim();
        }
        if (user.id_usuario) {
          body.id_usuario = user.id_usuario;
        } else {
          console.warn("El usuario no tiene id_usuario, no se enviar\xE1 ese filtro");
        }
        console.log("Enviando a /traslados/filtrar:", JSON.stringify(body, null, 2));
        const res = await fetch(`${config.public.backendHost}/traslados/filtrar/${page}/${itemsPorPage.value}`, {
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
          var _a, _b, _c, _d;
          return {
            id_solicitud: item.id_solicitud,
            id_AreaResponsabilidad_origen: item.id_AreaResponsabilidad_origen,
            id_AreaResponsabilidad_destino: item.id_AreaResponsabilidad_destino,
            estado: ((_a = item.solicitud) == null ? void 0 : _a.estado) || "",
            tipo_traslado: ((_b = item.solicitud) == null ? void 0 : _b.tipo_traslado) || "",
            tipo_movimiento: ((_c = item.solicitud) == null ? void 0 : _c.tipo_movimiento) || "",
            cantidad_detalles: ((_d = item.detalles) == null ? void 0 : _d.length) || 0,
            raw: item
          };
        });
        totalItems.value = data.total || 0;
        currentPage.value = data.pagina || page;
      } catch (err) {
        console.error("Error en fetchTraslados:", err);
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
    const handlePageChange = (page) => fetchTraslados(page);
    const handleRowClick = (item) => {
      selectedTraslado.value = item.raw || item;
      isEditing.value = false;
      isViewing.value = true;
      showModal.value = true;
    };
    const handleSubmitTraslado = async (payload) => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        let response;
        if (isEditing.value && selectedTraslado.value.id_solicitud) {
          response = await fetch(`${config.public.backendHost}/traslados/${selectedTraslado.value.id_solicitud}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify(payload)
          });
        } else {
          response = await fetch(`${config.public.backendHost}/traslados`, {
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
          title: isEditing.value ? "Traslado actualizado" : "Traslado creado",
          description: "Operaci\xF3n exitosa",
          type: "success"
        };
        showModal.value = false;
        fetchTraslados(currentPage.value);
      } catch (err) {
        errorBanner.value = { title: "Error", description: err.message, type: "error" };
      }
    };
    const refrescarLista = () => fetchTraslados(currentPage.value);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white" }, _attrs))}>`);
      _push(ssrRenderComponent(SeoMeta, {
        title: "Traslados - AFTUP",
        description: "Gesti\xF3n de traslados de activos fijos tangibles y \xFAtiles.",
        canonical: "/traslados"
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
          title: "\xBFEst\xE1s seguro de eliminar este traslado?",
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
      _push(`</div><div><label class="block text-sm font-medium text-gray-700 mb-1">Tipo traslado</label><input type="text"${ssrRenderAttr("value", filtros.value.tipo_traslado)} placeholder="aft / util" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">\xC1rea destino</label><input type="text"${ssrRenderAttr("value", filtros.value.id_AreaResponsabilidad_destino)} placeholder="ID \xE1rea destino" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Fecha creaci\xF3n (desde)</label><input type="datetime-local"${ssrRenderAttr("value", filtros.value.fecha_hora_creacion_desde)} class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Fecha creaci\xF3n (hasta)</label><input type="datetime-local"${ssrRenderAttr("value", filtros.value.fecha_hora_creacion_hasta)} class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div></div><div class="flex justify-end gap-2 flex-wrap mt-4"><button class="px-6 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] focus:ring-offset-2 transition-colors"> Buscar </button><button class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"> Limpiar </button></div></div></div><div class="w-[95%] mx-auto px-4 py-4"><div class="flex justify-between items-center mb-4"><h2 class="text-2xl font-bold text-[#077a99]">Movimientos</h2><button class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Nuevo Traslado </button></div>`);
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
      _push(ssrRenderComponent(_sfc_main$2, {
        ref_key: "pdfAftRef",
        ref: pdfAftRef,
        traslado: trasladoParaPdf.value
      }, null, _parent));
      _push(ssrRenderComponent(TrasladoPdfUtil, {
        ref_key: "pdfUtilRef",
        ref: pdfUtilRef,
        traslado: trasladoParaPdf.value
      }, null, _parent));
      _push(`</div></div>`);
      _push(ssrRenderComponent(_sfc_main$3, {
        modelValue: showModal.value,
        "onUpdate:modelValue": ($event) => showModal.value = $event,
        traslado: selectedTraslado.value,
        "is-editing": isEditing.value,
        "is-viewing": isViewing.value,
        onSubmit: handleSubmitTraslado,
        onSuccess: refrescarLista
      }, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/traslados.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=traslados-Cp8i963n.mjs.map
