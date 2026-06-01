import { ref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate } from 'vue/server-renderer';
import { _ as _export_sfc, u as useRuntimeConfig } from './server.mjs';
import { u as useHead } from './v3-CPu3I7iP.mjs';

const _sfc_main$1 = {
  __name: "SeoMeta",
  __ssrInlineRender: true,
  props: {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    url: { type: String, default: "" },
    canonical: { type: String, default: "" },
    jsonld: { type: String, default: "" },
    twitterCard: { type: String, default: "summary_large_image" }
  },
  setup(__props) {
    const props = __props;
    const siteUrl = useRuntimeConfig().public.siteUrl || "http://localhost:3000";
    useHead({
      title: props.title || "Pactum",
      meta: [
        props.description ? { name: "description", content: props.description } : null,
        props.image ? { property: "og:image", content: props.image.startsWith("http") ? props.image : siteUrl + props.image } : null,
        props.url ? { property: "og:url", content: props.url } : null,
        props.title ? { property: "og:title", content: props.title } : null,
        props.description ? { property: "og:description", content: props.description } : null,
        props.twitterCard ? { name: "twitter:card", content: props.twitterCard } : null
      ].filter(Boolean),
      link: props.canonical ? [{ rel: "canonical", href: props.canonical }] : [],
      script: props.jsonld ? [{ type: "application/ld+json", innerHTML: props.jsonld }] : []
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        style: { "display": "none" },
        "aria-hidden": "true"
      }, _attrs))} data-v-349b3277></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SeoMeta.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const SeoMeta = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-349b3277"]]);
const _sfc_main = {
  __name: "MessageBanner",
  __ssrInlineRender: true,
  props: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, default: "success" },
    // success, error, warning
    persistent: { type: Boolean, default: false }
    // Si es true, el banner no se cierra automáticamente
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const progressWidth = ref(100);
    ref(null);
    ref(null);
    const bannerClass = computed(() => {
      switch (props.type) {
        case "success":
          return "bg-green-50 border border-green-200 text-green-800";
        case "error":
          return "bg-red-50 border border-red-200 text-red-800";
        case "warning":
          return "bg-yellow-50 border border-yellow-200 text-yellow-800";
        default:
          return "bg-gray-50 border text-gray-800";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: [bannerClass.value, "flex items-center p-4 rounded-lg mb-4 shadow-md relative overflow-hidden"]
      }, _attrs))}>`);
      if (!__props.persistent) {
        _push(`<div class="absolute top-0 left-0 h-1 bg-current opacity-30 transition-all duration-100 ease-linear" style="${ssrRenderStyle({ width: `${progressWidth.value}%` })}"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none" aria-label="Cerrar"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button><span class="mr-3">`);
      if (__props.type === "success") {
        _push(`<svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`);
      } else if (__props.type === "error") {
        _push(`<svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`);
      } else if (__props.type === "warning") {
        _push(`<svg class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</span><div><div class="font-bold text-base mb-1">${ssrInterpolate(__props.title)}</div><div class="text-sm">${ssrInterpolate(__props.description)}</div></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MessageBanner.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { SeoMeta as S, _sfc_main as _ };
//# sourceMappingURL=MessageBanner-C3gOLDB5.mjs.map
