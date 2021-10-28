const opEnum = require('./opEnum')

/**
 * 根据操作符，映射处理对应的值。比如 = null => IS NULL
 * @param {string} op 
 * @param {string} value 
 * @returns [操作符, 值]
 */
const codeOpValue = (op, value) => {
    
    // 如果判断是否为null
    if (value === null || value === 'NULL' || value === 'null') { // IS NULL || IS NOT NULL
        if (op === opEnum.EQ) {
            op = 'IS'
        }
        if (op === opEnum.NEQ) {
            op = 'IS NOT'
        }
        value = 'NULL'
    } else if (op === opEnum.IN || op === opEnum.NOT_IN) { // 如果是 IN 查询 => IN () || NOT IN ()
        value = `(${value})`
    } else if (op === opEnum.BETWEEN || op === opEnum.NOT_BETWEEN) {// 区间查询 => BETWEEN 1 AND 9 || NOT BETWEEN 1 AND 9
        value = value.slice(0, 2).join(' AND ')
    } else if (typeof value === 'string') { // 如果是字符串，加上单引号
        value = "'" + value.replace(/\'/g, "\\'") + "'"
    }
    return [op, value]
}

/**
 * 将对象转化成sql查询可用的字符串
 * {id: 1， delete_time: null} => `id` = 1 AND `delete_time` = null
 * @param   {object} where 需要转换的条件 
 * @returns {string} 转化后的字符串 `id` = 1 AND `delete_time` = null
 */
 const codeWhereToSqlStr = (where, joinStr = ' AND ') => {
    const lis = Object.entries(where)
    return lis.map(li => {
        
        const key = '`'+li[0]+'`'
        let value = li[1]
        let operative = opEnum.EQ
        if (Array.isArray(value)) {
            operative = value[0]
            value = value[1]
        }
        // 如果值为 undefined
        if (value === undefined) {
            throw new Error(`${li[0]} 不能为 undefined`)
        }
        [operative, value] = codeOpValue(operative, value)
        
        return `${key} ${operative} ${value}`
    }).join(joinStr)
}
module.exports = codeWhereToSqlStr