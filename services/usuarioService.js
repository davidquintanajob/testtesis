const { Usuario, roles } = require('../models/usuario');
const { Op } = require('sequelize');

// Incluye siempre la relación 'jefe' para obtener los datos del superior
const includeJefe = () => [{ model: Usuario, as: 'jefe' }];

// Obtener todos los usuarios (con su jefe)
const getAllUsuarios = async () => {
  try {
    const usuarios = await Usuario.findAll({
      include: includeJefe(),
      order: [['id_usuario', 'ASC']]
    });
    return usuarios;
  } catch (error) {
    console.error('Error en usuarioService.getAllUsuarios:', error);
    const err = new Error(error.message || 'Error al obtener usuarios');
    err.status = error.status || 500;
    throw err;
  }
};

// Obtener usuario por ID (con su jefe)
const getUsuarioById = async (id) => {
  try {
    const usuario = await Usuario.findByPk(id, {
      include: includeJefe()
    });
    return usuario;
  } catch (error) {
    console.error('Error en usuarioService.getUsuarioById:', error);
    const err = new Error(error.message || 'Error al obtener usuario');
    err.status = error.status || 500;
    throw err;
  }
};

// Crear usuario (y retornarlo con su jefe, si se especificó)
const createUsuario = async (data) => {
  try {
    // Si se proporciona id_usuario_jefe, verificar que exista
    if (data.id_usuario_jefe !== undefined && data.id_usuario_jefe !== null) {
      const jefe = await Usuario.findByPk(data.id_usuario_jefe);
      if (!jefe) {
        const err = new Error(`No existe un usuario jefe con id: ${data.id_usuario_jefe}`);
        err.status = 400;
        throw err;
      }
    }
    // Verificar si ya existe un usuario con el mismo id_usuario_LDAP (opcional)
    const existente = await Usuario.findOne({ 
      where: { id_usuario_LDAP: data.id_usuario_LDAP } 
    });
    if (existente) {
      const err = new Error(`Ya existe un usuario con el LDAP: ${data.id_usuario_LDAP}`);
      err.status = 400;
      throw err;
    }

    const usuario = await Usuario.create(data);
    // Recargar el usuario incluyendo la relación jefe
    await usuario.reload({ include: includeJefe() });
    return usuario;
  } catch (error) {
    console.error('Error en usuarioService.createUsuario:', error);
    if (!error.status) error.status = 500;
    throw error;
  }
};

// Actualizar usuario (actualización parcial) y retornarlo con su jefe
const updateUsuario = async (id, updates) => {
  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return null;

    // Si se actualiza id_usuario_jefe, verificar existencia y evitar auto-referencia
    if (updates.id_usuario_jefe !== undefined) {
      if (updates.id_usuario_jefe === null) {
        // permitirá asignar null para quitar jefe
      } else {
        const jefe = await Usuario.findByPk(updates.id_usuario_jefe);
        if (!jefe) {
          const err = new Error(`No existe un usuario jefe con id: ${updates.id_usuario_jefe}`);
          err.status = 400;
          throw err;
        }
        if (Number(id) === Number(updates.id_usuario_jefe)) {
          const err = new Error('id_usuario_jefe no puede ser igual al propio id del usuario');
          err.status = 400;
          throw err;
        }
      }
    }

    // Si se actualiza id_usuario_LDAP, verificar que no exista otro con el mismo valor
    if (updates.id_usuario_LDAP && updates.id_usuario_LDAP !== usuario.id_usuario_LDAP) {
      const existente = await Usuario.findOne({ 
        where: { id_usuario_LDAP: updates.id_usuario_LDAP } 
      });
      if (existente) {
        const err = new Error(`Ya existe otro usuario con el LDAP: ${updates.id_usuario_LDAP}`);
        err.status = 400;
        throw err;
      }
    }

    await usuario.update(updates);
    // Recargar para incluir la relación jefe (puede haber cambiado)
    await usuario.reload({ include: includeJefe() });
    return usuario;
  } catch (error) {
    console.error('Error en usuarioService.updateUsuario:', error);
    if (!error.status) error.status = 500;
    throw error;
  }
};

// Eliminar usuario (borrado físico)
const deleteUsuario = async (id) => {
  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return false;
    await usuario.destroy();
    return true;
  } catch (error) {
    console.error('Error en usuarioService.deleteUsuario:', error);
    const err = new Error(error.message || 'Error al eliminar usuario');
    err.status = error.status || 500;
    throw err;
  }
};

// Cambiar estado activo/inactivo y retornar usuario con su jefe
const cambiarEstado = async (id, activo) => {
  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return null;
    await usuario.update({ activo });
    await usuario.reload({ include: includeJefe() });
    return usuario;
  } catch (error) {
    console.error('Error en usuarioService.cambiarEstado:', error);
    const err = new Error(error.message || 'Error al cambiar estado');
    err.status = error.status || 500;
    throw err;
  }
};

// Obtener usuario por id_usuario_LDAP (con su jefe)
const getUsuarioByLDAP = async (id_usuario_LDAP) => {
  try {
    const usuario = await Usuario.findOne({
      where: { id_usuario_LDAP },
      include: includeJefe()
    });
    return usuario;
  } catch (error) {
    console.error('Error en usuarioService.getUsuarioByLDAP:', error);
    const err = new Error(error.message || 'Error al buscar usuario por LDAP');
    err.status = error.status || 500;
    throw err;
  }
};

const buildWhereClause = (filtros) => {
  const where = {};

  if (filtros.rol) {
    if (!roles.includes(filtros.rol)) {
      throw new Error(`Rol inválido. Debe ser uno de: ${roles.join(', ')}`);
    }
    where.rol = filtros.rol;
  }

  if (filtros.id_usuario_LDAP) {
    where.id_usuario_LDAP = { [Op.iLike]: `%${filtros.id_usuario_LDAP}%` };
  }

  if (filtros.id_AreaResponsabilidad) {
    where.id_AreaResponsabilidad = { [Op.iLike]: `%${filtros.id_AreaResponsabilidad}%` };
  }

  if (filtros.activo !== undefined) {
    if (typeof filtros.activo !== 'boolean') {
      throw new Error('activo debe ser un valor booleano');
    }
    where.activo = filtros.activo;
  }

  // Filtros por rango de fechas de creación (createdAt)
  if (filtros.createdAt_desde || filtros.createdAt_hasta) {
    where.createdAt = {};
    if (filtros.createdAt_desde) {
      where.createdAt[Op.gte] = new Date(filtros.createdAt_desde);
    }
    if (filtros.createdAt_hasta) {
      where.createdAt[Op.lte] = new Date(filtros.createdAt_hasta);
    }
  }

  return where;
};

// Filtrado paginado (incluye al jefe en cada usuario)
const filtrarUsuarios = async (filtros, page, limit) => {
  try {
    const where = buildWhereClause(filtros);
    const offset = (page - 1) * limit;

    const { count, rows } = await Usuario.findAndCountAll({
      where,
      include: includeJefe(),
      offset,
      limit,
      order: [['createdAt', 'DESC']]  // Orden cronológico descendente
    });

    const totalPaginas = Math.ceil(count / limit);

    return {
      total: count,
      pagina: page,
      totalPaginas,
      datos: rows
    };
  } catch (error) {
    console.error('Error en usuarioService.filtrarUsuarios:', error);
    const err = new Error(error.message || 'Error al filtrar usuarios');
    err.status = error.status || 400;
    throw err;
  }
};

module.exports = {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  cambiarEstado,
  getUsuarioByLDAP,
  filtrarUsuarios
};