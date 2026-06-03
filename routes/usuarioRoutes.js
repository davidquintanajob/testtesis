const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authenticate = require('../helpers/authenticate');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: API para gestionar usuarios del sistema (autenticación por LDAP)
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Error interno del servidor
 */
router.get('/usuarios', usuarioController.getAllUsuarios);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno
 */
router.get('/usuarios/:id', usuarioController.getUsuarioById);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rol
 *               - id_usuario_LDAP
 *               - id_AreaResponsabilidad
 *             properties:
 *               rol:
 *                 type: string
 *                 enum: [Jefe de Área, Responsable de Área, Administrador, Estilista]
 *                 description: Rol del usuario
 *               id_usuario_LDAP:
 *                 type: string
 *                 description: Identificador LDAP del usuario
 *               id_AreaResponsabilidad:
 *                 type: string
 *                 description: Área de responsabilidad
 *               id_usuario_jefe:
 *                 type: integer
 *                 nullable: true
 *                 description: ID del usuario jefe (nullable)
 *               activo:
 *                 type: boolean
 *                 default: true
 *                 description: Estado activo/inactivo
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos (rol incorrecto, campos faltantes)
 *       500:
 *         description: Error interno
 */
router.post('/usuarios',authenticate(), usuarioController.createUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario (actualización parcial permitida)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rol:
 *                 type: string
 *                 enum: [Jefe de Área, Responsable de Área, Administrador, Estilista]
 *               id_usuario_LDAP:
 *                 type: string
 *               id_AreaResponsabilidad:
 *                 type: string
 *               id_usuario_jefe:
 *                 type: integer
 *                 nullable: true
 *                 description: ID del usuario jefe (nullable)
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno
 */
router.put('/usuarios/:id',authenticate(), usuarioController.updateUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario (borrado físico)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno
 */
router.delete('/usuarios/:id',authenticate(), usuarioController.deleteUsuario);

/**
 * @swagger
 * /usuarios/{id}/estado:
 *   patch:
 *     summary: Cambiar el estado activo/inactivo de un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activo
 *             properties:
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Campo activo requerido
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno
 */
router.patch('/usuarios/:id/estado',authenticate(), usuarioController.cambiarEstado);

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Iniciar sesión con credenciales LDAP y validar registro local
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - contrasena
 *             properties:
 *               usuario:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve token y datos del usuario
 *       400:
 *         description: Faltan usuario o contraseña
 *       401:
 *         description: Credenciales LDAP incorrectas o usuario no registrado en el sistema
 *       403:
 *         description: Usuario inactivo
 *       500:
 *         description: Error interno
 */
router.post('/usuarios/login', usuarioController.loginUsuario);

/**
 * @swagger
 * /usuarios/filtrar/{page}/{limit}:
 *   post:
 *     summary: Filtrar usuarios con paginación
 *     tags: [Usuarios]
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
 *         description: Cantidad de registros por página
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rol:
 *                 type: string
 *                 enum: [Jefe de Área, Responsable de Área, Administrador, Especialista]
 *               id_usuario_LDAP:
 *                 type: string
 *                 description: Búsqueda parcial (insensible a mayúsculas)
 *               id_AreaResponsabilidad:
 *                 type: string
 *                 description: Búsqueda parcial (insensible a mayúsculas)
 *               activo:
 *                 type: boolean
 *               createdAt_desde:
 *                 type: string
 *                 format: date-time
 *               createdAt_hasta:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios
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
 *                     $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Parámetros inválidos (rol, fechas, etc.)
 *       500:
 *         description: Error interno del servidor
 */
router.post('/usuarios/filtrar/:page/:limit', usuarioController.filtrarUsuarios);

module.exports = router;