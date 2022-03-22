import { initDb } from "./src/core"

const database = {
    host: '192.168.100.201',
    // 数据库用户名
    user: 'root',
    // 数据库密码
    password: 'root',
    // 端口，可缺省默认 3306
    port: 3306,
    // 数据库名
    database: 'az_dbtest',
    // 表前缀
    table_prefix: 'az_',
}


const db = initDb(database)
const {pool} = db

export {db, pool}