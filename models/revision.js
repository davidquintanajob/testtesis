const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const Revision = sequelize.define("revision", {
  id_solicitud: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'solicituds',
      key: 'id_solicitud'
    }
  },
  id_AreaResponsabilidad: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Área de responsabilidad asociada a la revisión"
  }
}, {
  timestamps: true,
});

Revision.associate = function(models) {
  Revision.belongsTo(models.Solicitud, { foreignKey: 'id_solicitud', as: 'solicitud' });
  Revision.hasMany(models.RevisionDetalle, { foreignKey: 'id_revision', as: 'detalles' });
};
module.exports = { Revision };