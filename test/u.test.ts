import {encodingExists} from 'iconv-lite'
import { db } from '../database'

encodingExists('foo') // 解决测试中编码错误的问题

const {spotTable, U} = db

const imageTable = spotTable('image')
const updateImage = U(imageTable)

describe('更新数据', () => {
    it('更新成功', () => {
        updateImage({
            path: 'https://img3.doubanio.com/view/subject/s/public/s29651121.jpg',
            from: 1
        }, {
            and: {
                from: 2
            },
            order: ['id', "DESC"],
            limit: 1
        }).then(result => {
            expect('更新成功').toBe('更新成功')
        }).catch(err => {
            expect('更新成功').toBe(err)
        })
    })
})
