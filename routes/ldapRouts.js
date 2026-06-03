const express = require('express');
const router = express.Router();
const authController = require('../controllers/ldapController');

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Login mediante LDAP
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesión con usuario y contraseña (LDAP)
 *     tags: [Autenticación]
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
 *         description: Login exitoso
 *       400:
 *         description: Faltan datos
 *       401:
 *         description: Credenciales incorrectas
 *       403:
 *         description: Usuario no registrado o inactivo
 */
router.post('/login', authController.login);

module.exports = router;