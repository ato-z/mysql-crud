export const isString = (target: any): boolean => {
    return typeof target === 'string'
}

export const isNumber = (target: any): boolean => {
    return typeof target === 'number' && isNaN(target) === false
}

export const isArr = (target: any): boolean => {
    return Array.isArray(target)
}

export const isNull = (target: any): boolean => {
    return target === null
}

export const isUndefined = (target: any): boolean => {
    return target === undefined
}

export const isObj = (target: any): boolean => {
    return Object.prototype.toString.call(target) === '[object Object]'
}