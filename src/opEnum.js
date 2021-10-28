/**
 * where查询条件 运算符 的映射关系
 */
const opEnum = {
    EQ          : '=',           // 等于
    NEQ         : '<>',          // 不等于
    GT          : '>',           // 大于
    EGT         : '>=',          // 大于等于
    LT          : '<',           // 小于
    ELT         : '<=',          // 小于等于
    LIKE        : 'LIKE',        // 模糊查询
    BETWEEN     : 'BETWEEN',     // 在区间中查询 [BETWEEN, [1,9]] => BETWEEN 1 AND 9
    NOT_BETWEEN : 'NOT BETWEEN', // 不在区间中查询 [NOT_BETWEEN, [1,9]] => NOT BETWEEN 1 AND 9
    IN          : 'IN',          // in数组 [IN, [1,3,6]] => IN (1, 3, 6)
    NOT_IN      : 'NOT IN',      // 同IN取反
}

module.exports = opEnum