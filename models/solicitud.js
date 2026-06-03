const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

// Lista de estados posibles para una solicitud (exportable)
const estadosSolicitud = ["Pendiente", "En Proceso", "Aprobada", "Rechazada", "Cancelada", "Completada"];

// Lista de tipos de traslado (exportable)
const tiposTraslado = ["aft", "util"];

const tiposMovimientoSolicitud = [
  "Compra MB Nuevo",
  "Compra MB USO",
  "Traspaso Recibido",
  "Ajuste de inventario alta",
  "Ajuste de Inventario Alta",
  "Pérdida",
  "Traspaso Efectuado",
  "Préstamo temporal al trabajador",
  "Baja",
  "Traslado interno",
  "Ajuste de Inv",
  "Activo Ocioso",
  "Enviado a reparar",
  "Otro",
  "Préstamo fuera de la Entidad",
  "Venta",
  "Retiro"
];

const Solicitud = sequelize.define("solicitud", {
  id_solicitud: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nota: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "Nota adicional sobre la solicitud (opcional)"
  },
  tipo_movimiento: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: {
        args: [tiposMovimientoSolicitud],
        msg: `tipo_movimiento debe ser uno de: ${tiposMovimientoSolicitud.join(", ")}`
      }
    },
    comment: "Tipo de movimiento asociado a la solicitud"
  },
  fundamentacion: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Fundamentación del movimiento asociado a la solicitud"
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pendiente",
    validate: {
      isIn: {
        args: [estadosSolicitud],
        msg: `El estado debe ser uno de: ${estadosSolicitud.join(", ")}`
      }
    }
  },
  tipo_traslado: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [tiposTraslado],
        msg: `El tipo de traslado debe ser "aft" o "util"`
      }
    }
  },
  fecha_hora_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: "Fecha y hora de creación de la solicitud"
  },
  fecha_hora_cierreSolicitud: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: "Fecha y hora de cierre de la solicitud (si aplica)"
  }
}, {
  timestamps: true,
});

Solicitud.associate = function(models) {
  Solicitud.belongsToMany(models.Usuario, { through: models.SolicitudUsuario, foreignKey: 'id_solicitud', otherKey: 'id_usuario' });
  Solicitud.hasMany(models.Mensaje, { foreignKey: 'id_solicitud' });
  Solicitud.hasOne(models.Traslado, { foreignKey: 'id_solicitud' });
  Solicitud.hasOne(models.Baja, { foreignKey: 'id_solicitud' });
  Solicitud.hasOne(models.Revision, { foreignKey: 'id_solicitud' });
};

module.exports = { Solicitud, estadosSolicitud, tiposTraslado, tiposMovimientoSolicitud };