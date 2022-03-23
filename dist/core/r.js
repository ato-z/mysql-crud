import { isArr, isNumber } from '../tool/checkType';
import { parseWhereToString } from '../tool/whereToString';
import SQLExecute from '../core/sql-execute';
/**
 * SELECT查询的前置语句
 * @param field
 * @param tableName
 * @returns SELECT * FROM table_name
 */
export const withSelectFrom = (field, tableName) => {
    return `SELECT ${field} FROM ${tableName}`;
};
/**
 * order By 子句
 * @param orderAttr
 * @param order
 * @returns
 */
export const withOrderBy = (orderAttr, order) => {
    order = order || 'DESC';
    if (orderAttr) {
        return `ORDER BY ${orderAttr} ${order}`;
    }
};
/**
 * where条件组合
 * @param whereAnd
 * @param whereOR
 * @param join
 * @returns
 */
export const withWhere = (whereAnd, whereOR, join) => {
    const whereContainer = [];
    if (whereAnd) {
        whereContainer.push(parseWhereToString(whereAnd, 'AND'));
    }
    if (whereOR) {
        whereContainer.push(parseWhereToString(whereOR, 'OR'));
    }
    if (whereContainer.length === 1) {
        return 'WHERE '.concat(whereContainer[0]);
    }
    if (whereContainer.length === 2) {
        join = join || 'OR';
        return 'WHERE '.concat(whereContainer.map(sql => `(${sql})`).join(` ${join} `));
    }
};
/**
 * limit 子句
 * @param limit
 * @returns
 */
export const withLimit = (limit) => {
    if (isNumber(limit)) {
        return `LIMIT 0,${limit}`;
    }
    if (isArr(limit)) {
        return `LIMIT ${limit}`;
    }
};
/**
 * limit 子句
 * @param limit
 * @returns
 */
export const withLimit2 = (limit) => {
    if (isNumber(limit)) {
        return `LIMIT ${limit}`;
    }
};
/**
 * 组合select语句
 * @param field
 * @param tableName
 * @param where
 * @param groupBy
 * @param limit
 * @returns
 */
export const SELECT = (field, tableName, where, groupBy, limit) => {
    // select –> where –> group by –>order by
    const selectFrom = withSelectFrom(field, tableName);
    const sqlContainer = [selectFrom];
    const whereSql = withWhere(where?.and, where?.or, where?.join);
    if (whereSql !== undefined) {
        sqlContainer.push(whereSql);
    }
    if (groupBy !== undefined) {
        const groupSql = withOrderBy(groupBy[0], groupBy[1]);
        sqlContainer.push(groupSql);
    }
    const limitSql = withLimit(limit);
    if (limitSql !== undefined) {
        sqlContainer.push(limitSql);
    }
    return sqlContainer.join(' ');
};
/**
 * 触发 AttrJob 返回一个 promise
 * @param data
 * @param getAttr
 * @returns
 */
export const retryAttrJob = (data, attrJob) => {
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
/**
 * 调用getAttr设置到results的每一个子项
 * @param results
 * @param getAttr
 * @returns
 */
export const codeResults = (results, getAttr) => {
    let currentPromise = Promise.resolve();
    let codeResult = [];
    results.forEach(data => {
        currentPromise = currentPromise.then(() => {
            return retryAttrJob(data, getAttr).then(newData => {
                codeResult.push(newData);
            });
        });
    });
    return currentPromise.then(() => codeResult);
};
/**
 * 返回sql查询的助手函数
 * @param pool
 * @returns
 */
export const buildR = (pool) => {
    const R = (spotTable) => {
        const { tableName, field, getAttr } = spotTable;
        const select = (where = {}, order, limit) => {
            const sql = SELECT(field.toString(), tableName, where, order, limit);
            const promise = SQLExecute(pool, sql);
            return promise.then(result => {
                if (result === null) {
                    return null;
                }
                if (!getAttr) {
                    return result;
                }
                return codeResults(result, getAttr);
            });
        };
        return select;
    };
    return R;
};
