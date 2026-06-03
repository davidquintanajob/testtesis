const solicitudService = require('../services/solicitudService');

const filtrarSolicitudes = async (req, res) => {
  try {
    // Obtener page y limit de los parámetros de la ruta
    let page = parseInt(req.params.page);
    let limit = parseInt(req.params.limit);

    // Validaciones básicas
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100; // límite máximo opcional

    // Los filtros vienen del body
    const filtros = req.body || {};

    const resultado = await solicitudService.filtrarSolicitudes(filtros, page, limit);
    
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en solicitudController.filtrarSolicitudes:', error);
    res.status(error.status || 500).json({ 
      error: error.message || 'Error al filtrar solicitudes',
      details: error.errors || error.toString()
    });
  }
};

module.exports = {
  filtrarSolicitudes
};