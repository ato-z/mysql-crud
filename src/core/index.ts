import { InitDbOption, SpotTableProp, SpotTableResult, WhereQuest } from "../tool/interface"
import mysql2 from 'mysql2'
import { buildC } from "./c"
import { buildR } from "./r"
import { buildU} from "./u"
import { biuldD } from "./d"
import { OP } from "../tool/opEnum"

const defaultInitDbOption: InitDbOption = {
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
}

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
export const initDb = (op: InitDbOption) => {

    const {
        host, user, port, password, database,
        connectionLimit, queueLimit, table_prefix
    } = Object.assign({}, defaultInitDbOption, op)

    // 创建连接池
    const pool = mysql2.createPool({ host, user, password, port, database, connectionLimit, queueLimit })

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
    const spotTable = (tableName: string, prop: Partial<SpotTableProp> = {}, tablePrefix: string = table_prefix || ''): Readonly<SpotTableResult> => {
        tableName = tablePrefix + tableName
        const result: SpotTableResult = Object.assign( {
            tableName,
            field: '*'
        }, prop)
        return result
    }

    const C = buildC(pool)
    const R = buildR(pool)
    const U = buildU(pool)
    const D = biuldD(pool)
    return {spotTable, C, R, U, D, pool}
}