import mysql2 from 'mysql2';
import { AttrJob, SpotTableResult, WhereQuest, SQLReadSelectQuest } from '../tool/interface';
/**
 * SELECT查询的前置语句
 * @param field
 * @param tableName
 * @returns SELECT * FROM table_name
 */
export declare const withSelectFrom: (field: string, tableName: string) => string;
/**
 * order By 子句
 * @param orderAttr
 * @param order
 * @returns
 */
export declare const withOrderBy: (orderAttr?: string | undefined, order?: "ASC" | "DESC" | undefined) => string | undefined;
/**
 * where条件组合
 * @param whereAnd
 * @param whereOR
 * @param join
 * @returns
 */
export declare const withWhere: (whereAnd?: WhereQuest | undefined, whereOR?: WhereQuest | undefined, join?: "AND" | "OR" | undefined) => string | undefined;
/**
 * limit 子句
 * @param limit
 * @returns
 */
export declare const withLimit: (limit?: number | [number, number] | undefined) => string | undefined;
/**
 * limit 子句
 * @param limit
 * @returns
 */
export declare const withLimit2: (limit?: number | undefined) => string | undefined;
/**
 * 组合select语句
 * @param field
 * @param tableName
 * @param quest
 * @returns
 */
export declare const SELECT: (field: string, tableName: string, quest?: SQLReadSelectQuest | undefined) => string;
/**
 * 触发 AttrJob 返回一个 promise
 * @param data
 * @param getAttr
 * @returns
 */
export declare const retryAttrJob: (data: any, attrJob: AttrJob) => Promise<any>;
/**
 * 调用getAttr设置到results的每一个子项
 * @param results
 * @param getAttr
 * @returns
 */
export declare const codeResults: (results: any[], getAttr: AttrJob) => Promise<object[]>;
/**
 * 返回sql查询的助手函数
 * @param pool
 * @returns
 */
export declare const buildR: (pool: mysql2.Pool) => (spotTable: SpotTableResult) => (quest?: SQLReadSelectQuest) => Promise<any[] | null>;
