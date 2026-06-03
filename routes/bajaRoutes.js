const express = require('express');
const router = express.Router();
const bajaController = require('../controllers/bajaController');
const authenticate = require('../helpers/authenticate');

/**
 * @swagger
 * tags:
 *   name: Bajas
 *   description: Gestión de solicitudes de baja (herencia de Solicitud)
 */

/**
 * @swagger
 * /bajas:
 *   post:
 *     summary: Crear una nueva baja (con solicitud, usuarios, activos y mensajes automáticos)
 *     tags: [Bajas]
 *     description: |
 *       Al crear una baja:
 *       - Se valida que cada activo/útil exista en Assets y pertenezca al área de la baja.
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
 *               - baja
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
 *               baja:
 *                 type: object
 *                 properties:
 *                   id_AreaResponsabilidad: { type: string }
 *                   motivo: { type: string }
 *               usuarios_ids:
 *                 type: array
 *                 items: { type: integer }
 *               lista_activos:
 *                 type: array
 *                 items: { type: string }
 *               usuario_creador:
 *                 type: integer
 *                 description: ID del usuario que crea la solicitud (debe estar en usuarios_ids)
 *           example:
 *             solicitud:
 *               nota: "Baja por obsolescencia"
 *               tipo_movimiento: "Baja"
 *               fundamentacion: "Equipo fuera de servicio"
 *               tipo_traslado: "aft"
 *               estado: "Pendiente"
 *             baja:
 *               id_AreaResponsabilidad: "414810    "
 *               motivo: "Equipo obsoleto"
 *             usuarios_ids: [1, 2, 3]
 *             lista_activos: ["73547P         ", "OTROACTIVO01"]
 *             usuario_creador: 2
 *     responses:
 *       201:
 *         description: Baja creada exitosamente (con mensajes generados)
 *       400:
 *         description: Datos inválidos o validación fallida
 *       500:
 *         description: Error interno
 */
router.post('/bajas', authenticate(), bajaController.createBaja);

/**
 * @swagger
 * /bajas/{id}:
 *   put:
 *     summary: Actualizar una baja (solicitud, baja, usuarios y activos)
 *     tags: [Bajas]
 *     description: |
 *       Actualiza los datos de una baja existente.  
 *       Si se modifica la lista de usuarios, se notifica a los nuevos usuarios (el creador original sigue siendo el mismo).
 *       Se genera un mensaje de modificación para todos los usuarios involucrados (excepto el creador).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la solicitud/baja
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
 *               baja:
 *                 type: object
 *                 properties:
 *                   id_AreaResponsabilidad: { type: string }
 *                   motivo: { type: string }
 *               usuarios_ids:
 *                 type: array
 *                 items: { type: integer }
 *               lista_activos:
 *                 type: array
 *                 items: { type: string }
 *           example:
 *             solicitud:
 *               nota: "Baja por daño"
 *               tipo_movimiento: "Pérdida"
 *               fundamentacion: "Activo perdido durante inventario"
 *               estado: "En Proceso"
 *             baja:
 *               id_AreaResponsabilidad: "003801    "
 *               motivo: "Equipo dañado irreparable"
 *             usuarios_ids: [1, 4, 5]
 *             lista_activos: ["73547P         ", "OTROACTIVO03"]
 *     responses:
 *       200:
 *         description: Baja actualizada correctamente (y mensajes generados)
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error interno
 */
router.put('/bajas/:id', authenticate(), bajaController.updateBaja);

/**
 * @swagger
 * /bajas/{id}:
 *   get:
 *     summary: Obtener una baja por ID (con todos sus datos relacionados)
 *     tags: [Bajas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Datos de la baja (incluye usuarios, solicitud, detalles)
 *       404:
 *         description: No encontrado
 */
router.get('/bajas/:id', authenticate(), bajaController.getBajaById);

/**
 * @swagger
 * /bajas/{id}:
 *   delete:
 *     summary: Eliminar una baja (borra solicitud, baja, relaciones y detalles)
 *     tags: [Bajas]
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
router.delete('/bajas/:id', authenticate(), bajaController.deleteBaja);

/**
 * @swagger
 * /bajas/filtrar/{page}/{limit}:
 *   post:
 *     summary: Filtrar bajas con paginación (incluye datos relacionados y usuarios)
 *     tags: [Bajas]
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
 *               motivo: { type: string }
 *     responses:
 *       200:
 *         description: Lista paginada de bajas (con usuarios y detalles)
 *       500:
 *         description: Error interno
 */
router.post('/bajas/filtrar/:page/:limit', authenticate(), bajaController.filtrarBajas);

module.exports = router;