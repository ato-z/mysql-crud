"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildR = exports.codeResults = exports.retryAttrJob = exports.SELECT = exports.withLimit2 = exports.withLimit = exports.withWhere = exports.withOrderBy = exports.withSelectFrom = void 0;
const checkType_1 = require("../tool/checkType");
const whereToString_1 = require("../tool/whereToString");
const sql_execute_1 = __importDefault(require("../core/sql-execute"));
/**
 * SELECT查询的前置语句
 * @param field
 * @param tableName
 * @returns SELECT * FROM table_name
 */
const withSelectFrom = (field, tableName) => {
    return `SELECT ${field} FROM ${tableName}`;
};
exports.withSelectFrom = withSelectFrom;
/**
 * order By 子句
 * @param orderAttr
 * @param order
 * @returns
 */
const withOrderBy = (orderAttr, order) => {
    order = order || 'DESC';
    if (orderAttr) {
        return `ORDER BY ${orderAttr} ${order}`;
    }
};
exports.withOrderBy = withOrderBy;
/**
 * where条件组合
 * @param whereAnd
 * @param whereOR
 * @param join
 * @returns
 */
const withWhere = (whereAnd, whereOR, join) => {
    const whereContainer = [];
    if (whereAnd) {
        whereContainer.push((0, whereToString_1.parseWhereToString)(whereAnd, 'AND'));
    }
    if (whereOR) {
        whereContainer.push((0, whereToString_1.parseWhereToString)(whereOR, 'OR'));
    }
    if (whereContainer.length === 1) {
        return 'WHERE '.concat(whereContainer[0]);
    }
    if (whereContainer.length === 2) {
        join = join || 'OR';
        return 'WHERE '.concat(whereContainer.map(sql => `(${sql})`).join(` ${join} `));
    }
};
exports.withWhere = withWhere;
/**
 * limit 子句
 * @param limit
 * @returns
 */
const withLimit = (limit) => {
    if ((0, checkType_1.isNumber)(limit)) {
        return `LIMIT 0,${limit}`;
    }
    if ((0, checkType_1.isArr)(limit)) {
        return `LIMIT ${limit}`;
    }
};
exports.withLimit = withLimit;
/**
 * limit 子句
 * @param limit
 * @returns
 */
const withLimit2 = (limit) => {
    if ((0, checkType_1.isNumber)(limit)) {
        return `LIMIT ${limit}`;
    }
};
exports.withLimit2 = withLimit2;
/**
 * 组合select语句
 * @param field
 * @param tableName
 * @param where
 * @param groupBy
 * @param limit
 * @returns
 */
const SELECT = (field, tableName, where, groupBy, limit) => {
    // select –> where –> group by –>order by
    const selectFrom = (0, exports.withSelectFrom)(field, tableName);
    const sqlContainer = [selectFrom];
    const whereSql = (0, exports.withWhere)(where === null || where === void 0 ? void 0 : where.and, where === null || where === void 0 ? void 0 : where.or, where === null || where === void 0 ? void 0 : where.join);
    if (whereSql !== undefined) {
        sqlContainer.push(whereSql);
    }
    if (groupBy !== undefined) {
        const groupSql = (0, exports.withOrderBy)(groupBy[0], groupBy[1]);
        sqlContainer.push(groupSql);
    }
    const limitSql = (0, exports.withLimit)(limit);
    if (limitSql !== undefined) {
        sqlContainer.push(limitSql);
    }
    return sqlContainer.join(' ');
};
exports.SELECT = SELECT;
/**
 * 触发 AttrJob 返回一个 promise
 * @param data
 * @param getAttr
 * @returns
 */
const retryAttrJob = (data, attrJob) => {
    const promiseAll = [];
    const jobs = Object.entries(attrJob);
    const newData = Object.assign({}, data);
    try {
        jobs.forEach(([key, job]) => {
            let item = job(data, key, Reflect.get(data, key));
            if (item instanceof Promise) {
                item = item.then(val => [key, val]);
            }
            else {
                item = [key, item];
            }
            promiseAll.push(item);
        });
        return Promise.all(promiseAll).then(newValues => {
            newValues.forEach(([key, val]) => {
                newData[key] = val;
            });
            return newData;
        });
    }
    catch (err) {
        return Promise.reject(err);
    }
};
exports.retryAttrJob = retryAttrJob;
/**
 * 调用getAttr设置到results的每一个子项
 * @param results
 * @param getAttr
 * @returns
 */
const codeResults = (results, getAttr) => {
    let currentPromise = Promise.resolve();
    let codeResult = [];
    results.forEach(data => {
        currentPromise = currentPromise.then(() => {
            return (0, exports.retryAttrJob)(data, getAttr).then(newData => {
                codeResult.push(newData);
            });
        });
    });
    return currentPromise.then(() => codeResult);
};
exports.codeResults = codeResults;
/**
 * 返回sql查询的助手函数
 * @param pool
 * @returns
 */
const buildR = (pool) => {
    const R = (spotTable) => {
        const { tableName, field, getAttr } = spotTable;
        const select = (where = {}, order, limit) => {
            const sql = (0, exports.SELECT)(field.toString(), tableName, where, order, limit);
            const promise = (0, sql_execute_1.default)(pool, sql);
            return promise.then(result => {
                if (result === null) {
                    return null;
                }
                if (!getAttr) {
                    return result;
                }
                return (0, exports.codeResults)(result, getAttr);
            });
        };
        return select;
    };
    return R;
};
exports.buildR = buildR;
