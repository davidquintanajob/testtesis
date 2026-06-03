const { Solicitud, estadosSolicitud, tiposTraslado, tiposMovimientoSolicitud } = require('../models/solicitud');
const { Baja } = require('../models/baja');
const { SolicitudUsuario } = require('../models/solicitudUsuario');
const { BajaDetalle } = require('../models/baja_detalle');
const { Usuario } = require('../models/usuario');
const { Mensaje } = require('../models/mensaje');
const sequelize = require('../helpers/database');
const { executeReadOnlyQuery } = require('../helpers/databaseAssets');
const { Op, fn, col, where } = require('sequelize');

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
// Normalización: elimina asteriscos y espacios
// ------------------------------------------------------------
function normalizarId(id) {
  if (!id) return '';
  return id.replace(/[*\s]/g, '');
}

// ------------------------------------------------------------
// Validaciones contra Assets (con normalización)
// ------------------------------------------------------------
async function areaExists(idArea) {
  const idAreaNorm = normalizarId(idArea);
  const query = `
    SELECT 1 FROM Areas_Responsabilidad 
    WHERE REPLACE(REPLACE(Id_AreaResponsabilidad, '*', ''), ' ', '') = @idAreaNorm
  `;
  const result = await executeReadOnlyQuery(query, { idAreaNorm });
  return result.length > 0;
}

async function checkActivoFijo(idActivo, idArea) {
  const idActivoNorm = normalizarId(idActivo);
  const areaNorm = normalizarId(idArea);
  const query = `
    SELECT 1 FROM Activo_Fijo 
    WHERE REPLACE(REPLACE(Id_ActivoFijo, '*', ''), ' ', '') = @idActivoNorm
      AND REPLACE(REPLACE(ID_AreaResp, '*', ''), ' ', '') = @areaNorm
  `;
  const result = await executeReadOnlyQuery(query, { idActivoNorm, areaNorm });
  return result.length > 0;
}

async function checkUtil(idUtil, idArea) {
  const idUtilNorm = normalizarId(idUtil);
  const areaNorm = normalizarId(idArea);
  const query = `
    SELECT 1 FROM Util_Tool ut
    INNER JOIN Util_Tool_Detalles utd ON ut.Id_UH = utd.Id_UH
    WHERE REPLACE(REPLACE(ut.Id_UH, '*', ''), ' ', '') = @idUtilNorm
      AND REPLACE(REPLACE(utd.Id_AreaResponsabilidad, '*', ''), ' ', '') = @areaNorm
  `;
  const result = await executeReadOnlyQuery(query, { idUtilNorm, areaNorm });
  return result.length > 0;
}

async function validarListaActivos(listaActivos, idArea) {
  const areaNorm = normalizarId(idArea);
  for (const rawIdItem of listaActivos) {
    const idItemNorm = normalizarId(rawIdItem);
    const esActivo = await checkActivoFijo(idItemNorm, areaNorm);
    if (esActivo) continue;
    const esUtil = await checkUtil(idItemNorm, areaNorm);
    if (esUtil) continue;
    throw {
      status: 400,
      message: `El elemento "${rawIdItem}" no existe como Activo Fijo con área "${idArea}" ni como Útil con un detalle en esa área.`
    };
  }
}

async function getNombreActivo(idItem) {
  const idItemNorm = normalizarId(idItem);
  let query = `SELECT Desc_ActivoFijo as nombre FROM Activo_Fijo WHERE REPLACE(REPLACE(Id_ActivoFijo, '*', ''), ' ', '') = @idItemNorm`;
  let result = await executeReadOnlyQuery(query, { idItemNorm });
  if (result.length > 0) return result[0].nombre;
  query = `SELECT Desc_UH as nombre FROM Util_Tool WHERE REPLACE(REPLACE(Id_UH, '*', ''), ' ', '') = @idItemNorm`;
  result = await executeReadOnlyQuery(query, { idItemNorm });
  if (result.length > 0) return result[0].nombre;
  return idItem;
}

// ------------------------------------------------------------
// Obtener usuarios asociados a una solicitud
// ------------------------------------------------------------
async function getUsuariosBySolicitud(id_solicitud) {
  const solicitudConUsuarios = await Solicitud.findByPk(id_solicitud, {
    include: [{ model: Usuario, through: { attributes: [] } }]
  });
  if (!solicitudConUsuarios) return [];
  const usuarios = solicitudConUsuarios.Usuarios || solicitudConUsuarios.usuarios;
  return Array.isArray(usuarios) ? usuarios : [];
}

// ------------------------------------------------------------
// Obtener el usuario creador (remitente) a partir de los mensajes existentes
// ------------------------------------------------------------
async function getCreadorFromSolicitud(id_solicitud) {
  const mensaje = await Mensaje.findOne({
    where: { id_solicitud },
    attributes: ['id_usuario']
  });
  return mensaje ? mensaje.id_usuario : null;
}

