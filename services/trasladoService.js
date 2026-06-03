const { Solicitud, estadosSolicitud, tiposTraslado, tiposMovimientoSolicitud } = require('../models/solicitud');
const { Traslado } = require('../models/traslado');
const { SolicitudUsuario } = require('../models/solicitudUsuario');
const { TrasladoDetalle } = require('../models/traslado_detalle');
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
// Normalización: elimina asteriscos y espacios
// ------------------------------------------------------------
function normalizarId(id) {
  if (!id) return '';
  return id.replace(/[*\s]/g, '');
}

// ------------------------------------------------------------
// Validaciones contra Assets
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

async function checkActivoFijo(idActivo, idAreaOrigen) {
  const idActivoNorm = normalizarId(idActivo);
  const areaNorm = normalizarId(idAreaOrigen);
  const query = `
    SELECT 1 FROM Activo_Fijo 
    WHERE REPLACE(REPLACE(Id_ActivoFijo, '*', ''), ' ', '') = @idActivoNorm
      AND REPLACE(REPLACE(ID_AreaResp, '*', ''), ' ', '') = @areaNorm
  `;
  const result = await executeReadOnlyQuery(query, { idActivoNorm, areaNorm });
  return result.length > 0;
}

async function checkUtil(idUtil, idAreaOrigen) {
  const idUtilNorm = normalizarId(idUtil);
  const areaNorm = normalizarId(idAreaOrigen);
  const query = `
    SELECT 1 FROM Util_Tool ut
    INNER JOIN Util_Tool_Detalles utd ON ut.Id_UH = utd.Id_UH
    WHERE REPLACE(REPLACE(ut.Id_UH, '*', ''), ' ', '') = @idUtilNorm
      AND REPLACE(REPLACE(utd.Id_AreaResponsabilidad, '*', ''), ' ', '') = @areaNorm
  `;
  const result = await executeReadOnlyQuery(query, { idUtilNorm, areaNorm });
  return result.length > 0;
}

