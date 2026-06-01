import { computed, mergeProps, createVNode, resolveDynamicComponent, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderVNode, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = {
  __name: "ConfirmBanner",
  __ssrInlineRender: true,
  props: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: [Object, Function, String], required: true },
    // Componente, función o string para el icono
    type: { type: String, default: "info" }
    // Para estilos opcionales
  },
  setup(__props) {
    const props = __props;
    const bannerClass = computed(() => {
      switch (props.type) {
        case "success":
          return "bg-green-50 border border-green-200";
        case "error":
          return "bg-red-50 border border-red-200";
        case "warning":
          return "bg-yellow-50 border border-yellow-200";
        default:
          return "bg-gray-50 border";
      }
    });
    const iconComponent = computed(() => props.icon);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: [bannerClass.value, "flex items-center p-4 rounded-lg mb-4 shadow-md relative"]
      }, _attrs))}><button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none" aria-label="Cerrar"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button><span class="mr-3">`);
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(iconComponent.value), { class: "h-6 w-6" }, null), _parent);
      _push(`</span><div class="flex-1"><div class="font-bold text-base mb-1">${ssrInterpolate(__props.title)}</div><div class="text-sm mb-2">${ssrInterpolate(__props.description)}</div><div class="flex gap-2 mt-2"><button class="px-4 py-1 bg-primary text-neutral rounded hover:bg-primary/90">S\xED</button><button class="px-4 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">No</button></div></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ConfirmBanner.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ConfirmBanner-D2jJGKTl.mjs.map
