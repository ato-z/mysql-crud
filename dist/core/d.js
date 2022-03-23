"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.biuldD = exports._DELETE = void 0;
const r_1 = require("./r");
const sql_execute_1 = __importDefault(require("./sql-execute"));
/**
 * DELETE 删除语句
 * @param tableName
 * @returns
 */
const withDeleteFrom = (tableName) => {
    return `DELETE FROM \`${tableName}\``;
};
const _DELETE = (tableName, where, groupBy, limit) => {
    const deleteFrom = withDeleteFrom(tableName);
    const sqlContainer = [deleteFrom];
    const whereSql = (0, r_1.withWhere)(where === null || where === void 0 ? void 0 : where.and, where === null || where === void 0 ? void 0 : where.or, where === null || where === void 0 ? void 0 : where.join);
    if (whereSql !== undefined) {
        sqlContainer.push(whereSql);
    }
    if (groupBy !== undefined) {
        const groupSql = (0, r_1.withOrderBy)(groupBy[0], groupBy[1]);
        sqlContainer.push(groupSql);
    }
    const limitSql = (0, r_1.withLimit2)(limit);
    if (limitSql !== undefined) {
        sqlContainer.push(limitSql);
    }
    return sqlContainer.join(' ');
};
exports._DELETE = _DELETE;
const biuldD = (pool) => {
    const D = (spotTable) => {
        const { tableName } = spotTable;
        const _delete = (where, order, limit) => {
            const sql = (0, exports._DELETE)(tableName, where, order, limit);
            return (0, sql_execute_1.default)(pool, sql);
        };
        return _delete;
    };
    return D;
};
exports.biuldD = biuldD;
