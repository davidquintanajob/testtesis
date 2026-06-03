/* global process */
const sql = require('mssql');
require('dotenv').config();

// Configuración de conexión a SQL Server (solo lectura)
const assetsConfig = {
  server: process.env.DB_HOST_ASSETS,
  port: parseInt(process.env.DB_PORT_ASSETS) || 1433,
  user: process.env.DB_USER_ASSETS,
  password: process.env.DB_PASSWORD_ASSETS,
  database: process.env.DB_NAME_ASSETS,
  options: {
    encrypt: false,          // Cambia a true si tu servidor requiere SSL
    trustServerCertificate: true,  // Para certificados autofirmados
    enableArithAbort: true,
  },
  connectionTimeout: 15000,
  requestTimeout: 15000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Crear el pool de conexiones (reutilizable)
const poolPromise = new sql.ConnectionPool(assetsConfig)
  .connect()
  .then(pool => {
    console.log('✅ Conexión a SQL Server (Assets) establecida correctamente');
    return pool;
  })
  .catch(err => {
    console.error('❌ Error al conectar a SQL Server (Assets):', err.message);
    throw err;
  });

/**
 * Ejecuta una consulta SQL de solo lectura (SELECT)
 * @param {string} query - Consulta SQL (solo SELECT o WITH)
 * @param {object} params - Parámetros opcionales para evitar inyección SQL
 * @returns {Promise<Array>} - Resultados de la consulta
 */
async function executeReadOnlyQuery(query, params = {}) {
  const trimmed = query.trim().toUpperCase();
  if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('WITH')) {
    throw new Error('Solo se permiten consultas SELECT en la base de datos de Assets');
  }

  try {
    const pool = await poolPromise;
    const request = pool.request();

    // Agregar parámetros de forma segura (si se proporcionan)
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }

    const result = await request.query(query);
    return result.recordset; // Devuelve solo los registros
  } catch (error) {
    console.error('Error ejecutando consulta en Assets:', error);
    const err = new Error(`No se pudo establecer conexión con la base de datos de Assets: ${error.message}`);
    err.status = 503;
    throw err;
  }
}

/**
 * Cierra el pool de conexiones (útil al apagar el servidor)
 */
async function closeAssetsConnection() {
  try {
    const pool = await poolPromise;
    await pool.close();
    console.log('🔌 Conexión a Assets cerrada');
  } catch (err) {
    console.error('Error cerrando conexión Assets:', err.message);
  }
}

module.exports = {
  executeReadOnlyQuery,
  closeAssetsConnection,
  sql, // Exportar sql por si se necesita acceso a tipos o transacciones avanzadas
};