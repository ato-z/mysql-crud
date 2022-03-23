import { withLimit2, withOrderBy, withWhere } from "./r";
import sqlExecute from "./sql-execute";
/**
 * DELETE 删除语句
 * @param tableName
 * @returns
 */
const withDeleteFrom = (tableName) => {
    return `DELETE FROM \`${tableName}\``;
};
export const _DELETE = (tableName, where, groupBy, limit) => {
    const deleteFrom = withDeleteFrom(tableName);
    const sqlContainer = [deleteFrom];
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
export const biuldD = (pool) => {
    const D = (spotTable) => {
        const { tableName } = spotTable;
        const _delete = (where, order, limit) => {
            const sql = _DELETE(tableName, where, order, limit);
            return sqlExecute(pool, sql);
        };
        return _delete;
    };
    return D;
};
