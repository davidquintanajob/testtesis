<template>
  <div
    ref="pdfContent"
    class="pdf-export-root"
    :style="hiddenStyle"
  >
    <div class="pdf-page bg-white text-slate-800 p-6" style="width:210mm; min-height:297mm;">
      <!-- Encabezado con logo y fecha (compacto) -->
      <div class="flex justify-between items-start border-b border-slate-300 pb-3 mb-4">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="Logo Universidad" class="h-12 w-auto object-contain" />
          <div>
            <h1 class="text-sm font-bold uppercase leading-tight">Universidad de Sancti Spíritus</h1>
            <h2 class="text-xs font-semibold italic">José Martí Pérez</h2>
          </div>
        </div>
        <div class="text-right text-xs">
          <p>Sancti Spíritus, ___ de _____ de ____</p>
          <p class="font-semibold mt-1">“Año 67 de la Revolución”</p>
        </div>
      </div>

      <!-- Título principal (más pequeño) -->
      <div class="text-center mb-5">
        <h2 class="text-base font-bold uppercase tracking-wide">PROPUESTA DE BAJA PARA ÚTILES Y HERRAMIENTAS</h2>
      </div>

      <!-- Área que propone la baja -->
      <div class="mb-4">
        <p class="font-semibold text-xs">Área que propone la Baja:</p>
        <div class="border-b border-slate-400 mt-1 w-2/3 h-5"></div>
      </div>

      <!-- Tabla de útiles (texto pequeño) -->
      <div class="overflow-x-auto border border-slate-300 rounded-md mb-5">
        <table class="min-w-full text-xs border-collapse">
          <thead class="bg-slate-100">
            <tr>
              <th class="border border-slate-300 px-2 py-1.5 text-left font-semibold">Código</th>
              <th class="border border-slate-300 px-2 py-1.5 text-left font-semibold">Descripción</th>
              <th class="border border-slate-300 px-2 py-1.5 text-left font-semibold">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            <!-- Filas estáticas en blanco (7 filas) -->
            <tr v-for="n in 7" :key="n">
              <td class="border border-slate-200 px-2 py-1.5">&nbsp;</td>
              <td class="border border-slate-200 px-2 py-1.5">&nbsp;</td>
              <td class="border border-slate-200 px-2 py-1.5">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Observación (más compacta) -->
      <div class="mb-5">
        <p class="font-semibold text-xs">Observación:</p>
        <div class="border-b border-slate-400 mt-1 w-full h-6"></div>
        <div class="border-b border-slate-400 mt-1 w-full h-6"></div>
        <div class="border-b border-slate-400 mt-1 w-full h-6"></div>
      </div>

      <!-- Firmas (dos columnas, texto pequeño) -->
      <div class="grid grid-cols-2 gap-6 mt-4">
        <div>
          <div class="border-b border-slate-400 w-full h-6 mb-0.5"></div>
          <p class="text-xs font-semibold mt-1">Nombre y Firma:</p>
          <p class="text-[10px] text-slate-600">Responsable de los Útiles del Área</p>
        </div>
        <div>
          <div class="border-b border-slate-400 w-full h-6 mb-0.5"></div>
          <p class="text-xs font-semibold mt-1">Nombre y Firma de quien Recibe:</p>
          <p class="text-[10px] text-slate-600">Especialista Gestión Econ. De los Útiles</p>
        </div>
      </div>

      <!-- Footer opcional -->
      <div class="text-right text-[9px] text-slate-400 mt-12">
        <p>Documento generado electrónicamente</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  baja: {
    type: Object,
    default: () => ({})
  }
});

const pdfContent = ref(null);
const hiddenStyle = 'position:absolute; left:-9999px; top:0; width:210mm; min-height:297mm; opacity:0; pointer-events:none;';

const safe = (value) => value === undefined || value === null ? '' : value;

const exportPdf = async () => {
  console.log('BajaPdfUtil exportPdf start', { baja: props.baja });
  if (typeof window === 'undefined' || !pdfContent.value) {
    console.warn('BajaPdfUtil exportPdf aborted: no browser o pdfContent no disponible');
    return;
  }

  // Clonar y corregir rutas de imágenes
  const clone = pdfContent.value.cloneNode(true);
  const images = clone.querySelectorAll('img');
  for (const img of images) {
    const originalSrc = img.getAttribute('src');
    if (originalSrc && !originalSrc.startsWith('http') && !originalSrc.startsWith('data:')) {
      img.src = new URL(originalSrc, window.location.origin).href;
    }
    img.setAttribute('crossorigin', 'anonymous');
  }

  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.opacity = '1';
  clone.style.pointerEvents = 'none';
  clone.style.display = 'block';
  document.body.appendChild(clone);

  // Esperar a que todas las imágenes del clon se carguen
  const imagePromises = Array.from(clone.querySelectorAll('img')).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  });
  await Promise.all(imagePromises);
  await new Promise((resolve) => setTimeout(resolve, 100));

  const html2canvasModule = await import('html2canvas');
  const html2canvas = html2canvasModule.default || html2canvasModule;
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;

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
    console.error('BajaPdfUtil addImage error', err, { imageFormat });
    throw err;
  }
  const filename = `Propuesta_Baja_Util_${safe(props.baja.id_solicitud) || 'sin-id'}.pdf`;
  pdf.save(filename.replace(/[^a-zA-Z0-9-_.]/g, '_'));
  console.log('BajaPdfUtil exportPdf completed');
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