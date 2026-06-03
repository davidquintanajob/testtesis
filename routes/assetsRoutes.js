const express = require('express');
const router = express.Router();
const assetsController = require('../controllers/assetsController');
const authenticate = require('../helpers/authenticate');

/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: Consultas a tablas externas (Activo_Fijo y Areas_Responsabilidad)
 */

/**
 * @swagger
 * /aft/filtrar/{page}/{limit}:
 *   post:
 *     summary: Filtrar activos fijos con paginación (incluye datos del área relacionada)
 *     tags: [Assets]
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
 *               Id_ActivoFijo:
 *                 type: string
 *                 description: Código exacto del activo fijo (char 15)
 *               Desc_ActivoFijo:
 *                 type: string
 *                 description: Búsqueda parcial en la descripción (insensible a mayúsculas)
 *               ID_AreaResp:
 *                 type: string
 *                 description: Código exacto del área responsable (char 10)
 *               Activo:
 *                 type: boolean
 *                 description: Estado activo (true/false)
 *     responses:
 *       200:
 *         description: Lista paginada de activos fijos con datos del área
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 pagina:
 *                   type: integer
 *                 totalPaginas:
 *                   type: integer
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */
router.post('/aft/filtrar/:page/:limit', authenticate(), assetsController.filtrarActivosFijos);

/**
 * @swagger
 * /aft/{id}:
 *   get:
 *     summary: Obtener un activo fijo por su ID (Id_ActivoFijo)
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del activo fijo (columna Id_ActivoFijo)
 *     responses:
 *       200:
 *         description: Activo fijo encontrado (con datos del área)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Activo fijo no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */
router.get('/aft/:id', authenticate(), assetsController.getActivoFijoById);

/**
 * @swagger
 * /areas/filtrar/{page}/{limit}:
 *   post:
 *     summary: Filtrar áreas de responsabilidad con paginación
 *     tags: [Assets]
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
 *               Id_Ccosto:
 *                 type: string
 *                 description: Código de centro de costo (exacto)
 *               Id_AreaResponsabilidad:
 *                 type: string
 *                 description: Código de área (exacto)
 *               Desc_AreaResponsabilidad:
 *                 type: string
 *                 description: Búsqueda parcial en la descripción (insensible a mayúsculas)
 *     responses:
 *       200:
 *         description: Lista paginada de áreas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 pagina:
 *                   type: integer
 *                 totalPaginas:
 *                   type: integer
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */
router.post('/areas/filtrar/:page/:limit', authenticate(), assetsController.filtrarAreas);

/**
 * @swagger
 * /areas/{id}:
 *   get:
 *     summary: Obtener un área de responsabilidad por su ID (Id_AreaResponsabilidad)
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del área (columna Id_AreaResponsabilidad)
 *     responses:
 *       200:
 *         description: Área encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Área no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */
router.get('/areas/:id', authenticate(), assetsController.getAreaById);
// ==================== ÚTILES (Util_Tool) ====================

/**
 * @swagger
 * /utiles/filtrar/{page}/{limit}:
 *   post:
 *     summary: Filtrar útiles (Util_Tool) con paginación, incluyendo sus detalles
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: Número de página
 *       - in: path
 *         name: limit
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *         description: Cantidad de registros por página
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Id_UH: { type: string, description: "ID del útil (exacto)" }
 *               Desc_UH: { type: string, description: "Descripción (búsqueda parcial, insensible)" }
 *               Activo: { type: boolean, description: "Estado activo" }
 *               Id_Ccosto: { type: string, description: "ID del centro de costo (exacto, en detalles)" }
 *               Id_AreaResponsabilidad: { type: string, description: "ID del área (exacto, en detalles)" }
 *               Desc_Ccosto: { type: string, description: "Descripción del centro de costo (parcial, insensible)" }
 *               Desc_AreaResponsabilidad: { type: string, description: "Descripción del área (parcial, insensible)" }
 *               Desc_Empleado: { type: string, description: "Nombre del empleado (parcial, insensible)" }
 *               Cantidad_desde: { type: integer, description: "Cantidad mínima" }
 *               Cantidad_hasta: { type: integer, description: "Cantidad máxima" }
 *     responses:
 *       200:
 *         description: Lista paginada de útiles, cada uno con su array 'detalles'
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */
router.post('/utiles/filtrar/:page/:limit', authenticate(), assetsController.filtrarUtiles);

/**
 * @swagger
 * /utiles/{id}:
 *   get:
 *     summary: Obtener un útil por su ID (Id_UH) incluyendo todos sus detalles
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID del útil (columna Id_UH)
 *     responses:
 *       200:
 *         description: Útil encontrado con sus detalles
 *       404:
 *         description: Útil no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */
router.get('/utiles/:id', authenticate(), assetsController.getUtilById);

module.exports = router;