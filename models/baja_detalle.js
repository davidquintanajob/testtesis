const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const BajaDetalle = sequelize.define("baja_detalle", {
  id_baja_detalle: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_activoFijo_o_util: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Identificador del activo fijo o útil asociado al detalle de la baja"
  },
  id_baja: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bajas',           // Nombre de la tabla de Baja (por defecto 'bajas')
      key: 'id_solicitud'
    }
  }
}, {
  timestamps: true,
});

BajaDetalle.associate = function(models) {
  BajaDetalle.belongsTo(models.Baja, { foreignKey: 'id_baja', as: 'baja' });
};

module.exports = { BajaDetalle };