"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
const c_1 = require("./c");
const r_1 = require("./r");
const u_1 = require("./u");
const d_1 = require("./d");
const sql_execute_1 = __importDefault(require("./sql-execute"));
const defaultInitDbOption = {
    // 数据库地址
    host: '',
    // 数据库用户名
    user: '',
    // 数据库密码
    password: '',
    // 端口，可缺省默认 3306
    port: 3306,
    // 数据库名
    database: '',
    // 表前缀
    table_prefix: '',
    // 连接池数量
    connectionLimit: 16,
    // 队列数
    queueLimit: 0
};
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
const initDb = (op) => {
    const { host, user, port, password, database, connectionLimit, queueLimit, table_prefix } = Object.assign({}, defaultInitDbOption, op);
    // 创建连接池
    const pool = mysql2_1.default.createPool({ host, user, password, port, database, connectionLimit, queueLimit });
    /**
     * 返回操作表信息
     * @param tableName
     * @param prop
     * @param tablePrefix
     * @returns {tableName, prop}
     * ```
     * const bookTable = spotTable('book', {
     *  field: 'id, title, cover', // ['id', 'title', 'cover'],
     *  getAttr: {},
     *  setAttr: {}
     * }, 'az_')
     *
     * // =>
     * {
     *  tableName: 'az_book',
     *  {
     *      field: 'id, title, cover',
     *  }
     * }
     *
     * ```
     */
    const spotTable = (tableName, prop = {}, tablePrefix = table_prefix || '') => {
        tableName = tablePrefix + tableName;
        const result = Object.assign({
            tableName,
            field: '*'
        }, prop);
        return result;
    };
    const C = (0, c_1.buildC)(pool);
    const R = (0, r_1.buildR)(pool);
    const U = (0, u_1.buildU)(pool);
    const D = (0, d_1.biuldD)(pool);
    const SQLExecute = (sql) => (0, sql_execute_1.default)(pool, sql);
    return { spotTable, C, R, U, D, pool, SQLExecute };
};
exports.initDb = initDb;
