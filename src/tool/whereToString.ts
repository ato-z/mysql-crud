//const OP = require('./OP')
import { QuestVal, WhereQuest } from './interface'
import {isArr, isNull, isNumber, isString, isUndefined} from './checkType'
import {OP} from './opEnum'

/**
 * 校验运算符和值是否合法
 */
const opList = Object.values(OP)
const checkoutOpVal = (op: string, val: QuestVal) => {
    if (opList.indexOf(op) === -1) { throw new Error(`不支持运算符: ${op}`) }
    if (op === OP.EQ || op === OP.NEQ) {
        if ((isString(val) || isNull(val) || isNumber(val)) === false) {
            throw new Error(`${op} 运算符只支持类型：string|number|null`)
        }
    }
    if (op === OP.GT || op === OP.LT || op === OP.EGT || op === OP.ELT) {
        if (isNumber(val) === false && isNaN(new Date(val as string).getTime())) {
            throw new Error(`${op} 运算符只支持类型：number`)
        }
    }

    if (op === OP.IN || op === OP.NOT_IN) {
        if (isArr(val) === false) { 
            throw new Error(`${op} 运算符只支持类型：array`)
        }
    }

    if (op === OP.BETWEEN || op === OP.NOT_BETWEEN) {
        if (isArr(val) === false) { throw new Error(`${op} 运算符只支持类型：array`) }
        const targetVal = val as [number, number]
        if (targetVal.length !== 2) {
            throw new Error(`${op} 运算符传入的数组长度只能为2， 当前${val}`)
        }
        if ((isNumber(targetVal[0]) || isNumber(targetVal[1])) === false) {
            throw new Error(`${op} 区间查询数组子项只能为数字`)
        }
        if (targetVal[0] > targetVal[1]) {
            [targetVal[1], targetVal[0]] = [...targetVal]
        }
    }
}

/**
 * 根据操作符，映射处理对应的值。比如 = null => IS NULL
 * @param {string} op 
 * @param {string} value 
 * @returns [操作符, 值]
 * ```
 * parseOp('=', null) => ['IS', 'NULL"]
 * parseOp(OP.EQ, null) => ['IS', 'NULL"]
 * parseOp(OP.EQ, 1) => ['=', '1"]
 * ```
 */
export const parseOp = (op: string, value: QuestVal): [string, QuestVal] => {
    checkoutOpVal(op, value)
    // 如果判断是否为null
    if (value === null || value === 'NULL' || value === 'null') { // IS NULL || IS NOT NULL
        if (op === OP.EQ) {
            op = 'IS'
        }
        if (op === OP.NEQ) {
            op = 'IS NOT'
        }
        value = 'NULL'
    } else if (op === OP.IN || op === OP.NOT_IN) { // 如果是 IN 查询 => IN () || NOT IN ()
        value = `(${value})`
    } else if ((op === OP.BETWEEN || op === OP.NOT_BETWEEN) && Array.isArray(value)) {// 区间查询 => BETWEEN 1 AND 9 || NOT BETWEEN 1 AND 9
        value = value.slice(0, 2).join(' AND ')
    } else if (typeof value === 'string') { // 如果是字符串，加上单引号
        value = value.replace(/\-/gm, '\\-') // 防止注入
        value = "'" + value.replace(/\'/g, "\\'") + "'"
    }
    return [op as string, value]
}

/**
 * 将对象转化成sql查询可用的字符串
 * @param   {object} where 需要转换的条件 
 * @returns {string} 转化后的字符串
 * ```
 * const quest = {
 *  id: 1,
 *  delete_time: null
 * }
 * parseWhereToString(quest) => '`id` = 1 AND `delete_time` = null'
 * ```
 */
export const parseWhereToString = (where: WhereQuest, joinStr: 'AND'|"OR" = 'AND') => {
    const lis = Object.entries(where)
    return lis.map(li => {
        const key = '`'+li[0]+'`'
        let value = li[1]
        let operative = OP.EQ as string
        if (Array.isArray(value)) {
            operative = value[0] as string
            value = value[1]
        }
        // 如果值为 undefined
        if (isUndefined(value)) { throw new Error(`${li[0]} 不能为 undefined`) }
        [operative, value] = parseOp(operative, value as QuestVal)
        
        return `${key} ${operative} ${value}`
    }).join(` ${joinStr} `)
}
