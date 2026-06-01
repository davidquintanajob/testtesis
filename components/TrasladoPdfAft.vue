<template>
  <!-- Contenedor oculto para el PDF (documento + tabla) -->
  <div
    ref="pdfContent"
    class="absolute left-[-9999px] top-0 w-[210mm] bg-white"
  >
    <div
      v-html="fullHtmlContent"
      class="pdf-raw w-[210mm] min-h-[297mm] bg-white p-[10mm] box-border font-['Arial'] text-[9px] text-black"
    ></div>
  </div>

  <!-- Pantalla de carga modal (bloquea toda la interacción) -->
  <Teleport to="body">
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center"
      style="pointer-events: auto;"
    >
      <div class="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[280px]">
        <div class="w-12 h-12 border-4 border-[#099ebf] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-700 font-medium text-lg">Cargando datos y generando PDF...</p>
        <p class="text-gray-500 text-sm">No cierres esta ventana</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import htmlTemplate from './documento-traslado.html?raw'

const props = defineProps({
  traslado: {
    type: Object,
    default: null
  }
})

const config = useRuntimeConfig()
const pdfContent = ref(null)
const isLoading = ref(false)

// Datos del documento oficial
const pdfData = ref({
  empresa: 'Universidad de Sancti Spiritus José Martí',
  codigo: '223.0.12.651',
  direccion: 'Calle Principal #123',
  area: '',
  areaCodigoReferencia: '',
  inventarioNo: '',
  fechaOperacionDia: '',
  fechaOperacionMes: '',
  fechaOperacionAnio: '',
  alquiler: 'N/A',
  depreciacion: 'N/A',
  entidad: 'Almacén Central',
  entidadDireccion: 'Avenida Central #456',
  entidadArea: 'Almacén',
  entidadCI: 'No. Identificación',
  tipoMovimiento: '',
  fundamentacion: '',
  tecnicoNombre: '',
  tecnicoHecho: '',
  tecnicoHechoMes: '',
  tecnicoHechoAnio: '',
  tecnicoCargo: '',
  tecnicoFirma: 'Firma autorizada',
  autorizadoNombre: '',
  autorizadoCargo: '',
  autorizadoFirma: 'Firma autorizada',
  aprobadoCargo: 'Director',
  aprobadoNombre: 'Carlos Martínez Silva',
  aprobadoFirma: 'Firma autorizada',
  trasportadorNombre: 'Personal de Transporte',
  trasportadorFirma: 'Firma autorizada'
})

// Lista de activos para la tabla
const assetsList = ref([])

// Estilos adicionales
const injectedStyle = `
<style>
.pdf-raw * { box-sizing: border-box; }
.pdf-raw table, .pdf-raw td, .pdf-raw th { border: 1px solid #000 !important; border-color: #000 !important; }
.pdf-raw table { border-collapse: collapse !important; }
.pdf-raw img { max-width: 100%; }
.pdf-raw td[style], .pdf-raw th[style] { border-color: #000 !important; }
</style>
`

// ---------- Funciones de carga de datos ----------
const setCurrentDate = () => {
  const now = new Date()
  pdfData.value.fechaOperacionDia = String(now.getDate()).padStart(2, '0')
  pdfData.value.fechaOperacionMes = String(now.getMonth() + 1).padStart(2, '0')
  pdfData.value.fechaOperacionAnio = String(now.getFullYear())
  pdfData.value.tecnicoHecho = pdfData.value.fechaOperacionDia
  pdfData.value.tecnicoHechoMes = pdfData.value.fechaOperacionMes
  pdfData.value.tecnicoHechoAnio = pdfData.value.fechaOperacionAnio
}

const fetchAreaInfo = async (areaId) => {
  if (!areaId) return null
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const cleanId = areaId.trim()
    const response = await fetch(`${config.public.backendHost}/areas/${cleanId}`, {
      headers: { Authorization: token }
    })
    if (!response.ok) throw new Error(`Error ${response.status} al obtener área`)
    return await response.json()
  } catch (err) {
    console.error('Error fetching area:', err)
    return null
  }
}

const loadUserInfo = () => {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      pdfData.value.autorizadoNombre = user.id_usuario_LDAP || ''
      pdfData.value.autorizadoCargo = user.rol || ''
      if (!pdfData.value.tecnicoNombre) pdfData.value.tecnicoNombre = user.id_usuario_LDAP || ''
      if (!pdfData.value.tecnicoCargo) pdfData.value.tecnicoCargo = user.rol || ''
    } else {
      console.warn('No se encontró usuario en localStorage bajo la clave "user"')
    }
  } catch (e) {
    console.error('Error al leer usuario de localStorage', e)
  }
}

