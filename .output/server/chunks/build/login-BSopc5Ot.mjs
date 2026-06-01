import { ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { _ as _imports_0 } from './logo-B2DBqTv1.mjs';
import { S as SeoMeta, _ as _sfc_main$1 } from './MessageBanner-C3gOLDB5.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import './server.mjs';
import 'vue-router';
import './v3-CPu3I7iP.mjs';

const _sfc_main = {
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const usuario = ref("");
    const contrasena = ref("");
    const errorMsg = ref("");
    const showError = ref(false);
    const isLoading = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex min-h-screen flex-1 flex-col justify-center px-6 py-12 bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white" }, _attrs))}>`);
      _push(ssrRenderComponent(SeoMeta, {
        title: "Iniciar Sesi\xF3n - AFTUP",
        description: "Accede a la plataforma de gesti\xF3n de activos fijos tangibles y \xFAtiles.",
        canonical: "/login"
      }, null, _parent));
      if (isLoading.value) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div class="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4"><div class="w-12 h-12 border-4 border-gray-200 border-t-[#099ebf] rounded-full animate-spin"></div><p class="text-gray-700 font-medium">Iniciando sesi\xF3n...</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (showError.value) {
        _push(ssrRenderComponent(_sfc_main$1, {
          title: "Error al iniciar sesi\xF3n",
          description: errorMsg.value,
          type: "error",
          onClose: ($event) => showError.value = false
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="sm:mx-auto sm:w-full sm:max-w-sm"><img class="mx-auto h-24 w-24 rounded-full shadow mt-8"${ssrRenderAttr("src", _imports_0)} alt="Logo AFTUP"><h2 class="mt-8 text-center text-2xl font-bold tracking-tight text-[#077a99]">Inicia sesi\xF3n en tu cuenta</h2></div><div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm"><form class="space-y-6"><div><label for="usuario" class="block text-sm font-medium text-gray-900">Usuario</label><div class="mt-2"><input id="usuario" name="usuario" type="text" autocomplete="username" required${ssrRenderAttr("value", usuario.value)}${ssrIncludeBooleanAttr(isLoading.value) ? " disabled" : ""} class="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#099ebf] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Nombre de usuario"></div></div><div><div class="flex items-center justify-between"><label for="contrasena" class="block text-sm font-medium text-gray-900">Contrase\xF1a</label></div><div class="mt-2"><input id="contrasena" name="contrasena" type="password" autocomplete="current-password" required${ssrRenderAttr("value", contrasena.value)}${ssrIncludeBooleanAttr(isLoading.value) ? " disabled" : ""} class="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#099ebf] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Contrase\xF1a"></div></div><div><button type="submit"${ssrIncludeBooleanAttr(isLoading.value) ? " disabled" : ""} class="flex w-full justify-center rounded-md bg-[#099ebf] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#077a99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#099ebf] disabled:opacity-50 disabled:cursor-not-allowed"> Ingresar </button></div></form></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-BSopc5Ot.mjs.map
