import mysql2 from 'mysql2'
import { isArr, isObj, isString } from '../tool/checkType'
import { AttrJob, SpotTableResult } from '../tool/interface'
import SQLExecute from '../core/sql-execute'
import { retryAttrJob } from './r'

/**
 * 根据传入的key数组来校验data数据是否合法
 * @param keys 
 * @param data 
 */
export const seekDataKey = (keys: Array<string>, data: object) => {
    const thatKeys = Object.keys(data)
    const errMsg = `要求key为[${keys}]\n接受到${JSON.stringify(data)}`
    const dataMap = new Map()
    thatKeys.forEach(key => {
        dataMap.set(key, true)
    })
    if (thatKeys.length !== keys.length) {
        throw new Error('数据长度不一致\n' + errMsg)
    }
    keys.forEach((key) => {
        if (dataMap.has(key) === false) {
            throw new Error(`缺少键 ${key}\n` + errMsg)
        }
    })
}

/**
 * 传入的数据统一数组的方式返回，数组内的子项必须是一个对象
 * @param data 
 * @returns 
 */
export const filterDatas = (data: object|Array<object>): Array<object> => {
    if (isArr(data) === false) { data = [data] }
    (data as object[]).forEach(element => {
        if (isObj(element) === false) {
            throw new Error(`新增数据必须为一个js对象，不能为 ${typeof element}`)
        }
    })
    return data as object[]
}

/**
 * sql新增语句 INSERT INTO \`${tableName}\` (${fields})
 * @param fields 
 * @param tableName 
 * @returns 
 */
export const withInsertFrom = (fields: Array<string>, tableName: string): string => {
    const fieldsLeft = fields.map(field => `\`${field}\``)
    const sqlFront = `INSERT INTO \`${tableName}\` (${fieldsLeft})`
    return sqlFront
}

/**
 * sql新增语句 VALUES (value1, value2, value3)
 * @param fields 
 * @param list 
 * @returns 
 */
export const withInsertData = (fields: Array<string>, list: Array<object>): string => {
    var vals: Array<string> = []
    list.forEach(item => {
        const itemVal: Array<string|number> = []
        fields.forEach(key => {
            let val = Reflect.get(item, key)
            if (isString(val)) { val = `'${val}'` }
            itemVal.push(val)
        })
        vals.push(`(${itemVal.join(',')})`)
    })
    return vals.join(',')
}

/**
 * 组合新增的sql语句
 * @param fields 
 * @param tableName 
 * @param list 
 * @returns 
 */
export const withInsertSql = (fields: Array<string>, tableName: string, list: Array<object>) => {
    const insertFrom = withInsertFrom(fields, tableName)
    const insertVals = withInsertData(fields, list)
    return `${insertFrom} VALUES ${insertVals}`
}

/**
 * 调用setAttr设置到lists的每一个子项
 * @param lists
 * @param setAttr 
 * @returns 
 */
 export const codeList = (lists: any[], setAttr: AttrJob): Promise<object[]> => {
    let currentPromise: Promise<unknown> = Promise.resolve()
    let codeResult: any[] = []
    lists.forEach(data => {         
        currentPromise = currentPromise.then(() => {
            return retryAttrJob(data, setAttr).then(newData => {
                codeResult.push(newData as object)
            })
        })
    })
    return currentPromise.then(() => codeResult)
}

/**
 * 组合insert语句
 * @param tableName 
 * @param datas 
 * @returns 
 */
export const INSERT = (tableName:string, datas: object|Array<object>) => {
    const insertList = filterDatas(datas)
    const insertFields = Object.keys(insertList[0])
    insertList.forEach(element => seekDataKey(insertFields, element))
    const insertSql = withInsertSql(insertFields, tableName, insertList)
    return insertSql
}

/**
 * 打包新增查询的sql语句
 * @param pool 
 * @returns 
 */
const buildC = (pool: mysql2.Pool) => {
    const C = (spotTable: SpotTableResult) => {
        const {tableName, setAttr} = spotTable
        const insert = (datas: object|Array<object>) => {
            let promise: Promise<string>
            if (setAttr) {
                const insertList = filterDatas(datas)
                promise = codeList(insertList, setAttr)
                    .then(codeList => INSERT(tableName, codeList))
            } else {
                promise = Promise.resolve(INSERT(tableName, datas))
            }

            return promise.then(insertSql => SQLExecute<mysql2.ResultSetHeader>(pool, insertSql))
        }
        return insert
    }
    return C
}

export {buildC}