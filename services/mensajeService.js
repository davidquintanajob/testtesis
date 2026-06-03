const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const sequelize = require('../helpers/database');
const { Mensaje } = require('../models/mensaje');
const { Documento } = require('../models/documento');
const { Solicitud } = require('../models/solicitud');
const { Usuario } = require('../models/usuario');

const FOTOS_FOLDER = path.join(__dirname, '../fotos');
const DOCUMENTOS_FOLDER = path.join(FOTOS_FOLDER, 'documentos');

const ensureDocumentosFolder = () => {
  fs.mkdirSync(FOTOS_FOLDER, { recursive: true });
  fs.mkdirSync(DOCUMENTOS_FOLDER, { recursive: true });
};

const getDocumentPhysicalPath = (direccion) => {
  const relativePath = direccion.replace(/^\/+/, '');
  return path.resolve(__dirname, '..', relativePath);
};

const getDocumentRoute = (idDocumento, extension) => `/fotos/documentos/${idDocumento}.${extension}`;

const resolveExtensionFromNombre = (nombre) => {
  if (!nombre) return null;
  const match = String(nombre).match(/\.([A-Za-z0-9]+)$/);
  return match ? match[1].toLowerCase() : null;
};

const parseBase64Document = (base64String) => {
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    const mimeType = matches[1];
    const extension = mimeType.split('/')[1] || 'bin';
    return { dataBuffer: Buffer.from(matches[2], 'base64'), extension };
  }

  return { dataBuffer: Buffer.from(base64String, 'base64'), extension: 'bin' };
};

const getNextDocumentId = async (transaction) => {
  const maxId = await Documento.max('id_documento', { transaction });
  return (maxId || 0) + 1;
};

const guardarDocumentoBase64 = async (doc, nextId) => {
  if (typeof doc.contenido !== 'string' || !doc.contenido) {
    throw new Error('Cada documento requiere "contenido" en base64');
  }

  ensureDocumentosFolder();
  const { dataBuffer, extension: extensionMime } = parseBase64Document(doc.contenido);
  const extension = extensionMime !== 'bin'
    ? extensionMime
    : resolveExtensionFromNombre(doc.nombre) || 'bin';

  const filePath = path.join(DOCUMENTOS_FOLDER, `${nextId}.${extension}`);
  fs.writeFileSync(filePath, dataBuffer);

  return {
    filePath,
    direccion: getDocumentRoute(nextId, extension)
  };
};

const eliminarArchivoPorDireccion = (direccion) => {
  const filePath = getDocumentPhysicalPath(direccion);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Includes comunes para enriquecer respuestas
const defaultIncludes = [
  {
    model: Solicitud,
    as: 'solicitud',
    attributes: ['id_solicitud', 'nota', 'estado', 'tipo_traslado', 'fecha_hora_creacion', 'fecha_hora_cierreSolicitud']
  },
  {
    model: Usuario,
    as: 'remitente',
    attributes: ['id_usuario', 'rol', 'id_usuario_LDAP', 'id_AreaResponsabilidad', 'activo']
  },
  {
    model: Usuario,
    as: 'destinatario',
    attributes: ['id_usuario', 'rol', 'id_usuario_LDAP', 'id_AreaResponsabilidad', 'activo']
  },
  {
    model: Documento,
    as: 'documentos',
    attributes: ['id_documento', 'direccion']
  }
];

// Obtener mensajes con filtros simples (sin paginación)
const getMensajes = async (filtros = {}) => {
  try {
    const where = {};
    if (filtros.tipo) where.tipo = filtros.tipo;
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.id_solicitud) where.id_solicitud = filtros.id_solicitud;
    if (filtros.id_usuario) where.id_usuario = filtros.id_usuario;
    if (filtros.id_usuario_receptor) where.id_usuario_receptor = filtros.id_usuario_receptor;
    if (filtros.fecha_desde || filtros.fecha_hasta) {
      where.fecha_hora = {};
      if (filtros.fecha_desde) where.fecha_hora[Op.gte] = new Date(filtros.fecha_desde);
      if (filtros.fecha_hasta) where.fecha_hora[Op.lte] = new Date(filtros.fecha_hasta);
    }

    const mensajes = await Mensaje.findAll({
      where,
      include: defaultIncludes,
      order: [['fecha_hora', 'DESC']]
    });
    return mensajes;
  } catch (error) {
    console.error(error);
    const err = new Error(error.message || 'Error al obtener mensajes');
    err.status = 500;
    throw err;
  }
};

// Obtener mensajes por ID de usuario receptor
const getMensajesByUsuario = async (idUsuario) => {
  try {
    const mensajes = await Mensaje.findAll({
      where: {
        [Op.or]: [
          { id_usuario_receptor: idUsuario },
          { id_usuario: idUsuario }
        ]
      },
      include: defaultIncludes,
      order: [['fecha_hora', 'DESC']]
    });
    return mensajes;
  } catch (error) {
    console.error(error);
    const err = new Error(error.message || 'Error al obtener mensajes del usuario');
    err.status = 500;
    throw err;
  }
};

const marcarMensajesComoVistos = async (idUsuario) => {
  try {
    const [actualizados] = await Mensaje.update(
      { estado: 'visto' },
      {
        where: {
          [Op.or]: [
            { id_usuario_receptor: idUsuario },
            { id_usuario: idUsuario }
          ],
          estado: { [Op.ne]: 'visto' }
        }
      }
    );

    return {
      id_usuario_receptor: Number(idUsuario),
      actualizados: Number(actualizados || 0)
    };
  } catch (error) {
    console.error(error);
    const err = new Error(error.message || 'Error al marcar mensajes como vistos');
    err.status = 500;
    throw err;
  }
};

