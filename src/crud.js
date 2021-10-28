const codeWhereToSqlStr = require('./codeWhereToSqlStr')
const retryAttr = require('./retryAttr')
/**
 * 返回查询语句的行尾 => WHERE `id` = 1 ORDER BY id DESC LIMIT 1
 * @param {string} whereAnd 查询条件为并且的语句   {id: 1, is_end: 1} => `id` = 1 AND `is_end` = 1
 * @param {string} whereOr  查询条件为或的语句    {id:1, is_end: 1} => `id` = 1 OR `is_end` = 1
 * @param {string} orderBy  查询结果的排序方式    id DESC
 * @param {string} limit    查询的条目           5 => 获取5条; [10] => 从下标10开始取10条
 * @returns WHERE `id` = 1 ORDER BY id DESC LIMIT 1
 */
const codeSQLToQuery =  (whereAnd, whereOr = null, orderBy, limit) => {
    const where1 = whereAnd ? codeWhereToSqlStr(whereAnd) : null
    const where2 = whereOr ? codeWhereToSqlStr(whereOr, 'OR') : null

    // where 条件组装
    let sqlWhere = ''
    if (where2 && where1) {
        sqlWhere = `WHERE (${where1}) OR (${where2})`
    } else if ( where1 || where2) {
        const where = where1 || where2
        sqlWhere = `WHERE ${where}`
    }
    
    // order 排序
    let sqlOrderBy = ''
    if (orderBy) {
        sqlOrderBy = `ORDER BY ${orderBy}`
    }

    // limit 条目
    let sqlLimit = ''
    if (limit) {
        sqlLimit = `LIMIT ${limit}`
    }

    const sql = [sqlWhere, sqlOrderBy, sqlLimit]
    return sql.join(' ')
}

/**
 * 组装查询语句
 * @param {string} sqlFront 查询行头 SELECT ${field} FROM ${tableName} 
 * @param {string} orderBy  排序方式 id DESC
 * @param {string} limit    获取条目 5 => 获取5条; [10] => 从下标10开始取10条
 * @returns 
 */
const ReadBefore = (sqlFront, orderBy = null, limit) => {
    return (whereAnd, whereOr = null, limit2 = 100) => {
        if (limit === null) { limit = limit2 }
        const sqlAfter = codeSQLToQuery(whereAnd, whereOr, orderBy, limit)
        const sql = sqlFront + ' ' + sqlAfter
        return sql
    }
}

/**
 * 组装新增语句的值部分 VALUES (), (), ()
 * @param {array}  fields    更新的表项
 * @param {object} setAttr   设置器在执行 spotTable 就定义好的一个对象
 * @param {object} data      需要插入的数据
 * @returns (val1, val2, val3...), (val1, val2, val3...), (val1, val2, val3...)
 */
const CreateAfter = (fields, setAttr, data) => {
    if (Array.isArray(data)) {
        const promises = data.map(item => CreateAfter(fields, setAttr, item))
        return Promise.all(promises)
    }
    return retryAttr.set(fields, setAttr, data)
        .then(codeData => `(${fields.map(key => codeData[key])})`)
}

/**
 * 组装更新语句 键值对部分 field1=new-value1, field2=new-value2
 * @param {object} data 需要更新的值
 * @returns field1=new-value1, field2=new-value2
 */
const UpdateMiddle = (data) => {
    const keys = Object.keys(data)
    return retryAttr.set(keys, {}, data)
    .then(codeData => keys.map(key => `\`${key}\` = ${codeData[key]}`).join(' , '))
}

/**
 * 根据当前数据库的连接去构建 CRUD 方法
 * @param {pool} pool 连接池
 */
