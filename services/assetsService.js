const { executeReadOnlyQuery } = require('../helpers/databaseAssets');

const wrapAssetsError = (error, defaultMessage) => {
  const err = error instanceof Error ? error : new Error(String(error));
  err.message = err.message || defaultMessage;
  err.status = err.status || 500;
  throw err;
};

// ------------------------------------------------------------
// Helper para construir WHERE y parámetros (reutilizable)
// ------------------------------------------------------------
const buildWhereClauseActivo = (filtros) => {
  const whereClauses = [];
  const params = {};

  if (filtros.Id_ActivoFijo) {
    whereClauses.push('a.Id_ActivoFijo = @Id_ActivoFijo');
    params.Id_ActivoFijo = filtros.Id_ActivoFijo;
  }
  if (filtros.Desc_ActivoFijo) {
    whereClauses.push('LOWER(a.Desc_ActivoFijo) LIKE LOWER(@Desc_ActivoFijo)');
    params.Desc_ActivoFijo = `%${filtros.Desc_ActivoFijo}%`;
  }
  if (filtros.ID_AreaResp) {
  // Elimina espacios en ambos lados usando LTRIM y RTRIM
  whereClauses.push('LTRIM(RTRIM(a.ID_AreaResp)) = LTRIM(RTRIM(@ID_AreaResp))');
  params.ID_AreaResp = filtros.ID_AreaResp;
}
  if (filtros.Activo !== undefined && filtros.Activo !== null) {
    whereClauses.push('a.Activo = @Activo');
    params.Activo = filtros.Activo ? 1 : 0;
  }
  return { whereClauses, params };
};

// ----------------------------------------------
// 1. Filtrar Activo_Fijo con datos del área (JOIN)
// ----------------------------------------------
const filtrarActivosFijos = async (filtros, page, limit) => {
  try {
    const { whereClauses, params } = buildWhereClauseActivo(filtros);
    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    
    const offset = (page - 1) * limit;
    params.offset = offset;
    params.limit = limit;

    // Consulta principal con JOIN a Areas_Responsabilidad
    const selectQuery = `
      SELECT a.*, 
             ar.Id_Ccosto, 
             ar.Id_AreaResponsabilidad, 
             ar.Desc_AreaResponsabilidad
      FROM Activo_Fijo a
      LEFT JOIN Areas_Responsabilidad ar ON a.ID_AreaResp = ar.Id_AreaResponsabilidad
      ${whereSQL}
      ORDER BY a.Id_ActivoFijo
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM Activo_Fijo a
      ${whereSQL}
    `;
    
    const countResult = await executeReadOnlyQuery(countQuery, params);
    const total = countResult[0]?.total || 0;
    const datos = await executeReadOnlyQuery(selectQuery, params);
    const totalPaginas = Math.ceil(total / limit);

    return { total, pagina: page, totalPaginas, datos };
  } catch (error) {
    console.error('Error filtrando Activo_Fijo:', error);
    wrapAssetsError(error, 'Error al consultar activos fijos');
  }
};

// ----------------------------------------------
// 2. Obtener un Activo_Fijo por ID (con datos del área)
// ----------------------------------------------
const getActivoFijoById = async (id) => {
  try {
    const query = `
      SELECT a.*, 
             ar.Id_Ccosto, 
             ar.Id_AreaResponsabilidad, 
             ar.Desc_AreaResponsabilidad
      FROM Activo_Fijo a
      LEFT JOIN Areas_Responsabilidad ar ON a.ID_AreaResp = ar.Id_AreaResponsabilidad
      WHERE a.Id_ActivoFijo = @id
    `;
    const result = await executeReadOnlyQuery(query, { id });
    return result[0] || null;
  } catch (error) {
    console.error('Error obteniendo Activo_Fijo por ID:', error);
    wrapAssetsError(error, 'Error al consultar el activo fijo');
  }
};

// ------------------------------------------------------------
// Helper para construir WHERE de Areas_Responsabilidad
// ------------------------------------------------------------
const buildWhereClauseArea = (filtros) => {
  const whereClauses = [];
  const params = {};

  if (filtros.Id_Ccosto) {
    whereClauses.push('Id_Ccosto = @Id_Ccosto');
    params.Id_Ccosto = filtros.Id_Ccosto;
  }
  if (filtros.Id_AreaResponsabilidad) {
    whereClauses.push('Id_AreaResponsabilidad = @Id_AreaResponsabilidad');
    params.Id_AreaResponsabilidad = filtros.Id_AreaResponsabilidad;
  }
  if (filtros.Desc_AreaResponsabilidad) {
    whereClauses.push('LOWER(Desc_AreaResponsabilidad) LIKE LOWER(@Desc_AreaResponsabilidad)');
    params.Desc_AreaResponsabilidad = `%${filtros.Desc_AreaResponsabilidad}%`;
  }
  return { whereClauses, params };
};

