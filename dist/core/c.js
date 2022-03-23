"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildC = exports.INSERT = exports.codeList = exports.withInsertSql = exports.withInsertData = exports.withInsertFrom = exports.filterDatas = exports.seekDataKey = void 0;
const checkType_1 = require("../tool/checkType");
const sql_execute_1 = __importDefault(require("../core/sql-execute"));
const r_1 = require("./r");
/**
 * 根据传入的key数组来校验data数据是否合法
 * @param keys
 * @param data
 */
const seekDataKey = (keys, data) => {
    const thatKeys = Object.keys(data);
    const errMsg = `要求key为[${keys}]\n接受到${JSON.stringify(data)}`;
    const dataMap = new Map();
    thatKeys.forEach(key => {
        dataMap.set(key, true);
    });
    if (thatKeys.length !== keys.length) {
        throw new Error('数据长度不一致\n' + errMsg);
    }
    keys.forEach((key) => {
        if (dataMap.has(key) === false) {
            throw new Error(`缺少键 ${key}\n` + errMsg);
        }
    });
};
exports.seekDataKey = seekDataKey;
/**
 * 传入的数据统一数组的方式返回，数组内的子项必须是一个对象
 * @param data
 * @returns
 */
const filterDatas = (data) => {
    if ((0, checkType_1.isArr)(data) === false) {
        data = [data];
    }
    data.forEach(element => {
        if ((0, checkType_1.isObj)(element) === false) {
            throw new Error(`新增数据必须为一个js对象，不能为 ${typeof element}`);
        }
    });
    return data;
};
exports.filterDatas = filterDatas;
/**
 * sql新增语句 INSERT INTO \`${tableName}\` (${fields})
 * @param fields
 * @param tableName
 * @returns
 */
const withInsertFrom = (fields, tableName) => {
    const fieldsLeft = fields.map(field => `\`${field}\``);
    const sqlFront = `INSERT INTO \`${tableName}\` (${fieldsLeft})`;
    return sqlFront;
};
exports.withInsertFrom = withInsertFrom;
/**
 * sql新增语句 VALUES (value1, value2, value3)
 * @param fields
 * @param list
 * @returns
 */
const withInsertData = (fields, list) => {
    var vals = [];
    list.forEach(item => {
        const itemVal = [];
        fields.forEach(key => {
            let val = Reflect.get(item, key);
            if ((0, checkType_1.isString)(val)) {
                val = `'${val}'`;
            }
            itemVal.push(val);
        });
        vals.push(`(${itemVal.join(',')})`);
    });
    return vals.join(',');
};
exports.withInsertData = withInsertData;
/**
 * 组合新增的sql语句
 * @param fields
 * @param tableName
 * @param list
 * @returns
 */
const withInsertSql = (fields, tableName, list) => {
    const insertFrom = (0, exports.withInsertFrom)(fields, tableName);
    const insertVals = (0, exports.withInsertData)(fields, list);
    return `${insertFrom} VALUES ${insertVals}`;
};
exports.withInsertSql = withInsertSql;
/**
 * 调用setAttr设置到lists的每一个子项
 * @param lists
 * @param setAttr
 * @returns
 */
const codeList = (lists, setAttr) => {
    let currentPromise = Promise.resolve();
    let codeResult = [];
    lists.forEach(data => {
        currentPromise = currentPromise.then(() => {
            return (0, r_1.retryAttrJob)(data, setAttr).then(newData => {
                codeResult.push(newData);
            });
        });
    });
    return currentPromise.then(() => codeResult);
};
exports.codeList = codeList;
/**
 * 组合insert语句
 * @param tableName
 * @param datas
 * @returns
 */
const INSERT = (tableName, datas) => {
    const insertList = (0, exports.filterDatas)(datas);
    const insertFields = Object.keys(insertList[0]);
    insertList.forEach(element => (0, exports.seekDataKey)(insertFields, element));
    const insertSql = (0, exports.withInsertSql)(insertFields, tableName, insertList);
    return insertSql;
};
exports.INSERT = INSERT;
/**
 * 打包新增查询的sql语句
 * @param pool
 * @returns
 */
const buildC = (pool) => {
    const C = (spotTable) => {
        const { tableName, setAttr } = spotTable;
        const insert = (datas) => {
            let promise;
            if (setAttr) {
                const insertList = (0, exports.filterDatas)(datas);
                promise = (0, exports.codeList)(insertList, setAttr)
                    .then(codeList => (0, exports.INSERT)(tableName, codeList));
            }
            else {
                promise = Promise.resolve((0, exports.INSERT)(tableName, datas));
            }
            return promise.then(insertSql => (0, sql_execute_1.default)(pool, insertSql));
        };
        return insert;
    };
    return C;
};
exports.buildC = buildC;
