const mysql = require('mysql2')
const { builderCRUD } = require('./crud')
const lifetimes = require('./lifetimes')
/**
 * 链接数据库表
 * @param {*} pool 
 */
const spotTableOption = {
    field: ['*'],
    order: ''
}
const spotTableBefore = (tableName, prop = {}) => {
    const newProp = Object.assign({},spotTableOption, prop)
    return {tableName, ...newProp}
}

// 默认参数
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
const initDb = op => {

    const {host, user, port, password, database, connectionLimit, queueLimit, table_prefix} = Object.assign({}, defaultInitDbOption, op)

    // 默认使用连接池的方式进行链接
    const pool = mysql.createPool({host, user, password, port, database, connectionLimit, queueLimit})
    
    // 生命周期
    const lifetime = lifetimes(pool)

    // 链接表
    const spotTable = (tableName, prop) => {
        return spotTableBefore(table_prefix + tableName, prop)
    }

    // 增删查改
    const curlTool = builderCRUD(pool)
    
    return { spotTable, lifetime, ...curlTool}
}

module.exports = initDb