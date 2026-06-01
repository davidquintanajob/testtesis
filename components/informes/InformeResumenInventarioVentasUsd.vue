<template>
  <div class="flex flex-col md:flex-row items-center justify-center w-full h-full">
    <div class="w-full md:w-1/2 flex flex-col items-center justify-center p-4">
      <div v-if="isLoadingInformeA" class="text-center">Cargando informe...</div>
      <div v-else class="relative w-48 h-48 md:w-64 md:h-64 max-w-full">
        <div
          class="absolute inset-0 rounded-full"
          :style="{
            background: pieStyle,
            borderRadius: '9999px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.08)',
          }"
        ></div>
      </div>
    </div>

    <!-- Progress modal for Informe A (error no bloquea vista) -->
    <div
      v-if="isMetricsLoading"
      class="fixed inset-0 z-[20000] flex items-center justify-center bg-black/60"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-semibold mb-2">Consultando datos del informe...</h3>
        <div class="w-full bg-gray-100 rounded h-3 overflow-hidden mb-3">
          <div
            :style="{ width: metricsProgressPercent + '%' }"
            class="h-3 bg-primary transition-all"
          ></div>
        </div>
        <div class="text-sm text-gray-600">
          Progreso: {{ metricsCompleted }} / {{ metricsTotalSteps }} — {{ metricsProgressPercent }}%
        </div>
      </div>
    </div>

    <div class="w-full md:w-1/2 p-4 overflow-hidden">
      <div class="flex flex-col gap-4">
        <div class="flex items-start justify-between flex-col sm:flex-row gap-2 sm:gap-0">
          <div>
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-sm bg-orange-400 inline-block"></span>
              <span class="font-medium">Costos de compra</span>
            </div>
            <div class="text-xs text-gray-500">
              Sumatoria de (<em>cantidad-de-entradas * costo-de-entrada-usd</em>) de todo el inventario.
            </div>
          </div>
          <div class="font-semibold text-right">
            {{ formatNumber(comprasTotal) }}
            <span class="text-sm text-gray-500">({{ percentages[0].toFixed(1) }}%)</span>
          </div>
        </div>

        <div class="flex items-start justify-between flex-col sm:flex-row gap-2 sm:gap-0">
          <div>
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-sm bg-blue-500 inline-block"></span>
              <span class="font-medium">Inventario (valor)</span>
            </div>
            <div class="text-xs text-gray-500">
              Sumatoria de (<em>costo-usd * cantidad-en-existencia</em>) de todos los productos en el sistema.
            </div>
          </div>
          <div class="font-semibold text-right">
            {{ formatNumber(inventarioTotal) }}
            <span class="text-sm text-gray-500">({{ percentages[1].toFixed(1) }}%)</span>
          </div>
        </div>

        <div class="flex items-start justify-between flex-col sm:flex-row gap-2 sm:gap-0">
          <div>
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-sm bg-green-500 inline-block"></span>
              <span class="font-medium">Ventas (USD)</span>
            </div>
            <div class="text-xs text-gray-500">
              Sumatoria de (<em>precio-usd-cobrado-de-venta * cantidad</em>) de todas las ventas.
            </div>
          </div>
          <div class="font-semibold text-right">
            {{ formatNumber(ventasTotal) }}
            <span class="text-sm text-gray-500">({{ percentages[2].toFixed(1) }}%)</span>
          </div>
        </div>

        <div class="flex items-start justify-between flex-col sm:flex-row gap-2 sm:gap-0">
          <div>
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-sm bg-red-500 inline-block"></span>
              <span class="font-medium">Salidas (Pérdidas)</span>
            </div>
            <div class="text-xs text-gray-500">
              Sumatoria de (<em>cantidad * producto.costo_usd</em>) de las salidas (pérdidas).
            </div>
          </div>
          <div class="font-semibold text-right">
            {{ formatNumber(salidasTotal) }}
            <span class="text-sm text-gray-500">({{ percentages[3].toFixed(1) }}%)</span>
          </div>
        </div>

        <div class="flex items-start justify-between flex-col sm:flex-row gap-2 sm:gap-0">
          <div>
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-sm bg-white border border-gray-300 inline-block"></span>
              <span class="font-medium">Retiros (USD)</span>
            </div>
            <div class="text-xs text-gray-500">
              Sumatoria convertida en USD:
              (<em>cantidad_retirada_cup / cambio_moneda</em>) + <em>cantidad_retirada_usd</em>.
            </div>
          </div>
          <div class="font-semibold text-right">{{ formatNumber(retirosTotal) }}</div>
        </div>

        <div class="flex items-start justify-between flex-col sm:flex-row gap-2 sm:gap-0">
          <div>
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-sm border border-gray-300 inline-block"></span>
              <span class="font-medium">Costo Ventas (USD)</span>
            </div>
            <div class="text-xs text-gray-500">
              Sumatoria de (<em>costo-venta * cantidad</em>) de todas las ventas registradas.
            </div>
          </div>
          <div class="font-semibold text-right">{{ formatNumber(costoVentasTotal) }}</div>
        </div>

        <div class="flex items-start justify-between flex-col sm:flex-row gap-2 sm:gap-0">
          <div>
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-sm border border-gray-300 inline-block"></span>
              <span class="font-medium">Ganancia (Ventas - Costos - Retiros)</span>
            </div>
            <div class="text-xs text-gray-500">
              Ganancia neta:
              <em>Ventas - Costo de ventas - Pérdidas - Retiros</em>
            </div>
          </div>
          <div class="font-semibold text-right">{{ formatNumber(gananciaTotal) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRuntimeConfig } from '#imports';
import { navigateTo } from 'nuxt/app';

// Funcion para dar formato a los numeros
function formatNumber(value) {
  if (value === null || value === undefined) return '0.00';
  const rounded = value.toFixed(2);
  const [integerPart, decimalPart] = rounded.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formattedInteger}.${decimalPart}`;
}

const config = useRuntimeConfig();

const isLoadingInformeA = ref(false);
const comprasTotal = ref(0);
const inventarioTotal = ref(0);
const ventasTotal = ref(0);
const costoVentasTotal = ref(0);
const salidasTotal = ref(0);
const retirosTotal = ref(0);

const isMetricsLoading = ref(false);
const metricsTotalSteps = 5;
const metricsCompleted = ref(0);
const metricsError = ref(false);
const metricsErrorMessage = ref('');

const metricsProgressPercent = computed(() => {
  return Math.min(100, Math.round((metricsCompleted.value / metricsTotalSteps) * 100));
});

async function fetchJson(url, token) {
  const resp = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json', Authorization: token },
  });
  if (resp.status === 401) {
    localStorage.removeItem('token');
    navigateTo('/login');
    throw new Error('Unauthorized');
  }
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(txt || `HTTP ${resp.status}`);
  }
  return resp.json();
}

function safeNum(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

async function generateInformeA() {
  isLoadingInformeA.value = true;
  isMetricsLoading.value = true;
  metricsCompleted.value = 0;
  metricsError.value = false;
  metricsErrorMessage.value = '';
  comprasTotal.value =
    inventarioTotal.value =
    ventasTotal.value =
    costoVentasTotal.value =
    salidasTotal.value =
    retirosTotal.value =
      0;

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      navigateTo('/login');
      return;
    }

    // 1) /entrada
    let entradas = [];
    try {
      entradas = await fetchJson(`${config.public.backendHost}/entrada`, token);
    } catch (e) {
      console.error(e);
      metricsError.value = true;
      metricsErrorMessage.value = 'Error consultando entradas';
    }
    metricsCompleted.value += 1;
    try {
      let compras = 0;
      for (const e of entradas || []) {
        const cantidad = safeNum(e.cantidadEntrada);
        const costo_usd = safeNum(e.costo_usd);
        compras += cantidad * costo_usd;
      }
      comprasTotal.value = compras;
    } catch (e) {
      console.error(e);
    }

    // 2) /producto
    let productos = [];
    try {
      productos = await fetchJson(`${config.public.backendHost}/producto`, token);
    } catch (e) {
      console.error(e);
      metricsError.value = true;
      metricsErrorMessage.value = 'Error consultando productos';
    }
    metricsCompleted.value += 1;
    try {
      let inventario = 0;
      for (const p of productos || []) {
        const costo_usd = safeNum(p.costo_usd);
        const cantidadExist = safeNum(p.cantidadExistencia);
        inventario += costo_usd * cantidadExist;
      }
      inventarioTotal.value = inventario;
    } catch (e) {
      console.error(e);
    }

    // 3) /venta
    let ventas = [];
    try {
      ventas = await fetchJson(`${config.public.backendHost}/venta`, token);
    } catch (e) {
      console.error(e);
      metricsError.value = true;
      metricsErrorMessage.value = 'Error consultando ventas';
    }
    metricsCompleted.value += 1;
    try {
      let ventasSum = 0;
      let costoVentasSum = 0;
      for (const v of ventas || []) {
        const precio_cobrado = safeNum(v.precio_cobrado);
        const costo_venta_usd = safeNum(v.costo_venta_usd);
        const cantidad = safeNum(v.cantidad);
        const cambio = safeNum(v.cambioUSD_al_vender) || 1;
        ventasSum += (precio_cobrado * cantidad) / cambio;
        costoVentasSum += costo_venta_usd * cantidad;
      }
      ventasTotal.value = ventasSum;
      costoVentasTotal.value = costoVentasSum;
    } catch (e) {
      console.error(e);
    }

    // 4) /salida (pérdidas)
    let salidas = [];
    try {
      salidas = await fetchJson(`${config.public.backendHost}/salida`, token);
    } catch (e) {
      console.error(e);
      metricsError.value = true;
      metricsErrorMessage.value = 'Error consultando salidas';
    }
    metricsCompleted.value += 1;
    try {
      let salidasSum = 0;
      for (const s of salidas || []) {
        const cantidad = safeNum(s.cantidad);
        const costo_cup = safeNum(s.costo_producto_usd);
        salidasSum += cantidad * costo_cup;
      }
      salidasTotal.value = salidasSum;
    } catch (e) {
      console.error(e);
    }

    // 5) /Retiro/filterRetiros - calcular retiros en USD:
    // (cantidad_retirada_cup / cambio_moneda) + cantidad_retirada_usd
    let retiros = [];
    try {
      const retiroRes = await fetch(
        `${config.public.backendHost}/Retiro/filterRetiros/null/null`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({}),
        },
      );
      if (retiroRes.ok) {
        const retiroData = await retiroRes.json();
        retiros = retiroData && retiroData.data ? retiroData.data : [];
      } else {
        console.error('retiros fetch status', retiroRes.status);
        metricsError.value = true;
        metricsErrorMessage.value = 'Error consultando retiros';
      }
    } catch (e) {
      console.error(e);
      metricsError.value = true;
      metricsErrorMessage.value = 'Error consultando retiros';
    }
    metricsCompleted.value += 1;
    try {
      let retirosSum = 0;
      for (const r of retiros || []) {
        const cup = safeNum(r.cantidad_retirada_cup);
        const usd = safeNum(r.cantidad_retirada_usd);
        const cambio = safeNum(r.cambio_moneda) || 1;
        const convertedCup = cambio && cambio !== 0 ? cup / cambio : cup;
        retirosSum += convertedCup + usd;
      }
      retirosTotal.value = retirosSum;
    } catch (e) {
      console.error(e);
    }
  } catch (err) {
    console.error('Error generating informe A:', err);
    metricsError.value = true;
    metricsErrorMessage.value = 'Ocurrió un error generando el informe';
  } finally {
    isLoadingInformeA.value = false;
    isMetricsLoading.value = false;
    metricsCompleted.value = metricsTotalSteps;
  }
}

const pieStyle = computed(() => {
  // Mostrar en el gráfico las categorías: compras, inventario, ventas, salidas (EXCLUIMOS retiros del gráfico)
  const visibleValues = [
    comprasTotal.value,
    inventarioTotal.value,
    ventasTotal.value,
    salidasTotal.value,
  ];
  const colors = ['#F97316', '#0369A1', '#10B981', '#EF4444'];
  const visibleTotal = visibleValues.reduce((s, v) => s + Math.max(0, v), 0);
  const gap = 0.6; // gap percent between slices
  let acc = 0;
  const parts = [];

  if (!visibleTotal || visibleTotal <= 0) {
    // fallback: light gray circle when no data
    return 'conic-gradient(#eef2f7 0% 100%)';
  }

  for (let i = 0; i < visibleValues.length; i += 1) {
    const v = Math.max(0, visibleValues[i]);
    const pct = (v / visibleTotal) * 100;
    const colorPct = Math.max(0, pct - gap);
    if (colorPct > 0) {
      const start = acc;
      const end = acc + colorPct;
      parts.push(`${colors[i]} ${start}% ${end}%`);
      acc = end;
    }
    // add transparent gap
    acc += gap;
    parts.push(`transparent ${Math.max(0, acc - gap)}% ${acc}%`);
  }
  // ensure full coverage
  if (acc < 100) parts.push(`transparent ${acc}% 100%`);

  return `conic-gradient(${parts.join(', ')})`;
});

const percentages = computed(() => {
  const values = [
    comprasTotal.value,
    inventarioTotal.value,
    ventasTotal.value,
    salidasTotal.value,
    retirosTotal.value,
    costoVentasTotal.value,
  ];
  const total = values.reduce((s, v) => s + Math.max(0, v), 0) || 0;
  if (total === 0) return values.map(() => 0);
  return values.map((v) => (Math.max(0, v) / total) * 100);
});

// Ganancia: ventas - costo de ventas (no se grafica, solo se muestra en la leyenda)
const gananciaTotal = computed(() => {
  return (
    (ventasTotal.value || 0) -
    (costoVentasTotal.value || 0) -
    (salidasTotal.value || 0) -
    (retirosTotal.value || 0)
  );
});

onMounted(() => {
  // Ejecutar informe A solo cuando el componente se monta,
  // es decir, cuando el usuario selecciona este informe.
  generateInformeA();
});
</script>

