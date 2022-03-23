import { QuestVal, WhereQuest } from './interface';
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
export declare const parseOp: (op: string, value: QuestVal) => [string, QuestVal];
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
export declare const parseWhereToString: (where: WhereQuest, joinStr?: 'AND' | "OR") => string;
