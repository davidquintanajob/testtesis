const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const Documento = sequelize.define("documento", {
  id_documento: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Ruta o URL del archivo/documento",
  },
  id_mensaje: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'mensajes',
      key: 'id_mensaje'
    }
  }
}, {
  timestamps: true,
});

Documento.associate = function(models) {
  Documento.belongsTo(models.Mensaje, { foreignKey: 'id_mensaje', as: 'mensaje' });
};

module.exports = { Documento };