// Obtener un mensaje por ID
const getMensajeById = async (id) => {
  try {
    return await Mensaje.findByPk(id, { include: defaultIncludes });
  } catch (error) {
    console.error(error);
    const err = new Error(error.message || 'Error al obtener mensaje');
    err.status = 500;
    throw err;
  }
};

// Crear mensaje con documentos en transacción
const createMensaje = async (data) => {
  const transaction = await sequelize.transaction();
  const createdFiles = [];

  try {
    const mensaje = await Mensaje.create({
      fecha_hora: data.fecha_hora,
      tipo: data.tipo,
      descripcion: data.descripcion,
      estado: data.estado,
      id_usuario: data.id_usuario,
      id_usuario_receptor: data.id_usuario_receptor,
      id_solicitud: data.id_solicitud ?? null
    }, { transaction });

    if (data.documentos && data.documentos.length) {
      const nextDocumentId = await getNextDocumentId(transaction);

      for (let index = 0; index < data.documentos.length; index += 1) {
        const doc = data.documentos[index];
        const idDocumento = nextDocumentId + index;
        const { filePath, direccion } = await guardarDocumentoBase64(doc, idDocumento);

        createdFiles.push(filePath);
        await Documento.create({
          id_documento: idDocumento,
          direccion,
          id_mensaje: mensaje.id_mensaje
        }, { transaction });
      }
    }

    await transaction.commit();
    return await getMensajeById(mensaje.id_mensaje);
  } catch (error) {
    for (const filePath of createdFiles) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await transaction.rollback();
    console.error(error);
    error.status = error.status || 500;
    throw error;
  }
};

// Actualizar mensaje (y opcionalmente reemplazar documentos)
const updateMensaje = async (id, updates) => {
  const transaction = await sequelize.transaction();
  const createdFiles = [];

  try {
    const mensaje = await Mensaje.findByPk(id, { transaction });
    if (!mensaje) {
      await transaction.rollback();
      return null;
    }

    const { documentos, ...camposMensaje } = updates;
    if (Object.keys(camposMensaje).length > 0) {
      await mensaje.update(camposMensaje, { transaction });
    }

    // Si se envía 'documentos' (aunque sea array vacío), se reemplazan todos
    if (documentos !== undefined) {
      const viejosDocs = await Documento.findAll({ where: { id_mensaje: id }, transaction });
      const nextDocumentId = await getNextDocumentId(transaction);

      for (let index = 0; index < documentos.length; index += 1) {
        const doc = documentos[index];
        const idDocumento = nextDocumentId + index;
        const { filePath, direccion } = await guardarDocumentoBase64(doc, idDocumento);

        createdFiles.push(filePath);
        await Documento.create({
          id_documento: idDocumento,
          direccion,
          id_mensaje: mensaje.id_mensaje
        }, { transaction });
      }

      for (const doc of viejosDocs) {
        eliminarArchivoPorDireccion(doc.direccion);
        await doc.destroy({ transaction });
      }
    }

    await transaction.commit();
    return await getMensajeById(id);
  } catch (error) {
    for (const filePath of createdFiles) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await transaction.rollback();
    console.error(error);
    error.status = error.status || 500;
    throw error;
  }
};

// Eliminar mensaje (borrado físico, también documentos asociados)
const deleteMensaje = async (id) => {
  const transaction = await sequelize.transaction();
  try {
    const mensaje = await Mensaje.findByPk(id, { transaction });
    if (!mensaje) {
      await transaction.rollback();
      return false;
    }

    const documentos = await Documento.findAll({ where: { id_mensaje: id }, transaction });
    for (const doc of documentos) {
      eliminarArchivoPorDireccion(doc.direccion);
      await doc.destroy({ transaction });
    }

    await mensaje.destroy({ transaction });
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    const err = new Error(error.message || 'Error al eliminar mensaje');
    err.status = 500;
    throw err;
  }
};

// Filtrar mensajes con paginación (POST /mensajes/filtrar/:page/:limit)
const filtrarMensajes = async (filtros, page, limit) => {
  try {
    const where = {};

    if (filtros.tipo) where.tipo = filtros.tipo;
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.id_solicitud) where.id_solicitud = filtros.id_solicitud;
    if (filtros.id_usuario) where.id_usuario = filtros.id_usuario;
    if (filtros.id_usuario_receptor) where.id_usuario_receptor = filtros.id_usuario_receptor;
    if (filtros.fecha_desde || filtros.fecha_hasta) {
      where.fecha_hora = {};
      if (filtros.fecha_desde) where.fecha_hora[Op.gte] = new Date(filtros.fecha_desde);
      if (filtros.fecha_hasta) where.fecha_hora[Op.lte] = new Date(filtros.fecha_hasta);
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Mensaje.findAndCountAll({
      where,
      include: defaultIncludes,
      distinct: true,
      offset,
      limit,
      order: [['fecha_hora', 'DESC']]
    });

    return {
      total: count,
      pagina: page,
      totalPaginas: Math.ceil(count / limit),
      datos: rows
    };
  } catch (error) {
    console.error(error);
    const err = new Error(error.message || 'Error al filtrar mensajes');
    err.status = 500;
    throw err;
  }
};

module.exports = {
  getMensajes,
  getMensajesByUsuario,
  marcarMensajesComoVistos,
  getMensajeById,
  createMensaje,
  updateMensaje,
  deleteMensaje,
  filtrarMensajes
};