const fetchAssets = async () => {
  if (!props.traslado?.detalles?.length) {
    assetsList.value = []
    return
  }
  const token = localStorage.getItem('token')
  if (!token) return
  const fetched = []
  for (const detalle of props.traslado.detalles) {
    const activoId = detalle.id_activoFijo_o_util
    if (!activoId) continue
    try {
      const response = await fetch(`${config.public.backendHost}/aft/${activoId.trim()}`, {
        headers: { Authorization: token }
      })
      if (!response.ok) throw new Error(`Error ${response.status} al obtener activo ${activoId}`)
      const data = await response.json()
      fetched.push({
        id: data.Id_ActivoFijo?.trim() || '',
        descripcion: data.Desc_ActivoFijo?.trim() || '',
        valorInicial: data.Valor_Inicial ?? 0,
        depreciacionAcumulada: data.Depreciacion_Acumulada ?? 0
      })
    } catch (err) {
      console.error(`Error fetching aft/${activoId}:`, err)
      fetched.push({ id: activoId, descripcion: 'Error al cargar', valorInicial: 0, depreciacionAcumulada: 0 })
    }
  }
  assetsList.value = fetched
}

const loadPdfData = async () => {
  if (!props.traslado?.solicitud) {
    console.warn('Traslado inválido o sin solicitud')
    return
  }
  const solicitud = props.traslado.solicitud
  const origenId = props.traslado.id_AreaResponsabilidad_origen

  setCurrentDate()
  pdfData.value.tipoMovimiento = solicitud.tipo_movimiento || ''
  pdfData.value.fundamentacion = solicitud.fundamentacion || ''

  const areaData = await fetchAreaInfo(origenId)
  if (areaData) {
    pdfData.value.area = (areaData.Desc_AreaResponsabilidad || '').trim()
    pdfData.value.areaCodigoReferencia = (areaData.Id_AreaResponsabilidad || '').trim()
    pdfData.value.inventarioNo = (areaData.Id_Ccosto || '').replace(/\s/g, '')
  } else {
    pdfData.value.area = 'Área no encontrada'
    pdfData.value.inventarioNo = 'N/D'
  }
  loadUserInfo()
  await fetchAssets()
}

// ---------- Generación del HTML del documento oficial ----------
const generateDocumentHtml = () => {
  let html = htmlTemplate
  const data = pdfData.value
  const replacements = {
    EMPRESA: data.empresa,
    CODIGO: data.codigo,
    DIRECCION: data.direccion,
    AREA: data.area,
    AREA_CODIGO: data.areaCodigoReferencia,
    INVENTARIO_NO: data.inventarioNo,
    FECHA_DIA: data.fechaOperacionDia,
    FECHA_MES: data.fechaOperacionMes,
    FECHA_ANIO: data.fechaOperacionAnio,
    ENTIDAD: data.entidad,
    ENTIDAD_DIRECCION: data.entidadDireccion,
    ENTIDAD_AREA: data.entidadArea,
    ENTIDAD_CI: data.entidadCI,
    TIPO_MOVIMIENTO: data.tipoMovimiento,
    FUNDAMENTACION: data.fundamentacion,
    TECNICO_NOMBRE: data.tecnicoNombre,
    TECNICO_HECHO: data.tecnicoHecho,
    TECNICO_HECHO_MES: data.tecnicoHechoMes,
    TECNICO_HECHO_ANIO: data.tecnicoHechoAnio,
    TECNICO_CARGO: data.tecnicoCargo,
    TECNICO_FIRMA: data.tecnicoFirma,
    AUTORIZADO_NOMBRE: data.autorizadoNombre,
    AUTORIZADO_CARGO: data.autorizadoCargo,
    AUTORIZADO_FIRMA: data.autorizadoFirma,
    APROBADO_NOMBRE: data.aprobadoNombre,
    APROBADO_CARGO: data.aprobadoCargo,
    APROBADO_FIRMA: data.aprobadoFirma,
    TRASPORTADOR_NOMBRE: data.trasportadorNombre,
    TRASPORTADOR_FIRMA: data.trasportadorFirma
  }
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    html = html.replace(regex, value || '')
  }
  // Marcar tipo de movimiento
  const tipoMovimiento = (data.tipoMovimiento || '').trim()
  if (tipoMovimiento) {
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const movimientoEscaped = escapeRegex(tipoMovimiento)
    const regexPattern = new RegExp(`(_{2}\\s*)${movimientoEscaped}`, 'i')
    html = html.replace(regexPattern, (match) => match.replace(/_+/, 'X '))
  }
  return html
}

