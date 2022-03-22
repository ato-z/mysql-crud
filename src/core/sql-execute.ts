import mysql2 from 'mysql2'
import { isArr } from '../tool/checkType'

export default <T>(pool: mysql2.Pool, sql: string): Promise<T> => {
    let resolve: (res: any) => void, reject: (err?: any) => void
    let promise: Promise<T> = new Promise((a, b) => {
        resolve = a
        reject = b
    })
    pool.execute(sql, (err, result) => {
        if (err) { return reject(err) }
        if (isArr(result) && (result as []).length === 0) { return resolve(null)}
        resolve(result)
    })
    return promise
}