const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');
const authenticate = require('../helpers/authenticate');

/**
 * @swagger
 * tags:
 *   name: Mensajes
 *   description: API para gestionar mensajes y sus documentos adjuntos (base64)
 */

/**
 * @swagger
 * /mensajes:
 *   get:
 *     summary: Obtener mensajes con filtros opcionales (sin paginación)
 *     tags: [Mensajes]
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema: { type: string, enum: [Traslado, Baja, Revisión, Mensaje] }
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [enviado, recibido, visto] }
 *       - in: query
 *         name: id_solicitud
 *         schema: { type: integer }
 *       - in: query
 *         name: id_usuario
 *         schema: { type: integer }
 *       - in: query
 *         name: id_usuario_receptor
 *         schema: { type: integer }
 *       - in: query
 *         name: fecha_desde
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: fecha_hasta
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Lista de mensajes con documentos, remitente, destinatario y solicitud
 */
router.get('/mensajes', authenticate(), mensajeController.getMensajes);

/**
 * @swagger
 * /mensajes/usuario/{idUsuario}:
 *   get:
 *     summary: Obtener todos los mensajes enviados por un usuario específico (remitente)
 *     tags: [Mensajes]
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de mensajes del usuario
 */
router.get('/mensajes/usuario/:idUsuario', authenticate(), mensajeController.getMensajesByUsuario);

/**
 * @swagger
 * /mensajes/usuario/{idUsuario}/visto:
 *   put:
 *     summary: Marcar todos los mensajes recibidos por un usuario como vistos
 *     tags: [Mensajes]
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Número de mensajes actualizados a estado visto
 */
router.put('/mensajes/usuario/:idUsuario/visto', authenticate(), mensajeController.marcarMensajesComoVistos);

/**
 * @swagger
 * /mensajes/{id}:
 *   get:
 *     summary: Obtener un mensaje por su ID
 *     tags: [Mensajes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Mensaje encontrado con todos sus datos relacionados
 *       404:
 *         description: Mensaje no existe
 */
router.get('/mensajes/:id', authenticate(), mensajeController.getMensajeById);

/**
 * @swagger
 * /mensajes:
 *   post:
 *     summary: Crear un nuevo mensaje (puede incluir documentos en base64)
 *     tags: [Mensajes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - estado
 *               - id_usuario
 *               - id_usuario_receptor
 *               - id_solicitud
 *             properties:
 *               fecha_hora:
 *                 type: string
 *                 format: date-time
 *               tipo:
 *                 type: string
 *                 enum: [Traslado, Baja, Revisión, Mensaje]
 *               descripcion:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [enviado, recibido, visto]
 *               id_usuario:
 *                 type: integer
 *               id_usuario_receptor:
 *                 type: integer
 *               id_solicitud:
 *                 type: integer
 *               documentos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     contenido:
 *                       type: string
 *                       description: Archivo en base64 (puede incluir prefijo data:...)
 *                     nombre:
 *                       type: string
 *     responses:
 *       201:
 *         description: Mensaje creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/mensajes', authenticate(), mensajeController.createMensaje);

/**
 * @swagger
 * /mensajes/{id}:
 *   put:
 *     summary: Actualizar un mensaje (y opcionalmente reemplazar sus documentos)
 *     tags: [Mensajes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [Traslado, Baja, Revisión, Mensaje]
 *               descripcion:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [enviado, recibido, visto]
 *               fecha_hora:
 *                 type: string
 *                 format: date-time
 *               id_usuario_receptor:
 *                 type: integer
 *               documentos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     contenido:
 *                       type: string
 *                     nombre:
 *                       type: string
 *     responses:
 *       200:
 *         description: Mensaje actualizado
 *       404:
 *         description: Mensaje no encontrado
 */
router.put('/mensajes/:id', authenticate(), mensajeController.updateMensaje);

/**
 * @swagger
 * /mensajes/{id}:
 *   delete:
 *     summary: Eliminar un mensaje (borrado físico junto con documentos y archivos)
 *     tags: [Mensajes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Mensaje eliminado
 *       404:
 *         description: Mensaje no encontrado
 */
router.delete('/mensajes/:id', authenticate(), mensajeController.deleteMensaje);

/**
 * @swagger
 * /mensajes/filtrar/{page}/{limit}:
 *   post:
 *     summary: Filtrar mensajes con paginación (similar a traslados)
 *     tags: [Mensajes]
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *       - in: path
 *         name: limit
 *         required: true
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [Traslado, Baja, Revisión, Mensaje]
 *               estado:
 *                 type: string
 *                 enum: [enviado, recibido, visto]
 *               id_solicitud:
 *                 type: integer
 *               id_usuario:
 *                 type: integer
 *               id_usuario_receptor:
 *                 type: integer
 *               fecha_desde:
 *                 type: string
 *                 format: date-time
 *               fecha_hasta:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Lista paginada de mensajes con asociaciones
 *       500:
 *         description: Error interno
 */
router.post('/mensajes/filtrar/:page/:limit', authenticate(), mensajeController.filtrarMensajes);

module.exports = router;