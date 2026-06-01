<template>
	<div v-if="modelValue" class="fixed inset-0 z-[12000] flex items-center justify-center">
		<div class="absolute inset-0 bg-black/50" @click="close"></div>
		<div class="bg-white rounded-md shadow-lg max-w-[90%] w-[400px] mx-auto z-10 p-4">
			<div class="flex justify-between items-center mb-3">
				<h3 class="text-lg font-semibold">Comprobante</h3>
				<button class="text-sm text-gray-600" @click="close">Cerrar ✕</button>
			</div>

			<div class="overflow-auto max-h-[60vh] p-2">
				<div ref="receiptEl" class="receipt-preview mx-auto">
					<!-- Encabezado del comprobante -->
					<div class="receipt-header text-center mb-3">
						<!-- Nombre del local - Más grande -->
						<div class="text-xl font-bold mb-1">ALMACEN 5TA KILO 12</div>
						<!-- Comprobante de Venta - Reducido -->
						<div class="text-base font-semibold text-gray-700">Comprobante de Venta</div>
						<!-- Fecha -->
						<div class="text-sm text-gray-600 mt-1">{{ formattedDate }}</div>
						<!-- Dirección -->
						<div class="text-xs text-gray-500 mt-1">Dirección: Calle 5ta, #24</div>
						<!-- Dependiente -->
						<div class="text-xs font-semibold mt-1 uppercase">Dependiente: {{ dependienteNombre }}</div>
						<!-- Folio -->
						<div v-if="data?.codigo || data?.folio" class="text-xs font-semibold mt-1">
							Folio: {{ data.codigo || data.folio || 'N/A' }}
						</div>
					</div>

					<!-- Tabla de productos -->
					<div class="receipt-body">
						<table class="w-full text-sm border-collapse">
							<thead>
								<tr class="border-b border-gray-300 border-dashed">
									<th class="text-left py-2 px-0 font-semibold w-[45%]">Producto</th>
									<th class="text-center py-2 px-0 font-semibold w-[20%]">Cant.</th>
									<th class="text-right py-2 px-0 font-semibold w-[35%]">Total</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(it, idx) in processedItems" :key="idx" 
									class="border-b border-gray-100 border-dashed">
									<td class="py-2 px-0">
										<div>{{ it.nombre }}</div>
									</td>
									<td class="py-2 px-0 text-center">
										{{ formatQty(it.cantidad) }}
									</td>
									<td class="py-2 px-0 text-right">
										{{ formatMoney(it.cantidad * it.precio) }}
									</td>
								</tr>
							</tbody>
							<tfoot>
								<tr class="border-t border-gray-300 border-dashed">
									<td class="py-3 px-0 text-left font-bold">TOTAL</td>
									<td class="py-3 px-0 text-center font-bold">{{ formatQty(totalQuantity) }}</td>
									<td class="py-3 px-0 text-right font-bold">{{ formatMoney(total) }}</td>
								</tr>
							</tfoot>
						</table>

						<!-- Información adicional -->
						<div v-if="data?.cliente || data?.metodo_pago" class="mt-4 pt-3 border-t border-gray-300 border-dashed text-xs">
							<div v-if="data.cliente" class="mb-1">
								<span class="font-semibold">Cliente:</span> {{ data.cliente }}
							</div>
							<div v-if="data.metodo_pago" class="mb-1">
								<span class="font-semibold">Método de pago:</span> {{ data.metodo_pago }}
							</div>
						</div>

						<!-- Canal de WhatsApp -->
						<div class="mt-4 pt-3 border-t border-gray-300 border-dashed text-center">
							<div class="text-xs font-semibold mb-2">Síguenos en WhatsApp</div>
							<img src="/whasapChanel.png" alt="Código QR WhatsApp" class="w-24 h-24 mx-auto mb-2 qr-code-print">
							<div class="text-xs text-gray-600">Escanea para unirte a nuestro<br/>canal de WhatsApp</div>
						</div>

						<!-- Mensaje de agradecimiento -->
						<div class="mt-4 pt-3 border-t border-gray-300 border-dashed text-center text-xs">
							<div class="font-semibold mb-1">¡Gracias por su compra!</div>
							<div class="text-gray-500">Vuelva pronto</div>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-4 flex gap-2 justify-end">
				<button @click="printReceipt" class="px-3 py-1 bg-accent text-white rounded-md text-sm">Imprimir</button>
				<button @click="downloadPdf" class="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Descargar</button>
				<button @click="sharePdf" class="px-3 py-1 bg-green-600 text-white rounded-md text-sm">Compartir</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';

