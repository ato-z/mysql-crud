import mysql2 from 'mysql2';
import { AttrJob, SpotTableResult } from '../tool/interface';
/**
 * 根据传入的key数组来校验data数据是否合法
 * @param keys
 * @param data
 */
export declare const seekDataKey: (keys: Array<string>, data: object) => void;
/**
 * 传入的数据统一数组的方式返回，数组内的子项必须是一个对象
 * @param data
 * @returns
 */
export declare const filterDatas: (data: object | Array<object>) => Array<object>;
/**
 * sql新增语句 INSERT INTO \`${tableName}\` (${fields})
 * @param fields
 * @param tableName
 * @returns
 */
export declare const withInsertFrom: (fields: Array<string>, tableName: string) => string;
/**
 * sql新增语句 VALUES (value1, value2, value3)
 * @param fields
 * @param list
 * @returns
 */
export declare const withInsertData: (fields: Array<string>, list: Array<object>) => string;
/**
 * 组合新增的sql语句
 * @param fields
 * @param tableName
 * @param list
 * @returns
 */
export declare const withInsertSql: (fields: Array<string>, tableName: string, list: Array<object>) => string;
/**
 * 调用setAttr设置到lists的每一个子项
 * @param lists
 * @param setAttr
 * @returns
 */
export declare const codeList: (lists: any[], setAttr: AttrJob) => Promise<object[]>;
/**
 * 组合insert语句
 * @param tableName
 * @param datas
 * @returns
 */
export declare const INSERT: (tableName: string, datas: object | Array<object>) => string;
/**
 * 打包新增查询的sql语句
 * @param pool
 * @returns
 */
declare const buildC: (pool: mysql2.Pool) => (spotTable: SpotTableResult) => (datas: object | Array<object>) => Promise<mysql2.ResultSetHeader>;
export { buildC };
