"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObj = exports.isUndefined = exports.isNull = exports.isArr = exports.isNumber = exports.isString = void 0;
const isString = (target) => {
    return typeof target === 'string';
};
exports.isString = isString;
const isNumber = (target) => {
    return typeof target === 'number' && isNaN(target) === false;
};
exports.isNumber = isNumber;
const isArr = (target) => {
    return Array.isArray(target);
};
exports.isArr = isArr;
const isNull = (target) => {
    return target === null;
};
exports.isNull = isNull;
const isUndefined = (target) => {
    return target === undefined;
};
exports.isUndefined = isUndefined;
const isObj = (target) => {
    return Object.prototype.toString.call(target) === '[object Object]';
};
exports.isObj = isObj;
