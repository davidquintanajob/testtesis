const express = require('express');
const router = express.Router();
const revisionController = require('../controllers/revisionController');
const authenticate = require('../helpers/authenticate');

/**
 * @swagger
 * tags:
 *   name: Revisiones
 *   description: Gestión de solicitudes de revisión (herencia de Solicitud)
 */

/**
 * @swagger
 * /revisiones:
 *   post:
 *     summary: Crear una nueva revisión (con solicitud, usuarios, activos y mensajes automáticos)
 *     tags: [Revisiones]
 *     description: |
 *       Al crear una revisión:
 *       - Se valida que cada activo/útil exista en Assets y pertenezca al área indicada.
 *       - Se genera automáticamente un **mensaje** para cada usuario de `usuarios_ids` (excepto el `usuario_creador`).
 *       - El mensaje se envía desde el `usuario_creador` hacia cada receptor.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - solicitud
 *               - revision
 *               - usuarios_ids
 *               - lista_activos
 *               - usuario_creador
 *             properties:
 *               solicitud:
 *                 type: object
 *                 properties:
 *                   nota: { type: string }
 *                   tipo_movimiento:
 *                     type: string
 *                     enum:
 *                       - Compra MB Nuevo
 *                       - Compra MB USO
 *                       - Traspaso Recibido
 *                       - Ajuste de inventario alta
 *                       - Ajuste de Inventario Alta
 *                       - Pérdida
 *                       - Traspaso Efectuado
 *                       - Préstamo temporal al trabajador
 *                       - Baja
 *                       - Traslado interno
 *                       - Ajuste de Inv
 *                       - Activo Ocioso
 *                       - Enviado a reparar
 *                       - Otro
 *                       - Préstamo fuera de la Entidad
 *                       - Venta
 *                       - Retiro
 *                   fundamentacion: { type: string }
 *                   tipo_traslado: { type: string, enum: ['aft', 'util'] }
 *                   estado: { type: string, enum: ['Pendiente','En Proceso','Aprobada','Rechazada','Cancelada','Completada'] }
 *               revision:
 *                 type: object
 *                 properties:
 *                   id_AreaResponsabilidad: { type: string }
 *               usuarios_ids:
 *                 type: array
 *                 items: { type: integer }
 *               lista_activos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_activoFijo_o_util: { type: string }
 *                     isRevisado: { type: boolean }
 *               usuario_creador:
 *                 type: integer
 *                 description: ID del usuario que crea la solicitud (debe estar en usuarios_ids)
 *           example:
 *             solicitud:
 *               nota: "Revisión técnica"
 *               tipo_movimiento: "Ajuste de Inv"
 *               fundamentacion: "Revisión de inventario"
 *               tipo_traslado: "aft"
 *               estado: "Pendiente"
 *             revision:
 *               id_AreaResponsabilidad: "414810    "
 *             usuarios_ids: [1, 2, 3]
 *             lista_activos:
 *               - id_activoFijo_o_util: "73547P         "
 *                 isRevisado: false
 *               - id_activoFijo_o_util: "OTROACTIVO01"
 *                 isRevisado: true
 *             usuario_creador: 1
 *     responses:
 *       201:
 *         description: Revisión creada exitosamente (con mensajes generados)
 *       400:
 *         description: Datos inválidos o validación fallida
 *       500:
 *         description: Error interno
 */
router.post('/revisiones', authenticate(), revisionController.createRevision);

