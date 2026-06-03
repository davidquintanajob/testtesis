const usuarioService = require('../services/usuarioService');
const { roles } = require('../models/usuario');
const ldapService = require('../services/ldapService');
const jwt = require('jsonwebtoken');

// Helper para validar rol
const validarRol = (rol) => {
  if (rol && !roles.includes(rol)) {
    throw new Error(`Rol inválido. Debe ser uno de: ${roles.join(', ')}`);
  }
};

const getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.getAllUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: error.message, 
      details: error.errors || error.toString() 
    });
  }
};

const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioService.getUsuarioById(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(usuario);
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: error.message, 
      details: error.errors || error.toString() 
    });
  }
};

const createUsuario = async (req, res) => {
  try {
    const { rol, id_usuario_LDAP, id_AreaResponsabilidad, activo, id_usuario_jefe } = req.body;
    const errors = [];

    // Validaciones
    if (!id_usuario_LDAP) errors.push('id_usuario_LDAP es obligatorio');
    if (!id_AreaResponsabilidad) errors.push('id_AreaResponsabilidad es obligatorio');
    if (!rol) {
      errors.push('rol es obligatorio');
    } else {
      try { validarRol(rol); } catch (e) { errors.push(e.message); }
    }
    if (activo !== undefined && typeof activo !== 'boolean') {
      errors.push('activo debe ser un valor booleano');
    }

    // Validar id_usuario_jefe si viene
    if (id_usuario_jefe !== undefined && id_usuario_jefe !== null) {
      if (!Number.isInteger(id_usuario_jefe) && !(/^[0-9]+$/.test(String(id_usuario_jefe)))) {
        errors.push('id_usuario_jefe debe ser un entero válido o null');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const nuevoUsuario = await usuarioService.createUsuario({
      rol,
      id_usuario_LDAP,
      id_AreaResponsabilidad,
      activo: activo !== undefined ? activo : true,
      id_usuario_jefe: id_usuario_jefe !== undefined ? id_usuario_jefe : null
    });
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: error.message, 
      details: error.errors || error.toString() 
    });
  }
};

const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const errors = [];

    // Verificar que al menos un campo sea enviado
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Debe enviar al menos un campo para actualizar' });
    }

    // Validar rol si viene
    if (updates.rol) {
      try { validarRol(updates.rol); } catch (e) { errors.push(e.message); }
    }
    // Validar tipo de activo si viene
    if (updates.activo !== undefined && typeof updates.activo !== 'boolean') {
      errors.push('activo debe ser booleano');
    }
    // Validar que id_usuario_LDAP e id_AreaResponsabilidad no sean vacíos si se envían
    if (updates.id_usuario_LDAP !== undefined && updates.id_usuario_LDAP.trim() === '') {
      errors.push('id_usuario_LDAP no puede estar vacío');
    }
    if (updates.id_AreaResponsabilidad !== undefined && updates.id_AreaResponsabilidad.trim() === '') {
      errors.push('id_AreaResponsabilidad no puede estar vacío');
    }

    // Validar id_usuario_jefe si viene
    if (updates.id_usuario_jefe !== undefined) {
      if (updates.id_usuario_jefe === null) {
        // permitido
      } else if (!Number.isInteger(updates.id_usuario_jefe) && !(/^[0-9]+$/.test(String(updates.id_usuario_jefe)))) {
        errors.push('id_usuario_jefe debe ser un entero válido o null');
      } else if (Number(updates.id_usuario_jefe) === Number(id)) {
        errors.push('id_usuario_jefe no puede ser igual al id del usuario');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const usuarioActualizado = await usuarioService.updateUsuario(id, updates);
    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(usuarioActualizado);
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: error.message, 
      details: error.errors || error.toString() 
    });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await usuarioService.deleteUsuario(id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: error.message, 
      details: error.errors || error.toString() 
    });
  }
};

const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;
    if (activo === undefined) {
      return res.status(400).json({ error: 'El campo "activo" es requerido' });
    }
    if (typeof activo !== 'boolean') {
      return res.status(400).json({ error: 'activo debe ser un valor booleano' });
    }
    const usuario = await usuarioService.cambiarEstado(id, activo);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json({ 
      mensaje: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente`,
      usuario 
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: error.message, 
      details: error.errors || error.toString() 
    });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Determinar si estamos en entorno de desarrollo
    const isDevelopment = process.env.ENVIRONMENT === "development";

    // 1. Autenticar contra LDAP solo si NO es development
    if (!isDevelopment) {
      await ldapService.authenticateUser(usuario, contrasena);
    } else {
      console.log(`🔧 Modo desarrollo: omitiendo verificación LDAP para usuario: ${usuario}`);
    }

    // 2. Buscar usuario local por id_usuario_LDAP (siempre se hace)
    const usuarioLocal = await usuarioService.getUsuarioByLDAP(usuario);
    if (!usuarioLocal) {
      return res.status(401).json({ error: 'Usuario no registrado en el sistema' });
    }

    // 3. Verificar si está activo
    if (!usuarioLocal.activo) {
      return res.status(403).json({ error: 'Usuario inactivo. Contacte al administrador.' });
    }

    // 4. Generar token JWT con datos del usuario local
    const tokenData = {
      id_usuario: usuarioLocal.id_usuario,
      id_usuario_LDAP: usuarioLocal.id_usuario_LDAP,
      rol: usuarioLocal.rol,
      id_AreaResponsabilidad: usuarioLocal.id_AreaResponsabilidad,
      id_usuario_jefe: usuarioLocal.id_usuario_jefe
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '8h' });

    // 5. Respuesta exitosa
    res.status(200).json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id_usuario: usuarioLocal.id_usuario,
        id_usuario_LDAP: usuarioLocal.id_usuario_LDAP,
        rol: usuarioLocal.rol,
        id_AreaResponsabilidad: usuarioLocal.id_AreaResponsabilidad,
        activo: usuarioLocal.activo
      }
    });
  } catch (error) {
    console.error('❌ Error en loginUsuario:', error);
    const status = error.status || 401;
    const message = error.message || 'Error en la autenticación';
    res.status(status).json({ error: message });
  }
};

const filtrarUsuarios = async (req, res) => {
  try {
    let page = parseInt(req.params.page);
    let limit = parseInt(req.params.limit);

    // Validaciones
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const filtros = req.body || {};

    const resultado = await usuarioService.filtrarUsuarios(filtros, page, limit);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en usuarioController.filtrarUsuarios:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error al filtrar usuarios',
      details: error.errors || error.toString()
    });
  }
};

module.exports = {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  cambiarEstado,
  loginUsuario,
  filtrarUsuarios
};