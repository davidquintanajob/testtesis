const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const SolicitudUsuario = sequelize.define("SolicitudUsuario", {
  id_solicitud_usuario: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_solicitud: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'solicituds', key: 'id_solicitud' }
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id_usuario' }
  }
}, {
  timestamps: false, // Opcional: la relación no necesita timestamps
  tableName: 'solicitud_usuario' // Nombre más legible (puedes cambiarlo)
});

SolicitudUsuario.associate = function(models) {
  SolicitudUsuario.belongsTo(models.Solicitud, { foreignKey: 'id_solicitud' });
  SolicitudUsuario.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });
};

module.exports = { SolicitudUsuario };