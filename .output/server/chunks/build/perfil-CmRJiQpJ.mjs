import { ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { N as Navbar } from './Navbar-Ds5Ji1IO.mjs';
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

const _sfc_main = {
  __name: "perfil",
  __ssrInlineRender: true,
  setup(__props) {
    const perfil = ref(null);
    const isLoading = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex flex-col items-center py-12 bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white" }, _attrs))}>`);
      _push(ssrRenderComponent(Navbar, null, null, _parent));
      _push(`<div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl mt-8"><div class="mb-6"><h2 class="text-2xl font-bold text-[#099ebf]">Mi Perfil</h2></div>`);
      if (isLoading.value) {
        _push(`<div class="text-center text-[#077a99]"> Cargando perfil... </div>`);
      } else if (perfil.value) {
        _push(`<div class="space-y-4"><div class="grid gap-4"><div class="flex justify-between items-center border-b border-[#d8eff4] pb-3"><span class="font-semibold text-[#077a99]">ID Usuario</span><span class="text-gray-900">${ssrInterpolate(perfil.value.id_usuario)}</span></div><div class="flex justify-between items-center border-b border-[#d8eff4] pb-3"><span class="font-semibold text-[#077a99]">Rol</span><span class="text-gray-900">${ssrInterpolate(perfil.value.rol)}</span></div><div class="flex justify-between items-center border-b border-[#d8eff4] pb-3"><span class="font-semibold text-[#077a99]">ID Usuario LDAP</span><span class="text-gray-900">${ssrInterpolate(perfil.value.id_usuario_LDAP)}</span></div><div class="flex justify-between items-center border-b border-[#d8eff4] pb-3"><span class="font-semibold text-[#077a99]">\xC1rea de responsabilidad</span><span class="text-gray-900">${ssrInterpolate(((_a = perfil.value.id_AreaResponsabilidad) == null ? void 0 : _a.trim()) || "\u2014")}</span></div><div class="flex justify-between items-center border-b border-[#d8eff4] pb-3"><span class="font-semibold text-[#077a99]">Estado</span><span class="${ssrRenderClass([perfil.value.activo ? "bg-[#099ebf] text-white" : "bg-[#dbeef2] text-[#077a99]", "px-3 py-1 rounded-full text-xs font-semibold"])}">${ssrInterpolate(perfil.value.activo ? "Activo" : "Inactivo")}</span></div><div class="flex justify-between items-center border-b border-[#d8eff4] pb-3"><span class="font-semibold text-[#077a99]">Creado</span><span class="text-gray-900">${ssrInterpolate(perfil.value.createdAt)}</span></div><div class="flex justify-between items-center"><span class="font-semibold text-[#077a99]">Actualizado</span><span class="text-gray-900">${ssrInterpolate(perfil.value.updatedAt)}</span></div></div></div>`);
      } else {
        _push(`<div class="text-center text-[#077a99]"> No se pudo cargar el perfil. </div>`);
      }
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/perfil.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=perfil-CmRJiQpJ.mjs.map
