<template>
  <div
    ref="pdfContent"
    class="pdf-export-root"
    :style="hiddenStyle"
  >
    <div class="pdf-page bg-white text-slate-900 p-8" style="width:210mm; min-height:297mm;">
      <!-- Encabezado con logo y título de la universidad -->
      <div class="flex justify-between items-start border-b border-slate-300 pb-4 mb-6">
        <div class="flex items-center gap-4">
          <img src="/logo.png" alt="Logo Universidad" class="h-16 w-auto object-contain" />
          <div>
            <h1 class="text-xl font-bold uppercase leading-tight">Universidad de Sancti Spíritus</h1>
            <h2 class="text-lg font-semibold italic">José Martí Pérez</h2>
          </div>
        </div>
        <div class="text-right text-sm">
          <p>Sancti Spíritus, ___ de _____ de ____</p>
          <p class="font-semibold mt-1">“Año 67 de la Revolución”</p>
        </div>
      </div>

      <!-- Destinatario y remitente -->
      <div class="mb-6 text-sm space-y-1">
        <p><span class="font-semibold">A:</span> Dirección de Economía</p>
        <p><span class="font-semibold">De:</span> Centro de costo.</p>
      </div>

      <!-- Cuerpo de la solicitud -->
      <div class="mb-6 text-justify">
        <p>Por medio de la presente se solicita el <span class="font-semibold">movimiento de los Útiles y Herramientas</span> que a continuación se detallan.</p>
      </div>

      <!-- Tabla de útiles: 7 columnas -->
      <div class="overflow-x-auto border border-slate-300 rounded-md mb-8">
        <table class="min-w-full text-sm border-collapse">
          <thead class="bg-slate-100">
            <tr>
              <th class="border border-slate-300 px-3 py-2 text-left">Código</th>
              <th class="border border-slate-300 px-3 py-2 text-left">Descripción</th>
              <th class="border border-slate-300 px-3 py-2 text-left">Cantidad</th>
              <th class="border border-slate-300 px-3 py-2 text-left">Código Trabajador</th>
              <th class="border border-slate-300 px-3 py-2 text-left">De Área:</th>
              <th class="border border-slate-300 px-3 py-2 text-left">Código Trabajador</th>
              <th class="border border-slate-300 px-3 py-2 text-left">Para Área:</th>
            </tr>
          </thead>
          <tbody>
            <!-- Filas estáticas de ejemplo (5 filas en blanco para llenar manual) -->
            <tr v-for="n in 6" :key="n">
              <td class="border border-slate-200 px-3 py-2">&nbsp;</td>
              <td class="border border-slate-200 px-3 py-2">&nbsp;</td>
              <td class="border border-slate-200 px-3 py-2">&nbsp;</td>
              <td class="border border-slate-200 px-3 py-2">&nbsp;</td>
              <td class="border border-slate-200 px-3 py-2">&nbsp;</td>
              <td class="border border-slate-200 px-3 py-2">&nbsp;</td>
              <td class="border border-slate-200 px-3 py-2">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Firmas -->
      <div class="mt-8 space-y-6 text-sm">
        <div>
          <p>_________________________________________</p>
          <p class="font-semibold">Nombre y firma del responsable del Área para donde se encuentra el útil</p>
        </div>
        <div>
          <p>_________________________________________</p>
          <p class="font-semibold">Nombre y firma del responsable del Área para donde va el útil</p>
        </div>
        <div>
          <p>_________________________________________</p>
          <p class="font-semibold">Nombre y firma de quien recibe:</p>
          <p class="text-xs text-slate-500">(Espec. en Gestión Económica de los Útiles y Herramientas)</p>
        </div>
      </div>

      <!-- Pequeño footer opcional -->
      <div class="text-right text-xs text-slate-400 mt-12">
        <p>Documento generado electrónicamente</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  traslado: {
    type: Object,
    default: () => ({})
  }
});

const pdfContent = ref(null);
const hiddenStyle = 'position:absolute; left:-9999px; top:0; width:210mm; min-height:297mm; opacity:0; pointer-events:none;';

// Funciones auxiliares para uso futuro con datos reales
const safe = (value) => value === undefined || value === null ? '' : value;
const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const fechaEmision = new Date().toLocaleDateString();

// Exportación a PDF (idéntica a la original, funciona con el nuevo diseño)
const exportPdf = async () => {
  console.log('TrasladoPdfUtil exportPdf start', { traslado: props.traslado });
  if (typeof window === 'undefined' || !pdfContent.value) {
    console.warn('TrasladoPdfUtil exportPdf aborted: no browser o pdfContent no disponible');
    return;
  }
  const html2canvasModule = await import('html2canvas');
  const html2canvas = html2canvasModule.default || html2canvasModule;
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;

  const clone = pdfContent.value.cloneNode(true);
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.opacity = '1';
  clone.style.pointerEvents = 'none';
  clone.style.display = 'block';
  document.body.appendChild(clone);

  await new Promise((resolve) => setTimeout(resolve, 100));
  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: clone.scrollWidth,
    height: clone.scrollHeight,
    windowWidth: clone.scrollWidth,
    windowHeight: clone.scrollHeight
  });
  document.body.removeChild(clone);

  const imgData = canvas.toDataURL('image/png');
  const formatMatch = imgData.match(/^data:image\/(.+);base64,/i);
  const imageFormat = formatMatch ? formatMatch[1].toUpperCase() : 'PNG';
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pageWidth - 10;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  try {
    if (pdfHeight <= pageHeight - 10) {
      pdf.addImage(imgData, imageFormat, 5, 5, pdfWidth, pdfHeight);
    } else {
      let heightLeft = pdfHeight;
      let position = 5;
      pdf.addImage(imgData, imageFormat, 5, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight - 10;
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight + 5;
        pdf.addPage();
        pdf.addImage(imgData, imageFormat, 5, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight - 10;
      }
    }
  } catch (err) {
    console.error('TrasladoPdfUtil addImage error', err, { imageFormat });
    throw err;
  }
  const filename = `Modelo_Traslado_Util_${safe(props.traslado.id_solicitud) || 'sin-id'}.pdf`;
  pdf.save(filename.replace(/[^a-zA-Z0-9-_.]/g, '_'));
  console.log('TrasladoPdfUtil exportPdf completed');
};

defineExpose({ exportPdf });
</script>

<style scoped>
.pdf-export-root {
  font-family: 'Inter', Arial, Helvetica, sans-serif;
}
.pdf-page {
  box-shadow: 0 0 0 1px rgba(0,0,0,0.05);
}
.pdf-page table {
  border-collapse: collapse;
  width: 100%;
}
.pdf-page th, .pdf-page td {
  border: 1px solid #cbd5e1;
  vertical-align: top;
}
</style>