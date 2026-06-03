// helpers/ldap.utils.js
const ldap = require('ldapjs');
const genericPool = require('generic-pool');
require('dotenv').config();

const LDAP_URL = process.env.LDAP_URL || 'ldap://uniss.edu.cu';

// No se necesitan credenciales fijas
const factory = {
  create: async () => {
    // Solo crear cliente, sin hacer bind
    const client = ldap.createClient({ url: LDAP_URL });
    return client;
  },
  destroy: (client) => {
    try { client.unbind(); } catch (e) { /* ignorar */ }
  }
};

const pool = genericPool.createPool(factory, {
  max: 10,
  min: 0,
  idleTimeoutMillis: 30000,
});

function getLDAPPool() {
  return {
    getConnection: async () => await pool.acquire(),
    releaseConnection: (client) => pool.release(client)
  };
}

function bindAsync(client, username, password) {
  return new Promise((resolve, reject) => {
    client.bind(username, password, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = { getLDAPPool, bindAsync };