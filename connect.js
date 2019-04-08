const mysql = require('mysql');
const clientDbConfig = require('../config/client-login-db');

// ../config/client-login-db is ...
// module.exports = function () {
//     return {
//         host: process.env.LOGIN_DB_HOST,
//         port: process.env.LOGIN_DB_PORT,
//         user: process.env.LOGIN_DB_USER,
//         password: process.env.LOGIN_DB_PASSWORD,
//         database: process.env.LOGIN_DB_NAME,
//     }; // return development.
// };


const poolCluster = mysql.createPoolCluster();

// Our known connections.
poolCluster.add('login_db', clientDbConfig());

function getHostCredentials() {
    // Call a service that returns Credentials
    // This is a placeholder
    return {
        user: process.env.CLIENT_DB_USER,
        password: process.env.CLIENT_DB_PASSWORD
    };
}

function createConnection(hostName, port, database) {
    const credentials = getHostCredentials();
    const config = {
        host: hostName,
        port,
        database,
        user: credentials.user,
        password: credentials.password,
        connectionLimit: 50,
    };
    poolCluster.add(`${hostName}_${database}`, config);
}

function connectToHost(hostName, port, database) {
    const foundNodeIds = poolCluster._findNodeIds(`${hostName}_${database}`, true);
    if (foundNodeIds.length === 0) {
        createConnection(hostName, port, database);
    }
    return poolCluster.of(`${hostName}_${database}`);
}

module.exports = {
    poolCluster,
    connectToHost,
};


// MYSQL 2

let mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
