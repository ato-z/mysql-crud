import {encodingExists} from 'iconv-lite'
import { db } from '../database'
encodingExists('foo') // 解决测试中编码错误的问题

const {spotTable, D} = db

const deleteImg = D(spotTable('image'))
describe('删除数据', () => {
    it('删除单条', () => {
        // 删除最后一条
        deleteImg({
            and: { delete_date: null }
        }, ['id', 'DESC'], 1).then(result => {
            expect('删除成功').toBe('删除成功')
        }).catch(err => {
            expect('删除成功').toBe('删除失败')
        })
    })
    
})