const props = defineProps({
	modelValue: { type: Boolean, default: false },
	data: { type: [Object, Array, null], default: null }
});
const emit = defineEmits(['update:modelValue']);

const receiptEl = ref(null);
const dependienteNombre = ref('');

// Obtener nombre del dependiente del localStorage
onMounted(() => {
	try {
		const usuarioStr = localStorage.getItem('usuario');
		if (usuarioStr) {
			const usuario = JSON.parse(usuarioStr);
			dependienteNombre.value = usuario.nombre ? usuario.nombre.toUpperCase() : '';
		}
	} catch (error) {
		console.error('Error al obtener usuario del localStorage:', error);
		dependienteNombre.value = '';
	}
});

const close = () => emit('update:modelValue', false);

const items = computed(() => {
	const d = props.data;
	if (!d) return [];
	if (Array.isArray(d)) return d;
	const candidates = ['items','lista','detalles','listaVenta','ventas','lista_venta','listaVentaDetalle','detalle','productos'];
	for (const key of candidates) {
		if (d[key] && Array.isArray(d[key])) return d[key];
	}
	if (d.nombre || d.nombre_producto || d.productoNombre) return [d];
	return [];
});

// Normalizar cada item
const processedItems = computed(() => {
	function parseProduct(prod) {
		if (!prod) return null;
		if (typeof prod === 'string') {
			try { return JSON.parse(prod); } catch (e) { return null; }
		}
		if (typeof prod === 'object') return prod;
		return null;
	}

	function productNameFrom(prod) {
		if (!prod) return null;
		return prod.nombre || prod.name || prod.nombre_producto || prod.productoNombre || prod.descripcion || prod.codigo || null;
	}

	return items.value.map(it => {
		const prodRaw = it.producto ?? it.producto_detalle ?? it.producto_obj ?? null;
		const prod = parseProduct(prodRaw) || null;
		const nombreFromTop = it.nombre || it.nombre_producto || it.productoNombre || (typeof it.producto === 'string' ? it.producto : null) || null;
		const nombre = productNameFrom(prod) || (typeof nombreFromTop === 'string' ? nombreFromTop : null) || '-';

		const cantidad = Number(it.cantidad ?? it.qty ?? it.cant ?? it.quantity ?? it.unidades ?? 0);

		const precio = Number(
			it.precio ?? it.precio_cobrado ?? it.precio_unitario ?? it.price ?? (prod && (prod.precio ?? prod.price)) ?? 0
		);

		return { original: it, nombre, cantidad, precio };
	});
});

const total = computed(() => {
	return processedItems.value.reduce((s, it) => {
		return s + (Number(it.cantidad || 0) * Number(it.precio || 0));
	}, 0);
});

const totalQuantity = computed(() => {
	return processedItems.value.reduce((s, it) => {
		return s + Number(it.cantidad || 0);
	}, 0);
});

const formattedDate = computed(() => {
	try {
		const d = props.data && (props.data.fecha || props.data.created_at || props.data.createdAt || props.data.date);
		const date = d ? new Date(d) : new Date();
		return date.toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	} catch (e) { return '' }
});

function formatNumberWithSpaces(numStr) {
	// Divide el número en parte entera y decimal
	const parts = numStr.split('.');
	const integerPart = parts[0];
	const decimalPart = parts[1] || '';
	
	// Agrega espacios cada 3 dígitos en la parte entera
	const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	
	// Recombina con la parte decimal
	return decimalPart ? `${formatted}.${decimalPart}` : formatted;
}

function formatMoney(v) {
	const n = Number(v || 0);
	const formatted = n.toFixed(2);
	const withSpaces = formatNumberWithSpaces(formatted);
	return `$${withSpaces}`;
}