// ----------------------------------------------
// 3. Filtrar Areas_Responsabilidad (paginado)
// ----------------------------------------------
const filtrarAreas = async (filtros, page, limit) => {
  try {
    const { whereClauses, params } = buildWhereClauseArea(filtros);
    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const offset = (page - 1) * limit;
    params.offset = offset;
    params.limit = limit;

    const selectQuery = `
      SELECT *
      FROM Areas_Responsabilidad
      ${whereSQL}
      ORDER BY Id_AreaResponsabilidad
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM Areas_Responsabilidad
      ${whereSQL}
    `;

    const countResult = await executeReadOnlyQuery(countQuery, params);
    const total = countResult[0]?.total || 0;
    const datos = await executeReadOnlyQuery(selectQuery, params);
    const totalPaginas = Math.ceil(total / limit);

    return { total, pagina: page, totalPaginas, datos };
  } catch (error) {
    console.error('Error filtrando Areas_Responsabilidad:', error);
    wrapAssetsError(error, 'Error al consultar áreas de responsabilidad');
  }
};

// ----------------------------------------------
// 4. Obtener un Área por ID
// ----------------------------------------------
const getAreaById = async (id) => {
  try {
    const query = `
      SELECT *
      FROM Areas_Responsabilidad
      WHERE Id_AreaResponsabilidad = @id
    `;
    const result = await executeReadOnlyQuery(query, { id });
    return result[0] || null;
  } catch (error) {
    console.error('Error obteniendo Área por ID:', error);
    wrapAssetsError(error, 'Error al consultar el área');
  }
};

// ==================== ÚTILES (Util_Tool + Util_Tool_Detalles) ====================

const buildWhereClausesUtiles = (filtros) => {
  const masterClauses = [];
  const detailClauses = [];
  const params = {};

  // Filtros sobre la tabla master (Util_Tool)
  if (filtros.Id_UH) {
    masterClauses.push('ut.Id_UH = @Id_UH');
    params.Id_UH = filtros.Id_UH;
  }
  if (filtros.Desc_UH) {
    masterClauses.push('LOWER(ut.Desc_UH) LIKE LOWER(@Desc_UH)');
    params.Desc_UH = `%${filtros.Desc_UH}%`;
  }
  if (filtros.Activo !== undefined && filtros.Activo !== null) {
    masterClauses.push('ut.Activo = @Activo');
    params.Activo = filtros.Activo ? 1 : 0;
  }

  // Filtros sobre la tabla de detalles (Util_Tool_Detalles)
  if (filtros.Id_Ccosto) {
    detailClauses.push('LTRIM(RTRIM(utd.Id_Ccosto)) = LTRIM(RTRIM(@Id_Ccosto))');
    params.Id_Ccosto = filtros.Id_Ccosto;
  }

  // Unificar campo de área: acepta tanto ID_AreaResp como Id_AreaResponsabilidad
  const areaFilter = filtros.ID_AreaResp || filtros.Id_AreaResponsabilidad;
  if (areaFilter) {
    detailClauses.push('LTRIM(RTRIM(utd.Id_AreaResponsabilidad)) = LTRIM(RTRIM(@areaFilter))');
    params.areaFilter = areaFilter;
  }

  if (filtros.Desc_Ccosto) {
    detailClauses.push('LOWER(utd.Desc_Ccosto) LIKE LOWER(@Desc_Ccosto)');
    params.Desc_Ccosto = `%${filtros.Desc_Ccosto}%`;
  }
  if (filtros.Desc_AreaResponsabilidad) {
    detailClauses.push('LOWER(utd.Desc_AreaResponsabilidad) LIKE LOWER(@Desc_AreaResponsabilidad)');
    params.Desc_AreaResponsabilidad = `%${filtros.Desc_AreaResponsabilidad}%`;
  }
  if (filtros.Desc_Empleado) {
    detailClauses.push('LOWER(utd.Desc_Empleado) LIKE LOWER(@Desc_Empleado)');
    params.Desc_Empleado = `%${filtros.Desc_Empleado}%`;
  }
  if (filtros.Cantidad_desde !== undefined && filtros.Cantidad_desde !== null) {
    detailClauses.push('utd.Cantidad >= @Cantidad_desde');
    params.Cantidad_desde = filtros.Cantidad_desde;
  }
  if (filtros.Cantidad_hasta !== undefined && filtros.Cantidad_hasta !== null) {
    detailClauses.push('utd.Cantidad <= @Cantidad_hasta');
    params.Cantidad_hasta = filtros.Cantidad_hasta;
  }

  return { masterClauses, detailClauses, params };
};

