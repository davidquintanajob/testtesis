/* global process */
const express = require("express");
const cors = require('cors');
const logger = require("./helpers/logger.js");
const sequelize = require("./helpers/database.js");
const { executeReadOnlyQuery, closeAssetsConnection } = require("./helpers/databaseAssets.js");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const http = require('http');
const { initSocket } = require('./helpers/socket.js');
require('dotenv').config();
const path = require('path');

const app = express();

// Middlewares básicos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: process.env.CORS_OPTIONS || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Servir archivos estáticos
app.use('/documentos', express.static(path.join(__dirname, 'documentos')));
app.use('/fotos', express.static(path.join(__dirname, 'fotos')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Logger simplificado
app.use((req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  res.send = function (body) {
    const responseTime = Date.now() - startTime;
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });
    console.log(`${new Date().toISOString()} - ${res.statusCode} - ${req.method} ${req.url}`);
    return originalSend.call(this, body);
  };
  next();
});

// Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Usuarios, Mensajes, Documentos y Solicitudes",
      version: "1.0.0",
      description: "API para gestión de usuarios, mensajería, documentos adjuntos y solicitudes"
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./routes/*.js"]
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  swaggerOptions: { docExpansion: 'none', defaultModelsExpandDepth: -1 }
}));

// Importar modelos
const { Usuario } = require("./models/usuario.js");
const { Mensaje } = require("./models/mensaje.js");
const { Documento } = require("./models/documento.js");
const { Solicitud } = require("./models/solicitud.js");
const { SolicitudUsuario } = require("./models/solicitudUsuario.js");
const { Traslado } = require("./models/traslado.js");
const { TrasladoDetalle } = require("./models/traslado_detalle.js");
const { Baja } = require("./models/baja.js");
const { BajaDetalle } = require("./models/baja_detalle.js");
const { Revision } = require("./models/revision.js");
const { RevisionDetalle } = require("./models/revision_detalle.js");

// Configurar asociaciones
function setupAssociations() {
  if (Usuario.associate) Usuario.associate({ Mensaje, Solicitud, SolicitudUsuario });
  if (Solicitud.associate) Solicitud.associate({ Usuario, Mensaje, SolicitudUsuario, Traslado, Baja, Revision });
  if (Mensaje.associate) Mensaje.associate({ Usuario, Documento, Solicitud });
  if (Documento.associate) Documento.associate({ Mensaje });
  if (Traslado.associate) Traslado.associate({ Solicitud, TrasladoDetalle });
  if (TrasladoDetalle.associate) TrasladoDetalle.associate({ Traslado });
  if (Baja.associate) Baja.associate({ Solicitud, BajaDetalle });
  if (BajaDetalle.associate) BajaDetalle.associate({ Baja });
  if (Revision.associate) Revision.associate({ Solicitud, RevisionDetalle });
  if (RevisionDetalle.associate) RevisionDetalle.associate({ Revision });
}

// Importar rutas
const usuarioRoutes = require('./routes/usuarioRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');
const aftRoutes = require('./routes/assetsRoutes.js');
const ldapRouts = require("./routes/ldapRouts.js");
const trasladoRouts = require("./routes/trasladoRoutes.js");
const bajaRoutes = require('./routes/bajaRoutes');
const revisionRoutes = require('./routes/revisionRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes.js');

app.use('/', usuarioRoutes);
app.use('/', solicitudRoutes);
app.use('/', aftRoutes);
app.use('/', ldapRouts);
app.use('/', trasladoRouts);
app.use('/', bajaRoutes);
app.use('/', revisionRoutes);
app.use('/', mensajeRoutes);

const server = http.createServer(app);
initSocket(server);

// Iniciar servidor
const startApp = async () => {
  try {
    setupAssociations();
    // Sincronizar en orden según dependencias
    await Usuario.sync({ alter: false });
    await Solicitud.sync({ alter: true });
    await SolicitudUsuario.sync({ alter: true });
    await Traslado.sync({ alter: true });
    await TrasladoDetalle.sync({ alter: true });
    await Baja.sync({ alter: true });
    await BajaDetalle.sync({ alter: true });
    await Revision.sync({ alter: true });
    await RevisionDetalle.sync({ alter: true });   // ← Nuevo modelo
    await Mensaje.sync({ alter: true });
    await Documento.sync({ alter: true });
    
    console.log("✅ Todos los modelos sincronizados correctamente (Usuario, Solicitud, SolicitudUsuario, Traslado, TrasladoDetalle, Baja, BajaDetalle, Revision, RevisionDetalle, Mensaje, Documento)");

    // Probar la conexión a SQL Server (Assets)
    try {
      const testQuery = await executeReadOnlyQuery('SELECT 1 AS test');
      console.log('✅ Assets DB (SQL Server) responde correctamente');
    } catch (err) {
      console.warn('⚠️ Assets DB no disponible, verifique configuración y credenciales');
    }

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar:", error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await sequelize.close();
  await closeAssetsConnection(); // Cerrar conexión a Assets
  console.log("🔌 Conexiones cerradas");
  process.exit(0);
});

startApp();

module.exports = app;