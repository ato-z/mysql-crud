import { OP } from "../src/tool/opEnum"
import { parseWhereToString } from "../src/tool/whereToString"

describe('parseWhereToString', () => {

    it('简单查询', () => {
        const quest = {id: 1, delete_date: null}
        const quest2 = {
            id: [OP.EQ, 1],
            delete_date: [OP.EQ, null]
        }

        const result = '`id` = 1 AND `delete_date` IS NULL'
        expect(parseWhereToString(quest)).toBe(result)

        const result2 = '`id` = 1 AND `delete_date` IS NULL'
        expect(parseWhereToString(quest2)).toBe(result2)

        const result3 = '`id` = 1 OR `delete_date` IS NULL'
        expect(parseWhereToString(quest, 'OR')).toBe(result3)
    })
    
    it('组合查询', () => {
        const quest1 = { id: [OP.GT, 1] }        
        const result1 = '`id` > 1'
        expect(parseWhereToString(quest1)).toBe(result1)

        // 查询id为 1 3 5 7 9
        const quest2 = {
            id: [ OP.IN, [1, 3, 5, 7, 9] ],
            delete_date: null
        }
        const result2 = '`id` IN (1,3,5,7,9) AND `delete_date` IS NULL'
        expect(parseWhereToString(quest2)).toBe(result2)

        
    })

    // 异常判断
    it('异常边界', () => {
        // 空值
        try {
            const quest3 = { id: [OP.EQ, undefined] }
            expect(null).toBe(new Error('空值异常'))
        } catch(err) {
            expect(err instanceof Error).toBe(true)
        }

        // 不支持的操作符
        try {
            const quest3 = { id: ['等于', 1] }
            expect(null).toBe(new Error('不支持的操作符异常'))
        } catch(err) {
            expect(err instanceof Error).toBe(true)
        }

        // 使用eq来查询数组
        try {
            const quest3 = { id: [OP.EQ, [1, 2, 3]] }
            expect(null).toBe(new Error('使用eq来查询数组异常'))
        } catch(err) {
            expect(err instanceof Error).toBe(true)
        }
    })
})
