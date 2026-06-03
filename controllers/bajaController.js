const bajaService = require('../services/bajaService');

const createBaja = async (req, res) => {
  try {
    const result = await bajaService.createBaja(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

const updateBaja = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await bajaService.updateBaja(id, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

const getBajaById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const baja = await bajaService.getBajaById(id);
    if (!baja) return res.status(404).json({ error: 'Baja no encontrada' });
    res.status(200).json(baja);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteBaja = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await bajaService.deleteBaja(id);
    res.status(200).json({ mensaje: 'Baja eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

const filtrarBajas = async (req, res) => {
  try {
    let page = parseInt(req.params.page);
    let limit = parseInt(req.params.limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const filtros = req.body || {};
    const resultado = await bajaService.filtrarBajas(filtros, page, limit);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBaja,
  updateBaja,
  getBajaById,
  deleteBaja,
  filtrarBajas
};