const builderCRUD = pool => {
    /**
     * 查
     */
    const R = (spotTableResult) => {
        const {tableName, field, order, getAttr, hiddenAttr} = spotTableResult
        const sqlFront = `SELECT ${field} FROM ${tableName}`
        const handle = (...args) => {
            const sqlCode = ReadBefore(sqlFront, order, null)
            const sql = sqlCode(...args)
            const promiseCb = {}
            const promise = new Promise((a, b) => {
                promiseCb.resolve = a
                promiseCb.reject = b
            })
            pool.execute(sql, (err, result) => {
                if (err) { return promiseCb.reject(err) }
                if (result.length === 0) { return promiseCb.resolve(null)}
                const promises = []
                result.map(resultItem => {
                    const p = retryAttr.get(getAttr, resultItem)
                    .then(data => retryAttr.hidden(hiddenAttr, data))
                    promises.push(p)
                })
                Promise.all(promises).then(promiseCb.resolve)
            })
            return promise
        }
        return [ 
            (...args) => {
                args[2] = args[2] || 1
                return handle(...args).then(li => {
                    if (li === null) { return li }
                    return li.length === 1 ? li[0] : li
                })
            },
            handle
        ]
    }

    /**
     * 增
     */
    const C = (spotTableResult, fields = null) => {
        if (Array.isArray(fields) === false || fields.length === 0) { throw new Error('新增字段列表必须为一个数组且不能为空: fields') }
        const {tableName, setAttr} = spotTableResult
        const fieldsLeft = fields.map(field => `\`${field}\``)
        const sqlFront = `INSERT INTO \`${tableName}\` (${fieldsLeft}) VALUES`
        const handle = data => {
            return CreateAfter(fields, setAttr, data).then(sqlAfter => {
                const sql = `${sqlFront} ${sqlAfter}`
                const promiseCb = {}
                const promise = new Promise((a, b) => {
                    promiseCb.resolve = a
                    promiseCb.reject = b
                })
                pool.execute(sql, (err, result) => {
                    if (err) { return promiseCb.reject(err) }
                    if (result.length === 0) { return promiseCb.resolve(null)}
                    //promiseCb.resolve(result.affectedRows === 1 ? result.insertId : result.affectedRows)
                    promiseCb.resolve(result)
                })
                delete pool
                return promise
            })
        }
        return [handle, li => {
            // 后期针对长数组优化
            return handle(li)
        }]
    }


    /**
     * 改
     */
    const U = (spotTableResult) => {
        const {tableName, order} = spotTableResult
        const sqlFront = `UPDATE  \`${tableName}\` SET`
        const handle = (data, whereAnd, whereOr, limit) => {
            return UpdateMiddle(data)
            .then(sqlMiddle => {
                const sqlAfter = codeSQLToQuery(whereAnd, whereOr, order, limit)
                delete order
                return `${sqlFront} ${sqlMiddle} ${sqlAfter}`
            })
            .then(sql => {
                const promiseCb = {}
                const promise = new Promise((a, b) => {
                    promiseCb.resolve = a
                    promiseCb.reject = b
                })
                pool.execute(sql, (err, result) => {
                    if (err) { return promiseCb.reject(err) }
                    promiseCb.resolve(result)
                })
                delete pool
                return promise
            })
        }
        return [handle]
    }

    /**
     * 删
     */
    const D = (spotTableResult) => {
        const {tableName, order} = spotTableResult
        const sqlFront = `DELETE FROM  \`${tableName}\``
        const handle = (whereAnd, whereOr, limit) => {
            const sqlAfter = codeSQLToQuery(whereAnd, whereOr, order, limit)
            delete order
            const sql = `${sqlFront} ${sqlAfter}`
            const promiseCb = {}
            const promise = new Promise((a, b) => {
                promiseCb.resolve = a
                promiseCb.reject = b
            })
            pool.execute(sql, (err, result) => {
                if (err) { return promiseCb.reject(err) }
                promiseCb.resolve(result)
            })
            delete pool
            return promise
        }

        return [handle]
    }
    return { R, C, U, D }
}

module.exports = { builderCRUD }