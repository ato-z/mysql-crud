import {encodingExists} from 'iconv-lite'
import { SELECT, withOrderBy, withSelectFrom, withWhere, withLimit } from '../src/core/r'
import { db } from '../database'

encodingExists('foo') // 解决测试中编码错误的问题

describe('工具函数', () => {

    it('withSelectFrom', () => {
        // * 号
        expect(withSelectFrom('*', 'az_room')).toBe('SELECT * FROM az_room')

        // 指定条件
        expect(withSelectFrom('id,title', 'az_room')).toBe('SELECT id,title FROM az_room')
    })

    it('withWhere', () => {
        // 空查询
        expect(withWhere()).toBe(undefined)

        // or组合查询
        expect(withWhere(
            { id: 1 }, 
            { id: 2 },
        )).toBe('WHERE (`id` = 1) OR (`id` = 2)')

        // 单个组合查询
        expect(withWhere(
            {id:1, delete_date: null}
        )).toBe('WHERE `id` = 1 AND `delete_date` IS NULL')

        // or组合查询
        expect(withWhere(
            { id: 1, delete_date: null },
            { id: 6666, delete_date: null }, 
            'AND'
        ))
        .toBe("WHERE (`id` = 1 AND `delete_date` IS NULL) AND (`id` = 6666 OR `delete_date` IS NULL)")
    })

    it('withOrderBy', () => {
        // 空
        expect(withOrderBy()).toBe(undefined)
        // 倒序
        expect(withOrderBy('id', 'DESC')).toBe('ORDER BY id DESC')
        // 正序
        expect(withOrderBy('id', 'ASC')).toBe('ORDER BY id ASC')
    })

    it('withLimit', () => {
        // 空
        expect(withLimit()).toBe(undefined)
        
        // 指定条目
        expect(withLimit(1)).toBe('LIMIT 0,1')

        // 以数组的形式
        expect(withLimit([0, 10])).toBe('LIMIT 0,10')
    })
})

describe("SELECT查询", () => {
    const fields = '*'
    const tableName = 'az_room'

    const result1 = 'SELECT * FROM az_room'
    it('SELECT * FROM az_room', () => {
        expect(SELECT(fields, tableName)).toBe(result1)
    })

    const result2 = 'SELECT * FROM az_room WHERE `id` = 1 AND `delete_date` IS NULL'
    it('SELECT * FROM az_room WHERE `id` = 1 AND `delete_date` IS NULL', () => {
        expect(SELECT(fields, tableName, {
            and: {
                id: 1,
                delete_date: null
            }
        })).toBe(result2)
    })

    const result3 = 'SELECT * FROM az_room WHERE (`id` = 1) OR (`id` = 66666 OR `delete_date` IS NULL)'
    it('SELECT * FROM az_room WHERE (`id` = 1) OR (`id` = 66666 OR `delete_date` IS NULL)', () => {
        expect(SELECT(fields, tableName, {
            and: {
                id: 1
            },
            or: {
                id: 66666,
                delete_date: null
            }
        })).toBe(result3)
    })

    const result4 = 'SELECT * FROM az_room WHERE `delete_date` IS NULL ORDER BY id ASC'
    it('SELECT * FROM az_room WHERE `delete_date` IS NULL ORDER BY id ASC', () => {
        expect(SELECT(fields, tableName, {
            and: {delete_date: null},
            order: ['id', 'ASC']
        })).toBe(result4)
    })

    const result5 = 'SELECT * FROM az_room WHERE `delete_date` IS NULL ORDER BY id DESC'
    it('SELECT * FROM az_room WHERE `delete_date` IS NULL ORDER BY id DESC', () => {
        expect(SELECT(fields, tableName, {
            and: {delete_date: null},
            order: ['id', 'DESC']
        })).toBe(result5)
    })

    const result6 = 'SELECT * FROM az_room WHERE `delete_date` IS NULL ORDER BY id ASC LIMIT 0,8'
    it('SELECT * FROM az_room WHERE `delete_date` IS NULL ORDER BY id ASC LIMIT 0,8', () => {
        expect(SELECT(fields, tableName, {
            and: {delete_date: null},
            order: ['id', 'ASC'],
            limit: 8
        })).toBe(result6)
    })
})


describe('链接数据库查询', () => {
    const {spotTable, R} = db
    it('简单查询', () => {
        const bookTable = spotTable('book', {})
        const selectBookList = R(bookTable)
        selectBookList().then(result => {
            expect(result === null || result instanceof Array).toBe(true)
        }).catch(err => {
            expect('[object Array] [object null]').toBe(err)
        })
    })

    it('查询为空', () => {
        const bookTable = spotTable('book', {})
        const selectBookList = R(bookTable)
        selectBookList({and: {id: 9999999}}).then(result => {
            expect(result === null).toBe(true)
        }).catch(err => {
            expect('[object Array] [object null]').toBe(err)
        })
    })

    // 图片表
    const imageTable = spotTable('image', {
        getAttr: {
            path (data, key, value) {
                if (data.from == 2) {
                    return Promise.resolve('https://img3.doubanio.com/' + value)
                }
                return value
            }
        }
    })
    const selectImg = R(imageTable)
    it('getter', () => {
        selectImg({
            and: {delete_date: null}
        }).then(result => {
            if (result === null) { return }
            const img = result[0]
            expect(/^http/.test(img.path)).toBe(true)
        }).catch(err => {
            expect('[object Array] [object null]').toBe(err)
        })
    })

    it('getter嵌套', () => {
        const bookTable2 = spotTable('book', {
            getAttr: {
                cover (data, key, value) {
                    return selectImg({and: {id: value}}).then(list => {
                        if (list === null) { return Promise.reject('') }
                        return list[0].path
                    })
                }
            }
        })

        const selectBookList2 = R(bookTable2)
        selectBookList2().then(result => {
            if (result === null) { return }
            const book = result[0]
            expect(/^http/.test(book.cover)).toBe(true)
        }).catch(err => {
            expect('[object Array] [object null]').toBe(err)
        })
    })
})
