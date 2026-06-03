const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const tipos = ["Traslado", "Baja", "Revisión", "Mensaje"];
const estados = ["enviado", "recibido", "visto"];

const Mensaje = sequelize.define("mensaje", {
    id_mensaje: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: { args: [tipos], msg: "El tipo de mensaje especificado no es válido" },
        },
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ""
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: { args: [estados], msg: "El estado especificado no es válido" },
        },
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id_usuario' },
        comment: "Usuario que envía el mensaje (creador)"
    },
    id_usuario_receptor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id_usuario' },
        comment: "Usuario destinatario del mensaje"
    },
    id_solicitud: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'solicituds', key: 'id_solicitud' }
    }
});

Mensaje.associate = function (models) {
    Mensaje.belongsTo(models.Usuario, { foreignKey: 'id_usuario', as: 'remitente' });
    Mensaje.belongsTo(models.Usuario, { foreignKey: 'id_usuario_receptor', as: 'destinatario' });
    Mensaje.hasMany(models.Documento, { foreignKey: 'id_mensaje', as: 'documentos' });
    Mensaje.belongsTo(models.Solicitud, { foreignKey: 'id_solicitud', as: 'solicitud' });
};

module.exports = { Mensaje, tipos, estados };