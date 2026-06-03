const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');
const authenticate = require('../helpers/authenticate');

/**
 * @swagger
 * tags:
 *   name: Solicitudes
 *   description: Gestión de solicitudes de traslado/baja/revisión
 */

/**
 * @swagger
 * /solicitudes/filtrar/{page}/{limit}:
 *   post:
 *     summary: Filtrar solicitudes con paginación (page y limit en URL)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Cantidad de registros por página
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nota:
 *                 type: string
 *               tipo_movimiento:
 *                 type: string
 *                 enum:
 *                   - Compra MB Nuevo
 *                   - Compra MB USO
 *                   - Traspaso Recibido
 *                   - Ajuste de inventario alta
 *                   - Ajuste de Inventario Alta
 *                   - Pérdida
 *                   - Traspaso Efectuado
 *                   - Préstamo temporal al trabajador
 *                   - Baja
 *                   - Traslado interno
 *                   - Ajuste de Inv
 *                   - Activo Ocioso
 *                   - Enviado a reparar
 *                   - Otro
 *                   - Préstamo fuera de la Entidad
 *                   - Venta
 *                   - Retiro
 *               fundamentacion:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [Pendiente, En Proceso, Aprobada, Rechazada, Cancelada, Completada]
 *               tipo_traslado:
 *                 type: string
 *                 enum: [aft, util]
 *               fecha_hora_creacion_desde:
 *                 type: string
 *                 format: date-time
 *               fecha_hora_creacion_hasta:
 *                 type: string
 *                 format: date-time
 *               fecha_hora_cierreSolicitud_desde:
 *                 type: string
 *                 format: date-time
 *               fecha_hora_cierreSolicitud_hasta:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Lista paginada de solicitudes
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno
 */
router.post('/solicitudes/filtrar/:page/:limit', authenticate(), solicitudController.filtrarSolicitudes);

module.exports = router;