<template>
  <div class="relative w-full">
    <input
      ref="inputRef"
      type="text"
      v-model="search"
      :placeholder="placeholder"
      class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      :disabled="disabled"
      @focus="handleFocus"
      @input="!disabled && (open = true)"
      @keydown="handleKeydown"
      @blur="onBlur"
      :aria-expanded="open.toString()"
      :aria-controls="dropdownId"
      :aria-activedescendant="activeDescendantId"
    />
    <ul
      v-show="open && filteredOptions.length > 0"
      :id="dropdownId"
      class="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-auto shadow-lg"
      role="listbox"
    >
      <li
        v-for="(option, idx) in filteredOptions"
        :key="option[valueKey]"
        :id="optionId(idx)"
  :class="['px-4 py-2 cursor-pointer', idx === activeIndex ? 'bg-accent/30' : 'hover:bg-gray-100']"
        @mousedown.prevent="select(option)"
        @mouseenter="activeIndex = idx"
        role="option"
        :aria-selected="String(modelValue) === String(option[valueKey])"
      >
        {{ getLabel(option) }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
const props = defineProps({
  options: { type: Array, required: true },
  labelKey: { type: [String, Function], required: true },
  valueKey: { type: String, required: true },
  modelValue: [String, Number],
  placeholder: { type: String, default: 'Buscar...' },
  disabled: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue']);
const search = ref('');
const open = ref(false);
const activeIndex = ref(-1);
const dropdownId = `dropdown-${Math.random().toString(36).substr(2, 9)}`;
const inputRef = ref(null);

// Función para obtener el label de una opción
function getLabel(option) {
  if (typeof props.labelKey === 'function') {
    return props.labelKey(option);
  } else if (typeof props.labelKey === 'string') {
    return option[props.labelKey];
  }
  return '';
}

const filteredOptions = computed(() => {
  if (!search.value) return props.options;
  return props.options.filter(opt =>
    String(getLabel(opt)).toLowerCase().includes(search.value.toLowerCase())
  );
});
const optionId = idx => `${dropdownId}-option-${idx}`;
const activeDescendantId = computed(() =>
  activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined
);
watch(() => props.modelValue, val => {
  if (val !== undefined && val !== null) {
    const selected = props.options.find(opt => String(opt[props.valueKey]) === String(val));
    if (selected) {
      search.value = getLabel(selected);
    } else {
      search.value = '';
    }
  } else {
    search.value = '';
  }
}, { immediate: true });

// También necesitamos observar cambios en las opciones para actualizar cuando se cargan
watch(() => props.options, () => {
  if (props.modelValue !== undefined && props.modelValue !== null) {
    const selected = props.options.find(opt => String(opt[props.valueKey]) === String(props.modelValue));
    if (selected) {
      search.value = getLabel(selected);
    }
  }
}, { immediate: true });
const select = option => {
  if (!props.disabled) {
    emit('update:modelValue', option[props.valueKey]);
    search.value = getLabel(option);
    open.value = false;
  }
};
const move = dir => {
  if (!open.value) open.value = true;
  if (filteredOptions.value.length === 0) return;
  let idx = activeIndex.value + dir;
  if (idx < 0) idx = filteredOptions.value.length - 1;
  if (idx >= filteredOptions.value.length) idx = 0;
  activeIndex.value = idx;
};
const selectActive = () => {
  if (activeIndex.value >= 0 && activeIndex.value < filteredOptions.value.length) {
    select(filteredOptions.value[activeIndex.value]);
  }
};
const onBlur = () => {
  setTimeout(() => { open.value = false; }, 100);
};

const handleFocus = () => {
  if (!props.disabled) open.value = true;
  if (search.value) inputRef.value.select();
};

const handleKeydown = (event) => {
  if (props.disabled) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      move(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      move(-1);
      break;
    case 'Enter':
      event.preventDefault();
      selectActive();
      break;
    case 'Escape':
      open.value = false;
      activeIndex.value = -1;
      break;
  }
};
</script>
