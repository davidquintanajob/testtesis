import { _ as __nuxt_component_0 } from './nuxt-link-DyRFq4kt.mjs';
import { ref, computed, mergeProps, withCtx, createBlock, createVNode, openBlock, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderClass, ssrRenderAttr, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { p as publicAssetsURL } from '../routes/renderer.mjs';
import { _ as _export_sfc, n as navigateTo } from './server.mjs';

const _imports_0 = publicAssetsURL("/usuario.png");
const _imports_1 = publicAssetsURL("/perfil.png");
const _imports_2 = publicAssetsURL("/cerrar-sesion.png");
const _sfc_main = {
  __name: "Navbar",
  __ssrInlineRender: true,
  setup(__props) {
    const navRoot = ref(null);
    const isNavCollapsed = ref(true);
    const isMenuOpen = ref(false);
    const isUserMenuOpen = ref(false);
    const isConnected = ref(false);
    const isChevronAnimating = ref(false);
    const options = [
      { label: "Mi \xC1rea", src: "home", link: "/miarea", roles: ["Jefe de \xC1rea", "Responsable de \xC1rea", "Administrador", "Especialista"] },
      { label: "Movimientos", src: "arrows", link: "/traslados", roles: ["Jefe de \xC1rea", "Responsable de \xC1rea", "Administrador", "Especialista"] },
      { label: "Bajas", src: "trash", link: "/bajas", roles: ["Jefe de \xC1rea", "Responsable de \xC1rea", "Administrador", "Especialista"] },
      { label: "Revisiones", src: "checklist", link: "/revisiones", roles: ["Jefe de \xC1rea", "Responsable de \xC1rea", "Administrador", "Especialista"] },
      { label: "Archivos enviados y recibidos", src: "chat", link: "/archivos", roles: ["Jefe de \xC1rea", "Responsable de \xC1rea", "Administrador", "Especialista"] },
      { label: "Usuario", src: "/usuarios.png", link: "/usuarios", roles: ["Administrador"] }
    ];
    const DEFAULT_ROLES = ["Administrador", "Comercial", "Invitado", "Vendedor"];
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      if (!opt || !opt.roles || !Array.isArray(opt.roles)) {
        options[i] = { ...opt, roles: DEFAULT_ROLES };
      }
    }
    const handleProtectedNavigation = (targetPath) => {
      {
        handleMenuClose();
        navigateTo("/login");
        return;
      }
    };
    const handleMenuClose = () => {
      isNavCollapsed.value = true;
      isMenuOpen.value = false;
      isUserMenuOpen.value = false;
    };
    const isOptionVisible = (option) => {
      var _a, _b;
      try {
        const usuarioStr = localStorage.getItem("usuario");
        if (!usuarioStr) return true;
        if (!option) return false;
        const usuario = JSON.parse(usuarioStr);
        const rawRole = usuario && (usuario.rol || usuario.role || ((_a = usuario.perfil) == null ? void 0 : _a.rol) || ((_b = usuario.profile) == null ? void 0 : _b.role));
        if (!rawRole) return true;
        const role = String(rawRole).trim().toLowerCase();
        let normalizedRoles;
        if (!option.roles || !Array.isArray(option.roles)) {
          normalizedRoles = DEFAULT_ROLES.map((r) => String(r).trim().toLowerCase());
        } else {
          normalizedRoles = option.roles.map((r) => String(r).trim().toLowerCase());
        }
        return normalizedRoles.includes(role);
      } catch (e) {
        console.warn("isOptionVisible error", e);
        return true;
      }
    };
    const visibleOptions = computed(() => {
      try {
        return options.filter((opt) => isOptionVisible(opt));
      } catch (e) {
        console.warn("visibleOptions compute error", e);
        return options;
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "relative",
        ref_key: "navRoot",
        ref: navRoot
      }, _attrs))} data-v-ec39dc6e><button class="hidden md:flex items-center fixed z-50 bg-[#099ebf] text-white rounded-r-full h-16 pr-4 shadow-lg hover:bg-[#077a99] transition-all duration-300 ease-in-out" style="${ssrRenderStyle({ left: isNavCollapsed.value ? "0px" : "255px", right: "auto", width: isNavCollapsed.value ? "auto" : "auto", top: "200px" })}" data-v-ec39dc6e><div class="flex items-center justify-center w-8 h-16" data-v-ec39dc6e><svg xmlns="http://www.w3.org/2000/svg" class="${ssrRenderClass(["h-5 w-5", isChevronAnimating.value ? "chevron-wobble" : ""])}" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-ec39dc6e><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${ssrRenderAttr("d", isNavCollapsed.value ? "M13 5l7 7-7 7" : "M11 19l-7-7 7-7")} data-v-ec39dc6e></path></svg></div></button><nav class="${ssrRenderClass([{ "md:transform md:-translate-x-full": isNavCollapsed.value }, "fixed top-0 left-0 w-full bg-gradient-to-r from-[#099ebf] to-[#077a99] shadow-lg z-40 md:w-64 md:h-screen md:bg-gradient-to-b transition-all duration-300 ease-in-out"])}" style="${ssrRenderStyle({ "--nav-width": "16rem" })}" data-v-ec39dc6e><div class="container mx-auto flex justify-between items-center py-4 px-6 md:flex-col md:items-start md:justify-start md:py-6 md:h-full" data-v-ec39dc6e><div class="hidden md:flex md:items-center relative" data-v-ec39dc6e><h1 class="text-white text-3xl md:text-4xl font-sans font-bold tracking-tight mr-4 cursor-pointer select-none" data-v-ec39dc6e> AFTUP </h1><div class="relative flex flex-col items-center justify-center" data-v-ec39dc6e><a class="w-12 h-12 rounded-full overflow-hidden border-2 border-white hover:bg-[#099ebf] hover:border-[#077a99] transition flex items-center justify-center cursor-pointer" data-v-ec39dc6e><img${ssrRenderAttr("src", _imports_0)} alt="Usuario" class="w-3/4 h-3/4 object-cover transition duration-300 hover:opacity-75 mix-blend-screen invert hover:invert(0)" data-v-ec39dc6e></a>`);
      if (isConnected.value) {
        _push(`<span class="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs bg-green-600 text-white shadow z-10" data-v-ec39dc6e>Conectado</span>`);
      } else {
        _push(`<span class="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs bg-red-600 text-white shadow z-10" data-v-ec39dc6e>Desconectado</span>`);
      }
      _push(`</div></div><h1 class="text-white text-3xl font-sans font-bold tracking-tight md:hidden cursor-pointer select-none" role="button" tabindex="0" data-v-ec39dc6e> AFTUP </h1><button class="md:hidden text-white focus:outline-none transition duration-300" data-v-ec39dc6e>`);
      if (!isMenuOpen.value) {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-ec39dc6e><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" data-v-ec39dc6e></path></svg>`);
      } else {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-ec39dc6e><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-ec39dc6e></path></svg>`);
      }
      _push(`</button><a class="w-12 h-12 rounded-full overflow-hidden border-2 border-white hover:bg-[#099ebf] hover:border-[#077a99] transition ml-6 flex items-center justify-center cursor-pointer md:hidden" data-v-ec39dc6e><div class="relative w-full h-full flex items-center justify-center" data-v-ec39dc6e><img${ssrRenderAttr("src", _imports_0)} alt="Usuario" class="w-3/4 h-3/4 object-cover transition duration-300 hover:opacity-75 mix-blend-screen invert hover:invert(0)" data-v-ec39dc6e>`);
      if (isConnected.value) {
        _push(`<span class="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs bg-green-600 text-white shadow z-10" data-v-ec39dc6e>Conectado</span>`);
      } else {
        _push(`<span class="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs bg-red-600 text-white shadow z-10" data-v-ec39dc6e>Desconectado</span>`);
      }
      _push(`</div></a><div class="hidden md:flex flex-col w-full md:mt-4 overflow-y-auto" style="${ssrRenderStyle({ "max-height": "calc(100vh - 200px)" })}" data-v-ec39dc6e><div class="flex flex-col space-y-4 w-full" data-v-ec39dc6e><!--[-->`);
      ssrRenderList(visibleOptions.value, (option, index) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: index,
          to: option.link,
          class: "text-white flex items-center px-4 py-3 rounded-lg border border-white transition group hover:bg-[#099ebf] hover:text-white",
          onClick: ($event) => handleProtectedNavigation(option.link)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (option.src === "home") {
                _push2(`<svg class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ec39dc6e${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" data-v-ec39dc6e${_scopeId}></path></svg>`);
              } else if (option.src === "arrows") {
                _push2(`<svg class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ec39dc6e${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" data-v-ec39dc6e${_scopeId}></path></svg>`);
              } else if (option.src === "trash") {
                _push2(`<svg class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ec39dc6e${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" data-v-ec39dc6e${_scopeId}></path></svg>`);
              } else if (option.src === "checklist") {
                _push2(`<svg class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ec39dc6e${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" data-v-ec39dc6e${_scopeId}></path></svg>`);
              } else if (option.src === "chat") {
                _push2(`<svg class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ec39dc6e${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" data-v-ec39dc6e${_scopeId}></path></svg>`);
              } else {
                _push2(`<img${ssrRenderAttr("src", option.src)} alt="" class="w-6 h-6 mr-2 invert group-hover:invert-0 transition-all duration-300" data-v-ec39dc6e${_scopeId}>`);
              }
              _push2(`<span class="text-[15px]" data-v-ec39dc6e${_scopeId}>${ssrInterpolate(option.label)}</span>`);
            } else {
              return [
                option.src === "home" ? (openBlock(), createBlock("svg", {
                  key: 0,
                  class: "w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  })
                ])) : option.src === "arrows" ? (openBlock(), createBlock("svg", {
                  key: 1,
                  class: "w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    d: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  })
                ])) : option.src === "trash" ? (openBlock(), createBlock("svg", {
                  key: 2,
                  class: "w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  })
                ])) : option.src === "checklist" ? (openBlock(), createBlock("svg", {
                  key: 3,
                  class: "w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  })
                ])) : option.src === "chat" ? (openBlock(), createBlock("svg", {
                  key: 4,
                  class: "w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    d: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  })
                ])) : (openBlock(), createBlock("img", {
                  key: 5,
                  src: option.src,
                  alt: "",
                  class: "w-6 h-6 mr-2 invert group-hover:invert-0 transition-all duration-300"
                }, null, 8, ["src"])),
                createVNode("span", { class: "text-[15px]" }, toDisplayString(option.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div><div class="mt-6 pt-4 border-t border-white/20" data-v-ec39dc6e><button type="button" class="w-full flex items-center justify-center gap-3 rounded-xl bg-rose-600/90 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-white/20 hover:bg-rose-700 transition-all duration-200" data-v-ec39dc6e><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-ec39dc6e><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" data-v-ec39dc6e></path></svg><span data-v-ec39dc6e>Cerrar sesi\xF3n</span></button></div></div></div>`);
      if (isUserMenuOpen.value) {
        _push(`<div class="fixed inset-0 z-50" data-v-ec39dc6e><div class="fixed top-0 right-0 w-64 h-screen bg-[#077a99] p-4 space-y-2 transform transition-all duration-300 ease-in-out z-50" style="${ssrRenderStyle({ transform: isUserMenuOpen.value ? "translateX(0)" : "translateX(100%)" })}" data-v-ec39dc6e>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/perfil",
          class: "group flex items-center text-white py-2 rounded-lg hover:bg-[#099ebf] transition hover:text-white",
          onClick: handleMenuClose
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<img${ssrRenderAttr("src", _imports_1)} alt="Perfil" class="w-6 h-6 mr-2 invert group-hover:invert-0 transition-all duration-300" data-v-ec39dc6e${_scopeId}> Mi Perfil `);
            } else {
              return [
                createVNode("img", {
                  src: _imports_1,
                  alt: "Perfil",
                  class: "w-6 h-6 mr-2 invert group-hover:invert-0 transition-all duration-300"
                }),
                createTextVNode(" Mi Perfil ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<hr class="border-white/30" data-v-ec39dc6e><a href="#" class="group flex items-center text-white py-2 rounded-lg hover:bg-[#099ebf] transition hover:text-white" data-v-ec39dc6e><img${ssrRenderAttr("src", _imports_2)} alt="Cerrar Sesi\xF3n" class="w-6 h-6 mr-2 invert group-hover:invert-0 transition-all duration-300" data-v-ec39dc6e> Cerrar Sesi\xF3n </a></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (isMenuOpen.value) {
        _push(`<div class="md:hidden fixed top-16 left-0 w-full bg-[#077a99] p-4 space-y-2 transform transition-all duration-300 ease-in-out z-50 overflow-auto" data-v-ec39dc6e><!--[-->`);
        ssrRenderList(visibleOptions.value, (option, index) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: index,
            to: option.link,
            class: "flex items-center block text-white text-center py-2 rounded-lg transition group hover:bg-[#099ebf]",
            onClick: ($event) => handleProtectedNavigation(option.link)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                if (option.src === "home") {
                  _push2(`<svg class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ec39dc6e${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" data-v-ec39dc6e${_scopeId}></path></svg>`);
                } else if (option.src === "arrows") {
                  _push2(`<svg class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ec39dc6e${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" data-v-ec39dc6e${_scopeId}></path></svg>`);
                } else if (option.src === "trash") {
                  _push2(`<svg class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ec39dc6e${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" data-v-ec39dc6e${_scopeId}></path></svg>`);
                } else if (option.src === "checklist") {
                  _push2(`<svg class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ec39dc6e${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" data-v-ec39dc6e${_scopeId}></path></svg>`);
                } else if (option.src === "chat") {
                  _push2(`<svg class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ec39dc6e${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" data-v-ec39dc6e${_scopeId}></path></svg>`);
                } else {
                  _push2(`<img${ssrRenderAttr("src", option.src)} alt="" class="w-6 h-6 mr-2 invert group-hover:invert-0 transition-all duration-300" data-v-ec39dc6e${_scopeId}>`);
                }
                _push2(`<span data-v-ec39dc6e${_scopeId}>${ssrInterpolate(option.label)}</span>`);
              } else {
                return [
                  option.src === "home" ? (openBlock(), createBlock("svg", {
                    key: 0,
                    class: "w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    })
                  ])) : option.src === "arrows" ? (openBlock(), createBlock("svg", {
                    key: 1,
                    class: "w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      d: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    })
                  ])) : option.src === "trash" ? (openBlock(), createBlock("svg", {
                    key: 2,
                    class: "w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    })
                  ])) : option.src === "checklist" ? (openBlock(), createBlock("svg", {
                    key: 3,
                    class: "w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    })
                  ])) : option.src === "chat" ? (openBlock(), createBlock("svg", {
                    key: 4,
                    class: "w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      d: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    })
                  ])) : (openBlock(), createBlock("img", {
                    key: 5,
                    src: option.src,
                    alt: "",
                    class: "w-6 h-6 mr-2 invert group-hover:invert-0 transition-all duration-300"
                  }, null, 8, ["src"])),
                  createVNode("span", null, toDisplayString(option.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--><div class="mt-4 pt-4 border-t border-white/20" data-v-ec39dc6e><button type="button" class="w-full flex items-center justify-center gap-3 rounded-xl bg-rose-600/90 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-white/20 hover:bg-rose-700 transition-all duration-200" data-v-ec39dc6e><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-ec39dc6e><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" data-v-ec39dc6e></path></svg><span data-v-ec39dc6e>Cerrar sesi\xF3n</span></button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</nav></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Navbar.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Navbar = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ec39dc6e"]]);

export { Navbar as N };
//# sourceMappingURL=Navbar-Ds5Ji1IO.mjs.map
