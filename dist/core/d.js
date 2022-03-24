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
const _DELETE = (tableName, quest) => {
    const deleteFrom = withDeleteFrom(tableName);
    const sqlContainer = [deleteFrom];
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
exports._DELETE = _DELETE;
const biuldD = (pool) => {
    const D = (spotTable) => {
        const { tableName } = spotTable;
        const _delete = (quest) => {
            const sql = (0, exports._DELETE)(tableName, quest);
            return (0, sql_execute_1.default)(pool, sql);
        };
        return _delete;
    };
    return D;
};
exports.biuldD = biuldD;
