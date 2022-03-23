"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkType_1 = require("../tool/checkType");
exports.default = (pool, sql) => {
    let resolve, reject;
    let promise = new Promise((a, b) => {
        resolve = a;
        reject = b;
    });
    pool.execute(sql, (err, result) => {
        if (err) {
            return reject(err);
        }
        if ((0, checkType_1.isArr)(result) && result.length === 0) {
            return resolve(null);
        }
        resolve(result);
    });
    return promise;
};
