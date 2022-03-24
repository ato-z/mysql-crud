import mysql2 from 'mysql2'
import { SpotTableResult, SQLSelectQuest } from "../tool/interface";
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

export const _DELETE = (tableName: string, quest?: SQLSelectQuest): string => {
    const deleteFrom = withDeleteFrom(tableName)
    const sqlContainer = [deleteFrom]
    const whereSql = withWhere(quest?.and, quest?.or, quest?.join)
    if (whereSql !== undefined) { sqlContainer.push(whereSql) }
    
    if (quest?.order !== undefined) {
        const groupSql = withOrderBy(quest?.order[0], quest?.order[1])
        sqlContainer.push(groupSql as string) 
    }
    if (quest?.limit !== undefined) {
        const limitSql = withLimit2(quest?.limit)
        if (limitSql !== undefined) { sqlContainer.push(limitSql) }
    }
   
    return sqlContainer.join(' ')
}

export const biuldD = (pool: mysql2.Pool) => {
    const D = (spotTable: SpotTableResult) => {
        const {tableName} = spotTable
        const _delete = (quest?: SQLSelectQuest) => {
            const sql = _DELETE(tableName, quest)
            return sqlExecute<mysql2.ResultSetHeader>(pool, sql)
        }
        return _delete
    }
    return D
}