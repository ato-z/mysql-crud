"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OP = exports.UPDATE = exports.SELECT = exports._DELETE = exports.INSERT = exports.initDb = void 0;
const index_1 = require("./core/index");
Object.defineProperty(exports, "initDb", { enumerable: true, get: function () { return index_1.initDb; } });
const c_1 = require("./core/c");
Object.defineProperty(exports, "INSERT", { enumerable: true, get: function () { return c_1.INSERT; } });
const d_1 = require("./core/d");
Object.defineProperty(exports, "_DELETE", { enumerable: true, get: function () { return d_1._DELETE; } });
const r_1 = require("./core/r");
Object.defineProperty(exports, "SELECT", { enumerable: true, get: function () { return r_1.SELECT; } });
const u_1 = require("./core/u");
Object.defineProperty(exports, "UPDATE", { enumerable: true, get: function () { return u_1.UPDATE; } });
const opEnum_1 = require("./tool/opEnum");
Object.defineProperty(exports, "OP", { enumerable: true, get: function () { return opEnum_1.OP; } });