// ------------------------------------------------------------
// Crear mensajes para cada receptor (incluyendo al creador para dejar registro)
// ------------------------------------------------------------
async function crearMensajesParaUsuarios(creadorId, receptoresIds, id_solicitud, descripcion, tipo = 'Baja', transaction) {
  if (!creadorId) return;
  const fecha_hora = new Date();
  const mensajesData = [];

  // Siempre crear un mensaje del creador hacia sí mismo para dejar evidencia
  mensajesData.push({
    fecha_hora,
    tipo,
    descripcion,
    estado: 'enviado',
    id_usuario: creadorId,
    id_usuario_receptor: creadorId,
    id_solicitud
  });

  // Luego para cada receptor diferente al creador
  for (const receptorId of receptoresIds) {
    if (receptorId !== creadorId) {
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
  }

  if (mensajesData.length > 0) {
    await Mensaje.bulkCreate(mensajesData, { transaction });
  }
}

// ------------------------------------------------------------
// Obtener baja con todas las relaciones
// ------------------------------------------------------------
async function getBajaWithRelations(id_solicitud) {
  const baja = await Baja.findByPk(id_solicitud, {
    include: [
      { model: Solicitud, as: 'solicitud', required: true },
      { model: BajaDetalle, as: 'detalles', required: false }
    ]
  });
  if (!baja) return null;
  const usuarios = await getUsuariosBySolicitud(id_solicitud);
  return { ...baja.toJSON(), usuarios, solicitud: baja.solicitud, detalles: baja.detalles };
}

// ------------------------------------------------------------
// CREATE BAJA
// ------------------------------------------------------------
async function createBaja(data) {
  const { solicitud, baja, usuarios_ids, lista_activos, usuario_creador } = data;

  if (!solicitud || !baja || !usuarios_ids || !lista_activos || !usuario_creador) {
    throw { status: 400, message: 'Faltan datos requeridos (solicitud, baja, usuarios_ids, lista_activos, usuario_creador)' };
  }

  const solicitudNormalizada = validarDatosSolicitud(solicitud);
  if (!Array.isArray(usuarios_ids) || usuarios_ids.length === 0) throw { status: 400, message: 'usuarios_ids debe ser un array no vacío' };
  if (!Array.isArray(lista_activos) || lista_activos.length === 0) throw { status: 400, message: 'lista_activos debe ser un array no vacío' };
  if (!usuarios_ids.includes(usuario_creador)) throw { status: 400, message: 'El usuario_creador debe estar incluido en usuarios_ids' };
  if (!solicitud.tipo_traslado) throw { status: 400, message: 'tipo_traslado es obligatorio' };
  const idArea = baja.id_AreaResponsabilidad;
  const motivo = baja.motivo;
  if (!idArea || !motivo) throw { status: 400, message: 'Área y motivo son obligatorios' };

  const areaOk = await areaExists(idArea);
  if (!areaOk) throw { status: 400, message: 'El área no existe en Assets' };

  const usuariosExistentes = await Usuario.findAll({ where: { id_usuario: usuarios_ids } });
  if (usuariosExistentes.length !== usuarios_ids.length) throw { status: 400, message: 'Uno o más usuarios no existen' };

  await validarListaActivos(lista_activos, idArea);

  const activosInfo = [];
  for (const idItem of lista_activos) {
    const nombre = await getNombreActivo(idItem);
    activosInfo.push({ id: idItem, nombre });
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

    await Baja.create({
      id_solicitud: nuevaSolicitud.id_solicitud,
      id_AreaResponsabilidad: idArea,
      motivo
    }, { transaction });

    const usuariosData = usuarios_ids.map(id_usuario => ({ id_solicitud: nuevaSolicitud.id_solicitud, id_usuario }));
    await SolicitudUsuario.bulkCreate(usuariosData, { transaction });

    const detallesData = lista_activos.map(idItem => ({ id_baja: nuevaSolicitud.id_solicitud, id_activoFijo_o_util: idItem }));
    await BajaDetalle.bulkCreate(detallesData, { transaction });

    const listaNombres = activosInfo.map(a => `${a.nombre} (${a.id})`).join(', ');
    const descripcionMensaje = `Se solicitó una baja de los siguientes elementos: ${listaNombres} en el área: ${idArea}. Motivo: ${motivo}`;
    await crearMensajesParaUsuarios(usuario_creador, usuarios_ids, nuevaSolicitud.id_solicitud, descripcionMensaje, 'Baja', transaction);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw { status: 500, message: error.message };
  }

  return await getBajaWithRelations(nuevaSolicitud.id_solicitud);
}

// ------------------------------------------------------------
// UPDATE BAJA
// ------------------------------------------------------------
async function updateBaja(id, data) {
  const { solicitud, baja, usuarios_ids, lista_activos, usuario_creador } = data;

  const solicitudNormalizada = solicitud ? validarDatosSolicitud(solicitud) : null;

  const existing = await Baja.findByPk(id);
  if (!existing) throw { status: 404, message: 'Baja no encontrada' };

  // Intentar obtener el creador desde los mensajes; si no existe, usar el usuario_creador proporcionado
  let creadorOriginal = await getCreadorFromSolicitud(id);
  if (!creadorOriginal) {
    if (usuario_creador) {
      creadorOriginal = usuario_creador;
    } else {
      throw { status: 400, message: 'No se pudo determinar el creador de la solicitud. Proporcione usuario_creador en el body.' };
    }
  }

  let idArea = existing.id_AreaResponsabilidad;
  if (baja && baja.id_AreaResponsabilidad) idArea = baja.id_AreaResponsabilidad;

  const transaction = await sequelize.transaction();

  try {
    if (solicitudNormalizada) await Solicitud.update(solicitudNormalizada, { where: { id_solicitud: id }, transaction });
    if (baja) {
      if (baja.id_AreaResponsabilidad && normalizarId(baja.id_AreaResponsabilidad) !== normalizarId(existing.id_AreaResponsabilidad)) {
        const ok = await areaExists(baja.id_AreaResponsabilidad);
        if (!ok) throw { status: 400, message: 'Área no existe en Assets' };
      }
      await Baja.update(baja, { where: { id_solicitud: id }, transaction });
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
      await BajaDetalle.destroy({ where: { id_baja: id }, transaction });
      if (lista_activos.length > 0) {
        const nuevosDetalles = lista_activos.map(idItem => ({ id_baja: id, id_activoFijo_o_util: idItem }));
        await BajaDetalle.bulkCreate(nuevosDetalles, { transaction });
      }
    }

    if (nuevosUsuariosIds && nuevosUsuariosIds.length > 0) {
      const descripcion = `La solicitud de baja ha sido modificada. Por favor revise los nuevos datos.`;
      await crearMensajesParaUsuarios(creadorOriginal, nuevosUsuariosIds, id, descripcion, 'Baja', transaction);
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw { status: error.status || 500, message: error.message };
  }

  return await getBajaWithRelations(id);
}

// ------------------------------------------------------------
// DELETE BAJA
// ------------------------------------------------------------
async function deleteBaja(id) {
  const solicitud = await Solicitud.findByPk(id);
  if (!solicitud) throw { status: 404, message: 'Baja no encontrada' };
  if (solicitud.estado === 'Completada') throw { status: 400, message: 'No se puede eliminar una baja completada.' };

  const usuariosAsociados = await getUsuariosBySolicitud(id);
  const creadorOriginal = await getCreadorFromSolicitud(id);
  const usuariosIds = usuariosAsociados.map(u => u.id_usuario);

  const transaction = await sequelize.transaction();
  try {
    if (creadorOriginal && usuariosIds.length > 0) {
      const descripcion = `La solicitud de baja ha sido eliminada.`;
      await crearMensajesParaUsuarios(creadorOriginal, usuariosIds, id, descripcion, 'Baja', transaction);
    }
    await BajaDetalle.destroy({ where: { id_baja: id }, transaction });
    await SolicitudUsuario.destroy({ where: { id_solicitud: id }, transaction });
    await Baja.destroy({ where: { id_solicitud: id }, transaction });
    const deleted = await Solicitud.destroy({ where: { id_solicitud: id }, transaction });
    if (deleted === 0) throw { status: 404, message: 'Baja no encontrada' };
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw { status: error.status || 500, message: error.message };
  }
}

async function getBajaById(id) { return getBajaWithRelations(id); }

async function filtrarBajas(filtros, page, limit) {
  const whereSolicitud = {};
  const whereBaja = {};

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
  if (filtros.id_AreaResponsabilidad) {
    const areaNorm = normalizarId(filtros.id_AreaResponsabilidad);
    whereSolicitud[Op.and] = whereSolicitud[Op.and] || [];
    whereSolicitud[Op.and].push(
      where(
        fn('REPLACE', fn('REPLACE', col('Id_AreaResponsabilidad'), '*', ''), ' ', ''),
        areaNorm
      )
    );
  }
  if (filtros.motivo) whereBaja.motivo = { [Op.iLike]: `%${filtros.motivo}%` };

  const offset = (page - 1) * limit;
  const { count, rows } = await Baja.findAndCountAll({
    where: whereBaja,
    include: [
      {
        model: Solicitud,
        as: 'solicitud',
        where: Object.keys(whereSolicitud).length ? whereSolicitud : undefined,
        required: true,
        include: [{ model: Usuario, through: { attributes: [] }, required: false }]
      },
      { model: BajaDetalle, as: 'detalles', required: false }
    ],
    distinct: true,
    offset,
    limit,
    order: [['id_solicitud', 'DESC']]
  });

  const bajasConUsuarios = rows.map(baja => {
    const usuarios = baja.solicitud?.Usuarios || [];
    const bajaObj = baja.toJSON();
    if (bajaObj.solicitud) delete bajaObj.solicitud.Usuarios;
    return { ...bajaObj, usuarios };
  });

  return { total: count, pagina: page, totalPaginas: Math.ceil(count / limit), datos: bajasConUsuarios };
}

module.exports = { createBaja, updateBaja, getBajaById, deleteBaja, filtrarBajas };