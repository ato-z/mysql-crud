import { isArr } from '../tool/checkType';
export default (pool, sql) => {
    let resolve, reject;
    let promise = new Promise((a, b) => {
        resolve = a;
        reject = b;
    });
    pool.execute(sql, (err, result) => {
        if (err) {
            return reject(err);
        }
        if (isArr(result) && result.length === 0) {
            return resolve(null);
        }
        resolve(result);
    });
    return promise;
};