// ---------- Generación de la tabla de activos con margen superior para que caiga en segunda hoja ----------
const generateAssetsTableHtml = () => {
  if (!assetsList.value.length) {
    return '<div style="page-break-before: always; margin-top: 30mm;"></div><p>No hay activos asociados a este traslado.</p>'
  }
  let tableRows = ''
  for (const asset of assetsList.value) {
    tableRows += `
      <tr>
        <td style="border:1px solid #000; padding:4px;">${asset.id}</td>
        <td style="border:1px solid #000; padding:4px;">${asset.descripcion}</td>
        <td style="border:1px solid #000; padding:4px; text-align:right;">${asset.valorInicial.toFixed(2)}</td>
        <td style="border:1px solid #000; padding:4px; text-align:right;">${asset.depreciacionAcumulada.toFixed(2)}</td>
      </tr>
    `
  }
  return `
    <div style="page-break-before: always; margin-top: 30mm;"></div>
    <div style="margin-top: 60mm;">
      <h2 style="text-align:center; font-size:14px;">Relación de Activos Trasladados</h2>
      <table style="width:100%; border-collapse:collapse; margin-top:10px;">
        <thead>
          <tr style="background-color:#f0f0f0;">
            <th style="border:1px solid #000; padding:6px;">NI</th>
            <th style="border:1px solid #000; padding:6px;">Descripción</th>
            <th style="border:1px solid #000; padding:6px;">Valor inicial</th>
            <th style="border:1px solid #000; padding:6px;">Depreciación acumulada</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <p style="margin-top:20px; font-size:9px;">Fecha de generación: ${new Date().toLocaleDateString()}</p>
    </div>
  `
}

// HTML completo: documento oficial + tabla con margen
const fullHtmlContent = computed(() => {
  const docHtml = generateDocumentHtml()
  const tableHtml = generateAssetsTableHtml()
  return injectedStyle + docHtml + tableHtml
})

// ---------- Exportar PDF ----------
const exportPdf = async () => {
  if (typeof window === 'undefined' || !pdfContent.value) return
  isLoading.value = true
  try {
    await loadPdfData()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 200)) // esperar renderizado

    const clone = pdfContent.value.cloneNode(true)
    clone.style.position = 'absolute'
    clone.style.left = '-9999px'
    clone.style.top = '0'
    clone.style.opacity = '1'
    clone.style.pointerEvents = 'none'
    document.body.appendChild(clone)

    const html2canvasModule = await import('html2canvas')
    const html2canvas = html2canvasModule.default || html2canvasModule
    const jsPDFModule = await import('jspdf')
    const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    })
    document.body.removeChild(clone)

    const imgWidthPx = canvas.width
    const imgHeightPx = canvas.height
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 5
    const pdfContentWidth = pageWidth - margin * 2
    const pdfContentHeight = pageHeight - margin * 2
    const mmPerPx = pdfContentWidth / imgWidthPx
    const pageHeightPx = Math.floor(pdfContentHeight / mmPerPx)

    let y = 0
    let pageCount = 0
    while (y < imgHeightPx) {
      const sliceHeightPx = Math.min(pageHeightPx, imgHeightPx - y)
      const tmpCanvas = document.createElement('canvas')
      tmpCanvas.width = imgWidthPx
      tmpCanvas.height = sliceHeightPx
      const tmpCtx = tmpCanvas.getContext('2d')
      tmpCtx.drawImage(canvas, 0, y, imgWidthPx, sliceHeightPx, 0, 0, imgWidthPx, sliceHeightPx)
      const imgData = tmpCanvas.toDataURL('image/png')
      const imgHeightMm = sliceHeightPx * mmPerPx
      if (pageCount > 0) pdf.addPage()
      pdf.addImage(imgData, 'PNG', margin, margin, pdfContentWidth, imgHeightMm)
      y += sliceHeightPx
      pageCount++
    }
    pdf.save(`Traslado_${props.traslado?.id_solicitud || 'documento'}.pdf`)
  } catch (error) {
    console.error('Error al generar PDF:', error)
    alert('Ocurrió un error al generar el PDF. Revisa la consola.')
  } finally {
    isLoading.value = false
  }
}

// Precarga de datos cuando cambia el traslado
watch(() => props.traslado, async (newVal) => {
  if (newVal) await loadPdfData()
}, { immediate: true, deep: true })

defineExpose({ exportPdf })
</script>