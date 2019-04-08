const ControllerError = require('../../errors/ControllerError');
let DBInfo = require('../info');

const pool = require('../connection');

const service = {};

const tableName = pool.escapeId(DBInfo.info.users.name);

service.usedLogin = async (login) => {
    if (!login){
        return false;
    }
    let sql = `select * from ${tableName}  where login = ?`;
    const res = await pool.promise().query(sql, [login]);
    return res[0].length > 0;
};

service.findById = async (id) => {
    if (!id) {
        throw new ControllerError('Missed id', 400, '');
    }
    let sql = `select * from ${tableName}  where uId = ?`;
    const res = await pool.promise().query(sql, [id]);
    return res[0] ? res[0][0] : {};
};

service.login = async (login, password) => {
    if (!login || !password) {
        throw new ControllerError('Missed login or password', 400, '');
    }
    let sql = `select * from ${tableName}  where login = ? and password = ?`;
    const res = await pool.promise().query(sql, [login, password]);
    return res[0] ? res[0][0] : null;
};

service.register = async (body) => {
    if (!body || !body.login || !body.password) {
        throw new ControllerError('Missed body', 400, '');
    }
    if (await service.usedLogin(body.login)){
        throw new ControllerError('Login is already on use', 409, '');
    }
    const keys = Object.keys(body);
    const values = Object.values(body);
    const sql = `insert into ${tableName}(??) value (?)`;
    const res = await pool.promise().query(sql, [keys, values]);
    if (res[0] && res[0].insertId) {
        return service.findById(res[0].insertId);
    }
};


module.exports = service;
