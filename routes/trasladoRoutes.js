const express = require('express');
const router = express.Router();
const trasladoController = require('../controllers/trasladoController');
const authenticate = require('../helpers/authenticate');

/**
 * @swagger
 * tags:
 *   name: Traslados
 *   description: Gestión de solicitudes de traslado (herencia de Solicitud)
 */

/**
 * @swagger
 * /traslados:
 *   post:
 *     summary: Crear un nuevo traslado (con solicitud, usuarios, activos y mensajes automáticos)
 *     tags: [Traslados]
 *     description: |
 *       Al crear un traslado:
 *       - Se valida que cada activo/útil exista en Assets y pertenezca al área de origen.
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
 *               - traslado
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
 *               traslado:
 *                 type: object
 *                 properties:
 *                   id_AreaResponsabilidad_origen: { type: string }
 *                   id_AreaResponsabilidad_destino: { type: string }
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
 *               nota: "Traslado urgente"
 *               tipo_movimiento: "Traspaso Recibido"
 *               fundamentacion: "Traslado autorizado por inventario"
 *               tipo_traslado: "aft"
 *               estado: "Pendiente"
 *             traslado:
 *               id_AreaResponsabilidad_origen: "414810    "
 *               id_AreaResponsabilidad_destino: "003801    "
 *             usuarios_ids: [1, 2, 3]
 *             lista_activos: ["73547P         ", "OTROACTIVO01"]
 *             usuario_creador: 1
 *     responses:
 *       201:
 *         description: Traslado creado exitosamente (con mensajes generados)
 *       400:
 *         description: Datos inválidos o validación fallida
 *       500:
 *         description: Error interno
 */
router.post('/traslados', authenticate(), trasladoController.createTraslado);

/**
 * @swagger
 * /traslados/{id}:
 *   put:
 *     summary: Actualizar un traslado (solicitud, traslado, usuarios y activos)
 *     tags: [Traslados]
 *     description: |
 *       Actualiza los datos de un traslado existente.  
 *       Si se modifica la lista de usuarios, se notifica a los nuevos usuarios (el creador original sigue siendo el mismo).
 *       Se genera un mensaje de modificación para todos los usuarios involucrados (excepto el creador).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la solicitud/traslado
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
 *               traslado:
 *                 type: object
 *                 properties:
 *                   id_AreaResponsabilidad_origen: { type: string }
 *                   id_AreaResponsabilidad_destino: { type: string }
 *               usuarios_ids:
 *                 type: array
 *                 items: { type: integer }
 *               lista_activos:
 *                 type: array
 *                 items: { type: string }
 *           example:
 *             solicitud:
 *               nota: "Nota actualizada"
 *               tipo_movimiento: "Venta"
 *               fundamentacion: "Cambio de estado por venta organizada"
 *               tipo_traslado: "util"
 *               estado: "En Proceso"
 *             traslado:
 *               id_AreaResponsabilidad_origen: "414810    "
 *               id_AreaResponsabilidad_destino: "003801    "
 *             usuarios_ids: [1, 3, 5]
 *             lista_activos: ["73547P         ", "OTROACTIVO02"]
 *     responses:
 *       200:
 *         description: Traslado actualizado correctamente (y mensajes generados)
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error interno
 */
router.put('/traslados/:id', authenticate(), trasladoController.updateTraslado);

/**
 * @swagger
 * /traslados/{id}:
 *   get:
 *     summary: Obtener un traslado por ID (con todos sus datos relacionados)
 *     tags: [Traslados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Datos del traslado (incluye usuarios, solicitud, detalles)
 *       404:
 *         description: No encontrado
 */
router.get('/traslados/:id', authenticate(), trasladoController.getTrasladoById);

/**
 * @swagger
 * /traslados/{id}:
 *   delete:
 *     summary: Eliminar un traslado (borra solicitud, traslado, relaciones y detalles)
 *     tags: [Traslados]
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
router.delete('/traslados/:id', authenticate(), trasladoController.deleteTraslado);

/**
 * @swagger
 * /traslados/filtrar/{page}/{limit}:
 *   post:
 *     summary: Filtrar traslados con paginación (incluye datos relacionados y usuarios)
 *     tags: [Traslados]
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
 *               id_AreaResponsabilidad_origen: { type: string }
 *               id_AreaResponsabilidad_destino: { type: string }
 *     responses:
 *       200:
 *         description: Lista paginada de traslados (con usuarios y detalles)
 *       500:
 *         description: Error interno
 */
router.post('/traslados/filtrar/:page/:limit', authenticate(), trasladoController.filtrarTraslados);

module.exports = router;