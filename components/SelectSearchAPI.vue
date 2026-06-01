<template>
  <div class="relative">
    <!-- Input de búsqueda -->
    <div class="relative">
      <input ref="inputRef" v-model="searchText" type="text" :placeholder="placeholder" :disabled="disabled"
        class="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        @focus="handleFocus" @blur="handleBlur" @input="handleInput" @keydown="handleKeydown" />

      <!-- Icono de búsqueda -->
      <div class="absolute right-3 top-2.5">
        <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <svg v-else class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
      </div>
    </div>

    <!-- Dropdown de opciones -->
    <div v-if="showDropdown && (filteredOptions.length > 0 || isLoading)"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      <!-- Opción de limpiar -->
      <div v-if="selectedValue !== null && selectedValue !== '' && !isLoading"
        class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer border-b" @mousedown="clearSelection">
        Limpiar selección
      </div>

      <!-- Opciones -->
      <div v-for="(option, index) in filteredOptions" :key="getOptionValue(option)"
        class="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
        :class="{ 'bg-primary text-white': index === highlightedIndex }" @mousedown="selectOption(option)">
        <div v-if="props.labelFormat" v-html="getOptionLabel(option).replace(/\n/g, '<br>')"></div>
        <div v-else>{{ getOptionLabel(option) }}</div>
      </div>

      <!-- Mensaje cuando no hay resultados -->
      <div v-if="!isLoading && filteredOptions.length === 0 && searchText" class="px-4 py-2 text-sm text-gray-500">
        No se encontraron resultados
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, null],
    default: null
  },
  dataKey: {
    type: String,
    default: 'data'   // valor por defecto para mantener compatibilidad
  },
  endpoint: {
    type: String,
    required: true
  },
  method: {
    type: String,
    default: 'POST'
  },
  searchKey: {
    type: String,
    required: true
  },
  labelKey: {
    type: String,
    required: true
  },
  valueKey: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Buscar...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // Nueva prop para especificar si los datos vienen directamente en un array
  directData: {
    type: Boolean,
    default: false
  },
  // Nueva prop para formato personalizado del label
  labelFormat: {
    type: String,
    default: null
  },
  // Prop para etiqueta inicial al cargar
  initialLabel: {
    type: String,
    default: ''
  },
  extraBodyParams: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'entidad-seleccionada', 'producto-seleccionado']);

// Referencias
const inputRef = ref(null);
const searchText = ref('');
const selectedValue = ref(null);
const selectedOption = ref(null);
const showDropdown = ref(false);
const isLoading = ref(false);
const highlightedIndex = ref(-1);
const searchTimeout = ref(null);

// Opciones filtradas
const filteredOptions = ref([]);

// Configuración del runtime
const config = useRuntimeConfig();

// El displayText se maneja directamente en selectOption

// Función para obtener el valor de una opción
const getOptionValue = (option) => {
  return option[props.valueKey];
};

// Función para obtener el label de una opción
const getOptionLabel = (option) => {
  if (props.labelFormat) {
    // Si hay un formato personalizado, usarlo
    let formattedLabel = props.labelFormat;

    // Reemplazar las claves con los valores del objeto
    // Ejemplo: "{{num_consecutivo}}\n{{tipoContrato.nombre}}\n{{entidad.nombre}}\n{{ClienteOProveedor}}"
    formattedLabel = formattedLabel.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const keys = key.split('.');
      let value = option;

      for (const k of keys) {
        value = value?.[k];
      }

      return value || '';
    });

    return formattedLabel;
  }

  return option[props.labelKey];
};

