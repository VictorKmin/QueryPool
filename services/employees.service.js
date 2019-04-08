const ControllerError = require('../../errors/ControllerError');

const dbHelper = require('../../helpers/db.helper');
const DBInfo = require('../info');
const DepartmentsService = require('./departments.service');

const pool = require('../connection');

const service = {};

const tableName = pool.escapeId(DBInfo.info.employees.name);
const dirtyTableName = DBInfo.info.employees.name;

service.findById = async (id, q = {}) => {
    const include = q.include ? q.include : [];
    if (!id) {
        throw new ControllerError('Missed id', 400, '');
    }
    let sql = `select * from ${tableName}`;
    if (include && include.length > 0) {
        sql += dbHelper.getIncludes(pool, dirtyTableName, include);
    }
    sql += ' where empId = ?';
    const res = await pool.promise().query(sql, [id]);
    return res[0] ? res[0][0] : {};
};

service.find = async (q = {}) => {
    const include = q.include ? q.include : [];
    const skip = q.skip ? q.skip : 0;
    const limit = q.limit ? q.limit : 5;
    let name = q.name ? JSON.parse(q.name) : '';

    if (typeof skip !== 'number'
        || skip < 0
        || typeof limit !== 'number'
        || limit < 0) {
        throw new ControllerError('Invalid data', 400, '');
    }
    let sql = `select * from ${tableName}`;
    if (include && include.length > 0) {
        sql += dbHelper.getIncludes(pool, dirtyTableName, include);
    }
    if (q.name){
        sql += ` where empName like ${pool.escape(name + '%')}`;
    }
    sql += ' limit ? , ?';
    const res = await pool.promise().query(sql, [skip, limit]);
    return res[0] ? res[0] : [];
};

service.create = async (body) => {
    if (!body) {
        throw new ControllerError('Missed body', 400, '');
    }
    const keys = Object.keys(body);
    const values = Object.values(body);

    for (const key of keys) {
        if (DBInfo.hasForeignKey(dirtyTableName, key)) {
            if (key === DBInfo.info.employees.foreignKeys.departments.from) {
                if (!(await DepartmentsService.findById(body[key]))) {
                    throw new ControllerError('Not found related table', 400, '');
                }
            }
        }
    }

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
        for (const key of Object.keys(body)) {
            if (DBInfo.hasForeignKey(dirtyTableName, key)) {
                if (key === DBInfo.info.employees.foreignKeys.departments.from) {
                    if (!(await DepartmentsService.findById(body[key]))) {
                        throw new ControllerError('Not found related table', 400, '');
                    }
                }
            }
        }
        let sql = `update ${tableName} set`;
        for (const [key, value] of entries) {
            sql += ` ${pool.escapeId(key)}=${pool.escape(value)},`
        }
        sql = sql.slice(0, sql.length - 1);
        sql += ` where empId=${pool.escape(id)}`;
        await pool.promise().query(sql);
        return service.findById(id);
    }
};

service.deleteById = async (id) => {
    if (!id) {
        throw new ControllerError('Missed id', 400, '');
    }
    const sql = `delete from ${tableName} where empId = ?`;
    return await pool.promise().query(sql, [id]);
};

service.count = async () => {
    const sql = `select count(empId) as count from ${tableName}`;
    const res = await pool.promise().query(sql);
    return res[0] ? res[0][0].count : 0;
};

module.exports = service;
