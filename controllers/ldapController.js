const ldapService = require('../services/ldapService');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      console.warn('⚠️ Faltan usuario o contraseña');
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Autenticar contra LDAP
    const ldapUser = await ldapService.authenticateUser(usuario, contrasena);

    // Generar token JWT con los datos devueltos por LDAP
    const tokenData = {
      nombre_usuario: ldapUser.sAMAccountName,
      nombre: ldapUser.displayName || ldapUser.cn || usuario,
      // Puedes agregar más campos si los obtienes: mail, department, etc.
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({
      mensaje: 'Login exitoso',
      token,
      usuario: tokenData
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    const status = error.status || 401;
    const message = error.message || 'Credenciales incorrectas';
    res.status(status).json({ error: message });
  }
};

module.exports = { login };