/**
 * @swagger
 * /revisiones/{id}:
 *   put:
 *     summary: Actualizar una revisión (solicitud, revisión, usuarios y activos)
 *     tags: [Revisiones]
 *     description: |
 *       Actualiza los datos de una revisión existente.  
 *       Si se modifica la lista de usuarios, se notifica a los nuevos usuarios (el creador original sigue siendo el mismo).
 *       Se genera un mensaje de modificación para todos los usuarios involucrados (excepto el creador).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la solicitud/revisión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               solicitud:
 *                 type: object
 *                 properties:
 *                   nota: { type: string }
 *                   tipo_movimiento:
 *                     type: string
 *                     enum:
 *                       - Compra MB Nuevo
 *                       - Compra MB USO
 *                       - Traspaso Recibido
 *                       - Ajuste de inventario alta
 *                       - Ajuste de Inventario Alta
 *                       - Pérdida
 *                       - Traspaso Efectuado
 *                       - Préstamo temporal al trabajador
 *                       - Baja
 *                       - Traslado interno
 *                       - Ajuste de Inv
 *                       - Activo Ocioso
 *                       - Enviado a reparar
 *                       - Otro
 *                       - Préstamo fuera de la Entidad
 *                       - Venta
 *                       - Retiro
 *                   fundamentacion: { type: string }
 *                   tipo_traslado: { type: string, enum: ['aft', 'util'] }
 *                   estado: { type: string, enum: ['Pendiente','En Proceso','Aprobada','Rechazada','Cancelada','Completada'] }
 *               revision:
 *                 type: object
 *                 properties:
 *                   id_AreaResponsabilidad: { type: string }
 *               usuarios_ids:
 *                 type: array
 *                 items: { type: integer }
 *               lista_activos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_activoFijo_o_util: { type: string }
 *                     isRevisado: { type: boolean }
 *           example:
 *             solicitud:
 *               nota: "Actualización de revisión"
 *               tipo_movimiento: "Compra MB USO"
 *               fundamentacion: "Movimiento de inventario con compra"
 *               estado: "En Proceso"
 *             revision:
 *               id_AreaResponsabilidad: "003801    "
 *             usuarios_ids: [1, 4]
 *             lista_activos:
 *               - id_activoFijo_o_util: "73547P         "
 *                 isRevisado: true
 *               - id_activoFijo_o_util: "OTROACTIVO02"
 *                 isRevisado: false
 *     responses:
 *       200:
 *         description: Revisión actualizada correctamente (y mensajes generados)
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error interno
 */
router.put('/revisiones/:id', authenticate(), revisionController.updateRevision);

/**
 * @swagger
 * /revisiones/{id}:
 *   get:
 *     summary: Obtener una revisión por ID (con todos sus datos relacionados)
 *     tags: [Revisiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Datos de la revisión (incluye usuarios, solicitud, detalles)
 *       404:
 *         description: No encontrado
 */
router.get('/revisiones/:id', authenticate(), revisionController.getRevisionById);

/**
 * @swagger
 * /revisiones/{id}:
 *   delete:
 *     summary: Eliminar una revisión (borra solicitud, revisión, relaciones y detalles)
 *     tags: [Revisiones]
 *     description: |
 *       Solo permite eliminar si el estado NO es "Completada".  
 *       Se genera un mensaje de eliminación para todos los usuarios asociados (excepto el creador original).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Eliminado correctamente
 *       400:
 *         description: No se puede eliminar porque la solicitud está completada
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error interno
 */
router.delete('/revisiones/:id', authenticate(), revisionController.deleteRevision);

/**
 * @swagger
 * /revisiones/filtrar/{page}/{limit}:
 *   post:
 *     summary: Filtrar revisiones con paginación (incluye datos relacionados y usuarios)
 *     tags: [Revisiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *       - in: path
 *         name: limit
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nota: { type: string }
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
 *               fundamentacion: { type: string }
 *               estado: { type: string, enum: ['Pendiente','En Proceso','Aprobada','Rechazada','Cancelada','Completada'] }
 *               tipo_traslado: { type: string, enum: ['aft','util'] }
 *               fecha_hora_creacion_desde: { type: string, format: date-time }
 *               fecha_hora_creacion_hasta: { type: string, format: date-time }
 *               fecha_hora_cierreSolicitud_desde: { type: string, format: date-time }
 *               fecha_hora_cierreSolicitud_hasta: { type: string, format: date-time }
 *               id_AreaResponsabilidad: { type: string }
 *     responses:
 *       200:
 *         description: Lista paginada de revisiones (con usuarios y detalles)
 *       500:
 *         description: Error interno
 */
router.post('/revisiones/filtrar/:page/:limit', authenticate(), revisionController.filtrarRevisiones);

module.exports = router;