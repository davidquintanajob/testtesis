const { Solicitud, estadosSolicitud, tiposTraslado, tiposMovimientoSolicitud } = require('../models/solicitud');
const { Traslado } = require('../models/traslado');
const { Baja } = require('../models/baja');
const { Revision } = require('../models/revision');
const { Op } = require('sequelize');

const buildWhereClause = (filtros) => {
  const where = {};

  // Filtro nota (búsqueda insensible a mayúsculas, parcial)
  if (filtros.nota) {
    where.nota = { [Op.iLike]: `%${filtros.nota}%` };
  }

  if (filtros.estado) {
    if (!estadosSolicitud.includes(filtros.estado)) {
      throw new Error(`Estado inválido. Debe ser uno de: ${estadosSolicitud.join(', ')}`);
    }
    where.estado = filtros.estado;
  }

  if (filtros.tipo_traslado) {
    if (!tiposTraslado.includes(filtros.tipo_traslado)) {
      throw new Error(`tipo_traslado inválido. Debe ser 'aft' o 'util'`);
    }
    where.tipo_traslado = filtros.tipo_traslado;
  }

  if (filtros.tipo_movimiento) {
    if (!tiposMovimientoSolicitud.includes(filtros.tipo_movimiento)) {
      throw new Error(`tipo_movimiento inválido. Debe ser uno de: ${tiposMovimientoSolicitud.join(', ')}`);
    }
    where.tipo_movimiento = filtros.tipo_movimiento;
  }

  if (filtros.fundamentacion) {
    where.fundamentacion = { [Op.iLike]: `%${filtros.fundamentacion}%` };
  }

  if (filtros.fecha_hora_creacion_desde || filtros.fecha_hora_creacion_hasta) {
    where.fecha_hora_creacion = {};
    if (filtros.fecha_hora_creacion_desde) {
      where.fecha_hora_creacion[Op.gte] = new Date(filtros.fecha_hora_creacion_desde);
    }
    if (filtros.fecha_hora_creacion_hasta) {
      where.fecha_hora_creacion[Op.lte] = new Date(filtros.fecha_hora_creacion_hasta);
    }
  }

  if (filtros.fecha_hora_cierreSolicitud_desde || filtros.fecha_hora_cierreSolicitud_hasta) {
    where.fecha_hora_cierreSolicitud = {};
    if (filtros.fecha_hora_cierreSolicitud_desde) {
      where.fecha_hora_cierreSolicitud[Op.gte] = new Date(filtros.fecha_hora_cierreSolicitud_desde);
    }
    if (filtros.fecha_hora_cierreSolicitud_hasta) {
      where.fecha_hora_cierreSolicitud[Op.lte] = new Date(filtros.fecha_hora_cierreSolicitud_hasta);
    }
  }

  return where;
};

const filtrarSolicitudes = async (filtros, page, limit) => {
  try {
    const where = buildWhereClause(filtros);
    const offset = (page - 1) * limit;

    const include = [
      { model: Traslado, required: false },
      { model: Baja, required: false },
      { model: Revision, required: false }
    ];

    const { count, rows } = await Solicitud.findAndCountAll({
      where,
      include,
      distinct: true,
      offset,
      limit,
      order: [['fecha_hora_creacion', 'DESC']]
    });

    const totalPaginas = Math.ceil(count / limit);

    return {
      total: count,
      pagina: page,
      totalPaginas,
      datos: rows
    };
  } catch (error) {
    console.error('Error en solicitudService.filtrarSolicitudes:', error);
    const err = new Error(error.message || 'Error al filtrar solicitudes');
    err.status = error.status || 500;
    throw err;
  }
};

module.exports = {
  filtrarSolicitudes
};