const revisionService = require('../services/revisionService');

const createRevision = async (req, res) => {
  try {
    const result = await revisionService.createRevision(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

const updateRevision = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await revisionService.updateRevision(id, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

const getRevisionById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const revision = await revisionService.getRevisionById(id);
    if (!revision) return res.status(404).json({ error: 'Revisión no encontrada' });
    res.status(200).json(revision);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteRevision = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await revisionService.deleteRevision(id);
    res.status(200).json({ mensaje: 'Revisión eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

const filtrarRevisiones = async (req, res) => {
  try {
    let page = parseInt(req.params.page);
    let limit = parseInt(req.params.limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const filtros = req.body || {};
    const resultado = await revisionService.filtrarRevisiones(filtros, page, limit);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRevision,
  updateRevision,
  getRevisionById,
  deleteRevision,
  filtrarRevisiones
};