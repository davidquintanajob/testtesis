const mensajeService = require('../services/mensajeService');
const { tipos, estados } = require('../models/mensaje');

const validarTipo = (tipo) => {
  if (tipo && !tipos.includes(tipo)) {
    throw new Error(`Tipo inválido. Debe ser uno de: ${tipos.join(', ')}`);
  }
};

const validarEstado = (estado) => {
  if (estado && !estados.includes(estado)) {
    throw new Error(`Estado inválido. Debe ser uno de: ${estados.join(', ')}`);
  }
};

const getMensajes = async (req, res) => {
  try {
    const filtros = req.query;
    const mensajes = await mensajeService.getMensajes(filtros);
    res.status(200).json(mensajes);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

const getMensajesByUsuario = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const mensajes = await mensajeService.getMensajesByUsuario(idUsuario);
    res.status(200).json(mensajes);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

const marcarMensajesComoVistos = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const resultado = await mensajeService.marcarMensajesComoVistos(idUsuario);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

const getMensajeById = async (req, res) => {
  try {
    const { id } = req.params;
    const mensaje = await mensajeService.getMensajeById(id);
    if (!mensaje) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.status(200).json(mensaje);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

const createMensaje = async (req, res) => {
  try {
    const {
      fecha_hora,
      tipo,
      descripcion,
      estado,
      id_usuario,
      id_usuario_receptor,
      id_solicitud,
      documentos
    } = req.body;

    const errors = [];

    if (!id_usuario) errors.push('id_usuario es obligatorio');
    if (!id_usuario_receptor) errors.push('id_usuario_receptor es obligatorio');
    if (!tipo) errors.push('tipo es obligatorio');
    else try { validarTipo(tipo); } catch (e) { errors.push(e.message); }
    if (!estado) errors.push('estado es obligatorio');
    else try { validarEstado(estado); } catch (e) { errors.push(e.message); }

    let parsedFecha = fecha_hora ? new Date(fecha_hora) : new Date();
    if (fecha_hora && isNaN(parsedFecha.getTime())) errors.push('fecha_hora inválida');

    if (documentos && !Array.isArray(documentos)) errors.push('documentos debe ser un array');

    if (errors.length) return res.status(400).json({ errors });

    const nuevoMensaje = await mensajeService.createMensaje({
      fecha_hora: parsedFecha,
      tipo,
      descripcion: descripcion || '',
      estado,
      id_usuario,
      id_usuario_receptor,
      id_solicitud: id_solicitud ?? null,
      documentos: documentos || []
    });

    res.status(201).json(nuevoMensaje);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

const updateMensaje = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const errors = [];

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Debe enviar al menos un campo' });
    }

    if (updates.tipo) try { validarTipo(updates.tipo); } catch (e) { errors.push(e.message); }
    if (updates.estado) try { validarEstado(updates.estado); } catch (e) { errors.push(e.message); }
    if (updates.fecha_hora) {
      const parsed = new Date(updates.fecha_hora);
      if (isNaN(parsed.getTime())) errors.push('fecha_hora inválida');
      else updates.fecha_hora = parsed;
    }
    if (updates.documentos && !Array.isArray(updates.documentos)) errors.push('documentos debe ser un array');

    if (errors.length) return res.status(400).json({ errors });

    const actualizado = await mensajeService.updateMensaje(id, updates);
    if (!actualizado) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.status(200).json(actualizado);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

const deleteMensaje = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await mensajeService.deleteMensaje(id);
    if (!eliminado) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.status(200).json({ mensaje: 'Mensaje eliminado correctamente' });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

const filtrarMensajes = async (req, res) => {
  try {
    let page = parseInt(req.params.page);
    let limit = parseInt(req.params.limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;
    
    const filtros = req.body || {};
    const resultado = await mensajeService.filtrarMensajes(filtros, page, limit);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
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