async function validarListaActivos(listaActivos, idAreaOrigen) {
  const areaOrigenNorm = normalizarId(idAreaOrigen);
  for (let rawIdItem of listaActivos) {
    const idItemNorm = normalizarId(rawIdItem);
    const esActivo = await checkActivoFijo(idItemNorm, areaOrigenNorm);
    if (esActivo) continue;
    const esUtil = await checkUtil(idItemNorm, areaOrigenNorm);
    if (esUtil) continue;
    throw {
      status: 400,
      message: `El elemento "${rawIdItem}" no existe como Activo Fijo con área origen "${idAreaOrigen}" ni como Útil con un detalle en esa área.`
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
async function crearMensajesParaUsuarios(creadorId, receptoresIds, id_solicitud, descripcion, tipo = 'Traslado', transaction) {
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
// Obtener traslado con todas las relaciones
// ------------------------------------------------------------
async function getTrasladoWithRelations(id_solicitud) {
  const traslado = await Traslado.findByPk(id_solicitud, {
    include: [
      { model: Solicitud, as: 'solicitud', required: true },
      { model: TrasladoDetalle, as: 'detalles', required: false }
    ]
  });
  if (!traslado) return null;

  const usuarios = await getUsuariosBySolicitud(id_solicitud);
  return {
    ...traslado.toJSON(),
    usuarios,
    solicitud: traslado.solicitud,
    detalles: traslado.detalles
  };
}

// ------------------------------------------------------------
// CREATE TRASLADO
// ------------------------------------------------------------
async function createTraslado(data) {
  const { solicitud, traslado, usuarios_ids, lista_activos, usuario_creador } = data;

  if (!solicitud || !traslado || !usuarios_ids || !lista_activos || !usuario_creador) {
    throw { status: 400, message: 'Faltan datos requeridos (solicitud, traslado, usuarios_ids, lista_activos, usuario_creador)' };
  }

  const solicitudNormalizada = validarDatosSolicitud(solicitud);
  if (!Array.isArray(usuarios_ids) || usuarios_ids.length === 0) {
    throw { status: 400, message: 'usuarios_ids debe ser un array no vacío' };
  }
  if (!Array.isArray(lista_activos) || lista_activos.length === 0) {
    throw { status: 400, message: 'lista_activos debe ser un array no vacío' };
  }
  if (!usuarios_ids.includes(usuario_creador)) {
    throw { status: 400, message: 'El usuario_creador debe estar incluido en usuarios_ids' };
  }
  if (!solicitud.tipo_traslado) throw { status: 400, message: 'tipo_traslado es obligatorio' };

  const idAreaOrigen = traslado.id_AreaResponsabilidad_origen ? traslado.id_AreaResponsabilidad_origen.trim() : null;
  const idAreaDestino = traslado.id_AreaResponsabilidad_destino ? traslado.id_AreaResponsabilidad_destino.trim() : null;
  if (!idAreaOrigen || !idAreaDestino) {
    throw { status: 400, message: 'Áreas de origen y destino son obligatorias' };
  }

  const origenOk = await areaExists(idAreaOrigen);
  const destinoOk = await areaExists(idAreaDestino);
  if (!origenOk || !destinoOk) {
    throw { status: 400, message: 'Una o ambas áreas no existen en el catálogo de Assets' };
  }

  const usuariosExistentes = await Usuario.findAll({ where: { id_usuario: usuarios_ids } });
  if (usuariosExistentes.length !== usuarios_ids.length) {
    throw { status: 400, message: 'Uno o más usuarios no existen en el sistema' };
  }

  await validarListaActivos(lista_activos, idAreaOrigen);

  const activosInfo = [];
  for (const rawIdItem of lista_activos) {
    const nombre = await getNombreActivo(rawIdItem);
    activosInfo.push({ id: rawIdItem.trim(), nombre });
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

    await Traslado.create({
      id_solicitud: nuevaSolicitud.id_solicitud,
      id_AreaResponsabilidad_origen: idAreaOrigen,
      id_AreaResponsabilidad_destino: idAreaDestino
    }, { transaction });

    const usuariosData = usuarios_ids.map(id_usuario => ({
      id_solicitud: nuevaSolicitud.id_solicitud,
      id_usuario
    }));
    await SolicitudUsuario.bulkCreate(usuariosData, { transaction });

    const detallesData = lista_activos.map(rawIdActivo => ({
      id_traslado: nuevaSolicitud.id_solicitud,
      id_activoFijo_o_util: rawIdActivo.trim()
    }));
    await TrasladoDetalle.bulkCreate(detallesData, { transaction });

    const listaNombres = activosInfo.map(a => `${a.nombre} (${a.id})`).join(', ');
    const descripcionMensaje = `Se solicitó un traslado de los siguientes AFT/Útiles: ${listaNombres} desde el área origen: ${idAreaOrigen} hacia el área destino: ${idAreaDestino}`;
    await crearMensajesParaUsuarios(usuario_creador, usuarios_ids, nuevaSolicitud.id_solicitud, descripcionMensaje, 'Traslado', transaction);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw { status: 500, message: error.message };
  }

  return await getTrasladoWithRelations(nuevaSolicitud.id_solicitud);
}

// ------------------------------------------------------------
// UPDATE TRASLADO
// ------------------------------------------------------------
async function updateTraslado(id, data) {
  const { solicitud, traslado, usuarios_ids, lista_activos, usuario_creador } = data;

  const solicitudNormalizada = solicitud ? validarDatosSolicitud(solicitud) : null;

  const existing = await Traslado.findByPk(id);
  if (!existing) throw { status: 404, message: 'Traslado no encontrado' };

  // Intentar obtener el creador desde los mensajes; si no existe, usar el usuario_creador proporcionado
  let creadorOriginal = await getCreadorFromSolicitud(id);
  if (!creadorOriginal) {
    if (usuario_creador) {
      creadorOriginal = usuario_creador;
    } else {
      throw { status: 400, message: 'No se pudo determinar el creador de la solicitud. Proporcione usuario_creador en el body.' };
    }
  }

  let idAreaOrigen = existing.id_AreaResponsabilidad_origen;
  if (traslado && traslado.id_AreaResponsabilidad_origen) {
    idAreaOrigen = traslado.id_AreaResponsabilidad_origen.trim();
  } else {
    idAreaOrigen = idAreaOrigen ? idAreaOrigen.trim() : null;
  }

  const transaction = await sequelize.transaction();

  try {
    if (solicitudNormalizada) {
      await Solicitud.update(solicitudNormalizada, { where: { id_solicitud: id }, transaction });
    }

    if (traslado) {
      let newOrigen = traslado.id_AreaResponsabilidad_origen ? traslado.id_AreaResponsabilidad_origen.trim() : null;
      let newDestino = traslado.id_AreaResponsabilidad_destino ? traslado.id_AreaResponsabilidad_destino.trim() : null;

      if (newOrigen && newOrigen !== existing.id_AreaResponsabilidad_origen.trim()) {
        const ok = await areaExists(newOrigen);
        if (!ok) throw { status: 400, message: 'Área origen no existe en Assets' };
        traslado.id_AreaResponsabilidad_origen = newOrigen;
      }
      if (newDestino && newDestino !== existing.id_AreaResponsabilidad_destino.trim()) {
        const ok = await areaExists(newDestino);
        if (!ok) throw { status: 400, message: 'Área destino no existe en Assets' };
        traslado.id_AreaResponsabilidad_destino = newDestino;
      }
      await Traslado.update(traslado, { where: { id_solicitud: id }, transaction });
      if (newOrigen) idAreaOrigen = newOrigen;
    }

    let nuevosUsuariosIds = null;
    if (usuarios_ids) {
      if (!Array.isArray(usuarios_ids)) throw { status: 400, message: 'usuarios_ids debe ser un array' };
      const usuariosExistentes = await Usuario.findAll({ where: { id_usuario: usuarios_ids } });
      if (usuariosExistentes.length !== usuarios_ids.length) {
        throw { status: 400, message: 'Uno o más usuarios_ids no existen' };
      }
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
      const areaOrigenActual = idAreaOrigen ? idAreaOrigen.trim() : null;
      if (!areaOrigenActual) throw { status: 400, message: 'No se puede validar activos sin área origen' };
      await validarListaActivos(lista_activos, areaOrigenActual);
      await TrasladoDetalle.destroy({ where: { id_traslado: id }, transaction });
      if (lista_activos.length > 0) {
        const nuevosDetalles = lista_activos.map(rawIdActivo => ({
          id_traslado: id,
          id_activoFijo_o_util: rawIdActivo.trim()
        }));
        await TrasladoDetalle.bulkCreate(nuevosDetalles, { transaction });
      }
    }

    if (nuevosUsuariosIds && nuevosUsuariosIds.length > 0) {
      const descripcion = `La solicitud de traslado ha sido modificada. Por favor revise los nuevos datos.`;
      await crearMensajesParaUsuarios(creadorOriginal, nuevosUsuariosIds, id, descripcion, 'Traslado', transaction);
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw { status: error.status || 500, message: error.message };
  }

  return await getTrasladoWithRelations(id);
}

// ------------------------------------------------------------
// DELETE TRASLADO
// ------------------------------------------------------------
async function deleteTraslado(id) {
  const solicitud = await Solicitud.findByPk(id);
  if (!solicitud) throw { status: 404, message: 'Traslado no encontrado' };
  if (solicitud.estado === 'Completada') {
    throw { status: 400, message: 'No se puede eliminar una solicitud de traslado que está completada.' };
  }

  const usuariosAsociados = await getUsuariosBySolicitud(id);
  const usuariosIds = Array.isArray(usuariosAsociados) ? usuariosAsociados.map(u => u.id_usuario) : [];
  const creadorOriginal = await getCreadorFromSolicitud(id);

  const transaction = await sequelize.transaction();
  try {
    if (creadorOriginal && usuariosIds.length > 0) {
      const descripcion = `La solicitud de traslado ha sido eliminada.`;
      await crearMensajesParaUsuarios(creadorOriginal, usuariosIds, id, descripcion, 'Traslado', transaction);
    }
    await TrasladoDetalle.destroy({ where: { id_traslado: id }, transaction });
    await SolicitudUsuario.destroy({ where: { id_solicitud: id }, transaction });
    await Traslado.destroy({ where: { id_solicitud: id }, transaction });
    const deleted = await Solicitud.destroy({ where: { id_solicitud: id }, transaction });
    if (deleted === 0) throw { status: 404, message: 'Traslado no encontrado' };
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw { status: error.status || 500, message: error.message };
  }
}

// ------------------------------------------------------------
// GET BY ID
// ------------------------------------------------------------
async function getTrasladoById(id) {
  return getTrasladoWithRelations(id);
}

// ------------------------------------------------------------
// FILTRAR TRASLADOS
// ------------------------------------------------------------
async function filtrarTraslados(filtros, page, limit) {
  const orConditions = [];

  // Filtros normales (sin cambios)
  if (filtros.nota) {
    orConditions.push({ '$solicitud.nota$': { [Op.iLike]: `%${filtros.nota}%` } });
  }
  if (filtros.estado) {
    orConditions.push({ '$solicitud.estado$': filtros.estado });
  }
  if (filtros.tipo_traslado) {
    orConditions.push({ '$solicitud.tipo_traslado$': filtros.tipo_traslado });
  }
  if (filtros.tipo_movimiento) {
    if (!tiposMovimientoSolicitud.includes(filtros.tipo_movimiento)) {
      throw { status: 400, message: `tipo_movimiento inválido. Debe ser uno de: ${tiposMovimientoSolicitud.join(', ')}` };
    }
    orConditions.push({ '$solicitud.tipo_movimiento$': filtros.tipo_movimiento });
  }
  if (filtros.fundamentacion) {
    orConditions.push({ '$solicitud.fundamentacion$': { [Op.iLike]: `%${filtros.fundamentacion}%` } });
  }
  // Rango de fecha de creación
  if (filtros.fecha_hora_creacion_desde || filtros.fecha_hora_creacion_hasta) {
    const fechaCondition = {};
    if (filtros.fecha_hora_creacion_desde) fechaCondition[Op.gte] = new Date(filtros.fecha_hora_creacion_desde);
    if (filtros.fecha_hora_creacion_hasta) fechaCondition[Op.lte] = new Date(filtros.fecha_hora_creacion_hasta);
    orConditions.push({ '$solicitud.fecha_hora_creacion$': fechaCondition });
  }
  // Rango de fecha de cierre
  if (filtros.fecha_hora_cierreSolicitud_desde || filtros.fecha_hora_cierreSolicitud_hasta) {
    const cierreCondition = {};
    if (filtros.fecha_hora_cierreSolicitud_desde) cierreCondition[Op.gte] = new Date(filtros.fecha_hora_cierreSolicitud_desde);
    if (filtros.fecha_hora_cierreSolicitud_hasta) cierreCondition[Op.lte] = new Date(filtros.fecha_hora_cierreSolicitud_hasta);
    orConditions.push({ '$solicitud.fecha_hora_cierreSolicitud$': cierreCondition });
  }
  if (filtros.id_AreaResponsabilidad_origen) {
    orConditions.push({ id_AreaResponsabilidad_origen: filtros.id_AreaResponsabilidad_origen });
  }
  if (filtros.id_AreaResponsabilidad_destino) {
    orConditions.push({ id_AreaResponsabilidad_destino: filtros.id_AreaResponsabilidad_destino });
  }

  // NUEVO FILTRO POR USUARIO usando subconsulta EXISTS (evita problemas de alias)
  if (filtros.id_usuario) {
    const userId = parseInt(filtros.id_usuario);
    orConditions.push(sequelize.literal(
      `EXISTS (SELECT 1 FROM solicitud_usuario WHERE solicitud_usuario.id_solicitud = solicitud.id_solicitud AND solicitud_usuario.id_usuario = ${userId})`
    ));
  }

  const offset = (page - 1) * limit;
  const mainWhere = orConditions.length > 0 ? { [Op.or]: orConditions } : {};

  const { count, rows } = await Traslado.findAndCountAll({
    where: mainWhere,
    include: [
      {
        model: Solicitud,
        as: 'solicitud',
        required: true,
        include: [
          { model: Usuario, through: { attributes: [] }, required: false }
        ]
      },
      { model: TrasladoDetalle, as: 'detalles', required: false }
    ],
    distinct: true,
    offset,
    limit,
    order: [['id_solicitud', 'DESC']]
  });

  const trasladosConUsuarios = rows.map(traslado => {
    const usuarios = traslado.solicitud?.Usuarios ?? [];
    const trasladoObj = traslado.toJSON();
    if (trasladoObj.solicitud) delete trasladoObj.solicitud.Usuarios;
    return { ...trasladoObj, usuarios };
  });

  return {
    total: count,
    pagina: page,
    totalPaginas: Math.ceil(count / limit),
    datos: trasladosConUsuarios
  };
}

module.exports = {
  createTraslado,
  updateTraslado,
  getTrasladoById,
  deleteTraslado,
  filtrarTraslados
};