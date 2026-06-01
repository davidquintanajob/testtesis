import { ref, computed, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderStyle, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main$1 = {
  __name: "SelectSearch",
  __ssrInlineRender: true,
  props: {
    options: { type: Array, required: true },
    labelKey: { type: [String, Function], required: true },
    valueKey: { type: String, required: true },
    modelValue: [String, Number],
    placeholder: { type: String, default: "Buscar..." },
    disabled: { type: Boolean, default: false }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const search = ref("");
    const open = ref(false);
    const activeIndex = ref(-1);
    const dropdownId = `dropdown-${Math.random().toString(36).substr(2, 9)}`;
    ref(null);
    function getLabel(option) {
      if (typeof props.labelKey === "function") {
        return props.labelKey(option);
      } else if (typeof props.labelKey === "string") {
        return option[props.labelKey];
      }
      return "";
    }
    const filteredOptions = computed(() => {
      if (!search.value) return props.options;
      return props.options.filter(
        (opt) => String(getLabel(opt)).toLowerCase().includes(search.value.toLowerCase())
      );
    });
    const optionId = (idx) => `${dropdownId}-option-${idx}`;
    const activeDescendantId = computed(
      () => activeIndex.value >= 0 ? optionId(activeIndex.value) : void 0
    );
    watch(() => props.modelValue, (val) => {
      if (val !== void 0 && val !== null) {
        const selected = props.options.find((opt) => String(opt[props.valueKey]) === String(val));
        if (selected) {
          search.value = getLabel(selected);
        } else {
          search.value = "";
        }
      } else {
        search.value = "";
      }
    }, { immediate: true });
    watch(() => props.options, () => {
      if (props.modelValue !== void 0 && props.modelValue !== null) {
        const selected = props.options.find((opt) => String(opt[props.valueKey]) === String(props.modelValue));
        if (selected) {
          search.value = getLabel(selected);
        }
      }
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative w-full" }, _attrs))}><input type="text"${ssrRenderAttr("value", search.value)}${ssrRenderAttr("placeholder", __props.placeholder)} class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"${ssrIncludeBooleanAttr(__props.disabled) ? " disabled" : ""}${ssrRenderAttr("aria-expanded", open.value.toString())}${ssrRenderAttr("aria-controls", dropdownId)}${ssrRenderAttr("aria-activedescendant", activeDescendantId.value)}><ul style="${ssrRenderStyle(open.value && filteredOptions.value.length > 0 ? null : { display: "none" })}"${ssrRenderAttr("id", dropdownId)} class="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-auto shadow-lg" role="listbox"><!--[-->`);
      ssrRenderList(filteredOptions.value, (option, idx) => {
        _push(`<li${ssrRenderAttr("id", optionId(idx))} class="${ssrRenderClass(["px-4 py-2 cursor-pointer", idx === activeIndex.value ? "bg-accent/30" : "hover:bg-gray-100"])}" role="option"${ssrRenderAttr("aria-selected", String(__props.modelValue) === String(option[__props.valueKey]))}>${ssrInterpolate(getLabel(option))}</li>`);
      });
      _push(`<!--]--></ul></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SelectSearch.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "Modal",
  __ssrInlineRender: true,
  props: {
    show: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: "md",
      validator: (value) => ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"].includes(value)
    }
  },
  emits: ["close"],
  setup(__props) {
    const sizeClasses = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
      "2xl": "max-w-5xl",
      "3xl": "max-w-6xl",
      "4xl": "max-w-7xl",
      "5xl": "max-w-screen-2xl"
    };
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.show) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" }, _attrs))}><div class="${ssrRenderClass([
          "bg-white rounded-lg shadow-lg w-full max-h-[90vh] overflow-hidden",
          sizeClasses[__props.size]
        ])}">`);
        if (_ctx.$slots.title) {
          _push(`<div class="flex justify-between items-center p-6 border-b border-gray-200"><div class="text-lg font-semibold text-gray-900">`);
          ssrRenderSlot(_ctx.$slots, "title", {}, null, _push, _parent);
          _push(`</div><button class="text-gray-400 hover:text-gray-600 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="overflow-y-auto max-h-[calc(90vh-140px)] p-6">`);
        ssrRenderSlot(_ctx.$slots, "content", {}, null, _push, _parent);
        _push(`</div>`);
        if (_ctx.$slots.footer) {
          _push(`<div class="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">`);
          ssrRenderSlot(_ctx.$slots, "footer", {}, null, _push, _parent);
          _push(`</div>`);
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
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Modal.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main$1 as _, _sfc_main as a };
//# sourceMappingURL=Modal-DHe5Mkod.mjs.map
