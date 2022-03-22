import mysql2 from 'mysql2'
import { isArr, isNumber } from '../tool/checkType'
import { AttrJob, SpotTableResult, WhereQuest, SQLSelectWhere } from '../tool/interface'
import { parseWhereToString } from '../tool/whereToString'
import SQLExecute from '../core/sql-execute'

/**
 * SELECT查询的前置语句
 * @param field 
 * @param tableName 
 * @returns SELECT * FROM table_name
 */
export const withSelectFrom = (field: string, tableName: string): string => {
    return `SELECT ${field} FROM ${tableName}`
}

/**
 * order By 子句
 * @param orderAttr 
 * @param order 
 * @returns 
 */
export const withOrderBy = (orderAttr?:string, order?:'DESC'|'ASC'): string|undefined => {
    order = order || 'DESC'
    if (orderAttr) { return `ORDER BY ${orderAttr} ${order}` }
}

/**
 * where条件组合
 * @param whereAnd 
 * @param whereOR 
 * @param join 
 * @returns 
 */
export const withWhere = (whereAnd?: WhereQuest, whereOR?: WhereQuest, join?: 'AND'|'OR'): string|undefined => {
    const whereContainer = []
    if (whereAnd) { whereContainer.push(parseWhereToString(whereAnd, 'AND')) }
    if (whereOR) { whereContainer.push(parseWhereToString(whereOR, 'OR')) }
    if (whereContainer.length === 1) {
        return 'WHERE '.concat(whereContainer[0])
    }
    if (whereContainer.length === 2) {
        join = join || 'OR'
        return 'WHERE '.concat(whereContainer.map(sql => `(${sql})`).join(` ${join} `))
    }
}

/**
 * limit 子句
 * @param limit 
 * @returns 
 */
export const withLimit = (limit?: number|[number, number]): string|undefined => {
    if (isNumber(limit)) {
        return `LIMIT 0,${limit}`
    }
    if (isArr(limit)) {
        return `LIMIT ${limit}`
    }
}

/**
 * limit 子句
 * @param limit 
 * @returns 
 */
export const withLimit2 = (limit?: number): string|undefined => {
    if (isNumber(limit)) {
        return `LIMIT ${limit}`
    }
}
 
/**
 * 组合select语句
 * @param field 
 * @param tableName 
 * @param where 
 * @param groupBy 
 * @param limit 
 * @returns 
 */
export const SELECT = (
    field: string,
    tableName: string,
    where?: SQLSelectWhere,
    groupBy?: [string, 'ASC'|'DESC'],
    limit?: number|[number, number]
) => {
    // select –> where –> group by –>order by
    const selectFrom = withSelectFrom(field, tableName)
    const sqlContainer: Array<string> = [selectFrom]
    const whereSql = withWhere(where?.and, where?.or, where?.join)
    if (whereSql !== undefined) { sqlContainer.push(whereSql) }
    if (groupBy !== undefined) {
        const groupSql = withOrderBy(groupBy[0], groupBy[1])
        sqlContainer.push(groupSql as string) 
    }
    const limitSql = withLimit(limit)
    if (limitSql !== undefined) { sqlContainer.push(limitSql) }
    return sqlContainer.join(' ')
}

/**
 * 触发 AttrJob 返回一个 promise
 * @param data 
 * @param getAttr 
 * @returns 
 */
export const retryAttrJob = (data: any, attrJob: AttrJob): Promise<any> => {
    const promiseAll: any[] = []
    const jobs = Object.entries(attrJob)
    const newData: any = Object.assign({}, data)
    try {
        jobs.forEach(([key, job]) => {
            let item = job(data, key as string, Reflect.get(data, key))
            if (item instanceof Promise) {
                item = item.then(val => [key, val])
            } else {
                item = [key, item]
            }
            promiseAll.push(item)
        })
        return Promise.all(promiseAll).then(newValues => {
            newValues.forEach(([key, val]) => {
                newData[key] = val
            })
            return newData
        })
    } catch(err) {
        return Promise.reject(err)
    }
}

/**
 * 调用getAttr设置到results的每一个子项
 * @param results 
 * @param getAttr 
 * @returns 
 */
export const codeResults = (results: any[], getAttr: AttrJob): Promise<object[]> => {
    let currentPromise: Promise<unknown> = Promise.resolve()
    let codeResult: any[] = []
    results.forEach(data => {         
        currentPromise = currentPromise.then(() => {
            return retryAttrJob(data, getAttr).then(newData => {
                codeResult.push(newData as object)
            })
        })
    })
    return currentPromise.then(() => codeResult)
}

/**
 * 返回sql查询的助手函数
 * @param pool 
 * @returns 
 */
export const buildR = (pool: mysql2.Pool) => {
    const R = (spotTable: SpotTableResult) => {
        const {tableName, field, getAttr} = spotTable
        const select = (where: SQLSelectWhere = {}, order?: [string, 'ASC'|'DESC'], limit?: number|[number, number]) => {
            const sql = SELECT(field.toString(), tableName, where, order, limit)
            const promise = SQLExecute<any[]|null>(pool, sql)
            return promise.then(result => {
                if (result === null) { return null }
                if (!getAttr) { return result }
                return codeResults(result, getAttr)
            })
        }
        return select
    }
    return R
}