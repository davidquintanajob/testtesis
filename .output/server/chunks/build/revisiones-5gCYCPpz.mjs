import { ref, computed, watch, mergeProps, nextTick, reactive, withCtx, createVNode, createBlock, createCommentVNode, openBlock, toDisplayString, Fragment, renderList, createTextVNode, withDirectives, vModelText, vModelCheckbox, vModelSelect, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderList, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { N as Navbar } from './Navbar-Ds5Ji1IO.mjs';
import { S as SeoMeta, _ as _sfc_main$2 } from './MessageBanner-C3gOLDB5.mjs';
import { _ as _sfc_main$4, D as DataTable } from './SelectSearchAPI-w3fp5OUm.mjs';
import { _ as _sfc_main$1$1, a as _sfc_main$5 } from './Modal-DHe5Mkod.mjs';
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
  __name: "RevisionesModal",
  __ssrInlineRender: true,
  props: {
    modelValue: Boolean,
    revision: { type: Object, default: () => ({}) },
    isEditing: { type: Boolean, default: false },
    isViewing: { type: Boolean, default: false },
    isProcessing: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "submit", "success"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const config = useRuntimeConfig();
    const dataLoading = ref(false);
    const message = ref(null);
    const errorList = ref([]);
    const contentWrapper = ref(null);
    const selectResponsableRef = ref(null);
    const responsableSeleccionado = ref(null);
    const cargandoElementos = ref(false);
    const loadingMessage = ref("Cargando datos...");
    const isSubmitting = ref(false);
    const filterCodeView = ref("");
    const filterNameView = ref("");
    const showScanner = ref(false);
    let html5QrCode = null;
    const guardandoRevision = ref(false);
    const usuarioLogueado = ref(null);
    const idUsuarioJefe = ref(null);
    const rolUsuario = ref("");
    const rolesEspeciales = ["Responsable de \xC1rea", "Jefe de \xC1rea"];
    const esUsuarioConRolEspecial = computed(() => {
      if (!usuarioLogueado.value) return false;
      const rol = usuarioLogueado.value.rol;
      return rolesEspeciales.includes(rol);
    });
    const rolUsuarioActual = computed(() => {
      var _a;
      return ((_a = usuarioLogueado.value) == null ? void 0 : _a.rol) || "";
    });
    const areaUsuarioActual = computed(() => {
      var _a, _b;
      return ((_b = (_a = usuarioLogueado.value) == null ? void 0 : _a.id_AreaResponsabilidad) == null ? void 0 : _b.trim()) || "Sin \xE1rea asignada";
    });
    const revisionData = ref({});
    const areaDesc = ref("");
    const usuarioCreadorNombre = ref("");
    const elementosMostrar = ref([]);
    const usuariosMostrar = ref([]);
    const elementosVistaConCheckbox = ref([]);
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
      usuarios_list: [],
      lista_activos: [],
      id_AreaResponsabilidad: ""
    });
    const tipoElementoLabel = computed(() => form.tipo_traslado === "aft" ? "Activos Fijos" : "\xDAtiles");
    const endpointElementosCarga = computed(() => form.tipo_traslado === "aft" ? "/aft/filtrar/1/999999" : "/utiles/filtrar/1/999999");
    const bodyKeyArea = computed(() => form.tipo_traslado === "aft" ? "ID_AreaResp" : "Id_AreaResponsabilidad");
    const filteredElementosVista = computed(() => {
      let result = elementosVistaConCheckbox.value;
      if (filterCodeView.value) {
        const codeFilter = filterCodeView.value.toLowerCase().trim();
        result = result.filter((item) => item.id && item.id.toLowerCase().includes(codeFilter));
      }
      if (filterNameView.value) {
        const nameFilter = filterNameView.value.toLowerCase().trim();
        result = result.filter((item) => item.descripcion && item.descripcion.toLowerCase().includes(nameFilter));
      }
      return result;
    });
    const reviewedCountView = computed(
      () => elementosVistaConCheckbox.value.filter((item) => item.isRevisado).length
    );
    const getOriginalIndexVista = (filteredItem) => {
      return elementosVistaConCheckbox.value.findIndex((orig) => orig.id === filteredItem.id);
    };
    const clearFiltersView = () => {
      filterCodeView.value = "";
      filterNameView.value = "";
    };
    async function cargarUsuarios() {
      console.log("[RevisionesModal] cargarUsuarios iniciando...");
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
            description: "No se encontraron especialistas ni jefe para asociar a la revisi\xF3n.",
            type: "warning"
          };
        }
      } catch (err) {
        console.error("[RevisionesModal] Error cargando usuarios:", err);
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
        const res = await fetch(`${config.public.backendHost}/areas/${idArea}`, {
          headers: { Authorization: token }
        });
        if (!res.ok) throw new Error("Error al cargar \xE1rea");
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
        const res = await fetch(`${config.public.backendHost}${endpoint}`, {
          headers: { Authorization: token }
        });
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
    async function cargarYReemplazarElementos(areaId) {
      if (!areaId) return [];
      cargandoElementos.value = true;
      dataLoading.value = true;
      loadingMessage.value = `Cargando ${tipoElementoLabel.value} del \xE1rea...`;
      try {
        const token = localStorage.getItem("token");
        const payload = { [bodyKeyArea.value]: areaId };
        const res = await fetch(`${config.public.backendHost}${endpointElementosCarga.value}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Error al obtener elementos");
        const data = await res.json();
        const items = data.datos || [];
        const nuevosElementos = items.map((item) => {
          var _a, _b;
          let id, desc;
          if (form.tipo_traslado === "aft") {
            id = (_a = item.Id_ActivoFijo) == null ? void 0 : _a.trim();
            desc = item.Desc_ActivoFijo;
          } else {
            id = (_b = item.Id_UH) == null ? void 0 : _b.trim();
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
        message.value = { title: "Error", description: "No se pudieron cargar los elementos del \xE1rea.", type: "error" };
        return [];
      } finally {
        cargandoElementos.value = false;
        dataLoading.value = false;
      }
    }
    async function onResponsableSeleccionado(usuario) {
      var _a;
      if (!usuario) return;
      responsableSeleccionado.value = usuario;
      const areaUsuario = (_a = usuario.id_AreaResponsabilidad) == null ? void 0 : _a.trim();
      if (!areaUsuario) {
        message.value = { title: "Advertencia", description: "El usuario seleccionado no tiene un \xE1rea de responsabilidad asignada.", type: "warning" };
        form.lista_activos = [];
        form.id_AreaResponsabilidad = "";
        return;
      }
      await cargarYReemplazarElementos(areaUsuario);
    }
    function limpiarResponsable() {
      responsableSeleccionado.value = null;
      form.lista_activos = [];
      form.id_AreaResponsabilidad = "";
      if (selectResponsableRef.value && selectResponsableRef.value.clearSearch) {
        selectResponsableRef.value.clearSearch();
      }
    }
    async function cargarElementosDelUsuarioActual() {
      var _a;
      if (!usuarioLogueado.value) return;
      const areaId = (_a = usuarioLogueado.value.id_AreaResponsabilidad) == null ? void 0 : _a.trim();
      if (!areaId) {
        message.value = { title: "Advertencia", description: "Su usuario no tiene un \xE1rea de responsabilidad asignada.", type: "warning" };
        form.lista_activos = [];
        form.id_AreaResponsabilidad = "";
        return;
      }
      await cargarYReemplazarElementos(areaId);
    }
    async function cargarDatosComplementarios(revision) {
      var _a, _b, _c;
      if (!revision || Object.keys(revision).length === 0) return;
      if (revision.id_AreaResponsabilidad) {
        const desc = await cargarArea(revision.id_AreaResponsabilidad);
        areaDesc.value = desc;
      }
      if (((_a = revision.solicitud) == null ? void 0 : _a.usuarios) && revision.solicitud.usuarios.length > 0) {
        const creador = revision.solicitud.usuarios[0];
        usuarioCreadorNombre.value = creador.id_usuario_LDAP || creador.id_usuario;
      } else {
        usuarioCreadorNombre.value = "";
      }
      const tipo = ((_b = revision.solicitud) == null ? void 0 : _b.tipo_traslado) || "aft";
      const detalles = revision.detalles || [];
      const elementosPromises = detalles.map((d) => cargarElementoPorId(tipo, d.id_activoFijo_o_util));
      const elementos = await Promise.all(elementosPromises);
      elementosMostrar.value = detalles.map((d, idx) => ({
        ...elementos[idx],
        isRevisado: d.isRevisado
      }));
      elementosVistaConCheckbox.value = elementosMostrar.value.map((e) => ({ ...e }));
      if ((_c = revision.solicitud) == null ? void 0 : _c.usuarios) {
        usuariosMostrar.value = revision.solicitud.usuarios;
      } else {
        usuariosMostrar.value = [];
      }
    }
    async function loadExistingData(revision) {
      var _a, _b, _c, _d, _e, _f;
      if (!revision || Object.keys(revision).length === 0) return;
      dataLoading.value = true;
      try {
        revisionData.value = revision;
        await cargarDatosComplementarios(revision);
        if (!props.isViewing || props.isEditing) {
          form.nota = ((_a = revision.solicitud) == null ? void 0 : _a.nota) || "";
          form.tipo_traslado = ((_b = revision.solicitud) == null ? void 0 : _b.tipo_traslado) || "aft";
          form.tipo_movimiento = ((_c = revision.solicitud) == null ? void 0 : _c.tipo_movimiento) || "";
          form.fundamentacion = ((_d = revision.solicitud) == null ? void 0 : _d.fundamentacion) || "";
          form.estado = ((_e = revision.solicitud) == null ? void 0 : _e.estado) || "Pendiente";
          form.id_AreaResponsabilidad = revision.id_AreaResponsabilidad || "";
          const tipo = ((_f = revision.solicitud) == null ? void 0 : _f.tipo_traslado) || "aft";
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
        console.error("Error cargando datos de la revisi\xF3n:", err);
        message.value = {
          title: "Error",
          description: "No se pudieron cargar los datos de la revisi\xF3n",
          type: "error"
        };
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
      form.lista_activos = [];
      form.id_AreaResponsabilidad = "";
      errorList.value = [];
      areaDesc.value = "";
      usuarioCreadorNombre.value = "";
      elementosMostrar.value = [];
      usuariosMostrar.value = [];
      revisionData.value = {};
      responsableSeleccionado.value = null;
      elementosVistaConCheckbox.value = [];
      clearFiltersView();
      message.value = null;
    }
    function getUsuariosIds() {
      return form.usuarios_list.map((item) => item.id);
    }
    function getListaActivos() {
      return form.lista_activos.map((item) => ({
        id_activoFijo_o_util: item.id,
        isRevisado: item.isRevisado || false
      }));
    }
    function eliminarElemento(idx) {
      form.lista_activos.splice(idx, 1);
    }
    function onCheckboxChange(item, idx) {
      if (idx !== -1) {
        elementosVistaConCheckbox.value[idx].isRevisado = item.isRevisado;
      }
    }
    async function guardarCambiosRevision() {
      if (!revisionData.value.id_solicitud) return;
      guardandoRevision.value = true;
      dataLoading.value = true;
      loadingMessage.value = "Guardando cambios...";
      try {
        const token = localStorage.getItem("token");
        const payload = {
          lista_activos: elementosVistaConCheckbox.value.map((item) => ({
            id_activoFijo_o_util: item.id,
            isRevisado: item.isRevisado
          }))
        };
        const res = await fetch(`${config.public.backendHost}/revisiones/${revisionData.value.id_solicitud}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Error al actualizar la revisi\xF3n");
        message.value = { title: "\xC9xito", description: "Cambios guardados correctamente", type: "success" };
        await loadExistingData(revisionData.value);
      } catch (err) {
        console.error(err);
        message.value = { title: "Error", description: err.message, type: "error" };
      } finally {
        guardandoRevision.value = false;
        dataLoading.value = false;
      }
    }
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
            const scanned = decodedText.replace(/\s/g, "");
            const index = elementosVistaConCheckbox.value.findIndex((item) => {
              const itemIdClean = item.id.replace(/\s/g, "");
              return itemIdClean === scanned;
            });
            if (index !== -1 && !elementosVistaConCheckbox.value[index].isRevisado) {
              elementosVistaConCheckbox.value[index].isRevisado = true;
              message.value = { title: "\xC9xito", description: `Elemento "${elementosVistaConCheckbox.value[index].descripcion}" marcado como revisado`, type: "success" };
              setTimeout(() => message.value = null, 3e3);
            } else if (index !== -1 && elementosVistaConCheckbox.value[index].isRevisado) {
              message.value = { title: "Info", description: "El elemento ya estaba marcado como revisado", type: "info" };
            } else {
              message.value = { title: "No encontrado", description: "El c\xF3digo escaneado no coincide con ning\xFAn elemento", type: "warning" };
            }
            setTimeout(() => message.value = null, 3e3);
            closeScanner();
          },
          (error) => {
            console.warn("Scan error", error);
          }
        );
      } catch (err) {
        console.error("Error al iniciar esc\xE1ner", err);
        message.value = { title: "Error", description: "No se pudo iniciar la c\xE1mara", type: "error" };
        showScanner.value = false;
      }
    }
    function closeScanner() {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          html5QrCode = null;
          showScanner.value = false;
        }).catch((err) => console.warn("Error al detener esc\xE1ner", err));
      } else {
        showScanner.value = false;
      }
    }
    watch(() => form.tipo_traslado, async () => {
      var _a;
      if (esUsuarioConRolEspecial.value) {
        await cargarElementosDelUsuarioActual();
      } else if (responsableSeleccionado.value) {
        const areaId = (_a = responsableSeleccionado.value.id_AreaResponsabilidad) == null ? void 0 : _a.trim();
        if (areaId) {
          await cargarYReemplazarElementos(areaId);
        }
      } else {
        form.lista_activos = [];
        form.id_AreaResponsabilidad = "";
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
      emit("update:modelValue", false);
      setTimeout(() => {
        emit("submit", { action: "edit", data: revisionData.value });
      }, 200);
    }
    async function onSubmit() {
      var _a;
      errorList.value = [];
      if (!form.id_AreaResponsabilidad) errorList.value.push("No se ha seleccionado un \xE1rea de responsabilidad (debe seleccionar un responsable o tener rol especial)");
      if (form.lista_activos.length === 0) errorList.value.push("Debe agregar al menos un elemento (AFT o \xDAtil)");
      if (form.usuarios_list.length === 0) errorList.value.push("Debe haber al menos un usuario involucrado");
      if (errorList.value.length) return;
      isSubmitting.value = true;
      dataLoading.value = true;
      loadingMessage.value = props.isEditing ? "Actualizando revisi\xF3n..." : "Creando revisi\xF3n...";
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No hay sesi\xF3n activa");
        const usuarioCreador = ((_a = usuarioLogueado.value) == null ? void 0 : _a.id_usuario) || null;
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
          method = "PUT";
        } else {
          url = `${config.public.backendHost}/revisiones`;
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
            errorMessage = errData.error || errData.message || JSON.stringify(errData);
          } catch {
            errorMessage = await response.text().catch(() => errorMessage);
          }
          throw new Error(errorMessage);
        }
        message.value = {
          title: "\xC9xito",
          description: `Revisi\xF3n ${props.isEditing ? "actualizada" : "creada"} correctamente`,
          type: "success"
        };
        emit("success");
        setTimeout(() => {
          emit("update:modelValue", false);
        }, 1500);
      } catch (err) {
        console.error("Error en onSubmit:", err);
        message.value = {
          title: "Error",
          description: err.message,
          type: "error"
        };
      } finally {
        isSubmitting.value = false;
        dataLoading.value = false;
      }
    }
    function onRequestClose() {
      if (dataLoading.value) return;
      emit("update:modelValue", false);
    }
    function cargarUsuarioLocal() {
      var _a, _b;
      try {
        const userStr = localStorage.getItem("usuario");
        if (userStr) {
          usuarioLogueado.value = JSON.parse(userStr);
          rolUsuario.value = ((_a = usuarioLogueado.value) == null ? void 0 : _a.rol) || "";
          idUsuarioJefe.value = ((_b = usuarioLogueado.value) == null ? void 0 : _b.id_usuario_jefe) || null;
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
          if (props.revision && Object.keys(props.revision).length > 0) {
            await loadExistingData(props.revision);
          } else {
            resetFormFields();
            if (esUsuarioConRolEspecial.value) {
              await cargarElementosDelUsuarioActual();
            }
          }
        } catch (err) {
          console.error("[RevisionesModal] Error en inicializaci\xF3n:", err);
        } finally {
          dataLoading.value = false;
        }
      }
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$5, mergeProps({
        show: __props.modelValue,
        onClose: onRequestClose,
        size: "3xl"
      }, _attrs), {
        title: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3 class="text-lg font-semibold text-gray-900"${_scopeId}>${ssrInterpolate(__props.isViewing ? "Detalles de la Revisi\xF3n" : __props.isEditing ? "Editar Revisi\xF3n" : "Nueva Revisi\xF3n")}</h3>`);
          } else {
            return [
              createVNode("h3", { class: "text-lg font-semibold text-gray-900" }, toDisplayString(__props.isViewing ? "Detalles de la Revisi\xF3n" : __props.isEditing ? "Editar Revisi\xF3n" : "Nueva Revisi\xF3n"), 1)
            ];
          }
        }),
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b, _c, _d, _e, _f;
          if (_push2) {
            _push2(`<div class="${ssrRenderClass(["transition-opacity", dataLoading.value && "pointer-events-none opacity-50"])}"${_scopeId}>`);
            if (dataLoading.value) {
              _push2(`<div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"${_scopeId}><div class="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4"${_scopeId}><div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"${_scopeId}></div><p class="text-gray-700 font-medium"${_scopeId}>${ssrInterpolate(loadingMessage.value)}</p></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (showScanner.value) {
              _push2(`<div class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80"${_scopeId}><div class="bg-white rounded-lg p-4 w-full max-w-md"${_scopeId}><div class="flex justify-between items-center mb-3"${_scopeId}><h3 class="text-lg font-semibold"${_scopeId}>Esc\xE1ner QR / c\xF3digo de barras</h3><button class="text-gray-500 hover:text-gray-700"${_scopeId}><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"${_scopeId}></path></svg></button></div><div id="qr-reader" class="w-full"${_scopeId}></div><p class="text-sm text-gray-500 mt-3"${_scopeId}>Apunte la c\xE1mara al c\xF3digo QR o barras</p></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (message.value) {
              _push2(`<div class="mb-4"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$2, {
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
              _push2(`<div class="space-y-6"${_scopeId}><div class="bg-gray-50 rounded-lg p-4"${_scopeId}><h4 class="text-md font-medium text-gray-900 mb-3"${_scopeId}>Informaci\xF3n General</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-4"${_scopeId}><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>ID Solicitud</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(revisionData.value.id_solicitud || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Nota</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(((_a = revisionData.value.solicitud) == null ? void 0 : _a.nota) || "Sin nota")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Tipo Traslado</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(((_b = revisionData.value.solicitud) == null ? void 0 : _b.tipo_traslado) || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Estado</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(((_c = revisionData.value.solicitud) == null ? void 0 : _c.estado) || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>\xC1rea Responsabilidad</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(areaDesc.value || revisionData.value.id_AreaResponsabilidad || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Usuario Creador</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(usuarioCreadorNombre.value || "N/A")}</p></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700"${_scopeId}>Fecha Creaci\xF3n</label><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(revisionData.value.createdAt ? new Date(revisionData.value.createdAt).toLocaleString() : "N/A")}</p></div></div></div><div class="bg-blue-50 rounded-lg p-4"${_scopeId}><h4 class="text-md font-medium text-gray-900 mb-3"${_scopeId}>Usuarios Involucrados</h4>`);
              if (usuariosMostrar.value.length) {
                _push2(`<div class="flex flex-wrap gap-2"${_scopeId}><!--[-->`);
                ssrRenderList(usuariosMostrar.value, (u) => {
                  _push2(`<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"${_scopeId}>${ssrInterpolate(u.id_usuario_LDAP || u.nombre_usuario || u.id_usuario)}</span>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="text-sm text-gray-500"${_scopeId}>No hay usuarios asociados</p>`);
              }
              _push2(`</div><div class="bg-green-50 rounded-lg p-4"${_scopeId}><div class="flex flex-wrap items-center justify-between gap-3 mb-3"${_scopeId}><h4 class="text-md font-medium text-gray-900"${_scopeId}>Elementos a Revisar</h4><div class="flex flex-wrap gap-2"${_scopeId}><button class="px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 flex items-center gap-1"${_scopeId}><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"${_scopeId}></path></svg> Escanear QR / C\xF3digo </button><button${ssrIncludeBooleanAttr(guardandoRevision.value) ? " disabled" : ""} class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"${_scopeId}>${ssrInterpolate(guardandoRevision.value ? "Guardando..." : "Guardar cambios")}</button></div></div>`);
              if (elementosVistaConCheckbox.value.length) {
                _push2(`<div class="mb-3 flex flex-wrap items-end gap-3 justify-between"${_scopeId}><div class="flex flex-wrap gap-3"${_scopeId}><div${_scopeId}><label class="block text-xs font-medium text-gray-600 mb-1"${_scopeId}>Filtrar por c\xF3digo</label><input type="text"${ssrRenderAttr("value", filterCodeView.value)} placeholder="Ej: AFT-001, UTIL-123" class="w-48 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#099ebf]"${_scopeId}></div><div${_scopeId}><label class="block text-xs font-medium text-gray-600 mb-1"${_scopeId}>Filtrar por nombre</label><input type="text"${ssrRenderAttr("value", filterNameView.value)} placeholder="Ej: Laptop, Silla" class="w-48 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#099ebf]"${_scopeId}></div>`);
                if (filterCodeView.value || filterNameView.value) {
                  _push2(`<button class="text-xs text-[#099ebf] hover:underline self-end mb-1"${_scopeId}> Limpiar </button>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><div class="text-sm bg-gray-100 px-3 py-1.5 rounded-lg"${_scopeId}><span class="font-medium"${_scopeId}>Resumen:</span> Total: ${ssrInterpolate(elementosVistaConCheckbox.value.length)} | Revisados: ${ssrInterpolate(reviewedCountView.value)}</div></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (filteredElementosVista.value.length) {
                _push2(`<div class="space-y-2 max-h-64 overflow-y-auto border rounded p-2 bg-white"${_scopeId}><!--[-->`);
                ssrRenderList(filteredElementosVista.value, (item) => {
                  _push2(`<div class="flex items-center gap-2"${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(item.isRevisado) ? ssrLooseContain(item.isRevisado, null) : item.isRevisado) ? " checked" : ""} class="rounded border-gray-300 text-[#099ebf] focus:ring-[#099ebf]"${_scopeId}><span class="${ssrRenderClass(["text-sm", item.isRevisado ? "line-through text-gray-500" : ""])}"${_scopeId}>${ssrInterpolate(item.descripcion)} (${ssrInterpolate(item.id)}) </span></div>`);
                });
                _push2(`<!--]--></div>`);
              } else if (elementosVistaConCheckbox.value.length && filteredElementosVista.value.length === 0) {
                _push2(`<div class="text-sm text-gray-500 italic p-2"${_scopeId}> No hay elementos que coincidan con los filtros. </div>`);
              } else {
                _push2(`<div class="text-sm text-gray-500 italic"${_scopeId}>No hay elementos asociados</div>`);
              }
              _push2(`</div><div class="flex justify-end gap-2"${_scopeId}><button class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99]"${_scopeId}>Editar Revisi\xF3n</button></div></div>`);
            } else {
              _push2(`<div class="space-y-6"${_scopeId}><div class="grid grid-cols-1 md:grid-cols-2 gap-4"${_scopeId}><div class="md:col-span-2"${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Nota</label><textarea rows="3" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Motivo de la revisi\xF3n..."${_scopeId}>${ssrInterpolate(form.nota)}</textarea></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Tipo Traslado</label><select class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"${_scopeId}><option value="aft"${ssrIncludeBooleanAttr(Array.isArray(form.tipo_traslado) ? ssrLooseContain(form.tipo_traslado, "aft") : ssrLooseEqual(form.tipo_traslado, "aft")) ? " selected" : ""}${_scopeId}>Activo Fijo Tangible (AFT)</option><option value="util"${ssrIncludeBooleanAttr(Array.isArray(form.tipo_traslado) ? ssrLooseContain(form.tipo_traslado, "util") : ssrLooseEqual(form.tipo_traslado, "util")) ? " selected" : ""}${_scopeId}>\xDAtil</option></select></div><div${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>Estado</label><select${ssrIncludeBooleanAttr(isEstadoDisabled.value) ? " disabled" : ""} class="${ssrRenderClass([{ "bg-gray-100 cursor-not-allowed": isEstadoDisabled.value }, "w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"])}"${_scopeId}><!--[-->`);
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
              _push2(`</div><div class="md:col-span-2"${_scopeId}><label class="block text-sm font-medium text-gray-700 mb-1"${_scopeId}>${ssrInterpolate(esUsuarioConRolEspecial.value ? "Tus elementos (seg\xFAn tu \xE1rea de responsabilidad)" : "Responsable del \xE1rea cuyos elementos se incluir\xE1n autom\xE1ticamente")}</label>`);
              if (!esUsuarioConRolEspecial.value) {
                _push2(`<div class="flex gap-2 mb-3"${_scopeId}>`);
                _push2(ssrRenderComponent(_sfc_main$4, {
                  ref_key: "selectResponsableRef",
                  ref: selectResponsableRef,
                  modelValue: responsableSeleccionado.value,
                  "onUpdate:modelValue": ($event) => responsableSeleccionado.value = $event,
                  multiple: false,
                  endpoint: "/usuarios/filtrar/1/5",
                  method: "POST",
                  "search-key": "id_usuario_LDAP",
                  "label-key": "id_usuario_LDAP",
                  "value-key": "id_usuario",
                  "label-format": "{{id_usuario_LDAP}} (ID: {{id_usuario}}) - \xC1rea: {{id_AreaResponsabilidad}}",
                  placeholder: "Buscar usuario responsable...",
                  "direct-data": false,
                  "data-key": "datos",
                  onEntidadSeleccionada: onResponsableSeleccionado
                }, null, _parent2, _scopeId));
                _push2(`<button type="button" class="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"${_scopeId}> Limpiar </button></div>`);
              } else {
                _push2(`<div class="mb-3 p-2 bg-blue-50 rounded text-sm"${_scopeId}> Eres ${ssrInterpolate(rolUsuarioActual.value)}. Se cargar\xE1n autom\xE1ticamente todos los ${ssrInterpolate(tipoElementoLabel.value)} de tu \xE1rea (${ssrInterpolate(areaUsuarioActual.value)}). </div>`);
              }
              if (cargandoElementos.value) {
                _push2(`<div class="text-sm text-gray-500 italic mt-1"${_scopeId}>Cargando elementos...</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<label class="block text-sm font-medium text-gray-700 mt-4 mb-1"${_scopeId}> Elementos incluidos en esta revisi\xF3n (${ssrInterpolate(form.lista_activos.length)}) </label>`);
              if (form.lista_activos.length) {
                _push2(`<div class="border rounded-lg divide-y max-h-64 overflow-y-auto"${_scopeId}><!--[-->`);
                ssrRenderList(form.lista_activos, (item, idx) => {
                  _push2(`<div class="flex justify-between items-center p-2 hover:bg-gray-50"${_scopeId}><div class="flex items-center gap-2 flex-1"${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(item.isRevisado) ? ssrLooseContain(item.isRevisado, null) : item.isRevisado) ? " checked" : ""} class="rounded border-gray-300 text-[#099ebf] focus:ring-[#099ebf]"${_scopeId}><span${_scopeId}>${ssrInterpolate(item.label)}</span></div><button type="button" class="text-red-500 hover:text-red-700 ml-2"${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"${_scopeId}><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"${_scopeId}></path></svg></button></div>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="text-sm text-gray-500 italic mt-1"${_scopeId}>No hay elementos agregados.</p>`);
              }
              _push2(`<p class="text-xs text-gray-400 mt-1"${_scopeId}>* Los elementos se cargan autom\xE1ticamente al seleccionar un responsable.</p></div></div>`);
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
                class: ["transition-opacity", dataLoading.value && "pointer-events-none opacity-50"]
              }, [
                dataLoading.value ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
                }, [
                  createVNode("div", { class: "bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4" }, [
                    createVNode("div", { class: "w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin" }),
                    createVNode("p", { class: "text-gray-700 font-medium" }, toDisplayString(loadingMessage.value), 1)
                  ])
                ])) : createCommentVNode("", true),
                showScanner.value ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "fixed inset-0 z-[10000] flex items-center justify-center bg-black/80"
                }, [
                  createVNode("div", { class: "bg-white rounded-lg p-4 w-full max-w-md" }, [
                    createVNode("div", { class: "flex justify-between items-center mb-3" }, [
                      createVNode("h3", { class: "text-lg font-semibold" }, "Esc\xE1ner QR / c\xF3digo de barras"),
                      createVNode("button", {
                        onClick: closeScanner,
                        class: "text-gray-500 hover:text-gray-700"
                      }, [
                        (openBlock(), createBlock("svg", {
                          class: "w-6 h-6",
                          fill: "none",
                          stroke: "currentColor",
                          viewBox: "0 0 24 24"
                        }, [
                          createVNode("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            "stroke-width": "2",
                            d: "M6 18L18 6M6 6l12 12"
                          })
                        ]))
                      ])
                    ]),
                    createVNode("div", {
                      id: "qr-reader",
                      class: "w-full"
                    }),
                    createVNode("p", { class: "text-sm text-gray-500 mt-3" }, "Apunte la c\xE1mara al c\xF3digo QR o barras")
                  ])
                ])) : createCommentVNode("", true),
                message.value ? (openBlock(), createBlock("div", {
                  key: 2,
                  class: "mb-4"
                }, [
                  createVNode(_sfc_main$2, {
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
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(revisionData.value.id_solicitud || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Nota"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(((_d = revisionData.value.solicitud) == null ? void 0 : _d.nota) || "Sin nota"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Tipo Traslado"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(((_e = revisionData.value.solicitud) == null ? void 0 : _e.tipo_traslado) || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Estado"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(((_f = revisionData.value.solicitud) == null ? void 0 : _f.estado) || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "\xC1rea Responsabilidad"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(areaDesc.value || revisionData.value.id_AreaResponsabilidad || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Usuario Creador"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(usuarioCreadorNombre.value || "N/A"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "block text-sm font-medium text-gray-700" }, "Fecha Creaci\xF3n"),
                        createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(revisionData.value.createdAt ? new Date(revisionData.value.createdAt).toLocaleString() : "N/A"), 1)
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
                    createVNode("div", { class: "flex flex-wrap items-center justify-between gap-3 mb-3" }, [
                      createVNode("h4", { class: "text-md font-medium text-gray-900" }, "Elementos a Revisar"),
                      createVNode("div", { class: "flex flex-wrap gap-2" }, [
                        createVNode("button", {
                          onClick: openScanner,
                          class: "px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 flex items-center gap-1"
                        }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-4 h-4",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24"
                          }, [
                            createVNode("path", {
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "stroke-width": "2",
                              d: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                            })
                          ])),
                          createTextVNode(" Escanear QR / C\xF3digo ")
                        ]),
                        createVNode("button", {
                          onClick: guardarCambiosRevision,
                          disabled: guardandoRevision.value,
                          class: "px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                        }, toDisplayString(guardandoRevision.value ? "Guardando..." : "Guardar cambios"), 9, ["disabled"])
                      ])
                    ]),
                    elementosVistaConCheckbox.value.length ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "mb-3 flex flex-wrap items-end gap-3 justify-between"
                    }, [
                      createVNode("div", { class: "flex flex-wrap gap-3" }, [
                        createVNode("div", null, [
                          createVNode("label", { class: "block text-xs font-medium text-gray-600 mb-1" }, "Filtrar por c\xF3digo"),
                          withDirectives(createVNode("input", {
                            type: "text",
                            "onUpdate:modelValue": ($event) => filterCodeView.value = $event,
                            placeholder: "Ej: AFT-001, UTIL-123",
                            class: "w-48 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#099ebf]"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, filterCodeView.value]
                          ])
                        ]),
                        createVNode("div", null, [
                          createVNode("label", { class: "block text-xs font-medium text-gray-600 mb-1" }, "Filtrar por nombre"),
                          withDirectives(createVNode("input", {
                            type: "text",
                            "onUpdate:modelValue": ($event) => filterNameView.value = $event,
                            placeholder: "Ej: Laptop, Silla",
                            class: "w-48 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#099ebf]"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, filterNameView.value]
                          ])
                        ]),
                        filterCodeView.value || filterNameView.value ? (openBlock(), createBlock("button", {
                          key: 0,
                          onClick: clearFiltersView,
                          class: "text-xs text-[#099ebf] hover:underline self-end mb-1"
                        }, " Limpiar ")) : createCommentVNode("", true)
                      ]),
                      createVNode("div", { class: "text-sm bg-gray-100 px-3 py-1.5 rounded-lg" }, [
                        createVNode("span", { class: "font-medium" }, "Resumen:"),
                        createTextVNode(" Total: " + toDisplayString(elementosVistaConCheckbox.value.length) + " | Revisados: " + toDisplayString(reviewedCountView.value), 1)
                      ])
                    ])) : createCommentVNode("", true),
                    filteredElementosVista.value.length ? (openBlock(), createBlock("div", {
                      key: 1,
                      class: "space-y-2 max-h-64 overflow-y-auto border rounded p-2 bg-white"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(filteredElementosVista.value, (item) => {
                        return openBlock(), createBlock("div", {
                          key: item.id,
                          class: "flex items-center gap-2"
                        }, [
                          withDirectives(createVNode("input", {
                            type: "checkbox",
                            "onUpdate:modelValue": ($event) => item.isRevisado = $event,
                            onChange: ($event) => onCheckboxChange(item, getOriginalIndexVista(item)),
                            class: "rounded border-gray-300 text-[#099ebf] focus:ring-[#099ebf]"
                          }, null, 40, ["onUpdate:modelValue", "onChange"]), [
                            [vModelCheckbox, item.isRevisado]
                          ]),
                          createVNode("span", {
                            class: ["text-sm", item.isRevisado ? "line-through text-gray-500" : ""]
                          }, toDisplayString(item.descripcion) + " (" + toDisplayString(item.id) + ") ", 3)
                        ]);
                      }), 128))
                    ])) : elementosVistaConCheckbox.value.length && filteredElementosVista.value.length === 0 ? (openBlock(), createBlock("div", {
                      key: 2,
                      class: "text-sm text-gray-500 italic p-2"
                    }, " No hay elementos que coincidan con los filtros. ")) : (openBlock(), createBlock("div", {
                      key: 3,
                      class: "text-sm text-gray-500 italic"
                    }, "No hay elementos asociados"))
                  ]),
                  createVNode("div", { class: "flex justify-end gap-2" }, [
                    createVNode("button", {
                      onClick: enableEditMode,
                      class: "px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99]"
                    }, "Editar Revisi\xF3n")
                  ])
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
                        placeholder: "Motivo de la revisi\xF3n..."
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
                      createVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, toDisplayString(esUsuarioConRolEspecial.value ? "Tus elementos (seg\xFAn tu \xE1rea de responsabilidad)" : "Responsable del \xE1rea cuyos elementos se incluir\xE1n autom\xE1ticamente"), 1),
                      !esUsuarioConRolEspecial.value ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "flex gap-2 mb-3"
                      }, [
                        createVNode(_sfc_main$4, {
                          ref_key: "selectResponsableRef",
                          ref: selectResponsableRef,
                          modelValue: responsableSeleccionado.value,
                          "onUpdate:modelValue": ($event) => responsableSeleccionado.value = $event,
                          multiple: false,
                          endpoint: "/usuarios/filtrar/1/5",
                          method: "POST",
                          "search-key": "id_usuario_LDAP",
                          "label-key": "id_usuario_LDAP",
                          "value-key": "id_usuario",
                          "label-format": "{{id_usuario_LDAP}} (ID: {{id_usuario}}) - \xC1rea: {{id_AreaResponsabilidad}}",
                          placeholder: "Buscar usuario responsable...",
                          "direct-data": false,
                          "data-key": "datos",
                          onEntidadSeleccionada: onResponsableSeleccionado
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode("button", {
                          type: "button",
                          onClick: limpiarResponsable,
                          class: "px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        }, " Limpiar ")
                      ])) : (openBlock(), createBlock("div", {
                        key: 1,
                        class: "mb-3 p-2 bg-blue-50 rounded text-sm"
                      }, " Eres " + toDisplayString(rolUsuarioActual.value) + ". Se cargar\xE1n autom\xE1ticamente todos los " + toDisplayString(tipoElementoLabel.value) + " de tu \xE1rea (" + toDisplayString(areaUsuarioActual.value) + "). ", 1)),
                      cargandoElementos.value ? (openBlock(), createBlock("div", {
                        key: 2,
                        class: "text-sm text-gray-500 italic mt-1"
                      }, "Cargando elementos...")) : createCommentVNode("", true),
                      createVNode("label", { class: "block text-sm font-medium text-gray-700 mt-4 mb-1" }, " Elementos incluidos en esta revisi\xF3n (" + toDisplayString(form.lista_activos.length) + ") ", 1),
                      form.lista_activos.length ? (openBlock(), createBlock("div", {
                        key: 3,
                        class: "border rounded-lg divide-y max-h-64 overflow-y-auto"
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(form.lista_activos, (item, idx) => {
                          return openBlock(), createBlock("div", {
                            key: item.id,
                            class: "flex justify-between items-center p-2 hover:bg-gray-50"
                          }, [
                            createVNode("div", { class: "flex items-center gap-2 flex-1" }, [
                              withDirectives(createVNode("input", {
                                type: "checkbox",
                                "onUpdate:modelValue": ($event) => item.isRevisado = $event,
                                class: "rounded border-gray-300 text-[#099ebf] focus:ring-[#099ebf]"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelCheckbox, item.isRevisado]
                              ]),
                              createVNode("span", null, toDisplayString(item.label), 1)
                            ]),
                            createVNode("button", {
                              type: "button",
                              onClick: ($event) => eliminarElemento(idx),
                              class: "text-red-500 hover:text-red-700 ml-2"
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
                        key: 4,
                        class: "text-sm text-gray-500 italic mt-1"
                      }, "No hay elementos agregados.")),
                      createVNode("p", { class: "text-xs text-gray-400 mt-1" }, "* Los elementos se cargan autom\xE1ticamente al seleccionar un responsable.")
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
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RevisionesModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "revisiones",
  __ssrInlineRender: true,
  setup(__props) {
    const filtros = ref({
      nota: "",
      estado: "",
      tipo_traslado: "",
      fecha_hora_creacion_desde: "",
      fecha_hora_creacion_hasta: "",
      id_AreaResponsabilidad: ""
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
    const selectedRevision = ref({});
    const isEditing = ref(false);
    const isViewing = ref(false);
    const showConfirmBanner = ref(false);
    const revisionAEliminar = ref(null);
    const config = useRuntimeConfig();
    const columnasBase = [
      { key: "area", label: "\xC1rea" },
      { key: "estado", label: "Estado" },
      { key: "tipo_traslado", label: "Tipo Traslado" },
      { key: "fecha_creacion", label: "Fecha Creaci\xF3n" },
      { key: "total_elementos", label: "Total Elementos" },
      { key: "revisados", label: "Revisados" },
      { key: "pendientes", label: "Pendientes" }
    ];
    const columnasConAcciones = computed(() => {
      return [
        ...columnasBase,
        {
          key: "acciones",
          label: "Acciones",
          cellRenderer: (value, item) => {
            if (item.estado === "Completada") return "";
            return `
          <div class="flex space-x-2">
            <button class="editar-revision-btn px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600" data-id="${item.id_solicitud}">Editar</button>
            <button class="eliminar-revision-btn px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600" data-id="${item.id_solicitud}">Eliminar</button>
          </div>
        `;
          }
        }
      ];
    });
    const setupActionListeners = () => {
      nextTick(() => {
        (void 0).querySelectorAll(".editar-revision-btn").forEach((btn) => {
          btn.removeEventListener("click", handleEditarClick);
          btn.addEventListener("click", handleEditarClick);
        });
        (void 0).querySelectorAll(".eliminar-revision-btn").forEach((btn) => {
          btn.removeEventListener("click", handleEliminarClick);
          btn.addEventListener("click", handleEliminarClick);
        });
      });
    };
    const handleEditarClick = (event) => {
      event.stopPropagation();
      const id = event.currentTarget.getAttribute("data-id");
      const revision = itemsData.value.find((r) => r.id_solicitud == id);
      if (revision) {
        selectedRevision.value = revision.raw || revision;
        isEditing.value = true;
        isViewing.value = false;
        showModal.value = true;
      }
    };
    const handleEliminarClick = (event) => {
      event.stopPropagation();
      const id = event.currentTarget.getAttribute("data-id");
      const revision = itemsData.value.find((r) => r.id_solicitud == id);
      if (revision) {
        revisionAEliminar.value = revision;
        showConfirmBanner.value = true;
      }
    };
    const confirmarEliminar = async () => {
      if (!revisionAEliminar.value) return;
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch(`${config.public.backendHost}/revisiones/${revisionAEliminar.value.id_solicitud}`, {
          method: "DELETE",
          headers: { Authorization: token }
        });
        if (!response.ok) throw new Error("Error al eliminar");
        errorBanner.value = { title: "\xC9xito", description: "Revisi\xF3n eliminada correctamente", type: "success" };
        await fetchRevisiones(currentPage.value);
      } catch (err) {
        errorBanner.value = { title: "Error", description: err.message, type: "error" };
      } finally {
        showConfirmBanner.value = false;
        revisionAEliminar.value = null;
      }
    };
    const fetchRevisiones = async (page = 1) => {
      const token = localStorage.getItem("token");
      if (!token) return navigateTo("/");
      isLoading.value = true;
      errorBanner.value = null;
      try {
        const body = {};
        if (filtros.value.nota) body.nota = filtros.value.nota;
        if (filtros.value.estado) body.estado = filtros.value.estado;
        if (filtros.value.tipo_traslado) body.tipo_traslado = filtros.value.tipo_traslado;
        if (filtros.value.fecha_hora_creacion_desde) body.fecha_hora_creacion_desde = new Date(filtros.value.fecha_hora_creacion_desde).toISOString();
        if (filtros.value.fecha_hora_creacion_hasta) body.fecha_hora_creacion_hasta = new Date(filtros.value.fecha_hora_creacion_hasta).toISOString();
        if (filtros.value.id_AreaResponsabilidad) body.id_AreaResponsabilidad = filtros.value.id_AreaResponsabilidad;
        const res = await fetch(`${config.public.backendHost}/revisiones/filtrar/${page}/${itemsPorPage.value}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify(body)
        });
        if (res.status === 401) throw new Error("Sesi\xF3n expirada");
        if (res.status === 403) throw new Error("Acceso denegado");
        if (!res.ok) throw new Error("Error al cargar datos");
        const data = await res.json();
        itemsData.value = data.datos.map((item) => {
          var _a, _b, _c;
          const detalles = item.detalles || [];
          const total = detalles.length;
          const revisados = detalles.filter((d) => d.isRevisado === true).length;
          const pendientes = total - revisados;
          return {
            id_solicitud: item.id_solicitud,
            area: item.id_AreaResponsabilidad ? item.id_AreaResponsabilidad.trim() : "",
            estado: ((_a = item.solicitud) == null ? void 0 : _a.estado) || "",
            tipo_traslado: ((_b = item.solicitud) == null ? void 0 : _b.tipo_traslado) || "",
            fecha_creacion: ((_c = item.solicitud) == null ? void 0 : _c.fecha_hora_creacion) ? new Date(item.solicitud.fecha_hora_creacion).toLocaleDateString() : "",
            total_elementos: total,
            revisados,
            pendientes,
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
        setupActionListeners();
      }
    };
    const handlePageChange = (page) => fetchRevisiones(page);
    const handleRowClick = (item) => {
      selectedRevision.value = item.raw || item;
      isEditing.value = false;
      isViewing.value = true;
      showModal.value = true;
    };
    const handleSubmitRevision = async (payload) => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        let response;
        if (isEditing.value && selectedRevision.value.id_solicitud) {
          response = await fetch(`${config.public.backendHost}/revisiones/${selectedRevision.value.id_solicitud}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify(payload)
          });
        } else {
          response = await fetch(`${config.public.backendHost}/revisiones`, {
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
          title: isEditing.value ? "Revisi\xF3n actualizada" : "Revisi\xF3n creada",
          description: "Operaci\xF3n exitosa",
          type: "success"
        };
        showModal.value = false;
        fetchRevisiones(currentPage.value);
      } catch (err) {
        errorBanner.value = { title: "Error", description: err.message, type: "error" };
      }
    };
    const refrescarLista = () => {
      fetchRevisiones(currentPage.value);
    };
    watch(() => itemsData.value, () => {
      setupActionListeners();
    }, { deep: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white" }, _attrs))}>`);
      _push(ssrRenderComponent(SeoMeta, {
        title: "Revisiones - AFTUP",
        description: "Gesti\xF3n de revisiones de activos fijos tangibles y \xFAtiles.",
        canonical: "/revisiones"
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
          title: "\xBFEst\xE1s seguro de eliminar esta revisi\xF3n?",
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
      _push(`</div><div><label class="block text-sm font-medium text-gray-700 mb-1">\xC1rea de responsabilidad</label>`);
      _push(ssrRenderComponent(_sfc_main$4, {
        modelValue: filtros.value.id_AreaResponsabilidad,
        "onUpdate:modelValue": ($event) => filtros.value.id_AreaResponsabilidad = $event,
        multiple: false,
        endpoint: "/areas/filtrar/1/5",
        method: "POST",
        "search-key": "Desc_AreaResponsabilidad",
        "label-key": "Desc_AreaResponsabilidad",
        "value-key": "Id_AreaResponsabilidad",
        "label-format": "{{Desc_AreaResponsabilidad}} - {{Id_AreaResponsabilidad}}",
        placeholder: "Buscar \xE1rea...",
        "direct-data": false,
        "data-key": "datos"
      }, null, _parent));
      _push(`</div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Fecha creaci\xF3n (desde)</label><input type="datetime-local"${ssrRenderAttr("value", filtros.value.fecha_hora_creacion_desde)} class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Fecha creaci\xF3n (hasta)</label><input type="datetime-local"${ssrRenderAttr("value", filtros.value.fecha_hora_creacion_hasta)} class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#099ebf]"></div></div><div class="flex justify-end gap-2 flex-wrap mt-4"><button class="px-6 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] focus:ring-offset-2 transition-colors"> Buscar </button><button class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"> Limpiar </button></div></div></div><div class="w-[95%] mx-auto px-4 py-4"><div class="flex justify-between items-center mb-4"><h2 class="text-2xl font-bold text-[#077a99]">Revisiones</h2><button class="px-4 py-2 bg-[#099ebf] text-white rounded-lg hover:bg-[#077a99] focus:outline-none focus:ring-2 focus:ring-[#099ebf] flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Nueva Revisi\xF3n </button></div>`);
      _push(ssrRenderComponent(DataTable, {
        columns: columnasConAcciones.value,
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
        revision: selectedRevision.value,
        "is-editing": isEditing.value,
        "is-viewing": isViewing.value,
        onSubmit: handleSubmitRevision,
        onSuccess: refrescarLista
      }, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/revisiones.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=revisiones-5gCYCPpz.mjs.map
