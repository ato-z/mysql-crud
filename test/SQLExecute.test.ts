import {encodingExists} from 'iconv-lite'
import SQLExecute from '../src/core/sql-execute'
import {pool} from '../database'
encodingExists('foo')
describe('sql-execute.ts', () => {

    it('SQLExecute', () => {
        SQLExecute(pool, 'SELECT * FROM az_book').then(result => {
            expect(result instanceof Array || result === null).toBe(true)
        }).catch(err => {
            expect('[object] || null').toBe(err)
        })

        SQLExecute(pool, 'SELECT * FROM az_book WHERE `id` = 7777777').then(result => {
            expect(result === null).toBe(true)
        }).catch(err => {
            expect('null').toBe(err)
        })
    })
})