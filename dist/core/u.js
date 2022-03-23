import { isString } from '../tool/checkType';
import { withLimit2, withOrderBy, withWhere } from './r';
import sqlExecute from './sql-execute';
/**
 * UPDATE 更新语句
 * @param tableName
 * @returns
 */
const withUpdateFrom = (tableName) => {
    return `UPDATE ${tableName}`;
};
/**
 * UPDATE 所更新的字段
 */
const withUpdateSet = (updata) => {
    const keys = Object.keys(updata);
    return keys.map(key => {
        let val = Reflect.get(updata, key);
        if (isString(val)) {
            val = `'${val}'`;
        }
        return `\`${key}\`=${val}`;
        //`\`${key}\` = ${updata[key]`x
    }).join(',');
};
export const UPDATE = (tableName, updata, where, groupBy, limit) => {
    const updateFrom = withUpdateFrom(tableName);
    const updateSet = withUpdateSet(updata);
    const updateSQL = `${updateFrom} SET ${updateSet}`;
    const sqlContainer = [updateSQL];
    const whereSql = withWhere(where?.and, where?.or, where?.join);
    if (whereSql !== undefined) {
        sqlContainer.push(whereSql);
    }
    if (groupBy !== undefined) {
        const groupSql = withOrderBy(groupBy[0], groupBy[1]);
        sqlContainer.push(groupSql);
    }
    const limitSql = withLimit2(limit);
    if (limitSql !== undefined) {
        sqlContainer.push(limitSql);
    }
    return sqlContainer.join(' ');
};
export const buildU = (pool) => {
    const U = (spotTable) => {
        const { tableName } = spotTable;
        const update = (updata, where, order, limit) => {
            const sql = UPDATE(tableName, updata, where, order, limit);
            return sqlExecute(pool, sql);
        };
        return update;
    };
    return U;
};