function formatQty(v) {
	const n = Number(v || 0);
	const formatted = Number.isInteger(n) ? n.toString() : n.toFixed(2);
	return formatNumberWithSpaces(formatted);
}

let html2pdfLoadPromise = null;
function loadHtml2pdf() {
	if (window.html2pdf) return Promise.resolve();
	if (html2pdfLoadPromise) return html2pdfLoadPromise;
	html2pdfLoadPromise = new Promise((res, rej) => {
		const s = document.createElement('script');
		s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js';
		s.onload = () => res();
		s.onerror = () => rej(new Error('No se pudo cargar html2pdf'));
		document.head.appendChild(s);
	});
	return html2pdfLoadPromise;
}

async function generatePdfBlob() {
	if (!receiptEl.value) throw new Error('Receipt element not found');
	await loadHtml2pdf();
	const opt = {
		margin: [2, 2, 2, 2], // Margen reducido
		filename: `comprobante_${new Date().getTime()}.pdf`,
		image: { type: 'jpeg', quality: 0.98 },
		html2canvas: { 
			scale: 2, 
			useCORS: true,
			letterRendering: true
		},
		jsPDF: { 
			unit: 'mm', 
			format: [72, 150], // Ancho reducido (72mm en lugar de 80mm)
			orientation: 'portrait' 
		}
	};
	return new Promise((resolve, reject) => {
		try {
			window.html2pdf().set(opt).from(receiptEl.value).outputPdf('blob').then((blob) => resolve(blob)).catch(reject);
		} catch (err) { reject(err); }
	});
}

function printReceipt() {
	if (!receiptEl.value) return;
	const node = receiptEl.value.cloneNode(true);
	// Create hidden iframe to avoid popup blockers
	const iframe = document.createElement('iframe');
	iframe.style.position = 'fixed';
	iframe.style.right = '0';
	iframe.style.bottom = '0';
	iframe.style.width = '0';
	iframe.style.height = '0';
	iframe.style.border = '0';
	document.body.appendChild(iframe);
	const doc = iframe.contentWindow.document;
	const style = `
		<style>
			@page { 
				size: 72mm auto; /* Ancho reducido */
				margin: 2mm; /* Margen reducido */
			}
			body { 
				font-family: 'Arial', sans-serif; 
				padding: 0; 
				margin: 0; 
				font-size: 12px;
				line-height: 1.3;
				width: 72mm; /* Ancho reducido */
			}
			.receipt-preview { 
				width: 72mm; /* Ancho reducido */
				max-width: 72mm;
				padding: 6px;
				box-sizing: border-box;
			}
			.receipt-header { 
				text-align: center; 
				margin-bottom: 8px;
			}
			.receipt-header div:first-child {
				font-size: 16px;
				font-weight: bold;
				margin-bottom: 2px;
			}
			.receipt-header div:nth-child(2) {
				font-size: 13px;
				font-weight: normal;
			}
			table {
				width: 100%;
				border-collapse: collapse;
				margin-bottom: 6px;
			}
			th {
				border-bottom: 1px dashed #666;
				padding: 4px 0;
				text-align: left;
				font-weight: bold;
				font-size: 11px;
			}
			td {
				padding: 3px 0;
				vertical-align: top;
				font-size: 11px;
			}
			tbody tr {
				border-bottom: 1px dashed #ddd;
			}
			tfoot tr {
				border-top: 1px dashed #666;
			}
			tfoot td {
				padding-top: 5px;
				padding-bottom: 5px;
				font-weight: bold;
			}
			.additional-info, .footer {
				border-top: 1px dashed #666;
				padding-top: 5px;
				margin-top: 5px;
				font-size: 10px;
			}
			img.qr-code-print {
				max-width: 22.5mm;
				height: auto;
				display: block;
				margin: 6px auto;
			}
			.receipt-body > div {
				text-align: center !important;
			}
			@media print {
				body { 
					background: white;
					color: black;
				}
			}
		</style>`;
	doc.open();
	doc.write(`<html><head><title>Comprobante de Venta</title>${style}</head><body></body></html>`);
	doc.body.appendChild(node);
	doc.close();
	
	// Wait a tick for layout, then print
	try {
		iframe.contentWindow.focus();
		setTimeout(() => {
			try { 
				iframe.contentWindow.print(); 
			} catch (e) { 
				console.error('Error al imprimir:', e);
				// Fallback: abrir ventana de impresión manualmente
				const printContent = doc.documentElement.outerHTML;
				const printWindow = window.open('', '_blank');
				printWindow.document.write(printContent);
				printWindow.document.close();
				printWindow.focus();
				setTimeout(() => {
					printWindow.print();
					printWindow.close();
				}, 250);
			}
			// remove iframe after a while
			setTimeout(() => { 
				try { document.body.removeChild(iframe); } catch (e) {} 
			}, 1000);
		}, 200);
	} catch (e) {
		console.error('Impresión fallida:', e);
		try { document.body.removeChild(iframe); } catch (er) {}
		alert('No se pudo iniciar la impresión. Intente descargar el PDF.');
	}
}

