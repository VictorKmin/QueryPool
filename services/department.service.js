const ControllerError = require('../../errors/ControllerError');
const DBInfo = require('../info');

const pool = require('../connection');

const service = {};

const tableName = pool.escapeId(DBInfo.info.departments.name);

service.findById = async (id) => {
    if (!id) {
        throw new ControllerError('Missed id', 400, '');
    }
    const sql = `select * from ${tableName} where dpId = ?`;
    const res = await pool.promise().query(sql, [id]);
    return res[0] ? res[0][0] : {};
};

service.find = async (q = {}) => {
    const skip = q.skip ? q.skip : 0;
    const limit = q.limit ? q.limit : 5;

    if (typeof skip !== 'number'
        || skip < 0
        || typeof limit !== 'number'
        || limit < 0) {
        throw new ControllerError('Invalid data', 400, '');
    }
    const sql = `select * from ${tableName} limit ? , ?`;
    const res = await pool.promise().query(sql, [skip, limit]);
    return res[0] ? res[0] : [];
};

service.create = async (body) => {
    if (!body) {
        throw new ControllerError('Missed body', 400, '');
    }
    const keys = Object.keys(body);
    const values = Object.values(body);
    const sql = `insert into ${tableName}(??) value (?)`;
    const res = await pool.promise().query(sql, [keys, values]);
    if (res[0] && res[0].insertId) {
        return service.findById(res[0].insertId);
    }
};

service.updateById = async (id, body) => {
    if (!id || !body) {
        throw new ControllerError('Missed id or body', 400, '');
    }
    const entries = Object.entries(body);
    if (entries.length > 0) {
        let sql = `update ${tableName} set`;
        for (const [key, value] of entries) {
            sql += ` ${pool.escapeId(key)}=${pool.escape(value)},`
        }
        sql = sql.slice(0, sql.length - 1);
        sql += ` where dpId=${pool.escape(id)}`;
        await pool.promise().query(sql);
        return service.findById(id);
    }
};

service.deleteById = async (id) => {
    if (!id) {
        throw new ControllerError('Missed id', 400, '');
    }
    const sql = `delete from ${tableName} where dpId = ?`;
    return await pool.promise().query(sql, [id]);
};

service.count = async () => {
    const sql = `select count(dpId) as count from ${tableName}`;
    const res = await pool.promise().query(sql);
    return res[0] ? res[0][0].count : 0;
};

module.exports = service;
