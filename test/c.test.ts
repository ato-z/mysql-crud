import {encodingExists} from 'iconv-lite'
import { db } from '../database'
import { INSERT } from '../src/core/c'
encodingExists('foo') // 解决测试中编码错误的问题

const {spotTable, C} = db

describe('INSERT 助手函数', () => {
    const imageTable = spotTable('image')
    const data = {
        path: 'view/subject/s/public/s29651121.jpg',
        from: 2,
        create_date: '2022-03-21 00:00:00'
    }
    const data1 = {
        path: 'view/subject/s/public/s29651121.jpg',
        from: 2,
        create_date1: '2022-03-21 00:00:00'
    }
    
    it('INSERT 异常', () => {
        try {
            const result = INSERT(imageTable.tableName, [data, data1])
            expect(result).toBe(new Error('无法正常获取异常'))
        } catch(err) {
            expect(err instanceof Error).toBe(true)
        }
    })
})



// 图片表
const imageTable = spotTable('image', {})
const insertImg = C(imageTable)

describe('普通写入', () => {
    const imgData = {
        path: 'view/subject/s/public/s29651121.jpg',
        from: 2,
        create_date: '2022-03-21 00:00:00'
    }

    // 写入一条
    it('单条写入', () => {
        insertImg(imgData).then(result => {
            expect('单条图片写入成功').toBe('单条图片写入成功')
        }).catch(err => {
            expect('单条图片写入成功').toBe(err)
        })
    })

    // 写入多条
    it('多条写入', () => {
        insertImg([imgData, imgData, imgData]).then(result => {
            expect('多条图片写入成功').toBe('多条图片写入成功')
        }).catch(err => {
            expect('多条图片写入成功').toBe(err)
        })
    })
    
})

describe('setter', () => {
    // 书本表
    const bookTable = spotTable('book', {
        setAttr: {
            cover: (data, key, value) => {
                // 如果是一个图片id则不需要处理
                if (typeof value === 'number') { return value }
                
                // 先添加到图片表再把数据返回
                return insertImg({
                    path: value,
                    from: 2,
                    create_date: '2022-03-21 00:00:00'
                }).then(result => result.insertId)
            }
        }
    })
    const insertBook = C(bookTable)

    const data = {
        title: '房思琪的初恋乐园',
        cover: 'view/subject/s/public/s29651121.jpg',
        des: '令人心碎却无能为力的真实故事。',
        author: '林奕含',
        create_date: '2022-03-21 00:00:00'
    }

    it('单条书本写入', () => {
        insertBook(data).then(result => {
            expect('单条书本写入成功').toBe('单条书本写入成功')
        }).catch(err => {
            expect('单条书本写入成功').toBe(err)
        })
    })
})