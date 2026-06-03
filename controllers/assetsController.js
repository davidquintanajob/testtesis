const assetsService = require('../services/assetsService');

const filtrarActivosFijos = async (req, res) => {
  try {
    let page = parseInt(req.params.page);
    let limit = parseInt(req.params.limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const filtros = req.body || {};
    const resultado = await assetsService.filtrarActivosFijos(filtros, page, limit);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

const getActivoFijoById = async (req, res) => {
  try {
    const { id } = req.params;
    const activo = await assetsService.getActivoFijoById(id);
    if (!activo) {
      return res.status(404).json({ error: 'Activo fijo no encontrado' });
    }
    res.status(200).json(activo);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

const filtrarAreas = async (req, res) => {
  try {
    let page = parseInt(req.params.page);
    let limit = parseInt(req.params.limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const filtros = req.body || {};
    const resultado = await assetsService.filtrarAreas(filtros, page, limit);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

const getAreaById = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await assetsService.getAreaById(id);
    if (!area) {
      return res.status(404).json({ error: 'Área de responsabilidad no encontrada' });
    }
    res.status(200).json(area);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

// ==================== NUEVOS CONTROLADORES PARA ÚTILES ====================

const filtrarUtiles = async (req, res) => {
  try {
    let page = parseInt(req.params.page);
    let limit = parseInt(req.params.limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;
    
    const filtros = req.body || {};
    console.log(JSON.stringify(filtros,null,2));
    const resultado = await assetsService.filtrarUtiles(filtros, page, limit);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

const getUtilById = async (req, res) => {
  try {
    const { id } = req.params;
    const util = await assetsService.getUtilById(id);
    if (!util) {
      return res.status(404).json({ error: 'Útil no encontrado' });
    }
    res.status(200).json(util);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

module.exports = {
  filtrarActivosFijos,
  getActivoFijoById,
  filtrarAreas,
  getAreaById,
  filtrarUtiles,
  getUtilById
};