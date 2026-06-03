const { getLDAPPool, bindAsync } = require('../helpers/ldap.utils');

// Cache y rate limiting
const userCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 500;
const failedAttempts = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000;

function clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of userCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) userCache.delete(key);
    }
}

function isUserLocked(username) {
    const entry = failedAttempts.get(username);
    if (!entry?.lockedUntil) return false;
    if (Date.now() < entry.lockedUntil) return true;
    failedAttempts.delete(username);
    return false;
}

function registerFailedAttempt(username) {
    const current = failedAttempts.get(username) || { count: 0 };
    const newCount = current.count + 1;
    if (newCount >= MAX_FAILED_ATTEMPTS) {
        const lockedUntil = Date.now() + LOCKOUT_DURATION;
        failedAttempts.set(username, { count: newCount, lockedUntil });
        console.warn(`🔒 Usuario ${username} bloqueado por ${MAX_FAILED_ATTEMPTS} intentos fallidos`);
    } else {
        failedAttempts.set(username, { count: newCount });
    }
}

function clearFailedAttempts(username) {
    failedAttempts.delete(username);
}

async function userExists(username) {
    // Por defecto, asumimos que existe (se puede mejorar con búsqueda)
    return true;
}

async function authenticateUser(username, password) {
    if (isUserLocked(username)) {
        const error = new Error('Cuenta temporalmente bloqueada. Intente en 5 minutos.');
        error.status = 403;
        throw error;
    }

    const pool = getLDAPPool();
    let client = null;

    const authFormats = [
        username,
        `${username}@uniss.edu.cu`,
        `UNISS\\${username}`,
        `uniss.edu.cu\\${username}`
    ];

    let authSuccess = false;
    let successfulFormat = null;

    for (const authName of authFormats) {
        try {
            client = await pool.getConnection();
            await bindAsync(client, authName, password);
            authSuccess = true;
            successfulFormat = authName;
            break;
        } catch (err) {
            if (client) {
                pool.releaseConnection(client);
                client = null;
            }
            // Seguir probando otros formatos
        }
    }

    if (!authSuccess) {
        registerFailedAttempt(username);
        const exists = await userExists(username);
        const errorMsg = exists ? 'Contraseña incorrecta' : 'Usuario no encontrado';
        const error = new Error(errorMsg);
        error.status = 401;
        throw error;
    }

    // Autenticación exitosa
    clearFailedAttempts(username);
    console.log(`✅ Login LDAP exitoso: ${username} con formato ${successfulFormat}`);

    // Inicializar con valores por defecto (para evitar undefined)
    let userAttributes = {
        displayName: username,
        cn: username,
        mail: '',
        department: '',
        title: ''
    };

    try {
        const baseDN = process.env.LDAP_BASE_DN || 'dc=uniss,dc=edu,dc=cu';
        const searchOptions = {
            scope: 'sub',
            filter: `(sAMAccountName=${username})`,
            attributes: ['displayName', 'cn', 'mail', 'department', 'title']
        };
        const searchResult = await new Promise((resolve, reject) => {
            client.search(baseDN, searchOptions, (err, search) => {
                if (err) return reject(err);
                const entries = [];
                search.on('searchEntry', (entry) => entries.push(entry.object));
                search.on('error', reject);
                search.on('end', () => resolve(entries));
            });
        });
        if (searchResult && searchResult.length > 0) {
            const found = searchResult[0];
            userAttributes = {
                displayName: found.displayName || username,
                cn: found.cn || username,
                mail: found.mail || '',
                department: found.department || '',
                title: found.title || ''
            };
        }
    } catch (searchErr) {
        console.warn('No se pudieron obtener atributos adicionales:', searchErr.message);
    } finally {
        if (client) pool.releaseConnection(client);
    }

    return {
        sAMAccountName: username,
        displayName: userAttributes.displayName || username,
        cn: userAttributes.cn || username,
        mail: userAttributes.mail || '',
        department: userAttributes.department || '',
        title: userAttributes.title || ''
    };
}

module.exports = { authenticateUser };