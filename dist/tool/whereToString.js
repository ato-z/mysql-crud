"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWhereToString = exports.parseOp = void 0;
const checkType_1 = require("./checkType");
const opEnum_1 = require("./opEnum");
/**
 * 校验运算符和值是否合法
 */
const opList = Object.values(opEnum_1.OP);
const checkoutOpVal = (op, val) => {
    if (opList.indexOf(op) === -1) {
        throw new Error(`不支持运算符: ${op}`);
    }
    if (op === opEnum_1.OP.EQ || op === opEnum_1.OP.NEQ) {
        if (((0, checkType_1.isString)(val) || (0, checkType_1.isNull)(val) || (0, checkType_1.isNumber)(val)) === false) {
            throw new Error(`${op} 运算符只支持类型：string|number|null`);
        }
    }
    if (op === opEnum_1.OP.GT || op === opEnum_1.OP.LT || op === opEnum_1.OP.EGT || op === opEnum_1.OP.ELT) {
        if ((0, checkType_1.isNumber)(val) === false) {
            throw new Error(`${op} 运算符只支持类型：number`);
        }
    }
    if (op === opEnum_1.OP.IN || op === opEnum_1.OP.NOT_IN) {
        if ((0, checkType_1.isArr)(val) === false) {
            throw new Error(`${op} 运算符只支持类型：array`);
        }
    }
    if (op === opEnum_1.OP.BETWEEN || op === opEnum_1.OP.NOT_BETWEEN) {
        if ((0, checkType_1.isArr)(val) === false) {
            throw new Error(`${op} 运算符只支持类型：array`);
        }
        const targetVal = val;
        if (targetVal.length !== 2) {
            throw new Error(`${op} 运算符传入的数组长度只能为2， 当前${val}`);
        }
        if (((0, checkType_1.isNumber)(targetVal[0]) || (0, checkType_1.isNumber)(targetVal[1])) === false) {
            throw new Error(`${op} 区间查询数组子项只能为数字`);
        }
        if (targetVal[0] > targetVal[1]) {
            [targetVal[1], targetVal[0]] = [...targetVal];
        }
    }
};
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
const parseOp = (op, value) => {
    checkoutOpVal(op, value);
    // 如果判断是否为null
    if (value === null || value === 'NULL' || value === 'null') { // IS NULL || IS NOT NULL
        if (op === opEnum_1.OP.EQ) {
            op = 'IS';
        }
        if (op === opEnum_1.OP.NEQ) {
            op = 'IS NOT';
        }
        value = 'NULL';
    }
    else if (op === opEnum_1.OP.IN || op === opEnum_1.OP.NOT_IN) { // 如果是 IN 查询 => IN () || NOT IN ()
        value = `(${value})`;
    }
    else if ((op === opEnum_1.OP.BETWEEN || op === opEnum_1.OP.NOT_BETWEEN) && Array.isArray(value)) { // 区间查询 => BETWEEN 1 AND 9 || NOT BETWEEN 1 AND 9
        value = value.slice(0, 2).join(' AND ');
    }
    else if (typeof value === 'string') { // 如果是字符串，加上单引号
        value = value.replace(/\-/gm, '\\-'); // 防止注入
        value = "'" + value.replace(/\'/g, "\\'") + "'";
    }
    return [op, value];
};
exports.parseOp = parseOp;
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
const parseWhereToString = (where, joinStr = 'AND') => {
    const lis = Object.entries(where);
    return lis.map(li => {
        const key = '`' + li[0] + '`';
        let value = li[1];
        let operative = opEnum_1.OP.EQ;
        if (Array.isArray(value)) {
            operative = value[0];
            value = value[1];
        }
        // 如果值为 undefined
        if ((0, checkType_1.isUndefined)(value)) {
            throw new Error(`${li[0]} 不能为 undefined`);
        }
        [operative, value] = (0, exports.parseOp)(operative, value);
        return `${key} ${operative} ${value}`;
    }).join(` ${joinStr} `);
};
exports.parseWhereToString = parseWhereToString;
