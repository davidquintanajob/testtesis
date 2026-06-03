const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const roles = ["Jefe de Área", "Responsable de Área", "Administrador", "Especialista"];

const Usuario = sequelize.define("usuario", {
  id_usuario: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [roles],
        msg: "El rol especificado no es válido",
      },
    },
  },
  id_usuario_LDAP: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id_AreaResponsabilidad: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id_usuario_jefe: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

Usuario.associate = function(models) {
    Usuario.hasMany(models.Mensaje, { foreignKey: 'id_usuario' });
    Usuario.belongsToMany(models.Solicitud, { through: models.SolicitudUsuario, foreignKey: 'id_usuario', otherKey: 'id_solicitud' });
  // Self-referential association: cada usuario puede tener un jefe (otro usuario)
  Usuario.belongsTo(Usuario, { as: 'jefe', foreignKey: 'id_usuario_jefe' });
  Usuario.hasMany(Usuario, { as: 'subordinados', foreignKey: 'id_usuario_jefe' });
};

module.exports = { Usuario, roles };