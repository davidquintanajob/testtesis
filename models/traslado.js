const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const Traslado = sequelize.define("traslado", {
  id_solicitud: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'solicituds', // Nombre de la tabla de Solicitud (por defecto 'solicituds')
      key: 'id_solicitud'
    }
  },
  id_AreaResponsabilidad_origen: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Área de responsabilidad de origen"
  },
  id_AreaResponsabilidad_destino: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Área de responsabilidad de destino"
  }
}, {
  timestamps: true, // Opcional, pero útil para saber cuándo se creó/modificó el traslado
});

Traslado.associate = function(models) {
  Traslado.belongsTo(models.Solicitud, { foreignKey: 'id_solicitud', as: 'solicitud' });
  Traslado.hasMany(models.TrasladoDetalle, { foreignKey: 'id_traslado', as: 'detalles' });
};

module.exports = { Traslado };