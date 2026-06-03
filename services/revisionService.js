const { Solicitud, estadosSolicitud, tiposTraslado, tiposMovimientoSolicitud } = require('../models/solicitud');
const { Revision } = require('../models/revision');
const { RevisionDetalle } = require('../models/revision_detalle');
const { SolicitudUsuario } = require('../models/solicitudUsuario');
const { Usuario } = require('../models/usuario');
const { Mensaje } = require('../models/mensaje');
const sequelize = require('../helpers/database');
const { executeReadOnlyQuery } = require('../helpers/databaseAssets');
const { Op } = require('sequelize');

function normalizarTexto(valor) {
  if (valor === undefined || valor === null) return null;
  if (typeof valor !== 'string') return valor;
  const normalizado = valor.trim();
  return normalizado.length === 0 ? null : normalizado;
}

function validarDatosSolicitud(solicitud) {
  const tipoMovimiento = normalizarTexto(solicitud.tipo_movimiento);
  if (tipoMovimiento && !tiposMovimientoSolicitud.includes(tipoMovimiento)) {
    throw {
      status: 400,
      message: `tipo_movimiento inválido. Debe ser uno de: ${tiposMovimientoSolicitud.join(', ')}`
    };
  }
  return {
    ...solicitud,
    tipo_movimiento: tipoMovimiento,
    fundamentacion: normalizarTexto(solicitud.fundamentacion)
  };
}

// ------------------------------------------------------------
// Reutilizamos las mismas funciones de validación que en traslado
// ------------------------------------------------------------
async function areaExists(idArea) {
  const query = `SELECT 1 FROM Areas_Responsabilidad WHERE Id_AreaResponsabilidad = @idArea`;
  const result = await executeReadOnlyQuery(query, { idArea });
  return result.length > 0;
}

async function checkActivoFijo(idActivo, idArea) {
  const query = `SELECT 1 FROM Activo_Fijo WHERE Id_ActivoFijo = @idActivo AND ID_AreaResp = @idArea`;
  const result = await executeReadOnlyQuery(query, { idActivo, idArea });
  return result.length > 0;
}

async function checkUtil(idUtil, idArea) {
  const query = `
    SELECT 1 FROM Util_Tool ut
    INNER JOIN Util_Tool_Detalles utd ON ut.Id_UH = utd.Id_UH
    WHERE ut.Id_UH = @idUtil AND utd.Id_AreaResponsabilidad = @idArea
  `;
  const result = await executeReadOnlyQuery(query, { idUtil, idArea });
  return result.length > 0;
}

async function validarListaActivos(listaActivos, idArea) {
  for (const item of listaActivos) {
    const idItem = item.id_activoFijo_o_util;
    const esActivo = await checkActivoFijo(idItem, idArea);
    if (esActivo) continue;
    const esUtil = await checkUtil(idItem, idArea);
    if (esUtil) continue;
    throw {
      status: 400,
      message: `El elemento "${idItem}" no existe como Activo Fijo con área "${idArea}" ni como Útil con un detalle en esa área.`
    };
  }
}

async function getNombreActivo(idItem) {
  let query = `SELECT Desc_ActivoFijo as nombre FROM Activo_Fijo WHERE Id_ActivoFijo = @idItem`;
  let result = await executeReadOnlyQuery(query, { idItem });
  if (result.length > 0) return result[0].nombre;
  query = `SELECT Desc_UH as nombre FROM Util_Tool WHERE Id_UH = @idItem`;
  result = await executeReadOnlyQuery(query, { idItem });
  if (result.length > 0) return result[0].nombre;
  return idItem;
}

async function getUsuariosBySolicitud(id_solicitud) {
  const solicitudConUsuarios = await Solicitud.findByPk(id_solicitud, {
    include: [{ model: Usuario, through: { attributes: [] } }]
  });
  // Asegura que siempre se retorne un array
  if (!solicitudConUsuarios) return [];
  return Array.isArray(solicitudConUsuarios.Usuarios) ? solicitudConUsuarios.Usuarios : [];
}

async function getCreadorFromSolicitud(id_solicitud) {
  const mensaje = await Mensaje.findOne({
    where: { id_solicitud },
    attributes: ['id_usuario']
  });
  return mensaje ? mensaje.id_usuario : null;
}

