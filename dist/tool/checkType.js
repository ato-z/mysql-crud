export const isString = (target) => {
    return typeof target === 'string';
};
export const isNumber = (target) => {
    return typeof target === 'number' && isNaN(target) === false;
};
export const isArr = (target) => {
    return Array.isArray(target);
};
export const isNull = (target) => {
    return target === null;
};
export const isUndefined = (target) => {
    return target === undefined;
};
export const isObj = (target) => {
    return Object.prototype.toString.call(target) === '[object Object]';
};
