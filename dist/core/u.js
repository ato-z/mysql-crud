"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildU = exports.UPDATE = void 0;
const checkType_1 = require("../tool/checkType");
const r_1 = require("./r");
const sql_execute_1 = __importDefault(require("./sql-execute"));
/**
 * UPDATE 更新语句
 * @param tableName
 * @returns
 */
const withUpdateFrom = (tableName) => {
    return `UPDATE ${tableName}`;
};
/**
 * UPDATE 所更新的字段
 */
const withUpdateSet = (updata) => {
    const keys = Object.keys(updata);
    return keys.map(key => {
        let val = Reflect.get(updata, key);
        if ((0, checkType_1.isString)(val)) {
            val = `'${val}'`;
        }
        return `\`${key}\`=${val}`;
        //`\`${key}\` = ${updata[key]`x
    }).join(',');
};
const UPDATE = (tableName, updata, quest) => {
    const updateFrom = withUpdateFrom(tableName);
    const updateSet = withUpdateSet(updata);
    const updateSQL = `${updateFrom} SET ${updateSet}`;
    const sqlContainer = [updateSQL];
    const whereSql = (0, r_1.withWhere)(quest === null || quest === void 0 ? void 0 : quest.and, quest === null || quest === void 0 ? void 0 : quest.or, quest === null || quest === void 0 ? void 0 : quest.join);
    if (whereSql !== undefined) {
        sqlContainer.push(whereSql);
    }
    if ((quest === null || quest === void 0 ? void 0 : quest.order) !== undefined) {
        const groupSql = (0, r_1.withOrderBy)(quest === null || quest === void 0 ? void 0 : quest.order[0], quest === null || quest === void 0 ? void 0 : quest.order[1]);
        sqlContainer.push(groupSql);
    }
    if ((quest === null || quest === void 0 ? void 0 : quest.limit) !== undefined) {
        const limitSql = (0, r_1.withLimit2)(quest === null || quest === void 0 ? void 0 : quest.limit);
        if (limitSql !== undefined) {
            sqlContainer.push(limitSql);
        }
    }
    return sqlContainer.join(' ');
};
exports.UPDATE = UPDATE;
const buildU = (pool) => {
    const U = (spotTable) => {
        const { tableName } = spotTable;
        const update = (updata, query) => {
            const sql = (0, exports.UPDATE)(tableName, updata, query);
            return (0, sql_execute_1.default)(pool, sql);
        };
        return update;
    };
    return U;
};
exports.buildU = buildU;
