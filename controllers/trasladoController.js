const trasladoService = require('../services/trasladoService');

const createTraslado = async (req, res) => {
  try {
    const result = await trasladoService.createTraslado(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

const updateTraslado = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await trasladoService.updateTraslado(id, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

const getTrasladoById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const traslado = await trasladoService.getTrasladoById(id);
    if (!traslado) return res.status(404).json({ error: 'Traslado no encontrado' });
    res.status(200).json(traslado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteTraslado = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await trasladoService.deleteTraslado(id);
    res.status(200).json({ mensaje: 'Traslado eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

const filtrarTraslados = async (req, res) => {
  try {
    let page = parseInt(req.params.page);
    let limit = parseInt(req.params.limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const filtros = req.body || {};
    const resultado = await trasladoService.filtrarTraslados(filtros, page, limit);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTraslado,
  updateTraslado,
  getTrasladoById,
  deleteTraslado,
  filtrarTraslados
};