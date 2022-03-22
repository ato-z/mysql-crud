import { OP } from "../src/tool/opEnum"
import { parseOp } from "../src/tool/whereToString"


describe('parseOp函数', () => {

    // 等于
    it('OP.EQ', () => {
        // 不支持类型的比较
        try {
            parseOp(OP.GT, '1').join(' ')
            expect(null).toBe(new Error('不合法的操作符'))
        } catch(err) {
            expect(err instanceof Error).toBe(true)
        }

        // null的情况
        const result1 = 'IS NULL'
        expect(parseOp(OP.EQ, null).join(' ')).toBe(result1)

        // 数字
        const result2 = '= 1'
        expect(parseOp(OP.EQ, 1).join(' ')).toBe(result2)

        // 字符串
        const result3 = '= \'1\''
        expect(parseOp(OP.EQ, '1').join(' ')).toBe(result3)
    })

    // 不等于
    it('OP.NEQ', () => {
        // null 的情况
        const result1 = 'IS NOT NULL'
        expect(parseOp(OP.NEQ, null).join(' ')).toBe(result1)

        // 数字的比较
        const result2 = '<> 1'
        expect(parseOp(OP.NEQ, 1).join(' ')).toBe(result2)

        // 字符串比较
        const result3 = '<> \'1\''
        expect(parseOp(OP.NEQ, '1').join(' ')).toBe(result3)
    })

    // 大于
    it('OP.GT', () => {
        // 字符串1不能作为比较
        try {
            parseOp(OP.GT, '1').join(' ')
            expect(null).toBe(new Error('除数字类型外，其他不允许进行比较'))
        } catch(err) {
            expect(err instanceof Error).toBe(true)
        }
        expect(parseOp(OP.GT, 1).join(' ')).toBe('> 1')
    })

    // 大于等于
    it('OP.EGT', () => {
        expect(parseOp(OP.EGT, 1).join(' ')).toBe('>= 1')
    })

    // 小于
    it('OP.LT', () => {
        expect(parseOp(OP.LT, 1).join(' ')).toBe('< 1')
    })

    // 小于等于
    it('OP.ELT', () => {
        expect(parseOp(OP.ELT, 1).join(' ')).toBe('<= 1')
    })

    // 模糊查询
    it('OP.LIKE', () => {
        expect(parseOp(OP.LIKE, 'name').join(' ')).toBe('LIKE \'name\'')
    })

    // 区间查询
    it('OP.BETWEEN', () => {
        // 区间数组长度不为2
        try {
            parseOp(OP.BETWEEN, [1, 2, 3])
            expect(null).toBe(new Error('OP.BETWEEN 查询数组长度不为2'))
        } catch(err) {
            expect(err instanceof Error).toBe(true)
        }

        //  字符串
        try {
            parseOp(OP.BETWEEN, '1 AND 10')
            expect(null).toBe(new Error('OP.BETWEEN 查询接受到了字符串'))
        } catch (err) {
            expect(err instanceof Error).toBe(true)
        }

        // 区间数组子项不为number
        try {
            parseOp(OP.BETWEEN, ['1', '2'])
            expect(null).toBe( new Error('OP.BETWEEN 查询数组的子项必须为数字'))
        } catch(err) {
            expect(err instanceof Error).toBe(true)
        }

        expect(parseOp(OP.BETWEEN, [1, 10]).join(' ')).toBe('BETWEEN 1 AND 10')
        expect(parseOp(OP.BETWEEN, [10, 1]).join(' ')).toBe('BETWEEN 1 AND 10')
    })

    // 不在区间查询
    it('OP.NOT_BETWEEN', () => {
        expect(parseOp(OP.NOT_BETWEEN, [1, 10]).join(' ')).toBe('NOT BETWEEN 1 AND 10')
        expect(parseOp(OP.NOT_BETWEEN, [10, 1]).join(' ')).toBe('NOT BETWEEN 1 AND 10')
    })

    // in查询
    it('OP.IN', () => {
        try {
            parseOp(OP.IN, '1,3,5,7')
            expect(null).toBe( new Error('OP.IN 查询不支持字符串'))
        } catch (err) {
            expect(err instanceof Error).toBe(true)
        }
        expect(parseOp(OP.IN, [1,3,5,7]).join(' ')).toBe('IN (1,3,5,7)')
    })

    // not in查询
    it('OP.NOT_IN', () => {
        expect(parseOp(OP.NOT_IN, [1,3,5,7]).join(' ')).toBe('NOT IN (1,3,5,7)')
    })
})