async function crearMensajesParaUsuarios(creadorId, receptoresIds, id_solicitud, descripcion, tipo = 'Revisión', transaction) {
  if (!creadorId || !receptoresIds || receptoresIds.length === 0) return;
  const fecha_hora = new Date();
  const mensajesData = [];
  for (const receptorId of receptoresIds) {
    if (receptorId === creadorId) continue;
    mensajesData.push({
      fecha_hora,
      tipo,
      descripcion,
      estado: 'enviado',
      id_usuario: creadorId,
      id_usuario_receptor: receptorId,
      id_solicitud
    });
  }
  if (mensajesData.length > 0) await Mensaje.bulkCreate(mensajesData, { transaction });
}

async function getRevisionWithRelations(id_solicitud) {
  const revision = await Revision.findByPk(id_solicitud, {
    include: [
      { model: Solicitud, as: 'solicitud', required: true },
      { model: RevisionDetalle, as: 'detalles', required: false }
    ]
  });
  if (!revision) return null;
  const usuarios = await getUsuariosBySolicitud(id_solicitud);
  return { ...revision.toJSON(), usuarios, solicitud: revision.solicitud, detalles: revision.detalles };
}

// ------------------------------------------------------------
// CREATE REVISION
// ------------------------------------------------------------
async function createRevision(data) {
  const { solicitud, revision, usuarios_ids, lista_activos, usuario_creador } = data;

  if (!solicitud || !revision || !usuarios_ids || !lista_activos || !usuario_creador) {
    throw { status: 400, message: 'Faltan datos requeridos (solicitud, revision, usuarios_ids, lista_activos, usuario_creador)' };
  }

  const solicitudNormalizada = validarDatosSolicitud(solicitud);
  if (!Array.isArray(usuarios_ids) || usuarios_ids.length === 0) throw { status: 400, message: 'usuarios_ids debe ser un array no vacío' };
  if (!Array.isArray(lista_activos) || lista_activos.length === 0) throw { status: 400, message: 'lista_activos debe ser un array no vacío' };
  if (!usuarios_ids.includes(usuario_creador)) throw { status: 400, message: 'El usuario_creador debe estar incluido en usuarios_ids' };
  if (!solicitud.tipo_traslado) throw { status: 400, message: 'tipo_traslado es obligatorio' };
  const idArea = revision.id_AreaResponsabilidad;
  if (!idArea) throw { status: 400, message: 'id_AreaResponsabilidad es obligatorio' };

  const areaOk = await areaExists(idArea);
  if (!areaOk) throw { status: 400, message: 'El área no existe en Assets' };

  const usuariosExistentes = await Usuario.findAll({ where: { id_usuario: usuarios_ids } });
  if (usuariosExistentes.length !== usuarios_ids.length) throw { status: 400, message: 'Uno o más usuarios no existen' };

  await validarListaActivos(lista_activos, idArea);

  const activosInfo = [];
  for (const item of lista_activos) {
    const nombre = await getNombreActivo(item.id_activoFijo_o_util);
    activosInfo.push({ id: item.id_activoFijo_o_util, nombre, revisado: item.isRevisado });
  }

  const transaction = await sequelize.transaction();
  let nuevaSolicitud;

  try {
    nuevaSolicitud = await Solicitud.create({
      nota: solicitudNormalizada.nota ?? null,
      tipo_movimiento: solicitudNormalizada.tipo_movimiento ?? null,
      fundamentacion: solicitudNormalizada.fundamentacion ?? null,
      tipo_traslado: solicitudNormalizada.tipo_traslado,
      estado: solicitudNormalizada.estado || 'Pendiente',
      fecha_hora_creacion: new Date(),
      fecha_hora_cierreSolicitud: null
    }, { transaction });

    await Revision.create({
      id_solicitud: nuevaSolicitud.id_solicitud,
      id_AreaResponsabilidad: idArea
    }, { transaction });

    const usuariosData = usuarios_ids.map(id_usuario => ({ id_solicitud: nuevaSolicitud.id_solicitud, id_usuario }));
    await SolicitudUsuario.bulkCreate(usuariosData, { transaction });

    const detallesData = lista_activos.map(item => ({
      id_revision: nuevaSolicitud.id_solicitud,
      id_activoFijo_o_util: item.id_activoFijo_o_util,
      isRevisado: item.isRevisado || false
    }));
    await RevisionDetalle.bulkCreate(detallesData, { transaction });

    const descripcionMensaje = `Se ha solicitado una nueva revisión en el área: ${idArea}. Por favor, revise los detalles en el sistema.`;
    await crearMensajesParaUsuarios(usuario_creador, usuarios_ids, nuevaSolicitud.id_solicitud, descripcionMensaje, 'Revisión', transaction);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw { status: 500, message: error.message };
  }

  return await getRevisionWithRelations(nuevaSolicitud.id_solicitud);
}

