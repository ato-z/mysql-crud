/**
 * 对 data 数据进行处理，通过遍历 attrFuncs 传入的句柄方法； 
 * @param {object} attrFuncs 
 * @param {object} data 
 * @returns 经过处理后的data数据
 */
const tryGet = (attrFuncs, data) => {
    if (!data) { return Promise.resolve(null) }
    const codeData = Object.assign({}, data)
    const handles = Object.entries(attrFuncs || {})
    if (handles.length === 0) { return Promise.resolve(codeData) }
    const promises = []
    handles.forEach(handle => {
        const [key, cb] = handle
        const val = data[handle[0]]
        let result = cb(val, data)
        if (result instanceof Promise === false) {
            result = Promise.resolve(result)
        }
        result.then(newVal => {
            codeData[key] = newVal
        })
        promises.push(result)
    })
    return Promise.all(promises).then(() => codeData)
}
module.exports.get = tryGet

/**
 * 对数据进行筛选，如果存在与attr下标的数据会被移除
 * @param {array<string>} attr 
 * @param {object}        data 
 * @returns 
 */
const tryHidden = (attr = [], data) => {
    if (data === null) { return data }
    if (Array.isArray(attr) === false) { return data }
    const codeData = {}
    const entries = Object.entries(data)
    entries.forEach(item => {
        if (attr.indexOf(item[0]) === -1) {
            codeData[item[0]] = item[1]
        }
    })
    return codeData
}
module.exports.hidden = tryHidden

/**
 * 设置器，attrFuncs() 处理fields[]所存在的字段
 * @param {array}  fields    插入的字段列表 
 * @param {object} attrFuncs 对fields存在的元素进行映射的一个个句柄函数
 * @param {object} data      插入的数据
 * @returns 处理后的新data对象
 */
const trySet = (fields = [], attrFuncs = null, data = {}) => {
    if (attrFuncs === null) {
        const newData = {}
        const keys = Object.keys(data)
        keys.forEach(key => {
            let val = data[key]
            delete data
            if (typeof val !== 'number') {
                console.log()
                val = "'" + (val.toString().replace(/\'/g, "\\'")) + "'"
            }
            newData[key] = val
            delete newData
        })
        return Promise.resolve(newData)
    }
    const promises = [Promise.resolve(null)]
    for (let i = 0, len = fields.length; i < len; i++) {
        const key = fields[i]
        if (attrFuncs[key]) {
            const val = attrFuncs[key](data[key], data)
            const promise = val instanceof Promise ? val : Promise.resolve(val)
            promise.then(val => {
                data[key] = val
                delete key
            })
            promises.push(promise)
        }
    }
    return Promise.all(promises).then(() => {
        const newData = trySet(fields, null, data)
        delete data
        delete fields
        return newData
    })
}
module.exports.set = trySet
