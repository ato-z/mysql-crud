import mysql2 from 'mysql2'
import Query from 'mysql2/typings/mysql/lib/protocol/sequences/Query'
import { isString } from '../tool/checkType'
import { SpotTableResult, SQLSelectQuest } from '../tool/interface'
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

export const UPDATE = (tableName: string, updata: object, quest?: SQLSelectQuest) => {
    const updateFrom = withUpdateFrom(tableName)
    const updateSet = withUpdateSet(updata)
    const updateSQL =  `${updateFrom} SET ${updateSet}`
    const sqlContainer = [updateSQL]
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

export const buildU = (pool: mysql2.Pool) => {
    const U = (spotTable: SpotTableResult) => {
        const {tableName} = spotTable
        const update = (updata: object, query?: SQLSelectQuest) => {
            const sql = UPDATE(tableName, updata, query)
            return sqlExecute<mysql2.ResultSetHeader>(pool, sql)
        }
        return update
    }

    return U
}