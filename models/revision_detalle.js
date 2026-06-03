const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const RevisionDetalle = sequelize.define("revision_detalle", {
  id_revision_detalle: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_activoFijo_o_util: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Identificador del activo fijo o útil asociado al detalle de la revisión"
  },
  isRevisado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: "Indica si el elemento ha sido revisado"
  },
  id_revision: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'revisions',       // Nombre de la tabla de Revision (por defecto 'revisions')
      key: 'id_solicitud'
    }
  }
}, {
  timestamps: true,
});

RevisionDetalle.associate = function(models) {
  RevisionDetalle.belongsTo(models.Revision, { foreignKey: 'id_revision', as: 'revision' });
};

module.exports = { RevisionDetalle };