// ------------------------------------------------------------
// UPDATE REVISION
// ------------------------------------------------------------
async function updateRevision(id, data) {
  const { solicitud, revision, usuarios_ids, lista_activos } = data;

  const solicitudNormalizada = solicitud ? validarDatosSolicitud(solicitud) : null;

  const existing = await Revision.findByPk(id);
  if (!existing) throw { status: 404, message: 'Revisión no encontrada' };

  const creadorOriginal = await getCreadorFromSolicitud(id);
  if (!creadorOriginal) throw { status: 500, message: 'No se pudo determinar el creador' };

  let idArea = existing.id_AreaResponsabilidad;
  if (revision && revision.id_AreaResponsabilidad) idArea = revision.id_AreaResponsabilidad;

  const transaction = await sequelize.transaction();

  try {
    if (solicitudNormalizada) await Solicitud.update(solicitudNormalizada, { where: { id_solicitud: id }, transaction });
    if (revision) {
      if (revision.id_AreaResponsabilidad && revision.id_AreaResponsabilidad !== existing.id_AreaResponsabilidad) {
        const ok = await areaExists(revision.id_AreaResponsabilidad);
        if (!ok) throw { status: 400, message: 'El nuevo área no existe en Assets' };
      }
      await Revision.update(revision, { where: { id_solicitud: id }, transaction });
    }

    let nuevosUsuariosIds = null;
    if (usuarios_ids) {
      if (!Array.isArray(usuarios_ids)) throw { status: 400, message: 'usuarios_ids debe ser un array' };
      const usuariosExistentes = await Usuario.findAll({ where: { id_usuario: usuarios_ids } });
      if (usuariosExistentes.length !== usuarios_ids.length) throw { status: 400, message: 'Uno o más usuarios_ids no existen' };
      await SolicitudUsuario.destroy({ where: { id_solicitud: id }, transaction });
      if (usuarios_ids.length > 0) {
        const nuevosUsuarios = usuarios_ids.map(id_usuario => ({ id_solicitud: id, id_usuario }));
        await SolicitudUsuario.bulkCreate(nuevosUsuarios, { transaction });
      }
      nuevosUsuariosIds = usuarios_ids;
    } else {
      const usuariosActuales = await getUsuariosBySolicitud(id);
      nuevosUsuariosIds = usuariosActuales.map(u => u.id_usuario);
    }

    if (lista_activos) {
      if (!Array.isArray(lista_activos)) throw { status: 400, message: 'lista_activos debe ser un array' };
      await validarListaActivos(lista_activos, idArea);
      await RevisionDetalle.destroy({ where: { id_revision: id }, transaction });
      if (lista_activos.length > 0) {
        const nuevosDetalles = lista_activos.map(item => ({
          id_revision: id,
          id_activoFijo_o_util: item.id_activoFijo_o_util,
          isRevisado: item.isRevisado || false
        }));
        await RevisionDetalle.bulkCreate(nuevosDetalles, { transaction });
      }
    }

    if (nuevosUsuariosIds && nuevosUsuariosIds.length > 0) {
      const descripcion = `La solicitud de revisión ha sido modificada. Por favor revise los nuevos datos.`;
      await crearMensajesParaUsuarios(creadorOriginal, nuevosUsuariosIds, id, descripcion, 'Revisión', transaction);
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw { status: error.status || 500, message: error.message };
  }

  return await getRevisionWithRelations(id);
}

// ------------------------------------------------------------
// DELETE REVISION
// ------------------------------------------------------------
async function deleteRevision(id) {
  const solicitud = await Solicitud.findByPk(id);
  if (!solicitud) throw { status: 404, message: 'Revisión no encontrada' };
  if (solicitud.estado === 'Completada') throw { status: 400, message: 'No se puede eliminar una revisión completada.' };

  const usuariosAsociados = await getUsuariosBySolicitud(id);
  const creadorOriginal = await getCreadorFromSolicitud(id);
  const usuariosIds = usuariosAsociados.map(u => u.id_usuario);

  const transaction = await sequelize.transaction();
  try {
    if (creadorOriginal && usuariosIds.length > 0) {
      const descripcion = `La solicitud de revisión ha sido eliminada.`;
      await crearMensajesParaUsuarios(creadorOriginal, usuariosIds, id, descripcion, 'Revisión', transaction);
    }
    await RevisionDetalle.destroy({ where: { id_revision: id }, transaction });
    await SolicitudUsuario.destroy({ where: { id_solicitud: id }, transaction });
    await Revision.destroy({ where: { id_solicitud: id }, transaction });
    const deleted = await Solicitud.destroy({ where: { id_solicitud: id }, transaction });
    if (deleted === 0) throw { status: 404, message: 'Revisión no encontrada' };
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw { status: error.status || 500, message: error.message };
  }
}

async function getRevisionById(id) { return getRevisionWithRelations(id); }

async function filtrarRevisiones(filtros, page, limit) {
  const whereSolicitud = {};
  const whereRevision = {};

  if (filtros.nota) whereSolicitud.nota = { [Op.iLike]: `%${filtros.nota}%` };
  if (filtros.estado) whereSolicitud.estado = filtros.estado;
  if (filtros.tipo_traslado) whereSolicitud.tipo_traslado = filtros.tipo_traslado;
  if (filtros.tipo_movimiento) {
    if (!tiposMovimientoSolicitud.includes(filtros.tipo_movimiento)) {
      throw { status: 400, message: `tipo_movimiento inválido. Debe ser uno de: ${tiposMovimientoSolicitud.join(', ')}` };
    }
    whereSolicitud.tipo_movimiento = filtros.tipo_movimiento;
  }
  if (filtros.fundamentacion) whereSolicitud.fundamentacion = { [Op.iLike]: `%${filtros.fundamentacion}%` };
  if (filtros.fecha_hora_creacion_desde || filtros.fecha_hora_creacion_hasta) {
    whereSolicitud.fecha_hora_creacion = {};
    if (filtros.fecha_hora_creacion_desde) whereSolicitud.fecha_hora_creacion[Op.gte] = new Date(filtros.fecha_hora_creacion_desde);
    if (filtros.fecha_hora_creacion_hasta) whereSolicitud.fecha_hora_creacion[Op.lte] = new Date(filtros.fecha_hora_creacion_hasta);
  }
  if (filtros.fecha_hora_cierreSolicitud_desde || filtros.fecha_hora_cierreSolicitud_hasta) {
    whereSolicitud.fecha_hora_cierreSolicitud = {};
    if (filtros.fecha_hora_cierreSolicitud_desde) whereSolicitud.fecha_hora_cierreSolicitud[Op.gte] = new Date(filtros.fecha_hora_cierreSolicitud_desde);
    if (filtros.fecha_hora_cierreSolicitud_hasta) whereSolicitud.fecha_hora_cierreSolicitud[Op.lte] = new Date(filtros.fecha_hora_cierreSolicitud_hasta);
  }
  if (filtros.id_AreaResponsabilidad) whereRevision.id_AreaResponsabilidad = filtros.id_AreaResponsabilidad;

  const offset = (page - 1) * limit;
  const { count, rows } = await Revision.findAndCountAll({
    where: whereRevision,
    include: [
      {
        model: Solicitud,
        as: 'solicitud',
        where: Object.keys(whereSolicitud).length ? whereSolicitud : undefined,
        required: true,
        include: [{ model: Usuario, through: { attributes: [] }, required: false }]
      },
      { model: RevisionDetalle, as: 'detalles', required: false }
    ],
    distinct: true,
    offset,
    limit,
    order: [['id_solicitud', 'DESC']]
  });

  const revisionesConUsuarios = rows.map(revision => {
    const usuarios = revision.solicitud?.Usuarios || [];
    const revisionObj = revision.toJSON();
    if (revisionObj.solicitud) delete revisionObj.solicitud.Usuarios;
    return { ...revisionObj, usuarios };
  });

  return { total: count, pagina: page, totalPaginas: Math.ceil(count / limit), datos: revisionesConUsuarios };
}

module.exports = { createRevision, updateRevision, getRevisionById, deleteRevision, filtrarRevisiones };