async function downloadPdf() {
	try {
		const blob = await generatePdfBlob();
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const timestamp = new Date().toISOString().slice(0,19).replace(/:/g,'-');
		a.download = `comprobante_${timestamp}.pdf`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	} catch (err) {
		console.error(err);
		alert('Error generando PDF.');
	}
}

async function sharePdf() {
	try {
		const blob = await generatePdfBlob();
		const file = new File([blob], 'comprobante.pdf', { type: 'application/pdf' });
		if (navigator.canShare && navigator.canShare({ files: [file] })) {
			await navigator.share({ files: [file], title: 'Comprobante', text: 'Comprobante de venta' });
		} else {
			const ok = confirm('Tu navegador no soporta compartir archivos. ¿Deseas descargar el PDF en su lugar?');
			if (ok) await downloadPdf();
		}
	} catch (err) {
		console.error(err);
		alert('No se pudo compartir el PDF.');
	}
}
</script>

<style scoped>
.receipt-preview { 
	width: 72mm; /* Ancho reducido */
	max-width: 72mm;
	padding: 8px 4px; /* Padding reducido horizontalmente */
	box-sizing: border-box; 
	background: white; 
	color: black;
	font-family: 'Arial', sans-serif;
	line-height: 1.3;
}
.receipt-header { 
	text-align: center; 
	margin-bottom: 10px;
}
.receipt-header div:first-child {
	font-size: 18px;
	font-weight: bold;
	margin-bottom: 3px;
}
.receipt-header div:nth-child(2) {
	font-size: 14px;
	font-weight: normal;
	color: #333;
}
.receipt-body {
	margin-top: 8px;
}
.receipt-body table {
	font-size: 12px;
}
.receipt-body th {
	font-weight: bold;
}
.receipt-body td {
	font-weight: normal;
}
.receipt-body tfoot td {
	font-weight: bold;
}

.qr-code-print {
	display: block;
	max-width: 22.5mm;
	width: 100%;
	height: auto;
	margin: 0 auto;
}

/* Estilos específicos para impresión */
@media print {
	html, body { 
		background: white !important; 
		margin: 0 !important;
		padding: 0 !important;
		width: 72mm !important;
	}
	.receipt-preview { 
		width: 72mm !important; 
		max-width: 72mm !important;
		padding: 6px 3px !important; /* Padding horizontal reducido */
		margin: 0 !important;
		box-shadow: none !important;
		border: none !important;
	}
	.receipt-header div:first-child {
		font-size: 16px !important;
	}
	.receipt-header div:nth-child(2) {
		font-size: 13px !important;
	}
	table {
		font-size: 11px !important;
	}
	th, td {
		padding: 4px 0 !important; /* Padding horizontal eliminado */
	}
	tfoot td {
		font-size: 12px !important;
	}
	.receipt-body > div {
		text-align: center !important;
	}
	.qr-code-print {
		max-width: 21mm !important;
		width: 100% !important;
		height: auto !important;
		margin: 6px auto !important;
	}
	@page { 
		size: 72mm auto; /* Ancho reducido */
		margin: 2mm !important; /* Margen reducido */
	}
}
</style>