const getPaginatedUtilesIds = async (filtros, page, limit) => {
  const { masterClauses, detailClauses, params } = buildWhereClausesUtiles(filtros);
  let whereSql = '';
  if (masterClauses.length || detailClauses.length) {
    const conditions = [];
    if (masterClauses.length) conditions.push(`(${masterClauses.join(' AND ')})`);
    if (detailClauses.length) conditions.push(`(${detailClauses.join(' AND ')})`);
    whereSql = `WHERE ${conditions.join(' AND ')}`;
  }

  const offset = (page - 1) * limit;
  params.offset = offset;
  params.limit = limit;

  const countQuery = `
    SELECT COUNT(DISTINCT ut.Id_UH) AS total
    FROM Util_Tool ut
    LEFT JOIN Util_Tool_Detalles utd ON ut.Id_UH = utd.Id_UH
    ${whereSql}
  `;
  const countResult = await executeReadOnlyQuery(countQuery, params);
  const total = countResult[0]?.total || 0;
  if (total === 0) return { total, ids: [] };

  const selectIdsQuery = `
    SELECT DISTINCT ut.Id_UH
    FROM Util_Tool ut
    LEFT JOIN Util_Tool_Detalles utd ON ut.Id_UH = utd.Id_UH
    ${whereSql}
    ORDER BY ut.Id_UH
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;
  const idsResult = await executeReadOnlyQuery(selectIdsQuery, params);
  const ids = idsResult.map(row => row.Id_UH);
  return { total, ids };
};

const getUtilesByIds = async (ids) => {
  if (!ids.length) return [];
  const placeholders = ids.map((_, i) => `@id${i}`).join(',');
  const params = {};
  ids.forEach((id, i) => { params[`id${i}`] = id; });
  const query = `
    SELECT *
    FROM Util_Tool
    WHERE Id_UH IN (${placeholders})
    ORDER BY Id_UH
  `;
  return await executeReadOnlyQuery(query, params);
};

const getDetallesByUtilesIds = async (ids) => {
  if (!ids.length) return {};
  const placeholders = ids.map((_, i) => `@id${i}`).join(',');
  const params = {};
  ids.forEach((id, i) => { params[`id${i}`] = id; });
  const query = `
    SELECT *
    FROM Util_Tool_Detalles
    WHERE Id_UH IN (${placeholders})
    ORDER BY Id_UH, Id_Ccosto
  `;
  const rows = await executeReadOnlyQuery(query, params);
  const detallesMap = {};
  rows.forEach(row => {
    const id = row.Id_UH;
    if (!detallesMap[id]) detallesMap[id] = [];
    detallesMap[id].push(row);
  });
  return detallesMap;
};

const filtrarUtiles = async (filtros, page, limit) => {
  try {
    const { total, ids } = await getPaginatedUtilesIds(filtros, page, limit);
    if (total === 0) {
      return { total, pagina: page, totalPaginas: 0, datos: [] };
    }

    const masterData = await getUtilesByIds(ids);
    const detallesMap = await getDetallesByUtilesIds(ids);

    const datos = masterData.map(master => ({
      ...master,
      detalles: detallesMap[master.Id_UH] || []
    }));

    return {
      total,
      pagina: page,
      totalPaginas: Math.ceil(total / limit),
      datos
    };
  } catch (error) {
    console.error('Error filtrando útiles:', error);
    wrapAssetsError(error, 'Error al consultar útiles');
  }
};

const getUtilById = async (id) => {
  try {
    const masterQuery = `SELECT * FROM Util_Tool WHERE Id_UH = @id`;
    const masterResult = await executeReadOnlyQuery(masterQuery, { id });
    if (masterResult.length === 0) return null;
    const master = masterResult[0];

    const detallesQuery = `SELECT * FROM Util_Tool_Detalles WHERE Id_UH = @id`;
    const detalles = await executeReadOnlyQuery(detallesQuery, { id });

    return {
      ...master,
      detalles
    };
  } catch (error) {
    console.error('Error obteniendo útil por ID:', error);
    wrapAssetsError(error, 'Error al consultar el útil');
  }
};

module.exports = {
  filtrarActivosFijos,
  getActivoFijoById,
  filtrarAreas,
  getAreaById,
  filtrarUtiles,   // ← agregar
  getUtilById      // ← agregar
};