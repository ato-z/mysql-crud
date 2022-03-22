import mysql2 from 'mysql2'
import { isString } from '../tool/checkType'
import { SpotTableResult, SQLSelectWhere } from '../tool/interface'
import { withLimit2, withOrderBy, withWhere } from './r'
import sqlExecute from './sql-execute'

/**
 * UPDATE 更新语句
 * @param tableName 
 * @returns 
 */
const withUpdateFrom = (tableName: string): string => {
    return `UPDATE ${tableName}`
}

/**
 * UPDATE 所更新的字段
 */
const withUpdateSet = (updata: object): string => {
    const keys = Object.keys(updata)
    return keys.map(key => {
        let val = Reflect.get(updata, key)
        if (isString(val)) {
            val = `'${val}'`
        }
        return `\`${key}\`=${val}`
        //`\`${key}\` = ${updata[key]`x
    }).join(',')
}

export const UPDATE = (tableName: string, updata: object, where?: SQLSelectWhere, groupBy?: [string, 'ASC'|'DESC'], limit?: number) => {
    const updateFrom = withUpdateFrom(tableName)
    const updateSet = withUpdateSet(updata)
    const updateSQL =  `${updateFrom} SET ${updateSet}`
    const sqlContainer = [updateSQL]
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

export const buildU = (pool: mysql2.Pool) => {
    const U = (spotTable: SpotTableResult) => {
        const {tableName} = spotTable
        const update = (updata: object, where?: SQLSelectWhere, order?: [string, 'ASC'|'DESC'], limit?: number) => {
            const sql = UPDATE(tableName, updata, where, order, limit)
            return sqlExecute<mysql2.ResultSetHeader>(pool, sql)
        }
        return update
    }

    return U
}