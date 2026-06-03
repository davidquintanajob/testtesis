const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const TrasladoDetalle = sequelize.define("traslado_detalle", {
  id_traslado_detalle: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_activoFijo_o_util: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Identificador del activo fijo o útil asociado al detalle del traslado"
  },
  id_traslado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'traslados',       // Nombre de la tabla de Traslado
      key: 'id_solicitud'
    }
  }
}, {
  timestamps: true,
});

TrasladoDetalle.associate = function(models) {
  TrasladoDetalle.belongsTo(models.Traslado, { foreignKey: 'id_traslado', as: 'traslado' });
};

module.exports = { TrasladoDetalle };