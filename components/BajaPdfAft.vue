<template>
  <div
    ref="pdfContent"
    class="pdf-export-root"
    :style="hiddenStyle"
  >
    <div class="pdf-page bg-white text-black p-6" style="width:210mm; min-height:297mm; font-family: 'Times New Roman', serif;">
      <!-- Encabezado Universidad -->
      <div class="text-center mb-2">
        <div class="text-xl font-bold uppercase tracking-wide">UNIVERSIDAD DE SANCTI SPÍRITUS</div>
        <div class="text-lg font-semibold italic">José Martí Pérez</div>
      </div>

      <!-- Título principal -->
      <div class="text-center my-6">
        <h1 class="text-base font-bold uppercase tracking-wide">INFORME PARA LA PROPUESTA DE BAJA DE LOS MEDIOS BASICOS</h1>
      </div>

      <!-- DATOS DEL MEDIO -->
      <div class="mb-5">
        <h2 class="text-base font-bold border-b border-black inline-block pr-4">DATOS DEL MEDIO</h2>
        <div class="mt-3 space-y-2 text-sm">
          <div class="flex items-center">
            <span class="font-semibold w-28">Descripción:</span>
            <span class="border-b border-black flex-1 ml-2 h-5"></span>
          </div>
          <div class="flex items-center">
            <span class="font-semibold w-28">Marca:</span>
            <span class="border-b border-black flex-1 ml-2 h-5"></span>
          </div>
          <div class="flex items-center">
            <span class="font-semibold w-28">Modelo:</span>
            <span class="border-b border-black flex-1 ml-2 h-5"></span>
          </div>
          <div class="flex items-center">
            <span class="font-semibold w-28">Serie:</span>
            <span class="border-b border-black flex-1 ml-2 h-5"></span>
          </div>
          <div class="flex items-center">
            <span class="font-semibold w-28">No. Inventario</span>
            <span class="border-b border-black flex-1 ml-2 h-5"></span>
          </div>
          <div class="flex items-center">
            <span class="font-semibold w-28">Fac. o Área</span>
            <span class="border-b border-black flex-1 ml-2 h-5"></span>
          </div>
          <div class="flex items-center">
            <span class="font-semibold w-28">Lab. O Local</span>
            <span class="border-b border-black flex-1 ml-2 h-5"></span>
          </div>
        </div>
      </div>

      <!-- Revisión técnica -->
      <div class="mb-5 text-sm">
        <p>
          El medio básico de referencia ha sido revisado por el Co. (a)
          <span class="border-b border-black inline-block w-48"></span>
          que ocupa el cargo de
          <span class="border-b border-black inline-block w-48"></span>
          en la Facultad o Área de
          <span class="border-b border-black inline-block w-48"></span>
          detectándose que el mismo no puede seguir utilizando en funciones para la cual fue diseñado debido a los problemas siguientes:
        </p>
        <div class="border-b border-black w-full h-16 mt-2"></div>
        <div class="border-b border-black w-full h-16 mt-1"></div>
        <div class="border-b border-black w-full h-16 mt-1"></div>
        <div class="border-b border-black w-full h-16 mt-1"></div>
      </div>

      <!-- Propuesta de baja -->
      <div class="mb-6 text-sm">
        <p>
          Por lo que se propone su baja definitiva para que así conste firmo la presente
          <span class="border-b border-black inline-block w-32"></span>
          el día
          <span class="border-b border-black inline-block w-12"></span>
          de
          <span class="border-b border-black inline-block w-28"></span>
          del 20
          <span class="border-b border-black inline-block w-8"></span>.
        </p>
        <p class="mt-3">
          Firma del Técnico
          <span class="border-b border-black inline-block w-48 ml-2"></span>
        </p>
      </div>

      <!-- ACTA DE EVALUACIÓN DE LA COMISIÓN TÉCNICA -->
      <div class="mt-6 pt-4 border-t border-black">
        <h2 class="text-base font-bold uppercase text-center mb-3">ACTA DE EVALUACIÓN DE LA COMISIÓN TÉCNICA</h2>
        <p class="text-sm mb-3">
          De acuerdo al Resuelvo sexto de la RM 155/88. La comisión integrada por los compañeros debajo relacionados se reúne el día
          <span class="border-b border-black inline-block w-12"></span>
          de
          <span class="border-b border-black inline-block w-28"></span>
          del 20
          <span class="border-b border-black inline-block w-8"></span>
          y luego de evaluar el medio de referencia emiten el siguiente.
        </p>
        <h3 class="font-bold text-base text-center my-2">DICTAMEN</h3>
        <div class="border border-black p-2 min-h-[120px] text-sm mb-4">
          <div class="border-b border-black w-full h-6"></div>
          <div class="border-b border-black w-full h-6 mt-1"></div>
          <div class="border-b border-black w-full h-6 mt-1"></div>
          <div class="border-b border-black w-full h-6 mt-1"></div>
          <div class="border-b border-black w-full h-6 mt-1"></div>
        </div>

        <!-- Firmas finales -->
        <div class="grid grid-cols-3 gap-4 text-center text-sm mt-4">
          <div>
            <div class="border-b border-black w-full h-6 mb-1"></div>
            <p class="font-semibold">Dtor. Económico</p>
          </div>
          <div>
            <div class="border-b border-black w-full h-6 mb-1"></div>
            <p class="font-semibold">Resp. Com. Técnica</p>
          </div>
          <div>
            <div class="border-b border-black w-full h-6 mb-1"></div>
            <p class="font-semibold">Perito Calificado</p>
          </div>
        </div>

        <!-- Distribución de copias -->
        <div class="mt-6 text-xs">
          <p>Original: Dirección de Economía</p>
          <p>Copia 1: Fac. o Áreas</p>
          <p>Copia 2: Dependencia emisora</p>
        </div>
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
  console.log('BajaPdfAft exportPdf start', { baja: props.baja });
  if (typeof window === 'undefined' || !pdfContent.value) {
    console.warn('BajaPdfAft exportPdf aborted: no browser o pdfContent no disponible');
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
    console.error('BajaPdfAft addImage error', err, { imageFormat });
    throw err;
  }
  const filename = `Propuesta_Baja_AFT_${safe(props.baja.id_solicitud) || 'sin-id'}.pdf`;
  pdf.save(filename.replace(/[^a-zA-Z0-9-_.]/g, '_'));
  console.log('BajaPdfAft exportPdf completed');
};

defineExpose({ exportPdf });
</script>

<style scoped>
.pdf-export-root {
  font-family: 'Times New Roman', Times, serif;
}
.pdf-page {
  box-shadow: 0 0 0 1px rgba(0,0,0,0.05);
}
</style>