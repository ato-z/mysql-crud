import { initDb } from '../src/core/index'
import { INSERT } from './core/c'
import { _DELETE } from './core/d'
import { SELECT } from './core/r'
import { UPDATE } from './core/u'
import { OP } from './tool/opEnum'


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
const {R, spotTable} = db

const tableBook = spotTable('book')
const qusetBookList = R(tableBook)

// 查询所有
// qusetBookList(undefined, ['id', 'ASC'], [5, 5]).then(list => {
//     //  如果为空返回 null
//     if (list !== null) {
//         // 反之返回列表数据
//         console.log('bookList', list)
//     }
// })


// console.log(INSERT('az_book', {
//     title: '房思琪的初恋乐园',
//     cover: 1,
//     des: '令人心碎却无能为力的真实故事。',
//     author: '林奕含',
//     create_date: '2022-03-21 00:00:00'
// }))

const sql = SELECT('*', 'az_book', {and: {delete_date: null}}, ['id', 'DESC'], [5, 5])
console.log(sql)

