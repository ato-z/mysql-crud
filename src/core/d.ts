import mysql2 from 'mysql2'
import { SpotTableResult, SQLSelectWhere } from "../tool/interface";
import { withLimit2, withOrderBy, withWhere } from "./r";
import sqlExecute from "./sql-execute";


/**
 * DELETE 删除语句
 * @param tableName 
 * @returns 
 */
const withDeleteFrom = (tableName: string): string => {
    return `DELETE FROM \`${tableName}\``
}

export const _DELETE = (tableName: string, where?: SQLSelectWhere, groupBy?: [string, 'ASC'|'DESC'], limit?: number): string => {
    const deleteFrom = withDeleteFrom(tableName)
    const sqlContainer = [deleteFrom]
    const whereSql = withWhere(where?.and, where?.or, where?.join)
    if (whereSql !== undefined) { sqlContainer.push(whereSql) }

    if (groupBy !== undefined) {
        const groupSql = withOrderBy(groupBy[0], groupBy[1])
        sqlContainer.push(groupSql as string) 
    }

    const limitSql = withLimit2(limit)
    if (limitSql !== undefined) { sqlContainer.push(limitSql) }

    return sqlContainer.join(' ')
}

export const biuldD = (pool: mysql2.Pool) => {
    const D = (spotTable: SpotTableResult) => {
        const {tableName} = spotTable
        const _delete = (where?: SQLSelectWhere, order?: [string, 'ASC'|'DESC'], limit?: number) => {
            const sql = _DELETE(tableName, where, order, limit)
            return sqlExecute<mysql2.ResultSetHeader>(pool, sql)
        }
        return _delete
    }
    return D
}