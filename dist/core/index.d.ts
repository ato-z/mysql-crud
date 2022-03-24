import { InitDbOption, SpotTableProp, SpotTableResult } from "../tool/interface";
import mysql2 from 'mysql2';
/**
 * 初始化一个数据，初始化时并不会真正地进行链接。当发生数据库操作时才会发起链接
 * @param {string} host 数据库地址
 * @param {string} user 数据库用户名
 * @param {string} password 数据库密码
 * @param {string} port 端口，可缺省默认 3306
 * @param {string} database 数据库地址
 * @param {string} table_prefix 表前缀 => 给当前数据库下的所有表加上
 * @param {string} connectionLimit 连接池数量
 * @param {string} queueLimit 队列数
 * @returns {
 *  spotTable: 定位当前数据库的表,
 *  R: 从当前数据库的表中查询
 * }
 */
export declare const initDb: (op: InitDbOption) => {
    spotTable: (tableName: string, prop?: Partial<SpotTableProp>, tablePrefix?: string) => Readonly<SpotTableResult>;
    C: (spotTable: SpotTableResult) => (datas: object | object[]) => Promise<mysql2.ResultSetHeader>;
    R: (spotTable: SpotTableResult) => (quest?: import("../tool/interface").SQLReadSelectQuest) => Promise<any[] | null>;
    U: (spotTable: SpotTableResult) => (updata: object, query?: import("../tool/interface").SQLSelectQuest | undefined) => Promise<mysql2.ResultSetHeader>;
    D: (spotTable: SpotTableResult) => (quest?: import("../tool/interface").SQLSelectQuest | undefined) => Promise<mysql2.ResultSetHeader>;
    pool: mysql2.Pool;
    SQLExecute: <T>(sql: string) => Promise<T>;
};