// Función para buscar en la API
const searchAPI = async (query) => {
  if (!query || query.trim() === '') {
    filteredOptions.value = [];
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No hay token de autenticación');
    return;
  }

  try {
    isLoading.value = true;

    const body = {
      ...props.extraBodyParams,
      [props.searchKey]: query
    };
    const response = await fetch(`${config.public.backendHost}${props.endpoint}`, {
      method: props.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: props.method !== 'GET' ? JSON.stringify(body) : undefined
    });

    if (response.status === 401) {
      console.error('Sesión expirada');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigateTo('/');
      return;
    }

    if (!response.ok) {
      throw new Error(`Error en la búsqueda: ${response.status}`);
    }

    const data = await response.json();

    // Si directData es true, usar los datos directamente, sino usar data.data
    if (props.directData) {
      filteredOptions.value = Array.isArray(data) ? data : [];
    } else {
      // Usa la clave especificada en dataKey, o fallback a 'data'
      const arrayData = data[props.dataKey] || data.data || [];
      filteredOptions.value = arrayData;
    }
  } catch (error) {
    console.error('Error al buscar:', error);
    filteredOptions.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Función para manejar el input con debounce
const handleInput = () => {
  // Limpiar timeout anterior
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  // Si el campo está vacío, limpiar selección
  if (searchText.value === '') {
    selectedValue.value = null;
    selectedOption.value = null;
    emit('update:modelValue', null);
    filteredOptions.value = [];
    return;
  }

  // Configurar nuevo timeout
  searchTimeout.value = setTimeout(() => {
    searchAPI(searchText.value);
  }, 1500); // 1.5 segundos de delay
};

// Función para manejar el focus
const handleFocus = () => {
  showDropdown.value = true;
  highlightedIndex.value = -1;

  // Si hay texto seleccionado, seleccionarlo todo
  if (searchText.value) {
    nextTick(() => {
      inputRef.value?.select();
    });
  }
};

// Función para manejar el blur
const handleBlur = () => {
  // Delay para permitir que se ejecute el mousedown de las opciones
  setTimeout(() => {
    showDropdown.value = false;
    highlightedIndex.value = -1;
  }, 200);
};

// Función para manejar las teclas
const handleKeydown = (event) => {
  if (!showDropdown.value) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1);
      break;
    case 'Enter':
      event.preventDefault();
      if (highlightedIndex.value >= 0 && filteredOptions.value[highlightedIndex.value]) {
        selectOption(filteredOptions.value[highlightedIndex.value]);
      }
      break;
    case 'Escape':
      showDropdown.value = false;
      highlightedIndex.value = -1;
      break;
  }
};

// Función para seleccionar una opción
const selectOption = (option) => {
  selectedValue.value = getOptionValue(option);
  selectedOption.value = option;

  const label = getOptionLabel(option);
  if (props.labelFormat) {
    searchText.value = label.split('\n')[0];
  } else {
    searchText.value = label;
  }

  showDropdown.value = false;
  highlightedIndex.value = -1;

  emit('update:modelValue', selectedValue.value);

  // ✅ SIEMPRE emitir el objeto completo
  emit('entidad-seleccionada', option);

  // Por compatibilidad, si quieres mantener 'producto-seleccionado'
  if (props.valueKey === 'id_producto') {
    emit('producto-seleccionado', option);
  }
};

// Función para limpiar la selección
const clearSelection = () => {
  selectedValue.value = null;
  selectedOption.value = null;
  searchText.value = '';
  showDropdown.value = false;
  highlightedIndex.value = -1;
  filteredOptions.value = [];

  emit('update:modelValue', null);

  // Emitir null para entidades cuando se limpia
  if (props.valueKey === 'id_entidad') {
    emit('entidad-seleccionada', null);
  }

  // Emitir null para productos cuando se limpia
  if (props.valueKey === 'id_producto') {
    emit('producto-seleccionado', null);
  }

  // Enfocar el input
  nextTick(() => {
    inputRef.value?.focus();
  });
};

// Watcher para el modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue === null || newValue === '') {
    selectedValue.value = null;
    selectedOption.value = null;
    searchText.value = '';
  } else if (newValue && !selectedValue.value) {
    selectedValue.value = newValue;
  }
}, { immediate: true });

// Watcher para initialLabel
watch(() => props.initialLabel, (newLabel) => {
  if (newLabel && !searchText.value) {
    searchText.value = newLabel;
  }
}, { immediate: true });

// Limpiar timeout al desmontar
onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
});
</script>
