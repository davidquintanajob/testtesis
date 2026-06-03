const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const Baja = sequelize.define("baja", {
  id_solicitud: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'solicituds',
      key: 'id_solicitud'
    }
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Motivo de la baja"
  },
  id_AreaResponsabilidad: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Área de responsabilidad asociada a la baja"
  }
}, {
  timestamps: true,
});

Baja.associate = function(models) {
  Baja.belongsTo(models.Solicitud, { foreignKey: 'id_solicitud', as: 'solicitud' });
  Baja.hasMany(models.BajaDetalle, { foreignKey: 'id_baja', as: 'detalles' });
};

module.exports = { Baja };